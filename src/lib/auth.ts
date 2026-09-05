import { cookies } from "next/headers";
import { db } from "@/db";
import { teachers, units } from "@/db/schema";
import { eq } from "drizzle-orm";
import { checkFbsAccess } from "@/lib/fbs";

/**
 * Shared authentication utilities for API routes and server components.
 *
 * Every mutation (create, update, delete, generate) must validate that
 * the current session owns the resource being modified.
 */

interface AuthResult {
  authenticated: false;
  teacherId?: undefined;
  sessionId?: undefined;
}

interface AuthenticatedResult {
  authenticated: true;
  teacherId: string;
  sessionId: string;
  displayName: string | null;
  /** May this teacher use the tool? Demo teachers always; others when the studio says so (subscription or Beer Bond). */
  access: boolean;
}

const REFRESH_MS = 24 * 60 * 60 * 1000;

/**
 * Get the current authenticated teacher from the session cookie.
 * Returns null if not authenticated.
 */
export async function getAuthenticatedTeacher(): Promise<AuthenticatedResult | AuthResult> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("teacher_session")?.value;

  if (!sessionId) {
    return { authenticated: false };
  }

  const [teacher] = await db
    .select({
      id: teachers.id,
      sessionId: teachers.sessionId,
      displayName: teachers.displayName,
      email: teachers.email,
      isDemo: teachers.isDemo,
      fbsAccess: teachers.fbsAccess,
      fbsCheckedAt: teachers.fbsCheckedAt,
    })
    .from(teachers)
    .where(eq(teachers.sessionId, sessionId))
    .limit(1);

  if (!teacher) {
    return { authenticated: false };
  }

  // Once a day, ask the studio again — a lapsed subscription or a refund
  // reaches us without a redirect. If the studio can't be reached, the cached
  // answer stands.
  let access = !!teacher.fbsAccess;
  if (!teacher.isDemo && teacher.email) {
    const stale = !teacher.fbsCheckedAt || Date.now() - teacher.fbsCheckedAt.getTime() > REFRESH_MS;
    if (stale) {
      const fresh = await checkFbsAccess(teacher.email);
      if (fresh) {
        access = fresh.access;
        await db
          .update(teachers)
          .set({ fbsAccess: fresh.access, fbsVia: fresh.via, fbsBond: fresh.bond_number, fbsCheckedAt: new Date() })
          .where(eq(teachers.id, teacher.id));
      }
    }
  }

  return {
    authenticated: true,
    teacherId: teacher.id,
    sessionId: teacher.sessionId,
    displayName: teacher.displayName,
    access: !!teacher.isDemo || access,
  };
}

/**
 * Validate that the current session owns a specific unit.
 * Returns the teacher ID if valid, or null if not authorized.
 *
 * Use this in every API route that modifies unit data:
 *   const auth = await validateUnitOwnership(unitId);
 *   if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
 */
export async function validateUnitOwnership(
  unitId: string
): Promise<{ teacherId: string; unitTeacherId: string } | null> {
  const auth = await getAuthenticatedTeacher();
  if (!auth.authenticated) return null;

  const [unit] = await db
    .select({ teacherId: units.teacherId })
    .from(units)
    .where(eq(units.id, unitId))
    .limit(1);

  if (!unit) return null;
  if (unit.teacherId !== auth.teacherId) return null;

  return { teacherId: auth.teacherId, unitTeacherId: unit.teacherId };
}
