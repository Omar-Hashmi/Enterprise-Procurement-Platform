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
import RoleRoute from './RoleRoute';
import { USER_ROLES } from '../utils/constants';

// Role Groups for Routes
const ALL_AUTHENTICATED_ROLES = [
  USER_ROLES.EMPLOYEE,
  USER_ROLES.DEPARTMENT,
  USER_ROLES.DEPARTMENT_MANAGER,
  USER_ROLES.FINANCE_MANAGER,
  USER_ROLES.FINANCE_OFFICER,
  USER_ROLES.PROCUREMENT_MANAGER,
  USER_ROLES.PROCUREMENT_OFFICER,
  USER_ROLES.WAREHOUSE_STAFF,
  USER_ROLES.CEO,
  USER_ROLES.ADMIN,
];

const PR_VIEW_ROLES = [
  USER_ROLES.EMPLOYEE,
  USER_ROLES.DEPARTMENT,
  USER_ROLES.DEPARTMENT_MANAGER,
  USER_ROLES.FINANCE_MANAGER,
  USER_ROLES.FINANCE_OFFICER,
  USER_ROLES.PROCUREMENT_MANAGER,
  USER_ROLES.PROCUREMENT_OFFICER,
  USER_ROLES.CEO,
  USER_ROLES.ADMIN,
];

const PR_CREATE_ROLES = [
  USER_ROLES.EMPLOYEE,
  USER_ROLES.DEPARTMENT,
  USER_ROLES.DEPARTMENT_MANAGER,
  USER_ROLES.ADMIN,
];

const APPROVAL_ROLES = [
  USER_ROLES.DEPARTMENT,
  USER_ROLES.DEPARTMENT_MANAGER,
  USER_ROLES.FINANCE_MANAGER,
  USER_ROLES.PROCUREMENT_MANAGER,
  USER_ROLES.CEO,
  USER_ROLES.ADMIN,
];

const PO_VIEW_ROLES = [
  USER_ROLES.PROCUREMENT_MANAGER,
  USER_ROLES.PROCUREMENT_OFFICER,
  USER_ROLES.FINANCE_MANAGER,
  USER_ROLES.CEO,
  USER_ROLES.ADMIN,
];

const PO_CREATE_ROLES = [
  USER_ROLES.PROCUREMENT_MANAGER,
  USER_ROLES.PROCUREMENT_OFFICER,
  USER_ROLES.ADMIN,
];

const VENDOR_VIEW_ROLES = [
  USER_ROLES.PROCUREMENT_MANAGER,
  USER_ROLES.PROCUREMENT_OFFICER,
  USER_ROLES.FINANCE_MANAGER,
  USER_ROLES.DEPARTMENT,
  USER_ROLES.DEPARTMENT_MANAGER,
  USER_ROLES.CEO,
  USER_ROLES.ADMIN,
];

const VENDOR_MANAGE_ROLES = [
  USER_ROLES.PROCUREMENT_MANAGER,
  USER_ROLES.PROCUREMENT_OFFICER,
  USER_ROLES.ADMIN,
];

const CONTRACT_VIEW_ROLES = [
  USER_ROLES.PROCUREMENT_MANAGER,
  USER_ROLES.PROCUREMENT_OFFICER,
  USER_ROLES.FINANCE_MANAGER,
  USER_ROLES.CEO,
  USER_ROLES.ADMIN,
];

const CONTRACT_MANAGE_ROLES = [
  USER_ROLES.PROCUREMENT_MANAGER,
  USER_ROLES.PROCUREMENT_OFFICER,
  USER_ROLES.ADMIN,
];

const INVENTORY_ROLES = [
  USER_ROLES.WAREHOUSE_STAFF,
  USER_ROLES.PROCUREMENT_MANAGER,
  USER_ROLES.PROCUREMENT_OFFICER,
  USER_ROLES.ADMIN,
];

const BUDGET_VIEW_ROLES = [
  USER_ROLES.FINANCE_MANAGER,
  USER_ROLES.FINANCE_OFFICER,
  USER_ROLES.DEPARTMENT,
  USER_ROLES.DEPARTMENT_MANAGER,
  USER_ROLES.PROCUREMENT_MANAGER,
  USER_ROLES.CEO,
  USER_ROLES.ADMIN,
];

