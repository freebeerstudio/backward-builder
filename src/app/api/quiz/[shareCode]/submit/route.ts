import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  assessments,
  questions,
  studentSubmissions,
  studentAnswers,
} from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { gradeMCAnswer } from "@/lib/grading";
import type { MCOption } from "@/types";

/**
 * POST /api/quiz/[shareCode]/submit
 *
 * Accepts a student's completed quiz and auto-grades MC questions.
 * DBQ and CR answers are stored with score=null for later AI grading.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ shareCode: string }> },
) {
  try {
    const { shareCode } = await params;
    const body = await request.json();

    // --- Validate request body ---
    const { studentName, classPeriod, answers } = body as {
      studentName?: string;
      classPeriod?: string;
      answers?: Array<{ questionId: string; answer: string }>;
    };

    if (!studentName?.trim()) {
      return NextResponse.json(
        { error: "Student name is required" },
        { status: 400 },
      );
    }
    if (!classPeriod?.trim()) {
      return NextResponse.json(
        { error: "Class period is required" },
        { status: 400 },
      );
    }
    if (!answers || answers.length === 0) {
      return NextResponse.json(
        { error: "At least one answer is required" },
        { status: 400 },
      );
    }

    // --- Look up assessment ---
    const assessment = await db.query.assessments.findFirst({
      where: eq(assessments.shareCode, shareCode),
    });

    if (!assessment || assessment.status !== "published") {
      return NextResponse.json(
        { error: "Assessment not found or not available" },
        { status: 404 },
      );
    }

    // --- Load all questions for grading ---
    const questionRows = await db.query.questions.findMany({
      where: eq(questions.assessmentId, assessment.id),
      orderBy: [asc(questions.orderIndex)],
    });

    const questionMap = new Map(questionRows.map((q) => [q.id, q]));

    // --- Create submission record ---
    const [submission] = await db
      .insert(studentSubmissions)
      .values({
        assessmentId: assessment.id,
        studentName: studentName.trim(),
        classPeriod: classPeriod.trim(),
      })
      .returning();

    // --- Grade and store each answer ---
    let mcScore = 0;
    let totalMCPoints = 0;

    const answerInserts = answers.map((ans) => {
      const question = questionMap.get(ans.questionId);
      if (!question) {
        return {
          submissionId: submission.id,
          questionId: ans.questionId,
          answer: ans.answer,
          isCorrect: null,
          score: null,
        };
      }

      if (question.type === "multiple_choice" && question.options) {
        const result = gradeMCAnswer(
          ans.answer,
          question.options as MCOption[],
          question.points,
        );
        mcScore += result.score;
        totalMCPoints += result.maxPoints;

        return {
          submissionId: submission.id,
          questionId: ans.questionId,
          answer: ans.answer,
          isCorrect: result.isCorrect,
          score: result.score,
        };
      }

      // DBQ or CR — store without grading (Claude grades later)
      return {
        submissionId: submission.id,
        questionId: ans.questionId,
        answer: ans.answer,
        isCorrect: null,
        score: null,
      };
    });

    if (answerInserts.length > 0) {
      await db.insert(studentAnswers).values(answerInserts);
    }

    // --- Calculate totals ---
    const maxScore = questionRows.reduce((sum, q) => sum + q.points, 0);

    // Update submission with scores (MC portion only for now)
    await db
      .update(studentSubmissions)
      .set({
        totalScore: mcScore,
        maxScore,
      })
      .where(eq(studentSubmissions.id, submission.id));

    return NextResponse.json({
      submissionId: submission.id,
      totalScore: mcScore,
      maxScore,
      mcScore,
      totalMCPoints,
    });
  } catch (error) {
    console.error("Error submitting quiz:", error);
    return NextResponse.json(
      { error: "Failed to submit quiz" },
      { status: 500 },
    );
  }
}
