import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { connectSocket, disconnectSocket, getSocket } from '../lib/socket';

export const useSocket = () => {
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated && token) {
      const socket = connectSocket(token);
      return () => {
        // Cleanup or disconnect on token change/logout
        if (!isAuthenticated) {
          disconnectSocket();
        }
      };
    } else {
      disconnectSocket();
    }
  }, [token, isAuthenticated]);

  return {
    getSocket,
  };
};

export default useSocket;
