import Link from "next/link";
import { ButterflyLogo } from "@/components/ui/ButterflyLogo";

/**
 * Shared header for inner pages (unit overview, stages, results, etc.)
 * Matches the landing page header's academic editorial aesthetic.
 */
function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-ruled/60 bg-paper/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
        <Link
          href="/"
          className="focus-ring flex items-center gap-2"
          aria-label="Backward Builder home"
        >
          <ButterflyLogo size={28} className="text-graphite" />
          <span className="font-display text-xl text-ink sm:text-2xl">
            Backward Builder
          </span>
        </Link>
        <Link
          href="/"
          className="focus-ring rounded-lg bg-ink px-4 py-2 font-ui text-sm font-semibold text-white shadow-sm transition hover:bg-ink-light"
        >
          Design a Unit
        </Link>
      </nav>
    </header>
  );
}

export { Header };
