"use client";

import { useEffect, useState } from "react";
import { OPEN_URL, PRODUCT, STUDIO_LOGIN_API, STUDIO_SUBSCRIBE_STATUS_API } from "@/lib/fbs-urls";

/**
 * After the payment: wait for the studio's webhook to write the subscription
 * (usually seconds), then walk through the studio's access door into the app.
 * If it takes too long, offer the email link instead.
 */
export function SubscribeThanks({ sessionId }: { sessionId: string }) {
  const [phase, setPhase] = useState<"waiting" | "ready" | "slow" | "sent" | "none">(sessionId ? "waiting" : "none");
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    let tries = 0, stop = false;
    const tick = async () => {
      if (stop) return;
      tries++;
      try {
        const res = await fetch(STUDIO_SUBSCRIBE_STATUS_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ session_id: sessionId }) });
        const s = await res.json();
        if (s.email) setEmail(s.email);
        if (s.fulfilled) { setPhase("ready"); window.location.href = OPEN_URL; return; }
      } catch { /* keep trying */ }
      if (tries >= 20) { setPhase("slow"); return; }
      setTimeout(tick, 2500);
    };
    tick();
    return () => { stop = true; };
  }, [sessionId]);

  async function sendLink() {
    if (!email) return;
    await fetch(STUDIO_LOGIN_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, product: PRODUCT }) });
    setPhase("sent");
  }

  if (phase === "none") return <p className="font-ui text-sm text-graphite">We couldn&rsquo;t match this page to a payment. If you did subscribe, <a href="/signin" className="underline">sign in</a> with the email you paid with.</p>;
  if (phase === "ready") return <p className="font-ui text-sm text-graphite">Payment received. Opening Backward Builder…</p>;
  if (phase === "sent") return <p className="font-ui text-sm text-graphite">Your sign-in link is on its way to {email}. It puts you straight in.</p>;
  if (phase === "slow") return (
    <div className="font-ui text-sm text-graphite">
      <p>Your payment went through; the account is taking a moment to switch on.</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <a href={OPEN_URL} className="focus-ring inline-flex items-center rounded-lg bg-ink px-4 py-2 font-semibold text-white hover:bg-ink-light">Try opening it</a>
        {email && <button onClick={sendLink} type="button" className="focus-ring inline-flex items-center rounded-lg border border-ruled bg-paper px-4 py-2 font-semibold text-ink hover:bg-chalk">Email me a sign-in link</button>}
      </div>
    </div>
  );
  return <p className="font-ui text-sm text-graphite" aria-live="polite">Payment received. Switching your account on…</p>;
}
