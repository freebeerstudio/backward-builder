import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { assessments, questions } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch the assessment
    const assessment = await db.query.assessments.findFirst({
      where: eq(assessments.id, id),
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found." },
        { status: 404 }
      );
    }

    // Fetch all questions ordered by orderIndex
    const assessmentQuestions = await db.query.questions.findMany({
      where: eq(questions.assessmentId, id),
      orderBy: [asc(questions.orderIndex)],
    });

    return NextResponse.json({
      assessment: {
        id: assessment.id,
        title: assessment.title,
        description: assessment.description,
        gradeLevel: assessment.gradeLevel,
        topic: assessment.topic,
        objectives: assessment.objectives,
        topicsCovered: assessment.topicsCovered,
        sourcesUsed: assessment.sourcesUsed,
        status: assessment.status,
        shareCode: assessment.shareCode,
        totalPoints: assessment.totalPoints,
      },
      questions: assessmentQuestions.map((q) => ({
        id: q.id,
        type: q.type,
        orderIndex: q.orderIndex,
        questionText: q.questionText,
        points: q.points,
        options: q.options,
        sourceDocument: q.sourceDocument,
        sourceAttribution: q.sourceAttribution,
        scaffoldingQuestions: q.scaffoldingQuestions,
        rubric: q.rubric,
        sampleAnswer: q.sampleAnswer,
      })),
    });
  } catch (error) {
    console.error("Assessment fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch assessment." },
      { status: 500 }
    );
  }
}
