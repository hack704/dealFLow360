import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 text-center flex items-center justify-center">
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        <div
          className={`inline-block w-full ${maxWidth} p-6 sm:p-7 my-8 text-left align-middle transition-all transform bg-white/95 dark:bg-[#161618]/95 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.12] shadow-2xl rounded-2xl sm:rounded-[22px] relative z-10`}
        >
          <div className="flex items-center justify-between pb-4 border-b border-black/[0.08] dark:border-white/[0.08] mb-5">
            <h3 className="text-[17px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">{title}</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-black/[0.04] dark:bg-white/[0.06] text-[#6e6e73] dark:text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white hover:bg-black/[0.08] dark:hover:bg-white/[0.12] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
