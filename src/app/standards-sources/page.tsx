import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { ButterflyLogo } from "@/components/ui/ButterflyLogo";

export const metadata: Metadata = {
  title: "Standards Sources & Attribution",
  description:
    "Backward Builder's education standards come from verified, official sources. Learn about our data integrity commitment and attribution.",
};

/**
 * Standards Sources page — transparency about where our standards come from.
 *
 * This page serves two purposes:
 * 1. Legal attribution for CC-licensed data (required by CC BY 3.0)
 * 2. Trust signal for teachers — they can verify every standard is real
 */
export default function StandardsSourcesPage() {
  return (
    <div className="min-h-screen bg-cream font-ui">
      <Header />

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        {/* Page header */}
        <div className="mb-10">
          <h1 className="font-display text-3xl text-ink sm:text-4xl">
            Standards Sources &amp; Attribution
          </h1>
          <p className="mt-3 font-ui text-base leading-relaxed text-pencil sm:text-lg">
            Every education standard in Backward Builder comes from an official,
            verified source. We never generate, approximate, or hallucinate
            standard codes or descriptions.
          </p>
        </div>

        {/* Integrity commitment */}
        <section className="mb-10 rounded-xl border border-ruled bg-paper p-6 sm:p-8">
          <h2 className="font-display text-xl text-ink mb-3">
            Our Data Integrity Commitment
          </h2>
          <div className="space-y-3 font-ui text-sm leading-relaxed text-graphite">
            <p>
              Standards determine what students are taught. There is no room for
              error. Backward Builder enforces a <strong>zero-hallucination policy</strong> for
              education standards:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                AI is <strong>never allowed</strong> to generate standard codes or descriptions.
                Claude selects from a pre-verified list — it cannot invent standards.
              </li>
              <li>
                Every standard code returned by AI is <strong>validated against our database</strong> before
                being saved. Unverified codes are silently dropped.
              </li>
              <li>
                If we don&apos;t have verified standards for a state or subject,
                we show <strong>no standards</strong> rather than risk showing incorrect ones.
              </li>
              <li>
                Standards URLs link to <strong>authoritative sources</strong> — official
                state education department pages, NGSS, or Common Core sites.
              </li>
            </ul>
          </div>
        </section>

        {/* Primary source: CSP */}
        <section className="mb-8 rounded-xl border border-ruled bg-paper p-6 sm:p-8">
          <div className="flex items-start gap-3 mb-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-white text-xs font-bold">
              1
            </div>
            <div>
              <h2 className="font-display text-lg text-ink">
                Common Standards Project
              </h2>
              <p className="text-xs text-pencil mt-0.5">Primary standards source — all 50 states</p>
            </div>
          </div>
          <div className="space-y-3 font-ui text-sm leading-relaxed text-graphite">
            <p>
              Our primary standards database is powered by the{" "}
              <a
                href="https://commonstandardsproject.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-ink underline decoration-ruled hover:decoration-ink"
              >
                Common Standards Project
              </a>{" "}
              (CSP), an open-source database of academic standards from all 50 US
              states, the District of Columbia, and national organizations.
            </p>
            <p>
              CSP aggregates standards directly from official state education
              department publications and provides them in a structured,
              machine-readable format.
            </p>
            <div className="rounded-lg bg-chalk p-4 text-xs">
              <p className="font-semibold text-ink mb-1">License &amp; Attribution</p>
              <p>
                Standards data: <strong>Creative Commons Attribution 3.0 United States</strong> (CC BY 3.0 US)
              </p>
              <p>Rights holder: D2L Corporation</p>
              <p>
                API source code:{" "}
                <a
                  href="https://github.com/commonstandardsproject/api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink underline"
                >
                  Apache License 2.0
                </a>
              </p>
              <p className="mt-2">
                Website:{" "}
                <a href="https://commonstandardsproject.com" target="_blank" rel="noopener noreferrer" className="text-ink underline">
                  commonstandardsproject.com
                </a>
                {" · "}
                <a href="https://commonstandardsproject.com/developers" target="_blank" rel="noopener noreferrer" className="text-ink underline">
                  Developer docs
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* NGSS */}
        <section className="mb-8 rounded-xl border border-ruled bg-paper p-6 sm:p-8">
          <div className="flex items-start gap-3 mb-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-white text-xs font-bold">
              2
            </div>
            <div>
              <h2 className="font-display text-lg text-ink">
                Next Generation Science Standards (NGSS)
              </h2>
              <p className="text-xs text-pencil mt-0.5">Local fallback — middle school science</p>
            </div>
          </div>
          <div className="space-y-3 font-ui text-sm leading-relaxed text-graphite">
            <p>
              We maintain a local copy of all 52 middle school NGSS Performance
              Expectations, sourced directly from the official NGSS website.
              This serves as a fast fallback when the CSP API is unreachable.
            </p>
            <div className="rounded-lg bg-chalk p-4 text-xs">
              <p className="font-semibold text-ink mb-1">Source</p>
              <p>
                <a href="https://www.nextgenscience.org/search-standards" target="_blank" rel="noopener noreferrer" className="text-ink underline">
                  nextgenscience.org
                </a>
                {" — "}DCI Arrangement pages for MS-PS1 through MS-ETS1
              </p>
              <p className="mt-1">
                NGSS is a registered trademark of Achieve, Inc.
                Standards are © 2013 Achieve, Inc. Used for educational reference.
              </p>
              <p className="mt-1">
                Adopted by 40+ states and the District of Columbia.
              </p>
            </div>
          </div>
        </section>

        {/* Common Core */}
        <section className="mb-8 rounded-xl border border-ruled bg-paper p-6 sm:p-8">
          <div className="flex items-start gap-3 mb-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-white text-xs font-bold">
              3
            </div>
            <div>
              <h2 className="font-display text-lg text-ink">
                Common Core State Standards (CCSS)
              </h2>
              <p className="text-xs text-pencil mt-0.5">Local fallback — ELA &amp; Mathematics</p>
            </div>
          </div>
          <div className="space-y-3 font-ui text-sm leading-relaxed text-graphite">
            <p>
              We maintain local copies of Common Core standards for English
              Language Arts and Mathematics (grades 5–8), sourced from the
              official CCSS Initiative website and verified against state
              education department publications.
            </p>
            <div className="rounded-lg bg-chalk p-4 text-xs">
              <p className="font-semibold text-ink mb-1">Sources</p>
              <p>
                <a href="https://www.thecorestandards.org/ELA-Literacy/" target="_blank" rel="noopener noreferrer" className="text-ink underline">
                  thecorestandards.org/ELA-Literacy
                </a>
                {" — "}ELA standards (RL, RI, W, RH, RST strands)
              </p>
              <p>
                <a href="https://www.thecorestandards.org/Math/" target="_blank" rel="noopener noreferrer" className="text-ink underline">
                  thecorestandards.org/Math
                </a>
                {" — "}Mathematics standards (all domains, grades 5–8)
              </p>
              <p className="mt-1">
                Cross-referenced with:{" "}
                <a href="https://learning.ccsso.org/wp-content/uploads/2022/11/ADA-Compliant-Math-Standards.pdf" target="_blank" rel="noopener noreferrer" className="text-ink underline">
                  CCSSO Official Standards PDF
                </a>
              </p>
              <p className="mt-1">
                © 2010 National Governors Association Center for Best Practices
                and Council of Chief State School Officers. Used for educational reference.
              </p>
              <p className="mt-1">
                Adopted by 41 states, the District of Columbia, four territories,
                and the Department of Defense Education Activity.
              </p>
            </div>
          </div>
        </section>

        {/* AI disclosure */}
        <section className="mb-10 rounded-xl border border-ruled bg-paper p-6 sm:p-8">
          <div className="flex items-start gap-3 mb-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-burgundy/10 text-burgundy text-xs font-bold">
              AI
            </div>
            <div>
              <h2 className="font-display text-lg text-ink">
                AI-Powered Unit Planning
              </h2>
              <p className="text-xs text-pencil mt-0.5">How Claude AI uses standards data</p>
            </div>
          </div>
          <div className="space-y-3 font-ui text-sm leading-relaxed text-graphite">
            <p>
              Backward Builder uses{" "}
              <a href="https://anthropic.com" target="_blank" rel="noopener noreferrer" className="font-medium text-ink underline decoration-ruled hover:decoration-ink">
                Claude by Anthropic
              </a>{" "}
              to generate unit plans, performance tasks, essential questions, and
              learning activities. However, Claude does <strong>not</strong> generate
              standards — it only selects from our pre-verified database.
            </p>
            <p>
              The AI pipeline works as follows:
            </p>
            <ol className="list-decimal pl-5 space-y-1.5">
              <li>We fetch verified standards for the teacher&apos;s state, subject, and grade</li>
              <li>The full list of verified standards is included in Claude&apos;s prompt</li>
              <li>Claude selects 2–4 standards that best align with the enduring understanding</li>
              <li>Every code Claude returns is validated against our database before saving</li>
              <li>Any unrecognized code is silently dropped</li>
            </ol>
            <p>
              Unit content (titles, essential questions, performance tasks, rubrics,
              learning activities) is AI-generated and should be reviewed by the
              teacher before use in the classroom.
            </p>
          </div>
        </section>

        {/* Contact */}
        <div className="text-center text-sm text-pencil">
          <p>
            Questions about our standards data?{" "}
            <a href="mailto:wayne@freebeer.ai" className="font-medium text-ink underline decoration-ruled hover:decoration-ink">
              Contact us
            </a>
          </p>
        </div>
      </main>

      {/* Copyright bar */}
      <div className="border-t border-ruled bg-chalk px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-xs text-pencil">
            BackwardBuilder.com · Vibeathon 2026 · Powered by Claude AI
          </p>
          <p className="mt-1">
            <a href="https://freebeer.ai" target="_blank" rel="noopener noreferrer" className="focus-ring text-xs font-medium text-ink-muted transition hover:text-ink">
              Free Beer Studio
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
