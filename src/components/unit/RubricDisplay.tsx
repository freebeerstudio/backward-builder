import type { RubricCriterion } from "@/types";

interface RubricDisplayProps {
  rubric: RubricCriterion[];
  className?: string;
}

/**
 * RubricDisplay — Renders a multi-criterion rubric as a polished table
 * (desktop) or stacked accordion cards (mobile). This is the visual
 * centerpiece of the performance task view — it needs to look impressive
 * for contest judges while being genuinely useful for teachers.
 */
function RubricDisplay({ rubric, className = "" }: RubricDisplayProps) {
  return (
    <div className={className}>
      {/* Desktop: Full table layout */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-forest text-white">
              <th className="px-4 py-3 text-left font-heading font-semibold rounded-tl-lg">
                Criterion
              </th>
              <th className="px-4 py-3 text-center font-heading font-semibold">
                <span className="block">Exemplary</span>
                <span className="text-xs font-normal opacity-80">(4)</span>
              </th>
              <th className="px-4 py-3 text-center font-heading font-semibold">
                <span className="block">Proficient</span>
                <span className="text-xs font-normal opacity-80">(3)</span>
              </th>
              <th className="px-4 py-3 text-center font-heading font-semibold">
                <span className="block">Developing</span>
                <span className="text-xs font-normal opacity-80">(2)</span>
              </th>
              <th className="px-4 py-3 text-center font-heading font-semibold rounded-tr-lg">
                <span className="block">Beginning</span>
                <span className="text-xs font-normal opacity-80">(1)</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rubric.map((criterion, index) => {
              // Sort levels descending by score to ensure correct column order
              const sortedLevels = [...criterion.levels].sort(
                (a, b) => b.score - a.score
              );
              const isEvenRow = index % 2 === 0;

              return (
                <tr
                  key={criterion.criterionName}
                  className={`
                    border-b border-border
                    ${isEvenRow ? "bg-warmwhite" : "bg-card"}
                  `}
                >
                  <td className="px-4 py-3 align-top">
                    <div className="font-heading font-semibold text-forest-dark">
                      {criterion.criterionName}
                    </div>
                    <div className="mt-1 text-xs text-text-light">
                      {criterion.weight} pts
                    </div>
                  </td>
                  {sortedLevels.map((level) => (
                    <td
                      key={level.score}
                      className="px-4 py-3 align-top text-text leading-relaxed"
                    >
                      {level.description}
                    </td>
                  ))}
                  {/* Fill empty cells if fewer than 4 levels */}
                  {sortedLevels.length < 4 &&
                    Array.from({ length: 4 - sortedLevels.length }).map(
                      (_, i) => (
                        <td
                          key={`empty-${i}`}
                          className="px-4 py-3 text-text-light italic"
                        >
                          --
                        </td>
                      )
                    )}
                </tr>
              );
            })}
          </tbody>
        </table>
        {/* Total points row */}
        <div className="mt-2 text-right text-sm text-text-light">
          Total:{" "}
          <span className="font-semibold text-forest">
            {rubric.reduce((sum, c) => sum + c.weight * 4, 0)} points possible
          </span>{" "}
          ({rubric.reduce((sum, c) => sum + c.weight, 0)} pts across{" "}
          {rubric.length} criteria &times; 4 levels)
        </div>
      </div>

      {/* Mobile: Stacked card layout */}
      <div className="md:hidden space-y-4">
        {rubric.map((criterion) => {
          const sortedLevels = [...criterion.levels].sort(
            (a, b) => b.score - a.score
          );

          return (
            <div
              key={criterion.criterionName}
              className="rounded-lg border border-border bg-card overflow-hidden"
            >
              {/* Criterion header */}
              <div className="bg-forest/5 px-4 py-3 border-b border-border">
                <div className="font-heading font-semibold text-forest-dark">
                  {criterion.criterionName}
                </div>
                <div className="text-xs text-text-light mt-0.5">
                  {criterion.weight} points
                </div>
              </div>

              {/* Levels stacked */}
              <div className="divide-y divide-border">
                {sortedLevels.map((level) => {
                  const levelColors: Record<string, string> = {
                    Exemplary: "text-success",
                    Proficient: "text-forest",
                    Developing: "text-warning",
                    Beginning: "text-error",
                  };

                  return (
                    <div key={level.score} className="px-4 py-3">
                      <div
                        className={`text-xs font-semibold uppercase tracking-wide ${levelColors[level.label] ?? "text-text"}`}
                      >
                        {level.label} ({level.score})
                      </div>
                      <p className="mt-1 text-sm text-text leading-relaxed">
                        {level.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        <div className="text-center text-sm text-text-light">
          Total:{" "}
          <span className="font-semibold text-forest">
            {rubric.reduce((sum, c) => sum + c.weight * 4, 0)} points possible
          </span>
        </div>
      </div>
    </div>
  );
}

export { RubricDisplay, type RubricDisplayProps };
