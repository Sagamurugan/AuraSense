function OverviewMetric({ label, value, helper }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-400">{helper}</p>
    </div>
  );
}

function HomeOverview({ liveMetrics, alerts, dashboardMetrics, insights }) {
  const topInsight = insights[0];
  const topAlert = alerts[0];

  return (
    <section className="panel-card p-5">
      <div className="border-b border-white/10 pb-5">
        <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Overview</p>
        <h2 className="mt-2 text-xl font-semibold text-white">Primary session status</h2>
        <p className="mt-2 text-sm text-slate-400">
          The home page stays focused on the live decisions you need now, while the deeper
          history and charting stay in their own sections.
        </p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <OverviewMetric
          label="Focus"
          value={liveMetrics.focusScore}
          helper="Live focus score from blink rhythm and sustained session quality."
        />
        <OverviewMetric
          label="Fatigue"
          value={`${liveMetrics.fatigueScore}%`}
          helper="Current fatigue estimate from your local session signals."
        />
        <OverviewMetric
          label="Attention"
          value={liveMetrics.attentionScore}
          helper="Combines face presence, posture, and attention breaks."
        />
        <OverviewMetric
          label="Posture"
          value={liveMetrics.postureScore}
          helper={liveMetrics.posture}
        />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_260px]">
        <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
          <p className="text-sm text-slate-400">Current guidance</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {liveMetrics.focusScore >= 75 ? "You can stay in flow" : "A lighter pace is better"}
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            {topAlert
              ? topAlert.message
              : topInsight?.message ||
                "AuraSense will surface sharper personal coaching as more sessions are saved."}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Sessions</p>
            <p className="mt-3 text-2xl font-semibold text-white">
              {dashboardMetrics.totalSessions}
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
              Best Focus Window
            </p>
            <p className="mt-3 text-2xl font-semibold text-white">
              {dashboardMetrics.bestFocusWindow}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeOverview;
