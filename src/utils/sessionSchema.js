export const STORAGE_KEY = "aura-sense-sessions";
export const LEGACY_STORAGE_KEY = "sessions";

export function createSessionRecord({
  duration,
  blinks,
  fatigue,
  focusScore,
  attentionScore = 0,
  postureScore = 0,
  distractionEvents = 0,
  faceAwaySeconds = 0,
  headMovementScore = 0,
  gazeDriftScore = 0,
  gazeDriftEvents = 0,
  prolongedClosures = 0,
  yawnEvents = 0,
  drowsinessScore = 0,
  date = new Date(),
}) {
  return {
    id: `${Date.now()}`,
    date: new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date),
    duration,
    blinks,
    fatigue,
    focusScore,
    attentionScore,
    postureScore,
    distractionEvents,
    faceAwaySeconds,
    headMovementScore,
    gazeDriftScore,
    gazeDriftEvents,
    prolongedClosures,
    yawnEvents,
    drowsinessScore,
  };
}
