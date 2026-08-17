import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import DashboardPage from '../pages/DashboardPage';
import ProfilePage from '../pages/ProfilePage';
import PurchaseRequestsPage from '../pages/PurchaseRequestsPage';
import CreatePurchaseRequestPage from '../pages/CreatePurchaseRequestPage';
import PurchaseRequestDetailsPage from '../pages/PurchaseRequestDetailsPage';
import VendorsPage from '../pages/VendorsPage';
import CreateVendorPage from '../pages/CreateVendorPage';
import VendorDetailsPage from '../pages/VendorDetailsPage';
import ApprovalsPage from '../pages/ApprovalsPage';
import PurchaseOrdersPage from '../pages/PurchaseOrdersPage';
import CreatePurchaseOrderPage from '../pages/CreatePurchaseOrderPage';
import PurchaseOrderDetailsPage from '../pages/PurchaseOrderDetailsPage';
import AuditLogsPage from '../pages/AuditLogsPage';
import AppShell from '../components/layout/AppShell';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPasswordPage />
          </PublicRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <PublicRoute>
            <ResetPasswordPage />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route
          path="/dashboard"
          element={
            <AppShell>
              <DashboardPage />
            </AppShell>
          }
        />
        <Route
          path="/profile"
          element={
            <AppShell>
              <ProfilePage />
            </AppShell>
          }
        />
        <Route
          path="/purchase-requests"
          element={
            <AppShell>
              <PurchaseRequestsPage />
            </AppShell>
          }
        />
        <Route
          path="/purchase-requests/new"
          element={
            <AppShell>
              <CreatePurchaseRequestPage />
            </AppShell>
          }
        />
        <Route
          path="/purchase-requests/:id"
          element={
            <AppShell>
              <PurchaseRequestDetailsPage />
            </AppShell>
          }
        />
        <Route
          path="/approvals"
          element={
            <AppShell>
              <ApprovalsPage />
            </AppShell>
          }
        />
        <Route
          path="/purchase-orders"
          element={
            <AppShell>
              <PurchaseOrdersPage />
            </AppShell>
          }
        />
        <Route
          path="/purchase-orders/new"
          element={
            <AppShell>
              <CreatePurchaseOrderPage />
            </AppShell>
          }
        />
        <Route
          path="/purchase-orders/:id"
          element={
            <AppShell>
              <PurchaseOrderDetailsPage />
            </AppShell>
          }
        />
        <Route
          path="/vendors"
          element={
            <AppShell>
              <VendorsPage />
            </AppShell>
          }
        />
        <Route
          path="/vendors/new"
          element={
            <AppShell>
              <CreateVendorPage />
            </AppShell>
          }
        />
        <Route
          path="/vendors/:id"
          element={
            <AppShell>
              <VendorDetailsPage />
            </AppShell>
          }
        />
        <Route
          path="/audit-logs"
          element={
            <AppShell>
              <AuditLogsPage />
            </AppShell>
          }
        />
      </Route>

      {/* Fallback Redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
