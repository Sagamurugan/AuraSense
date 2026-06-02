import { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useTheme } from "../context/ThemeContext";
import { formatDuration } from "../utils/analytics";
import { getSessionFocusScore } from "../utils/scoring";
import { buildChartOptions } from "../utils/chartTheme";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

function SummaryCard({ label, value, helper }) {
  return (
    <div className="flex h-full flex-col rounded-3xl border p-5" style={{ borderColor: "var(--border-color)", background: "var(--bg-panel-soft)" }}>
      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>{value}</p>
      <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>{helper}</p>
    </div>
  );
}

function buildChartData(labels, values, config) {
  return {
    labels,
    datasets: [
      {
        label: config.label,
        data: values,
        borderColor: config.borderColor,
        backgroundColor: config.backgroundColor,
        borderWidth: 2,
        fill: true,
        pointRadius: 2,
        pointHoverRadius: 4,
        tension: 0.35,
      },
    ],
  };
}

function Dashboard({ trendData, sessionHistory, dashboardMetrics }) {
  const { theme } = useTheme();
  const chartOptions = useMemo(() => buildChartOptions(), [theme]);
  const fatigueChart = buildChartData(trendData.labels, trendData.fatigue, {
    label: "Fatigue trend",
    borderColor: "#f97316",
    backgroundColor: "rgba(249, 115, 22, 0.18)",
  });

  const blinkChart = buildChartData(trendData.labels, trendData.blinks, {
    label: "Blink trend",
    borderColor: "#38bdf8",
    backgroundColor: "rgba(56, 189, 248, 0.18)",
  });
  const dailyFocusChart = buildChartData(
    dashboardMetrics.dailySummary.map((entry) => entry.label),
    dashboardMetrics.dailySummary.map((entry) => entry.focus),
    {
      label: "Daily focus",
      borderColor: "#818cf8",
      backgroundColor: "rgba(129, 140, 248, 0.18)",
    }
  );
  const weeklyAttentionChart = buildChartData(
    dashboardMetrics.weeklySummary.map((entry) => entry.label),
    dashboardMetrics.weeklySummary.map((entry) => entry.attention),
    {
      label: "Weekly attention",
      borderColor: "#34d399",
      backgroundColor: "rgba(52, 211, 153, 0.18)",
    }
  );

  const bestSessionScore = dashboardMetrics.bestSession
    ? getSessionFocusScore(dashboardMetrics.bestSession)
    : 0;

  return (
    <section className="panel-card p-5">
      <div className="flex flex-col gap-3 border-b pb-5 lg:flex-row lg:items-end lg:justify-between" style={{ borderColor: "var(--border-color)" }}>
        <div>
          <p className="text-xs uppercase tracking-[0.28em]" style={{ color: "var(--text-muted)" }}>Dashboard</p>
          <h2 className="mt-2 text-xl font-semibold" style={{ color: "var(--text-primary)" }}>Trends and session intelligence</h2>
        </div>
        <p className="max-w-xl text-sm" style={{ color: "var(--text-secondary)" }}>
          Charted session signals stay lightweight so webcam analysis remains
          smooth while the dashboard surfaces better context than the original
          single-chart view.
        </p>
      </div>

      <div className="mt-5 space-y-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <SummaryCard
            label="Average Fatigue"
            value={`${dashboardMetrics.averageFatigue}%`}
            helper="Mean fatigue across saved sessions."
          />
          <SummaryCard
            label="Total Sessions"
            value={dashboardMetrics.totalSessions}
            helper="Persisted locally for quick review."
          />
          <SummaryCard
            label="Best Session"
            value={
              dashboardMetrics.bestSession
                ? `${formatDuration(dashboardMetrics.bestSession.duration)}`
                : "N/A"
            }
            helper={
              dashboardMetrics.bestSession
                ? `Focus score ${bestSessionScore}`
                : "Complete a session to establish your best run."
            }
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
          <SummaryCard
            label="Avg Focus"
            value={dashboardMetrics.averageFocus}
            helper="Calculated from your saved sessions."
          />
          <SummaryCard
            label="Avg Attention"
            value={dashboardMetrics.averageAttention}
            helper="Uses face presence, posture, and attention breaks."
          />
          <SummaryCard
            label="Avg Posture"
            value={dashboardMetrics.averagePosture}
            helper="Average posture score across saved sessions."
          />
          <SummaryCard
            label="Best Focus Window"
            value={dashboardMetrics.bestFocusWindow}
            helper="Time of day with your strongest saved focus scores."
          />
        </div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <div className="rounded-3xl border p-4" style={{ borderColor: "var(--border-color)", background: "var(--bg-panel-soft)" }}>
          <div className="mb-4">
            <p className="text-sm" style={{ color: "var(--text-primary)" }}>Fatigue trend</p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Live checkpoints captured every 5 seconds during an active session.</p>
          </div>
          <div className="h-72">
            <Line data={fatigueChart} options={chartOptions} />
          </div>
        </div>

        <div className="rounded-3xl border p-4" style={{ borderColor: "var(--border-color)", background: "var(--bg-panel-soft)" }}>
          <div className="mb-4">
            <p className="text-sm" style={{ color: "var(--text-primary)" }}>Blink trend</p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Session blink count progression with the same lightweight sampling cadence.</p>
          </div>
          <div className="h-72">
            <Line data={blinkChart} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <div className="rounded-3xl border p-4" style={{ borderColor: "var(--border-color)", background: "var(--bg-panel-soft)" }}>
          <div className="mb-4">
            <p className="text-sm" style={{ color: "var(--text-primary)" }}>Daily report</p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Average focus from your most recent active days.</p>
          </div>
          <div className="h-72">
            <Line data={dailyFocusChart} options={chartOptions} />
          </div>
        </div>

        <div className="rounded-3xl border p-4" style={{ borderColor: "var(--border-color)", background: "var(--bg-panel-soft)" }}>
          <div className="mb-4">
            <p className="text-sm" style={{ color: "var(--text-primary)" }}>Weekly report</p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Attention quality across recent calendar weeks.</p>
          </div>
          <div className="h-72">
            <Line data={weeklyAttentionChart} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <div className="rounded-3xl border p-5" style={{ borderColor: "var(--border-color)", background: "var(--bg-panel-soft)" }}>
          <p className="text-sm" style={{ color: "var(--text-primary)" }}>Daily summary cards</p>
          <div className="mt-4 grid gap-3">
            {dashboardMetrics.dailySummary.slice(-3).reverse().map((entry, index) => (
              <div key={`daily-${entry.label}-${index}`} className="rounded-2xl p-4" style={{ background: "var(--bg-elevated)" }}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{entry.label}</p>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{entry.sessions} sessions</p>
                </div>
                <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                  Focus {entry.focus}, attention {entry.attention}, fatigue {entry.fatigue}%
                </p>
              </div>
            ))}
            {!dashboardMetrics.dailySummary.length && (
              <div className="rounded-2xl border border-dashed p-4 text-sm" style={{ borderColor: "var(--border-color)", background: "var(--bg-elevated)", color: "var(--text-secondary)" }}>
                Build up a few sessions and AuraSense will generate daily summaries here.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-3xl border p-5" style={{ borderColor: "var(--border-color)", background: "var(--bg-panel-soft)" }}>
          <p className="text-sm" style={{ color: "var(--text-primary)" }}>Comparison report</p>
          {dashboardMetrics.comparisonSummary ? (
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl p-4" style={{ background: "var(--bg-elevated)" }}>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  {dashboardMetrics.comparisonSummary.summary}
                </p>
                <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                  Focus delta {dashboardMetrics.comparisonSummary.focusDelta >= 0 ? "+" : ""}
                  {dashboardMetrics.comparisonSummary.focusDelta}, fatigue delta{" "}
                  {dashboardMetrics.comparisonSummary.fatigueDelta >= 0 ? "+" : ""}
                  {dashboardMetrics.comparisonSummary.fatigueDelta}, attention delta{" "}
                  {dashboardMetrics.comparisonSummary.attentionDelta >= 0 ? "+" : ""}
                  {dashboardMetrics.comparisonSummary.attentionDelta}.
                </p>
              </div>
              <div className="rounded-2xl border p-4" style={{ borderColor: "var(--border-color)", background: "var(--bg-panel-soft)" }}>
                <p className="text-xs uppercase tracking-[0.24em]" style={{ color: "var(--text-muted)" }}>Best window</p>
                <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
                  {dashboardMetrics.bestFocusWindow}
                </p>
                <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                  AuraSense sees your strongest focus sessions in this time band so far.
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed p-4 text-sm" style={{ borderColor: "var(--border-color)", background: "var(--bg-elevated)", color: "var(--text-secondary)" }}>
              Complete at least two sessions to unlock session-to-session comparisons.
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 rounded-3xl border p-5" style={{ borderColor: "var(--border-color)", background: "var(--bg-panel-soft)" }}>
        <p className="text-sm" style={{ color: "var(--text-primary)" }}>Recent performance snapshot</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {sessionHistory.slice(0, 3).map((session, index) => (
            <div key={`session-${session.id || index}`} className="rounded-2xl p-4" style={{ background: "var(--bg-elevated)" }}>
              <p className="text-xs uppercase tracking-[0.24em]" style={{ color: "var(--text-muted)" }}>{session.date}</p>
              <p className="mt-3 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                {formatDuration(session.duration)}
              </p>
              <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                Fatigue {session.fatigue}% and {session.blinks} blinks
              </p>
            </div>
          ))}

          {!sessionHistory.length && (
            <div className="rounded-2xl border border-dashed p-6 text-sm md:col-span-3" style={{ borderColor: "var(--border-color)", background: "var(--bg-elevated)", color: "var(--text-secondary)" }}>
              No saved sessions yet. Start a session to populate your dashboard.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Dashboard;
