'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PageContainer } from '@/components/layout/PageContainer';
import { Header } from '@/components/layout/Header';

// --- Types ---

interface CriterionScore {
  answerId: string;
  criterionName: string;
  aiScore: number | null;
  aiReasoning: string | null;
  teacherScore: number | null;
  teacherNotes: string | null;
  status: 'awaiting_review' | 'confirmed' | 'adjusted';
}

interface Submission {
  id: string;
  studentName: string;
  classPeriod: string;
  completedAt: string;
  submissionContent: string;
  totalScore: number | null;
  maxScore: number | null;
  criterionScores: CriterionScore[];
}

interface RubricLevel {
  score: number;
  label: string;
  description: string;
}

interface RubricCriterion {
  criterionName: string;
  weight: number;
  levels: RubricLevel[];
}

interface TaskData {
  id: string;
  title: string;
  rubric: RubricCriterion[];
}

interface ReviewData {
  task: TaskData | null;
  submissions: Submission[];
  summary: {
    total: number;
    reviewed: number;
    averagePercent: number;
  };
}

// --- Helpers ---

function scoreBadgeClasses(score: number | null, maxScore: number): string {
  if (score === null) return 'bg-gray-100 text-gray-500 border-gray-200';
  const percent = (score / maxScore) * 100;
  if (percent >= 75) return 'bg-green-50 text-green-700 border-green-200';
  if (percent >= 50) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
  return 'bg-red-50 text-red-700 border-red-200';
}

function statusIcon(status: string): string {
  switch (status) {
    case 'confirmed': return '\u2713';
    case 'adjusted': return '\u2191';
    default: return '\u25CB';
  }
}

function statusLabel(status: string): string {
  switch (status) {
    case 'confirmed': return 'Confirmed';
    case 'adjusted': return 'Adjusted';
    default: return 'Awaiting Review';
  }
}

function statusClasses(status: string): string {
  switch (status) {
    case 'confirmed': return 'text-green-700 bg-green-50';
    case 'adjusted': return 'text-yellow-700 bg-yellow-50';
    default: return 'text-gray-500 bg-gray-50';
  }
}

/**
 * Extract a URL from submission content.
 * Handles both raw URLs and bracketed formats like "[Link Submission: https://...]"
 */
function extractUrl(content: string): string | null {
  // Direct URL
  if (content.trim().startsWith('http')) return content.trim().split(/\s/)[0];
  // Bracketed format: [Link Submission: URL]
  const bracketMatch = content.match(/\[Link Submission:\s*(https?:\/\/[^\]]+)\]/);
  if (bracketMatch) return bracketMatch[1];
  // Any URL in the content
  const urlMatch = content.match(/(https?:\/\/[^\s\]]+)/);
  if (urlMatch) return urlMatch[1];
  return null;
}

/**
 * Detect Google Workspace URL type
 */
function detectGoogleType(url: string): { type: 'doc' | 'slides' | 'sheets'; label: string; icon: string } | null {
  if (url.includes('docs.google.com/document')) return { type: 'doc', label: 'Google Docs', icon: '📄' };
  if (url.includes('docs.google.com/presentation')) return { type: 'slides', label: 'Google Slides', icon: '📊' };
  if (url.includes('docs.google.com/spreadsheets')) return { type: 'sheets', label: 'Google Sheets', icon: '📋' };
  return null;
}

/**
 * Renders submission content with smart link detection.
 * Google Workspace links get a branded "Open Document" button.
 */
function SubmissionContentDisplay({ content }: { content: string }) {
  const url = extractUrl(content);

  if (url) {
    const google = detectGoogleType(url);

    if (google) {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{google.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="font-heading text-sm font-semibold text-text">
                Student submitted via {google.label}
              </p>
              <p className="font-body font-mono text-xs text-text-light truncate">
                {url}
              </p>
            </div>
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-forest px-4 py-2.5 font-heading text-sm font-medium text-white transition-colors hover:bg-forest-light"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Open {google.label}
          </a>
        </div>
      );
    }

    // Non-Google URL
    return (
      <div className="space-y-2">
        <p className="font-heading text-sm font-semibold text-text">
          Student submitted a link
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-forest px-4 py-2.5 font-heading text-sm font-medium text-white transition-colors hover:bg-forest-light"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Open Link
        </a>
        <p className="font-body font-mono text-xs text-text-light break-all">
          {url}
        </p>
      </div>
    );
  }

  // Plain text submission
  return (
    <p className="whitespace-pre-wrap font-body text-sm leading-relaxed text-text">
      {content}
    </p>
  );
}

