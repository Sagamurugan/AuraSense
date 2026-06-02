import { useEffect } from "react";

export default function useKeyboardShortcuts({
  onToggleSession,
  onToggleTheme,
  onNavigate,
  onFocusSearch,
  enabled = true,
}) {
  useEffect(() => {
    if (!enabled) return undefined;

    const onKeyDown = (event) => {
      const target = event.target;
      const tag = target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select" || target?.isContentEditable) {
        return;
      }

      if (event.key === "/" && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        onFocusSearch?.();
        return;
      }

      if (event.key === "s" || event.key === "S") {
        event.preventDefault();
        onToggleSession?.();
        return;
      }

      if (event.key === "d" || event.key === "D") {
        event.preventDefault();
        onToggleTheme?.();
        return;
      }

      const viewMap = { 1: "home", 2: "analytics", 3: "sessions", 4: "insights", 5: "settings" };
      if (viewMap[event.key]) {
        event.preventDefault();
        onNavigate?.(viewMap[event.key]);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, onFocusSearch, onNavigate, onToggleSession, onToggleTheme]);
}
