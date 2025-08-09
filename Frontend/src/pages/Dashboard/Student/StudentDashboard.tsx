import { useEffect, useState } from 'react';
import { Box, Paper, Typography, Tooltip, IconButton, Grid } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CodeIcon from '@mui/icons-material/Code';
import InfoIcon from '@mui/icons-material/Info';
import { useDashboardStats } from '../../../hooks/useRealTimeData';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../contexts/ThemeContext';
import { ConnectionStatus } from '../../../components/common/ConnectionStatus';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

// Paleta de colores estilo Power BI
const powerBIColors = [
  '#01B8AA', // Teal principal
  '#374649', // Dark Gray
  '#FD625E', // Red
  '#F2C80F', // Yellow
  '#5F6B6D', // Gray
  '#8AD4EB', // Light Blue
  '#FE9666', // Orange
  '#A66999', // Purple
  '#3599B8', // Blue
  '#DFBFBF'  // Light Pink
];

// Estilos Power BI para tooltips
const powerBITooltipStyles = {
  backgroundColor: 'rgba(255, 255, 255, 0.98)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(0, 0, 0, 0.1)',
  borderRadius: '16px',
  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15), 0 4px 20px rgba(0, 0, 0, 0.1)',
  padding: '16px 20px',
  fontSize: '14px',
  fontWeight: 600,
  color: '#1e293b'
};

