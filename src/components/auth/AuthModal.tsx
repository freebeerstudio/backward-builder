"use client";

import { useEffect, useState } from "react";
import { SignInForm } from "@/components/auth/SignInForm";

type Mode = "signup" | "signin";

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: Mode;
  /** Kept for the callers; never fires — sign-in completes with a page load from /auth/fbs. */
  onSuccess?: (teacher: { teacherId: string; displayName: string }) => void;
  onClose: () => void;
}

/**
 * AuthModal — one field, our style. Sign up and sign in are the same email
 * link; Free Beer Studio sends it and we receive the teacher at /auth/fbs.
 */
export function AuthModal({ isOpen, initialMode, onClose }: AuthModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const [mode, setMode] = useState<Mode>(initialMode ?? "signup");
  const [seenInitial, setSeenInitial] = useState(initialMode);
  if (initialMode !== seenInitial) {            // parent switched modes: follow it (state adjusted during render, no effect)
    setSeenInitial(initialMode);
    setMode(initialMode ?? "signup");
  }
  if (!isOpen) return null;
  const signingUp = mode !== "signin";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="auth-title">
      <div className="w-full max-w-md rounded-2xl border border-ruled bg-paper p-8 shadow-[0_8px_40px_rgba(27,42,74,0.18)]">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="auth-title" className="font-display text-2xl font-semibold text-ink">
              {signingUp ? "Create your account" : "Sign in"}
            </h2>
            <p className="mt-1 font-ui text-sm text-pencil">
              {signingUp ? "$15 a month, cancel any time. Email and card on one page — you’re in the moment it clears." : "We’ll email you a link."}
            </p>
          </div>
          <button onClick={onClose} type="button" aria-label="Close" className="focus-ring rounded-md px-2 py-1 text-pencil hover:text-ink">✕</button>
        </div>
        {signingUp ? (
          <a href="/subscribe" className="focus-ring inline-flex w-full items-center justify-center rounded-lg bg-ink px-4 py-3 font-ui text-sm font-semibold text-white shadow-sm transition hover:bg-ink-light">
            Sign up — $15/month
          </a>
        ) : (
          <SignInForm compact />
        )}
        <button type="button" onClick={() => setMode(signingUp ? "signin" : "signup")} className="focus-ring mt-3 w-full rounded-lg px-3 py-2 font-ui text-sm text-pencil hover:text-ink">
          {signingUp ? "Already have an account? Sign in" : "New here? Create your account"}
        </button>
        <a href="/api/demo" className="focus-ring mt-4 inline-flex w-full items-center justify-center rounded-lg px-4 py-2.5 font-ui text-sm font-medium text-pencil transition hover:bg-chalk hover:text-graphite">
          Or try the demo first
        </a>
      </div>
    </div>
  );
}
