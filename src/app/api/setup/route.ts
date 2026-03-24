import { NextResponse } from "next/server";
import { db } from "@/db";
import { teachers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getOrCreateSessionId } from "@/lib/teacher-session";

/**
 * Derives the standards framework from subject and state.
 * Science uses NGSS (adopted by most states), ELA and Math use Common Core,
 * History/SS uses state-specific frameworks since there's no national standard.
 */
function deriveStandardsFramework(subject: string, state: string): string {
  switch (subject) {
    case "Science":
      return "NGSS";
    case "ELA":
      return "Common Core ELA";
    case "Math":
      return "Common Core Math";
    case "History/Social Studies":
      return `${state} Social Studies Standards`;
    default:
      return `${state} ${subject} Standards`;
  }
}

/**
 * POST /api/setup — Save classroom context for the current teacher.
 * Creates or updates the teacher record with grade, subject, and state.
 */
export async function POST(request: Request) {
  try {
    const { gradeLevel, subject, state } = await request.json();

    if (!gradeLevel || !subject || !state) {
      return NextResponse.json(
        { error: "Grade level, subject, and state are required." },
        { status: 400 }
      );
    }

    const sessionId = await getOrCreateSessionId();
    const standardsFramework = deriveStandardsFramework(subject, state);

    // Check if teacher already exists for this session
    const existing = await db
      .select()
      .from(teachers)
      .where(eq(teachers.sessionId, sessionId))
      .limit(1);

    let teacherId: string;
    let displayName: string;

    if (existing.length > 0) {
      // Update classroom context but PRESERVE the teacher's display name.
      // The display name is their identity (set during signup or seeding).
      // We only update grade/subject/state/framework for the new unit.
      await db
        .update(teachers)
        .set({
          gradeLevel,
          subject,
          state,
          standardsFramework,
        })
        .where(eq(teachers.sessionId, sessionId));
      teacherId = existing[0].id;
      displayName = existing[0].displayName || `${gradeLevel} ${subject} Teacher`;
    } else {
      // Create new teacher record — generate a default display name
      displayName = `${gradeLevel} ${subject} Teacher`;
      const [newTeacher] = await db
        .insert(teachers)
        .values({
          sessionId,
          gradeLevel,
          subject,
          state,
          standardsFramework,
          displayName,
        })
        .returning({ id: teachers.id });
      teacherId = newTeacher.id;
    }

    return NextResponse.json({
      teacherId,
      displayName,
      gradeLevel,
      subject,
      state,
      standardsFramework,
    });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      { error: "Failed to save classroom context." },
      { status: 500 }
    );
  }
}
