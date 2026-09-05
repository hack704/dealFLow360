import React from 'react';

export const Input = ({
  label,
  error,
  helperText,
  icon: Icon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-2">
      {label && (
        <label htmlFor={inputId} className="block text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">
          {label}
        </label>
      )}
      <div className="relative rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.03)] dark:shadow-none">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#86868b] dark:text-apple-muted">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={inputId}
          className={`block w-full h-11 rounded-xl bg-white dark:bg-white/[0.06] border border-black/[0.12] dark:border-white/[0.12] text-[#1d1d1f] dark:text-[#f5f5f7] text-[13px] placeholder-[#86868b] dark:placeholder-[#6e6e73] focus:outline-none focus:border-[#0071e3] dark:focus:border-[#2997ff] focus:ring-4 focus:ring-[#0071e3]/15 dark:focus:ring-[#2997ff]/20 transition-all ${
            Icon ? 'pl-10' : 'pl-3.5'
          } pr-3.5 py-2.5 ${error ? 'border-[#ff453a] focus:border-[#ff453a] focus:ring-[#ff453a]/20' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-[13px] text-[#ff453a] mt-1">{error}</p>}
      {!error && helperText && <p className="text-[13px] text-[#6e6e73] dark:text-apple-dim mt-1">{helperText}</p>}
    </div>
  );
};

export default Input;
