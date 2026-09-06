import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export const AppLayout = () => {
  return (
    <div className="min-h-screen bg-[#fbfbfd] dark:bg-black text-[#1d1d1f] dark:text-[#f5f5f7] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,113,227,0.05),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(41,151,255,0.08),rgba(0,0,0,0))] flex flex-col font-sans selection:bg-[#0071e3]/30 selection:text-white transition-colors duration-200">
      <Navbar />
      <main className="flex-1 w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
      <footer className="border-t border-black/[0.06] dark:border-white/[0.06] py-5 px-6 text-center text-[11px] text-[#6e6e73] dark:text-apple-dim transition-colors">
        <div className="max-w-[1680px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>DealFlow360 Deal Lifecycle Management Platform</span>
          <div className="flex items-center space-x-4">
            <span>CPQ Engine Active</span>
            <span>•</span>
            <span>Policy Governance v2.4</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;
