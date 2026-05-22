function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M12 12a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 0114 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PulseIcon() {
  return <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.85)]" />;
}

function NavbarPill({ label, value, tone = "slate" }) {
  const toneMap = {
    emerald: "border-emerald-400/20 bg-emerald-500/10 text-emerald-50",
    sky: "border-sky-400/20 bg-sky-500/10 text-sky-50",
    violet: "border-violet-400/20 bg-violet-500/10 text-violet-50",
    slate: "border-white/10 bg-white/[0.04] text-slate-100",
  };

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm ${
        toneMap[tone] ?? toneMap.slate
      }`}
    >
      <span className="text-[11px] uppercase tracking-[0.22em] text-slate-400">{label}</span>
      <span className="font-semibold text-white">{value}</span>
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
  user,
  onLogout,
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
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#07111f]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1550px] items-center gap-4 px-4 py-4 md:px-6 lg:px-7">
        <div className="hidden min-w-0 xl:block">
          <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">AuraSense</p>
          <p className="mt-1 truncate text-sm font-medium text-slate-200">{currentView.badge}</p>
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="hidden min-w-0 flex-1 items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 text-slate-400 md:flex">
            <SearchIcon />
            <input
              type="text"
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search sessions, reports, or support prompts"
              className="w-full bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-500"
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

        <div className="flex items-center gap-2 md:gap-3">
          <button
            type="button"
            onClick={onStartSession}
            disabled={!cameraReady || sessionActive || isInitializing}
            className="rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-950/35 transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Start
          </button>
          <button
            type="button"
            onClick={onStopSession}
            disabled={!sessionActive}
            className="hidden rounded-full border border-white/12 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-white/[0.08] md:block disabled:cursor-not-allowed disabled:opacity-50"
          >
            Stop
          </button>

          <div className="hidden items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2.5 md:flex">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 text-white">
              <UserIcon />
            </div>
            <div className="pr-1">
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Operator</p>
              <p className="text-sm font-medium text-white">{user?.name || "AuraSense User"}</p>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-white/[0.08]"
            >
              Logout
            </button>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] md:hidden">
            <PulseIcon />
          </div>
        </div>
      </div>

      {cameraError && (
        <div className="mx-4 mb-4 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200 md:mx-6 lg:mx-7">
          <span className="font-medium">Error:</span> {cameraError}
        </div>
      )}
    </header>
  );
}

export default Navbar;
