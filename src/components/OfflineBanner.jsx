function OfflineBanner({ isOnline }) {
  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed left-0 right-0 top-0 z-[60] border-b px-4 py-2 text-center text-sm font-medium"
      style={{
        borderColor: "rgba(251, 146, 60, 0.35)",
        background: "rgba(251, 146, 60, 0.15)",
        color: "#fb923c",
      }}
    >
      You are offline. Live coaching and cloud sync are paused until your connection returns.
    </div>
  );
}

export default OfflineBanner;
