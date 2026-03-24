import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { teachers } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * GET /api/auth/check — Check if the current user is authenticated.
 *
 * Used by client components (like HeroChatBox) to determine
 * whether to show the auth modal before creating a unit.
 */
export async function GET() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("teacher_session")?.value;

  if (!sessionId) {
    return NextResponse.json({ authenticated: false });
  }

  const [teacher] = await db
    .select({
      id: teachers.id,
      displayName: teachers.displayName,
      email: teachers.email,
    })
    .from(teachers)
    .where(eq(teachers.sessionId, sessionId))
    .limit(1);

  if (!teacher) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({
    authenticated: true,
    teacherId: teacher.id,
    displayName: teacher.displayName,
    email: teacher.email,
  });
}
