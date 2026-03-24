"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

// --- Types ---

interface TaskData {
  task: {
    id: string;
    title: string;
    description: string;
    scenario: string;
    estimatedTimeMinutes: number | null;
  };
  unit: {
    title: string;
  };
}

type SubmissionTab = "write" | "upload" | "link";
type Step = "intro" | "task" | "submitting";

// --- Accepted file types ---
const ACCEPTED_FILES = ".pdf,.docx,.doc,.jpg,.jpeg,.png,.txt";

// --- Submission progress messages ---
const PROGRESS_MESSAGES = [
  "Submitting your work...",
  "AI is reviewing your response against the rubric...",
  "Scoring each criterion independently...",
  "Almost done — generating detailed feedback...",
];

// --- Main Component ---

export default function StudentTaskPage() {
  const { shareCode } = useParams<{ shareCode: string }>();
  const router = useRouter();

  const [data, setData] = useState<TaskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Student info
  const [studentName, setStudentName] = useState("");
  const [classPeriod, setClassPeriod] = useState("");

  // Submission state
  const [step, setStep] = useState<Step>("intro");
  const [activeTab, setActiveTab] = useState<SubmissionTab>("write");
  const [textContent, setTextContent] = useState("");
  const [linkContent, setLinkContent] = useState("");
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [progressIndex, setProgressIndex] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch task data
  useEffect(() => {
    async function fetchTask() {
      try {
        const res = await fetch(`/api/task/${shareCode}`);
        if (!res.ok) {
          throw new Error(
            res.status === 404
              ? "This performance task is not available."
              : "Failed to load performance task."
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
    fetchTask();
  }, [shareCode]);

  // Progress message cycling during submission
  useEffect(() => {
    if (step !== "submitting") return;
    const interval = setInterval(() => {
      setProgressIndex((prev) =>
        prev < PROGRESS_MESSAGES.length - 1 ? prev + 1 : prev
      );
    }, 3000);
    return () => clearInterval(interval);
  }, [step]);

  // Auto-resize textarea
  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setTextContent(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }

  // File upload handler
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      setSubmitError("File must be under 10MB.");
      return;
    }

    setFileName(file.name);
    setSubmitError(null);

    // For text files, read as text. For others, read as base64.
    if (file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = () => setFileContent(reader.result as string);
      reader.readAsText(file);
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Strip the data URL prefix to get just the base64
        const base64 = result.split(",")[1] || result;
        setFileContent(base64);
      };
      reader.readAsDataURL(file);
    }
  }

  // Get current submission content
  function getSubmissionContent(): { type: SubmissionTab; content: string; fileName?: string } | null {
    switch (activeTab) {
      case "write":
        return textContent.trim()
          ? { type: "write", content: textContent.trim() }
          : null;
      case "upload":
        return fileContent && fileName
          ? { type: "upload", content: fileContent, fileName }
          : null;
      case "link":
        return linkContent.trim()
          ? { type: "link", content: linkContent.trim() }
          : null;
      default:
        return null;
    }
  }

  const canSubmit = getSubmissionContent() !== null;

  async function handleSubmit() {
    const submission = getSubmissionContent();
    if (!submission || !data) return;

    setStep("submitting");
    setProgressIndex(0);
    setSubmitError(null);

    const submissionTypeMap: Record<SubmissionTab, "text" | "file" | "link"> = {
      write: "text",
      upload: "file",
      link: "link",
    };

    try {
      const res = await fetch(`/api/task/${shareCode}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: studentName.trim(),
          classPeriod: classPeriod.trim(),
          submissionType: submissionTypeMap[submission.type],
          content: submission.content,
          fileName: submission.fileName,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Submission failed");
      }

      const result = await res.json();

      router.push(
        `/task/${shareCode}/complete?name=${encodeURIComponent(studentName.trim())}&sid=${result.submissionId}`
      );
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to submit. Please try again."
      );
      setStep("task");
    }
  }

  // --- Loading state ---
  if (loading) {
    return (
      <div className="min-h-screen bg-warmwhite flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading performance task..." />
      </div>
    );
  }

  // --- Error state ---
  if (error || !data) {
    return (
      <div className="min-h-screen bg-warmwhite flex items-center justify-center px-4">
        <div className="text-center space-y-3 max-w-sm">
          <div className="h-14 w-14 mx-auto rounded-full bg-red-100 flex items-center justify-center">
            <svg
              className="h-7 w-7 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-heading font-bold text-text">
            Task Not Available
          </h1>
          <p className="text-text-light font-body text-sm">
            {error || "This performance task could not be loaded."}
          </p>
        </div>
      </div>
    );
  }

  // --- Submitting state with progress messages ---
  if (step === "submitting") {
    return (
      <TaskShell title={data.task.title} unitTitle={data.unit.title}>
        <div className="flex flex-col items-center justify-center py-16 gap-6">
          <LoadingSpinner size="lg" />
          <div className="text-center space-y-2">
            <p className="text-base font-heading font-semibold text-forest">
              {PROGRESS_MESSAGES[progressIndex]}
            </p>
            <p className="text-xs text-text-light font-body">
              This may take a moment — the AI is evaluating each criterion carefully.
            </p>
          </div>
          {/* Progress dots */}
          <div className="flex gap-2">
            {PROGRESS_MESSAGES.map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full transition-all duration-500 ${
                  i <= progressIndex ? "bg-forest" : "bg-border"
                }`}
              />
            ))}
          </div>
        </div>
      </TaskShell>
    );
  }

  // --- Intro screen: name + class period ---
  if (step === "intro") {
    return (
      <TaskShell title={data.task.title} unitTitle={data.unit.title}>
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-lg font-heading font-semibold text-text">
              Performance Task
            </h2>
            <p className="text-sm text-text-light font-body">
              {data.task.description}
            </p>
            {data.task.estimatedTimeMinutes && (
              <p className="text-xs text-text-light font-body">
                Estimated time: {data.task.estimatedTimeMinutes} minutes
              </p>
            )}
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
            onClick={() => setStep("task")}
          >
            Begin Task
          </Button>
        </div>
      </TaskShell>
    );
  }

  // --- Task screen: scenario + submission ---
  return (
    <TaskShell title={data.task.title} unitTitle={data.unit.title}>
      <div className="space-y-6">
        {/* Scenario card with gold left border */}
        <div className="rounded-xl border border-border bg-warmwhite pl-4 pr-5 py-4 border-l-4 border-l-gold">
          <p className="text-xs font-heading font-semibold text-gold uppercase tracking-wide mb-2">
            Your Scenario
          </p>
          <p className="text-sm font-body text-text leading-relaxed whitespace-pre-line">
            {data.task.scenario}
          </p>
        </div>

        {/* Submission type tabs */}
        <div>
          <p className="text-sm font-heading font-semibold text-text mb-3">
            Submit Your Response
          </p>
          <div className="flex rounded-lg border border-border overflow-hidden">
            {(
              [
                { key: "write" as SubmissionTab, label: "Write Here" },
                { key: "upload" as SubmissionTab, label: "Upload File" },
                { key: "link" as SubmissionTab, label: "Paste a Link" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  flex-1 px-3 py-2.5 text-sm font-heading font-medium
                  transition-all duration-150
                  ${
                    activeTab === tab.key
                      ? "bg-forest text-white"
                      : "bg-white text-text-light hover:bg-warmwhite"
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Write tab */}
        {activeTab === "write" && (
          <textarea
            ref={textareaRef}
            value={textContent}
            onChange={handleTextareaChange}
            placeholder="Write your response here. Be thorough — the AI will evaluate your work against each rubric criterion..."
            rows={8}
            className="w-full rounded-xl border-2 border-border bg-white px-4 py-3 text-base font-body
              text-text placeholder:text-text-light/50 resize-none
              focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest
              transition-all min-h-[200px]"
            style={{ overflow: "hidden" }}
          />
        )}

        {/* Upload tab */}
        {activeTab === "upload" && (
          <div className="space-y-3">
            <label
              htmlFor="fileUpload"
              className={`
                flex flex-col items-center justify-center gap-3
                rounded-xl border-2 border-dashed px-4 py-8
                cursor-pointer transition-all
                ${
                  fileName
                    ? "border-forest bg-forest/5"
                    : "border-border bg-white hover:border-forest/40"
                }
              `}
            >
              {fileName ? (
                <>
                  <svg
                    className="h-8 w-8 text-forest"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-sm font-body font-semibold text-forest">
                    {fileName}
                  </span>
                  <span className="text-xs text-text-light font-body">
                    Click to change file
                  </span>
                </>
              ) : (
                <>
                  <svg
                    className="h-8 w-8 text-text-light"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                    />
                  </svg>
                  <span className="text-sm font-body text-text-light">
                    Click to upload a file
                  </span>
                  <span className="text-xs text-text-light/60 font-body">
                    PDF, Word, Image, or Text (max 10MB)
                  </span>
                </>
              )}
              <input
                id="fileUpload"
                type="file"
                accept={ACCEPTED_FILES}
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>
          </div>
        )}

        {/* Link tab */}
        {activeTab === "link" && (
          <div className="space-y-2">
            <input
              type="url"
              value={linkContent}
              onChange={(e) => setLinkContent(e.target.value)}
              placeholder="https://docs.google.com/..."
              className="w-full rounded-xl border-2 border-border bg-white px-4 py-3 text-base font-body
                text-text placeholder:text-text-light/50
                focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest
                transition-all"
            />
            <p className="text-xs text-text-light font-body">
              Paste a link to your Google Doc, Google Slides, or other shared document.
              Make sure sharing is enabled.
            </p>
          </div>
        )}

        {/* Error display */}
        {submitError && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 font-body">
            {submitError}
          </div>
        )}

        {/* Submit button */}
        <Button
          variant="accent"
          size="lg"
          fullWidth
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          Submit Performance Task
        </Button>

        <p className="text-center text-xs text-text-light font-body">
          Your work will be scored by AI against each rubric criterion.
          Your teacher will also review your submission.
        </p>
      </div>
    </TaskShell>
  );
}

// --- Shell wrapper for consistent layout (wider than checks — 720px) ---

function TaskShell({
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
      <div className="mx-auto w-full max-w-[720px] px-4 py-6 sm:py-10">
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
