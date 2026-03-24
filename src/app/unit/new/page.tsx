import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { UbDProgressIndicator } from "@/components/unit/UbDProgressIndicator";
import { EnduringUnderstandingInput } from "@/components/unit/EnduringUnderstandingInput";

export const metadata: Metadata = {
  title: "Stage 1: Enduring Understanding",
};

export default function NewUnitPage() {
  return (
    <>
      <Header />
      <main className="flex-1 py-8">
        <PageContainer>
          {/* Progress indicator */}
          <div className="mb-8">
            <UbDProgressIndicator currentStage={1} completedStages={[]} />
          </div>

          {/* Stage 1 heading */}
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-forest">
              Stage 1: Desired Results
            </h1>
            <p className="mt-2 text-text-light font-body max-w-md mx-auto">
              Start with the end in mind. What should students truly understand
              when this unit is over?
            </p>
          </div>

          {/* Input form + results */}
          <EnduringUnderstandingInput />
        </PageContainer>
      </main>
    </>
  );
}
