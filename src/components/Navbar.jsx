function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 0114 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PulseIcon() {
  return <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.85)]" />;
}

function NavbarPill({ label, value, tone = "slate" }) {
  const toneMap = {
    emerald: { bg: "rgba(52,211,153,0.12)", text: "#34d399", border: "rgba(52,211,153,0.25)" },
    sky: { bg: "rgba(56,189,248,0.12)", text: "#7dd3fc", border: "rgba(56,189,248,0.25)" },
    violet: { bg: "rgba(139,92,246,0.12)", text: "#a78bfa", border: "rgba(139,92,246,0.25)" },
    slate: { bg: "var(--bg-panel)", text: "var(--text-secondary)", border: "var(--border-color)" },
  };
  const t = toneMap[tone] || toneMap.slate;

  return (
    <div
      className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs"
      style={{ background: t.bg, borderColor: t.border, color: t.text }}
    >
      <span className="text-[10px] uppercase tracking-wider" style={{ opacity: 0.7 }}>{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function Navbar({
  cameraReady,
  cameraError,
  isInitializing,
  sessionActive,
  onStartSession,
  onStopSession,
  currentView,
  searchValue,
  onSearchChange,
  searchInputRef,
  user,
  onLogout,
  onToggleSidebar,
  onOpenProfile,
}) {
  const getStatusText = () => {
    if (cameraError) return "Camera error";
    if (isInitializing) return "Initializing";
    if (cameraReady) return "Camera ready";
    return "Camera offline";
  };

  const getStatusTone = () => {
    if (cameraError) return "violet";
    if (isInitializing) return "violet";
    if (cameraReady) return "emerald";
    return "slate";
  };

  return (
    <header
      className="sticky top-0 z-30 border-b backdrop-blur-xl"
      style={{ background: "color-mix(in srgb, var(--bg-app) 90%, transparent)", borderColor: "var(--border-color)" }}
    >
      <div className="mx-auto flex max-w-[1550px] items-center gap-2 px-3 py-2.5 md:px-6 lg:px-7">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-xl lg:hidden"
          style={{ color: "var(--text-secondary)" }}
          aria-label="Open navigation menu"
        >
          <MenuIcon />
        </button>

        <div className="hidden min-w-0 md:block lg:hidden xl:block">
          <p className="text-[10px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>AuraSense</p>
          <p className="mt-0.5 truncate text-sm font-medium" style={{ color: "var(--text-primary)" }}>{currentView.badge}</p>
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div
            className="hidden min-w-0 flex-1 items-center gap-3 rounded-full border px-4 py-2 md:flex"
            style={{ borderColor: "var(--border-color)", background: "var(--bg-panel-soft)" }}
          >
            <SearchIcon />
            <input
              ref={searchInputRef}
              type="search"
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search sessions, reports, or support prompts (press /)"
              className="w-full bg-transparent text-sm outline-none"
              style={{ color: "var(--text-primary)" }}
              aria-label="Search workspace"
            />
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            <NavbarPill label="View" value={currentView.badge} />
            <NavbarPill label="Status" value={getStatusText()} tone={getStatusTone()} />
            <NavbarPill
              label="Session"
              value={sessionActive ? "Running" : "Idle"}
              tone={sessionActive ? "sky" : "slate"}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {sessionActive ? (
            <button
              type="button"
              onClick={onStopSession}
              className="rounded-full border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
              style={{ borderColor: "var(--border-color)", background: "var(--bg-panel)", color: "var(--text-primary)" }}
            >
              Stop
            </button>
          ) : (
            <button
              type="button"
              onClick={onStartSession}
              disabled={!cameraReady || isInitializing}
              className="rounded-full px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, var(--accent-from), var(--accent-to))" }}
            >
              Start
            </button>
          )}

          <div
            className="hidden items-center gap-3 rounded-full border px-3 py-1.5 md:flex"
            style={{ borderColor: "var(--border-color)", background: "var(--bg-panel)" }}
          >
            <button type="button" onClick={onOpenProfile} className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full text-white"
                style={{ background: "linear-gradient(135deg, var(--accent-from), var(--accent-to))" }}
              >
                <UserIcon />
              </div>
              <div className="pr-1 text-left">
                <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Operator</p>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{user?.name || "User"}</p>
              </div>
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-full border px-3 py-1 text-xs font-medium transition"
              style={{ borderColor: "var(--border-color)", color: "var(--text-secondary)" }}
            >
              Logout
            </button>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full border md:hidden" style={{ borderColor: "var(--border-color)" }}>
            <PulseIcon />
          </div>
        </div>
      </div>

      {cameraError && (
        <div
          className="mx-3 mb-3 rounded-2xl border px-4 py-3 text-sm md:mx-6 lg:mx-7"
          style={{ borderColor: "rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.1)", color: "#fca5a5" }}
        >
          <span className="font-medium">Error:</span> {cameraError}
        </div>
      )}
    </header>
  );
}

export default Navbar;
