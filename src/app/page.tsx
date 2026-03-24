import Link from "next/link";

/**
 * Landing page — tells the UbD story in three stages.
 *
 * This is the first thing judges and teachers see. It needs to:
 * 1. Communicate the backward design philosophy clearly
 * 2. Show the 3-stage flow (Desired Results → Evidence → Learning Plan)
 * 3. Make it dead simple to try the demo or start a new unit
 *
 * Impact & Relevance is 40% of the contest score, so the problem
 * statement and "Continue as Mrs. Crabapple" demo bypass are prominent.
 */
export default function Home() {
  return (
    <div className="min-h-screen bg-warmwhite">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="font-heading text-xl font-bold text-forest"
          >
            Backward Builder
          </Link>
          <Link
            href="/setup"
            className="rounded-lg bg-gold px-5 py-2.5 font-heading text-sm font-semibold text-forest-dark transition-colors hover:bg-gold-light"
          >
            Design a Unit
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-24">
        <h1 className="font-heading text-4xl font-bold leading-tight text-forest-dark sm:text-5xl lg:text-6xl">
          Design backward.
          <br />
          <span className="text-gold">Teach forward.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-text-light">
          From enduring understanding to standards-aligned unit plan — with
          AI-powered assessments, rubrics, and learning activities. The full
          Understanding by Design framework, built in minutes.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/api/demo"
            className="group relative inline-flex items-center gap-2 rounded-lg bg-gold px-8 py-3.5 font-heading text-base font-semibold text-forest-dark shadow-sm transition-all hover:bg-gold-light hover:shadow-md"
          >
            <svg
              className="h-5 w-5 transition-transform group-hover:scale-110"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
              />
            </svg>
            Continue as Mrs. Crabapple
          </Link>
          <Link
            href="/setup"
            className="rounded-lg bg-forest px-8 py-3.5 font-heading text-base font-semibold text-white shadow-sm transition-all hover:bg-forest-light hover:shadow-md"
          >
            Design a Unit
          </Link>
        </div>
        <p className="mt-4 font-body text-sm text-text-light">
          Try the demo unit instantly — no account needed
        </p>
      </section>

      {/* 3-Stage Visual */}
      <section className="border-t border-border bg-card py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-center font-heading text-2xl font-bold text-forest-dark sm:text-3xl">
            Three stages of backward design
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center font-body text-text-light">
            Wiggins &amp; McTighe&apos;s Understanding by Design framework,
            powered by AI. Plan from the end goal backward.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {/* Stage 1 */}
            <div className="relative rounded-xl border border-border bg-warmwhite p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forest font-heading text-sm font-bold text-white">
                  1
                </div>
                <h3 className="font-heading text-lg font-bold text-forest-dark">
                  Desired Results
                </h3>
              </div>
              <p className="font-body text-sm leading-relaxed text-text-light">
                Type what students need to understand. AI maps to your state
                standards, classifies the Bloom&apos;s level, and generates
                essential questions that drive inquiry.
              </p>
              {/* Connector arrow (desktop) */}
              <div className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 sm:block">
                <svg
                  className="h-6 w-6 text-forest"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M10 6l6 6-6 6V6z" />
                </svg>
              </div>
            </div>

            {/* Stage 2 */}
            <div className="relative rounded-xl border border-border bg-warmwhite p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forest font-heading text-sm font-bold text-white">
                  2
                </div>
                <h3 className="font-heading text-lg font-bold text-forest-dark">
                  Evidence
                </h3>
              </div>
              <p className="font-body text-sm leading-relaxed text-text-light">
                Get GRASPS-based performance tasks with multi-criterion rubrics,
                plus formative checks for understanding — all shareable via
                link, auto-graded with results.
              </p>
              {/* Connector arrow (desktop) */}
              <div className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 sm:block">
                <svg
                  className="h-6 w-6 text-forest"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M10 6l6 6-6 6V6z" />
                </svg>
              </div>
            </div>

            {/* Stage 3 */}
            <div className="rounded-xl border border-border bg-warmwhite p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forest font-heading text-sm font-bold text-white">
                  3
                </div>
                <h3 className="font-heading text-lg font-bold text-forest-dark">
                  Learning Plan
                </h3>
              </div>
              <p className="font-body text-sm leading-relaxed text-text-light">
                Activities sequenced to scaffold toward the performance task.
                Each lesson builds a specific skill, with formative checks
                placed at natural diagnostic points.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="border-t border-border py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="font-heading text-2xl font-bold text-forest-dark sm:text-3xl">
            The person closest to the problem
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-text-light">
            There are{" "}
            <strong className="text-text">
              3.7 million teachers in the United States
            </strong>
            . The person closest to the problem — the teacher who just planned
            the unit, who knows exactly what enduring understandings students
            need, what discussions they had, what concepts they struggled with —
            has always been locked out of building their own curriculum tools.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-text-light">
            They copy unit plans from textbooks that don&apos;t match their
            students. They Google for rubrics that don&apos;t align to their
            standards. They spend entire weekends writing assessments from
            scratch — and then discover what to reteach only after it&apos;s too
            late.
          </p>
          <p className="mt-4 text-lg font-medium text-forest">
            Backward Builder puts the power of Understanding by Design back
            where it belongs — in the teacher&apos;s hands.
          </p>
        </div>
      </section>

      {/* Demo CTA */}
      <section className="border-t border-border bg-forest py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="font-heading text-2xl font-bold text-white sm:text-3xl">
            See it in action
          </h2>
          <p className="mt-3 text-base text-white/80">
            Mrs. Crabapple&apos;s 7th grade science unit is pre-seeded and ready
            to explore. Walk through all three stages of backward design in
            under two minutes.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/api/demo"
              className="inline-flex items-center gap-2 rounded-lg bg-gold px-8 py-3.5 font-heading text-base font-semibold text-forest-dark shadow-sm transition-all hover:bg-gold-light hover:shadow-md"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
                />
              </svg>
              Continue as Mrs. Crabapple
            </Link>
            <Link
              href="/setup"
              className="rounded-lg border-2 border-white/30 px-8 py-3.5 font-heading text-base font-semibold text-white transition-all hover:border-white/60 hover:bg-white/10"
            >
              Design Your Own Unit
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-6">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-text-light sm:px-6">
          <p>
            <a
              href="https://backwardbuilder.com"
              className="font-medium text-text transition-colors hover:text-forest"
            >
              BackwardBuilder.com
            </a>{" "}
            &middot;{" "}
            <span className="font-medium text-text">Vibeathon 2026</span>{" "}
            &middot; Powered by Claude AI
          </p>
        </div>
      </footer>
    </div>
  );
}
