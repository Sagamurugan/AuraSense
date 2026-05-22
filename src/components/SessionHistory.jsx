import { formatDuration } from "../utils/analytics";
import { getSessionFocusScore } from "../utils/scoring";

function SessionHistory({ sessionHistory }) {
  return (
    <section className="panel-card p-5">
      <div className="flex flex-col gap-2 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
            Session History
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">
            Review previous sessions
          </h2>
        </div>
        <p className="text-sm text-slate-400">
          Local-only history with date, duration, fatigue, blink count, and focus score.
        </p>
      </div>

      <div className="mt-5 overflow-hidden rounded-3xl border border-white/10">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10 text-left">
            <thead className="bg-white/[0.03] text-xs uppercase tracking-[0.24em] text-slate-500">
              <tr>
                <th className="px-4 py-4 font-medium">Date</th>
                <th className="px-4 py-4 font-medium">Duration</th>
                <th className="px-4 py-4 font-medium">Fatigue</th>
                <th className="px-4 py-4 font-medium">Blinks</th>
                <th className="px-4 py-4 font-medium">Focus Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 bg-slate-950/30">
              {sessionHistory.map((session, index) => (
                <tr key={`session-${session.id || index}`} className="text-sm text-slate-300">
                  <td className="px-4 py-4 whitespace-nowrap">{session.date}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {formatDuration(session.duration)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">{session.fatigue}%</td>
                  <td className="px-4 py-4 whitespace-nowrap">{session.blinks}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {session.focusScore ?? getSessionFocusScore(session)}
                  </td>
                </tr>
              ))}

              {!sessionHistory.length && (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-sm text-slate-400">
                    No sessions saved yet. Finish one to build your history table.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default SessionHistory;
