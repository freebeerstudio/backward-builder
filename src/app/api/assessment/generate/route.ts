import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { teachers, assessments, questions } from "@/db/schema";
import { getOrCreateSessionId } from "@/lib/teacher-session";
import { generateAssessment } from "@/lib/claude";
import { generateShareCode } from "@/lib/share-code";
import { eq } from "drizzle-orm";
import type { AssessmentInput } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { topic, gradeLevel, objectives, topicsCovered, unitLength, sourcesUsed } = body;

    if (!topic || !gradeLevel || !objectives || !topicsCovered) {
      return NextResponse.json(
        { error: "Missing required fields: topic, gradeLevel, objectives, and topicsCovered are required." },
        { status: 400 }
      );
    }

    // Get or create teacher from session cookie
    const sessionId = await getOrCreateSessionId();

    let teacher = await db.query.teachers.findFirst({
      where: eq(teachers.sessionId, sessionId),
    });

    if (!teacher) {
      const [newTeacher] = await db
        .insert(teachers)
        .values({ sessionId })
        .returning();
      teacher = newTeacher;
    }

    // Build assessment input
    const input: AssessmentInput = {
      topic,
      gradeLevel,
      unitLength: unitLength || "",
      objectives,
      topicsCovered,
      sourcesUsed: sourcesUsed || "",
    };

    // Call Claude to generate the assessment
    let generated;
    try {
      generated = await generateAssessment(input);
    } catch (error) {
      console.error("Claude API error:", error);
      return NextResponse.json(
        { error: "Failed to generate assessment. Please try again." },
        { status: 500 }
      );
    }

    // Create the assessment record
    const [assessment] = await db
      .insert(assessments)
      .values({
        teacherId: teacher.id,
        title: generated.title,
        description: generated.description,
        gradeLevel,
        topic,
        unitLength: unitLength || null,
        objectives,
        topicsCovered,
        sourcesUsed: sourcesUsed || null,
        shareCode: generateShareCode(),
        status: "draft",
        totalPoints: 0,
      })
      .returning();

    // Insert all generated questions with orderIndex
    let totalPoints = 0;

    for (let i = 0; i < generated.questions.length; i++) {
      const q = generated.questions[i];
      totalPoints += q.points;

      await db.insert(questions).values({
        assessmentId: assessment.id,
        type: q.type,
        orderIndex: i,
        questionText: q.questionText,
        points: q.points,
        options: q.options ?? null,
        sourceDocument: q.sourceDocument ?? null,
        sourceAttribution: q.sourceAttribution ?? null,
        scaffoldingQuestions: q.scaffoldingQuestions ?? null,
        rubric: q.rubric ?? null,
        sampleAnswer: q.sampleAnswer ?? null,
      });
    }

    // Update totalPoints on the assessment
    await db
      .update(assessments)
      .set({ totalPoints })
      .where(eq(assessments.id, assessment.id));

    return NextResponse.json(
      {
        assessmentId: assessment.id,
        title: generated.title,
        questionCount: generated.questions.length,
        totalPoints,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Assessment generation error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
