import { useEffect, useState } from 'react';
import { Box, Paper, Typography, CircularProgress, Tooltip, IconButton } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import PeopleIcon from '@mui/icons-material/People';
import StarIcon from '@mui/icons-material/Star';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AssignmentIcon from '@mui/icons-material/Assignment';
import RefreshIcon from '@mui/icons-material/Refresh';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SchoolIcon from '@mui/icons-material/School';
import InfoIcon from '@mui/icons-material/Info';
import { useDashboardStats } from '../../../hooks/useRealTimeData';
import { useAuth } from '../../../hooks/useAuth';
import { ConnectionStatus } from '../../../components/common/ConnectionStatus';

// Componente de tarjeta KPI reutilizable
interface KPICardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
}

const KPICard = ({ title, value, description, icon, bgColor, textColor }: KPICardProps) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <Paper sx={{
      p: 2.5,
      width: '100%',
      height: 160,
      minHeight: 160,
      maxHeight: 160,
      display: 'flex',
      flexDirection: 'column',
      bgcolor: bgColor,
      color: textColor,
      boxShadow: 2,
      borderRadius: 3,
      justifyContent: 'space-between',
      cursor: 'pointer',
      transition: 'transform 0.2s, box-shadow 0.2s',
      flexShrink: 0,
      flexGrow: 0,
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: 4
      }
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            flexShrink: 0
          }}>
            {icon}
          </Box>
          <Typography variant="h6" fontWeight={700} sx={{ ml: 1 }}>
            {title}
          </Typography>
        </Box>
        <Tooltip 
          title={description}
          open={showTooltip}
          onClose={() => setShowTooltip(false)}
          placement="top"
          arrow
          sx={{
            '& .MuiTooltip-tooltip': {
              bgcolor: 'rgba(0, 0, 0, 0.9)',
              color: 'white',
              fontSize: '14px',
              padding: '8px 12px',
              borderRadius: '6px'
            }
          }}
        >
          <IconButton
            size="small"
            onClick={() => setShowTooltip(!showTooltip)}
            sx={{ 
              color: textColor,
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      <Typography variant="h3" fontWeight={700} sx={{ textAlign: 'center', my: 2 }}>
        {value}
      </Typography>
    </Paper>
  );
};

