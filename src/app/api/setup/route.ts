import { NextResponse } from "next/server";
import { db } from "@/db";
import { teachers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSessionId, getOrCreateSessionId } from "@/lib/teacher-session";

/**
 * Derives the standards framework from subject and state.
 * Science uses NGSS (adopted by most states), ELA and Math use Common Core,
 * History/SS uses state-specific frameworks since there's no national standard.
 */
function deriveStandardsFramework(subject: string, state: string): string {
  // Science subjects → NGSS
  if (["Science", "Biology", "Chemistry", "Physics", "Earth Science", "Environmental Science"].includes(subject)) {
    return "NGSS";
  }
  // ELA → Common Core ELA
  if (subject === "English Language Arts") {
    return "Common Core ELA";
  }
  // Math → Common Core Math
  if (subject === "Mathematics") {
    return "Common Core Math";
  }
  // Social Studies family → state-specific
  if (["History / Social Studies", "U.S. History", "World History", "Civics / Government", "Economics", "Geography"].includes(subject)) {
    return `${state} Social Studies Standards`;
  }
  // Computer Science → CSTA
  if (subject === "Computer Science") {
    return "CSTA K-12 CS Standards";
  }
  // Everything else → state-specific
  return `${state} ${subject} Standards`;
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

    // Prefer the existing session (set by auth signup/signin) to avoid
    // creating a competing session that overwrites the auth cookie.
    // Only fall back to getOrCreateSessionId for the standalone /setup page.
    const sessionId = (await getSessionId()) || (await getOrCreateSessionId());
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
