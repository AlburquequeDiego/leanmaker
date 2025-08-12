import { useEffect, useState } from 'react';
import { Box, Paper, Typography, CircularProgress, Tooltip, IconButton, Grid } from '@mui/material';
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
import SchoolIcon from '@mui/icons-material/School';
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

  // Verificar si el valor es "Sin calificaciones" para aplicar estilos especiales
  const isNoData = value === 'Sin calificaciones';

  // Verificar si bgColor es un gradiente
  const isGradient = bgColor.includes('gradient');

  return (
    <Paper sx={{
      p: 2.5,
      width: '100%',
      height: 160,
      minHeight: 160,
      maxHeight: 160,
      display: 'flex',
      flexDirection: 'column',
      background: isGradient ? bgColor : bgColor,
      bgcolor: isGradient ? 'transparent' : bgColor,
      color: textColor,
      boxShadow: isGradient ? '0 8px 32px rgba(99, 102, 241, 0.3)' : 2,
      borderRadius: 3,
      justifyContent: 'space-between',
      cursor: 'pointer',
      transition: 'box-shadow 0.2s',
      flexShrink: 0,
      flexGrow: 0,
      position: 'relative',
      overflow: 'hidden',
      '&:hover': {
        boxShadow: isGradient ? '0 12px 40px rgba(99, 102, 241, 0.4)' : 4
      },
      '&::before': isGradient ? {
        content: '""',
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
        transition: 'left 0.5s',
        zIndex: 1
      } : {},
      '&:hover::before': isGradient ? {
        left: '100%'
      } : {}
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
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
          <span>
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
          </span>
        </Tooltip>
      </Box>
      <Typography 
        variant="h3" 
        fontWeight={700} 
        sx={{ 
          textAlign: 'center', 
          my: 2,
          fontSize: isNoData ? '1.5rem' : 'clamp(1.5rem, 4vw, 3rem)',
          lineHeight: 1.2,
          opacity: isNoData ? 0.8 : 1,
          fontStyle: isNoData ? 'italic' : 'normal',
          position: 'relative',
          zIndex: 2
        }}
      >
        {isNoData ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: 0.5,
            position: 'relative'
          }}>
            <Box 
              component="span" 
              sx={{ 
                fontSize: '1.3rem', 
                opacity: 0.9,
                fontWeight: 600,
                textShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}
            >
              Sin
            </Box>
            <Box 
              component="span" 
              sx={{ 
                fontSize: '1.3rem', 
                opacity: 0.9,
                fontWeight: 600,
                textShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}
            >
              calificaciones
            </Box>
            {/* Icono decorativo para "Sin calificaciones" */}
            <Box 
              sx={{ 
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                opacity: 0.1,
                zIndex: 0
              }}
            >
              <StarIcon sx={{ fontSize: 60 }} />
            </Box>
            {/* Puntos decorativos */}
            <Box sx={{ 
              position: 'absolute', 
              top: '10%', 
              right: '10%', 
              opacity: 0.3,
              zIndex: 0
            }}>
              <Box sx={{ 
                width: 4, 
                height: 4, 
                borderRadius: '50%', 
                bgcolor: 'rgba(255,255,255,0.6)',
                mb: 0.5
              }} />
              <Box sx={{ 
                width: 3, 
                height: 3, 
                borderRadius: '50%', 
                bgcolor: 'rgba(255,255,255,0.4)',
                ml: 1
              }} />
            </Box>
            <Box sx={{ 
              position: 'absolute', 
              bottom: '15%', 
              left: '15%', 
              opacity: 0.3,
              zIndex: 0
            }}>
              <Box sx={{ 
                width: 3, 
                height: 3, 
                borderRadius: '50%', 
                bgcolor: 'rgba(255,255,255,0.4)',
                mb: 0.5
              }} />
              <Box sx={{ 
                width: 2, 
                height: 2, 
                borderRadius: '50%', 
                bgcolor: 'rgba(255,255,255,0.3)',
                ml: 0.5
              }} />
            </Box>
          </Box>
        ) : (
          value
        )}
      </Typography>
    </Paper>
  );
};

