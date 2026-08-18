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
    h1: { fontSize: 'clamp(1.65rem, 3vw, 2rem)', fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontSize: 'clamp(1.35rem, 2.5vw, 1.5rem)', fontWeight: 600, letterSpacing: '-0.01em' },
    h3: { fontSize: '1.25rem', fontWeight: 600 }, h4: { fontSize: '1.125rem', fontWeight: 600 },
    h5: { fontSize: '1rem', fontWeight: 600 }, h6: { fontSize: '0.875rem', fontWeight: 600 },
    subtitle1: { fontSize: '0.9375rem' }, subtitle2: { fontSize: '0.8125rem' },
    body1: { fontSize: '0.875rem', lineHeight: 1.5 }, body2: { fontSize: '0.8125rem', lineHeight: 1.5 },
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

export const createAppTheme = (mode = 'light') => createTheme(theme, {
  palette: {
    mode,
    background: {
      default: mode === 'dark' ? '#07111f' : '#f8fafc',
      paper: mode === 'dark' ? '#101c2d' : '#ffffff',
    },
    text: {
      primary: mode === 'dark' ? '#e5eefb' : '#0f172a',
      secondary: mode === 'dark' ? '#a8bbd4' : '#475569',
    },
    divider: mode === 'dark' ? 'rgba(148, 163, 184, 0.18)' : '#e2e8f0',
  },
  components: {
    MuiCssBaseline: { styleOverrides: { body: { backgroundColor: mode === 'dark' ? '#07111f' : '#f8fafc', color: mode === 'dark' ? '#e5eefb' : '#0f172a' } } },
    MuiCard: { styleOverrides: { root: { backgroundColor: mode === 'dark' ? '#101c2d' : '#ffffff', borderColor: mode === 'dark' ? 'rgba(148, 163, 184, 0.18)' : '#e2e8f0' } } },
    MuiDrawer: { styleOverrides: { paper: { backgroundColor: mode === 'dark' ? '#0c1728' : '#ffffff', borderColor: mode === 'dark' ? 'rgba(148, 163, 184, 0.18)' : '#e2e8f0' } } },
    MuiTableCell: { styleOverrides: { head: { backgroundColor: mode === 'dark' ? 'rgba(148, 163, 184, 0.08)' : '#f8fafc' }, body: { borderColor: mode === 'dark' ? 'rgba(148, 163, 184, 0.12)' : '#f1f5f9' } } },
    MuiInputBase: { styleOverrides: { root: { color: mode === 'dark' ? '#e5eefb' : '#0f172a' } } },
    MuiOutlinedInput: { styleOverrides: { notchedOutline: { borderColor: mode === 'dark' ? 'rgba(148,163,184,.34)' : '#cbd5e1' } } },
    MuiMenu: { styleOverrides: { paper: { backgroundColor: mode === 'dark' ? '#142237' : '#ffffff' } } },
  },
});
