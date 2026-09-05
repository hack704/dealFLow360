import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card, { CardHeader, CardTitle } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { Warehouse, Package, ArrowRight, Truck } from 'lucide-react';

export const FulfillmentPage = () => {
  const navigate = useNavigate();

  // Screen 7 exact tables from wireframe
  const stockInventory = [
    { warehouse: 'Main Warehouse', product: 'Laptop Pro 14', inStock: 40, reserved: 18, available: 22 },
    { warehouse: 'East Depot', product: 'Laptop Pro 14', inStock: 10, reserved: 6, available: 4 },
    { warehouse: 'Main Warehouse', product: 'Docking Station', inStock: 65, reserved: 12, available: 53 }
  ];

  const pendingOrders = [
    { order: 'Q-1042', customer: 'Acme Corp', status: 'Split Pending', warehouses: 'Main + East Depot' },
    { order: 'Q-1030', customer: 'Zenith Co', status: 'Backorder', warehouses: 'East Depot' }
  ];

  return (
    <div className="space-y-8">
      {/* Screen 7 Header (from Wireframe) */}
      <div className="pb-5 border-b border-black/[0.08] dark:border-white/[0.08]">
        <h1 className="text-[26px] sm:text-[28px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-[-0.025em]">Fulfillment & Stock</h1>
        <p className="text-[13px] sm:text-[14px] text-[#6e6e73] dark:text-[#86868b] mt-1">
          Multi-warehouse allocation, inventory split routing, and backorder tracking
        </p>
      </div>

      {/* Table 1: Warehouse Stock */}
      <Card className="p-0 overflow-hidden rounded-[22px] bg-white/80 dark:bg-[#161618]/80 border border-black/[0.08] dark:border-white/[0.08] shadow-sm dark:shadow-apple-card backdrop-blur-xl">
        <div className="p-5 sm:p-6 pb-4 border-b border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-black/[0.04] dark:bg-white/[0.06] text-[#0071e3] dark:text-[#2997ff]">
              <Warehouse className="w-4 h-4" />
            </div>
            <span className="whitespace-nowrap">Warehouse Stock Levels</span>
          </CardTitle>
          <span className="text-[13px] text-[#6e6e73] dark:text-[#86868b] font-mono px-3.5 py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.06] whitespace-nowrap">Live Inventory Matrix</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] text-[#6e6e73] dark:text-apple-muted">
            <thead className="bg-black/[0.02] dark:bg-white/[0.03] text-[#6e6e73] dark:text-[#86868b] uppercase tracking-wider font-mono text-[13px] font-semibold border-b border-black/[0.08] dark:border-white/[0.08]">
              <tr>
                <th className="py-3.5 px-5 whitespace-nowrap">Warehouse</th>
                <th className="py-3.5 px-5 whitespace-nowrap">Product</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">In Stock</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">Reserved</th>
                <th className="py-3.5 px-5 text-right whitespace-nowrap">Available</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06]">
              {stockInventory.map((item, idx) => (
                <tr key={idx} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-5 font-semibold text-[#1d1d1f] dark:text-white whitespace-nowrap">{item.warehouse}</td>
                  <td className="py-4 px-5 text-[#1d1d1f] dark:text-[#f5f5f7] whitespace-nowrap">{item.product}</td>
                  <td className="py-4 px-4 text-right font-mono text-[#6e6e73] dark:text-[#86868b] whitespace-nowrap">{item.inStock}</td>
                  <td className="py-4 px-4 text-right font-mono text-[#b25e00] dark:text-[#ff9f0a] whitespace-nowrap">{item.reserved}</td>
                  <td className="py-4 px-5 text-right font-mono font-semibold text-[#1b7a36] dark:text-[#30d158] whitespace-nowrap">{item.available}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Table 2: Orders Awaiting Fulfillment */}
      <Card className="p-0 overflow-hidden rounded-[22px] bg-white/80 dark:bg-[#161618]/80 border border-black/[0.08] dark:border-white/[0.08] shadow-sm dark:shadow-apple-card backdrop-blur-xl">
        <div className="p-5 sm:p-6 pb-4 border-b border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-black/[0.04] dark:bg-white/[0.06] text-[#ff9f0a]">
              <Truck className="w-4 h-4" />
            </div>
            <span className="whitespace-nowrap">Orders Awaiting Fulfillment</span>
          </CardTitle>
          <span className="text-[13px] text-[#6e6e73] dark:text-[#86868b] font-mono px-3.5 py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.06] whitespace-nowrap">Pending Logistics Allocation</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] text-[#6e6e73] dark:text-apple-muted">
            <thead className="bg-black/[0.02] dark:bg-white/[0.03] text-[#6e6e73] dark:text-[#86868b] uppercase tracking-wider font-mono text-[13px] font-semibold border-b border-black/[0.08] dark:border-white/[0.08]">
              <tr>
                <th className="py-3.5 px-5 whitespace-nowrap">Order</th>
                <th className="py-3.5 px-5 whitespace-nowrap">Customer</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                <th className="py-3.5 px-5 whitespace-nowrap">Warehouses</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06]">
              {pendingOrders.map((ord) => (
                <tr
                  key={ord.order}
                  onClick={() => navigate(`/fulfillment/${ord.order}`)}
                  className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03] cursor-pointer transition-colors"
                >
                  <td className="py-4 px-5 font-mono font-semibold text-[#1d1d1f] dark:text-white whitespace-nowrap">{ord.order}</td>
                  <td className="py-4 px-5 font-medium text-[#1d1d1f] dark:text-white whitespace-nowrap">{ord.customer}</td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <Badge variant={ord.status.includes('Backorder') ? 'danger' : 'warning'} size="xs">
                      {ord.status}
                    </Badge>
                  </td>
                  <td className="py-4 px-5 font-mono text-[#6e6e73] dark:text-[#86868b] whitespace-nowrap">{ord.warehouses}</td>
                  <td className="py-4 px-4 text-center whitespace-nowrap">
                    <ArrowRight className="w-4 h-4 text-[#86868b] dark:text-apple-muted" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Wireframe Exact Callout */}
        <div className="p-4 sm:p-5 bg-black/[0.02] dark:bg-white/[0.03] border-t border-black/[0.08] dark:border-white/[0.08] text-[13px] text-[#6e6e73] dark:text-[#86868b]">
          Click an order row to open its warehouse split detail.
        </div>
      </Card>
    </div>
  );
};

export default FulfillmentPage;
