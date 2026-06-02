function InsightsPanel({ insights, alerts, liveMetrics, bestSession }) {
  return (
    <section className="panel-card p-5">
      <div className="border-b pb-5" style={{ borderColor: "var(--border-color)" }}>
        <p className="text-xs uppercase tracking-[0.28em]" style={{ color: "var(--text-muted)" }}>Insights Panel</p>
        <h2 className="mt-2 text-xl font-semibold" style={{ color: "var(--text-primary)" }}>Rule-based coaching</h2>
        <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
          Insights are generated from local session data, no external AI API required.
        </p>
      </div>

      <div className="mt-5 space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.title}
            className={`rounded-3xl border p-4 ${
              alert.tone === "warning"
                ? "border-orange-400/20 bg-orange-400/10"
                : "border-sky-400/20 bg-sky-400/10"
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{alert.title}</p>
                <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>{alert.message}</p>
              </div>
              <span className="rounded-full px-3 py-1 text-xs" style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)" }}>
                Smart alert
              </span>
            </div>
          </div>
        ))}

        {!alerts.length && (
          <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-4">
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Looking steady</p>
            <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
              No alerts right now. Your posture and fatigue signals look stable.
            </p>
          </div>
        )}
      </div>

      <div className="mt-5 space-y-3">
        {insights.map((insight) => (
          <div key={insight.title} className="rounded-3xl border p-4" style={{ borderColor: "var(--border-color)", background: "var(--bg-panel-soft)" }}>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{insight.title}</p>
            <p className="mt-1 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>{insight.message}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-3xl border p-5" style={{ borderColor: "var(--border-color)", background: "var(--bg-elevated)" }}>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Current guidance</p>
        <p className="mt-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
          {liveMetrics.focusScore >= 75 ? "Strong focus window" : "Recovery suggested"}
        </p>
        <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
          {bestSession
            ? `Your best saved session lasted ${Math.round(bestSession.duration / 60)} minutes with low friction.`
            : "Complete a few sessions and AuraSense will surface a stronger personal baseline."}
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl p-4" style={{ background: "var(--bg-panel-soft)" }}>
            <p className="text-xs uppercase tracking-[0.24em]" style={{ color: "var(--text-muted)" }}>Attention</p>
            <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
              {liveMetrics.attentionScore}
            </p>
          </div>
          <div className="rounded-2xl p-4" style={{ background: "var(--bg-panel-soft)" }}>
            <p className="text-xs uppercase tracking-[0.24em]" style={{ color: "var(--text-muted)" }}>Posture Score</p>
            <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
              {liveMetrics.postureScore}
            </p>
          </div>
          <div className="rounded-2xl p-4" style={{ background: "var(--bg-panel-soft)" }}>
            <p className="text-xs uppercase tracking-[0.24em]" style={{ color: "var(--text-muted)" }}>Attention Breaks</p>
            <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
              {liveMetrics.distractionEvents}
            </p>
          </div>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl p-4" style={{ background: "var(--bg-panel-soft)" }}>
            <p className="text-xs uppercase tracking-[0.24em]" style={{ color: "var(--text-muted)" }}>Head Stability</p>
            <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
              {liveMetrics.headMovementScore}
            </p>
          </div>
          <div className="rounded-2xl p-4" style={{ background: "var(--bg-panel-soft)" }}>
            <p className="text-xs uppercase tracking-[0.24em]" style={{ color: "var(--text-muted)" }}>Gaze Drift</p>
            <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
              {liveMetrics.gazeDriftLevel}
            </p>
          </div>
          <div className="rounded-2xl p-4" style={{ background: "var(--bg-panel-soft)" }}>
            <p className="text-xs uppercase tracking-[0.24em]" style={{ color: "var(--text-muted)" }}>Eye Closure Risk</p>
            <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
              {liveMetrics.eyeClosureRisk}
            </p>
          </div>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl p-4" style={{ background: "var(--bg-panel-soft)" }}>
            <p className="text-xs uppercase tracking-[0.24em]" style={{ color: "var(--text-muted)" }}>Yawn Events</p>
            <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
              {liveMetrics.yawnEvents}
            </p>
          </div>
          <div className="rounded-2xl p-4" style={{ background: "var(--bg-panel-soft)" }}>
            <p className="text-xs uppercase tracking-[0.24em]" style={{ color: "var(--text-muted)" }}>Drowsiness</p>
            <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
              {liveMetrics.drowsinessRisk}
            </p>
            <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
              Score {liveMetrics.drowsinessScore}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default InsightsPanel;
