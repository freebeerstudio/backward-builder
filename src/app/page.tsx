import Link from "next/link";
import { HeroChatBox } from "@/components/landing/HeroChatBox";

/**
 * Landing page — single-page app entry point.
 *
 * Aesthetic direction: "Academic Editorial" — warm scholarly colors (deep navy,
 * burgundy, amber) on cream, serif display font for headings, clean sans-serif
 * for UI. Inspired by Lovable.dev's layout but with a distinctly academic feel.
 *
 * The hero chat box IS the app — teachers start building directly from the
 * landing page. No separate /create or /setup page needed for the first touch.
 */

/* Sample community unit data (in production, fetched from DB) */
const COMMUNITY_UNITS = [
  {
    id: "1",
    title: "Ecosystem Interdependence",
    description: "Trophic cascades and the Yellowstone wolf reintroduction",
    subject: "Science",
    grade: "7th",
    teacher: "Mrs. Crabapple",
    initial: "C",
    uses: 142,
    color: "var(--color-subj-science)",
  },
  {
    id: "2",
    title: "Causes of the American Revolution",
    description: "Economic, political, and ideological tensions leading to independence",
    subject: "History",
    grade: "8th",
    teacher: "Mr. Rodriguez",
    initial: "R",
    uses: 98,
    color: "var(--color-subj-history)",
  },
  {
    id: "3",
    title: "Persuasive Writing & Rhetoric",
    description: "Analyzing persuasion techniques across speeches and editorials",
    subject: "ELA",
    grade: "6th",
    teacher: "Ms. Chen",
    initial: "C",
    uses: 217,
    color: "var(--color-subj-ela)",
  },
  {
    id: "4",
    title: "Fractions in the Real World",
    description: "Applying fraction operations to cooking, construction, and design",
    subject: "Math",
    grade: "5th",
    teacher: "Mr. Thompson",
    initial: "T",
    uses: 63,
    color: "var(--color-subj-math)",
  },
  {
    id: "5",
    title: "The Water Cycle as a System",
    description: "Solar energy, evaporation, condensation, and human impact on water systems",
    subject: "Science",
    grade: "5th",
    teacher: "Mrs. Johnson",
    initial: "J",
    uses: 184,
    color: "var(--color-subj-science)",
  },
  {
    id: "6",
    title: "Ancient Civilizations",
    description: "How geography shaped social, political, and economic development",
    subject: "History",
    grade: "6th",
    teacher: "Ms. Patel",
    initial: "P",
    uses: 311,
    color: "var(--color-subj-history)",
  },
  {
    id: "7",
    title: "Poetry, Voice & Identity",
    description: "How poets use language, form, and structure to express identity and perspective",
    subject: "ELA",
    grade: "8th",
    teacher: "Mr. Davis",
    initial: "D",
    uses: 76,
    color: "var(--color-subj-ela)",
  },
  {
    id: "8",
    title: "Geometric Transformations",
    description: "Translations, rotations, reflections, and real-world symmetry",
    subject: "Math",
    grade: "7th",
    teacher: "Mrs. Kim",
    initial: "K",
    uses: 129,
    color: "var(--color-subj-math)",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-cream font-ui">
      {/* ===================== HEADER ===================== */}
      <header className="sticky top-0 z-50 border-b border-ruled/60 bg-paper/80 backdrop-blur-md">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link
            href="/"
            className="focus-ring flex items-center gap-2"
            aria-label="Backward Builder home"
          >
            {/* Logo mark — academic open-book icon */}
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true" className="text-ink">
              <path
                d="M3 7.5C3 6.12 4.12 5 5.5 5H11c1.1 0 2.1.45 2.83 1.17L14 6.5l.17-.33C14.9 5.45 15.9 5 17 5h5.5C23.88 5 25 6.12 25 7.5V21c0 1.38-1.12 2.5-2.5 2.5H17c-1.1 0-2.1.45-2.83 1.17l-.17.33-.17-.33C13.1 23.95 12.1 23.5 11 23.5H5.5C4.12 23.5 3 22.38 3 21V7.5z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M14 6.5V24" stroke="currentColor" strokeWidth="1.8" />
            </svg>
            <span className="font-display text-xl text-ink sm:text-2xl">
              Backward Builder
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/api/demo"
              className="focus-ring hidden rounded-lg px-3.5 py-2 font-ui text-sm font-medium text-pencil transition hover:bg-chalk hover:text-graphite sm:inline-flex"
            >
              Try Demo
            </Link>
            <Link
              href="/setup"
              className="focus-ring rounded-lg px-3.5 py-2 font-ui text-sm font-medium text-pencil transition hover:bg-chalk hover:text-graphite"
            >
              Sign in
            </Link>
            <Link
              href="/setup"
              className="focus-ring rounded-lg bg-ink px-4 py-2 font-ui text-sm font-semibold text-white shadow-sm transition hover:bg-ink-light"
            >
              Sign up
            </Link>
          </div>
        </nav>
      </header>

      {/* ===================== HERO ===================== */}
      <section className="hero-gradient dot-grid relative overflow-hidden px-4 pb-12 pt-16 sm:px-6 sm:pb-16 sm:pt-24">
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          {/* Tagline */}
          <h1 className="animate-hero-title">
            <span className="block font-display text-4xl leading-[1.15] text-ink sm:text-5xl lg:text-[3.5rem]">
              Describe the understanding.
            </span>
            <span className="mt-1 block font-display text-4xl italic leading-[1.15] text-burgundy sm:text-5xl lg:text-[3.5rem]">
              AI designs the unit.
            </span>
          </h1>

          <p className="animate-hero-subtitle mx-auto mt-5 max-w-xl font-ui text-base leading-relaxed text-pencil sm:mt-6 sm:text-lg">
            Standards-aligned unit plans with performance tasks, rubrics, checks
            for understanding, and sequenced learning activities — built in minutes, not weekends.
          </p>

          {/* Chat Box */}
          <div className="mt-8 sm:mt-10">
            <HeroChatBox />
          </div>
        </div>
      </section>

      {/* ===================== COMMUNITY ===================== */}
      <section className="border-t border-ruled bg-paper px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-2xl text-ink sm:text-3xl">
              From the Community
            </h2>
            <Link
              href="/dashboard"
              className="focus-ring font-ui text-sm font-medium text-ink-muted transition hover:text-ink"
            >
              View All
            </Link>
          </div>

          {/* Unit card grid */}
          <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
            {COMMUNITY_UNITS.map((unit, i) => (
              <Link
                key={unit.id}
                href="/api/demo"
                className={`card-lift focus-ring group block overflow-hidden rounded-xl border border-ruled bg-paper animate-stagger-${Math.min(i + 1, 4)}`}
              >
                {/* Subject color strip */}
                <div
                  className="h-2"
                  style={{ backgroundColor: unit.color }}
                  aria-hidden="true"
                />

                <div className="p-4 sm:p-5">
                  {/* Subject + Grade badges */}
                  <div className="flex items-center gap-2">
                    <span
                      className="rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white"
                      style={{ backgroundColor: unit.color }}
                    >
                      {unit.subject}
                    </span>
                    <span className="rounded-md border border-ruled px-2 py-0.5 text-[11px] font-medium text-pencil">
                      {unit.grade}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="mt-3 font-display text-base leading-snug text-graphite group-hover:text-ink sm:text-lg">
                    {unit.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-pencil">
                    {unit.description}
                  </p>

                  {/* Teacher + Uses */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white"
                        style={{ backgroundColor: unit.color }}
                        aria-hidden="true"
                      >
                        {unit.initial}
                      </div>
                      <span className="text-xs font-medium text-pencil">{unit.teacher}</span>
                    </div>
                    <span className="text-xs text-pencil/70">{unit.uses} Uses</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Show More */}
          <div className="mt-8 text-center sm:mt-10">
            <button className="focus-ring rounded-full border border-ruled px-6 py-2.5 font-ui text-sm font-medium text-pencil transition hover:border-ink-muted hover:bg-chalk hover:text-graphite">
              Show More
            </button>
          </div>
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className="border-t border-ruled bg-cream px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {/* Logo column */}
            <div className="lg:col-span-1">
              <Link href="/" className="inline-flex items-center gap-2" aria-label="Home">
                <svg width="24" height="24" viewBox="0 0 28 28" fill="none" aria-hidden="true" className="text-ink">
                  <path
                    d="M3 7.5C3 6.12 4.12 5 5.5 5H11c1.1 0 2.1.45 2.83 1.17L14 6.5l.17-.33C14.9 5.45 15.9 5 17 5h5.5C23.88 5 25 6.12 25 7.5V21c0 1.38-1.12 2.5-2.5 2.5H17c-1.1 0-2.1.45-2.83 1.17l-.17.33-.17-.33C13.1 23.95 12.1 23.5 11 23.5H5.5C4.12 23.5 3 22.38 3 21V7.5z"
                    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                  />
                  <path d="M14 6.5V24" stroke="currentColor" strokeWidth="1.8" />
                </svg>
                <span className="font-display text-lg text-ink">Backward Builder</span>
              </Link>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-pencil">
                Understanding by Design, powered by AI. Unit planning for teachers
                who know their students best.
              </p>
            </div>

            {/* UbD Resources */}
            <div>
              <h3 className="font-ui text-xs font-bold uppercase tracking-wider text-ink/60">
                UbD Resources
              </h3>
              <ul className="mt-3 space-y-2.5">
                <li>
                  <a href="https://www.ascd.org/books/understanding-by-design-expanded-2nd-edition" target="_blank" rel="noopener noreferrer" className="focus-ring text-sm text-pencil transition hover:text-ink">
                    Understanding by Design — ASCD
                  </a>
                </li>
                <li>
                  <a href="https://cft.vanderbilt.edu/guides-sub-pages/understanding-by-design/" target="_blank" rel="noopener noreferrer" className="focus-ring text-sm text-pencil transition hover:text-ink">
                    Vanderbilt UbD Guide
                  </a>
                </li>
                <li>
                  <a href="https://jaymctighe.com/" target="_blank" rel="noopener noreferrer" className="focus-ring text-sm text-pencil transition hover:text-ink">
                    Jay McTighe&apos;s Resources
                  </a>
                </li>
                <li>
                  <a href="https://www.edutopia.org/topic/understanding-by-design" target="_blank" rel="noopener noreferrer" className="focus-ring text-sm text-pencil transition hover:text-ink">
                    Edutopia — UbD Articles
                  </a>
                </li>
              </ul>
            </div>

            {/* Standards */}
            <div>
              <h3 className="font-ui text-xs font-bold uppercase tracking-wider text-ink/60">
                State Standards
              </h3>
              <ul className="mt-3 space-y-2.5">
                <li>
                  <a href="https://www.nextgenscience.org/search-standards" target="_blank" rel="noopener noreferrer" className="focus-ring text-sm text-pencil transition hover:text-ink">
                    NGSS Standards Directory
                  </a>
                </li>
                <li>
                  <a href="https://www.thecorestandards.org/read-the-standards/" target="_blank" rel="noopener noreferrer" className="focus-ring text-sm text-pencil transition hover:text-ink">
                    Common Core State Standards
                  </a>
                </li>
                <li>
                  <a href="https://www.achieve.org/our-initiatives/equip/tools" target="_blank" rel="noopener noreferrer" className="focus-ring text-sm text-pencil transition hover:text-ink">
                    EQuIP Rubric for Quality Units
                  </a>
                </li>
                <li>
                  <a href="https://dese.mo.gov/college-career-readiness/curriculum/missouri-learning-standards" target="_blank" rel="noopener noreferrer" className="focus-ring text-sm text-pencil transition hover:text-ink">
                    Missouri Learning Standards
                  </a>
                </li>
              </ul>
            </div>

            {/* Unit Planning */}
            <div>
              <h3 className="font-ui text-xs font-bold uppercase tracking-wider text-ink/60">
                Unit Planning
              </h3>
              <ul className="mt-3 space-y-2.5">
                <li>
                  <a href="https://www.learningforjustice.org/" target="_blank" rel="noopener noreferrer" className="focus-ring text-sm text-pencil transition hover:text-ink">
                    Learning for Justice
                  </a>
                </li>
                <li>
                  <a href="https://www.teachingchannel.com/" target="_blank" rel="noopener noreferrer" className="focus-ring text-sm text-pencil transition hover:text-ink">
                    Teaching Channel
                  </a>
                </li>
                <li>
                  <a href="https://cpalms.org/" target="_blank" rel="noopener noreferrer" className="focus-ring text-sm text-pencil transition hover:text-ink">
                    CPALMS Curriculum Resources
                  </a>
                </li>
                <li>
                  <a href="https://www.understood.org/en/articles/universal-design-for-learning-udl-what-it-is-and-how-it-works" target="_blank" rel="noopener noreferrer" className="focus-ring text-sm text-pencil transition hover:text-ink">
                    Universal Design for Learning
                  </a>
                </li>
              </ul>
            </div>

            {/* Product */}
            <div>
              <h3 className="font-ui text-xs font-bold uppercase tracking-wider text-ink/60">
                Product
              </h3>
              <ul className="mt-3 space-y-2.5">
                <li><Link href="/setup" className="focus-ring text-sm text-pencil transition hover:text-ink">Design a Unit</Link></li>
                <li><Link href="/api/demo" className="focus-ring text-sm text-pencil transition hover:text-ink">Try the Demo</Link></li>
                <li><Link href="/dashboard" className="focus-ring text-sm text-pencil transition hover:text-ink">My Units</Link></li>
                <li>
                  <a href="https://github.com/freebeerstudio/backward-builder" target="_blank" rel="noopener noreferrer" className="focus-ring text-sm text-pencil transition hover:text-ink">
                    Source Code
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      {/* ===================== COPYRIGHT BAR ===================== */}
      <div className="border-t border-ruled bg-chalk px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-xs text-pencil">
            BackwardBuilder.com · Vibeathon 2026 · Powered by Claude AI
          </p>
          <p className="mt-1">
            <a
              href="https://freebeer.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring text-xs font-medium text-ink-muted transition hover:text-ink"
            >
              Free Beer Studio
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
