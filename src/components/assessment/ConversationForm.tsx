"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { AssessmentInput, ChatMessage } from "@/types";

// ---------------------------------------------------------------------------
// Conversation step definitions
// ---------------------------------------------------------------------------

interface Step {
  message: string;
  field: keyof AssessmentInput;
  inputType: "textarea" | "text" | "select";
  inputPlaceholder?: string;
  inputOptions?: string[];
  allowSkip?: boolean;
  skipLabel?: string;
}

const STEPS: Step[] = [
  {
    message:
      "Hi there! I\u2019m here to help you build an assessment your students can take on any device. Let\u2019s start with the big picture \u2014 what do your students need to understand?",
    field: "objectives",
    inputType: "textarea",
    inputPlaceholder: "e.g., Students should understand the causes and consequences of the American Revolution\u2026",
  },
  {
    message:
      "Great \u2014 that\u2019s a solid enduring understanding. Now, what grade level are your students?",
    field: "gradeLevel",
    inputType: "select",
    inputOptions: ["6th Grade", "7th Grade", "8th Grade"],
  },
  {
    message:
      "How long was this unit? This helps me calibrate the depth of the assessment.",
    field: "unitLength",
    inputType: "text",
    inputPlaceholder: "e.g., About 2 weeks",
  },
  {
    message:
      "What specific topics, events, or concepts did you cover? The more specific you are, the better your assessment will match what you actually taught.",
    field: "topicsCovered",
    inputType: "textarea",
    inputPlaceholder: "e.g., Stamp Act, Boston Massacre, Tea Act, Continental Congress\u2026",
  },
  {
    message:
      "Last question \u2014 did students work with any primary sources or specific texts? This helps me create document-based questions.",
    field: "sourcesUsed",
    inputType: "textarea",
    inputPlaceholder:
      "e.g., Excerpts from Common Sense, a political cartoon about the Stamp Act\u2026",
    allowSkip: true,
    skipLabel: "No specific sources \u2014 skip this step",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let messageIdCounter = 0;
function nextId() {
  return `msg-${++messageIdCounter}-${Date.now()}`;
}

function extractTopic(topicsCovered: string): string {
  // Take the first meaningful phrase as the topic
  const first = topicsCovered.split(",")[0]?.trim();
  return first || topicsCovered.slice(0, 60);
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Avatar() {
  return (
    <div className="w-8 h-8 rounded-full bg-forest flex-shrink-0 flex items-center justify-center">
      <span className="text-white text-[11px] font-heading font-bold leading-none">
        BB
      </span>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-3 max-w-[85%]">
      <Avatar />
      <div className="bg-card rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-border">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-forest/40 rounded-full animate-bounce [animation-delay:0ms]" />
          <span className="w-2 h-2 bg-forest/40 rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="w-2 h-2 bg-forest/40 rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

function AssistantBubble({ content }: { content: string }) {
  return (
    <div className="flex items-start gap-3 max-w-[85%]">
      <Avatar />
      <div className="bg-card rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-border relative">
        <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full bg-forest -translate-x-0.5" />
        <p className="text-text font-body text-[15px] leading-relaxed pl-1.5">
          {content}
        </p>
      </div>
    </div>
  );
}

function UserBubble({ content }: { content: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] bg-forest/[0.08] rounded-2xl rounded-tr-sm px-4 py-3">
        <p className="text-text font-body text-[15px] leading-relaxed">
          {content}
        </p>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-start gap-3 max-w-[85%]">
      <Avatar />
      <div className="bg-card rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm border border-border">
        <div className="flex items-center gap-3">
          <svg
            className="w-5 h-5 text-forest animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <p className="text-text font-body text-[15px]">
            Building your assessment&hellip;
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ConversationForm() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(true); // AI is "typing" initially
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedId, setGeneratedId] = useState<string | null>(null);
  const [generatedSummary, setGeneratedSummary] = useState<{
    questionCount: number;
    totalPoints: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const collectedData = useRef<Partial<AssessmentInput>>({});

  // ---- Scroll to bottom whenever messages change ----
  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isGenerating, scrollToBottom]);

  // ---- Focus the input when it appears ----
  useEffect(() => {
    if (!isTyping && !isGenerating && !generatedId) {
      // Small delay to let the DOM render
      const t = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [isTyping, isGenerating, currentStep, generatedId]);

  // ---- Show first AI message on mount ----
  useEffect(() => {
    const timeout = setTimeout(() => {
      setMessages([
        {
          id: nextId(),
          role: "assistant",
          content: STEPS[0].message,
          inputType: STEPS[0].inputType,
          inputPlaceholder: STEPS[0].inputPlaceholder,
          inputOptions: STEPS[0].inputOptions,
          field: STEPS[0].field,
        },
      ]);
      setIsTyping(false);
    }, 600);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Advance the conversation ----
  const advanceStep = useCallback(
    (value: string, stepIndex: number) => {
      const step = STEPS[stepIndex];

      // Store the collected value
      collectedData.current[step.field] = value;

      // Add the user message
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: "user", content: value },
      ]);

      const nextStepIndex = stepIndex + 1;

      // If we have more steps, show the next AI message
      if (nextStepIndex < STEPS.length) {
        setIsTyping(true);
        setInputValue("");

        setTimeout(() => {
          const nextStep = STEPS[nextStepIndex];
          setMessages((prev) => [
            ...prev,
            {
              id: nextId(),
              role: "assistant",
              content: nextStep.message,
              inputType: nextStep.inputType,
              inputPlaceholder: nextStep.inputPlaceholder,
              inputOptions: nextStep.inputOptions,
              field: nextStep.field,
            },
          ]);
          setCurrentStep(nextStepIndex);
          setIsTyping(false);
        }, 800);
      } else {
        // All steps done -- generate assessment
        setInputValue("");
        generateAssessment();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // ---- Generate assessment via API ----
  const generateAssessment = async () => {
    setIsTyping(true);

    // Show the "building" message
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: "assistant",
          content: "Perfect! I have everything I need. Let me build your assessment\u2026",
        },
      ]);
      setIsTyping(false);
      setIsGenerating(true);
    }, 600);

    const data = collectedData.current as AssessmentInput;
    // Derive topic from topicsCovered
    data.topic = extractTopic(data.topicsCovered || "");

    try {
      const response = await fetch("/api/assessment/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objectives: data.objectives,
          gradeLevel: data.gradeLevel,
          unitLength: data.unitLength,
          topicsCovered: data.topicsCovered,
          sourcesUsed: data.sourcesUsed,
          topic: data.topic,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error || `Server responded with ${response.status}`,
        );
      }

      const result = await response.json();

      setIsGenerating(false);
      setGeneratedId(result.id);
      setGeneratedSummary({
        questionCount: result.questionCount ?? result.questions?.length ?? 0,
        totalPoints: result.totalPoints ?? 0,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: "assistant",
          content: `Your assessment is ready! I\u2019ve created ${result.questionCount ?? result.questions?.length ?? 0} questions worth ${result.totalPoints ?? 0} total points. Let\u2019s review them together.`,
        },
      ]);
    } catch (err) {
      setIsGenerating(false);
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(message);
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: "assistant",
          content: `I ran into a problem generating your assessment: ${message}. Please try again.`,
        },
      ]);
    }
  };

  // ---- Handle form submission ----
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed || isTyping || isGenerating) return;
    advanceStep(trimmed, currentStep);
  };

  const handleSkip = () => {
    advanceStep("(no sources provided)", currentStep);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift) for textareas
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // ---- Determine current input config ----
  const currentStepConfig = currentStep < STEPS.length ? STEPS[currentStep] : null;
  const showInput = !isTyping && !isGenerating && !generatedId && currentStepConfig;

  return (
    <div className="flex flex-col flex-1 max-w-3xl w-full mx-auto">
      {/* ---- Chat messages area ---- */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-5"
      >
        {messages.map((msg) =>
          msg.role === "assistant" ? (
            <AssistantBubble key={msg.id} content={msg.content} />
          ) : (
            <UserBubble key={msg.id} content={msg.content} />
          ),
        )}

        {isTyping && <TypingIndicator />}
        {isGenerating && <LoadingState />}

        {/* Bottom spacer so input doesn't cover last message */}
        <div className="h-4" />
      </div>

      {/* ---- Input area pinned to bottom ---- */}
      <div className="sticky bottom-0 bg-warmwhite border-t border-border">
        <div className="max-w-3xl mx-auto px-4 py-4">
          {showInput && (
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Skip link for sources step */}
              {currentStepConfig.allowSkip && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="text-sm text-text-light hover:text-forest underline underline-offset-2 transition-colors"
                  >
                    {currentStepConfig.skipLabel}
                  </button>
                </div>
              )}

              {currentStepConfig.inputType === "select" ? (
                <div className="flex gap-2">
                  {currentStepConfig.inputOptions?.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => advanceStep(option, currentStep)}
                      className={`flex-1 py-3 px-4 rounded-xl text-[15px] font-medium border-2 transition-all
                        ${
                          inputValue === option
                            ? "border-forest bg-forest text-white"
                            : "border-border bg-card text-text hover:border-forest/50 hover:shadow-sm"
                        }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ) : currentStepConfig.inputType === "textarea" ? (
                <div className="flex items-end gap-2">
                  <textarea
                    ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={currentStepConfig.inputPlaceholder}
                    rows={3}
                    className="flex-1 resize-none rounded-xl border-2 border-border bg-card px-4 py-3 text-[15px] text-text font-body placeholder:text-text-light/60 focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest/20 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim()}
                    className="h-12 w-12 flex-shrink-0 rounded-xl bg-forest text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-forest-dark active:scale-95 transition-all"
                    aria-label="Send"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18"
                      />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef as React.RefObject<HTMLInputElement>}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={currentStepConfig.inputPlaceholder}
                    className="flex-1 rounded-xl border-2 border-border bg-card px-4 py-3 text-[15px] text-text font-body placeholder:text-text-light/60 focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest/20 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim()}
                    className="h-12 w-12 flex-shrink-0 rounded-xl bg-forest text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-forest-dark active:scale-95 transition-all"
                    aria-label="Send"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18"
                      />
                    </svg>
                  </button>
                </div>
              )}

              {currentStepConfig.inputType !== "select" && (
                <p className="text-xs text-text-light text-center">
                  Press <kbd className="px-1.5 py-0.5 rounded bg-card border border-border text-[11px] font-mono">Enter</kbd> to send{currentStepConfig.inputType === "textarea" ? ", Shift+Enter for new line" : ""}
                </p>
              )}
            </form>
          )}

          {/* Review button after generation */}
          {generatedId && (
            <div className="flex flex-col items-center gap-3 py-2">
              <button
                onClick={() => router.push(`/assessment/${generatedId}/edit`)}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-forest text-white font-heading font-semibold text-base hover:bg-forest-dark active:scale-[0.98] transition-all shadow-md hover:shadow-lg"
              >
                Review Assessment &rarr;
              </button>
            </div>
          )}

          {/* Error retry */}
          {error && !generatedId && (
            <div className="flex justify-center py-2">
              <button
                onClick={() => {
                  setError(null);
                  generateAssessment();
                }}
                className="px-6 py-2.5 rounded-xl border-2 border-forest text-forest font-medium text-sm hover:bg-forest hover:text-white transition-all"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
