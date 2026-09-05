"use client";

import { useEffect, useRef, useState } from "react";
import { loadStripe, type StripeEmbeddedCheckout } from "@stripe/stripe-js";
import { PRODUCT, STUDIO_SUBSCRIBE_SESSION_API } from "@/lib/fbs-urls";

/**
 * The payment form, inside our page. The studio creates a Stripe Checkout
 * session in embedded mode and hands back its client secret and publishable
 * key; Stripe mounts the form here. Nothing about billing is configured on
 * this side.
 */
export function EmbeddedSubscribe({ email }: { email: string | null }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let checkout: StripeEmbeddedCheckout | null = null;
    (async () => {
      try {
        const res = await fetch(STUDIO_SUBSCRIBE_SESSION_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product: PRODUCT, email, return_url: `${window.location.origin}/subscribe/thanks` }),
        });
        if (!res.ok) throw new Error("Billing isn't available right now.");
        const { clientSecret, publishableKey } = await res.json();
        const stripe = await loadStripe(publishableKey);
        if (!stripe || cancelled) throw new Error("Couldn't load the payment form.");
        const page = await stripe.createEmbeddedCheckoutPage({ clientSecret });
        checkout = page;
        if (cancelled || !mountRef.current) { page.destroy(); return; }
        page.mount(mountRef.current);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    })();
    return () => { cancelled = true; checkout?.destroy(); };
  }, [email]);

  if (error) return <p className="rounded-lg border border-ruled bg-chalk px-4 py-3 font-ui text-sm text-graphite" role="alert">{error}</p>;
  return <div ref={mountRef} className="min-h-[420px]" aria-busy="true" />;
}
