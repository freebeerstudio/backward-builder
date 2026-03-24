import { NextResponse } from "next/server";
import { db } from "@/db";
import { teachers, units } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getOrCreateSessionId } from "@/lib/teacher-session";
import { analyzeUnderstanding } from "@/lib/claude";

/**
 * POST /api/unit/create — Create a new unit from an enduring understanding.
 * Calls Claude to analyze the understanding, map standards, classify Bloom's level,
 * and generate essential questions. Then persists everything to the database.
 */
export async function POST(request: Request) {
  try {
    const { enduringUnderstanding } = await request.json();

    if (!enduringUnderstanding || typeof enduringUnderstanding !== "string") {
      return NextResponse.json(
        { error: "An enduring understanding is required." },
        { status: 400 }
      );
    }

    if (enduringUnderstanding.trim().length < 20) {
      return NextResponse.json(
        { error: "Please provide a more detailed enduring understanding (at least 20 characters)." },
        { status: 400 }
      );
    }

    // Get teacher from session
    const sessionId = await getOrCreateSessionId();
    const [teacher] = await db
      .select()
      .from(teachers)
      .where(eq(teachers.sessionId, sessionId))
      .limit(1);

    if (!teacher) {
      return NextResponse.json(
        { error: "Please complete classroom setup first.", redirect: "/setup" },
        { status: 400 }
      );
    }

    if (!teacher.gradeLevel || !teacher.subject || !teacher.state) {
      return NextResponse.json(
        { error: "Please complete classroom setup first.", redirect: "/setup" },
        { status: 400 }
      );
    }

    // Call Claude to analyze the enduring understanding
    const analysis = await analyzeUnderstanding(
      enduringUnderstanding.trim(),
      teacher.gradeLevel,
      teacher.subject,
      teacher.state
    );

    // Create the unit record with all AI-generated fields
    const [unit] = await db
      .insert(units)
      .values({
        teacherId: teacher.id,
        title: analysis.title,
        enduringUnderstanding: enduringUnderstanding.trim(),
        essentialQuestions: analysis.essentialQuestions,
        standardCodes: analysis.standardCodes,
        standardDescriptions: analysis.standardDescriptions,
        cognitiveLevel: analysis.cognitiveLevel,
        cognitiveLevelExplanation: analysis.cognitiveLevelExplanation,
        status: "stage1",
      })
      .returning({
        id: units.id,
        title: units.title,
      });

    return NextResponse.json({
      unitId: unit.id,
      title: unit.title,
      essentialQuestions: analysis.essentialQuestions,
      standardCodes: analysis.standardCodes,
      standardDescriptions: analysis.standardDescriptions,
      cognitiveLevel: analysis.cognitiveLevel,
      cognitiveLevelExplanation: analysis.cognitiveLevelExplanation,
      reflectionForTeacher: analysis.reflectionForTeacher,
    });
  } catch (error) {
    console.error("Unit creation error:", error);

    // Distinguish AI failures from DB failures for better UX
    const message =
      error instanceof Error && error.message.includes("callClaude")
        ? "AI analysis failed. Please try again."
        : "Failed to create unit. Please try again.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
