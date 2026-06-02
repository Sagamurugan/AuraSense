import {
  exportAnalyticsCsv,
  exportSessionsCsv,
  openPrintableReport,
} from "../utils/export";

function ExportPanel({ sessionHistory, dashboardMetrics, settings, storageMode, isStorageReady }) {
  return (
    <section className="panel-card p-5">
      <div className="border-b pb-5" style={{ borderColor: "var(--border-color)" }}>
        <p className="text-xs uppercase tracking-[0.28em]" style={{ color: "var(--text-muted)" }}>Export & Storage</p>
        <h2 className="mt-2 text-xl font-semibold" style={{ color: "var(--text-primary)" }}>Project-ready output tools</h2>
        <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
          Export your sessions and analytics for viva demos, reports, and portfolio artifacts.
        </p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <button
          type="button"
          onClick={() => exportSessionsCsv(sessionHistory)}
          className="rounded-3xl border p-5 text-left transition shell-hover"
          style={{ borderColor: "var(--border-color)", background: "var(--bg-panel-soft)" }}
        >
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Export Sessions CSV</p>
          <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
            Downloads all saved sessions with focus, attention, posture, and predictive signals.
          </p>
        </button>

        <button
          type="button"
          onClick={() => exportAnalyticsCsv(dashboardMetrics)}
          className="rounded-3xl border p-5 text-left transition shell-hover"
          style={{ borderColor: "var(--border-color)", background: "var(--bg-panel-soft)" }}
        >
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Export Analytics CSV</p>
          <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
            Downloads dashboard summaries including daily and weekly reports.
          </p>
        </button>

        <button
          type="button"
          onClick={() =>
            openPrintableReport({
              dashboardMetrics,
              sessionHistory,
              settings,
            })
          }
          className="rounded-3xl border p-5 text-left transition hover:from-sky-500/15 hover:to-indigo-500/15 md:col-span-2"
          style={{ borderColor: "rgba(56,189,248,0.2)", background: "linear-gradient(135deg, rgba(56,189,248,0.08), rgba(129,140,248,0.06))" }}
        >
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Open Printable Report</p>
          <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
            Opens a clean report view that can be printed or saved as PDF from the browser.
          </p>
        </button>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border p-4" style={{ borderColor: "var(--border-color)", background: "var(--bg-elevated)" }}>
          <p className="text-xs uppercase tracking-[0.24em]" style={{ color: "var(--text-muted)" }}>Storage Mode</p>
          <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
            {storageMode === "indexedDB" ? "IndexedDB" : "LocalStorage"}
          </p>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            IndexedDB is now preferred for stronger browser-side persistence.
          </p>
        </div>
        <div className="rounded-2xl border p-4" style={{ borderColor: "var(--border-color)", background: "var(--bg-elevated)" }}>
          <p className="text-xs uppercase tracking-[0.24em]" style={{ color: "var(--text-muted)" }}>Sync Status</p>
          <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
            {isStorageReady ? "Ready" : "Syncing"}
          </p>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            Sessions are loaded and mirrored for local durability.
          </p>
        </div>
      </div>
    </section>
  );
}

export default ExportPanel;
