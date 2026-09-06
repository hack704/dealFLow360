import React from 'react';
import { Warehouse, MapPin, Clock, DollarSign } from 'lucide-react';

/**
 * WarehouseAllocationTable — Shows split allocation breakdown per warehouse.
 * Props: splits = [{ warehouse, location, qtyFulfilled, estShipments, cost, transitDays, status }]
 */
const WarehouseAllocationTable = ({ splits = [] }) => {
  if (!splits || splits.length === 0) {
    return (
      <p className="text-[13px] text-[#555] text-center py-4">No allocation data available.</p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-white/[0.06] bg-white/[0.02]">
            {['Warehouse', 'Location', 'Qty', 'Shipments', 'Est. Cost', 'Transit', 'Status'].map(h => (
              <th key={h} className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-[#555]">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {splits.map((row, i) => (
            <tr key={i} className={`border-b border-white/[0.04] transition-colors hover:bg-white/[0.02] ${i === splits.length - 1 ? 'border-transparent' : ''}`}>
              <td className="px-3 py-3">
                <div className="flex items-center gap-2">
                  <Warehouse size={13} className="text-[#2997ff] shrink-0" />
                  <span className="font-medium text-[#f5f5f7]">{row.warehouse}</span>
                </div>
              </td>
              <td className="px-3 py-3 text-[#86868b]">
                <div className="flex items-center gap-1">
                  <MapPin size={11} />
                  {row.location}
                </div>
              </td>
              <td className="px-3 py-3 font-semibold text-[#f5f5f7]">{row.qtyFulfilled}</td>
              <td className="px-3 py-3 text-[#86868b]">{row.estShipments}</td>
              <td className="px-3 py-3 text-[#f5f5f7]">
                <div className="flex items-center gap-0.5">
                  <DollarSign size={11} className="text-[#555]" />
                  {row.cost}
                </div>
              </td>
              <td className="px-3 py-3 text-[#86868b]">
                <div className="flex items-center gap-1">
                  <Clock size={11} />
                  {row.transitDays}d
                </div>
              </td>
              <td className="px-3 py-3">
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                  row.status === 'Ready to Dispatch'
                    ? 'border-[#30d158]/30 bg-[#30d158]/10 text-[#30d158]'
                    : 'border-[#2997ff]/30 bg-[#2997ff]/10 text-[#2997ff]'
                }`}>
                  {row.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WarehouseAllocationTable;
