import React from 'react';

export const Select = ({
  label,
  error,
  options = [],
  value,
  onChange,
  className = '',
  placeholder = 'Select an option...',
  id,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-2">
      {label && (
        <label htmlFor={selectId} className="block text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">
          {label}
        </label>
      )}
      <select
        id={selectId}
        value={value}
        onChange={onChange}
        className={`block w-full h-11 rounded-xl bg-white dark:bg-[#1c1c1e] border border-black/[0.12] dark:border-white/[0.12] text-[#1d1d1f] dark:text-[#f5f5f7] text-[13px] focus:outline-none focus:border-[#0071e3] dark:focus:border-[#2997ff] focus:ring-4 focus:ring-[#0071e3]/15 dark:focus:ring-[#2997ff]/20 transition-all px-3.5 py-2.5 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.03)] dark:shadow-none ${
          error ? 'border-[#ff453a] focus:border-[#ff453a] focus:ring-[#ff453a]/20' : ''
        } ${className}`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled className="bg-white dark:bg-[#1c1c1e] text-[#86868b] dark:text-apple-dim">
            {placeholder}
          </option>
        )}
        {options.map((opt) => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const lbl = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={val} value={val} className="bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-[#f5f5f7]">
              {lbl}
            </option>
          );
        })}
      </select>
      {error && <p className="text-[13px] text-[#ff453a] mt-1">{error}</p>}
    </div>
  );
};

export default Select;
