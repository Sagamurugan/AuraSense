import { useMemo, useState, useCallback } from "react";
import { getAssistantReply } from "../utils/assistant";

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M12 2l1.9 5.6L19.5 9l-5.6 1.4L12 16l-1.9-5.6L4.5 9l5.6-1.4L12 2z"
        fill="currentColor"
      />
      <path
        d="M18.5 14l.9 2.6L22 17.5l-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9.9-2.6zM6 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2z"
        fill="currentColor"
        opacity="0.8"
      />
    </svg>
  );
}

function MessageBubble({ role, content }) {
  return (
    <div
      className={`rounded-2xl p-3 text-sm leading-6 ${
        role === "assistant"
          ? "mr-8 bg-white/[0.06] text-slate-100"
          : "ml-8 bg-sky-500/15 text-sky-100"
      }`}
    >
      {content}
    </div>
  );
}

const GROQ_API_URL_INPUT = "https://console.groq.com/keys";

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
    if (groqCoach.status === "ready") {
      return {
        label: "Groq online",
        tone: "bg-emerald-400/15 text-emerald-200 border-emerald-400/20",
        hint: "Groq AI coaching is active.",
      };
    }
    if (groqCoach.status === "loading") {
      return {
        label: "Groq thinking",
        tone: "bg-sky-400/15 text-sky-100 border-sky-400/20",
        hint: "Generating a response...",
      };
    }
    if (groqCoach.status === "invalid-key") {
      return {
        label: "Invalid key",
        tone: "bg-red-400/15 text-red-200 border-red-400/20",
        hint: "Your Groq API key is invalid. Update it in settings.",
      };
    }
    if (groqCoach.status === "error") {
      return {
        label: "Groq error",
        tone: "bg-orange-400/15 text-orange-100 border-orange-400/20",
        hint: groqCoach.error || "An error occurred. Using local fallback.",
      };
    }
    return {
      label: "API key needed",
      tone: "bg-slate-400/15 text-slate-200 border-white/10",
      hint: "Add your free Groq API key for AI coaching.",
    };
  }, [groqCoach.status, groqCoach.error]);

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
      setMessages((current) => [
        ...current,
        { role: "assistant", content: groqReply.summary },
      ]);
      setIsSubmitting(false);
      return;
    }

    const fallbackReply = getAssistantReply(trimmed, {
      liveMetrics,
      dashboardMetrics,
      settings,
      sessionHistory,
      liveCalibration,
    });

    const fallbackNotice = !groqCoach.hasApiKey
      ? " To enable Groq AI coaching, add your free API key from console.groq.com."
      : " Groq is temporarily unavailable. Using local fallback.";

    setMessages((current) => [
      ...current,
      { role: "assistant", content: fallbackReply + fallbackNotice },
    ]);
    setIsSubmitting(false);
  }, [groqCoach, liveMetrics, dashboardMetrics, settings, sessionHistory, liveCalibration]);

  return (
    <>
      {isOpen && (
        <div className="pointer-events-none fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-[1px]" />
      )}

      <div className="fixed bottom-5 right-5 z-50 flex items-end justify-end">
        {isOpen && (
          <div className="pointer-events-auto mb-4 w-[min(92vw,380px)] overflow-hidden rounded-[28px] border border-white/10 bg-[#07111f]/95 shadow-[0_24px_80px_rgba(2,6,23,0.55)] backdrop-blur-xl">
            <div className="border-b border-white/10 bg-gradient-to-r from-sky-500/14 via-indigo-500/10 to-cyan-500/14 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.26em] text-slate-400">
                    AI Support
                  </p>
                  <h2 className="mt-2 text-lg font-semibold text-white">AuraSense Assistant</h2>
                  <p className="mt-1 text-sm text-slate-300">{statusMeta.hint}</p>
                </div>
                <div className="flex items-center gap-2">
                  {!groqCoach.hasApiKey && (
                    <button
                      type="button"
                      onClick={() => setShowKeyInput((v) => !v)}
                      className="rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1 text-xs text-sky-200 transition hover:bg-sky-500/20"
                    >
                      Add key
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-sm text-slate-200 transition hover:bg-white/[0.1]"
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
                    className="flex-1 rounded-xl border border-white/10 bg-[#020617] px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={handleSetKey}
                    disabled={!keyInput.trim()}
                    className="rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    Save
                  </button>
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusMeta.tone}`}>
                  {statusMeta.label}
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-300">
                  Focus {liveMetrics.focusScore}
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-300">
                  Fatigue {liveMetrics.fatigueScore}%
                </span>
              </div>
            </div>

            <div className="max-h-[340px] space-y-3 overflow-y-auto p-4">
              {messages.map((message, index) => (
                <MessageBubble
                  key={`${message.role}-${index}`}
                  role={message.role}
                  content={message.content}
                />
              ))}
              {isSubmitting && (
                <MessageBubble
                  role="assistant"
                  content={
                    groqCoach.status === "loading"
                      ? "Groq is generating a response..."
                      : "Processing your question..."
                  }
                />
              )}
            </div>

            <div className="border-t border-white/10 bg-slate-950/55 p-4">
              <div className="mb-3 grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => askAssistant("How is my focus right now?")}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-slate-200 transition hover:bg-white/[0.08]"
                >
                  Focus
                </button>
                <button
                  type="button"
                  onClick={() => askAssistant("What is causing my fatigue?")}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-slate-200 transition hover:bg-white/[0.08]"
                >
                  Fatigue
                </button>
                <button
                  type="button"
                  onClick={() => askAssistant("Give me a productivity tip based on my data")}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-slate-200 transition hover:bg-white/[0.08]"
                >
                  Tips
                </button>
              </div>

              <form
                className="flex gap-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  askAssistant(input);
                }}
              >
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ask AuraSense support..."
                  className="flex-1 rounded-2xl border border-white/10 bg-[#020617] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !input.trim()}
                  className="rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Send
                </button>
              </form>

              <p className="mt-3 text-xs text-slate-500">
                Sessions: {sessionHistory.length} · Goal {settings.sessionGoalMinutes} min
                {groqCoach.hasApiKey ? " · Groq ready" : " · No API key"}
              </p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full border border-sky-400/30 bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-[0_18px_44px_rgba(37,99,235,0.35)] transition hover:scale-[1.03] hover:shadow-[0_20px_54px_rgba(59,130,246,0.42)]"
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