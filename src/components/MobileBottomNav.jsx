const items = [
  { id: "home", label: "Home", icon: "M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-4.5v-5h-5v5H5a1 1 0 01-1-1v-9.5z" },
  { id: "analytics", label: "Charts", icon: "M4 19h16M7 15l3-4 3 2 4-6" },
  { id: "sessions", label: "Sessions", icon: "M7 4v3M17 4v3M5 8h14M6 20h12a1 1 0 001-1V8H5v11a1 1 0 001 1z" },
  { id: "insights", label: "Coach", icon: "M12 3l2.2 4.8L19 10l-4.8 2.2L12 17l-2.2-4.8L5 10l4.8-2.2L12 3z" },
  { id: "settings", label: "Settings", icon: "M12 8.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z" },
];

function MobileBottomNav({ activeView, onSelectView, sessionActive, onToggleSession }) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t pb-[env(safe-area-inset-bottom)] lg:hidden"
      style={{ borderColor: "var(--border-color)", background: "var(--sidebar-bg)" }}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="grid grid-cols-6 gap-1 px-2 py-2">
        {items.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectView(item.id)}
              className="flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-medium"
              style={{
                color: isActive ? "var(--accent-from)" : "var(--text-muted)",
                background: isActive ? "var(--nav-active)" : "transparent",
              }}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                <path d={item.icon} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {item.label}
            </button>
          );
        })}
        <button
          type="button"
          onClick={onToggleSession}
          className="flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-semibold text-white"
          style={{ background: sessionActive ? "#ef4444" : "linear-gradient(135deg, var(--accent-from), var(--accent-to))" }}
          aria-label={sessionActive ? "Stop session" : "Start session"}
        >
          <span className="flex h-5 w-5 items-center justify-center text-base leading-none">
            {sessionActive ? "■" : "▶"}
          </span>
          {sessionActive ? "Stop" : "Start"}
        </button>
      </div>
    </nav>
  );
}

export default MobileBottomNav;
