import { NextResponse } from "next/server";
import { db } from "@/db";
import { units, performanceTasks, teachers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generatePerformanceTasks } from "@/lib/claude";
import { validateUnitOwnership } from "@/lib/auth";
import type { CognitiveLevel } from "@/types";

/**
 * POST /api/unit/[id]/generate-tasks
 *
 * Generates two GRASPS performance tasks for a unit using Claude AI.
 * This is Stage 2A of the UbD backward design pipeline — the capstone
 * assessment is designed before any learning activities.
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

    // Load unit from DB
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

    // Build context for Claude
    const context = {
      title: unit.title,
      enduringUnderstanding: unit.enduringUnderstanding,
      essentialQuestions: (unit.essentialQuestions as string[]) ?? [],
      standardCodes: (unit.standardCodes as string[]) ?? [],
      standardDescriptions: (unit.standardDescriptions as string[]) ?? [],
      cognitiveLevel: (unit.cognitiveLevel as CognitiveLevel) ?? "understand",
      gradeLevel: teacher.gradeLevel ?? "Middle School",
      subject: teacher.subject ?? "General",
    };

    // Generate performance tasks via Claude
    const result = await generatePerformanceTasks(context);

    // Insert generated tasks into DB
    const insertedTasks = [];
    for (const task of result.tasks) {
      const [inserted] = await db
        .insert(performanceTasks)
        .values({
          unitId,
          title: task.title,
          description: task.description,
          scenario: task.scenario,
          rubric: task.rubric,
          standardCodes: context.standardCodes,
          cognitiveLevel: task.cognitiveLevel as CognitiveLevel,
          estimatedTimeMinutes: task.estimatedTimeMinutes,
          isSelected: false,
        })
        .returning();

      insertedTasks.push({
        id: inserted.id,
        title: inserted.title,
        description: inserted.description,
        scenario: inserted.scenario,
        rubric: inserted.rubric,
        estimatedTimeMinutes: inserted.estimatedTimeMinutes,
        cognitiveLevel: inserted.cognitiveLevel,
      });
    }

    // Advance unit status to stage2 if currently at stage1
    if (unit.status === "stage1") {
      await db
        .update(units)
        .set({ status: "stage2", updatedAt: new Date() })
        .where(eq(units.id, unitId));
    }

    return NextResponse.json({ tasks: insertedTasks });
  } catch (error) {
    console.error("Failed to generate performance tasks:", error);
    return NextResponse.json(
      {
        error: "Failed to generate performance tasks. Please try again.",
      },
      { status: 500 }
    );
  }
}
