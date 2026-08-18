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
import VendorsPage from '../pages/vendor/VendorList';
import CreateVendorPage from '../pages/CreateVendorPage';
import VendorDetailsPage from '../pages/vendor/VendorDetails';
import VendorCategories from '../pages/vendor/VendorCategories';
import EditVendor from '../pages/vendor/EditVendor';
import ApprovalsPage from '../pages/ApprovalsPage';
import PurchaseOrdersPage from '../pages/PurchaseOrdersPage';
import CreatePurchaseOrderPage from '../pages/CreatePurchaseOrderPage';
import PurchaseOrderDetailsPage from '../pages/PurchaseOrderDetailsPage';
import AuditLogsPage from '../pages/AuditLogsPage';
import AnalyticsDashboard from '../pages/analytics/AnalyticsDashboard';
import ContractList from '../pages/contract/ContractList';
import CreateContract from '../pages/contract/CreateContract';
import ContractDetails from '../pages/contract/ContractDetails';
import EditContract from '../pages/contract/EditContract';
import ExpiringContracts from '../pages/contract/ExpiringContracts';
import InventoryDashboard from '../pages/inventory/InventoryDashboard';
import CreateInventory from '../pages/inventory/CreateInventory';
import DeliveryList from '../pages/inventory/DeliveryList';
import DeliveryDetails from '../pages/inventory/DeliveryDetails';
import WarehouseList from '../pages/inventory/WarehouseList';
import WarehouseDetails from '../pages/inventory/WarehouseDetails';
import CreateWarehouse from '../pages/inventory/CreateWarehouse';
import CreateDelivery from '../pages/inventory/CreateDelivery';
import BudgetList from '../pages/budget/BudgetList';
import CreateBudget from '../pages/budget/CreateBudget';
import BudgetDetails from '../pages/budget/BudgetDetails';
import EditBudget from '../pages/budget/EditBudget';
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
          path="/analytics"
          element={
            <AppShell>
              <AnalyticsDashboard />
            </AppShell>
          }
        />
        <Route
          path="/contracts"
          element={
            <AppShell>
              <ContractList />
            </AppShell>
          }
        />
        <Route path="/contracts/new" element={<AppShell><CreateContract /></AppShell>} />
        <Route path="/contracts/expiring" element={<AppShell><ExpiringContracts /></AppShell>} />
        <Route path="/contracts/:id/edit" element={<AppShell><EditContract /></AppShell>} />
        <Route path="/contracts/:id" element={<AppShell><ContractDetails /></AppShell>} />
        <Route
          path="/inventory"
          element={
            <AppShell>
              <InventoryDashboard />
            </AppShell>
          }
        />
        <Route path="/inventory/new" element={<AppShell><CreateInventory /></AppShell>} />
        <Route path="/inventory/deliveries" element={<AppShell><DeliveryList /></AppShell>} />
        <Route path="/inventory/deliveries/new" element={<AppShell><CreateDelivery /></AppShell>} />
        <Route path="/inventory/deliveries/:id" element={<AppShell><DeliveryDetails /></AppShell>} />
        <Route path="/inventory/warehouses" element={<AppShell><WarehouseList /></AppShell>} />
        <Route path="/inventory/warehouses/new" element={<AppShell><CreateWarehouse /></AppShell>} />
        <Route path="/inventory/warehouses/:id" element={<AppShell><WarehouseDetails /></AppShell>} />
        <Route
          path="/budgets"
          element={
            <AppShell>
              <BudgetList />
            </AppShell>
          }
        />
        <Route path="/budgets/new" element={<AppShell><CreateBudget /></AppShell>} />
        <Route path="/budgets/:id/edit" element={<AppShell><EditBudget /></AppShell>} />
        <Route path="/budgets/:id" element={<AppShell><BudgetDetails /></AppShell>} />
        {/* Debug route to quickly verify the app is rendering */}
        <Route
          path="/debug"
          element={
            <AppShell>
              <div style={{ padding: 24 }}>
                <h2>App running — debug route</h2>
                <p>This confirms the React tree and routing are working.</p>
              </div>
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
          path="/vendors/categories"
          element={
            <AppShell>
              <VendorCategories />
            </AppShell>
          }
        />
        <Route
          path="/vendors/:id/edit"
          element={
            <AppShell>
              <EditVendor />
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
