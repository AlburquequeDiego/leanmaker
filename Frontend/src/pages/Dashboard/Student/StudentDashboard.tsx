import { Box, Paper, Typography } from '@mui/material';
import { 
  AccessTime as AccessTimeIcon, 
  WarningAmber as WarningAmberIcon,
  Grade as GradeIcon 
} from '@mui/icons-material';

export const StudentDashboard = () => {
  // Mock de horas acumuladas - esto vendría de la API
  const totalHours = 156;
  // Mock de strikes
  const strikes: number = 2;
  const maxStrikes = 3;
  const strikeBg = strikes === 3 ? 'error.main' : strikes === 2 ? 'orange' : 'warning.main';
  const strikeText = strikes === 3 ? '¡Has alcanzado el máximo de strikes!' : `Tienes ${strikes} de 3 strikes asignados por no entregar proyectos.`;
  // Mock del GPA actual
  const currentGPA = 4.2;

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 0.5, sm: 1, md: 2 }, pt: 0 }}>
      <Typography variant="h4" gutterBottom sx={{ mt: 0, mb: 1, fontWeight: 700 }}>
        Bienvenido a tu Dashboard
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: { xs: 'center', md: 'flex-start' }, mt: 0 }}>
        {/* Horas Acumuladas */}
        <Paper
          sx={{
            p: 2.5,
            flex: '1 1 260px',
            minWidth: 220,
            maxWidth: 340,
            display: 'flex',
            flexDirection: 'column',
            height: 120,
            bgcolor: 'info.light',
            color: 'info.contrastText',
            boxShadow: 2,
            borderRadius: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <AccessTimeIcon sx={{ mr: 1 }} />
            <Typography variant="subtitle1" fontWeight={600}>
              Horas Acumuladas
            </Typography>
          </Box>
          <Typography variant="h5">{totalHours}</Typography>
          <Typography variant="body2">
            Horas de experiencia en proyectos
          </Typography>
        </Paper>
        {/* GPA Actual */}
        <Paper
          sx={{
            p: 2.5,
            flex: '1 1 260px',
            minWidth: 220,
            maxWidth: 340,
            display: 'flex',
            flexDirection: 'column',
            height: 120,
            bgcolor: 'warning.light',
            color: 'warning.contrastText',
            boxShadow: 2,
            borderRadius: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <GradeIcon sx={{ mr: 1 }} />
            <Typography variant="subtitle1" fontWeight={600}>
              GPA Actual
            </Typography>
          </Box>
          <Typography variant="h5">{currentGPA}</Typography>
          <Typography variant="body2">
            Promedio académico actual
          </Typography>
        </Paper>
        {/* Resumen de Proyectos Disponibles */}
        <Paper
          sx={{
            p: 2.5,
            flex: '1 1 260px',
            minWidth: 220,
            maxWidth: 340,
            display: 'flex',
            flexDirection: 'column',
            height: 120,
            bgcolor: 'primary.light',
            color: 'primary.contrastText',
          }}
        >
          <Typography variant="h6" gutterBottom>
            Proyectos Disponibles
          </Typography>
          <Typography variant="h4">12</Typography>
          <Typography variant="body2">
            Nuevas oportunidades para ti
          </Typography>
        </Paper>
        {/* Resumen de Aplicaciones */}
        <Paper
          sx={{
            p: 2.5,
            flex: '1 1 260px',
            minWidth: 220,
            maxWidth: 340,
            display: 'flex',
            flexDirection: 'column',
            height: 120,
            bgcolor: 'secondary.light',
            color: 'secondary.contrastText',
          }}
        >
          <Typography variant="h6" gutterBottom>
            Mis Aplicaciones
          </Typography>
          <Typography variant="h4">3</Typography>
          <Typography variant="body2">
            Aplicaciones en proceso
          </Typography>
        </Paper>
        {/* Strikes */}
        <Paper
          sx={{
            p: 2.5,
            flex: '1 1 260px',
            minWidth: 220,
            maxWidth: 340,
            display: 'flex',
            flexDirection: 'column',
            height: 120,
            bgcolor: strikeBg,
            color: 'white',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <WarningAmberIcon sx={{ mr: 1 }} />
            <Typography variant="subtitle1" fontWeight={600}>Strikes</Typography>
          </Box>
          <Typography variant="h5">{strikes} / {maxStrikes}</Typography>
          <Typography variant="body2">{strikeText}</Typography>
        </Paper>
        {/* Resumen de Proyectos Activos */}
        <Paper
          sx={{
            p: 2.5,
            flex: '1 1 260px',
            minWidth: 220,
            maxWidth: 340,
            display: 'flex',
            flexDirection: 'column',
            height: 120,
            bgcolor: 'success.light',
            color: 'success.contrastText',
          }}
        >
          <Typography variant="h6" gutterBottom>
            Proyectos Activos
          </Typography>
          <Typography variant="h4">2</Typography>
          <Typography variant="body2">
            Proyectos en curso
          </Typography>
        </Paper>
        {/* Próximas Fechas */}
        <Paper sx={{ p: 2.5, flex: '1 1 260px', minWidth: 220, maxWidth: 340, height: 120 }}>
          <Typography variant="h6" gutterBottom>
            Próximas Fechas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No hay fechas próximas
          </Typography>
        </Paper>
        {/* Últimas Evaluaciones */}
        <Paper sx={{ p: 2.5, flex: '1 1 260px', minWidth: 220, maxWidth: 340, height: 120 }}>
          <Typography variant="h6" gutterBottom>
            Últimas Evaluaciones
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No hay evaluaciones recientes
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default StudentDashboard; 