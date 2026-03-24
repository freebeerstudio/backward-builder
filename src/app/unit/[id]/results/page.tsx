"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { Header } from "@/components/layout/Header";
import { UbDProgressIndicator } from "@/components/unit/UbDProgressIndicator";
import { Badge } from "@/components/ui/Badge";

// --- Types for the results payload ---

interface QuestionBreakdown {
  questionId: string;
  questionText: string;
  questionType: string;
  percentCorrect: number;
  totalResponses: number;
  maxPoints: number;
}

interface CheckResult {
  id: string;
  title: string;
  submissionCount: number;
  averagePercent: number;
  questionBreakdown: QuestionBreakdown[];
}

interface SubmissionResult {
  id: string;
  studentName: string;
  classPeriod: string;
  assessmentId: string;
  totalScore: number | null;
  maxScore: number | null;
  completedAt: string;
}

interface AnswerResult {
  id: string;
  submissionId: string;
  questionId: string;
  answer: string;
  isCorrect: boolean | null;
  score: number | null;
  feedback: string | null;
}

interface ResultsData {
  unit: {
    id: string;
    title: string;
    enduringUnderstanding: string;
    standardCodes: string[] | null;
    cognitiveLevel: string | null;
  };
  checks: CheckResult[];
  analytics: {
    totalStudents: number;
    overallAveragePercent: number;
  };
  submissions: SubmissionResult[];
  answers: AnswerResult[];
}

// --- Color helpers ---

function scoreColor(percent: number): string {
  if (percent >= 70) return "text-green-700 bg-green-50 border-green-200";
  if (percent >= 50) return "text-yellow-700 bg-yellow-50 border-yellow-200";
  return "text-red-700 bg-red-50 border-red-200";
}

function barColor(percent: number): string {
  if (percent >= 70) return "bg-green-500";
  if (percent >= 50) return "bg-yellow-500";
  return "bg-red-500";
}

function scoreTextColor(percent: number): string {
  if (percent >= 70) return "text-green-700";
  if (percent >= 50) return "text-yellow-700";
  return "text-red-700";
}

/**
 * Teacher Results Dashboard — the payoff screen.
 * Shows how students performed on checks for understanding, with per-question
 * breakdowns and AI-powered reteaching suggestions. This is where the UbD
 * loop closes: evidence from Stage 2 informs what to reteach in Stage 3.
 */
