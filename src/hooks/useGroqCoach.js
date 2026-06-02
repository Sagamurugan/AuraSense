import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const API_KEY_STORAGE_KEY = "aura_groq_api_key";
const MODEL = "llama-3.1-8b-instant";
const MAX_TOKENS = 512;
const ENV_API_KEY = typeof import.meta !== "undefined" && import.meta.env?.VITE_GROQ_API_KEY
  ? import.meta.env.VITE_GROQ_API_KEY
  : "";

function buildSystemPrompt(context) {
  const { liveMetrics, dashboardMetrics, sessionHistory, settings } = context;
  const latestSession = sessionHistory?.[0];
  const totalSessions = sessionHistory?.length ?? 0;

  return `You are AuraSense Coach, a focus and wellness assistant. Keep responses concise (2-4 sentences). Use real data provided below.

Current session state:
- Focus: ${liveMetrics.focusScore ?? "N/A"}/100
- Fatigue: ${liveMetrics.fatigueScore ?? "N/A"}%
- Attention: ${liveMetrics.attentionScore ?? "N/A"}/100
- Blink rate: ${liveMetrics.blinkRate ?? "N/A"}/min
- Posture: ${liveMetrics.posture ?? "N/A"}
- Posture score: ${liveMetrics.postureScore ?? "N/A"}/100
- Session duration: ${Math.round((liveMetrics.durationSeconds ?? 0) / 60)} min
- Face detected: ${liveMetrics.faceDetected ? "Yes" : "No"}
- Distraction events: ${liveMetrics.distractionEvents ?? 0}
- Face away: ${liveMetrics.faceAwaySeconds ?? 0}s

Session history: ${totalSessions} saved sessions
${latestSession ? `Latest session: focus ${latestSession.focusScore}, fatigue ${latestSession.fatigue}%, duration ${Math.round((latestSession.duration ?? 0) / 60)} min` : ""}
Best focus window: ${dashboardMetrics?.bestFocusWindow ?? "N/A"}
Average focus: ${dashboardMetrics?.averageFocus ?? "N/A"}
Average fatigue: ${dashboardMetrics?.averageFatigue ?? "N/A"}%

Settings: goal ${settings?.sessionGoalMinutes ?? 25} min, break reminder ${settings?.breakReminderMinutes ?? 20} min, sensitivity ${settings?.alertSensitivity ?? "balanced"}, baseline blink rate ${settings?.baselineBlinkRate ?? 16}/min`;
}

function readStoredKey() {
  try {
    return localStorage.getItem(API_KEY_STORAGE_KEY) || "";
  } catch { /* localStorage unavailable */
    return "";
  }
}

function storeKey(key) {
  try {
    if (key) {
      localStorage.setItem(API_KEY_STORAGE_KEY, key);
    } else {
      localStorage.removeItem(API_KEY_STORAGE_KEY);
    }
  } catch { /* localStorage unavailable */ }
}

function useGroqCoach({
  liveMetrics,
  dashboardMetrics,
  sessionHistory,
  settings,
  liveCalibration,
}) {
  const [apiKey, setApiKey] = useState(() => {
    const stored = readStoredKey();
    if (stored) return stored;
    if (ENV_API_KEY) {
      storeKey(ENV_API_KEY);
      return ENV_API_KEY;
    }
    return "";
  });
  const [status, setStatus] = useState(apiKey ? "ready" : "no-key");
  const [error, setError] = useState(null);
  const [lastSuggestion, setLastSuggestion] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const abortRef = useRef(null);

  const contextPayload = useMemo(
    () => ({ liveMetrics, dashboardMetrics, sessionHistory, settings, liveCalibration }),
    [dashboardMetrics, liveCalibration, liveMetrics, sessionHistory, settings]
  );

  const updateApiKey = useCallback((key) => {
    storeKey(key);
    setApiKey(key);
    setStatus(key ? "ready" : "no-key");
    setError(null);
  }, []);

  const askGroq = useCallback(async (question) => {
    const key = apiKey || readStoredKey();
    if (!key) {
      setStatus("no-key");
      setError("Groq API key is not configured.");
      return null;
    }

    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();

    setStatus("loading");
    setError(null);

    const systemPrompt = buildSystemPrompt(contextPayload);

    try {
      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: question },
          ],
          max_tokens: MAX_TOKENS,
          temperature: 0.7,
        }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        let detail = "";
        try { const err = await response.json(); detail = err.error?.message || ""; } catch { /* ignore */ }
        if (response.status === 401 || response.status === 403) {
          setStatus("invalid-key");
          setError("Invalid API key. Please update your Groq API key.");
        } else {
          setStatus("error");
          setError(`Groq API error (${response.status}): ${detail}`.trim());
        }
        return null;
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";

      const result = {
        summary: content,
        generatedAt: new Date().toISOString(),
      };

      setLastSuggestion(result);
      setLastUpdated(result.generatedAt);
      setStatus("ready");
      return result;
    } catch (err) {
      if (err.name === "AbortError") return null;
      setStatus("error");
      setError(err.message || "Groq request failed.");
      return null;
    }
  }, [apiKey, contextPayload]);

  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  return {
    status,
    error,
    lastSuggestion,
    lastUpdated,
    askGroq,
    updateApiKey,
    hasApiKey: Boolean(apiKey),
  };
}

export default useGroqCoach;