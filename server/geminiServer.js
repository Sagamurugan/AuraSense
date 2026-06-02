/* global process */

import crypto from "node:crypto";
import { Buffer } from "node:buffer";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { URL } from "node:url";

function loadEnvFile() {
  const envPath = path.resolve(process.cwd(), ".env");

  if (!fs.existsSync(envPath)) {
    return false;
  }

  const envContent = fs.readFileSync(envPath, "utf8");

  envContent.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      return;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();

    if (key && process.env[key] == null) {
      process.env[key] = value;
    }
  });

  return true;
}

const envLoaded = loadEnvFile();
const PORT = Number(process.env.PORT || process.env.GEMINI_PORT || 8787);
const AUTH_SECRET = process.env.JWT_SECRET || "aurasense-local-dev-secret";
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;
const USER_STORE_PATH = path.resolve(process.cwd(), "server", "users.json");
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || process.env.CORS_ORIGIN || "*";
const REGISTRATION_ENABLED = process.env.REGISTRATION_ENABLED !== "false";
const DEMO_AUTH_ENABLED = process.env.DEMO_AUTH_ENABLED === "true";
const DEMO_USER = {
  id: "demo-user",
  name: process.env.DEMO_USER_NAME || "AuraSense Demo",
  email: String(process.env.DEMO_USER_EMAIL || "demo@aurasense.app").toLowerCase(),
  password: process.env.DEMO_USER_PASSWORD || "Demo@123",
  createdAt: new Date().toISOString(),
};
const DIST_DIR = path.resolve(process.cwd(), "dist");
const INDEX_FILE = path.join(DIST_DIR, "index.html");
const STATIC_MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};
const requestBuckets = new Map();

function setCorsHeaders(response) {
  response.setHeader("Access-Control-Allow-Origin", FRONTEND_ORIGIN);
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "DENY");
  response.setHeader("Referrer-Policy", "no-referrer");
}

function sendJson(response, statusCode, payload) {
  setCorsHeaders(response);
  response.writeHead(statusCode, { "Content-Type": "application/json" });
  response.end(JSON.stringify(payload));
}

function sendHtml(response, statusCode, markup) {
  setCorsHeaders(response);
  response.writeHead(statusCode, { "Content-Type": "text/html; charset=utf-8" });
  response.end(markup);
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error("Request body too large"));
      }
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

function getClientIp(request) {
  const forwarded = request.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return request.socket.remoteAddress || "local";
}

