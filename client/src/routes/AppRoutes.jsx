import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AppLayout from '../components/layout/AppLayout';
import LoginPage from '../pages/auth/LoginPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import QuotationsListPage from '../pages/quotations/QuotationsListPage';
import QuotationBuilderPage from '../pages/quotations/QuotationBuilderPage';
import QuotationDetailsPage from '../pages/quotations/QuotationDetailsPage';
import ApprovalsQueuePage from '../pages/approvals/ApprovalsQueuePage';
import InvoicesPage from '../pages/billing/InvoicesPage';
import FulfillmentPage from '../pages/fulfillment/FulfillmentPage';
import DealHealthPage from '../pages/dealHealth/DealHealthPage';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="quotations" element={<QuotationsListPage />} />
        <Route path="quotations/new" element={<QuotationBuilderPage />} />
        <Route path="quotations/:id" element={<QuotationDetailsPage />} />
        <Route path="approvals" element={<ApprovalsQueuePage />} />
        <Route path="billing" element={<InvoicesPage />} />
        <Route path="fulfillment" element={<FulfillmentPage />} />
        <Route path="deal-health" element={<DealHealthPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
