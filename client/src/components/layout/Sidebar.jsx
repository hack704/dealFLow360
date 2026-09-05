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
    <aside className="w-64 border-r border-slate-800 bg-slate-950 flex flex-col h-screen sticky top-0 shrink-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 space-x-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-950">
          <Layers className="w-4 h-4" />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
            DealFlow<span className="text-indigo-400">360</span>
          </h1>
          <span className="text-[10px] text-slate-400 block tracking-wide uppercase font-mono">
            CPQ & Deal OS
          </span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2 font-mono">
          Core Workflows
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30'
                    : item.highlight
                    ? 'text-indigo-400 hover:text-indigo-300 hover:bg-slate-900 border border-indigo-900/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
              {item.highlight && (
                <span className="ml-auto text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  CPQ
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400">
        <div className="flex justify-between items-center">
          <span>Platform v1.0.0</span>
          <span className="text-emerald-400 font-mono">● Online</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
