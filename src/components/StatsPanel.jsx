import { formatDuration } from "../utils/analytics";

function MetricCard({ label, value, helper, tone = "slate" }) {
  const toneClasses = {
    sky: "border-sky-400/20 bg-sky-500/10",
    emerald: "border-emerald-400/20 bg-emerald-500/10",
    orange: "border-orange-400/20 bg-orange-500/10",
    slate: "border-white/10 bg-white/[0.035]",
  };

  return (
    <div className={`rounded-2xl border p-4 ${toneClasses[tone] ?? toneClasses.slate}`}>
      <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
      {helper ? <p className="mt-2 text-sm text-slate-400">{helper}</p> : null}
    </div>
  );
}

function SignalItem({ label, value, helper }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
      <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-400">{helper}</p>
    </div>
  );
}

function ConfidenceBadge({ liveMetrics }) {
  const toneMap = {
    High: "border-emerald-400/20 bg-emerald-500/12 text-emerald-100",
    Medium: "border-orange-400/20 bg-orange-500/12 text-orange-100",
    Low: "border-rose-400/20 bg-rose-500/12 text-rose-100",
  };

  return (
    <div
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${
        toneMap[liveMetrics.measurementConfidence] ?? toneMap.Low
      }`}
    >
      {liveMetrics.measurementConfidence} confidence
    </div>
  );
}

function StatsPanel({ liveMetrics, sessionActive, cameraReady, compact = false }) {
  if (compact) {
    return (
      <section className="panel-card p-5">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Live Status</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Essential telemetry</h2>
          </div>
          <ConfidenceBadge liveMetrics={liveMetrics} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <MetricCard
            label="Session"
            value={formatDuration(liveMetrics.durationSeconds)}
            helper={sessionActive ? "Session is currently active." : "Waiting for a new session."}
            tone="sky"
          />
          <MetricCard
            label="Focus"
            value={liveMetrics.focusScore}
            helper={`Fatigue ${liveMetrics.fatigueScore}% · Attention ${liveMetrics.attentionScore}`}
            tone="emerald"
          />
          <MetricCard
            label="Blink Rate"
            value={`${liveMetrics.blinkRate}/min`}
            helper={`Blink model ${liveMetrics.signalQuality} · ${liveMetrics.trackingQualityScore}`}
          />
          <MetricCard
            label="Posture"
            value={liveMetrics.postureScore}
            helper={`${liveMetrics.posture} · Face away ${liveMetrics.faceAwaySeconds}s`}
            tone={cameraReady ? "slate" : "orange"}
          />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <SignalItem
            label="Distraction"
            value={liveMetrics.distractionLevel}
            helper={`${liveMetrics.distractionEvents} interruption events this session.`}
          />
          <SignalItem
            label="Drowsiness"
            value={liveMetrics.drowsinessRisk}
            helper={`Score ${liveMetrics.drowsinessScore} · ${liveMetrics.measurementConfidence} confidence.`}
          />
        </div>
      </section>
    );
  }

  return (
    <section className="panel-card p-5">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Stats Panel</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Detailed live telemetry</h2>
        </div>
        <ConfidenceBadge liveMetrics={liveMetrics} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <MetricCard
          label="Blink Count"
          value={liveMetrics.blinkCount}
          helper="Session blink total updates in real time."
          tone="sky"
        />
        <MetricCard
          label="Fatigue Score"
          value={`${liveMetrics.fatigueScore}%`}
          helper="Current fatigue estimate from your ongoing session."
          tone="orange"
        />
        <MetricCard
          label="Focus Score"
          value={liveMetrics.focusScore}
          helper="Balances blink consistency and session stability."
          tone="emerald"
        />
        <MetricCard
          label="Session Timer"
          value={formatDuration(liveMetrics.durationSeconds)}
          helper="Elapsed session time visible while charts and overlays keep updating."
        />
      </div>

      <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-400">Operational Status</p>
            <p className="mt-2 text-lg font-semibold text-white">
              {sessionActive ? "Streaming and analyzing" : "Waiting to start"}
            </p>
          </div>
          <div
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              cameraReady
                ? "bg-emerald-400/15 text-emerald-300"
                : "bg-orange-400/15 text-orange-300"
            }`}
          >
            {cameraReady ? "Camera online" : "Camera offline"}
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <SignalItem
            label="Blink Rate"
            value={`${liveMetrics.blinkRate}/min`}
            helper={`Blink model ${liveMetrics.signalQuality} · ${liveMetrics.trackingQualityScore}`}
          />
          <SignalItem
            label="Face Presence"
            value={liveMetrics.faceDetected ? "Detected" : "Searching"}
            helper={`Away from frame ${liveMetrics.faceAwaySeconds}s`}
          />
          <SignalItem
            label="Posture"
            value={liveMetrics.posture}
            helper={`Posture score ${liveMetrics.postureScore}`}
          />
          <SignalItem
            label="Attention"
            value={liveMetrics.attentionScore}
            helper={`${liveMetrics.distractionEvents} interruption events this session.`}
          />
        </div>

        <div className="mt-5">
          <p className="mb-3 text-xs uppercase tracking-[0.24em] text-slate-500">
            Predictive Signals
          </p>
          <div className="grid gap-3 xl:grid-cols-2">
            <SignalItem
              label="Head Stability"
              value={liveMetrics.headMovementScore}
              helper="Tracks head movement steadiness during the session."
            />
            <SignalItem
              label="Gaze Drift"
              value={liveMetrics.gazeDriftLevel}
              helper={`Score ${liveMetrics.gazeDriftScore} with ${liveMetrics.gazeDriftEvents} events.`}
            />
            <SignalItem
              label="Eye Closure Risk"
              value={liveMetrics.eyeClosureRisk}
              helper={`${liveMetrics.prolongedClosures} prolonged closures detected.`}
            />
            <SignalItem
              label="Yawn Events"
              value={liveMetrics.yawnEvents}
              helper={`Mouth-open ratio ${liveMetrics.mouthOpenRatio?.toFixed?.(2) ?? liveMetrics.mouthOpenRatio}`}
            />
            <SignalItem
              label="Drowsiness"
              value={liveMetrics.drowsinessRisk}
              helper={`Score ${liveMetrics.drowsinessScore} · ${liveMetrics.measurementConfidence} confidence.`}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default StatsPanel;
