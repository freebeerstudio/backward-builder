"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

const PLAN_LOADING_MESSAGES = [
  "Sequencing activities from foundational knowledge to transfer...",
  "Aligning each activity to rubric criteria...",
  "Placing formative checks at natural diagnostic points...",
  "Building scaffolding toward your performance task...",
];

interface GeneratePlanButtonProps {
  unitId: string;
}

/**
 * Client-side button that triggers the learning plan generation API.
 * Shows loading state with rotating pedagogical messages while Claude
 * generates the sequenced activities.
 * On success, refreshes the page to show the new learning plan.
 */
function GeneratePlanButton({ unitId }: GeneratePlanButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msgIndex, setMsgIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (loading) {
      setMsgIndex(0);
      intervalRef.current = setInterval(() => {
        setMsgIndex((prev) =>
          prev < PLAN_LOADING_MESSAGES.length - 1 ? prev + 1 : prev
        );
      }, 3000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [loading]);

  async function handleGenerate() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/unit/${unitId}/generate-plan`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate learning plan");
      }

      // Refresh the page to show new activities
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate learning plan"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button
        variant="primary"
        size="lg"
        loading={loading}
        onClick={handleGenerate}
        disabled={loading}
      >
        {loading ? "Generating Learning Plan..." : "Generate Learning Plan"}
      </Button>

      {loading && (
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-forest/20 bg-forest/5 px-4 py-3">
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
          <p className="font-body text-sm text-forest animate-pulse">
            {PLAN_LOADING_MESSAGES[msgIndex]}
          </p>
        </div>
      )}

      {error && (
        <p className="mt-3 font-body text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

export { GeneratePlanButton };
