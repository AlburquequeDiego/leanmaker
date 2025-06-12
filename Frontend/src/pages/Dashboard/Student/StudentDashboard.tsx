import { Box, Paper, Typography, LinearProgress } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BarChartIcon from '@mui/icons-material/BarChart';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

export default function StudentDashboard() {
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
    <Box sx={{ p: 3, bgcolor: '#f7fafd', minHeight: '100vh' }}>
      <Typography variant="h4" fontWeight={700} mb={3}>
        Bienvenido a tu Dashboard (Estudiante)
      </Typography>
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
            <TrendingUpIcon sx={{ fontSize: 32, mr: 1 }} />
            <Typography variant="h6" fontWeight={700}>Horas Acumuladas</Typography>
          </Box>
          <Typography variant="h4" fontWeight={700}>156</Typography>
          <Typography variant="body2">Horas de experiencia en proyectos</Typography>
        </Paper>
        <Paper sx={{ p: 2.5, minWidth: 220, flex: '1 1 260px', display: 'flex', flexDirection: 'column', bgcolor: '#ffa726', color: 'white', boxShadow: 2, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <BarChartIcon sx={{ fontSize: 32, mr: 1 }} />
            <Typography variant="h6" fontWeight={700}>GPA Actual</Typography>
          </Box>
          <Typography variant="h4" fontWeight={700}>4.2</Typography>
          <Typography variant="body2">Promedio académico actual</Typography>
        </Paper>
        <Paper sx={{ p: 2.5, minWidth: 220, flex: '1 1 260px', display: 'flex', flexDirection: 'column', bgcolor: '#42a5f5', color: 'white', boxShadow: 2, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700}>Proyectos Disponibles</Typography>
          <Typography variant="h4" fontWeight={700}>12</Typography>
          <Typography variant="body2">Nuevas oportunidades para ti</Typography>
        </Paper>
        <Paper sx={{ p: 2.5, minWidth: 220, flex: '1 1 260px', display: 'flex', flexDirection: 'column', bgcolor: '#ab47bc', color: 'white', boxShadow: 2, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700}>Mis Aplicaciones</Typography>
          <Typography variant="h4" fontWeight={700}>3</Typography>
          <Typography variant="body2">Aplicaciones en proceso</Typography>
        </Paper>
        <Paper sx={{ p: 2.5, minWidth: 220, flex: '1 1 260px', display: 'flex', flexDirection: 'column', bgcolor: '#ffb300', color: 'white', boxShadow: 2, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <WarningAmberIcon sx={{ fontSize: 32, mr: 1 }} />
            <Typography variant="h6" fontWeight={700}>Strikes</Typography>
          </Box>
          <Typography variant="h4" fontWeight={700}>2 / 3</Typography>
          <Typography variant="body2">Tienes 2 de 3 strikes asignados por no entregar proyectos.</Typography>
        </Paper>
        <Paper sx={{ p: 2.5, minWidth: 220, flex: '1 1 260px', display: 'flex', flexDirection: 'column', bgcolor: '#43a047', color: 'white', boxShadow: 2, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700}>Proyectos Activos</Typography>
          <Typography variant="h4" fontWeight={700}>2</Typography>
          <Typography variant="body2">Proyectos en curso</Typography>
        </Paper>
      </Box>

      {/* Sección de análisis y checklist profesional */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <Paper sx={{ flex: '1 1 340px', minWidth: 280, p: 3, bgcolor: 'white', boxShadow: 1, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Análisis de Actividad
          </Typography>
          <Box sx={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'grey.400' }}>
            [Gráfico de actividad aquí]
          </Box>
        </Paper>
        <Paper sx={{ flex: '1 1 340px', minWidth: 280, p: 3, bgcolor: 'white', boxShadow: 1, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Checklist de Proyectos
          </Typography>
          <Box>
            <Typography>Proyecto 1: <LinearProgress variant="determinate" value={80} sx={{ mb: 1 }} /></Typography>
            <Typography>Proyecto 2: <LinearProgress variant="determinate" value={50} sx={{ mb: 1 }} /></Typography>
            <Typography>Proyecto 3: <LinearProgress variant="determinate" value={100} sx={{ mb: 1 }} /></Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
} 