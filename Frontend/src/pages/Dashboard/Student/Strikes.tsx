import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  Avatar,
  Button,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useApi } from '../../../hooks/useApi';
import { adaptStrike } from '../../../utils/adapters';
import type { Strike } from '../../../types';

export const StudentStrikes: React.FC = () => {
  const api = useApi();
  const [strikes, setStrikes] = useState<Strike[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStrikes();
  }, []);

  const loadStrikes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/api/strikes/');
      const adaptedStrikes = (response.data.results || response.data).map(adaptStrike);
      setStrikes(adaptedStrikes);
      
    } catch (err: any) {
      console.error('Error cargando strikes:', err);
      setError(err.response?.data?.error || 'Error al cargar strikes');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'high': return 'Alto';
      case 'medium': return 'Medio';
      case 'low': return 'Bajo';
      default: return severity;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button onClick={loadStrikes} variant="contained">
          Reintentar
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Mis Strikes
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Historial de amonestaciones recibidas
        </Typography>
      </Box>

      {/* Resumen */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'warning.light' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <WarningIcon color="warning" sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h6" gutterBottom>
              Total de Strikes: {strikes.length}/3
            </Typography>
            <Typography variant="body2">
              {strikes.length === 0 && 'No tienes strikes registrados. ¡Mantén el buen trabajo!'}
              {strikes.length === 1 && 'Tienes 1 strike. Ten cuidado para evitar más amonestaciones.'}
              {strikes.length === 2 && 'Tienes 2 strikes. Un strike más puede tener consecuencias.'}
              {strikes.length >= 3 && 'Tienes el máximo de strikes permitidos. Contacta a un administrador.'}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Lista de Strikes */}
      {strikes.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No tienes strikes registrados
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ¡Excelente trabajo! Mantén este nivel de desempeño.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {strikes.map((strike) => (
            <Grid item xs={12} md={6} key={strike.id}>
              <Card variant="outlined" sx={{ borderColor: 'warning.main' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ bgcolor: 'warning.main', width: 32, height: 32 }}>
                        <WarningIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6">
                          {strike.company_name || 'Empresa'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {strike.project_title || 'Proyecto'}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={getSeverityText(strike.severity)}
                      color={getSeverityColor(strike.severity) as any}
                      size="small"
                    />
                  </Box>

                  <Typography variant="body1" gutterBottom>
                    <strong>Motivo:</strong> {strike.reason}
                  </Typography>

                  {strike.description && (
                    <Typography variant="body2" color="text.secondary" paragraph>
                      <strong>Descripción:</strong> {strike.description}
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Emitido: {new Date(strike.issued_at).toLocaleDateString()}
                    </Typography>
                    <Chip
                      label={strike.is_active ? 'Activo' : 'Resuelto'}
                      color={strike.is_active ? 'warning' : 'success'}
                      size="small"
                      variant="outlined"
                    />
                  </Box>

                  {strike.expires_at && (
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                      Expira: {new Date(strike.expires_at).toLocaleDateString()}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default StudentStrikes; 