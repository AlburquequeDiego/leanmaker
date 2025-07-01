import { useState } from 'react';
import { Box, Button, Typography, Alert, Paper } from '@mui/material';
import { apiService } from '../services/api.service';
import { API_ENDPOINTS } from '../config/api.config';

export const TestConnection = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const testConnection = async () => {
    setStatus('loading');
    setMessage('Probando conexión...');

    try {
      // Test health endpoint
      const healthResponse = await apiService.get(API_ENDPOINTS.HEALTH);
      console.log('Health check response:', healthResponse);
      
      setStatus('success');
      setMessage('¡Conexión exitosa! El backend Django está funcionando correctamente.');
    } catch (error: any) {
      console.error('Connection test error:', error);
      setStatus('error');
      
      // Manejar diferentes tipos de errores
      if (error.response) {
        // El servidor respondió con un código de estado de error
        setMessage(`Error del servidor: ${error.response.status} - ${error.response.data?.detail || error.response.statusText}`);
      } else if (error.request) {
        // La petición fue hecha pero no se recibió respuesta
        setMessage('No se pudo conectar con el servidor. Verifica que el backend esté corriendo en http://localhost:8000');
      } else {
        // Algo más causó el error
        setMessage(`Error de conexión: ${error.message || 'Error desconocido'}`);
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
        <Typography variant="h5" gutterBottom>
          Prueba de Conexión con Backend
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 2 }}>
          URL del Backend: {import.meta.env.VITE_API_URL || 'http://localhost:8000'}
        </Typography>

        <Button
          variant="contained"
          onClick={testConnection}
          disabled={status === 'loading'}
          sx={{ mb: 2 }}
        >
          {status === 'loading' ? 'Probando...' : 'Probar Conexión'}
        </Button>

        {status === 'success' && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {message}
          </Alert>
        )}

        {status === 'error' && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {message}
          </Alert>
        )}

        <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
          Esta prueba verifica la conectividad con el backend Django y valida que las APIs estén funcionando correctamente.
        </Typography>
      </Paper>
    </Box>
  );
};