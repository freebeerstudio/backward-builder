import { NextResponse } from "next/server";
import { db } from "@/db";
import { unitShares, units, teachers } from "@/db/schema";
import { eq, and, isNotNull } from "drizzle-orm";
import { generateShareCode } from "@/lib/share-code";
import { validateUnitOwnership } from "@/lib/auth";

/**
 * POST /api/unit/[id]/share
 *
 * Two modes:
 * 1. Direct share by email — body: { email: string }
 *    Looks up or creates the teacher, then creates a unitShares record
 *    so the unit immediately appears in their "Shared with Me" tab.
 *
 * 2. Share via link (no email) — generates a shareable link (original behavior).
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: unitId } = await params;

    // Ownership check: only the unit owner can share
    const ownership = await validateUnitOwnership(unitId);
    if (!ownership) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Parse body — may be empty for link-only sharing
    let body: { email?: string } = {};
    try {
      body = await request.json();
    } catch {
      // No body = link-only mode
    }

    // --- Mode 1: Direct share by email ---
    if (body.email) {
      const email = body.email.trim().toLowerCase();

      // Basic email validation
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json(
          { error: "Please enter a valid email address." },
          { status: 400 }
        );
      }

      // Don't let the owner share with themselves
      const [ownerTeacher] = await db
        .select({ email: teachers.email })
        .from(teachers)
        .where(eq(teachers.id, ownership.teacherId))
        .limit(1);

      if (ownerTeacher?.email?.toLowerCase() === email) {
        return NextResponse.json(
          { error: "You can't share a unit with yourself." },
          { status: 400 }
        );
      }

      // Look up or create the recipient teacher by email
      let [recipient] = await db
        .select({ id: teachers.id, email: teachers.email, displayName: teachers.displayName })
        .from(teachers)
        .where(eq(teachers.email, email))
        .limit(1);

      if (!recipient) {
        // Create a placeholder teacher — they'll complete setup on first visit
        const crypto = await import("crypto");
        const placeholderSessionId = crypto.randomBytes(32).toString("hex");
        const [newTeacher] = await db
          .insert(teachers)
          .values({
            email,
            sessionId: placeholderSessionId,
          })
          .returning({ id: teachers.id, email: teachers.email, displayName: teachers.displayName });
        recipient = newTeacher;
      }

      // Check if already shared with this teacher
      const existingShares = await db
        .select()
        .from(unitShares)
        .where(
          and(
            eq(unitShares.unitId, unitId),
            eq(unitShares.teacherId, recipient.id)
          )
        );

      if (existingShares.length > 0) {
        return NextResponse.json(
          { error: "This unit is already shared with that teacher." },
          { status: 409 }
        );
      }

      // Create the direct share record
      await db.insert(unitShares).values({
        unitId,
        teacherId: recipient.id,
        shareCode: generateShareCode(),
      });

      return NextResponse.json({
        success: true,
        sharedWith: {
          email: recipient.email,
          displayName: recipient.displayName,
        },
      });
    }

    // --- Mode 2: Share via link (original behavior) ---
    // Check if a link-type share code already exists (one without a teacherId)
    const existing = await db
      .select()
      .from(unitShares)
      .where(
        and(
          eq(unitShares.unitId, unitId),
          // Link shares have no teacherId assigned yet
        )
      );

    // Find an existing link share (no recipient assigned)
    const linkShare = existing.find((s) => !s.teacherId);

    if (linkShare) {
      const origin = new URL(request.url).origin;
      return NextResponse.json({
        shareCode: linkShare.shareCode,
        shareUrl: `${origin}/api/unit/share/${linkShare.shareCode}`,
      });
    }

    // Generate a new share code for link sharing
    const shareCode = generateShareCode();

    await db.insert(unitShares).values({
      unitId,
      shareCode,
      // teacherId is null — this is a link share
    });

    const origin = new URL(request.url).origin;
    return NextResponse.json({
      shareCode,
      shareUrl: `${origin}/api/unit/share/${shareCode}`,
    });
  } catch (error) {
    console.error("Failed to share unit:", error);
    return NextResponse.json(
      { error: "Failed to share unit." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/unit/[id]/share
 *
 * Returns the list of teachers this unit is currently shared with
 * (direct shares only — not the link-based share code).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: unitId } = await params;

    // Ownership check
    const ownership = await validateUnitOwnership(unitId);
    if (!ownership) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get all shares for this unit that have a recipient (direct shares)
    const shares = await db
      .select({
        shareId: unitShares.id,
        teacherId: unitShares.teacherId,
        createdAt: unitShares.createdAt,
      })
      .from(unitShares)
      .where(
        and(
          eq(unitShares.unitId, unitId),
          isNotNull(unitShares.teacherId)
        )
      );

    // Enrich with teacher info
    const enrichedShares = await Promise.all(
      shares.map(async (share) => {
        if (!share.teacherId) return null;

        const [teacher] = await db
          .select({
            email: teachers.email,
            displayName: teachers.displayName,
          })
          .from(teachers)
          .where(eq(teachers.id, share.teacherId))
          .limit(1);

        return {
          shareId: share.shareId,
          email: teacher?.email || "Unknown",
          displayName: teacher?.displayName || null,
          sharedAt: share.createdAt,
        };
      })
    );

    // Filter out the owner's own shares (from link-based acceptance)
    const directShares = enrichedShares.filter(
      (s) => s !== null
    );

    return NextResponse.json({ shares: directShares });
  } catch (error) {
    console.error("Failed to list shares:", error);
    return NextResponse.json(
      { error: "Failed to list shares." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/unit/[id]/share
 *
 * Removes a direct share by share ID.
 * Body: { shareId: string }
 */
export async function DELETE(
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

    const body = await request.json();
    const { shareId } = body;

    if (!shareId) {
      return NextResponse.json(
        { error: "shareId is required." },
        { status: 400 }
      );
    }

    // Verify the share belongs to this unit before deleting
    const [share] = await db
      .select()
      .from(unitShares)
      .where(
        and(
          eq(unitShares.id, shareId),
          eq(unitShares.unitId, unitId)
        )
      )
      .limit(1);

    if (!share) {
      return NextResponse.json(
        { error: "Share not found." },
        { status: 404 }
      );
    }

    await db.delete(unitShares).where(eq(unitShares.id, shareId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to remove share:", error);
    return NextResponse.json(
      { error: "Failed to remove share." },
      { status: 500 }
    );
  }
}
