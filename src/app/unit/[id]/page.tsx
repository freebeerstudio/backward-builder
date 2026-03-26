import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { db } from "@/db";
import { teachers } from "@/db/schema";
import { resolveStandardUrls } from "@/lib/standards-urls";
import { fetchStandardsFromCSP } from "@/lib/standards/csp-client";
// standards-urls is the URL resolver; standards/ is the verified database
import {
  units,
  performanceTasks,
  checksForUnderstanding,
  learningActivities,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { Header } from "@/components/layout/Header";
import { UbDProgressIndicator } from "@/components/unit/UbDProgressIndicator";
import { UnitOverview } from "@/components/unit/UnitOverview";
import type { CognitiveLevel } from "@/types";

interface UnitPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: UnitPageProps): Promise<Metadata> {
  const { id } = await params;
  const [unit] = await db
    .select({ title: units.title })
    .from(units)
    .where(eq(units.id, id))
    .limit(1);

  return {
    title: unit ? unit.title : "Unit Not Found",
  };
}

/**
 * Unit overview page — the 5-stage UbD dashboard.
 *
 * Uses the academic editorial aesthetic: cream background, paper-white
 * cards, ink navy typography, ruled borders. Matches the landing page.
 */
export default async function UnitPage({ params }: UnitPageProps) {
  const { id } = await params;

  // Fetch unit and related data in parallel
  const [unitRows, tasks, checks, activities] = await Promise.all([
    db.select().from(units).where(eq(units.id, id)).limit(1),
    db
      .select({ id: performanceTasks.id })
      .from(performanceTasks)
      .where(eq(performanceTasks.unitId, id))
      .limit(1),
    db
      .select({ id: checksForUnderstanding.id })
      .from(checksForUnderstanding)
      .where(eq(checksForUnderstanding.unitId, id))
      .limit(1),
    db
      .select({ id: learningActivities.id })
      .from(learningActivities)
      .where(eq(learningActivities.unitId, id))
      .limit(1),
  ]);

  const unit = unitRows[0];
  if (!unit) {
    notFound();
  }

  // Fetch teacher for state/subject context (needed for standards URL resolution)
  const [teacher] = await db
    .select({
      id: teachers.id,
      sessionId: teachers.sessionId,
      displayName: teachers.displayName,
      gradeLevel: teachers.gradeLevel,
      state: teachers.state,
      subject: teachers.subject,
    })
    .from(teachers)
    .where(eq(teachers.id, unit.teacherId))
    .limit(1);

  // Determine if current visitor owns this unit
  const cookieStore = await cookies();
  const visitorSessionId = cookieStore.get("teacher_session")?.value;
  const isOwner = !!(visitorSessionId && teacher?.sessionId === visitorSessionId);
  const isAuthenticated = !!visitorSessionId;

  const hasTasks = tasks.length > 0;
  const hasChecks = checks.length > 0;
  const hasActivities = activities.length > 0;

  // Determine current stage and completed stages across the 5-stage flow
  const completedStages: number[] = [1];
  if (hasTasks && hasChecks) completedStages.push(2);
  if (hasActivities) completedStages.push(3);
  if (unit.status === "live" || unit.status === "complete") completedStages.push(4);
  // Stage 5 (results) is never "complete" — it's an ongoing dashboard

  let currentStage: 1 | 2 | 3 | 4 | 5 = 1;
  if (unit.status === "live" || unit.status === "complete") currentStage = 5;
  else if (unit.status === "ready") currentStage = 3; // design done, show stage 3 as current
  else if (hasActivities) currentStage = 3;
  else if (hasTasks && hasChecks) currentStage = 2;

  // Resolve standard URLs deterministically — never trust Claude's URLs.
  const standardCodes = unit.standardCodes as string[] | null;
  const resolvedUrls = standardCodes
    ? resolveStandardUrls(standardCodes, teacher?.state || undefined, teacher?.subject || undefined)
    : null;

  // Resolve CSP metadata (title, subject, education levels) for the popover.
  // If the unit already has this data stored, use it. Otherwise fetch from
  // CSP API at render time — this ensures ALL units get rich popovers,
  // including ones created before we added the CSP metadata columns.
  let setTitles = unit.standardSetTitles as (string | null)[] | null;
  let setSubjects = unit.standardSetSubjects as (string | null)[] | null;
  let setLevels = unit.standardSetLevels as (string[] | null)[] | null;

  const hasCspMetadata = setTitles && setTitles.some((t) => t !== null);
  if (!hasCspMetadata && standardCodes?.length && teacher?.state && teacher?.subject && teacher?.gradeLevel) {
    try {
      const cspStandards = await fetchStandardsFromCSP(teacher.state, teacher.subject, teacher.gradeLevel);
      if (cspStandards && cspStandards.length > 0) {
        // Build a lookup map from code → CSP metadata
        const cspMap = new Map(cspStandards.map((s) => [s.code, s]));
        // Use the first standard's set metadata as fallback for all (same set)
        const fallback = cspStandards[0];
        setTitles = standardCodes.map((code) => cspMap.get(code)?.setTitle || fallback.setTitle || null);
        setSubjects = standardCodes.map((code) => cspMap.get(code)?.setSubject || fallback.setSubject || null);
        setLevels = standardCodes.map((code) => cspMap.get(code)?.setEducationLevels || fallback.setEducationLevels || null);

        // Also backfill descriptions from CSP if they're more complete
        const storedDescriptions = unit.standardDescriptions as string[] | null;
        if (storedDescriptions) {
          for (let i = 0; i < standardCodes.length; i++) {
            const cspStd = cspMap.get(standardCodes[i]);
            if (cspStd?.description && (!storedDescriptions[i] || storedDescriptions[i].length < 10)) {
              storedDescriptions[i] = cspStd.description;
            }
          }
        }
      }
    } catch (e) {
      // CSP unavailable — gracefully show without metadata
      console.error("CSP metadata resolution failed:", e);
    }
  }

  // Serialize unit data for the client component
  const unitData = {
    id: unit.id,
    title: unit.title,
    enduringUnderstanding: unit.enduringUnderstanding,
    essentialQuestions: unit.essentialQuestions as string[] | null,
    standardCodes,
    standardDescriptions: unit.standardDescriptions as string[] | null,
    standardUrls: resolvedUrls,
    standardSetTitles: setTitles,
    standardSetSubjects: setSubjects,
    standardSetLevels: setLevels,
    cognitiveLevel: unit.cognitiveLevel as CognitiveLevel | null,
    cognitiveLevelExplanation: unit.cognitiveLevelExplanation,
    status: unit.status,
    isPublic: unit.isPublic,
  };

  return (
    <div className="min-h-screen bg-cream font-ui">
      <Header />
      <main className="flex-1 py-8 sm:py-12">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
          {/* Progress indicator */}
          <div className="mb-8 sm:mb-10">
            <UbDProgressIndicator
              currentStage={currentStage}
              completedStages={completedStages}
            />
          </div>

          {/* Unit overview with 5-stage cards */}
          <UnitOverview
            unit={unitData}
            hasTasks={hasTasks}
            hasChecks={hasChecks}
            hasActivities={hasActivities}
            isOwner={isOwner}
            isAuthenticated={isAuthenticated}
            authorName={teacher?.displayName || "Teacher"}
            gradeLevel={teacher?.gradeLevel || null}
            subject={teacher?.subject || null}
            state={teacher?.state || null}
          />
        </div>
      </main>
    </div>
  );
}
