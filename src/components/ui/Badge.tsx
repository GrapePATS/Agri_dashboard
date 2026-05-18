import { type ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'neutral' | 'info';
  size?: 'sm' | 'md';
}

// REDESIGN: success uses palette Surf Crest bg + Green Pea text
const variantClasses: Record<string, string> = {
  default: 'bg-[#d2e5d3] text-[#1d6233]',
  success: 'bg-[#d2e5d3] text-[#1d6233]',
  warning: 'bg-amber-100 text-amber-800',
  danger: 'bg-red-100 text-red-800',
  neutral: 'bg-gray-100 text-gray-700',
  info: 'bg-sky-100 text-sky-800',
};

export function Badge({ children, variant = 'default', size = 'sm' }: BadgeProps) {
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';
  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full ${sizeClass} ${variantClasses[variant]}`}
    >
      {children}
    </span>
  );
}
