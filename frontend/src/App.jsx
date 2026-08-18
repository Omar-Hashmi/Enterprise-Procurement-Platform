import React, { createContext, useMemo, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createAppTheme } from './theme/theme';
import AppRoutes from './hooks/routes/AppRoutes';
import { AuthProvider } from './hooks/useAuth';
import { NotificationProvider } from './hooks/context/NotificationContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export const ColorModeContext = createContext({ mode: 'light', toggleColorMode: () => {} });

export default function App() {
  const [mode, setMode] = useState(() => localStorage.getItem('epp_color_mode') || 'light');
  const theme = useMemo(() => createAppTheme(mode), [mode]);
  const colorMode = useMemo(() => ({ mode, toggleColorMode: () => setMode((current) => {
    const next = current === 'light' ? 'dark' : 'light';
    localStorage.setItem('epp_color_mode', next);
    return next;
  }) }), [mode]);
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ColorModeContext.Provider value={colorMode}>
          <AuthProvider>
            <NotificationProvider>
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </NotificationProvider>
          </AuthProvider>
        </ColorModeContext.Provider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
