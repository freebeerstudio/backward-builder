import Link from "next/link";
import { ButterflyLogo } from "@/components/ui/ButterflyLogo";

/**
 * Public roadmap page — shows shipped features, in-progress work, and planned items.
 * Linked from the footer. Designed to show judges the product vision.
 */

type RoadmapItem = {
  title: string;
  description: string;
  link?: string;
};

const SHIPPED: RoadmapItem[] = [
  { title: "AI-Powered Unit Creation", description: "Conversational chat interface builds complete UbD unit plans from a single enduring understanding" },
  { title: "5-Stage UbD Pipeline", description: "Design → Assess → Plan → Deploy → Analyze — Stage 1 (Desired Results) → Stage 2 (Evidence) → Stage 3 (Learning Plan) → Stage 4 (Go Live) → Stage 5 (Results)" },
  { title: "Save for Later", description: "Complete unit design at your own pace — save after Stage 3 and publish when you're ready" },
  { title: "State Standards Alignment", description: "Automatic mapping to standards from all 50 U.S. states" },
  { title: "Bloom's Taxonomy Classification", description: "AI classifies learning objectives by cognitive level" },
  { title: "GRASPS Performance Tasks", description: "AI-generated authentic performance tasks with detailed multi-criterion rubrics" },
  { title: "Auto-Graded Checks for Understanding", description: "Formative assessments with selected-response and short-answer questions, graded in real time" },
  { title: "Student Share Links", description: "Students access checks on any device with a code — no login required" },
  { title: "Teacher Results Dashboard", description: "Per-question analytics showing exactly what needs to be retaught" },
  { title: "Unit Sharing", description: "Share units with colleagues directly by email or via shareable link" },
  { title: "Community Library", description: "Publish units for other teachers to discover and learn from" },
  { title: "Quick-Start Prompts", description: "Common lesson templates for fast unit creation" },
  { title: "Demo Account", description: "Explore sample units without creating an account" },
  { title: "Red Team & Security Audit", description: "Systematic testing of all user flows, edge cases, and security boundaries to ensure production readiness" },
  { title: "Clean Up & Document Codebase", description: "Clean GitHub repo, comprehensive documentation, and well-structured code for open collaboration" },
  { title: "Building in Public", description: "Documenting the journey of building Backward Builder — read Hugh Mann's reflections on the process", link: "https://hughmann.life/2026-03-25-the-anonymous-gift.html" },
];

const IN_PROGRESS: RoadmapItem[] = [
  { title: "Validate MVP with Teachers", description: "Gathering feedback from real classroom teachers to identify the highest-impact improvements before wider release" },
  { title: "Vibeathon Judge Review", description: "Submitted for evaluation in the Codefi Vibeathon 2026 — Vibe the Gap Challenge" },
];

const PLANNED: RoadmapItem[] = [
  { title: "Paced Unit Delivery", description: "Go live with one check or performance task at a time — control the pacing of your unit in real time, with separate results for each assessment as students complete them" },
  { title: "Variable Unit Lengths", description: "Support for units of different durations — from a single-day mini-unit to a multi-week deep dive — with AI adapting the scope of performance tasks, checks, and learning activities accordingly" },
  { title: "Enhanced Rubric Editor", description: "Inline editing of rubric criteria and proficiency levels with drag-and-drop reordering" },
  { title: "Bulk Unit Management", description: "Archive, duplicate, and organize units across semesters and school years" },
  { title: "Unit Remix & Copy", description: "Copy any shared or community unit into your own collection, customize it for your students, and build on each other's best work" },
  { title: "Google Classroom Integration", description: "Push checks and performance tasks directly to Google Classroom assignments" },
  { title: "PDF & Print Export", description: "Export complete unit plans, rubrics, and checks as printable PDFs for department binders and admin review" },
  { title: "Multi-Language Support", description: "Generate units and student-facing content in Spanish, French, and other languages for ELL classrooms" },
  { title: "School & District Admin Dashboard", description: "Bird's-eye view of unit creation, standards coverage, and teacher adoption across a building or district" },
  { title: "AI-Powered Reteach Suggestions", description: "After grading, AI recommends specific activities to address common misconceptions revealed by student responses" },
  { title: "Vertical Alignment View", description: "See how units across grade levels build toward the same enduring understandings over time" },
  { title: "Collaborative Unit Authoring", description: "Multiple teachers co-build a unit in real time with shared editing and comments" },
  { title: "Student Self-Reflection Prompts", description: "AI-generated metacognitive prompts that help students assess their own understanding after each check" },
  { title: "LMS Integrations", description: "Connect with Canvas, Schoology, and other learning management systems for seamless workflow" },
  { title: "Standards Coverage Heatmap", description: "Visualize which standards you've covered and where the gaps are across all your units" },
  { title: "Cross-School Unit Analytics", description: "Compare unit effectiveness across classrooms and schools to identify what works best for different student populations" },
  { title: "Parent & Guardian View", description: "Share a simplified unit overview with families so they understand what their child is learning and how they'll be assessed" },
];

