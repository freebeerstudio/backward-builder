import { createPublicKey, verify } from "node:crypto";

/**
 * Free Beer Studio is the login — the access contract, product side.
 * Contract: https://github.com/freebeerstudio/brand-freebeer/blob/main/docs/ACCESS-CONTRACT.md
 *
 * Sign in / Sign up → the studio's sign-in page for this product (one email
 * field, no password). The emailed link brings the teacher to /auth/fbs with a
 * signed grant: email, and whether they have access (a $15/mo subscription or a
 * Beer Bond). We verify it offline with the studio's public key and set our own
 * session. Once a day we ask the studio again (the check door) so a lapsed
 * subscription or a refund reaches us without any redirect.
 */

import { PRODUCT } from "./fbs-urls";
export { PRODUCT, SIGN_IN_URL, SUBSCRIBE_URL, ACCOUNT_URL } from "./fbs-urls";

// The studio's grant-verification key. Public by definition; also served at
// https://freebeer.ai/.well-known/fbs-access.json (kid 2026-09-04).
const FBS_PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEAAAUsd4hNiCjxhMdbFn6GYbWilmg/Q2kTJ1Lqb0rGqfk=
-----END PUBLIC KEY-----`;

export type Grant = { sub: string; access: boolean; via: string | null; bond: number | null; exp: number };

/** A well-formed, unexpired, correctly signed grant for this product — or null. */
export function verifyFbsGrant(token: string): Grant | null {
  const [head, payload, sig] = token.split(".");
  if (head !== "fbs1" || !payload || !sig) return null;
  let ok = false;
  try {
    ok = verify(null, Buffer.from(`${head}.${payload}`), createPublicKey(FBS_PUBLIC_KEY_PEM), Buffer.from(sig, "base64url"));
  } catch { return null; }
  if (!ok) return null;
  let p: Grant & { v: number; iss: string; product: string };
  try { p = JSON.parse(Buffer.from(payload, "base64url").toString()); } catch { return null; }
  const now = Math.floor(Date.now() / 1000);
  if (p.v !== 1 || p.iss !== "freebeer.ai" || p.product !== PRODUCT || typeof p.exp !== "number" || p.exp < now) return null;
  if (typeof p.sub !== "string" || !p.sub.includes("@") || typeof p.access !== "boolean") return null;
  return { sub: p.sub.toLowerCase(), access: p.access, via: p.via ?? null, bond: p.bond ?? null, exp: p.exp };
}

/** The studio's check door: does this email have access right now? Null when the studio can't be asked. */
export async function checkFbsAccess(email: string): Promise<{ access: boolean; via: string | null; bond_number: number | null } | null> {
  const key = process.env.FBS_ACCESS_KEY;
  if (!key) return null;
  try {
    const res = await fetch("https://freebeer.ai/api/access/check", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const j = await res.json();
    return { access: !!j.access, via: j.via ?? null, bond_number: j.bond_number ?? null };
  } catch {
    return null;
  }
}