export default function ResultsPage() {
  const params = useParams();
  const unitId = params.id as string;

  const [data, setData] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reteach section
  const [reteachInsights, setReteachInsights] = useState<string | null>(null);
  const [reteachLoading, setReteachLoading] = useState(false);

  // Expanded student rows
  const [expandedStudents, setExpandedStudents] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    async function loadResults() {
      try {
        const res = await fetch(`/api/unit/${unitId}/results`);
        if (!res.ok) throw new Error("Failed to load results");
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load results");
      } finally {
        setLoading(false);
      }
    }
    loadResults();
  }, [unitId]);

  // Fetch reteach insights after data loads
  useEffect(() => {
    if (!data || data.analytics.totalStudents === 0) return;

    async function loadReteach() {
      setReteachLoading(true);
      try {
        const res = await fetch(`/api/unit/${unitId}/results/reteach`);
        if (!res.ok) throw new Error("Failed to load reteach insights");
        const json = await res.json();
        setReteachInsights(json.insights);
      } catch {
        setReteachInsights(
          "Unable to generate reteaching suggestions at this time."
        );
      } finally {
        setReteachLoading(false);
      }
    }
    loadReteach();
  }, [data, unitId]);

  function toggleStudent(submissionId: string) {
    setExpandedStudents((prev) => {
      const next = new Set(prev);
      if (next.has(submissionId)) {
        next.delete(submissionId);
      } else {
        next.add(submissionId);
      }
      return next;
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-warmwhite">
        <Header />
        <PageContainer wide className="py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-forest border-t-transparent" />
            <p className="font-body text-text-light">Loading results...</p>
          </div>
        </PageContainer>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-warmwhite">
        <Header />
        <PageContainer wide className="py-12">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="font-heading text-lg font-semibold text-red-800">
              {error || "Something went wrong"}
            </p>
            <Link
              href="/"
              className="mt-4 inline-block text-sm font-medium text-forest hover:underline"
            >
              Back to home
            </Link>
          </div>
        </PageContainer>
      </div>
    );
  }

  const { unit, checks, analytics, submissions, answers } = data;

  return (
    <div className="min-h-screen bg-warmwhite">
      <Header />
      <PageContainer wide className="py-8 pb-16">
        {/* Progress indicator — all stages complete */}
        <div className="mb-8">
          <UbDProgressIndicator
            currentStage={3}
            completedStages={[1, 2, 3]}
          />
        </div>

        {/* Page title */}
        <div className="mb-8">
          <h1 className="font-heading text-2xl font-bold text-forest-dark sm:text-3xl">
            Results Dashboard
          </h1>
          <p className="mt-1 font-body text-text-light">
            {unit.title} — Student performance on checks for understanding
          </p>
        </div>

        {/* Summary Cards */}
        <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {/* Total Students */}
          <div className="rounded-xl border border-border bg-card p-5 text-center">
            <p className="font-body text-sm text-text-light">Total Students</p>
            <p className="mt-1 font-heading text-3xl font-bold text-forest-dark">
              {analytics.totalStudents}
            </p>
          </div>

          {/* Overall Average */}
          <div
            className={`rounded-xl border p-5 text-center ${scoreColor(analytics.overallAveragePercent)}`}
          >
            <p className="text-sm opacity-80">Overall Average</p>
            <p className="mt-1 font-heading text-3xl font-bold">
              {analytics.overallAveragePercent}%
            </p>
          </div>

          {/* Per-check mini-stats */}
          {checks.slice(0, 2).map((check) => (
            <div
              key={check.id}
              className={`rounded-xl border p-5 text-center ${scoreColor(check.averagePercent)}`}
            >
              <p className="truncate text-sm opacity-80">{check.title}</p>
              <p className="mt-1 font-heading text-3xl font-bold">
                {check.averagePercent}%
              </p>
              <p className="mt-0.5 text-xs opacity-70">
                {check.submissionCount} submissions
              </p>
            </div>
          ))}
        </div>

        {/* No submissions state */}
        {analytics.totalStudents === 0 && (
          <div className="mb-10 rounded-xl border border-border bg-card p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-forest/10">
              <svg
                className="h-8 w-8 text-forest"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
            </div>
            <h3 className="font-heading text-lg font-semibold text-forest-dark">
              No student responses yet
            </h3>
            <p className="mt-2 font-body text-text-light">
              Share your checks for understanding with students. Results will
              appear here as they respond.
            </p>
          </div>
        )}

        {/* Per-Check Results */}
        {checks.map((check) => (
          <section key={check.id} className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-heading text-xl font-bold text-forest-dark">
                  {check.title}
                </h2>
                <p className="font-body text-sm text-text-light">
                  {check.submissionCount} submissions &middot;{" "}
                  <span className={scoreTextColor(check.averagePercent)}>
                    {check.averagePercent}% average
                  </span>
                </p>
              </div>
              <Badge variant="check" />
            </div>

            {/* Per-question bar chart */}
            <div className="space-y-3 rounded-xl border border-border bg-card p-5">
              {check.questionBreakdown.length === 0 ? (
                <p className="text-center font-body text-sm text-text-light">
                  No question data available
                </p>
              ) : (
                check.questionBreakdown.map((q, idx) => (
                  <div key={q.questionId}>
                    <div className="mb-1 flex items-start justify-between gap-4">
                      <p className="flex-1 font-body text-sm text-text">
                        <span className="font-medium text-text-light">
                          Q{idx + 1}.
                        </span>{" "}
                        {q.questionText}
                      </p>
                      <span
                        className={`shrink-0 font-heading text-sm font-semibold ${scoreTextColor(q.percentCorrect)}`}
                      >
                        {q.percentCorrect}%
                      </span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${barColor(q.percentCorrect)}`}
                        style={{ width: `${q.percentCorrect}%` }}
                      />
                    </div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <Badge
                        variant="info"
                        label={
                          q.questionType === "selected_response"
                            ? "Multiple Choice"
                            : "Short Answer"
                        }
                      />
                      <span className="font-body text-xs text-text-light">
                        {q.totalResponses} responses
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        ))}

        {/* Student Table */}
        {submissions.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 font-heading text-xl font-bold text-forest-dark">
              Student Submissions
            </h2>
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-warmwhite">
                    <th className="px-4 py-3 text-left font-heading text-sm font-semibold text-text">
                      Student
                    </th>
                    <th className="px-4 py-3 text-left font-heading text-sm font-semibold text-text">
                      Period
                    </th>
                    <th className="px-4 py-3 text-right font-heading text-sm font-semibold text-text">
                      Score
                    </th>
                    <th className="px-4 py-3 text-right font-heading text-sm font-semibold text-text">
                      %
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub) => {
                    const percent =
                      sub.maxScore && sub.maxScore > 0
                        ? Math.round(
                            ((sub.totalScore ?? 0) / sub.maxScore) * 100
                          )
                        : 0;
                    const isExpanded = expandedStudents.has(sub.id);
                    const studentAnswers = answers.filter(
                      (a) => a.submissionId === sub.id
                    );

                    return (
                      <tr key={sub.id} className="group">
                        <td colSpan={4} className="p-0">
                          {/* Clickable row */}
                          <button
                            type="button"
                            onClick={() => toggleStudent(sub.id)}
                            className="flex w-full items-center border-b border-border px-4 py-3 text-left transition-colors hover:bg-warmwhite"
                          >
                            <span className="flex-1 font-body text-sm text-text">
                              <span className="mr-2">
                                {isExpanded ? "\u25BC" : "\u25B6"}
                              </span>
                              {sub.studentName}
                            </span>
                            <span className="w-20 text-left font-body text-sm text-text-light">
                              {sub.classPeriod}
                            </span>
                            <span className="w-20 text-right font-body text-sm text-text">
                              {sub.totalScore ?? 0}/{sub.maxScore ?? 0}
                            </span>
                            <span
                              className={`w-16 text-right font-heading text-sm font-semibold ${scoreTextColor(percent)}`}
                            >
                              {percent}%
                            </span>
                          </button>

                          {/* Expanded answers */}
                          {isExpanded && studentAnswers.length > 0 && (
                            <div className="border-b border-border bg-warmwhite px-6 py-3">
                              <div className="space-y-2">
                                {studentAnswers.map((ans) => (
                                  <div
                                    key={ans.id}
                                    className="flex items-start gap-3"
                                  >
                                    <span className="mt-0.5 shrink-0">
                                      {ans.isCorrect === true ? (
                                        <svg
                                          className="h-5 w-5 text-green-600"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                          strokeWidth={2.5}
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M5 13l4 4L19 7"
                                          />
                                        </svg>
                                      ) : ans.isCorrect === false ? (
                                        <svg
                                          className="h-5 w-5 text-red-500"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                          strokeWidth={2.5}
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M6 18L18 6M6 6l12 12"
                                          />
                                        </svg>
                                      ) : (
                                        <span className="inline-block h-5 w-5 rounded-full bg-gray-200" />
                                      )}
                                    </span>
                                    <div className="flex-1">
                                      <p className="font-body text-sm text-text">
                                        {ans.answer}
                                      </p>
                                      {ans.feedback && (
                                        <p className="mt-0.5 font-body text-xs text-text-light italic">
                                          {ans.feedback}
                                        </p>
                                      )}
                                    </div>
                                    {ans.score !== null && (
                                      <span className="shrink-0 font-heading text-xs font-medium text-text-light">
                                        {ans.score} pts
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* What to Reteach — AI Insights */}
        <section className="mb-10">
          <h2 className="mb-4 font-heading text-xl font-bold text-forest-dark">
            What to Reteach
          </h2>
          <div className="rounded-xl border border-yellow-200 bg-gold/10 p-6">
            <div className="mb-3 flex items-center gap-2">
              <svg
                className="h-5 w-5 text-yellow-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
                />
              </svg>
              <h3 className="font-heading text-base font-semibold text-yellow-800">
                AI-Powered Reteaching Insights
              </h3>
            </div>

            {reteachLoading ? (
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-yellow-600 border-t-transparent" />
                <p className="font-body text-sm text-yellow-700">
                  Analyzing student responses and generating reteaching
                  strategies...
                </p>
              </div>
            ) : reteachInsights ? (
              <p className="font-body text-sm leading-relaxed text-yellow-900">
                {reteachInsights}
              </p>
            ) : (
              <p className="font-body text-sm text-yellow-700">
                Submit student responses to see AI-powered reteaching
                suggestions.
              </p>
            )}
          </div>
        </section>

        {/* Back link */}
        <div className="flex items-center justify-between border-t border-border pt-6">
          <Link
            href={`/unit/${unitId}/stage3`}
            className="font-heading text-sm font-medium text-forest hover:underline"
          >
            &larr; Back to Learning Plan
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
