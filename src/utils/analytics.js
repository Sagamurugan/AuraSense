import { getSessionFocusScore } from "./scoring";

export function formatDuration(totalSeconds = 0) {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

export function formatSessionDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function getSessionDurationSeconds(sessionStart) {
  return Math.max(0, Math.floor((Date.now() - sessionStart) / 1000));
}

export function deriveDashboardMetrics(sessionHistory) {
  if (!sessionHistory.length) {
    return {
      averageFatigue: 0,
      averageFocus: 0,
      averageAttention: 0,
      averagePosture: 0,
      totalSessions: 0,
      bestSession: null,
      bestFocusWindow: "Not enough data",
      dailySummary: [],
      weeklySummary: [],
      comparisonSummary: null,
    };
  }

  const totalSessions = sessionHistory.length;
  const averageFatigue = Math.round(
    sessionHistory.reduce((sum, session) => sum + (session.fatigue ?? 0), 0) / totalSessions
  );
  const averageFocus = Math.round(
    sessionHistory.reduce((sum, session) => sum + getSessionFocusScore(session), 0) / totalSessions
  );
  const averageAttention = Math.round(
    sessionHistory.reduce((sum, session) => sum + (session.attentionScore ?? 0), 0) / totalSessions
  );
  const averagePosture = Math.round(
    sessionHistory.reduce((sum, session) => sum + (session.postureScore ?? 0), 0) / totalSessions
  );
  const bestSession = [...sessionHistory].sort(
    (left, right) => getSessionFocusScore(right) - getSessionFocusScore(left)
  )[0];
  const dailySummary = deriveDailySummary(sessionHistory);
  const weeklySummary = deriveWeeklySummary(sessionHistory);
  const comparisonSummary = deriveComparisonSummary(sessionHistory);
  const bestFocusWindow = deriveBestFocusWindow(sessionHistory);

  return {
    averageFatigue,
    averageFocus,
    averageAttention,
    averagePosture,
    totalSessions,
    bestSession,
    bestFocusWindow,
    dailySummary,
    weeklySummary,
    comparisonSummary,
  };
}

function parseSessionDate(value) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function deriveDailySummary(sessionHistory) {
  const grouped = new Map();

  sessionHistory.forEach((session) => {
    const date = parseSessionDate(session.date);
    if (!date) {
      return;
    }

    const key = date.toISOString().slice(0, 10);
    const label = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "2-digit",
    }).format(date);

    const current = grouped.get(key) ?? {
      key,
      label,
      totalFocus: 0,
      totalAttention: 0,
      totalFatigue: 0,
      totalDuration: 0,
      totalSessions: 0,
    };

    current.totalFocus += getSessionFocusScore(session);
    current.totalAttention += session.attentionScore ?? 0;
    current.totalFatigue += session.fatigue ?? 0;
    current.totalDuration += session.duration ?? 0;
    current.totalSessions += 1;

    grouped.set(key, current);
  });

  return [...grouped.values()]
    .sort((left, right) => left.key.localeCompare(right.key))
    .slice(-7)
    .map((entry) => ({
      label: entry.label,
      focus: Math.round(entry.totalFocus / entry.totalSessions),
      attention: Math.round(entry.totalAttention / entry.totalSessions),
      fatigue: Math.round(entry.totalFatigue / entry.totalSessions),
      durationMinutes: Math.round(entry.totalDuration / 60),
      sessions: entry.totalSessions,
    }));
}