function RoadmapSection({
  icon,
  title,
  subtitle,
  items,
  cardBorder,
}: {
  icon: string;
  title: string;
  subtitle: string;
  items: RoadmapItem[];
  cardBorder: string;
}) {
  return (
    <section className="mb-12">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-ink flex items-center gap-2">
          <span className="text-2xl">{icon}</span> {title}
          <span className="ml-2 rounded-full bg-chalk px-3 py-0.5 font-ui text-xs font-medium text-pencil">
            {items.length}
          </span>
        </h2>
        <p className="mt-1 text-sm text-pencil">{subtitle}</p>
      </div>
      {items.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.title}
              className={`rounded-lg border ${cardBorder} bg-white p-5 shadow-sm transition hover:shadow-md`}
            >
              <h3 className="font-display text-base font-semibold text-ink">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-pencil">{item.description}</p>
              {item.link && (
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-forest hover:underline">
                  Read more &rarr;
                </a>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-ruled bg-chalk/50 p-8 text-center">
          <p className="text-sm text-pencil">All caught up! Check back soon for what we&apos;re working on next.</p>
        </div>
      )}
    </section>
  );
}

export default function RoadmapPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="border-b border-ruled bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="inline-flex items-center gap-2" aria-label="Home">
            <ButterflyLogo size={28} className="text-ink" />
            <span className="font-display text-xl font-bold text-ink">Backward Builder</span>
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-ruled bg-chalk px-4 py-2 font-ui text-sm font-medium text-ink transition hover:bg-white"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div className="border-b border-ruled bg-gradient-to-b from-white to-cream px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Product Roadmap
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-pencil">
            Where we&apos;ve been, where we&apos;re going, and what&apos;s next for Backward Builder.
            We&apos;re building the unit planning tool teachers deserve.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="font-ui text-sm font-medium text-ink">Actively building</span>
          </div>
        </div>
      </div>

      {/* Roadmap Content */}
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <RoadmapSection
          icon="✅"
          title="Shipped"
          subtitle="Live and working — try them now at BackwardBuilder.com"
          items={SHIPPED}
          cardBorder="border-green-200"
        />

        <RoadmapSection
          icon="🔨"
          title="In Progress"
          subtitle="Actively being worked on right now"
          items={IN_PROGRESS}
          cardBorder="border-gold/40"
        />

        <RoadmapSection
          icon="📋"
          title="Planned"
          subtitle="On our radar — the future of unit planning"
          items={PLANNED}
          cardBorder="border-ruled"
        />

        {/* CTA */}
        <div className="mt-12 rounded-xl border border-ruled bg-white p-8 text-center shadow-sm">
          <h2 className="font-display text-2xl font-bold text-ink">Have an idea?</h2>
          <p className="mt-2 text-pencil">
            We&apos;re building this for teachers. If there&apos;s something you&apos;d love to see,
            we&apos;d love to hear about it.
          </p>
          <a
            href="mailto:wayne@freebeer.ai?subject=Backward Builder Feature Idea"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-ink px-6 py-3 font-ui text-sm font-semibold text-chalk shadow-sm transition hover:bg-ink-light"
          >
            Share Your Idea →
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-ruled bg-chalk px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-xs text-pencil">
            © 2026 Backward Builder · Built by{" "}
            <a href="https://freebeer.ai" className="underline hover:text-ink" target="_blank" rel="noopener noreferrer">
              Free Beer Studio
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
