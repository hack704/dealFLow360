import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileSpreadsheet,
  PlusCircle,
  CheckSquare,
  Receipt,
  PackageCheck,
  Activity,
  Layers,
  Settings
} from 'lucide-react';

export const Sidebar = () => {
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/quotations/new', label: 'CPQ Builder', icon: PlusCircle, highlight: true },
    { to: '/quotations', label: 'All Quotations', icon: FileSpreadsheet },
    { to: '/approvals', label: 'Approval Queue', icon: CheckSquare },
    { to: '/billing', label: 'Invoices & Billing', icon: Receipt },
    { to: '/fulfillment', label: 'Fulfillment & Stock', icon: PackageCheck },
    { to: '/deal-health', label: 'Deal Risk Analytics', icon: Activity }
  ];

  return (
    <aside className="w-64 border-r border-black/[0.08] dark:border-white/[0.08] bg-white/80 dark:bg-[#161618]/90 backdrop-blur-2xl flex flex-col h-screen sticky top-0 shrink-0 transition-colors">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-black/[0.06] dark:border-white/[0.08] space-x-3">
        <div className="w-8 h-8 rounded-[10px] bg-gradient-to-tr from-[#0071e3] to-[#2997ff] flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
          <Layers className="w-4.5 h-4.5" />
        </div>
        <div>
          <h1 className="text-[15px] font-semibold tracking-tight text-[#1d1d1f] dark:text-white flex items-center gap-1.5 whitespace-nowrap">
            DealFlow<span className="text-[#0071e3] dark:text-[#2997ff]">360</span>
          </h1>
          <span className="text-[13px] text-[#86868b] block tracking-wide uppercase font-mono whitespace-nowrap">
            CPQ & Deal OS
          </span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <div className="text-[13px] font-semibold text-[#86868b] uppercase tracking-wider px-3 mb-2 font-mono whitespace-nowrap">
          Core Workflows
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#0071e3]/10 dark:bg-[#2997ff]/15 text-[#0071e3] dark:text-[#2997ff] border border-[#0071e3]/25 dark:border-[#2997ff]/30 font-semibold shadow-sm'
                    : item.highlight
                    ? 'text-[#0071e3] dark:text-[#2997ff] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] border border-[#0071e3]/20 dark:border-[#2997ff]/20'
                    : 'text-[#6e6e73] dark:text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] border border-transparent'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">{item.label}</span>
              {item.highlight && (
                <span className="ml-auto text-[13px] font-semibold uppercase px-2 py-0.5 rounded-lg bg-[#0071e3]/15 text-[#0071e3] dark:text-[#2997ff] border border-[#0071e3]/30 whitespace-nowrap">
                  CPQ
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-black/[0.06] dark:border-white/[0.08] text-[13px] text-[#86868b] whitespace-nowrap">
        <div className="flex justify-between items-center whitespace-nowrap">
          <span className="whitespace-nowrap">Platform v1.0.0</span>
          <span className="text-[#34c759] font-mono whitespace-nowrap">● Online</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
