"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import type { CognitiveLevel } from "@/types";

interface AnalysisResult {
  unitId: string;
  title: string;
  essentialQuestions: string[];
  standardCodes: string[];
  standardDescriptions: string[];
  cognitiveLevel: CognitiveLevel;
  cognitiveLevelExplanation: string;
  reflectionForTeacher: string;
}

const LOADING_MESSAGES = [
  "Analyzing your understanding against Bloom's taxonomy...",
  "Mapping to state standards...",
  "Generating essential questions...",
];

const COGNITIVE_LEVEL_LABELS: Record<CognitiveLevel, string> = {
  remember: "Remember",
  understand: "Understand",
  apply: "Apply",
  analyze: "Analyze",
  evaluate: "Evaluate",
  create: "Create",
};

const COGNITIVE_LEVEL_COLORS: Record<CognitiveLevel, string> = {
  remember: "bg-gray-100 text-gray-700",
  understand: "bg-blue-100 text-blue-700",
  apply: "bg-green-100 text-green-700",
  analyze: "bg-purple-100 text-purple-700",
  evaluate: "bg-orange-100 text-orange-700",
  create: "bg-red-100 text-red-700",
};

function EnduringUnderstandingInput() {
  const router = useRouter();
  const [understanding, setUnderstanding] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cycle through loading messages while waiting for AI
  useEffect(() => {
    if (loading) {
      setLoadingMessageIndex(0);
      intervalRef.current = setInterval(() => {
        setLoadingMessageIndex((prev) =>
          prev < LOADING_MESSAGES.length - 1 ? prev + 1 : prev
        );
      }, 2500);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [loading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!understanding.trim() || loading) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/unit/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enduringUnderstanding: understanding }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.redirect) {
          router.push(data.redirect);
          return;
        }
        throw new Error(data.error || "Failed to analyze understanding.");
      }

      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[720px] mx-auto">
      {/* Input Section */}
      <Card className="mb-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <h2 className="text-lg font-heading font-semibold text-forest mb-2">
              What do your students need to understand?
            </h2>
            <p className="text-sm text-text-light font-body">
              Type an enduring understanding — the big idea that transcends a
              single lesson.
            </p>
          </div>

          <Textarea
            value={understanding}
            onChange={(e) => setUnderstanding(e.target.value)}
            rows={4}
            placeholder="e.g., Students will understand that organisms in an ecosystem are interdependent, and changes to one population affect the entire system."
            disabled={loading || !!result}
            autoResize
          />

          {/* Error Message */}
          {error && (
            <div className="rounded-lg border border-error/30 bg-error/5 px-4 py-3">
              <p className="text-sm text-error font-body">{error}</p>
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setResult(null);
                }}
                className="mt-1 text-sm font-medium text-forest underline underline-offset-2"
              >
                Try again
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center gap-3 rounded-lg border border-forest/20 bg-forest/5 px-4 py-3">
              <svg
                className="h-5 w-5 animate-spin text-forest shrink-0"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <p className="text-sm font-body text-forest animate-pulse">
                {LOADING_MESSAGES[loadingMessageIndex]}
              </p>
            </div>
          )}

          {/* Submit Button */}
          {!result && !loading && (
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={!understanding.trim() || understanding.trim().length < 20}
            >
              Analyze
            </Button>
          )}
        </form>
      </Card>

      {/* AI Analysis Results */}
      {result && (
        <div className="space-y-4 animate-in fade-in duration-500">
          {/* Unit Title */}
          <Card>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-heading font-semibold text-text-light uppercase tracking-wide mb-1">
                  Unit Title
                </p>
                <h3 className="text-xl font-heading font-bold text-forest">
                  {result.title}
                </h3>
              </div>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold font-heading ${
                  COGNITIVE_LEVEL_COLORS[result.cognitiveLevel]
                }`}
              >
                {COGNITIVE_LEVEL_LABELS[result.cognitiveLevel]}
              </span>
            </div>
          </Card>

          {/* Standards */}
          <Card>
            <p className="text-xs font-heading font-semibold text-text-light uppercase tracking-wide mb-3">
              Aligned Standards
            </p>
            <ul className="space-y-3">
              {result.standardCodes.map((code, i) => (
                <li key={code} className="flex gap-3">
                  <span className="shrink-0 rounded bg-forest/10 px-2 py-0.5 text-xs font-mono font-semibold text-forest">
                    {code}
                  </span>
                  <span className="text-sm text-text font-body">
                    {result.standardDescriptions[i]}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Cognitive Level */}
          <Card>
            <p className="text-xs font-heading font-semibold text-text-light uppercase tracking-wide mb-2">
              Cognitive Level
            </p>
            <p className="text-sm text-text font-body">
              {result.cognitiveLevelExplanation}
            </p>
          </Card>

          {/* Essential Questions */}
          <Card>
            <p className="text-xs font-heading font-semibold text-text-light uppercase tracking-wide mb-3">
              Essential Questions
            </p>
            <ul className="space-y-2">
              {result.essentialQuestions.map((q, i) => (
                <li key={i} className="flex gap-2">
                  <span className="shrink-0 text-forest font-heading font-bold text-sm mt-0.5">
                    Q{i + 1}.
                  </span>
                  <span className="text-sm text-text font-body italic">
                    {q}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Teacher Reflection */}
          <Card className="border-l-4 border-l-gold">
            <p className="text-xs font-heading font-semibold text-text-light uppercase tracking-wide mb-2">
              Reflection
            </p>
            <p className="text-sm text-text font-body">
              {result.reflectionForTeacher}
            </p>
          </Card>

          {/* Continue Button */}
          <div className="pt-2">
            <Button
              variant="accent"
              size="lg"
              fullWidth
              onClick={() => router.push(`/unit/${result.unitId}`)}
            >
              Continue to Unit Overview
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export { EnduringUnderstandingInput };
