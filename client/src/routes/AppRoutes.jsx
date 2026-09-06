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
import ApprovalDetailsPage from '../pages/approvals/ApprovalDetailsPage';
import FulfillmentPage from '../pages/fulfillment/FulfillmentPage';
import FulfillmentDetailPage from '../pages/fulfillment/FulfillmentDetailPage';
import SubscriptionsPage from '../pages/subscriptions/SubscriptionsPage';
import BillingDetailPage from '../pages/billing/BillingDetailPage';
import InvoicesPage from '../pages/billing/InvoicesPage';
import InvoiceDetailsPage from '../pages/billing/InvoiceDetailsPage';
import DealHealthPage from '../pages/dealHealth/DealHealthPage';
import AdminReportingPage from '../pages/reports/AdminReportingPage';
import ProductCatalogPage from '../pages/products/ProductCatalogPage';
import ProductDetailsPage from '../pages/products/ProductDetailsPage';
import DiscountTiersSetupPage from '../pages/admin/DiscountTiersSetupPage';
import SalesBackendConfigurationPage from '../pages/admin/SalesBackendConfigurationPage';
import CustomerPortalPage from '../pages/customer/CustomerPortalPage';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Customer Portal can also be accessed directly */}
      <Route
        path="/portal"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<CustomerPortalPage />} />
        <Route path="messages" element={<CustomerPortalPage />} />
        <Route path="profile" element={<CustomerPortalPage />} />
      </Route>

      {/* Internal Management Application Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        {/* Screen 2: Dashboard */}
        <Route path="dashboard" element={<DashboardPage />} />

        {/* Screen 3 & 4: Quotations & Kanban Deal Pipeline (Sales Rep, Sales Manager, Admin) */}
        <Route
          path="quotations"
          element={
            <ProtectedRoute allowedRoles={['sales_rep', 'sales_manager', 'admin']}>
              <QuotationsListPage initialView="table" />
            </ProtectedRoute>
          }
        />
        <Route
          path="pipeline"
          element={
            <ProtectedRoute allowedRoles={['sales_rep', 'sales_manager', 'admin']}>
              <QuotationsListPage initialView="kanban" />
            </ProtectedRoute>
          }
        />
        <Route
          path="quotations/new"
          element={
            <ProtectedRoute allowedRoles={['sales_rep', 'sales_manager', 'admin']}>
              <QuotationBuilderPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="quotations/builder"
          element={
            <ProtectedRoute allowedRoles={['sales_rep', 'sales_manager', 'admin']}>
              <QuotationBuilderPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="quotations/builder/:id"
          element={
            <ProtectedRoute allowedRoles={['sales_rep', 'sales_manager', 'admin']}>
              <QuotationBuilderPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="quotations/:id"
          element={
            <ProtectedRoute allowedRoles={['sales_rep', 'sales_manager', 'admin']}>
              <QuotationDetailsPage />
            </ProtectedRoute>
          }
        />

        {/* Screen 5 & 6: Approvals (Sales Manager, Finance, Admin - BLOCKED for Sales Rep) */}
        <Route
          path="approvals"
          element={
            <ProtectedRoute allowedRoles={['sales_manager', 'finance', 'admin']}>
              <ApprovalsQueuePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="approvals/:id"
          element={
            <ProtectedRoute allowedRoles={['sales_manager', 'finance', 'admin']}>
              <ApprovalDetailsPage />
            </ProtectedRoute>
          }
        />

        {/* Screen 7 & 8: Fulfillment (Finance, Admin, Sales Manager) */}
        <Route
          path="fulfillment"
          element={
            <ProtectedRoute allowedRoles={['finance', 'admin', 'sales_manager']}>
              <FulfillmentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="fulfillment/:id"
          element={
            <ProtectedRoute allowedRoles={['finance', 'admin', 'sales_manager']}>
              <FulfillmentDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Screen 9 & 10: Subscriptions (Finance, Admin) */}
        <Route
          path="subscriptions"
          element={
            <ProtectedRoute allowedRoles={['finance', 'admin']}>
              <SubscriptionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="subscriptions/:id"
          element={
            <ProtectedRoute allowedRoles={['finance', 'admin']}>
              <BillingDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="billing/:id"
          element={
            <ProtectedRoute allowedRoles={['finance', 'admin']}>
              <BillingDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Screen 12 & 13: Invoices (Finance, Admin) */}
        <Route
          path="invoices"
          element={
            <ProtectedRoute allowedRoles={['finance', 'admin']}>
              <InvoicesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="invoices/:id"
          element={
            <ProtectedRoute allowedRoles={['finance', 'admin']}>
              <InvoiceDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="billing"
          element={
            <ProtectedRoute allowedRoles={['finance', 'admin']}>
              <InvoicesPage />
            </ProtectedRoute>
          }
        />

        {/* Screen 14: Deal Health (Sales Manager, Admin) */}
        <Route
          path="deal-health"
          element={
            <ProtectedRoute allowedRoles={['sales_manager', 'admin']}>
              <DealHealthPage />
            </ProtectedRoute>
          }
        />

        {/* Screen 15: Admin Reporting (Admin Only) */}
        <Route
          path="reports"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminReportingPage />
            </ProtectedRoute>
          }
        />

        {/* Screen 16 & 17: Product Catalog (Admin, Sales Rep, Sales Manager) */}
        <Route
          path="products"
          element={
            <ProtectedRoute allowedRoles={['admin', 'sales_rep', 'sales_manager']}>
              <ProductCatalogPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="products/new"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ProductDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="products/:id"
          element={
            <ProtectedRoute allowedRoles={['admin', 'sales_rep', 'sales_manager']}>
              <ProductDetailsPage />
            </ProtectedRoute>
          }
        />

        {/* Screen 18: Discount Tiers & Approval Chains (Sales Manager, Admin) */}
        <Route
          path="discount-tiers"
          element={
            <ProtectedRoute allowedRoles={['sales_manager', 'admin']}>
              <DiscountTiersSetupPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/discount-chains"
          element={
            <ProtectedRoute allowedRoles={['sales_manager', 'admin']}>
              <DiscountTiersSetupPage />
            </ProtectedRoute>
          }
        />

        {/* Section A: Sales Backend (Configuration Area Hub: A1 through A7) */}
        <Route
          path="backend-config"
          element={
            <ProtectedRoute allowedRoles={['sales_rep', 'sales_manager', 'admin']}>
              <SalesBackendConfigurationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/setup"
          element={
            <ProtectedRoute allowedRoles={['sales_rep', 'sales_manager', 'admin']}>
              <SalesBackendConfigurationPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
