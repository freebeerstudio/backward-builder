import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  units,
  checksForUnderstanding,
  checkQuestions,
  studentSubmissions,
  studentAnswers,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * GET /api/unit/[id]/results
 *
 * Returns a structured analytics payload for the teacher results dashboard.
 * Aggregates per-check submission counts, averages, and per-question accuracy
 * so the teacher sees at a glance where students are succeeding and struggling.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: unitId } = await params;

    // Load unit
    const [unit] = await db
      .select()
      .from(units)
      .where(eq(units.id, unitId))
      .limit(1);

    if (!unit) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    }

    // Load all checks for this unit with their questions
    const checks = await db
      .select()
      .from(checksForUnderstanding)
      .where(eq(checksForUnderstanding.unitId, unitId));

    // Load all student submissions for this unit (checks only)
    const submissions = await db
      .select()
      .from(studentSubmissions)
      .where(
        and(
          eq(studentSubmissions.unitId, unitId),
          eq(studentSubmissions.assessmentType, "check")
        )
      );

    // Load all answers for these submissions
    const submissionIds = submissions.map((s) => s.id);
    let allAnswers: Array<{
      id: string;
      submissionId: string;
      questionId: string;
      answer: string;
      isCorrect: boolean | null;
      score: number | null;
      feedback: string | null;
    }> = [];

    if (submissionIds.length > 0) {
      // Fetch answers for each submission
      for (const subId of submissionIds) {
        const answers = await db
          .select()
          .from(studentAnswers)
          .where(eq(studentAnswers.submissionId, subId));
        allAnswers = allAnswers.concat(answers);
      }
    }

    // Build per-check analytics
    const checkResults = [];
    let totalStudentsSet = new Set<string>();
    let overallScoreSum = 0;
    let overallMaxSum = 0;

    for (const check of checks) {
      // Get questions for this check
      const questions = await db
        .select()
        .from(checkQuestions)
        .where(eq(checkQuestions.checkId, check.id));

      // Get submissions for this check
      const checkSubmissions = submissions.filter(
        (s) => s.assessmentId === check.id
      );

      // Track unique students
      for (const sub of checkSubmissions) {
        totalStudentsSet.add(sub.studentName);
      }

      // Calculate average percent for this check
      let checkScoreSum = 0;
      let checkMaxSum = 0;
      for (const sub of checkSubmissions) {
        checkScoreSum += sub.totalScore ?? 0;
        checkMaxSum += sub.maxScore ?? 0;
      }
      overallScoreSum += checkScoreSum;
      overallMaxSum += checkMaxSum;

      const averagePercent =
        checkSubmissions.length > 0 && checkMaxSum > 0
          ? Math.round((checkScoreSum / checkMaxSum) * 100)
          : 0;

      // Per-question breakdown
      const questionBreakdown = questions
        .map((q) => {
          // Get all answers for this question
          const questionAnswers = allAnswers.filter(
            (a) => a.questionId === q.id
          );
          const totalResponses = questionAnswers.length;
          const correctResponses = questionAnswers.filter(
            (a) => a.isCorrect === true
          ).length;
          const percentCorrect =
            totalResponses > 0
              ? Math.round((correctResponses / totalResponses) * 100)
              : 0;

          return {
            questionId: q.id,
            questionText: q.questionText,
            questionType: q.type,
            percentCorrect,
            totalResponses,
            maxPoints: q.points,
          };
        })
        .sort((a, b) => a.percentCorrect - b.percentCorrect); // Lowest first

      checkResults.push({
        id: check.id,
        title: check.title,
        submissionCount: checkSubmissions.length,
        averagePercent,
        questionBreakdown,
      });
    }

    const overallAveragePercent =
      overallMaxSum > 0
        ? Math.round((overallScoreSum / overallMaxSum) * 100)
        : 0;

    return NextResponse.json({
      unit: {
        id: unit.id,
        title: unit.title,
        enduringUnderstanding: unit.enduringUnderstanding,
        standardCodes: unit.standardCodes,
        cognitiveLevel: unit.cognitiveLevel,
      },
      checks: checkResults,
      analytics: {
        totalStudents: totalStudentsSet.size,
        overallAveragePercent,
      },
      submissions: submissions.map((s) => ({
        id: s.id,
        studentName: s.studentName,
        classPeriod: s.classPeriod,
        assessmentId: s.assessmentId,
        totalScore: s.totalScore,
        maxScore: s.maxScore,
        completedAt: s.completedAt,
      })),
      answers: allAnswers.map((a) => ({
        id: a.id,
        submissionId: a.submissionId,
        questionId: a.questionId,
        answer: a.answer,
        isCorrect: a.isCorrect,
        score: a.score,
        feedback: a.feedback,
      })),
    });
  } catch (error) {
    console.error("Failed to load results:", error);
    return NextResponse.json(
      { error: "Failed to load results. Please try again." },
      { status: 500 }
    );
  }
}
