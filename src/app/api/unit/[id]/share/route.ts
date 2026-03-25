import { NextResponse } from "next/server";
import { db } from "@/db";
import { unitShares, units } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateShareCode } from "@/lib/share-code";
import { validateUnitOwnership } from "@/lib/auth";

/**
 * POST /api/unit/[id]/share
 *
 * Generates a share link for a unit so the teacher can share it
 * with other teachers. Returns an existing share code if one already
 * exists, or creates a new one.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: unitId } = await params;

    // Ownership check: only the unit owner can generate share links
    const ownership = await validateUnitOwnership(unitId);
    if (!ownership) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if a share code already exists for this unit
    const existing = await db
      .select()
      .from(unitShares)
      .where(eq(unitShares.unitId, unitId))
      .limit(1);

    if (existing.length > 0) {
      const origin = new URL(request.url).origin;
      return NextResponse.json({
        shareCode: existing[0].shareCode,
        shareUrl: `${origin}/api/unit/share/${existing[0].shareCode}`,
      });
    }

    // Generate a new share code
    const shareCode = generateShareCode();

    await db.insert(unitShares).values({
      unitId,
      shareCode,
    });

    const origin = new URL(request.url).origin;
    return NextResponse.json({
      shareCode,
      shareUrl: `${origin}/api/unit/share/${shareCode}`,
    });
  } catch (error) {
    console.error("Failed to generate share link:", error);
    return NextResponse.json(
      { error: "Failed to generate share link." },
      { status: 500 }
    );
  }
}
