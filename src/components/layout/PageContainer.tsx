interface PageContainerProps {
  children: React.ReactNode;
  wide?: boolean;
  className?: string;
}

function PageContainer({ children, wide = false, className = '' }: PageContainerProps) {
  return (
    <div
      className={`
        mx-auto w-full px-4 md:px-6
        ${wide ? 'max-w-[1024px]' : 'max-w-[720px]'}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export { PageContainer, type PageContainerProps };