const BUDGET_MANAGE_ROLES = [
  USER_ROLES.FINANCE_MANAGER,
  USER_ROLES.FINANCE_OFFICER,
  USER_ROLES.ADMIN,
];

const ANALYTICS_ROLES = [
  USER_ROLES.PROCUREMENT_MANAGER,
  USER_ROLES.FINANCE_MANAGER,
  USER_ROLES.CEO,
  USER_ROLES.ADMIN,
  USER_ROLES.PROCUREMENT_OFFICER,
];

const AUDIT_LOG_ROLES = [USER_ROLES.ADMIN];

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
        {/* General Protected Routes */}
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

        {/* Purchase Requests */}
        <Route
          path="/purchase-requests"
          element={
            <RoleRoute allowedRoles={PR_VIEW_ROLES}>
              <AppShell>
                <PurchaseRequestsPage />
              </AppShell>
            </RoleRoute>
          }
        />
        <Route
          path="/purchase-requests/new"
          element={
            <RoleRoute allowedRoles={PR_CREATE_ROLES}>
              <AppShell>
                <CreatePurchaseRequestPage />
              </AppShell>
            </RoleRoute>
          }
        />
        <Route
          path="/purchase-requests/:id"
          element={
            <RoleRoute allowedRoles={PR_VIEW_ROLES}>
              <AppShell>
                <PurchaseRequestDetailsPage />
              </AppShell>
            </RoleRoute>
          }
        />

        {/* Approvals */}
        <Route
          path="/approvals"
          element={
            <RoleRoute allowedRoles={APPROVAL_ROLES}>
              <AppShell>
                <ApprovalsPage />
              </AppShell>
            </RoleRoute>
          }
        />

        {/* Purchase Orders */}
        <Route
          path="/purchase-orders"
          element={
            <RoleRoute allowedRoles={PO_VIEW_ROLES}>
              <AppShell>
                <PurchaseOrdersPage />
              </AppShell>
            </RoleRoute>
          }
        />
        <Route
          path="/purchase-orders/new"
          element={
            <RoleRoute allowedRoles={PO_CREATE_ROLES}>
              <AppShell>
                <CreatePurchaseOrderPage />
              </AppShell>
            </RoleRoute>
          }
        />
        <Route
          path="/purchase-orders/:id"
          element={
            <RoleRoute allowedRoles={PO_VIEW_ROLES}>
              <AppShell>
                <PurchaseOrderDetailsPage />
              </AppShell>
            </RoleRoute>
          }
        />

        {/* Vendors */}
        <Route
          path="/vendors"
          element={
            <RoleRoute allowedRoles={VENDOR_VIEW_ROLES}>
              <AppShell>
                <VendorsPage />
              </AppShell>
            </RoleRoute>
          }
        />
        <Route
          path="/vendors/new"
          element={
            <RoleRoute allowedRoles={VENDOR_MANAGE_ROLES}>
              <AppShell>
                <CreateVendorPage />
              </AppShell>
            </RoleRoute>
          }
        />
        <Route
          path="/vendors/categories"
          element={
            <RoleRoute allowedRoles={VENDOR_VIEW_ROLES}>
              <AppShell>
                <VendorCategories />
              </AppShell>
            </RoleRoute>
          }
        />
        <Route
          path="/vendors/:id/edit"
          element={
            <RoleRoute allowedRoles={VENDOR_MANAGE_ROLES}>
              <AppShell>
                <EditVendor />
              </AppShell>
            </RoleRoute>
          }
        />
        <Route
          path="/vendors/edit/:id"
          element={
            <RoleRoute allowedRoles={VENDOR_MANAGE_ROLES}>
              <AppShell>
                <EditVendor />
              </AppShell>
            </RoleRoute>
          }
        />
        <Route
          path="/vendors/:id"
          element={
            <RoleRoute allowedRoles={VENDOR_VIEW_ROLES}>
              <AppShell>
                <VendorDetailsPage />
              </AppShell>
            </RoleRoute>
          }
        />

        {/* Analytics */}
        <Route
          path="/analytics"
          element={
            <RoleRoute allowedRoles={ANALYTICS_ROLES}>
              <AppShell>
                <AnalyticsDashboard />
              </AppShell>
            </RoleRoute>
          }
        />

        {/* Contracts */}
        <Route
          path="/contracts"
          element={
            <RoleRoute allowedRoles={CONTRACT_VIEW_ROLES}>
              <AppShell>
                <ContractList />
              </AppShell>
            </RoleRoute>
          }
        />
        <Route
          path="/contracts/new"
          element={
            <RoleRoute allowedRoles={CONTRACT_MANAGE_ROLES}>
              <AppShell>
                <CreateContract />
              </AppShell>
            </RoleRoute>
          }
        />
        <Route
          path="/contracts/expiring"
          element={
            <RoleRoute allowedRoles={CONTRACT_VIEW_ROLES}>
              <AppShell>
                <ExpiringContracts />
              </AppShell>
            </RoleRoute>
          }
        />
        <Route
          path="/contracts/:id/edit"
          element={
            <RoleRoute allowedRoles={CONTRACT_MANAGE_ROLES}>
              <AppShell>
                <EditContract />
              </AppShell>
            </RoleRoute>
          }
        />
        <Route
          path="/contracts/:id"
          element={
            <RoleRoute allowedRoles={CONTRACT_VIEW_ROLES}>
              <AppShell>
                <ContractDetails />
              </AppShell>
            </RoleRoute>
          }
        />

        {/* Inventory */}
        <Route
          path="/inventory"
          element={
            <RoleRoute allowedRoles={INVENTORY_ROLES}>
              <AppShell>
                <InventoryDashboard />
              </AppShell>
            </RoleRoute>
          }
        />
        <Route
          path="/inventory/new"
          element={
            <RoleRoute allowedRoles={INVENTORY_ROLES}>
              <AppShell>
                <CreateInventory />
              </AppShell>
            </RoleRoute>
          }
        />
        <Route
          path="/inventory/deliveries"
          element={
            <RoleRoute allowedRoles={INVENTORY_ROLES}>
              <AppShell>
                <DeliveryList />
              </AppShell>
            </RoleRoute>
          }
        />
        <Route
          path="/inventory/deliveries/new"
          element={
            <RoleRoute allowedRoles={INVENTORY_ROLES}>
              <AppShell>
                <CreateDelivery />
              </AppShell>
            </RoleRoute>
          }
        />
        <Route
          path="/inventory/deliveries/:id"
          element={
            <RoleRoute allowedRoles={INVENTORY_ROLES}>
              <AppShell>
                <DeliveryDetails />
              </AppShell>
            </RoleRoute>
          }
        />
        <Route
          path="/inventory/warehouses"
          element={
            <RoleRoute allowedRoles={INVENTORY_ROLES}>
              <AppShell>
                <WarehouseList />
              </AppShell>
            </RoleRoute>
          }
        />
        <Route
          path="/inventory/warehouses/new"
          element={
            <RoleRoute allowedRoles={INVENTORY_ROLES}>
              <AppShell>
                <CreateWarehouse />
              </AppShell>
            </RoleRoute>
          }
        />
        <Route
          path="/inventory/warehouses/:id"
          element={
            <RoleRoute allowedRoles={INVENTORY_ROLES}>
              <AppShell>
                <WarehouseDetails />
              </AppShell>
            </RoleRoute>
          }
        />

        {/* Budgets */}
        <Route
          path="/budgets"
          element={
            <RoleRoute allowedRoles={BUDGET_VIEW_ROLES}>
              <AppShell>
                <BudgetList />
              </AppShell>
            </RoleRoute>
          }
        />
        <Route
          path="/budgets/new"
          element={
            <RoleRoute allowedRoles={BUDGET_MANAGE_ROLES}>
              <AppShell>
                <CreateBudget />
              </AppShell>
            </RoleRoute>
          }
        />
        <Route
          path="/budgets/:id/edit"
          element={
            <RoleRoute allowedRoles={BUDGET_MANAGE_ROLES}>
              <AppShell>
                <EditBudget />
              </AppShell>
            </RoleRoute>
          }
        />
        <Route
          path="/budgets/:id"
          element={
            <RoleRoute allowedRoles={BUDGET_VIEW_ROLES}>
              <AppShell>
                <BudgetDetails />
              </AppShell>
            </RoleRoute>
          }
        />

        {/* Audit Logs */}
        <Route
          path="/audit-logs"
          element={
            <RoleRoute allowedRoles={AUDIT_LOG_ROLES}>
              <AppShell>
                <AuditLogsPage />
              </AppShell>
            </RoleRoute>
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
