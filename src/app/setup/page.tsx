import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { ClassroomSetupForm } from "@/components/unit/ClassroomSetupForm";

export const metadata: Metadata = {
  title: "Classroom Setup",
};

export default async function SetupPage({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string }>;
}) {
  const params = await searchParams;

  // Legacy demo=true URLs redirect to the new demo bypass endpoint
  if (params.demo === "true") {
    redirect("/api/demo");
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        <ClassroomSetupForm />
      </main>
    </>
  );
}
