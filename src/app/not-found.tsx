import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-4">
      <div className="text-center">
        <h1 className="font-display text-6xl font-bold text-forest">404</h1>
        <p className="mt-4 font-display text-xl text-ink">Page not found</p>
        <p className="mt-2 text-sm text-pencil">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <Link
            href="/"
            className="rounded-lg bg-forest px-6 py-3 text-sm font-medium text-chalk shadow-sm transition hover:bg-forest/90"
          >
            Back to Home
          </Link>
          <Link
            href="/setup"
            className="rounded-lg border border-ruled bg-white px-6 py-3 text-sm font-medium text-ink shadow-sm transition hover:bg-cream"
          >
            Design a Unit
          </Link>
        </div>
      </div>
    </div>
  );
}
