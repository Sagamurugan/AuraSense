import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const DEFAULT_PROMPT = "Give a short realtime coaching update for this session.";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

function createContextPayload({ liveMetrics, dashboardMetrics, sessionHistory, settings, liveCalibration }) {
  return {
    liveMetrics,
    dashboardMetrics,
    settings,
    liveCalibration,
    sessionHistory: sessionHistory.slice(0, 5),
  };
}

function shouldRequestUpdate({ sessionActive, liveCalibration, liveMetrics }) {
  return (
    sessionActive &&
    !liveCalibration.active &&
    (liveMetrics.trackingQualityScore ?? 0) >= 30 &&
    Boolean(liveMetrics.faceDetected)
  );
}

function useGeminiCoach({
  liveMetrics,
  dashboardMetrics,
  sessionHistory,
  settings,
  liveCalibration,
  sessionActive,
  authToken,
}) {
  const [status, setStatus] = useState("checking");
  const [error, setError] = useState(null);
  const [lastSuggestion, setLastSuggestion] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const lastRequestAtRef = useRef(0);
  const checkAvailabilityRef = useRef(async () => {});
  const failureCountRef = useRef(0);

  const contextPayload = useMemo(
    () =>
      createContextPayload({
        liveMetrics,
        dashboardMetrics,
        sessionHistory,
        settings,
        liveCalibration,
      }),
    [dashboardMetrics, liveCalibration, liveMetrics, sessionHistory, settings]
  );

  useEffect(() => {
    let cancelled = false;

    checkAvailabilityRef.current = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        const data = await response.json();

        if (cancelled) {
          return false;
        }

        if (response.ok && data.configured) {
          setStatus("ready");
          setError(null);
          failureCountRef.current = 0;
          return true;
        }

        if (response.ok) {
          setStatus("not-configured");
          return false;
        }

        setStatus("offline");
        return false;
      } catch {
        if (!cancelled) {
          setStatus("offline");
        }
        return false;
      }
    };

    void checkAvailabilityRef.current();
    const interval = window.setInterval(() => {
      void checkAvailabilityRef.current();
    }, 12000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const askGemini = useCallback(
    async (question = DEFAULT_PROMPT, reason = "manual") => {
      if (status !== "ready") {
        const available = await checkAvailabilityRef.current();
        if (!available) {
          return null;
        }
      }

      setError(null);
      setStatus((current) => (current === "not-configured" ? current : "loading"));

      try {
        const response = await fetch(`${API_BASE_URL}/api/coach`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
          body: JSON.stringify({
            question,
            reason,
            context: contextPayload,
          }),
        });
        const data = await response.json();

        if (!response.ok || !data.ok) {
          throw new Error(data.error || "Gemini request failed.");
        }

        setLastSuggestion(data);
        setLastUpdated(data.generatedAt || new Date().toISOString());
        setStatus("ready");
        failureCountRef.current = 0;
        lastRequestAtRef.current = Date.now();
        return data;
      } catch (requestError) {
        setError(requestError.message || "Gemini request failed.");
        failureCountRef.current += 1;
        setStatus(failureCountRef.current >= 2 ? "offline" : "ready");
        return null;
      }
    },
    [authToken, contextPayload, status]
  );

  useEffect(() => {
    if (status !== "ready" || !shouldRequestUpdate({ sessionActive, liveCalibration, liveMetrics })) {
      return undefined;
    }

    const triggerAutoUpdate = () => {
      const now = Date.now();
      if (now - lastRequestAtRef.current < 25000) {
        return;
      }

      askGemini(DEFAULT_PROMPT, "auto");
    };

    const initialDelay = window.setTimeout(triggerAutoUpdate, 5000);
    const interval = window.setInterval(triggerAutoUpdate, 25000);

    return () => {
      window.clearTimeout(initialDelay);
      window.clearInterval(interval);
    };
  }, [askGemini, liveCalibration, liveMetrics, sessionActive, status]);

  return {
    status,
    error,
    lastSuggestion,
    lastUpdated,
    askGemini,
  };
}

export default useGeminiCoach;