export default function CompanyDashboard() {
  const { user } = useAuth();

  // Usar hook de tiempo real para estadísticas
  const { data: stats, loading, error, lastUpdate, isPolling } = useDashboardStats('company');

  // Obtener el nombre del usuario para personalizar el dashboard
  const getUserDisplayName = () => {
    if (user?.full_name) {
      return user.full_name;
    }
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user?.first_name) {
      return user.first_name;
    }
    return 'Empresa';
  };

  // Detectar cambios en las estadísticas
  useEffect(() => {
    console.log('[CompanyDashboard] Stats changed:', stats);
    if (stats) {
      console.log('[CompanyDashboard] Stats received:', stats);

    }
  }, [stats]);

  // Log para debugging
  useEffect(() => {
    console.log('[CompanyDashboard] Component state:', {
      loading,
      error,
      hasStats: !!stats,
      stats,
      user: user?.email
    });
  }, [loading, error, stats, user]);

  // KPIs usando datos reales
  const activeProjects = stats?.active_projects || 0;
  const completedProjects = stats?.completed_projects || 0;
  const totalProjects = stats?.total_projects || 0;
  const pendingApplications = stats?.pending_applications || 0;
  const totalApplications = stats?.total_applications || 0;
  const activeStudents = stats?.active_students || 0;
  const averageRating = stats?.rating || 0;
  const totalHoursOffered = stats?.total_hours_offered || 0;
  const successRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;

  return (
    <Box sx={{ p: 3, bgcolor: '#f7fafd', minHeight: '100vh' }}>
      {/* Header con título y estado de conexión */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" fontWeight={700}>
          Dashboard de Empresa - {getUserDisplayName()}
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
      {/* KPIs principales: 9 tarjetas en grid 3×3 */}
      {!loading && !error && (
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'repeat(3, 160px)',
          gap: 3,
          mb: 4,
          maxWidth: '100%',
          width: '100%'
        }}>
          {/* Proyectos Activos - Azul */}
          <KPICard
            title="Proyectos Activos"
            value={activeProjects}
            description="Proyectos que están actualmente en desarrollo y siendo trabajados activamente por estudiantes. Representa la actividad actual de la empresa en la plataforma."
            icon={<AssignmentIcon sx={{ fontSize: 28 }} />}
            bgColor="#1976d2"
            textColor="white"
          />
          
          {/* Proyectos Completados - Verde */}
          <KPICard
            title="Proyectos Completados"
            value={completedProjects}
            description="Proyectos que han sido finalizados exitosamente. Muestra el historial de proyectos completados y la capacidad de la empresa para llevar proyectos a término."
            icon={<CheckCircleIcon sx={{ fontSize: 28 }} />}
            bgColor="#388e3c"
            textColor="white"
          />
          
          {/* Proyectos Creados - Azul claro */}
          <KPICard
            title="Proyectos Creados"
            value={totalProjects}
            description="Total de proyectos creados por la empresa en la plataforma. Incluye proyectos activos, completados y cancelados."
            icon={<BusinessIcon sx={{ fontSize: 28 }} />}
            bgColor="#42a5f5"
            textColor="white"
          />
          
          {/* Postulantes Pendientes - Morado */}
          <KPICard
            title="Postulantes Pendientes"
            value={pendingApplications}
            description="Solicitudes de estudiantes que están esperando revisión por parte de la empresa. Representa nuevas oportunidades de colaboración."
            icon={<PeopleIcon sx={{ fontSize: 28 }} />}
            bgColor="#8e24aa"
            textColor="white"
          />
          
          {/* Solicitudes Totales - Naranja */}
          <KPICard
            title="Solicitudes Totales"
            value={totalApplications}
            description="Total de solicitudes recibidas de estudiantes para todos los proyectos de la empresa. Muestra el interés generado por los proyectos."
            icon={<AssignmentTurnedInIcon sx={{ fontSize: 28 }} />}
            bgColor="#fb8c00"
            textColor="white"
          />
          
          {/* Estudiantes Activos - Verde oscuro */}
          <KPICard
            title="Estudiantes Activos"
            value={activeStudents}
            description="Estudiantes que están actualmente participando en proyectos de la empresa. Representa la colaboración activa con talento universitario."
            icon={<SchoolIcon sx={{ fontSize: 28 }} />}
            bgColor="#2e7d32"
            textColor="white"
          />
          
          {/* GPA Empresa - Azul marino */}
          <KPICard
            title="GPA Empresa"
            value={averageRating && averageRating > 0 ? averageRating : 'Sin calificaciones'}
            description="Calificación promedio que la empresa ha recibido de los estudiantes. Refleja la satisfacción y calidad de la experiencia proporcionada."
            icon={<StarIcon sx={{ fontSize: 28 }} />}
            bgColor="#1565c0"
            textColor="white"
          />
          
          {/* Tasa de Éxito - Verde lima */}
          <KPICard
            title="Tasa de Éxito"
            value={`${successRate}%`}
            description="Porcentaje de proyectos que han sido completados exitosamente. Muestra la eficiencia y capacidad de la empresa para finalizar proyectos."
            icon={<TrendingUpIcon sx={{ fontSize: 28 }} />}
            bgColor="#7cb342"
            textColor="white"
          />
          
          {/* Horas Ofrecidas - Rojo */}
          <KPICard
            title="Horas Ofrecidas"
            value={totalHoursOffered}
            description="Total de horas de experiencia ofrecidas en todos los proyectos publicados por la empresa. Representa el volumen total de oportunidades de desarrollo profesional proporcionadas a los estudiantes."
            icon={<AccessTimeIcon sx={{ fontSize: 28 }} />}
            bgColor="#d32f2f"
            textColor="white"
          />
        </Box>
      )}
    </Box>
  );
}
