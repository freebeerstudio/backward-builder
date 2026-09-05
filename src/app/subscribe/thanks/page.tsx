import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { SubscribeThanks } from "@/components/auth/SubscribeThanks";

export const metadata: Metadata = { title: "Thanks — Backward Builder", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function SubscribeThanksPage({ searchParams }: { searchParams: Promise<{ subscription_id?: string }> }) {
  const { subscription_id = "" } = await searchParams;
  return (
    <div className="min-h-screen bg-cream font-ui">
      <Header />
      <PageContainer className="py-12 sm:py-16">
        <Card className="mx-auto max-w-md">
          <h1 className="font-display text-3xl font-semibold text-ink">Thanks.</h1>
          <p className="mt-2 font-ui text-sm text-pencil">Welcome to Backward Builder. Your receipt comes from Stripe.</p>
          <div className="mt-6"><SubscribeThanks subscriptionId={subscription_id} /></div>
        </Card>
      </PageContainer>
    </div>
  );
}
