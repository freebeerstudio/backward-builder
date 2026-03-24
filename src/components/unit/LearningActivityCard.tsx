import { Badge } from "@/components/ui/Badge";
import type { LearningActivity } from "@/types";

interface LearningActivityCardProps {
  activity: LearningActivity;
  checkTitle?: string;
}

/**
 * LearningActivityCard — displays a single learning activity in the Stage 3
 * sequence. Each card shows what students do, how long it takes, what materials
 * are needed, and which rubric criterion it builds toward. Connected to
 * formative checks so teachers see the diagnostic checkpoints in context.
 *
 * Server-compatible: no 'use client' directive.
 */
function LearningActivityCard({
  activity,
  checkTitle,
}: LearningActivityCardProps) {
  return (
    <div className="relative rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      {/* Left accent border */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-forest" />

      <div className="pl-6 pr-5 py-5">
        <div className="flex items-start gap-4">
          {/* Sequence number circle */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest font-heading text-sm font-bold text-white">
            {activity.sequenceOrder}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            {/* Title + Duration */}
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-heading text-lg font-bold text-forest-dark">
                {activity.title}
              </h3>
              {activity.durationMinutes && (
                <span className="inline-flex items-center gap-1 rounded-full bg-forest/10 px-2.5 py-0.5 font-body text-xs font-medium text-forest">
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {activity.durationMinutes} min
                </span>
              )}
            </div>

            {/* Description */}
            <p className="mt-2 font-body text-sm leading-relaxed text-text">
              {activity.description}
            </p>

            {/* Materials */}
            {activity.materials && (
              <div className="mt-3 rounded-lg bg-warmwhite px-3.5 py-2.5">
                <p className="font-body text-xs font-medium text-text-light uppercase tracking-wide">
                  Materials
                </p>
                <p className="mt-0.5 font-body text-sm text-text">
                  {activity.materials}
                </p>
              </div>
            )}

            {/* Bottom badges */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {activity.buildsToward && (
                <span className="inline-flex items-center gap-1 rounded-full bg-forest/5 px-2.5 py-1 font-body text-xs text-forest">
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
                    />
                  </svg>
                  Builds toward: {activity.buildsToward}
                </span>
              )}

              {checkTitle && (
                <Badge
                  variant="check"
                  label={`Check: ${checkTitle}`}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { LearningActivityCard, type LearningActivityCardProps };
