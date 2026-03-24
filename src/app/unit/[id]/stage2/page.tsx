import { db } from "@/db";
import {
  units,
  performanceTasks,
  checksForUnderstanding,
  checkQuestions,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { UbDProgressIndicator } from "@/components/unit/UbDProgressIndicator";
import { Stage2Client } from "./Stage2Client";
import { getAuthenticatedTeacher } from "@/lib/auth";
import type { RubricCriterion, MCOption, CognitiveLevel } from "@/types";

/**
 * Stage 2 — Evidence of Understanding
 *
 * Server component that fetches the unit, performance tasks, and checks
 * from the database and renders the Stage 2 evidence planning page.
 * Delegates all interactivity to Stage2Client.
 */
export default async function Stage2Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: unitId } = await params;

  // Load unit
  const [unit] = await db
    .select()
    .from(units)
    .where(eq(units.id, unitId))
    .limit(1);

  if (!unit) {
    notFound();
  }

  // Determine ownership — pages remain accessible for viewing,
  // but only the owner can generate/edit content
  const auth = await getAuthenticatedTeacher();
  const isAuthenticated = auth.authenticated;
  const isOwner = isAuthenticated && auth.teacherId === unit.teacherId;

  // Load performance tasks
  const tasks = await db
    .select()
    .from(performanceTasks)
    .where(eq(performanceTasks.unitId, unitId));

  // Load checks for understanding with their questions
  const checks = await db
    .select()
    .from(checksForUnderstanding)
    .where(eq(checksForUnderstanding.unitId, unitId));

  const checksWithQuestions = await Promise.all(
    checks.map(async (check) => {
      const questions = await db
        .select()
        .from(checkQuestions)
        .where(eq(checkQuestions.checkId, check.id));

      return {
        id: check.id,
        title: check.title,
        placementNote: check.placementNote,
        totalPoints: check.totalPoints ?? 0,
        questions: questions.map((q) => ({
          id: q.id,
          type: q.type as "selected_response" | "short_answer",
          questionText: q.questionText,
          points: q.points,
          options: q.options as MCOption[] | null,
          orderIndex: q.orderIndex,
        })),
      };
    })
  );

  // Serialize tasks for the client component
  const serializedTasks = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    scenario: t.scenario,
    rubric: t.rubric as RubricCriterion[],
    estimatedTimeMinutes: t.estimatedTimeMinutes,
    cognitiveLevel: t.cognitiveLevel as CognitiveLevel | null,
    standardCodes: t.standardCodes as string[] | null,
    isSelected: t.isSelected ?? false,
  }));

  const hasSelectedTask = serializedTasks.some((t) => t.isSelected);

  return (
    <div className="min-h-screen bg-warmwhite pb-16">
      <PageContainer className="pt-8">
        {/* Progress indicator */}
        <UbDProgressIndicator currentStage={2} completedStages={[1]} />

        {/* Page header */}
        <div className="mt-8 mb-8">
          <div className="flex items-center gap-2 text-sm text-text-light mb-1">
            <span>Stage 2</span>
            <span>&middot;</span>
            <span>{unit.title}</span>
          </div>
          <h1 className="font-heading text-2xl font-bold text-forest-dark sm:text-3xl">
            Evidence of Understanding
          </h1>
          <p className="mt-2 text-base text-text-light leading-relaxed max-w-2xl">
            Review AI-generated performance tasks and checks for understanding.
            Select one performance task to anchor your unit, then generate
            formative checks aligned to its rubric.
          </p>
        </div>

        {/* Client-side interactive sections */}
        <Stage2Client
          unitId={unitId}
          tasks={serializedTasks}
          checks={checksWithQuestions}
          hasSelectedTask={hasSelectedTask}
          isOwner={isOwner}
          isAuthenticated={isAuthenticated}
        />

        {/* Navigation */}
        <div className="mt-10 flex items-center justify-between">
          <a
            href={`/unit/${unitId}`}
            className="text-sm font-medium text-forest hover:text-forest-light transition-colors"
          >
            &larr; Back to Unit Overview
          </a>
          {hasSelectedTask && checksWithQuestions.length > 0 && (
            <a
              href={`/unit/${unitId}/stage3`}
              className="inline-flex items-center gap-2 rounded-lg bg-forest px-6 py-2.5 font-heading text-sm font-semibold text-white shadow-sm transition-all hover:bg-forest-light hover:shadow-md"
            >
              Continue to Stage 3
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </a>
          )}
        </div>
      </PageContainer>
    </div>
  );
}
