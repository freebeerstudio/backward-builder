// Client-safe constants for the Free Beer Studio login and billing (no node
// imports here — client components import from this file; the server-only
// grant verification lives in src/lib/fbs.ts).
//
// The pages are OURS — /signin and /subscribe look like the rest of Backward
// Builder. Behind them, the studio does the work: it sends the sign-in link,
// creates the Stripe session, and answers whether a payment has landed.
export const PRODUCT = "backward-builder";
export const STUDIO = "https://freebeer.ai";
export const SIGN_IN_URL = "/signin";
export const SUBSCRIBE_URL = "/subscribe";
export const ACCOUNT_URL = `${STUDIO}/account`;
export const STUDIO_LOGIN_API = `${STUDIO}/api/auth/login`;
export const STUDIO_SUBSCRIBE_SESSION_API = `${STUDIO}/api/subscribe/session`;
export const STUDIO_SUBSCRIBE_STATUS_API = `${STUDIO}/api/subscribe/status`;
/** After a paid subscription: the studio's access door, back to our callback. */
export const OPEN_URL = `${STUDIO}/access?product=${PRODUCT}&return=${encodeURIComponent("https://backwardbuilder.com/auth/fbs")}`;
