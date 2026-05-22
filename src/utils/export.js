import { formatDuration } from "./analytics";

function downloadBlob(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function escapeCsv(value) {
  const text = `${value ?? ""}`;
  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

export function exportSessionsCsv(sessionHistory) {
  const header = [
    "Date",
    "Duration",
    "Fatigue",
    "Blinks",
    "Focus Score",
    "Attention Score",
    "Posture Score",
    "Distraction Events",
    "Face Away Seconds",
    "Head Movement Score",
    "Gaze Drift Score",
    "Gaze Drift Events",
    "Prolonged Closures",
  ];

  const rows = sessionHistory.map((session) => [
    session.date,
    formatDuration(session.duration),
    session.fatigue,
    session.blinks,
    session.focusScore,
    session.attentionScore ?? 0,
    session.postureScore ?? 0,
    session.distractionEvents ?? 0,
    session.faceAwaySeconds ?? 0,
    session.headMovementScore ?? 0,
    session.gazeDriftScore ?? 0,
    session.gazeDriftEvents ?? 0,
    session.prolongedClosures ?? 0,
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map(escapeCsv).join(","))
    .join("\n");

  downloadBlob("aurasense-sessions.csv", csv, "text/csv;charset=utf-8");
}

export function exportAnalyticsCsv(dashboardMetrics) {
  const sections = [
    ["Metric", "Value"],
    ["Average Fatigue", dashboardMetrics.averageFatigue],
    ["Average Focus", dashboardMetrics.averageFocus],
    ["Average Attention", dashboardMetrics.averageAttention],
    ["Average Posture", dashboardMetrics.averagePosture],
    ["Total Sessions", dashboardMetrics.totalSessions],
    ["Best Focus Window", dashboardMetrics.bestFocusWindow],
    [],
    ["Daily Summary"],
    ["Day", "Focus", "Attention", "Fatigue", "Duration Minutes", "Sessions"],
    ...dashboardMetrics.dailySummary.map((entry) => [
      entry.label,
      entry.focus,
      entry.attention,
      entry.fatigue,
      entry.durationMinutes,
      entry.sessions,
    ]),
    [],
    ["Weekly Summary"],
    ["Week", "Focus", "Attention", "Fatigue", "Sessions"],
    ...dashboardMetrics.weeklySummary.map((entry) => [
      entry.label,
      entry.focus,
      entry.attention,
      entry.fatigue,
      entry.sessions,
    ]),
  ];

  const csv = sections.map((row) => row.map(escapeCsv).join(",")).join("\n");
  downloadBlob("aurasense-analytics.csv", csv, "text/csv;charset=utf-8");
}

export function openPrintableReport({ dashboardMetrics, sessionHistory, settings }) {
  const reportWindow = window.open("", "_blank", "width=1080,height=900");
  if (!reportWindow) {
    return false;
  }

  const recentSessions = sessionHistory
    .slice(0, 6)
    .map(
      (session) => `
        <tr>
          <td>${session.date}</td>
          <td>${formatDuration(session.duration)}</td>
          <td>${session.fatigue}%</td>
          <td>${session.focusScore}</td>
          <td>${session.attentionScore ?? 0}</td>
        </tr>
      `
    )
    .join("");

  reportWindow.document.write(`
    <html>
      <head>
        <title>AuraSense Report</title>
        <style>
          body { font-family: Inter, Arial, sans-serif; padding: 32px; color: #0f172a; }
          h1, h2 { margin-bottom: 8px; }
          .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; margin: 24px 0; }
          .card { border: 1px solid #cbd5e1; border-radius: 16px; padding: 16px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; }
          th { background: #e2e8f0; }
          .muted { color: #475569; }
        </style>
      </head>
      <body>
        <h1>AuraSense Performance Report</h1>
        <p class="muted">Privacy-first real-time focus and fatigue analytics summary.</p>
        <div class="grid">
          <div class="card"><strong>Average Focus</strong><div>${dashboardMetrics.averageFocus}</div></div>
          <div class="card"><strong>Average Fatigue</strong><div>${dashboardMetrics.averageFatigue}%</div></div>
          <div class="card"><strong>Average Attention</strong><div>${dashboardMetrics.averageAttention}</div></div>
          <div class="card"><strong>Best Focus Window</strong><div>${dashboardMetrics.bestFocusWindow}</div></div>
        </div>
        <h2>Settings Snapshot</h2>
        <p class="muted">Goal ${settings.sessionGoalMinutes} min, break reminder ${settings.breakReminderMinutes} min, baseline blink rate ${settings.baselineBlinkRate}/min.</p>
        <h2>Recent Sessions</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Duration</th>
              <th>Fatigue</th>
              <th>Focus</th>
              <th>Attention</th>
            </tr>
          </thead>
          <tbody>${recentSessions}</tbody>
        </table>
      </body>
    </html>
  `);
  reportWindow.document.close();
  reportWindow.focus();
  reportWindow.print();
  return true;
}
