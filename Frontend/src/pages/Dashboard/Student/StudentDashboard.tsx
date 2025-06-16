import { Box, Paper, Typography, LinearProgress, CircularProgress } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BarChartIcon from '@mui/icons-material/BarChart';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

// Datos de ejemplo: entregas y postulaciones por día
const actividad = [
  { dia: 'Lunes', entregas: 2, postulaciones: 1 },
  { dia: 'Martes', entregas: 1, postulaciones: 2 },
  { dia: 'Miércoles', entregas: 3, postulaciones: 1 },
  { dia: 'Jueves', entregas: 2, postulaciones: 2 },
  { dia: 'Viernes', entregas: 1, postulaciones: 3 },
  { dia: 'Sábado', entregas: 0, postulaciones: 1 },
  { dia: 'Domingo', entregas: 1, postulaciones: 0 },
];

const maxValor = Math.max(
  ...actividad.map(a => Math.max(a.entregas, a.postulaciones))
);

// Datos de ejemplo
const totalEntregas = 10;
const totalPostulaciones = 7;
const totalActividades = totalEntregas + totalPostulaciones;

const porcentajeEntregas = (totalEntregas / totalActividades) * 100;
const porcentajePostulaciones = (totalPostulaciones / totalActividades) * 100;

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
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 220 }}>
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              {/* Círculo de postulaciones (fondo) */}
              <CircularProgress
                variant="determinate"
                value={100}
                size={120}
                thickness={5}
                sx={{ color: '#e3eafc', position: 'absolute', left: 0 }}
              />
              {/* Círculo de entregas (progreso) */}
              <CircularProgress
                variant="determinate"
                value={porcentajeEntregas}
                size={120}
                thickness={5}
                sx={{ color: '#1976d2' }}
              />
              {/* Texto en el centro */}
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  width: '100%',
                  height: '100%',
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#1976d2' }}>
                  {Math.round(porcentajeEntregas)}%
                </Typography>
                <Typography variant="caption" sx={{ color: '#22345a' }}>
                  Entregas
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" sx={{ mt: 2, color: '#22345a' }}>
              {totalEntregas} entregas / {totalActividades} actividades
            </Typography>
          </Box>
        </Paper>
        <Paper sx={{ flex: '1 1 340px', minWidth: 280, p: 3, bgcolor: 'white', boxShadow: 1, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Checklist de Proyectos
          </Typography>
          {[
            { nombre: 'Proyecto Lean UX', avance: 80 },
            { nombre: 'App de Voluntariado', avance: 65 },
            { nombre: 'Rediseño Web ONG', avance: 50 },
            { nombre: 'Sistema de Inventario', avance: 35 },
            { nombre: 'Plataforma E-learning', avance: 20 },
          ].map((proy, idx, arr) => (
            <Box key={proy.nombre} sx={{ mb: idx < arr.length - 1 ? 3 : 0 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2' }}>
                  {proy.nombre}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2' }}>
                  {proy.avance}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={proy.avance}
                sx={{
                  height: 12,
                  borderRadius: 6,
                  background: '#e3eafc',
                  '& .MuiLinearProgress-bar': {
                    background: '#1976d2',
                    borderRadius: 6,
                  },
                }}
              />
            </Box>
          ))}
        </Paper>
      </Box>
    </Box>
  );
} 