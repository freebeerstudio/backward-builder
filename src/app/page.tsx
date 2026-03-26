import Link from "next/link";
import { cookies } from "next/headers";
import { db } from "@/db";
import { teachers, units, unitShares } from "@/db/schema";
import { eq, desc, and, isNotNull, ne } from "drizzle-orm";
import { HeroChatBox } from "@/components/landing/HeroChatBox";
import { UnitTabs, type UnitCardData } from "@/components/landing/UnitTabs";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { ButterflyLogo } from "@/components/ui/ButterflyLogo";

/**
 * Landing page — single-page app with auth-aware layout.
 *
 * Unauthenticated: hero + chat box + "From the Community" grid
 * Authenticated: hero + chat box + tabbed "My Units / Shared / Community"
 * Header buttons switch between Sign in/Sign up and teacher avatar.
 */

/* ------------------------------------------------------------------ */
/*  Helper: derive a subject color from the unit's enduring understanding */
/* ------------------------------------------------------------------ */
function guessSubjectColor(eu: string, subject?: string | null): string {
  const lower = (subject || eu).toLowerCase();
  if (lower.includes("science") || lower.includes("biology") || lower.includes("chemistry") || lower.includes("physics") || lower.includes("ecosystem") || lower.includes("water") || lower.includes("volcano") || lower.includes("environmental"))
    return "var(--color-subj-science)";
  if (lower.includes("history") || lower.includes("civics") || lower.includes("government") || lower.includes("economics") || lower.includes("geography") || lower.includes("revolution") || lower.includes("civilization") || lower.includes("ancient"))
    return "var(--color-subj-history)";
  if (lower.includes("ela") || lower.includes("english") || lower.includes("writing") || lower.includes("poetry") || lower.includes("literature") || lower.includes("language arts"))
    return "var(--color-subj-ela)";
  if (lower.includes("math") || lower.includes("fraction") || lower.includes("geometry") || lower.includes("algebra"))
    return "var(--color-subj-math)";
  if (lower.includes("art") || lower.includes("music") || lower.includes("theater") || lower.includes("drama"))
    return "#8B5CF6"; /* violet for arts */
  if (lower.includes("computer") || lower.includes("career") || lower.includes("technical"))
    return "#0891B2"; /* cyan for tech/CTE */
  if (lower.includes("physical") || lower.includes("health"))
    return "#059669"; /* emerald for PE/health */
  return "var(--color-ink-muted)";
}

function guessSubjectLabel(eu: string, subject?: string | null): string {
  /* If we have the actual subject from the teacher record, use it directly */
  if (subject && subject !== eu) return subject;
  const lower = (subject || eu).toLowerCase();
  if (lower.includes("science") || lower.includes("biology") || lower.includes("chemistry") || lower.includes("physics") || lower.includes("ecosystem") || lower.includes("environmental")) return "Science";
  if (lower.includes("history") || lower.includes("civics") || lower.includes("government") || lower.includes("economics") || lower.includes("geography") || lower.includes("revolution") || lower.includes("civilization")) return "History";
  if (lower.includes("ela") || lower.includes("english") || lower.includes("writing") || lower.includes("poetry") || lower.includes("language arts")) return "ELA";
  if (lower.includes("math") || lower.includes("fraction") || lower.includes("geometry") || lower.includes("algebra")) return "Math";
  return "Unit";
}

