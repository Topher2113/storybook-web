// Pulsing placeholders matching the RN skeleton: one card + two choice bars.
export function SkeletonLoader({ waking }: { waking?: boolean }) {
  return (
    <div className="w-full">
      <div className="animate-skeleton mb-6 h-64 w-full rounded-2xl bg-surface" />
      <div className="animate-skeleton mb-3 h-12 w-full rounded-xl bg-surface" />
      <div className="animate-skeleton h-12 w-full rounded-xl bg-surface" />
      {waking && (
        <p className="mt-6 text-center text-sm text-text/60">
          Waking the storybook server — free hosting takes a nap between
          readers. This can take up to a minute…
        </p>
      )}
    </div>
  );
}
