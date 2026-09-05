"use client";

import { useState } from "react";
import { PRODUCT, STUDIO_LOGIN_API } from "@/lib/fbs-urls";

/**
 * The sign-in form — one field. First time is the sign-up, every time after
 * is the sign-in, and a Beer Bond is the same email. The studio sends the
 * link; the link lands the teacher back here at /auth/fbs, signed in.
 */
export function SignInForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "sent" | "error">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("busy");
    try {
      const res = await fetch(STUDIO_LOGIN_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, product: PRODUCT }),
      });
      setState(res.ok ? "sent" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <div className="rounded-lg border border-ruled bg-chalk p-4">
        <p className="font-ui text-sm font-semibold text-ink">Check your email.</p>
        <p className="mt-1 font-ui text-sm text-pencil">
          Your sign-in link is on its way to <span className="text-ink">{email}</span>. It works once and
          expires in fifteen minutes.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <label htmlFor="signin-email" className={`font-ui text-sm font-medium text-graphite ${compact ? "sr-only" : ""}`}>
        Your email
      </label>
      <input
        id="signin-email"
        type="email"
        required
        autoComplete="email"
        placeholder="you@school.org"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="focus-ring w-full rounded-lg border border-ruled bg-paper px-4 py-3 font-ui text-base text-ink placeholder:text-pencil/70"
      />
      {state === "error" && (
        <p className="font-ui text-sm text-red-700" role="alert">Couldn&rsquo;t send the link — try again.</p>
      )}
      <button
        type="submit"
        disabled={state === "busy"}
        className="focus-ring inline-flex w-full items-center justify-center rounded-lg bg-ink px-4 py-3 font-ui text-sm font-semibold text-white shadow-sm transition hover:bg-ink-light disabled:opacity-60"
      >
        {state === "busy" ? "Sending…" : "Email me a sign-in link"}
      </button>
      <p className="font-ui text-xs text-pencil">
        No password. New here? The same link creates your account. Have a Free Beer Studio Beer Bond? Same email — it already includes Backward Builder.
      </p>
    </form>
  );
}
