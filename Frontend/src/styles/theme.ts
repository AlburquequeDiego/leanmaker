import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb', // Azul más vibrante
      light: '#3b82f6', // Azul claro más vibrante
      dark: '#1d4ed8', // Azul oscuro más vibrante
    },
    secondary: {
      main: '#a855f7', // Púrpura más vibrante
      light: '#c084fc', // Púrpura claro más vibrante
      dark: '#9333ea', // Púrpura oscuro más vibrante
    },
    error: {
      main: '#dc2626', // Rojo más vibrante
    },
    warning: {
      main: '#ea580c', // Naranja más vibrante
    },
    info: {
      main: '#0891b2', // Cian más vibrante
    },
    success: {
      main: '#16a34a', // Verde más vibrante
    },
    background: {
      default: '#f8fafc', // Gris más claro y limpio
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
}); 