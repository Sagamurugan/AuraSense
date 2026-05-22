import { formatDuration } from "../utils/analytics";

function CameraPanel({
  videoRef,
  canvasRef,
  liveMetrics,
  sessionActive,
  cameraReady,
  cameraError,
  isInitializing,
  onStartSession,
  onStopSession,
}) {
  return (
    <section className="panel-card overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Camera Panel</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Realtime Face Mesh monitoring</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            MediaPipe stays local while the interface surfaces the core session signals in
            a cleaner production-style workspace.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              liveMetrics.status === "Active"
                ? "bg-emerald-400/15 text-emerald-300"
                : "bg-slate-700/60 text-slate-300"
            }`}
          >
            {liveMetrics.status}
          </span>

          <button
            type="button"
            onClick={sessionActive ? onStopSession : onStartSession}
            disabled={!cameraReady || isInitializing}
            className="rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={sessionActive ? "End current monitoring session" : "Start monitoring session"}
          >
            {sessionActive ? "End current session" : "Start monitoring"}
          </button>
        </div>
      </div>

      <div className="grid gap-5 p-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/80">
          {isInitializing && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/80">
              <div className="text-center">
                <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
                <p className="text-sm text-slate-400">Initializing camera...</p>
              </div>
            </div>
          )}

          {cameraError && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/80">
              <div className="text-center">
                <p className="mb-2 text-lg font-medium text-red-300">Camera Error</p>
                <p className="text-sm text-slate-400">{cameraError}</p>
              </div>
            </div>
          )}

          {!isInitializing && !cameraError && (
            <div className="absolute left-4 top-4 z-10 flex max-w-[calc(100%-2rem)] flex-wrap gap-2">
              <span className="rounded-full bg-slate-950/80 px-3 py-1 text-xs font-medium text-slate-100 backdrop-blur">
                Fatigue {liveMetrics.fatigueScore}%
              </span>
              <span className="rounded-full bg-slate-950/80 px-3 py-1 text-xs font-medium text-slate-100 backdrop-blur">
                Blinks {liveMetrics.blinkCount}
              </span>
              <span className="rounded-full bg-slate-950/80 px-3 py-1 text-xs font-medium text-slate-100 backdrop-blur">
                Session {formatDuration(liveMetrics.durationSeconds)}
              </span>
              <span className="rounded-full bg-slate-950/80 px-3 py-1 text-xs font-medium text-slate-100 backdrop-blur">
                Attention {liveMetrics.attentionScore}
              </span>
            </div>
          )}

          <video ref={videoRef} className="hidden" playsInline muted />
          <canvas
            ref={canvasRef}
            className="aspect-video w-full bg-slate-950 object-cover"
            aria-label="Live camera feed with face mesh overlay"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <p className="text-sm text-slate-400">Live Session Timer</p>
            <p className="mt-3 text-4xl font-semibold tracking-tight text-white">
              {formatDuration(liveMetrics.durationSeconds)}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <p className="text-sm text-slate-400">Face Detection</p>
            <p className="mt-3 text-lg font-semibold text-white">
              {liveMetrics.faceDetected ? "Locked in frame" : "Waiting for face"}
            </p>
            <p className="mt-2 text-sm text-slate-400">
              {liveMetrics.posture === "Aligned"
                ? "Posture looks stable."
                : liveMetrics.posture}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Away from frame: {liveMetrics.faceAwaySeconds}s
            </p>
          </div>

          <div className="rounded-3xl border border-sky-500/20 bg-gradient-to-br from-sky-500/10 to-indigo-500/10 p-5 sm:col-span-2 xl:col-span-1">
            <p className="text-sm text-sky-200">Focus Score</p>
            <p className="mt-2 text-5xl font-semibold tracking-tight text-white">
              {liveMetrics.focusScore}
            </p>
            <p className="mt-2 text-sm text-slate-300">
              Derived from live facial rhythm, attention continuity, and session stability.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CameraPanel;
