import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { assessments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateShareCode } from "@/lib/share-code";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assessmentId } = body;

    if (!assessmentId) {
      return NextResponse.json(
        { error: "Missing required field: assessmentId." },
        { status: 400 }
      );
    }

    // Verify the assessment exists and is in draft status
    const assessment = await db.query.assessments.findFirst({
      where: eq(assessments.id, assessmentId),
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found." },
        { status: 404 }
      );
    }

    if (assessment.status === "published") {
      // Already published — return existing share code
      return NextResponse.json({
        shareCode: assessment.shareCode,
        shareUrl: `/quiz/${assessment.shareCode}`,
      });
    }

    if (assessment.status !== "draft") {
      return NextResponse.json(
        { error: `Cannot publish an assessment with status "${assessment.status}".` },
        { status: 400 }
      );
    }

    // Generate a unique share code
    const shareCode = generateShareCode();

    // Update assessment status and share code
    await db
      .update(assessments)
      .set({
        status: "published",
        shareCode,
        updatedAt: new Date(),
      })
      .where(eq(assessments.id, assessmentId));

    return NextResponse.json({
      shareCode,
      shareUrl: `/quiz/${shareCode}`,
    });
  } catch (error) {
    console.error("Assessment publish error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
