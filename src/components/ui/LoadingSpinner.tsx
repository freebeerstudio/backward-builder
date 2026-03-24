type SpinnerSize = 'sm' | 'md' | 'lg';

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  message?: string;
  className?: string;
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'h-5 w-5',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

function LoadingSpinner({ size = 'md', message, className = '' }: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <svg
        className={`animate-spin text-forest ${sizeClasses[size]}`}
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
      {message && (
        <p className="text-sm text-text-light font-body">{message}</p>
      )}
    </div>
  );
}

export { LoadingSpinner, type LoadingSpinnerProps, type SpinnerSize };
