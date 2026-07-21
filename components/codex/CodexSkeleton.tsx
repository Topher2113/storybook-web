// Loading skeleton for the server-rendered codex pages; a cold Render start
// can hold a page for up to a minute, so these do a lot of quiet work.
export function CodexSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <div className="animate-skeleton mb-2 h-9 w-48 rounded-lg bg-surface" />
      <div className="animate-skeleton mb-6 h-4 w-72 rounded bg-surface" />
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="animate-skeleton mb-4 h-28 w-full rounded-2xl bg-surface"
        />
      ))}
      <p className="text-center text-sm text-text/50">
        Fetching from the storybook server — free hosting can take up to a
        minute to wake…
      </p>
    </main>
  );
}
