function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-4.5v-5h-5v5H5a1 1 0 01-1-1v-9.5z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AnalyticsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M4 19h16M7 15l3-4 3 2 4-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="7" cy="15" r="1.2" fill="currentColor" />
      <circle cx="10" cy="11" r="1.2" fill="currentColor" />
      <circle cx="13" cy="13" r="1.2" fill="currentColor" />
      <circle cx="17" cy="7" r="1.2" fill="currentColor" />
    </svg>
  );
}

function SessionsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M7 4v3M17 4v3M5 8h14M6 20h12a1 1 0 001-1V8H5v11a1 1 0 001 1z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InsightsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M12 3l2.2 4.8L19 10l-4.8 2.2L12 17l-2.2-4.8L5 10l4.8-2.2L12 3z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M12 8.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7zm8 3.5l-1.7.9.1 1.8-1.8 1-1.3-1.2-1.8.6-.6 1.8h-2l-.6-1.8-1.8-.6-1.3 1.2-1.8-1 .1-1.8L4 12l.9-1.7-.1-1.8 1.8-1 1.3 1.2 1.8-.6.6-1.8h2l.6 1.8 1.8.6 1.3-1.2 1.8 1-.1 1.8L20 12z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const navItems = [
  {
    id: "home",
    label: "Home",
    description: "Live workspace",
    icon: HomeIcon,
    chip: "bg-sky-500/15 text-sky-100 border-sky-400/25",
    glow: "from-sky-400/25 to-cyan-400/10",
  },
  {
    id: "analytics",
    label: "Analytics",
    description: "Trends and reports",
    icon: AnalyticsIcon,
    chip: "bg-violet-500/15 text-violet-100 border-violet-400/25",
    glow: "from-violet-400/25 to-indigo-400/10",
  },
  {
    id: "sessions",
    label: "Sessions",
    description: "History and review",
    icon: SessionsIcon,
    chip: "bg-emerald-500/15 text-emerald-100 border-emerald-400/25",
    glow: "from-emerald-400/25 to-teal-400/10",
  },
  {
    id: "insights",
    label: "Insights",
    description: "Coaching and alerts",
    icon: InsightsIcon,
    chip: "bg-amber-500/15 text-amber-100 border-amber-400/25",
    glow: "from-amber-400/25 to-orange-400/10",
  },
  {
    id: "settings",
    label: "Settings",
    description: "Calibration controls",
    icon: SettingsIcon,
    chip: "bg-fuchsia-500/15 text-fuchsia-100 border-fuchsia-400/25",
    glow: "from-fuchsia-400/25 to-pink-400/10",
  },
];

function RailStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function Sidebar({ sessionActive, focusScore, alertsCount, totalSessions, activeView, onSelectView }) {
  return (
    <aside className="hidden w-[292px] shrink-0 border-r border-white/10 bg-[#050d19] px-5 py-5 lg:block">
      <div className="sticky top-5 flex min-h-[calc(100vh-2.5rem)] flex-col">
        <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-sky-500/12 via-transparent to-indigo-500/10 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-500 text-lg font-semibold text-white shadow-lg shadow-sky-950/35">
              A
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[0.18em] text-white">AURASENSE</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.24em] text-slate-500">
                Smart wellness ops
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/35 p-4">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Session mode</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {sessionActive ? "Active" : "Standby"}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Navigation stays separate from the live camera pipeline, so sessions keep running while you move across views.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <p className="px-2 text-[11px] uppercase tracking-[0.24em] text-slate-500">Workspace</p>
          <div className="mt-3 space-y-2">
            {navItems.map((item) => {
              const isActive = item.id === activeView;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectView(item.id)}
                  className={`relative w-full overflow-hidden rounded-2xl border px-3 py-3 text-left transition ${
                    isActive
                      ? "border-white/10 bg-white/[0.06] shadow-lg shadow-slate-950/20"
                      : "border-transparent bg-transparent hover:border-white/8 hover:bg-white/[0.035]"
                  }`}
                >
                  {isActive ? (
                    <div className={`absolute inset-0 bg-gradient-to-r ${item.glow}`} />
                  ) : null}
                  <div className="relative flex items-center gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${item.chip}`}>
                      <Icon />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white">{item.label}</p>
                      <p className="mt-1 text-sm text-slate-400">{item.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 grid gap-3">
          <RailStat label="Focus score" value={focusScore} />
          <div className="grid grid-cols-2 gap-3">
            <RailStat label="Alerts" value={alertsCount} />
            <RailStat label="Sessions" value={totalSessions} />
          </div>
        </div>

        <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Operator note</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            For the best live predictions, keep your full face visible and use the validation tools in Settings when recalibrating.
          </p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
