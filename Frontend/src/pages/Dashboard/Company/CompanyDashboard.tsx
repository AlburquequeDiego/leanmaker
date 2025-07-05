import { useState } from 'react';
import { Box, Paper, Typography, useTheme, CircularProgress } from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import GradeIcon from '@mui/icons-material/Grade';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EventIcon from '@mui/icons-material/Event';
import HistoryIcon from '@mui/icons-material/History';
import FolderIcon from '@mui/icons-material/Folder';
import { UserTutorial } from '../../../components/common/UserTutorial';
import { ConnectionStatus } from '../../../components/common/ConnectionStatus';
import { useDashboardStats } from '../../../hooks/useRealTimeData';

export const CompanyDashboard = () => {
  const theme = useTheme();
  // Estado para mostrar el tutorial (se puede controlar con localStorage para mostrar solo la primera vez)
  const [showTutorial, setShowTutorial] = useState(true);
  
  // Usar hook de tiempo real para estadísticas
  const { data: stats, loading, error, lastUpdate, refresh, isPolling } = useDashboardStats('company');

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 1, sm: 3 }, bgcolor: 'grey.100', minHeight: '100vh' }}>
      {/* Tutorial para usuarios nuevos */}
      {showTutorial && (
        <UserTutorial 
          userRole="company" 
          onClose={() => setShowTutorial(false)} 
        />
      )}

      {/* Header con título y estado de conexión */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" gutterBottom fontWeight={700}>
          Dashboard de Empresa
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
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        {/* Proyectos Activos */}
        <Paper
          sx={{
            flex: { xs: '1 1 100%', sm: '1 1 calc(33.333% - 24px)' },
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            minWidth: 220,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            borderRadius: 3,
            boxShadow: 3,
            transition: 'transform 0.15s',
            '&:hover': { transform: 'translateY(-4px) scale(1.03)', boxShadow: 6 },
          }}
        >
          <WorkIcon sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Proyectos Activos
          </Typography>
          <Typography variant="h3" fontWeight={700} lineHeight={1.1}>{stats?.active_projects || 0}</Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Proyectos en desarrollo
          </Typography>
        </Paper>

        {/* Postulantes */}
        <Paper
          sx={{
            flex: { xs: '1 1 100%', sm: '1 1 calc(33.333% - 24px)' },
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            minWidth: 220,
            bgcolor: theme.palette.secondary.main,
            color: theme.palette.secondary.contrastText,
            borderRadius: 3,
            boxShadow: 3,
            transition: 'transform 0.15s',
            '&:hover': { transform: 'translateY(-4px) scale(1.03)', boxShadow: 6 },
          }}
        >
          <GroupAddIcon sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Postulantes
          </Typography>
          <Typography variant="h3" fontWeight={700} lineHeight={1.1}>{stats?.pending_applications || 0}</Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Nuevas solicitudes pendientes
          </Typography>
        </Paper>

        {/* Estudiantes Activos */}
        <Paper
          sx={{
            flex: { xs: '1 1 100%', sm: '1 1 calc(33.333% - 24px)' },
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            minWidth: 220,
            bgcolor: 'success.main',
            color: 'success.contrastText',
            borderRadius: 3,
            boxShadow: 3,
            transition: 'transform 0.15s',
            '&:hover': { transform: 'translateY(-4px) scale(1.03)', boxShadow: 6 },
          }}
        >
          <SchoolIcon sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Estudiantes Activos
          </Typography>
          <Typography variant="h3" fontWeight={700} lineHeight={1.1}>{stats?.active_students || 0}</Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Participando en proyectos
          </Typography>
        </Paper>

        {/* Proyectos Publicados */}
        <Paper
          sx={{
            flex: { xs: '1 1 100%', sm: '1 1 calc(33.333% - 24px)' },
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            minWidth: 220,
            bgcolor: 'info.main',
            color: 'info.contrastText',
            borderRadius: 3,
            boxShadow: 3,
            transition: 'transform 0.15s',
            '&:hover': { transform: 'translateY(-4px) scale(1.03)', boxShadow: 6 },
          }}
        >
          <FolderIcon sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Proyectos Publicados
          </Typography>
          <Typography variant="h3" fontWeight={700} lineHeight={1.1}>{stats?.published_projects || 0}</Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Disponibles para estudiantes
          </Typography>
        </Paper>

        {/* Proyectos Completados */}
        <Paper
          sx={{
            flex: { xs: '1 1 100%', sm: '1 1 calc(33.333% - 24px)' },
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            minWidth: 220,
            bgcolor: 'success.main',
            color: 'success.contrastText',
            borderRadius: 3,
            boxShadow: 3,
            transition: 'transform 0.15s',
            '&:hover': { transform: 'translateY(-4px) scale(1.03)', boxShadow: 6 },
          }}
        >
          <HistoryIcon sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Proyectos Completados
          </Typography>
          <Typography variant="h3" fontWeight={700} lineHeight={1.1}>{stats?.projects_completed || 0}</Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Finalizados exitosamente
          </Typography>
        </Paper>

        {/* Total de Proyectos */}
        <Paper
          sx={{
            flex: { xs: '1 1 100%', sm: '1 1 calc(33.333% - 24px)' },
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            minWidth: 220,
            bgcolor: 'warning.main',
            color: 'warning.contrastText',
            borderRadius: 3,
            boxShadow: 3,
            transition: 'transform 0.15s',
            '&:hover': { transform: 'translateY(-4px) scale(1.03)', boxShadow: 6 },
          }}
        >
          <TrendingUpIcon sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Total de Proyectos
          </Typography>
          <Typography variant="h3" fontWeight={700} lineHeight={1.1}>{stats?.total_projects || 0}</Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Todos los proyectos creados
          </Typography>
        </Paper>

        {/* Aplicaciones Aceptadas */}
        <Paper
          sx={{
            flex: { xs: '1 1 100%', sm: '1 1 calc(33.333% - 24px)' },
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            minWidth: 220,
            bgcolor: 'success.main',
            color: 'success.contrastText',
            borderRadius: 3,
            boxShadow: 3,
            transition: 'transform 0.15s',
            '&:hover': { transform: 'translateY(-4px) scale(1.03)', boxShadow: 6 },
          }}
        >
          <AssignmentTurnedInIcon sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Aplicaciones Aceptadas
          </Typography>
          <Typography variant="h3" fontWeight={700} lineHeight={1.1}>{stats?.accepted_applications || 0}</Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Estudiantes aprobados
          </Typography>
        </Paper>

        {/* Rating de la Empresa */}
        <Paper
          sx={{
            flex: { xs: '1 1 100%', sm: '1 1 calc(33.333% - 24px)' },
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            minWidth: 220,
            bgcolor: 'purple.main',
            color: 'purple.contrastText',
            borderRadius: 3,
            boxShadow: 3,
            transition: 'transform 0.15s',
            '&:hover': { transform: 'translateY(-4px) scale(1.03)', boxShadow: 6 },
          }}
        >
          <GradeIcon sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Rating de la Empresa
          </Typography>
          <Typography variant="h3" fontWeight={700} lineHeight={1.1}>{stats?.rating?.toFixed(1) || '0.0'}</Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Calificación promedio
          </Typography>
        </Paper>

        {/* Horas Ofrecidas */}
        <Paper
          sx={{
            flex: { xs: '1 1 100%', sm: '1 1 calc(33.333% - 24px)' },
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            minWidth: 220,
            bgcolor: 'info.main',
            color: 'info.contrastText',
            borderRadius: 3,
            boxShadow: 3,
            transition: 'transform 0.15s',
            '&:hover': { transform: 'translateY(-4px) scale(1.03)', boxShadow: 6 },
          }}
        >
          <EventIcon sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Horas Ofrecidas
          </Typography>
          <Typography variant="h3" fontWeight={700} lineHeight={1.1}>{stats?.total_hours_offered || 0}</Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Total de horas ofrecidas
          </Typography>
        </Paper>
      </Box>
      )}
    </Box>
  );
};

export default CompanyDashboard;
