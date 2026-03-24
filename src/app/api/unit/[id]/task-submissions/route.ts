import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  units,
  performanceTasks,
  studentSubmissions,
  studentAnswers,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { validateUnitOwnership } from "@/lib/auth";

/**
 * GET /api/unit/[id]/task-submissions
 *
 * Fetches all performance task submissions for a unit, including
 * criterion-level AI scores and teacher review status.
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

    // Load the unit
    const [unit] = await db
      .select()
      .from(units)
      .where(eq(units.id, unitId))
      .limit(1);

    if (!unit) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    }

    // Load the selected performance task
    const [task] = await db
      .select()
      .from(performanceTasks)
      .where(
        and(
          eq(performanceTasks.unitId, unitId),
          eq(performanceTasks.isSelected, true)
        )
      )
      .limit(1);

    if (!task) {
      return NextResponse.json({
        task: null,
        submissions: [],
        summary: { total: 0, reviewed: 0, averagePercent: 0 },
      });
    }

    // Load all performance task submissions
    const submissions = await db
      .select()
      .from(studentSubmissions)
      .where(
        and(
          eq(studentSubmissions.unitId, unitId),
          eq(studentSubmissions.assessmentType, "performance_task"),
          eq(studentSubmissions.assessmentId, task.id)
        )
      );

    // Load answers for each submission
    const submissionData = [];
    let totalReviewed = 0;
    let scoreSum = 0;
    let maxSum = 0;

    for (const sub of submissions) {
      const answers = await db
        .select()
        .from(studentAnswers)
        .where(eq(studentAnswers.submissionId, sub.id));

      // Build criterion scores from answers that have a criterionName
      const criterionScores = answers
        .filter((a) => a.criterionName)
        .map((a) => {
          const hasTeacherReview = a.teacherScore !== null;
          return {
            answerId: a.id,
            criterionName: a.criterionName!,
            aiScore: a.score,
            aiReasoning: a.aiReasoning || a.feedback,
            teacherScore: a.teacherScore,
            teacherNotes: a.teacherNotes,
            status: hasTeacherReview
              ? a.teacherScore === a.score
                ? "confirmed"
                : "adjusted"
              : "awaiting_review",
          };
        });

      // Check if all criteria have been reviewed
      const allReviewed = criterionScores.length > 0 &&
        criterionScores.every((c) => c.status !== "awaiting_review");
      if (allReviewed) totalReviewed++;

      scoreSum += sub.totalScore ?? 0;
      maxSum += sub.maxScore ?? 0;

      // Get submission content — include the "_submission" marker answer
      // which holds the original student content (text, file ref, or link)
      const contentAnswers = answers.filter(
        (a) => !a.criterionName || a.criterionName === "_submission"
      );
      const submissionContent = contentAnswers.length > 0
        ? contentAnswers.map((a) => a.answer).join("\n")
        : "";

      submissionData.push({
        id: sub.id,
        studentName: sub.studentName,
        classPeriod: sub.classPeriod,
        completedAt: sub.completedAt,
        submissionContent,
        totalScore: sub.totalScore,
        maxScore: sub.maxScore,
        criterionScores,
      });
    }

    const averagePercent =
      maxSum > 0 ? Math.round((scoreSum / maxSum) * 100) : 0;

    return NextResponse.json({
      task: {
        id: task.id,
        title: task.title,
        rubric: task.rubric,
      },
      submissions: submissionData,
      summary: {
        total: submissions.length,
        reviewed: totalReviewed,
        averagePercent,
      },
    });
  } catch (error) {
    console.error("Failed to load task submissions:", error);
    return NextResponse.json(
      { error: "Failed to load task submissions." },
      { status: 500 }
    );
  }
}
