import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { createTheme } from '@mui/material/styles';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  themeMode: ThemeMode;
  toggleTheme: () => void;
  theme: any; // Usar any temporalmente para evitar problemas de tipos
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Temas personalizados
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3b82f6', // Azul más vibrante y menos oscuro
      light: '#60a5fa',
      dark: '#2563eb',
    },
    secondary: {
      main: '#a855f7',
      light: '#c084fc',
      dark: '#9333ea',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
    divider: 'rgba(0, 0, 0, 0.08)',
  },
  components: {
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          margin: '4px 8px',
          transition: 'all 0.2s ease-in-out',
          '&.Mui-selected': {
            backgroundColor: '#3b82f6', // Azul más vibrante
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#2563eb',
            },
            '& .MuiListItemIcon-root': {
              color: '#ffffff',
            },
            '& .MuiListItemText-primary': {
              color: '#ffffff',
              fontWeight: 700,
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(59, 130, 246, 0.08)', // Hover con el nuevo azul
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: '#64748b',
          minWidth: 40,
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          fontWeight: 600,
          fontSize: '18px',
        },
      },
    },
    // Estilos para filtros en modo claro - TODO BLANCO CON TEXTO NEGRO
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#ffffff !important',
            color: '#1e293b !important',
            '&:hover': {
              backgroundColor: '#f8f9fa !important',
            },
            '&.Mui-focused': {
              backgroundColor: '#ffffff !important',
            },
            '& fieldset': {
              borderColor: '#d1d5db !important',
            },
            '&:hover fieldset': {
              borderColor: '#3b82f6 !important',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#3b82f6 !important',
            },
            '& input': {
              color: '#1e293b !important',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#64748b !important',
            '&.Mui-focused': {
              color: '#3b82f6 !important',
            },
          },
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#ffffff !important',
            color: '#1e293b !important',
            '&:hover': {
              backgroundColor: '#f8f9fa !important',
            },
            '&.Mui-focused': {
              backgroundColor: '#ffffff !important',
            },
            '& fieldset': {
              borderColor: '#d1d5db !important',
            },
            '&:hover fieldset': {
              borderColor: '#3b82f6 !important',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#3b82f6 !important',
            },
            '& input': {
              color: '#1e293b !important',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#64748b !important',
            '&.Mui-focused': {
              color: '#3b82f6 !important',
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff !important',
          color: '#1e293b !important',
          '&:hover': {
            backgroundColor: '#f8f9fa !important',
          },
          '&.Mui-focused': {
            backgroundColor: '#ffffff !important',
          },
          '& .MuiSelect-select': {
            color: '#1e293b !important',
          },
        },
        icon: {
          color: '#64748b !important',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: '#1e293b !important',
          '&:hover': {
            backgroundColor: '#f1f5f9 !important',
          },
          '&.Mui-selected': {
            backgroundColor: '#dbeafe !important',
            color: '#1e40af !important',
            '&:hover': {
              backgroundColor: '#bfdbfe !important',
            },
          },
        },
      },
    },
    // Tarjetas de filtros en modo claro
    MuiPaper: {
      styleOverrides: {
        root: {
          '&.filter-card': {
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important',
            '& .filter-container': {
              backgroundColor: 'rgba(255,255,255,0.7)',
            },
          },
        },
      },
    },
    // Estilos para Card en modo claro - SOLO PARA FILTROS
    MuiCard: {
      styleOverrides: {
        root: {
          '&.filter-card': {
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important',
            border: '1px solid rgba(0,0,0,0.05)',
            '& .filter-container': {
              backgroundColor: 'rgba(255,255,255,0.7)',
            },
          },
        },
      },
    },
    // Estilos para CardContent en modo claro - SOLO PARA FILTROS
    MuiCardContent: {
      styleOverrides: {
        root: {
          '&.filter-card .MuiCardContent-root': {
            backgroundColor: 'transparent',
          },
        },
      },
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#60a5fa', // Azul más claro para modo oscuro
      light: '#93c5fd',
      dark: '#3b82f6',
    },
    secondary: {
      main: '#a855f7',
      light: '#c084fc',
      dark: '#9333ea',
    },
    background: {
      default: '#0f172a',
      paper: '#1e293b',
    },
    text: {
      primary: '#f1f5f9',
      secondary: '#cbd5e1',
    },
    divider: 'rgba(255, 255, 255, 0.08)',
  },
  components: {
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          margin: '4px 8px',
          transition: 'all 0.2s ease-in-out',
          '&.Mui-selected': {
            backgroundColor: '#ffffff',
            color: '#1e293b',
            '&:hover': {
              backgroundColor: '#f1f5f9',
            },
            '& .MuiListItemIcon-root': {
              color: '#1e293b',
            },
            '& .MuiListItemText-primary': {
              color: '#1e293b',
              fontWeight: 700,
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: '#94a3b8',
          minWidth: 40,
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          fontWeight: 600,
          fontSize: '18px',
        },
      },
    },
    // Estilos para filtros en modo oscuro - TODO OSCURO CON TEXTO CLARO
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#1e293b !important',
            color: '#f1f5f9 !important',
            '&:hover': {
              backgroundColor: '#334155 !important',
            },
            '&.Mui-focused': {
              backgroundColor: '#1e293b !important',
            },
            '& fieldset': {
              borderColor: '#475569 !important',
            },
            '&:hover fieldset': {
              borderColor: '#60a5fa !important',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#60a5fa !important',
            },
            '& input': {
              color: '#f1f5f9 !important',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#94a3b8 !important',
            '&.Mui-focused': {
              color: '#60a5fa !important',
            },
          },
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#1e293b !important',
            color: '#f1f5f9 !important',
            '&:hover': {
              backgroundColor: '#334155 !important',
            },
            '&.Mui-focused': {
              backgroundColor: '#1e293b !important',
            },
            '& fieldset': {
              borderColor: '#475569 !important',
            },
            '&:hover fieldset': {
              borderColor: '#60a5fa !important',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#60a5fa !important',
            },
            '& input': {
              color: '#f1f5f9 !important',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#94a3b8 !important',
            '&.Mui-focused': {
              color: '#60a5fa !important',
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e293b !important',
          color: '#f1f5f9 !important',
          '&:hover': {
            backgroundColor: '#334155 !important',
          },
          '&.Mui-focused': {
            backgroundColor: '#1e293b !important',
          },
          '& .MuiSelect-select': {
            color: '#f1f5f9 !important',
          },
        },
        icon: {
          color: '#94a3b8 !important',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: '#f1f5f9 !important',
          '&:hover': {
            backgroundColor: '#334155 !important',
          },
          '&.Mui-selected': {
            backgroundColor: '#1e40af !important',
            color: '#ffffff !important',
            '&:hover': {
              backgroundColor: '#1d4ed8 !important',
            },
          },
        },
      },
    },
    // Tarjetas de filtros en modo oscuro - FONDO OSCURO PERO VISIBLE
    MuiPaper: {
      styleOverrides: {
        root: {
          '&.filter-card': {
            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%) !important',
            border: '1px solid #475569',
            '& .filter-container': {
              backgroundColor: 'rgba(30, 41, 59, 0.7)',
            },
          },
        },
      },
    },
    // Estilos para Card en modo oscuro - SOLO PARA FILTROS
    MuiCard: {
      styleOverrides: {
        root: {
          '&.filter-card': {
            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%) !important',
            border: '1px solid #475569',
            '& .filter-container': {
              backgroundColor: 'rgba(30, 41, 59, 0.7)',
            },
          },
        },
      },
    },
    // Estilos para CardContent en modo oscuro - SOLO PARA FILTROS
    MuiCardContent: {
      styleOverrides: {
        root: {
          '&.filter-card .MuiCardContent-root': {
            backgroundColor: 'transparent',
          },
        },
      },
    },
  },
});

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');

  // Cargar tema desde localStorage al inicializar
  useEffect(() => {
    const savedTheme = localStorage.getItem('themeMode') as ThemeMode;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      setThemeMode(savedTheme);
    }
  }, []);

  // Guardar tema en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const theme = themeMode === 'light' ? lightTheme : darkTheme;

  const value: ThemeContextType = {
    themeMode,
    toggleTheme,
    theme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 