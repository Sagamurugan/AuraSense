function describeRange(value, goodThreshold, mediumThreshold, inverse = false) {
  if (inverse) {
    if (value <= goodThreshold) {
      return "good";
    }
    if (value <= mediumThreshold) {
      return "moderate";
    }
    return "concerning";
  }

  if (value >= goodThreshold) {
    return "good";
  }
  if (value >= mediumThreshold) {
    return "moderate";
  }
  return "concerning";
}

function buildFatigueFactors(liveMetrics, settings) {
  const factors = [];
  const breakTarget = settings?.breakReminderMinutes ?? 20;
  const durationMinutes = Math.round((liveMetrics.durationSeconds ?? 0) / 60);
  const trackingLow = (liveMetrics.trackingQualityScore ?? 0) < 45;

  if ((liveMetrics.fatigueScore ?? 0) >= 70) {
    factors.push(`overall fatigue score is high at ${liveMetrics.fatigueScore}%`);
  }
  if ((liveMetrics.blinkRate ?? 0) === 0 && trackingLow) {
    factors.push(
      `blink rate is 0/min while tracking quality is only ${liveMetrics.trackingQualityScore}, so blink-based fatigue estimates may be inflated by weak sensor tracking`
    );
  } else if ((liveMetrics.blinkRate ?? 0) === 0) {
    factors.push("blink rate is 0/min, which can suggest dryness, strain, or undercounted blinks");
  }
  if ((liveMetrics.postureScore ?? 100) < 75) {
    factors.push(`posture score has dropped to ${liveMetrics.postureScore}`);
  }
  if ((liveMetrics.gazeDriftScore ?? 100) < 75) {
    factors.push(`gaze drift score is down to ${liveMetrics.gazeDriftScore}`);
  }
  if ((liveMetrics.faceAwaySeconds ?? 0) >= 4) {
    factors.push(`you have been away from frame for ${liveMetrics.faceAwaySeconds} seconds`);
  }
  if ((liveMetrics.prolongedClosures ?? 0) > 0) {
    factors.push(`${liveMetrics.prolongedClosures} prolonged eye closures were detected`);
  }
  if ((liveMetrics.yawnEvents ?? 0) > 0) {
    factors.push(`${liveMetrics.yawnEvents} yawn events were detected`);
  }
  if (durationMinutes >= breakTarget) {
    factors.push(`session duration has reached ${durationMinutes} minutes, which is past your ${breakTarget}-minute break target`);
  }

  return factors;
}

export function getSuggestedPrompts() {
  return [
    "How is my current focus?",
    "Should I take a break now?",
    "What is hurting my performance?",
    "How did my recent sessions compare?",
    "Am I getting drowsy?",
  ];
}

