export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function createInitialStats() {
  return {
    blinkCount: 0,
    eyeClosedFrames: 0,
    blinkCooldownFrames: 0,
    prolongedClosures: 0,
    lastClosureStartedAt: null,
    smoothedEyeRatio: null,
    openEyeRatioBaseline: null,
    blinkThresholdRatio: null,
    blinkReopenRatio: null,
    eyeClosureRatio: 1,
    isEyeClosed: false,
    faceScale: 0,
    previousSmoothedEyeRatio: null,
    rollingOpenEyeRatios: [],
    rollingMouthRatios: [],
    mouthOpenBaseline: null,
    yawnStartedAt: null,
    yawnEvents: 0,
    mouthOpenRatio: 0,
    rawEyeRatio: 0,
    rawMouthRatio: 0,
    blinkDrop: 0,
    lastClosureDurationMs: 0,
    lastBlinkAt: null,
    blinkGateOpen: false,
    measurementConfidence: "Low",
    validationNotes: [],
    yawnThreshold: 0,
    trackingQualityScore: 0,
    signalQuality: "Calibrating",
    fatigueScore: 0,
    faceDetected: false,
    posture: "Aligned",
    postureScore: 100,
    focusScore: 82,
    blinkRate: 0,
    durationSeconds: 0,
    faceAwaySeconds: 0,
    faceAwayStartAt: null,
    distractionEvents: 0,
    distractionLevel: "Low",
    attentionScore: 88,
    headMovementScore: 100,
    gazeDriftScore: 100,
    gazeDriftLevel: "Stable",
    eyeClosureRisk: "Low",
    drowsinessRisk: "Low",
    drowsinessScore: 0,
    gazeDriftEvents: 0,
    headMovementEvents: 0,
    previousNoseX: null,
    previousNoseY: null,
    lastSampleAt: 0,
    lastUiUpdateAt: 0,
    sampleCursor: 0,
  };
}

function pointDistance(first, second) {
  return Math.hypot((first.x ?? 0) - (second.x ?? 0), (first.y ?? 0) - (second.y ?? 0));
}

function eyeAspectRatio(landmarks, points) {
  const topPrimary = landmarks[points.topPrimary];
  const bottomPrimary = landmarks[points.bottomPrimary];
  const topSecondary = landmarks[points.topSecondary];
  const bottomSecondary = landmarks[points.bottomSecondary];
  const leftCorner = landmarks[points.leftCorner];
  const rightCorner = landmarks[points.rightCorner];

  const verticalPrimary = pointDistance(topPrimary, bottomPrimary);
  const verticalSecondary = pointDistance(topSecondary, bottomSecondary);
  const horizontal = Math.max(pointDistance(leftCorner, rightCorner), 0.0001);

  return (verticalPrimary + verticalSecondary) / (2 * horizontal);
}

function mouthAspectRatio(landmarks) {
  const upperLip = landmarks[13];
  const lowerLip = landmarks[14];
  const leftCorner = landmarks[78];
  const rightCorner = landmarks[308];
  const topInner = landmarks[82];
  const bottomInner = landmarks[87];

  const verticalPrimary = pointDistance(upperLip, lowerLip);
  const verticalSecondary = pointDistance(topInner, bottomInner);
  const horizontal = Math.max(pointDistance(leftCorner, rightCorner), 0.0001);

  return (verticalPrimary + verticalSecondary) / (2 * horizontal);
}

function resolveBlinkThreshold(faceScale) {
  if (faceScale < 0.12) {
    return 0.93;
  }

  if (faceScale < 0.18) {
    return 0.89;
  }

  if (faceScale < 0.24) {
    return 0.83;
  }

  return 0.79;
}

function resolveBlinkReopenThreshold(faceScale) {
  if (faceScale < 0.12) {
    return 0.985;
  }

  if (faceScale < 0.18) {
    return 0.94;
  }

  if (faceScale < 0.24) {
    return 0.92;
  }

  return 0.9;
}

function getRollingOpenBaseline(stats, fallback) {
  if (!stats.rollingOpenEyeRatios.length) {
    return fallback;
  }

  const sorted = [...stats.rollingOpenEyeRatios].sort((left, right) => left - right);
  const percentileIndex = Math.max(0, Math.floor(sorted.length * 0.7) - 1);
  return sorted[percentileIndex] ?? fallback;
}

