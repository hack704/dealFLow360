import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon: Icon,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-full focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed select-none active:scale-[0.98] tracking-tight whitespace-nowrap shrink-0 w-auto';

  const variants = {
    primary:
      'bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-sm shadow-blue-500/25 focus:ring-2 focus:ring-[#0071e3]/40 border border-[#0071e3]/20',
    secondary:
      'bg-black/[0.05] hover:bg-black/[0.08] dark:bg-white/[0.08] dark:hover:bg-white/[0.12] text-[#1d1d1f] dark:text-[#f5f5f7] border border-black/[0.08] dark:border-white/[0.12] focus:ring-2 focus:ring-[#0071e3]/20',
    outline:
      'bg-transparent hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-[#1d1d1f] dark:text-[#f5f5f7] border border-black/[0.15] dark:border-white/[0.18] focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20',
    danger:
      'bg-[#ff453a] hover:bg-[#e0382e] text-white shadow-sm shadow-red-500/20 focus:ring-2 focus:ring-[#ff453a]/40 border border-white/10',
    ghost:
      'bg-transparent hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-[#6e6e73] hover:text-[#1d1d1f] dark:text-apple-muted dark:hover:text-white border-transparent',
    success:
      'bg-[#30d158] hover:bg-[#28c14e] text-black font-semibold shadow-sm shadow-emerald-500/20 focus:ring-2 focus:ring-[#30d158]/40 border border-white/10',
    dark:
      'bg-neutral-800 hover:bg-neutral-700 dark:bg-[#1c1c1e] dark:hover:bg-[#2c2c2e] text-[#f5f5f7] border border-black/10 dark:border-white/[0.10]'
  };

  const sizes = {
    xs: 'text-[13px] px-3 py-1 gap-1.5 rounded-lg min-h-[30px]',
    sm: 'text-[13px] px-3.5 py-1.5 gap-2 rounded-xl min-h-[34px]',
    md: 'text-[13px] px-4.5 py-2 gap-2 rounded-xl min-h-[38px]',
    lg: 'text-[13px] px-6 py-2.5 gap-2.5 rounded-xl font-semibold min-h-[44px]'
  };

  const iconSizes = {
    xs: 'w-4 h-4 shrink-0',
    sm: 'w-4 h-4 shrink-0',
    md: 'w-4 h-4 shrink-0',
    lg: 'w-4 h-4 shrink-0'
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin -ml-0.5 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
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
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : Icon ? (
        <Icon className={iconSizes[size] || 'w-4 h-4 shrink-0'} />
      ) : null}
      <span>{children}</span>
    </button>
  );
};

export default Button;
