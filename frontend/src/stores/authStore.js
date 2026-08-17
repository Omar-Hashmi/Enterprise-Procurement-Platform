import { create } from 'zustand';

const TOKEN_KEY = 'epp_auth_token';
const USER_KEY = 'epp_auth_user';

export const decodeToken = (token) => {
  if (!token || typeof token !== 'string') return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  // exp is in seconds, Date.now() is in milliseconds
  return decoded.exp * 1000 <= Date.now();
};

const initializeAuth = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token || isTokenExpired(token)) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    return { token: null, user: null, isAuthenticated: false };
  }

  let user = null;
  try {
    const parsed = localStorage.getItem(USER_KEY);
    if (parsed) user = JSON.parse(parsed);
  } catch {
    user = null;
  }

  if (!user) {
    const decoded = decodeToken(token);
    if (decoded) {
      user = {
        userId: decoded.userId,
        role: decoded.role,
      };
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  }

  return { token, user, isAuthenticated: true };
};

const initial = initializeAuth();

export const useAuthStore = create((set, get) => ({
  token: initial.token,
  user: initial.user,
  isAuthenticated: initial.isAuthenticated,

  setToken: (token) => {
    if (token && !isTokenExpired(token)) {
      localStorage.setItem(TOKEN_KEY, token);
      const decoded = decodeToken(token);
      const user = decoded ? { userId: decoded.userId, role: decoded.role } : null;
      if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      }
      set({ token, user, isAuthenticated: true });
    } else {
      get().clearAuth();
    }
  },

  setUser: (user) => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      set({ user });
    } else {
      localStorage.removeItem(USER_KEY);
      set({ user: null });
    }
  },

  clearAuth: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    set({ token: null, user: null, isAuthenticated: false });
  },

  checkAuth: () => {
    const { token } = get();
    if (!token || isTokenExpired(token)) {
      get().clearAuth();
      return false;
    }
    return true;
  },
}));
