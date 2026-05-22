function MetricTile({ label, value, helper }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-slate-950/50 p-4">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      {helper ? <p className="mt-1 text-sm text-slate-400">{helper}</p> : null}
    </div>
  );
}

function formatDecimal(value, digits = 3) {
  return Number.isFinite(value) ? value.toFixed(digits) : "--";
}

function DebugPanel({ liveMetrics }) {
  return (
    <section className="panel-card border border-sky-500/20 bg-gradient-to-br from-sky-500/8 to-indigo-500/8 p-5">
      <div className="border-b border-white/10 pb-5">
        <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Validation Mode</p>
        <h2 className="mt-2 text-xl font-semibold text-white">Realtime signal debug</h2>
        <p className="mt-2 text-sm text-slate-400">
          Low-level tracking values to validate blink, yawn, and attention predictions while the camera runs.
        </p>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricTile
          label="Tracking Quality"
          value={`${liveMetrics.trackingQualityScore}/100`}
          helper={`${liveMetrics.signalQuality} · ${liveMetrics.measurementConfidence} confidence`}
        />
        <MetricTile
          label="Blink Gate"
          value={liveMetrics.blinkGateOpen ? "Open" : "Paused"}
          helper={
            liveMetrics.blinkGateOpen
              ? "Blink counting is currently trusted."
              : "Signal is being protected from unreliable counts."
          }
        />
        <MetricTile
          label="Face Scale"
          value={formatDecimal(liveMetrics.faceScale)}
          helper="Helps explain near-vs-far camera behavior."
        />
        <MetricTile
          label="Last Closure"
          value={`${Math.round(liveMetrics.lastClosureDurationMs ?? 0)} ms`}
          helper="Recent eye closure duration used for blink validation."
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-sm font-medium text-white">Eye Signal</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <MetricTile
              label="Raw Eye Ratio"
              value={formatDecimal(liveMetrics.rawEyeRatio)}
              helper="Direct eye opening geometry before smoothing."
            />
            <MetricTile
              label="Smoothed Ratio"
              value={formatDecimal(liveMetrics.smoothedEyeRatio)}
              helper="Stabilized ratio used for blink decisions."
            />
            <MetricTile
              label="Open Baseline"
              value={formatDecimal(liveMetrics.openEyeRatioBaseline)}
              helper="Adaptive open-eye reference for your current position."
            />
            <MetricTile
              label="Closure Ratio"
              value={formatDecimal(liveMetrics.eyeClosureRatio)}
              helper="How closed the eye looks relative to the baseline."
            />
            <MetricTile
              label="Close Threshold"
              value={formatDecimal(liveMetrics.blinkThresholdRatio)}
              helper="Must drop below this to start a blink."
            />
            <MetricTile
              label="Reopen Threshold"
              value={formatDecimal(liveMetrics.blinkReopenRatio)}
              helper="Must rise above this to complete a blink."
            />
            <MetricTile
              label="Blink Drop"
              value={formatDecimal(liveMetrics.blinkDrop)}
              helper="Sharpness of the latest eye-ratio drop."
            />
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-sm font-medium text-white">Mouth and Drowsiness Signal</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <MetricTile
              label="Raw Mouth Ratio"
              value={formatDecimal(liveMetrics.rawMouthRatio)}
              helper="Direct mouth opening geometry from landmarks."
            />
            <MetricTile
              label="Mouth Baseline"
              value={formatDecimal(liveMetrics.mouthOpenBaseline)}
              helper="Adaptive neutral mouth reference."
            />
            <MetricTile
              label="Open Ratio"
              value={formatDecimal(liveMetrics.mouthOpenRatio)}
              helper="Current mouth openness relative to baseline."
            />
            <MetricTile
              label="Yawn Threshold"
              value={formatDecimal(liveMetrics.yawnThreshold)}
              helper="Must stay above this to count as a yawn."
            />
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-3xl border border-white/10 bg-slate-950/40 p-4">
        <p className="text-sm font-medium text-white">Validation Notes</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {(liveMetrics.validationNotes?.length
            ? liveMetrics.validationNotes
            : ["Signal looks stable right now."]).map((note) => (
            <span
              key={note}
              className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-200"
            >
              {note}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default DebugPanel;