export function getSessionFocusScore(session) {
  if (typeof session.focusScore === "number") {
    return session.focusScore;
  }

  const durationMinutes = Math.max((session.duration ?? 0) / 60, 0.2);
  const blinkRate = Math.round((session.blinks ?? 0) / durationMinutes);
  const blinkScore = clamp(100 - Math.abs(blinkRate - 16) * 5, 20, 100);
  const durationScore =
    durationMinutes <= 15 ? 100 : clamp(100 - (durationMinutes - 15) * 3, 35, 100);

  return Math.round(clamp(blinkScore * 0.65 + durationScore * 0.35, 0, 100));
}

function resolveSensitivityMultiplier(settings) {
  const sensitivity = settings?.alertSensitivity ?? "balanced";

  if (sensitivity === "strict") {
    return 1.12;
  }

  if (sensitivity === "relaxed") {
    return 0.92;
  }

  return 1;
}

function getReliabilityCap(stats) {
  if (stats.measurementConfidence === "High") {
    return 100;
  }

  if (stats.measurementConfidence === "Medium") {
    return 78;
  }

  return 52;
}

export function analyzeLandmarks({
  landmarks,
  sessionActive,
  stats,
  durationSeconds,
  settings,
  now,
}) {
  const leftEyeRatio = eyeAspectRatio(landmarks, {
    topPrimary: 159,
    bottomPrimary: 145,
    topSecondary: 158,
    bottomSecondary: 153,
    leftCorner: 33,
    rightCorner: 133,
  });
  const rightEyeRatio = eyeAspectRatio(landmarks, {
    topPrimary: 386,
    bottomPrimary: 374,
    topSecondary: 387,
    bottomSecondary: 373,
    leftCorner: 362,
    rightCorner: 263,
  });
  const rawEyeRatio = (leftEyeRatio + rightEyeRatio) / 2;
  const rawMouthRatio = mouthAspectRatio(landmarks);
  const baselineBlinkRate = settings?.baselineBlinkRate ?? 16;
  const sessionGoalMinutes = settings?.sessionGoalMinutes ?? 25;
  const breakReminderMinutes = settings?.breakReminderMinutes ?? 20;
  const sensitivityMultiplier = resolveSensitivityMultiplier(settings);
  const smoothingFactor = 0.35;
  const smoothedEyeRatio =
    stats.smoothedEyeRatio == null
      ? rawEyeRatio
      : stats.smoothedEyeRatio * (1 - smoothingFactor) + rawEyeRatio * smoothingFactor;
  const previousSmoothedEyeRatio = stats.previousSmoothedEyeRatio ?? smoothedEyeRatio;

  stats.smoothedEyeRatio = smoothedEyeRatio;
  stats.previousSmoothedEyeRatio = smoothedEyeRatio;

  if (stats.openEyeRatioBaseline == null) {
    stats.openEyeRatioBaseline = smoothedEyeRatio;
  }
  if (stats.mouthOpenBaseline == null) {
    stats.mouthOpenBaseline = rawMouthRatio;
  }

  const faceScale = pointDistance(landmarks[234], landmarks[454]);
  stats.faceScale = faceScale;
  const faceScaleScore = clamp(((faceScale - 0.08) / 0.18) * 100, 0, 100);

  if (
    smoothedEyeRatio > stats.openEyeRatioBaseline * 0.9 &&
    faceScale > 0.08 &&
    stats.headMovementEvents < 999999
  ) {
    const nextRollingRatios = [...stats.rollingOpenEyeRatios, smoothedEyeRatio].slice(-48);
    stats.rollingOpenEyeRatios = nextRollingRatios;
    const rollingBaseline = getRollingOpenBaseline(stats, stats.openEyeRatioBaseline);
    stats.openEyeRatioBaseline = stats.openEyeRatioBaseline * 0.88 + rollingBaseline * 0.12;
  }

  if (rawMouthRatio < (stats.mouthOpenBaseline ?? rawMouthRatio) * 1.18) {
    const nextRollingMouthRatios = [...stats.rollingMouthRatios, rawMouthRatio].slice(-40);
    stats.rollingMouthRatios = nextRollingMouthRatios;
    const avgMouthBaseline =
      nextRollingMouthRatios.reduce((sum, value) => sum + value, 0) /
      Math.max(nextRollingMouthRatios.length, 1);
    stats.mouthOpenBaseline =
      (stats.mouthOpenBaseline ?? avgMouthBaseline) * 0.9 + avgMouthBaseline * 0.1;
  }

  const eyeClosureRatio = clamp(
    smoothedEyeRatio / Math.max(stats.openEyeRatioBaseline, 0.0001),
    0,
    1.4
  );
  const dynamicBlinkThreshold = resolveBlinkThreshold(faceScale);
  const dynamicBlinkReopenThreshold = resolveBlinkReopenThreshold(faceScale);
  const blinkDrop = previousSmoothedEyeRatio - smoothedEyeRatio;
  const dropThreshold = faceScale < 0.12 ? 0.003 : faceScale < 0.18 ? 0.005 : 0.007;
  const yawnThreshold = faceScale < 0.12 ? 1.85 : 1.65;

  stats.rawEyeRatio = rawEyeRatio;
  stats.rawMouthRatio = rawMouthRatio;
  stats.eyeClosureRatio = eyeClosureRatio;
  stats.blinkThresholdRatio = dynamicBlinkThreshold;
  stats.blinkReopenRatio = dynamicBlinkReopenThreshold;
  stats.blinkDrop = blinkDrop;
  stats.yawnThreshold = yawnThreshold;
  stats.trackingQualityScore = Math.round(
    clamp(
      faceScaleScore * 0.65 +
        clamp(100 - Math.abs(smoothedEyeRatio - stats.openEyeRatioBaseline) * 900, 0, 100) * 0.35,
      0,
      100
    )
  );
  stats.signalQuality =
    stats.trackingQualityScore < 35
      ? "Low quality"
      : faceScale < 0.1
      ? "Far face"
      : Math.abs(smoothedEyeRatio - stats.openEyeRatioBaseline) < 0.035
        ? "Stable"
        : "Adaptive";
  stats.measurementConfidence =
    stats.trackingQualityScore >= 72 && faceScale >= 0.12
      ? "High"
      : stats.trackingQualityScore >= 45 && faceScale >= 0.095
        ? "Medium"
        : "Low";

  const shouldCloseEyes =
    eyeClosureRatio < dynamicBlinkThreshold &&
    (blinkDrop > dropThreshold || eyeClosureRatio < dynamicBlinkThreshold - 0.035);
  const shouldOpenEyes = eyeClosureRatio > dynamicBlinkReopenThreshold;
  stats.blinkGateOpen =
    sessionActive && stats.trackingQualityScore >= 28 && faceScale >= 0.085;

  if (!stats.isEyeClosed && shouldCloseEyes) {
    stats.isEyeClosed = true;
  } else if (stats.isEyeClosed && shouldOpenEyes) {
    stats.isEyeClosed = false;
  }

  if (stats.isEyeClosed) {
    stats.eyeClosedFrames += 1;
    if (!stats.lastClosureStartedAt && sessionActive) {
      stats.lastClosureStartedAt = now;
    }
  } else {
    if (stats.lastClosureStartedAt && sessionActive) {
      const closureDurationMs = now - stats.lastClosureStartedAt;
      if (
        closureDurationMs >= 45 &&
        closureDurationMs <= 520 &&
        stats.blinkGateOpen &&
        stats.blinkCooldownFrames === 0
      ) {
        stats.blinkCount += 1;
        stats.blinkCooldownFrames = 6;
        stats.lastBlinkAt = now;
      } else if (closureDurationMs >= 750) {
        stats.prolongedClosures += 1;
      }
      stats.lastClosureDurationMs = closureDurationMs;
      stats.lastClosureStartedAt = null;
    }
    stats.eyeClosedFrames = 0;
  }

  if (stats.blinkCooldownFrames > 0) {
    stats.blinkCooldownFrames -= 1;
  }

  const durationMinutes = Math.max(durationSeconds / 60, 0.2);
  const blinkRate = sessionActive ? Math.round(stats.blinkCount / durationMinutes) : 0;
  const blinkDeviation = Math.abs(blinkRate - baselineBlinkRate);
  const blinkScore = clamp(100 - blinkDeviation * 5.5 * sensitivityMultiplier, 20, 100);
  const durationScore =
    durationMinutes <= sessionGoalMinutes
      ? 100
      : clamp(
          100 - (durationMinutes - sessionGoalMinutes) * 3.5 * sensitivityMultiplier,
          32,
          100
        );

  stats.blinkRate = blinkRate;

  const nose = landmarks[1];
  const leftIris = landmarks[468] ?? landmarks[473] ?? landmarks[159];
  const rightIris = landmarks[473] ?? landmarks[468] ?? landmarks[386];
  const irisCenterX = (leftIris.x + rightIris.x) / 2;
  const eyeTilt = Math.abs(landmarks[33].y - landmarks[263].y);
  const faceOffset = Math.abs(nose.x - 0.5);
  const offCenter = faceOffset > 0.12;
  const centerPenalty = clamp((faceOffset / 0.18) * 55, 0, 55);
  const tiltPenalty = clamp((eyeTilt / 0.05) * 45, 0, 45);
  const postureScore = Math.round(clamp(100 - centerPenalty - tiltPenalty, 18, 100));
  const gazeOffset = Math.abs(irisCenterX - 0.5);
  const gazeDriftScore = Math.round(clamp(100 - (gazeOffset / 0.16) * 100, 0, 100));
  const gazeDriftLevel =
    gazeOffset > 0.11 ? "High" : gazeOffset > 0.06 ? "Moderate" : "Stable";
  const validationNotes = [];
  if (faceScale < 0.095) {
    validationNotes.push("Move slightly closer to the camera.");
  }
  if (stats.trackingQualityScore < 35) {
    validationNotes.push("Tracking quality is low. Improve lighting and keep your face centered.");
  }
  if (Math.abs(smoothedEyeRatio - stats.openEyeRatioBaseline) > 0.05) {
    validationNotes.push("Blink baseline is still adapting to your current position.");
  }
  if (gazeDriftScore < 65) {
    validationNotes.push("Gaze drift is high, so attention-related metrics are less stable.");
  }
  stats.validationNotes = validationNotes;

  if (sessionActive && gazeOffset > 0.11) {
    stats.gazeDriftEvents += 1;
  }

  const previousNoseX = stats.previousNoseX ?? nose.x;
  const previousNoseY = stats.previousNoseY ?? nose.y;
  const headMovementDelta = Math.hypot(nose.x - previousNoseX, nose.y - previousNoseY);
  const headMovementScore = Math.round(
    clamp(100 - (headMovementDelta / 0.08) * 100, 0, 100)
  );

  if (sessionActive && headMovementDelta > 0.03) {
    stats.headMovementEvents += 1;
  }

  stats.previousNoseX = nose.x;
  stats.previousNoseY = nose.y;

  if (sessionActive && stats.faceAwayStartAt) {
    const awayDurationSeconds = Math.max(0, Math.floor((now - stats.faceAwayStartAt) / 1000));
    if (awayDurationSeconds >= 2) {
      stats.distractionEvents += 1;
    }
    stats.faceAwayStartAt = null;
  }

  stats.postureScore = postureScore;
  stats.posture =
    postureScore >= 80 ? "Aligned" : postureScore >= 55 ? "Adjust posture" : "Needs attention";
  stats.faceDetected = true;
  stats.durationSeconds = durationSeconds;
  stats.faceAwaySeconds = Math.max(0, Math.floor(stats.faceAwaySeconds));
  stats.headMovementScore = headMovementScore;
  stats.gazeDriftScore = gazeDriftScore;
  stats.gazeDriftLevel = gazeDriftLevel;
  stats.eyeClosureRisk =
    stats.prolongedClosures >= 2 ? "High" : stats.prolongedClosures >= 1 ? "Moderate" : "Low";
  const mouthOpenRatio = clamp(
    rawMouthRatio / Math.max(stats.mouthOpenBaseline ?? rawMouthRatio, 0.0001),
    0,
    4
  );
  stats.mouthOpenRatio = mouthOpenRatio;
  if (mouthOpenRatio > yawnThreshold && sessionActive) {
    if (!stats.yawnStartedAt) {
      stats.yawnStartedAt = now;
    }
  } else if (stats.yawnStartedAt) {
    const yawnDurationMs = now - stats.yawnStartedAt;
    if (yawnDurationMs >= 1200) {
      stats.yawnEvents += 1;
    }
    stats.yawnStartedAt = null;
  }

  const extendedWorkPenalty = Math.max(0, durationMinutes - breakReminderMinutes) * 2.4;
  const qualityPenalty = (100 - stats.trackingQualityScore) * 0.42;
  const reliabilityCap = getReliabilityCap(stats);
  const fatigueScore =
    blinkDeviation * 4.2 * sensitivityMultiplier +
    extendedWorkPenalty +
    stats.faceAwaySeconds * 0.35 +
    (100 - postureScore) * 0.18 +
    (100 - gazeDriftScore) * 0.15 +
    (100 - headMovementScore) * 0.12 +
    stats.prolongedClosures * 9 +
    stats.yawnEvents * 7 +
    qualityPenalty * 0.2;
  const focusScore =
    blinkScore * 0.45 +
    durationScore * 0.2 +
    postureScore * 0.2 +
    clamp(
      100 -
        stats.faceAwaySeconds * 2.5 -
        stats.distractionEvents * 8 -
        (100 - gazeDriftScore) * 0.3 -
        (100 - headMovementScore) * 0.2 -
        qualityPenalty,
      10,
      100
    ) *
      0.15;

  stats.fatigueScore = Math.round(clamp(fatigueScore, 0, 100));
  stats.focusScore = Math.round(clamp(focusScore, 0, reliabilityCap));
  stats.attentionScore = Math.round(
    clamp(
      100 -
        stats.faceAwaySeconds * 2.2 -
        stats.distractionEvents * 10 -
        (100 - postureScore) * 0.22 -
        (100 - gazeDriftScore) * 0.24 -
        (100 - headMovementScore) * 0.18 -
        qualityPenalty * 1.05,
      0,
      reliabilityCap
    )
  );
  stats.drowsinessScore = Math.round(
    clamp(
      stats.prolongedClosures * 28 +
        stats.yawnEvents * 22 +
        Math.max(0, stats.fatigueScore - 35) * 0.7 +
        (100 - headMovementScore) * 0.12,
      0,
      100
    )
  );
  stats.drowsinessRisk =
    stats.drowsinessScore >= 70
      ? "High"
      : stats.drowsinessScore >= 40
        ? "Moderate"
        : "Low";
  stats.distractionLevel =
    stats.faceAwaySeconds >= 6 ||
    stats.distractionEvents >= 3 ||
    gazeDriftLevel === "High"
      ? "High"
      : stats.faceAwaySeconds >= 3 || offCenter || gazeDriftLevel === "Moderate"
        ? "Moderate"
        : "Low";

  return stats;
}

