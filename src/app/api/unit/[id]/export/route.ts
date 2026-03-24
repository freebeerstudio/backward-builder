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
import { validateUnitOwnership } from "@/lib/auth";

/**
 * GET /api/unit/[id]/export?format=csv|summary
 *
 * Exports results data in CSV (for gradebook import) or JSON summary
 * (for a printable report). CSV is the default format.
 */
export async function GET(
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

    const url = new URL(request.url);
    const format = url.searchParams.get("format") || "csv";

    // Load unit
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

    // Load all check submissions
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
      id: string;
      submissionId: string;
      questionId: string | null;
      isCorrect: boolean | null;
      score: number | null;
    }> = [];

    for (const subId of submissionIds) {
      const answers = await db
        .select({
          id: studentAnswers.id,
          submissionId: studentAnswers.submissionId,
          questionId: studentAnswers.questionId,
          isCorrect: studentAnswers.isCorrect,
          score: studentAnswers.score,
        })
        .from(studentAnswers)
        .where(eq(studentAnswers.submissionId, subId));
      allAnswers = allAnswers.concat(answers);
    }

    // Load all questions for analytics
    const allQuestions: Array<{
      id: string;
      checkId: string;
      type: string;
      orderIndex: number;
      questionText: string;
      points: number;
      options: unknown;
      correctAnswer: string | null;
      createdAt: Date;
      checkTitle: string;
    }> = [];
    for (const check of checks) {
      const questions = await db
        .select()
        .from(checkQuestions)
        .where(eq(checkQuestions.checkId, check.id));
      allQuestions.push(
        ...questions.map((q) => ({ ...q, checkTitle: check.title }))
      );
    }

    // -----------------------------------------------------------------------
    // CSV FORMAT — for gradebook import
    // -----------------------------------------------------------------------
    if (format === "csv") {
      // Group submissions by student (using studentName + classPeriod as key)
      const studentMap = new Map<
        string,
        {
          studentName: string;
          classPeriod: string;
          checkScores: Map<string, { score: number; maxScore: number }>;
        }
      >();

      for (const sub of submissions) {
        const key = `${sub.studentName}__${sub.classPeriod}`;
        if (!studentMap.has(key)) {
          studentMap.set(key, {
            studentName: sub.studentName,
            classPeriod: sub.classPeriod,
            checkScores: new Map(),
          });
        }
        const student = studentMap.get(key)!;
        // If a student took the same check twice, keep the latest (higher ID = later)
        student.checkScores.set(sub.assessmentId, {
          score: sub.totalScore ?? 0,
          maxScore: sub.maxScore ?? 0,
        });
      }

      // Build CSV headers
      const checkTitles = checks.map((c) => c.title);
      const headers = [
        "Student Name",
        "Class Period",
        ...checkTitles,
        "Total Score",
        "Percentage",
      ];

      // Build CSV rows
      const rows: string[][] = [];
      for (const student of studentMap.values()) {
        let totalScore = 0;
        let totalMax = 0;
        const checkCols: string[] = [];

        for (const check of checks) {
          const result = student.checkScores.get(check.id);
          if (result) {
            checkCols.push(`${result.score}/${result.maxScore}`);
            totalScore += result.score;
            totalMax += result.maxScore;
          } else {
            checkCols.push("—");
          }
        }

        const percentage =
          totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;

        rows.push([
          student.studentName,
          student.classPeriod,
          ...checkCols,
          `${totalScore}/${totalMax}`,
          `${percentage}%`,
        ]);
      }

      // Sort by student name
      rows.sort((a, b) => a[0].localeCompare(b[0]));

      // Build CSV string
      const escapeCsv = (value: string) => {
        if (value.includes(",") || value.includes('"') || value.includes("\n")) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      };

      const csvLines = [
        headers.map(escapeCsv).join(","),
        ...rows.map((row) => row.map(escapeCsv).join(",")),
      ];
      const csvContent = csvLines.join("\n");

      const sanitizedTitle = unit.title
        .replace(/[^a-zA-Z0-9 ]/g, "")
        .replace(/\s+/g, "-")
        .toLowerCase();

      return new Response(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${sanitizedTitle}-results.csv"`,
        },
      });
    }

    // -----------------------------------------------------------------------
    // SUMMARY FORMAT — JSON for printable report
    // -----------------------------------------------------------------------
    if (format === "summary") {
      // Per-check summary
      const checkSummaries = checks.map((check) => {
        const checkSubs = submissions.filter(
          (s) => s.assessmentId === check.id
        );
        let scoreSum = 0;
        let maxSum = 0;
        for (const sub of checkSubs) {
          scoreSum += sub.totalScore ?? 0;
          maxSum += sub.maxScore ?? 0;
        }
        const averagePercent =
          checkSubs.length > 0 && maxSum > 0
            ? Math.round((scoreSum / maxSum) * 100)
            : 0;

        // Per-question breakdown
        const questions = allQuestions.filter(
          (q) => q.checkTitle === check.title
        );
        const questionBreakdown = questions.map((q) => {
          const qAnswers = allAnswers.filter((a) => a.questionId === q.id);
          const totalResponses = qAnswers.length;
          const correctResponses = qAnswers.filter(
            (a) => a.isCorrect === true
          ).length;
          return {
            questionText: q.questionText,
            type: q.type,
            percentCorrect:
              totalResponses > 0
                ? Math.round((correctResponses / totalResponses) * 100)
                : 0,
            totalResponses,
          };
        });

        return {
          title: check.title,
          submissionCount: checkSubs.length,
          averagePercent,
          questionBreakdown,
        };
      });

      // Per-student scores
      const studentScores = submissions
        .map((sub) => ({
          studentName: sub.studentName,
          classPeriod: sub.classPeriod,
          checkTitle:
            checks.find((c) => c.id === sub.assessmentId)?.title ?? "Unknown",
          score: sub.totalScore ?? 0,
          maxScore: sub.maxScore ?? 0,
          percentage:
            sub.maxScore && sub.maxScore > 0
              ? Math.round(((sub.totalScore ?? 0) / sub.maxScore) * 100)
              : 0,
        }))
        .sort((a, b) => a.studentName.localeCompare(b.studentName));

      // Overall analytics
      const uniqueStudents = new Set(submissions.map((s) => s.studentName));
      let overallScore = 0;
      let overallMax = 0;
      for (const sub of submissions) {
        overallScore += sub.totalScore ?? 0;
        overallMax += sub.maxScore ?? 0;
      }

      return NextResponse.json({
        unit: {
          title: unit.title,
          enduringUnderstanding: unit.enduringUnderstanding,
          standardCodes: unit.standardCodes,
          cognitiveLevel: unit.cognitiveLevel,
        },
        analytics: {
          totalStudents: uniqueStudents.size,
          totalSubmissions: submissions.length,
          overallAveragePercent:
            overallMax > 0
              ? Math.round((overallScore / overallMax) * 100)
              : 0,
        },
        checks: checkSummaries,
        students: studentScores,
        exportedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      { error: 'Invalid format. Use ?format=csv or ?format=summary' },
      { status: 400 }
    );
  } catch (error) {
    console.error("Failed to export results:", error);
    return NextResponse.json(
      { error: "Failed to export results. Please try again." },
      { status: 500 }
    );
  }
}
