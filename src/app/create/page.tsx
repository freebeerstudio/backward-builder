import { ConversationForm } from "@/components/assessment/ConversationForm";

export const metadata = {
  title: "Create Your Assessment",
  description: "Build a standards-aligned assessment through a guided conversation.",
};

export default function CreateAssessmentPage() {
  return (
    <main className="flex flex-col min-h-screen bg-warmwhite">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-forest flex items-center justify-center">
            <span className="text-white text-xs font-heading font-bold">BB</span>
          </div>
          <h1 className="text-lg font-heading font-semibold text-text">
            Create Your Assessment
          </h1>
        </div>
      </header>
      <ConversationForm />
    </main>
  );
}
