'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { Question, MCOption, RubricLevel } from '@/types';

interface QuestionCardProps {
  question: Question;
  assessmentId: string;
  onUpdate: (updatedQuestion: Question) => void;
  onDelete: (questionId: string) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

type CardMode = 'display' | 'edit' | 'regenerate';

function QuestionCard({
  question,
  assessmentId,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst = false,
  isLast = false,
}: QuestionCardProps) {
  const [mode, setMode] = useState<CardMode>('display');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSampleAnswer, setShowSampleAnswer] = useState(false);

  // Edit state
  const [editText, setEditText] = useState(question.questionText);
  const [editPoints, setEditPoints] = useState(question.points);
  const [editOptions, setEditOptions] = useState<MCOption[]>(
    (question.options as MCOption[] | undefined) ?? []
  );

  // Regenerate state
  const [feedback, setFeedback] = useState('');

  function resetEditState() {
    setEditText(question.questionText);
    setEditPoints(question.points);
    setEditOptions((question.options as MCOption[] | undefined) ?? []);
    setError(null);
  }

  function handleStartEdit() {
    resetEditState();
    setMode('edit');
  }

  function handleCancelEdit() {
    setMode('display');
    setError(null);
  }

  function handleStartRegenerate() {
    setFeedback('');
    setMode('regenerate');
    setError(null);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    try {
      const updates: Record<string, unknown> = {
        questionText: editText,
        points: editPoints,
      };

      if (question.type === 'multiple_choice') {
        updates.options = editOptions;
      }

      const res = await fetch('/api/question/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: question.id, updates }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save changes.');
      }

      const updated = await res.json();
      onUpdate({
        ...question,
        ...updated,
        assessmentId: question.assessmentId,
      });
      setMode('display');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  }

