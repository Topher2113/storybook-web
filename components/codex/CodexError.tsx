export function CodexError({ what }: { what: string }) {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <div className="rounded-2xl bg-surface p-8 text-center">
        <p className="mb-1 text-lg text-text">
          Couldn&apos;t fetch {what} right now.
        </p>
        <p className="text-sm text-text/70">
          The storybook server naps on free hosting — give it a moment and
          refresh the page.
        </p>
      </div>
    </main>
  );
}
