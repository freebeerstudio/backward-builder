import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * POST /api/auth/logout — Clear the teacher session cookie.
 * Redirects back to the landing page in its unauthenticated state.
 */
export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("teacher_session");

  return NextResponse.json({ success: true });
}

/**
 * GET /api/auth/logout — For simple link-based logout.
 */
export async function GET(request: Request) {
  const cookieStore = await cookies();
  cookieStore.delete("teacher_session");

  const url = new URL("/", request.url);
  return NextResponse.redirect(url);
}
