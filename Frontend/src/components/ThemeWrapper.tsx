import React from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeWrapperProps {
  children: React.ReactNode;
}

export const ThemeWrapper: React.FC<ThemeWrapperProps> = ({ children }) => {
  const { theme } = useTheme();

  return (
    <MuiThemeProvider theme={theme}>
      {children}
    </MuiThemeProvider>
  );
}; 