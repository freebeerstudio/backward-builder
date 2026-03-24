import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { assessments, questions } from "@/db/schema";
import { regenerateQuestion } from "@/lib/claude";
import { eq } from "drizzle-orm";
import type { AssessmentInput, GeneratedQuestion } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { questionId, feedback } = body;

    if (!questionId || !feedback) {
      return NextResponse.json(
        { error: "Missing required fields: questionId and feedback are required." },
        { status: 400 }
      );
    }

    // Load the question from DB
    const question = await db.query.questions.findFirst({
      where: eq(questions.id, questionId),
    });

    if (!question) {
      return NextResponse.json(
        { error: "Question not found." },
        { status: 404 }
      );
    }

    // Load the parent assessment for context
    const assessment = await db.query.assessments.findFirst({
      where: eq(assessments.id, question.assessmentId),
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Parent assessment not found." },
        { status: 404 }
      );
    }

    // Build AssessmentInput from assessment fields
    const assessmentContext: AssessmentInput = {
      topic: assessment.topic || "",
      gradeLevel: assessment.gradeLevel || "",
      unitLength: assessment.unitLength || "",
      objectives: assessment.objectives || "",
      topicsCovered: assessment.topicsCovered || "",
      sourcesUsed: assessment.sourcesUsed || "",
    };

    // Build current question shape for Claude
    const currentQuestion: GeneratedQuestion = {
      type: question.type,
      questionText: question.questionText,
      points: question.points,
      options: question.options as GeneratedQuestion["options"],
      sourceDocument: question.sourceDocument ?? undefined,
      sourceAttribution: question.sourceAttribution ?? undefined,
      scaffoldingQuestions: question.scaffoldingQuestions as GeneratedQuestion["scaffoldingQuestions"],
      rubric: question.rubric as GeneratedQuestion["rubric"],
      sampleAnswer: question.sampleAnswer ?? undefined,
    };

    // Call Claude to regenerate the question
    let regenerated;
    try {
      regenerated = await regenerateQuestion(currentQuestion, feedback, assessmentContext);
    } catch (error) {
      console.error("Claude regeneration error:", error);
      return NextResponse.json(
        { error: "Failed to regenerate question. Please try again." },
        { status: 500 }
      );
    }

    // Update the question in DB
    const [updated] = await db
      .update(questions)
      .set({
        type: regenerated.type,
        questionText: regenerated.questionText,
        points: regenerated.points,
        options: regenerated.options ?? null,
        sourceDocument: regenerated.sourceDocument ?? null,
        sourceAttribution: regenerated.sourceAttribution ?? null,
        scaffoldingQuestions: regenerated.scaffoldingQuestions ?? null,
        rubric: regenerated.rubric ?? null,
        sampleAnswer: regenerated.sampleAnswer ?? null,
      })
      .where(eq(questions.id, questionId))
      .returning();

    // Recalculate totalPoints if the point value changed
    if (regenerated.points !== question.points) {
      const allQuestions = await db.query.questions.findMany({
        where: eq(questions.assessmentId, question.assessmentId),
      });
      const newTotal = allQuestions.reduce((sum, q) => sum + q.points, 0);
      await db
        .update(assessments)
        .set({ totalPoints: newTotal })
        .where(eq(assessments.id, question.assessmentId));
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
    console.error("Question regeneration error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
