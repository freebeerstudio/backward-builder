import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  units,
  teachers,
  performanceTasks,
  learningActivities,
  checksForUnderstanding,
  checkQuestions,
  studentSubmissions,
  studentAnswers,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { suggestPlanAdjustments } from "@/lib/claude";
import { validateUnitOwnership } from "@/lib/auth";
import type { RubricCriterion } from "@/types";

/**
 * POST /api/unit/[id]/adjust-plan
 *
 * Analyzes check results against the performance task rubric and current
 * learning activities, then uses AI to suggest targeted plan adjustments.
 * Returns a narrative summary and specific new/modified activities.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: unitId } = await params;

    // Ownership check: verify the current session owns this unit
    const ownership = await validateUnitOwnership(unitId);
    if (!ownership) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // 1. Load unit
    const [unit] = await db
      .select()
      .from(units)
      .where(eq(units.id, unitId))
      .limit(1);

    if (!unit) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    }

    // 2. Load teacher for classroom context
    const [teacher] = await db
      .select()
      .from(teachers)
      .where(eq(teachers.id, unit.teacherId))
      .limit(1);

    // 3. Load the selected performance task
    const [task] = await db
      .select()
      .from(performanceTasks)
      .where(
        and(
          eq(performanceTasks.unitId, unitId),
          eq(performanceTasks.isSelected, true)
        )
      )
      .limit(1);

    if (!task) {
      return NextResponse.json(
        { error: "No selected performance task found. Complete Stage 2 first." },
        { status: 400 }
      );
    }

    // 4. Load learning activities
    const activities = await db
      .select()
      .from(learningActivities)
      .where(eq(learningActivities.unitId, unitId));

    if (activities.length === 0) {
      return NextResponse.json(
        { error: "No learning activities found. Complete Stage 3 first." },
        { status: 400 }
      );
    }

    // 5. Load checks and build per-question analytics
    const checks = await db
      .select()
      .from(checksForUnderstanding)
      .where(eq(checksForUnderstanding.unitId, unitId));

    const submissions = await db
      .select()
      .from(studentSubmissions)
      .where(
        and(
          eq(studentSubmissions.unitId, unitId),
          eq(studentSubmissions.assessmentType, "check")
        )
      );

    if (submissions.length === 0) {
      return NextResponse.json(
        {
          error:
            "No student submissions yet. Share your checks for understanding with students first.",
        },
        { status: 400 }
      );
    }

    // Load all answers
    const submissionIds = submissions.map((s) => s.id);
    let allAnswers: Array<{
      questionId: string | null;
      isCorrect: boolean | null;
    }> = [];

    for (const subId of submissionIds) {
      const answers = await db
        .select({
          questionId: studentAnswers.questionId,
          isCorrect: studentAnswers.isCorrect,
        })
        .from(studentAnswers)
        .where(eq(studentAnswers.submissionId, subId));
      allAnswers = allAnswers.concat(answers);
    }

    // Build question-level analytics
    const checkResults: Array<{
      questionText: string;
      percentCorrect: number;
      type: string;
    }> = [];

    for (const check of checks) {
      const questions = await db
        .select()
        .from(checkQuestions)
        .where(eq(checkQuestions.checkId, check.id));

      for (const q of questions) {
        const questionAnswers = allAnswers.filter(
          (a) => a.questionId === q.id
        );
        const totalResponses = questionAnswers.length;
        const correctResponses = questionAnswers.filter(
          (a) => a.isCorrect === true
        ).length;
        const percentCorrect =
          totalResponses > 0
            ? Math.round((correctResponses / totalResponses) * 100)
            : 0;

        checkResults.push({
          questionText: q.questionText,
          percentCorrect,
          type: q.type,
        });
      }
    }

    // 6. Call AI to suggest adjustments
    const rubric = task.rubric as RubricCriterion[];

    const result = await suggestPlanAdjustments(
      {
        title: unit.title,
        enduringUnderstanding: unit.enduringUnderstanding,
        gradeLevel: teacher?.gradeLevel ?? "Middle School",
        subject: teacher?.subject ?? "General",
      },
      {
        title: task.title,
        rubric,
      },
      activities
        .sort((a, b) => a.sequenceOrder - b.sequenceOrder)
        .map((a) => ({
          title: a.title,
          description: a.description,
          buildsToward: a.buildsToward ?? "",
        })),
      checkResults
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to generate plan adjustments:", error);
    return NextResponse.json(
      { error: "Failed to generate plan adjustments. Please try again." },
      { status: 500 }
    );
  }
}
