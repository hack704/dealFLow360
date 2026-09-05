import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Award,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Users,
  ChevronDown
} from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

export const AdminReportingPage = () => {
  const [period, setPeriod] = useState('Last 30 Days');
  const [salesTeam, setSalesTeam] = useState('All Teams');
  const [approvalStatus, setApprovalStatus] = useState('All Statuses');
  const [productFilter, setProductFilter] = useState('All Products');

  const [exportNotice, setExportNotice] = useState(null);

  const handleExport = (type) => {
    setExportNotice(`Generating ${type} report for ${period}... Download ready.`);
    setTimeout(() => setExportNotice(null), 4000);
  };

  const repPerformance = [
    { rep: 'J. Rao', quotes: 42, avgDiscount: '9.4%', margin: '82.1%', escalations: 3, time: '3.8 hrs' },
    { rep: 'M. Chen', quotes: 38, avgDiscount: '13.8%', margin: '74.2%', escalations: 6, time: '7.2 hrs' },
    { rep: 'S. Patel', quotes: 35, avgDiscount: '8.1%', margin: '85.4%', escalations: 2, time: '2.9 hrs' },
    { rep: 'E. Becker', quotes: 33, avgDiscount: '10.5%', margin: '79.0%', escalations: 4, time: '5.1 hrs' }
  ];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/[0.08] dark:border-white/[0.08] pb-5">
        <div>
          <h1 className="text-[26px] sm:text-[28px] font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
            Admin / Reporting Dashboard (Optional)
          </h1>
          <p className="text-[13px] text-[#86868b] mt-1">
            Sales trends, approval bottlenecks and platform usage
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center space-x-3">
          <Button
            variant="secondary"
            size="md"
            onClick={() => handleExport('PDF')}
          >
            <FileText className="w-4 h-4 mr-2 text-[#ff453a]" />
            Export PDF
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={() => handleExport('XLS')}
          >
            <FileSpreadsheet className="w-4 h-4 mr-2 text-[#30d158]" />
            Export XLS
          </Button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-4 rounded-2xl bg-[#30d158]/10 border border-[#30d158]/30 text-[13px] text-[#1b7e36] dark:text-[#30d158] flex items-center space-x-2">
          <span>{exportNotice}</span>
        </div>
      )}

      {/* 4 Top Dropdown Filters */}
      <div className="bg-white/80 dark:bg-[#161618]/90 border border-black/[0.08] dark:border-white/[0.08] rounded-[22px] p-6 backdrop-blur-xl shadow-sm dark:shadow-apple-card">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          <div>
            <label className="block text-[13px] font-mono uppercase text-[#86868b] mb-1.5 whitespace-nowrap">
              Period
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#1c1c1e] border border-black/[0.12] dark:border-white/[0.12] text-[13px] text-[#1d1d1f] dark:text-white focus:outline-none focus:border-[#0071e3] dark:focus:border-[#2997ff]"
            >
              <option value="Last 7 Days" className="bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-white">Last 7 Days</option>
              <option value="Last 30 Days" className="bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-white">Last 30 Days</option>
              <option value="This Quarter" className="bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-white">This Quarter (Q3)</option>
              <option value="Year to Date" className="bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-white">Year to Date</option>
            </select>
          </div>

          <div>
            <label className="block text-[13px] font-mono uppercase text-[#86868b] mb-1.5 whitespace-nowrap">
              Sales Team
            </label>
            <select
              value={salesTeam}
              onChange={(e) => setSalesTeam(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#1c1c1e] border border-black/[0.12] dark:border-white/[0.12] text-[13px] text-[#1d1d1f] dark:text-white focus:outline-none focus:border-[#0071e3] dark:focus:border-[#2997ff]"
            >
              <option value="All Teams" className="bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-white">All Teams</option>
              <option value="Enterprise East" className="bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-white">Enterprise East</option>
              <option value="Enterprise West" className="bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-white">Enterprise West</option>
              <option value="SMB Global" className="bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-white">SMB Global</option>
            </select>
          </div>

          <div>
            <label className="block text-[13px] font-mono uppercase text-[#86868b] mb-1.5 whitespace-nowrap">
              Approval Status
            </label>
            <select
              value={approvalStatus}
              onChange={(e) => setApprovalStatus(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#1c1c1e] border border-black/[0.12] dark:border-white/[0.12] text-[13px] text-[#1d1d1f] dark:text-white focus:outline-none focus:border-[#0071e3] dark:focus:border-[#2997ff]"
            >
              <option value="All Statuses" className="bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-white">All Statuses</option>
              <option value="Auto-Approved" className="bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-white">Auto-Approved</option>
              <option value="Manager Approved" className="bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-white">Manager Approved</option>
              <option value="Returned for Revision" className="bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-white">Returned for Revision</option>
            </select>
          </div>

          <div>
            <label className="block text-[13px] font-mono uppercase text-[#86868b] mb-1.5 whitespace-nowrap">
              Product
            </label>
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#1c1c1e] border border-black/[0.12] dark:border-white/[0.12] text-[13px] text-[#1d1d1f] dark:text-white focus:outline-none focus:border-[#0071e3] dark:focus:border-[#2997ff]"
            >
              <option value="All Products" className="bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-white">All Products</option>
              <option value="Laptop Pro 14" className="bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-white">Laptop Pro 14</option>
              <option value="Docking Station" className="bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-white">Docking Station</option>
              <option value="Care Plan 2yr" className="bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-white">Care Plan 2yr</option>
              <option value="Onsite Setup" className="bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-white">Onsite Setup</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white/80 dark:bg-[#161618]/90 border border-black/[0.08] dark:border-white/[0.08] rounded-[22px] p-6 sm:p-7 backdrop-blur-xl shadow-sm dark:shadow-apple-card">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-mono uppercase text-[#86868b] whitespace-nowrap">Generation Velocity</span>
            <div className="w-9 h-9 rounded-xl bg-[#0071e3]/10 dark:bg-[#2997ff]/10 flex items-center justify-center text-[#0071e3] dark:text-[#2997ff]">
              <TrendingUp className="w-4.5 h-4.5" />
            </div>
          </div>
          <h3 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mt-3">Quotes Created</h3>
          <div className="text-[28px] font-bold font-mono text-[#1d1d1f] dark:text-white mt-1">148 this month</div>
          <p className="text-[13px] text-[#1b7e36] dark:text-[#30d158] mt-2 flex items-center gap-1">
            <span className="font-semibold">+18.4%</span>
            <span className="text-[#86868b]">vs previous 30-day baseline</span>
          </p>
        </div>

        <div className="bg-white/80 dark:bg-[#161618]/90 border border-black/[0.08] dark:border-white/[0.08] rounded-[22px] p-6 sm:p-7 backdrop-blur-xl shadow-sm dark:shadow-apple-card">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-mono uppercase text-[#86868b] whitespace-nowrap">Governance Speed</span>
            <div className="w-9 h-9 rounded-xl bg-[#30d158]/10 flex items-center justify-center text-[#1b7e36] dark:text-[#30d158]">
              <Clock className="w-4.5 h-4.5" />
            </div>
          </div>
          <h3 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mt-3">Avg Approval Time</h3>
          <div className="text-[28px] font-bold font-mono text-[#1b7e36] dark:text-[#30d158] mt-1">6.4 hours</div>
          <p className="text-[13px] text-[#86868b] mt-2 leading-relaxed">
            Target SLA: &lt; 8.0 hours. Median turnaround: 4.1 hours.
          </p>
        </div>

        <div className="bg-white/80 dark:bg-[#161618]/90 border border-black/[0.08] dark:border-white/[0.08] rounded-[22px] p-6 sm:p-7 backdrop-blur-xl shadow-sm dark:shadow-apple-card">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-mono uppercase text-[#86868b] whitespace-nowrap">Cross-Sell Leader</span>
            <div className="w-9 h-9 rounded-xl bg-[#bf5af2]/10 flex items-center justify-center text-[#79349e] dark:text-[#bf5af2]">
              <Award className="w-4.5 h-4.5" />
            </div>
          </div>
          <h3 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mt-3">Top Upsold Product</h3>
          <div className="text-[28px] font-bold font-mono text-[#79349e] dark:text-[#bf5af2] mt-1">Care Plan 2yr</div>
          <p className="text-[13px] text-[#86868b] mt-2 leading-relaxed">
            Attached to 68.4% of eligible hardware quotations.
          </p>
        </div>
      </div>

      {/* Sales Rep Governance & Adherence Table */}
      <div className="bg-white/80 dark:bg-[#161618]/90 border border-black/[0.08] dark:border-white/[0.08] rounded-[22px] overflow-hidden backdrop-blur-xl shadow-sm dark:shadow-apple-card">
        <div className="px-6 py-4 border-b border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#0071e3]/10 dark:bg-[#2997ff]/15 flex items-center justify-center text-[#0071e3] dark:text-[#2997ff]">
              <Users className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Representative Deal Governance & Approval Latency</h3>
          </div>
          <span className="text-[13px] text-[#86868b] font-mono whitespace-nowrap">Team: {salesTeam}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7]">
            <thead className="bg-black/[0.02] dark:bg-white/[0.03] text-[#6e6e73] dark:text-[#86868b] uppercase tracking-wider font-mono text-[13px] font-semibold border-b border-black/[0.08] dark:border-white/[0.08]">
              <tr>
                <th className="py-3.5 px-5 whitespace-nowrap">Sales Representative</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Quotes Authored</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Avg Discount Given</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Gross Margin Score</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Approval Escalations</th>
                <th className="py-3.5 px-5 text-right whitespace-nowrap">Avg Turnaround</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.06] dark:divide-white/[0.06]">
              {repPerformance.map((rep) => (
                <tr key={rep.rep} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-5 font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] whitespace-nowrap">{rep.rep}</td>
                  <td className="py-4 px-4 font-mono text-[#1d1d1f] dark:text-[#f5f5f7] whitespace-nowrap">{rep.quotes}</td>
                  <td className="py-4 px-4 font-mono text-[#9e5200] dark:text-[#ff9f0a] whitespace-nowrap">{rep.avgDiscount}</td>
                  <td className="py-4 px-4 font-mono text-[#1b7e36] dark:text-[#30d158] whitespace-nowrap">{rep.margin}</td>
                  <td className="py-4 px-4 font-mono text-[#86868b] whitespace-nowrap">{rep.escalations} deals</td>
                  <td className="py-4 px-5 text-right font-mono text-[#1d1d1f] dark:text-[#f5f5f7] whitespace-nowrap">{rep.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminReportingPage;
