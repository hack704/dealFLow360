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

        {/* Screen 3 & 4: Quotations */}
        <Route path="quotations" element={<QuotationsListPage />} />
        <Route path="quotations/new" element={<QuotationBuilderPage />} />
        <Route path="quotations/:id" element={<QuotationDetailsPage />} />

        {/* Screen 5 & 6: Approvals */}
        <Route path="approvals" element={<ApprovalsQueuePage />} />
        <Route path="approvals/:id" element={<ApprovalDetailsPage />} />

        {/* Screen 7 & 8: Fulfillment */}
        <Route path="fulfillment" element={<FulfillmentPage />} />
        <Route path="fulfillment/:id" element={<FulfillmentDetailPage />} />

        {/* Screen 9 & 10: Subscriptions & Billing Detail */}
        <Route path="subscriptions" element={<SubscriptionsPage />} />
        <Route path="subscriptions/:id" element={<BillingDetailPage />} />
        <Route path="billing/:id" element={<BillingDetailPage />} />

        {/* Screen 12 & 13: Invoices */}
        <Route path="invoices" element={<InvoicesPage />} />
        <Route path="invoices/:id" element={<InvoiceDetailsPage />} />
        <Route path="billing" element={<InvoicesPage />} />

        {/* Screen 14: Deal Health */}
        <Route path="deal-health" element={<DealHealthPage />} />

        {/* Screen 15: Admin Reporting */}
        <Route path="reports" element={<AdminReportingPage />} />

        {/* Screen 16 & 17: Product Catalog & Product Details */}
        <Route path="products" element={<ProductCatalogPage />} />
        <Route path="products/new" element={<ProductDetailsPage />} />
        <Route path="products/:id" element={<ProductDetailsPage />} />

        {/* Screen 18: Discount Tiers & Approval Chains */}
        <Route path="discount-tiers" element={<DiscountTiersSetupPage />} />
        <Route path="admin/discount-chains" element={<DiscountTiersSetupPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
