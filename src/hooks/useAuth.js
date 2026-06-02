import { useCallback, useEffect, useMemo, useState } from "react";
import {
  clearLegacyAuthStorage,
  readAuthSession,
  writeAuthSession,
} from "../utils/authStorage";

const API_BASE_URL =
  typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, "")
    : "";

export const requiresBackend = Boolean(API_BASE_URL);

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
  const [session, setSession] = useState(() => readAuthSession());
  const [error, setError] = useState("");
  const needsBackendCheck = Boolean(session?.token && API_BASE_URL);
  const [isChecking, setIsChecking] = useState(needsBackendCheck);

  const apiFetch = useCallback(async (path, options = {}) => {
    if (!API_BASE_URL) {
      throw new Error("VITE_API_BASE_URL is not configured.");
    }
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
  }, []);

  useEffect(() => {
    clearLegacyAuthStorage();
  }, []);

  useEffect(() => {
    if (!needsBackendCheck) return undefined;

    const stored = readAuthSession();
    if (!stored?.token) return undefined;

    apiFetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${stored.token}` },
    })
      .then((data) => {
        if (data?.ok) {
          const updated = {
            ...stored,
            name: data.user.name,
            email: data.user.email,
          };
          writeAuthSession(updated);
          setSession(updated);
        }
      })
      .catch(() => {
        writeAuthSession(null);
        setSession(null);
      })
      .finally(() => {
        setIsChecking(false);
      });

    return undefined;
  }, [apiFetch, needsBackendCheck]);

  const register = useCallback(
    async ({ name, email, password }) => {
      setError("");

      if (!requiresBackend) {
        const msg = "Set VITE_API_BASE_URL so accounts are stored on the server.";
        setError(msg);
        throw new Error(msg);
      }

      if (!name?.trim()) {
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

      const data = await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name: name.trim(), email: trimmedEmail, password }),
      });

      const sessionData = {
        userId: data.user.id,
        name: data.user.name,
        email: data.user.email,
        token: data.token,
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      };
      writeAuthSession(sessionData);
      setSession(sessionData);
      return sessionData;
    },
    [apiFetch]
  );

  const login = useCallback(
    async ({ email, password }) => {
      setError("");

      if (!requiresBackend) {
        const msg = "Set VITE_API_BASE_URL so accounts are stored on the server.";
        setError(msg);
        throw new Error(msg);
      }

      const trimmedEmail = email.trim().toLowerCase();
      if (!trimmedEmail || !password) {
        setError("Email and password are required.");
        throw new Error("Email and password are required.");
      }

      const data = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: trimmedEmail, password }),
      });

      const sessionData = {
        userId: data.user.id,
        name: data.user.name,
        email: data.user.email,
        token: data.token,
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      };
      writeAuthSession(sessionData);
      setSession(sessionData);
      return sessionData;
    },
    [apiFetch]
  );

  const logout = useCallback(() => {
    writeAuthSession(null);
    setSession(null);
    setError("");
  }, []);

  const updateAuthSessionProfile = useCallback((patch) => {
    setSession((current) => {
      if (!current) return current;
      const next = { ...current, ...patch };
      writeAuthSession(next);
      return next;
    });
  }, []);

  return useMemo(
    () => ({
      user: session ? { id: session.userId, name: session.name, email: session.email } : null,
      token: session?.token ?? null,
      isChecking,
      isAuthenticated: Boolean(session?.token),
      error,
      requiresBackend,
      register,
      login,
      logout,
      updateAuthSessionProfile,
    }),
    [error, isChecking, login, logout, register, session, updateAuthSessionProfile]
  );
}

export default useAuth;
