"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import {
  PerformanceTaskCard,
  type PerformanceTaskData,
} from "@/components/unit/PerformanceTaskCard";
import {
  CheckForUnderstandingCard,
  type CheckData,
} from "@/components/unit/CheckForUnderstandingCard";
import type { CognitiveLevel, RubricCriterion } from "@/types";

const TASK_LOADING_MESSAGES = [
  "Analyzing your enduring understanding for transfer-level assessment...",
  "Designing authentic GRASPS scenarios...",
  "Building multi-criterion rubrics aligned to your standards...",
  "Calibrating cognitive rigor to your Bloom's level...",
];

const CHECK_LOADING_MESSAGES = [
  "Mapping formative questions to rubric criteria...",
  "Creating diagnostic checks to measure student readiness...",
  "Calibrating question difficulty for your grade level...",
  "Aligning checks to performance task success criteria...",
];

interface TaskWithSelection extends PerformanceTaskData {
  isSelected: boolean;
}

interface Stage2ClientProps {
  unitId: string;
  tasks: TaskWithSelection[];
  checks: CheckData[];
  hasSelectedTask: boolean;
}

/**
 * Stage2Client — Client component that handles all interactive state for
 * Stage 2: generating tasks, selecting a task, and generating checks.
 * Server component passes in initial data; this handles mutations + optimistic UI.
 */
