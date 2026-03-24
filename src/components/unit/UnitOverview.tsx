"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StandardPopover } from "@/components/ui/StandardPopover";
import { AuthModal } from "@/components/auth/AuthModal";
import type { CognitiveLevel } from "@/types";

interface UnitData {
  id: string;
  title: string;
  enduringUnderstanding: string;
  essentialQuestions: string[] | null;
  standardCodes: string[] | null;
  standardDescriptions: string[] | null;
  standardUrls: string[] | null;
  cognitiveLevel: CognitiveLevel | null;
  cognitiveLevelExplanation: string | null;
  status: string;
}

interface UnitOverviewProps {
  unit: UnitData;
  hasTasks: boolean;
  hasChecks: boolean;
  hasActivities: boolean;
  /** Whether the current visitor owns this unit */
  isOwner?: boolean;
  /** Whether the current visitor is authenticated at all */
  isAuthenticated?: boolean;
  /** Display name of the unit author */
  authorName?: string;
  /** Classroom context — shown as pill tags below the title */
  gradeLevel?: string | null;
  subject?: string | null;
  state?: string | null;
}

const COGNITIVE_LEVEL_LABELS: Record<CognitiveLevel, string> = {
  remember: "Remember",
  understand: "Understand",
  apply: "Apply",
  analyze: "Analyze",
  evaluate: "Evaluate",
  create: "Create",
};

/**
 * Cognitive level badge colors — academic editorial palette.
 * Uses muted tones that feel scholarly, not SaaS-neon.
 */
const COGNITIVE_LEVEL_COLORS: Record<CognitiveLevel, string> = {
  remember: "bg-chalk text-pencil border border-ruled",
  understand: "bg-ink/5 text-ink border border-ink/15",
  apply: "bg-emerald-50 text-emerald-800 border border-emerald-200",
  analyze: "bg-violet-50 text-violet-800 border border-violet-200",
  evaluate: "bg-amber/10 text-amber border border-amber/20",
  create: "bg-burgundy/10 text-burgundy border border-burgundy/20",
};

/** Checkmark icon reused across stages */
function CheckIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

