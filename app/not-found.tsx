import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center text-text">
      <h1 className="mb-2 text-3xl">This tunnel goes nowhere</h1>
      <p className="mb-6 text-text/70">
        The page you sniffed out doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="rounded-xl bg-primary px-5 py-3 font-bold text-button-text"
      >
        Back to the Nest
      </Link>
    </main>
  );
}
