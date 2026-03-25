import { NextResponse } from "next/server";
import { db } from "@/db";
import { units, teachers } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

/**
 * GET /api/units/community
 *
 * Returns all public community units with author information.
 * Used by the Community tab on the landing page.
 */
export async function GET() {
  try {
    const communityUnits = await db
      .select({
        id: units.id,
        title: units.title,
        enduringUnderstanding: units.enduringUnderstanding,
        status: units.status,
        isPublic: units.isPublic,
        createdAt: units.createdAt,
        teacherName: teachers.displayName,
        teacherSubject: teachers.subject,
        teacherGrade: teachers.gradeLevel,
      })
      .from(units)
      .innerJoin(teachers, eq(units.teacherId, teachers.id))
      .where(eq(units.isPublic, true))
      .orderBy(desc(units.updatedAt))
      .limit(50);

    return NextResponse.json({ units: communityUnits });
  } catch (error) {
    console.error("Failed to fetch community units:", error);
    return NextResponse.json(
      { error: "Failed to fetch community units." },
      { status: 500 }
    );
  }
}
