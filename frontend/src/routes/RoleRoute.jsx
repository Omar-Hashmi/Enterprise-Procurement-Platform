import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export const RoleRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If roles are specified, check user's role
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role ? String(user.role).toLowerCase() : '';
    const normalizedAllowed = allowedRoles.map((r) => String(r).toLowerCase());

    if (!userRole || !normalizedAllowed.includes(userRole)) {
      // Redirect unauthorized user to their default landing page (dashboard)
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default RoleRoute;
