import { Box, Paper, Typography } from '@mui/material';
import { AccessTime as AccessTimeIcon, WarningAmber as WarningAmberIcon } from '@mui/icons-material';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';

export const StudentDashboard = () => {
  // Mock de horas acumuladas - esto vendría de la API
  const totalHours = 156;
  // Mock de strikes
  const strikes: number = 2;
  const maxStrikes = 3;
  const strikeBg = strikes === 3 ? 'error.main' : strikes === 2 ? 'orange' : 'warning.main';
  const strikeText = strikes === 3 ? '¡Has alcanzado el máximo de strikes!' : `Tienes ${strikes} de 3 strikes asignados por no entregar proyectos.`;

  return (
    <DashboardLayout userRole="student">
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Bienvenido a tu Dashboard
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {/* Horas Acumuladas */}
          <Paper
            sx={{
              p: 3,
              flex: '1 1 300px',
              minWidth: 250,
              maxWidth: 400,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: 'info.light',
              color: 'info.contrastText',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AccessTimeIcon sx={{ mr: 1 }} />
              <Typography variant="h6">
                Horas Acumuladas
              </Typography>
            </Box>
            <Typography variant="h4">{totalHours}</Typography>
            <Typography variant="body2">
              Horas de experiencia en proyectos
            </Typography>
          </Paper>
          {/* Resumen de Proyectos Disponibles */}
          <Paper
            sx={{
              p: 3,
              flex: '1 1 300px',
              minWidth: 250,
              maxWidth: 400,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
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
              p: 3,
              flex: '1 1 300px',
              minWidth: 250,
              maxWidth: 400,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
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
              p: 3,
              flex: '1 1 300px',
              minWidth: 250,
              maxWidth: 400,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: strikeBg,
              color: 'white',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <WarningAmberIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Strikes</Typography>
            </Box>
            <Typography variant="h4">{strikes} / {maxStrikes}</Typography>
            <Typography variant="body2">{strikeText}</Typography>
          </Paper>
          {/* Resumen de Proyectos Activos */}
          <Paper
            sx={{
              p: 3,
              flex: '1 1 300px',
              minWidth: 250,
              maxWidth: 400,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
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
          <Paper sx={{ p: 3, flex: '1 1 300px', minWidth: 250, maxWidth: 400, height: 140 }}>
            <Typography variant="h6" gutterBottom>
              Próximas Fechas
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No hay fechas próximas
            </Typography>
          </Paper>
          {/* Últimas Evaluaciones */}
          <Paper sx={{ p: 3, flex: '1 1 300px', minWidth: 250, maxWidth: 400, height: 140 }}>
            <Typography variant="h6" gutterBottom>
              Últimas Evaluaciones
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No hay evaluaciones recientes
            </Typography>
          </Paper>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default StudentDashboard; 