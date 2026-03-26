"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-4">
      <div className="text-center">
        <h1 className="font-display text-4xl font-bold text-forest">Something went wrong</h1>
        <p className="mt-4 text-sm text-pencil">
          An unexpected error occurred. Please try again.
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <button
            onClick={reset}
            className="rounded-lg bg-forest px-6 py-3 text-sm font-medium text-chalk shadow-sm transition hover:bg-forest/90"
          >
            Try Again
          </button>
          <a
            href="/"
            className="rounded-lg border border-ruled bg-white px-6 py-3 text-sm font-medium text-ink shadow-sm transition hover:bg-cream"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
