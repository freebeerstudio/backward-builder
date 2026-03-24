"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { QRCodeDisplay } from "@/components/unit/QRCodeDisplay";

interface AssessmentInfo {
  id: string;
  title: string;
  shareCode: string | null;
  status: string;
}

interface PublishedItem {
  id: string;
  title: string;
  shareCode: string;
  url: string;
}

interface PublishClientProps {
  unitId: string;
  isPublished: boolean;
  tasks: AssessmentInfo[];
  checks: AssessmentInfo[];
}

type PublishPhase = "ready" | "publishing" | "celebrating" | "done";

const PUBLISH_STEPS = [
  "Preparing your assessments...",
  "Generating share codes...",
  "Going live!",
];

function PublishClient({
  unitId,
  isPublished: initialPublished,
  tasks: initialTasks,
  checks: initialChecks,
}: PublishClientProps) {
  const [isPublished, setIsPublished] = useState(initialPublished);
  const [phase, setPhase] = useState<PublishPhase>(
    initialPublished ? "done" : "ready"
  );
  const [publishStepIndex, setPublishStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [publishedChecks, setPublishedChecks] = useState<PublishedItem[]>(
    initialChecks
      .filter((c) => c.status === "live" && c.shareCode)
      .map((c) => ({
        id: c.id,
        title: c.title,
        shareCode: c.shareCode!,
        url: `${typeof window !== "undefined" ? window.location.origin : ""}/check/${c.shareCode}`,
      }))
  );
  const [publishedTasks, setPublishedTasks] = useState<PublishedItem[]>(
    initialTasks
      .filter((t) => t.status === "live" && t.shareCode)
      .map((t) => ({
        id: t.id,
        title: t.title,
        shareCode: t.shareCode!,
        url: `${typeof window !== "undefined" ? window.location.origin : ""}/task/${t.shareCode}`,
      }))
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const handlePublish = useCallback(async () => {
    setPhase("publishing");
    setPublishStepIndex(0);
    setError(null);

    // Step through progress messages with delays
    const stepDelay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    try {
      // Start the API call
      const fetchPromise = fetch(`/api/unit/${unitId}/publish`, {
        method: "POST",
      });

      // Animate through steps while waiting
      await stepDelay(800);
      setPublishStepIndex(1);
      await stepDelay(800);
      setPublishStepIndex(2);

      const res = await fetchPromise;

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to publish");
      }

      const data = await res.json();
      setPublishedChecks(data.checks);
      setPublishedTasks(data.tasks);
      setIsPublished(true);

      // Brief pause before celebration
      await stepDelay(400);
      setPhase("celebrating");
      setShowConfetti(true);

      // Confetti lasts 2 seconds, then transition to done
      setTimeout(() => setShowConfetti(false), 2000);
      setTimeout(() => setPhase("done"), 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setPhase("ready");
    }
  }, [unitId]);

  async function copyToClipboard(url: string, id: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  }

  function projectForStudents(url: string) {
    window.open(url, "_blank", "fullscreen=yes,toolbar=no,menubar=no");
  }

  // --- Publishing transition ---
  if (phase === "publishing") {
    return (
      <div className="space-y-6">
        <Card className="border-2 border-gold/30 py-12">
          <div className="flex flex-col items-center gap-6">
            {/* Animated spinner */}
            <div className="h-16 w-16 rounded-full border-4 border-gold/20 border-t-gold animate-spin" />

            {/* Step messages with checkmarks */}
            <div className="space-y-3 w-full max-w-xs">
              {PUBLISH_STEPS.map((step, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 transition-all duration-300 ${
                    i <= publishStepIndex
                      ? "opacity-100"
                      : "opacity-30"
                  }`}
                >
                  {i < publishStepIndex ? (
                    <svg
                      className="h-5 w-5 text-success shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : i === publishStepIndex ? (
                    <div className="h-5 w-5 shrink-0 flex items-center justify-center">
                      <div className="h-2.5 w-2.5 rounded-full bg-gold animate-pulse" />
                    </div>
                  ) : (
                    <div className="h-5 w-5 shrink-0 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-border" />
                    </div>
                  )}
                  <span
                    className={`text-sm font-body ${
                      i <= publishStepIndex
                        ? "text-text font-medium"
                        : "text-text-light"
                    }`}
                  >
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // --- Pre-publish summary ---
  if (!isPublished && phase === "ready") {
    return (
      <div className="space-y-6">
        <Card className="border-2 border-forest/20">
          <h2 className="text-lg font-heading font-semibold text-forest mb-4">
            Ready to Go Live
          </h2>
          <p className="text-text-light font-body text-sm mb-6">
            Publishing will generate share links for students to access your
            assessments. This cannot be undone.
          </p>

          {/* Summary of what goes live */}
          <div className="space-y-4">
            {initialTasks.length > 0 && (
              <div>
                <h3 className="text-sm font-heading font-semibold text-text mb-2">
                  Performance Task
                </h3>
                {initialTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-2 text-sm font-body text-text-light py-1"
                  >
                    <span className="h-2 w-2 rounded-full bg-gold shrink-0" />
                    {task.title}
                  </div>
                ))}
              </div>
            )}

            {initialChecks.length > 0 && (
              <div>
                <h3 className="text-sm font-heading font-semibold text-text mb-2">
                  Checks for Understanding ({initialChecks.length})
                </h3>
                {initialChecks.map((check) => (
                  <div
                    key={check.id}
                    className="flex items-center gap-2 text-sm font-body text-text-light py-1"
                  >
                    <span className="h-2 w-2 rounded-full bg-forest shrink-0" />
                    {check.title}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700 font-body">
            {error}
          </div>
        )}

        {/* Large centered Go Live button with pulse glow */}
        <div className="flex justify-center pt-2">
          <button
            onClick={handlePublish}
            className="
              relative px-12 py-4 rounded-xl
              bg-gold text-forest-dark font-heading font-bold text-xl
              shadow-lg hover:shadow-xl
              hover:bg-gold-light active:bg-gold
              transition-all duration-200
              animate-pulse-glow
              cursor-pointer
            "
          >
            {/* Decorative launch icon */}
            <span className="inline-flex items-center gap-3">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.58-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
                />
              </svg>
              Go Live
            </span>
          </button>
        </div>
      </div>
    );
  }

  // --- Post-publish: celebration + share links ---
  return (
    <div className="space-y-6 relative">
      {/* Confetti overlay */}
      {showConfetti && <ConfettiOverlay />}

      {/* Success banner with scale-in animation */}
      <Card className="border-2 border-gold bg-gold/5 text-center animate-scale-in">
        <div className="flex flex-col items-center gap-3">
          <div className="h-16 w-16 rounded-full bg-gold/20 flex items-center justify-center">
            <svg
              className="h-8 w-8 text-gold"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-heading font-bold text-forest">
            Your Unit is LIVE!
          </h2>
          <p className="text-sm text-text-light font-body">
            Share the links below with your students.
          </p>
        </div>
      </Card>

      {/* Performance task links */}
      {publishedTasks.length > 0 && (
        <div
          className="space-y-3 animate-fade-in-up"
          style={{ animationDelay: "100ms" }}
        >
          <h3 className="text-sm font-heading font-semibold text-text uppercase tracking-wide">
            Performance Task
          </h3>
          {publishedTasks.map((task, i) => (
            <div
              key={task.id}
              className="space-y-3 animate-fade-in-up"
              style={{ animationDelay: `${200 + i * 100}ms` }}
            >
              <ShareLinkCard
                item={task}
                type="task"
                copiedId={copiedId}
                onCopy={copyToClipboard}
                onProject={projectForStudents}
              />
              <div className="flex justify-center">
                <QRCodeDisplay url={task.url} size={180} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Check links */}
      {publishedChecks.length > 0 && (
        <div
          className="space-y-3 animate-fade-in-up"
          style={{
            animationDelay: `${200 + publishedTasks.length * 100}ms`,
          }}
        >
          <h3 className="text-sm font-heading font-semibold text-text uppercase tracking-wide">
            Checks for Understanding
          </h3>
          {publishedChecks.map((check, i) => (
            <div
              key={check.id}
              className="space-y-3 animate-fade-in-up"
              style={{
                animationDelay: `${300 + publishedTasks.length * 100 + i * 100}ms`,
              }}
            >
              <ShareLinkCard
                item={check}
                type="check"
                copiedId={copiedId}
                onCopy={copyToClipboard}
                onProject={projectForStudents}
              />
              <div className="flex justify-center">
                <QRCodeDisplay url={check.url} size={180} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Confetti component (CSS-only, no libraries) ---

function ConfettiOverlay() {
  const [particles] = useState(() =>
    Array.from({ length: 25 }, (_, i) => ({
      id: i,
      tx: `${(Math.random() - 0.5) * 400}px`,
      ty: `${-Math.random() * 300 - 50}px`,
      color: i % 2 === 0 ? "var(--color-forest)" : "var(--color-gold)",
      size: Math.random() * 8 + 4,
      delay: Math.random() * 0.3,
    }))
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 flex items-start justify-center">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full animate-confetti"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            top: "40%",
            left: "50%",
            "--tx": p.tx,
            "--ty": p.ty,
            animationDelay: `${p.delay}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

// --- Share link card with live badge + project button ---

function ShareLinkCard({
  item,
  type,
  copiedId,
  onCopy,
  onProject,
}: {
  item: PublishedItem;
  type: "check" | "task";
  copiedId: string | null;
  onCopy: (url: string, id: string) => void;
  onProject: (url: string) => void;
}) {
  const isCopied = copiedId === item.id;

  return (
    <Card className="flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-heading font-semibold
              ${type === "task" ? "bg-gold/20 text-gold" : "bg-forest/10 text-forest"}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-live" />
            Live
          </span>
        </div>
        <p className="text-sm font-heading font-semibold text-text truncate">
          {item.title}
        </p>
        <p className="text-xs text-text-light font-body font-mono truncate mt-0.5">
          {item.url}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {/* Project for Students button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onProject(item.url)}
          className="min-w-[90px] text-xs"
          title="Open in full screen for classroom projection"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M3 7l9 6 9-6M3 7h18"
            />
          </svg>
          Project
        </Button>

        {/* Copy link button */}
        <Button
          variant={isCopied ? "primary" : "secondary"}
          size="sm"
          onClick={() => onCopy(item.url, item.id)}
          className="shrink-0 min-w-[100px]"
        >
          {isCopied ? (
            <>
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              Copy Link
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}

export { PublishClient };
