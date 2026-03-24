import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  units,
  performanceTasks,
  checksForUnderstanding,
  checkQuestions,
  teachers,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { generateChecksForUnderstanding } from "@/lib/claude";
import type { CognitiveLevel, RubricCriterion, GeneratedPerformanceTask } from "@/types";

/**
 * POST /api/unit/[id]/generate-checks
 *
 * Generates two formative checks for understanding based on the selected
 * performance task. Each check contains a mix of selected-response and
 * short-answer questions mapped to the task's rubric criteria.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: unitId } = await params;

    // Load unit
    const [unit] = await db
      .select()
      .from(units)
      .where(eq(units.id, unitId))
      .limit(1);

    if (!unit) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    }

    // Load teacher for classroom context
    const [teacher] = await db
      .select()
      .from(teachers)
      .where(eq(teachers.id, unit.teacherId))
      .limit(1);

    if (!teacher) {
      return NextResponse.json(
        { error: "Teacher not found" },
        { status: 404 }
      );
    }

    // Load the selected performance task
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

    if (!selectedTask) {
      return NextResponse.json(
        { error: "Please select a performance task first." },
        { status: 400 }
      );
    }

    // Build context objects for Claude
    const unitContext = {
      title: unit.title,
      enduringUnderstanding: unit.enduringUnderstanding,
      essentialQuestions: (unit.essentialQuestions as string[]) ?? [],
      standardCodes: (unit.standardCodes as string[]) ?? [],
      standardDescriptions: (unit.standardDescriptions as string[]) ?? [],
      cognitiveLevel: (unit.cognitiveLevel as CognitiveLevel) ?? "understand",
      gradeLevel: teacher.gradeLevel ?? "Middle School",
      subject: teacher.subject ?? "General",
    };

    const taskForClaude: GeneratedPerformanceTask = {
      title: selectedTask.title,
      description: selectedTask.description,
      scenario: selectedTask.scenario,
      rubric: selectedTask.rubric as RubricCriterion[],
      estimatedTimeMinutes: selectedTask.estimatedTimeMinutes ?? 60,
      cognitiveLevel: selectedTask.cognitiveLevel ?? "understand",
    };

    // Generate checks via Claude
    const result = await generateChecksForUnderstanding(unitContext, taskForClaude);

    // Insert checks and their questions into DB
    const insertedChecks = [];

    for (const check of result.checks) {
      // Calculate total points for this check
      const totalPoints = check.questions.reduce((sum, q) => sum + q.points, 0);

      // Insert the check
      const [insertedCheck] = await db
        .insert(checksForUnderstanding)
        .values({
          unitId,
          title: check.title,
          placementNote: check.placementNote,
          totalPoints,
        })
        .returning();

      // Insert each question
      const insertedQuestions = [];
      for (let i = 0; i < check.questions.length; i++) {
        const q = check.questions[i];
        const [insertedQuestion] = await db
          .insert(checkQuestions)
          .values({
            checkId: insertedCheck.id,
            type: q.type,
            orderIndex: i,
            questionText: q.questionText,
            points: q.points,
            options: q.options ?? null,
            correctAnswer: q.correctAnswer,
          })
          .returning();

        insertedQuestions.push({
          id: insertedQuestion.id,
          type: insertedQuestion.type,
          questionText: insertedQuestion.questionText,
          points: insertedQuestion.points,
        });
      }

      insertedChecks.push({
        id: insertedCheck.id,
        title: insertedCheck.title,
        placementNote: insertedCheck.placementNote,
        totalPoints,
        questions: insertedQuestions,
      });
    }

    return NextResponse.json({ checks: insertedChecks });
  } catch (error) {
    console.error("Failed to generate checks for understanding:", error);
    return NextResponse.json(
      {
        error:
          "Failed to generate checks for understanding. Please try again.",
      },
      { status: 500 }
    );
  }
}
