import { useMemo, useState, useCallback } from "react";
import { getAssistantReply } from "../utils/assistant";

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M12 2l1.9 5.6L19.5 9l-5.6 1.4L12 16l-1.9-5.6L4.5 9l5.6-1.4L12 2z" fill="currentColor" />
      <path d="M18.5 14l.9 2.6L22 17.5l-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9.9-2.6zM6 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2z" fill="currentColor" opacity="0.8" />
    </svg>
  );
}

function MessageBubble({ role, content }) {
  return (
    <div
      className="rounded-2xl p-3 text-sm leading-6"
      style={{
        marginRight: role === "assistant" ? "32px" : "0",
        marginLeft: role === "user" ? "32px" : "0",
        background: role === "assistant" ? "var(--bg-panel)" : "rgba(56,189,248,0.15)",
        color: role === "assistant" ? "var(--text-primary)" : "#7dd3fc",
        border: role === "assistant" ? "1px solid var(--border-color)" : "1px solid rgba(56,189,248,0.2)",
      }}
    >
      {content}
    </div>
  );
}

function AssistantPanel({
  liveMetrics,
  dashboardMetrics,
  settings,
  sessionHistory,
  liveCalibration,
  groqCoach,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "AuraSense support is ready. Ask about focus, fatigue, posture, or your session trends. Powered by Groq AI for fast, intelligent responses.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusMeta = useMemo(() => {
    if (groqCoach.status === "ready") return { label: "Groq online", tone: "emerald", hint: "Groq AI coaching is active." };
    if (groqCoach.status === "loading") return { label: "Groq thinking", tone: "sky", hint: "Generating a response..." };
    if (groqCoach.status === "invalid-key") return { label: "Invalid key", tone: "red", hint: "Your Groq API key is invalid. Update it in settings." };
    if (groqCoach.status === "error") return { label: "Groq error", tone: "orange", hint: groqCoach.error || "An error occurred. Using local fallback." };
    return { label: "API key needed", tone: "slate", hint: "Add your free Groq API key for AI coaching." };
  }, [groqCoach.status, groqCoach.error]);

  const toneStyles = {
    emerald: { bg: "rgba(52,211,153,0.12)", text: "#34d399", border: "rgba(52,211,153,0.25)" },
    sky: { bg: "rgba(56,189,248,0.12)", text: "#7dd3fc", border: "rgba(56,189,248,0.25)" },
    red: { bg: "rgba(239,68,68,0.12)", text: "#f87171", border: "rgba(239,68,68,0.25)" },
    orange: { bg: "rgba(251,146,60,0.12)", text: "#fb923c", border: "rgba(251,146,60,0.25)" },
    slate: { bg: "var(--bg-panel)", text: "var(--text-secondary)", border: "var(--border-color)" },
  };

  const st = toneStyles[statusMeta.tone] || toneStyles.slate;

  const handleSetKey = () => {
    if (keyInput.trim()) {
      groqCoach.updateApiKey(keyInput.trim());
      setShowKeyInput(false);
      setKeyInput("");
    }
  };

  const askAssistant = useCallback(async (question) => {
    const trimmed = question.trim();
    if (!trimmed) return;

    setMessages((current) => [...current, { role: "user", content: trimmed }]);
    setInput("");
    setIsSubmitting(true);

    const groqReply = await groqCoach.askGroq(trimmed);
    if (groqReply?.summary) {
      setMessages((current) => [...current, { role: "assistant", content: groqReply.summary }]);
      setIsSubmitting(false);
      return;
    }

    const fallbackReply = getAssistantReply(trimmed, { liveMetrics, dashboardMetrics, settings, sessionHistory, liveCalibration });
    const fallbackNotice = !groqCoach.hasApiKey
      ? " To enable Groq AI coaching, add your free API key from console.groq.com."
      : " Groq is temporarily unavailable. Using local fallback.";
    setMessages((current) => [...current, { role: "assistant", content: fallbackReply + fallbackNotice }]);
    setIsSubmitting(false);
  }, [groqCoach, liveMetrics, dashboardMetrics, settings, sessionHistory, liveCalibration]);

  return (
    <>
      {isOpen && (
        <div className="pointer-events-none fixed inset-0 z-40" style={{ background: "var(--overlay)" }} />
      )}

      <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] right-4 z-50 flex items-end justify-end lg:bottom-5 lg:right-5">
        {isOpen && (
          <div
            className="pointer-events-auto mb-4 w-[min(92vw,380px)] overflow-hidden rounded-[28px] border shadow-2xl backdrop-blur-xl"
            style={{ borderColor: "var(--border-color)", background: "color-mix(in srgb, var(--bg-body) 95%, transparent)" }}
          >
            <div
              className="border-b p-4"
              style={{ borderColor: "var(--border-color)", background: "linear-gradient(135deg, rgba(56,189,248,0.08), rgba(129,140,248,0.06))" }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>AI Support</p>
                  <h2 className="mt-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>AuraSense Assistant</h2>
                  <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>{statusMeta.hint}</p>
                </div>
                <div className="flex items-center gap-2">
                  {!groqCoach.hasApiKey && (
                    <button
                      type="button"
                      onClick={() => setShowKeyInput((v) => !v)}
                      className="rounded-full border px-3 py-1 text-xs transition"
                      style={{ borderColor: "rgba(56,189,248,0.25)", background: "rgba(56,189,248,0.1)", color: "#7dd3fc" }}
                    >
                      Add key
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="rounded-full border px-3 py-1 text-sm transition"
                    style={{ borderColor: "var(--border-color)", color: "var(--text-secondary)" }}
                  >
                    Close
                  </button>
                </div>
              </div>

              {showKeyInput && (
                <div className="mt-3 flex gap-2">
                  <input
                    type="password"
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    placeholder="gsk_..."
                    className="flex-1 rounded-xl border px-3 py-2 text-sm outline-none"
                    style={{ borderColor: "var(--border-color)", background: "var(--bg-app)", color: "var(--text-primary)" }}
                  />
                  <button
                    type="button"
                    onClick={handleSetKey}
                    disabled={!keyInput.trim()}
                    className="rounded-xl px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg, var(--accent-from), var(--accent-to))" }}
                  >
                    Save
                  </button>
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span
                  className="rounded-full border px-3 py-1 text-xs font-semibold"
                  style={{ background: st.bg, borderColor: st.border, color: st.text }}
                >
                  {statusMeta.label}
                </span>
                <span className="rounded-full border px-3 py-1 text-xs" style={{ borderColor: "var(--border-color)", background: "var(--bg-panel)", color: "var(--text-secondary)" }}>
                  Focus {liveMetrics.focusScore}
                </span>
                <span className="rounded-full border px-3 py-1 text-xs" style={{ borderColor: "var(--border-color)", background: "var(--bg-panel)", color: "var(--text-secondary)" }}>
                  Fatigue {liveMetrics.fatigueScore}%
                </span>
              </div>
            </div>

            <div className="max-h-[340px] space-y-3 overflow-y-auto p-4">
              {messages.map((message, index) => (
                <MessageBubble key={`${message.role}-${index}`} role={message.role} content={message.content} />
              ))}
              {isSubmitting && (
                <MessageBubble
                  role="assistant"
                  content={groqCoach.status === "loading" ? "Groq is generating a response..." : "Processing your question..."}
                />
              )}
            </div>

            <div className="border-t p-4" style={{ borderColor: "var(--border-color)", background: "var(--sidebar-bg)" }}>
              <div className="mb-3 grid grid-cols-3 gap-2 text-xs">
                {["Focus", "Fatigue", "Tips"].map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => askAssistant(label === "Tips" ? "Give me a productivity tip based on my data" : `How is my ${label.toLowerCase()} right now?`)}
                    className="rounded-2xl border px-3 py-2 transition"
                    style={{ borderColor: "var(--border-color)", background: "var(--bg-panel)", color: "var(--text-secondary)" }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <form className="flex gap-3" onSubmit={(event) => { event.preventDefault(); askAssistant(input); }}>
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ask AuraSense support..."
                  className="flex-1 rounded-2xl border px-4 py-3 text-sm outline-none"
                  style={{ borderColor: "var(--border-color)", background: "var(--bg-app)", color: "var(--text-primary)" }}
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !input.trim()}
                  className="rounded-2xl px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, var(--accent-from), var(--accent-to))" }}
                >
                  Send
                </button>
              </form>

              <p className="mt-3 text-xs" style={{ color: "var(--text-muted)" }}>
                Sessions: {sessionHistory.length} &middot; Goal {settings.sessionGoalMinutes} min
                {groqCoach.hasApiKey ? " · Groq ready" : " · No API key"}
              </p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition hover:scale-[1.03]"
          style={{
            background: "linear-gradient(135deg, var(--accent-from), var(--accent-to))",
            boxShadow: "0 18px 44px rgba(37,99,235,0.35)",
          }}
          aria-label="Toggle AuraSense AI support"
          title="AuraSense AI support"
        >
          <SparkIcon />
        </button>
      </div>
    </>
  );
}

export default AssistantPanel;
