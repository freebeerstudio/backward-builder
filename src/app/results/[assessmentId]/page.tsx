'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// --- Types ---

interface AnswerDetail {
  questionId: string;
  questionText: string;
  questionType: 'multiple_choice' | 'document_based' | 'constructed_response';
  answer: string;
  isCorrect: boolean | null;
  score: number | null;
  feedback: string | null;
  maxPoints: number;
}

interface Submission {
  id: string;
  studentName: string;
  classPeriod: string;
  totalScore: number | null;
  maxScore: number | null;
  completedAt: string;
  answers: AnswerDetail[];
}

interface QuestionBreakdown {
  questionId: string;
  questionText: string;
  questionType: 'multiple_choice' | 'document_based' | 'constructed_response';
  maxPoints: number;
  averageScore: number;
  percentCorrect: number;
  totalResponses: number;
}

interface Analytics {
  averageScore: number;
  highScore: number;
  lowScore: number;
  submissionCount: number;
  averagePercent: number;
  questionBreakdown: QuestionBreakdown[];
}

interface AssessmentInfo {
  id: string;
  title: string;
  description: string | null;
  gradeLevel: string | null;
  topic: string | null;
  totalPoints: number;
  questionCount: number;
  shareCode: string | null;
}

interface ResultsData {
  assessment: AssessmentInfo;
  submissions: Submission[];
  analytics: Analytics;
}

type SortKey = 'name' | 'score';
type SortDir = 'asc' | 'desc';

// --- Helpers ---

function scoreColor(percent: number): string {
  if (percent >= 70) return 'text-success';
  if (percent >= 50) return 'text-warning';
  return 'text-error';
}

function barColor(percent: number): string {
  if (percent >= 70) return 'bg-success';
  if (percent >= 50) return 'bg-warning';
  return 'bg-error';
}

function bgScoreColor(percent: number): string {
  if (percent >= 70) return 'bg-success/10 border-success/30';
  if (percent >= 50) return 'bg-warning/10 border-warning/30';
  return 'bg-error/10 border-error/30';
}

// --- Component ---

