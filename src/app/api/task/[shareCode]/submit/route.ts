import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  performanceTasks,
  units,
  studentSubmissions,
  studentAnswers,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { scorePerformanceTask } from "@/lib/claude";
import { fetchGoogleDocContent, parseGoogleUrl } from "@/lib/google-docs";
import type { RubricCriterion } from "@/types";

/**
 * POST /api/task/[shareCode]/submit
 *
 * Submits a student's performance task response, runs AI criterion-level
 * scoring synchronously, and returns the scores with per-criterion reasoning.
 *
 * This is the WOW feature — instant AI scoring with specific evidence.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ shareCode: string }> }
) {
  try {
    const { shareCode } = await params;
    const body = await request.json();
    const { studentName, classPeriod, submissionType, content, fileName } = body;

    // --- Validate inputs ---

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
    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json(
        { error: "Submission content is required" },
        { status: 400 }
      );
    }
    if (!["text", "file", "link"].includes(submissionType)) {
      return NextResponse.json(
        { error: "Invalid submission type" },
        { status: 400 }
      );
    }

    // --- Look up task by shareCode, verify "live" ---

    const [task] = await db
      .select()
      .from(performanceTasks)
      .where(eq(performanceTasks.shareCode, shareCode))
      .limit(1);

    if (!task || task.status !== "live") {
      return NextResponse.json(
        { error: "Performance task not found or not available" },
        { status: 404 }
      );
    }

    // Get the unit for unitId
    const [unit] = await db
      .select({ id: units.id })
      .from(units)
      .where(eq(units.id, task.unitId))
      .limit(1);

    if (!unit) {
      return NextResponse.json(
        { error: "Unit not found" },
        { status: 500 }
      );
    }

    // --- Create student submission record ---

    const [submission] = await db
      .insert(studentSubmissions)
      .values({
        unitId: unit.id,
        assessmentType: "performance_task",
        assessmentId: task.id,
        studentName: studentName.trim(),
        classPeriod: classPeriod.trim(),
      })
      .returning();

    // --- Store the student's response as a primary answer record ---

    const answerContent =
      submissionType === "file"
        ? `[File Upload: ${fileName || "uploaded-file"}]\n${content}`
        : submissionType === "link"
          ? `[Link Submission: ${content}]`
          : content;

    await db.insert(studentAnswers).values({
      submissionId: submission.id,
      questionId: null,
      answer: answerContent,
      isCorrect: null,
      score: null,
      feedback: null,
      criterionName: "_submission", // marker for the raw submission content
      aiReasoning: null,
    });

    // --- Run AI scoring against each rubric criterion ---

    const rubric = task.rubric as RubricCriterion[];

    // For link submissions, try to fetch the actual document content.
    // This is critical for Google Docs/Slides/Sheets — without reading
    // the content, the AI can't score against the rubric.
    let responseForScoring: string;

    if (submissionType === "link") {
      const googleParsed = parseGoogleUrl(content);
      if (googleParsed) {
        const docContent = await fetchGoogleDocContent(content);
        if (docContent) {
          responseForScoring = `[Student submitted via Google ${
            googleParsed.type === "doc" ? "Docs" :
            googleParsed.type === "slides" ? "Slides" : "Sheets"
          }]\n\n--- DOCUMENT CONTENT ---\n\n${docContent}\n\n--- END DOCUMENT CONTENT ---`;
        } else {
          // Document not publicly accessible — tell the AI what we know
          responseForScoring = `Student submitted a Google ${
            googleParsed.type === "doc" ? "Docs document" :
            googleParsed.type === "slides" ? "Slides presentation" : "Sheets spreadsheet"
          } at: ${content}\n\nNote: The document could not be read automatically. It may not be shared publicly. Please score based on any available information, or mark criteria as "Pending" if the content cannot be evaluated.`;
        }
      } else {
        // Non-Google link — pass the URL
        responseForScoring = `Student submitted a link to their work: ${content}`;
      }
    } else {
      responseForScoring = content;
    }

    let criterionScores;
    try {
      const result = await scorePerformanceTask(
        task.description,
        task.scenario,
        rubric,
        responseForScoring,
        submissionType as "text" | "file" | "link"
      );
      criterionScores = result.criterionScores;
    } catch (aiError) {
      console.error("AI scoring failed:", aiError);
      // Graceful fallback — submission is saved even if AI scoring fails
      criterionScores = rubric.map((c) => ({
        criterionName: c.criterionName,
        score: 0,
        maxScore: 4,
        label: "Pending",
        reasoning: "AI scoring unavailable. Your teacher will review and score this criterion manually.",
      }));
    }

    // --- Create one studentAnswer record per rubric criterion ---

    let totalScore = 0;
    let maxScore = 0;

    const criterionAnswers = criterionScores.map((cs) => {
      totalScore += cs.score;
      maxScore += cs.maxScore;
      return {
        submissionId: submission.id,
        questionId: null,
        answer: answerContent, // reference back to the submission content
        isCorrect: null,
        score: cs.score,
        feedback: cs.label,
        criterionName: cs.criterionName,
        aiReasoning: cs.reasoning,
      };
    });

    if (criterionAnswers.length > 0) {
      await db.insert(studentAnswers).values(criterionAnswers);
    }

    // --- Update submission totals ---

    await db
      .update(studentSubmissions)
      .set({ totalScore, maxScore })
      .where(eq(studentSubmissions.id, submission.id));

    return NextResponse.json({
      submissionId: submission.id,
      totalScore,
      maxScore,
      criterionScores,
    });
  } catch (error) {
    console.error("Failed to submit performance task:", error);
    return NextResponse.json(
      { error: "Failed to submit. Please try again." },
      { status: 500 }
    );
  }
}
