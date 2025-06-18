import { Box, Paper, Typography, useTheme } from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import GradeIcon from '@mui/icons-material/Grade';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EventIcon from '@mui/icons-material/Event';
import HistoryIcon from '@mui/icons-material/History';
import FolderIcon from '@mui/icons-material/Folder';

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
          <Typography variant="h3" fontWeight={700} lineHeight={1.1}>5</Typography>
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
          <Typography variant="h3" fontWeight={700} lineHeight={1.1}>15</Typography>
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
          <Typography variant="h3" fontWeight={700} lineHeight={1.1}>8</Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Participando en proyectos
          </Typography>
        </Paper>

        {/* Evaluaciones Pendientes */}
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
          <AssignmentTurnedInIcon sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Evaluaciones Pendientes
          </Typography>
          <Typography variant="h3" fontWeight={700} lineHeight={1.1}>3</Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Por completar este mes
          </Typography>
        </Paper>

        {/* GPA Empresa */}
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
          <GradeIcon sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
          <Typography variant="h6" fontWeight={600} gutterBottom>
            GPA Empresa
          </Typography>
          <Typography variant="h3" fontWeight={700} lineHeight={1.1}>4.2</Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Calificación promedio
          </Typography>
        </Paper>

        {/* Tasa de Éxito */}
        <Paper
          sx={{
            flex: { xs: '1 1 100%', sm: '1 1 calc(33.333% - 24px)' },
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            minWidth: 220,
            bgcolor: 'success.dark',
            color: 'success.contrastText',
            borderRadius: 3,
            boxShadow: 3,
            transition: 'transform 0.15s',
            '&:hover': { transform: 'translateY(-4px) scale(1.03)', boxShadow: 6 },
          }}
        >
          <TrendingUpIcon sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Tasa de Éxito
          </Typography>
          <Typography variant="h3" fontWeight={700} lineHeight={1.1}>85%</Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Proyectos completados
          </Typography>
        </Paper>
      </Box>

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {/* Próximas Evaluaciones */}
        <Paper 
          sx={{ 
            flex: { xs: '1 1 100%', md: '1 1 calc(33.333% - 16px)' }, 
            p: 3, 
            borderRadius: 3,
            boxShadow: 1,
            height: '100%',
            minHeight: 400
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <EventIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" fontWeight={600}>
              Próximas Evaluaciones
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle1" fontWeight={600}>Juan Pérez - Proyecto A</Typography>
              <Typography variant="body2" color="text.secondary">Evaluación técnica</Typography>
              <Typography variant="body2" color="primary">Mañana a las 15:00</Typography>
            </Paper>
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle1" fontWeight={600}>María García - Proyecto B</Typography>
              <Typography variant="body2" color="text.secondary">Evaluación mensual</Typography>
              <Typography variant="body2" color="primary">23/03/2024 a las 10:00</Typography>
            </Paper>
          </Box>
        </Paper>

        {/* Últimas Actividades */}
        <Paper 
          sx={{ 
            flex: { xs: '1 1 100%', md: '1 1 calc(33.333% - 16px)' }, 
            p: 3, 
            borderRadius: 3,
            boxShadow: 1,
            height: '100%',
            minHeight: 400
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <HistoryIcon sx={{ mr: 1, color: 'secondary.main' }} />
            <Typography variant="h6" fontWeight={600}>
              Últimas Actividades
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle1" fontWeight={600}>Nueva postulación recibida</Typography>
              <Typography variant="body2" color="text.secondary">Proyecto: Desarrollo Web Frontend</Typography>
              <Typography variant="body2" color="text.secondary">Hace 2 horas</Typography>
            </Paper>
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle1" fontWeight={600}>Evaluación completada</Typography>
              <Typography variant="body2" color="text.secondary">Ana Martínez - Proyecto C</Typography>
              <Typography variant="body2" color="text.secondary">Hace 4 horas</Typography>
            </Paper>
          </Box>
        </Paper>

        {/* Proyectos Recientes */}
        <Paper 
          sx={{ 
            flex: { xs: '1 1 100%', md: '1 1 calc(33.333% - 16px)' }, 
            p: 3, 
            borderRadius: 3,
            boxShadow: 1,
            height: '100%',
            minHeight: 400
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FolderIcon sx={{ mr: 1, color: 'success.main' }} />
            <Typography variant="h6" fontWeight={600}>
              Proyectos Recientes
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle1" fontWeight={600}>Sistema de Gestión de Inventarios</Typography>
              <Typography variant="body2" color="text.secondary">3 estudiantes activos</Typography>
              <Typography variant="body2" color="success.main">En progreso</Typography>
            </Paper>
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle1" fontWeight={600}>App Móvil de Delivery</Typography>
              <Typography variant="body2" color="text.secondary">2 estudiantes activos</Typography>
              <Typography variant="body2" color="success.main">En progreso</Typography>
            </Paper>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default CompanyDashboard;
