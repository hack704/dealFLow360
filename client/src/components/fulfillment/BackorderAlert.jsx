import React from 'react';
import { AlertTriangle, Package } from 'lucide-react';

/**
 * BackorderAlert — Banner shown when warehouse stock is insufficient.
 * Props: items = [{ productName, shortfall, warehouse }], onDismiss
 */
const BackorderAlert = ({ items = [], onDismiss }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-[#ff9f0a]/30 bg-[#ff9f0a]/10 p-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#ff9f0a]/20">
        <AlertTriangle size={16} className="text-[#ff9f0a]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[#ff9f0a] mb-1">
          Backorder Alert — {items.length} item{items.length > 1 ? 's' : ''} below stock threshold
        </p>
        <ul className="flex flex-col gap-1">
          {items.map((it, i) => (
            <li key={i} className="flex items-center gap-2 text-[12px] text-[#f5f5f7]">
              <Package size={11} className="text-[#ff9f0a] shrink-0" />
              <span className="font-medium">{it.productName}</span>
              <span className="text-[#86868b]">— shortfall: {it.shortfall} units</span>
              {it.warehouse && <span className="text-[#555]">({it.warehouse})</span>}
            </li>
          ))}
        </ul>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-[#555] hover:text-[#86868b] transition-colors text-[18px] leading-none"
          aria-label="Dismiss backorder alert"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default BackorderAlert;
