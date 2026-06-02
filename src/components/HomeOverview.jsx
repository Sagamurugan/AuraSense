function OverviewMetric({ label, value, helper }) {
  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: "var(--border-color)", background: "var(--bg-panel-soft)" }}>
      <p className="text-xs uppercase tracking-[0.22em]" style={{ color: "var(--text-muted)" }}>{label}</p>
      <p className="mt-3 text-3xl font-semibold" style={{ color: "var(--text-primary)" }}>{value}</p>
      <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>{helper}</p>
    </div>
  );
}

function HomeOverview({ liveMetrics, alerts, dashboardMetrics, insights }) {
  const topInsight = insights[0];
  const topAlert = alerts[0];

  return (
    <section className="panel-card p-5">
      <div className="border-b pb-5" style={{ borderColor: "var(--border-color)" }}>
        <p className="text-xs uppercase tracking-[0.28em]" style={{ color: "var(--text-muted)" }}>Overview</p>
        <h2 className="mt-2 text-xl font-semibold" style={{ color: "var(--text-primary)" }}>Primary session status</h2>
        <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
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
        <div className="rounded-3xl border p-5" style={{ borderColor: "var(--border-color)", background: "var(--bg-elevated)" }}>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Current guidance</p>
          <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
            {liveMetrics.focusScore >= 75 ? "You can stay in flow" : "A lighter pace is better"}
          </p>
          <p className="mt-3 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
            {topAlert
              ? topAlert.message
              : topInsight?.message ||
                "AuraSense will surface sharper personal coaching as more sessions are saved."}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <div className="rounded-3xl border p-4" style={{ borderColor: "var(--border-color)", background: "var(--bg-panel-soft)" }}>
            <p className="text-xs uppercase tracking-[0.22em]" style={{ color: "var(--text-muted)" }}>Sessions</p>
            <p className="mt-3 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
              {dashboardMetrics.totalSessions}
            </p>
          </div>
          <div className="rounded-3xl border p-4" style={{ borderColor: "var(--border-color)", background: "var(--bg-panel-soft)" }}>
            <p className="text-xs uppercase tracking-[0.22em]" style={{ color: "var(--text-muted)" }}>Best Focus Window</p>
            <p className="mt-3 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
              {dashboardMetrics.bestFocusWindow}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeOverview;
