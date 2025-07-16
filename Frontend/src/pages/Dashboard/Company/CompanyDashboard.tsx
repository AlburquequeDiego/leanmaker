import { useEffect } from 'react';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import PeopleIcon from '@mui/icons-material/People';
import StarIcon from '@mui/icons-material/Star';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AssignmentIcon from '@mui/icons-material/Assignment';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useDashboardStats } from '../../../hooks/useRealTimeData';
import { useAuth } from '../../../hooks/useAuth';
import { ConnectionStatus } from '../../../components/common/ConnectionStatus';

export default function CompanyDashboard() {
  const { user } = useAuth();

  
  // Usar hook de tiempo real para estadísticas
  const { data: stats, loading, error, lastUpdate, isPolling } = useDashboardStats('company');

  // Detectar cambios en las estadísticas
  useEffect(() => {
    console.log('[CompanyDashboard] Stats changed:', stats);
    if (stats) {
      console.log('[CompanyDashboard] Stats received:', stats);

    }
  }, [stats]);

  // Log para debugging
  useEffect(() => {
    console.log('[CompanyDashboard] Component state:', {
      loading,
      error,
      hasStats: !!stats,
      stats,
      user: user?.email
    });
  }, [loading, error, stats, user]);

  // Cálculos de KPIs usando datos reales
  const totalProjects = stats?.total_projects || 0;
  const activeProjects = stats?.active_projects || 0;
  const completedProjects = stats?.completed_projects || 0;
  const pendingApplications = stats?.pending_applications || 0;
  const totalStudents = stats?.active_students || 0;
  const averageRating = stats?.rating || 0;
  const totalHours = stats?.total_hours_offered || 0;
  const projectsThisMonth = stats?.projects_this_month || 0;
  const applicationsThisMonth = stats?.applications_this_month || 0;

  return (
    <Box sx={{ p: 3, bgcolor: '#f7fafd', minHeight: '100vh' }}>
      {/* Header con título y estado de conexión */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" fontWeight={700}>
          Dashboard de Empresa
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ConnectionStatus
            isConnected={!error}
            isPolling={isPolling}
            lastUpdate={lastUpdate}
            error={error}
          />
        </Box>
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
                <BusinessIcon sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="h6" fontWeight={700}>Total de Proyectos</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>{totalProjects}</Typography>
              <Typography variant="body2">Proyectos creados en total</Typography>
            </Paper>
            <Paper sx={{ p: 2.5, minWidth: 220, flex: '1 1 260px', display: 'flex', flexDirection: 'column', bgcolor: '#43a047', color: 'white', boxShadow: 2, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PlayArrowIcon sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="h6" fontWeight={700}>Proyectos Activos</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>{activeProjects}</Typography>
              <Typography variant="body2">Proyectos en curso actualmente</Typography>
            </Paper>
            <Paper sx={{ p: 2.5, minWidth: 220, flex: '1 1 260px', display: 'flex', flexDirection: 'column', bgcolor: '#8bc34a', color: 'white', boxShadow: 2, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircleIcon sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="h6" fontWeight={700}>Proyectos Completados</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>{completedProjects}</Typography>
              <Typography variant="body2">Proyectos finalizados exitosamente</Typography>
            </Paper>
            <Paper sx={{ p: 2.5, minWidth: 220, flex: '1 1 260px', display: 'flex', flexDirection: 'column', bgcolor: '#ff9800', color: 'white', boxShadow: 2, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PendingIcon sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="h6" fontWeight={700}>Aplicaciones Pendientes</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>{pendingApplications}</Typography>
              <Typography variant="body2">Aplicaciones esperando revisión</Typography>
            </Paper>
            <Paper sx={{ p: 2.5, minWidth: 220, flex: '1 1 260px', display: 'flex', flexDirection: 'column', bgcolor: '#9c27b0', color: 'white', boxShadow: 2, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PeopleIcon sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="h6" fontWeight={700}>Estudiantes Participando</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>{totalStudents}</Typography>
              <Typography variant="body2">Estudiantes en proyectos activos</Typography>
            </Paper>
            <Paper sx={{ p: 2.5, minWidth: 220, flex: '1 1 260px', display: 'flex', flexDirection: 'column', bgcolor: '#ffb300', color: 'white', boxShadow: 2, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <StarIcon sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="h6" fontWeight={700}>Rating Promedio</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>{averageRating.toFixed(1)}</Typography>
              <Typography variant="body2">Calificación promedio de estudiantes</Typography>
            </Paper>
            <Paper sx={{ p: 2.5, minWidth: 220, flex: '1 1 260px', display: 'flex', flexDirection: 'column', bgcolor: '#42a5f5', color: 'white', boxShadow: 2, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccessTimeIcon sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="h6" fontWeight={700}>Horas Totales</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>{totalHours}</Typography>
              <Typography variant="body2">Horas acumuladas en proyectos</Typography>
            </Paper>
            <Paper sx={{ p: 2.5, minWidth: 220, flex: '1 1 260px', display: 'flex', flexDirection: 'column', bgcolor: '#ab47bc', color: 'white', boxShadow: 2, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CalendarMonthIcon sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="h6" fontWeight={700}>Proyectos Este Mes</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>{projectsThisMonth}</Typography>
              <Typography variant="body2">Nuevos proyectos este mes</Typography>
            </Paper>
            <Paper sx={{ p: 2.5, minWidth: 220, flex: '1 1 260px', display: 'flex', flexDirection: 'column', bgcolor: '#ffa726', color: 'white', boxShadow: 2, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AssignmentIcon sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="h6" fontWeight={700}>Aplicaciones Este Mes</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>{applicationsThisMonth}</Typography>
              <Typography variant="body2">Aplicaciones recibidas este mes</Typography>
            </Paper>
          </Box>
        </>
      )}
    </Box>
  );
}
