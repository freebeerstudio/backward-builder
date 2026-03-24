import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  checksForUnderstanding,
  checkQuestions,
  units,
} from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import type { MCOption } from "@/types";

/**
 * GET /api/check/[shareCode]
 *
 * Public endpoint — fetches a live Check for Understanding by share code.
 * Strips isCorrect from MC options so students can't cheat via devtools.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ shareCode: string }> }
) {
  try {
    const { shareCode } = await params;

    // Look up check by shareCode
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

    // Load parent unit for title context
    const [unit] = await db
      .select({ title: units.title })
      .from(units)
      .where(eq(units.id, check.unitId))
      .limit(1);

    // Load questions ordered by orderIndex
    const questions = await db
      .select()
      .from(checkQuestions)
      .where(eq(checkQuestions.checkId, check.id))
      .orderBy(asc(checkQuestions.orderIndex));

    // Strip isCorrect from MC options
    const safeQuestions = questions.map((q) => ({
      id: q.id,
      type: q.type,
      orderIndex: q.orderIndex,
      questionText: q.questionText,
      points: q.points,
      ...(q.options
        ? {
            options: (q.options as MCOption[]).map((opt) => ({
              text: opt.text,
            })),
          }
        : {}),
    }));

    return NextResponse.json({
      check: {
        id: check.id,
        title: check.title,
        unitTitle: unit?.title || "Untitled Unit",
      },
      questions: safeQuestions,
    });
  } catch (error) {
    console.error("Failed to fetch check:", error);
    return NextResponse.json(
      { error: "Failed to load check" },
      { status: 500 }
    );
  }
}
