import React from 'react';

export const Card = ({ children, className = '', hover = false, ...props }) => {
  return (
    <div
      className={`bg-white/85 dark:bg-[#161618]/90 text-[#1d1d1f] dark:text-[#f5f5f7] backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.08] rounded-[22px] p-6 sm:p-7 shadow-[0_2px_14px_rgba(0,0,0,0.04)] dark:shadow-apple-card transition-all duration-200 ${
        hover ? 'hover:border-[#0071e3]/40 dark:hover:border-white/[0.18] hover:shadow-lg dark:hover:bg-[#1a1a1d]' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`flex items-center justify-between pb-4 border-b border-black/[0.06] dark:border-white/[0.06] mb-5 ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-[15px] sm:text-[16px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight flex items-center gap-2.5 ${className}`}>
    {children}
  </h3>
);

export default Card;
