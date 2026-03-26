import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  units,
  performanceTasks,
  checksForUnderstanding,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { generateShareCode } from "@/lib/share-code";
import { validateUnitOwnership } from "@/lib/auth";

/**
 * POST /api/unit/[id]/publish
 *
 * Publishes a unit's assessments — generates share codes for all checks
 * and the selected performance task, sets their status to "live",
 * and marks the unit as "live".
 */
export async function POST(
  request: Request,
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

    // Load all checks for this unit
    const checks = await db
      .select()
      .from(checksForUnderstanding)
      .where(eq(checksForUnderstanding.unitId, unitId));

    // Load the selected performance task(s)
    const tasks = await db
      .select()
      .from(performanceTasks)
      .where(
        and(
          eq(performanceTasks.unitId, unitId),
          eq(performanceTasks.isSelected, true)
        )
      );

    if (tasks.length === 0) {
      return NextResponse.json(
        { error: "No performance task selected. Please select a task before publishing." },
        { status: 400 }
      );
    }

    // Generate share codes and set status to "live" for all checks
    const publishedChecks = await Promise.all(
      checks.map(async (check) => {
        const shareCode = check.shareCode || generateShareCode();
        await db
          .update(checksForUnderstanding)
          .set({ shareCode, status: "live" })
          .where(eq(checksForUnderstanding.id, check.id));
        return { id: check.id, title: check.title, shareCode };
      })
    );

    // Generate share codes and set status to "live" for selected task(s)
    const publishedTasks = await Promise.all(
      tasks.map(async (task) => {
        const shareCode = task.shareCode || generateShareCode();
        await db
          .update(performanceTasks)
          .set({ shareCode, status: "live" })
          .where(eq(performanceTasks.id, task.id));
        return { id: task.id, title: task.title, shareCode };
      })
    );

    // Update unit status to "live" (published and accessible to students)
    await db
      .update(units)
      .set({ status: "live", updatedAt: new Date() })
      .where(eq(units.id, unitId));

    // Build response with URLs
    const origin = new URL(request.url).origin;

    return NextResponse.json({
      checks: publishedChecks.map((c) => ({
        id: c.id,
        title: c.title,
        shareCode: c.shareCode,
        url: `${origin}/check/${c.shareCode}`,
      })),
      tasks: publishedTasks.map((t) => ({
        id: t.id,
        title: t.title,
        shareCode: t.shareCode,
        url: `${origin}/task/${t.shareCode}`,
      })),
    });
  } catch (error) {
    console.error("Failed to publish unit:", error);
    return NextResponse.json(
      { error: "Failed to publish unit. Please try again." },
      { status: 500 }
    );
  }
}
