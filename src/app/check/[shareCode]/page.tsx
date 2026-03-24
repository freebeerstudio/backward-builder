"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

// --- Types ---

interface CheckOption {
  text: string;
}

interface CheckQuestion {
  id: string;
  type: "selected_response" | "short_answer";
  orderIndex: number;
  questionText: string;
  points: number;
  options?: CheckOption[];
}

interface CheckData {
  check: {
    id: string;
    title: string;
    unitTitle: string;
  };
  questions: CheckQuestion[];
}

type Step = "intro" | "questions" | "review" | "submitting" | "results";

interface QuestionResult {
  questionId: string;
  questionText: string;
  type: "selected_response" | "short_answer";
  points: number;
  studentAnswer: string;
  isCorrect: boolean | null;
  score: number | null;
  correctAnswer: string | null;
}

interface SubmissionResult {
  submissionId: string;
  totalScore: number;
  maxScore: number;
  questionResults: QuestionResult[];
}

// --- Option letter labels ---
const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

// --- Main Component ---

export default function StudentCheckPage() {
  const { shareCode } = useParams<{ shareCode: string }>();

  const [data, setData] = useState<CheckData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Student info
  const [studentName, setStudentName] = useState("");
  const [classPeriod, setClassPeriod] = useState("");

  // Question navigation
  const [step, setStep] = useState<Step>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);

  // Fetch check data
  useEffect(() => {
    async function fetchCheck() {
      try {
        const res = await fetch(`/api/check/${shareCode}`);
        if (!res.ok) {
          throw new Error(
            res.status === 404
              ? "This check is not available."
              : "Failed to load check."
          );
        }
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }
    fetchCheck();
  }, [shareCode]);

  const totalQuestions = data?.questions.length ?? 0;
  const currentQuestion = data?.questions[currentIndex] ?? null;
  const answeredCount = Object.keys(answers).length;

  const setAnswer = useCallback(
    (questionId: string, value: string) => {
      setAnswers((prev) => ({ ...prev, [questionId]: value }));
    },
    []
  );

  async function handleSubmit() {
    if (!data) return;
    setStep("submitting");
    setSubmitError(null);

    try {
      const res = await fetch(`/api/check/${shareCode}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: studentName.trim(),
          classPeriod: classPeriod.trim(),
          answers: data.questions.map((q) => ({
            questionId: q.id,
            answer: answers[q.id] || "",
          })),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Submission failed");
      }

      const result: SubmissionResult = await res.json();
      setSubmissionResult(result);
      setStep("results");
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to submit. Please try again."
      );
      setStep("review");
    }
  }

  // --- Loading state ---
  if (loading) {
    return (
      <div className="min-h-screen bg-warmwhite flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading check..." />
      </div>
    );
  }

  // --- Error state ---
  if (error || !data) {
    return (
      <div className="min-h-screen bg-warmwhite flex items-center justify-center px-4">
        <div className="text-center space-y-3 max-w-sm">
          <div className="h-14 w-14 mx-auto rounded-full bg-red-100 flex items-center justify-center">
            <svg className="h-7 w-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-heading font-bold text-text">
            Check Not Available
          </h1>
          <p className="text-text-light font-body text-sm">
            {error || "This check could not be loaded."}
          </p>
        </div>
      </div>
    );
  }

  // --- Intro screen: name + class period ---
  if (step === "intro") {
    return (
      <StudentShell title={data.check.title} unitTitle={data.check.unitTitle}>
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-lg font-heading font-semibold text-text">
              Before you begin
            </h2>
            <p className="text-sm text-text-light font-body">
              {totalQuestions} question{totalQuestions !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="studentName"
                className="block text-sm font-heading font-semibold text-text mb-1.5"
              >
                Your Name
              </label>
              <input
                id="studentName"
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="First and Last Name"
                autoComplete="name"
                className="w-full rounded-lg border border-border bg-white px-4 py-3 text-base font-body
                  text-text placeholder:text-text-light/50
                  focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest
                  transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="classPeriod"
                className="block text-sm font-heading font-semibold text-text mb-1.5"
              >
                Class Period
              </label>
              <input
                id="classPeriod"
                type="text"
                value={classPeriod}
                onChange={(e) => setClassPeriod(e.target.value)}
                placeholder="e.g. 3rd Period"
                className="w-full rounded-lg border border-border bg-white px-4 py-3 text-base font-body
                  text-text placeholder:text-text-light/50
                  focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest
                  transition-all"
              />
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!studentName.trim() || !classPeriod.trim()}
            onClick={() => setStep("questions")}
          >
            Start Check
          </Button>
        </div>
      </StudentShell>
    );
  }

  // --- Submitting state ---
  if (step === "submitting") {
    return (
      <StudentShell title={data.check.title} unitTitle={data.check.unitTitle}>
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <LoadingSpinner size="lg" />
          <p className="text-text-light font-body text-sm">
            Submitting your answers...
          </p>
        </div>
      </StudentShell>
    );
  }

  // --- Results screen (shown after successful submission) ---
  if (step === "results" && submissionResult) {
    const { totalScore, maxScore, questionResults } = submissionResult;
    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    // Auto-graded MC totals (exclude teacher-reviewed short answer)
    const mcResults = questionResults.filter((r) => r.type === "selected_response");
    const mcCorrect = mcResults.filter((r) => r.isCorrect === true).length;
    const hasShortAnswer = questionResults.some((r) => r.type === "short_answer");

    // Encouraging message based on score
    let encouragement: string;
    if (percentage >= 90) {
      encouragement = "Outstanding work! You demonstrated a strong understanding.";
    } else if (percentage >= 75) {
      encouragement = "Good job! You're on the right track with your understanding.";
    } else if (percentage >= 60) {
      encouragement = "Nice effort! Review the questions you missed to strengthen your understanding.";
    } else {
      encouragement = "Keep going! This check helps your teacher know where to focus next.";
    }

    return (
      <StudentShell title={data.check.title} unitTitle={data.check.unitTitle}>
        <div className="space-y-8">
          {/* Score header */}
          <div className="text-center space-y-4">
            {/* Checkmark icon */}
            <div className="mx-auto h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
              <svg
                className="h-8 w-8 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-heading font-bold text-text">
                Check Submitted
              </h2>
              <p className="text-sm text-text-light font-body">
                Thanks, <span className="font-semibold">{studentName}</span>.
              </p>
            </div>

            {/* Score display */}
            <div className="inline-flex flex-col items-center gap-1 px-6 py-4 rounded-xl bg-warmwhite border border-border">
              <span className="text-3xl font-heading font-bold text-forest">
                {totalScore}<span className="text-lg text-text-light">/{maxScore}</span>
              </span>
              <span className="text-sm font-body text-text-light">
                {percentage}% {hasShortAnswer ? "(auto-graded portion)" : ""}
              </span>
            </div>

            <p className="text-sm font-body text-text-light leading-relaxed max-w-sm mx-auto">
              {encouragement}
            </p>
          </div>

          {/* Per-question breakdown */}
          <div className="space-y-3">
            <h3 className="text-sm font-heading font-semibold text-text uppercase tracking-wide">
              Question Breakdown
            </h3>

            <div className="space-y-3">
              {questionResults.map((result, i) => (
                <div
                  key={result.questionId}
                  className="rounded-xl border border-border bg-white p-4 space-y-3"
                >
                  {/* Question header with status indicator */}
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">
                      {result.type === "short_answer" ? (
                        /* Pending review — amber clock icon */
                        <div className="h-7 w-7 rounded-full bg-amber-100 flex items-center justify-center">
                          <svg className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      ) : result.isCorrect ? (
                        /* Correct — green check */
                        <div className="h-7 w-7 rounded-full bg-emerald-100 flex items-center justify-center">
                          <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : (
                        /* Incorrect — red X */
                        <div className="h-7 w-7 rounded-full bg-red-100 flex items-center justify-center">
                          <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-heading font-semibold text-text-light">
                          Question {i + 1}
                        </span>
                        <span className="text-xs font-body text-text-light">
                          {result.score !== null ? result.score : "?"}/{result.points} pt{result.points !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <p className="text-sm font-body text-text leading-relaxed">
                        {result.questionText}
                      </p>
                    </div>
                  </div>

                  {/* Answer details */}
                  <div className="ml-10 space-y-2">
                    {/* Student's answer */}
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-heading font-semibold text-text-light shrink-0 mt-0.5 w-20">
                        Your answer
                      </span>
                      <span className={`text-sm font-body leading-relaxed ${
                        result.type === "short_answer"
                          ? "text-text"
                          : result.isCorrect
                            ? "text-emerald-700 font-medium"
                            : "text-red-600 font-medium"
                      }`}>
                        {result.studentAnswer || <span className="italic text-text-light">No answer</span>}
                      </span>
                    </div>

                    {/* Show correct answer for wrong MC answers */}
                    {result.type === "selected_response" && !result.isCorrect && result.correctAnswer && (
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-heading font-semibold text-text-light shrink-0 mt-0.5 w-20">
                          Correct
                        </span>
                        <span className="text-sm font-body text-emerald-700 font-medium leading-relaxed">
                          {result.correctAnswer}
                        </span>
                      </div>
                    )}

                    {/* Pending review note for short answer */}
                    {result.type === "short_answer" && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200">
                        <span className="text-xs font-body text-amber-700">
                          Your teacher will review and score this response.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MC summary if applicable */}
          {mcResults.length > 0 && (
            <div className="text-center text-xs font-body text-text-light">
              Multiple choice: {mcCorrect} of {mcResults.length} correct
              {hasShortAnswer && " · Short answers pending teacher review"}
            </div>
          )}

          {/* Submission confirmation badge */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-forest/5 text-forest text-xs font-heading font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Submission recorded
            </div>
          </div>

          {/* Close notice */}
          <p className="text-center text-xs text-text-light font-body">
            You can close this page now.
          </p>
        </div>
      </StudentShell>
    );
  }

  // --- Review screen ---
  if (step === "review") {
    return (
      <StudentShell title={data.check.title} unitTitle={data.check.unitTitle}>
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-lg font-heading font-semibold text-text">
              Review Your Answers
            </h2>
            <p className="text-sm text-text-light font-body">
              {answeredCount} of {totalQuestions} answered
            </p>
          </div>

          {/* Question summary grid */}
          <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
            {data.questions.map((q, i) => {
              const isAnswered = !!answers[q.id]?.trim();
              return (
                <button
                  key={q.id}
                  onClick={() => {
                    setCurrentIndex(i);
                    setStep("questions");
                  }}
                  className={`
                    h-11 w-full rounded-lg font-heading font-semibold text-sm
                    transition-all duration-150 active:scale-95
                    ${
                      isAnswered
                        ? "bg-forest text-white"
                        : "bg-white border-2 border-border text-text-light"
                    }
                  `}
                  aria-label={`Question ${i + 1}${isAnswered ? " (answered)" : " (unanswered)"}`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          {answeredCount < totalQuestions && (
            <p className="text-center text-xs text-gold font-body font-semibold">
              You have {totalQuestions - answeredCount} unanswered question
              {totalQuestions - answeredCount !== 1 ? "s" : ""}. You can still submit.
            </p>
          )}

          {submitError && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 font-body">
              {submitError}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onClick={() => setStep("questions")}
            >
              Back to Questions
            </Button>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </div>
        </div>
      </StudentShell>
    );
  }

  // --- Questions screen (one at a time) ---
  return (
    <StudentShell title={data.check.title} unitTitle={data.check.unitTitle}>
      {/* Progress bar */}
      <div className="space-y-1 mb-6">
        <div className="flex justify-between text-xs font-body text-text-light">
          <span>Question {currentIndex + 1} of {totalQuestions}</span>
          <span>{currentQuestion?.points} pt{currentQuestion?.points !== 1 ? "s" : ""}</span>
        </div>
        <div className="h-2 bg-border/40 rounded-full overflow-hidden">
          <div
            className="h-full bg-forest rounded-full transition-all duration-300 ease-out"
            style={{
              width: `${((currentIndex + 1) / totalQuestions) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Question */}
      {currentQuestion && (
        <div className="space-y-5">
          <p className="text-base font-body text-text leading-relaxed">
            {currentQuestion.questionText}
          </p>

          {/* MC Options */}
          {currentQuestion.type === "selected_response" &&
            currentQuestion.options && (
              <div className="space-y-3">
                {currentQuestion.options.map((opt, optIdx) => {
                  const isSelected = answers[currentQuestion.id] === opt.text;
                  return (
                    <button
                      key={optIdx}
                      onClick={() => setAnswer(currentQuestion.id, opt.text)}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3.5 rounded-xl
                        text-left transition-all duration-150 active:scale-[0.98]
                        min-h-[52px]
                        ${
                          isSelected
                            ? "bg-forest text-white shadow-md ring-2 ring-forest/30"
                            : "bg-white border-2 border-border text-text hover:border-forest/40"
                        }
                      `}
                      aria-pressed={isSelected}
                    >
                      <span
                        className={`
                          shrink-0 h-10 w-10 rounded-full flex items-center justify-center
                          text-sm font-heading font-bold
                          ${
                            isSelected
                              ? "bg-white/20 text-white"
                              : "bg-warmwhite text-text-light border border-border"
                          }
                        `}
                      >
                        {OPTION_LETTERS[optIdx]}
                      </span>
                      <span className="text-sm font-body leading-snug">
                        {opt.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

          {/* Short answer */}
          {currentQuestion.type === "short_answer" && (
            <textarea
              value={answers[currentQuestion.id] || ""}
              onChange={(e) => setAnswer(currentQuestion.id, e.target.value)}
              placeholder="Type your answer here..."
              rows={5}
              className="w-full rounded-xl border-2 border-border bg-white px-4 py-3 text-base font-body
                text-text placeholder:text-text-light/50 resize-none
                focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest
                transition-all"
            />
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 mt-8">
        <Button
          variant="ghost"
          size="lg"
          fullWidth
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((i) => i - 1)}
        >
          Back
        </Button>

        {currentIndex < totalQuestions - 1 ? (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => setCurrentIndex((i) => i + 1)}
          >
            Next
          </Button>
        ) : (
          <Button
            variant="accent"
            size="lg"
            fullWidth
            onClick={() => setStep("review")}
          >
            Review
          </Button>
        )}
      </div>
    </StudentShell>
  );
}

// --- Shell wrapper for consistent layout ---

function StudentShell({
  title,
  unitTitle,
  children,
}: {
  title: string;
  unitTitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-warmwhite">
      <div className="mx-auto w-full max-w-[640px] px-4 py-6 sm:py-10">
        {/* Header */}
        <div className="text-center mb-6">
          <p className="text-xs font-body text-text-light uppercase tracking-wide mb-1">
            {unitTitle}
          </p>
          <h1 className="text-xl font-heading font-bold text-forest">
            {title}
          </h1>
        </div>

        {/* Content card */}
        <div className="bg-card rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-5 sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
