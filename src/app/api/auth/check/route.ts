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
    return NextResponse.json({ authenticated: false }, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
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
    return NextResponse.json({ authenticated: false }, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  }

  return NextResponse.json({
    authenticated: true,
    teacherId: teacher.id,
    displayName: teacher.displayName,
    email: teacher.email,
  }, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

/**
 * Prevent Next.js from statically caching this route.
 * Auth state depends on cookies and must always be evaluated fresh.
 */
export const dynamic = "force-dynamic";
