import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0284c7', // Enterprise Sky Blue
      light: '#38bdf8',
      dark: '#0369a1',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#334155', // Slate Navy
      light: '#64748b',
      dark: '#1e293b',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      disabled: '#94a3b8',
    },
    divider: '#e2e8f0',
    success: {
      main: '#10b981',
      light: '#d1fae5',
      dark: '#047857',
    },
    warning: {
      main: '#f59e0b',
      light: '#fef3c7',
      dark: '#b45309',
    },
    error: {
      main: '#ef4444',
      light: '#fee2e2',
      dark: '#b91c1c',
    },
    info: {
      main: '#0ea5e9',
      light: '#e0f2fe',
      dark: '#0284c7',
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: { fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#0f172a' },
    h2: { fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.01em', color: '#0f172a' },
    h3: { fontSize: '1.25rem', fontWeight: 600, color: '#0f172a' },
    h4: { fontSize: '1.125rem', fontWeight: 600, color: '#0f172a' },
    h5: { fontSize: '1rem', fontWeight: 600, color: '#0f172a' },
    h6: { fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' },
    subtitle1: { fontSize: '0.9375rem', color: '#475569' },
    subtitle2: { fontSize: '0.8125rem', color: '#64748b' },
    body1: { fontSize: '0.875rem', lineHeight: 1.5, color: '#0f172a' },
    body2: { fontSize: '0.8125rem', lineHeight: 1.5, color: '#475569' },
    button: { textTransform: 'none', fontWeight: 500 },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
          padding: '6px 16px',
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: 10,
          border: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#0f172a',
          borderBottom: '1px solid #e2e8f0',
          boxShadow: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e2e8f0',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          '&.Mui-selected': {
            backgroundColor: '#e0f2fe',
            color: '#0369a1',
            fontWeight: 600,
            '& .MuiListItemIcon-root': {
              color: '#0284c7',
            },
            '&:hover': {
              backgroundColor: '#bae6fd',
            },
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          backgroundColor: '#f8fafc',
          color: '#475569',
          borderBottom: '1px solid #e2e8f0',
        },
        body: {
          borderBottom: '1px solid #f1f5f9',
        },
      },
    },
  },
});

export default theme;
