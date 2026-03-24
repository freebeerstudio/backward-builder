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
import { generateReteachInsights } from "@/lib/claude";
import { validateUnitOwnership } from "@/lib/auth";

/**
 * GET /api/unit/[id]/results/reteach
 *
 * Generates AI-powered reteaching insights based on student performance data.
 * Identifies the weakest questions and asks Claude to suggest targeted
 * instructional strategies to close the gaps before the performance task.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: unitId } = await params;

    // Ownership check: verify the current session owns this unit
    const ownership = await validateUnitOwnership(unitId);
    if (!ownership) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Load unit for topic context
    const [unit] = await db
      .select()
      .from(units)
      .where(eq(units.id, unitId))
      .limit(1);

    if (!unit) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    }

    // Load all checks for this unit
    const checks = await db
      .select()
      .from(checksForUnderstanding)
      .where(eq(checksForUnderstanding.unitId, unitId));

    // Load all submissions for this unit
    const submissions = await db
      .select()
      .from(studentSubmissions)
      .where(
        and(
          eq(studentSubmissions.unitId, unitId),
          eq(studentSubmissions.assessmentType, "check")
        )
      );

    // Load all answers
    const submissionIds = submissions.map((s) => s.id);
    let allAnswers: Array<{
      questionId: string | null;
      isCorrect: boolean | null;
    }> = [];

    for (const subId of submissionIds) {
      const answers = await db
        .select({
          questionId: studentAnswers.questionId,
          isCorrect: studentAnswers.isCorrect,
        })
        .from(studentAnswers)
        .where(eq(studentAnswers.submissionId, subId));
      allAnswers = allAnswers.concat(answers);
    }

    // Build question analytics for the AI
    const allQuestions = [];
    for (const check of checks) {
      const questions = await db
        .select()
        .from(checkQuestions)
        .where(eq(checkQuestions.checkId, check.id));

      for (const q of questions) {
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

        allQuestions.push({
          questionText: q.questionText,
          percentCorrect,
          type: q.type,
        });
      }
    }

    // If no submissions yet, return a helpful message
    if (submissions.length === 0) {
      return NextResponse.json({
        insights:
          "No student submissions yet. Share your checks for understanding with students, and reteaching insights will appear here once they respond.",
      });
    }

    // Generate AI insights
    const topic = `${unit.title} — ${unit.enduringUnderstanding}`;
    const insights = await generateReteachInsights(allQuestions, topic);

    return NextResponse.json({ insights });
  } catch (error) {
    console.error("Failed to generate reteach insights:", error);
    return NextResponse.json(
      { error: "Failed to generate reteach insights." },
      { status: 500 }
    );
  }
}
