import { formatDuration } from "../utils/analytics";

function CameraPanel({
  videoRef,
  canvasRef,
  liveMetrics,
  sessionActive,
  cameraReady,
  cameraError,
  isInitializing,
  modelLoadMessage,
  onRetryCamera,
  showMeshOverlay,
  onToggleMeshOverlay,
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
            onClick={() => onToggleMeshOverlay?.()}
            className="rounded-2xl border px-4 py-2 text-sm"
            style={{ borderColor: "var(--border-color)", color: "var(--text-secondary)" }}
            aria-label={showMeshOverlay ? "Hide face mesh overlay" : "Show face mesh overlay"}
          >
            {showMeshOverlay ? "Hide mesh" : "Show mesh"}
          </button>

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

      {(cameraError || modelLoadMessage || isInitializing) && (
        <div className="mx-5 mt-4 rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: "rgba(239,68,68,0.25)", background: cameraError ? "rgba(239,68,68,0.08)" : "var(--bg-panel-soft)", color: cameraError ? "#fca5a5" : "var(--text-secondary)" }}>
          {cameraError || modelLoadMessage || "Starting camera..."}
          {cameraError && (
            <button
              type="button"
              onClick={onRetryCamera}
              className="ml-3 rounded-lg border px-3 py-1 text-xs font-medium"
              style={{ borderColor: "var(--border-color)", color: "var(--text-primary)" }}
            >
              Retry camera
            </button>
          )}
        </div>
      )}

      <div className="grid gap-5 p-5 xl:grid-cols-[minmax(0,1fr)_320px] lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="relative overflow-hidden rounded-[28px] border" style={{ borderColor: "var(--border-color)", background: "var(--bg-app)" }}>
          <div className="relative">
            <video ref={videoRef} className="w-full" playsInline muted />
            <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
          </div>

          {!cameraReady && !cameraError && !isInitializing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center" style={{ background: "var(--bg-app)" }}>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Camera unavailable</p>
              <button type="button" onClick={onRetryCamera} className="rounded-xl px-4 py-2 text-sm text-white" style={{ background: "var(--accent-from)" }}>
                Try again
              </button>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl border p-4" style={{ borderColor: "var(--border-color)", background: "var(--bg-panel)" }}>
            <p className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Instant metrics</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                { label: "Focus", value: liveMetrics.focusScore },
                { label: "Fatigue", value: `${liveMetrics.fatigueScore}%` },
                { label: "Attention", value: liveMetrics.attentionScore },
                { label: "Blink rate", value: `${liveMetrics.blinkRate}/m` },
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
