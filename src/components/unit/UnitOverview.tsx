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
  isPublic: boolean;
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
 * UnitOverview — the 5-stage mission control dashboard for a unit.
 *
 * Academic editorial design: ink navy headers, paper-white cards with
 * ruled borders, serif display font for the title, clean typography.
 */
function UnitOverview({ unit, hasTasks, hasChecks, hasActivities, isOwner = true, isAuthenticated = true, authorName, gradeLevel, subject, state }: UnitOverviewProps) {
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);

  /* ---- Share modal state ---- */
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  /* ---- Direct email share state ---- */
  const [shareEmail, setShareEmail] = useState("");
  const [emailShareLoading, setEmailShareLoading] = useState(false);
  const [emailShareError, setEmailShareError] = useState<string | null>(null);
  const [emailShareSuccess, setEmailShareSuccess] = useState<string | null>(null);
  const [sharedWith, setSharedWith] = useState<
    { shareId: string; email: string; displayName: string | null; sharedAt: string }[]
  >([]);
  const [sharesLoading, setSharesLoading] = useState(false);
  const [removeShareLoading, setRemoveShareLoading] = useState<string | null>(null);

  /* ---- Community publish state ---- */
  const [isPublic, setIsPublic] = useState(unit.isPublic);
  const [publishLoading, setPublishLoading] = useState(false);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);

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

  /** Open the share modal — loads existing shares and generates link */
  async function openShareModal() {
    setShowShareModal(true);
    setEmailShareError(null);
    setEmailShareSuccess(null);
    setShareEmail("");

    // Load existing shares and link in parallel
    fetchSharedWith();
    fetchShareLink();
  }

  /** Fetch the list of teachers this unit is shared with */
  async function fetchSharedWith() {
    setSharesLoading(true);
    try {
      const res = await fetch(`/api/unit/${unit.id}/share`);
      if (!res.ok) throw new Error("Failed to load shares");
      const data = await res.json();
      setSharedWith(data.shares || []);
    } catch (err) {
      console.error("Failed to load shares:", err);
    } finally {
      setSharesLoading(false);
    }
  }

  /** Generate or fetch the share link */
  async function fetchShareLink() {
    setShareLoading(true);
    try {
      const res = await fetch(`/api/unit/${unit.id}/share`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to generate share link");
      const data = await res.json();
      setShareUrl(data.shareUrl);
    } catch (err) {
      console.error("Share link failed:", err);
    } finally {
      setShareLoading(false);
    }
  }

  /** Share directly by email */
  async function handleEmailShare(e: React.FormEvent) {
    e.preventDefault();
    if (!shareEmail.trim()) return;

    setEmailShareLoading(true);
    setEmailShareError(null);
    setEmailShareSuccess(null);

    try {
      const res = await fetch(`/api/unit/${unit.id}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: shareEmail.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setEmailShareError(data.error || "Failed to share.");
        return;
      }

      setEmailShareSuccess(`Shared with ${data.sharedWith?.email || shareEmail}`);
      setShareEmail("");
      // Refresh the shared-with list
      fetchSharedWith();
      // Clear success message after a few seconds
      setTimeout(() => setEmailShareSuccess(null), 3000);
    } catch (err) {
      setEmailShareError("Something went wrong. Please try again.");
    } finally {
      setEmailShareLoading(false);
    }
  }

  /** Remove a share */
  async function handleRemoveShare(shareId: string) {
    setRemoveShareLoading(shareId);
    try {
      const res = await fetch(`/api/unit/${unit.id}/share`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shareId }),
      });
      if (!res.ok) throw new Error("Failed to remove share");
      // Remove from local state immediately
      setSharedWith((prev) => prev.filter((s) => s.shareId !== shareId));
    } catch (err) {
      console.error("Failed to remove share:", err);
    } finally {
      setRemoveShareLoading(null);
    }
  }

  /** Copy share URL to clipboard */
  async function copyShareUrl() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  }

  /** Toggle community publishing */
  async function handlePublishToggle() {
    setPublishLoading(true);
    try {
      const res = await fetch(`/api/unit/${unit.id}/community`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to update community status");
      const data = await res.json();
      setIsPublic(data.isPublic);
      setShowPublishConfirm(false);
    } catch (err) {
      console.error("Publish toggle failed:", err);
    } finally {
      setPublishLoading(false);
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
                You&apos;re viewing a shared unit. Explore the design and use it as inspiration for your own.
              </p>
            </div>
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

      {/* ---- Status Badge (shows after Stage 3 is complete) ---- */}
      {hasActivities && unit.status !== "live" && unit.status !== "complete" && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/50 px-5 py-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckIcon className="h-4 w-4" />
          </div>
          <div>
            <p className="font-display text-sm font-semibold text-emerald-800">
              Design Complete — Ready to Deploy
            </p>
            <p className="font-ui text-xs text-emerald-600 mt-0.5">
              All three design stages are finished. Go live when you&apos;re ready to share with students.
            </p>
          </div>
        </div>
      )}

      {/* ---- Stage 4: Go Live ---- */}
      <Card hover={hasActivities}>
        <div className={`flex items-center gap-3 mb-5 ${!hasActivities ? "opacity-40" : ""}`}>
          <StageCircle number={4} isComplete={unit.status === "live" || unit.status === "complete"} />
          <h2 className="font-display text-lg text-ink">
            Stage 4: Go Live
          </h2>
          {!hasActivities && (
            <span className="ml-auto flex items-center gap-1 rounded-full bg-chalk px-2.5 py-0.5 font-ui text-xs text-pencil">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              Complete Stage 3 first
            </span>
          )}
        </div>

        {unit.status === "live" || unit.status === "complete" ? (
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
        ) : hasActivities ? (
          <div>
            <p className="font-ui text-sm text-pencil leading-relaxed mb-4">
              Share QR codes or short links with students. They&apos;ll access checks
              for understanding and performance tasks from any device — no login required.
            </p>
            {isOwner && (
              <Button
                variant="primary"
                size="md"
                onClick={() => router.push(`/unit/${unit.id}/publish`)}
              >
                Go Live →
              </Button>
            )}
          </div>
        ) : (
          <p className="font-ui text-sm text-pencil/50 leading-relaxed">
            Share QR codes or short links with students. Complete Stage 3 to unlock this step.
          </p>
        )}
      </Card>

      {/* ---- Stage 5: Results & Insights ---- */}
      <Card hover={unit.status === "live" || unit.status === "complete"}>
        <div className={`flex items-center gap-3 mb-5 ${unit.status !== "live" && unit.status !== "complete" ? "opacity-40" : ""}`}>
          <StageCircle number={5} isComplete={false} />
          <h2 className="font-display text-lg text-ink">
            Stage 5: Results & Insights
          </h2>
          {unit.status !== "live" && unit.status !== "complete" && (
            <span className="ml-auto flex items-center gap-1 rounded-full bg-chalk px-2.5 py-0.5 font-ui text-xs text-pencil">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              Go live first
            </span>
          )}
        </div>

        {unit.status === "live" || unit.status === "complete" ? (
          <>
            <p className="font-ui text-sm text-pencil leading-relaxed mb-4">
              View student submissions, auto-graded check results, and per-question
              accuracy breakdowns that show exactly what needs reteaching.
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => guardedAction(() => router.push(`/unit/${unit.id}/results`))}
            >
              View Results Dashboard
            </Button>
          </>
        ) : (
          <p className="font-ui text-sm text-pencil/50 leading-relaxed">
            Student submissions, auto-graded results, and reteach insights will appear here after your unit is live.
          </p>
        )}
      </Card>

      {/* ---- Share with Teachers & Publish to Community ---- */}
      {isOwner && (
        <Card hover>
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="font-display text-lg text-ink">
              Share & Collaborate
            </h2>
          </div>

          <div className="space-y-4">
            {/* Share with Teachers */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ruled bg-chalk/30 px-4 py-3">
              <div>
                <p className="font-ui text-sm font-medium text-graphite">Share with Teachers</p>
                <p className="font-ui text-xs text-pencil mt-0.5">
                  Generate a link to share this unit with other teachers.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={openShareModal}
              >
                Share
              </Button>
            </div>

            {/* Publish to Community */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ruled bg-chalk/30 px-4 py-3">
              <div>
                <p className="font-ui text-sm font-medium text-graphite">
                  Publish to Community
                  {isPublic && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-700">
                      Published
                    </span>
                  )}
                </p>
                <p className="font-ui text-xs text-pencil mt-0.5">
                  {isPublic
                    ? "This unit is visible in the community library."
                    : "Make this unit available to all teachers in the community library."}
                </p>
              </div>
              {isPublic ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPublishConfirm(true)}
                  disabled={publishLoading}
                >
                  Unpublish
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowPublishConfirm(true)}
                  disabled={publishLoading}
                >
                  Publish
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>

    {/* ---- Enhanced Share Modal (Google Docs-style) ---- */}
    {showShareModal && (
      <>
        <div
          className="fixed inset-0 z-[90] bg-ink/20 backdrop-blur-sm"
          onClick={() => setShowShareModal(false)}
          aria-hidden="true"
        />
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-xl border border-ruled bg-paper shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-ruled px-6 py-4">
              <h3 className="font-display text-lg text-ink">Share Unit</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="rounded p-1 text-pencil transition hover:bg-chalk hover:text-ink"
                aria-label="Close"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* ---- Method 1: Share by email ---- */}
              <div>
                <p className="font-ui text-sm font-medium text-graphite mb-2">
                  Share with a teacher
                </p>
                <form onSubmit={handleEmailShare} className="flex items-center gap-2">
                  <input
                    type="email"
                    placeholder="teacher@school.edu"
                    value={shareEmail}
                    onChange={(e) => {
                      setShareEmail(e.target.value);
                      setEmailShareError(null);
                    }}
                    className="flex-1 rounded-md border border-ruled bg-cream px-3 py-2 font-ui text-sm text-graphite placeholder:text-pencil/50 transition focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink/20"
                    disabled={emailShareLoading}
                  />
                  <button
                    type="submit"
                    disabled={emailShareLoading || !shareEmail.trim()}
                    className="focus-ring shrink-0 rounded-md bg-ink px-4 py-2 font-ui text-sm font-semibold text-white transition hover:bg-ink-light disabled:opacity-50"
                  >
                    {emailShareLoading ? "Sharing..." : "Share"}
                  </button>
                </form>

                {/* Error / success messages */}
                {emailShareError && (
                  <p className="mt-2 font-ui text-xs text-red-600">{emailShareError}</p>
                )}
                {emailShareSuccess && (
                  <div className="mt-2 flex items-center gap-1.5 rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2">
                    <svg className="h-4 w-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="font-ui text-xs text-emerald-700">{emailShareSuccess}</p>
                  </div>
                )}
              </div>

              {/* ---- Shared-with list ---- */}
              {sharesLoading ? (
                <div className="flex items-center justify-center py-4">
                  <p className="font-ui text-xs text-pencil">Loading...</p>
                </div>
              ) : sharedWith.length > 0 ? (
                <div>
                  <p className="font-ui text-[11px] font-bold uppercase tracking-wider text-ink/50 mb-2">
                    Shared with
                  </p>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {sharedWith.map((share) => (
                      <div
                        key={share.shareId}
                        className="flex items-center justify-between rounded-lg px-3 py-2 transition hover:bg-chalk/50 group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Avatar circle with initial */}
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink/10 text-ink">
                            <span className="font-ui text-xs font-semibold uppercase">
                              {(share.displayName || share.email)?.[0] || "?"}
                            </span>
                          </div>
                          <div className="min-w-0">
                            {share.displayName && (
                              <p className="font-ui text-sm font-medium text-graphite truncate">
                                {share.displayName}
                              </p>
                            )}
                            <p className="font-ui text-xs text-pencil truncate">
                              {share.email}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveShare(share.shareId)}
                          disabled={removeShareLoading === share.shareId}
                          className="shrink-0 rounded p-1 text-pencil/40 opacity-0 transition group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                          aria-label={`Remove share with ${share.email}`}
                        >
                          {removeShareLoading === share.shareId ? (
                            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          ) : (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* ---- Divider ---- */}
              <div className="flex items-center gap-3">
                <div className="flex-1 border-t border-ruled" />
                <span className="font-ui text-[11px] font-medium uppercase tracking-wider text-pencil/60">
                  Or share via link
                </span>
                <div className="flex-1 border-t border-ruled" />
              </div>

              {/* ---- Method 2: Share via link ---- */}
              <div>
                <p className="font-ui text-xs text-pencil mb-2">
                  Anyone with this link can view the unit and add it to their account.
                </p>
                {shareLoading ? (
                  <div className="flex items-center justify-center rounded-md border border-ruled bg-cream px-3 py-2">
                    <p className="font-ui text-xs text-pencil">Generating link...</p>
                  </div>
                ) : shareUrl ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={shareUrl}
                      className="flex-1 rounded-md border border-ruled bg-cream px-3 py-2 font-ui text-xs text-graphite"
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                    />
                    <button
                      onClick={copyShareUrl}
                      className="focus-ring shrink-0 rounded-md border border-ruled bg-chalk px-3 py-2 font-ui text-xs font-medium text-graphite transition hover:bg-ink hover:text-white hover:border-ink"
                    >
                      {shareCopied ? (
                        <span className="flex items-center gap-1">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          Copied
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy link
                        </span>
                      )}
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </>
    )}

    {/* ---- Publish Confirmation Modal ---- */}
    {showPublishConfirm && (
      <>
        <div
          className="fixed inset-0 z-[90] bg-ink/20 backdrop-blur-sm"
          onClick={() => setShowPublishConfirm(false)}
          aria-hidden="true"
        />
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl border border-ruled bg-paper p-6 shadow-xl">
            <h3 className="font-display text-lg text-ink mb-3">
              {isPublic ? "Remove from Community?" : "Publish to Community?"}
            </h3>
            <p className="font-ui text-sm text-pencil mb-5">
              {isPublic
                ? "This unit will no longer be visible in the community library. Teachers who already have it shared will keep their access."
                : "This unit will be visible to all teachers in the community library. Your name will be shown as the author."}
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowPublishConfirm(false)}
                disabled={publishLoading}
                className="focus-ring rounded-md px-4 py-2 font-ui text-sm font-medium text-pencil transition hover:bg-chalk hover:text-ink disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePublishToggle}
                disabled={publishLoading}
                className={`focus-ring rounded-md px-4 py-2 font-ui text-sm font-semibold text-white transition disabled:opacity-50 ${
                  isPublic
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-ink hover:bg-ink-light"
                }`}
              >
                {publishLoading
                  ? "Updating…"
                  : isPublic
                    ? "Unpublish"
                    : "Publish"}
              </button>
            </div>
          </div>
        </div>
      </>
    )}
    </>
  );
}

export { UnitOverview };