function getWeekKey(date) {
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((utcDate - yearStart) / 86400000) + 1) / 7);

  return `${utcDate.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function deriveWeeklySummary(sessionHistory) {
  const grouped = new Map();

  sessionHistory.forEach((session) => {
    const date = parseSessionDate(session.date);
    if (!date) {
      return;
    }

    const key = getWeekKey(date);
    const current = grouped.get(key) ?? {
      key,
      totalFocus: 0,
      totalFatigue: 0,
      totalAttention: 0,
      totalSessions: 0,
    };

    current.totalFocus += getSessionFocusScore(session);
    current.totalFatigue += session.fatigue ?? 0;
    current.totalAttention += session.attentionScore ?? 0;
    current.totalSessions += 1;

    grouped.set(key, current);
  });

  return [...grouped.values()]
    .sort((left, right) => left.key.localeCompare(right.key))
    .slice(-4)
    .map((entry) => ({
      label: entry.key.replace("-", " "),
      focus: Math.round(entry.totalFocus / entry.totalSessions),
      fatigue: Math.round(entry.totalFatigue / entry.totalSessions),
      attention: Math.round(entry.totalAttention / entry.totalSessions),
      sessions: entry.totalSessions,
    }));
}

function deriveBestFocusWindow(sessionHistory) {
  const grouped = new Map();

  sessionHistory.forEach((session) => {
    const date = parseSessionDate(session.date);
    if (!date) {
      return;
    }

    const hour = date.getHours();
    const label =
      hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : hour < 21 ? "Evening" : "Night";

    const current = grouped.get(label) ?? { totalFocus: 0, totalSessions: 0 };
    current.totalFocus += getSessionFocusScore(session);
    current.totalSessions += 1;
    grouped.set(label, current);
  });

  if (!grouped.size) {
    return "Not enough data";
  }

  const [bestLabel] = [...grouped.entries()].sort(
    (left, right) =>
      right[1].totalFocus / right[1].totalSessions -
      left[1].totalFocus / left[1].totalSessions
  )[0];

  return bestLabel;
}

function deriveComparisonSummary(sessionHistory) {
  if (sessionHistory.length < 2) {
    return null;
  }

  const [latest, previous] = sessionHistory;
  const focusDelta = getSessionFocusScore(latest) - getSessionFocusScore(previous);
  const fatigueDelta = (latest.fatigue ?? 0) - (previous.fatigue ?? 0);
  const attentionDelta = (latest.attentionScore ?? 0) - (previous.attentionScore ?? 0);

  return {
    focusDelta,
    fatigueDelta,
    attentionDelta,
    summary:
      focusDelta >= 0
        ? "Latest session improved against the previous one."
        : "Latest session dipped versus the previous one.",
  };
}

function getSensitivityThresholds(settings) {
  const sensitivity = settings?.alertSensitivity ?? "balanced";

  if (sensitivity === "strict") {
    return {
      fatigueThreshold: 45,
      blinkThresholdOffset: 6,
      breakReminderMinutes: settings?.breakReminderMinutes ?? 15,
    };
  }

  if (sensitivity === "relaxed") {
    return {
      fatigueThreshold: 70,
      blinkThresholdOffset: 12,
      breakReminderMinutes: settings?.breakReminderMinutes ?? 25,
    };
  }

  return {
    fatigueThreshold: 60,
    blinkThresholdOffset: 9,
    breakReminderMinutes: settings?.breakReminderMinutes ?? 20,
  };
}

export function deriveAlerts(liveMetrics, settings) {
  const alerts = [];
  const thresholds = getSensitivityThresholds(settings);
  const baselineBlinkRate = settings?.baselineBlinkRate ?? 16;

  if (
    liveMetrics.durationSeconds >= thresholds.breakReminderMinutes * 60 ||
    liveMetrics.fatigueScore >= thresholds.fatigueThreshold
  ) {
    alerts.push({
      title: "Take a break",
      message: "Fatigue is climbing. A short reset can help protect your focus quality.",
      tone: "warning",
    });
  }

  if (liveMetrics.posture === "Needs attention") {
    alerts.push({
      title: "Posture might be off",
      message: "Your face position looks tilted or off-center. Realign your screen and shoulders.",
      tone: "info",
    });
  }

  if (liveMetrics.blinkRate >= baselineBlinkRate + thresholds.blinkThresholdOffset) {
    alerts.push({
      title: "Blink rate above baseline",
      message: "Frequent blinking can indicate strain. Consider adjusting light or taking a pause.",
      tone: "info",
    });
  }

  if (liveMetrics.faceAwaySeconds >= 4 || liveMetrics.distractionLevel === "High") {
    alerts.push({
      title: "Attention drift detected",
      message: "You have been away from frame long enough to interrupt flow. Re-center and resume.",
      tone: "warning",
    });
  }

  if (liveMetrics.postureScore > 0 && liveMetrics.postureScore <= 55) {
    alerts.push({
      title: "Posture score is dropping",
      message: "Your posture score is low right now. Adjust head alignment and screen angle.",
      tone: "info",
    });
  }

  if (liveMetrics.gazeDriftLevel === "High" || liveMetrics.gazeDriftScore <= 45) {
    alerts.push({
      title: "Gaze drift detected",
      message: "Your eyes are drifting away from center frequently. Re-engage with the screen focus area.",
      tone: "info",
    });
  }

  if (liveMetrics.headMovementScore <= 45) {
    alerts.push({
      title: "Head movement is unstable",
      message: "Frequent head movement can indicate restlessness or poor screen positioning.",
      tone: "info",
    });
  }

  if (liveMetrics.eyeClosureRisk === "High" || liveMetrics.prolongedClosures >= 2) {
    alerts.push({
      title: "Prolonged eye closure detected",
      message: "Extended eye closures may indicate drowsiness. Pause and reset before continuing.",
      tone: "warning",
    });
  }

  if (liveMetrics.yawnEvents > 0 || liveMetrics.drowsinessRisk === "High") {
    alerts.push({
      title: "Drowsiness risk rising",
      message: "Yawning or high drowsiness signals were detected. Consider stopping for a recovery break.",
      tone: "warning",
    });
  }

  return alerts;
}

export function createInsightSummary({
  liveMetrics,
  sessionHistory,
  dashboardMetrics,
  settings,
}) {
  const insights = [];

  const longSessions = sessionHistory.filter((session) => (session.duration ?? 0) >= 15 * 60);
  const fatiguedLongSessions = longSessions.filter((session) => (session.fatigue ?? 0) >= 45);

  if (fatiguedLongSessions.length >= 2) {
    const averageThreshold = Math.round(
      fatiguedLongSessions.reduce((sum, session) => sum + session.duration, 0) /
        fatiguedLongSessions.length /
        60
    );

    insights.push({
      title: "Fatigue pattern",
      message: `You tend to get fatigued after about ${averageThreshold} minutes. Scheduling a recovery break before that point should help maintain consistency.`,
    });
  }

  const baselineBlinkRate =
    settings?.baselineBlinkRate ??
    (sessionHistory.length > 0
      ? Math.round(
          sessionHistory.reduce((sum, session) => {
            const durationMinutes = Math.max((session.duration ?? 0) / 60, 0.2);
            return sum + Math.round((session.blinks ?? 0) / durationMinutes);
          }, 0) / sessionHistory.length
        )
      : 16);

  if (liveMetrics.blinkRate > baselineBlinkRate + 4) {
    insights.push({
      title: "Blink rhythm shift",
      message: `Your blink rate is higher than normal for you right now at ${liveMetrics.blinkRate}/min versus a baseline near ${baselineBlinkRate}/min.`,
    });
  }

  if (liveMetrics.faceAwaySeconds >= 4 || liveMetrics.distractionEvents >= 2) {
    insights.push({
      title: "Distraction pattern",
      message: `This session shows ${liveMetrics.distractionEvents} attention breaks and ${liveMetrics.faceAwaySeconds} seconds away from frame. Shorter, more intentional work blocks may help.`,
    });
  }

  if (liveMetrics.postureScore > 0 && liveMetrics.postureScore < 75) {
    insights.push({
      title: "Posture trend",
      message: `Your posture score is ${liveMetrics.postureScore}, which suggests screen alignment or seating could be improved for longer sessions.`,
    });
  }

  if (liveMetrics.gazeDriftEvents >= 2 || liveMetrics.gazeDriftLevel === "High") {
    insights.push({
      title: "Gaze drift pattern",
      message: `Gaze drift has been detected ${liveMetrics.gazeDriftEvents} times in this session, which can suggest attention loss or screen disengagement.`,
    });
  }

  if (liveMetrics.headMovementScore < 70) {
    insights.push({
      title: "Head stability trend",
      message: `Your head movement stability score is ${liveMetrics.headMovementScore}. A steadier posture setup may improve sustained focus.`,
    });
  }

  if (liveMetrics.prolongedClosures > 0) {
    insights.push({
      title: "Eye closure pattern",
      message: `AuraSense detected ${liveMetrics.prolongedClosures} prolonged eye closure event${liveMetrics.prolongedClosures > 1 ? "s" : ""} in this session.`,
    });
  }

  if (liveMetrics.yawnEvents > 0) {
    insights.push({
      title: "Yawning pattern",
      message: `Detected ${liveMetrics.yawnEvents} yawn event${liveMetrics.yawnEvents > 1 ? "s" : ""}, which can be a useful signal for strain or drowsiness.`,
    });
  }

  if (liveMetrics.drowsinessRisk !== "Low") {
    insights.push({
      title: "Drowsiness trend",
      message: `Current drowsiness risk is ${liveMetrics.drowsinessRisk.toLowerCase()} with a score of ${liveMetrics.drowsinessScore}.`,
    });
  }

  if (
    settings?.sessionGoalMinutes &&
    liveMetrics.durationSeconds >= settings.sessionGoalMinutes * 60 &&
    liveMetrics.focusScore >= 70
  ) {
    insights.push({
      title: "Goal reached",
      message: `You hit your ${settings.sessionGoalMinutes}-minute focus goal while staying in a healthy range. That is a strong candidate for your ideal work block.`,
    });
  }

  if (dashboardMetrics.bestSession) {
    insights.push({
      title: "Best session window",
      message: `Your strongest saved session ran for ${Math.round(
        dashboardMetrics.bestSession.duration / 60
      )} minutes with a focus score of ${getSessionFocusScore(dashboardMetrics.bestSession)}.`,
    });
  }

  if (!insights.length) {
    insights.push({
      title: "Baseline forming",
      message:
        "Complete a few more sessions and AuraSense will surface stronger personalized focus and fatigue patterns.",
    });
  }

  return insights.slice(0, 5);
}

export function createSessionReportInsights(session, settings) {
  const insights = [];
  const durationMinutes = Math.max(Math.round((session.duration ?? 0) / 60), 1);

  if ((session.focusScore ?? 0) >= 75) {
    insights.push(`Strong focus maintained for ${durationMinutes} minutes.`);
  } else {
    insights.push(`Focus dipped during this ${durationMinutes}-minute session. A shorter work block may help.`);
  }

  if ((session.fatigue ?? 0) >= 60) {
    insights.push("Fatigue ended in a high range. A break is recommended before the next session.");
  } else if ((session.fatigue ?? 0) >= 35) {
    insights.push("Fatigue rose moderately. Consider a quick reset before continuing.");
  } else {
    insights.push("Fatigue stayed relatively controlled across the session.");
  }

  if ((session.distractionEvents ?? 0) >= 3 || (session.faceAwaySeconds ?? 0) >= 8) {
    insights.push("Attention drift was noticeable. Reducing interruptions could improve the next run.");
  }

  if ((session.prolongedClosures ?? 0) > 0) {
    insights.push(`Detected ${session.prolongedClosures} prolonged eye closure event${session.prolongedClosures > 1 ? "s" : ""}, which may suggest strain or drowsiness.`);
  }

  if ((session.yawnEvents ?? 0) > 0) {
    insights.push(`Detected ${session.yawnEvents} yawn event${session.yawnEvents > 1 ? "s" : ""}, which contributed to drowsiness estimation.`);
  }

  if ((session.gazeDriftScore ?? 100) < 70) {
    insights.push("Gaze drift suggests moments of disengagement from the screen focus area.");
  }

  if ((session.headMovementScore ?? 100) < 70 || (session.postureScore ?? 100) < 70) {
    insights.push("Posture and movement stability could be improved with a better seating or screen setup.");
  }

  if (settings?.sessionGoalMinutes) {
    if ((session.duration ?? 0) >= settings.sessionGoalMinutes * 60) {
      insights.push(`You reached your configured ${settings.sessionGoalMinutes}-minute session goal.`);
    } else {
      insights.push(`You completed ${durationMinutes} minutes against a ${settings.sessionGoalMinutes}-minute session goal.`);
    }
  }

  return insights.slice(0, 5);
}
