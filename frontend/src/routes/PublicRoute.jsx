import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export const PublicRoute = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  const isAuthed = isAuthenticated && checkAuth();

  if (isAuthed) {
    const from = location.state?.from;
    const destination = from
      ? `${from.pathname || ''}${from.search || ''}${from.hash || ''}`
      : '/dashboard';
    return <Navigate to={destination} replace />;
  }

  return children;
};

export default PublicRoute;
