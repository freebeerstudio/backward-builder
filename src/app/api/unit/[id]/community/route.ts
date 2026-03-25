import { NextResponse } from "next/server";
import { db } from "@/db";
import { units } from "@/db/schema";
import { eq } from "drizzle-orm";
import { validateUnitOwnership } from "@/lib/auth";

/**
 * POST /api/unit/[id]/community
 *
 * Toggles a unit's isPublic flag — publishes or unpublishes it
 * from the community library. Only the unit owner can toggle this.
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

    // Load current unit state
    const [unit] = await db
      .select({ isPublic: units.isPublic })
      .from(units)
      .where(eq(units.id, unitId))
      .limit(1);

    if (!unit) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    }

    // Toggle isPublic
    const newValue = !unit.isPublic;
    await db
      .update(units)
      .set({ isPublic: newValue, updatedAt: new Date() })
      .where(eq(units.id, unitId));

    return NextResponse.json({
      isPublic: newValue,
      message: newValue
        ? "Unit published to the community!"
        : "Unit removed from community.",
    });
  } catch (error) {
    console.error("Failed to toggle community publishing:", error);
    return NextResponse.json(
      { error: "Failed to update community status." },
      { status: 500 }
    );
  }
}
