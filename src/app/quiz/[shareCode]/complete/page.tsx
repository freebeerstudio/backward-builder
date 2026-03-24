import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Assessment Submitted",
};

/**
 * /quiz/[shareCode]/complete
 *
 * Simple server-rendered confirmation page shown after a student
 * submits their assessment. No link back to the quiz to prevent
 * re-submission.
 */
export default async function CompletePage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string; sid?: string }>;
}) {
  const { name } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-warmwhite px-4">
      <div className="mx-auto w-full max-w-md text-center">
        {/* Green checkmark */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
          <svg
            className="h-10 w-10 text-success"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        </div>

        <h1 className="mb-3 font-heading text-2xl font-bold text-text">
          Assessment Submitted!
        </h1>

        {name && (
          <p className="mb-2 text-lg text-text">
            Thank you, <span className="font-semibold">{name}</span>.
          </p>
        )}

        <p className="text-base text-text-light">
          Your teacher will receive your results. You can close this page now.
        </p>

        {/* Decorative divider */}
        <div className="mx-auto mt-8 h-1 w-12 rounded-full bg-forest/20" />
      </div>
    </div>
  );
}
