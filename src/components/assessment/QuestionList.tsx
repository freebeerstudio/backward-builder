'use client';

import { useState, useCallback } from 'react';
import { QuestionCard } from './QuestionCard';
import type { Question, QuestionType } from '@/types';

interface QuestionListProps {
  initialQuestions: Question[];
  assessmentId: string;
}

const typeLabels: Record<QuestionType, string> = {
  multiple_choice: 'Multiple Choice',
  document_based: 'Document-Based',
  constructed_response: 'Constructed Response',
};

function QuestionList({ initialQuestions, assessmentId }: QuestionListProps) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  // Count questions by type
  const typeCounts = questions.reduce<Partial<Record<QuestionType, number>>>(
    (acc, q) => {
      acc[q.type] = (acc[q.type] || 0) + 1;
      return acc;
    },
    {}
  );

  const handleUpdate = useCallback((updatedQuestion: Question) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === updatedQuestion.id ? updatedQuestion : q))
    );
  }, []);

  const handleDelete = useCallback((questionId: string) => {
    setQuestions((prev) => {
      const filtered = prev.filter((q) => q.id !== questionId);
      // Re-index after deletion
      return filtered.map((q, i) => ({ ...q, orderIndex: i }));
    });
  }, []);

  const handleMoveUp = useCallback((index: number) => {
    if (index === 0) return;
    setQuestions((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next.map((q, i) => ({ ...q, orderIndex: i }));
    });
  }, []);

  const handleMoveDown = useCallback((index: number) => {
    setQuestions((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next.map((q, i) => ({ ...q, orderIndex: i }));
    });
  }, []);

  if (questions.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-border bg-warmwhite p-12 text-center">
        <p className="text-text-light font-body">
          No questions yet. Go back and generate your assessment.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Summary bar */}
      <div className="flex flex-wrap items-center gap-4 mb-6 rounded-lg bg-card border border-border px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-body text-text-light">Questions:</span>
          <span className="text-sm font-heading font-semibold text-text">
            {questions.length}
          </span>
        </div>
        <div className="w-px h-5 bg-border" />
        <div className="flex items-center gap-2">
          <span className="text-sm font-body text-text-light">Total Points:</span>
          <span className="text-sm font-heading font-semibold text-forest">
            {totalPoints}
          </span>
        </div>
        <div className="w-px h-5 bg-border" />
        <div className="flex flex-wrap items-center gap-3">
          {(Object.entries(typeCounts) as [QuestionType, number][]).map(
            ([type, count]) => (
              <span
                key={type}
                className="text-xs font-body text-text-light"
              >
                {count} {typeLabels[type]}
              </span>
            )
          )}
        </div>
      </div>

      {/* Question cards */}
      <div className="space-y-4">
        {questions.map((q, index) => (
          <QuestionCard
            key={q.id}
            question={q}
            assessmentId={assessmentId}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onMoveUp={() => handleMoveUp(index)}
            onMoveDown={() => handleMoveDown(index)}
            isFirst={index === 0}
            isLast={index === questions.length - 1}
          />
        ))}
      </div>

      {/* Add question placeholder */}
      <div className="mt-4">
        <button
          disabled
          className="w-full rounded-lg border-2 border-dashed border-border bg-warmwhite px-5 py-4 text-sm font-body text-text-light cursor-not-allowed hover:border-forest/30 transition-colors opacity-60"
        >
          + Add Question (coming soon)
        </button>
      </div>
    </div>
  );
}

export { QuestionList, type QuestionListProps };
