"use client";

import { useState } from "react";
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
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** Teacher's own units (only when authenticated) */
  myUnits: UnitCardData[];
  /** Units shared with the teacher (only when authenticated) */
  sharedUnits: UnitCardData[];
  /** Public community units */
  communityUnits: UnitCardData[];
  /** Teacher display name (for header) */
  teacherName?: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  stage1: { label: "Stage 1", color: "var(--color-amber)" },
  stage2: { label: "Stage 2", color: "var(--color-amber)" },
  stage3: { label: "Stage 3", color: "var(--color-ink-muted)" },
  complete: { label: "Complete", color: "var(--color-subj-science)" },
};

type Tab = "my-units" | "shared" | "community";

/**
 * UnitTabs — the section below the hero.
 *
 * Unauthenticated: Shows "From the Community" with a flat card grid.
 * Authenticated: Shows tabs for "My Units" / "Shared with Me" / "Community"
 * with the teacher's actual units from the database.
 */
export function UnitTabs({
  isAuthenticated,
  myUnits,
  sharedUnits,
  communityUnits,
}: UnitTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("my-units");

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "my-units", label: "My Units", count: myUnits.length },
    { key: "shared", label: "Shared with Me", count: sharedUnits.length },
    { key: "community", label: "Community", count: communityUnits.length },
  ];

  /* Unauthenticated users always see community units regardless of tab state */
  const activeUnits = !isAuthenticated
    ? communityUnits
    : activeTab === "my-units"
      ? myUnits
      : activeTab === "shared"
        ? sharedUnits
        : communityUnits;

  return (
    <section className="border-t border-ruled bg-paper px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        {/* Header row */}
        {isAuthenticated ? (
          <div>
            {/* Tab bar */}
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
                  {/* Active indicator line */}
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
            <span className="font-ui text-sm font-medium text-ink-muted">
              View All
            </span>
          </div>
        )}

        {/* Card grid */}
        <div
          id={isAuthenticated ? `panel-${activeTab}` : undefined}
          role={isAuthenticated ? "tabpanel" : undefined}
          aria-label={isAuthenticated ? tabs.find((t) => t.key === activeTab)?.label : undefined}
          className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4"
        >
          {activeUnits.length === 0 ? (
            <div className="col-span-full py-12 text-center">
              <p className="font-ui text-sm text-pencil">
                {activeTab === "my-units"
                  ? "You haven't created any units yet. Use the builder above to get started!"
                  : activeTab === "shared"
                    ? "No units have been shared with you yet."
                    : "No community units available."}
              </p>
            </div>
          ) : (
            activeUnits.map((unit, i) => (
              <Link
                key={unit.id}
                href={unit.href}
                className={`card-lift focus-ring group block overflow-hidden rounded-xl border border-ruled bg-paper animate-stagger-${Math.min(i + 1, 4)}`}
              >
                {/* Subject color strip */}
                <div className="h-2" style={{ backgroundColor: unit.color }} aria-hidden="true" />

                <div className="p-4 sm:p-5">
                  {/* Subject + Grade + Status badges */}
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

                  {/* Title */}
                  <h3 className="mt-3 font-display text-base leading-snug text-graphite group-hover:text-ink sm:text-lg">
                    {unit.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-pencil">
                    {unit.description}
                  </p>

                  {/* Teacher + Uses */}
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

        {/* Show More (community tab only) */}
        {((isAuthenticated && activeTab === "community") || !isAuthenticated) &&
          activeUnits.length > 0 && (
            <div className="mt-8 text-center sm:mt-10">
              <button className="focus-ring rounded-full border border-ruled px-6 py-2.5 font-ui text-sm font-medium text-pencil transition hover:border-ink-muted hover:bg-chalk hover:text-graphite">
                Show More
              </button>
            </div>
          )}
      </div>
    </section>
  );
}