function consumeRateLimit(request, key, limit, windowMs) {
  const clientKey = `${getClientIp(request)}:${key}`;
  const now = Date.now();
  const bucket = requestBuckets.get(clientKey);

  if (!bucket || bucket.resetAt <= now) {
    requestBuckets.set(clientKey, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (bucket.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { allowed: true };
}

function shouldServeBuiltApp() {
  return fs.existsSync(INDEX_FILE);
}

function serveFile(response, filePath) {
  const extension = path.extname(filePath).toLowerCase();
  const mimeType = STATIC_MIME_TYPES[extension] || "application/octet-stream";
  const fileBuffer = fs.readFileSync(filePath);
  response.writeHead(200, { "Content-Type": mimeType });
  response.end(fileBuffer);
}

function tryServeBuiltAsset(requestUrl, response) {
  if (!shouldServeBuiltApp()) {
    return false;
  }

  const cleanPath = decodeURIComponent(requestUrl.pathname);
  if (cleanPath === "/") {
    serveFile(response, INDEX_FILE);
    return true;
  }

  const candidatePath = path.normalize(path.join(DIST_DIR, cleanPath));
  if (!candidatePath.startsWith(DIST_DIR)) {
    return false;
  }

  if (fs.existsSync(candidatePath) && fs.statSync(candidatePath).isFile()) {
    serveFile(response, candidatePath);
    return true;
  }

  if (!path.extname(cleanPath)) {
    serveFile(response, INDEX_FILE);
    return true;
  }

  return false;
}

function ensureUserStore() {
  const dir = path.dirname(USER_STORE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(USER_STORE_PATH)) {
    fs.writeFileSync(USER_STORE_PATH, JSON.stringify({ users: [] }, null, 2));
  }
}

function readUsers() {
  ensureUserStore();
  try {
    const raw = fs.readFileSync(USER_STORE_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.users) ? parsed.users : [];
  } catch {
    return [];
  }
}

function writeUsers(users) {
  ensureUserStore();
  fs.writeFileSync(USER_STORE_PATH, JSON.stringify({ users }, null, 2));
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const digest = crypto.pbkdf2Sync(password, salt, 120000, 64, "sha512").toString("hex");
  return `${salt}:${digest}`;
}

function verifyPassword(password, storedHash) {
  const [salt, digest] = String(storedHash || "").split(":");
  if (!salt || !digest) {
    return false;
  }
  const candidate = crypto.pbkdf2Sync(password, salt, 120000, 64, "sha512").toString("hex");
  return crypto.timingSafeEqual(Buffer.from(digest, "hex"), Buffer.from(candidate, "hex"));
}

function base64UrlEncode(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(input) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return Buffer.from(normalized + padding, "base64").toString("utf8");
}

function signToken(payload) {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + TOKEN_TTL_SECONDS,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const signature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function verifyToken(token) {
  const [encodedHeader, encodedPayload, signature] = String(token || "").split(".");
  if (!encodedHeader || !encodedPayload || !signature) {
    throw new Error("Invalid token");
  }

  const expectedSignature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  if (expectedSignature !== signature) {
    throw new Error("Invalid token");
  }

  const payload = JSON.parse(base64UrlDecode(encodedPayload));
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("Token expired");
  }

  return payload;
}

function getBearerToken(request) {
  const authHeader = request.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.slice(7);
}

function getAuthenticatedUser(request) {
  const token = getBearerToken(request);
  if (!token) {
    throw new Error("Missing token");
  }

  const payload = verifyToken(token);
  const users = readUsers();
  const user = users.find((entry) => entry.id === payload.sub);

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}

function getDemoUser() {
  return {
    id: DEMO_USER.id,
    name: DEMO_USER.name,
    email: DEMO_USER.email,
    createdAt: DEMO_USER.createdAt,
  };
}

function createAuthPayload(user) {
  const token = signToken({
    sub: user.id,
    email: user.email,
    name: user.name,
  });

  return {
    ok: true,
    token,
    user: sanitizeUser(user),
  };
}

const server = http.createServer(async (request, response) => {
  setCorsHeaders(response);

  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  const requestUrl = new URL(request.url || "/", `http://${request.headers.host}`);

  if (request.method === "GET" && requestUrl.pathname === "/" && !shouldServeBuiltApp()) {
    sendHtml(
      response,
      200,
      `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>AuraSense Local Server</title>
    <style>
      body {
        margin: 0;
        font-family: Inter, Segoe UI, system-ui, sans-serif;
        background: linear-gradient(180deg, #07111f 0%, #020617 100%);
        color: #e2e8f0;
      }
      .wrap {
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 24px;
      }
      .card {
        width: min(720px, 100%);
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(15, 23, 42, 0.9);
        border-radius: 24px;
        padding: 28px;
        box-shadow: 0 30px 80px rgba(2, 6, 23, 0.45);
      }
      .pill {
        display: inline-block;
        border: 1px solid rgba(56,189,248,0.25);
        background: rgba(56,189,248,0.12);
        color: #e0f2fe;
        padding: 8px 12px;
        border-radius: 999px;
        font-size: 12px;
        letter-spacing: 0.18em;
        text-transform: uppercase;
      }
      h1 { margin: 16px 0 8px; font-size: 34px; }
      p, li { color: #94a3b8; line-height: 1.7; }
      code {
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.08);
        padding: 2px 8px;
        border-radius: 999px;
        color: #f8fafc;
      }
      a { color: #7dd3fc; text-decoration: none; }
      ul { padding-left: 20px; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="card">
        <span class="pill">AuraSense Local API</span>
        <h1>Server is running correctly.</h1>
        <p>
          This address is the local Node API server used for authentication.
          The main frontend app runs separately on <code>http://localhost:5173</code>.
        </p>
        <ul>
          <li>Frontend app: <a href="http://localhost:5173">http://localhost:5173</a></li>
          <li>Health check: <a href="/api/health">/api/health</a></li>
          <li>Login route: <code>/api/auth/login</code></li>
          <li>Register route: <code>/api/auth/register</code></li>
          <li>AI coaching is handled client-side via Groq.</li>
        </ul>
        <p>
          If you want the full dashboard, keep both servers running:
          <code>npm run server</code> and <code>npm run dev</code>.
        </p>
      </div>
    </div>
  </body>
</html>`
    );
    return;
  }

  if (request.method === "GET" && requestUrl.pathname === "/api/health") {
    sendJson(response, 200, {
      ok: true,
      envLoaded,
      authEnabled: true,
      registrationEnabled: REGISTRATION_ENABLED,
      demoAuthEnabled: DEMO_AUTH_ENABLED,
      demoUserEmail: DEMO_AUTH_ENABLED ? DEMO_USER.email : "",
    });
    return;
  }

  if (request.method === "POST" && requestUrl.pathname === "/api/auth/register") {
    try {
      if (!REGISTRATION_ENABLED) {
        sendJson(response, 403, {
          ok: false,
          error: "Registration is disabled in this deployment. Use the provided demo account.",
        });
        return;
      }

      const limitState = consumeRateLimit(request, "register", 10, 15 * 60 * 1000);
      if (!limitState.allowed) {
        sendJson(response, 429, {
          ok: false,
          error: `Too many registration attempts. Try again in ${limitState.retryAfterSeconds} seconds.`,
        });
        return;
      }

      const rawBody = await readBody(request);
      const { name, email, password } = JSON.parse(rawBody || "{}");

      if (!name || !email || !password) {
        sendJson(response, 400, { ok: false, error: "Name, email, and password are required." });
        return;
      }

      if (String(password).length < 6) {
        sendJson(response, 400, { ok: false, error: "Password must be at least 6 characters." });
        return;
      }

      const users = readUsers();
      const normalizedEmail = String(email).trim().toLowerCase();
      const existingUser = users.find((user) => user.email === normalizedEmail);

      if (existingUser) {
        sendJson(response, 409, { ok: false, error: "An account with this email already exists." });
        return;
      }

      const user = {
        id: crypto.randomUUID(),
        name: String(name).trim(),
        email: normalizedEmail,
        passwordHash: hashPassword(String(password)),
        createdAt: new Date().toISOString(),
      };

      users.push(user);
      writeUsers(users);
      sendJson(response, 201, createAuthPayload(user));
    } catch (error) {
      sendJson(response, 500, {
        ok: false,
        error: error instanceof Error ? error.message : "Registration failed.",
      });
    }
    return;
  }

  if (request.method === "POST" && requestUrl.pathname === "/api/auth/login") {
    try {
      const limitState = consumeRateLimit(request, "login", 20, 15 * 60 * 1000);
      if (!limitState.allowed) {
        sendJson(response, 429, {
          ok: false,
          error: `Too many login attempts. Try again in ${limitState.retryAfterSeconds} seconds.`,
        });
        return;
      }

      const rawBody = await readBody(request);
      const { email, password } = JSON.parse(rawBody || "{}");

      const normalizedEmail = String(email || "").trim().toLowerCase();
      if (
        DEMO_AUTH_ENABLED &&
        normalizedEmail === DEMO_USER.email &&
        String(password || "") === DEMO_USER.password
      ) {
        sendJson(response, 200, createAuthPayload(getDemoUser()));
        return;
      }

      const users = readUsers();
      const user = users.find((entry) => entry.email === normalizedEmail);

      if (!user || !verifyPassword(String(password || ""), user.passwordHash)) {
        sendJson(response, 401, { ok: false, error: "Invalid email or password." });
        return;
      }

      sendJson(response, 200, createAuthPayload(user));
    } catch (error) {
      sendJson(response, 500, {
        ok: false,
        error: error instanceof Error ? error.message : "Login failed.",
      });
    }
    return;
  }

  if (request.method === "GET" && requestUrl.pathname === "/api/auth/me") {
    try {
      const token = getBearerToken(request);
      const payload = verifyToken(token);
      const user =
        payload.sub === DEMO_USER.id && DEMO_AUTH_ENABLED ? getDemoUser() : getAuthenticatedUser(request);
      sendJson(response, 200, { ok: true, user: sanitizeUser(user) });
    } catch {
      sendJson(response, 401, { ok: false, error: "Unauthorized" });
    }
    return;
  }

  if (request.method === "GET" && tryServeBuiltAsset(requestUrl, response)) {
    return;
  }

  sendJson(response, 404, {
    ok: false,
    error: "Route not found.",
  });
});

server.listen(PORT, () => {
  const envNote = envLoaded ? ".env loaded" : ".env not found";
  const buildNote = shouldServeBuiltApp() ? "built frontend available" : "API-only mode";
  const authNote =
    AUTH_SECRET === "aurasense-local-dev-secret"
      ? "warning: default JWT secret in use"
      : "JWT secret configured";
  console.log(
    `AuraSense server listening on http://localhost:${PORT} (${envNote}, ${buildNote}, ${authNote})`
  );
});
