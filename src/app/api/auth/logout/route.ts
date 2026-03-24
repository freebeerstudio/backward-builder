import { NextResponse } from "next/server";

/**
 * POST /api/auth/logout — Clear the teacher session cookie.
 *
 * Sets the cookie to empty with maxAge=0 directly on the response object.
 * This is more reliable than using cookies().delete() which doesn't always
 * work in Next.js App Router.
 */
export async function POST() {
  const response = NextResponse.json({ success: true });

  // Set cookie to expire immediately — directly on the response
  response.cookies.set("teacher_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return response;
}

/**
 * GET /api/auth/logout — Fallback for direct navigation.
 */
export async function GET(request: Request) {
  const url = new URL("/", request.url);
  const response = NextResponse.redirect(url);

  response.cookies.set("teacher_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return response;
}
