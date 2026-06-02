function FieldLabel({ label, helper }) {
  return (
    <div>
      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{label}</p>
      <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>{helper}</p>
    </div>
  );
}

import { useTheme } from "../context/ThemeContext";

function SettingsPanel({
  settings,
  updateSetting,
  recommendedBaseline,
  calibrateFromLiveSession,
  calibrateFromHistory,
  liveMetrics,
  liveCalibration,
  onResetSettings,
  onExportSettings,
  onImportSettings,
}) {
  const { accent, accentPresets, setAccent } = useTheme();
  return (
    <section className="panel-card p-5">
      <div className="border-b pb-5" style={{ borderColor: "var(--border-color)" }}>
        <p className="text-xs uppercase tracking-[0.28em]" style={{ color: "var(--text-muted)" }}>Settings</p>
        <h2 className="mt-2 text-xl font-semibold" style={{ color: "var(--text-primary)" }}>Personalization foundation</h2>
        <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
          Tune alerts, goals, and baseline calibration so AuraSense adapts to your
          actual work rhythm.
        </p>
      </div>

      <div className="mt-5 space-y-5">
        <div className="rounded-3xl border p-4" style={{ borderColor: "var(--border-color)", background: "var(--bg-panel-soft)" }}>
          <div className="flex items-start justify-between gap-4">
            <FieldLabel
              label="Alert Sensitivity"
              helper="Controls how aggressively the system recommends breaks and flags strain."
            />
            <select
              value={settings.alertSensitivity}
              onChange={(event) => updateSetting("alertSensitivity", event.target.value)}
              className="rounded-2xl border px-3 py-2 text-sm outline-none"
              style={{ borderColor: "var(--border-color)", background: "var(--bg-elevated)", color: "var(--text-primary)" }}
            >
              <option value="relaxed">Relaxed</option>
              <option value="balanced">Balanced</option>
              <option value="strict">Strict</option>
            </select>
          </div>
        </div>

        <div className="rounded-3xl border p-4" style={{ borderColor: "var(--border-color)", background: "var(--bg-panel-soft)" }}>
          <FieldLabel label="Accent color" helper="Customize buttons and highlights across the app." />
          <div className="mt-3 flex flex-wrap gap-2">
            {accentPresets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAccent(preset)}
                className="rounded-full border px-3 py-1.5 text-xs capitalize"
                style={{
                  borderColor: accent === preset ? "var(--accent-from)" : "var(--border-color)",
                  color: accent === preset ? "var(--accent-from)" : "var(--text-secondary)",
                }}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border p-4" style={{ borderColor: "var(--border-color)", background: "var(--bg-panel-soft)" }}>
          <div className="flex items-start justify-between gap-4">
            <FieldLabel
              label="Face mesh overlay"
              helper="Toggle landmark dots on the camera feed."
            />
            <button
              type="button"
              onClick={() => updateSetting("showMeshOverlay", !settings.showMeshOverlay)}
              className="rounded-full px-4 py-2 text-sm font-medium"
              style={{
                background: settings.showMeshOverlay ? "var(--accent-from)" : "var(--bg-elevated)",
                color: settings.showMeshOverlay ? "#fff" : "var(--text-secondary)",
                border: "1px solid var(--border-color)",
              }}
            >
              {settings.showMeshOverlay ? "Visible" : "Hidden"}
            </button>
          </div>
        </div>

        <div className="rounded-3xl border p-4" style={{ borderColor: "var(--border-color)", background: "var(--bg-panel-soft)" }}>
          <FieldLabel label="Settings backup" helper="Export, import, or reset preferences." />
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={onExportSettings} className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: "var(--border-color)" }}>Export JSON</button>
            <button type="button" onClick={onImportSettings} className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: "var(--border-color)" }}>Import JSON</button>
            <button type="button" onClick={onResetSettings} className="rounded-xl border px-3 py-2 text-sm text-red-400" style={{ borderColor: "var(--border-color)" }}>Reset defaults</button>
          </div>
        </div>

        <div className="rounded-3xl border p-4" style={{ borderColor: "var(--border-color)", background: "var(--bg-panel-soft)" }}>
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
                  ? "text-white hover:bg-sky-400"
                  : "border bg-slate-950 shell-hover"
              }`}
              style={
                settings.debugMode
                  ? { background: "var(--accent-from)" }
                  : { borderColor: "var(--border-color)", background: "var(--bg-elevated)", color: "var(--text-secondary)" }
              }
            >
              {settings.debugMode ? "Enabled" : "Disabled"}
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border p-4" style={{ borderColor: "var(--border-color)", background: "var(--bg-panel-soft)" }}>
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
            <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
              {settings.sessionGoalMinutes} min
            </p>
          </div>

          <div className="rounded-3xl border p-4" style={{ borderColor: "var(--border-color)", background: "var(--bg-panel-soft)" }}>
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
            <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
              {settings.breakReminderMinutes} min
            </p>
          </div>
        </div>

        <div className="rounded-3xl border p-4" style={{ borderColor: "rgba(56,189,248,0.2)", background: "linear-gradient(135deg, rgba(56,189,248,0.08), rgba(129,140,248,0.06))" }}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Blink Baseline Calibration</p>
              <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                Current baseline is <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{settings.baselineBlinkRate}/min</span>.
                Recommended from your saved sessions: {recommendedBaseline}/min.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={calibrateFromHistory}
                className="rounded-2xl border px-4 py-2 text-sm font-medium transition shell-hover"
                style={{ borderColor: "var(--border-color)", background: "var(--bg-panel-soft)", color: "var(--text-primary)" }}
              >
                Use history
              </button>
              <button
                type="button"
                onClick={calibrateFromLiveSession}
                disabled={liveCalibration.active}
                className="rounded-2xl px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
                style={{ background: "var(--accent-from)" }}
              >
                {liveCalibration.active ? "Calibrating..." : "Calibrate live"}
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl p-4" style={{ background: "var(--bg-elevated)" }}>
              <p className="text-xs uppercase tracking-[0.24em]" style={{ color: "var(--text-muted)" }}>Live Blink Rate</p>
              <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
                {liveMetrics.blinkRate}/min
              </p>
            </div>
            <div className="rounded-2xl p-4" style={{ background: "var(--bg-elevated)" }}>
              <p className="text-xs uppercase tracking-[0.24em]" style={{ color: "var(--text-muted)" }}>Goal Progress</p>
              <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
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
            <div className="rounded-2xl p-4" style={{ background: "var(--bg-elevated)" }}>
              <p className="text-xs uppercase tracking-[0.24em]" style={{ color: "var(--text-muted)" }}>Calibration</p>
              <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
                {settings.autoCalibrated ? "Ready" : "Default"}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border p-4" style={{ borderColor: "var(--border-color)", background: "var(--bg-elevated)" }}>
            <p className="text-xs uppercase tracking-[0.24em]" style={{ color: "var(--text-muted)" }}>Live Calibration Status</p>
            <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {liveCalibration.active
                  ? `Watching your blink pattern in real time. ${liveCalibration.secondsRemaining}s remaining.`
                  : liveCalibration.status === "completed"
                    ? "Real-time calibration completed and baseline updated."
                    : "Start calibration while looking naturally at the screen for a few seconds."}
              </p>
              <div className="rounded-full px-3 py-1 text-sm" style={{ background: "var(--bg-panel-soft)", color: "var(--text-primary)" }}>
                Preview baseline {liveCalibration.baselinePreview ?? settings.baselineBlinkRate}/min
              </div>
            </div>
            <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
              Tracking status: {liveCalibration.status}. Quality score {liveMetrics.trackingQualityScore}.
              Samples used {liveCalibration.sampleCount}.
            </p>
            <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
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
