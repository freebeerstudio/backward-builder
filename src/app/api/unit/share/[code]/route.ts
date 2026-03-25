import { NextResponse } from "next/server";
import { db } from "@/db";
import { unitShares, units } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getAuthenticatedTeacher } from "@/lib/auth";
import { generateShareCode } from "@/lib/share-code";

/**
 * GET /api/unit/share/[code]
 *
 * Accepts a unit share — adds the unit to the recipient teacher's
 * "Shared with Me" list. If the teacher isn't authenticated, redirects
 * to the unit page so they can view it as a community unit.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const origin = new URL(request.url).origin;

    // Look up the share record
    const [share] = await db
      .select()
      .from(unitShares)
      .where(eq(unitShares.shareCode, code))
      .limit(1);

    if (!share) {
      return NextResponse.redirect(new URL("/?error=invalid-share", origin));
    }

    // Verify the unit still exists
    const [unit] = await db
      .select({ id: units.id })
      .from(units)
      .where(eq(units.id, share.unitId))
      .limit(1);

    if (!unit) {
      return NextResponse.redirect(new URL("/?error=unit-not-found", origin));
    }

    // Check if the visitor is authenticated
    const auth = await getAuthenticatedTeacher();

    if (!auth.authenticated) {
      // Not logged in — redirect to the unit page (they can view it)
      return NextResponse.redirect(new URL(`/unit/${unit.id}`, origin));
    }

    // Check if this teacher already has this unit shared with them
    const allSharesForUnit = await db
      .select()
      .from(unitShares)
      .where(eq(unitShares.unitId, share.unitId));

    const alreadyShared = allSharesForUnit.some(
      (s) => s.teacherId === auth.teacherId
    );

    if (!alreadyShared) {
      // Create a recipient-specific share record
      await db.insert(unitShares).values({
        unitId: share.unitId,
        teacherId: auth.teacherId,
        shareCode: generateShareCode(), // unique code per recipient
      });
    }

    // Redirect to the unit page
    return NextResponse.redirect(new URL(`/unit/${unit.id}`, origin));
  } catch (error) {
    console.error("Failed to accept unit share:", error);
    const origin = new URL(request.url).origin;
    return NextResponse.redirect(new URL("/?error=share-failed", origin));
  }
}
