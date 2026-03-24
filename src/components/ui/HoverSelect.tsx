"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface HoverSelectProps {
  /** Current selected value (empty string = placeholder) */
  value: string;
  /** Called when user selects an option */
  onChange: (value: string) => void;
  /** Placeholder text shown when no value is selected */
  placeholder: string;
  /** Array of option values */
  options: string[];
  /** Optional: custom labels for options (same order as options) */
  labels?: string[];
  /** Disabled state */
  disabled?: boolean;
  /** Accessible label */
  ariaLabel: string;
}

/**
 * HoverSelect — a custom dropdown that opens on hover for frictionless selection.
 *
 * Designed to feel like inline text that reveals choices on hover.
 * Opens on mouseenter (with a short delay to prevent accidental triggers),
 * stays open while the cursor is inside, and closes on mouseleave or selection.
 *
 * Keyboard accessible: opens on focus/Enter/Space, navigates with arrows.
 */
export function HoverSelect({
  value,
  onChange,
  placeholder,
  options,
  labels,
  disabled = false,
  ariaLabel,
}: HoverSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const displayValue = value || placeholder;
  const isPlaceholder = !value;

  /* Clean up timer on unmount */
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, []);

  /* Scroll highlighted item into view */
  useEffect(() => {
    if (isOpen && highlightIndex >= 0 && listRef.current) {
      const item = listRef.current.children[highlightIndex] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightIndex, isOpen]);

  const open = useCallback(() => {
    if (disabled) return;
    setIsOpen(true);
    // Pre-highlight the currently selected item
    const idx = options.indexOf(value);
    setHighlightIndex(idx >= 0 ? idx : 0);
  }, [disabled, options, value]);

  const close = useCallback(() => {
    setIsOpen(false);
    setHighlightIndex(-1);
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  }, []);

  function select(val: string) {
    onChange(val);
    close();
  }

  function handleMouseEnter() {
    if (disabled) return;
    // Small delay prevents accidental opens when cursor sweeps across
    hoverTimerRef.current = setTimeout(() => {
      open();
    }, 120);
  }

  function handleMouseLeave() {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    // Slightly longer delay so user can move cursor into the dropdown
    hoverTimerRef.current = setTimeout(() => {
      close();
    }, 200);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;

    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        if (isOpen && highlightIndex >= 0) {
          select(options[highlightIndex]);
        } else {
          open();
        }
        break;
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) {
          open();
        } else {
          setHighlightIndex((prev) => Math.min(prev + 1, options.length - 1));
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (isOpen) {
          setHighlightIndex((prev) => Math.max(prev - 1, 0));
        }
        break;
      case "Escape":
        close();
        break;
      case "Tab":
        close();
        break;
    }
  }

  /* Close if clicking outside */
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, close]);

  return (
    <div
      ref={containerRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger */}
      <button
        type="button"
        onClick={() => (isOpen ? close() : open())}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        className={`
          inline-flex items-center gap-1 rounded-md px-1.5 py-1
          font-ui text-xs font-medium transition-all sm:text-sm
          focus:outline-none disabled:opacity-50
          ${isPlaceholder ? "text-pencil/70" : "text-graphite"}
          ${isOpen
            ? "bg-chalk text-graphite"
            : "hover:bg-chalk/60 hover:text-graphite"
          }
        `}
      >
        <span>{displayValue}</span>
        <svg
          className={`h-3 w-3 text-pencil/50 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <ul
          ref={listRef}
          role="listbox"
          aria-label={ariaLabel}
          className="absolute left-0 top-full z-[200] mt-1 max-h-56 min-w-[160px] overflow-y-auto rounded-xl border border-ruled bg-paper py-1 shadow-lg"
        >
          {options.map((opt, i) => {
            const label = labels?.[i] || opt;
            const isSelected = opt === value;
            const isHighlighted = i === highlightIndex;

            return (
              <li
                key={opt}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setHighlightIndex(i)}
                onClick={() => select(opt)}
                className={`
                  cursor-pointer px-3 py-1.5 font-ui text-xs sm:text-sm transition-colors
                  ${isHighlighted ? "bg-chalk text-graphite" : "text-pencil"}
                  ${isSelected ? "font-semibold text-ink" : "font-normal"}
                `}
              >
                {label}
                {isSelected && (
                  <svg className="ml-1.5 inline h-3 w-3 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
