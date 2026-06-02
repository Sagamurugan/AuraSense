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
      <div className="flex flex-col gap-4 border-b px-5 py-5 lg:flex-row lg:items-center lg:justify-between" style={{ borderColor: "var(--border-color)" }}>
        <div>
          <p className="text-xs uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Camera Panel</p>
          <h2 className="mt-2 text-xl font-semibold" style={{ color: "var(--text-primary)" }}>Realtime Face Mesh monitoring</h2>
          <p className="mt-2 max-w-2xl text-sm" style={{ color: "var(--text-secondary)" }}>
            MediaPipe stays local while the interface surfaces the core session signals in
            a cleaner production-style workspace.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span
            className="rounded-full px-3 py-1 text-xs font-semibold"
            style={{
              background: liveMetrics.status === "Active" ? "rgba(52,211,153,0.15)" : "var(--bg-panel)",
              color: liveMetrics.status === "Active" ? "#34d399" : "var(--text-secondary)",
              border: liveMetrics.status === "Active" ? "1px solid rgba(52,211,153,0.25)" : "1px solid var(--border-color)",
            }}
          >
            {liveMetrics.status}
          </span>

          <button
            type="button"
            onClick={sessionActive ? onStopSession : onStartSession}
            disabled={!cameraReady || isInitializing}
            className="rounded-2xl border px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              borderColor: "var(--border-color)",
              background: "var(--bg-panel)",
              color: "var(--text-primary)",
            }}
            aria-label={sessionActive ? "End current monitoring session" : "Start monitoring session"}
          >
            {sessionActive ? "End current session" : "Start monitoring"}
          </button>
        </div>
      </div>

      <div className="grid gap-5 p-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="relative overflow-hidden rounded-[28px] border" style={{ borderColor: "var(--border-color)", background: "var(--bg-app)" }}>
          <div className="relative">
            <video ref={videoRef} className="w-full" playsInline muted />
            <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
          </div>

          {!cameraReady && !cameraError && !isInitializing && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: "var(--bg-app)" }}>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Camera not started</p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl border p-4" style={{ borderColor: "var(--border-color)", background: "var(--bg-panel)" }}>
            <p className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Instant metrics</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                { label: "Focus", value: liveMetrics.focusScore, tone: "sky" },
                { label: "Fatigue", value: `${liveMetrics.fatigueScore}%`, tone: liveMetrics.fatigueScore >= 55 ? "orange" : "emerald" },
                { label: "Attention", value: liveMetrics.attentionScore, tone: "violet" },
                { label: "Blink rate", value: `${liveMetrics.blinkRate}/m`, tone: "slate" },
              ].map((m) => (
                <div key={m.label} className="rounded-xl border p-3" style={{ borderColor: "var(--border-color)", background: "var(--bg-panel-soft)" }}>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{m.label}</p>
                  <p className="mt-1 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>{m.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border p-4" style={{ borderColor: "var(--border-color)", background: "var(--bg-panel)" }}>
            <p className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Session</p>
            <p className="mt-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>{formatDuration(liveMetrics.durationSeconds)}</p>
            <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
              {liveMetrics.faceDetected ? "Face detected" : "No face detected"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CameraPanel;
