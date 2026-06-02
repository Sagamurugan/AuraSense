# Neon Postgres setup (free, $0/month)

AuraSense stores **users** and **monitoring sessions** in Neon Postgres. The API will not start without `DATABASE_URL`.

## Steps

1. Go to [https://neon.tech](https://neon.tech) and sign up (no credit card).
2. Create a project (e.g. `aurasense`).
3. Open **Dashboard → Connection details** and copy the **connection string** (PostgreSQL).
   - Use the pooled connection string if offered (`-pooler` host).
   - Ensure it includes `?sslmode=require`.
4. Add to **local** `.env`:
   ```
   DATABASE_URL=postgresql://...
   ```
5. Add the same `DATABASE_URL` to **Render** → your web service → **Environment**.
6. Redeploy Render after saving env vars.

On first API start, tables are created automatically. If `server/users.json` or `server/sessions-store.json` exist and the database is empty, they are imported once.

## Verify

```bash
npm run server
```

Visit `http://localhost:8787/api/health` — expect `"databaseConnected": true`.

Remove old Render env vars if still present: `GEMINI_API_KEY`, `GEMINI_MODEL`.
