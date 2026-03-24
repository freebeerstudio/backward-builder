"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface GeneratePlanButtonProps {
  unitId: string;
}

/**
 * Client-side button that triggers the learning plan generation API.
 * Shows loading state while Claude generates the sequenced activities.
 * On success, refreshes the page to show the new learning plan.
 */
function GeneratePlanButton({ unitId }: GeneratePlanButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        <p className="mt-3 font-body text-sm text-text-light">
          Claude is designing a scaffolded learning sequence aligned to your
          performance task. This takes about 15-20 seconds.
        </p>
      )}

      {error && (
        <p className="mt-3 font-body text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

export { GeneratePlanButton };
