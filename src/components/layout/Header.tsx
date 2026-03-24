"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ButterflyLogo } from "@/components/ui/ButterflyLogo";

/**
 * Shared header for inner pages (unit overview, stages, results, etc.)
 *
 * Client component that checks auth state via /api/auth/check on mount,
 * then renders the appropriate header (matching the landing page style).
 */
function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [teacherName, setTeacherName] = useState<string | null>(null);
  const [teacherInitial, setTeacherInitial] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/check")
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated) {
          setIsAuthenticated(true);
          setTeacherName(data.displayName || "Teacher");
          setTeacherInitial((data.displayName?.[0] || "T").toUpperCase());
        }
      })
      .catch(() => {});
  }, []);

  /* Close dropdown when clicking anywhere outside it */
  useEffect(() => {
    if (!showDropdown) return;
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    // Use mousedown so it fires before the button's click is swallowed
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.replace("/");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-ruled/60 bg-paper/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
        <Link
          href="/"
          className="focus-ring flex items-center gap-2"
          aria-label="Backward Builder home"
        >
          <ButterflyLogo size={28} className="text-graphite" />
          <span className="font-display text-xl text-ink sm:text-2xl">
            Backward Builder
          </span>
        </Link>

        {isAuthenticated ? (
          <div className="relative flex items-center gap-3" ref={dropdownRef}>
            <Link
              href="/"
              className="focus-ring hidden rounded-lg px-3.5 py-2 font-ui text-sm font-medium text-pencil transition hover:bg-chalk hover:text-graphite sm:inline-flex"
            >
              Design a Unit
            </Link>
            <span className="hidden font-ui text-sm text-pencil sm:inline">
              {teacherName}
            </span>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="focus-ring flex h-8 w-8 items-center justify-center rounded-full bg-ink text-xs font-bold text-white transition hover:bg-ink-light"
              aria-label={`Account menu for ${teacherName}`}
              aria-expanded={showDropdown}
              aria-haspopup="true"
            >
              {teacherInitial}
            </button>

            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-ruled bg-paper py-1.5 shadow-lg">
                <div className="border-b border-ruled px-4 py-2">
                  <p className="font-ui text-sm font-medium text-graphite">{teacherName}</p>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="focus-ring flex w-full items-center gap-2 px-4 py-2 font-ui text-sm text-pencil transition hover:bg-chalk hover:text-graphite disabled:opacity-50"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  {loggingOut ? "Signing out…" : "Sign out"}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="/api/demo"
              className="focus-ring hidden rounded-lg px-3.5 py-2 font-ui text-sm font-medium text-pencil transition hover:bg-chalk hover:text-graphite sm:inline-flex"
            >
              Try Demo
            </a>
            <Link
              href="/"
              className="focus-ring rounded-lg bg-ink px-4 py-2 font-ui text-sm font-semibold text-white shadow-sm transition hover:bg-ink-light"
            >
              Sign up
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}

export { Header };
