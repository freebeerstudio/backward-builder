"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthModal } from "@/components/auth/AuthModal";

const GRADES = [
  "5th Grade", "6th Grade", "7th Grade", "8th Grade",
  "9th Grade", "10th Grade", "11th Grade", "12th Grade",
];

const SUBJECTS = [
  "Science",
  "History / Social Studies",
  "English Language Arts",
  "Mathematics",
];

const STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
  "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
  "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
  "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
  "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
  "New Hampshire", "New Jersey", "New Mexico", "New York",
  "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
  "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
  "West Virginia", "Wisconsin", "Wyoming",
];

/** Quick-start template definitions */
const TEMPLATES = [
  {
    icon: "🌋",
    label: "The Volcano Unit",
    subtitle: "Earth Science",
    grade: "6th Grade",
    subject: "Science",
    state: "Missouri",
    understanding:
      "Students will understand that volcanoes are formed by geological processes involving tectonic plate movement and magma, and that volcanic activity both shapes Earth's surface and affects ecosystems and human communities.",
  },
  {
    icon: "📖",
    label: "Holes — Louis Sachar",
    subtitle: "Writing & Character",
    grade: "7th Grade",
    subject: "English Language Arts",
    state: "Missouri",
    understanding:
      "Students will understand that authors use narrative structure, symbolism, and character development to explore themes of justice, fate, and resilience — and that a reader's interpretation deepens when they analyze how these elements work together.",
  },
  {
    icon: "🏛️",
    label: "Ancient Civilizations",
    subtitle: "Culture & Society",
    grade: "6th Grade",
    subject: "History / Social Studies",
    state: "Missouri",
    understanding:
      "Students will understand that early civilizations developed complex social, political, and economic systems in response to geographic and environmental challenges, and that these innovations continue to influence modern societies.",
  },
  {
    icon: "🧪",
    label: "The Water Cycle",
    subtitle: "Systems & Processes",
    grade: "5th Grade",
    subject: "Science",
    state: "Missouri",
    understanding:
      "Students will understand that the water cycle is a continuous system driven by solar energy, and that changes in one part of the cycle affect weather, ecosystems, and water availability for human communities.",
  },
];

/**
 * HeroChatBox — the central input where teachers begin building a unit.
 *
 * Flow:
 * 1. User fills in understanding + grade/subject/state
 * 2. Clicks "Start Planning"
 * 3. If NOT authenticated → auth modal appears (page behind blurs)
 * 4. After auth → continues with unit creation seamlessly
 * 5. If already authenticated → skips modal, goes straight to AI
 */
