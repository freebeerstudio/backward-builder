import { NextResponse } from "next/server";
import { db } from "@/db";
import { performanceTasks, units } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * GET /api/task/[shareCode]
 *
 * Public endpoint — fetches a live Performance Task by share code.
 * Does NOT return the rubric (teacher-only) so students can't game the scoring.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ shareCode: string }> }
) {
  try {
    const { shareCode } = await params;

    // Look up task by shareCode
    const [task] = await db
      .select()
      .from(performanceTasks)
      .where(eq(performanceTasks.shareCode, shareCode))
      .limit(1);

    if (!task || task.status !== "live") {
      return NextResponse.json(
        { error: "Performance task not found or not available" },
        { status: 404 }
      );
    }

    // Load parent unit for context
    const [unit] = await db
      .select({ title: units.title })
      .from(units)
      .where(eq(units.id, task.unitId))
      .limit(1);

    return NextResponse.json({
      task: {
        id: task.id,
        title: task.title,
        description: task.description,
        scenario: task.scenario,
        estimatedTimeMinutes: task.estimatedTimeMinutes,
      },
      unit: {
        title: unit?.title || "Untitled Unit",
      },
    });
  } catch (error) {
    console.error("Failed to fetch performance task:", error);
    return NextResponse.json(
      { error: "Failed to load performance task" },
      { status: 500 }
    );
  }
}
