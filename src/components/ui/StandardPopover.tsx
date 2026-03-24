"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface StandardPopoverProps {
  /** The standard code (e.g., "MS-LS2-2", "CCSS.ELA-LITERACY.RL.6.1") */
  code: string;
  /** Full description text of the standard */
  description: string;
  /** Optional URL to the authoritative source */
  url?: string | null;
}

/**
 * Infer the framework display name from the standard code prefix.
 *
 * We detect this client-side from the code pattern rather than requiring
 * a server round-trip to the standards database. Covers the three framework
 * families in our verified database: NGSS, Common Core ELA, Common Core Math.
 */
function inferFramework(code: string): string {
  if (code.startsWith("MS-") || code.startsWith("HS-")) return "NGSS";
  if (code.startsWith("CCSS.ELA")) return "Common Core ELA";
  if (code.startsWith("CCSS.Math") || code.startsWith("CCSS.MATH")) return "Common Core Math";
  // State-specific standards from Common Standards Project
  if (code.includes("ELA") || code.includes("RL.") || code.includes("RI.") || code.includes("W.") || code.includes("RH.")) return "ELA Standard";
  if (code.includes("Math") || code.includes("MATH")) return "Math Standard";
  return "State Standard";
}

/**
 * StandardPopover — an inline popover card for standard code badges.
 *
 * Replaces the previous external-link behavior with an accessible popover
 * that shows the standard's details (code, framework, description) without
 * leaving the page. A "View source" link still provides access to the
 * authoritative external URL when available.
 *
 * Positioning: auto-detects whether to show above or below the badge
 * based on available viewport space. Closes on outside click or Escape.
 */
function StandardPopover({ code, description, url }: StandardPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<"above" | "below">("below");
  const badgeRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const framework = inferFramework(code);

  /** Calculate whether the popover should appear above or below */
  const updatePosition = useCallback(() => {
    if (!badgeRef.current) return;
    const rect = badgeRef.current.getBoundingClientRect();
    // If less than 200px below the badge, show above
    const spaceBelow = window.innerHeight - rect.bottom;
    setPosition(spaceBelow < 200 ? "above" : "below");
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
      {/* Badge button — same visual style as the previous <a>/<span> badges */}
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
        {/* Small info icon to hint at click behavior */}
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
            absolute z-50 w-[320px]
            rounded-lg border border-ruled bg-paper
            shadow-[0_4px_16px_rgba(27,42,74,0.12)]
            p-4
            ${position === "above" ? "bottom-full mb-2" : "top-full mt-2"}
            left-0
          `}
        >
          {/* Standard code */}
          <p className="font-mono text-sm font-bold text-ink mb-1">
            {code}
          </p>

          {/* Framework badge */}
          <p className="font-ui text-[11px] font-semibold uppercase tracking-wider text-pencil mb-3">
            {framework}
          </p>

          {/* Description */}
          <p className="font-ui text-sm text-graphite leading-relaxed">
            {description || "No description available."}
          </p>

          {/* View source link */}
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 font-ui text-xs font-semibold text-ink/70 transition hover:text-ink focus-ring rounded"
            >
              View source
              <svg
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </a>
          )}
        </div>
      )}
    </span>
  );
}

export { StandardPopover };
