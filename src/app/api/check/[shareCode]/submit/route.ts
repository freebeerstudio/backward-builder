import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  checksForUnderstanding,
  checkQuestions,
  studentSubmissions,
  studentAnswers,
} from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { gradeMCAnswer } from "@/lib/grading";
import type { MCOption } from "@/types";

/**
 * POST /api/check/[shareCode]/submit
 *
 * Submits student answers for a Check for Understanding.
 * Auto-grades selected_response questions immediately.
 * Short-answer questions are stored with score=null for teacher review.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ shareCode: string }> }
) {
  try {
    const { shareCode } = await params;
    const body = await request.json();
    const { studentName, classPeriod, answers } = body;

    // Validate inputs
    if (!studentName || typeof studentName !== "string" || !studentName.trim()) {
      return NextResponse.json(
        { error: "Student name is required" },
        { status: 400 }
      );
    }
    if (!classPeriod || typeof classPeriod !== "string" || !classPeriod.trim()) {
      return NextResponse.json(
        { error: "Class period is required" },
        { status: 400 }
      );
    }
    if (!Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json(
        { error: "Answers are required" },
        { status: 400 }
      );
    }

    // Look up check by shareCode, verify "live"
    const [check] = await db
      .select()
      .from(checksForUnderstanding)
      .where(eq(checksForUnderstanding.shareCode, shareCode))
      .limit(1);

    if (!check || check.status !== "live") {
      return NextResponse.json(
        { error: "Check not found or not available" },
        { status: 404 }
      );
    }

    // Load all questions for grading
    const questions = await db
      .select()
      .from(checkQuestions)
      .where(eq(checkQuestions.checkId, check.id))
      .orderBy(asc(checkQuestions.orderIndex));

    const questionMap = new Map(questions.map((q) => [q.id, q]));

    // Create submission record
    const [submission] = await db
      .insert(studentSubmissions)
      .values({
        unitId: check.unitId,
        assessmentType: "check",
        assessmentId: check.id,
        studentName: studentName.trim(),
        classPeriod: classPeriod.trim(),
      })
      .returning();

    // Grade each answer and build insert records
    let totalScore = 0;
    let maxScore = 0;

    interface AnswerRecord {
      submissionId: string;
      questionId: string;
      answer: string;
      isCorrect: boolean | null;
      score: number | null;
    }

    const validAnswers: AnswerRecord[] = [];

    for (const a of answers as { questionId: string; answer: string }[]) {
      const question = questionMap.get(a.questionId);
      if (!question) continue;

      maxScore += question.points;

      if (question.type === "selected_response" && question.options) {
        const result = gradeMCAnswer(
          a.answer,
          question.options as MCOption[],
          question.points
        );
        totalScore += result.score;
        validAnswers.push({
          submissionId: submission.id,
          questionId: a.questionId,
          answer: a.answer,
          isCorrect: result.isCorrect,
          score: result.score,
        });
      } else {
        // short_answer — store with null score for teacher review
        validAnswers.push({
          submissionId: submission.id,
          questionId: a.questionId,
          answer: a.answer,
          isCorrect: null,
          score: null,
        });
      }
    }

    if (validAnswers.length > 0) {
      await db.insert(studentAnswers).values(validAnswers);
    }

    // Update submission totals
    await db
      .update(studentSubmissions)
      .set({ totalScore, maxScore })
      .where(eq(studentSubmissions.id, submission.id));

    return NextResponse.json({
      submissionId: submission.id,
      totalScore,
      maxScore,
    });
  } catch (error) {
    console.error("Failed to submit check:", error);
    return NextResponse.json(
      { error: "Failed to submit answers. Please try again." },
      { status: 500 }
    );
  }
}
