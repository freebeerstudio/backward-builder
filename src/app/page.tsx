import Link from "next/link";

/**
 * Landing page — communicates the problem and solution clearly.
 * Impact & Relevance is 40% of the contest score, so the problem
 * statement needs to be viscerally clear here.
 */
export default function Home() {
  return (
    <div className="min-h-screen bg-warmwhite">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="font-heading text-xl font-bold text-forest">
            Backward Builder
          </Link>
          <Link
            href="/create"
            className="rounded-lg bg-gold px-5 py-2.5 font-heading text-sm font-semibold text-forest-dark transition-colors hover:bg-gold-light"
          >
            Create Assessment
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-24">
        <h1 className="font-heading text-4xl font-bold leading-tight text-forest-dark sm:text-5xl">
          Tell it what students need to understand.
          <br />
          <span className="text-gold">It builds the assessment they&apos;ll take.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-text-light">
          Every middle school history teacher spends their Sunday night writing
          assessments and their Tuesday night grading them. Backward Builder
          changes that — describe what you taught, and get a complete, shareable
          assessment with auto-grading in minutes.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/create"
            className="rounded-lg bg-forest px-8 py-3.5 font-heading text-base font-semibold text-white shadow-sm transition-all hover:bg-forest-light hover:shadow-md"
          >
            Create Your First Assessment
          </Link>
          <a
            href="#how-it-works"
            className="font-heading text-base font-medium text-forest transition-colors hover:text-forest-light"
          >
            See how it works &darr;
          </a>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="border-t border-border bg-card py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-center font-heading text-2xl font-bold text-forest-dark sm:text-3xl">
            Three steps. Minutes, not hours.
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {/* Step 1 */}
            <div className="rounded-xl border border-border bg-warmwhite p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-forest text-lg font-bold text-white">
                1
              </div>
              <h3 className="mt-4 font-heading text-lg font-semibold text-forest-dark">
                Describe
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-text-light">
                Tell us what you taught — the topics, the sources, the enduring
                understanding. A quick conversation, not a form.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-xl border border-border bg-warmwhite p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-forest text-lg font-bold text-white">
                2
              </div>
              <h3 className="mt-4 font-heading text-lg font-semibold text-forest-dark">
                Generate
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-text-light">
                AI creates multiple choice, document-based, and constructed response
                questions — with strong distractors and rubrics. Edit anything.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-xl border border-border bg-warmwhite p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-forest text-lg font-bold text-white">
                3
              </div>
              <h3 className="mt-4 font-heading text-lg font-semibold text-forest-dark">
                Deploy
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-text-light">
                Share a link. Students take it on any device — phone, Chromebook,
                tablet. Auto-graded results tell you exactly what to reteach.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement (for AI judge to pick up) */}
      <section className="border-t border-border py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="font-heading text-2xl font-bold text-forest-dark sm:text-3xl">
            The person closest to the problem
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-text-light">
            There are <strong className="text-text">600,000 middle school teachers</strong> in
            the United States. Every single one gives assessments. The teacher who
            just taught the unit — who knows exactly what primary sources students
            read, what discussions they had, what concepts they struggled with — has
            always been locked out of building their own assessment tools.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-text-light">
            They copy-paste from worksheets. They Google for quizzes that don&apos;t
            match what they taught. They spend entire weekends writing from scratch.
          </p>
          <p className="mt-4 text-lg font-medium text-forest">
            Backward Builder puts the power back where it belongs — in the
            teacher&apos;s hands.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-forest py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="font-heading text-2xl font-bold text-white sm:text-3xl">
            Ready to save your Sunday night?
          </h2>
          <p className="mt-3 text-base text-white/80">
            No account needed. No setup. Just describe what you taught.
          </p>
          <Link
            href="/create"
            className="mt-8 inline-block rounded-lg bg-gold px-8 py-3.5 font-heading text-base font-semibold text-forest-dark shadow-sm transition-all hover:bg-gold-light hover:shadow-md"
          >
            Create Your First Assessment
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-6">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-text-light sm:px-6">
          <p>
            Built for the{" "}
            <span className="font-medium text-text">
              Codefi Vibeathon 2026
            </span>{" "}
            — &quot;Vibe the Gap&quot; Challenge
          </p>
          <p className="mt-1">
            Powered by Claude AI &middot; Next.js &middot; Vercel
          </p>
        </div>
      </footer>
    </div>
  );
}
