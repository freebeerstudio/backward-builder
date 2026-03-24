import { NextResponse } from "next/server";
import { db } from "@/db";
import { performanceTasks } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * POST /api/unit/[id]/select-task
 *
 * Selects a performance task for a unit. Deselects all other tasks
 * in the same unit so only one can be selected at a time.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: unitId } = await params;
    const { taskId } = await request.json();

    if (!taskId) {
      return NextResponse.json(
        { error: "taskId is required" },
        { status: 400 }
      );
    }

    // Verify the task belongs to this unit
    const [task] = await db
      .select()
      .from(performanceTasks)
      .where(
        and(
          eq(performanceTasks.id, taskId),
          eq(performanceTasks.unitId, unitId)
        )
      )
      .limit(1);

    if (!task) {
      return NextResponse.json(
        { error: "Task not found in this unit" },
        { status: 404 }
      );
    }

    // Deselect all tasks in this unit
    await db
      .update(performanceTasks)
      .set({ isSelected: false })
      .where(eq(performanceTasks.unitId, unitId));

    // Select the chosen task
    await db
      .update(performanceTasks)
      .set({ isSelected: true })
      .where(eq(performanceTasks.id, taskId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to select task:", error);
    return NextResponse.json(
      { error: "Failed to select task. Please try again." },
      { status: 500 }
    );
  }
}
