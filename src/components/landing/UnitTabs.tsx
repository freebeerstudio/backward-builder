"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

/** Shape for a unit card — works for both DB units and mock community units */
export interface UnitCardData {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade: string;
  teacher: string;
  initial: string;
  uses?: number;
  status?: string;
  color: string;
  href: string;
}

interface UnitTabsProps {
  isAuthenticated: boolean;
  myUnits: UnitCardData[];
  sharedUnits: UnitCardData[];
  communityUnits: UnitCardData[];
  teacherName?: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  stage1: { label: "Stage 1", color: "var(--color-amber)" },
  stage2: { label: "Stage 2", color: "var(--color-amber)" },
  stage3: { label: "Stage 3", color: "var(--color-ink-muted)" },
  complete: { label: "Complete", color: "var(--color-subj-science)" },
};

const PAGE_SIZE = 8;
/** Minimum units before showing the filter bar */
const FILTER_THRESHOLD = 3;

type Tab = "my-units" | "shared" | "community";

/**
 * UnitTabs — the section below the hero.
 *
 * Unauthenticated: "From the Community" with filters + card grid.
 * Authenticated: Tabs → filters → card grid.
 *
 * Filter bar: small toggle chips auto-populated from the data.
 * Distinct from the tabs — chips are inline, rounded-full, and toggle on/off.
 */
