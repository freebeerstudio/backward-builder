import { db } from "@/db";
import {
  units,
  performanceTasks,
  checksForUnderstanding,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { UbDProgressIndicator } from "@/components/unit/UbDProgressIndicator";
import { Card } from "@/components/ui/Card";
import { PublishClient } from "./PublishClient";

/**
 * Publish / Go Live page — final step before students can access assessments.
 *
 * Server component that fetches the unit, tasks, and checks, then
 * delegates all interactivity (publish button, share links) to PublishClient.
 */
export default async function PublishPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: unitId } = await params;

  // Load unit
  const [unit] = await db
    .select()
    .from(units)
    .where(eq(units.id, unitId))
    .limit(1);

  if (!unit) {
    notFound();
  }

  // Load selected performance task(s)
  const tasks = await db
    .select()
    .from(performanceTasks)
    .where(
      and(
        eq(performanceTasks.unitId, unitId),
        eq(performanceTasks.isSelected, true)
      )
    );

  // Load all checks
  const checks = await db
    .select()
    .from(checksForUnderstanding)
    .where(eq(checksForUnderstanding.unitId, unitId));

  const isPublished = unit.status === "complete";

  return (
    <div className="min-h-screen bg-warmwhite pb-16">
      <Header />
      <PageContainer className="pt-8 space-y-8">
        {/* Progress indicator — all 3 complete */}
        <UbDProgressIndicator
          currentStage={3}
          completedStages={[1, 2, 3]}
        />

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-forest">
            {isPublished ? "Unit Published!" : "Publish Your Unit"}
          </h1>
          <p className="text-text-light font-body">
            {unit.title}
          </p>
        </div>

        <PublishClient
          unitId={unitId}
          isPublished={isPublished}
          tasks={tasks.map((t) => ({
            id: t.id,
            title: t.title,
            shareCode: t.shareCode,
            status: t.status,
          }))}
          checks={checks.map((c) => ({
            id: c.id,
            title: c.title,
            shareCode: c.shareCode,
            status: c.status,
          }))}
        />
      </PageContainer>
    </div>
  );
}
