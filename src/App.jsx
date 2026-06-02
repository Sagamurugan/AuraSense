import { lazy, Suspense, useCallback, useMemo, useRef, useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import CameraPanel from "./components/CameraPanel";
import StatsPanel from "./components/StatsPanel";
import HomeOverview from "./components/HomeOverview";
import AssistantPanel from "./components/AssistantPanel";
import SessionReportModal from "./components/SessionReportModal";
import ProfileModal from "./components/ProfileModal";
import DebugPanel from "./components/DebugPanel";
import ErrorBoundary from "./components/ErrorBoundary";
import AuthScreen from "./components/AuthScreen";
import OfflineBanner from "./components/OfflineBanner";
import MobileBottomNav from "./components/MobileBottomNav";
import ViewErrorBoundary from "./components/ViewErrorBoundary";
import { PanelSkeleton } from "./components/ViewSkeleton";
import useFaceMesh from "./hooks/useFaceMesh";
import useSessionAnalytics from "./hooks/useSessionAnalytics";
import useSessionStorage from "./hooks/useSessionStorage";
import useUserSettings from "./hooks/useUserSettings";
import useGroqCoach from "./hooks/useGroqCoach";
import useAuth from "./hooks/useAuth";
import useOnlineStatus from "./hooks/useOnlineStatus";
import useKeyboardShortcuts from "./hooks/useKeyboardShortcuts";
import { useTheme } from "./context/ThemeContext";

const Dashboard = lazy(() => import("./components/Dashboard"));
const SessionHistory = lazy(() => import("./components/SessionHistory"));
const InsightsPanel = lazy(() => import("./components/InsightsPanel"));
const SettingsPanel = lazy(() => import("./components/SettingsPanel"));
const ExportPanel = lazy(() => import("./components/ExportPanel"));
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
      <div className="flex flex-col gap-3 pb-4 md:flex-row md:items-center md:justify-between" style={{ borderBottom: "1px solid var(--border-color)" }}>
        <div>
          <p className="text-xs uppercase tracking-[0.28em]" style={{ color: "var(--text-muted)" }}>Search</p>
          <h2 className="mt-2 text-xl font-semibold" style={{ color: "var(--text-primary)" }}>Results for "{query}"</h2>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="rounded-full border px-4 py-2 text-sm transition"
          style={{ borderColor: "var(--border-color)", background: "var(--bg-panel-soft)", color: "var(--text-secondary)" }}
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
              className="rounded-2xl border px-4 py-4 text-left transition"
              style={{ borderColor: "var(--border-color)", background: "var(--bg-panel-soft)" }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{result.title}</p>
                  <p className="mt-1 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>{result.description}</p>
                </div>
                <span className="rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.22em]" style={{ borderColor: "var(--border-color)", background: "var(--bg-panel)", color: "var(--text-muted)" }}>
                  {result.view}
                </span>
              </div>
            </button>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed px-4 py-6 text-sm" style={{ borderColor: "var(--border-color)", background: "var(--bg-elevated)", color: "var(--text-secondary)" }}>
            No matching workspace items were found. Try terms like focus, fatigue, exports, sessions, or settings.
          </div>
        )}
      </div>
    </section>
  );
}

function LazyView({ children }) {
  return <Suspense fallback={<PanelSkeleton />}>{children}</Suspense>;
}

