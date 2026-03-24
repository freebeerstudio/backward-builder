import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { assessments, questions, studentSubmissions, studentAnswers } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ assessmentId: string }> }
) {
  try {
    const { assessmentId } = await params;

    // Fetch the assessment
    const assessment = await db.query.assessments.findFirst({
      where: eq(assessments.id, assessmentId),
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found." },
        { status: 404 }
      );
    }

    // Fetch all questions ordered by orderIndex
    const assessmentQuestions = await db.query.questions.findMany({
      where: eq(questions.assessmentId, assessmentId),
      orderBy: [asc(questions.orderIndex)],
    });

    // Fetch all submissions for this assessment
    const submissions = await db.query.studentSubmissions.findMany({
      where: eq(studentSubmissions.assessmentId, assessmentId),
    });

    // Fetch all answers for each submission
    const submissionsWithAnswers = await Promise.all(
      submissions.map(async (sub) => {
        const answers = await db.query.studentAnswers.findMany({
          where: eq(studentAnswers.submissionId, sub.id),
        });

        // Map answers to include question details
        const enrichedAnswers = answers.map((ans) => {
          const question = assessmentQuestions.find((q) => q.id === ans.questionId);
          return {
            questionId: ans.questionId,
            questionText: question?.questionText ?? "",
            questionType: question?.type ?? "multiple_choice",
            answer: ans.answer,
            isCorrect: ans.isCorrect,
            score: ans.score,
            feedback: ans.feedback,
            maxPoints: question?.points ?? 0,
          };
        });

        return {
          id: sub.id,
          studentName: sub.studentName,
          classPeriod: sub.classPeriod,
          totalScore: sub.totalScore,
          maxScore: sub.maxScore,
          completedAt: sub.completedAt,
          answers: enrichedAnswers,
        };
      })
    );

    // Calculate analytics
    const submissionCount = submissions.length;
    const scores = submissions
      .map((s) => s.totalScore)
      .filter((s): s is number => s !== null);

    const averageScore = scores.length > 0
      ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
      : 0;
    const highScore = scores.length > 0 ? Math.max(...scores) : 0;
    const lowScore = scores.length > 0 ? Math.min(...scores) : 0;

    const maxPossible = assessment.totalPoints ?? assessmentQuestions.reduce((sum, q) => sum + q.points, 0);
    const averagePercent = maxPossible > 0 && scores.length > 0
      ? Math.round((averageScore / maxPossible) * 100)
      : 0;

    // Per-question breakdown
    const questionBreakdown = assessmentQuestions.map((q) => {
      // Collect all answers for this question across all submissions
      const answersForQuestion = submissionsWithAnswers.flatMap((sub) =>
        sub.answers.filter((a) => a.questionId === q.id)
      );

      const totalResponses = answersForQuestion.length;

      if (q.type === "multiple_choice") {
        const correctCount = answersForQuestion.filter((a) => a.isCorrect === true).length;
        const percentCorrect = totalResponses > 0
          ? Math.round((correctCount / totalResponses) * 100)
          : 0;

        return {
          questionId: q.id,
          questionText: q.questionText,
          questionType: q.type,
          maxPoints: q.points,
          averageScore: totalResponses > 0
            ? Math.round((correctCount / totalResponses) * q.points * 10) / 10
            : 0,
          percentCorrect,
          totalResponses,
        };
      } else {
        // CR / DBQ — use average score
        const scoredAnswers = answersForQuestion
          .map((a) => a.score)
          .filter((s): s is number => s !== null);
        const avgScore = scoredAnswers.length > 0
          ? Math.round((scoredAnswers.reduce((a, b) => a + b, 0) / scoredAnswers.length) * 10) / 10
          : 0;
        const percentCorrect = q.points > 0 && scoredAnswers.length > 0
          ? Math.round((avgScore / q.points) * 100)
          : 0;

        return {
          questionId: q.id,
          questionText: q.questionText,
          questionType: q.type,
          maxPoints: q.points,
          averageScore: avgScore,
          percentCorrect,
          totalResponses,
        };
      }
    });

    return NextResponse.json({
      assessment: {
        id: assessment.id,
        title: assessment.title,
        description: assessment.description,
        gradeLevel: assessment.gradeLevel,
        topic: assessment.topic,
        totalPoints: maxPossible,
        questionCount: assessmentQuestions.length,
        shareCode: assessment.shareCode,
      },
      submissions: submissionsWithAnswers,
      analytics: {
        averageScore,
        highScore,
        lowScore,
        submissionCount,
        averagePercent,
        questionBreakdown,
      },
    });
  } catch (error) {
    console.error("Results fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch results." },
      { status: 500 }
    );
  }
}
