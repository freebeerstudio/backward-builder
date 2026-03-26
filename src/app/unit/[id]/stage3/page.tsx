import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import {
  units,
  learningActivities,
  checksForUnderstanding,
  performanceTasks,
} from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { PageContainer } from "@/components/layout/PageContainer";
import { Header } from "@/components/layout/Header";
import { UbDProgressIndicator } from "@/components/unit/UbDProgressIndicator";
import { LearningActivityCard } from "@/components/unit/LearningActivityCard";
import { GeneratePlanButton } from "./GeneratePlanButton";
import { getAuthenticatedTeacher } from "@/lib/auth";

interface Stage3PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Stage 3 — Learning Plan
 *
 * The final stage of UbD backward design. Activities are planned LAST because
 * every activity's purpose is defined by the assessments that came before it.
 * This page shows the sequenced learning plan with embedded check placements.
 *
 * Server component: data is fetched at render time from the DB.
 */
export default async function Stage3Page({ params }: Stage3PageProps) {
  const { id: unitId } = await params;

  // Load unit
  const [unit] = await db
    .select()
    .from(units)
    .where(eq(units.id, unitId))
    .limit(1);

  if (!unit) {
    redirect("/");
  }

  // Determine ownership — pages remain accessible for viewing,
  // but only the owner can generate content
  const auth = await getAuthenticatedTeacher();
  const isOwner = auth.authenticated && auth.teacherId === unit.teacherId;

  // Load activities in sequence order
  const activities = await db
    .select()
    .from(learningActivities)
    .where(eq(learningActivities.unitId, unitId))
    .orderBy(asc(learningActivities.sequenceOrder));

  // Load checks for understanding (for linking)
  const checks = await db
    .select()
    .from(checksForUnderstanding)
    .where(eq(checksForUnderstanding.unitId, unitId));

  // Check if Stage 2 is complete (has selected task + checks)
  const [selectedTask] = await db
    .select()
    .from(performanceTasks)
    .where(
      and(
        eq(performanceTasks.unitId, unitId),
        eq(performanceTasks.isSelected, true)
      )
    )
    .limit(1);

  const stage2Complete = !!selectedTask && checks.length > 0;

  // Build check title lookup
  const checkTitleMap = new Map<string, string>();
  for (const check of checks) {
    checkTitleMap.set(check.id, check.title);
  }

  // Determine completed stages
  const completedStages: number[] = [1];
  if (
    unit.status === "stage2" ||
    unit.status === "stage3" ||
    unit.status === "ready" ||
    unit.status === "live" ||
    unit.status === "complete"
  ) {
    completedStages.push(2);
  }
  if (unit.status === "stage3" || unit.status === "ready" || unit.status === "live" || unit.status === "complete") {
    completedStages.push(3);
  }
  if (unit.status === "live" || unit.status === "complete") {
    completedStages.push(4);
  }

  const hasActivities = activities.length > 0;

  return (
    <div className="min-h-screen bg-warmwhite">
      <Header />
      <PageContainer wide className="py-8 pb-16">
        {/* Progress indicator */}
        <div className="mb-8">
          <UbDProgressIndicator
            currentStage={3}
            completedStages={completedStages}
          />
        </div>

        {/* Page header */}
        <div className="mb-8">
          <h1 className="font-heading text-2xl font-bold text-forest-dark sm:text-3xl">
            Stage 3: Learning Plan
          </h1>
          <p className="mt-1 font-body text-text-light">
            {unit.title} — Sequenced activities that scaffold toward the
            performance task
          </p>
        </div>

        {/* UbD Principle callout */}
        <div className="mb-8 rounded-xl border border-forest/20 bg-forest/5 px-5 py-4">
          <p className="font-body text-sm leading-relaxed text-forest">
            <span className="font-heading font-semibold">
              Why is the learning plan last?
            </span>{" "}
            In Understanding by Design, activities are planned after assessments
            because every lesson must serve a clear purpose: building the
            knowledge and skills students need for the performance task. No filler.
            No &quot;just in case.&quot; Every activity earns its place.
          </p>
        </div>

        {/* Generate button (when no activities yet) */}
        {!hasActivities && (
          <div className="mb-10 rounded-xl border border-border bg-card p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-forest/10">
              <svg
                className="h-8 w-8 text-forest"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
                />
              </svg>
            </div>

            {stage2Complete && isOwner ? (
              <>
                <h3 className="font-heading text-lg font-semibold text-forest-dark">
                  Ready to Generate Your Learning Plan
                </h3>
                <p className="mx-auto mt-2 max-w-md font-body text-sm text-text-light">
                  Your performance task and checks for understanding are set. Now
                  let AI design a scaffolded sequence of learning activities that
                  builds students toward the capstone assessment.
                </p>
                <div className="mt-6">
                  <GeneratePlanButton unitId={unitId} />
                </div>
              </>
            ) : stage2Complete && !isOwner ? (
              <>
                <h3 className="font-heading text-lg font-semibold text-text-light">
                  No Learning Plan Yet
                </h3>
                <p className="mx-auto mt-2 max-w-md font-body text-sm text-text-light">
                  The unit owner has not generated a learning plan yet.
                </p>
              </>
            ) : (
              <>
                <h3 className="font-heading text-lg font-semibold text-text-light">
                  Complete Stage 2 First
                </h3>
                <p className="mx-auto mt-2 max-w-md font-body text-sm text-text-light">
                  {isOwner
                    ? "You need a selected performance task and checks for understanding before generating a learning plan. That is the backward design principle \u2014 assessments before activities."
                    : "Stage 2 has not been completed yet. A selected performance task and checks for understanding are needed before a learning plan can be generated."}
                </p>
                {isOwner && (
                  <Link
                    href={`/unit/${unitId}`}
                    className="mt-4 inline-block rounded-lg bg-forest px-6 py-2.5 font-heading text-sm font-semibold text-white transition-colors hover:bg-forest-light"
                  >
                    Back to Unit Overview
                  </Link>
                )}
              </>
            )}
          </div>
        )}

        {/* Activity sequence */}
        {hasActivities && (
          <div className="relative">
            {/* Vertical timeline connector */}
            <div className="absolute left-[2.6rem] top-4 bottom-4 w-0.5 bg-border sm:left-[2.85rem]" />

            <div className="space-y-4">
              {activities.map((activity, index) => {
                const checkTitle = activity.associatedCheckId
                  ? checkTitleMap.get(activity.associatedCheckId)
                  : undefined;

                // Check if the NEXT activity has a different associated check,
                // meaning a check should appear between these activities
                const nextActivity = activities[index + 1];
                const showCheckDivider =
                  activity.associatedCheckId &&
                  nextActivity &&
                  nextActivity.associatedCheckId !== activity.associatedCheckId;

                return (
                  <div key={activity.id}>
                    <LearningActivityCard
                      activity={activity}
                      checkTitle={checkTitle}
                    />

                    {/* Check placement divider */}
                    {showCheckDivider && checkTitle && (
                      <div className="relative my-4 flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-dashed border-blue-300" />
                        </div>
                        <div className="relative flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-medium text-blue-700 ring-1 ring-blue-200">
                          <svg
                            className="h-3.5 w-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Check: {checkTitle}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom navigation */}
        <div className="mt-10 flex flex-col items-center gap-4 border-t border-border pt-8 sm:flex-row sm:justify-between">
          <Link
            href={`/unit/${unitId}`}
            className="font-heading text-sm font-medium text-forest hover:underline"
          >
            &larr; Back to Unit Overview
          </Link>

          {hasActivities && (
            <Link
              href={`/unit/${unitId}`}
              className="rounded-lg bg-forest px-6 py-2.5 font-heading text-sm font-semibold text-white shadow-sm transition-all hover:bg-forest-light hover:shadow-md"
            >
              Complete Plan &rarr;
            </Link>
          )}
        </div>
      </PageContainer>
    </div>
  );
}
