import { useMemo, useRef, useState } from "react";
import { createSessionRecord } from "../utils/sessionSchema";
import { createInitialStats, getSessionFocusScore } from "../utils/scoring";
import { createSessionReportInsights } from "../utils/analytics";

function useSessionAnalytics({ sessionHistory, setSessionHistory }) {
  const statsRef = useRef(createInitialStats());
  const sessionStartRef = useRef(null);
  const sessionActiveRef = useRef(false);

  const [sessionActive, setSessionActive] = useState(false);
  const [liveMetrics, setLiveMetrics] = useState({
    blinkCount: 0,
    fatigueScore: 0,
    focusScore: 82,
    blinkRate: 0,
    durationSeconds: 0,
    faceDetected: false,
    posture: "Aligned",
    postureScore: 100,
    faceAwaySeconds: 0,
    distractionLevel: "Low",
    distractionEvents: 0,
    attentionScore: 88,
    headMovementScore: 100,
    gazeDriftScore: 100,
    gazeDriftLevel: "Stable",
    gazeDriftEvents: 0,
    prolongedClosures: 0,
    eyeClosureRisk: "Low",
    yawnEvents: 0,
    mouthOpenRatio: 0,
    drowsinessRisk: "Low",
    drowsinessScore: 0,
    trackingQualityScore: 0,
    signalQuality: "Calibrating",
    rawEyeRatio: 0,
    smoothedEyeRatio: 0,
    openEyeRatioBaseline: 0,
    eyeClosureRatio: 1,
    blinkThresholdRatio: 0,
    blinkReopenRatio: 0,
    blinkDrop: 0,
    faceScale: 0,
    rawMouthRatio: 0,
    mouthOpenBaseline: 0,
    yawnThreshold: 0,
    lastClosureDurationMs: 0,
    blinkGateOpen: false,
    measurementConfidence: "Low",
    validationNotes: [],
    status: "Idle",
  });
  const [trendData, setTrendData] = useState({
    labels: [],
    fatigue: [],
    blinks: [],
  });
  const [sessionReport, setSessionReport] = useState(null);

  const enhancedHistory = useMemo(
    () =>
      sessionHistory.map((session) => ({
        ...session,
        focusScore: getSessionFocusScore(session),
      })),
    [sessionHistory]
  );

  const startSession = () => {
    sessionActiveRef.current = true;
    sessionStartRef.current = Date.now();
    statsRef.current = createInitialStats();
    setTrendData({ labels: [], fatigue: [], blinks: [] });
    setSessionActive(true);
    setLiveMetrics({
      blinkCount: 0,
      fatigueScore: 0,
      focusScore: 82,
      blinkRate: 0,
      durationSeconds: 0,
      faceDetected: false,
      posture: "Aligned",
      postureScore: 100,
      faceAwaySeconds: 0,
      distractionLevel: "Low",
      distractionEvents: 0,
      attentionScore: 88,
      headMovementScore: 100,
      gazeDriftScore: 100,
      gazeDriftLevel: "Stable",
      gazeDriftEvents: 0,
      prolongedClosures: 0,
      eyeClosureRisk: "Low",
      yawnEvents: 0,
      mouthOpenRatio: 0,
      drowsinessRisk: "Low",
      drowsinessScore: 0,
      trackingQualityScore: 0,
      signalQuality: "Calibrating",
      rawEyeRatio: 0,
      smoothedEyeRatio: 0,
      openEyeRatioBaseline: 0,
      eyeClosureRatio: 1,
      blinkThresholdRatio: 0,
      blinkReopenRatio: 0,
      blinkDrop: 0,
      faceScale: 0,
      rawMouthRatio: 0,
      mouthOpenBaseline: 0,
      yawnThreshold: 0,
      lastClosureDurationMs: 0,
      blinkGateOpen: false,
      measurementConfidence: "Low",
      validationNotes: [],
      status: "Idle",
    });
  };

  const stopSession = () => {
    if (!sessionStartRef.current) {
      return;
    }

    const duration = Math.max(0, Math.floor((Date.now() - sessionStartRef.current) / 1000));
    const completedSession = createSessionRecord({
      duration,
      blinks: statsRef.current.blinkCount,
      fatigue: statsRef.current.fatigueScore,
      focusScore: statsRef.current.focusScore,
      attentionScore: statsRef.current.attentionScore,
      postureScore: statsRef.current.postureScore,
      distractionEvents: statsRef.current.distractionEvents,
      faceAwaySeconds: statsRef.current.faceAwaySeconds,
      headMovementScore: statsRef.current.headMovementScore,
      gazeDriftScore: statsRef.current.gazeDriftScore,
      gazeDriftEvents: statsRef.current.gazeDriftEvents,
      prolongedClosures: statsRef.current.prolongedClosures,
      yawnEvents: statsRef.current.yawnEvents,
      drowsinessScore: statsRef.current.drowsinessScore,
    });

    setSessionHistory((current) => [completedSession, ...current].slice(0, 24));
    setSessionReport({
      session: completedSession,
      insights: createSessionReportInsights(completedSession),
    });
    sessionActiveRef.current = false;
    sessionStartRef.current = null;
    setSessionActive(false);
    setLiveMetrics((current) => ({
      ...current,
      durationSeconds: 0,
      status: "Idle",
    }));
  };

  const closeSessionReport = () => {
    setSessionReport(null);
  };

  const handleMetricsUpdate = (snapshot) => {
    setLiveMetrics({
      blinkCount: snapshot.blinkCount,
      fatigueScore: snapshot.fatigueScore,
      focusScore: snapshot.focusScore,
      blinkRate: snapshot.blinkRate,
      durationSeconds: snapshot.durationSeconds,
      faceDetected: snapshot.faceDetected,
      posture: snapshot.posture,
      postureScore: snapshot.postureScore,
      faceAwaySeconds: snapshot.faceAwaySeconds,
      distractionLevel: snapshot.distractionLevel,
      distractionEvents: snapshot.distractionEvents,
      attentionScore: snapshot.attentionScore,
      headMovementScore: snapshot.headMovementScore,
      gazeDriftScore: snapshot.gazeDriftScore,
      gazeDriftLevel: snapshot.gazeDriftLevel,
      gazeDriftEvents: snapshot.gazeDriftEvents,
      prolongedClosures: snapshot.prolongedClosures,
      eyeClosureRisk: snapshot.eyeClosureRisk,
      yawnEvents: snapshot.yawnEvents,
      mouthOpenRatio: snapshot.mouthOpenRatio,
      drowsinessRisk: snapshot.drowsinessRisk,
      drowsinessScore: snapshot.drowsinessScore,
      trackingQualityScore: snapshot.trackingQualityScore,
      signalQuality: snapshot.signalQuality,
      rawEyeRatio: snapshot.rawEyeRatio,
      smoothedEyeRatio: snapshot.smoothedEyeRatio,
      openEyeRatioBaseline: snapshot.openEyeRatioBaseline,
      eyeClosureRatio: snapshot.eyeClosureRatio,
      blinkThresholdRatio: snapshot.blinkThresholdRatio,
      blinkReopenRatio: snapshot.blinkReopenRatio,
      blinkDrop: snapshot.blinkDrop,
      faceScale: snapshot.faceScale,
      rawMouthRatio: snapshot.rawMouthRatio,
      mouthOpenBaseline: snapshot.mouthOpenBaseline,
      yawnThreshold: snapshot.yawnThreshold,
      lastClosureDurationMs: snapshot.lastClosureDurationMs,
      blinkGateOpen: snapshot.blinkGateOpen,
      measurementConfidence: snapshot.measurementConfidence,
      validationNotes: snapshot.validationNotes,
      status: snapshot.status,
    });
  };

  const handleTrendSample = (sample) => {
    setTrendData((current) => {
      const nextLabels = [...current.labels, sample.label];
      const nextFatigue = [...current.fatigue, sample.fatigue];
      const nextBlinks = [...current.blinks, sample.blinks];

      return {
        labels: nextLabels.slice(-18),
        fatigue: nextFatigue.slice(-18),
        blinks: nextBlinks.slice(-18),
      };
    });
  };

  return {
    enhancedHistory,
    liveMetrics,
    sessionActive,
    sessionActiveRef,
    sessionStartRef,
    startSession,
    stopSession,
    statsRef,
    trendData,
    sessionReport,
    closeSessionReport,
    handleMetricsUpdate,
    handleTrendSample,
  };
}

export default useSessionAnalytics;
