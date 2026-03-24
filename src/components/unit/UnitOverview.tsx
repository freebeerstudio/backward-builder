"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { CognitiveLevel } from "@/types";

interface UnitData {
  id: string;
  title: string;
  enduringUnderstanding: string;
  essentialQuestions: string[] | null;
  standardCodes: string[] | null;
  standardDescriptions: string[] | null;
  cognitiveLevel: CognitiveLevel | null;
  cognitiveLevelExplanation: string | null;
  status: string;
}

interface UnitOverviewProps {
  unit: UnitData;
  hasTasks: boolean;
  hasChecks: boolean;
  hasActivities: boolean;
}

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

function UnitOverview({ unit, hasTasks, hasChecks, hasActivities }: UnitOverviewProps) {
  const router = useRouter();

  const completedStages: number[] = [1]; // Stage 1 always done if we're here
  if (hasTasks && hasChecks) completedStages.push(2);
  if (hasActivities) completedStages.push(3);

  return (
    <div className="space-y-6">
      {/* Unit Header */}
      <div>
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-forest">
            {unit.title}
          </h1>
          {unit.cognitiveLevel && (
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold font-heading ${
                COGNITIVE_LEVEL_COLORS[unit.cognitiveLevel]
              }`}
            >
              {COGNITIVE_LEVEL_LABELS[unit.cognitiveLevel]}
            </span>
          )}
        </div>
        <p className="text-text-light font-body text-sm md:text-base">
          {unit.enduringUnderstanding}
        </p>
      </div>

      {/* Stage 1: Desired Results (always complete) */}
      <Card hover>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-forest text-white">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-lg font-heading font-semibold text-forest">
            Stage 1: Desired Results
          </h2>
        </div>

        {/* Standards */}
        {unit.standardCodes && unit.standardCodes.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-heading font-semibold text-text-light uppercase tracking-wide mb-2">
              Aligned Standards
            </p>
            <div className="flex flex-wrap gap-2">
              {unit.standardCodes.map((code, i) => (
                <span
                  key={code}
                  className="rounded bg-forest/10 px-2 py-1 text-xs font-mono font-semibold text-forest"
                  title={unit.standardDescriptions?.[i] || ""}
                >
                  {code}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Cognitive Level */}
        {unit.cognitiveLevelExplanation && (
          <div className="mb-4">
            <p className="text-xs font-heading font-semibold text-text-light uppercase tracking-wide mb-1">
              Cognitive Level
            </p>
            <p className="text-sm text-text font-body">
              {unit.cognitiveLevelExplanation}
            </p>
          </div>
        )}

        {/* Essential Questions */}
        {unit.essentialQuestions && unit.essentialQuestions.length > 0 && (
          <div>
            <p className="text-xs font-heading font-semibold text-text-light uppercase tracking-wide mb-2">
              Essential Questions
            </p>
            <ul className="space-y-1.5">
              {unit.essentialQuestions.map((q, i) => (
                <li key={i} className="flex gap-2 text-sm text-text font-body">
                  <span className="shrink-0 font-heading font-bold text-forest">
                    Q{i + 1}.
                  </span>
                  <span className="italic">{q}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {/* Stage 2: Evidence */}
      <Card hover>
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-heading font-semibold ${
              hasTasks && hasChecks
                ? "bg-forest text-white"
                : "border-2 border-border bg-white text-text-light"
            }`}
          >
            {hasTasks && hasChecks ? (
              <svg
                className="h-4 w-4"
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
            ) : (
              "2"
            )}
          </div>
          <h2 className="text-lg font-heading font-semibold text-forest">
            Stage 2: Evidence
          </h2>
        </div>

        {hasTasks || hasChecks ? (
          <div className="space-y-2">
            {hasTasks && (
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm font-body text-text">Performance tasks generated</span>
              </div>
            )}
            {hasChecks && (
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm font-body text-text">Checks for understanding generated</span>
              </div>
            )}
            <div className="pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/unit/${unit.id}/stage2`)}
              >
                View & Edit Stage 2
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm text-text-light font-body mb-4">
              Generate performance tasks and formative checks that measure whether
              students have achieved the desired results.
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={() => router.push(`/unit/${unit.id}/stage2`)}
            >
              Generate Evidence
            </Button>
          </div>
        )}
      </Card>

      {/* Stage 3: Learning Plan */}
      <Card hover>
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-heading font-semibold ${
              hasActivities
                ? "bg-forest text-white"
                : "border-2 border-border bg-white text-text-light"
            }`}
          >
            {hasActivities ? (
              <svg
                className="h-4 w-4"
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
            ) : (
              "3"
            )}
          </div>
          <h2 className="text-lg font-heading font-semibold text-forest">
            Stage 3: Learning Plan
          </h2>
        </div>

        {hasActivities ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm font-body text-text">Learning activities generated</span>
            </div>
            <div className="pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/unit/${unit.id}/stage3`)}
              >
                View & Edit Stage 3
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm text-text-light font-body mb-4">
              Design scaffolded learning activities that build student capacity toward
              the performance task — planned last because every activity serves the
              assessments.
            </p>
            <Button
              variant="primary"
              size="md"
              disabled={!hasTasks || !hasChecks}
              onClick={() => router.push(`/unit/${unit.id}/stage3`)}
            >
              Generate Learning Plan
            </Button>
            {(!hasTasks || !hasChecks) && (
              <p className="text-xs text-text-light font-body mt-2">
                Complete Stage 2 first — in backward design, activities are planned after assessments.
              </p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

export { UnitOverview };
