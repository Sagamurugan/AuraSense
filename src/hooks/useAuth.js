import { useCallback, useEffect, useMemo, useState } from "react";

const USERS_KEY = "aurasense_users";
const SESSION_KEY = "aurasense_session";
const API_BASE_URL =
  typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, "")
    : "";

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function generateToken() {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, "0")).join("");
}

function readUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

function writeSession(session) {
  if (session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password) {
  if (password.length < 6) return "Password must be at least 6 characters.";
  if (!/[A-Z]/.test(password)) return "Password must contain an uppercase letter.";
  if (!/[0-9]/.test(password)) return "Password must contain a number.";
  return null;
}

function useAuth() {
  const [session, setSession] = useState(() => readSession());
  const [error, setError] = useState("");

  const storedOnMount = readSession();
  const needsBackendCheck = Boolean(storedOnMount?.token && API_BASE_URL);
  const [isChecking, setIsChecking] = useState(needsBackendCheck);

  const apiFetch = useCallback(async (path, options = {}) => {
    if (!API_BASE_URL) return null;
    try {
      const res = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      return data;
    } catch (err) {
      if (err.name === "TypeError") return null;
      throw err;
    }
  }, []);

  useEffect(() => {
    if (!needsBackendCheck) return;

    const stored = readSession();
    if (!stored || !stored.token || !API_BASE_URL) return;

    apiFetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${stored.token}` },
    })
      .then((data) => {
        if (data?.ok) {
          const updated = {
            ...stored,
            name: data.user.name,
            email: data.user.email,
            authMode: "backend",
          };
          writeSession(updated);
          setSession(updated);
        }
      })
      .catch(() => {
        // Backend unreachable, keep stored session
      })
      .finally(() => {
        setIsChecking(false);
      });
  }, [apiFetch, needsBackendCheck]);

  const register = useCallback(async ({ name, email, password }) => {
    setError("");

    if (!name || !name.trim()) {
      setError("Name is required.");
      throw new Error("Name is required.");
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!validateEmail(trimmedEmail)) {
      setError("Invalid email format.");
      throw new Error("Invalid email format.");
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      throw new Error(passwordError);
    }

    if (API_BASE_URL) {
      try {
        const data = await apiFetch("/api/auth/register", {
          method: "POST",
          body: JSON.stringify({ name: name.trim(), email: trimmedEmail, password }),
        });
        if (data?.ok) {
          const sessionData = {
            userId: data.user.id,
            name: data.user.name,
            email: data.user.email,
            token: data.token,
            expiresAt: Date.now() + 24 * 60 * 60 * 1000,
            authMode: "backend",
          };
          writeSession(sessionData);
          setSession(sessionData);
          return sessionData;
        }
        if (data?.error) {
          setError(data.error);
          throw new Error(data.error);
        }
      } catch (err) {
        if (err.message !== "Failed to fetch") {
          setError(err.message);
          throw err;
        }
      }
    }

    const users = readUsers();
    if (users.some((u) => u.email === trimmedEmail)) {
      setError("An account with this email already exists.");
      throw new Error("An account with this email already exists.");
    }

    const hashed = await hashPassword(password);
    const user = {
      id: generateId(),
      name: name.trim(),
      email: trimmedEmail,
      hashedPassword: hashed,
      createdAt: Date.now(),
    };

    users.push(user);
    writeUsers(users);

    const token = generateToken();
    const sessionData = {
      userId: user.id,
      name: user.name,
      email: user.email,
      token,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      authMode: "local",
    };
    writeSession(sessionData);
    setSession(sessionData);
    return sessionData;
  }, [apiFetch]);

  const login = useCallback(async ({ email, password }) => {
    setError("");

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      setError("Email and password are required.");
      throw new Error("Email and password are required.");
    }

    if (API_BASE_URL) {
      try {
        const data = await apiFetch("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ email: trimmedEmail, password }),
        });
        if (data?.ok) {
          const sessionData = {
            userId: data.user.id,
            name: data.user.name,
            email: data.user.email,
            token: data.token,
            expiresAt: Date.now() + 24 * 60 * 60 * 1000,
            authMode: "backend",
          };
          writeSession(sessionData);
          setSession(sessionData);
          return sessionData;
        }
        if (data?.error) {
          setError(data.error);
          throw new Error(data.error);
        }
      } catch (err) {
        if (err.message !== "Failed to fetch") {
          setError(err.message);
          throw err;
        }
      }
    }

    const users = readUsers();
    const user = users.find((u) => u.email === trimmedEmail);
    if (!user) {
      setError("No account found with this email.");
      throw new Error("No account found with this email.");
    }

    const hashed = await hashPassword(password);
    if (hashed !== user.hashedPassword) {
      setError("Incorrect password.");
      throw new Error("Incorrect password.");
    }

    const token = generateToken();
    const sessionData = {
      userId: user.id,
      name: user.name,
      email: user.email,
      token,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      authMode: "local",
    };
    writeSession(sessionData);
    setSession(sessionData);
    return sessionData;
  }, [apiFetch]);

  const logout = useCallback(() => {
    writeSession(null);
    setSession(null);
    setError("");
  }, []);

  return useMemo(
    () => ({
      user: session ? { id: session.userId, name: session.name, email: session.email } : null,
      isChecking,
      isAuthenticated: Boolean(session),
      error,
      authMode: session?.authMode || null,
      register,
      login,
      logout,
    }),
    [error, isChecking, login, logout, register, session]
  );
}

export default useAuth;
