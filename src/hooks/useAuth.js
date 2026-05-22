import { useCallback, useEffect, useMemo, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const TOKEN_KEY = "aurasense_auth_token";

function readStoredToken() {
  if (typeof window === "undefined") {
    return "";
  }
  return window.localStorage.getItem(TOKEN_KEY) || "";
}

function storeToken(token) {
  if (typeof window === "undefined") {
    return;
  }

  if (token) {
    window.localStorage.setItem(TOKEN_KEY, token);
    return;
  }

  window.localStorage.removeItem(TOKEN_KEY);
}

function useAuth() {
  const [token, setToken] = useState(() => readStoredToken());
  const [user, setUser] = useState(null);
  const [isChecking, setIsChecking] = useState(() => Boolean(readStoredToken()));
  const [error, setError] = useState("");
  const [serverConfig, setServerConfig] = useState({
    registrationEnabled: true,
    demoAuthEnabled: false,
    demoUserEmail: "",
  });

  const refreshServerConfig = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`);
      const data = await response.json();

      if (response.ok && data.ok) {
        setServerConfig({
          registrationEnabled: data.registrationEnabled !== false,
          demoAuthEnabled: Boolean(data.demoAuthEnabled),
          demoUserEmail: data.demoUserEmail || "",
        });
      }
    } catch {
      // Leave defaults when the server is temporarily unreachable.
    }
  }, []);

  const refreshUser = useCallback(async (overrideToken) => {
    const activeToken = overrideToken ?? token ?? readStoredToken();

    if (!activeToken) {
      setUser(null);
      setIsChecking(false);
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Unable to verify session.");
      }

      setUser(data.user);
      setError("");
      return true;
    } catch (requestError) {
      setUser(null);
      setToken("");
      storeToken("");
      setError(requestError instanceof Error ? requestError.message : "Authentication failed.");
      return false;
    } finally {
      setIsChecking(false);
    }
  }, [token]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void refreshServerConfig();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [refreshServerConfig]);

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      void refreshUser(token);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [refreshUser, token]);

  const authenticate = useCallback(async (mode, payload) => {
    setError("");

    const endpoint = mode === "register" ? "register" : "login";
    const response = await fetch(`${API_BASE_URL}/api/auth/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();

    if (!response.ok || !data.ok) {
      const message = data.error || "Authentication failed.";
      setError(message);
      throw new Error(message);
    }

    setToken(data.token);
    setUser(data.user);
    storeToken(data.token);
    setIsChecking(false);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    setToken("");
    setUser(null);
    setError("");
    storeToken("");
  }, []);

  return useMemo(
    () => ({
      user,
      token,
      isChecking,
      isAuthenticated: Boolean(user && token),
      error,
      serverConfig,
      login: (payload) => authenticate("login", payload),
      register: (payload) => authenticate("register", payload),
      logout,
      refreshUser,
    }),
    [authenticate, error, isChecking, logout, refreshUser, serverConfig, token, user]
  );
}

export default useAuth;
