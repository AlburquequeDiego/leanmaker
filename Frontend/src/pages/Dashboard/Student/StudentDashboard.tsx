import { useEffect, useState } from 'react';
import { Box, Paper, Typography, CircularProgress, LinearProgress } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import { ConnectionStatus } from '../../../components/common/ConnectionStatus';
import { useDashboardStats } from '../../../hooks/useRealTimeData';
import { useAuth } from '../../../hooks/useAuth';
import { apiService } from '../../../services/api.service';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [hoursData, setHoursData] = useState<any>(null);
  const [hoursLoading, setHoursLoading] = useState(true);
  const [hoursError, setHoursError] = useState<string | null>(null);
  
  // Usar hook de tiempo real para estadísticas
  const { data: stats, loading, error, lastUpdate } = useDashboardStats('student');

  // Cargar datos de horas del estudiante
  useEffect(() => {
    const loadHoursData = async () => {
      try {
        setHoursLoading(true);
        setHoursError(null);
        const response = await apiService.get('/api/work-hours/student-summary/');
        if (response.success) {
          setHoursData(response.data);
        }
      } catch (err) {
        console.error('Error loading hours data:', err);
        setHoursError('Error al cargar datos de horas');
      } finally {
        setHoursLoading(false);
      }
    };

    loadHoursData();
  }, []);

  // Detectar cambios en las estadísticas
  useEffect(() => {
    if (stats) {
      console.log('[StudentDashboard] Stats received:', stats);
    }
  }, [stats]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error" gutterBottom>
          Error al cargar estadísticas
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard del Estudiante
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Bienvenido, {user?.first_name || user?.email}
          </Typography>
      </Box>
      
      {/* Estado de conexión */}
      <Box sx={{ mb: 3 }}>
        <ConnectionStatus />
        </Box>

      {/* Estadísticas */}
      {stats && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Resumen de Actividad
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Paper sx={{ p: 2, minWidth: 200, flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h6">{stats.total_projects || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Proyectos Totales
        </Typography>
                </Box>
              </Box>
            </Paper>
            
            <Paper sx={{ p: 2, minWidth: 200, flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SchoolIcon sx={{ mr: 1, color: 'success.main' }} />
                <Box>
                  <Typography variant="h6">{stats.active_projects || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Proyectos Activos
                  </Typography>
                </Box>
              </Box>
            </Paper>
            
            <Paper sx={{ p: 2, minWidth: 200, flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SchoolIcon sx={{ mr: 1, color: 'info.main' }} />
                <Box>
                  <Typography variant="h6">{stats.total_applications || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Aplicaciones
                  </Typography>
                </Box>
              </Box>
            </Paper>
            
            <Paper sx={{ p: 2, minWidth: 200, flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SchoolIcon sx={{ mr: 1, color: 'warning.main' }} />
                <Box>
                  <Typography variant="h6">{stats.pending_applications || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pendientes
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Box>
      )}

      {/* Horas Acumuladas */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Horas Acumuladas
        </Typography>
        {hoursLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : hoursError ? (
          <Paper sx={{ p: 2, bgcolor: 'error.light' }}>
            <Typography color="error">{hoursError}</Typography>
          </Paper>
        ) : hoursData ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Paper sx={{ p: 2, minWidth: 200, flex: 1, bgcolor: 'primary.light', color: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccessTimeIcon sx={{ mr: 1, fontSize: 32 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {hoursData.total_hours || 0}h
                  </Typography>
                  <Typography variant="body2">
                    Horas Totales
                  </Typography>
                </Box>
              </Box>
            </Paper>
            
            <Paper sx={{ p: 2, minWidth: 200, flex: 1, bgcolor: 'success.light', color: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircleIcon sx={{ mr: 1, fontSize: 32 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {hoursData.approved_hours || 0}h
                  </Typography>
                  <Typography variant="body2">
                    Horas Aprobadas
                  </Typography>
                </Box>
              </Box>
            </Paper>
            
            <Paper sx={{ p: 2, minWidth: 200, flex: 1, bgcolor: 'warning.light', color: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PendingIcon sx={{ mr: 1, fontSize: 32 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {hoursData.pending_hours || 0}h
                  </Typography>
                  <Typography variant="body2">
                    Horas Pendientes
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        ) : (
          <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
            <Typography color="text.secondary">No hay datos de horas disponibles</Typography>
          </Paper>
        )}
      </Box>

      {/* Información adicional */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Información del Sistema
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Última actualización: {lastUpdate ? new Date(lastUpdate).toLocaleString() : 'N/A'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Estado de la conexión: Conectado
        </Typography>
      </Paper>
    </Box>
  );
} 