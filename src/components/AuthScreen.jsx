import { useState } from "react";

function AuthInput({ label, type = "text", value, onChange, placeholder, error }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium" style={{ color: "var(--text-primary)" }}>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border px-4 py-3 text-sm outline-none transition placeholder:text-sm"
        style={{
          borderColor: error ? "rgba(239,68,68,0.5)" : "var(--border-color)",
          background: "var(--bg-panel-soft)",
          color: "var(--text-primary)",
        }}
      />
      {error && <p className="mt-1 text-xs" style={{ color: "#f87171" }}>{error}</p>}
    </label>
  );
}

function AuthScreen({ auth }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [localError, setLocalError] = useState("");

  const validate = () => {
    const errors = {};
    if (mode === "register" && !name.trim()) errors.name = "Name is required.";
    if (!email.trim()) errors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = "Invalid email format.";
    if (!password) errors.password = "Password is required.";
    else if (password.length < 6) errors.password = "Password must be at least 6 characters.";
    else if (!/[A-Z]/.test(password)) errors.password = "Must contain an uppercase letter.";
    else if (!/[0-9]/.test(password)) errors.password = "Must contain a number.";
    if (mode === "register" && password !== confirmPassword) errors.confirmPassword = "Passwords do not match.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    setLocalError("");
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      if (mode === "register") {
        await auth.register({ name: name.trim(), email: email.trim(), password });
      } else {
        await auth.login({ email: email.trim(), password });
      }
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setFieldErrors({});
    setLocalError("");
  };

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "var(--bg-body)" }}>
      <div className="relative mx-auto flex min-h-screen max-w-[1320px] flex-col justify-center gap-8 px-4 py-10 lg:grid lg:grid-cols-[minmax(0,1.1fr)_420px] lg:gap-14 lg:px-8">
        <div className="panel-card overflow-hidden p-6 lg:p-8">
          <div className="inline-flex items-center gap-3 rounded-full border px-4 py-2" style={{ borderColor: "var(--border-color)", background: "var(--bg-panel)" }}>
            <div
              className="flex h-10 w-10 items-center justify-center rounded-2xl text-lg font-semibold text-white"
              style={{ background: "linear-gradient(135deg, var(--accent-from), var(--accent-to))" }}
            >
              A
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wider" style={{ color: "var(--text-primary)" }}>AURASENSE</p>
              <p className="text-[10px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Realtime focus intelligence</p>
            </div>
          </div>

          <h1 className="mt-8 max-w-2xl text-3xl font-semibold leading-tight lg:text-4xl" style={{ color: "var(--text-primary)" }}>
            Your personal focus & wellness command center.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7" style={{ color: "var(--text-secondary)" }}>
            Create an account or sign in to access real-time face monitoring, fatigue tracking,
            AI-powered coaching via Groq, and detailed session analytics — all running locally
            in your browser.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { title: "Local-first", subtitle: "Privacy", desc: "All face analysis stays in-browser. Your data never leaves your machine." },
              { title: "Groq-powered", subtitle: "AI Coach", desc: "Real-time coaching powered by Groq's ultra-fast inference. Bring your own API key." },
              { title: "Encrypted", subtitle: "Security", desc: "Passwords are hashed locally with SHA-256. Sessions expire after 24 hours." },
            ].map((card) => (
              <div key={card.title} className="rounded-3xl border p-5" style={{ borderColor: "var(--border-color)", background: "var(--bg-panel)" }}>
                <p className="text-[10px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>{card.subtitle}</p>
                <p className="mt-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>{card.title}</p>
                <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="panel-card p-6 lg:p-8">
          <div className="flex items-center gap-2 rounded-full border p-1" style={{ borderColor: "var(--border-color)", background: "var(--bg-panel)" }}>
            {["login", "register"].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className="flex-1 rounded-full px-4 py-2 text-sm font-medium transition"
                style={mode === m ? { background: "linear-gradient(135deg, var(--accent-from), var(--accent-to))", color: "white" } : { color: "var(--text-secondary)" }}
              >
                {m === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <div className="mt-6">
            <p className="text-[10px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              {mode === "register" ? "New account" : "Existing user"}
            </p>
            <h2 className="mt-2 text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
              {mode === "register" ? "Create your AuraSense account" : "Welcome back"}
            </h2>
            <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
              {mode === "register"
                ? "Fill in the details below to get started with real-time focus tracking and AI coaching."
                : "Sign in to access your monitoring workspace and session history."}
            </p>
          </div>

          <form className="mt-6 space-y-4" onSubmit={submit} noValidate>
            {mode === "register" && (
              <AuthInput label="Full name" value={name} onChange={setName} placeholder="Your name" error={fieldErrors.name} />
            )}
            <AuthInput label="Email address" type="email" value={email} onChange={setEmail} placeholder="you@example.com" error={fieldErrors.email} />
            <AuthInput
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder={mode === "register" ? "Min 6 chars, 1 uppercase, 1 number" : "Your password"}
              error={fieldErrors.password}
            />
            {mode === "register" && (
              <AuthInput label="Confirm password" type="password" value={confirmPassword} onChange={setConfirmPassword} placeholder="Re-enter your password" error={fieldErrors.confirmPassword} />
            )}

            {(localError || auth.error) && (
              <div className="rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: "rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.1)", color: "#fca5a5" }}>
                {localError || auth.error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, var(--accent-from), var(--accent-to))" }}
            >
              {isSubmitting ? "Please wait..." : mode === "register" ? "Create account" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AuthScreen;
