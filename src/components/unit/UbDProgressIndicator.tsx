interface UbDProgressIndicatorProps {
  currentStage: 1 | 2 | 3;
  completedStages?: number[];
}

const stages = [
  { number: 1, label: "Desired Results", shortLabel: "Stage 1" },
  { number: 2, label: "Evidence", shortLabel: "Stage 2" },
  { number: 3, label: "Learning Plan", shortLabel: "Stage 3" },
] as const;

/**
 * Visual progress indicator for the 3 UbD stages.
 *
 * Academic editorial palette: ink navy for completed/current, ruled
 * borders for future stages. Matches the landing page aesthetic.
 */
function UbDProgressIndicator({
  currentStage,
  completedStages = [],
}: UbDProgressIndicatorProps) {
  return (
    <nav aria-label="Unit design progress" className="w-full">
      {/* Desktop / tablet horizontal layout */}
      <div className="hidden sm:flex items-center justify-center gap-0">
        {stages.map((stage, index) => {
          const isCompleted = completedStages.includes(stage.number);
          const isCurrent = currentStage === stage.number;
          const isFuture = !isCompleted && !isCurrent;

          return (
            <div key={stage.number} className="flex items-center">
              {/* Connector line before (except first) */}
              {index > 0 && (
                <div
                  className={`h-0.5 w-12 md:w-20 ${
                    isCompleted || isCurrent
                      ? "bg-ink"
                      : "bg-ruled"
                  }`}
                />
              )}

              {/* Stage circle + label */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`
                    flex h-10 w-10 items-center justify-center rounded-full
                    text-sm font-ui font-semibold transition-all duration-300
                    ${
                      isCompleted
                        ? "bg-ink text-white"
                        : isCurrent
                        ? "bg-ink text-white ring-4 ring-ink/15"
                        : "border-2 border-ruled bg-paper text-pencil"
                    }
                  `}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isCompleted ? (
                    <svg
                      className="h-5 w-5"
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
                  ) : (
                    stage.number
                  )}
                </div>
                <div className="text-center">
                  <p
                    className={`text-xs font-ui font-semibold ${
                      isFuture ? "text-pencil" : "text-ink"
                    }`}
                  >
                    {stage.shortLabel}
                  </p>
                  <p
                    className={`text-[11px] font-ui ${
                      isFuture ? "text-pencil" : "text-graphite"
                    }`}
                  >
                    {stage.label}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile vertical layout */}
      <div className="flex sm:hidden flex-col items-start gap-0 pl-2">
        {stages.map((stage, index) => {
          const isCompleted = completedStages.includes(stage.number);
          const isCurrent = currentStage === stage.number;
          const isFuture = !isCompleted && !isCurrent;

          return (
            <div key={stage.number} className="flex items-stretch gap-3">
              {/* Circle + vertical connector */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    flex h-8 w-8 shrink-0 items-center justify-center rounded-full
                    text-xs font-ui font-semibold transition-all duration-300
                    ${
                      isCompleted
                        ? "bg-ink text-white"
                        : isCurrent
                        ? "bg-ink text-white ring-4 ring-ink/15"
                        : "border-2 border-ruled bg-paper text-pencil"
                    }
                  `}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isCompleted ? (
                    <svg
                      className="h-4 w-4"
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
                  ) : (
                    stage.number
                  )}
                </div>
                {/* Vertical connector */}
                {index < stages.length - 1 && (
                  <div
                    className={`w-0.5 flex-1 min-h-[20px] ${
                      isCompleted ? "bg-ink" : "bg-ruled"
                    }`}
                  />
                )}
              </div>

              {/* Label */}
              <div className="pb-4 pt-1">
                <p
                  className={`text-sm font-ui font-semibold leading-tight ${
                    isFuture ? "text-pencil" : "text-ink"
                  }`}
                >
                  {stage.shortLabel}: {stage.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </nav>
  );
}

export { UbDProgressIndicator };
