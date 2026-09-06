import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Layers,
  LogOut,
  User as UserIcon,
  ExternalLink,
  ShieldCheck,
  Sun,
  Moon,
  LayoutDashboard,
  FileText,
  LayoutGrid,
  CheckCircle2,
  Truck,
  Repeat,
  Receipt,
  Activity,
  BarChart3,
  Package,
  MessageSquare
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const isPortal = location.pathname.startsWith('/portal');

  const portalTabs = [
    { to: '/portal', label: 'My Quotation', icon: FileText },
    { to: '/portal/messages', label: 'Messages', icon: MessageSquare },
    { to: '/portal/profile', label: 'Profile', icon: UserIcon }
  ];

  const userRole = user?.role || 'admin';

  // Role-specific navigation tabs strictly matching the official specification:
  // - Sales Rep: Builds quotes, applies discounts, upsell items, tracks deals
  // - Sales Manager: Reviews & approves/rejects quotes, configures discount tiers, monitors deal health
  // - Finance / Operations: Second level approvals, warehouse splits, reconciles recurring billing & invoices
  // - Customer: Portal user (view quotes, counter discounts, confirm)
  // - Admin: Manages backend setup, products, discount tiers, warehouses, platform analytics
  const getTabsForRole = (role) => {
    switch (role) {
      case 'sales_rep':
        return [
          { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/quotations', label: 'Quotations', icon: FileText },
          { to: '/pipeline', label: 'Pipeline', icon: LayoutGrid },
          { to: '/products', label: 'Products', icon: Package }
        ];
      case 'sales_manager':
        return [
          { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/approvals', label: 'Approvals', icon: CheckCircle2 },
          { to: '/deal-health', label: 'Deal Health', icon: Activity },
          { to: '/discount-tiers', label: 'Discount Tiers', icon: Layers },
          { to: '/quotations', label: 'Quotations', icon: FileText },
          { to: '/pipeline', label: 'Pipeline', icon: LayoutGrid }
        ];
      case 'finance':
        return [
          { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/approvals', label: 'Approvals', icon: CheckCircle2 },
          { to: '/fulfillment', label: 'Fulfillment', icon: Truck },
          { to: '/subscriptions', label: 'Subscriptions', icon: Repeat },
          { to: '/invoices', label: 'Invoices', icon: Receipt }
        ];
      case 'customer':
        return portalTabs;
      case 'admin':
      default:
        return [
          { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/quotations', label: 'Quotations', icon: FileText },
          { to: '/pipeline', label: 'Pipeline', icon: LayoutGrid },
          { to: '/approvals', label: 'Approvals', icon: CheckCircle2 },
          { to: '/fulfillment', label: 'Fulfillment', icon: Truck },
          { to: '/subscriptions', label: 'Subscriptions', icon: Repeat },
          { to: '/invoices', label: 'Invoices', icon: Receipt },
          { to: '/deal-health', label: 'Deal Health', icon: Activity },
          { to: '/reports', label: 'Reports', icon: BarChart3 },
          { to: '/products', label: 'Products', icon: Package },
          { to: '/discount-tiers', label: 'Discount Tiers', icon: Layers }
        ];
    }
  };

  const currentTabs = isPortal ? portalTabs : getTabsForRole(userRole);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-black/80 backdrop-blur-2xl border-b border-black/[0.06] dark:border-white/[0.08] transition-colors duration-200">
      <div className="w-full max-w-[1720px] mx-auto px-3 sm:px-5 h-14 flex items-center justify-between gap-2.5">
        {/* Logo */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => navigate(isPortal ? '/portal' : '/dashboard')}
            className="flex items-center space-x-2 text-left group"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#0071e3] to-[#2997ff] flex items-center justify-center text-white shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
            <span className="text-[14px] font-semibold tracking-[-0.015em] text-[#1d1d1f] dark:text-white group-hover:text-[#0071e3] dark:group-hover:text-[#2997ff] transition-colors">
              DealFlow360
            </span>
          </button>
        </div>

        {/* Central Segmented Tab Bar - Compact & Spacious */}
        <nav className="flex-1 min-w-0 flex items-center justify-center space-x-0.5 overflow-x-auto no-scrollbar py-0.5 px-1">
          {currentTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive =
              location.pathname === tab.to ||
              (tab.to !== '/dashboard' &&
                tab.to !== '/portal' &&
                location.pathname.startsWith(tab.to)) ||
              (tab.to === '/subscriptions' && location.pathname.startsWith('/billing'));

            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                title={tab.label}
                aria-label={tab.label}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11.5px] sm:text-[12px] transition-all duration-150 whitespace-nowrap select-none border ${
                  isActive
                    ? 'bg-[#0071e3]/10 dark:bg-[#2997ff]/15 text-[#0071e3] dark:text-[#2997ff] border-[#0071e3]/25 dark:border-[#2997ff]/30 font-semibold shadow-xs'
                    : 'bg-transparent text-[#6e6e73] dark:text-[#86868b] border-transparent hover:text-[#1d1d1f] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] font-medium'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                    isActive
                      ? 'text-[#0071e3] dark:text-[#2997ff] scale-105'
                      : 'text-[#86868b] dark:text-[#6e6e73]'
                  }`}
                />
                <span>{tab.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Right Actions: Compact tool tray with tooltips */}
        <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
          {/* Action 1: Reload Data */}
          {!isPortal && (
            <button
              type="button"
              id="btn-reload-data"
              onClick={async () => {
                const reloadBtn = document.getElementById('btn-reload-data');
                if (reloadBtn) reloadBtn.classList.add('animate-pulse');
                try {
                  window.dispatchEvent(new CustomEvent('dealflow:reload-data'));
                  const banner = document.createElement('div');
                  banner.className = 'fixed top-16 right-6 z-50 bg-[#34c759] text-white px-3.5 py-2 rounded-xl text-[12px] font-medium shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200';
                  banner.innerHTML = '<span>✓ Refreshed pricing, stock, and approvals</span>';
                  document.body.appendChild(banner);
                  setTimeout(() => banner.remove(), 2500);
                } finally {
                  setTimeout(() => reloadBtn?.classList.remove('animate-pulse'), 500);
                }
              }}
              title="Reload Data: Refreshes pricing, stock, and approval data from the backend"
              className="h-7.5 px-2 rounded-lg text-[11.5px] font-medium bg-black/[0.03] hover:bg-black/[0.07] dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-[#1d1d1f] dark:text-[#f5f5f7] border border-black/[0.06] dark:border-white/[0.08] transition-colors flex items-center gap-1 shadow-xs"
            >
              <Activity className="w-3.5 h-3.5 text-[#0071e3] dark:text-[#2997ff]" />
              <span className="hidden 2xl:inline">Reload</span>
            </button>
          )}

          {/* Action 2: Go to Back-end */}
          {!isPortal && (userRole === 'admin' || userRole === 'sales_manager' || userRole === 'sales_rep') && (
            <button
              type="button"
              id="btn-goto-backend"
              onClick={() => navigate('/backend-config')}
              title="Go to Back-end: Opens the configuration and settings screen"
              className="h-7.5 px-2 rounded-lg text-[11.5px] font-medium bg-black/[0.03] hover:bg-black/[0.07] dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-[#1d1d1f] dark:text-[#f5f5f7] border border-black/[0.06] dark:border-white/[0.08] transition-colors flex items-center gap-1 shadow-xs"
            >
              <Package className="w-3.5 h-3.5 text-[#bf5af2]" />
              <span className="hidden 2xl:inline">Backend</span>
            </button>
          )}

          {/* Dark / Light Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="w-7.5 h-7.5 rounded-lg flex items-center justify-center bg-black/[0.03] hover:bg-black/[0.07] dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-[#6e6e73] dark:text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white border border-black/[0.06] dark:border-white/[0.08] transition-all duration-200 shadow-xs"
          >
            {isDark ? (
              <Sun className="w-3.5 h-3.5 text-[#ff9f0a] shrink-0" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-[#0071e3] shrink-0" />
            )}
          </button>

          {isPortal ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="h-7.5 px-2.5 rounded-lg text-[11.5px] font-medium bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-[#1d1d1f] dark:text-white border border-black/[0.08] dark:border-white/[0.1] transition-colors whitespace-nowrap"
            >
              Back to Internal
            </button>
          ) : (
            <button
              onClick={() => navigate('/portal')}
              title="Open Customer Negotiation Portal"
              className="h-7.5 px-2 rounded-lg text-[11.5px] font-medium bg-[#0071e3]/10 dark:bg-[#0071e3]/15 hover:bg-[#0071e3]/20 dark:hover:bg-[#0071e3]/25 text-[#0071e3] dark:text-[#2997ff] border border-[#0071e3]/20 dark:border-[#0071e3]/30 transition-colors flex items-center gap-1 shadow-xs whitespace-nowrap"
            >
              <span>Portal</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </button>
          )}

          {/* Action 3: Close Workspace (Logout) */}
          {user && (
            <button
              type="button"
              id="btn-close-workspace"
              onClick={logout}
              title="Close Workspace: Ends current working session view"
              className="h-7.5 px-2 rounded-lg text-[11.5px] font-medium bg-[#ff453a]/10 hover:bg-[#ff453a]/20 text-[#c9342c] dark:text-[#ff453a] border border-[#ff453a]/20 transition-colors flex items-center gap-1 shadow-xs whitespace-nowrap"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden 2xl:inline">Exit</span>
            </button>
          )}

          {user && (
            <div className="hidden xl:flex items-center pl-1.5 border-l border-black/[0.08] dark:border-white/[0.08]">
              <span
                title={`Logged in as ${user.name} (${user.role})`}
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                  user.role === 'sales_rep'
                    ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                    : user.role === 'sales_manager'
                    ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30'
                    : user.role === 'finance'
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : user.role === 'customer'
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                    : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                }`}
              >
                {user.role?.replace('_', ' ')}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
