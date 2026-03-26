import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { teachers } from "@/db/schema";
import { eq } from "drizzle-orm";

const DEMO_SESSION_ID = "demo-ms-jones";

/**
 * GET /api/demo — Demo bypass for judges and visitors.
 *
 * Sets the teacher_session cookie to the demo teacher's session ID
 * and redirects to the dashboard so they can see both pre-seeded units.
 * If the demo teacher doesn't exist yet, returns a helpful message.
 */
export async function GET(request: Request) {
  // Check that the demo teacher exists in the database
  const [demoTeacher] = await db
    .select({ id: teachers.id })
    .from(teachers)
    .where(eq(teachers.sessionId, DEMO_SESSION_ID))
    .limit(1);

  if (!demoTeacher) {
    return new NextResponse(
      `<html>
        <body style="font-family: system-ui; max-width: 480px; margin: 80px auto; text-align: center;">
          <h1>Demo data not found</h1>
          <p>The demo teacher hasn't been seeded yet. Run:</p>
          <pre style="background: #f3f4f6; padding: 12px; border-radius: 8px;">npm run db:seed</pre>
          <p>Then try again.</p>
          <a href="/" style="color: #2d6a4f;">Back to home</a>
        </body>
      </html>`,
      {
        status: 404,
        headers: { "Content-Type": "text/html" },
      }
    );
  }

  // Set the teacher session cookie
  const cookieStore = await cookies();
  cookieStore.set("teacher_session", DEMO_SESSION_ID, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
  });

  // Redirect back to the landing page — it detects the session and
  // switches to the authenticated view (My Units / Shared / Community tabs)
  const url = new URL("/", request.url);
  return NextResponse.redirect(url);
}

/**
 * POST /api/demo — Fetch-friendly demo bypass.
 *
 * Sets the cookie and returns JSON (no redirect) so the auth modal
 * can activate the demo session without navigating away from the page.
 * This preserves chat box state during the sign-up flow.
 */
export async function POST() {
  const [demoTeacher] = await db
    .select({ id: teachers.id, displayName: teachers.displayName })
    .from(teachers)
    .where(eq(teachers.sessionId, DEMO_SESSION_ID))
    .limit(1);

  if (!demoTeacher) {
    return NextResponse.json(
      { error: "Demo data not found. Run npm run db:seed." },
      { status: 404 }
    );
  }

  const response = NextResponse.json({
    teacherId: demoTeacher.id,
    displayName: demoTeacher.displayName || "Ms. Jones",
  });

  response.cookies.set("teacher_session", DEMO_SESSION_ID, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });

  return response;
}
