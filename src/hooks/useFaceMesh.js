import { useCallback, useEffect, useRef, useState } from "react";
import { analyzeLandmarks, applyNoFaceState } from "../utils/scoring";

function useFaceMesh({
  sessionActiveRef,
  sessionStartRef,
  statsRef,
  settings,
  onMetricsUpdate,
  onTrendSample,
  enabled = true,
  showMeshOverlay = true,
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const faceMeshRef = useRef(null);
  const animationFrameRef = useRef(0);
  const mountedRef = useRef(false);
  const metricsCallbackRef = useRef(onMetricsUpdate);
  const trendCallbackRef = useRef(onTrendSample);
  const settingsRef = useRef(settings);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [modelLoadMessage, setModelLoadMessage] = useState("");
  const [retryToken, setRetryToken] = useState(0);
  const showMeshRef = useRef(showMeshOverlay);

  const retryCamera = useCallback(() => {
    setCameraError(null);
    setCameraReady(false);
    setIsInitializing(true);
    setRetryToken((value) => value + 1);
  }, []);

  const emitLiveMetrics = useCallback((durationSeconds, snapshot) => {
    const liveMetrics = {
      blinkCount: snapshot.blinkCount,
      fatigueScore: snapshot.fatigueScore,
      focusScore: snapshot.focusScore,
      blinkRate: snapshot.blinkRate,
      durationSeconds,
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
      status: sessionActiveRef.current && snapshot.faceDetected ? "Active" : "Idle",
    };
    metricsCallbackRef.current?.(liveMetrics);
  }, [sessionActiveRef]);

  useEffect(() => {
    metricsCallbackRef.current = onMetricsUpdate;
  }, [onMetricsUpdate]);

  useEffect(() => {
    trendCallbackRef.current = onTrendSample;
  }, [onTrendSample]);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    showMeshRef.current = showMeshOverlay;
  }, [showMeshOverlay]);

  const drawLandmarks = (context, canvas, landmarks) => {
    context.fillStyle = "rgba(148, 163, 184, 0.55)";
    for (let index = 0; index < landmarks.length; index += 6) {
      const point = landmarks[index];
      context.beginPath();
      context.arc(point.x * canvas.width, point.y * canvas.height, 1.6, 0, 2 * Math.PI);
      context.fill();
    }
  };

  const drawOverlay = (context, sessionActive, stats) => {
    context.fillStyle = "rgba(15, 23, 42, 0.78)";
    context.fillRect(16, 16, 210, 92);
    context.font = "600 18px Inter, system-ui, sans-serif";
    context.fillStyle = "#f8fafc";
    context.fillText(`Fatigue ${stats.fatigueScore}%`, 28, 44);
    context.fillText(`Blinks ${stats.blinkCount}`, 28, 70);
    context.fillStyle = sessionActive ? "#22c55e" : "#f97316";
    context.fillText(sessionActive ? "Status Active" : "Status Idle", 28, 96);
  };

  const drawNoFaceOverlay = (context) => {
    context.fillStyle = "rgba(15, 23, 42, 0.75)";
    context.fillRect(16, 16, 250, 56);
    context.font = "600 18px Inter, system-ui, sans-serif";
    context.fillStyle = "#f8fafc";
    context.fillText("Position your face in frame", 28, 50);
  };

  useEffect(() => {
    if (!enabled) {
      const timeoutId = window.setTimeout(() => {
        setCameraReady(false);
        setCameraError(null);
        setIsInitializing(false);
      }, 0);

      return () => {
        window.clearTimeout(timeoutId);
      };
    }

    if (enabled) {
      const timeoutId = window.setTimeout(() => {
        setIsInitializing(true);
      }, 0);

      return () => {
        window.clearTimeout(timeoutId);
      };
    }

    return undefined;
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    let cancelled = false;
    const videoEl = videoRef.current;
    const canvasEl = canvasRef.current;

    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }

        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = resolve;
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.body.appendChild(script);
      });

    const handleCameraError = (error) => {
      if (error.name === "NotAllowedError") {
        setCameraError("Camera access denied. Please allow camera permissions and reload.");
      } else if (error.name === "NotFoundError") {
        setCameraError("No camera found. Please connect a camera and reload.");
      } else if (error.name === "NotReadableError") {
        setCameraError("Camera is in use by another app. Close other apps using the camera.");
      } else {
        setCameraError(`Camera error: ${error.message || "Unknown error"}`);
      }
      setIsInitializing(false);
    };

    const init = async () => {
      try {
        setModelLoadMessage("Downloading face model...");
        await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js");
        setModelLoadMessage("Initializing camera...");

        if (cancelled || !videoEl || !canvasEl) {
          return;
        }

        const video = videoEl;
        const canvas = canvasEl;
        const context = canvas.getContext("2d", { willReadFrequently: false });

        let stream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: "user",
            },
            audio: false,
          });
        } catch (err) {
          handleCameraError(err);
          return;
        }

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        video.srcObject = stream;
        await video.play();

        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;

        const faceMesh = new window.FaceMesh({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        });

        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        faceMesh.onResults((results) => {
          if (cancelled || !mountedRef.current) {
            return;
          }

          context.clearRect(0, 0, canvas.width, canvas.height);

          try {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
          } catch {
            return;
          }

          const now = Date.now();
          const durationSeconds = sessionStartRef.current
            ? Math.floor((now - sessionStartRef.current) / 1000)
            : 0;
          const landmarks = results.multiFaceLandmarks?.[0];

          if (landmarks) {
            analyzeLandmarks({
              landmarks,
              sessionActive: sessionActiveRef.current,
              stats: statsRef.current,
              durationSeconds,
              settings: settingsRef.current,
              now,
            });

            if (showMeshRef.current) {
              drawLandmarks(context, canvas, landmarks);
            }
            drawOverlay(context, sessionActiveRef.current, statsRef.current);

            if (sessionActiveRef.current && now - statsRef.current.lastSampleAt >= 5000) {
              statsRef.current.lastSampleAt = now;
              trendCallbackRef.current?.({
                label: `${Math.max(1, Math.round(durationSeconds / 60))}m`,
                fatigue: statsRef.current.fatigueScore,
                blinks: statsRef.current.blinkCount,
              });
            }
          } else {
            applyNoFaceState(
              statsRef.current,
              durationSeconds,
              sessionActiveRef.current,
              now
            );
            drawNoFaceOverlay(context);
          }

          if (now - statsRef.current.lastUiUpdateAt >= 250) {
            statsRef.current.lastUiUpdateAt = now;
            emitLiveMetrics(durationSeconds, statsRef.current);
          }
        });

        faceMeshRef.current = faceMesh;
        setCameraReady(true);
        setIsInitializing(false);
        setModelLoadMessage("");

        const loop = async () => {
          if (cancelled || !mountedRef.current || !faceMeshRef.current) {
            return;
          }

          try {
            await faceMeshRef.current.send({ image: video });
          } catch {
            return;
          }
          animationFrameRef.current = window.requestAnimationFrame(loop);
        };

        loop();
      } catch (error) {
        console.error("AuraSense camera initialization failed", error);
        setCameraError("Failed to initialize FaceMesh. Please reload the page.");
        setIsInitializing(false);
      }
    };

    mountedRef.current = true;
    init();

    return () => {
      cancelled = true;
      mountedRef.current = false;

      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = 0;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      if (videoEl) {
        videoEl.srcObject = null;
        videoEl.load();
      }
    };
  }, [enabled, retryToken, sessionActiveRef, sessionStartRef, statsRef, emitLiveMetrics]);

  return {
    cameraReady,
    cameraError,
    isInitializing,
    modelLoadMessage,
    retryCamera,
    videoRef,
    canvasRef,
  };
}

export default useFaceMesh;
