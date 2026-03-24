"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface StandardPopoverProps {
  /** The standard code (e.g., "MS-LS2-2", "CCSS.ELA-LITERACY.RL.6.1") */
  code: string;
  /** Full description text of the standard */
  description: string;
  /** Title of the standard set from CSP (e.g., "Missouri Mathematics") */
  setTitle?: string | null;
  /** Subject area from CSP (e.g., "Science", "Mathematics") */
  setSubject?: string | null;
  /** Education levels from CSP (e.g., ["06", "07", "08"]) */
  setEducationLevels?: string[] | null;
}

/**
 * Format education levels into a readable string.
 *
 * CSP returns levels like ["06", "07", "08"] or ["Pre-K", "K", "01", "02"].
 * We convert these to "Grades 6–8" or "Pre-K – Grade 2" for display.
 */
function formatEducationLevels(levels: string[]): string {
  if (!levels || levels.length === 0) return "";

  // Sort and deduplicate
  const sorted = [...new Set(levels)].sort((a, b) => {
    if (a === "Pre-K") return -1;
    if (b === "Pre-K") return 1;
    if (a === "K") return b === "Pre-K" ? 1 : -1;
    if (b === "K") return a === "Pre-K" ? -1 : 1;
    return parseInt(a) - parseInt(b);
  });

  const formatOne = (level: string): string => {
    if (level === "Pre-K") return "Pre-K";
    if (level === "K") return "Kindergarten";
    const num = parseInt(level);
    if (!isNaN(num)) return `Grade ${num}`;
    return level;
  };

  if (sorted.length === 1) return formatOne(sorted[0]);

  // If consecutive, show as range
  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  const firstNum = first === "Pre-K" ? -1 : first === "K" ? 0 : parseInt(first);
  const lastNum = last === "Pre-K" ? -1 : last === "K" ? 0 : parseInt(last);

  if (!isNaN(firstNum) && !isNaN(lastNum) && lastNum - firstNum === sorted.length - 1) {
    // Consecutive range
    if (firstNum > 0 && lastNum > 0) return `Grades ${firstNum}–${lastNum}`;
    return `${formatOne(first)} – ${formatOne(last)}`;
  }

  // Non-consecutive, list them
  return sorted.map(formatOne).join(", ");
}

/**
 * StandardPopover — an inline popover card for standard code badges.
 *
 * Shows the standard's details from the Common Standards Project:
 * - Set title (e.g., "Missouri Mathematics")
 * - Subject area
 * - Education levels (grades)
 * - Standard code and full description
 *
 * No external links — all information is displayed inline.
 * Positioning auto-detects above/below. Closes on outside click or Escape.
 */
function StandardPopover({
  code,
  description,
  setTitle,
  setSubject,
  setEducationLevels,
}: StandardPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<"above" | "below">("below");
  const badgeRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const educationLabel = setEducationLevels?.length
    ? formatEducationLevels(setEducationLevels)
    : null;

  /** Calculate whether the popover should appear above or below */
  const updatePosition = useCallback(() => {
    if (!badgeRef.current) return;
    const rect = badgeRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    setPosition(spaceBelow < 240 ? "above" : "below");
  }, []);

  /** Close on outside click */
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        badgeRef.current &&
        !badgeRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  function handleToggle() {
    if (!isOpen) updatePosition();
    setIsOpen((prev) => !prev);
  }

  return (
    <span className="relative inline-block">
      {/* Badge button */}
      <button
        ref={badgeRef}
        type="button"
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className={`
          rounded-md border border-ruled bg-chalk px-2.5 py-1
          font-mono text-xs font-semibold text-graphite
          transition cursor-pointer
          hover:border-ink-muted hover:bg-ink/5 hover:text-ink
          focus-ring
        `}
      >
        {code}
        <svg
          className="ml-1 inline-block h-3 w-3 opacity-40"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>

      {/* Popover panel */}
      {isOpen && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label={`Standard ${code} details`}
          className={`
            absolute z-50 w-[340px]
            rounded-lg border border-ruled bg-paper
            shadow-[0_4px_16px_rgba(27,42,74,0.12)]
            p-4
            ${position === "above" ? "bottom-full mb-2" : "top-full mt-2"}
            left-0
          `}
        >
          {/* Header: Set title, subject, education level */}
          {setTitle && (
            <h4 className="font-display text-sm font-semibold text-ink leading-snug mb-1">
              {setTitle}
            </h4>
          )}

          {/* Subject and grade metadata pills */}
          {(setSubject || educationLabel) && (
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {setSubject && (
                <span className="rounded-full bg-chalk px-2.5 py-0.5 font-ui text-[11px] font-medium text-graphite">
                  {setSubject}
                </span>
              )}
              {educationLabel && (
                <span className="rounded-full bg-chalk px-2.5 py-0.5 font-ui text-[11px] font-medium text-graphite">
                  {educationLabel}
                </span>
              )}
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-ruled/50 mb-3" />

          {/* Standard code */}
          <p className="font-mono text-sm font-bold text-ink mb-2">
            {code}
          </p>

          {/* Description */}
          <p className="font-ui text-sm text-graphite leading-relaxed">
            {description || "No description available."}
          </p>

          {/* Source attribution */}
          <p className="mt-3 font-ui text-[10px] text-pencil/50">
            Source: Common Standards Project
          </p>
        </div>
      )}
    </span>
  );
}

export { StandardPopover };
