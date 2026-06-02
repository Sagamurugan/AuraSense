import { useMemo, useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import CameraPanel from "./components/CameraPanel";
import StatsPanel from "./components/StatsPanel";
import Dashboard from "./components/Dashboard";
import SessionHistory from "./components/SessionHistory";
import InsightsPanel from "./components/InsightsPanel";
import HomeOverview from "./components/HomeOverview";
import SettingsPanel from "./components/SettingsPanel";
import ExportPanel from "./components/ExportPanel";
import AssistantPanel from "./components/AssistantPanel";
import SessionReportModal from "./components/SessionReportModal";
import DebugPanel from "./components/DebugPanel";
import ErrorBoundary from "./components/ErrorBoundary";
import AuthScreen from "./components/AuthScreen";
import useFaceMesh from "./hooks/useFaceMesh";
import useSessionAnalytics from "./hooks/useSessionAnalytics";
import useSessionStorage from "./hooks/useSessionStorage";
import useUserSettings from "./hooks/useUserSettings";
import useGroqCoach from "./hooks/useGroqCoach";
import useAuth from "./hooks/useAuth";
import {
  createInsightSummary,
  deriveAlerts,
  deriveDashboardMetrics,
} from "./utils/analytics";

const viewConfig = {
  home: {
    title: "Live Command Center",
    eyebrow: "Home workspace",
    description:
      "Run live monitoring, keep the camera feed in view, and track the primary focus signals without scrolling through secondary analytics.",
    badge: "Realtime monitoring",
    accent: "from-sky-500/25 via-cyan-500/10 to-transparent",
  },
  analytics: {
    title: "Analytics Studio",
    eyebrow: "Reports and trends",
    description:
      "Review saved behavior patterns, fatigue curves, and exportable reports from a cleaner analytics surface.",
    badge: "History intelligence",
    accent: "from-violet-500/25 via-indigo-500/10 to-transparent",
  },
  sessions: {
    title: "Session Library",
    eyebrow: "Saved monitoring runs",
    description:
      "Inspect recorded sessions, compare outcomes, and keep the history table separate from live operations.",
    badge: "Persistent records",
    accent: "from-emerald-500/25 via-teal-500/10 to-transparent",
  },
  insights: {
    title: "Coaching Desk",
    eyebrow: "Insights and support",
    description:
      "Keep actionable guidance, alerts, and session coaching in one place without crowding the primary camera workspace.",
    badge: "Decision support",
    accent: "from-amber-500/25 via-orange-500/10 to-transparent",
  },
  settings: {
    title: "System Controls",
    eyebrow: "Calibration and preferences",
    description:
      "Adjust calibration, exports, and validation tools from a dedicated settings area that stays out of the way during live use.",
    badge: "Configuration",
    accent: "from-fuchsia-500/25 via-pink-500/10 to-transparent",
  },
};

function HeroStat({ label, value }) {
  return (
    <div className="rounded-2xl border px-4 py-3" style={{ borderColor: "var(--border-color)", background: "var(--bg-panel)" }}>
      <p className="text-[10px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>{label}</p>
      <p className="mt-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>{value}</p>
    </div>
  );
}

function WorkspaceHero({ currentView, liveMetrics, totalSessions, alertsCount, sessionActive }) {
  return (
    <section
      className="relative overflow-hidden rounded-[28px] border p-5 shadow-2xl lg:p-6"
      style={{ borderColor: "var(--border-color)", background: "color-mix(in srgb, var(--bg-panel) 92%, transparent)" }}
    >
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-r ${currentView.accent}`} />
      <div className="relative">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-widest"
              style={{ borderColor: "var(--border-color)", background: "var(--bg-panel)", color: "var(--text-secondary)" }}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              {currentView.eyebrow}
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight lg:text-4xl" style={{ color: "var(--text-primary)" }}>
              {currentView.title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7" style={{ color: "var(--text-secondary)" }}>
              {currentView.description}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:w-[420px] xl:grid-cols-2">
            <HeroStat label="Status" value={sessionActive ? "Live session" : "Ready"} />
            <HeroStat label="Focus" value={liveMetrics.focusScore} />
            <HeroStat label="Saved sessions" value={totalSessions} />
            <HeroStat label="Alerts" value={alertsCount} />
          </div>
        </div>
      </div>
    </section>
  );
}

function SearchResults({ query, results, onSelectResult, onClear }) {
  if (!query.trim()) {
    return null;
  }

  return (
    <section className="panel-card p-5">
      <div className="flex flex-col gap-3 border-b border-white/10 pb-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Search</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Results for "{query}"</h2>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-200 transition hover:bg-white/[0.08]"
        >
          Clear search
        </button>
      </div>

      <div className="mt-5 grid gap-3">
        {results.length ? (
          results.map((result) => (
            <button
              key={`${result.type}-${result.title}-${result.view}`}
              type="button"
              onClick={() => onSelectResult(result)}
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-left transition hover:border-sky-400/20 hover:bg-white/[0.06]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">{result.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">{result.description}</p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-slate-300">
                  {result.view}
                </span>
              </div>
            </button>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/35 px-4 py-6 text-sm text-slate-400">
            No matching workspace items were found. Try terms like focus, fatigue, exports, sessions, or settings.
          </div>
        )}
      </div>
    </section>
  );
}

function App() {
  const auth = useAuth();
  const [activeView, setActiveView] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { sessionHistory, setSessionHistory, storageMode, isStorageReady } = useSessionStorage();
  const {
    enhancedHistory,
    liveMetrics,
    sessionActive,
    sessionActiveRef,
    sessionStartRef,
    startSession,
    stopSession,
    statsRef,
    trendData,
    sessionReport,
    closeSessionReport,
    handleMetricsUpdate,
    handleTrendSample,
  } = useSessionAnalytics({
    sessionHistory,
    setSessionHistory,
  });

  const {
    settings,
    updateSetting,
    calibrateFromLiveSession,
    calibrateFromHistory,
    recommendedBaseline,
    liveCalibration,
  } = useUserSettings({
    sessionHistory: enhancedHistory,
    liveMetrics,
  });

  const { cameraReady, cameraError, isInitializing, videoRef, canvasRef } = useFaceMesh({
    sessionActiveRef,
    sessionStartRef,
    statsRef,
    settings,
    onMetricsUpdate: handleMetricsUpdate,
    onTrendSample: handleTrendSample,
    enabled: auth.isAuthenticated,
  });

  const dashboardMetrics = useMemo(
    () => deriveDashboardMetrics(enhancedHistory),
    [enhancedHistory]
  );

  const alerts = useMemo(
    () => deriveAlerts(liveMetrics, settings),
    [liveMetrics, settings]
  );

  const insights = useMemo(
    () =>
      createInsightSummary({
        liveMetrics,
        sessionHistory: enhancedHistory,
        dashboardMetrics,
        settings,
      }),
    [dashboardMetrics, enhancedHistory, liveMetrics, settings]
  );

  const groqCoach = useGroqCoach({
    liveMetrics,
    dashboardMetrics,
    sessionHistory: enhancedHistory,
    settings,
    liveCalibration,
  });

  const currentView = viewConfig[activeView];

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return [];
    }

    const results = [
      {
        type: "view",
        title: "Home workspace",
        description: "Open the live camera workspace and essential telemetry.",
        view: "home",
      },
      {
        type: "view",
        title: "Analytics reports",
        description: "Explore charts, trends, and exportable analytics.",
        view: "analytics",
      },
      {
        type: "view",
        title: "Session history",
        description: "Review saved sessions and their recorded outcomes.",
        view: "sessions",
      },
      {
        type: "view",
        title: "Insights and coaching",
        description: "See alerts, coaching notes, and realtime support context.",
        view: "insights",
      },
      {
        type: "view",
        title: "Settings and calibration",
        description: "Adjust personalization, calibration, validation, and exports.",
        view: "settings",
      },
      {
        type: "metric",
        title: `Live focus score: ${liveMetrics.focusScore}`,
        description: `Attention ${liveMetrics.attentionScore}, fatigue ${liveMetrics.fatigueScore}%, posture ${liveMetrics.postureScore}.`,
        view: "home",
      },
      {
        type: "metric",
        title: `Active alerts: ${alerts.length}`,
        description: alerts[0]?.message || "No active alerts right now.",
        view: "insights",
      },
      {
        type: "metric",
        title: `Best focus window: ${dashboardMetrics.bestFocusWindow}`,
        description: `Average focus ${dashboardMetrics.averageFocus} across ${dashboardMetrics.totalSessions} saved sessions.`,
        view: "analytics",
      },
      ...enhancedHistory.slice(0, 5).map((session, index) => ({
        type: "session",
        title: `Session on ${session.date}`,
        description: `Duration ${session.duration}s, fatigue ${session.fatigue}%, blinks ${session.blinks}, focus ${session.focusScore ?? "n/a"}.`,
        view: "sessions",
        index,
      })),
      ...insights.slice(0, 4).map((insight) => ({
        type: "insight",
        title: insight.title,
        description: insight.message,
        view: "insights",
      })),
    ];

    return results.filter((item) => {
      const haystack = `${item.title} ${item.description} ${item.view}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [alerts, dashboardMetrics, enhancedHistory, insights, liveMetrics, searchQuery]);

  const handleSelectResult = (result) => {
    setActiveView(result.view);
    setSearchQuery("");
  };

  const renderActiveView = () => {
    if (activeView === "home") {
      return (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.28fr)_360px]">
          <div className="space-y-6">
            <CameraPanel
              videoRef={videoRef}
              canvasRef={canvasRef}
              liveMetrics={liveMetrics}
              sessionActive={sessionActive}
              cameraReady={cameraReady}
              cameraError={cameraError}
              isInitializing={isInitializing}
              onStartSession={startSession}
              onStopSession={stopSession}
            />
            <HomeOverview
              liveMetrics={liveMetrics}
              alerts={alerts}
              dashboardMetrics={dashboardMetrics}
              insights={insights}
            />
          </div>

          <div className="space-y-6">
            <StatsPanel
              liveMetrics={liveMetrics}
              compact
            />
          </div>
        </div>
      );
    }

    if (activeView === "analytics") {
      return (
        <div className="space-y-6">
          <Dashboard
            trendData={trendData}
            sessionHistory={enhancedHistory}
            dashboardMetrics={dashboardMetrics}
          />
          <ExportPanel
            sessionHistory={enhancedHistory}
            dashboardMetrics={dashboardMetrics}
            settings={settings}
            storageMode={storageMode}
            isStorageReady={isStorageReady}
          />
        </div>
      );
    }

    if (activeView === "sessions") {
      return (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <SessionHistory sessionHistory={enhancedHistory} />
          <Dashboard
            trendData={trendData}
            sessionHistory={enhancedHistory}
            dashboardMetrics={dashboardMetrics}
          />
        </div>
      );
    }

    if (activeView === "insights") {
      return (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <InsightsPanel
              insights={insights}
              alerts={alerts}
              liveMetrics={liveMetrics}
              bestSession={dashboardMetrics.bestSession}
            />
            <Dashboard
              trendData={trendData}
              sessionHistory={enhancedHistory}
              dashboardMetrics={dashboardMetrics}
            />
          </div>

          <StatsPanel
            liveMetrics={liveMetrics}
          />
        </div>
      );
    }

    return (
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <SettingsPanel
            settings={settings}
            updateSetting={updateSetting}
            recommendedBaseline={recommendedBaseline}
            calibrateFromLiveSession={calibrateFromLiveSession}
            calibrateFromHistory={calibrateFromHistory}
            liveMetrics={liveMetrics}
            liveCalibration={liveCalibration}
          />
          <ExportPanel
            sessionHistory={enhancedHistory}
            dashboardMetrics={dashboardMetrics}
            settings={settings}
            storageMode={storageMode}
            isStorageReady={isStorageReady}
          />
        </div>

        <div className="space-y-6">
          {settings.debugMode ? <DebugPanel liveMetrics={liveMetrics} /> : null}
          <StatsPanel
            liveMetrics={liveMetrics}
            sessionActive={sessionActive}
            cameraReady={cameraReady}
          />
        </div>
      </div>
    );
  };

  if (auth.isChecking) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: "var(--bg-body)", color: "var(--text-secondary)" }}
      >
        <div className="rounded-3xl border px-6 py-5 text-sm" style={{ borderColor: "var(--border-color)", background: "var(--bg-panel)" }}>
          Verifying session...
        </div>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return <AuthScreen auth={auth} />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen" style={{ background: "var(--bg-app)", color: "var(--text-primary)" }}>
        <div className="relative flex min-h-screen">
          <Sidebar
            sessionActive={sessionActive}
            focusScore={liveMetrics.focusScore}
            alertsCount={alerts.length}
            totalSessions={enhancedHistory.length}
            activeView={activeView}
            onSelectView={setActiveView}
            onClose={sidebarOpen ? () => setSidebarOpen(false) : undefined}
          />

          <div className="flex min-h-screen min-w-0 flex-1 flex-col">
            <Navbar
              cameraReady={cameraReady}
              cameraError={cameraError}
              isInitializing={isInitializing}
              sessionActive={sessionActive}
              onStartSession={startSession}
              onStopSession={stopSession}
              currentView={currentView}
              searchValue={searchQuery}
              onSearchChange={setSearchQuery}
              user={auth.user}
              onLogout={auth.logout}
              onToggleSidebar={() => setSidebarOpen((v) => !v)}
            />

            <main className="flex-1 px-3 pb-6 pt-3 md:px-6 lg:px-7">
              <div className="mx-auto flex max-w-[1500px] flex-col gap-4 md:gap-6">
                <WorkspaceHero
                  currentView={currentView}
                  liveMetrics={liveMetrics}
                  totalSessions={enhancedHistory.length}
                  alertsCount={alerts.length}
                  sessionActive={sessionActive}
                />
                <SearchResults
                  query={searchQuery}
                  results={searchResults}
                  onSelectResult={handleSelectResult}
                  onClear={() => setSearchQuery("")}
                />
                {renderActiveView()}
              </div>
            </main>
          </div>
        </div>

        <AssistantPanel
          liveMetrics={liveMetrics}
          dashboardMetrics={dashboardMetrics}
          settings={settings}
          sessionHistory={enhancedHistory}
          liveCalibration={liveCalibration}
          groqCoach={groqCoach}
        />

        <SessionReportModal report={sessionReport} onClose={closeSessionReport} />
      </div>
    </ErrorBoundary>
  );
}

export default App;
