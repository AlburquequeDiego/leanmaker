import React, { useState } from 'react';
import { Button, Box, Typography, Alert, CircularProgress } from '@mui/material';
import { apiService } from '../services/api.service';

const TestConnection: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');

  const testConnection = async () => {
    setStatus('loading');
    setMessage('');

    try {
      // Test basic connection to backend
      const response = await apiService.get('/api/health/');
      setStatus('success');
      setMessage('¡Conexión exitosa con el backend!');
      console.log('Backend response:', response);
    } catch (error: any) {
      setStatus('error');
      setMessage(
        error.response?.data?.message || 
        error.message || 
        'Error al conectar con el backend'
      );
      console.error('Connection error:', error);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 400, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Test de Conexión Frontend-Backend
      </Typography>
      
      <Button
        variant="contained"
        onClick={testConnection}
        disabled={status === 'loading'}
        fullWidth
        sx={{ mb: 2 }}
      >
        {status === 'loading' ? (
          <>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            Probando conexión...
          </>
        ) : (
          'Probar Conexión'
        )}
      </Button>

      {status === 'success' && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      {status === 'error' && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      <Typography variant="body2" color="text.secondary">
        Este componente prueba la conexión entre el frontend (React) y el backend (Django).
      </Typography>
    </Box>
  );
};

export default TestConnection;