import { Box, Typography, CircularProgress, Paper } from '@mui/material';
import { People as PeopleIcon, Business as BusinessIcon, School as SchoolIcon, Work as WorkIcon, Pending as PendingIcon } from '@mui/icons-material';
import { ConnectionStatus } from '../../../components/common/ConnectionStatus';
import { useDashboardStats } from '../../../hooks/useRealTimeData';
import { useAuth } from '../../../hooks/useAuth';

export default function AdminDashboard() {
  const { user } = useAuth();

  
  // Usar hook de tiempo real para estadísticas
  const { data: stats, loading, error, lastUpdate, isPolling } = useDashboardStats('admin');

  // Cálculos de KPIs usando datos reales
  const totalUsers = stats?.total_users || 0;
  const totalStudents = stats?.total_students || 0;
  const totalCompanies = stats?.total_companies || 0;
  const totalProjects = stats?.total_projects || 0;
  const pendingApplications = stats?.pending_applications || 0;
  const strikesAlerts = stats?.strikes_alerts || 0;

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
            {/* Usuarios - Azul */}
            <Paper sx={{ p: 2.5, minWidth: 220, flex: '1 1 260px', display: 'flex', flexDirection: 'column', bgcolor: '#42a5f5', color: 'white', boxShadow: 2, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PeopleIcon sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="h6" fontWeight={700}>Usuarios</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>{totalUsers}</Typography>
              <Typography variant="body2">Usuarios registrados</Typography>
            </Paper>
            
            {/* Empresas - Morado */}
            <Paper sx={{ p: 2.5, minWidth: 220, flex: '1 1 260px', display: 'flex', flexDirection: 'column', bgcolor: '#9c27b0', color: 'white', boxShadow: 2, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <BusinessIcon sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="h6" fontWeight={700}>Empresas</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>{totalCompanies}</Typography>
              <Typography variant="body2">Empresas activas</Typography>
            </Paper>
            
            {/* Estudiantes - Verde */}
            <Paper sx={{ p: 2.5, minWidth: 220, flex: '1 1 260px', display: 'flex', flexDirection: 'column', bgcolor: '#43a047', color: 'white', boxShadow: 2, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <SchoolIcon sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="h6" fontWeight={700}>Estudiantes</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>{totalStudents}</Typography>
              <Typography variant="body2">Estudiantes activos</Typography>
            </Paper>
            
            {/* Proyectos - Azul */}
            <Paper sx={{ p: 2.5, minWidth: 220, flex: '1 1 260px', display: 'flex', flexDirection: 'column', bgcolor: '#42a5f5', color: 'white', boxShadow: 2, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <WorkIcon sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="h6" fontWeight={700}>Proyectos</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>{totalProjects}</Typography>
              <Typography variant="body2">Proyectos activos</Typography>
            </Paper>
            
            {/* Postulaciones - Blanco */}
            <Paper sx={{ p: 2.5, minWidth: 220, flex: '1 1 260px', display: 'flex', flexDirection: 'column', bgcolor: '#ffffff', color: '#333333', boxShadow: 2, borderRadius: 3, border: '1px solid #e0e0e0' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PendingIcon sx={{ fontSize: 32, mr: 1, color: '#666666' }} />
                <Typography variant="h6" fontWeight={700} color="#333333">Postulaciones</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700} color="#333333">{pendingApplications}</Typography>
              <Typography variant="body2" color="#666666">Postulaciones realizadas</Typography>
            </Paper>
            
            {/* Alertas - Naranja */}
            <Paper sx={{ p: 2.5, minWidth: 220, flex: '1 1 260px', display: 'flex', flexDirection: 'column', bgcolor: '#ff9800', color: 'white', boxShadow: 2, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PendingIcon sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="h6" fontWeight={700}>Alertas</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>{strikesAlerts}</Typography>
              <Typography variant="body2">Alertas pendientes</Typography>
            </Paper>
          </Box>
        </>
      )}
    </Box>
  );
} 