import { useEffect, useMemo, useState } from "react";

const SETTINGS_STORAGE_KEY = "aura-sense-settings";

const DEFAULT_SETTINGS = {
  alertSensitivity: "balanced",
  sessionGoalMinutes: 25,
  breakReminderMinutes: 20,
  baselineBlinkRate: 16,
  autoCalibrated: false,
  debugMode: false,
};

const MIN_SETTINGS = {
  sessionGoalMinutes: 10,
  breakReminderMinutes: 10,
  baselineBlinkRate: 5,
};

const MAX_SETTINGS = {
  sessionGoalMinutes: 60,
  breakReminderMinutes: 45,
  baselineBlinkRate: 40,
};

function validateSetting(key, value) {
  if (key === "sessionGoalMinutes") {
    return Math.max(MIN_SETTINGS.sessionGoalMinutes, Math.min(MAX_SETTINGS.sessionGoalMinutes, Number(value) || DEFAULT_SETTINGS.sessionGoalMinutes));
  }
  if (key === "breakReminderMinutes") {
    return Math.max(MIN_SETTINGS.breakReminderMinutes, Math.min(MAX_SETTINGS.breakReminderMinutes, Number(value) || DEFAULT_SETTINGS.breakReminderMinutes));
  }
  if (key === "baselineBlinkRate") {
    return Math.max(MIN_SETTINGS.baselineBlinkRate, Math.min(MAX_SETTINGS.baselineBlinkRate, Number(value) || DEFAULT_SETTINGS.baselineBlinkRate));
  }
  if (key === "alertSensitivity") {
    const validValues = ["relaxed", "balanced", "strict"];
    return validValues.includes(value) ? value : DEFAULT_SETTINGS.alertSensitivity;
  }
  if (key === "autoCalibrated") {
    return Boolean(value);
  }
  if (key === "debugMode") {
    return Boolean(value);
  }
  return value;
}

function readStoredSettings(sessionHistory = []) {
  const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);

  if (!stored) {
    const baseline = getRecommendedBaseline(sessionHistory);

    return {
      ...DEFAULT_SETTINGS,
      baselineBlinkRate: baseline,
      autoCalibrated: sessionHistory.length > 0,
    };
  }

  try {
    const parsed = JSON.parse(stored);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function getRecommendedBaseline(sessionHistory) {
  if (!sessionHistory.length) {
    return DEFAULT_SETTINGS.baselineBlinkRate;
  }

  const rates = sessionHistory
    .map((session) => {
      const durationMinutes = Math.max((session.duration ?? 0) / 60, 0.2);
      return Math.round((session.blinks ?? 0) / durationMinutes);
    })
    .filter((value) => Number.isFinite(value) && value > 0);

  if (!rates.length) {
    return DEFAULT_SETTINGS.baselineBlinkRate;
  }

  return Math.round(rates.reduce((sum, value) => sum + value, 0) / rates.length);
}

function useUserSettings({ sessionHistory, liveMetrics }) {
  const [settings, setSettings] = useState(() => readStoredSettings(sessionHistory));
  const [liveCalibration, setLiveCalibration] = useState({
    active: false,
    startedAt: null,
    endsAt: null,
    secondsRemaining: 0,
    sampleCount: 0,
    baselinePreview: null,
    status: "idle",
  });

  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const recommendedBaseline = useMemo(
    () => getRecommendedBaseline(sessionHistory),
    [sessionHistory]
  );

  const updateSetting = (key, value) => {
    const validatedValue = validateSetting(key, value);
    setSettings((current) => ({
      ...current,
      [key]: validatedValue,
    }));
  };

  const calibrateFromLiveSession = () => {
    if (liveCalibration.active) {
      return false;
    }

    const now = Date.now();
    setLiveCalibration({
      active: true,
      startedAt: now,
      endsAt: now + 8000,
      secondsRemaining: 8,
      sampleCount: 0,
      baselinePreview: settings.baselineBlinkRate,
      status: "running",
    });
    return true;
  };

  const calibrateFromHistory = () => {
    setSettings((current) => ({
      ...current,
      baselineBlinkRate: recommendedBaseline,
      autoCalibrated: true,
    }));
  };

  useEffect(() => {
    if (!liveCalibration.active) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      const now = Date.now();
      const secondsRemaining = Math.max(0, Math.ceil((liveCalibration.endsAt - now) / 1000));

      setLiveCalibration((current) => {
        const trackingQuality = liveMetrics.trackingQualityScore ?? 0;
        const shouldUseSample = trackingQuality >= 28;
        const currentPreview = current.baselinePreview ?? settings.baselineBlinkRate;
        const nextPreview =
          shouldUseSample && liveMetrics.blinkRate >= 0
            ? Math.round(currentPreview * 0.78 + liveMetrics.blinkRate * 0.22)
            : currentPreview;

        if (now >= current.endsAt) {
          const resolvedBaseline = Math.max(
            MIN_SETTINGS.baselineBlinkRate,
            Math.min(
              MAX_SETTINGS.baselineBlinkRate,
              nextPreview || recommendedBaseline || settings.baselineBlinkRate
            )
          );

          setSettings((existing) => ({
            ...existing,
            baselineBlinkRate: resolvedBaseline,
            autoCalibrated: true,
          }));

          return {
            active: false,
            startedAt: null,
            endsAt: null,
            secondsRemaining: 0,
            sampleCount: current.sampleCount,
            baselinePreview: resolvedBaseline,
            status: "completed",
          };
        }

        return {
          ...current,
          secondsRemaining,
          sampleCount: shouldUseSample ? current.sampleCount + 1 : current.sampleCount,
          baselinePreview: nextPreview,
          status: shouldUseSample ? "tracking" : "waiting-for-signal",
        };
      });
    }, 500);

    return () => window.clearInterval(timer);
  }, [
    liveCalibration.active,
    liveCalibration.endsAt,
    liveMetrics.blinkRate,
    liveMetrics.trackingQualityScore,
    recommendedBaseline,
    settings.baselineBlinkRate,
  ]);

  return {
    settings,
    updateSetting,
    calibrateFromLiveSession,
    calibrateFromHistory,
    recommendedBaseline,
    liveCalibration,
  };
}

export default useUserSettings;