/**
 * Teacher Performance Task Review — Dual-scoring interface.
 *
 * This is the signature feature: teachers review AI-generated rubric scores
 * per criterion, confirm or adjust each one, and optionally add notes.
 * One-tap confirm makes common cases fast; teacher always has final authority.
 */
export default function ReviewPage() {
  const params = useParams();
  const unitId = params.id as string;

  const [data, setData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Local teacher edits — keyed by answerId
  const [localScores, setLocalScores] = useState<Record<string, number>>({});
  const [localNotes, setLocalNotes] = useState<Record<string, string>>({});
  const [showNotes, setShowNotes] = useState<Record<string, boolean>>({});

  const loadData = useCallback(async () => {
    try {
      const res = await fetch(`/api/unit/${unitId}/task-submissions`);
      if (!res.ok) throw new Error('Failed to load submissions');
      const json: ReviewData = await res.json();
      setData(json);

      // Auto-select first submission
      if (json.submissions.length > 0 && !selectedSubmissionId) {
        setSelectedSubmissionId(json.submissions[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [unitId, selectedSubmissionId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // When a submission is selected, initialize local state from existing data
  useEffect(() => {
    if (!data || !selectedSubmissionId) return;
    const sub = data.submissions.find((s) => s.id === selectedSubmissionId);
    if (!sub) return;

    const scores: Record<string, number> = {};
    const notes: Record<string, string> = {};
    for (const cs of sub.criterionScores) {
      scores[cs.answerId] = cs.teacherScore ?? cs.aiScore ?? 0;
      notes[cs.answerId] = cs.teacherNotes ?? '';
    }
    setLocalScores(scores);
    setLocalNotes(notes);
    setShowNotes({});
    setSaveSuccess(false);
  }, [selectedSubmissionId, data]);

  function handleConfirm(answerId: string, aiScore: number | null) {
    // One-tap confirm: set teacher score = AI score
    setLocalScores((prev) => ({ ...prev, [answerId]: aiScore ?? 0 }));
  }

  function handleScoreChange(answerId: string, score: number) {
    setLocalScores((prev) => ({ ...prev, [answerId]: score }));
  }

  function handleNotesChange(answerId: string, notes: string) {
    setLocalNotes((prev) => ({ ...prev, [answerId]: notes }));
  }

  function toggleNotes(answerId: string) {
    setShowNotes((prev) => ({ ...prev, [answerId]: !prev[answerId] }));
  }

  async function handleSaveAll() {
    if (!selectedSubmissionId || !data) return;
    const sub = data.submissions.find((s) => s.id === selectedSubmissionId);
    if (!sub) return;

    setSaving(true);
    setSaveSuccess(false);

    try {
      const criterionReviews = sub.criterionScores.map((cs) => ({
        answerId: cs.answerId,
        teacherScore: localScores[cs.answerId] ?? cs.aiScore ?? 0,
        teacherNotes: localNotes[cs.answerId] || undefined,
      }));

      const res = await fetch(`/api/unit/${unitId}/task-submissions/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: selectedSubmissionId,
          criterionReviews,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save');
      }

      // Reload data to reflect updates
      await loadData();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save review');
    } finally {
      setSaving(false);
    }
  }

  // --- Loading ---
  if (loading) {
    return (
      <div className="min-h-screen bg-warmwhite">
        <Header />
        <PageContainer wide className="py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-forest border-t-transparent" />
            <p className="font-body text-text-light">Loading submissions...</p>
          </div>
        </PageContainer>
      </div>
    );
  }

  // --- Error ---
  if (error || !data) {
    return (
      <div className="min-h-screen bg-warmwhite">
        <Header />
        <PageContainer wide className="py-12">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="font-heading text-lg font-semibold text-red-800">
              {error || 'Something went wrong'}
            </p>
            <Link
              href={`/unit/${unitId}/results`}
              className="mt-4 inline-block text-sm font-medium text-forest hover:underline"
            >
              Back to Results
            </Link>
          </div>
        </PageContainer>
      </div>
    );
  }

  // --- No task ---
  if (!data.task) {
    return (
      <div className="min-h-screen bg-warmwhite">
        <Header />
        <PageContainer wide className="py-12">
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <h2 className="font-heading text-xl font-bold text-forest-dark">
              No Performance Task Found
            </h2>
            <p className="mt-2 font-body text-text-light">
              Select a performance task in Stage 2 before reviewing submissions.
            </p>
            <Link
              href={`/unit/${unitId}/stage2`}
              className="mt-4 inline-block rounded-lg bg-forest px-6 py-2 font-heading text-sm font-medium text-white hover:bg-forest-light"
            >
              Go to Stage 2
            </Link>
          </div>
        </PageContainer>
      </div>
    );
  }

  // --- No submissions ---
  if (data.submissions.length === 0) {
    return (
      <div className="min-h-screen bg-warmwhite">
        <Header />
        <PageContainer wide className="py-12">
          <div className="mb-6">
            <Link
              href={`/unit/${unitId}/results`}
              className="font-heading text-sm font-medium text-forest hover:underline"
            >
              &larr; Back to Results
            </Link>
          </div>
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-forest/10">
              <svg className="h-8 w-8 text-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
            </div>
            <h2 className="font-heading text-xl font-bold text-forest-dark">
              No Student Submissions Yet
            </h2>
            <p className="mt-2 font-body text-text-light">
              Share the performance task with students. Submissions will appear here for your review.
            </p>
            <Link
              href={`/unit/${unitId}/publish`}
              className="mt-4 inline-block rounded-lg bg-forest px-6 py-2 font-heading text-sm font-medium text-white hover:bg-forest-light"
            >
              Go to Publish
            </Link>
          </div>
        </PageContainer>
      </div>
    );
  }

  const selectedSub = data.submissions.find((s) => s.id === selectedSubmissionId);
  const { task, summary } = data;

  // Get max score per criterion from rubric
  const maxPerCriterion: Record<string, number> = {};
  for (const rc of task.rubric as RubricCriterion[]) {
    const maxLevel = Math.max(...rc.levels.map((l) => l.score));
    maxPerCriterion[rc.criterionName] = maxLevel;
  }

  return (
    <div className="min-h-screen bg-warmwhite">
      <Header />
      <PageContainer wide className="py-8 pb-16">
        {/* Back link */}
        <div className="mb-6">
          <Link
            href={`/unit/${unitId}/results`}
            className="font-heading text-sm font-medium text-forest hover:underline"
          >
            &larr; Back to Results
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-2xl font-bold text-forest-dark sm:text-3xl">
            Performance Task Review
          </h1>
          <p className="mt-1 font-body text-text-light">
            {task.title} — Review AI-scored rubric criteria
          </p>
        </div>

        {/* Summary bar */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <p className="font-body text-xs text-text-light">Total Submissions</p>
            <p className="mt-1 font-heading text-2xl font-bold text-forest-dark">
              {summary.total}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <p className="font-body text-xs text-text-light">Reviewed</p>
            <p className="mt-1 font-heading text-2xl font-bold text-forest">
              {summary.reviewed}
              <span className="text-sm font-normal text-text-light">
                {' '}/ {summary.total}
              </span>
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <p className="font-body text-xs text-text-light">Avg AI Score</p>
            <p className="mt-1 font-heading text-2xl font-bold text-forest-dark">
              {summary.averagePercent}%
            </p>
          </div>
        </div>

        {/* Student selector */}
        <div className="mb-6">
          <label className="mb-2 block font-heading text-sm font-semibold text-text">
            Select Student
          </label>
          <select
            value={selectedSubmissionId ?? ''}
            onChange={(e) => setSelectedSubmissionId(e.target.value)}
            className="w-full rounded-lg border border-border bg-card px-4 py-2.5 font-body text-sm text-text focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20"
          >
            {data.submissions.map((sub) => {
              const reviewedCount = sub.criterionScores.filter(
                (c) => c.status !== 'awaiting_review'
              ).length;
              const totalCriteria = sub.criterionScores.length;
              return (
                <option key={sub.id} value={sub.id}>
                  {sub.studentName} — Period {sub.classPeriod}
                  {totalCriteria > 0 ? ` (${reviewedCount}/${totalCriteria} reviewed)` : ''}
                </option>
              );
            })}
          </select>
        </div>

        {/* Selected submission detail */}
        {selectedSub && (
          <div className="space-y-6">
            {/* Student response */}
            {selectedSub.submissionContent && (
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="mb-3 font-heading text-sm font-semibold uppercase tracking-wide text-text-light">
                  Student Response
                </h3>
                <div className="rounded-lg border border-border bg-warmwhite p-4">
                  <SubmissionContentDisplay content={selectedSub.submissionContent} />
                </div>
              </div>
            )}

            {/* Rubric scoring table — desktop */}
            <div className="hidden rounded-xl border border-border bg-card md:block">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-warmwhite">
                      <th className="px-4 py-3 text-left font-heading text-xs font-semibold uppercase tracking-wide text-text-light">
                        Criterion
                      </th>
                      <th className="px-4 py-3 text-center font-heading text-xs font-semibold uppercase tracking-wide text-text-light">
                        AI Score
                      </th>
                      <th className="px-4 py-3 text-left font-heading text-xs font-semibold uppercase tracking-wide text-text-light">
                        AI Reasoning
                      </th>
                      <th className="px-4 py-3 text-center font-heading text-xs font-semibold uppercase tracking-wide text-text-light">
                        Teacher Score
                      </th>
                      <th className="px-4 py-3 text-center font-heading text-xs font-semibold uppercase tracking-wide text-text-light">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSub.criterionScores.map((cs) => {
                      const maxScore = maxPerCriterion[cs.criterionName] || 4;
                      const currentTeacherScore = localScores[cs.answerId] ?? cs.aiScore ?? 0;
                      const isConfirmedNow = currentTeacherScore === (cs.aiScore ?? 0);

                      return (
                        <tr key={cs.answerId} className="border-b border-border last:border-b-0">
                          {/* Criterion name */}
                          <td className="px-4 py-4">
                            <p className="font-heading text-sm font-semibold text-text">
                              {cs.criterionName}
                            </p>
                          </td>

                          {/* AI Score badge */}
                          <td className="px-4 py-4 text-center">
                            <span
                              className={`inline-flex items-center rounded-full border px-3 py-1 font-heading text-sm font-bold ${scoreBadgeClasses(cs.aiScore, maxScore)}`}
                            >
                              {cs.aiScore ?? '—'}/{maxScore}
                            </span>
                          </td>

                          {/* AI Reasoning */}
                          <td className="max-w-xs px-4 py-4">
                            <p className="font-body text-xs leading-relaxed text-text-light">
                              {cs.aiReasoning
                                ? cs.aiReasoning.length > 200
                                  ? cs.aiReasoning.slice(0, 200) + '...'
                                  : cs.aiReasoning
                                : 'No reasoning provided'}
                            </p>
                          </td>

                          {/* Teacher score dropdown */}
                          <td className="px-4 py-4 text-center">
                            <select
                              value={currentTeacherScore}
                              onChange={(e) =>
                                handleScoreChange(cs.answerId, parseInt(e.target.value))
                              }
                              className="rounded-lg border border-border bg-white px-3 py-2 font-heading text-sm font-bold text-text focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20"
                            >
                              {Array.from({ length: maxScore + 1 }, (_, i) => (
                                <option key={i} value={i}>
                                  {i}/{maxScore}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-4 text-center">
                            <div className="flex flex-col items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleConfirm(cs.answerId, cs.aiScore)}
                                className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 font-heading text-xs font-medium transition-colors ${
                                  isConfirmedNow
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-700'
                                }`}
                              >
                                <span>{isConfirmedNow ? '\u2713' : ''}</span>
                                {isConfirmedNow ? 'Confirmed' : 'Confirm'}
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleNotes(cs.answerId)}
                                className="font-body text-xs text-text-light underline hover:text-forest"
                              >
                                {showNotes[cs.answerId] ? 'Hide notes' : 'Add notes'}
                              </button>
                            </div>

                            {/* Teacher notes */}
                            {showNotes[cs.answerId] && (
                              <textarea
                                value={localNotes[cs.answerId] ?? ''}
                                onChange={(e) => handleNotesChange(cs.answerId, e.target.value)}
                                placeholder="Optional notes..."
                                rows={2}
                                className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-xs text-text focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20"
                              />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Rubric scoring — mobile (stacked cards) */}
            <div className="space-y-4 md:hidden">
              {selectedSub.criterionScores.map((cs) => {
                const maxScore = maxPerCriterion[cs.criterionName] || 4;
                const currentTeacherScore = localScores[cs.answerId] ?? cs.aiScore ?? 0;
                const isConfirmedNow = currentTeacherScore === (cs.aiScore ?? 0);

                return (
                  <div
                    key={cs.answerId}
                    className="rounded-xl border border-border bg-card p-4"
                  >
                    {/* Criterion name + status */}
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="font-heading text-sm font-bold text-text">
                        {cs.criterionName}
                      </h4>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusClasses(cs.status)}`}
                      >
                        {statusIcon(cs.status)} {statusLabel(cs.status)}
                      </span>
                    </div>

                    {/* AI Score */}
                    <div className="mb-3 flex items-center gap-3">
                      <span className="font-body text-xs text-text-light">AI Score:</span>
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-heading text-sm font-bold ${scoreBadgeClasses(cs.aiScore, maxScore)}`}
                      >
                        {cs.aiScore ?? '—'}/{maxScore}
                      </span>
                    </div>

                    {/* AI Reasoning */}
                    {cs.aiReasoning && (
                      <p className="mb-3 rounded-lg bg-warmwhite p-3 font-body text-xs leading-relaxed text-text-light">
                        {cs.aiReasoning}
                      </p>
                    )}

                    {/* Teacher score + confirm */}
                    <div className="flex items-center gap-3">
                      <label className="font-body text-xs text-text-light">Your Score:</label>
                      <select
                        value={currentTeacherScore}
                        onChange={(e) =>
                          handleScoreChange(cs.answerId, parseInt(e.target.value))
                        }
                        className="rounded-lg border border-border bg-white px-3 py-1.5 font-heading text-sm font-bold text-text focus:border-forest focus:outline-none"
                      >
                        {Array.from({ length: maxScore + 1 }, (_, i) => (
                          <option key={i} value={i}>
                            {i}/{maxScore}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => handleConfirm(cs.answerId, cs.aiScore)}
                        className={`rounded-lg px-3 py-1.5 font-heading text-xs font-medium transition-colors ${
                          isConfirmedNow
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-green-50'
                        }`}
                      >
                        {isConfirmedNow ? '\u2713 Confirmed' : 'Confirm'}
                      </button>
                    </div>

                    {/* Notes toggle */}
                    <button
                      type="button"
                      onClick={() => toggleNotes(cs.answerId)}
                      className="mt-2 font-body text-xs text-text-light underline hover:text-forest"
                    >
                      {showNotes[cs.answerId] ? 'Hide notes' : 'Add notes'}
                    </button>
                    {showNotes[cs.answerId] && (
                      <textarea
                        value={localNotes[cs.answerId] ?? ''}
                        onChange={(e) => handleNotesChange(cs.answerId, e.target.value)}
                        placeholder="Optional teacher notes..."
                        rows={2}
                        className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 font-body text-xs text-text focus:border-forest focus:outline-none"
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Save button */}
            <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
              <div>
                {saveSuccess && (
                  <p className="font-body text-sm font-medium text-green-700">
                    Reviews saved successfully!
                  </p>
                )}
                {error && (
                  <p className="font-body text-sm text-red-600">{error}</p>
                )}
              </div>
              <button
                type="button"
                onClick={handleSaveAll}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-forest px-6 py-3 font-heading text-sm font-bold text-white transition-colors hover:bg-forest-light disabled:opacity-50"
              >
                {saving && (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {saving ? 'Saving...' : 'Save All Reviews'}
              </button>
            </div>
          </div>
        )}

        {/* Footer nav */}
        <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
          <Link
            href={`/unit/${unitId}/results`}
            className="font-heading text-sm font-medium text-forest hover:underline"
          >
            &larr; Back to Results
          </Link>
          <Link
            href="/"
            className="font-heading text-sm font-medium text-text-light hover:text-forest"
          >
            Home
          </Link>
        </div>
      </PageContainer>
    </div>
  );
}
