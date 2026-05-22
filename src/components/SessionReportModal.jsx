import { formatDuration } from "../utils/analytics";

function MetricCard({ label, value, helper }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-sm text-slate-400">{helper}</p>
    </div>
  );
}

function SessionReportModal({ report, onClose }) {
  if (!report) {
    return null;
  }

  const { session, insights } = report;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-md">
      <div className="panel-card max-h-[90vh] w-full max-w-5xl overflow-y-auto p-6">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
              Session Report
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              End-of-session performance summary
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Real metrics captured from the session that just ended on {session.date}.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
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

        <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm font-semibold text-white">Key takeaways</p>
          <div className="mt-4 grid gap-3">
            {insights.map((insight, index) => (
              <div key={`${session.id}-insight-${index}`} className="rounded-2xl bg-slate-950/50 p-4 text-sm text-slate-300">
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
