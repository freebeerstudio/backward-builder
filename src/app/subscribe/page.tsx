import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { EmbeddedSubscribe } from "@/components/auth/EmbeddedSubscribe";
import { getAuthenticatedTeacher } from "@/lib/auth";
import { db } from "@/db";
import { teachers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Subscribe — Backward Builder", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/**
 * Our subscribe page: $15 a month, the form right here. If the teacher already
 * has access (subscription or Beer Bond) there is nothing to buy — home.
 */
export default async function SubscribePage() {
  const auth = await getAuthenticatedTeacher();
  if (auth.authenticated && auth.access) redirect("/");
  let email: string | null = null;
  if (auth.authenticated) {
    const [t] = await db.select({ email: teachers.email }).from(teachers).where(eq(teachers.id, auth.teacherId)).limit(1);
    email = t?.email ?? null;
  }

  return (
    <div className="min-h-screen bg-cream font-ui">
      <Header />
      <PageContainer wide className="py-12 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <div>
            <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">Backward Builder is $15 a month.</h1>
            <p className="mt-4 font-ui text-base leading-relaxed text-graphite">
              Every unit you design, every check for understanding, every results dashboard — for less
              than a planning-period coffee habit. Cancel any time; you keep what you built.
            </p>
            <ul className="mt-6 space-y-2 font-ui text-sm text-graphite">
              <li>• AI-powered unit creation, all five UbD stages</li>
              <li>• Standards alignment for all 50 states</li>
              <li>• Auto-graded checks, student share links, results dashboard</li>
              <li>• Share units with colleagues and the community library</li>
            </ul>
            <p className="mt-6 font-ui text-sm text-pencil">
              {email ? <>Billing for <span className="text-ink">{email}</span>. </> : null}
              Have a Free Beer Studio Beer Bond? Backward Builder is already included — sign in with that email instead.
            </p>
          </div>
          <Card>
            <EmbeddedSubscribe email={email} />
          </Card>
        </div>
      </PageContainer>
    </div>
  );
}
