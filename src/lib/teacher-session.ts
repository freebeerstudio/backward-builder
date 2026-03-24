import { cookies } from "next/headers";

const COOKIE_NAME = "teacher_session";

/**
 * Gets the teacher session ID from cookies, or creates a new one.
 * No auth required — teachers are identified by a persistent cookie.
 * This keeps the UX frictionless while still associating assessments
 * with the teacher who created them.
 */
export async function getOrCreateSessionId(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(COOKIE_NAME)?.value;

  if (existing) {
    return existing;
  }

  const sessionId = crypto.randomUUID();
  cookieStore.set(COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
  });

  return sessionId;
}

/** Gets the current session ID without creating a new one */
export async function getSessionId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}
