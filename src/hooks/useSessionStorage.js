import { useEffect, useRef, useState } from "react";
import { persistSessions, readSessionsWithMigration } from "../utils/storage";

function useSessionStorage() {
  const [sessionHistory, setSessionHistory] = useState([]);
  const [storageMode, setStorageMode] = useState("localStorage");
  const [isStorageReady, setIsStorageReady] = useState(false);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    readSessionsWithMigration().then(({ sessions, storageMode: resolvedMode }) => {
      if (!mounted) {
        return;
      }

      setSessionHistory(sessions);
      setStorageMode(resolvedMode);
      setIsStorageReady(true);
      hasLoadedRef.current = true;
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hasLoadedRef.current) {
      return;
    }

    persistSessions(sessionHistory).then((resolvedMode) => {
      setStorageMode(resolvedMode);
      setIsStorageReady(true);
    });
  }, [sessionHistory]);

  return {
    sessionHistory,
    setSessionHistory,
    storageMode,
    isStorageReady,
  };
}

export default useSessionStorage;