/** Stage number circle — filled for complete, outlined for pending */
function StageCircle({
  number,
  isComplete,
}: {
  number: number;
  isComplete: boolean;
}) {
  return (
    <div
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-ui font-semibold ${
        isComplete
          ? "bg-ink text-white"
          : "border-2 border-ruled bg-paper text-pencil"
      }`}
    >
      {isComplete ? <CheckIcon /> : number}
    </div>
  );
}

/**
 * UnitOverview — the 3-stage dashboard for a unit.
 *
 * Academic editorial design: ink navy headers, paper-white cards with
 * ruled borders, serif display font for the title, clean typography.
 */
function UnitOverview({ unit, hasTasks, hasChecks, hasActivities, isOwner = true, isAuthenticated = true, authorName, gradeLevel, subject, state }: UnitOverviewProps) {
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);

  /**
   * Guard for edit actions. If the user isn't the owner (or isn't even
   * authenticated), show the auth modal instead of navigating.
   */
  function guardedAction(action: () => void) {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    if (!isOwner) {
      // Authenticated but not the owner — could copy/remix in future.
      // For now, show a message or the auth modal.
      setShowAuthModal(true);
      return;
    }
    action();
  }

  return (
    <>
    {/* Auth modal for non-owners / unauthenticated visitors */}
    {showAuthModal && (
      <div className="fixed inset-0 z-[90] bg-ink/20 backdrop-blur-sm" aria-hidden="true" />
    )}
    <AuthModal
      isOpen={showAuthModal}
      onSuccess={() => {
        setShowAuthModal(false);
        // Reload to re-render with authenticated state
        window.location.reload();
      }}
      onClose={() => setShowAuthModal(false)}
    />

    <div className="space-y-6">
      {/* Community unit banner for visitors */}
      {!isOwner && (
        <div className="rounded-xl border border-ruled bg-chalk/50 px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-ui text-sm font-medium text-graphite">
                {authorName ? `Shared by ${authorName}` : "Community Unit"}
              </p>
              <p className="font-ui text-xs text-pencil mt-0.5">
                {isAuthenticated
                  ? "You're viewing a shared unit. Copy it to your account to customize."
                  : "Sign up to create your own units or remix this one."}
              </p>
            </div>
            <button
              onClick={() => setShowAuthModal(true)}
              className="focus-ring rounded-lg bg-ink px-4 py-2 font-ui text-sm font-semibold text-white shadow-sm transition hover:bg-ink-light"
            >
              {isAuthenticated ? "Copy to My Units" : "Sign Up to Remix"}
            </button>
          </div>
        </div>
      )}

      {/* ---- Unit Header ---- */}
      <div>
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h1 className="font-display text-2xl text-ink md:text-3xl">
            {unit.title}
          </h1>
          {unit.cognitiveLevel && (
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-ui font-semibold ${
                COGNITIVE_LEVEL_COLORS[unit.cognitiveLevel]
              }`}
            >
              {COGNITIVE_LEVEL_LABELS[unit.cognitiveLevel]}
            </span>
          )}
        </div>

        {/* Classroom context line */}
        {(gradeLevel || subject || state) && (
          <p className="font-ui text-sm text-pencil italic mb-3">
            Based on {state || "state"} standards for {gradeLevel ? `${gradeLevel} ` : ""}{subject || "this subject"}
          </p>
        )}

        <p className="font-ui text-sm text-pencil leading-relaxed md:text-base">
          {unit.enduringUnderstanding}
        </p>
      </div>

      {/* ---- Stage 1: Desired Results (always complete) ---- */}
      <Card hover>
        <div className="flex items-center gap-3 mb-5">
          <StageCircle number={1} isComplete />
          <h2 className="font-display text-lg text-ink">
            Stage 1: Desired Results
          </h2>
        </div>

        {/* Standards — linked to authoritative source when URL available */}
        {unit.standardCodes && unit.standardCodes.length > 0 && (
          <div className="mb-5">
            <p className="text-[11px] font-ui font-bold uppercase tracking-wider text-ink/50 mb-2">
              Aligned Standards
            </p>
            <div className="flex flex-wrap gap-2">
              {unit.standardCodes.map((code, i) => (
                <StandardPopover
                  key={code}
                  code={code}
                  description={unit.standardDescriptions?.[i] || ""}
                  url={unit.standardUrls?.[i]}
                />
              ))}
            </div>
          </div>
        )}

        {/* Cognitive Level */}
        {unit.cognitiveLevelExplanation && (
          <div className="mb-5">
            <p className="text-[11px] font-ui font-bold uppercase tracking-wider text-ink/50 mb-1.5">
              Cognitive Level
            </p>
            <p className="font-ui text-sm text-graphite leading-relaxed">
              {unit.cognitiveLevelExplanation}
            </p>
          </div>
        )}

        {/* Essential Questions */}
        {unit.essentialQuestions && unit.essentialQuestions.length > 0 && (
          <div>
            <p className="text-[11px] font-ui font-bold uppercase tracking-wider text-ink/50 mb-2.5">
              Essential Questions
            </p>
            <ul className="space-y-2">
              {unit.essentialQuestions.map((q, i) => (
                <li key={i} className="flex gap-2 font-ui text-sm text-graphite">
                  <span className="shrink-0 font-semibold text-ink">
                    Q{i + 1}.
                  </span>
                  <span className="italic leading-relaxed">{q}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {/* ---- Stage 2: Evidence ---- */}
      <Card hover>
        <div className="flex items-center gap-3 mb-5">
          <StageCircle number={2} isComplete={hasTasks && hasChecks} />
          <h2 className="font-display text-lg text-ink">
            Stage 2: Evidence
          </h2>
        </div>

        {hasTasks || hasChecks ? (
          <div className="space-y-2.5">
            {hasTasks && (
              <div className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-emerald-600" />
                <span className="font-ui text-sm text-graphite">Performance tasks generated</span>
              </div>
            )}
            {hasChecks && (
              <div className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-emerald-600" />
                <span className="font-ui text-sm text-graphite">Checks for understanding generated</span>
              </div>
            )}
            <div className="pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => guardedAction(() => router.push(`/unit/${unit.id}/stage2`))}
              >
                {isOwner ? "View & Edit Stage 2" : "View Stage 2"}
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <p className="font-ui text-sm text-pencil leading-relaxed mb-4">
              Generate performance tasks and formative checks that measure whether
              students have achieved the desired results.
            </p>
            {isOwner && (
              <Button
                variant="primary"
                size="md"
                onClick={() => router.push(`/unit/${unit.id}/stage2`)}
              >
                Generate Evidence
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* ---- Stage 3: Learning Plan ---- */}
      <Card hover>
        <div className="flex items-center gap-3 mb-5">
          <StageCircle number={3} isComplete={hasActivities} />
          <h2 className="font-display text-lg text-ink">
            Stage 3: Learning Plan
          </h2>
        </div>

        {hasActivities ? (
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-emerald-600" />
              <span className="font-ui text-sm text-graphite">Learning activities generated</span>
            </div>
            <div className="pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => guardedAction(() => router.push(`/unit/${unit.id}/stage3`))}
              >
                {isOwner ? "View & Edit Stage 3" : "View Stage 3"}
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <p className="font-ui text-sm text-pencil leading-relaxed mb-4">
              Design scaffolded learning activities that build student capacity toward
              the performance task — planned last because every activity serves the
              assessments.
            </p>
            {isOwner && (
              <Button
                variant="primary"
                size="md"
                disabled={!hasTasks || !hasChecks}
                onClick={() => router.push(`/unit/${unit.id}/stage3`)}
              >
                Generate Learning Plan
              </Button>
            )}
            {(!hasTasks || !hasChecks) && (
              <p className="font-ui text-xs text-pencil mt-2">
                Complete Stage 2 first — in backward design, activities are planned after assessments.
              </p>
            )}
          </div>
        )}
      </Card>
    </div>
    </>
  );
}

export { UnitOverview };
