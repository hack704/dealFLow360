import React from 'react';
import { ChevronUp, ChevronDown, Search } from 'lucide-react';

/**
 * DataTable — Generic sortable table component.
 * Props:
 *   columns = [{ key, label, render?, sortable? }]
 *   data = [{}]
 *   onRowClick (fn)
 *   emptyMessage (str)
 *   loading (bool)
 */
const DataTable = ({
  columns = [],
  data = [],
  onRowClick,
  emptyMessage = 'No data available',
  loading = false,
  sortKey,
  sortDir = 'asc',
  onSort
}) => {
  const handleHeaderClick = (col) => {
    if (!col.sortable || !onSort) return;
    const dir = sortKey === col.key && sortDir === 'asc' ? 'desc' : 'asc';
    onSort(col.key, dir);
  };

  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#2997ff] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-white/[0.06] bg-white/[0.02]">
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => handleHeaderClick(col)}
                className={`px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#555] select-none ${col.sortable ? 'cursor-pointer hover:text-[#86868b]' : ''}`}
              >
                <div className="flex items-center gap-1">
                  {col.label}
                  {col.sortable && sortKey === col.key && (
                    sortDir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-[#555]">
                <div className="flex flex-col items-center gap-2">
                  <Search size={20} className="text-[#333]" />
                  {emptyMessage}
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={row._id || row.id || i}
                onClick={() => onRowClick?.(row)}
                className={`border-b border-white/[0.04] transition-colors last:border-transparent ${onRowClick ? 'cursor-pointer hover:bg-white/[0.03]' : ''}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-[#f5f5f7]">
                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
