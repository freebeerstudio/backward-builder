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

    // Per-question results to return to the student after submission
    interface QuestionResult {
      questionId: string;
      questionText: string;
      type: "selected_response" | "short_answer";
      points: number;
      studentAnswer: string;
      isCorrect: boolean | null;
      score: number | null;
      correctAnswer: string | null; // Revealed only after submission for MC
    }

    const questionResults: QuestionResult[] = [];

    for (const a of answers as { questionId: string; answer: string }[]) {
      const question = questionMap.get(a.questionId);
      if (!question) continue;

      maxScore += question.points;

      if (question.type === "selected_response" && question.options) {
        const options = question.options as MCOption[];
        const result = gradeMCAnswer(a.answer, options, question.points);
        totalScore += result.score;
        validAnswers.push({
          submissionId: submission.id,
          questionId: a.questionId,
          answer: a.answer,
          isCorrect: result.isCorrect,
          score: result.score,
        });

        // Safe to reveal correct answer now — submission is recorded
        const correctOption = options.find((o) => o.isCorrect);
        questionResults.push({
          questionId: a.questionId,
          questionText: question.questionText,
          type: "selected_response",
          points: question.points,
          studentAnswer: a.answer,
          isCorrect: result.isCorrect,
          score: result.score,
          correctAnswer: correctOption?.text ?? null,
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
        questionResults.push({
          questionId: a.questionId,
          questionText: question.questionText,
          type: "short_answer",
          points: question.points,
          studentAnswer: a.answer,
          isCorrect: null,
          score: null,
          correctAnswer: null,
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
      questionResults,
    });
  } catch (error) {
    console.error("Failed to submit check:", error);
    return NextResponse.json(
      { error: "Failed to submit answers. Please try again." },
      { status: 500 }
    );
  }
}
