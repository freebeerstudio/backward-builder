import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { ClassroomSetupForm } from "@/components/unit/ClassroomSetupForm";

export const metadata: Metadata = {
  title: "Classroom Setup",
};

export default function SetupPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <ClassroomSetupForm />
      </main>
    </>
  );
}
