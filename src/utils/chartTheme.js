export function getCssVar(name, fallback = "") {
  if (typeof document === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

export function buildChartOptions() {
  const text = getCssVar("--text-secondary", "#94a3b8");
  const grid = getCssVar("--border-color", "rgba(148, 163, 184, 0.14)");

  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: "index" },
    plugins: {
      legend: { labels: { color: text } },
    },
    scales: {
      x: {
        ticks: { color: text },
        grid: { color: grid },
      },
      y: {
        ticks: { color: text },
        grid: { color: grid },
      },
    },
  };
}
