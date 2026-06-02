import { useMemo, useState } from "react";
import { formatDuration } from "../utils/analytics";
import { getSessionFocusScore } from "../utils/scoring";

const PAGE_SIZE = 8;

function SessionHistory({ sessionHistory, onDeleteSession, onUpdateSession }) {
  const [page, setPage] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const totalPages = Math.max(1, Math.ceil(sessionHistory.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);

  const pageSessions = useMemo(() => {
    const start = safePage * PAGE_SIZE;
    return sessionHistory.slice(start, start + PAGE_SIZE);
  }, [safePage, sessionHistory]);

  const startEdit = (session) => {
    setEditingId(session.id);
    setEditTitle(session.title || "");
    setEditNotes(session.notes || "");
  };

  const saveEdit = (sessionId) => {
    onUpdateSession?.(sessionId, { title: editTitle.trim(), notes: editNotes.trim() });
    setEditingId(null);
  };

  return (
    <section className="panel-card p-5">
      <div className="flex flex-col gap-2 border-b pb-5 lg:flex-row lg:items-end lg:justify-between" style={{ borderColor: "var(--border-color)" }}>
        <div>
          <p className="text-xs uppercase tracking-[0.28em]" style={{ color: "var(--text-muted)" }}>Session History</p>
          <h2 className="mt-2 text-xl font-semibold" style={{ color: "var(--text-primary)" }}>Review previous sessions</h2>
        </div>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {sessionHistory.length} saved — rename, add notes, or delete entries.
        </p>
      </div>

      <div className="mt-5 overflow-hidden rounded-3xl border" style={{ borderColor: "var(--border-color)" }}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y text-left" style={{ borderColor: "var(--border-color)" }}>
            <thead className="text-xs uppercase tracking-[0.24em]" style={{ background: "var(--bg-panel-soft)", color: "var(--text-muted)" }}>
              <tr>
                <th className="px-4 py-4 font-medium">Date</th>
                <th className="px-4 py-4 font-medium">Label</th>
                <th className="px-4 py-4 font-medium">Duration</th>
                <th className="px-4 py-4 font-medium">Fatigue</th>
                <th className="px-4 py-4 font-medium">Blinks</th>
                <th className="px-4 py-4 font-medium">Focus</th>
                <th className="px-4 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--border-color)", background: "var(--bg-elevated)" }}>
              {pageSessions.map((session, index) => (
                <tr key={`session-${session.id || index}`} className="text-sm align-top" style={{ color: "var(--text-secondary)" }}>
                  <td className="px-4 py-4 whitespace-nowrap">{session.date}</td>
                  <td className="px-4 py-4 min-w-[140px]">
                    {editingId === session.id ? (
                      <div className="space-y-2">
                        <input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          placeholder="Session title"
                          className="w-full rounded-lg border px-2 py-1 text-xs"
                          style={{ borderColor: "var(--border-color)", background: "var(--bg-panel)", color: "var(--text-primary)" }}
                        />
                        <textarea
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          placeholder="Notes"
                          rows={2}
                          className="w-full rounded-lg border px-2 py-1 text-xs"
                          style={{ borderColor: "var(--border-color)", background: "var(--bg-panel)", color: "var(--text-primary)" }}
                        />
                        <div className="flex gap-2">
                          <button type="button" className="text-xs text-sky-400" onClick={() => saveEdit(session.id)}>Save</button>
                          <button type="button" className="text-xs" onClick={() => setEditingId(null)}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p style={{ color: "var(--text-primary)" }}>{session.title || "Untitled session"}</p>
                        {session.notes ? <p className="mt-1 text-xs">{session.notes}</p> : null}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">{formatDuration(session.duration)}</td>
                  <td className="px-4 py-4 whitespace-nowrap">{session.fatigue}%</td>
                  <td className="px-4 py-4 whitespace-nowrap">{session.blinks}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {session.focusScore ?? getSessionFocusScore(session)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button type="button" className="text-xs text-sky-400" onClick={() => startEdit(session)} aria-label="Edit session">
                        Edit
                      </button>
                      <button
                        type="button"
                        className="text-xs text-red-400"
                        onClick={() => {
                          if (window.confirm("Delete this session?")) onDeleteSession?.(session.id);
                        }}
                        aria-label="Delete session"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!sessionHistory.length && (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
                    No sessions saved yet. Finish one to build your history table.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {sessionHistory.length > PAGE_SIZE && (
        <div className="mt-4 flex items-center justify-between text-sm" style={{ color: "var(--text-secondary)" }}>
          <button
            type="button"
            disabled={safePage === 0}
            className="rounded-lg border px-3 py-1 disabled:opacity-40"
            style={{ borderColor: "var(--border-color)" }}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Previous
          </button>
          <span>
            Page {safePage + 1} of {totalPages}
          </span>
          <button
            type="button"
            disabled={safePage >= totalPages - 1}
            className="rounded-lg border px-3 py-1 disabled:opacity-40"
            style={{ borderColor: "var(--border-color)" }}
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}

export default SessionHistory;
