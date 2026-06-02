/** JWT session only — not user accounts (those live on the server). */
const SESSION_KEY = "aurasense_session";

export function readAuthSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (Date.now() > session.expiresAt) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function writeAuthSession(session) {
  if (session) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    sessionStorage.removeItem(SESSION_KEY);
  }
}

export function clearLegacyAuthStorage() {
  try {
    localStorage.removeItem("aurasense_session");
    localStorage.removeItem("aurasense_users");
  } catch {
    /* ignore */
  }
}