/* ------------------------------------------------------------------ */
/*  Static fallback community units (shown when DB has no public units) */
/* ------------------------------------------------------------------ */
const FALLBACK_COMMUNITY_UNITS: UnitCardData[] = [
  { id: "c1", title: "Ecosystem Interdependence", description: "Trophic cascades and the Yellowstone wolf reintroduction", subject: "Science", grade: "7th", teacher: "Ms. Jones", initial: "J", uses: 142, color: "var(--color-subj-science)", href: "/unit/00000000-0000-0000-0000-000000000010" },
  { id: "c2", title: "Causes of the American Revolution", description: "Economic, political, and ideological tensions leading to independence", subject: "History", grade: "8th", teacher: "Mr. Rodriguez", initial: "R", uses: 98, color: "var(--color-subj-history)", href: "/unit/00000000-0000-0000-0000-000000000020" },
  { id: "c3", title: "Persuasive Writing & Rhetoric", description: "Analyzing persuasion techniques across speeches and editorials", subject: "ELA", grade: "6th", teacher: "Ms. Chen", initial: "J", uses: 217, color: "var(--color-subj-ela)", href: "#" },
  { id: "c4", title: "Fractions in the Real World", description: "Applying fraction operations to cooking, construction, and design", subject: "Math", grade: "5th", teacher: "Mr. Thompson", initial: "T", uses: 63, color: "var(--color-subj-math)", href: "#" },
  { id: "c5", title: "The Water Cycle as a System", description: "Solar energy, evaporation, condensation, and human impact", subject: "Science", grade: "5th", teacher: "Mrs. Johnson", initial: "J", uses: 184, color: "var(--color-subj-science)", href: "#" },
  { id: "c6", title: "Ancient Civilizations", description: "How geography shaped social, political, and economic development", subject: "History", grade: "6th", teacher: "Ms. Patel", initial: "P", uses: 311, color: "var(--color-subj-history)", href: "#" },
  { id: "c7", title: "Poetry, Voice & Identity", description: "How poets use language, form, and structure to express perspective", subject: "ELA", grade: "8th", teacher: "Mr. Davis", initial: "D", uses: 76, color: "var(--color-subj-ela)", href: "#" },
  { id: "c8", title: "Geometric Transformations", description: "Translations, rotations, reflections, and real-world symmetry", subject: "Math", grade: "7th", teacher: "Mrs. Kim", initial: "K", uses: 129, color: "var(--color-subj-math)", href: "#" },
];


