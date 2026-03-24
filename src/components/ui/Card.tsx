interface CardProps {
  children: React.ReactNode;
  hover?: boolean;
  className?: string;
}

/**
 * Card — academic editorial design system.
 *
 * Paper-white background with subtle ruled border and soft shadow.
 * Matches the landing page's card-lift style on hover.
 */
function Card({ children, hover = false, className = "" }: CardProps) {
  return (
    <div
      className={`
        rounded-xl border border-ruled bg-paper p-6
        shadow-[0_1px_3px_rgba(27,42,74,0.06)]
        ${hover ? "card-lift transition-shadow duration-200" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export { Card, type CardProps };
