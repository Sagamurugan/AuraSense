import { useState } from "react";
import { useTheme } from "../context/ThemeContext";

function NavIcon({ type }) {
  const icons = {
    home: "M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-4.5v-5h-5v5H5a1 1 0 01-1-1v-9.5z",
    analytics: "M4 19h16M7 15l3-4 3 2 4-6",
    sessions: "M7 4v3M17 4v3M5 8h14M6 20h12a1 1 0 001-1V8H5v11a1 1 0 001 1z",
    insights: "M12 3l2.2 4.8L19 10l-4.8 2.2L12 17l-2.2-4.8L5 10l4.8-2.2L12 3z",
    settings: "M12 8.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7zm8 3.5l-1.7.9.1 1.8-1.8 1-1.3-1.2-1.8.6-.6 1.8h-2l-.6-1.8-1.8-.6-1.3 1.2-1.8-1 .1-1.8L4 12l.9-1.7-.1-1.8 1.8-1 1.3 1.2 1.8-.6.6-1.8h2l.6 1.8 1.8.6 1.3-1.2 1.8 1-.1 1.8L20 12z",
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0" aria-hidden="true">
      <path d={icons[type] || icons.home} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const navGroups = [
  {
    label: "Main",
    items: [
      { id: "home", label: "Home", icon: "home" },
      { id: "analytics", label: "Analytics", icon: "analytics" },
    ],
  },
  {
    label: "Analysis",
    items: [
      { id: "sessions", label: "Sessions", icon: "sessions" },
      { id: "insights", label: "Insights", icon: "insights" },
    ],
  },
  {
    label: "System",
    items: [
      { id: "settings", label: "Settings", icon: "settings" },
    ],
  },
];

function Sidebar({ focusScore, totalSessions, activeView, onSelectView, onClose }) {
  const { toggleTheme, isDark } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r transition-all duration-300 lg:static lg:z-auto lg:translate-x-0 ${
          collapsed ? "w-[68px]" : "w-[260px]"
        } ${onClose ? "translate-x-0" : "-translate-x-full"}`}
        style={{
          background: "var(--sidebar-bg)",
          borderColor: "var(--border-color)",
        }}
      >
        <div className="flex h-full flex-col">
          <div className={`flex items-center gap-3 border-b px-4 py-4`} style={{ borderColor: "var(--border-color)" }}>
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-semibold text-white text-sm"
              style={{ background: "linear-gradient(135deg, var(--accent-from), var(--accent-to))" }}
            >
              A
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm font-semibold tracking-wide" style={{ color: "var(--text-primary)" }}>AURASENSE</p>
                <p className="text-[10px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Focus intelligence</p>
              </div>
            )}
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4">
            {navGroups.map((group) => (
              <div key={group.label} className="mb-5">
                {!collapsed && (
                  <p className="mb-2 px-3 text-[10px] uppercase tracking-widest font-semibold" style={{ color: "var(--text-muted)" }}>
                    {group.label}
                  </p>
                )}
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = item.id === activeView;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        title={collapsed ? item.label : undefined}
                        aria-label={item.label}
                        onClick={() => {
                          onSelectView(item.id);
                          onClose?.();
                        }}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                          collapsed ? "justify-center px-0" : ""
                        }`}
                        style={{
                          background: isActive ? "var(--nav-active)" : "transparent",
                          color: isActive ? "var(--accent-from)" : "var(--text-secondary)",
                        }}
                        onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "var(--nav-hover)"; }}
                        onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                      >
                        <NavIcon type={item.icon} />
                        {!collapsed && <span>{item.label}</span>}
                        {isActive && !collapsed && (
                          <span className="ml-auto h-2 w-2 rounded-full" style={{ background: "var(--accent-from)" }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="border-t px-3 py-3 space-y-2" style={{ borderColor: "var(--border-color)" }}>
            <div className={`grid gap-2 ${collapsed ? "" : "grid-cols-2"}`}>
              {!collapsed && (
                <>
                  <div className="rounded-xl px-3 py-2" style={{ background: "var(--bg-panel)", border: "1px solid var(--border-color)" }}>
                    <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Focus</p>
                    <p className="text-sm font-semibold mt-0.5" style={{ color: "var(--text-primary)" }}>{focusScore}</p>
                  </div>
                  <div className="rounded-xl px-3 py-2" style={{ background: "var(--bg-panel)", border: "1px solid var(--border-color)" }}>
                    <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Sessions</p>
                    <p className="text-sm font-semibold mt-0.5" style={{ color: "var(--text-primary)" }}>{totalSessions}</p>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all"
                style={{ background: "var(--bg-panel)", border: "1px solid var(--border-color)", color: "var(--text-secondary)" }}
              >
                {isDark ? (
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4"><circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.8" /><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                )}
                {!collapsed && <span>{isDark ? "Dark" : "Light"}</span>}
              </button>
              <button
                type="button"
                onClick={() => setCollapsed((c) => !c)}
                className="flex items-center justify-center rounded-xl px-3 py-2.5 transition-all"
                style={{ background: "var(--bg-panel)", border: "1px solid var(--border-color)", color: "var(--text-muted)" }}
                title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                  <path d={collapsed ? "M9 18l6-6-6-6" : "M15 18l-6-6 6-6"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div
        className="fixed inset-0 z-40 lg:hidden"
        style={{ display: onClose ? "block" : "none", background: "var(--overlay)" }}
        onClick={onClose}
      />
    </>
  );
}

export default Sidebar;
