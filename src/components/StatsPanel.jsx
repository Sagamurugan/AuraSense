function MetricCard({ label, value, helper, tone = "slate" }) {
  const toneStyles = {
    sky: { border: "rgba(56,189,248,0.25)", bg: "rgba(56,189,248,0.1)", text: "#7dd3fc" },
    emerald: { border: "rgba(52,211,153,0.25)", bg: "rgba(52,211,153,0.1)", text: "#34d399" },
    orange: { border: "rgba(251,146,60,0.25)", bg: "rgba(251,146,60,0.1)", text: "#fb923c" },
    slate: { border: "var(--border-color)", bg: "var(--bg-panel)", text: "var(--text-primary)" },
  };
  const t = toneStyles[tone] || toneStyles.slate;

  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: t.border, background: t.bg }}>
      <p className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{label}</p>
      <p className="mt-3 text-2xl font-semibold" style={{ color: t.text }}>{value}</p>
      {helper ? <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>{helper}</p> : null}
    </div>
  );
}

function SignalItem({ label, value, helper }) {
  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: "var(--border-color)", background: "var(--bg-panel)" }}>
      <p className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{label}</p>
      <p className="mt-2 text-xl font-semibold" style={{ color: "var(--text-primary)" }}>{value}</p>
      <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>{helper}</p>
    </div>
  );
}

function ConfidenceBadge({ liveMetrics }) {
  const toneMap = {
    High: { bg: "rgba(52,211,153,0.12)", text: "#34d399", border: "rgba(52,211,153,0.25)" },
    Medium: { bg: "rgba(251,146,60,0.12)", text: "#fb923c", border: "rgba(251,146,60,0.25)" },
    Low: { bg: "rgba(239,68,68,0.12)", text: "#f87171", border: "rgba(239,68,68,0.25)" },
  };
  const t = toneMap[liveMetrics.measurementConfidence] || toneMap.Low;

  return (
    <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold" style={{ background: t.bg, borderColor: t.border, color: t.text }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: t.text }} />
      {liveMetrics.measurementConfidence}
    </span>
  );
}

function ProgressBar({ value, label }) {
  const getColor = (v) => {
    if (v >= 70) return "#22c55e";
    if (v >= 45) return "#f97316";
    return "#ef4444";
  };
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 text-xs" style={{ color: "var(--text-secondary)" }}>{label}</span>
      <div className="flex-1 rounded-full h-2" style={{ background: "var(--bg-elevated)" }}>
        <div className="h-2 rounded-full transition-all" style={{ width: `${Math.min(value, 100)}%`, background: getColor(value) }} />
      </div>
      <span className="w-8 text-right text-xs font-medium" style={{ color: "var(--text-primary)" }}>{value}</span>
    </div>
  );
}

function StatsPanel({ liveMetrics, compact }) {
  const items = [
    { label: "Focus Score", value: liveMetrics.focusScore, tone: "sky" },
    { label: "Fatigue Score", value: `${liveMetrics.fatigueScore}%`, tone: liveMetrics.fatigueScore >= 55 ? "orange" : "emerald" },
    { label: "Attention", value: liveMetrics.attentionScore, tone: "violet" },
    { label: "Blinks", value: liveMetrics.blinkCount, tone: "slate" },
  ];

  return (
    <section className="panel-card overflow-hidden">
      <div className="border-b px-5 py-4" style={{ borderColor: "var(--border-color)" }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Primary signals</p>
            <h2 className="mt-1 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Live session telemetry</h2>
          </div>
          <ConfidenceBadge liveMetrics={liveMetrics} />
        </div>
      </div>

      <div className="p-5">
        {compact ? (
          <div className="grid grid-cols-2 gap-3">
            {items.slice(0, 4).map((item) => (
              <MetricCard key={item.label} label={item.label} value={item.value} tone={item.tone} />
            ))}
            <div className="col-span-2 space-y-3 mt-2">
              <ProgressBar label="Posture" value={liveMetrics.postureScore} />
              <ProgressBar label="Gaze" value={liveMetrics.gazeDriftScore} />
              <ProgressBar label="Head" value={liveMetrics.headMovementScore} />
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {items.map((item) => (
              <MetricCard key={item.label} label={item.label} value={item.value} helper={item.helper} tone={item.tone} />
            ))}
            <div className="md:col-span-2 space-y-3 mt-2">
              <ProgressBar label="Posture score" value={liveMetrics.postureScore} />
              <ProgressBar label="Gaze drift" value={liveMetrics.gazeDriftScore} />
              <ProgressBar label="Head stability" value={liveMetrics.headMovementScore} />
              <ProgressBar label="Tracking quality" value={liveMetrics.trackingQualityScore} />
            </div>
          </div>
        )}

        {!compact && (
          <div className="mt-5 space-y-3">
            <SignalItem
              label="Eye state"
              value={liveMetrics.eyeClosureRisk === "High" ? "Prolonged closure risk" : liveMetrics.blinkGateOpen ? "Normal tracking" : "Blink gate paused"}
              helper={`Closures: ${liveMetrics.prolongedClosures} · Yawns: ${liveMetrics.yawnEvents} · Drowsiness: ${liveMetrics.drowsinessRisk}`}
            />
            <SignalItem
              label="Face position"
              value={liveMetrics.posture}
              helper={`Away: ${liveMetrics.faceAwaySeconds}s · Distraction: ${liveMetrics.distractionLevel} (${liveMetrics.distractionEvents} events)`}
            />
          </div>
        )}
      </div>
    </section>
  );
}

export default StatsPanel;
