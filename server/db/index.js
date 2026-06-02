import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { importJsonStoresIfEmpty } from "./migrateFromJson.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let pool = null;
let ready = false;

function getConnectionString() {
  return process.env.DATABASE_URL || "";
}

export function isDatabaseConfigured() {
  return Boolean(getConnectionString());
}

export function getPool() {
  const connectionString = getConnectionString();
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Create a free Neon database and add the connection string.");
  }
  if (!pool) {
    pool = new pg.Pool({
      connectionString,
      ssl: connectionString.includes("neon.tech") ? { rejectUnauthorized: false } : undefined,
      max: 10,
    });
  }
  return pool;
}

function mapUserRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  };
}

function mapSessionRow(row) {
  const payload = typeof row.payload === "object" ? row.payload : {};
  return {
    ...payload,
    id: row.id,
    date: payload.date ?? (row.recorded_at ? new Date(row.recorded_at).toISOString() : ""),
    title: row.title ?? payload.title ?? "",
    notes: row.notes ?? payload.notes ?? "",
  };
}

export async function initDb() {
  if (ready) return;
  const db = getPool();
  const schemaPath = path.join(__dirname, "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf8");
  await db.query(schema);
  await importJsonStoresIfEmpty(db);
  ready = true;
}

export async function checkDbConnection() {
  try {
    const db = getPool();
    await db.query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}

export async function findUserById(id) {
  const { rows } = await getPool().query("SELECT * FROM users WHERE id = $1 LIMIT 1", [id]);
  return mapUserRow(rows[0]);
}

export async function findUserByEmail(email) {
  const normalized = String(email).trim().toLowerCase();
  const { rows } = await getPool().query("SELECT * FROM users WHERE email = $1 LIMIT 1", [normalized]);
  return mapUserRow(rows[0]);
}

export async function insertUser(user) {
  await getPool().query(
    `INSERT INTO users (id, email, name, password_hash, created_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [user.id, user.email, user.name, user.passwordHash, user.createdAt ?? new Date().toISOString()]
  );
  return user;
}

export async function updateUserProfile(id, { name, email }) {
  const fields = [];
  const values = [];
  let index = 1;

  if (name !== undefined) {
    fields.push(`name = $${index++}`);
    values.push(String(name).trim());
  }
  if (email !== undefined) {
    fields.push(`email = $${index++}`);
    values.push(String(email).trim().toLowerCase());
  }

  if (!fields.length) {
    return findUserById(id);
  }

  values.push(id);
  const { rows } = await getPool().query(
    `UPDATE users SET ${fields.join(", ")} WHERE id = $${index} RETURNING *`,
    values
  );
  return mapUserRow(rows[0]);
}

export async function updateUserPassword(id, passwordHash) {
  await getPool().query("UPDATE users SET password_hash = $1 WHERE id = $2", [passwordHash, id]);
}

export async function listMonitoringSessions(userId) {
  const { rows } = await getPool().query(
    `SELECT * FROM monitoring_sessions
     WHERE user_id = $1
     ORDER BY recorded_at DESC NULLS LAST, id DESC`,
    [userId]
  );
  return rows.map(mapSessionRow);
}

export async function syncMonitoringSessions(userId, sessions) {
  const db = getPool();
  const existing = await listMonitoringSessions(userId);
  const byId = new Map(existing.map((entry) => [entry.id, entry]));

  sessions.forEach((entry) => {
    if (entry?.id) {
      byId.set(entry.id, { ...byId.get(entry.id), ...entry });
    }
  });

  const merged = Array.from(byId.values()).sort(
    (a, b) => new Date(b.date || 0) - new Date(a.date || 0)
  );

  for (const session of merged) {
    const { id, title, notes, date, ...rest } = session;
    await db.query(
      `INSERT INTO monitoring_sessions (id, user_id, payload, title, notes, recorded_at)
       VALUES ($1, $2, $3::jsonb, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET
         payload = EXCLUDED.payload,
         title = EXCLUDED.title,
         notes = EXCLUDED.notes,
         recorded_at = EXCLUDED.recorded_at`,
      [
        id,
        userId,
        JSON.stringify({ ...rest, date }),
        title ?? null,
        notes ?? null,
        date ? new Date(date) : null,
      ]
    );
  }

  const incomingIds = new Set(merged.map((s) => s.id));
  const removed = existing.filter((s) => !incomingIds.has(s.id));
  for (const session of removed) {
    await db.query("DELETE FROM monitoring_sessions WHERE id = $1 AND user_id = $2", [
      session.id,
      userId,
    ]);
  }

  return merged;
}

export async function deleteMonitoringSession(userId, sessionId) {
  await getPool().query("DELETE FROM monitoring_sessions WHERE id = $1 AND user_id = $2", [
    sessionId,
    userId,
  ]);
}

export async function patchMonitoringSession(userId, sessionId, patch) {
  const title = patch.title !== undefined ? String(patch.title) : undefined;
  const notes = patch.notes !== undefined ? String(patch.notes) : undefined;

  const sets = [];
  const values = [];
  let index = 1;

  if (title !== undefined) {
    sets.push(`title = $${index++}`);
    values.push(title);
  }
  if (notes !== undefined) {
    sets.push(`notes = $${index++}`);
    values.push(notes);
  }

  if (sets.length) {
    values.push(sessionId, userId);
    await getPool().query(
      `UPDATE monitoring_sessions SET ${sets.join(", ")} WHERE id = $${index} AND user_id = $${index + 1}`,
      values
    );
  }

  return listMonitoringSessions(userId);
}
