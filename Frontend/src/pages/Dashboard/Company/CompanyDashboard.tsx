import { Box, Paper, Typography, useTheme } from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import HistoryIcon from '@mui/icons-material/History';

export const CompanyDashboard = () => {
  const theme = useTheme();
  return (
    <Box sx={{ flexGrow: 1, p: { xs: 1, sm: 3 }, bgcolor: 'grey.100', minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        Dashboard de Empresa
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        {/* Proyectos Activos */}
        <Paper
          sx={{
            flex: { xs: '1 1 100%', sm: '1 1 calc(25% - 18px)' },
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
          <Typography variant="h3" fontWeight={700} lineHeight={1.1}>5</Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Proyectos en desarrollo
          </Typography>
        </Paper>
        {/* Postulantes */}
        <Paper
          sx={{
            flex: { xs: '1 1 100%', sm: '1 1 calc(25% - 18px)' },
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
          <Typography variant="h3" fontWeight={700} lineHeight={1.1}>15</Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Nuevas solicitudes pendientes
          </Typography>
        </Paper>
        {/* Estudiantes Activos */}
        <Paper
          sx={{
            flex: { xs: '1 1 100%', sm: '1 1 calc(25% - 18px)' },
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
          <Typography variant="h3" fontWeight={700} lineHeight={1.1}>8</Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Participando en proyectos
          </Typography>
        </Paper>
        {/* Evaluaciones Pendientes */}
        <Paper
          sx={{
            flex: { xs: '1 1 100%', sm: '1 1 calc(25% - 18px)' },
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
          <AssignmentTurnedInIcon sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Evaluaciones Pendientes
          </Typography>
          <Typography variant="h3" fontWeight={700} lineHeight={1.1}>3</Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Por completar este mes
          </Typography>
        </Paper>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        {/* Próximas Evaluaciones */}
        <Paper sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' }, p: 3, height: 260, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderRadius: 3, boxShadow: 1 }}>
          <EventBusyIcon sx={{ fontSize: 38, color: 'grey.400', mb: 1 }} />
          <Typography variant="h6" gutterBottom fontWeight={600} align="center">
            Próximas Evaluaciones
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            No hay evaluaciones programadas
          </Typography>
        </Paper>
        {/* Últimas Actividades */}
        <Paper sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' }, p: 3, height: 260, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderRadius: 3, boxShadow: 1 }}>
          <HistoryIcon sx={{ fontSize: 38, color: 'grey.400', mb: 1 }} />
          <Typography variant="h6" gutterBottom fontWeight={600} align="center">
            Últimas Actividades
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            No hay actividades recientes
          </Typography>
        </Paper>
      </Box>

      {/* Proyectos Recientes */}
      <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 1, mt: 2 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          Proyectos Recientes
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No hay proyectos recientes
        </Typography>
      </Paper>
    </Box>
  );
};

export default CompanyDashboard;
