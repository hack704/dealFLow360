import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Pagination — page number controls.
 * Props: currentPage, totalPages, onPageChange(page)
 */
const Pagination = ({ currentPage = 1, totalPages = 1, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  // Clamp visible range around current
  const visiblePages = pages.filter(
    p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1
  );

  const renderPage = (p, i, arr) => {
    const prev = arr[i - 1];
    const showEllipsis = prev && p - prev > 1;

    return (
      <React.Fragment key={p}>
        {showEllipsis && (
          <span className="px-2 text-[#555] text-[13px]">…</span>
        )}
        <button
          onClick={() => onPageChange?.(p)}
          className={`flex h-8 w-8 items-center justify-center rounded-lg text-[13px] font-semibold transition-all ${
            p === currentPage
              ? 'bg-[#2997ff] text-white'
              : 'text-[#86868b] hover:bg-white/[0.06] hover:text-[#f5f5f7]'
          }`}
        >
          {p}
        </button>
      </React.Fragment>
    );
  };

  return (
    <div className="flex items-center justify-center gap-1 py-2">
      <button
        onClick={() => onPageChange?.(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#86868b] transition-all hover:bg-white/[0.06] hover:text-[#f5f5f7] disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronLeft size={15} />
      </button>

      {visiblePages.map(renderPage)}

      <button
        onClick={() => onPageChange?.(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#86868b] transition-all hover:bg-white/[0.06] hover:text-[#f5f5f7] disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronRight size={15} />
      </button>
    </div>
  );
};

export default Pagination;
