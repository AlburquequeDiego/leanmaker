import { useEffect } from 'react';
import { Box, Paper, Typography, LinearProgress } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import { useDashboardStats } from '../../../hooks/useRealTimeData';
import { useAuth } from '../../../hooks/useAuth';
import { ConnectionStatus } from '../../../components/common/ConnectionStatus';

// Componente gráfico circular simple (SVG)
function CircularProgressWithLabel({ value, label, subtitle }: { value: number, label: string, subtitle: string }) {
  const radius = 40;
  const stroke = 7;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const progress = Math.min(Math.max(value, 0), 100);
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 120 }}>
      <svg height={radius * 2} width={radius * 2}>
        <circle
          stroke="#e0e0e0"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="#1976d2"
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s' }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <text x="50%" y="50%" textAnchor="middle" dy="0.3em" fontSize="1.3em" fontWeight="bold" fill="#1976d2">
          {`${Math.round(progress)}%`}
        </text>
      </svg>
      <Typography variant="body2" sx={{ mt: 1 }}>{label}</Typography>
      <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
    </Box>
  );
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const { data: stats, loading, error, lastUpdate, isPolling } = useDashboardStats('student');

  // Simulación de datos para checklist de proyectos (reemplaza por tus datos reales si los tienes)
  const checklist = [
    { name: 'Proyecto Lean UX', progress: 80 },
    { name: 'App de Voluntariado', progress: 65 },
    { name: 'Rediseño Web ONG', progress: 50 },
    { name: 'Sistema de Inventario', progress: 35 },
    { name: 'Plataforma E-learning', progress: 20 },
  ];

  // Datos de ejemplo para strikes y GPA (ajusta según tu modelo real)
  const strikes = stats?.strikes ?? 0;
  const maxStrikes = 3;
  const gpa = stats?.gpa ?? 0;
  const totalHours = stats?.total_hours ?? 0;
  const totalProjects = stats?.total_projects ?? 0;
  const activeProjects = stats?.active_projects ?? 0;
  const totalApplications = stats?.total_applications ?? 0;
  const availableProjects = stats?.available_projects ?? 0;
  // Simulación de entregas (ajusta según tus datos reales)
  const entregas = stats?.deliveries ?? 10;
  const actividades = stats?.activities ?? 17;
  const porcentajeEntregas = actividades > 0 ? Math.round((entregas / actividades) * 100) : 0;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <HourglassBottomIcon sx={{ fontSize: 48, color: 'primary.main', mr: 2 }} />
        <Typography variant="h6">Cargando dashboard...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error" gutterBottom>
          Error al cargar estadísticas
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3, bgcolor: '#f5f7fa', minHeight: '100vh' }}>
      {/* Header con título y estado de conexión */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" fontWeight={700}>
          Bienvenido a tu Dashboard (Estudiante)
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
      {/* Tarjetas principales */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        {/* Horas Acumuladas */}
        <Paper elevation={3} sx={{ flex: '1 1 260px', minWidth: 220, bgcolor: '#2196f3', color: 'white', p: 2, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <TrendingUpIcon sx={{ mr: 1, fontSize: 28 }} />
            <Typography variant="subtitle1" fontWeight={700}>Horas Acumuladas</Typography>
              </Box>
          <Typography variant="h4" fontWeight={700}>{totalHours}</Typography>
          <Typography variant="body2">Horas de experiencia en proyectos</Typography>
            </Paper>
        {/* GPA Actual */}
        <Paper elevation={3} sx={{ flex: '1 1 260px', minWidth: 220, bgcolor: '#ffc107', color: 'white', p: 2, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <TrendingUpIcon sx={{ mr: 1, fontSize: 28, color: 'white' }} />
            <Typography variant="subtitle1" fontWeight={700} sx={{ color: 'white' }}>GPA Actual</Typography>
                </Box>
          <Typography variant="h4" fontWeight={700} sx={{ color: 'white' }}>{gpa}</Typography>
          <Typography variant="body2" sx={{ color: 'white' }}>Promedio académico actual</Typography>
            </Paper>
        {/* Proyectos Disponibles */}
        <Paper elevation={3} sx={{ flex: '1 1 260px', minWidth: 220, bgcolor: '#2196f3', color: 'white', p: 2, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <AssignmentIcon sx={{ mr: 1, fontSize: 28 }} />
            <Typography variant="subtitle1" fontWeight={700}>Proyectos Disponibles</Typography>
                </Box>
          <Typography variant="h4" fontWeight={700}>{availableProjects}</Typography>
          <Typography variant="body2">Nuevas oportunidades para ti</Typography>
            </Paper>
        {/* Mis Aplicaciones */}
        <Paper elevation={3} sx={{ flex: '1 1 260px', minWidth: 220, bgcolor: '#9c27b0', color: 'white', p: 2, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <AssignmentIcon sx={{ mr: 1, fontSize: 28 }} />
            <Typography variant="subtitle1" fontWeight={700}>Mis Aplicaciones</Typography>
                </Box>
          <Typography variant="h4" fontWeight={700}>{totalApplications}</Typography>
          <Typography variant="body2">Aplicaciones en proceso</Typography>
            </Paper>
        {/* Strikes */}
        <Paper elevation={3} sx={{ flex: '1 1 260px', minWidth: 220, bgcolor: '#ff9800', color: 'white', p: 2, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <WarningAmberIcon sx={{ mr: 1, fontSize: 28, color: '#d32f2f' }} />
            <Typography variant="subtitle1" fontWeight={700} sx={{ color: 'white' }}>Strikes</Typography>
                </Box>
          <Typography variant="h4" fontWeight={700} sx={{ color: 'white' }}>{strikes} / {maxStrikes}</Typography>
          <Typography variant="body2" sx={{ color: 'white' }}>Tienes {strikes} de {maxStrikes} strikes asignados por no entregar proyectos.</Typography>
            </Paper>
        {/* Proyectos Activos */}
        <Paper elevation={3} sx={{ flex: '1 1 260px', minWidth: 220, bgcolor: '#4caf50', color: 'white', p: 2, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <CheckCircleIcon sx={{ mr: 1, fontSize: 28 }} />
            <Typography variant="subtitle1" fontWeight={700}>Proyectos Activos</Typography>
          </Box>
          <Typography variant="h4" fontWeight={700}>{activeProjects}</Typography>
          <Typography variant="body2">Proyectos en curso</Typography>
        </Paper>
        </Box>
    </Box>
  );
} 