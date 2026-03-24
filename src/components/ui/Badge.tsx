type BadgeVariant =
  | 'multiple_choice'
  | 'document_based'
  | 'constructed_response'
  | 'performance_task'
  | 'check'
  | 'remember'
  | 'understand'
  | 'apply'
  | 'analyze'
  | 'evaluate'
  | 'create'
  | 'info'
  | 'points';

interface BadgeProps {
  variant: BadgeVariant;
  label?: string;
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
  performance_task: {
    label: 'Performance Task',
    classes: 'bg-purple-100 text-purple-800',
  },
  check: {
    label: 'Check for Understanding',
    classes: 'bg-blue-100 text-blue-800',
  },
  remember: {
    label: 'Remember',
    classes: 'bg-gray-100 text-gray-700',
  },
  understand: {
    label: 'Understand',
    classes: 'bg-blue-50 text-blue-700',
  },
  apply: {
    label: 'Apply',
    classes: 'bg-green-50 text-green-700',
  },
  analyze: {
    label: 'Analyze',
    classes: 'bg-yellow-50 text-yellow-700',
  },
  evaluate: {
    label: 'Evaluate',
    classes: 'bg-orange-50 text-orange-700',
  },
  create: {
    label: 'Create',
    classes: 'bg-red-50 text-red-700',
  },
  info: {
    label: 'Info',
    classes: 'bg-gray-100 text-gray-600',
  },
  points: {
    label: 'Points',
    classes: 'bg-forest/10 text-forest',
  },
};

function Badge({ variant, label, className = '' }: BadgeProps) {
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
      {label ?? config.label}
    </span>
  );
}

export { Badge, type BadgeProps, type BadgeVariant };
