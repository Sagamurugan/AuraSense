import { useState } from "react";

function AuthInput({ label, type = "text", value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-200">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400/35 focus:bg-white/[0.06]"
      />
    </label>
  );
}

function AuthScreen({ auth }) {
  const registrationEnabled = auth.serverConfig?.registrationEnabled !== false;
  const demoAuthEnabled = Boolean(auth.serverConfig?.demoAuthEnabled);
  const demoUserEmail = auth.serverConfig?.demoUserEmail;
  const [mode, setMode] = useState(registrationEnabled ? "login" : "login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setLocalError("");
    setIsSubmitting(true);

    try {
      if (mode === "register" && registrationEnabled) {
        await auth.register({ name, email, password });
      } else {
        await auth.login({ email, password });
      }
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
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
            Secure access for your live wellness analytics workspace.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-400">
            Sign in before entering the dashboard. JWT-backed local auth keeps the app
            structured like a production product while still staying fully runnable on your
            machine.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Privacy</p>
              <p className="mt-3 text-xl font-semibold text-white">Local-first</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Face analysis remains in-browser while auth stays inside the local Node server.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Access</p>
              <p className="mt-3 text-xl font-semibold text-white">JWT session</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Signed tokens keep the workspace protected without adding a full backend stack.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Assistant</p>
              <p className="mt-3 text-xl font-semibold text-white">Gemini ready</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Secure access also protects your Gemini coaching route behind authentication.
              </p>
            </div>
          </div>
        </div>

        <div className="panel-card p-6 lg:p-8">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
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
              onClick={() => registrationEnabled && setMode("register")}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition ${
                mode === "register"
                  ? "bg-gradient-to-r from-sky-500 to-indigo-500 text-white"
                  : "text-slate-300"
              } ${registrationEnabled ? "" : "cursor-not-allowed opacity-45"}`}
              disabled={!registrationEnabled}
            >
              Create Account
            </button>
          </div>

          <div className="mt-6">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              {mode === "register" ? "New operator access" : "Operator login"}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              {mode === "register" ? "Create your workspace account" : "Welcome back"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              {mode === "register"
                ? "Set up a local account to unlock the dashboard, reports, and Gemini support."
                : "Sign in to continue into your monitoring workspace."}
            </p>
            {!registrationEnabled ? (
              <p className="mt-3 rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                Registration is disabled for this deployment. Use the demo login provided below.
              </p>
            ) : null}
            {demoAuthEnabled ? (
              <p className="mt-3 rounded-2xl border border-sky-400/20 bg-sky-500/10 px-4 py-3 text-sm text-sky-100">
                Demo account enabled: <span className="font-semibold">{demoUserEmail}</span>
              </p>
            ) : null}
          </div>

          <form className="mt-6 space-y-4" onSubmit={submit}>
            {mode === "register" ? (
              <AuthInput
                label="Full name"
                value={name}
                onChange={setName}
                placeholder="Saga Murugan"
              />
            ) : null}
            <AuthInput
              label="Email address"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
            />
            <AuthInput
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Minimum 6 characters"
            />

            {localError || auth.error ? (
              <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                {localError || auth.error}
              </div>
            ) : null}

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
