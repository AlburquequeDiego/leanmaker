import { useState } from 'react';
import { Box, Button, TextField, Typography, Alert, Paper } from '@mui/material';
import { apiService } from '../services/api.service';
import { API_ENDPOINTS } from '../config/api.config';

export const TestLogin = () => {
  const [email, setEmail] = useState('admin@leanmaker.cl');
  const [password, setPassword] = useState('Student123!');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Testing login with:', { email, password });
      console.log('Endpoint:', API_ENDPOINTS.LOGIN);
      
      const response = await apiService.post(API_ENDPOINTS.LOGIN, {
        email,
        password
      });
      
      console.log('Login response:', response);
      setResult(response);
    } catch (err: any) {
      console.error('Login test error:', err);
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Prueba de Login Directo
        </Typography>
        
        <TextField
          fullWidth
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mb: 2 }}
        />
        
        <TextField
          fullWidth
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mb: 2 }}
        />
        
        <Button
          variant="contained"
          onClick={testLogin}
          disabled={loading}
          sx={{ mb: 2 }}
        >
          {loading ? 'Probando...' : 'Probar Login'}
        </Button>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {result && (
          <Alert severity="success" sx={{ mb: 2 }}>
            ¡Login exitoso!
            <pre style={{ fontSize: '12px', marginTop: '8px' }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </Alert>
        )}

        <Typography variant="body2" color="text.secondary">
          Endpoint: {API_ENDPOINTS.LOGIN}
        </Typography>
      </Paper>
    </Box>
  );
}; 