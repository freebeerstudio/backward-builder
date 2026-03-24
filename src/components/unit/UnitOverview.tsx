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
  standardSetTitles: (string | null)[] | null;
  standardSetSubjects: (string | null)[] | null;
  standardSetLevels: (string[] | null)[] | null;
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

  /* ---- Inline-editable Essential Questions state ---- */
  const [editingEQs, setEditingEQs] = useState(false);
  const [eqDraft, setEqDraft] = useState<string[]>(unit.essentialQuestions || []);
  const [eqSaving, setEqSaving] = useState(false);
  const [eqError, setEqError] = useState<string | null>(null);
  /* Live display values — updated optimistically on save */
  const [displayEQs, setDisplayEQs] = useState<string[]>(unit.essentialQuestions || []);

  function startEditingEQs() {
    setEqDraft([...displayEQs]);
    setEqError(null);
    setEditingEQs(true);
  }

  function cancelEditingEQs() {
    setEditingEQs(false);
    setEqError(null);
  }

  function updateEqDraft(index: number, value: string) {
    setEqDraft((prev) => prev.map((q, i) => (i === index ? value : q)));
  }

  function addEq() {
    setEqDraft((prev) => [...prev, ""]);
  }

  function removeEq(index: number) {
    if (eqDraft.length <= 1) return; // Keep at least one
    setEqDraft((prev) => prev.filter((_, i) => i !== index));
  }

  async function saveEQs() {
    const cleaned = eqDraft.map((q) => q.trim()).filter((q) => q.length > 0);
    if (cleaned.length === 0) {
      setEqError("At least one essential question is required.");
      return;
    }

    setEqSaving(true);
    setEqError(null);

    try {
      const res = await fetch(`/api/unit/${unit.id}/update-eqs`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ essentialQuestions: cleaned }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save");
      }

      const data = await res.json();
      setDisplayEQs(data.essentialQuestions);
      setEditingEQs(false);
    } catch (err) {
      setEqError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setEqSaving(false);
    }
  }

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
                  setTitle={unit.standardSetTitles?.[i]}
                  setSubject={unit.standardSetSubjects?.[i]}
                  setEducationLevels={unit.standardSetLevels?.[i]}
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

        {/* Essential Questions — inline editable for unit owner */}
        {displayEQs.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[11px] font-ui font-bold uppercase tracking-wider text-ink/50">
                Essential Questions
              </p>
              {isOwner && !editingEQs && (
                <button
                  onClick={startEditingEQs}
                  className="focus-ring rounded px-2 py-0.5 font-ui text-[11px] font-medium text-pencil transition hover:bg-chalk hover:text-ink"
                  aria-label="Edit essential questions"
                >
                  <svg className="mr-1 inline-block h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Edit
                </button>
              )}
            </div>

            {editingEQs ? (
              /* ---- Edit mode ---- */
              <div className="space-y-3">
                {eqDraft.map((q, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="shrink-0 pt-2 font-ui text-sm font-semibold text-ink">
                      Q{i + 1}.
                    </span>
                    <textarea
                      value={q}
                      onChange={(e) => updateEqDraft(i, e.target.value)}
                      rows={2}
                      className="flex-1 rounded-md border border-ruled bg-cream px-3 py-2 font-ui text-sm text-graphite italic leading-relaxed transition focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink/20"
                      placeholder="Enter an essential question…"
                    />
                    {eqDraft.length > 1 && (
                      <button
                        onClick={() => removeEq(i)}
                        className="shrink-0 mt-2 rounded p-1 text-pencil/50 transition hover:bg-red-50 hover:text-red-500"
                        aria-label={`Remove question ${i + 1}`}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}

                {/* Add question button */}
                <button
                  onClick={addEq}
                  className="focus-ring ml-7 flex items-center gap-1 rounded px-2 py-1 font-ui text-xs font-medium text-pencil transition hover:bg-chalk hover:text-ink"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Question
                </button>

                {/* Error message */}
                {eqError && (
                  <p className="ml-7 font-ui text-xs text-red-600">{eqError}</p>
                )}

                {/* Save / Cancel */}
                <div className="ml-7 flex items-center gap-2 pt-1">
                  <button
                    onClick={saveEQs}
                    disabled={eqSaving}
                    className="focus-ring rounded-md bg-ink px-3.5 py-1.5 font-ui text-xs font-semibold text-white transition hover:bg-ink-light disabled:opacity-50"
                  >
                    {eqSaving ? "Saving…" : "Save"}
                  </button>
                  <button
                    onClick={cancelEditingEQs}
                    disabled={eqSaving}
                    className="focus-ring rounded-md px-3.5 py-1.5 font-ui text-xs font-medium text-pencil transition hover:bg-chalk hover:text-ink disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* ---- Read mode ---- */
              <ul className="space-y-2">
                {displayEQs.map((q, i) => (
                  <li key={i} className="flex gap-2 font-ui text-sm text-graphite">
                    <span className="shrink-0 font-semibold text-ink">
                      Q{i + 1}.
                    </span>
                    <span className="italic leading-relaxed">{q}</span>
                  </li>
                ))}
              </ul>
            )}
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

      {/* ---- Launch & Results ---- */}
      {/* Only show after all 3 stages are complete */}
      {hasActivities && (
        <>
          {/* Publish / Go Live card */}
          <Card hover>
            <div className="flex items-center gap-3 mb-5">
              {/* Rocket icon for launch */}
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                unit.status === "complete"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              }`}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h2 className="font-display text-lg text-ink">
                Share with Students
              </h2>
            </div>

            {unit.status === "complete" ? (
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-emerald-600" />
                  <span className="font-ui text-sm text-graphite">Unit is live — students can access checks and tasks</span>
                </div>
                <div className="pt-2 flex flex-wrap gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => guardedAction(() => window.open(`/unit/${unit.id}/publish`, '_blank'))}
                  >
                    View QR Codes & Share Links
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <p className="font-ui text-sm text-pencil leading-relaxed mb-4">
                  Go live and share QR codes or short links with students.
                  They&apos;ll access checks for understanding and performance tasks
                  from any device — no login required.
                </p>
                {isOwner && (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => window.open(`/unit/${unit.id}/publish`, '_blank')}
                  >
                    Go Live →
                  </Button>
                )}
              </div>
            )}
          </Card>

          {/* Results card */}
          {unit.status === "complete" && (
            <Card hover>
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h2 className="font-display text-lg text-ink">
                  Results & Insights
                </h2>
              </div>

              <p className="font-ui text-sm text-pencil leading-relaxed mb-4">
                View student submissions, auto-graded check results, AI-scored performance
                tasks, and per-question accuracy breakdowns.
              </p>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => guardedAction(() => router.push(`/unit/${unit.id}/results`))}
              >
                View Results Dashboard
              </Button>
            </Card>
          )}
        </>
      )}
    </div>
    </>
  );
}

export { UnitOverview };
