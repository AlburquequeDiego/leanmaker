import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import { TrendingUp as TrendingUpIcon, BarChart as BarChartIcon, WarningAmber as WarningAmberIcon } from '@mui/icons-material';
import { useDashboardStats } from '../../../hooks/useRealTimeData';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [showTutorial, setShowTutorial] = useState(true);
  const [previousStats, setPreviousStats] = useState<any>(null);
  
  // Usar hook de tiempo real para estadísticas
  const { data: stats, loading, error, lastUpdate, refresh, isPolling } = useDashboardStats('student');

  // Detectar cambios en las estadísticas
  useEffect(() => {
    if (stats) {
      console.log('[StudentDashboard] Stats received:', stats);
      setPreviousStats(stats);
    }
  }, [stats]);

  // Log para debugging
  useEffect(() => {
    console.log('[StudentDashboard] Component state:', {
      loading,
      error,
      hasStats: !!stats,
      stats,
      user: user?.email,
      userRole: user?.role
    });
  }, [loading, error, stats, user]);

  // Cálculos de KPIs usando datos reales
  const totalHours = stats?.total_hours || 0;
  const currentGPA = stats?.gpa || 0;
  const strikes = stats?.strikes || 0;
  const maxStrikes = 3;
  const proyectosDisponibles = stats?.available_projects || 0;
  const misAplicaciones = stats?.total_applications || 0;
  const proyectosActivos = stats?.active_projects || 0;
  const proyectosCompletados = stats?.completed_projects || 0;
  const aplicacionesPendientes = stats?.pending_applications || 0;
  const aplicacionesAceptadas = stats?.accepted_applications || 0;
  const rating = stats?.rating || 0;

  return (
    <Box sx={{ p: 3, bgcolor: '#f7fafd', minHeight: '100vh' }}>
      {/* Header con título */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" fontWeight={700}>
          Bienvenido a tu Dashboard (Estudiante)
        </Typography>
        {lastUpdate && (
          <Typography variant="caption" color="text.secondary">
            Última actualización: {lastUpdate.toLocaleTimeString()}
          </Typography>
        )}
      </Box>
      
      {/* Estado de carga */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error discreto */}
      {error && !loading && (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
          No se pudo cargar la información.
        </Typography>
      )}

      {/* Contenido solo si hay datos */}
      {!loading && !error && stats && (
        <>
          {/* KPIs principales */}
          <Box sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 3,
            mb: 4,
            justifyContent: { xs: 'center', md: 'flex-start' }
          }}>
            <Paper sx={{ p: 2.5, minWidth: 220, flex: '1 1 260px', display: 'flex', flexDirection: 'column', bgcolor: '#42a5f5', color: 'white', boxShadow: 2, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUpIcon sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="h6" fontWeight={700}>Horas Acumuladas</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>{totalHours}</Typography>
              <Typography variant="body2">Horas de experiencia en proyectos</Typography>
            </Paper>
            <Paper sx={{ p: 2.5, minWidth: 220, flex: '1 1 260px', display: 'flex', flexDirection: 'column', bgcolor: '#ffa726', color: 'white', boxShadow: 2, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <BarChartIcon sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="h6" fontWeight={700}>GPA Actual</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>{currentGPA.toFixed(2)}</Typography>
              <Typography variant="body2">Promedio académico actual</Typography>
            </Paper>
            <Paper sx={{ p: 2.5, minWidth: 220, flex: '1 1 260px', display: 'flex', flexDirection: 'column', bgcolor: '#42a5f5', color: 'white', boxShadow: 2, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={700}>Proyectos Disponibles</Typography>
              <Typography variant="h4" fontWeight={700}>{proyectosDisponibles}</Typography>
              <Typography variant="body2">Nuevas oportunidades para ti</Typography>
            </Paper>
            <Paper sx={{ p: 2.5, minWidth: 220, flex: '1 1 260px', display: 'flex', flexDirection: 'column', bgcolor: '#ab47bc', color: 'white', boxShadow: 2, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={700}>Mis Aplicaciones</Typography>
              <Typography variant="h4" fontWeight={700}>{misAplicaciones}</Typography>
              <Typography variant="body2">Aplicaciones en proceso</Typography>
            </Paper>
            <Paper sx={{ p: 2.5, minWidth: 220, flex: '1 1 260px', display: 'flex', flexDirection: 'column', bgcolor: '#ffb300', color: 'white', boxShadow: 2, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <WarningAmberIcon sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="h6" fontWeight={700}>Strikes</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>{strikes} / {maxStrikes}</Typography>
              <Typography variant="body2">Tienes {strikes} de 3 strikes asignados por no entregar proyectos.</Typography>
            </Paper>
            <Paper sx={{ p: 2.5, minWidth: 220, flex: '1 1 260px', display: 'flex', flexDirection: 'column', bgcolor: '#43a047', color: 'white', boxShadow: 2, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={700}>Proyectos Activos</Typography>
              <Typography variant="h4" fontWeight={700}>{proyectosActivos}</Typography>
              <Typography variant="body2">Proyectos en curso</Typography>
            </Paper>
            <Paper sx={{ p: 2.5, minWidth: 220, flex: '1 1 260px', display: 'flex', flexDirection: 'column', bgcolor: '#8bc34a', color: 'white', boxShadow: 2, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={700}>Proyectos Completados</Typography>
              <Typography variant="h4" fontWeight={700}>{proyectosCompletados}</Typography>
              <Typography variant="body2">Proyectos finalizados exitosamente</Typography>
            </Paper>
            <Paper sx={{ p: 2.5, minWidth: 220, flex: '1 1 260px', display: 'flex', flexDirection: 'column', bgcolor: '#ff9800', color: 'white', boxShadow: 2, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={700}>Aplicaciones Pendientes</Typography>
              <Typography variant="h4" fontWeight={700}>{aplicacionesPendientes}</Typography>
              <Typography variant="body2">Esperando respuesta de empresas</Typography>
            </Paper>
            <Paper sx={{ p: 2.5, minWidth: 220, flex: '1 1 260px', display: 'flex', flexDirection: 'column', bgcolor: '#4caf50', color: 'white', boxShadow: 2, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={700}>Aplicaciones Aceptadas</Typography>
              <Typography variant="h4" fontWeight={700}>{aplicacionesAceptadas}</Typography>
              <Typography variant="body2">Aplicaciones aprobadas</Typography>
            </Paper>
            <Paper sx={{ p: 2.5, minWidth: 220, flex: '1 1 260px', display: 'flex', flexDirection: 'column', bgcolor: '#9c27b0', color: 'white', boxShadow: 2, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={700}>Rating Promedio</Typography>
              <Typography variant="h4" fontWeight={700}>{rating.toFixed(1)}</Typography>
              <Typography variant="body2">Calificación promedio recibida</Typography>
            </Paper>
          </Box>
        </>
      )}
    </Box>
  );
} 