function App() {
  const auth = useAuth();
  const { toggleTheme } = useTheme();
  const isOnline = useOnlineStatus();
  const searchInputRef = useRef(null);
  const [activeView, setActiveView] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [liveAnnouncement, setLiveAnnouncement] = useState("");
  const {
    sessionHistory,
    setSessionHistory,
    storageMode,
    isStorageReady,
    storageError,
    deleteSession,
    updateSession,
  } = useSessionStorage(auth.token);
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

  const { cameraReady, cameraError, isInitializing, modelLoadMessage, retryCamera, videoRef, canvasRef } =
    useFaceMesh({
      sessionActiveRef,
      sessionStartRef,
      statsRef,
      settings,
      onMetricsUpdate: handleMetricsUpdate,
      onTrendSample: handleTrendSample,
      enabled: auth.isAuthenticated,
      showMeshOverlay: settings.showMeshOverlay !== false,
    });

  const wrappedStartSession = useCallback(() => {
    startSession();
    setLiveAnnouncement("Monitoring session started.");
  }, [startSession]);

  const wrappedStopSession = useCallback(() => {
    stopSession();
    setLiveAnnouncement("Monitoring session ended.");
  }, [stopSession]);

  useKeyboardShortcuts({
    enabled: auth.isAuthenticated,
    onToggleSession: () => (sessionActive ? wrappedStopSession() : wrappedStartSession()),
    onToggleTheme: toggleTheme,
    onNavigate: setActiveView,
    onFocusSearch: () => searchInputRef.current?.focus(),
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
              modelLoadMessage={modelLoadMessage}
              onRetryCamera={retryCamera}
              showMeshOverlay={settings.showMeshOverlay !== false}
              onToggleMeshOverlay={() => updateSetting("showMeshOverlay", !settings.showMeshOverlay)}
              onStartSession={wrappedStartSession}
              onStopSession={wrappedStopSession}
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
        <ViewErrorBoundary title="Analytics failed to load.">
          <div className="space-y-6">
            <LazyView>
              <Dashboard
                trendData={trendData}
                sessionHistory={enhancedHistory}
                dashboardMetrics={dashboardMetrics}
              />
            </LazyView>
            <LazyView>
              <ExportPanel
                sessionHistory={enhancedHistory}
                dashboardMetrics={dashboardMetrics}
                settings={settings}
                storageMode={storageMode}
                isStorageReady={isStorageReady}
              />
            </LazyView>
          </div>
        </ViewErrorBoundary>
      );
    }

    if (activeView === "sessions") {
      return (
        <ViewErrorBoundary title="Session library failed to load.">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)] xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
            <LazyView>
              <SessionHistory
                sessionHistory={enhancedHistory}
                onDeleteSession={deleteSession}
                onUpdateSession={updateSession}
              />
            </LazyView>
            <LazyView>
              <Dashboard
                trendData={trendData}
                sessionHistory={enhancedHistory}
                dashboardMetrics={dashboardMetrics}
              />
            </LazyView>
          </div>
        </ViewErrorBoundary>
      );
    }

    if (activeView === "insights") {
      return (
        <ViewErrorBoundary title="Insights failed to load.">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-6">
              <LazyView>
                <InsightsPanel
                  insights={insights}
                  alerts={alerts}
                  liveMetrics={liveMetrics}
                  bestSession={dashboardMetrics.bestSession}
                />
              </LazyView>
              <LazyView>
                <Dashboard
                  trendData={trendData}
                  sessionHistory={enhancedHistory}
                  dashboardMetrics={dashboardMetrics}
                />
              </LazyView>
            </div>
            <StatsPanel liveMetrics={liveMetrics} />
          </div>
        </ViewErrorBoundary>
      );
    }

    return (
      <ViewErrorBoundary title="Settings failed to load.">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <LazyView>
              <SettingsPanel
                settings={settings}
                updateSetting={updateSetting}
                recommendedBaseline={recommendedBaseline}
                calibrateFromLiveSession={calibrateFromLiveSession}
                calibrateFromHistory={calibrateFromHistory}
                liveMetrics={liveMetrics}
                liveCalibration={liveCalibration}
                onResetSettings={() => {
                  if (window.confirm("Reset all settings to defaults?")) {
                    localStorage.removeItem("aura-sense-settings");
                    window.location.reload();
                  }
                }}
                onExportSettings={() => {
                  const blob = new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const anchor = document.createElement("a");
                  anchor.href = url;
                  anchor.download = "aurasense-settings.json";
                  anchor.click();
                  URL.revokeObjectURL(url);
                }}
                onImportSettings={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "application/json";
                  input.onchange = async () => {
                    const file = input.files?.[0];
                    if (!file) return;
                    const text = await file.text();
                    const parsed = JSON.parse(text);
                    Object.entries(parsed).forEach(([key, value]) => updateSetting(key, value));
                  };
                  input.click();
                }}
              />
            </LazyView>
            <LazyView>
              <ExportPanel
                sessionHistory={enhancedHistory}
                dashboardMetrics={dashboardMetrics}
                settings={settings}
                storageMode={storageMode}
                isStorageReady={isStorageReady}
              />
            </LazyView>
          </div>
          <div className="space-y-6">
            {settings.debugMode ? <DebugPanel liveMetrics={liveMetrics} /> : null}
            <StatsPanel liveMetrics={liveMetrics} />
          </div>
        </div>
      </ViewErrorBoundary>
    );
  };

  if (auth.isChecking) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: "var(--bg-body)", color: "var(--text-secondary)" }}
      >
        <div className="rounded-3xl px-6 py-5 text-sm" style={{ border: "1px solid var(--border-color)", background: "var(--bg-panel)", color: "var(--text-primary)" }}>
          Verifying session...
        </div>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return <AuthScreen auth={auth} />;
  }

  if (!isStorageReady && auth.isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "var(--bg-body)" }}>
        <PanelSkeleton />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen pb-20 lg:pb-0" style={{ background: "var(--bg-app)", color: "var(--text-primary)" }}>
        <OfflineBanner isOnline={isOnline} />
        <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {liveAnnouncement}
        </div>
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
              onStartSession={wrappedStartSession}
              onStopSession={wrappedStopSession}
              currentView={currentView}
              searchValue={searchQuery}
              onSearchChange={setSearchQuery}
              searchInputRef={searchInputRef}
              user={auth.user}
              onLogout={auth.logout}
              onToggleSidebar={() => setSidebarOpen((v) => !v)}
              onOpenProfile={() => { setProfileOpen(true); setSidebarOpen(false) }}
            />

            <main className="flex-1 px-3 pb-6 pt-3 md:px-6 lg:px-7">
              <div className="mx-auto flex max-w-[1500px] flex-col gap-4 md:gap-6">
                {storageError && (
                  <div
                    role="alert"
                    className="rounded-2xl border px-4 py-3 text-sm"
                    style={{ borderColor: "rgba(239,68,68,0.3)", color: "#fca5a5" }}
                  >
                    {storageError}
                  </div>
                )}
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

        <MobileBottomNav
          activeView={activeView}
          onSelectView={setActiveView}
          sessionActive={sessionActive}
          onToggleSession={() => (sessionActive ? wrappedStopSession() : wrappedStartSession())}
        />

        <SessionReportModal report={sessionReport} onClose={closeSessionReport} />
        {profileOpen && (
          <ProfileModal
            user={auth.user}
            authToken={auth.token}
            onClose={() => setProfileOpen(false)}
            onUpdate={(updated) => auth.updateAuthSessionProfile(updated)}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
