// Client-safe constants for the Free Beer Studio login (no node imports here —
// client components import from this file; the server-only verification lives
// in src/lib/fbs.ts).
export const PRODUCT = "backward-builder";
export const SIGN_IN_URL = `https://freebeer.ai/sign-in/${PRODUCT}`;
export const SUBSCRIBE_URL = `https://freebeer.ai/subscribe/${PRODUCT}`;
export const ACCOUNT_URL = "https://freebeer.ai/account";
