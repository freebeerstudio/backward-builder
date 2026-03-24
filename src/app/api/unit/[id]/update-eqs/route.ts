import { NextResponse } from "next/server";
import { db } from "@/db";
import { units, teachers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSessionId } from "@/lib/teacher-session";

/**
 * PATCH /api/unit/[id]/update-eqs — Update essential questions for a unit.
 *
 * Only the unit owner can edit. Validates that the teacher session matches
 * the unit's teacherId. Accepts a JSON body with { essentialQuestions: string[] }.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sessionId = await getSessionId();

  if (!sessionId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Find the teacher
  const [teacher] = await db
    .select({ id: teachers.id })
    .from(teachers)
    .where(eq(teachers.sessionId, sessionId))
    .limit(1);

  if (!teacher) {
    return NextResponse.json({ error: "Teacher not found" }, { status: 401 });
  }

  // Parse and validate body
  const body = await request.json();
  const essentialQuestions = body.essentialQuestions;

  if (!Array.isArray(essentialQuestions) || essentialQuestions.length === 0) {
    return NextResponse.json(
      { error: "essentialQuestions must be a non-empty array of strings" },
      { status: 400 }
    );
  }

  // Validate each question is a non-empty string
  const cleaned = essentialQuestions
    .map((q: unknown) => (typeof q === "string" ? q.trim() : ""))
    .filter((q: string) => q.length > 0);

  if (cleaned.length === 0) {
    return NextResponse.json(
      { error: "At least one non-empty question is required" },
      { status: 400 }
    );
  }

  // Update — ensure the teacher owns this unit
  const result = await db
    .update(units)
    .set({ essentialQuestions: cleaned, updatedAt: new Date() })
    .where(and(eq(units.id, id), eq(units.teacherId, teacher.id)))
    .returning({ id: units.id });

  if (result.length === 0) {
    return NextResponse.json(
      { error: "Unit not found or you don't have permission to edit it" },
      { status: 403 }
    );
  }

  return NextResponse.json({ essentialQuestions: cleaned });
}
