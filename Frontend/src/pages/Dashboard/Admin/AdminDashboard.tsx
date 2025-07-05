import { Box, Typography, CircularProgress } from '@mui/material';
import { People as PeopleIcon, Business as BusinessIcon, School as SchoolIcon, HowToReg as HowToRegIcon, Work as WorkIcon } from '@mui/icons-material';
import { ConnectionStatus } from '../../../components/common/ConnectionStatus';
import { useDashboardStats } from '../../../hooks/useRealTimeData';

export default function AdminDashboard() {
  // Usar hook de tiempo real para estadísticas
  const { data: stats, loading, error, lastUpdate, refresh, isPolling } = useDashboardStats('admin');

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4, mb: 4, px: 2 }}>
        {/* Header con título y estado de conexión */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4" align="center">
            Panel de Administración (Admin)
          </Typography>
          <ConnectionStatus
            isConnected={!error}
            isPolling={isPolling}
            lastUpdate={lastUpdate}
            error={error}
            onRefresh={refresh}
          />
        </Box>
        
        {loading && !stats ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
            <CircularProgress />
          </Box>
        ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4, justifyContent: { xs: 'center', md: 'flex-start' } }}>
          {/* Usuarios */}
          <Box sx={{ flex: '1 1 260px', minWidth: 220, bgcolor: 'primary.main', color: 'primary.contrastText', borderRadius: 3, boxShadow: 2, p: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PeopleIcon sx={{ fontSize: 32, mr: 1 }} />
              <Typography variant="h6" fontWeight={700}>Usuarios</Typography>
            </Box>
            <Typography variant="h3" fontWeight={700}>{stats?.total_users || 0}</Typography>
            <Typography variant="body2">Usuarios registrados</Typography>
          </Box>
          {/* Usuarios Activos */}
          <Box sx={{ flex: '1 1 260px', minWidth: 220, bgcolor: 'success.main', color: 'success.contrastText', borderRadius: 3, boxShadow: 2, p: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PeopleIcon sx={{ fontSize: 32, mr: 1 }} />
              <Typography variant="h6" fontWeight={700}>Usuarios Activos</Typography>
            </Box>
            <Typography variant="h3" fontWeight={700}>{stats?.active_users || 0}</Typography>
            <Typography variant="body2">Usuarios activos</Typography>
          </Box>
          {/* Empresas */}
          <Box sx={{ flex: '1 1 260px', minWidth: 220, bgcolor: 'secondary.main', color: 'secondary.contrastText', borderRadius: 3, boxShadow: 2, p: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <BusinessIcon sx={{ fontSize: 32, mr: 1 }} />
              <Typography variant="h6" fontWeight={700}>Empresas</Typography>
            </Box>
            <Typography variant="h3" fontWeight={700}>{stats?.companies || 0}</Typography>
            <Typography variant="body2">Empresas activas</Typography>
          </Box>
          {/* Estudiantes */}
          <Box sx={{ flex: '1 1 260px', minWidth: 220, bgcolor: 'success.main', color: 'success.contrastText', borderRadius: 3, boxShadow: 2, p: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <SchoolIcon sx={{ fontSize: 32, mr: 1 }} />
              <Typography variant="h6" fontWeight={700}>Estudiantes</Typography>
            </Box>
            <Typography variant="h3" fontWeight={700}>{stats?.students || 0}</Typography>
            <Typography variant="body2">Estudiantes activos</Typography>
          </Box>
          {/* Proyectos */}
          <Box sx={{ flex: '1 1 260px', minWidth: 220, bgcolor: 'info.main', color: 'info.contrastText', borderRadius: 3, boxShadow: 2, p: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <WorkIcon sx={{ fontSize: 32, mr: 1 }} />
              <Typography variant="h6" fontWeight={700}>Proyectos</Typography>
            </Box>
            <Typography variant="h3" fontWeight={700}>{stats?.total_projects || 0}</Typography>
            <Typography variant="body2">Proyectos totales</Typography>
          </Box>
          {/* Proyectos Activos */}
          <Box sx={{ flex: '1 1 260px', minWidth: 220, bgcolor: 'warning.main', color: 'warning.contrastText', borderRadius: 3, boxShadow: 2, p: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <WorkIcon sx={{ fontSize: 32, mr: 1 }} />
              <Typography variant="h6" fontWeight={700}>Proyectos Activos</Typography>
            </Box>
            <Typography variant="h3" fontWeight={700}>{stats?.active_projects || 0}</Typography>
            <Typography variant="body2">Proyectos en curso</Typography>
          </Box>
          {/* Postulaciones */}
          <Box sx={{ flex: '1 1 260px', minWidth: 220, bgcolor: 'purple.main', color: 'purple.contrastText', borderRadius: 3, boxShadow: 2, p: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <HowToRegIcon sx={{ fontSize: 32, mr: 1 }} />
              <Typography variant="h6" fontWeight={700}>Postulaciones</Typography>
            </Box>
            <Typography variant="h3" fontWeight={700}>{stats?.total_applications || 0}</Typography>
            <Typography variant="body2">Postulaciones realizadas</Typography>
          </Box>
          {/* Postulaciones Pendientes */}
          <Box sx={{ flex: '1 1 260px', minWidth: 220, bgcolor: 'error.main', color: 'error.contrastText', borderRadius: 3, boxShadow: 2, p: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <HowToRegIcon sx={{ fontSize: 32, mr: 1 }} />
              <Typography variant="h6" fontWeight={700}>Pendientes</Typography>
            </Box>
            <Typography variant="h3" fontWeight={700}>{stats?.pending_applications || 0}</Typography>
            <Typography variant="body2">Postulaciones pendientes</Typography>
          </Box>
        </Box>
        )}
      </Box>
    </Box>
  );
} 