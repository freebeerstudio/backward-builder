import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { teachers, units } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSessionId } from "@/lib/teacher-session";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "My Units — Backward Builder",
};

const statusConfig: Record<string, { label: string; classes: string }> = {
  stage1: {
    label: "Stage 1 — Desired Results",
    classes: "bg-blue-100 text-blue-800",
  },
  stage2: {
    label: "Stage 2 — Evidence",
    classes: "bg-yellow-100 text-yellow-800",
  },
  stage3: {
    label: "Stage 3 — Learning Plan",
    classes: "bg-orange-100 text-orange-800",
  },
  complete: {
    label: "Complete",
    classes: "bg-green-100 text-green-800",
  },
};

export default async function DashboardPage() {
  const sessionId = await getSessionId();

  if (!sessionId) {
    redirect("/");
  }

  // Get the teacher for this session
  const [teacher] = await db
    .select()
    .from(teachers)
    .where(eq(teachers.sessionId, sessionId))
    .limit(1);

  if (!teacher) {
    redirect("/");
  }

  // Get all units for this teacher
  const teacherUnits = await db
    .select()
    .from(units)
    .where(eq(units.teacherId, teacher.id))
    .orderBy(units.createdAt);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-warmwhite pb-16">
        <PageContainer wide className="py-10">
          {/* Page heading */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-3xl font-bold text-forest-dark">
                {teacher.displayName
                  ? `${teacher.displayName}\u2019s Units`
                  : "My Units"}
              </h1>
              {teacher.subject && teacher.gradeLevel && (
                <p className="mt-1 font-body text-text-light">
                  {teacher.subject} &middot; {teacher.gradeLevel}
                </p>
              )}
            </div>
            <Link
              href="/unit/new"
              className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 font-heading text-sm font-semibold text-forest-dark shadow-sm transition-all hover:bg-gold-light hover:shadow-md"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              Design a New Unit
            </Link>
          </div>

          {/* Units grid */}
          {teacherUnits.length === 0 ? (
            <Card className="mt-10 text-center">
              <p className="font-body text-text-light">
                No units yet. Design your first unit to get started!
              </p>
            </Card>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {teacherUnits.map((unit) => {
                const status = statusConfig[unit.status] ?? statusConfig.stage1;
                const preview = unit.enduringUnderstanding.length > 140
                  ? unit.enduringUnderstanding.slice(0, 140) + "\u2026"
                  : unit.enduringUnderstanding;

                return (
                  <Link key={unit.id} href={`/unit/${unit.id}`}>
                    <Card hover className="h-full">
                      {/* Status badge */}
                      <span
                        className={`inline-block rounded-full px-3 py-0.5 text-xs font-medium font-body ${status.classes}`}
                      >
                        {status.label}
                      </span>

                      {/* Title */}
                      <h2 className="mt-3 font-heading text-lg font-bold text-forest-dark">
                        {unit.title}
                      </h2>

                      {/* Enduring understanding preview */}
                      <p className="mt-2 font-body text-sm leading-relaxed text-text-light">
                        {preview}
                      </p>

                      {/* Cognitive level */}
                      {unit.cognitiveLevel && (
                        <p className="mt-3 text-xs font-medium text-forest">
                          Bloom&apos;s:{" "}
                          <span className="capitalize">
                            {unit.cognitiveLevel}
                          </span>
                        </p>
                      )}
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </PageContainer>
      </main>
    </>
  );
}
