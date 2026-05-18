import { type ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

// REDESIGN: Primary uses Green Pea (#1d6233) from palette
const variantClasses: Record<string, string> = {
  primary: 'bg-[#1d6233] hover:bg-[#16502a] active:bg-[#123f21] text-white shadow-sm',
  secondary: 'bg-[#e9f6eb] hover:bg-[#d2e5d3] active:bg-[#abd8c8] text-[#1d6233]',
  ghost: 'hover:bg-[#e9f6eb] active:bg-[#d2e5d3] text-stone-700',
  danger: 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-sm',
};

const sizeClasses: Record<string, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  type = 'button',
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 font-medium rounded-xl
        transition-all duration-150 select-none
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
