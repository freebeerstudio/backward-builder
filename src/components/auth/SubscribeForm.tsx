"use client";

import { useEffect, useRef, useState } from "react";
import { loadStripe, type Stripe, type StripeElements } from "@stripe/stripe-js";
import { PRODUCT, STUDIO_SUBSCRIBE_COMPLETE_API, STUDIO_SUBSCRIBE_CONFIG_API, STUDIO_SUBSCRIBE_START_API } from "@/lib/fbs-urls";

/**
 * Sign-up IS the payment form: email and card on one page, our styling
 * (Stripe's Payment Element with the Appearance API — the inputs are Stripe's
 * for PCI reasons, the look is ours). One submit: the studio starts the
 * subscription for the email, we confirm the card, the studio verifies the
 * invoice is paid and hands back a grant, and /auth/fbs signs the teacher in.
 * No magic link on the way in; that's only for coming back.
 */
const APPEARANCE = {
  theme: "stripe" as const,
  variables: {
    colorPrimary: "#1B2A4A",
    colorBackground: "#FFFFFF",
    colorText: "#1A1A2E",
    colorTextSecondary: "#5A5A72",
    colorTextPlaceholder: "#9A9AAE",
    colorDanger: "#B42318",
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    fontSizeBase: "15px",
    borderRadius: "8px",
    spacingUnit: "4px",
  },
  rules: {
    ".Input": { border: "1px solid #E2DCD3", boxShadow: "none", padding: "12px 14px" },
    ".Input:focus": { border: "1px solid #1B2A4A", boxShadow: "0 0 0 2px rgba(27,42,74,0.15)" },
    ".Label": { fontWeight: "500", color: "#3D4A5C", marginBottom: "6px" },
    ".Tab": { border: "1px solid #E2DCD3", boxShadow: "none" },
    ".Tab--selected": { border: "1px solid #1B2A4A", boxShadow: "0 0 0 2px rgba(27,42,74,0.15)" },
    ".Block": { border: "1px solid #E2DCD3", boxShadow: "none" },
  },
};
const FONTS = [{ cssSrc: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600&display=swap" }];

export function SubscribeForm({ email: initialEmail }: { email: string | null }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const stripeRef = useRef<Stripe | null>(null);
  const elementsRef = useRef<StripeElements | null>(null);
  const [email, setEmail] = useState(initialEmail ?? "");
  const [amount, setAmount] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const cfg = await (await fetch(STUDIO_SUBSCRIBE_CONFIG_API)).json();
        if (!cfg.publishableKey) throw new Error("Billing isn't available right now.");
        const stripe = await loadStripe(cfg.publishableKey);
        if (!stripe || cancelled) return;
        stripeRef.current = stripe;
        setAmount(cfg.amountUsd);
        const elements = stripe.elements({
          mode: "subscription", amount: cfg.amountUsd * 100, currency: cfg.currency,
          paymentMethodTypes: ["card"],            // card only: no wallet tabs, no Link block — one quiet form
          appearance: APPEARANCE, fonts: FONTS,
        });
        elementsRef.current = elements;
        const payment = elements.create("payment", {
          layout: "accordion",
          fields: { billingDetails: { email: "never", address: { country: "never" } } },   // our email field; US teachers
          wallets: { applePay: "never", googlePay: "never", link: "never" },
        });
        if (mountRef.current) payment.mount(mountRef.current);
        payment.on("ready", () => setReady(true));
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const stripe = stripeRef.current, elements = elementsRef.current;
    if (!stripe || !elements) return;
    setBusy(true); setError(null);
    try {
      const { error: formErr } = await elements.submit();
      if (formErr) throw new Error(formErr.message ?? "Check the payment details.");

      const started = await fetch(STUDIO_SUBSCRIBE_START_API, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: PRODUCT, email: email.trim() }),
      });
      const { clientSecret, subscriptionId, error: startErr } = await started.json();
      if (!started.ok || !clientSecret) throw new Error(startErr ?? "Couldn't start the subscription.");

      const { error: payErr } = await stripe.confirmPayment({
        elements, clientSecret, redirect: "if_required",
        confirmParams: {
          return_url: `${window.location.origin}/subscribe/thanks?subscription_id=${encodeURIComponent(subscriptionId)}`,
          payment_method_data: { billing_details: { email: email.trim(), address: { country: "US" } } },
        },
      });
      if (payErr) throw new Error(payErr.message ?? "The payment didn't go through.");

      // Paid (no redirect needed). Let the studio verify and hand us the grant.
      for (let i = 0; i < 6; i++) {
        const done = await (await fetch(STUDIO_SUBSCRIBE_COMPLETE_API, {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subscriptionId }),
        })).json();
        if (done.grant) { window.location.href = `/auth/fbs?fbs_grant=${encodeURIComponent(done.grant)}`; return; }
        await new Promise((r) => setTimeout(r, 1500));
      }
      window.location.href = `/subscribe/thanks?subscription_id=${encodeURIComponent(subscriptionId)}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="sub-email" className="mb-1.5 block font-ui text-sm font-medium text-graphite">Email</label>
        <input
          id="sub-email" type="email" required autoComplete="email" placeholder="you@school.org"
          value={email} onChange={(e) => setEmail(e.target.value)}
          className="focus-ring w-full rounded-lg border border-ruled bg-paper px-3.5 py-3 font-ui text-[15px] text-ink placeholder:text-pencil/60"
        />
        <p className="mt-1.5 font-ui text-xs text-pencil">Your account is this email — no password, ever.</p>
      </div>
      <div ref={mountRef} className={ready ? "" : "min-h-[220px] animate-pulse rounded-lg bg-chalk"} />
      {error && <p className="rounded-lg border border-ruled bg-chalk px-3 py-2 font-ui text-sm text-red-700" role="alert">{error}</p>}
      <button
        type="submit" disabled={!ready || busy}
        className="focus-ring inline-flex w-full items-center justify-center rounded-lg bg-ink px-4 py-3 font-ui text-sm font-semibold text-white shadow-sm transition hover:bg-ink-light disabled:opacity-60"
      >
        {busy ? "Subscribing…" : amount ? `Subscribe — $${amount}/month` : "Subscribe"}
      </button>
      <p className="font-ui text-xs text-pencil">
        Billed monthly by Free Beer Studio until you cancel. You&rsquo;re in the moment the payment clears.
      </p>
    </form>
  );
}
