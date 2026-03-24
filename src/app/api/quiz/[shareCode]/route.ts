import { NextResponse } from "next/server";
import { db } from "@/db";
import { assessments, questions } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import type { MCOption } from "@/types";

/**
 * GET /api/quiz/[shareCode]
 *
 * Public endpoint — no auth required.
 * Returns assessment info and questions stripped of correct answers,
 * rubrics, and sample answers so students cannot cheat.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ shareCode: string }> },
) {
  try {
    const { shareCode } = await params;

    // 1. Look up the assessment by shareCode
    const assessment = await db.query.assessments.findFirst({
      where: eq(assessments.shareCode, shareCode),
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 },
      );
    }

    // 2. Only serve published assessments
    if (assessment.status !== "published") {
      return NextResponse.json(
        { error: "This assessment is not available" },
        { status: 404 },
      );
    }

    // 3. Load questions ordered by orderIndex
    const questionRows = await db.query.questions.findMany({
      where: eq(questions.assessmentId, assessment.id),
      orderBy: [asc(questions.orderIndex)],
    });

    // 4. Strip sensitive fields before sending to student
    const publicQuestions = questionRows.map((q) => {
      const base = {
        id: q.id,
        type: q.type,
        orderIndex: q.orderIndex,
        questionText: q.questionText,
        points: q.points,
      };

      if (q.type === "multiple_choice" && q.options) {
        // Remove isCorrect from each option
        const safeOptions = (q.options as MCOption[]).map((opt) => ({
          text: opt.text,
        }));
        return { ...base, options: safeOptions };
      }

      if (q.type === "document_based") {
        return {
          ...base,
          sourceDocument: q.sourceDocument,
          sourceAttribution: q.sourceAttribution,
          scaffoldingQuestions: q.scaffoldingQuestions,
        };
      }

      // constructed_response — just question text and points
      return base;
    });

    return NextResponse.json({
      assessment: {
        id: assessment.id,
        title: assessment.title,
        description: assessment.description,
        gradeLevel: assessment.gradeLevel,
      },
      questions: publicQuestions,
    });
  } catch (error) {
    console.error("Error fetching quiz:", error);
    return NextResponse.json(
      { error: "Failed to load quiz" },
      { status: 500 },
    );
  }
}
