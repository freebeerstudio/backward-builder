"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "accent" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

/**
 * Button — academic editorial design system.
 *
 * Uses ink (dark navy), burgundy, and amber from the landing page palette.
 * Rounded-lg, font-ui (Plus Jakarta Sans), focus-ring for accessibility.
 */
const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-ink text-white hover:bg-ink-light active:bg-graphite disabled:bg-ink/40 disabled:text-white/60",
  secondary:
    "bg-paper text-ink border border-ruled hover:border-ink-muted hover:bg-chalk disabled:opacity-50",
  accent:
    "bg-amber text-white hover:bg-amber/90 active:bg-amber disabled:opacity-50",
  ghost:
    "bg-transparent text-ink hover:bg-chalk disabled:opacity-50",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3 text-base",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      disabled,
      className = "",
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          focus-ring inline-flex items-center justify-center gap-2
          rounded-lg font-ui font-semibold
          transition-all duration-200 ease-in-out
          cursor-pointer disabled:cursor-not-allowed
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${fullWidth ? "w-full" : ""}
          ${className}
        `}
        {...props}
      >
        {loading && (
          <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

export { Button, type ButtonProps, type ButtonVariant, type ButtonSize };
