"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { RubricDisplay } from "@/components/unit/RubricDisplay";
import type { RubricCriterion, CognitiveLevel } from "@/types";

interface PerformanceTaskData {
  id: string;
  title: string;
  description: string;
  scenario: string;
  rubric: RubricCriterion[];
  estimatedTimeMinutes: number | null;
  cognitiveLevel: CognitiveLevel | null;
  standardCodes?: string[] | null;
}

interface PerformanceTaskCardProps {
  task: PerformanceTaskData;
  isSelected: boolean;
  onSelect: (taskId: string) => void;
  loading?: boolean;
}

/**
 * PerformanceTaskCard — Displays a GRASPS performance task with an
 * expandable rubric view. This card is a key visual differentiator —
 * teachers see two compelling task options and choose one.
 */
function PerformanceTaskCard({
  task,
  isSelected,
  onSelect,
  loading = false,
}: PerformanceTaskCardProps) {
  const [expanded, setExpanded] = useState(false);

  const scenarioPreview =
    task.scenario.length > 120
      ? task.scenario.slice(0, 120) + "..."
      : task.scenario;

  return (
    <Card
      className={`
        transition-all duration-200
        ${isSelected ? "border-2 border-forest ring-1 ring-forest/20" : "border border-border"}
      `}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-heading text-lg font-semibold text-forest-dark">
              {task.title}
            </h3>
            {isSelected && (
              <span className="inline-flex items-center gap-1 rounded-full bg-forest px-2.5 py-0.5 text-xs font-medium text-white">
                <svg
                  className="h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Selected
              </span>
            )}
          </div>

          {/* Badges row */}
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            {task.cognitiveLevel && (
              <Badge variant={task.cognitiveLevel} />
            )}
            {task.estimatedTimeMinutes && (
              <Badge
                variant="info"
                label={`~${task.estimatedTimeMinutes} min`}
              />
            )}
            <Badge
              variant="points"
              label={`${task.rubric.length} criteria`}
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="mt-3 text-sm text-text leading-relaxed">
        {task.description}
      </p>

      {/* Scenario preview */}
      <div className="mt-3 rounded-lg bg-warmwhite px-4 py-3 border border-border/50">
        <div className="text-xs font-semibold uppercase tracking-wide text-text-light mb-1">
          GRASPS Scenario
        </div>
        <p className="text-sm text-text leading-relaxed">
          {expanded ? task.scenario : scenarioPreview}
        </p>
      </div>

      {/* Expandable rubric section */}
      {expanded && (
        <div className="mt-4">
          {/* Full scenario is shown above when expanded */}

          {/* Standard codes */}
          {task.standardCodes && task.standardCodes.length > 0 && (
            <div className="mb-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-text-light mb-1.5">
                Standards Addressed
              </div>
              <div className="flex flex-wrap gap-1.5">
                {task.standardCodes.map((code) => (
                  <span
                    key={code}
                    className="inline-block rounded bg-forest/10 px-2 py-0.5 text-xs font-mono text-forest"
                  >
                    {code}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Rubric */}
          <div className="text-xs font-semibold uppercase tracking-wide text-text-light mb-2">
            Scoring Rubric
          </div>
          <RubricDisplay rubric={task.rubric} />
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-4 flex items-center gap-3 flex-wrap">
        {!isSelected ? (
          <Button
            variant="accent"
            size="sm"
            onClick={() => onSelect(task.id)}
            loading={loading}
            disabled={loading}
          >
            Select This Task
          </Button>
        ) : (
          <Button variant="primary" size="sm" disabled>
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
            Selected
          </Button>
        )}

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm font-medium text-forest hover:text-forest-light transition-colors"
        >
          {expanded ? "Hide Details" : "View Rubric & Details"}
          <svg
            className={`ml-1 inline h-4 w-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>
    </Card>
  );
}

export { PerformanceTaskCard, type PerformanceTaskCardProps, type PerformanceTaskData };
