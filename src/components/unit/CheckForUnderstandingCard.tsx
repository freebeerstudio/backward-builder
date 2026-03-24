"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { QuestionType, MCOption } from "@/types";

interface CheckQuestionData {
  id: string;
  type: QuestionType;
  questionText: string;
  points: number;
  options?: MCOption[] | null;
  orderIndex: number;
}

interface CheckData {
  id: string;
  title: string;
  placementNote: string | null;
  totalPoints: number;
  questions: CheckQuestionData[];
}

interface CheckForUnderstandingCardProps {
  check: CheckData;
  className?: string;
}

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"];

/**
 * CheckForUnderstandingCard — Displays a formative check with an expandable
 * question preview. Never call these "quizzes" — UbD terminology matters.
 */
function CheckForUnderstandingCard({
  check,
  className = "",
}: CheckForUnderstandingCardProps) {
  const [expanded, setExpanded] = useState(false);

  const sortedQuestions = [...check.questions].sort(
    (a, b) => a.orderIndex - b.orderIndex
  );

  const mcCount = check.questions.filter(
    (q) => q.type === "selected_response"
  ).length;
  const saCount = check.questions.filter(
    (q) => q.type === "short_answer"
  ).length;

  return (
    <Card
      className={`border border-border transition-all duration-200 ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="check" />
            <h3 className="font-heading text-base font-semibold text-forest-dark">
              {check.title}
            </h3>
          </div>

          {/* Placement note */}
          {check.placementNote && (
            <p className="mt-2 text-sm italic text-text-light leading-relaxed">
              {check.placementNote}
            </p>
          )}

          {/* Stats badges */}
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <Badge
              variant="info"
              label={`${check.questions.length} questions`}
            />
            <Badge
              variant="points"
              label={`${check.totalPoints} pts`}
            />
            {mcCount > 0 && (
              <span className="text-xs text-text-light">
                {mcCount} multiple choice
              </span>
            )}
            {saCount > 0 && (
              <span className="text-xs text-text-light">
                {saCount} short answer
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Expandable question previews */}
      {expanded && (
        <div className="mt-4 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-text-light">
            Question Preview
          </div>
          {sortedQuestions.map((question, index) => (
            <div
              key={question.id}
              className={`
                rounded-lg px-4 py-3 border border-border/50
                ${index % 2 === 0 ? "bg-warmwhite" : "bg-card"}
              `}
            >
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 flex items-center justify-center h-5 w-5 rounded-full bg-forest/10 text-xs font-semibold text-forest">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text leading-relaxed">
                    {question.questionText}
                  </p>

                  {/* MC options */}
                  {question.type === "selected_response" &&
                    question.options && (
                      <div className="mt-2 space-y-1">
                        {question.options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className="flex items-start gap-2 text-sm text-text-light"
                          >
                            <span className="flex-shrink-0 font-mono text-xs font-semibold text-forest/70 mt-0.5">
                              {OPTION_LETTERS[optIndex]}.
                            </span>
                            <span>{option.text}</span>
                          </div>
                        ))}
                      </div>
                    )}

                  {/* Short answer label */}
                  {question.type === "short_answer" && (
                    <div className="mt-1.5">
                      <span className="inline-block rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                        Short answer
                      </span>
                    </div>
                  )}

                  {/* Points */}
                  <div className="mt-1.5 text-xs text-text-light">
                    {question.points} {question.points === 1 ? "pt" : "pts"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Toggle button */}
      <div className="mt-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm font-medium text-forest hover:text-forest-light transition-colors"
        >
          {expanded ? "Hide Questions" : "Preview Questions"}
          <svg
            className={`ml-1 inline h-4 w-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>
    </Card>
  );
}

export {
  CheckForUnderstandingCard,
  type CheckForUnderstandingCardProps,
  type CheckData,
  type CheckQuestionData,
};
