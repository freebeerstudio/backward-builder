"use client";

import { useState, useEffect, useRef } from "react";

type Mode = "signup" | "signin";

interface AuthModalProps {
  /** Whether the modal is visible */
  isOpen: boolean;
  /** Initial mode — "signup" or "signin" */
  initialMode?: Mode;
  /** Called when auth succeeds — parent continues with unit creation */
  onSuccess: (teacher: { teacherId: string; displayName: string }) => void;
  /** Called when user closes the modal without signing in */
  onClose: () => void;
}

/**
 * AuthModal — a glass-morphism overlay that appears when an unauthenticated
 * user tries to create a unit. The page behind is blurred (handled by parent)
 * and this modal slides in asking for name + optional email.
 *
 * Two modes:
 * - Sign Up: name (required) + email (optional) → creates account
 * - Sign In: email (required) → finds existing account
 *
 * No passwords — email is identity for this MVP. Production would use magic links.
 */
export function AuthModal({ isOpen, initialMode, onSuccess, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>(initialMode || "signup");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  /* Sync initialMode when it changes */
  useEffect(() => {
    if (initialMode) setMode(initialMode);
  }, [initialMode]);

  /* Focus first input when modal opens */
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (mode === "signup") {
          nameInputRef.current?.focus();
        } else {
          emailInputRef.current?.focus();
        }
      }, 100);
    }
  }, [isOpen, mode]);

  /* Close on Escape key */
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  async function handleSignUp() {
    if (!displayName.trim()) {
      setError("Please enter your name.");
      nameInputRef.current?.focus();
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName.trim(),
          email: email.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          // Email exists — switch to sign-in mode
          setMode("signin");
          setError("That email already has an account. Sign in below.");
        } else {
          setError(data.error || "Failed to create account.");
        }
        setIsLoading(false);
        return;
      }

      onSuccess(data);
    } catch {
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  }

  async function handleSignIn() {
    if (!email.trim()) {
      setError("Please enter your email address.");
      emailInputRef.current?.focus();
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 404) {
          setError("No account found. Create one above.");
          setMode("signup");
        } else {
          setError(data.error || "Failed to sign in.");
        }
        setIsLoading(false);
        return;
      }

      onSuccess(data);
    } catch {
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "signup") handleSignUp();
    else handleSignIn();
  }

  return (
    /* Backdrop — clicking outside closes */
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={mode === "signup" ? "Create your account" : "Sign in to your account"}
    >
      {/* Modal card */}
      <div className="w-full max-w-md rounded-2xl border border-ruled bg-paper shadow-[0_8px_40px_rgba(27,42,74,0.15)] animate-hero-box">
        {/* Header */}
        <div className="border-b border-ruled px-6 pb-4 pt-6">
          <h2 className="font-display text-2xl text-ink">
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </h2>
          <p className="mt-1 font-ui text-sm text-pencil">
            {mode === "signup"
              ? "Your units will be saved to your account."
              : "Sign in to access your units."}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-5">
          {mode === "signup" ? (
            <>
              {/* Name field */}
              <label className="block">
                <span className="font-ui text-xs font-semibold uppercase tracking-wider text-ink/60">
                  Your Name <span className="text-error">*</span>
                </span>
                <input
                  ref={nameInputRef}
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g., Mrs. Crabapple"
                  disabled={isLoading}
                  className="focus-ring mt-1.5 w-full rounded-lg border border-ruled bg-cream px-3.5 py-2.5 font-ui text-sm text-graphite placeholder:text-pencil/50 transition hover:border-ink-muted focus:border-ink disabled:opacity-50"
                />
              </label>

              {/* Email field (optional) */}
              <label className="mt-4 block">
                <span className="font-ui text-xs font-semibold uppercase tracking-wider text-ink/60">
                  Email <span className="text-pencil/40">(optional — for sign-in later)</span>
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="teacher@school.edu"
                  disabled={isLoading}
                  className="focus-ring mt-1.5 w-full rounded-lg border border-ruled bg-cream px-3.5 py-2.5 font-ui text-sm text-graphite placeholder:text-pencil/50 transition hover:border-ink-muted focus:border-ink disabled:opacity-50"
                />
              </label>
            </>
          ) : (
            /* Sign-in: email only */
            <label className="block">
              <span className="font-ui text-xs font-semibold uppercase tracking-wider text-ink/60">
                Email Address
              </span>
              <input
                ref={emailInputRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teacher@school.edu"
                disabled={isLoading}
                className="focus-ring mt-1.5 w-full rounded-lg border border-ruled bg-cream px-3.5 py-2.5 font-ui text-sm text-graphite placeholder:text-pencil/50 transition hover:border-ink-muted focus:border-ink disabled:opacity-50"
              />
            </label>
          )}

          {/* Error */}
          {error && (
            <p className="mt-3 font-ui text-sm text-error" role="alert">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="focus-ring mt-5 w-full rounded-lg bg-ink py-2.5 font-ui text-sm font-semibold text-white shadow-sm transition hover:bg-ink-light disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {mode === "signup" ? "Creating account…" : "Signing in…"}
              </span>
            ) : mode === "signup" ? (
              "Create Account & Start Planning"
            ) : (
              "Sign In"
            )}
          </button>

          {/* Mode switcher */}
          <p className="mt-4 text-center font-ui text-sm text-pencil">
            {mode === "signup" ? (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => { setMode("signin"); setError(""); }}
                  className="focus-ring font-medium text-ink underline-offset-2 hover:underline"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                New here?{" "}
                <button
                  type="button"
                  onClick={() => { setMode("signup"); setError(""); }}
                  className="focus-ring font-medium text-ink underline-offset-2 hover:underline"
                >
                  Create an account
                </button>
              </>
            )}
          </p>

          {/* Demo bypass */}
          <div className="mt-4 border-t border-ruled pt-4 text-center">
            <a
              href="/api/demo"
              className="focus-ring inline-flex items-center gap-1.5 font-ui text-xs font-medium text-pencil/70 transition hover:text-pencil"
            >
              <span>Or try the demo as Mrs. Crabapple</span>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
