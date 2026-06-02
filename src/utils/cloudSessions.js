const API_BASE_URL =
  typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, "")
    : "";

export function isCloudDataEnabled() {
  return Boolean(API_BASE_URL);
}

function authHeaders(token) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchCloudSessions(token) {
  if (!API_BASE_URL || !token) return [];
  const res = await fetch(`${API_BASE_URL}/api/sessions`, { headers: authHeaders(token) });
  const data = await res.json();
  if (!data?.ok || !Array.isArray(data.sessions)) {
    throw new Error(data?.error || "Failed to load sessions from server.");
  }
  return data.sessions;
}

export async function saveCloudSessions(token, sessions) {
  if (!API_BASE_URL || !token) return;
  const res = await fetch(`${API_BASE_URL}/api/sessions`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify({ sessions }),
  });
  const data = await res.json();
  if (!data?.ok) {
    throw new Error(data?.error || "Failed to save sessions to server.");
  }
}

export async function deleteCloudSession(token, sessionId) {
  if (!API_BASE_URL || !token) return;
  await fetch(`${API_BASE_URL}/api/sessions/${encodeURIComponent(sessionId)}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

export async function patchCloudSession(token, sessionId, patch) {
  if (!API_BASE_URL || !token) return;
  await fetch(`${API_BASE_URL}/api/sessions/${encodeURIComponent(sessionId)}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(patch),
  });
}
