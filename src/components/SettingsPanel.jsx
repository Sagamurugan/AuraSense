function FieldLabel({ label, helper }) {
  return (
    <div>
      <p className="text-sm font-medium text-white">{label}</p>
      <p className="mt-1 text-sm text-slate-400">{helper}</p>
    </div>
  );
}

function SettingsPanel({
  settings,
  updateSetting,
  recommendedBaseline,
  calibrateFromLiveSession,
  calibrateFromHistory,
  liveMetrics,
  liveCalibration,
}) {
  return (
    <section className="panel-card p-5">
      <div className="border-b border-white/10 pb-5">
        <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
          Settings
        </p>
        <h2 className="mt-2 text-xl font-semibold text-white">
          Personalization foundation
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Tune alerts, goals, and baseline calibration so AuraSense adapts to your
          actual work rhythm.
        </p>
      </div>

      <div className="mt-5 space-y-5">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-start justify-between gap-4">
            <FieldLabel
              label="Alert Sensitivity"
              helper="Controls how aggressively the system recommends breaks and flags strain."
            />
            <select
              value={settings.alertSensitivity}
              onChange={(event) => updateSetting("alertSensitivity", event.target.value)}
              className="rounded-2xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none"
            >
              <option value="relaxed">Relaxed</option>
              <option value="balanced">Balanced</option>
              <option value="strict">Strict</option>
            </select>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-start justify-between gap-4">
            <FieldLabel
              label="Live Validation Mode"
              helper="Shows raw signal quality, thresholds, and trust gates so you can verify realtime predictions."
            />
            <button
              type="button"
              onClick={() => updateSetting("debugMode", !settings.debugMode)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                settings.debugMode
                  ? "bg-sky-500 text-white hover:bg-sky-400"
                  : "border border-white/10 bg-slate-950 text-slate-200 hover:bg-white/[0.06]"
              }`}
            >
              {settings.debugMode ? "Enabled" : "Disabled"}
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <FieldLabel
              label="Session Goal"
              helper="Your ideal focused work block in minutes."
            />
            <input
              type="range"
              min="10"
              max="60"
              step="5"
              value={settings.sessionGoalMinutes}
              onChange={(event) =>
                updateSetting("sessionGoalMinutes", Number(event.target.value))
              }
              className="mt-4 w-full accent-sky-400"
            />
            <p className="mt-2 text-2xl font-semibold text-white">
              {settings.sessionGoalMinutes} min
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <FieldLabel
              label="Break Reminder"
              helper="When to nudge you for a reset if fatigue is rising."
            />
            <input
              type="range"
              min="10"
              max="45"
              step="5"
              value={settings.breakReminderMinutes}
              onChange={(event) =>
                updateSetting("breakReminderMinutes", Number(event.target.value))
              }
              className="mt-4 w-full accent-orange-400"
            />
            <p className="mt-2 text-2xl font-semibold text-white">
              {settings.breakReminderMinutes} min
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-sky-500/20 bg-gradient-to-br from-sky-500/10 to-indigo-500/10 p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-medium text-white">Blink Baseline Calibration</p>
              <p className="mt-1 text-sm text-slate-300">
                Current baseline is <span className="font-semibold text-white">{settings.baselineBlinkRate}/min</span>.
                Recommended from your saved sessions: {recommendedBaseline}/min.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={calibrateFromHistory}
                className="rounded-2xl border border-white/15 bg-white/8 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/12"
              >
                Use history
              </button>
              <button
                type="button"
                onClick={calibrateFromLiveSession}
                disabled={liveCalibration.active}
                className="rounded-2xl bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {liveCalibration.active ? "Calibrating..." : "Calibrate live"}
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-950/40 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                Live Blink Rate
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {liveMetrics.blinkRate}/min
              </p>
            </div>
            <div className="rounded-2xl bg-slate-950/40 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                Goal Progress
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {Math.min(
                  100,
                  Math.round(
                    (liveMetrics.durationSeconds / Math.max(settings.sessionGoalMinutes * 60, 1)) *
                      100
                  )
                )}
                %
              </p>
            </div>
            <div className="rounded-2xl bg-slate-950/40 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                Calibration
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {settings.autoCalibrated ? "Ready" : "Default"}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Live Calibration Status
            </p>
            <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-slate-300">
                {liveCalibration.active
                  ? `Watching your blink pattern in real time. ${liveCalibration.secondsRemaining}s remaining.`
                  : liveCalibration.status === "completed"
                    ? "Real-time calibration completed and baseline updated."
                    : "Start calibration while looking naturally at the screen for a few seconds."}
              </p>
              <div className="rounded-full bg-white/6 px-3 py-1 text-sm text-white">
                Preview baseline {liveCalibration.baselinePreview ?? settings.baselineBlinkRate}/min
              </div>
            </div>
            <p className="mt-2 text-sm text-slate-400">
              Tracking status: {liveCalibration.status}. Quality score {liveMetrics.trackingQualityScore}.
              Samples used {liveCalibration.sampleCount}.
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Validation confidence: {liveMetrics.measurementConfidence}. Blink gate is{" "}
              {liveMetrics.blinkGateOpen ? "open" : "paused"}.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SettingsPanel;
