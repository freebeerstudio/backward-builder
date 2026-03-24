interface CardProps {
  children: React.ReactNode;
  hover?: boolean;
  className?: string;
}

function Card({ children, hover = false, className = '' }: CardProps) {
  return (
    <div
      className={`
        bg-card rounded-lg p-6
        shadow-[0_1px_3px_rgba(0,0,0,0.08)]
        ${hover ? 'transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export { Card, type CardProps };
