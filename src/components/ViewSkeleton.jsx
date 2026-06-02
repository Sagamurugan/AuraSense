function SkeletonBlock({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-2xl ${className}`}
      style={{ background: "var(--bg-panel-soft)" }}
    />
  );
}

export function PanelSkeleton() {
  return (
    <section className="panel-card space-y-4 p-5">
      <SkeletonBlock className="h-6 w-48" />
      <SkeletonBlock className="h-4 w-full max-w-md" />
      <div className="grid gap-4 md:grid-cols-2">
        <SkeletonBlock className="h-24" />
        <SkeletonBlock className="h-24" />
        <SkeletonBlock className="h-24" />
        <SkeletonBlock className="h-24" />
      </div>
      <SkeletonBlock className="h-72" />
    </section>
  );
}

export function TableSkeleton() {
  return (
    <section className="panel-card p-5">
      <SkeletonBlock className="mb-4 h-6 w-56" />
      <SkeletonBlock className="h-48 w-full" />
    </section>
  );
}

export default PanelSkeleton;