export function getAssistantReply(question, context) {
  const q = question.toLowerCase();
  const { liveMetrics, dashboardMetrics, settings, sessionHistory, liveCalibration } = context;
  const latestSession = sessionHistory[0];
  const fatigueFactors = buildFatigueFactors(liveMetrics, settings);
  const canContinueWorking =
    (liveMetrics.focusScore ?? 0) >= 70 &&
    (liveMetrics.attentionScore ?? 0) >= 75 &&
    (liveMetrics.fatigueScore ?? 100) < 55;

  if (q.includes("break")) {
    const fatigueState = describeRange(liveMetrics.fatigueScore, 35, 55, true);
    if (
      liveMetrics.fatigueScore >= settings.breakReminderMinutes ||
      liveMetrics.faceAwaySeconds >= 6 ||
      liveMetrics.eyeClosureRisk === "High"
    ) {
      return "A break is a good idea right now. Fatigue or attention drift is elevated, so a short reset should help.";
    }
    return `A break is not urgent yet. Your fatigue state looks ${fatigueState}, but keep watching the next few minutes.`;
  }

  if (
    q.includes("can i work") ||
    q.includes("should i work") ||
    q.includes("continue working") ||
    q.includes("keep working")
  ) {
    if (canContinueWorking) {
      return `Yes, you can keep working right now. Your focus is ${liveMetrics.focusScore}, attention is ${liveMetrics.attentionScore}, and fatigue is still moderate at ${liveMetrics.fatigueScore}%. Just keep an eye on ${fatigueFactors.slice(0, 2).join(" and ") || "your posture and blink rhythm"}.`;
    }

    return `A short rest would be better than pushing through right now. Fatigue is ${liveMetrics.fatigueScore}% and the main pressure points are ${fatigueFactors.slice(0, 2).join(" and ") || "overall strain signals"}.`;
  }

  if (
    q.includes("can i rest") ||
    q.includes("should i rest") ||
    q.includes("take rest")
  ) {
    if ((liveMetrics.fatigueScore ?? 0) >= 55 || (liveMetrics.eyeClosureRisk ?? "Low") !== "Low") {
      return `Yes, resting now would make sense. Fatigue is ${liveMetrics.fatigueScore}% and your session is already showing strain signals.`;
    }

    return `You can rest if you feel discomfort, but the metrics do not show an urgent need right now. Focus is ${liveMetrics.focusScore} and fatigue is ${liveMetrics.fatigueScore}%.`;
  }

  if (q.includes("groq") && q.includes("work")) {
    return "Groq powers AI coaching responses in the browser. Your live session metrics still come from AuraSense locally. If Groq is unavailable, the local assistant answers from the same realtime data.";
  }

  if (q.includes("focus")) {
    return `Your current focus score is ${liveMetrics.focusScore}. Attention is ${liveMetrics.attentionScore}, posture score is ${liveMetrics.postureScore}, and blink rhythm is ${liveMetrics.blinkRate}/min.`;
  }

  if (
    q.includes("fatigue") ||
    q.includes("reason") ||
    q.includes("why") ||
    q.includes("tired")
  ) {
    if (!fatigueFactors.length) {
      return `Fatigue is at ${liveMetrics.fatigueScore}% right now, but there is no single strong fatigue trigger standing out. The score is likely being driven by moderate strain across blink rhythm, posture, and session load rather than one major event.`;
    }

    return `Your fatigue is ${liveMetrics.fatigueScore}% mainly because ${fatigueFactors.slice(0, 3).join(", ")}.`;
  }

  if (q.includes("drows") || q.includes("sleep") || q.includes("yawn") || q.includes("tired")) {
    return `Current drowsiness risk is ${liveMetrics.drowsinessRisk} with a score of ${liveMetrics.drowsinessScore}. Yawn events this session: ${liveMetrics.yawnEvents}, prolonged eye closures: ${liveMetrics.prolongedClosures}, and signal confidence is ${liveMetrics.measurementConfidence}.`;
  }

  if (q.includes("hurting") || q.includes("performance")) {
    const factors = [...fatigueFactors];
    if (liveMetrics.postureScore < 70 && !factors.includes("posture alignment")) {
      factors.push("posture alignment");
    }
    if (liveMetrics.gazeDriftScore < 70) {
      factors.push("gaze drift");
    }
    if (liveMetrics.headMovementScore < 70) {
      factors.push("head stability");
    }
    if (liveMetrics.eyeClosureRisk !== "Low") {
      factors.push("eye closure risk");
    }
    if (liveMetrics.drowsinessRisk !== "Low") {
      factors.push("drowsiness risk");
    }
    if (liveMetrics.yawnEvents > 0) {
      factors.push("yawning signals");
    }
    if (liveMetrics.faceAwaySeconds >= 4) {
      factors.push("time away from frame");
    }

    return factors.length
      ? `The biggest factors affecting performance right now are ${factors.join(", ")}.`
      : "No major negative signal stands out right now. Your current session looks fairly stable.";
  }

  if (q.includes("compare") || q.includes("recent session")) {
    if (!dashboardMetrics.comparisonSummary || !latestSession) {
      return "I need at least two saved sessions before I can compare trends reliably.";
    }

    return `${dashboardMetrics.comparisonSummary.summary} Current best focus window is ${dashboardMetrics.bestFocusWindow}, and your latest saved session scored ${latestSession.focusScore} on focus.`;
  }

  if (q.includes("calibrat")) {
    if (liveCalibration.active) {
      return `Live calibration is running now with ${liveCalibration.secondsRemaining}s remaining. Preview baseline is ${liveCalibration.baselinePreview ?? settings.baselineBlinkRate}/min.`;
    }

    return `Your current blink baseline is ${settings.baselineBlinkRate}/min. Tracking confidence is ${liveMetrics.measurementConfidence}, and the blink gate is ${liveMetrics.blinkGateOpen ? "open" : "paused"}. If the tracker feels off, run live calibration while sitting naturally in front of the camera.`;
  }

  return `Right now your focus is ${liveMetrics.focusScore}, fatigue is ${liveMetrics.fatigueScore}%, and attention is ${liveMetrics.attentionScore}. Best focus window from history is ${dashboardMetrics.bestFocusWindow}.`;
}
