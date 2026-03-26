interface UbDProgressIndicatorProps {
  currentStage: 1 | 2 | 3 | 4 | 5;
  completedStages?: number[];
}

const stages = [
  { number: 1, label: "Desired Results", shortLabel: "Stage 1", phase: "Design" },
  { number: 2, label: "Evidence", shortLabel: "Stage 2", phase: "Design" },
  { number: 3, label: "Learning Plan", shortLabel: "Stage 3", phase: "Design" },
  { number: 4, label: "Go Live", shortLabel: "Stage 4", phase: "Deploy" },
  { number: 5, label: "Results", shortLabel: "Stage 5", phase: "Analyze" },
] as const;

/** Lock icon for stages that are not yet accessible */
function LockIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  );
}

/**
 * Visual progress indicator for the 5-stage UbD flow.
 *
 * Stages 1-3 are the "Design" phase (backward design).
 * Stage 4 is the "Deploy" phase (go live with students).
 * Stage 5 is the "Analyze" phase (results and reteach).
 *
 * Deploy/Analyze stages are visually distinct — dashed connectors
 * and a different icon treatment to separate them from design work.
 */
function UbDProgressIndicator({
  currentStage,
  completedStages = [],
}: UbDProgressIndicatorProps) {
  return (
    <nav aria-label="Unit design progress" className="w-full">
      {/* Desktop / tablet horizontal layout */}
      <div className="hidden sm:flex flex-col items-center gap-3">
        {/* Stage circles and connectors */}
        <div className="flex items-center justify-center gap-0">
          {stages.map((stage, index) => {
            const isCompleted = completedStages.includes(stage.number);
            const isCurrent = currentStage === stage.number;
            const isFuture = !isCompleted && !isCurrent;
            const isDeployOrAnalyze = stage.number >= 4;
            // The connector between stage 3 and 4 marks the phase boundary
            const isPhaseBoundary = index === 3;

            return (
              <div key={stage.number} className="flex items-center">
                {/* Connector line before (except first) */}
                {index > 0 && (
                  <div
                    className={`h-0.5 w-8 md:w-14 ${
                      isPhaseBoundary
                        ? "border-t-2 border-dashed border-ruled bg-transparent"
                        : isCompleted || isCurrent
                        ? "bg-ink"
                        : "bg-ruled"
                    }`}
                    style={isPhaseBoundary ? { height: 0 } : undefined}
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
                          ? isDeployOrAnalyze
                            ? "bg-emerald-700 text-white"
                            : "bg-ink text-white"
                          : isCurrent
                          ? isDeployOrAnalyze
                            ? "bg-emerald-700 text-white ring-4 ring-emerald-700/15"
                            : "bg-ink text-white ring-4 ring-ink/15"
                          : isFuture && isDeployOrAnalyze
                          ? "border-2 border-dashed border-ruled bg-paper text-pencil/50"
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
                    ) : isFuture && isDeployOrAnalyze ? (
                      <LockIcon className="h-4 w-4" />
                    ) : (
                      stage.number
                    )}
                  </div>
                  <div className="text-center">
                    <p
                      className={`text-xs font-ui font-semibold ${
                        isFuture ? "text-pencil" : isDeployOrAnalyze ? "text-emerald-800" : "text-ink"
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
      </div>

      {/* Mobile vertical layout */}
      <div className="flex sm:hidden flex-col items-start gap-0 pl-2">
        {stages.map((stage, index) => {
          const isCompleted = completedStages.includes(stage.number);
          const isCurrent = currentStage === stage.number;
          const isFuture = !isCompleted && !isCurrent;
          const isDeployOrAnalyze = stage.number >= 4;
          const isPhaseBoundary = index === 3;

          return (
            <div key={stage.number}>
              {/* Phase boundary spacer on mobile */}
              {isPhaseBoundary && (
                <div className="flex items-center gap-3 py-1 pl-2.5">
                  <div className="w-0.5 h-3 border-l-2 border-dashed border-ruled" />
                </div>
              )}

              <div className="flex items-stretch gap-3">
                {/* Circle + vertical connector */}
                <div className="flex flex-col items-center">
                  <div
                    className={`
                      flex h-8 w-8 shrink-0 items-center justify-center rounded-full
                      text-xs font-ui font-semibold transition-all duration-300
                      ${
                        isCompleted
                          ? isDeployOrAnalyze
                            ? "bg-emerald-700 text-white"
                            : "bg-ink text-white"
                          : isCurrent
                          ? isDeployOrAnalyze
                            ? "bg-emerald-700 text-white ring-4 ring-emerald-700/15"
                            : "bg-ink text-white ring-4 ring-ink/15"
                          : isFuture && isDeployOrAnalyze
                          ? "border-2 border-dashed border-ruled bg-paper text-pencil/50"
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
                    ) : isFuture && isDeployOrAnalyze ? (
                      <LockIcon className="h-3.5 w-3.5" />
                    ) : (
                      stage.number
                    )}
                  </div>
                  {/* Vertical connector */}
                  {index < stages.length - 1 && !isPhaseBoundary && (
                    <div
                      className={`w-0.5 flex-1 min-h-[20px] ${
                        isCompleted ? "bg-ink" : "bg-ruled"
                      }`}
                    />
                  )}
                  {/* No connector before phase boundary — the boundary label handles it */}
                  {index === 2 && (
                    <div className="w-0.5 flex-1 min-h-[8px] bg-ruled" />
                  )}
                </div>

                {/* Label */}
                <div className="pb-4 pt-1">
                  <p
                    className={`text-sm font-ui font-semibold leading-tight ${
                      isFuture ? "text-pencil" : isDeployOrAnalyze ? "text-emerald-800" : "text-ink"
                    }`}
                  >
                    {stage.shortLabel}: {stage.label}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </nav>
  );
}

export { UbDProgressIndicator };
