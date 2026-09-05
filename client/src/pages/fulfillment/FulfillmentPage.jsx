import React from 'react';
import Card, { CardHeader, CardTitle } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { PackageCheck, Warehouse, CheckCircle2 } from 'lucide-react';

export const FulfillmentPage = () => {
  const stockItems = [
    { sku: 'DF-CORE-001', name: 'DealFlow360 Enterprise Core', type: 'Digital License', available: 'Unlimited', allocated: 24, status: 'Active' },
    { sku: 'DF-AI-RISK', name: 'AI Deal Health Module', type: 'Cloud Addon', available: 'Unlimited', allocated: 18, status: 'Active' },
    { sku: 'DF-CPQ-PRO', name: 'Dynamic CPQ Engine', type: 'Digital License', available: 'Unlimited', allocated: 12, status: 'Active' },
    { sku: 'DF-SUP-VIP', name: '24/7 Dedicated Support', type: 'Service Capacity', available: '45 Seats', allocated: 15, status: 'Available' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Fulfillment & Inventory Allocation</h2>
        <p className="text-xs text-slate-400 mt-1">
          Automated license provisioning, warehouse stock commitments, and delivery scheduling.
        </p>
      </div>

      <Card className="border-slate-800 bg-slate-900/60">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Warehouse className="w-4 h-4 text-indigo-400" />
            <CardTitle>Provisioning & Allocation Status</CardTitle>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-3">Product Name</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Available Capacity</th>
                <th className="py-3 px-3 text-center">Allocated</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {stockItems.map((item) => (
                <tr key={item.sku} className="hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-mono text-slate-400">{item.sku}</td>
                  <td className="py-3 px-3 font-medium text-slate-100">{item.name}</td>
                  <td className="py-3 px-3 text-slate-400">{item.type}</td>
                  <td className="py-3 px-3 font-mono text-emerald-400">{item.available}</td>
                  <td className="py-3 px-3 text-center font-mono text-slate-200">{item.allocated}</td>
                  <td className="py-3 px-4 text-right">
                    <Badge variant="success" size="xs">
                      {item.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default FulfillmentPage;
