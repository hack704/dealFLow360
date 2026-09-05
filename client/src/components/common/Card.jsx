import React from 'react';

export const Card = ({ children, className = '', hover = false, ...props }) => {
  return (
    <div
      className={`bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-xl p-5 shadow-sm transition-all duration-150 ${
        hover ? 'hover:border-slate-700 hover:shadow-md hover:bg-slate-900/95' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4 ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-base font-semibold text-slate-100 ${className}`}>{children}</h3>
);

export default Card;