export function UnitTabs({
  isAuthenticated,
  myUnits,
  sharedUnits,
  communityUnits,
}: UnitTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("my-units");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [activeGrade, setActiveGrade] = useState<string | null>(null);
  const [activeSubject, setActiveSubject] = useState<string | null>(null);

  /* Reset filters + pagination when switching tabs */
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    setActiveGrade(null);
    setActiveSubject(null);
  }, [activeTab]);

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "my-units", label: "My Units", count: myUnits.length },
    { key: "shared", label: "Shared with Me", count: sharedUnits.length },
    { key: "community", label: "Community", count: communityUnits.length },
  ];

  /* Unauthenticated users always see community units */
  const allUnits = !isAuthenticated
    ? communityUnits
    : activeTab === "my-units"
      ? myUnits
      : activeTab === "shared"
        ? sharedUnits
        : communityUnits;

  /* Extract unique grades and subjects from the current data set */
  const { grades, subjects } = useMemo(() => {
    const gradeSet = new Set<string>();
    const subjectSet = new Set<string>();
    for (const u of allUnits) {
      if (u.grade) gradeSet.add(u.grade);
      if (u.subject) subjectSet.add(u.subject);
    }
    return {
      grades: Array.from(gradeSet).sort((a, b) => {
        // Sort grades numerically where possible
        const numA = parseInt(a);
        const numB = parseInt(b);
        if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
        return a.localeCompare(b);
      }),
      subjects: Array.from(subjectSet).sort(),
    };
  }, [allUnits]);

  /* Apply filters */
  const filteredUnits = useMemo(() => {
    let result = allUnits;
    if (activeGrade) {
      result = result.filter((u) => u.grade === activeGrade);
    }
    if (activeSubject) {
      result = result.filter((u) => u.subject === activeSubject);
    }
    return result;
  }, [allUnits, activeGrade, activeSubject]);

  const visibleUnits = filteredUnits.slice(0, visibleCount);
  const hasMore = filteredUnits.length > visibleCount;
  const showFilters = allUnits.length >= FILTER_THRESHOLD && (grades.length > 1 || subjects.length > 1);
  const hasActiveFilters = activeGrade !== null || activeSubject !== null;

  return (
    <section className="border-t border-ruled bg-paper px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        {/* Header row */}
        {isAuthenticated ? (
          <div>
            <div className="flex items-center gap-1 border-b border-ruled" role="tablist" aria-label="Unit categories">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  role="tab"
                  aria-selected={activeTab === tab.key}
                  aria-controls={`panel-${tab.key}`}
                  onClick={() => setActiveTab(tab.key)}
                  className={`focus-ring relative px-4 py-3 font-ui text-sm font-medium transition ${
                    activeTab === tab.key
                      ? "text-ink"
                      : "text-pencil hover:text-graphite"
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold ${
                      activeTab === tab.key
                        ? "bg-ink text-white"
                        : "bg-chalk text-pencil"
                    }`}>
                      {tab.count}
                    </span>
                  )}
                  {activeTab === tab.key && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-ink" />
                  )}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-2xl text-ink sm:text-3xl">
              From the Community
            </h2>
          </div>
        )}

        {/* ---- Filter chips ---- */}
        {showFilters && (
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 sm:mt-6">
            {/* Subject filters */}
            {subjects.length > 1 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="mr-0.5 font-ui text-[10px] font-semibold uppercase tracking-widest text-pencil/50">
                  Subject
                </span>
                {subjects.map((subj) => (
                  <button
                    key={subj}
                    onClick={() => setActiveSubject(activeSubject === subj ? null : subj)}
                    className={`rounded-full px-2.5 py-1 font-ui text-[11px] font-medium transition ${
                      activeSubject === subj
                        ? "bg-ink text-white shadow-sm"
                        : "bg-chalk/70 text-pencil hover:bg-chalk hover:text-graphite"
                    }`}
                  >
                    {subj}
                  </button>
                ))}
              </div>
            )}

            {/* Separator dot when both groups show */}
            {subjects.length > 1 && grades.length > 1 && (
              <span className="text-ruled">|</span>
            )}

            {/* Grade filters */}
            {grades.length > 1 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="mr-0.5 font-ui text-[10px] font-semibold uppercase tracking-widest text-pencil/50">
                  Grade
                </span>
                {grades.map((gr) => (
                  <button
                    key={gr}
                    onClick={() => setActiveGrade(activeGrade === gr ? null : gr)}
                    className={`rounded-full px-2.5 py-1 font-ui text-[11px] font-medium transition ${
                      activeGrade === gr
                        ? "bg-ink text-white shadow-sm"
                        : "bg-chalk/70 text-pencil hover:bg-chalk hover:text-graphite"
                    }`}
                  >
                    {gr}
                  </button>
                ))}
              </div>
            )}

            {/* Clear all */}
            {hasActiveFilters && (
              <button
                onClick={() => { setActiveGrade(null); setActiveSubject(null); }}
                className="ml-1 font-ui text-[11px] font-medium text-pencil/60 underline underline-offset-2 transition hover:text-graphite"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Card grid */}
        <div
          id={isAuthenticated ? `panel-${activeTab}` : undefined}
          role={isAuthenticated ? "tabpanel" : undefined}
          aria-label={isAuthenticated ? tabs.find((t) => t.key === activeTab)?.label : undefined}
          className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4"
        >
          {visibleUnits.length === 0 ? (
            <div className="col-span-full py-12 text-center">
              <p className="font-ui text-sm text-pencil">
                {hasActiveFilters
                  ? "No units match the selected filters."
                  : !isAuthenticated
                    ? "No community units available yet."
                    : activeTab === "my-units"
                      ? "You haven't created any units yet. Use the builder above to get started!"
                      : activeTab === "shared"
                        ? "No units have been shared with you yet."
                        : "No community units available."}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={() => { setActiveGrade(null); setActiveSubject(null); }}
                  className="mt-2 font-ui text-sm font-medium text-ink underline underline-offset-2 hover:text-ink-light"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            visibleUnits.map((unit, i) => (
              <Link
                key={unit.id}
                href={unit.href}
                className={`card-lift focus-ring group block overflow-hidden rounded-xl border border-ruled bg-paper animate-stagger-${Math.min(i + 1, 4)}`}
              >
                <div className="h-2" style={{ backgroundColor: unit.color }} aria-hidden="true" />

                <div className="p-4 sm:p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white"
                      style={{ backgroundColor: unit.color }}
                    >
                      {unit.subject}
                    </span>
                    <span className="rounded-md border border-ruled px-2 py-0.5 text-[11px] font-medium text-pencil">
                      {unit.grade}
                    </span>
                    {unit.status && STATUS_LABELS[unit.status] && (
                      <span
                        className="rounded-md px-2 py-0.5 text-[11px] font-semibold text-white"
                        style={{ backgroundColor: STATUS_LABELS[unit.status].color }}
                      >
                        {STATUS_LABELS[unit.status].label}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-3 font-display text-base leading-snug text-graphite group-hover:text-ink sm:text-lg">
                    {unit.title}
                  </h3>

                  <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-pencil">
                    {unit.description}
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white"
                        style={{ backgroundColor: unit.color }}
                        aria-hidden="true"
                      >
                        {unit.initial}
                      </div>
                      <span className="text-xs font-medium text-pencil">{unit.teacher}</span>
                    </div>
                    {unit.uses !== undefined && (
                      <span className="text-xs text-pencil/70">{unit.uses} Uses</span>
                    )}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Show More */}
        {hasMore && (
          <div className="mt-8 text-center sm:mt-10">
            <button
              onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
              className="focus-ring rounded-full border border-ruled px-6 py-2.5 font-ui text-sm font-medium text-pencil transition hover:border-ink-muted hover:bg-chalk hover:text-graphite"
            >
              Show More ({filteredUnits.length - visibleCount} remaining)
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