/* ------------------------------------------------------------------ */
/*  Server component: detect auth, fetch units, render page            */
/* ------------------------------------------------------------------ */
export default async function Home() {
  /* Check for teacher session cookie */
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("teacher_session")?.value;

  let isAuthenticated = false;
  let teacherName: string | null = null;
  let teacherInitial = "";
  let myUnits: UnitCardData[] = [];
  let sharedUnits: UnitCardData[] = [];

  if (sessionId) {
    /* Fetch teacher record */
    const [teacher] = await db
      .select()
      .from(teachers)
      .where(eq(teachers.sessionId, sessionId))
      .limit(1);

    if (teacher) {
      isAuthenticated = true;
      teacherName = teacher.displayName || "Teacher";
      teacherInitial = (teacherName?.[0] || "T").toUpperCase();

      /* Fetch teacher's units */
      const teacherUnits = await db
        .select()
        .from(units)
        .where(eq(units.teacherId, teacher.id))
        .orderBy(desc(units.updatedAt));

      myUnits = teacherUnits.map((u) => ({
        id: u.id,
        title: u.title,
        description: u.enduringUnderstanding.slice(0, 120) + (u.enduringUnderstanding.length > 120 ? "…" : ""),
        subject: guessSubjectLabel(u.enduringUnderstanding, teacher.subject),
        grade: teacher.gradeLevel || "—",
        teacher: teacherName || "Teacher",
        initial: teacherInitial,
        status: u.status,
        color: guessSubjectColor(u.enduringUnderstanding, teacher.subject),
        href: `/unit/${u.id}`,
      }));

      /* Fetch units shared with this teacher (via unit_shares) */
      const sharedRows = await db
        .select({
          unitId: unitShares.unitId,
          unitTitle: units.title,
          unitEU: units.enduringUnderstanding,
          unitStatus: units.status,
          authorName: teachers.displayName,
          authorSubject: teachers.subject,
          authorGrade: teachers.gradeLevel,
        })
        .from(unitShares)
        .innerJoin(units, eq(unitShares.unitId, units.id))
        .innerJoin(teachers, eq(units.teacherId, teachers.id))
        .where(
          and(
            eq(unitShares.teacherId, teacher.id),
            ne(units.teacherId, teacher.id) // exclude own units
          )
        )
        .orderBy(desc(unitShares.createdAt))
        .limit(20);

      sharedUnits = sharedRows.map((s) => ({
        id: s.unitId,
        title: s.unitTitle,
        description: s.unitEU.slice(0, 120) + (s.unitEU.length > 120 ? "…" : ""),
        subject: guessSubjectLabel(s.unitEU, s.authorSubject),
        grade: s.authorGrade || "—",
        teacher: s.authorName || "Teacher",
        initial: (s.authorName?.[0] || "T").toUpperCase(),
        status: s.unitStatus,
        color: guessSubjectColor(s.unitEU, s.authorSubject),
        href: `/unit/${s.unitId}`,
      }));
    }
  }

  /* Fetch public community units from DB */
  const publicUnitsRaw = await db
    .select({
      id: units.id,
      title: units.title,
      enduringUnderstanding: units.enduringUnderstanding,
      status: units.status,
      teacherName: teachers.displayName,
      teacherSubject: teachers.subject,
      teacherGrade: teachers.gradeLevel,
    })
    .from(units)
    .innerJoin(teachers, eq(units.teacherId, teachers.id))
    .where(eq(units.isPublic, true))
    .orderBy(desc(units.updatedAt))
    .limit(12);

  const communityUnits: UnitCardData[] = publicUnitsRaw.length > 0
    ? publicUnitsRaw.map((u) => ({
        id: u.id,
        title: u.title,
        description: u.enduringUnderstanding.slice(0, 120) + (u.enduringUnderstanding.length > 120 ? "…" : ""),
        subject: guessSubjectLabel(u.enduringUnderstanding, u.teacherSubject),
        grade: u.teacherGrade || "—",
        teacher: u.teacherName || "Teacher",
        initial: (u.teacherName?.[0] || "T").toUpperCase(),
        status: u.status,
        color: guessSubjectColor(u.enduringUnderstanding, u.teacherSubject),
        href: `/unit/${u.id}`,
      }))
    : FALLBACK_COMMUNITY_UNITS;

  return (
    <div className="min-h-screen bg-cream font-ui">
      {/* ===================== HEADER ===================== */}
      <LandingHeader
        isAuthenticated={isAuthenticated}
        teacherName={teacherName}
        teacherInitial={teacherInitial}
      />

      {/* ===================== HERO ===================== */}
      <section className="hero-gradient dot-grid relative overflow-visible px-4 pb-12 pt-16 sm:px-6 sm:pb-16 sm:pt-24">
        <div className="relative z-10 mx-auto max-w-6xl text-center">
          <h1 className="animate-hero-title">
            <span className="block font-display text-4xl leading-[1.15] text-ink sm:text-5xl lg:text-[3.5rem]">
              Describe the understanding.
            </span>
            <span className="mt-1 block font-display text-4xl italic leading-[1.15] text-burgundy sm:text-5xl lg:text-[3.5rem]">
              AI designs the unit.
            </span>
          </h1>

          <p className="animate-hero-subtitle mx-auto mt-5 max-w-xl font-ui text-base leading-relaxed text-pencil sm:mt-6 sm:text-lg">
            Standards-aligned unit plans with performance tasks, rubrics, checks
            for understanding, and sequenced learning activities — built in minutes, not weekends.
          </p>

          <div className="mt-8 sm:mt-10">
            <HeroChatBox />
          </div>
        </div>
      </section>

      {/* ===================== UNITS SECTION ===================== */}
      <UnitTabs
        isAuthenticated={isAuthenticated}
        myUnits={myUnits}
        sharedUnits={sharedUnits}
        communityUnits={communityUnits}
        teacherName={teacherName || undefined}
      />

      {/* ===================== FOOTER ===================== */}
      <footer className="border-t border-ruled bg-cream px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {/* Logo column */}
            <div className="lg:col-span-1">
              <Link href="/" className="inline-flex items-center gap-2" aria-label="Home">
                <ButterflyLogo size={24} className="text-ink" />
                <span className="font-display text-lg text-ink">Backward Builder</span>
              </Link>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-pencil">
                Understanding by Design, powered by AI. Unit planning for teachers who know their students best.
              </p>
            </div>

            {/* UbD Resources */}
            <div>
              <h3 className="font-ui text-xs font-bold uppercase tracking-wider text-ink/60">UbD Resources</h3>
              <ul className="mt-3 space-y-2.5">
                <li><a href="https://www.ascd.org/books/understanding-by-design-expanded-2nd-edition" target="_blank" rel="noopener noreferrer" className="focus-ring text-sm text-pencil transition hover:text-ink">Understanding by Design — ASCD</a></li>
                <li><a href="https://jaymctighe.com/" target="_blank" rel="noopener noreferrer" className="focus-ring text-sm text-pencil transition hover:text-ink">Jay McTighe&apos;s Resources</a></li>
              </ul>
            </div>

            {/* Standards */}
            <div>
              <h3 className="font-ui text-xs font-bold uppercase tracking-wider text-ink/60">State Standards</h3>
              <ul className="mt-3 space-y-2.5">
                <li><a href="https://dese.mo.gov/college-career-readiness/curriculum/missouri-learning-standards" target="_blank" rel="noopener noreferrer" className="focus-ring text-sm text-pencil transition hover:text-ink">Missouri Learning Standards</a></li>
                <li><Link href="/standards-sources" className="focus-ring text-sm font-medium text-ink transition hover:text-ink-light">Our Standards Sources ↗</Link></li>
              </ul>
            </div>

            {/* Unit Planning */}
            <div>
              <h3 className="font-ui text-xs font-bold uppercase tracking-wider text-ink/60">Unit Planning</h3>
              <ul className="mt-3 space-y-2.5">
                <li><a href="https://www.learningforjustice.org/" target="_blank" rel="noopener noreferrer" className="focus-ring text-sm text-pencil transition hover:text-ink">Learning for Justice</a></li>
                <li><a href="https://www.edutopia.org/" target="_blank" rel="noopener noreferrer" className="focus-ring text-sm text-pencil transition hover:text-ink">Edutopia</a></li>
                <li><a href="https://cpalms.org/" target="_blank" rel="noopener noreferrer" className="focus-ring text-sm text-pencil transition hover:text-ink">CPALMS Curriculum Resources</a></li>
              </ul>
            </div>

            {/* Product */}
            <div>
              <h3 className="font-ui text-xs font-bold uppercase tracking-wider text-ink/60">Product</h3>
              <ul className="mt-3 space-y-2.5">
                <li><Link href="/setup" className="focus-ring text-sm text-pencil transition hover:text-ink">Design a Unit</Link></li>
                <li><a href="/api/demo" className="focus-ring text-sm text-pencil transition hover:text-ink">Try the Demo</a></li>
                <li><Link href="/dashboard" className="focus-ring text-sm text-pencil transition hover:text-ink">My Units</Link></li>
                <li><a href="https://github.com/freebeerstudio/backward-builder" target="_blank" rel="noopener noreferrer" className="focus-ring text-sm text-pencil transition hover:text-ink">Source Code</a></li>
                <li><Link href="/roadmap" className="focus-ring text-sm text-pencil transition hover:text-ink">Roadmap</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      {/* ===================== COPYRIGHT BAR ===================== */}
      <div className="border-t border-ruled bg-chalk px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-xs text-pencil">
            BackwardBuilder.com · Vibeathon 2026 · Powered by Claude AI
          </p>
          <p className="mt-1">
            <a
              href="https://freebeer.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring text-xs font-medium text-ink-muted transition hover:text-ink"
            >
              Free Beer Studio
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