export function HeroChatBox() {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [state, setState] = useState("");
  const [understanding, setUnderstanding] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [error, setError] = useState("");

  /* Auth modal state */
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  /* Check auth status on mount (non-blocking) */
  useEffect(() => {
    fetch("/api/auth/check")
      .then((r) => r.json())
      .then((data) => setIsAuthenticated(data.authenticated))
      .catch(() => setIsAuthenticated(false));
  }, []);

  /* Rotate loading messages while AI processes */
  useEffect(() => {
    if (!isLoading) return;
    const messages = [
      "Setting up your classroom context…",
      "Analyzing against Bloom's taxonomy…",
      "Mapping to state standards…",
      "Generating essential questions…",
    ];
    let i = 0;
    setLoadingMsg(messages[0]);
    const interval = setInterval(() => {
      i = (i + 1) % messages.length;
      setLoadingMsg(messages[i]);
    }, 2200);
    return () => clearInterval(interval);
  }, [isLoading]);

  /** Apply a quick-start template into the form */
  function applyTemplate(t: (typeof TEMPLATES)[number]) {
    setGrade(t.grade);
    setSubject(t.subject);
    setState(t.state);
    setUnderstanding(t.understanding);
    setTimeout(() => textareaRef.current?.focus(), 100);
  }

  /** The actual unit creation flow (called after auth is confirmed) */
  async function createUnit() {
    setError("");
    setIsLoading(true);

    try {
      // Step 1: Save classroom context
      const setupRes = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gradeLevel: grade, subject, state }),
      });
      if (!setupRes.ok) throw new Error("Failed to save classroom context");

      // Step 2: Create unit with AI analysis
      const unitRes = await fetch("/api/unit/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enduringUnderstanding: understanding.trim() }),
      });
      if (!unitRes.ok) {
        const data = await unitRes.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create unit");
      }

      const { unitId } = await unitRes.json();
      router.push(`/unit/${unitId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setIsLoading(false);
    }
  }

  /** Submit handler — checks auth first */
  async function handleSubmit() {
    if (!grade || !subject || !state) {
      setError("Please select a grade level, subject, and state.");
      return;
    }
    if (!understanding.trim()) {
      setError("Describe what students should understand.");
      return;
    }

    // If we haven't checked auth yet, check now
    if (isAuthenticated === null) {
      try {
        const res = await fetch("/api/auth/check");
        const data = await res.json();
        setIsAuthenticated(data.authenticated);
        if (!data.authenticated) {
          setShowAuthModal(true);
          return;
        }
      } catch {
        // Can't check — try to proceed, server will handle it
      }
    } else if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    // Authenticated — proceed with unit creation
    createUnit();
  }

  /** Called when auth modal succeeds */
  function handleAuthSuccess() {
    setShowAuthModal(false);
    setIsAuthenticated(true);
    // Continue with unit creation
    createUnit();
  }

  const canSubmit = grade && subject && state && understanding.trim() && !isLoading;

  return (
    <>
      {/* Blur overlay when auth modal is showing */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[90] bg-ink/20 backdrop-blur-sm" aria-hidden="true" />
      )}

      {/* Auth modal */}
      <AuthModal
        isOpen={showAuthModal}
        onSuccess={handleAuthSuccess}
        onClose={() => setShowAuthModal(false)}
      />

      <div className="w-full">
        {/* --- The Chat Box --- */}
        <div
          className="animate-hero-box mx-auto w-full max-w-3xl rounded-2xl border border-ruled bg-paper shadow-[0_2px_24px_rgba(27,42,74,0.08),0_0_0_1px_rgba(27,42,74,0.03)]"
          role="form"
          aria-label="Unit plan builder"
        >
          {/* Textarea */}
          <div className="p-4 pb-2 sm:p-5 sm:pb-3">
            <textarea
              ref={textareaRef}
              value={understanding}
              onChange={(e) => setUnderstanding(e.target.value)}
              placeholder="What should students understand by the end of this unit?"
              rows={3}
              disabled={isLoading}
              aria-label="Enduring understanding"
              className="w-full resize-none bg-transparent font-ui text-[15px] leading-relaxed text-graphite placeholder:text-pencil/60 focus:outline-none disabled:opacity-50 sm:text-base"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && canSubmit) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
          </div>

          {/* Divider */}
          <div className="mx-4 border-t border-ruled/60 sm:mx-5" />

          {/* Bottom bar: dropdowns + submit */}
          <div className="flex flex-wrap items-center gap-2 p-3 sm:gap-3 sm:p-4">
            {/* Grade selector */}
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              disabled={isLoading}
              aria-label="Grade level"
              className="focus-ring h-9 rounded-lg border border-ruled bg-cream px-3 font-ui text-xs font-medium text-graphite transition hover:border-ink-muted focus:border-ink sm:text-sm"
            >
              <option value="">Grade</option>
              {GRADES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>

            {/* Subject selector */}
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={isLoading}
              aria-label="Subject area"
              className="focus-ring h-9 rounded-lg border border-ruled bg-cream px-3 font-ui text-xs font-medium text-graphite transition hover:border-ink-muted focus:border-ink sm:text-sm"
            >
              <option value="">Subject</option>
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* State selector */}
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              disabled={isLoading}
              aria-label="State standards"
              className="focus-ring h-9 rounded-lg border border-ruled bg-cream px-3 font-ui text-xs font-medium text-graphite transition hover:border-ink-muted focus:border-ink sm:text-sm"
            >
              <option value="">State</option>
              {STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              aria-label="Start planning"
              className="focus-ring inline-flex h-9 items-center gap-1.5 rounded-lg bg-ink px-4 font-ui text-sm font-semibold text-white shadow-sm transition-all hover:bg-ink-light disabled:cursor-not-allowed disabled:opacity-40 sm:px-5"
            >
              {isLoading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span className="hidden sm:inline">Planning…</span>
                </>
              ) : (
                <>
                  Start Planning
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Loading message */}
        {isLoading && (
          <p className="mt-4 text-center font-ui text-sm text-pencil animate-hero-subtitle" role="status" aria-live="polite">
            {loadingMsg}
          </p>
        )}

        {/* Error message */}
        {error && (
          <p className="mt-3 text-center font-ui text-sm text-error" role="alert">
            {error}
          </p>
        )}

        {/* --- Quick-Start Pill Buttons --- */}
        <div className="animate-hero-pills mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {TEMPLATES.map((t) => (
            <button
              key={t.label}
              onClick={() => applyTemplate(t)}
              disabled={isLoading}
              className="focus-ring group inline-flex items-center gap-1.5 rounded-full border border-ruled bg-paper px-3.5 py-2 font-ui text-xs font-medium text-pencil shadow-sm transition-all hover:border-ink-muted hover:bg-cream hover:text-graphite hover:shadow-md disabled:opacity-40 sm:px-4 sm:text-sm"
            >
              <span className="text-base transition-transform group-hover:scale-110" role="img" aria-hidden="true">
                {t.icon}
              </span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
