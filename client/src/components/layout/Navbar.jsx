import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useAutoMode } from '../../context/AutoModeContext';
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
  const { isAutoMode, toggleAutoMode } = useAutoMode();
  const location = useLocation();
  const navigate = useNavigate();

  const isPortal = location.pathname.startsWith('/portal');

  const mainTabs = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/quotations', label: 'Quotations', icon: FileText },
    { to: '/approvals', label: 'Approvals', icon: CheckCircle2 },
    { to: '/fulfillment', label: 'Fulfillment', icon: Truck },
    { to: '/subscriptions', label: 'Subscriptions', icon: Repeat },
    { to: '/invoices', label: 'Invoices', icon: Receipt },
    { to: '/deal-health', label: 'Deal Health', icon: Activity },
    { to: '/reports', label: 'Reports', icon: BarChart3 },
    { to: '/products', label: 'Products', icon: Package }
  ];

  const portalTabs = [
    { to: '/portal', label: 'My Quotation', icon: FileText },
    { to: '/portal/messages', label: 'Messages', icon: MessageSquare },
    { to: '/portal/profile', label: 'Profile', icon: UserIcon }
  ];

  const currentTabs = isPortal ? portalTabs : mainTabs;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-black/80 backdrop-blur-2xl border-b border-black/[0.06] dark:border-white/[0.08] transition-colors duration-200">
      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Logo */}
        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => navigate(isPortal ? '/portal' : '/dashboard')}
            className="flex items-center space-x-2.5 text-left group"
          >
            <div className="w-8 h-8 rounded-[10px] bg-gradient-to-tr from-[#0071e3] to-[#2997ff] flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
              <Layers className="w-4.5 h-4.5" />
            </div>
            <span className="text-[15px] font-semibold tracking-[-0.015em] text-[#1d1d1f] dark:text-white group-hover:text-[#0071e3] dark:group-hover:text-[#2997ff] transition-colors">
              DealFlow360
            </span>
          </button>
        </div>

        {/* Apple Transparent Gesture Segmented Tab Bar */}
        <nav className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-1">
          {currentTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive =
              location.pathname === tab.to ||
              (tab.to !== '/dashboard' &&
                tab.to !== '/portal' &&
                location.pathname.startsWith(tab.to));

            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                title={tab.label}
                aria-label={tab.label}
                className={`flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3 xl:px-3.5 py-1.5 rounded-xl text-[12.5px] sm:text-[13px] transition-all duration-150 whitespace-nowrap select-none border ${
                  isActive
                    ? 'bg-[#0071e3]/10 dark:bg-[#2997ff]/15 text-[#0071e3] dark:text-[#2997ff] border-[#0071e3]/25 dark:border-[#2997ff]/30 font-semibold shadow-sm'
                    : 'bg-transparent text-[#6e6e73] dark:text-[#86868b] border-transparent hover:text-[#1d1d1f] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] font-medium'
                }`}
              >
                <Icon
                  className={`w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0 transition-transform ${
                    isActive
                      ? 'text-[#0071e3] dark:text-[#2997ff] scale-105'
                      : 'text-[#86868b] dark:text-[#6e6e73]'
                  }`}
                />
                <span className={`${isActive ? 'inline' : 'hidden xl:inline'}`}>
                  {tab.label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* Right Actions: Theme Toggle, View Switcher & User Profile */}
        <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
          {/* Auto Mode Interactive Toggle */}
          <button
            type="button"
            onClick={toggleAutoMode}
            aria-label={isAutoMode ? 'Auto Mode is ON' : 'Turn Auto Mode ON'}
            title={isAutoMode ? 'Auto Mode is ON — Click to turn OFF' : 'Turn Auto Mode ON'}
            className={`h-8.5 sm:h-9 px-2.5 sm:px-3 rounded-xl text-[12px] font-semibold flex items-center gap-1.5 transition-all shadow-sm border ${
              isAutoMode
                ? 'bg-[#34c759]/15 text-[#1b7e36] dark:text-[#30d158] border-[#34c759]/30 hover:bg-[#34c759]/20'
                : 'bg-black/[0.03] dark:bg-white/[0.06] text-[#6e6e73] dark:text-[#86868b] border-black/[0.06] dark:border-white/[0.08] hover:text-[#1d1d1f] dark:hover:text-white'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isAutoMode ? 'bg-[#34c759] animate-pulse' : 'bg-[#86868b]'}`} />
            <span className="hidden sm:inline">Auto Mode</span>
            <span className={`font-mono text-[11px] ${isAutoMode ? 'text-[#1b7e36] dark:text-[#30d158]' : ''}`}>
              {isAutoMode ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Apple Transparent Icon Gesture: Light / Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center bg-black/[0.03] hover:bg-black/[0.07] dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-[#6e6e73] dark:text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white border border-black/[0.06] dark:border-white/[0.08] transition-all duration-200 shadow-sm"
          >
            {isDark ? (
              <Sun className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#ff9f0a] shrink-0" />
            ) : (
              <Moon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#0071e3] shrink-0" />
            )}
          </button>

          {isPortal ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="h-8.5 sm:h-9 px-3 sm:px-4 rounded-xl text-[12px] sm:text-[13px] font-medium bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-[#1d1d1f] dark:text-white border border-black/[0.08] dark:border-white/[0.1] transition-colors whitespace-nowrap"
            >
              Back to Internal
            </button>
          ) : (
            <button
              onClick={() => navigate('/portal')}
              className="h-8.5 sm:h-9 px-2.5 sm:px-4 rounded-xl text-[12px] sm:text-[13px] font-medium bg-[#0071e3]/10 dark:bg-[#0071e3]/15 hover:bg-[#0071e3]/20 dark:hover:bg-[#0071e3]/25 text-[#0071e3] dark:text-[#2997ff] border border-[#0071e3]/20 dark:border-[#0071e3]/30 transition-colors flex items-center gap-1 sm:gap-1.5 shadow-sm whitespace-nowrap"
            >
              <span className="hidden sm:inline">Customer Portal</span>
              <span className="sm:hidden">Portal</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            </button>
          )}

          {user && (
            <div className="hidden md:flex items-center space-x-2.5 pl-2.5 border-l border-black/[0.08] dark:border-white/[0.08]">
              <div className="text-right">
                <div className="text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] leading-tight whitespace-nowrap">{user.name}</div>
                <div className="text-[12px] text-[#6e6e73] dark:text-[#86868b] uppercase font-mono mt-0.5 whitespace-nowrap">
                  {user.role?.replace('_', ' ')}
                </div>
              </div>
              <button
                onClick={logout}
                title="Sign out"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6e6e73] dark:text-[#86868b] hover:text-[#ff453a] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
