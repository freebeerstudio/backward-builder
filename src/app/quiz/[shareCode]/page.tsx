"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { PublicQuestion } from "@/types";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Step = "intro" | "quiz" | "review" | "submitting";

interface QuizData {
  assessment: {
    id: string;
    title: string;
    description: string | null;
    gradeLevel: string | null;
  };
  questions: PublicQuestion[];
}

/* ------------------------------------------------------------------ */
/*  Helper: letter for MC options                                      */
/* ------------------------------------------------------------------ */

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function QuizPage() {
  const { shareCode } = useParams<{ shareCode: string }>();
  const router = useRouter();

  // --- data state ---
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- flow state ---
  const [step, setStep] = useState<Step>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);

  // --- student info ---
  const [studentName, setStudentName] = useState("");
  const [classPeriod, setClassPeriod] = useState("");
  const [introError, setIntroError] = useState<string | null>(null);

  // --- answers ---
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // --- submit state ---
  const [submitError, setSubmitError] = useState<string | null>(null);

  /* ---------------------------------------------------------------- */
  /*  Fetch quiz on mount                                              */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/quiz/${shareCode}`);
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error || "Quiz not found");
        }
        const data: QuizData = await res.json();
        setQuiz(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load quiz");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [shareCode]);

  /* ---------------------------------------------------------------- */
  /*  Handlers                                                         */
  /* ---------------------------------------------------------------- */

  const totalQuestions = quiz?.questions.length ?? 0;
  const currentQuestion = quiz?.questions[currentIndex] ?? null;

  const answeredCount = Object.keys(answers).length;

  const handleStartQuiz = () => {
    if (!studentName.trim()) {
      setIntroError("Please enter your name");
      return;
    }
    if (!classPeriod.trim()) {
      setIntroError("Please enter your class period");
      return;
    }
    setIntroError(null);
    setStep("quiz");
  };

  const setAnswer = useCallback((questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const goNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setStep("review");
    }
  };

  const goBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  const jumpToQuestion = (idx: number) => {
    setCurrentIndex(idx);
    setStep("quiz");
  };

  const handleSubmit = async () => {
    if (!quiz) return;

    const confirmed = window.confirm(
      "Are you sure you want to submit? You cannot change your answers after submitting.",
    );
    if (!confirmed) return;

    setStep("submitting");
    setSubmitError(null);

    try {
      const payload = {
        studentName: studentName.trim(),
        classPeriod: classPeriod.trim(),
        answers: Object.entries(answers).map(([questionId, answer]) => ({
          questionId,
          answer,
        })),
      };

      const res = await fetch(`/api/quiz/${shareCode}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Submission failed");
      }

      const result = await res.json();
      router.push(
        `/quiz/${shareCode}/complete?name=${encodeURIComponent(studentName.trim())}&sid=${result.submissionId}`,
      );
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to submit quiz",
      );
      setStep("review");
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Loading / Error states                                           */
  /* ---------------------------------------------------------------- */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-warmwhite">
        <LoadingSpinner size="lg" message="Loading your assessment..." />
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-warmwhite px-4">
        <div className="max-w-md text-center">
          <div className="mb-4 text-5xl">📋</div>
          <h1 className="mb-2 font-heading text-xl font-semibold text-text">
            Assessment Not Found
          </h1>
          <p className="text-base text-text-light">
            {error ||
              "This quiz link may be invalid or the assessment is no longer available."}
          </p>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  STEP: Intro                                                      */
  /* ---------------------------------------------------------------- */

  if (step === "intro") {
    return (
      <Shell title={quiz.assessment.title}>
        <div className="mx-auto w-full max-w-lg px-4 py-8">
          {/* Title card */}
          <div className="mb-8 rounded-xl bg-card p-6 text-center shadow-sm">
            <h1 className="mb-2 font-heading text-2xl font-bold text-forest">
              {quiz.assessment.title}
            </h1>
            {quiz.assessment.description && (
              <p className="mb-3 text-base text-text-light">
                {quiz.assessment.description}
              </p>
            )}
            {quiz.assessment.gradeLevel && (
              <span className="inline-block rounded-full bg-forest/10 px-3 py-1 text-sm font-medium text-forest">
                Grade {quiz.assessment.gradeLevel}
              </span>
            )}
            <p className="mt-4 text-sm text-text-light">
              {totalQuestions} question{totalQuestions !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Name / Period form */}
          <div className="rounded-xl bg-card p-6 shadow-sm">
            <h2 className="mb-4 font-heading text-lg font-semibold text-text">
              Before you begin
            </h2>

            <div className="mb-4">
              <label
                htmlFor="student-name"
                className="mb-1.5 block text-sm font-medium text-text"
              >
                Your Name
              </label>
              <input
                id="student-name"
                type="text"
                autoComplete="name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="First and Last Name"
                className="w-full rounded-lg border border-border bg-white px-4 py-3 text-base text-text placeholder:text-text-light focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20"
              />
            </div>

            <div className="mb-5">
              <label
                htmlFor="class-period"
                className="mb-1.5 block text-sm font-medium text-text"
              >
                Class Period
              </label>
              <input
                id="class-period"
                type="text"
                value={classPeriod}
                onChange={(e) => setClassPeriod(e.target.value)}
                placeholder="e.g. 3rd Period"
                className="w-full rounded-lg border border-border bg-white px-4 py-3 text-base text-text placeholder:text-text-light focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20"
              />
            </div>

            {introError && (
              <p className="mb-4 text-sm text-error">{introError}</p>
            )}

            <button
              onClick={handleStartQuiz}
              className="w-full rounded-lg bg-forest px-6 py-3.5 font-heading text-lg font-semibold text-white transition-colors hover:bg-forest-light active:bg-forest-dark"
            >
              Start Assessment
            </button>
          </div>
        </div>
      </Shell>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  STEP: Submitting                                                 */
  /* ---------------------------------------------------------------- */

  if (step === "submitting") {
    return (
      <Shell title={quiz.assessment.title}>
        <div className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" message="Submitting your answers..." />
        </div>
      </Shell>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  STEP: Review                                                     */
  /* ---------------------------------------------------------------- */

  if (step === "review") {
    return (
      <Shell title={quiz.assessment.title}>
        <div className="mx-auto w-full max-w-[640px] px-4 py-6">
          {/* Progress: done */}
          <ProgressBar current={totalQuestions} total={totalQuestions} />

          <div className="mb-6 rounded-xl bg-card p-6 shadow-sm">
            <h2 className="mb-1 font-heading text-xl font-bold text-text">
              Review Your Answers
            </h2>
            <p className="mb-5 text-sm text-text-light">
              You answered {answeredCount} of {totalQuestions} questions. Tap any
              question to go back and edit.
            </p>

            <div className="space-y-3">
              {quiz.questions.map((q, idx) => {
                const answered = !!answers[q.id];
                return (
                  <button
                    key={q.id}
                    onClick={() => jumpToQuestion(idx)}
                    className="flex w-full items-start gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:bg-warmwhite"
                  >
                    <span
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                        answered
                          ? "bg-success text-white"
                          : "bg-border text-text-light"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-medium text-text line-clamp-2">
                        {q.questionText}
                      </p>
                      {answered ? (
                        <p className="mt-1 text-sm text-text-light line-clamp-1">
                          {answers[q.id]}
                        </p>
                      ) : (
                        <p className="mt-1 text-sm italic text-warning">
                          Not answered
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {submitError && (
            <div className="mb-4 rounded-lg border border-error/30 bg-error/5 p-3 text-sm text-error">
              {submitError}
            </div>
          )}

          <button
            onClick={handleSubmit}
            className="w-full rounded-lg bg-forest px-6 py-4 font-heading text-lg font-semibold text-white transition-colors hover:bg-forest-light active:bg-forest-dark"
          >
            Submit Assessment
          </button>
        </div>
      </Shell>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  STEP: Quiz (one question at a time)                              */
  /* ---------------------------------------------------------------- */

  return (
    <Shell title={quiz.assessment.title}>
      <div className="mx-auto w-full max-w-[640px] px-4 py-6">
        {/* Progress bar */}
        <ProgressBar current={currentIndex + 1} total={totalQuestions} />

        {/* Question card */}
        {currentQuestion && (
          <div className="mb-6 rounded-xl bg-card p-5 shadow-sm sm:p-6">
            {/* Question number + type badge */}
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-text-light">
                Question {currentIndex + 1} of {totalQuestions}
              </span>
              <QuestionTypeBadge type={currentQuestion.type} />
            </div>

            {/* DBQ source material */}
            {currentQuestion.type === "document_based" &&
              currentQuestion.sourceDocument && (
                <div className="mb-5 rounded-lg border-l-4 border-gold bg-gold/5 p-4">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gold">
                    Source Document
                  </p>
                  <p className="whitespace-pre-line text-[15px] italic leading-relaxed text-text">
                    {currentQuestion.sourceDocument}
                  </p>
                  {currentQuestion.sourceAttribution && (
                    <p className="mt-2 text-sm text-text-light">
                      &mdash; {currentQuestion.sourceAttribution}
                    </p>
                  )}
                </div>
              )}

            {/* Question text */}
            <p className="mb-5 text-lg font-medium leading-relaxed text-text">
              {currentQuestion.questionText}
            </p>

            {/* DBQ scaffolding */}
            {currentQuestion.type === "document_based" &&
              currentQuestion.scaffoldingQuestions &&
              (currentQuestion.scaffoldingQuestions as string[]).length > 0 && (
                <div className="mb-5 rounded-lg bg-warmwhite p-4">
                  <p className="mb-2 text-sm font-semibold text-forest">
                    Consider these guiding questions:
                  </p>
                  <ul className="space-y-1.5">
                    {(currentQuestion.scaffoldingQuestions as string[]).map(
                      (sq, i) => (
                        <li
                          key={i}
                          className="flex gap-2 text-[15px] text-text-light"
                        >
                          <span className="shrink-0 text-forest">&bull;</span>
                          {sq}
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              )}

            {/* Points */}
            <p className="mb-4 text-sm text-text-light">
              {currentQuestion.points} point
              {currentQuestion.points !== 1 ? "s" : ""}
            </p>

            {/* Answer input */}
            {currentQuestion.type === "multiple_choice" &&
              currentQuestion.options && (
                <MCOptions
                  options={currentQuestion.options}
                  selected={answers[currentQuestion.id] || ""}
                  onSelect={(val) => setAnswer(currentQuestion.id, val)}
                />
              )}

            {(currentQuestion.type === "document_based" ||
              currentQuestion.type === "constructed_response") && (
              <textarea
                value={answers[currentQuestion.id] || ""}
                onChange={(e) => setAnswer(currentQuestion.id, e.target.value)}
                placeholder={
                  currentQuestion.type === "document_based"
                    ? "Write your response using evidence from the source document..."
                    : "Write your response..."
                }
                rows={6}
                className="w-full rounded-lg border border-border bg-white px-4 py-3 text-base leading-relaxed text-text placeholder:text-text-light focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20"
              />
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3">
          <button
            onClick={goBack}
            disabled={currentIndex === 0}
            className="flex-1 rounded-lg border border-border bg-white px-4 py-3 font-heading text-base font-medium text-text transition-colors hover:bg-warmwhite disabled:cursor-not-allowed disabled:opacity-40"
          >
            Back
          </button>
          <button
            onClick={goNext}
            className="flex-1 rounded-lg bg-forest px-4 py-3 font-heading text-base font-semibold text-white transition-colors hover:bg-forest-light active:bg-forest-dark"
          >
            {currentIndex === totalQuestions - 1 ? "Review" : "Next"}
          </button>
        </div>
      </div>
    </Shell>
  );
}

/* ================================================================== */
/*  Sub-components                                                     */
/* ================================================================== */

/** Minimal page shell -- no nav, no footer, just the assessment title */
function Shell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-warmwhite">
      {/* Thin title bar */}
      <div className="border-b border-border bg-card px-4 py-3">
        <p className="mx-auto max-w-[640px] truncate text-center font-heading text-sm font-semibold text-forest">
          {title}
        </p>
      </div>
      {children}
    </div>
  );
}

/** Progress bar */
function ProgressBar({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="mb-6">
      <div className="mb-1.5 flex items-center justify-between text-xs text-text-light">
        <span>
          {current} of {total}
        </span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-forest transition-all duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/** Multiple choice options with large tappable radio buttons */
function MCOptions({
  options,
  selected,
  onSelect,
}: {
  options: { text: string }[];
  selected: string;
  onSelect: (val: string) => void;
}) {
  return (
    <div className="space-y-3">
      {options.map((opt, idx) => {
        const isSelected = selected === opt.text;
        return (
          <button
            key={idx}
            onClick={() => onSelect(opt.text)}
            className={`flex w-full items-center gap-3 rounded-lg border-2 p-3.5 text-left transition-all ${
              isSelected
                ? "border-forest bg-forest/5"
                : "border-border bg-white hover:border-forest/40"
            }`}
          >
            {/* Radio circle */}
            <span
              className={`flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors ${
                isSelected
                  ? "border-forest bg-forest text-white"
                  : "border-border text-text-light"
              }`}
            >
              {LETTERS[idx]}
            </span>
            <span className="text-base leading-snug text-text">{opt.text}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Small badge showing question type */
function QuestionTypeBadge({
  type,
}: {
  type: string;
}) {
  const labels: Record<string, { label: string; color: string }> = {
    multiple_choice: { label: "Multiple Choice", color: "bg-forest/10 text-forest" },
    document_based: { label: "Document Based", color: "bg-gold/20 text-gold" },
    constructed_response: { label: "Constructed Response", color: "bg-forest-light/15 text-forest-light" },
  };

  const info = labels[type] || { label: type, color: "bg-border text-text-light" };

  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${info.color}`}
    >
      {info.label}
    </span>
  );
}
