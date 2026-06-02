import { useCallback, useEffect, useRef, useState } from "react";
import {
  deleteCloudSession,
  fetchCloudSessions,
  isCloudDataEnabled,
  patchCloudSession,
  saveCloudSessions,
} from "../utils/cloudSessions";

function useSessionStorage(authToken) {
  const [sessionHistory, setSessionHistory] = useState([]);
  const [storageMode, setStorageMode] = useState(isCloudDataEnabled() ? "cloud" : "disabled");
  const [isStorageReady, setIsStorageReady] = useState(false);
  const [storageError, setStorageError] = useState("");
  const hasLoadedRef = useRef(false);
  const cloudMode = isCloudDataEnabled();

  useEffect(() => {
    let mounted = true;
    hasLoadedRef.current = false;
    setIsStorageReady(false);
    setStorageError("");

    if (!cloudMode) {
      if (mounted) {
        setSessionHistory([]);
        setStorageMode("disabled");
        setIsStorageReady(true);
      }
      return () => {
        mounted = false;
      };
    }

    if (!authToken) {
      if (mounted) {
        setSessionHistory([]);
        setStorageMode("cloud");
        setIsStorageReady(true);
      }
      return () => {
        mounted = false;
      };
    }

    fetchCloudSessions(authToken)
      .then((sessions) => {
        if (!mounted) return;
        setSessionHistory(sessions);
        setStorageMode("cloud");
        setIsStorageReady(true);
        hasLoadedRef.current = true;
      })
      .catch((err) => {
        if (!mounted) return;
        setStorageError(err.message || "Could not load sessions.");
        setSessionHistory([]);
        setIsStorageReady(true);
      });

    return () => {
      mounted = false;
    };
  }, [authToken, cloudMode]);

  useEffect(() => {
    if (!cloudMode || !authToken || !hasLoadedRef.current) {
      return;
    }

    saveCloudSessions(authToken, sessionHistory).catch((err) => {
      setStorageError(err.message || "Could not save sessions.");
    });
  }, [authToken, cloudMode, sessionHistory]);

  const deleteSession = useCallback(
    async (sessionId) => {
      setSessionHistory((prev) => prev.filter((entry) => entry.id !== sessionId));
      if (authToken) {
        await deleteCloudSession(authToken, sessionId);
      }
    },
    [authToken]
  );

  const updateSession = useCallback(
    async (sessionId, patch) => {
      setSessionHistory((prev) =>
        prev.map((entry) => (entry.id === sessionId ? { ...entry, ...patch } : entry))
      );
      if (authToken) {
        await patchCloudSession(authToken, sessionId, patch);
      }
    },
    [authToken]
  );

  return {
    sessionHistory,
    setSessionHistory,
    storageMode,
    isStorageReady,
    storageError,
    deleteSession,
    updateSession,
  };
}

export default useSessionStorage;