export function applyNoFaceState(stats, durationSeconds, sessionActive, now) {
  stats.faceDetected = false;
  stats.blinkRate = 0;
  stats.posture = "Face not detected";
  stats.postureScore = 0;
  stats.gazeDriftScore = 0;
  stats.gazeDriftLevel = "High";
  stats.headMovementScore = 0;
  stats.durationSeconds = durationSeconds;
  stats.rawEyeRatio = 0;
  stats.rawMouthRatio = 0;
  stats.blinkDrop = 0;
  stats.blinkGateOpen = false;
  stats.measurementConfidence = "Low";
  stats.validationNotes = ["Face not detected. Re-center yourself in the frame."];

  if (sessionActive) {
    if (!stats.faceAwayStartAt) {
      stats.faceAwayStartAt = now;
    }

    stats.faceAwaySeconds = Math.floor(
      Math.max(0, stats.faceAwaySeconds + (now - stats.faceAwayStartAt) / 1000)
    );
    stats.faceAwayStartAt = now;
  }

  const noFacePenalty = Math.max(1, stats.faceAwaySeconds);
  stats.distractionLevel =
    stats.faceAwaySeconds >= 2 ? "High" : stats.faceAwaySeconds >= 1 ? "Moderate" : "Low";
  stats.focusScore = Math.round(
    clamp(14 - noFacePenalty * 8 - stats.distractionEvents * 10, 0, 14)
  );
  stats.attentionScore = Math.round(
    clamp(10 - noFacePenalty * 7 - stats.distractionEvents * 12, 0, 10)
  );
  stats.fatigueScore = Math.round(
    clamp(
      Math.max(stats.fatigueScore, 18) +
        stats.faceAwaySeconds * 1.6 +
        stats.distractionEvents * 4,
      0,
      100
    )
  );
  stats.eyeClosureRisk =
    stats.prolongedClosures >= 2 ? "High" : stats.prolongedClosures >= 1 ? "Moderate" : "Low";
  stats.drowsinessScore = Math.round(
    clamp(stats.prolongedClosures * 25 + stats.faceAwaySeconds * 2, 0, 100)
  );
  stats.drowsinessRisk =
    stats.prolongedClosures >= 2 ? "High" : stats.prolongedClosures >= 1 ? "Moderate" : "Low";
  stats.trackingQualityScore = 0;
  stats.signalQuality = "Searching";
}