// Estilos Power BI para dark mode tooltips
const powerBITooltipDarkStyles = {
  backgroundColor: 'rgba(15, 23, 42, 0.98)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '16px',
  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3), 0 4px 20px rgba(0, 0, 0, 0.2)',
  padding: '16px 20px',
  fontSize: '14px',
  fontWeight: 600,
  color: '#f8fafc'
};

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
          <Typography variant="h6" fontWeight={700} sx={{ 
            ml: 1,
            fontSize: 'clamp(0.8rem, 2vw, 1.25rem)',
            lineHeight: 1.1,
            wordBreak: 'break-word',
            overflowWrap: 'break-word'
          }}>
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
      <Typography variant="h3" fontWeight={700} sx={{ 
        textAlign: 'center', 
        my: 2,
        fontSize: 'clamp(1.5rem, 4vw, 3rem)',
        lineHeight: 1.1,
        wordBreak: 'break-word',
        overflowWrap: 'break-word'
      }}>
        {value}
      </Typography>
    </Paper>
  );
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const { themeMode } = useTheme();
  const { data: stats, loading, error, lastUpdate, isPolling } = useDashboardStats('student');

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
    return 'Estudiante';
  };

  // Datos de ejemplo para strikes y GPA (ajusta según tu modelo real)
  const strikes = stats?.strikes ?? 0;
  const maxStrikes = 3;
  const gpa = stats?.gpa ?? 0;
  const totalHours = stats?.total_hours ?? 0;
  const activeProjects = stats?.active_projects ?? 0;
  const totalApplications = stats?.total_applications ?? 0;
  const availableProjects = stats?.available_projects ?? 0;
  
  // Nuevos datos para las 3 tarjetas adicionales
  const completedProjects = stats?.completed_projects ?? 0;
  const apiLevel = stats?.api_level ?? 1;
  const unreadNotifications = stats?.unread_notifications ?? 0;

  // Log para debugging de gráficos
  useEffect(() => {
    if (stats) {
      console.log('[StudentDashboard] Stats received:', stats);
      console.log('[StudentDashboard] Application distribution:', stats.application_distribution);
      console.log('[StudentDashboard] Monthly activity:', stats.monthly_activity);
    }
  }, [stats]);

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
    <Box sx={{ 
      flexGrow: 1, 
      p: 3, 
      bgcolor: themeMode === 'dark' ? '#0f172a' : '#f8fafc', 
      minHeight: '100vh',
      color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
    }}>
      {/* Header con título y estado de conexión */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" fontWeight={700} sx={{ color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b' }}>
          Bienvenido a tu Dashboard - {getUserDisplayName()}
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
      
      {/* Tarjetas principales con diseño fijo - 3 filas × 3 columnas */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gridTemplateRows: 'repeat(3, 160px)',
        gap: 3, 
        mb: 3,
        maxWidth: '100%',
        width: '100%'
      }}>
        {/* Horas Acumuladas */}
        <KPICard
          title="Horas Acumuladas"
          value={totalHours}
          description="Total de horas de experiencia acumuladas trabajando en proyectos. Cada hora registrada y validada contribuye a tu experiencia profesional y desarrollo de habilidades técnicas."
          icon={<TrendingUpIcon sx={{ fontSize: 28 }} />}
          bgColor="#1565c0"
          textColor="white"
        />
        
        {/* Proyectos Disponibles */}
        <KPICard
          title="Proyectos Disponibles"
          value={availableProjects}
          description="Número de proyectos activos que están abiertos para aplicaciones. Estos proyectos representan nuevas oportunidades para desarrollar tus habilidades y ganar experiencia profesional."
          icon={<AssignmentIcon sx={{ fontSize: 28 }} />}
          bgColor="#42a5f5"
          textColor="white"
        />
        
        {/* Mis Aplicaciones */}
        <KPICard
          title="Mis Aplicaciones"
          value={totalApplications}
          description="Total de aplicaciones que has enviado a proyectos. Incluye aplicaciones pendientes de revisión, aceptadas y rechazadas. Monitorea el estado de tus aplicaciones activas."
          icon={<AssignmentIcon sx={{ fontSize: 28 }} />}
          bgColor="#8e24aa"
          textColor="white"
        />
        
        {/* Strikes */}
        <KPICard
          title="Strikes"
          value={`${strikes} / ${maxStrikes}`}
          description="Sistema de advertencias por incumplimiento de entregas. Tienes un máximo de 3 strikes antes de restricciones. Los strikes se asignan cuando no entregas proyectos en tiempo y forma."
          icon={<WarningAmberIcon sx={{ fontSize: 28, color: '#d32f2f' }} />}
          bgColor="#ff9800"
          textColor="white"
        />
        
        {/* Proyectos Activos */}
        <KPICard
          title="Proyectos Activos"
          value={activeProjects}
          description="Proyectos en los que actualmente estás participando y trabajando activamente. Estos son proyectos donde has sido aceptado y estás registrando horas de trabajo."
          icon={<CheckCircleIcon sx={{ fontSize: 28 }} />}
          bgColor="#2e7d32"
          textColor="white"
        />
        
        {/* GPA Actual */}
        <KPICard
          title="GPA Actual"
          value={gpa && gpa > 0 ? gpa : 'Sin GPA'}
          description="Promedio académico actual basado en las calificaciones recibidas por tu trabajo en proyectos. Refleja tu rendimiento académico y profesional en la plataforma."
          icon={<TrendingUpIcon sx={{ fontSize: 28, color: 'white' }} />}
          bgColor="#f57c00"
          textColor="white"
        />
         
         {/* Proyectos Completados */}
         <KPICard
           title="Proyectos Completados"
           value={completedProjects}
           description="Número total de proyectos que has terminado exitosamente. Cada proyecto completado representa una experiencia valiosa y contribuye a tu portafolio profesional."
           icon={<CheckCircleIcon sx={{ fontSize: 28 }} />}
           bgColor="#4caf50"
           textColor="white"
         />
         
         {/* Nivel de API */}
         <KPICard
           title="Nivel API"
           value={apiLevel}
           description={
             apiLevel === 1 
               ? "Nivel API 1: Asesoría - Puedes comprender conceptos básicos y trabajar bajo supervisión directa. Horas máximas permitidas: 20 horas."
               : apiLevel === 2 
               ? "Nivel API 2: Asesoría + Propuesta - Puedes trabajar en tareas prácticas con guía y supervisión. Horas máximas permitidas: 40 horas."
               : apiLevel === 3 
               ? "Nivel API 3: Asesoría + Propuesta + Implementación - Puedes trabajar de forma independiente en proyectos complejos. Horas máximas permitidas: 80 horas."
               : "Nivel API 4: Asesoría + Propuesta + Implementación + Upgrade - Puedes liderar proyectos complejos e innovar en soluciones. Horas máximas permitidas: 160 horas."
           }
           icon={<CodeIcon sx={{ fontSize: 28 }} />}
           bgColor="#8e24aa"
           textColor="white"
         />
         
         {/* Notificaciones Nuevas */}
         <KPICard
           title="Notificaciones Nuevas"
           value={unreadNotifications}
           description="Número de notificaciones no leídas que requieren tu atención. Incluye actualizaciones de proyectos, evaluaciones y mensajes importantes del sistema."
           icon={<NotificationsIcon sx={{ fontSize: 28 }} />}
           bgColor="#f44336"
           textColor="white"
         />
      </Box>
      
      {/* Gráficos */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Gráfico de Dona - Distribución de Aplicaciones por Estado */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ 
            p: 3, 
            height: 400,
            bgcolor: themeMode === 'dark' ? '#1e293b' : 'white',
            border: themeMode === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0'
          }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b' }}>
              Distribución de Aplicaciones por Estado
            </Typography>
            {stats?.application_distribution && stats.application_distribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <defs>
                    <filter id="pieShadow" x="-50%" y="-50%" width="200%" height="200%">
                      <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="rgba(0,0,0,0.15)"/>
                    </filter>
                  </defs>
                                     <Pie
                     data={stats.application_distribution}
                     cx="50%"
                     cy="50%"
                     labelLine={false}
                     label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : '0'}%`}
                     outerRadius={100}
                     innerRadius={50}
                     dataKey="count"
                     stroke={themeMode === 'dark' ? '#1e293b' : '#ffffff'}
                     strokeWidth={3}
                     filter="url(#pieShadow)"
                     labelStyle={{
                       fill: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                       fontSize: '12px',
                       fontWeight: 600
                     }}
                   >
                    {stats.application_distribution.map((_: any, index: number) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={powerBIColors[index % powerBIColors.length]}
                        stroke={themeMode === 'dark' ? '#1e293b' : '#ffffff'}
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={themeMode === 'dark' ? powerBITooltipDarkStyles : powerBITooltipStyles}
                    formatter={(value: any, name: any) => [
                      `${value} aplicaciones`, 
                      name
                    ]}
                  />
                                     <Legend 
                     verticalAlign="bottom" 
                     height={36}
                     wrapperStyle={{
                       color: themeMode === 'dark' ? '#f8fafc' : '#1e293b',
                       fontSize: '13px',
                       fontWeight: 600
                     }}
                   />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: 300,
                color: themeMode === 'dark' ? '#cbd5e1' : '#64748b'
              }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  No hay aplicaciones disponibles
                </Typography>
                <Typography variant="body2">
                  Las aplicaciones aparecerán aquí cuando postules a proyectos
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Gráfico de Barras - Actividad Mensual */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ 
            p: 3, 
            height: 400,
            bgcolor: themeMode === 'dark' ? '#1e293b' : 'white',
            border: themeMode === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0'
          }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b' }}>
              Actividad Mensual
            </Typography>
            {stats?.monthly_activity && stats.monthly_activity.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.monthly_activity}>
                  <defs>
                    <linearGradient id="applicationsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    </linearGradient>
                    <linearGradient id="hoursGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0.3}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke={themeMode === 'dark' ? '#334155' : '#f1f5f9'}
                    opacity={0.3}
                  />
                                     <XAxis 
                     dataKey="month" 
                     tick={{ 
                       fontSize: 12, 
                       fontWeight: 600,
                       fill: themeMode === 'dark' ? '#f8fafc' : '#1e293b'
                     }}
                     axisLine={{ 
                       stroke: themeMode === 'dark' ? '#475569' : '#cbd5e1',
                       strokeWidth: 2
                     }}
                     tickLine={{ 
                       stroke: themeMode === 'dark' ? '#475569' : '#cbd5e1',
                       strokeWidth: 2
                     }}
                   />
                   <YAxis 
                     tick={{ 
                       fontSize: 12, 
                       fontWeight: 600,
                       fill: themeMode === 'dark' ? '#f8fafc' : '#1e293b'
                     }}
                     axisLine={{ 
                       stroke: themeMode === 'dark' ? '#475569' : '#cbd5e1',
                       strokeWidth: 2
                     }}
                     tickLine={{ 
                       stroke: themeMode === 'dark' ? '#475569' : '#cbd5e1',
                       strokeWidth: 2
                     }}
                   />
                  <RechartsTooltip 
                    contentStyle={themeMode === 'dark' ? powerBITooltipDarkStyles : powerBITooltipStyles}
                    formatter={(value: any, name: any) => [value, name]}
                  />
                                     <Legend 
                     wrapperStyle={{
                       color: themeMode === 'dark' ? '#f8fafc' : '#1e293b',
                       fontSize: '13px',
                       fontWeight: 600,
                       paddingTop: '20px'
                     }}
                    formatter={(value) => {
                      const labels = {
                        applications: '📝 Aplicaciones Enviadas',
                        hours: '⏰ Horas Trabajadas'
                      };
                      return labels[value as keyof typeof labels] || value;
                    }}
                  />
                  <Bar 
                    dataKey="applications" 
                    fill="url(#applicationsGradient)" 
                    radius={[8, 8, 0, 0]}
                    stroke="#3b82f6"
                    strokeWidth={1}
                  />
                  <Bar 
                    dataKey="hours" 
                    fill="url(#hoursGradient)" 
                    radius={[8, 8, 0, 0]}
                    stroke="#22c55e"
                    strokeWidth={1}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: 300,
                color: themeMode === 'dark' ? '#cbd5e1' : '#64748b'
              }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  No hay datos de actividad mensual
                </Typography>
                <Typography variant="body2">
                  La actividad aparecerá aquí cuando postules a proyectos o trabajes en ellos
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
} 