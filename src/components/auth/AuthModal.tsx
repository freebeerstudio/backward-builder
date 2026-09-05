"use client";

import { useEffect } from "react";
import { SIGN_IN_URL } from "@/lib/fbs-urls";

type Mode = "signup" | "signin";

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: Mode;
  /** Kept for the callers; never fires — sign-in completes with a page load from /auth/fbs. */
  onSuccess?: (teacher: { teacherId: string; displayName: string }) => void;
  onClose: () => void;
}

/**
 * AuthModal — since 2026-09-04 this is one door, not a form. Free Beer Studio
 * is the login: sign up and sign in are the same email link, sent from the
 * studio's page for Backward Builder. No passwords, nothing typed here.
 */
export function AuthModal({ isOpen, initialMode, onClose }: AuthModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  const signingUp = initialMode !== "signin";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="auth-title">
      <div className="w-full max-w-md rounded-2xl border border-ruled bg-paper p-8 shadow-[0_8px_40px_rgba(27,42,74,0.18)]">
        <h2 id="auth-title" className="font-display text-2xl font-semibold text-ink">
          {signingUp ? "Create your account" : "Sign in"}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-pencil">
          One email, no password. We send you a link; the first one creates your
          account and every one after signs you in. Backward Builder is $15 a month —
          or included with a Free Beer Studio Beer Bond, same email.
        </p>
        <a
          href={SIGN_IN_URL}
          className="focus-ring mt-6 inline-flex w-full items-center justify-center rounded-lg bg-ink px-4 py-3 font-ui text-sm font-semibold text-white shadow-sm transition hover:bg-ink-light"
        >
          Continue with your email
        </a>
        <a href="/api/demo" className="focus-ring mt-3 inline-flex w-full items-center justify-center rounded-lg px-4 py-2.5 font-ui text-sm font-medium text-pencil transition hover:bg-chalk hover:text-graphite">
          Or try the demo first
        </a>
        <p className="mt-5 text-center text-xs text-pencil">Accounts by Free Beer Studio</p>
        <button onClick={onClose} className="focus-ring mt-2 w-full rounded-lg px-3 py-2 text-xs text-pencil hover:text-ink" type="button">Close</button>
      </div>
    </div>
  );
}
