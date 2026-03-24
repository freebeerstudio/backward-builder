import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { assessments, questions, studentSubmissions, studentAnswers } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { generateReteachInsights } from "@/lib/claude";

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

    // Fetch all questions
    const assessmentQuestions = await db.query.questions.findMany({
      where: eq(questions.assessmentId, assessmentId),
      orderBy: [asc(questions.orderIndex)],
    });

    // Fetch all submissions
    const submissions = await db.query.studentSubmissions.findMany({
      where: eq(studentSubmissions.assessmentId, assessmentId),
    });

    if (submissions.length === 0) {
      return NextResponse.json({
        insights: "No student submissions yet. Results will appear here once students complete the assessment.",
      });
    }

    // Calculate per-question percent correct
    const questionsWithStats = await Promise.all(
      assessmentQuestions.map(async (q) => {
        // Get all answers for this question across submissions
        const allAnswers = await Promise.all(
          submissions.map(async (sub) => {
            const answers = await db.query.studentAnswers.findMany({
              where: eq(studentAnswers.submissionId, sub.id),
            });
            return answers.find((a) => a.questionId === q.id);
          })
        );

        const validAnswers = allAnswers.filter(
          (a): a is NonNullable<typeof a> => a !== undefined
        );
        const totalResponses = validAnswers.length;

        let percentCorrect = 0;
        if (q.type === "multiple_choice") {
          const correctCount = validAnswers.filter((a) => a.isCorrect === true).length;
          percentCorrect = totalResponses > 0
            ? Math.round((correctCount / totalResponses) * 100)
            : 0;
        } else {
          const scoredAnswers = validAnswers
            .map((a) => a.score)
            .filter((s): s is number => s !== null);
          const avgScore = scoredAnswers.length > 0
            ? scoredAnswers.reduce((a, b) => a + b, 0) / scoredAnswers.length
            : 0;
          percentCorrect = q.points > 0 && scoredAnswers.length > 0
            ? Math.round((avgScore / q.points) * 100)
            : 0;
        }

        return {
          questionText: q.questionText,
          percentCorrect,
          type: q.type,
        };
      })
    );

    const insights = await generateReteachInsights(
      questionsWithStats,
      assessment.topic ?? "the assessed topic"
    );

    return NextResponse.json({ insights });
  } catch (error) {
    console.error("Reteach insights error:", error);
    return NextResponse.json(
      { insights: "Unable to generate reteaching insights at this time. Review the per-question breakdown to identify areas for reteaching." },
      { status: 200 }
    );
  }
}
