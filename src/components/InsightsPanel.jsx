function InsightsPanel({ insights, alerts, liveMetrics, bestSession }) {
  return (
    <section className="panel-card p-5">
      <div className="border-b border-white/10 pb-5">
        <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
          Insights Panel
        </p>
        <h2 className="mt-2 text-xl font-semibold text-white">
          Rule-based coaching
        </h2>
        <p className="mt-2 text-sm text-slate-400">
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
                <p className="text-sm font-semibold text-white">{alert.title}</p>
                <p className="mt-1 text-sm text-slate-200">{alert.message}</p>
              </div>
              <span className="rounded-full bg-slate-950/40 px-3 py-1 text-xs text-slate-200">
                Smart alert
              </span>
            </div>
          </div>
        ))}

        {!alerts.length && (
          <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-4">
            <p className="text-sm font-semibold text-white">Looking steady</p>
            <p className="mt-1 text-sm text-slate-200">
              No alerts right now. Your posture and fatigue signals look stable.
            </p>
          </div>
        )}
      </div>

      <div className="mt-5 space-y-3">
        {insights.map((insight) => (
          <div key={insight.title} className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-sm font-semibold text-white">{insight.title}</p>
            <p className="mt-1 text-sm leading-6 text-slate-400">{insight.message}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-3xl border border-white/10 bg-slate-950/50 p-5">
        <p className="text-sm text-slate-400">Current guidance</p>
        <p className="mt-2 text-lg font-semibold text-white">
          {liveMetrics.focusScore >= 75 ? "Strong focus window" : "Recovery suggested"}
        </p>
        <p className="mt-2 text-sm text-slate-400">
          {bestSession
            ? `Your best saved session lasted ${Math.round(bestSession.duration / 60)} minutes with low friction.`
            : "Complete a few sessions and AuraSense will surface a stronger personal baseline."}
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/[0.04] p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Attention
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {liveMetrics.attentionScore}
            </p>
          </div>
          <div className="rounded-2xl bg-white/[0.04] p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Posture Score
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {liveMetrics.postureScore}
            </p>
          </div>
          <div className="rounded-2xl bg-white/[0.04] p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Attention Breaks
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {liveMetrics.distractionEvents}
            </p>
          </div>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/[0.04] p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Head Stability
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {liveMetrics.headMovementScore}
            </p>
          </div>
          <div className="rounded-2xl bg-white/[0.04] p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Gaze Drift
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {liveMetrics.gazeDriftLevel}
            </p>
          </div>
          <div className="rounded-2xl bg-white/[0.04] p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Eye Closure Risk
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {liveMetrics.eyeClosureRisk}
            </p>
          </div>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-white/[0.04] p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Yawn Events
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {liveMetrics.yawnEvents}
            </p>
          </div>
          <div className="rounded-2xl bg-white/[0.04] p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Drowsiness
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {liveMetrics.drowsinessRisk}
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Score {liveMetrics.drowsinessScore}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default InsightsPanel;
