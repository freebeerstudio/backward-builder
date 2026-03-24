"use client";

import { useState } from "react";
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

function PublishClient({
  unitId,
  isPublished: initialPublished,
  tasks: initialTasks,
  checks: initialChecks,
}: PublishClientProps) {
  const [isPublished, setIsPublished] = useState(initialPublished);
  const [publishing, setPublishing] = useState(false);
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

  async function handlePublish() {
    setPublishing(true);
    setError(null);

    try {
      const res = await fetch(`/api/unit/${unitId}/publish`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to publish");
      }

      const data = await res.json();
      setPublishedChecks(data.checks);
      setPublishedTasks(data.tasks);
      setIsPublished(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPublishing(false);
    }
  }

  async function copyToClipboard(url: string, id: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback for older browsers
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

  // --- Pre-publish summary ---
  if (!isPublished) {
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

        <Button
          variant="accent"
          size="lg"
          fullWidth
          loading={publishing}
          onClick={handlePublish}
          className="text-lg font-bold shadow-lg"
        >
          {publishing ? "Publishing..." : "Go Live"}
        </Button>
      </div>
    );
  }

  // --- Post-publish: share links ---
  return (
    <div className="space-y-6">
      {/* Success banner */}
      <Card className="border-2 border-gold bg-gold/5 text-center">
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
          <h2 className="text-xl font-heading font-bold text-forest">
            Your Unit is Live!
          </h2>
          <p className="text-sm text-text-light font-body">
            Share the links below with your students.
          </p>
        </div>
      </Card>

      {/* Performance task links */}
      {publishedTasks.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-heading font-semibold text-text uppercase tracking-wide">
            Performance Task
          </h3>
          {publishedTasks.map((task) => (
            <div key={task.id} className="space-y-3">
              <ShareLinkCard
                item={task}
                type="task"
                copiedId={copiedId}
                onCopy={copyToClipboard}
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
        <div className="space-y-3">
          <h3 className="text-sm font-heading font-semibold text-text uppercase tracking-wide">
            Checks for Understanding
          </h3>
          {publishedChecks.map((check) => (
            <div key={check.id} className="space-y-3">
              <ShareLinkCard
                item={check}
                type="check"
                copiedId={copiedId}
                onCopy={copyToClipboard}
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

function ShareLinkCard({
  item,
  type,
  copiedId,
  onCopy,
}: {
  item: PublishedItem;
  type: "check" | "task";
  copiedId: string | null;
  onCopy: (url: string, id: string) => void;
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
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
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
      <Button
        variant={isCopied ? "primary" : "secondary"}
        size="sm"
        onClick={() => onCopy(item.url, item.id)}
        className="shrink-0 min-w-[100px]"
      >
        {isCopied ? (
          <>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Copied!
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy Link
          </>
        )}
      </Button>
    </Card>
  );
}

export { PublishClient };
