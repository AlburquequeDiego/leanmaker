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
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SchoolIcon from '@mui/icons-material/School';
import { useDashboardStats } from '../../../hooks/useRealTimeData';
import { useAuth } from '../../../hooks/useAuth';
import { ConnectionStatus } from '../../../components/common/ConnectionStatus';

export default function CompanyDashboard() {
  const { user } = useAuth();

  // Usar hook de tiempo real para estadísticas
  const { data: stats, loading, error, lastUpdate, isPolling } = useDashboardStats('company');

  // Obtener el nombre del usuario para personalizar el dashboard
  const getUserDisplayName = () => {
    if (user?.full_name) {
      return user.full_name;
    }
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user?.first_name) {
      return user.first_name;
    }
    return 'Empresa';
  };

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

  // KPIs usando datos reales
  const activeProjects = stats?.active_projects || 0;
  const completedProjects = stats?.completed_projects || 0;
  const totalProjects = stats?.total_projects || 0;
  const pendingApplications = stats?.pending_applications || 0;
  const totalApplications = stats?.total_applications || 0;
  const activeStudents = stats?.active_students || 0;
  const averageRating = stats?.rating || 0;
  const successRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;

  return (
    <Box sx={{ p: 3, bgcolor: '#f7fafd', minHeight: '100vh' }}>
      {/* Header con título y estado de conexión */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" fontWeight={700}>
          Dashboard de Empresa - {getUserDisplayName()}
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
      {/* KPIs principales: 8 tarjetas */}
      {!loading && !error && (
        <Box sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 3,
          mb: 4,
          justifyContent: { xs: 'center', md: 'flex-start' }
        }}>
          {/* Proyectos Activos */}
          <Paper sx={{ p: 2.5, minWidth: 220, flex: '1 1 260px', display: 'flex', flexDirection: 'column', bgcolor: '#1976d2', color: 'white', boxShadow: 2, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AssignmentIcon sx={{ fontSize: 32, mr: 1 }} />
              <Typography variant="h6" fontWeight={700}>Proyectos Activos</Typography>
            </Box>
            <Typography variant="h4" fontWeight={700}>{activeProjects}</Typography>
            <Typography variant="body2">Proyectos en desarrollo</Typography>
          </Paper>
          {/* Proyectos Completados */}
          <Paper sx={{ p: 2.5, minWidth: 220, flex: '1 1 260px', display: 'flex', flexDirection: 'column', bgcolor: '#388e3c', color: 'white', boxShadow: 2, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CheckCircleIcon sx={{ fontSize: 32, mr: 1 }} />
              <Typography variant="h6" fontWeight={700}>Proyectos Completados</Typography>
            </Box>
            <Typography variant="h4" fontWeight={700}>{completedProjects}</Typography>
            <Typography variant="body2">Proyectos finalizados exitosamente</Typography>
          </Paper>
          {/* Proyectos Creados (Total) */}
          <Paper sx={{ p: 2.5, minWidth: 220, flex: '1 1 260px', display: 'flex', flexDirection: 'column', bgcolor: '#42a5f5', color: 'white', boxShadow: 2, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <BusinessIcon sx={{ fontSize: 32, mr: 1 }} />
              <Typography variant="h6" fontWeight={700}>Proyectos Creados</Typography>
            </Box>
            <Typography variant="h4" fontWeight={700}>{totalProjects}</Typography>
            <Typography variant="body2">Proyectos creados en total</Typography>
          </Paper>
          {/* Postulantes Pendientes */}
          <Paper sx={{ p: 2.5, minWidth: 220, flex: '1 1 260px', display: 'flex', flexDirection: 'column', bgcolor: '#8e24aa', color: 'white', boxShadow: 2, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PeopleIcon sx={{ fontSize: 32, mr: 1 }} />
              <Typography variant="h6" fontWeight={700}>Postulantes Pendientes</Typography>
            </Box>
            <Typography variant="h4" fontWeight={700}>{pendingApplications}</Typography>
            <Typography variant="body2">Nuevas solicitudes pendientes</Typography>
          </Paper>
          {/* Solicitudes Totales */}
          <Paper sx={{ p: 2.5, minWidth: 220, flex: '1 1 260px', display: 'flex', flexDirection: 'column', bgcolor: '#fb8c00', color: 'white', boxShadow: 2, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AssignmentTurnedInIcon sx={{ fontSize: 32, mr: 1 }} />
              <Typography variant="h6" fontWeight={700}>Solicitudes Totales</Typography>
            </Box>
            <Typography variant="h4" fontWeight={700}>{totalApplications}</Typography>
            <Typography variant="body2">Solicitudes recibidas en total</Typography>
          </Paper>
          {/* Estudiantes Activos */}
          <Paper sx={{ p: 2.5, minWidth: 220, flex: '1 1 260px', display: 'flex', flexDirection: 'column', bgcolor: '#388e3c', color: 'white', boxShadow: 2, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <SchoolIcon sx={{ fontSize: 32, mr: 1 }} />
              <Typography variant="h6" fontWeight={700}>Estudiantes Activos</Typography>
            </Box>
            <Typography variant="h4" fontWeight={700}>{activeStudents}</Typography>
            <Typography variant="body2">Participando en proyectos</Typography>
          </Paper>
          {/* GPA Empresa */}
          <Paper sx={{ p: 2.5, minWidth: 220, flex: '1 1 260px', display: 'flex', flexDirection: 'column', bgcolor: '#1976d2', color: 'white', boxShadow: 2, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <StarIcon sx={{ fontSize: 32, mr: 1 }} />
              <Typography variant="h6" fontWeight={700}>GPA Empresa</Typography>
            </Box>
            <Typography variant="h4" fontWeight={700}>{averageRating && averageRating > 0 ? averageRating : 'Sin calificaciones'}</Typography>
            <Typography variant="body2">Calificación promedio</Typography>
          </Paper>
          {/* Tasa de Éxito */}
          <Paper sx={{ p: 2.5, minWidth: 220, flex: '1 1 260px', display: 'flex', flexDirection: 'column', bgcolor: '#388e3c', color: 'white', boxShadow: 2, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TrendingUpIcon sx={{ fontSize: 32, mr: 1 }} />
              <Typography variant="h6" fontWeight={700}>Tasa de Éxito</Typography>
            </Box>
            <Typography variant="h4" fontWeight={700}>{successRate}%</Typography>
            <Typography variant="body2">Proyectos completados</Typography>
          </Paper>
        </Box>
      )}
    </Box>
  );
}