export default function ResultsDashboard() {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const [data, setData] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reteachInsights, setReteachInsights] = useState<string | null>(null);
  const [reteachLoading, setReteachLoading] = useState(false);

  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('score');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  // Fetch results data
  useEffect(() => {
    async function fetchResults() {
      try {
        const res = await fetch(`/api/results/${assessmentId}`);
        if (!res.ok) {
          const body = await res.json();
          throw new Error(body.error || 'Failed to load results');
        }
        const json: ResultsData = await res.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    }
    if (assessmentId) fetchResults();
  }, [assessmentId]);

  // Fetch reteach insights once data loads and there are submissions
  useEffect(() => {
    if (!data || data.analytics.submissionCount === 0) return;

    async function fetchInsights() {
      setReteachLoading(true);
      try {
        const res = await fetch(`/api/results/${assessmentId}/reteach`);
        const json = await res.json();
        setReteachInsights(json.insights);
      } catch {
        setReteachInsights('Unable to load reteaching insights.');
      } finally {
        setReteachLoading(false);
      }
    }
    fetchInsights();
  }, [data, assessmentId]);

  // Sorted question breakdown (lowest first to highlight reteach areas)
  const sortedBreakdown = useMemo(() => {
    if (!data) return [];
    return [...data.analytics.questionBreakdown].sort(
      (a, b) => a.percentCorrect - b.percentCorrect
    );
  }, [data]);

  // Sorted submissions
  const sortedSubmissions = useMemo(() => {
    if (!data) return [];
    return [...data.submissions].sort((a, b) => {
      if (sortKey === 'name') {
        const cmp = a.studentName.localeCompare(b.studentName);
        return sortDir === 'asc' ? cmp : -cmp;
      }
      const aScore = a.totalScore ?? 0;
      const bScore = b.totalScore ?? 0;
      return sortDir === 'asc' ? aScore - bScore : bScore - aScore;
    });
  }, [data, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'score' ? 'desc' : 'asc');
    }
  }

  // --- Loading / Error states ---

  if (loading) {
    return (
      <>
        <Header />
        <PageContainer wide className="py-16">
          <LoadingSpinner size="lg" message="Loading results..." />
        </PageContainer>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <Header />
        <PageContainer wide className="py-16 text-center">
          <h2 className="text-xl font-heading text-error mb-2">
            {error || 'Results not found'}
          </h2>
          <Link href="/">
            <Button variant="secondary" size="sm">Back to Home</Button>
          </Link>
        </PageContainer>
      </>
    );
  }

  const { assessment, analytics } = data;

  // --- Render ---

  return (
    <>
      <Header />
      <PageContainer wide className="py-8 pb-16">
        {/* Page Header */}
        <div className="mb-8">
          <Link
            href={`/assessment/${assessment.id}`}
            className="text-sm text-text-light hover:text-forest font-body mb-2 inline-block"
          >
            &larr; Back to assessment
          </Link>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-forest">
            {assessment.title}
          </h1>
          {assessment.description && (
            <p className="text-text-light font-body mt-1">{assessment.description}</p>
          )}
          {assessment.shareCode && (
            <p className="text-sm text-text-light font-body mt-2">
              Share code: <span className="font-medium text-forest">{assessment.shareCode}</span>
            </p>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <SummaryCard
            label="Submissions"
            value={String(analytics.submissionCount)}
            color="text-forest"
          />
          <SummaryCard
            label="Average"
            value={`${analytics.averagePercent}%`}
            color={scoreColor(analytics.averagePercent)}
          />
          <SummaryCard
            label="Highest"
            value={`${analytics.highScore}/${assessment.totalPoints}`}
            color="text-success"
          />
          <SummaryCard
            label="Lowest"
            value={`${analytics.lowScore}/${assessment.totalPoints}`}
            color={scoreColor(
              assessment.totalPoints > 0
                ? Math.round((analytics.lowScore / assessment.totalPoints) * 100)
                : 0
            )}
          />
        </div>

        {/* Per-Question Analytics */}
        <section className="mb-10">
          <h2 className="text-lg font-heading font-bold text-text mb-4">
            Per-Question Breakdown
          </h2>
          {analytics.submissionCount === 0 ? (
            <Card className="text-center py-8">
              <p className="text-text-light font-body">
                No submissions yet. Share your assessment to start collecting results.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {sortedBreakdown.map((q, i) => (
                <QuestionBar key={q.questionId} question={q} index={i} />
              ))}
            </div>
          )}
        </section>

        {/* Student Submissions Table */}
        <section className="mb-10">
          <h2 className="text-lg font-heading font-bold text-text mb-4">
            Student Submissions
          </h2>
          {sortedSubmissions.length === 0 ? (
            <Card className="text-center py-8">
              <p className="text-text-light font-body">
                No student submissions yet.
              </p>
            </Card>
          ) : (
            <Card className="p-0 overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-[1fr_auto] md:grid-cols-[1fr_120px_120px_80px] gap-2 px-4 py-3 bg-warmwhite border-b border-border text-sm font-heading font-medium text-text-light">
                <button
                  onClick={() => toggleSort('name')}
                  className="text-left hover:text-forest cursor-pointer"
                >
                  Name {sortKey === 'name' && (sortDir === 'asc' ? '\u2191' : '\u2193')}
                </button>
                <span className="hidden md:block text-center">Period</span>
                <button
                  onClick={() => toggleSort('score')}
                  className="text-right md:text-center hover:text-forest cursor-pointer"
                >
                  Score {sortKey === 'score' && (sortDir === 'asc' ? '\u2191' : '\u2193')}
                </button>
                <span className="hidden md:block text-center">%</span>
              </div>

              {/* Table Rows */}
              {sortedSubmissions.map((sub) => {
                const isExpanded = expandedRow === sub.id;
                const pct = sub.maxScore && sub.maxScore > 0
                  ? Math.round(((sub.totalScore ?? 0) / sub.maxScore) * 100)
                  : 0;

                return (
                  <div key={sub.id}>
                    <button
                      onClick={() => setExpandedRow(isExpanded ? null : sub.id)}
                      className="w-full grid grid-cols-[1fr_auto] md:grid-cols-[1fr_120px_120px_80px] gap-2 px-4 py-3 border-b border-border hover:bg-warmwhite/60 transition-colors text-left cursor-pointer"
                    >
                      <span className="font-body text-text truncate">
                        {sub.studentName}
                      </span>
                      <span className="hidden md:block text-center text-text-light font-body text-sm">
                        {sub.classPeriod}
                      </span>
                      <span className={`text-right md:text-center font-heading font-medium ${scoreColor(pct)}`}>
                        {sub.totalScore ?? '—'}/{sub.maxScore ?? '—'}
                      </span>
                      <span className={`hidden md:block text-center font-heading font-medium ${scoreColor(pct)}`}>
                        {pct}%
                      </span>
                    </button>

                    {/* Expanded answers */}
                    {isExpanded && (
                      <div className="px-4 py-4 bg-warmwhite/40 border-b border-border space-y-3">
                        {sub.answers.map((ans) => (
                          <AnswerRow key={ans.questionId} answer={ans} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </Card>
          )}
        </section>

        {/* Reteach Insights */}
        <section>
          <h2 className="text-lg font-heading font-bold text-text mb-4">
            What to Reteach
          </h2>
          <Card className={`border ${analytics.submissionCount > 0 ? 'border-gold/40 bg-gold-light/10' : 'border-border'}`}>
            {analytics.submissionCount === 0 ? (
              <p className="text-text-light font-body text-center">
                Reteaching insights will appear here once students submit their work.
              </p>
            ) : reteachLoading ? (
              <div className="flex items-center gap-3">
                <LoadingSpinner size="sm" />
                <span className="text-text-light font-body text-sm">
                  Analyzing student performance...
                </span>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="font-body text-text leading-relaxed whitespace-pre-line">
                  {reteachInsights}
                </p>
                {/* Quick flags from data */}
                {sortedBreakdown.filter((q) => q.percentCorrect < 50).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm font-heading font-medium text-error mb-2">
                      Critical gaps (below 50%):
                    </p>
                    <ul className="space-y-1">
                      {sortedBreakdown
                        .filter((q) => q.percentCorrect < 50)
                        .map((q) => (
                          <li key={q.questionId} className="text-sm font-body text-text-light">
                            <span className="text-error font-medium">{q.percentCorrect}%</span>
                            {' '}
                            <span className="truncate">{q.questionText}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </Card>
        </section>
      </PageContainer>
    </>
  );
}

// --- Sub-components ---

function SummaryCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <Card className="text-center">
      <p className={`text-2xl md:text-3xl font-heading font-bold ${color}`}>
        {value}
      </p>
      <p className="text-xs md:text-sm text-text-light font-body mt-1">
        {label}
      </p>
    </Card>
  );
}

function QuestionBar({
  question,
  index,
}: {
  question: QuestionBreakdown;
  index: number;
}) {
  return (
    <Card className={`p-4 border ${bgScoreColor(question.percentCorrect)}`}>
      <div className="flex items-start gap-3 mb-2">
        <span className="text-xs text-text-light font-body shrink-0 mt-0.5">
          Q{index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={question.questionType} />
            <span className={`text-sm font-heading font-bold ${scoreColor(question.percentCorrect)}`}>
              {question.percentCorrect}%
            </span>
          </div>
          <p className="text-sm font-body text-text truncate">
            {question.questionText}
          </p>
        </div>
      </div>
      {/* Bar */}
      <div className="h-2 bg-border/40 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor(question.percentCorrect)}`}
          style={{ width: `${Math.max(question.percentCorrect, 2)}%` }}
        />
      </div>
      <p className="text-xs text-text-light font-body mt-1">
        {question.totalResponses} response{question.totalResponses !== 1 ? 's' : ''}
        {question.questionType !== 'multiple_choice' && (
          <> &middot; avg {question.averageScore}/{question.maxPoints} pts</>
        )}
      </p>
    </Card>
  );
}

function AnswerRow({ answer }: { answer: AnswerDetail }) {
  const isMC = answer.questionType === 'multiple_choice';

  return (
    <div className="flex items-start gap-3">
      {/* Correct/Incorrect indicator */}
      <div className="shrink-0 mt-0.5">
        {isMC ? (
          answer.isCorrect ? (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-success/20 text-success text-xs font-bold">
              &#10003;
            </span>
          ) : (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-error/20 text-error text-xs font-bold">
              &#10007;
            </span>
          )
        ) : (
          <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
            answer.score !== null
              ? scoreColor(answer.maxPoints > 0 ? (answer.score / answer.maxPoints) * 100 : 0).replace('text-', 'bg-') + '/20 ' + scoreColor(answer.maxPoints > 0 ? (answer.score / answer.maxPoints) * 100 : 0)
              : 'bg-border/40 text-text-light'
          }`}>
            {answer.score ?? '?'}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs text-text-light font-body mb-0.5">
          {answer.questionText}
        </p>
        <p className="text-sm font-body text-text">
          {answer.answer}
        </p>
        {answer.feedback && (
          <p className="text-xs text-text-light font-body mt-1 italic">
            {answer.feedback}
          </p>
        )}
        {!isMC && answer.score !== null && (
          <p className="text-xs font-heading font-medium mt-1">
            <span className={scoreColor(answer.maxPoints > 0 ? (answer.score / answer.maxPoints) * 100 : 0)}>
              {answer.score}/{answer.maxPoints} pts
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
