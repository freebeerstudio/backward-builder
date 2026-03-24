/**
 * Submission confirmation page — shown after a student submits a Check for Understanding.
 * Server component. Distraction-free, no navigation back to prevent re-submission.
 */
export default async function CheckCompletePage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string }>;
}) {
  const { name } = await searchParams;
  const studentName = name ? decodeURIComponent(name) : "Student";

  return (
    <div className="min-h-screen bg-warmwhite flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center space-y-6">
        {/* Green checkmark */}
        <div className="mx-auto h-20 w-20 rounded-full bg-success/15 flex items-center justify-center">
          <svg
            className="h-10 w-10 text-success"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-2xl font-heading font-bold text-forest">
            Check Submitted!
          </h1>
          <p className="text-base font-body text-text">
            Thanks, <span className="font-semibold">{studentName}</span>.
          </p>
        </div>

        {/* Info */}
        <p className="text-sm text-text-light font-body leading-relaxed">
          Your teacher will receive your results.
          You can close this page now.
        </p>

        {/* Visual flourish */}
        <div className="pt-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-forest/5 text-forest text-xs font-heading font-semibold">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            Submission recorded
          </div>
        </div>
      </div>
    </div>
  );
}
