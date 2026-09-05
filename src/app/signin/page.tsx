import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { SignInForm } from "@/components/auth/SignInForm";

export const metadata: Metadata = { title: "Sign in — Backward Builder", robots: { index: false, follow: false } };

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ expired?: string }> }) {
  const { expired } = await searchParams;
  return (
    <div className="min-h-screen bg-cream font-ui">
      <Header />
      <PageContainer className="py-12 sm:py-16">
        <Card className="mx-auto max-w-md">
          <h1 className="font-display text-3xl font-semibold text-ink">Sign in</h1>
          <p className="mt-2 font-ui text-sm text-pencil">One email, no password. New here? The same link creates your account.</p>
          {expired && (
            <p className="mt-4 rounded-lg border border-ruled bg-chalk px-3 py-2 font-ui text-sm text-graphite" role="alert">
              That link was used or expired — request a fresh one.
            </p>
          )}
          <div className="mt-6"><SignInForm /></div>
          <p className="mt-6 text-center font-ui text-xs text-pencil">Accounts by Free Beer Studio</p>
        </Card>
      </PageContainer>
    </div>
  );
}
