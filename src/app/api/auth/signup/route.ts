import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { teachers } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * POST /api/auth/signup — Create a new teacher account.
 *
 * Accepts displayName (required) and email (optional).
 * Creates a session cookie and teacher record.
 * If the email already exists, returns an error directing to sign-in.
 */
export async function POST(request: Request) {
  try {
    const { displayName, email } = await request.json();

    if (!displayName?.trim()) {
      return NextResponse.json(
        { error: "Please enter your name." },
        { status: 400 }
      );
    }

    // If email provided, check it's not already taken
    if (email?.trim()) {
      const [existing] = await db
        .select({ id: teachers.id })
        .from(teachers)
        .where(eq(teachers.email, email.trim().toLowerCase()))
        .limit(1);

      if (existing) {
        return NextResponse.json(
          { error: "An account with this email already exists. Please sign in instead." },
          { status: 409 }
        );
      }
    }

    // Create a new session
    const sessionId = crypto.randomUUID();

    // Create teacher record
    const [teacher] = await db
      .insert(teachers)
      .values({
        sessionId,
        displayName: displayName.trim(),
        email: email?.trim()?.toLowerCase() || null,
      })
      .returning({ id: teachers.id, displayName: teachers.displayName });

    // Set the session cookie
    const cookieStore = await cookies();
    cookieStore.set("teacher_session", sessionId, {
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
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}
