import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'sm', className = '' }) => {
  const variants = {
    default: 'bg-black/[0.05] dark:bg-white/[0.08] text-[#1d1d1f] dark:text-[#f5f5f7] border-black/[0.08] dark:border-white/[0.10]',
    primary: 'bg-[#0071e3]/10 dark:bg-[#0071e3]/15 text-[#0071e3] dark:text-[#2997ff] border-[#0071e3]/25 dark:border-[#0071e3]/30',
    success: 'bg-[#30d158]/12 dark:bg-[#30d158]/15 text-[#1b7e36] dark:text-[#30d158] border-[#30d158]/25 dark:border-[#30d158]/30',
    warning: 'bg-[#ff9f0a]/12 dark:bg-[#ff9f0a]/15 text-[#9e5200] dark:text-[#ff9f0a] border-[#ff9f0a]/25 dark:border-[#ff9f0a]/30',
    danger: 'bg-[#ff453a]/12 dark:bg-[#ff453a]/15 text-[#c91d12] dark:text-[#ff453a] border-[#ff453a]/25 dark:border-[#ff453a]/30',
    info: 'bg-[#64d2ff]/15 dark:bg-[#64d2ff]/15 text-[#006699] dark:text-[#64d2ff] border-[#64d2ff]/25 dark:border-[#64d2ff]/30',
    purple: 'bg-[#bf5af2]/12 dark:bg-[#bf5af2]/15 text-[#79349e] dark:text-[#bf5af2] border-[#bf5af2]/25 dark:border-[#bf5af2]/30'
  };

  const sizes = {
    xs: 'text-[13px] px-3 py-0.5 tracking-tight font-medium',
    sm: 'text-[13px] px-3.5 py-1 tracking-tight font-medium',
    md: 'text-[13px] px-4 py-1.5 font-medium'
  };

  return (
    <span
      className={`inline-flex items-center justify-center w-fit whitespace-nowrap shrink-0 rounded-full border backdrop-blur-md shadow-[0_1px_2px_rgba(0,0,0,0.02)] ${variants[variant] || variants.default} ${sizes[size] || sizes.sm} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
