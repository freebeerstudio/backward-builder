import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { teachers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyFbsGrant, SIGN_IN_URL, SUBSCRIBE_URL } from "@/lib/fbs";

/**
 * GET /auth/fbs?fbs_grant=<token> — where the studio's sign-in lands.
 *
 * Verify the grant, find the teacher by email or create one, cache the
 * studio's access answer, set our session cookie, and go home with the token
 * stripped from the URL. No access (no subscription, no Beer Bond) → the
 * studio's checkout, straight away: signing up IS subscribing (Wayne, 2026-09-05).
 * A bad or expired grant goes back to the sign-in page.
 */
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const grant = verifyFbsGrant(url.searchParams.get("fbs_grant") ?? "");
  if (!grant) return NextResponse.redirect(new URL(`${SIGN_IN_URL}?expired=1`, request.url));

  const email = grant.sub;
  let [teacher] = await db.select({ id: teachers.id, sessionId: teachers.sessionId }).from(teachers).where(eq(teachers.email, email)).limit(1);

  if (!teacher) {
    const displayName = email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    [teacher] = await db
      .insert(teachers)
      .values({ sessionId: crypto.randomUUID(), email, displayName, fbsAccess: grant.access, fbsVia: grant.via, fbsBond: grant.bond, fbsCheckedAt: new Date() })
      .returning({ id: teachers.id, sessionId: teachers.sessionId });
  } else {
    await db
      .update(teachers)
      .set({ fbsAccess: grant.access, fbsVia: grant.via, fbsBond: grant.bond, fbsCheckedAt: new Date() })
      .where(eq(teachers.id, teacher.id));
  }

  const cookieStore = await cookies();
  cookieStore.set("teacher_session", teacher.sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  if (!grant.access) return NextResponse.redirect(new URL(SUBSCRIBE_URL, request.url));
  return NextResponse.redirect(new URL("/", request.url));
}
