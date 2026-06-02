import fs from "node:fs";
import path from "node:path";

const USER_STORE_PATH = path.resolve(process.cwd(), "server", "users.json");
const SESSIONS_STORE_PATH = path.resolve(process.cwd(), "server", "sessions-store.json");

export async function importJsonStoresIfEmpty(pool) {
  const { rows } = await pool.query("SELECT COUNT(*)::int AS count FROM users");
  if (rows[0]?.count > 0) {
    return { importedUsers: 0, importedSessions: 0 };
  }

  let importedUsers = 0;
  let importedSessions = 0;

  if (fs.existsSync(USER_STORE_PATH)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(USER_STORE_PATH, "utf8"));
      const users = Array.isArray(parsed.users) ? parsed.users : [];
      for (const user of users) {
        if (!user?.id || !user?.email || !user?.passwordHash) continue;
        await pool.query(
          `INSERT INTO users (id, email, name, password_hash, created_at)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (email) DO NOTHING`,
          [
            user.id,
            String(user.email).toLowerCase(),
            user.name,
            user.passwordHash,
            user.createdAt ? new Date(user.createdAt) : new Date(),
          ]
        );
        importedUsers += 1;
      }
    } catch (error) {
      console.warn("JSON user import skipped:", error.message);
    }
  }

  if (fs.existsSync(SESSIONS_STORE_PATH)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(SESSIONS_STORE_PATH, "utf8"));
      const byUser = parsed.byUser && typeof parsed.byUser === "object" ? parsed.byUser : {};
      for (const [userId, sessions] of Object.entries(byUser)) {
        if (!Array.isArray(sessions)) continue;
        for (const session of sessions) {
          if (!session?.id) continue;
          const { id, title, notes, date, ...rest } = session;
          await pool.query(
            `INSERT INTO monitoring_sessions (id, user_id, payload, title, notes, recorded_at)
             VALUES ($1, $2, $3::jsonb, $4, $5, $6)
             ON CONFLICT (id) DO NOTHING`,
            [
              id,
              userId,
              JSON.stringify({ ...rest, date }),
              title ?? null,
              notes ?? null,
              date ? new Date(date) : null,
            ]
          );
          importedSessions += 1;
        }
      }
    } catch (error) {
      console.warn("JSON session import skipped:", error.message);
    }
  }

  if (importedUsers || importedSessions) {
    console.log(`Imported ${importedUsers} users and ${importedSessions} sessions from JSON files.`);
  }

  return { importedUsers, importedSessions };
}
