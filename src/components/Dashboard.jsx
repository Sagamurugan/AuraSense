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
import { formatDuration } from "../utils/analytics";
import { getSessionFocusScore } from "../utils/scoring";

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
    <div className="flex h-full flex-col rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-400">{helper}</p>
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

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
    mode: "index",
  },
  plugins: {
    legend: {
      labels: {
        color: "#cbd5e1",
      },
    },
  },
  scales: {
    x: {
      ticks: {
        color: "#94a3b8",
      },
      grid: {
        color: "rgba(148, 163, 184, 0.08)",
      },
    },
    y: {
      ticks: {
        color: "#94a3b8",
      },
      grid: {
        color: "rgba(148, 163, 184, 0.08)",
      },
    },
  },
};

function Dashboard({ trendData, sessionHistory, dashboardMetrics }) {
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
      <div className="flex flex-col gap-3 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
            Dashboard
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">
            Trends and session intelligence
          </h2>
        </div>
        <p className="max-w-xl text-sm text-slate-400">
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
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <div className="mb-4">
            <p className="text-sm text-slate-300">Fatigue trend</p>
            <p className="text-sm text-slate-500">
              Live checkpoints captured every 5 seconds during an active session.
            </p>
          </div>
          <div className="h-72">
            <Line data={fatigueChart} options={chartOptions} />
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <div className="mb-4">
            <p className="text-sm text-slate-300">Blink trend</p>
            <p className="text-sm text-slate-500">
              Session blink count progression with the same lightweight sampling cadence.
            </p>
          </div>
          <div className="h-72">
            <Line data={blinkChart} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <div className="mb-4">
            <p className="text-sm text-slate-300">Daily report</p>
            <p className="text-sm text-slate-500">
              Average focus from your most recent active days.
            </p>
          </div>
          <div className="h-72">
            <Line data={dailyFocusChart} options={chartOptions} />
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <div className="mb-4">
            <p className="text-sm text-slate-300">Weekly report</p>
            <p className="text-sm text-slate-500">
              Attention quality across recent calendar weeks.
            </p>
          </div>
          <div className="h-72">
            <Line data={weeklyAttentionChart} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm text-slate-300">Daily summary cards</p>
          <div className="mt-4 grid gap-3">
            {dashboardMetrics.dailySummary.slice(-3).reverse().map((entry, index) => (
              <div key={`daily-${entry.label}-${index}`} className="rounded-2xl bg-slate-950/50 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-white">{entry.label}</p>
                  <p className="text-sm text-slate-400">{entry.sessions} sessions</p>
                </div>
                <p className="mt-2 text-sm text-slate-400">
                  Focus {entry.focus}, attention {entry.attention}, fatigue {entry.fatigue}%
                </p>
              </div>
            ))}
            {!dashboardMetrics.dailySummary.length && (
              <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/40 p-4 text-sm text-slate-400">
                Build up a few sessions and AuraSense will generate daily summaries here.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm text-slate-300">Comparison report</p>
          {dashboardMetrics.comparisonSummary ? (
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl bg-slate-950/50 p-4">
                <p className="text-sm font-medium text-white">
                  {dashboardMetrics.comparisonSummary.summary}
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  Focus delta {dashboardMetrics.comparisonSummary.focusDelta >= 0 ? "+" : ""}
                  {dashboardMetrics.comparisonSummary.focusDelta}, fatigue delta{" "}
                  {dashboardMetrics.comparisonSummary.fatigueDelta >= 0 ? "+" : ""}
                  {dashboardMetrics.comparisonSummary.fatigueDelta}, attention delta{" "}
                  {dashboardMetrics.comparisonSummary.attentionDelta >= 0 ? "+" : ""}
                  {dashboardMetrics.comparisonSummary.attentionDelta}.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                  Best window
                </p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {dashboardMetrics.bestFocusWindow}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  AuraSense sees your strongest focus sessions in this time band so far.
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-slate-950/40 p-4 text-sm text-slate-400">
              Complete at least two sessions to unlock session-to-session comparisons.
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <p className="text-sm text-slate-300">Recent performance snapshot</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {sessionHistory.slice(0, 3).map((session, index) => (
            <div key={`session-${session.id || index}`} className="rounded-2xl bg-slate-950/50 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                {session.date}
              </p>
              <p className="mt-3 text-lg font-semibold text-white">
                {formatDuration(session.duration)}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Fatigue {session.fatigue}% and {session.blinks} blinks
              </p>
            </div>
          ))}

          {!sessionHistory.length && (
            <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/40 p-6 text-sm text-slate-400 md:col-span-3">
              No saved sessions yet. Start a session to populate your dashboard.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Dashboard;
