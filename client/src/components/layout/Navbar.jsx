import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User as UserIcon, ShieldAlert } from 'lucide-react';
import Badge from '../common/Badge';

export const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">
          Deal Lifecycle Management
        </span>
        <span className="text-slate-600">/</span>
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-slate-300 font-medium">CPQ Engine Active</span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {user && (
          <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5">
            <div className="w-7 h-7 rounded-full bg-indigo-950 border border-indigo-700/60 flex items-center justify-center text-indigo-300 font-semibold text-xs">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="text-left">
              <div className="text-xs font-medium text-slate-200">{user.name}</div>
              <div className="text-[10px] text-slate-400 capitalize">{user.role ? user.role.replace('_', ' ') : ''}</div>
            </div>
            <Badge variant="primary" size="xs">
              {user.department || 'Sales'}
            </Badge>
          </div>
        )}

        <button
          onClick={logout}
          title="Sign out"
          className="text-slate-400 hover:text-rose-400 p-2 rounded-lg hover:bg-slate-900 transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
