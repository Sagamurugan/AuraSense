import { useState } from "react";

function AuthInput({ label, type = "text", value, onChange, placeholder, error }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-200">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-2xl border bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:bg-white/[0.06] ${
          error ? "border-red-400/40 focus:border-red-400/50" : "border-white/10 focus:border-sky-400/35"
        }`}
      />
      {error && <p className="mt-1 text-xs text-red-300">{error}</p>}
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
    if (mode === "register" && !name.trim()) {
      errors.name = "Name is required.";
    }
    if (!email.trim()) {
      errors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Invalid email format.";
    }
    if (!password) {
      errors.password = "Password is required.";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    } else if (!/[A-Z]/.test(password)) {
      errors.password = "Must contain an uppercase letter.";
    } else if (!/[0-9]/.test(password)) {
      errors.password = "Must contain a number.";
    }
    if (mode === "register" && password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }
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
    <div className="relative min-h-screen overflow-hidden bg-[#07111f] text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(129,140,248,0.14),_transparent_28%),linear-gradient(180deg,_rgba(7,17,31,1),_rgba(2,6,23,1))]" />

      <div className="relative mx-auto flex min-h-screen max-w-[1320px] flex-col justify-center gap-10 px-4 py-10 lg:grid lg:grid-cols-[minmax(0,1.1fr)_420px] lg:gap-14 lg:px-8">
        <div className="panel-card overflow-hidden p-6 lg:p-8">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-500 text-lg font-semibold text-white">
              A
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[0.18em] text-white">AURASENSE</p>
              <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
                Realtime focus intelligence
              </p>
            </div>
          </div>

          <h1 className="mt-8 max-w-2xl text-4xl font-semibold leading-tight text-white lg:text-5xl">
            Your personal focus & wellness command center.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-400">
            Create an account or sign in to access real-time face monitoring, fatigue tracking,
            AI-powered coaching via Groq, and detailed session analytics — all running locally
            in your browser.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Privacy</p>
              <p className="mt-3 text-xl font-semibold text-white">Local-first</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                All face analysis stays in-browser. Your data never leaves your machine.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">AI Coach</p>
              <p className="mt-3 text-xl font-semibold text-white">Groq-powered</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Real-time coaching powered by Groq's ultra-fast inference. Bring your own API key.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Security</p>
              <p className="mt-3 text-xl font-semibold text-white">Encrypted</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Passwords are hashed locally with SHA-256. Sessions expire after 24 hours.
              </p>
            </div>
          </div>
        </div>

        <div className="panel-card p-6 lg:p-8">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] p-1">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition ${
                mode === "login"
                  ? "bg-gradient-to-r from-sky-500 to-indigo-500 text-white"
                  : "text-slate-300"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode("register")}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition ${
                mode === "register"
                  ? "bg-gradient-to-r from-sky-500 to-indigo-500 text-white"
                  : "text-slate-300"
              }`}
            >
              Create Account
            </button>
          </div>

          <div className="mt-6">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              {mode === "register" ? "New account" : "Existing user"}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              {mode === "register"
                ? "Create your AuraSense account"
                : "Welcome back"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              {mode === "register"
                ? "Fill in the details below to get started with real-time focus tracking and AI coaching."
                : "Sign in to access your monitoring workspace and session history."}
            </p>
          </div>

          <form className="mt-6 space-y-4" onSubmit={submit} noValidate>
            {mode === "register" && (
              <AuthInput
                label="Full name"
                value={name}
                onChange={setName}
                placeholder="Your name"
                error={fieldErrors.name}
              />
            )}

            <AuthInput
              label="Email address"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
              error={fieldErrors.email}
            />

            <AuthInput
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder={mode === "register" ? "Min 6 chars, 1 uppercase, 1 number" : "Your password"}
              error={fieldErrors.password}
            />

            {mode === "register" && (
              <AuthInput
                label="Confirm password"
                type="password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Re-enter your password"
                error={fieldErrors.confirmPassword}
              />
            )}

            {(localError || auth.error) && (
              <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                {localError || auth.error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-950/35 transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "Please wait..."
                : mode === "register"
                  ? "Create account"
                  : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AuthScreen;