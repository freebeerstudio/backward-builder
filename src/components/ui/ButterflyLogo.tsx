/**
 * ButterflyLogo — The Backward Builder brand mark.
 *
 * A butterfly whose wings form two mirrored "B" letters (one forward,
 * one backward). The body is the spine, antennae curl up from the top.
 * Clean, academic, and memorable — it embodies "backward" design.
 *
 * Props:
 *  - size: width/height in px (default 28)
 *  - className: additional CSS classes (inherits color via currentColor)
 */

interface ButterflyLogoProps {
  size?: number;
  className?: string;
}

export function ButterflyLogo({ size = 28, className = "" }: ButterflyLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 300 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <g transform="translate(150, 155)">
        {/* Body — central spine */}
        <line
          x1="0" y1="-80" x2="0" y2="90"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* Left antenna */}
        <path
          d="M0,-80 Q-30,-120 -45,-128"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="-47" cy="-130" r="5" fill="currentColor" />

        {/* Right antenna */}
        <path
          d="M0,-80 Q30,-120 45,-128"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="47" cy="-130" r="5" fill="currentColor" />

        {/* Right wing: forward B */}
        <path d="M10,-70 L10,70" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path d="M10,-70 C90,-70 90,0 10,0" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path d="M10,0 C100,0 100,70 10,70" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />

        {/* Left wing: backward B */}
        <path d="M-10,-70 L-10,70" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path d="M-10,-70 C-90,-70 -90,0 -10,0" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path d="M-10,0 C-100,0 -100,70 -10,70" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  );
}
