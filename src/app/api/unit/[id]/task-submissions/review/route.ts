import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  studentAnswers,
  studentSubmissions,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { validateUnitOwnership } from "@/lib/auth";

interface CriterionReview {
  answerId: string;
  teacherScore: number;
  teacherNotes?: string;
}

interface ReviewRequest {
  submissionId: string;
  criterionReviews: CriterionReview[];
}

/**
 * POST /api/unit/[id]/task-submissions/review
 *
 * Teacher reviews AI-scored performance task criteria.
 * Updates each criterion answer with teacher score/notes,
 * then recalculates the submission total.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: unitId } = await params;

    // Ownership check: verify the current session owns this unit
    const ownership = await validateUnitOwnership(unitId);
    if (!ownership) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body: ReviewRequest = await request.json();
    const { submissionId, criterionReviews } = body;

    if (!submissionId || !criterionReviews || criterionReviews.length === 0) {
      return NextResponse.json(
        { error: "submissionId and criterionReviews are required." },
        { status: 400 }
      );
    }

    // Verify submission belongs to this unit
    const [submission] = await db
      .select()
      .from(studentSubmissions)
      .where(eq(studentSubmissions.id, submissionId))
      .limit(1);

    if (!submission || submission.unitId !== unitId) {
      return NextResponse.json(
        { error: "Submission not found for this unit." },
        { status: 404 }
      );
    }

    // Update each criterion answer with teacher review
    // NOTE: We keep `score` as the original AI score and store the teacher
    // override in `teacherScore`. The total is recalculated using teacher
    // scores where available, falling back to AI scores.
    for (const review of criterionReviews) {
      await db
        .update(studentAnswers)
        .set({
          teacherScore: review.teacherScore,
          teacherNotes: review.teacherNotes || null,
        })
        .where(eq(studentAnswers.id, review.answerId));
    }

    // Recalculate total score: use teacherScore when present, else AI score
    const allAnswers = await db
      .select()
      .from(studentAnswers)
      .where(eq(studentAnswers.submissionId, submissionId));

    const criterionAnswers = allAnswers.filter((a) => a.criterionName);
    const newTotal = criterionAnswers.reduce(
      (sum, a) => sum + (a.teacherScore ?? a.score ?? 0),
      0
    );

    await db
      .update(studentSubmissions)
      .set({ totalScore: newTotal })
      .where(eq(studentSubmissions.id, submissionId));

    // Return updated submission data
    const updatedCriterionScores = criterionAnswers.map((a) => ({
      answerId: a.id,
      criterionName: a.criterionName!,
      aiScore: a.score,
      aiReasoning: a.aiReasoning || a.feedback,
      teacherScore: a.teacherScore,
      teacherNotes: a.teacherNotes,
      status:
        a.teacherScore !== null
          ? a.teacherScore === a.score
            ? "confirmed"
            : "adjusted"
          : "awaiting_review",
    }));

    return NextResponse.json({
      submissionId,
      totalScore: newTotal,
      maxScore: submission.maxScore,
      criterionScores: updatedCriterionScores,
    });
  } catch (error) {
    console.error("Failed to save review:", error);
    return NextResponse.json(
      { error: "Failed to save review. Please try again." },
      { status: 500 }
    );
  }
}
