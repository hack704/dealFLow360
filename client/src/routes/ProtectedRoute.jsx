import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbfbfd] dark:bg-black flex flex-col items-center justify-center text-[13px] text-[#6e6e73] dark:text-[#86868b] font-mono gap-3">
        <div className="w-6 h-6 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin" />
        <span>Verifying security token...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Role authorization guard: if allowedRoles specified and user is not admin and not in list
  if (allowedRoles && allowedRoles.length > 0 && user) {
    if (user.role !== 'admin' && !allowedRoles.includes(user.role)) {
      if (user.role === 'customer') {
        return <Navigate to="/portal" replace />;
      }
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