export default function CompanyDashboard() {
  const { user } = useAuth();
  const { themeMode } = useTheme();

  // Usar hook de tiempo real para estadísticas
  const { data: stats, loading, error, lastUpdate, isPolling, refresh } = useDashboardStats('company');

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
      console.log('[CompanyDashboard] Detailed stats:');
      console.log('  - active_projects:', stats.active_projects);
      console.log('  - completed_projects:', stats.completed_projects);
      console.log('  - total_projects:', stats.total_projects);
      console.log('  - pending_applications:', stats.pending_applications);
      console.log('  - total_applications:', stats.total_applications);
      console.log('  - active_students:', stats.active_students);
      console.log('  - gpa:', stats.gpa);
      console.log('  - total_hours_offered:', stats.total_hours_offered);
      console.log('  - monthly_activity:', stats.monthly_activity);
      console.log('  - area_distribution:', stats.area_distribution);
      
      // Log específico para debugging del gráfico circular
      if (stats.area_distribution) {
        console.log('[PieChart Debug] area_distribution type:', typeof stats.area_distribution);
        console.log('[PieChart Debug] area_distribution is array:', Array.isArray(stats.area_distribution));
        console.log('[PieChart Debug] area_distribution length:', stats.area_distribution.length);
        console.log('[PieChart Debug] area_distribution content:', JSON.stringify(stats.area_distribution, null, 2));
      } else {
        console.log('[PieChart Debug] area_distribution is null/undefined');
      }
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
  const publishedProjects = stats?.published_projects || 0;
  const completedProjects = stats?.completed_projects || 0;
  const totalProjects = stats?.total_projects || 0;
  const pendingApplications = stats?.pending_applications || 0;
  const totalApplications = stats?.total_applications || 0;
  const activeStudents = stats?.active_students || 0;
  const averageRating = stats?.gpa ?? 0;
  console.log('[CompanyDashboard] GPA Debug:', {
    'stats.gpa': stats?.gpa,
    'averageRating': averageRating,
    'stats.gpa type': typeof stats?.gpa,
    'averageRating type': typeof averageRating
  });
  const totalHoursOffered = stats?.total_hours_offered || 0;

  // Datos para el gráfico circular - solo datos reales
  const chartData = stats?.area_distribution || [];

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
          Dashboard de Empresa - {getUserDisplayName()}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Tooltip title="Actualizar datos">
            <span>
              <IconButton
                onClick={refresh}
                disabled={loading}
                sx={{ 
                  color: 'primary.main',
                  '&:hover': { bgcolor: 'primary.light' }
                }}
              >
                <RefreshIcon />
              </IconButton>
            </span>
          </Tooltip>
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
      {/* KPIs principales: 9 tarjetas en grid 3×3 + 1 tarjeta debajo */}
      {!loading && !error && (
        <>
          {/* Grid principal 3x3 */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 3,
            mb: 3,
            maxWidth: '100%',
            width: '100%'
          }}>
                         {/* Proyectos Publicados - Azul vibrante */}
             <KPICard
               title="Proyectos Publicados"
               value={publishedProjects}
               description="Proyectos que están publicados y disponibles para que los estudiantes se postulen. Representa las oportunidades activas que la empresa ofrece."
               icon={<AssignmentIcon sx={{ fontSize: 28 }} />}
               bgColor="#2563eb"
               textColor="white"
             />
             
             {/* Proyectos Activos - Verde esmeralda vibrante */}
             <KPICard
               title="Proyectos Activos"
               value={activeProjects}
               description="Proyectos que están actualmente en desarrollo y siendo trabajados activamente por estudiantes. Representa la actividad actual de la empresa en la plataforma."
               icon={<PlayArrowIcon sx={{ fontSize: 28 }} />}
               bgColor="#16a34a"
               textColor="white"
             />
             
             {/* Proyectos Completados - Verde brillante */}
             <KPICard
               title="Proyectos Completados"
               value={completedProjects}
               description="Proyectos que han sido finalizados exitosamente. Muestra el historial de proyectos completados y la capacidad de la empresa para llevar proyectos a término."
               icon={<CheckCircleIcon sx={{ fontSize: 28 }} />}
               bgColor="#15803d"
               textColor="white"
             />
             
             {/* Proyectos Creados - Azul cielo vibrante */}
             <KPICard
               title="Proyectos Creados"
               value={totalProjects}
               description="Total de proyectos creados por la empresa en la plataforma. Incluye proyectos activos, completados y cancelados."
               icon={<BusinessIcon sx={{ fontSize: 28 }} />}
               bgColor="#0891b2"
               textColor="white"
             />
             
             {/* Postulantes Pendientes - Púrpura vibrante */}
             <KPICard
               title="Postulantes Pendientes"
               value={pendingApplications}
               description="Solicitudes de estudiantes que están esperando revisión por parte de la empresa. Representa nuevas oportunidades de colaboración."
               icon={<PeopleIcon sx={{ fontSize: 28 }} />}
               bgColor="#a855f7"
               textColor="white"
             />
             
             {/* Solicitudes Totales - Naranja brillante */}
             <KPICard
               title="Solicitudes Totales"
               value={totalApplications}
               description="Total de solicitudes recibidas de estudiantes para todos los proyectos de la empresa. Muestra el interés generado por los proyectos."
               icon={<AssignmentTurnedInIcon sx={{ fontSize: 28 }} />}
               bgColor="#ea580c"
               textColor="white"
             />
             
             {/* Estudiantes Activos - Verde lima vibrante */}
             <KPICard
               title="Estudiantes Activos"
               value={activeStudents}
               description="Estudiantes que están actualmente participando en proyectos de la empresa. Representa la colaboración activa con talento universitario."
               icon={<SchoolIcon sx={{ fontSize: 28 }} />}
               bgColor="#8BC34A"
               textColor="white"
             />
             
                           {/* GPA Empresa - Azul índigo vibrante con gradiente */}
              <KPICard
                title="GPA Empresa"
                value={averageRating !== null && averageRating !== undefined ? `${averageRating.toFixed(1)}/5` : 'Sin calificaciones'}
                description="Calificación promedio que la empresa ha recibido de los estudiantes. Refleja la satisfacción y calidad de la experiencia proporcionada."
                icon={<StarIcon sx={{ fontSize: 28 }} />}
                bgColor="linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
                textColor="white"
              />
              
              {/* Horas Ofrecidas - Rojo vibrante */}
              <KPICard
                title="Horas Ofrecidas"
                value={totalHoursOffered}
                description="Total de horas de experiencia ofrecidas en todos los proyectos publicados por la empresa. Representa el volumen total de oportunidades de desarrollo profesional proporcionadas a los estudiantes."
                icon={<AccessTimeIcon sx={{ fontSize: 28 }} />}
                bgColor="#dc2626"
                textColor="white"
              />
           </Box>
            
            {/* Gráficos */}
            <Grid container spacing={3} sx={{ mt: 2 }}>
              {/* Gráfico de Dona - Distribución de Proyectos por Área */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ 
                  p: 3, 
                  height: 400,
                  bgcolor: themeMode === 'dark' ? '#1e293b' : 'white',
                  border: themeMode === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0'
                }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b' }}>
                    Distribución de Proyectos por Área
                  </Typography>
                  {chartData && chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <defs>
                          <filter id="pieShadow" x="-50%" y="-50%" width="200%" height="200%">
                            <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="rgba(0,0,0,0.15)"/>
                          </filter>
                        </defs>
                        <Pie
                          data={chartData}
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
                          {chartData.map((entry: any, index: number) => (
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
                            `${value} proyectos`, 
                            name
                          ]}
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
                        No hay proyectos disponibles
                      </Typography>
                      <Typography variant="body2">
                        Los proyectos aparecerán aquí cuando crees y publiques proyectos
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
                          <linearGradient id="projectsGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          </linearGradient>
                          <linearGradient id="applicationsGradient" x1="0" y1="0" x2="0" y2="1">
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
                              projects: '📋 Proyectos Creados',
                              applications: '📝 Aplicaciones Recibidas'
                            };
                            return labels[value as keyof typeof labels] || value;
                          }}
                        />
                        <Bar 
                          dataKey="projects" 
                          fill="url(#projectsGradient)" 
                          radius={[8, 8, 0, 0]}
                          stroke="#3b82f6"
                          strokeWidth={1}
                        />
                        <Bar 
                          dataKey="applications" 
                          fill="url(#applicationsGradient)" 
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
                        La actividad aparecerá aquí cuando crees proyectos o recibas aplicaciones
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    );
  }
