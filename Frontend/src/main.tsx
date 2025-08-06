import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from './contexts/ThemeContext';
import { ThemeWrapper } from './components/ThemeWrapper';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <ThemeWrapper>
        <CssBaseline />
        <App />
      </ThemeWrapper>
    </ThemeProvider>
  </React.StrictMode>
);
