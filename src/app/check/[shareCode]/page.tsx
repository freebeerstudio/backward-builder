"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
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

type Step = "intro" | "questions" | "review" | "submitting";

// --- Option letter labels ---
const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

// --- Main Component ---

export default function StudentCheckPage() {
  const { shareCode } = useParams<{ shareCode: string }>();
  const router = useRouter();

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

      router.push(
        `/check/${shareCode}/complete?name=${encodeURIComponent(studentName.trim())}`
      );
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
