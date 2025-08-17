import { Box, Typography, CircularProgress, Paper, Chip, Tooltip, IconButton } from '@mui/material';
import { People as PeopleIcon, Business as BusinessIcon, School as SchoolIcon, Work as WorkIcon, Pending as PendingIcon, Info as InfoIcon, Quiz as QuizIcon, PlayArrow as PlayArrowIcon, Schedule as ScheduleIcon } from '@mui/icons-material';
import { ConnectionStatus } from '../../../components/common/ConnectionStatus';
import { useDashboardStats } from '../../../hooks/useRealTimeData';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../contexts/ThemeContext';
import { useState } from 'react';

// Componente para tarjetas KPI con tooltip
interface KPICardProps {
  title: string;
  value: number;
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
      transition: 'box-shadow 0.2s',
      flexShrink: 0,
      flexGrow: 0,
      '&:hover': {
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

export default function AdminDashboard() {
  const { user } = useAuth();
  const { themeMode } = useTheme();

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
    return 'Administrador';
  };
  
  // Usar hook de tiempo real para estadísticas
  const { data: stats, loading, error, lastUpdate, isPolling } = useDashboardStats('admin');

  // Cálculos de KPIs usando datos reales del backend
  const totalUsers = stats?.total_users || 0;
  const totalStudents = stats?.students || 0; // Usar el campo adaptado 'students'
  const totalCompanies = stats?.companies || 0; // Usar el campo adaptado 'companies'
  const totalProjects = stats?.total_projects || 0;
  const pendingApplications = stats?.pending_applications || 0;
  const strikesAlerts = stats?.strikes_alerts || 0;
  const apiQuestionnaireRequests = stats?.api_questionnaire_requests || 0;
  const activeProjects = stats?.active_projects || 0;
  const pendingHours = stats?.pending_hours || 0;

  return (
    <Box sx={{ 
      p: 3, 
      bgcolor: themeMode === 'dark' ? '#0f172a' : '#f8fafc', 
      minHeight: '100vh',
      color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
    }}>
      {/* Header con título y estado de conexión */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" fontWeight={700} sx={{ color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b' }}>
          Dashboard de Administrador - {getUserDisplayName()}
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
        <Typography variant="body2" sx={{ textAlign: 'center', py: 2, color: themeMode === 'dark' ? '#cbd5e1' : '#64748b' }}>
          No se pudo cargar la información.
        </Typography>
      )}

      {/* Contenido solo si hay datos */}
      {!loading && !error && stats && (
        <>
          {/* KPIs principales - 3 filas × 3 columnas */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridTemplateRows: 'repeat(3, 160px)',
            gap: 3,
            mb: 4,
            maxWidth: '100%',
            width: '100%'
          }}>
            {/* Usuarios - Azul primario vibrante */}
            <KPICard
              title="Usuarios"
              value={totalUsers}
              description="Total de usuarios registrados en el sistema, incluyendo estudiantes, empresas y administradores"
              icon={<PeopleIcon sx={{ fontSize: 32, mr: 1 }} />}
              bgColor="#3b82f6"
              textColor="white"
            />
            
            {/* Empresas - Rojo primario vibrante */}
            <KPICard
              title="Empresas"
              value={totalCompanies}
              description="Empresas activas que han publicado proyectos y están participando en el programa"
              icon={<BusinessIcon sx={{ fontSize: 32, mr: 1 }} />}
              bgColor="#ef4444"
              textColor="white"
            />
            
            {/* Estudiantes - Verde primario vibrante */}
            <KPICard
              title="Estudiantes"
              value={totalStudents}
              description="Estudiantes universitarios activos que pueden aplicar a proyectos y registrar horas de trabajo"
              icon={<SchoolIcon sx={{ fontSize: 32, mr: 1 }} />}
              bgColor="#10b981"
              textColor="white"
            />
            
            {/* Proyectos - Amarillo primario vibrante */}
            <KPICard
              title="Proyectos"
              value={totalProjects}
              description="Proyectos activos disponibles para que los estudiantes apliquen y desarrollen sus habilidades"
              icon={<WorkIcon sx={{ fontSize: 32, mr: 1 }} />}
              bgColor="#f59e0b"
              textColor="white"
            />
            
            {/* Postulaciones - Púrpura primario vibrante */}
            <KPICard
              title="Postulaciones"
              value={pendingApplications}
              description="Aplicaciones de estudiantes a proyectos que están pendientes de revisión por las empresas"
              icon={<PendingIcon sx={{ fontSize: 32, mr: 1, color: '#ffffff' }} />}
              bgColor="#8b5cf6"
              textColor="white"
            />
            
            {/* Asignaciones de Strikes - Naranja primario vibrante */}
            <KPICard
              title="Asignaciones de Strikes"
              value={strikesAlerts}
              description="Reportes de incidencias pendientes que requieren revisión administrativa y posible asignación de strikes"
              icon={<PendingIcon sx={{ fontSize: 32, mr: 1 }} />}
              bgColor="#f97316"
              textColor="white"
            />
            
            {/* Solicitudes de Cuestionario API - Verde azulado vibrante */}
            <KPICard
              title="Cuestionarios API"
              value={apiQuestionnaireRequests}
              description="Solicitudes de cuestionario de API pendientes de revisión por el administrador para determinar el nivel del estudiante"
              icon={<QuizIcon sx={{ fontSize: 32, mr: 1 }} />}
              bgColor="#06b6d4"
              textColor="white"
            />
            
            {/* Proyectos Activos - Verde vibrante */}
            <KPICard
              title="Proyectos Activos"
              value={activeProjects}
              description="Proyectos que están actualmente en desarrollo con estudiantes trabajando activamente"
              icon={<PlayArrowIcon sx={{ fontSize: 32, mr: 1 }} />}
              bgColor="#22c55e"
              textColor="white"
            />
            
            {/* Horas Pendientes - Índigo vibrante */}
            <KPICard
              title="Horas Pendientes"
              value={pendingHours}
              description="Horas de trabajo registradas por estudiantes que están pendientes de validación por las empresas"
              icon={<ScheduleIcon sx={{ fontSize: 32, mr: 1 }} />}
              bgColor="#6366f1"
              textColor="white"
            />
          </Box>
        </>
      )}
    </Box>
  );
} 