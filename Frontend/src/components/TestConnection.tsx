import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Card, 
  CardContent, 
  Alert,
  CircularProgress,
  Grid,
  Divider
} from '@mui/material';
import { apiService } from '../services/api.service';
import { API_ENDPOINTS } from '../config/api.config';

export const TestConnection: React.FC = () => {
  const [results, setResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const testEndpoint = async (name: string, endpoint: string, method: 'GET' | 'POST' = 'GET', data?: any) => {
    setLoading(prev => ({ ...prev, [name]: true }));
    setError(null);
    
    try {
      let response;
      if (method === 'GET') {
        response = await apiService.get(endpoint);
      } else {
        response = await apiService.post(endpoint, data);
      }
      
      setResults(prev => ({ 
        ...prev, 
        [name]: { 
          success: true, 
          data: response,
          timestamp: new Date().toLocaleTimeString()
        } 
      }));
    } catch (err: any) {
      setResults(prev => ({ 
        ...prev, 
        [name]: { 
          success: false, 
          error: err.message,
          timestamp: new Date().toLocaleTimeString()
        } 
      }));
      setError(`Error en ${name}: ${err.message}`);
    } finally {
      setLoading(prev => ({ ...prev, [name]: false }));
    }
  };

  const testAllEndpoints = async () => {
    const tests = [
      { name: 'Health Check', endpoint: API_ENDPOINTS.HEALTH, method: 'GET' as const },
      { name: 'Login Endpoint', endpoint: API_ENDPOINTS.LOGIN, method: 'POST' as const, data: { email: 'test@test.com', password: 'test123' } },
      { name: 'Users List', endpoint: API_ENDPOINTS.USERS, method: 'GET' as const },
      { name: 'Projects List', endpoint: API_ENDPOINTS.PROJECTS, method: 'GET' as const },
      { name: 'Students List', endpoint: API_ENDPOINTS.STUDENTS, method: 'GET' as const },
      { name: 'Companies List', endpoint: API_ENDPOINTS.COMPANIES, method: 'GET' as const },
      { name: 'Areas List', endpoint: API_ENDPOINTS.AREAS, method: 'GET' as const },
      { name: 'TRL Levels', endpoint: API_ENDPOINTS.TRL_LEVELS, method: 'GET' as const },
      { name: 'Project Status', endpoint: API_ENDPOINTS.PROJECT_STATUS, method: 'GET' as const },
      { name: 'Notifications', endpoint: API_ENDPOINTS.NOTIFICATIONS, method: 'GET' as const },
    ];

    for (const test of tests) {
      await testEndpoint(test.name, test.endpoint, test.method, test.data);
      // Pequeña pausa entre requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const clearResults = () => {
    setResults({});
    setError(null);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Prueba de Conexión con Backend
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Esta página permite probar la conectividad con los diferentes endpoints del backend Django.
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Button 
          variant="contained" 
          onClick={testAllEndpoints}
          disabled={Object.values(loading).some(Boolean)}
          sx={{ mr: 2 }}
        >
          Probar Todos los Endpoints
        </Button>
        <Button 
          variant="outlined" 
          onClick={clearResults}
          disabled={Object.values(loading).some(Boolean)}
        >
          Limpiar Resultados
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        {Object.entries(results).map(([name, result]) => (
          <Grid item xs={12} md={6} key={name}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">{name}</Typography>
                  {loading[name] ? (
                    <CircularProgress size={20} />
                  ) : (
                    <Alert 
                      severity={result.success ? 'success' : 'error'} 
                      sx={{ py: 0, px: 1 }}
                    >
                      {result.success ? 'OK' : 'Error'}
                    </Alert>
                  )}
                </Box>
                
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  {result.timestamp}
                </Typography>
                
                <Divider sx={{ my: 1 }} />
                
                {result.success ? (
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                    {JSON.stringify(result.data, null, 2)}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="error">
                    {result.error}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {Object.keys(results).length === 0 && !Object.values(loading).some(Boolean) && (
        <Card>
          <CardContent>
            <Typography variant="body1" textAlign="center" color="text.secondary">
              Haz clic en "Probar Todos los Endpoints" para comenzar las pruebas de conectividad.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};