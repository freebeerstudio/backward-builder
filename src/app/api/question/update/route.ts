import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { assessments, questions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { questionId, updates } = body;

    if (!questionId || !updates || typeof updates !== "object") {
      return NextResponse.json(
        { error: "Missing required fields: questionId and updates are required." },
        { status: 400 }
      );
    }

    // Verify the question exists
    const existing = await db.query.questions.findFirst({
      where: eq(questions.id, questionId),
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Question not found." },
        { status: 404 }
      );
    }

    // Build the partial update object — only include fields that were provided
    const updateData: Record<string, unknown> = {};

    if (updates.questionText !== undefined) {
      updateData.questionText = updates.questionText;
    }
    if (updates.points !== undefined) {
      updateData.points = updates.points;
    }
    if (updates.options !== undefined) {
      updateData.options = updates.options;
    }
    if (updates.sourceDocument !== undefined) {
      updateData.sourceDocument = updates.sourceDocument;
    }
    if (updates.rubric !== undefined) {
      updateData.rubric = updates.rubric;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid update fields provided." },
        { status: 400 }
      );
    }

    // Apply the update
    const [updated] = await db
      .update(questions)
      .set(updateData)
      .where(eq(questions.id, questionId))
      .returning();

    // Recalculate totalPoints if points changed
    if (updates.points !== undefined && updates.points !== existing.points) {
      const allQuestions = await db.query.questions.findMany({
        where: eq(questions.assessmentId, existing.assessmentId),
      });
      const newTotal = allQuestions.reduce((sum, q) => sum + q.points, 0);
      await db
        .update(assessments)
        .set({ totalPoints: newTotal })
        .where(eq(assessments.id, existing.assessmentId));
    }

    return NextResponse.json({
      id: updated.id,
      type: updated.type,
      orderIndex: updated.orderIndex,
      questionText: updated.questionText,
      points: updated.points,
      options: updated.options,
      sourceDocument: updated.sourceDocument,
      sourceAttribution: updated.sourceAttribution,
      scaffoldingQuestions: updated.scaffoldingQuestions,
      rubric: updated.rubric,
      sampleAnswer: updated.sampleAnswer,
    });
  } catch (error) {
    console.error("Question update error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
