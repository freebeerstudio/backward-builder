import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { teachers } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * POST /api/auth/signin — Sign in with an existing email.
 *
 * Looks up the teacher by email, sets the session cookie.
 * No password — email is the identity for this MVP.
 * Production would add magic link or OAuth.
 */
export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email?.trim()) {
      return NextResponse.json(
        { error: "Please enter your email address." },
        { status: 400 }
      );
    }

    const [teacher] = await db
      .select()
      .from(teachers)
      .where(eq(teachers.email, email.trim().toLowerCase()))
      .limit(1);

    if (!teacher) {
      return NextResponse.json(
        { error: "No account found with this email. Would you like to sign up?" },
        { status: 404 }
      );
    }

    // Set the session cookie to this teacher's session
    const cookieStore = await cookies();
    cookieStore.set("teacher_session", teacher.sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });

    return NextResponse.json({
      teacherId: teacher.id,
      displayName: teacher.displayName,
    });
  } catch (error) {
    console.error("Signin error:", error);
    return NextResponse.json(
      { error: "Failed to sign in. Please try again." },
      { status: 500 }
    );
  }
}
