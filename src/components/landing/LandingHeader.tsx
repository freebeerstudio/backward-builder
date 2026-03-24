"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ButterflyLogo } from "@/components/ui/ButterflyLogo";
import { AuthModal } from "@/components/auth/AuthModal";

interface LandingHeaderProps {
  isAuthenticated: boolean;
  teacherName: string | null;
  teacherInitial: string;
}

/**
 * LandingHeader — client component for the sticky nav.
 *
 * Unauthenticated: Sign in / Sign up buttons that open the AuthModal
 * Authenticated: Teacher name + avatar + logout dropdown
 *
 * Listens for a custom "auth-changed" event so the header updates
 * immediately when the user authenticates via the chat box modal
 * (without waiting for a full page reload).
 */
export function LandingHeader({ isAuthenticated: serverAuth, teacherName: serverName, teacherInitial: serverInitial }: LandingHeaderProps) {
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"signup" | "signin">("signup");
  const [showDropdown, setShowDropdown] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  /* Local auth state that can be updated client-side */
  const [isAuthenticated, setIsAuthenticated] = useState(serverAuth);
  const [teacherName, setTeacherName] = useState(serverName);
  const [teacherInitial, setTeacherInitial] = useState(serverInitial);

  /* Sync with server props if they change (e.g., after router.refresh) */
  useEffect(() => {
    setIsAuthenticated(serverAuth);
    setTeacherName(serverName);
    setTeacherInitial(serverInitial);
  }, [serverAuth, serverName, serverInitial]);

  /* Listen for auth changes from sibling components (e.g., HeroChatBox) */
  useEffect(() => {
    function handleAuthChanged(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (detail) {
        setIsAuthenticated(true);
        setTeacherName(detail.displayName || "Teacher");
        setTeacherInitial((detail.displayName?.[0] || "T").toUpperCase());
      }
    }
    window.addEventListener("auth-changed", handleAuthChanged);
    return () => window.removeEventListener("auth-changed", handleAuthChanged);
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    // POST to server to clear the httpOnly cookie, then hard navigate.
    // We wait for the POST to complete so the cookie is cleared before
    // the browser requests the homepage.
    await fetch("/api/auth/logout", { method: "POST" });
    // Hard navigate (not router.push) to force full server re-render
    window.location.replace("/");
  }

  function handleAuthSuccess() {
    setShowAuthModal(false);
    router.refresh();
  }

  return (
    <>
      {/* Auth modal backdrop + modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[90] bg-ink/20 backdrop-blur-sm" aria-hidden="true" />
      )}
      <AuthModal
        isOpen={showAuthModal}
        initialMode={authMode}
        onSuccess={handleAuthSuccess}
        onClose={() => setShowAuthModal(false)}
      />

      <header className="sticky top-0 z-50 border-b border-ruled/60 bg-paper/80 backdrop-blur-md">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link href="/" className="focus-ring flex items-center gap-2" aria-label="Backward Builder home">
            <ButterflyLogo size={28} className="text-graphite" />
            <span className="font-display text-xl text-ink sm:text-2xl">Backward Builder</span>
          </Link>

          {isAuthenticated ? (
            /* Authenticated: name + avatar + dropdown */
            <div className="relative flex items-center gap-3">
              <span className="hidden font-ui text-sm text-pencil sm:inline">
                {teacherName}
              </span>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                className="focus-ring flex h-8 w-8 items-center justify-center rounded-full bg-ink text-xs font-bold text-white transition hover:bg-ink-light"
                aria-label={`Account menu for ${teacherName}`}
                aria-expanded={showDropdown}
                aria-haspopup="true"
              >
                {teacherInitial}
              </button>

              {/* Dropdown menu */}
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
            /* Unauthenticated: Try Demo + Sign in + Sign up */
            <div className="flex items-center gap-2 sm:gap-3">
              <a
                href="/api/demo"
                className="focus-ring hidden rounded-lg px-3.5 py-2 font-ui text-sm font-medium text-pencil transition hover:bg-chalk hover:text-graphite sm:inline-flex"
              >
                Try Demo
              </a>
              <button
                onClick={() => { setAuthMode("signin"); setShowAuthModal(true); }}
                className="focus-ring rounded-lg px-3.5 py-2 font-ui text-sm font-medium text-pencil transition hover:bg-chalk hover:text-graphite"
              >
                Sign in
              </button>
              <button
                onClick={() => { setAuthMode("signup"); setShowAuthModal(true); }}
                className="focus-ring rounded-lg bg-ink px-4 py-2 font-ui text-sm font-semibold text-white shadow-sm transition hover:bg-ink-light"
              >
                Sign up
              </button>
            </div>
          )}
        </nav>
      </header>
    </>
  );
}
