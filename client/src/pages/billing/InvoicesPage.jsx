import React from 'react';
import Card, { CardHeader, CardTitle } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { Receipt, Calendar, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const InvoicesPage = () => {
  const sampleInvoices = [
    {
      id: 'INV-2026-001',
      customer: 'Acme Global Enterprises',
      amount: 103500,
      dueDate: '2026-10-15',
      status: 'Paid',
      terms: 'Net 45'
    },
    {
      id: 'INV-2026-002',
      customer: 'Stark Dynamics',
      amount: 48000,
      dueDate: '2026-10-01',
      status: 'Issued',
      terms: 'Net 30'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Billing & Prorated Invoicing</h2>
        <p className="text-xs text-slate-400 mt-1">
          Automated subscription billing schedules, mid-cycle prorations, and collections tracking.
        </p>
      </div>

      <Card className="border-slate-800 bg-slate-900/60">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Receipt className="w-4 h-4 text-indigo-400" />
            <CardTitle>Invoices</CardTitle>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-3">Customer Account</th>
                <th className="py-3 px-3">Due Date</th>
                <th className="py-3 px-3">Terms</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sampleInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-mono font-medium text-slate-100">{inv.id}</td>
                  <td className="py-3 px-3">{inv.customer}</td>
                  <td className="py-3 px-3 font-mono text-slate-400">{inv.dueDate}</td>
                  <td className="py-3 px-3 text-slate-400">{inv.terms}</td>
                  <td className="py-3 px-3">
                    <Badge variant={inv.status === 'Paid' ? 'success' : 'primary'} size="xs">
                      {inv.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-white">
                    {formatCurrency(inv.amount)}
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

export default InvoicesPage;
