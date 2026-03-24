import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  units,
  performanceTasks,
  checksForUnderstanding,
  checkQuestions,
  learningActivities,
  teachers,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { generateLearningPlan } from "@/lib/claude";
import { validateUnitOwnership } from "@/lib/auth";
import type {
  CognitiveLevel,
  RubricCriterion,
  GeneratedPerformanceTask,
  GeneratedCheck,
  GeneratedCheckQuestion,
} from "@/types";

/**
 * POST /api/unit/[id]/generate-plan
 *
 * Generates a sequenced learning plan (Stage 3 of UbD). This is the final
 * piece of backward design — activities are planned LAST because they exist
 * to serve the assessments. Each activity builds toward a rubric criterion
 * and formative checks are placed at natural diagnostic points.
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
        { error: "Please select a performance task before generating a learning plan." },
        { status: 400 }
      );
    }

    // Load checks for understanding
    const checks = await db
      .select()
      .from(checksForUnderstanding)
      .where(eq(checksForUnderstanding.unitId, unitId));

    if (checks.length === 0) {
      return NextResponse.json(
        { error: "Please generate checks for understanding before creating a learning plan." },
        { status: 400 }
      );
    }

    // Build context for Claude
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

    // Build GeneratedCheck[] from DB checks (with questions)
    const checksForClaude: GeneratedCheck[] = [];
    for (const check of checks) {
      const questions = await db
        .select()
        .from(checkQuestions)
        .where(eq(checkQuestions.checkId, check.id));

      const mappedQuestions: GeneratedCheckQuestion[] = questions.map((q) => ({
        type: q.type,
        questionText: q.questionText,
        points: q.points,
        options: q.options as GeneratedCheckQuestion["options"],
        correctAnswer: q.correctAnswer ?? "",
      }));

      checksForClaude.push({
        title: check.title,
        placementNote: check.placementNote ?? "",
        questions: mappedQuestions,
      });
    }

    // Generate learning plan via Claude
    const result = await generateLearningPlan(
      unitContext,
      taskForClaude,
      checksForClaude
    );

    // Insert activities into DB and link to associated checks
    const insertedActivities = [];

    for (const activity of result.activities) {
      // Match associatedCheckTitle to a real check ID
      let associatedCheckId: string | null = null;
      if (activity.associatedCheckTitle) {
        const matchingCheck = checks.find(
          (c) =>
            c.title.toLowerCase() ===
            activity.associatedCheckTitle!.toLowerCase()
        );
        if (matchingCheck) {
          associatedCheckId = matchingCheck.id;
        }
      }

      const [inserted] = await db
        .insert(learningActivities)
        .values({
          unitId,
          sequenceOrder: activity.sequenceOrder,
          title: activity.title,
          description: activity.description,
          durationMinutes: activity.durationMinutes,
          materials: activity.materials || null,
          buildsToward: activity.buildsToward,
          associatedCheckId,
        })
        .returning();

      insertedActivities.push({
        id: inserted.id,
        sequenceOrder: inserted.sequenceOrder,
        title: inserted.title,
        description: inserted.description,
        durationMinutes: inserted.durationMinutes,
        materials: inserted.materials,
        buildsToward: inserted.buildsToward,
        associatedCheckId: inserted.associatedCheckId,
      });
    }

    // Advance unit status to stage3 if currently at stage2
    if (unit.status === "stage2") {
      await db
        .update(units)
        .set({ status: "stage3", updatedAt: new Date() })
        .where(eq(units.id, unitId));
    }

    return NextResponse.json({ activities: insertedActivities });
  } catch (error) {
    console.error("Failed to generate learning plan:", error);
    return NextResponse.json(
      {
        error: "Failed to generate learning plan. Please try again.",
      },
      { status: 500 }
    );
  }
}