  async function handleRegenerate() {
    if (!feedback.trim()) return;

    setRegenerating(true);
    setError(null);

    try {
      const res = await fetch('/api/question/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: question.id, feedback }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to regenerate question.');
      }

      const updated = await res.json();
      onUpdate({
        ...question,
        ...updated,
        assessmentId: question.assessmentId,
      });
      setFeedback('');
      setMode('display');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate question.');
    } finally {
      setRegenerating(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this question?')) return;

    setDeleting(true);
    setError(null);

    try {
      onDelete(question.id);
    } catch {
      setError('Failed to delete question.');
    } finally {
      setDeleting(false);
    }
  }

  function handleOptionTextChange(index: number, text: string) {
    setEditOptions((prev) =>
      prev.map((opt, i) => (i === index ? { ...opt, text } : opt))
    );
  }

  function handleCorrectAnswerChange(index: number) {
    setEditOptions((prev) =>
      prev.map((opt, i) => ({ ...opt, isCorrect: i === index }))
    );
  }

  const options = question.options as MCOption[] | undefined;
  const rubric = question.rubric as RubricLevel[] | undefined;
  const scaffolding = question.scaffoldingQuestions as string[] | undefined;
  const letterLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  return (
    <Card className="relative">
      {/* Header: Type badge, points, question number */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-heading font-semibold text-text-light">
            Q{question.orderIndex + 1}
          </span>
          <Badge variant={question.type} />
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block rounded-full bg-forest/10 px-3 py-0.5 text-xs font-medium font-body text-forest">
            {question.points} {question.points === 1 ? 'pt' : 'pts'}
          </span>
          {/* Reorder buttons */}
          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={onMoveUp}
              disabled={isFirst}
              className="p-1 rounded text-text-light hover:text-forest hover:bg-forest/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Move up"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <button
              onClick={onMoveDown}
              disabled={isLast}
              className="p-1 rounded text-text-light hover:text-forest hover:bg-forest/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Move down"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-body">
          {error}
        </div>
      )}

      {/* DISPLAY MODE */}
      {mode === 'display' && (
        <>
          {/* Question text */}
          <p className="text-base font-body text-text leading-relaxed mb-4">
            {question.questionText}
          </p>

          {/* MC options */}
          {question.type === 'multiple_choice' && options && (
            <div className="space-y-2 mb-4">
              {options.map((opt, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 rounded-lg px-4 py-2.5 text-sm font-body ${
                    opt.isCorrect
                      ? 'bg-green-50 border border-green-200 text-green-800'
                      : 'bg-warmwhite border border-border text-text'
                  }`}
                >
                  <span className="font-semibold text-text-light mt-0.5">
                    {letterLabels[i]}.
                  </span>
                  <span className="flex-1">{opt.text}</span>
                  {opt.isCorrect && (
                    <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* DBQ source document */}
          {question.type === 'document_based' && question.sourceDocument && (
            <div className="mb-4">
              <p className="text-xs font-medium text-text-light font-body uppercase tracking-wide mb-2">
                Source Document
              </p>
              <blockquote className="border-l-4 border-forest/30 bg-warmwhite rounded-r-lg pl-4 pr-4 py-3 text-sm font-body text-text italic leading-relaxed">
                {question.sourceDocument}
              </blockquote>
              {question.sourceAttribution && (
                <p className="text-xs text-text-light font-body mt-1.5 ml-4">
                  -- {question.sourceAttribution}
                </p>
              )}
            </div>
          )}

          {/* Scaffolding questions (DBQ) */}
          {scaffolding && scaffolding.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-text-light font-body uppercase tracking-wide mb-2">
                Scaffolding Questions
              </p>
              <ol className="list-decimal list-inside space-y-1.5 text-sm font-body text-text pl-2">
                {scaffolding.map((sq, i) => (
                  <li key={i}>{sq}</li>
                ))}
              </ol>
            </div>
          )}

          {/* Rubric (DBQ + CR) */}
          {rubric && rubric.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-text-light font-body uppercase tracking-wide mb-2">
                Rubric
              </p>
              <div className="space-y-1.5">
                {rubric.map((level, i) => (
                  <div key={i} className="flex gap-3 text-sm font-body">
                    <span className="font-semibold text-forest whitespace-nowrap">
                      {level.score} {level.score === 1 ? 'pt' : 'pts'}:
                    </span>
                    <span className="text-text">{level.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sample answer (collapsed) */}
          {question.sampleAnswer && (
            <div className="mb-4">
              <button
                onClick={() => setShowSampleAnswer(!showSampleAnswer)}
                className="flex items-center gap-1.5 text-xs font-medium text-forest hover:text-forest-light font-body transition-colors"
              >
                <svg
                  className={`w-3.5 h-3.5 transition-transform ${showSampleAnswer ? 'rotate-90' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                Sample Answer
              </button>
              {showSampleAnswer && (
                <div className="mt-2 rounded-lg bg-warmwhite border border-border px-4 py-3 text-sm font-body text-text leading-relaxed">
                  {question.sampleAnswer}
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <Button variant="ghost" size="sm" onClick={handleStartEdit}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </Button>
            <Button variant="ghost" size="sm" onClick={handleStartRegenerate}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Regenerate
            </Button>
            <div className="flex-1" />
            <Button variant="ghost" size="sm" onClick={handleDelete} loading={deleting} className="text-red-600 hover:bg-red-50 hover:text-red-700">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </Button>
          </div>
        </>
      )}

      {/* EDIT MODE */}
      {mode === 'edit' && (
        <>
          <div className="space-y-4 mb-4">
            <Textarea
              label="Question Text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={3}
              autoResize
            />

            <Input
              label="Points"
              type="number"
              min={1}
              max={100}
              value={editPoints}
              onChange={(e) => setEditPoints(Number(e.target.value))}
              className="max-w-[120px]"
            />

            {/* MC options editing */}
            {question.type === 'multiple_choice' && editOptions.length > 0 && (
              <div>
                <p className="text-sm font-medium text-text font-body mb-2">
                  Answer Choices
                </p>
                <div className="space-y-2">
                  {editOptions.map((opt, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name={`correct-${question.id}`}
                        checked={opt.isCorrect}
                        onChange={() => handleCorrectAnswerChange(i)}
                        className="w-4 h-4 text-forest accent-forest"
                      />
                      <span className="text-sm font-semibold text-text-light w-5">
                        {letterLabels[i]}.
                      </span>
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => handleOptionTextChange(i, e.target.value)}
                        className="flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm text-text font-body focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-text-light font-body mt-1.5">
                  Select the radio button next to the correct answer.
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <Button variant="primary" size="sm" onClick={handleSave} loading={saving}>
              Save Changes
            </Button>
            <Button variant="ghost" size="sm" onClick={handleCancelEdit} disabled={saving}>
              Cancel
            </Button>
          </div>
        </>
      )}

      {/* REGENERATE MODE */}
      {mode === 'regenerate' && (
        <>
          <p className="text-sm font-body text-text mb-2 leading-relaxed">
            Current: &ldquo;{question.questionText.slice(0, 120)}
            {question.questionText.length > 120 ? '...' : ''}&rdquo;
          </p>

          <div className="space-y-3 mb-4">
            <Input
              label="What should I change?"
              placeholder="e.g., Make it more challenging, focus on cause and effect, add a primary source..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && feedback.trim()) handleRegenerate();
              }}
            />
          </div>

          {regenerating && (
            <div className="py-4">
              <LoadingSpinner size="sm" message="Regenerating question..." />
            </div>
          )}

          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <Button
              variant="accent"
              size="sm"
              onClick={handleRegenerate}
              loading={regenerating}
              disabled={!feedback.trim()}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Regenerate
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setMode('display')} disabled={regenerating}>
              Cancel
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}

export { QuestionCard, type QuestionCardProps };
