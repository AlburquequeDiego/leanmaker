import { Box, Typography, CircularProgress, Paper } from '@mui/material';
import { People as PeopleIcon, Business as BusinessIcon, School as SchoolIcon, HowToReg as HowToRegIcon, Work as WorkIcon, PlayArrow as PlayArrowIcon, CheckCircle as CheckCircleIcon, AccessTime as AccessTimeIcon, Star as StarIcon, PersonAdd as PersonAddIcon, CalendarMonth as CalendarMonthIcon, Pending as PendingIcon } from '@mui/icons-material';
import { ConnectionStatus } from '../../../components/common/ConnectionStatus';
import { useDashboardStats } from '../../../hooks/useRealTimeData';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [showTutorial, setShowTutorial] = useState(true);
  const [previousStats, setPreviousStats] = useState<any>(null);
  
  // Usar hook de tiempo real para estadísticas
  const { data: stats, loading, error, lastUpdate, refresh, isPolling } = useDashboardStats('admin');

  // Detectar cambios en las estadísticas
  useEffect(() => {
    if (stats) {
      console.log('[AdminDashboard] Stats received:', stats);
      setPreviousStats(stats);
    }
  }, [stats]);

  // Log para debugging
  useEffect(() => {
    console.log('[AdminDashboard] Component state:', {
      loading,
      error,
      hasStats: !!stats,
      stats,
      user: user?.email
    });
  }, [loading, error, stats, user]);

  // Cálculos de KPIs usando datos reales
  const totalUsers = stats?.total_users || 0;
  const totalStudents = stats?.total_students || 0;
  const totalCompanies = stats?.total_companies || 0;
  const totalProjects = stats?.total_projects || 0;
  const activeProjects = stats?.active_projects || 0;
  const completedProjects = stats?.completed_projects || 0;
  const pendingApplications = stats?.pending_applications || 0;
  const totalHours = stats?.total_hours || 0;
  const averageRating = stats?.average_rating || 0;
  const newUsersThisMonth = stats?.new_users_this_month || 0;
  const projectsThisMonth = stats?.projects_this_month || 0;

  return (
    <Box sx={{ p: 3, bgcolor: '#f7fafd', minHeight: '100vh' }}>
      {/* Header con título y estado de conexión */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" fontWeight={700}>
          Dashboard de Administrador
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ConnectionStatus
            isConnected={!error}
            isPolling={isPolling}
            lastUpdate={lastUpdate}
            error={error}
          />
          {lastUpdate && (
            <Typography variant="caption" color="text.secondary">
              Última actualización: {lastUpdate.toLocaleTimeString()}
            </Typography>
          )}
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
                <PeopleIcon sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="h6" fontWeight={700}>Total de Usuarios</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>{totalUsers}</Typography>
              <Typography variant="body2">Usuarios registrados en el sistema</Typography>
            </Paper>
            <Paper sx={{ p: 2.5, minWidth: 220, flex: '1 1 260px', display: 'flex', flexDirection: 'column', bgcolor: '#43a047', color: 'white', boxShadow: 2, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <SchoolIcon sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="h6" fontWeight={700}>Estudiantes</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>{totalStudents}</Typography>
              <Typography variant="body2">Estudiantes registrados</Typography>
            </Paper>
            <Paper sx={{ p: 2.5, minWidth: 220, flex: '1 1 260px', display: 'flex', flexDirection: 'column', bgcolor: '#8bc34a', color: 'white', boxShadow: 2, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <BusinessIcon sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="h6" fontWeight={700}>Empresas</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>{totalCompanies}</Typography>
              <Typography variant="body2">Empresas registradas</Typography>
            </Paper>
            <Paper sx={{ p: 2.5, minWidth: 220, flex: '1 1 260px', display: 'flex', flexDirection: 'column', bgcolor: '#ff9800', color: 'white', boxShadow: 2, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <WorkIcon sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="h6" fontWeight={700}>Total de Proyectos</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>{totalProjects}</Typography>
              <Typography variant="body2">Proyectos creados en total</Typography>
            </Paper>
            <Paper sx={{ p: 2.5, minWidth: 220, flex: '1 1 260px', display: 'flex', flexDirection: 'column', bgcolor: '#9c27b0', color: 'white', boxShadow: 2, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PlayArrowIcon sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="h6" fontWeight={700}>Proyectos Activos</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>{activeProjects}</Typography>
              <Typography variant="body2">Proyectos en curso actualmente</Typography>
            </Paper>
            <Paper sx={{ p: 2.5, minWidth: 220, flex: '1 1 260px', display: 'flex', flexDirection: 'column', bgcolor: '#4caf50', color: 'white', boxShadow: 2, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircleIcon sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="h6" fontWeight={700}>Proyectos Completados</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>{completedProjects}</Typography>
              <Typography variant="body2">Proyectos finalizados exitosamente</Typography>
            </Paper>
            <Paper sx={{ p: 2.5, minWidth: 220, flex: '1 1 260px', display: 'flex', flexDirection: 'column', bgcolor: '#ffb300', color: 'white', boxShadow: 2, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PendingIcon sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="h6" fontWeight={700}>Aplicaciones Pendientes</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>{pendingApplications}</Typography>
              <Typography variant="body2">Aplicaciones esperando revisión</Typography>
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
                <StarIcon sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="h6" fontWeight={700}>Rating Promedio</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>{averageRating.toFixed(1)}</Typography>
              <Typography variant="body2">Calificación promedio del sistema</Typography>
            </Paper>
            <Paper sx={{ p: 2.5, minWidth: 220, flex: '1 1 260px', display: 'flex', flexDirection: 'column', bgcolor: '#ffa726', color: 'white', boxShadow: 2, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PersonAddIcon sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="h6" fontWeight={700}>Nuevos Usuarios</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>{newUsersThisMonth}</Typography>
              <Typography variant="body2">Usuarios registrados este mes</Typography>
            </Paper>
            <Paper sx={{ p: 2.5, minWidth: 220, flex: '1 1 260px', display: 'flex', flexDirection: 'column', bgcolor: '#26a69a', color: 'white', boxShadow: 2, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CalendarMonthIcon sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="h6" fontWeight={700}>Proyectos Este Mes</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>{projectsThisMonth}</Typography>
              <Typography variant="body2">Nuevos proyectos este mes</Typography>
            </Paper>
          </Box>
        </>
      )}
    </Box>
  );
} 