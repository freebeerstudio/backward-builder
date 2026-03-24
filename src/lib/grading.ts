import type { MCOption } from "@/types";

/**
 * Grade a multiple choice answer by comparing the student's selected text
 * to the correct option's text.
 *
 * Returns { isCorrect, score, maxPoints } so the caller can store
 * the result directly on the studentAnswers row.
 */
export function gradeMCAnswer(
  studentAnswer: string,
  options: MCOption[],
  maxPoints: number,
): { isCorrect: boolean; score: number; maxPoints: number } {
  const correctOption = options.find((o) => o.isCorrect);

  if (!correctOption) {
    // Defensive: if no correct option is marked, score 0
    return { isCorrect: false, score: 0, maxPoints };
  }

  const isCorrect =
    studentAnswer.trim().toLowerCase() ===
    correctOption.text.trim().toLowerCase();

  return {
    isCorrect,
    score: isCorrect ? maxPoints : 0,
    maxPoints,
  };
}
