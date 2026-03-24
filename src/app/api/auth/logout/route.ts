import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * POST /api/auth/logout — Clear the teacher session cookie.
 */
export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set("teacher_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0, // Expire immediately
    path: "/",
  });

  return NextResponse.json({ success: true });
}

/**
 * GET /api/auth/logout — For link-based logout.
 * Sets cookie to expire immediately, then redirects to home.
 */
export async function GET(request: Request) {
  const url = new URL("/", request.url);
  const response = NextResponse.redirect(url);

  // Explicitly expire the cookie on the response
  response.cookies.set("teacher_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return response;
}
