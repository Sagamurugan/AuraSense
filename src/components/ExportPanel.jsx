import {
  exportAnalyticsCsv,
  exportSessionsCsv,
  openPrintableReport,
} from "../utils/export";

function ExportPanel({ sessionHistory, dashboardMetrics, settings, storageMode, isStorageReady }) {
  return (
    <section className="panel-card p-5">
      <div className="border-b border-white/10 pb-5">
        <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
          Export & Storage
        </p>
        <h2 className="mt-2 text-xl font-semibold text-white">
          Project-ready output tools
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Export your sessions and analytics for viva demos, reports, and portfolio artifacts.
        </p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <button
          type="button"
          onClick={() => exportSessionsCsv(sessionHistory)}
          className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-left transition hover:bg-white/[0.07]"
        >
          <p className="text-sm font-semibold text-white">Export Sessions CSV</p>
          <p className="mt-2 text-sm text-slate-400">
            Downloads all saved sessions with focus, attention, posture, and predictive signals.
          </p>
        </button>

        <button
          type="button"
          onClick={() => exportAnalyticsCsv(dashboardMetrics)}
          className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-left transition hover:bg-white/[0.07]"
        >
          <p className="text-sm font-semibold text-white">Export Analytics CSV</p>
          <p className="mt-2 text-sm text-slate-400">
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
          className="rounded-3xl border border-sky-500/20 bg-gradient-to-br from-sky-500/10 to-indigo-500/10 p-5 text-left transition hover:from-sky-500/15 hover:to-indigo-500/15 md:col-span-2"
        >
          <p className="text-sm font-semibold text-white">Open Printable Report</p>
          <p className="mt-2 text-sm text-slate-300">
            Opens a clean report view that can be printed or saved as PDF from the browser.
          </p>
        </button>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Storage Mode
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {storageMode === "indexedDB" ? "IndexedDB" : "LocalStorage"}
          </p>
          <p className="mt-1 text-sm text-slate-400">
            IndexedDB is now preferred for stronger browser-side persistence.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Sync Status
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {isStorageReady ? "Ready" : "Syncing"}
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Sessions are loaded and mirrored for local durability.
          </p>
        </div>
      </div>
    </section>
  );
}

export default ExportPanel;