function Stage2Client({
  unitId,
  tasks: initialTasks,
  checks: initialChecks,
  hasSelectedTask: initialHasSelected,
}: Stage2ClientProps) {
  const router = useRouter();

  const [tasks, setTasks] = useState(initialTasks);
  const [checks, setChecks] = useState(initialChecks);
  const [hasSelectedTask, setHasSelectedTask] = useState(initialHasSelected);

  const [generatingTasks, setGeneratingTasks] = useState(false);
  const [generatingChecks, setGeneratingChecks] = useState(false);
  const [selectingTask, setSelectingTask] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Loading message rotation
  const [taskMsgIndex, setTaskMsgIndex] = useState(0);
  const [checkMsgIndex, setCheckMsgIndex] = useState(0);
  const taskIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (generatingTasks) {
      setTaskMsgIndex(0);
      taskIntervalRef.current = setInterval(() => {
        setTaskMsgIndex((prev) =>
          prev < TASK_LOADING_MESSAGES.length - 1 ? prev + 1 : prev
        );
      }, 2500);
    } else {
      if (taskIntervalRef.current) {
        clearInterval(taskIntervalRef.current);
        taskIntervalRef.current = null;
      }
    }
    return () => {
      if (taskIntervalRef.current) clearInterval(taskIntervalRef.current);
    };
  }, [generatingTasks]);

  useEffect(() => {
    if (generatingChecks) {
      setCheckMsgIndex(0);
      checkIntervalRef.current = setInterval(() => {
        setCheckMsgIndex((prev) =>
          prev < CHECK_LOADING_MESSAGES.length - 1 ? prev + 1 : prev
        );
      }, 2500);
    } else {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    }
    return () => {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    };
  }, [generatingChecks]);

  // -----------------------------------------------------------------------
  // Generate Performance Tasks
  // -----------------------------------------------------------------------
  async function handleGenerateTasks() {
    setGeneratingTasks(true);
    setError(null);

    try {
      const res = await fetch(`/api/unit/${unitId}/generate-tasks`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate tasks");
      }

      const data = await res.json();
      setTasks(
        data.tasks.map(
          (t: {
            id: string;
            title: string;
            description: string;
            scenario: string;
            rubric: RubricCriterion[];
            estimatedTimeMinutes: number | null;
            cognitiveLevel: CognitiveLevel | null;
          }) => ({
            ...t,
            isSelected: false,
            standardCodes: null,
          })
        )
      );

      // Refresh server component data
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong generating tasks."
      );
    } finally {
      setGeneratingTasks(false);
    }
  }

  // -----------------------------------------------------------------------
  // Select a Performance Task
  // -----------------------------------------------------------------------
  async function handleSelectTask(taskId: string) {
    setSelectingTask(taskId);
    setError(null);

    try {
      const res = await fetch(`/api/unit/${unitId}/select-task`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to select task");
      }

      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => ({ ...t, isSelected: t.id === taskId }))
      );
      setHasSelectedTask(true);

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSelectingTask(null);
    }
  }

  // -----------------------------------------------------------------------
  // Generate Checks for Understanding
  // -----------------------------------------------------------------------
  async function handleGenerateChecks() {
    if (!hasSelectedTask) {
      setError("Please select a performance task before generating checks.");
      return;
    }

    setGeneratingChecks(true);
    setError(null);

    try {
      const res = await fetch(`/api/unit/${unitId}/generate-checks`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate checks");
      }

      const data = await res.json();
      setChecks(data.checks);

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong generating checks."
      );
    } finally {
      setGeneratingChecks(false);
    }
  }

  return (
    <div className="space-y-10">
      {/* Error banner */}
      {error && (
        <div className="rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      {/* ================================================================= */}
      {/*  SECTION 1: Performance Tasks                                     */}
      {/* ================================================================= */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-heading text-xl font-bold text-forest-dark">
              Performance Tasks
            </h2>
            <p className="mt-1 text-sm text-text-light">
              Choose one authentic task that requires students to transfer their
              understanding to a real-world scenario.
            </p>
          </div>
        </div>

        {/* No tasks yet — show generate button */}
        {tasks.length === 0 && !generatingTasks && (
          <div className="rounded-xl border-2 border-dashed border-border bg-card p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gold/20">
              <svg
                className="h-7 w-7 text-gold"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
                />
              </svg>
            </div>
            <h3 className="font-heading text-lg font-semibold text-forest-dark">
              Ready to Design Assessments
            </h3>
            <p className="mt-2 text-sm text-text-light max-w-md mx-auto">
              AI will generate two performance task options based on your
              enduring understanding and standards. Each includes a full GRASPS
              scenario and rubric.
            </p>
            <Button
              variant="accent"
              size="lg"
              onClick={handleGenerateTasks}
              className="mt-5"
            >
              Generate Performance Tasks
            </Button>
          </div>
        )}

        {/* Loading state — task generation */}
        {generatingTasks && (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 font-body text-sm text-forest animate-pulse">
              {TASK_LOADING_MESSAGES[taskMsgIndex]}
            </p>
            <p className="mt-3 text-xs text-text-light">
              This may take 15-30 seconds
            </p>
          </div>
        )}

        {/* Tasks list */}
        {tasks.length > 0 && !generatingTasks && (
          <div className="space-y-4">
            {tasks.map((task) => (
              <PerformanceTaskCard
                key={task.id}
                task={task}
                isSelected={task.isSelected}
                onSelect={handleSelectTask}
                loading={selectingTask === task.id}
              />
            ))}
          </div>
        )}
      </section>

      {/* ================================================================= */}
      {/*  SECTION 2: Checks for Understanding                              */}
      {/* ================================================================= */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-heading text-xl font-bold text-forest-dark">
              Checks for Understanding
            </h2>
            <p className="mt-1 text-sm text-text-light">
              Formative checks aligned to the performance task rubric — use these
              during the unit to gauge student readiness.
            </p>
          </div>
        </div>

        {/* No checks yet — show generate button or waiting state */}
        {checks.length === 0 && !generatingChecks && (
          <div className="rounded-xl border-2 border-dashed border-border bg-card p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
              <svg
                className="h-7 w-7 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z"
                />
              </svg>
            </div>

            {!hasSelectedTask ? (
              <>
                <h3 className="font-heading text-lg font-semibold text-text-light">
                  Select a Performance Task First
                </h3>
                <p className="mt-2 text-sm text-text-light max-w-md mx-auto">
                  Checks for understanding are aligned to the performance task
                  rubric. Select a task above, then generate checks here.
                </p>
              </>
            ) : (
              <>
                <h3 className="font-heading text-lg font-semibold text-forest-dark">
                  Generate Formative Checks
                </h3>
                <p className="mt-2 text-sm text-text-light max-w-md mx-auto">
                  AI will create formative checks with questions mapped to the
                  selected task&apos;s rubric criteria — so you know exactly
                  where students stand before the performance task.
                </p>
                <Button
                  variant="accent"
                  size="lg"
                  onClick={handleGenerateChecks}
                  className="mt-5"
                >
                  Generate Checks for Understanding
                </Button>
              </>
            )}
          </div>
        )}

        {/* Loading state — check generation */}
        {generatingChecks && (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 font-body text-sm text-forest animate-pulse">
              {CHECK_LOADING_MESSAGES[checkMsgIndex]}
            </p>
            <p className="mt-3 text-xs text-text-light">
              This may take 10-20 seconds
            </p>
          </div>
        )}

        {/* Checks list */}
        {checks.length > 0 && !generatingChecks && (
          <div className="space-y-4">
            {checks.map((check) => (
              <CheckForUnderstandingCard key={check.id} check={check} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export { Stage2Client };
