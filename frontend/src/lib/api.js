import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

// Backend API URL
// Your backend is running on port 3000.
const baseURL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ======================================================
// REQUEST INTERCEPTOR
// Attach JWT token to authenticated requests
// ======================================================

apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ======================================================
// RESPONSE INTERCEPTOR
// Handle authentication errors
// ======================================================

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      const isLoginRequest =
        error.config?.url?.includes('/auth/login');

      if (!isLoginRequest) {
        useAuthStore.getState().clearAuth();

        if (
          typeof window !== 'undefined' &&
          window.location.pathname !== '/login'
        ) {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export { apiClient };
export default apiClient;