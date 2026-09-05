import { NextResponse } from "next/server";
import { SIGN_IN_URL } from "@/lib/fbs-urls";

/**
 * Retired 2026-09-04. This route used to set a session for any email typed
 * into it, unverified. Free Beer Studio is the login now — the studio's
 * sign-in page emails a link, and /auth/fbs turns the signed grant into a
 * session. Nothing here can create or claim an account any more.
 */
export async function POST() {
  return NextResponse.json({ error: "Sign in moved to Free Beer Studio.", signInUrl: SIGN_IN_URL }, { status: 410 });
}
