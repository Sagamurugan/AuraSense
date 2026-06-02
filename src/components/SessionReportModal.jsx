import { formatDuration } from "../utils/analytics";

function MetricCard({ label, value, helper }) {
  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: "var(--border-color)", background: "var(--bg-panel-soft)" }}>
      <p className="text-xs uppercase tracking-[0.24em]" style={{ color: "var(--text-muted)" }}>{label}</p>
      <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>{value}</p>
      <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>{helper}</p>
    </div>
  );
}

function SessionReportModal({ report, onClose }) {
  if (!report) {
    return null;
  }

  const { session, insights } = report;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md" style={{ background: "var(--overlay)" }}>
      <div className="panel-card max-h-[90vh] w-full max-w-5xl overflow-y-auto p-6">
        <div className="flex flex-col gap-4 border-b pb-5 lg:flex-row lg:items-start lg:justify-between" style={{ borderColor: "var(--border-color)" }}>
          <div>
            <p className="text-xs uppercase tracking-[0.28em]" style={{ color: "var(--text-muted)" }}>Session Report</p>
            <h2 className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>End-of-session performance summary</h2>
            <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
              Real metrics captured from the session that just ended on {session.date}.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border px-4 py-2 text-sm font-medium transition shell-hover"
            style={{ borderColor: "var(--border-color)", background: "var(--bg-panel-soft)", color: "var(--text-primary)" }}
          >
            Close
          </button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Duration"
            value={formatDuration(session.duration)}
            helper="Actual session length."
          />
          <MetricCard
            label="Focus Score"
            value={session.focusScore}
            helper="Focus quality at end of session."
          />
          <MetricCard
            label="Fatigue"
            value={`${session.fatigue}%`}
            helper="Final fatigue estimate."
          />
          <MetricCard
            label="Attention"
            value={session.attentionScore ?? 0}
            helper="Combined attention quality."
          />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Blinks"
            value={session.blinks}
            helper="Total blink count recorded."
          />
          <MetricCard
            label="Posture Score"
            value={session.postureScore ?? 0}
            helper="Posture quality across the run."
          />
          <MetricCard
            label="Face Away"
            value={`${session.faceAwaySeconds ?? 0}s`}
            helper="Time spent away from frame."
          />
          <MetricCard
            label="Distractions"
            value={session.distractionEvents ?? 0}
            helper="Attention interruption events."
          />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3 xl:grid-cols-5">
          <MetricCard
            label="Head Stability"
            value={session.headMovementScore ?? 0}
            helper="Lower values suggest more movement."
          />
          <MetricCard
            label="Gaze Drift"
            value={session.gazeDriftScore ?? 0}
            helper={`${session.gazeDriftEvents ?? 0} drift events detected.`}
          />
          <MetricCard
            label="Eye Closure"
            value={session.prolongedClosures ?? 0}
            helper="Prolonged closure events detected."
          />
          <MetricCard
            label="Yawns"
            value={session.yawnEvents ?? 0}
            helper="Yawn events recorded in this run."
          />
          <MetricCard
            label="Drowsiness"
            value={session.drowsinessScore ?? 0}
            helper="Overall drowsiness score for the session."
          />
        </div>

        <div className="mt-5 rounded-3xl border p-5" style={{ borderColor: "var(--border-color)", background: "var(--bg-panel-soft)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Key takeaways</p>
          <div className="mt-4 grid gap-3">
            {insights.map((insight, index) => (
              <div key={`${session.id}-insight-${index}`} className="rounded-2xl p-4 text-sm" style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)" }}>
                {insight}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SessionReportModal;
