type BadgeVariant = 'multiple_choice' | 'document_based' | 'constructed_response';

interface BadgeProps {
  variant: BadgeVariant;
  className?: string;
}

const variantConfig: Record<BadgeVariant, { label: string; classes: string }> = {
  multiple_choice: {
    label: 'Multiple Choice',
    classes: 'bg-blue-100 text-blue-800',
  },
  document_based: {
    label: 'Document-Based',
    classes: 'bg-purple-100 text-purple-800',
  },
  constructed_response: {
    label: 'Constructed Response',
    classes: 'bg-gold-light text-forest-dark',
  },
};

function Badge({ variant, className = '' }: BadgeProps) {
  const config = variantConfig[variant];

  return (
    <span
      className={`
        inline-block rounded-full px-3 py-0.5
        text-xs font-medium font-body
        ${config.classes}
        ${className}
      `}
    >
      {config.label}
    </span>
  );
}

export { Badge, type BadgeProps, type BadgeVariant };
