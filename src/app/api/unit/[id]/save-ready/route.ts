import { NextResponse } from "next/server";
import { db } from "@/db";
import { units } from "@/db/schema";
import { eq } from "drizzle-orm";
import { validateUnitOwnership } from "@/lib/auth";

/**
 * POST /api/unit/[id]/save-ready
 *
 * Marks a unit as "ready" — design is complete (all 3 design stages done)
 * but the teacher has chosen to save it for later rather than going
 * live immediately. The unit can be published later from the dashboard
 * or by navigating back to the unit.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: unitId } = await params;

    // Ownership check
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

    // Only allow saving as ready if the unit is at stage3 (design just completed)
    if (unit.status !== "stage3") {
      return NextResponse.json(
        { error: "Unit must be at stage 3 to save as ready" },
        { status: 400 }
      );
    }

    // Update status to "ready"
    await db
      .update(units)
      .set({ status: "ready", updatedAt: new Date() })
      .where(eq(units.id, unitId));

    return NextResponse.json({ status: "ready" });
  } catch (error) {
    console.error("Failed to save unit as ready:", error);
    return NextResponse.json(
      { error: "Failed to save. Please try again." },
      { status: 500 }
    );
  }
}
