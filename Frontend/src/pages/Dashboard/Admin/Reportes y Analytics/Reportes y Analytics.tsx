import { useState, useEffect } from 'react';
import { useHubAnalytics } from '../../../../hooks/useHubAnalytics';
import { useTheme } from '../../../../contexts/ThemeContext';
import { translateNotificationType } from '../../../../utils/notificationTranslations';
import { 
  powerBIColors, 
  powerBIGradients, 
  powerBITooltipStyles, 
  powerBITooltipDarkStyles,
  powerBICardStyles,
  powerBIGraphConfig,
  powerBIAxisConfig,
  powerBIAxisDarkConfig,
  powerBIGridConfig,
  powerBIGridDarkConfig
} from '../../../../utils/powerBIStyles';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  LinearProgress,
  IconButton,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Business as BusinessIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  MoreVert as MoreVertIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Colores para los estados de proyectos mejorados
const projectStatusColors = {
  'Activos': '#01B8AA',
  'Completados': '#374649', 
  'Pendientes': '#FD625E',
  'Cancelados': '#F2C80F'
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
    case 'active':
      return 'success';
    case 'pending':
      return 'warning';
    case 'error':
      return 'error';
    default:
      return 'default';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircleIcon fontSize="small" />;
    case 'active':
      return <TrendingUpIcon fontSize="small" />;
    case 'pending':
      return <ScheduleIcon fontSize="small" />;
    case 'error':
      return <ErrorIcon fontSize="small" />;
    default:
      return <WarningIcon fontSize="small" />;
  }
};

// Función para traducir meses del inglés al español
const translateMonthToSpanish = (month: string): string => {
  const monthTranslations: { [key: string]: string } = {
    'January': 'Enero',
    'February': 'Febrero',
    'March': 'Marzo',
    'April': 'Abril',
    'May': 'Mayo',
    'June': 'Junio',
    'July': 'Julio',
    'August': 'Agosto',
    'September': 'Septiembre',
    'October': 'Octubre',
    'November': 'Noviembre',
    'December': 'Diciembre'
  };
  
  // Buscar el mes en el objeto de traducciones
  for (const [englishMonth, spanishMonth] of Object.entries(monthTranslations)) {
    if (month.includes(englishMonth)) {
      // Si el mes incluye el año (ej: "March 2025"), mantener el año
      const year = month.replace(englishMonth, '').trim();
      return year ? `${spanishMonth} ${year}` : spanishMonth;
    }
  }
  
  // Si no se encuentra traducción, devolver el mes original
  return month;
};

// Función para traducir estados de proyecto del inglés al español
const translateProjectStatusToSpanish = (status: string): string => {
  const statusTranslations: { [key: string]: string } = {
    'active': 'Activo',
    'published': 'Publicado',
    'completed': 'Completado',
    'draft': 'Borrador',
    'deleted': 'Eliminado',
    'suspended': 'Suspendido',
    'pending': 'Pendiente',
    'reviewing': 'En Revisión',
    'accepted': 'Aceptado',
    'rejected': 'Rechazado',
    'open': 'Abierto',
    'in-progress': 'En Progreso',
    'cancelled': 'Cancelado',
    'overdue': 'Atrasado',
    'closed': 'Cerrado',
    'terminated': 'Terminado'
  };
  
  return statusTranslations[status.toLowerCase()] || status;
};

export const ReportesYAnalytics = () => {
  const { data, loading, error, refreshData } = useHubAnalytics();
  const { themeMode } = useTheme();
  
  // Alias para analyticsData para mantener compatibilidad
  const analyticsData = data;
  
  // Usar datos del backend o valores por defecto
  const stats = data?.stats || {
    totalUsers: 0,
    totalProjects: 0,
    totalCompanies: 0,
    totalStudents: 0,
    activeProjects: 0,
    completedProjects: 0,
    pendingProjects: 0,
    cancelledProjects: 0,
  };
  
  // Usar únicamente datos reales del backend
  const activityData = data?.activityData || [];
  const projectStatusData = data?.projectStatusData || [];
  const monthlyStats = data?.monthlyStats || [];
  const topStudents = data?.topStudents || [];
  const topCompanies = data?.topCompanies || [];
  
  // Debug: Verificar datos de empresas
  console.log('🔍 [FRONTEND DEBUG] Top Companies:', topCompanies);
  if (topCompanies && topCompanies.length > 0) {
    console.log('🔍 [FRONTEND DEBUG] Primera empresa:', topCompanies[0]);
    console.log('🔍 [FRONTEND DEBUG] Segunda empresa:', topCompanies[1]);
  }
  
  // Debug: Verificar datos de estudiantes
  console.log('🔍 [FRONTEND DEBUG] Top Students:', topStudents);
  if (topStudents && topStudents.length > 0) {
    console.log('🔍 [FRONTEND DEBUG] Primer estudiante:', topStudents[0]);
    console.log('🔍 [FRONTEND DEBUG] Segundo estudiante:', topStudents[1]);
  }
  
  // Debug: Verificar datos de estados de proyecto
  console.log('🔍 [FRONTEND DEBUG] Project Status Data:', projectStatusData);
  if (projectStatusData && projectStatusData.length > 0) {
    console.log('🔍 [FRONTEND DEBUG] Estados disponibles:', projectStatusData.map(s => s.name));
  }
  const recentActivity = data?.recentActivity || [];
  const pendingRequests = data?.pendingRequests || [];
  
  // Nuevas métricas
  const applicationsMetrics = data?.applicationsMetrics || {
    totalApplications: 0,
    acceptedApplications: 0,
    acceptanceRate: 0,
    byStatus: [],
    topRequestedProjects: []
  };
  
  const strikesMetrics = data?.strikesMetrics || {
    activeStrikes: 0,
    studentsWithStrikes: 0,
    studentsByStrikes: [],
    topReportingCompanies: [],
    monthlyTrend: []
  };
  
  const notificationsMetrics = data?.notificationsMetrics || {
    totalNotifications: 0,
    readNotifications: 0,
    readRate: 0,
    byType: [],
    massNotifications: 0,
    massNotificationsSent: 0
  };
  
  const apiTrlMetrics = data?.apiTrlMetrics || {
    studentsByApiLevel: [],
    projectsByTrl: [],
    totalApiRequests: 0,
    pendingApiRequests: 0,
    approvedApiRequests: 0
  };
  


  // Mostrar loading mientras se cargan los datos
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Mostrar error si hay algún problema
  if (error) {
    return (
      <Box sx={{ maxWidth: 1400, mx: 'auto', mt: 4, mb: 4, px: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <AnalyticsIcon sx={{ fontSize: 40, color: 'error.main' }} />
          <Typography variant="h4" color="error">Error al cargar datos</Typography>
        </Box>
        <Typography variant="body1" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary', mb: 2 }}>
          {error}
        </Typography>
        <Button variant="contained" onClick={refreshData}>
          Reintentar
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: 3, 
      background: themeMode === 'dark' ? '#0f172a' : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', 
      minHeight: '100vh',
      color: themeMode === 'dark' ? '#f1f5f9' : 'inherit'
    }}>
      {/* Header con gradiente */}
      <Card sx={{ 
        mb: 3, 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
        borderRadius: 3
      }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ 
                background: 'rgba(255, 255, 255, 0.2)', 
                borderRadius: 2, 
                p: 1.5, 
                mr: 2,
                backdropFilter: 'blur(10px)'
              }}>
                <AnalyticsIcon sx={{ color: 'white', fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ color: '#ffffff', fontWeight: 'bold', mb: 0.5, textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
                  Gestión de Analytics y Reportes
                </Typography>
                <Typography variant="body2" sx={{ color: '#ffffff', textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>
                  Dashboard de métricas globales y estadísticas del sistema LeanMaker
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={refreshData}
              disabled={loading}
              sx={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.3)',
                }
              }}
            >
              Actualizar Datos
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* KPI Cards Superiores - Diseño Mejorado */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: 2.5, 
        mb: 4 
      }}>
        <Card sx={{ 
          borderRadius: 3, 
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
          bgcolor: '#22c55e', 
          color: 'white',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
          }
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, color: '#ffffff' }}>
                  {stats.totalUsers.toLocaleString()}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, color: '#ffffff' }}>
                  Usuarios Registrados
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, color: '#ffffff' }}>
                  +12% este mes
                </Typography>
              </Box>
              <Box sx={{ 
                p: 2, 
                borderRadius: 2, 
                bgcolor: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <PeopleIcon sx={{ fontSize: 32 }} />
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ 
          borderRadius: 3, 
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
          bgcolor: '#3b82f6', 
          color: 'white',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
          }
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, color: '#ffffff' }}>
                  {stats.totalProjects.toLocaleString()}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, color: '#ffffff' }}>
                  Proyectos Activos
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, color: '#ffffff' }}>
                  {stats.activeProjects} en curso
                </Typography>
              </Box>
              <Box sx={{ 
                p: 2, 
                borderRadius: 2, 
                bgcolor: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <WorkIcon sx={{ fontSize: 32 }} />
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ 
          borderRadius: 3, 
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
          bgcolor: '#f59e0b', 
          color: 'white',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
          }
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, color: '#ffffff' }}>
                  {stats.totalCompanies.toLocaleString()}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, color: '#ffffff' }}>
                  Empresas Colaboradoras
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, color: '#ffffff' }}>
                  {stats.totalStudents} estudiantes
                </Typography>
              </Box>
              <Box sx={{ 
                p: 2, 
                borderRadius: 2, 
                bgcolor: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <BusinessIcon sx={{ fontSize: 32 }} />
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ 
          borderRadius: 3, 
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
          bgcolor: '#8b5cf6', 
          color: 'white',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
          }
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, color: '#ffffff' }}>
                  {stats.totalStudents.toLocaleString()}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, color: '#ffffff' }}>
                  Estudiantes Activos
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, color: '#ffffff' }}>
                  Participando en proyectos
                </Typography>
              </Box>
              <Box sx={{ 
                p: 2, 
                borderRadius: 2, 
                bgcolor: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <SchoolIcon sx={{ fontSize: 32 }} />
              </Box>
            </Box>
          </CardContent>
        </Card>


      </Box>

      {/* Gráficos y Tablas */}
      <Box sx={{ display: 'flex', gap: 4, mb: 10, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Gráfico de Actividad Semanal */}
        <Box sx={{ flex: '2 1 600px', minWidth: 400 }}>
          <Card sx={{ 
            ...powerBICardStyles,
            bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
            color: themeMode === 'dark' ? '#f1f5f9' : 'inherit',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: powerBIGradients.primary,
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ 
                mb: 3, 
                color: themeMode === 'dark' ? '#f1f5f9' : 'inherit',
                fontWeight: 700,
                fontSize: '1.25rem',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                📊 Actividad Semanal
              </Typography>
              {activityData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={activityData}>
                    <defs>
                      <linearGradient id="usuariosGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.9}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.2}/>
                      </linearGradient>
                      <linearGradient id="proyectosGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      </linearGradient>
                      <linearGradient id="aplicacionesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.9}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.2}/>
                      </linearGradient>
                      <linearGradient id="horasGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.9}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke={themeMode === 'dark' ? powerBIGridDarkConfig.stroke : powerBIGridConfig.stroke}
                      opacity={powerBIGridConfig.opacity}
                    />
                    <XAxis 
                      dataKey="name" 
                      tick={themeMode === 'dark' ? powerBIAxisDarkConfig.tick : powerBIAxisConfig.tick}
                      axisLine={themeMode === 'dark' ? powerBIAxisDarkConfig.axisLine : powerBIAxisConfig.axisLine}
                      tickLine={themeMode === 'dark' ? powerBIAxisDarkConfig.tickLine : powerBIAxisConfig.tickLine}
                    />
                    <YAxis 
                      tick={themeMode === 'dark' ? powerBIAxisDarkConfig.tick : powerBIAxisConfig.tick}
                      axisLine={themeMode === 'dark' ? powerBIAxisDarkConfig.axisLine : powerBIAxisConfig.axisLine}
                      tickLine={themeMode === 'dark' ? powerBIAxisDarkConfig.tickLine : powerBIAxisConfig.tickLine}
                    />
                    <Tooltip 
                      contentStyle={themeMode === 'dark' ? powerBITooltipDarkStyles : powerBITooltipStyles}
                      formatter={(value, name) => {
                        const labels = {
                          usuarios: '👥 Usuarios',
                          proyectos: '📋 Proyectos',
                          aplicaciones: '📝 Aplicaciones',
                          horas: '⏰ Horas'
                        };
                        return [value, labels[name as keyof typeof labels] || name];
                      }}
                    />
                    <Legend 
                      wrapperStyle={{
                        color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                        fontSize: '13px',
                        fontWeight: 600,
                        paddingTop: '20px'
                      }}
                      formatter={(value) => {
                        const labels = {
                          usuarios: '👥 Usuarios',
                          proyectos: '📋 Proyectos',
                          aplicaciones: '📝 Aplicaciones',
                          horas: '⏰ Horas'
                        };
                        return labels[value as keyof typeof labels] || value;
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="usuarios" 
                      stroke="#22c55e" 
                      strokeWidth={3}
                      dot={{ 
                        fill: '#22c55e', 
                        strokeWidth: 3, 
                        r: 6,
                        stroke: '#ffffff',
                        filter: 'drop-shadow(0 2px 4px rgba(34, 197, 94, 0.3))'
                      }}
                      activeDot={{ 
                        r: 8, 
                        stroke: '#22c55e', 
                        strokeWidth: 3,
                        fill: '#ffffff',
                        filter: 'drop-shadow(0 4px 8px rgba(34, 197, 94, 0.4))'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="proyectos" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ 
                        fill: '#3b82f6', 
                        strokeWidth: 3, 
                        r: 6,
                        stroke: '#ffffff',
                        filter: 'drop-shadow(0 2px 4px rgba(59, 130, 246, 0.3))'
                      }}
                      activeDot={{ 
                        r: 8, 
                        stroke: '#3b82f6', 
                        strokeWidth: 3,
                        fill: '#ffffff',
                        filter: 'drop-shadow(0 4px 8px rgba(59, 130, 246, 0.4))'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="aplicaciones" 
                      stroke="#f59e0b" 
                      strokeWidth={3}
                      dot={{ 
                        fill: '#f59e0b', 
                        strokeWidth: 3, 
                        r: 6,
                        stroke: '#ffffff',
                        filter: 'drop-shadow(0 2px 4px rgba(245, 158, 11, 0.3))'
                      }}
                      activeDot={{ 
                        r: 8, 
                        stroke: '#f59e0b', 
                        strokeWidth: 3,
                        fill: '#ffffff',
                        filter: 'drop-shadow(0 4px 8px rgba(245, 158, 11, 0.4))'
                      }}
                    />
                    {activityData.some(item => item.horas !== undefined) && (
                      <Line 
                        type="monotone" 
                        dataKey="horas" 
                        stroke="#8b5cf6" 
                        strokeWidth={3}
                        dot={{ 
                          fill: '#8b5cf6', 
                          strokeWidth: 3, 
                          r: 6,
                          stroke: '#ffffff',
                          filter: 'drop-shadow(0 2px 4px rgba(139, 92, 246, 0.3))'
                        }}
                        activeDot={{ 
                          r: 8, 
                          stroke: '#8b5cf6', 
                          strokeWidth: 3,
                          fill: '#ffffff',
                          filter: 'drop-shadow(0 4px 8px rgba(139, 92, 246, 0.4))'
                        }}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: 350,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                  borderRadius: '12px',
                  border: '1px dashed rgba(255,255,255,0.2)'
                }}>
                  <Typography sx={{ 
                    color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary',
                    fontSize: '1.1rem',
                    fontWeight: 500
                  }}>
                    📊 No hay datos de actividad disponibles
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>

                        {/* Gráfico de Estado de Proyectos */}
        <Box sx={{ flex: '1 1 350px', minWidth: 350, maxWidth: 400 }}>
          <Card sx={{ 
            ...powerBICardStyles,
            bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
            color: themeMode === 'dark' ? '#f1f5f9' : 'inherit',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: powerBIGradients.secondary,
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ 
                mb: 3, 
                color: themeMode === 'dark' ? '#f1f5f9' : 'inherit', 
                fontWeight: 700,
                fontSize: '1.25rem',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                🎯 Estado de Proyectos
              </Typography>
              {projectStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <defs>
                      <filter id="pieShadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="6" stdDeviation="12" floodColor="rgba(0,0,0,0.2)"/>
                      </filter>
                    </defs>
                    <Pie
                      data={projectStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${translateProjectStatusToSpanish(name)} ${percent ? (percent * 100).toFixed(0) : '0'}%`}
                      outerRadius={120}
                      innerRadius={60}
                      dataKey="value"
                      stroke={themeMode === 'dark' ? '#334155' : '#ffffff'}
                      strokeWidth={4}
                      filter="url(#pieShadow)"
                    >
                      {projectStatusData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={powerBIColors[index % powerBIColors.length]}
                          stroke={themeMode === 'dark' ? '#1e293b' : '#ffffff'}
                          strokeWidth={3}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
                        border: `1px solid ${themeMode === 'dark' ? '#334155' : '#e2e8f0'}`,
                        borderRadius: '12px',
                        color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                        fontSize: '14px',
                        fontWeight: 600
                      }}
                      formatter={(value, name) => [
                        `${value} proyectos`, 
                        `${name}`
                      ]}
                    />
                    <Legend 
                      wrapperStyle={{
                        color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                        fontSize: '13px',
                        fontWeight: 600,
                        paddingTop: '20px'
                      }}
                      formatter={(value) => `📊 ${translateProjectStatusToSpanish(value)}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: 350,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                  borderRadius: '12px',
                  border: '1px dashed rgba(255,255,255,0.2)'
                }}>
                  <Typography sx={{ 
                    color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary',
                    fontSize: '1.1rem',
                    fontWeight: 500
                  }}>
                    🎯 No hay datos de proyectos disponibles
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

             {/* Gráficos de Estadísticas Mensuales */}
       <Box sx={{ display: 'flex', gap: 10, flexWrap: 'wrap', mb: 4 }}>
        {/* Gráfico de Estadísticas Mensuales */}
        <Box sx={{ flex: '1 1 100%', minWidth: 600 }}>
          <Card sx={{ 
            ...powerBICardStyles,
            bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
            color: themeMode === 'dark' ? '#f1f5f9' : 'inherit',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: powerBIGradients.tertiary,
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ 
                mb: 3, 
                color: themeMode === 'dark' ? '#f1f5f9' : 'inherit', 
                fontWeight: 700,
                fontSize: '1.25rem',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                📈 Estadísticas Mensuales
              </Typography>
              {monthlyStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={monthlyStats}>
                    <defs>
                      <linearGradient id="estudiantesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.9}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0.3}/>
                      </linearGradient>
                      <linearGradient id="proyectosGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      </linearGradient>
                      <linearGradient id="empresasGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.9}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      </linearGradient>
                      <linearGradient id="horasGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.9}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke={themeMode === 'dark' ? '#334155' : '#f1f5f9'}
                      opacity={0.3}
                    />
                    <XAxis 
                      dataKey="name" 
                      tick={{ 
                        fill: themeMode === 'dark' ? '#f1f5f9' : '#1e293b', 
                        fontSize: 12, 
                        fontWeight: 600 
                      }}
                      axisLine={{ 
                        stroke: themeMode === 'dark' ? '#334155' : '#e2e8f0',
                        strokeWidth: 2
                      }}
                      tickLine={{ 
                        stroke: themeMode === 'dark' ? '#334155' : '#e2e8f0',
                        strokeWidth: 2
                      }}
                    />
                    <YAxis 
                      tick={{ 
                        fill: themeMode === 'dark' ? '#f1f5f9' : '#1e293b', 
                        fontSize: 12, 
                        fontWeight: 600 
                      }}
                      axisLine={{ 
                        stroke: themeMode === 'dark' ? '#334155' : '#e2e8f0',
                        strokeWidth: 2
                      }}
                      tickLine={{ 
                        stroke: themeMode === 'dark' ? '#334155' : '#e2e8f0',
                        strokeWidth: 2
                      }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
                        border: `1px solid ${themeMode === 'dark' ? '#334155' : '#e2e8f0'}`,
                        borderRadius: '12px',
                        color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                        fontSize: '14px',
                        fontWeight: 600
                      }}
                      formatter={(value, name) => {
                        const labels = {
                          estudiantes: '👥 Estudiantes',
                          proyectos: '📋 Proyectos',
                          empresas: '🏢 Empresas',
                          horas: '⏰ Horas'
                        };
                        return [value, labels[name as keyof typeof labels] || name];
                      }}
                    />
                    <Legend 
                      wrapperStyle={{
                        color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                        fontSize: '13px',
                        fontWeight: 600,
                        paddingTop: '20px'
                      }}
                      formatter={(value) => {
                        const labels = {
                          estudiantes: '👥 Estudiantes',
                          proyectos: '📋 Proyectos',
                          empresas: '🏢 Empresas',
                          horas: '⏰ Horas'
                        };
                        return labels[value as keyof typeof labels] || value;
                      }}
                    />
                    <Bar 
                      dataKey="estudiantes" 
                      fill="url(#estudiantesGradient)" 
                      radius={[12, 12, 0, 0]}
                      stroke="#22c55e"
                      strokeWidth={2}
                      filter="drop-shadow(0 4px 8px rgba(34, 197, 94, 0.3))"
                    />
                    <Bar 
                      dataKey="proyectos" 
                      fill="url(#proyectosGradient)" 
                      radius={[12, 12, 0, 0]}
                      stroke="#3b82f6"
                      strokeWidth={2}
                      filter="drop-shadow(0 4px 8px rgba(59, 130, 246, 0.3))"
                    />
                    <Bar 
                      dataKey="empresas" 
                      fill="url(#empresasGradient)" 
                      radius={[12, 12, 0, 0]}
                      stroke="#f59e0b"
                      strokeWidth={2}
                      filter="drop-shadow(0 4px 8px rgba(245, 158, 11, 0.3))"
                    />
                    {monthlyStats.some(item => item.horas !== undefined) && (
                      <Bar 
                        dataKey="horas" 
                        fill="url(#horasGradient)" 
                        radius={[12, 12, 0, 0]}
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        filter="drop-shadow(0 4px 8px rgba(139, 92, 246, 0.3))"
                      />
                    )}
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: 350,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                  borderRadius: '12px',
                  border: '1px dashed rgba(255,255,255,0.2)'
                }}>
                  <Typography sx={{ 
                    color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary',
                    fontSize: '1.1rem',
                    fontWeight: 500
                  }}>
                    📈 No hay datos mensuales disponibles
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

       {/* Tablas de Top 20 */}
       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, mt: 6 }}>
         {/* Top 20 Estudiantes */}
        <Box sx={{ width: '100%' }}>
           <Card sx={{ 
             borderRadius: 3, 
             boxShadow: 3,
             bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
             color: themeMode === 'dark' ? '#f1f5f9' : 'inherit'
           }}>
             <CardContent>
               <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                 <Typography variant="h6" sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit' }}>Top 20 Estudiantes</Typography>
                 <Typography variant="body2" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>Por horas en proyectos</Typography>
               </Box>
               {topStudents.length > 0 ? (
                 <TableContainer>
                   <Table>
                     <TableHead>
                       <TableRow>
                         <TableCell sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit', fontWeight: 600 }}>Estudiante</TableCell>
                         <TableCell sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit', fontWeight: 600 }}>Nivel API</TableCell>
                         <TableCell sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit', fontWeight: 600 }}>Horas</TableCell>
                         <TableCell sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit', fontWeight: 600 }}>Proyectos</TableCell>
                         <TableCell sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit', fontWeight: 600 }}>GPA</TableCell>
                       </TableRow>
                     </TableHead>
                     <TableBody>
                       {topStudents.map((student, index) => (
                         <TableRow 
                           key={student.id} 
                           sx={index === 0 ? { 
                             bgcolor: themeMode === 'dark' ? '#334155' : '#fef3c7', 
                             '&:hover': { bgcolor: themeMode === 'dark' ? '#475569' : '#fde68a' } 
                           } : {
                             '&:hover': { bgcolor: themeMode === 'dark' ? '#334155' : '#f8fafc' }
                           }}
                         >
                           <TableCell>
                             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                               <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                                 {index < 3 ? ['🥇', '🥈', '🥉'][index] : student.name.charAt(0)}
                               </Avatar>
                               <Box>
                                 <Typography variant="body2" sx={{ fontWeight: 600, color: themeMode === 'dark' ? '#f1f5f9' : 'inherit' }}>
                                   {student.name}
                                 </Typography>
                                 <Typography variant="caption" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                                   {student.email}
                                 </Typography>
                               </Box>
                             </Box>
                           </TableCell>
                           <TableCell>
                             <Chip 
                               label={`API ${student.level}`}
                               size="small"
                               color={student.level >= 3 ? 'success' : student.level >= 2 ? 'warning' : 'default'}
                               variant={student.level >= 3 ? 'filled' : 'outlined'}
                             />
                           </TableCell>
                           <TableCell>
                             <Typography variant="body2" sx={{ color: '#22c55e', fontWeight: 600 }}>
                               {student.totalHours.toLocaleString()}
                             </Typography>
                           </TableCell>
                                                    <TableCell>
                           <Chip 
                             label={student.completedProjects}
                             size="small"
                             color={student.completedProjects > 0 ? 'primary' : 'default'}
                             variant={student.completedProjects > 0 ? 'filled' : 'outlined'}
                           />
                         </TableCell>
                         <TableCell>
                           <Typography variant="body2" sx={{ fontWeight: 600, color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                             {student.averageRating !== null && student.averageRating !== undefined ? `${student.averageRating}/5` : 'N/A'}
                           </Typography>
                         </TableCell>
                         </TableRow>
                       ))}
                     </TableBody>
                   </Table>
                 </TableContainer>
               ) : (
                 <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                   <Typography sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>No hay datos de estudiantes disponibles</Typography>
                 </Box>
               )}
             </CardContent>
           </Card>
         </Box>

         {/* Top 20 Empresas */}
         <Box sx={{ width: '100%' }}>
           <Card sx={{ 
             borderRadius: 3, 
             boxShadow: 3,
             bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
             color: themeMode === 'dark' ? '#f1f5f9' : 'inherit'
           }}>
             <CardContent>
               <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                 <Typography variant="h6" sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit' }}>Top 20 Empresas</Typography>
                 <Typography variant="body2" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>Por proyectos y horas ofrecidas</Typography>
               </Box>
               {topCompanies.length > 0 ? (
                 <TableContainer>
                   <Table>
                     <TableHead>
                       <TableRow>
                         <TableCell sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit', fontWeight: 600 }}>Empresa</TableCell>
                         <TableCell sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit', fontWeight: 600 }}>Proyectos</TableCell>
                         <TableCell sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit', fontWeight: 600 }}>Activos</TableCell>
                         <TableCell sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit', fontWeight: 600 }}>Estudiantes</TableCell>
                         <TableCell sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit', fontWeight: 600 }}>Horas Ofrecidas</TableCell>
                         <TableCell sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit', fontWeight: 600 }}>GPA</TableCell>
                       </TableRow>
                     </TableHead>
                     <TableBody>
                       {topCompanies.map((company, index) => (
                         <TableRow 
                           key={company.id} 
                           sx={index === 0 ? { 
                             bgcolor: themeMode === 'dark' ? '#334155' : '#dbeafe', 
                             '&:hover': { bgcolor: themeMode === 'dark' ? '#475569' : '#bfdbfe' } 
                           } : {
                             '&:hover': { bgcolor: themeMode === 'dark' ? '#334155' : '#f8fafc' }
                           }}
                         >
                           <TableCell>
                             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                               <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                                 {index < 3 ? ['🏆', '🥈', '🥉'][index] : company.name.charAt(0)}
                               </Avatar>
                               <Box>
                                 <Typography variant="body2" sx={{ fontWeight: 600, color: themeMode === 'dark' ? '#f1f5f9' : 'inherit' }}>
                                   {company.name}
                                 </Typography>
                                 <Typography variant="caption" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                                   {company.industry}
                                 </Typography>
                               </Box>
                             </Box>
                           </TableCell>
                           <TableCell>
                             <Typography variant="body2" sx={{ color: '#3b82f6', fontWeight: 600 }}>
                               {company.totalProjects}
                             </Typography>
                           </TableCell>
                           <TableCell>
                             <Chip 
                               label={company.activeProjects}
                               size="small"
                               color={company.activeProjects > 0 ? 'success' : 'default'}
                               variant={company.activeProjects > 0 ? 'filled' : 'outlined'}
                             />
                           </TableCell>
                           <TableCell>
                             <Chip 
                               label={company.totalStudents}
                               size="small"
                               color={company.totalStudents > 0 ? 'info' : 'default'}
                               variant={company.totalStudents > 0 ? 'filled' : 'outlined'}
                             />
                           </TableCell>
                           <TableCell>
                             <Typography variant="body2" sx={{ color: '#10B981', fontWeight: 600 }}>
                               {company.realHoursOffered ? company.realHoursOffered.toLocaleString() : '0'}
                             </Typography>
                           </TableCell>
                           <TableCell>
                                                        <Typography variant="body2" sx={{ fontWeight: 600, color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                             {company.averageRating !== null && company.averageRating !== undefined ? `${company.averageRating}/5` : 'N/A'}
                           </Typography>
                           </TableCell>
                         </TableRow>
                       ))}
                     </TableBody>
                   </Table>
                 </TableContainer>
               ) : (
                 <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                   <Typography sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>No hay datos de empresas disponibles</Typography>
                 </Box>
               )}
             </CardContent>
           </Card>
         </Box>
       </Box>

        {/* Sección: Métricas de Aplicaciones */}
        <Box sx={{ mt: 6, mb: 4 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            mb: 3,
            pb: 2,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}>
            <Box sx={{ 
              p: 1.5, 
              borderRadius: 2, 
              bgcolor: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Typography sx={{ fontSize: 20, color: 'white' }}>📝</Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: themeMode === 'dark' ? '#f1f5f9' : 'text.primary' }}>
              Métricas de Aplicaciones y Proceso de Selección
            </Typography>
          </Box>
          
          <Card sx={themeMode === 'dark' ? powerBICardStyles.dark : powerBICardStyles.light}>
            <CardContent sx={{ p: 4 }}>
              {/* KPI Cards de Aplicaciones - Diseño Power BI Modern */}
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: 3, 
                mb: 4 
              }}>
                <Box sx={{ 
                  p: 3, 
                  borderRadius: '16px',
                  background: powerBIGradients.primary,
                  textAlign: 'center',
                  boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(16, 185, 129, 0.4)'
                  }
                }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: 'white', mb: 1, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                    {applicationsMetrics.totalApplications}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                    Total de Aplicaciones
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 3, 
                  borderRadius: '16px',
                  background: powerBIGradients.success,
                  textAlign: 'center',
                  boxShadow: '0 8px 32px rgba(34, 197, 94, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(34, 197, 94, 0.4)'
                  }
                }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: 'white', mb: 1, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                    {applicationsMetrics.acceptanceRate}%
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                    Tasa de Aceptación
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 3, 
                  borderRadius: '16px',
                  background: powerBIGradients.warning,
                  textAlign: 'center',
                  boxShadow: '0 8px 32px rgba(245, 158, 11, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(245, 158, 11, 0.4)'
                  }
                }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: 'white', mb: 1, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                    {applicationsMetrics.acceptedApplications}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                    Aplicaciones Aceptadas
                  </Typography>
                </Box>
              </Box>

              {/* Gráficos de Aplicaciones - Nuevo Diseño */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 4 }}>
                {/* Gráfico de Barras - Total de Aplicaciones vs Aceptadas */}
                <Box>
                  <Typography variant="h6" sx={{ 
                    mb: 3, 
                    fontWeight: 700, 
                    color: themeMode === 'dark' ? '#f1f5f9' : 'text.primary',
                    fontSize: '1.1rem',
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    📊 Comparación de Aplicaciones
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                      { 
                        name: 'Total', 
                        aplicaciones: applicationsMetrics.totalApplications || 0, 
                        aceptadas: applicationsMetrics.acceptedApplications || 0 
                      }
                    ]}>
                      <defs>
                        <linearGradient id="totalAppsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        </linearGradient>
                        <linearGradient id="acceptedAppsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.9}/>
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0.3}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke={themeMode === 'dark' ? powerBIGridDarkConfig.stroke : powerBIGridConfig.stroke}
                        opacity={0.3}
                      />
                      <XAxis 
                        dataKey="name" 
                        tick={themeMode === 'dark' ? powerBIAxisDarkConfig.tick : powerBIAxisConfig.tick}
                        axisLine={themeMode === 'dark' ? powerBIAxisDarkConfig.axisLine : powerBIAxisConfig.axisLine}
                        tickLine={themeMode === 'dark' ? powerBIAxisDarkConfig.tickLine : powerBIAxisConfig.tickLine}
                      />
                      <YAxis 
                        tick={themeMode === 'dark' ? powerBIAxisDarkConfig.tick : powerBIAxisConfig.tick}
                        axisLine={themeMode === 'dark' ? powerBIAxisDarkConfig.axisLine : powerBIAxisConfig.axisLine}
                        tickLine={themeMode === 'dark' ? powerBIAxisDarkConfig.tickLine : powerBIAxisConfig.tickLine}
                      />
                      <Tooltip 
                        contentStyle={themeMode === 'dark' ? powerBITooltipDarkStyles : powerBITooltipStyles}
                        formatter={(value, name) => [
                          value, 
                          name === 'aplicaciones' ? '📝 Total Aplicaciones' : '✅ Aplicaciones Aceptadas'
                        ]}
                      />
                      <Legend 
                        wrapperStyle={{
                          color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                          fontSize: '13px',
                          fontWeight: 600,
                          paddingTop: '20px'
                        }}
                        formatter={(value) => 
                          value === 'aplicaciones' ? '📝 Total Aplicaciones' : '✅ Aplicaciones Aceptadas'
                        }
                      />
                      <Bar 
                        dataKey="aplicaciones" 
                        fill="url(#totalAppsGradient)" 
                        radius={powerBIGraphConfig.bar.radius}
                        stroke="#3b82f6"
                        strokeWidth={powerBIGraphConfig.bar.strokeWidth}
                        filter={powerBIGraphConfig.bar.filter}
                      />
                      <Bar 
                        dataKey="aceptadas" 
                        fill="url(#acceptedAppsGradient)" 
                        radius={powerBIGraphConfig.bar.radius}
                        stroke="#22c55e"
                        strokeWidth={powerBIGraphConfig.bar.strokeWidth}
                        filter={powerBIGraphConfig.bar.filter}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>

                {/* Gráfico Circular - Tasa de Aceptación */}
                <Box>
                  <Typography variant="h6" sx={{ 
                    mb: 3, 
                    fontWeight: 700, 
                    color: themeMode === 'dark' ? '#f1f5f9' : 'text.primary',
                    fontSize: '1.1rem',
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    🎯 Tasa de Aceptación
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <defs>
                        <filter id="pieShadow2" x="-50%" y="-50%" width="200%" height="200%">
                          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="rgba(0,0,0,0.15)"/>
                        </filter>
                      </defs>
                      <Pie
                        data={
                          applicationsMetrics.totalApplications > 0 
                            ? [
                                { 
                                  name: '✅ Aceptadas', 
                                  value: applicationsMetrics.acceptedApplications || 0, 
                                  color: powerBIColors[0]
                                },
                                { 
                                  name: '⏳ Pendientes/Rechazadas', 
                                  value: (applicationsMetrics.totalApplications || 0) - (applicationsMetrics.acceptedApplications || 0), 
                                  color: powerBIColors[2]
                                }
                              ].filter(item => item.value > 0)
                            : [
                                { name: '📊 Sin Datos', value: 1, color: '#e2e8f0' }
                              ]
                        }
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => 
                          name === '📊 Sin Datos' 
                            ? '📊 Sin Datos' 
                            : `${name} ${percent ? (percent * 100).toFixed(0) : '0'}%`
                        }
                        outerRadius={powerBIGraphConfig.pie.outerRadius}
                        innerRadius={powerBIGraphConfig.pie.innerRadius}
                        stroke={themeMode === 'dark' ? '#334155' : '#ffffff'}
                        strokeWidth={powerBIGraphConfig.pie.strokeWidth}
                        dataKey="value"
                        filter={powerBIGraphConfig.pie.filter}
                      >
                        {(
                          applicationsMetrics.totalApplications > 0 
                            ? [
                                { 
                                  name: '✅ Aceptadas', 
                                  value: applicationsMetrics.acceptedApplications || 0, 
                                  color: powerBIColors[0]
                                },
                                { 
                                  name: '⏳ Pendientes/Rechazadas', 
                                  value: (applicationsMetrics.totalApplications || 0) - (applicationsMetrics.acceptedApplications || 0), 
                                  color: powerBIColors[2]
                                }
                              ].filter(item => item.value > 0)
                            : [
                                { name: '📊 Sin Datos', value: 1, color: '#e2e8f0' }
                              ]
                        ).map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color}
                            stroke={themeMode === 'dark' ? '#1e293b' : '#ffffff'}
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={themeMode === 'dark' ? powerBITooltipDarkStyles : powerBITooltipStyles}
                        formatter={(value, name) => [
                          `${value} aplicaciones`, 
                          name
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Box>


            </CardContent>
          </Card>
        </Box>

        {/* Sección: Métricas de Strikes y Disciplina */}
        <Box sx={{ mt: 6, mb: 4 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            mb: 3,
            pb: 2,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}>
            <Box sx={{ 
              p: 1.5, 
              borderRadius: 2, 
              bgcolor: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Typography sx={{ fontSize: 20, color: 'white' }}>⚠️</Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: themeMode === 'dark' ? '#f1f5f9' : 'text.primary' }}>
              Métricas de Strikes y Disciplina
            </Typography>
          </Box>
          
          <Card sx={themeMode === 'dark' ? powerBICardStyles.dark : powerBICardStyles.light}>
            <CardContent sx={{ p: 4 }}>
              {/* KPI Cards de Strikes - Diseño Mejorado */}
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: 3, 
                mb: 4 
              }}>
                <Box sx={{ 
                  p: 3, 
                  borderRadius: '16px',
                  background: powerBIGradients.danger,
                  textAlign: 'center',
                  boxShadow: '0 8px 32px rgba(239, 68, 68, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(239, 68, 68, 0.4)'
                  }
                }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: 'white', mb: 1, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                    {strikesMetrics.activeStrikes}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                    Strikes Activos
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 3, 
                  borderRadius: '16px',
                  background: powerBIGradients.warning,
                  textAlign: 'center',
                  boxShadow: '0 8px 32px rgba(245, 158, 11, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(245, 158, 11, 0.4)'
                  }
                }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: 'white', mb: 1, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                    {strikesMetrics.studentsWithStrikes}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                    Estudiantes con Strikes
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 3, 
                  borderRadius: '16px',
                  background: powerBIGradients.success,
                  textAlign: 'center',
                  boxShadow: '0 8px 32px rgba(34, 197, 94, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(34, 197, 94, 0.4)'
                  }
                }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: 'white', mb: 1, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                    {strikesMetrics.topReportingCompanies.length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                    Empresas Reportando
                  </Typography>
                </Box>
              </Box>

              {/* Gráficos de Strikes - Nuevo Diseño */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 4 }}>
                {/* Gráfico de Líneas - Tendencia de Strikes */}
                {strikesMetrics.monthlyTrend.length > 0 && (
                  <Box>
                    <Typography variant="h6" sx={{ 
                      mb: 3, 
                      fontWeight: 700, 
                      color: themeMode === 'dark' ? '#f1f5f9' : 'text.primary',
                      fontSize: '1.1rem',
                      textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                      📈 Tendencia Mensual de Strikes
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={strikesMetrics.monthlyTrend}>
                        <defs>
                          <linearGradient id="strikesGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid 
                          strokeDasharray="3 3" 
                          stroke={themeMode === 'dark' ? '#334155' : '#f1f5f9'}
                          opacity={0.3}
                        />
                        <XAxis 
                          dataKey="month" 
                          tickFormatter={translateMonthToSpanish}
                          tick={{ 
                            fontSize: 12, 
                            fontWeight: 600,
                            fill: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
                          }}
                          axisLine={{ 
                            stroke: themeMode === 'dark' ? '#334155' : '#e2e8f0',
                            strokeWidth: 2
                          }}
                          tickLine={{ 
                            stroke: themeMode === 'dark' ? '#334155' : '#e2e8f0',
                            strokeWidth: 2
                          }}
                        />
                        <YAxis 
                          tick={{ 
                            fontSize: 12, 
                            fontWeight: 600,
                            fill: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
                          }}
                          axisLine={{ 
                            stroke: themeMode === 'dark' ? '#334155' : '#e2e8f0',
                            strokeWidth: 2
                          }}
                          tickLine={{ 
                            stroke: themeMode === 'dark' ? '#334155' : '#e2e8f0',
                            strokeWidth: 2
                          }}
                        />
                        <Tooltip 
                          contentStyle={themeMode === 'dark' ? powerBITooltipDarkStyles : powerBITooltipStyles}
                          formatter={(value, name) => [`${value} strikes`, '⚠️ Strikes']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="strikes" 
                          stroke="#ef4444" 
                          strokeWidth={3}
                          dot={{ 
                            fill: '#ef4444', 
                            strokeWidth: 3, 
                            r: 6,
                            stroke: '#ffffff',
                            filter: 'drop-shadow(0 2px 4px rgba(239, 68, 68, 0.3))'
                          }}
                          activeDot={{ 
                            r: 8, 
                            stroke: '#ef4444', 
                            strokeWidth: 3,
                            fill: '#ffffff',
                            filter: 'drop-shadow(0 4px 8px rgba(239, 68, 68, 0.4))'
                          }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                )}

                {/* Gráfico de Barras - Distribución de Strikes */}
                <Box>
                  <Typography variant="h6" sx={{ 
                    mb: 3, 
                    fontWeight: 700, 
                    color: themeMode === 'dark' ? '#f1f5f9' : 'text.primary',
                    fontSize: '1.1rem',
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    📊 Distribución de Strikes
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                      { 
                        categoria: '⚠️ Strikes Activos', 
                        cantidad: strikesMetrics.activeStrikes,
                        color: '#ef4444'
                      },
                      { 
                        categoria: '👥 Estudiantes con Strikes', 
                        cantidad: strikesMetrics.studentsWithStrikes,
                        color: '#f59e0b'
                      },
                      { 
                        categoria: '🏢 Empresas Reportando', 
                        cantidad: strikesMetrics.topReportingCompanies.length,
                        color: '#22c55e'
                      }
                    ]}>
                      <defs>
                        <linearGradient id="activeStrikesGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.9}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0.3}/>
                        </linearGradient>
                        <linearGradient id="studentsStrikesGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.9}/>
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.3}/>
                        </linearGradient>
                        <linearGradient id="companiesReportingGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.9}/>
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0.3}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke={themeMode === 'dark' ? powerBIGridDarkConfig.stroke : powerBIGridConfig.stroke}
                        opacity={0.3}
                      />
                      <XAxis 
                        dataKey="categoria" 
                        tick={themeMode === 'dark' ? powerBIAxisDarkConfig.tick : powerBIAxisConfig.tick}
                        axisLine={themeMode === 'dark' ? powerBIAxisDarkConfig.axisLine : powerBIAxisConfig.axisLine}
                        tickLine={themeMode === 'dark' ? powerBIAxisDarkConfig.tickLine : powerBIAxisConfig.tickLine}
                      />
                                              <YAxis 
                        tick={themeMode === 'dark' ? powerBIAxisDarkConfig.tick : powerBIAxisConfig.tick}
                        axisLine={themeMode === 'dark' ? powerBIAxisDarkConfig.axisLine : powerBIAxisConfig.axisLine}
                        tickLine={themeMode === 'dark' ? powerBIAxisDarkConfig.tickLine : powerBIAxisConfig.tickLine}
                      />
                      <Tooltip 
                        contentStyle={themeMode === 'dark' ? powerBITooltipDarkStyles : powerBITooltipStyles}
                        formatter={(value, name) => [value, 'Cantidad']}
                      />
                      <Bar 
                        dataKey="cantidad" 
                        fill="url(#activeStrikesGradient)" 
                        radius={powerBIGraphConfig.bar.radius}
                        stroke="#ef4444"
                        strokeWidth={powerBIGraphConfig.bar.strokeWidth}
                        filter={powerBIGraphConfig.bar.filter}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Sección: Métricas de Notificaciones */}
        <Box sx={{ mt: 6, mb: 4 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            mb: 3,
            pb: 2,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}>
            <Box sx={{ 
              p: 1.5, 
              borderRadius: 2, 
              bgcolor: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Typography sx={{ fontSize: 20, color: 'white' }}>🔔</Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: themeMode === 'dark' ? '#f1f5f9' : 'text.primary' }}>
              Métricas de Notificaciones
            </Typography>
          </Box>
          
          <Card sx={themeMode === 'dark' ? powerBICardStyles.dark : powerBICardStyles.light}>
            <CardContent sx={{ p: 4 }}>
              {/* KPI Cards de Notificaciones - Diseño Mejorado */}
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: 3, 
                mb: 4 
              }}>
                <Box sx={{ 
                  p: 3, 
                  borderRadius: '16px',
                  background: powerBIGradients.primary,
                  textAlign: 'center',
                  boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(16, 185, 129, 0.4)'
                  }
                }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: 'white', mb: 1, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                    {notificationsMetrics.totalNotifications}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                    Total de Notificaciones
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 3, 
                  borderRadius: '16px',
                  background: powerBIGradients.success,
                  textAlign: 'center',
                  boxShadow: '0 8px 32px rgba(34, 197, 94, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(34, 197, 94, 0.4)'
                  }
                }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: 'white', mb: 1, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                    {notificationsMetrics.readRate}%
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                    Tasa de Lectura
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 3, 
                  borderRadius: '16px',
                  background: powerBIGradients.warning,
                  textAlign: 'center',
                  boxShadow: '0 8px 32px rgba(245, 158, 11, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(245, 158, 11, 0.4)'
                  }
                }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: 'white', mb: 1, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                    {notificationsMetrics.massNotifications}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                    Notificaciones Masivas
                  </Typography>
                </Box>
              </Box>

              {/* Gráficos de Notificaciones - Nuevo Diseño */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 4 }}>
                {/* Gráfico Circular - Tasa de Lectura */}
                <Box>
                  <Typography variant="h6" sx={{ 
                    mb: 3, 
                    fontWeight: 700, 
                    color: themeMode === 'dark' ? '#f1f5f9' : 'text.primary',
                    fontSize: '1.1rem',
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    📊 Tasa de Lectura de Notificaciones
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <defs>
                        <filter id="pieShadow3" x="-50%" y="-50%" width="200%" height="200%">
                          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="rgba(0,0,0,0.15)"/>
                        </filter>
                      </defs>
                      <Pie
                        data={[
                          { 
                            name: '✅ Leídas', 
                            value: notificationsMetrics.readNotifications, 
                            color: powerBIColors[0] 
                          },
                          { 
                            name: '📧 No Leídas', 
                            value: notificationsMetrics.totalNotifications - notificationsMetrics.readNotifications, 
                            color: powerBIColors[2] 
                          }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : '0'}%`}
                        outerRadius={100}
                        innerRadius={50}
                        stroke={themeMode === 'dark' ? '#334155' : '#ffffff'}
                        strokeWidth={3}
                        dataKey="value"
                        filter="url(#pieShadow3)"
                      >
                        {[
                          { 
                            name: '✅ Leídas', 
                            value: notificationsMetrics.readNotifications, 
                            color: powerBIColors[0] 
                          },
                          { 
                            name: '📧 No Leídas', 
                            value: notificationsMetrics.totalNotifications - notificationsMetrics.readNotifications, 
                            color: powerBIColors[2] 
                          }
                        ].map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color}
                            stroke={themeMode === 'dark' ? '#1e293b' : '#ffffff'}
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={themeMode === 'dark' ? powerBITooltipDarkStyles : powerBITooltipStyles}
                        formatter={(value, name) => [
                          `${value} notificaciones`, 
                          name
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>

                {/* Gráfico de Notificaciones por Tipo */}
                {notificationsMetrics.byType.length > 0 && (
                  <Box>
                    <Typography variant="h6" sx={{ 
                      mb: 3, 
                      fontWeight: 700, 
                      color: themeMode === 'dark' ? '#f1f5f9' : 'text.primary',
                      fontSize: '1.1rem',
                      textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                      📋 Notificaciones por Tipo
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={notificationsMetrics.byType}>
                        <defs>
                          <linearGradient id="notificationsGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid 
                          strokeDasharray="3 3" 
                          stroke={themeMode === 'dark' ? '#334155' : '#f1f5f9'}
                          opacity={0.3}
                        />
                        <XAxis 
                          dataKey="type" 
                          tick={{ 
                            fontSize: 12, 
                            fontWeight: 600,
                            fill: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
                          }}
                          axisLine={{ 
                            stroke: themeMode === 'dark' ? '#334155' : '#e2e8f0',
                            strokeWidth: 2
                          }}
                          tickLine={{ 
                            stroke: themeMode === 'dark' ? '#334155' : '#e2e8f9',
                            strokeWidth: 2
                          }}
                          tickFormatter={(value) => translateNotificationType(value)}
                        />
                        <YAxis 
                          tick={{ 
                            fontSize: 12, 
                            fontWeight: 600,
                            fill: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
                          }}
                          axisLine={{ 
                            stroke: themeMode === 'dark' ? '#334155' : '#e2e8f0',
                            strokeWidth: 2
                          }}
                          tickLine={{ 
                            stroke: themeMode === 'dark' ? '#334155' : '#e2e8f0',
                            strokeWidth: 2
                          }}
                        />
                        <Tooltip 
                          contentStyle={themeMode === 'dark' ? powerBITooltipDarkStyles : powerBITooltipStyles}
                          formatter={(value, name) => [value, 'Notificaciones']}
                          labelFormatter={(label) => translateNotificationType(label)}
                        />
                        <Bar 
                          dataKey="count" 
                          fill="url(#notificationsGradient)" 
                          radius={[8, 8, 0, 0]}
                          stroke="#3b82f6"
                          strokeWidth={1}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Sección: Métricas de API y TRL */}
        <Box sx={{ mt: 6, mb: 4 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            mb: 3,
            pb: 2,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}>
            <Box sx={{ 
              p: 1.5, 
              borderRadius: 2, 
              bgcolor: '#8b5cf6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Typography sx={{ fontSize: 20, color: 'white' }}>📊</Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: themeMode === 'dark' ? '#f1f5f9' : 'text.primary' }}>
              Métricas de Niveles API y TRL
            </Typography>
          </Box>
          
          <Card sx={themeMode === 'dark' ? powerBICardStyles.dark : powerBICardStyles.light}>
            <CardContent sx={{ p: 4 }}>
              {/* KPI Cards de API - Diseño Mejorado */}
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: 3, 
                mb: 4 
              }}>
                <Box sx={{ 
                  p: 3, 
                  borderRadius: '16px',
                  background: powerBIGradients.primary,
                  textAlign: 'center',
                  boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(16, 185, 129, 0.4)'
                  }
                }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: 'white', mb: 1, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                    {apiTrlMetrics.totalApiRequests}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                    Total de Solicitudes API
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 3, 
                  borderRadius: '16px',
                  background: powerBIGradients.warning,
                  textAlign: 'center',
                  boxShadow: '0 8px 32px rgba(245, 158, 11, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(245, 158, 11, 0.4)'
                  }
                }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: 'white', mb: 1, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                    {apiTrlMetrics.pendingApiRequests}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                    Solicitudes Pendientes
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 3, 
                  borderRadius: '16px',
                  background: powerBIGradients.success,
                  textAlign: 'center',
                  boxShadow: '0 8px 32px rgba(34, 197, 94, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(34, 197, 94, 0.4)'
                  }
                }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: 'white', mb: 1, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                    {apiTrlMetrics.approvedApiRequests}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                    Solicitudes Aprobadas
                  </Typography>
                </Box>
              </Box>

              {/* Gráficos de API y TRL - Nuevo Diseño */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 4 }}>
                {/* Gráfico de Barras - Solicitudes API */}
                <Box>
                  <Typography variant="h6" sx={{ 
                    mb: 3, 
                    fontWeight: 700, 
                    color: themeMode === 'dark' ? '#f1f5f9' : 'text.primary',
                    fontSize: '1.1rem',
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    📊 Estado de Solicitudes API
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                      { 
                        estado: '📋 Total', 
                        solicitudes: apiTrlMetrics.totalApiRequests || 0,
                        color: powerBIColors[0]
                      },
                      { 
                        estado: '⏳ Pendientes', 
                        solicitudes: apiTrlMetrics.pendingApiRequests || 0,
                        color: powerBIColors[2]
                      },
                      { 
                        estado: '✅ Aprobadas', 
                        solicitudes: apiTrlMetrics.approvedApiRequests || 0,
                        color: powerBIColors[4]
                      }
                    ]}>
                      <defs>
                        <linearGradient id="totalApiGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        </linearGradient>
                        <linearGradient id="pendingApiGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.9}/>
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.3}/>
                        </linearGradient>
                        <linearGradient id="approvedApiGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.9}/>
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0.3}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke={themeMode === 'dark' ? powerBIGridDarkConfig.stroke : powerBIGridConfig.stroke}
                        opacity={0.3}
                      />
                      <XAxis 
                        dataKey="estado" 
                        tick={themeMode === 'dark' ? powerBIAxisDarkConfig.tick : powerBIAxisConfig.tick}
                        axisLine={themeMode === 'dark' ? powerBIAxisDarkConfig.axisLine : powerBIAxisConfig.axisLine}
                        tickLine={{ 
                          stroke: themeMode === 'dark' ? '#334155' : '#e2e8f0',
                          strokeWidth: 2
                        }}
                      />
                      <YAxis 
                        tick={themeMode === 'dark' ? powerBIAxisDarkConfig.tick : powerBIAxisConfig.tick}
                        axisLine={themeMode === 'dark' ? powerBIAxisDarkConfig.axisLine : powerBIAxisConfig.axisLine}
                        tickLine={themeMode === 'dark' ? powerBIAxisDarkConfig.tickLine : powerBIAxisConfig.tickLine}
                      />
                      <Tooltip 
                        contentStyle={themeMode === 'dark' ? powerBITooltipDarkStyles : powerBITooltipStyles}
                        formatter={(value, name) => [value, 'Solicitudes']}
                      />
                      <Bar 
                        dataKey="solicitudes" 
                        fill="url(#totalApiGradient)" 
                        radius={powerBIGraphConfig.bar.radius}
                        stroke="#3b82f6"
                        strokeWidth={powerBIGraphConfig.bar.strokeWidth}
                        filter={powerBIGraphConfig.bar.filter}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>

                {/* Gráfico Circular - Distribución de Solicitudes */}
                <Box>
                  <Typography variant="h6" sx={{ 
                    mb: 3, 
                    fontWeight: 700, 
                    color: themeMode === 'dark' ? '#f1f5f9' : 'text.primary',
                    fontSize: '1.1rem',
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    🎯 Distribución de Solicitudes API
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <defs>
                        <filter id="pieShadow4" x="-50%" y="-50%" width="200%" height="200%">
                          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="rgba(0,0,0,0.15)"/>
                        </filter>
                      </defs>
                      <Pie
                        data={
                          apiTrlMetrics.totalApiRequests > 0 
                            ? [
                                { 
                                  name: '✅ Aprobadas', 
                                  value: apiTrlMetrics.approvedApiRequests || 0, 
                                  color: powerBIColors[0]
                                },
                                { 
                                  name: '⏳ Pendientes', 
                                  value: apiTrlMetrics.pendingApiRequests || 0, 
                                  color: powerBIColors[2]
                                },
                                { 
                                  name: '❌ Rechazadas', 
                                  value: Math.max(0, (apiTrlMetrics.totalApiRequests || 0) - (apiTrlMetrics.approvedApiRequests || 0) - (apiTrlMetrics.pendingApiRequests || 0)), 
                                  color: powerBIColors[4]
                                }
                              ].filter(item => item.value > 0)
                            : [
                                { name: '📊 Sin Datos', value: 1, color: '#e2e8f0' }
                              ]
                        }
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => 
                          name === '📊 Sin Datos' 
                            ? '📊 Sin Datos' 
                            : `${name} ${percent ? (percent * 100).toFixed(0) : '0'}%`
                        }
                        outerRadius={powerBIGraphConfig.pie.outerRadius}
                        innerRadius={powerBIGraphConfig.pie.innerRadius}
                        stroke={themeMode === 'dark' ? '#334155' : '#ffffff'}
                        strokeWidth={powerBIGraphConfig.pie.strokeWidth}
                        dataKey="value"
                        filter={powerBIGraphConfig.pie.filter}
                      >
                        {(
                          apiTrlMetrics.totalApiRequests > 0 
                            ? [
                                { 
                                  name: '✅ Aprobadas', 
                                  value: apiTrlMetrics.approvedApiRequests || 0, 
                                  color: powerBIColors[0]
                                },
                                { 
                                  name: '⏳ Pendientes', 
                                  value: apiTrlMetrics.pendingApiRequests || 0, 
                                  color: powerBIColors[2]
                                },
                                { 
                                  name: '❌ Rechazadas', 
                                  value: Math.max(0, (apiTrlMetrics.totalApiRequests || 0) - (apiTrlMetrics.approvedApiRequests || 0) - (apiTrlMetrics.pendingApiRequests || 0)), 
                                  color: powerBIColors[4]
                                }
                              ].filter(item => item.value > 0)
                            : [
                                { name: '📊 Sin Datos', value: 1, color: '#e2e8f0' }
                              ]
                        ).map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color}
                            stroke={themeMode === 'dark' ? '#1e293b' : '#ffffff'}
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={themeMode === 'dark' ? powerBITooltipDarkStyles : powerBITooltipStyles}
                        formatter={(value, name) => [
                          `${value} solicitudes`, 
                          name
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Box>

              {/* Gráficos de Estudiantes por Nivel API y Proyectos por TRL */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 4, mt: 4 }}>
                {/* Gráfico de Estudiantes por Nivel API */}
                <Box>
                  <Typography variant="h6" sx={{ 
                    mb: 3, 
                    fontWeight: 700, 
                    color: themeMode === 'dark' ? '#f1f5f9' : 'text.primary',
                    fontSize: '1.1rem',
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    👥 Distribución de Estudiantes por Nivel API
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={
                      apiTrlMetrics.studentsByApiLevel.length > 0 
                        ? apiTrlMetrics.studentsByApiLevel.map(item => ({
                            api_level: `API ${item.api_level}`,
                            count: item.count
                          }))
                        : [
                            { api_level: 'API 1', count: 0 },
                            { api_level: 'API 2', count: 0 },
                            { api_level: 'API 3', count: 0 },
                            { api_level: 'API 4', count: 0 },
                            { api_level: 'API 5', count: 0 }
                          ]
                    }>
                      <defs>
                        <linearGradient id="apiLevelGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.9}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke={themeMode === 'dark' ? '#334155' : '#f1f5f9'}
                        opacity={0.3}
                      />
                      <XAxis 
                        dataKey="api_level" 
                        tick={{ 
                          fontSize: 12, 
                          fontWeight: 600,
                          fill: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
                        }}
                        axisLine={{ 
                          stroke: themeMode === 'dark' ? '#334155' : '#e2e8f0',
                          strokeWidth: 2
                        }}
                        tickLine={{ 
                          stroke: themeMode === 'dark' ? '#334155' : '#e2e8f0',
                          strokeWidth: 2
                        }}
                      />
                      <YAxis 
                        tick={{ 
                          fontSize: 12, 
                          fontWeight: 600,
                          fill: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
                        }}
                        axisLine={{ 
                          stroke: themeMode === 'dark' ? '#334155' : '#e2e8f0',
                          strokeWidth: 2
                        }}
                        tickLine={{ 
                          stroke: themeMode === 'dark' ? '#334155' : '#e2e8f0',
                          strokeWidth: 2
                        }}
                      />
                      <Tooltip 
                        contentStyle={themeMode === 'dark' ? powerBITooltipDarkStyles : powerBITooltipStyles}
                        formatter={(value, name) => [value, 'Estudiantes']}
                      />
                      <Bar 
                        dataKey="count" 
                        fill="url(#apiLevelGradient)" 
                        radius={[8, 8, 0, 0]}
                        stroke="#8b5cf6"
                        strokeWidth={1}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                  {apiTrlMetrics.studentsByApiLevel.length === 0 && (
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      height: 200,
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                      borderRadius: '12px',
                      border: '1px dashed rgba(255,255,255,0.2)'
                    }}>
                      <Typography sx={{ 
                        color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary',
                        fontSize: '1.1rem',
                        fontWeight: 500
                      }}>
                        📊 No hay datos de distribución de estudiantes por nivel API
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Gráfico de Proyectos por Nivel TRL */}
                <Box>
                  <Typography variant="h6" sx={{ 
                    mb: 3, 
                    fontWeight: 700, 
                    color: themeMode === 'dark' ? '#f1f5f9' : 'text.primary',
                    fontSize: '1.1rem',
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    📋 Proyectos por Nivel TRL
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={
                      apiTrlMetrics.projectsByTrl.length > 0 
                        ? apiTrlMetrics.projectsByTrl.map(item => ({
                            trl_level: `TRL ${item.trl_level}`,
                            count: item.count
                          }))
                        : [
                            { trl_level: 'TRL 1', count: 0 },
                            { trl_level: 'TRL 2', count: 0 },
                            { trl_level: 'TRL 3', count: 0 },
                            { trl_level: 'TRL 4', count: 0 },
                            { trl_level: 'TRL 5', count: 0 },
                            { trl_level: 'TRL 6', count: 0 },
                            { trl_level: 'TRL 7', count: 0 },
                            { trl_level: 'TRL 8', count: 0 },
                            { trl_level: 'TRL 9', count: 0 }
                          ]
                    }>
                      <defs>
                        <linearGradient id="trlLevelGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.9}/>
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.3}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke={themeMode === 'dark' ? '#334155' : '#f1f5f9'}
                        opacity={0.3}
                      />
                      <XAxis 
                        dataKey="trl_level"
                        tick={{ fontSize: 12, fill: themeMode === 'dark' ? '#cbd5e1' : '#64748b' }}
                      />
                      <YAxis 
                        tick={{ fontSize: 12, fill: themeMode === 'dark' ? '#cbd5e1' : '#64748b' }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
                          border: `1px solid ${themeMode === 'dark' ? '#334155' : '#e2e8f0'}`,
                          borderRadius: '8px',
                          color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
                        }}
                      />
                      <Bar 
                        dataKey="count" 
                        fill="url(#trlLevelGradient)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                  {apiTrlMetrics.projectsByTrl.length === 0 && (
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      height: 200,
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                      borderRadius: '12px',
                      border: '1px dashed rgba(255,255,255,0.2)'
                    }}>
                              <Typography sx={{
          color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary',
          fontSize: '1.1rem',
          fontWeight: 500,
          textAlign: 'center'
        }}>
          📊 No hay proyectos con nivel TRL asignado
          <br />
          <Typography variant="body2" sx={{
            color: themeMode === 'dark' ? '#94a3b8' : '#64748b',
            mt: 1,
            fontSize: '0.9rem'
          }}>
            Los proyectos deben tener un nivel TRL asignado para aparecer en esta métrica
          </Typography>
          {analyticsData?.apiTrlMetrics?.projectsWithoutTrl > 0 && (
            <Typography variant="body2" sx={{
              color: themeMode === 'dark' ? '#fbbf24' : '#d97706',
              mt: 2,
              fontSize: '0.9rem',
              fontWeight: 500
            }}>
              ⚠️ {analyticsData.apiTrlMetrics.projectsWithoutTrl} proyecto(s) sin TRL asignado
            </Typography>
          )}
        </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* ===== NUEVAS SECCIONES ===== */}
        
        {/* Sección: Métricas de Satisfacción y Calidad */}
        <Box sx={{ mt: 6, mb: 4 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            mb: 3,
            pb: 2,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}>
            <Box sx={{ 
              p: 1.5, 
              borderRadius: 2, 
              bgcolor: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Typography sx={{ fontSize: 20, color: 'white' }}>⭐</Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: themeMode === 'dark' ? '#f1f5f9' : 'text.primary' }}>
              Métricas de Satisfacción y Calidad
            </Typography>
          </Box>
          
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            transition: 'all 0.3s ease',
            bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
            color: themeMode === 'dark' ? '#f1f5f9' : 'inherit',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px rgba(0,0,0,0.12)'
            }
          }}>
            <CardContent sx={{ p: 4 }}>
              {/* KPI Cards de Satisfacción */}
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: 3, 
                mb: 4 
              }}>
                <Box sx={{ 
                  p: 3, 
                  borderRadius: 2, 
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  textAlign: 'center',
                  border: '1px solid',
                  borderColor: '#10b981',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)'
                  }
                }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: 'white', mb: 1 }}>
                    {analyticsData?.satisfactionMetrics?.averageProjectRating || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                    Calificación Promedio
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    ⭐⭐⭐⭐⭐
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 3, 
                  borderRadius: 2, 
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  textAlign: 'center',
                  border: '1px solid',
                  borderColor: '#3b82f6',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)'
                  }
                }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: 'white', mb: 1 }}>
                    {analyticsData?.satisfactionMetrics?.companySatisfactionRate || 0}%
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Satisfacción Empresas
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Muy Satisfechas
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 3, 
                  borderRadius: 2, 
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  textAlign: 'center',
                  border: '1px solid',
                  borderColor: '#8b5cf6',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(139, 92, 246, 0.3)'
                  }
                }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: 'white', mb: 1 }}>
                    {analyticsData?.satisfactionMetrics?.repeatProjectsCount || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                    Empresas Recurrentes
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Proyectos Repetidos
                  </Typography>
                </Box>
              </Box>

              {/* Gráficos de Satisfacción */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 4 }}>
                {/* Gráfico de Calificaciones */}
                <Box>
                  <Typography variant="h6" sx={{ 
                    mb: 3, 
                    fontWeight: 700, 
                    color: themeMode === 'dark' ? '#f1f5f9' : 'text.primary',
                    fontSize: '1.1rem',
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    📊 Distribución de Calificaciones
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analyticsData?.satisfactionMetrics?.ratingDistribution?.map(item => ({
                      rating: `${item.rating}⭐`,
                      count: item.count,
                      color: powerBIColors[item.rating - 1] || powerBIColors[0]
                    })) || [
                      { rating: '1⭐', count: 0, color: '#ef4444' },
                      { rating: '2⭐⭐', count: 0, color: '#f59e0b' },
                      { rating: '3⭐⭐⭐', count: 0, color: '#eab308' },
                      { rating: '4⭐⭐⭐⭐', count: 0, color: '#22c55e' },
                      { rating: '5⭐⭐⭐⭐⭐', count: 0, color: '#10b981' }
                    ]}>
                      <defs>
                        <linearGradient id="ratingGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.9}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.3}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke={themeMode === 'dark' ? '#334155' : '#f1f5f9'}
                        opacity={0.3}
                      />
                      <XAxis 
                        dataKey="rating"
                        tick={{ fontSize: 12, fill: themeMode === 'dark' ? '#cbd5e1' : '#64748b' }}
                      />
                      <YAxis 
                        tick={{ fontSize: 12, fill: themeMode === 'dark' ? '#cbd5e1' : '#64748b' }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
                          border: `1px solid ${themeMode === 'dark' ? '#334155' : '#e2e8f0'}`,
                          borderRadius: '8px',
                          color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
                        }}
                        formatter={(value, name) => [`${value} proyectos`, 'Cantidad']}
                      />
                      <Bar 
                        dataKey="count" 
                        fill="url(#ratingGradient)"
                        radius={[8, 8, 0, 0]}
                        stroke="#10b981"
                        strokeWidth={2}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>

                {/* Gráfico de Satisfacción por Área - Solo se muestra cuando hay datos reales */}
                {(() => {
                  const satisfactionData = analyticsData?.satisfactionMetrics?.satisfactionByArea;
                  const hasRealData = satisfactionData && satisfactionData.some(item => item.totalProjects > 0);
                  
                  if (!hasRealData) {
                    return null; // No mostrar nada si no hay datos reales
                  }
                  
                  return (
                    <Box>
                      <Typography variant="h6" sx={{ 
                        mb: 3, 
                        fontWeight: 700, 
                        color: themeMode === 'dark' ? '#f1f5f9' : 'text.primary',
                        fontSize: '1.1rem',
                        textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}>
                        🎯 Satisfacción por Área de Proyecto
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={satisfactionData.filter(item => item.totalProjects > 0)}>
                          <defs>
                            <linearGradient id="satisfactionGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.9}/>
                              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid 
                            strokeDasharray="3 3" 
                            stroke={themeMode === 'dark' ? '#334155' : '#f1f5f9'}
                            opacity={0.3}
                          />
                          <XAxis 
                            dataKey="area"
                            tick={{ fontSize: 12, fill: themeMode === 'dark' ? '#cbd5e1' : '#64748b' }}
                          />
                          <YAxis 
                            tick={{ fontSize: 12, fill: themeMode === 'dark' ? '#cbd5e1' : '#64748b' }}
                            domain={[0, 100]}
                            tickFormatter={(value) => `${value}%`}
                          />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
                              border: `1px solid ${themeMode === 'dark' ? '#334155' : '#e2e8f0'}`,
                              borderRadius: '8px',
                              color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
                            }}
                            formatter={(value, name, props) => [
                              `${value}%`,
                              `Satisfacción - ${props.payload.area}`
                            ]}
                            labelFormatter={(label) => `Área: ${label}`}
                          />
                          <Bar 
                            dataKey="satisfaction" 
                            fill="url(#satisfactionGradient)"
                            radius={[8, 8, 0, 0]}
                            stroke="#8b5cf6"
                            strokeWidth={2}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  );
                })()}
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Sección: Métricas de Eficiencia de Proyectos */}
        <Box sx={{ mt: 6, mb: 4 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            mb: 3,
            pb: 2,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}>
            <Box sx={{ 
              p: 1.5, 
              borderRadius: 2, 
              bgcolor: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Typography sx={{ fontSize: 20, color: 'white' }}>⚡</Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: themeMode === 'dark' ? '#f1f5f9' : 'text.primary' }}>
              Métricas de Eficiencia de Proyectos
            </Typography>
          </Box>
          
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            transition: 'all 0.3s ease',
            bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
            color: themeMode === 'dark' ? '#f1f5f9' : 'inherit',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px rgba(0,0,0,0.12)'
            }
          }}>
            <CardContent sx={{ p: 4 }}>
              {/* KPI Cards de Eficiencia */}
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: 3, 
                mb: 4 
              }}>
                <Box sx={{ 
                  p: 3, 
                  borderRadius: 2, 
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  textAlign: 'center',
                  border: '1px solid',
                  borderColor: '#f59e0b',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(245, 158, 11, 0.3)'
                  }
                }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: 'white', mb: 1 }}>
                    {analyticsData?.efficiencyMetrics?.efficiencyRate || 0}%
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                    Tasa de Éxito
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Proyectos Completados
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 3, 
                  borderRadius: 2, 
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  textAlign: 'center',
                  border: '1px solid',
                  borderColor: '#ef4444',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(239, 68, 68, 0.3)'
                  }
                }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: 'white', mb: 1 }}>
                    {analyticsData?.efficiencyMetrics?.projectsExtendingDeadline || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                    Proyectos Extendidos
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Más allá de fecha límite
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 3, 
                  borderRadius: 2, 
                  background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                  textAlign: 'center',
                  border: '1px solid',
                  borderColor: '#06b6d4',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(6, 182, 212, 0.3)'
                  }
                }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: 'white', mb: 1 }}>
                    {analyticsData?.efficiencyMetrics?.hoursEfficiency || 0}%
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                    Precisión Estimación
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Horas reales vs. estimadas
                  </Typography>
                </Box>
              </Box>

              {/* Gráficos de Eficiencia */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 4 }}>
                {/* Gráfico de Eficiencia por Área - Solo se muestra cuando hay datos reales */}
                {(() => {
                  const efficiencyData = analyticsData?.efficiencyMetrics?.efficiencyByArea;
                  const hasRealData = efficiencyData && efficiencyData.some(item => item.totalProjects > 0);
                  
                  if (!hasRealData) {
                    return null; // No mostrar nada si no hay datos reales
                  }
                  
                  return (
                    <Box>
                      <Typography variant="h6" sx={{ 
                        mb: 3, 
                        fontWeight: 700, 
                        color: themeMode === 'dark' ? '#f1f5f9' : 'text.primary',
                        fontSize: '1.1rem',
                        textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}>
                        ⏱️ Eficiencia de Tiempo por Área
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={efficiencyData.filter(item => item.totalProjects > 0)}>
                          <defs>
                            <linearGradient id="efficiencyGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.9}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0.3}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid 
                            strokeDasharray="3 3" 
                            stroke={themeMode === 'dark' ? '#334155' : '#f1f5f9'}
                            opacity={0.3}
                          />
                          <XAxis 
                            dataKey="area"
                            tick={{ fontSize: 12, fill: themeMode === 'dark' ? '#cbd5e1' : '#64748b' }}
                          />
                          <YAxis 
                            tick={{ fontSize: 12, fill: themeMode === 'dark' ? '#cbd5e1' : '#64748b' }}
                            tickFormatter={(value) => `${value}%`}
                          />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
                              border: `1px solid ${themeMode === 'dark' ? '#334155' : '#e2e8f0'}`,
                              borderRadius: '8px',
                              color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
                            }}
                            formatter={(value, name, props) => [
                              `${value}%`,
                              `Eficiencia - ${props.payload.area}`
                            ]}
                            labelFormatter={(label) => `Área: ${label}`}
                          />
                          <Bar 
                            dataKey="averageEfficiency" 
                            fill="url(#efficiencyGradient)"
                            radius={[8, 8, 0, 0]}
                            stroke="#10b981"
                            strokeWidth={2}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  );
                })()}

                {/* Gráfico de Éxito por Área - Solo se muestra cuando hay datos reales */}
                {(() => {
                  const efficiencyData = analyticsData?.efficiencyMetrics?.efficiencyByArea;
                  const hasRealData = efficiencyData && efficiencyData.some(item => item.totalProjects > 0);
                  
                  if (!hasRealData) {
                    return null; // No mostrar nada si no hay datos reales
                  }
                  
                  return (
                    <Box>
                      <Typography variant="h6" sx={{ 
                        mb: 3, 
                        fontWeight: 700, 
                        color: themeMode === 'dark' ? '#f1f5f9' : 'text.primary',
                        fontSize: '1.1rem',
                        textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}>
                        🎯 Tasa de Éxito por Área de Proyecto
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <defs>
                            <filter id="efficiencyShadow" x="-50%" y="-50%" width="200%" height="200%">
                              <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="rgba(0,0,0,0.15)"/>
                            </filter>
                          </defs>
                          <Pie
                            data={efficiencyData.filter(item => item.totalProjects > 0).map(item => ({
                              name: item.area,
                              value: item.successRate,
                              color: item.color
                            }))}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}\n${value}%`}
                            outerRadius={100}
                            innerRadius={50}
                            stroke={themeMode === 'dark' ? '#334155' : '#ffffff'}
                            strokeWidth={3}
                            dataKey="value"
                            filter="url(#efficiencyShadow)"
                          >
                            {efficiencyData.filter(item => item.totalProjects > 0).map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={entry.color}
                                stroke={themeMode === 'dark' ? '#1e293b' : '#ffffff'}
                                strokeWidth={2}
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
                              border: `1px solid ${themeMode === 'dark' ? '#334155' : '#e2e8f0'}`,
                              borderRadius: '8px',
                              color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
                            }}
                            formatter={(value, name) => [`${value}%`, 'Tasa de Éxito']}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  );
                })()}
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Sección: Métricas Financieras */}
        <Box sx={{ mt: 6, mb: 4 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            mb: 3,
            pb: 2,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}>
            <Box sx={{ 
              p: 1.5, 
              borderRadius: 2, 
              bgcolor: '#22c55e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Typography sx={{ fontSize: 20, color: 'white' }}>💰</Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: themeMode === 'dark' ? '#f1f5f9' : 'text.primary' }}>
              Métricas Financieras e Impacto
            </Typography>
          </Box>
          
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            transition: 'all 0.3s ease',
            bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
            color: themeMode === 'dark' ? '#f1f5f9' : 'inherit',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px rgba(0,0,0,0.12)'
            }
          }}>
            <CardContent sx={{ p: 4 }}>
              {/* KPI Cards Financieros */}
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: 3, 
                mb: 4 
              }}>
                <Box sx={{ 
                  p: 3, 
                  borderRadius: 2, 
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  textAlign: 'center',
                  border: '1px solid',
                  borderColor: '#22c55e',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(34, 197, 94, 0.3)'
                  }
                }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: 'white', mb: 1 }}>
                    ${(analyticsData?.financialMetrics?.estimatedHoursValue || 0).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                    Valor Horas Trabajadas
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Tasa ${analyticsData?.financialMetrics?.hourlyRate || 0}/h promedio
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 3, 
                  borderRadius: 2, 
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  textAlign: 'center',
                  border: '1px solid',
                  borderColor: '#f97316',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(249, 115, 22, 0.3)'
                  }
                }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: 'white', mb: 1 }}>
                    {analyticsData?.financialMetrics?.savingsPercentage || 0}%
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                    Ahorro Empresas
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    vs. Contratación Tradicional
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 3, 
                  borderRadius: 2, 
                  background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                  textAlign: 'center',
                  border: '1px solid',
                  borderColor: '#ec4899',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(236, 72, 153, 0.3)'
                  }
                }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: 'white', mb: 1 }}>
                    {(analyticsData?.financialMetrics?.studentROI || 0) / 100}x
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                    ROI Estudiantes
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Experiencia vs. Tiempo Invertido
                  </Typography>
                </Box>
              </Box>

              {/* Gráficos Financieros */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 4 }}>
                {/* Gráfico de Valor por Mes */}
                <Box>
                  <Typography variant="h6" sx={{ 
                    mb: 3, 
                    fontWeight: 700, 
                    color: themeMode === 'dark' ? '#f1f5f9' : 'text.primary',
                    fontSize: '1.1rem',
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    📈 Valor Generado por Mes
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={analyticsData?.financialMetrics?.monthlyImpact?.map(item => ({
                      month: item.month,
                      value: item.value,
                      hours: item.hours
                    })) || [
                      { month: 'Sin datos', value: 0, hours: 0 }
                    ]}>
                      <defs>
                        <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke={themeMode === 'dark' ? '#334155' : '#f1f5f9'}
                        opacity={0.3}
                      />
                      <XAxis 
                        dataKey="month"
                        tick={{ fontSize: 12, fill: themeMode === 'dark' ? '#cbd5e1' : '#64748b' }}
                      />
                      <YAxis 
                        tick={{ fontSize: 12, fill: themeMode === 'dark' ? '#cbd5e1' : '#64748b' }}
                        tickFormatter={(value) => `$${(value/1000).toFixed(1)}K`}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
                          border: `1px solid ${themeMode === 'dark' ? '#334155' : '#e2e8f0'}`,
                          borderRadius: '8px',
                          color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
                        }}
                        formatter={(value, name) => [
                          name === 'value' ? `$${value}` : `${value} horas`,
                          name === 'value' ? 'Valor' : 'Horas'
                        ]}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#22c55e" 
                        strokeWidth={3}
                        fill="url(#valueGradient)"
                        fillOpacity={0.8}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>

                {/* Gráfico de Comparación de Costos */}
                {(() => {
                  const costData = analyticsData?.financialMetrics?.costComparisonByArea || [];
                  const hasRealData = costData.some(item => item.totalHoursAvailable > 0);
                  
                  // Si no hay datos reales, no mostrar el gráfico
                  if (!hasRealData) {
                    return null;
                  }
                  
                  return (
                    <Box>
                      <Typography variant="h6" sx={{ 
                        mb: 3, 
                        fontWeight: 700, 
                        color: themeMode === 'dark' ? '#f1f5f9' : 'text.primary',
                        fontSize: '1.1rem',
                        textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}>
                        💰 Comparación de Costos por Área
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={costData}>
                          <defs>
                            <linearGradient id="traditionalGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.9}/>
                              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.3}/>
                            </linearGradient>
                            <linearGradient id="platformGradient" x1="0" y1="0" x2="0" y2="1">
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
                            dataKey="area"
                            tick={{ fontSize: 12, fill: themeMode === 'dark' ? '#cbd5e1' : '#64748b' }}
                          />
                          <YAxis 
                            tick={{ fontSize: 12, fill: themeMode === 'dark' ? '#cbd5e1' : '#64748b' }}
                            tickFormatter={(value) => `$${(value/1000).toFixed(0)}K`}
                          />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
                              border: `1px solid ${themeMode === 'dark' ? '#334155' : '#e2e8f0'}`,
                              borderRadius: '8px',
                              color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
                            }}
                            formatter={(value, name) => [
                              name === 'traditional' ? `$${value.toLocaleString()}` : 
                              name === 'platform' ? `$${value.toLocaleString()}` : 
                              `$${value.toLocaleString()}`,
                              name === 'traditional' ? 'Contratación Tradicional' : 
                              name === 'platform' ? 'Nuestra Plataforma' : 'Ahorro'
                            ]}
                          />
                          <Legend />
                          <Bar 
                            dataKey="traditional" 
                            fill="url(#traditionalGradient)"
                            radius={[8, 8, 0, 0]}
                            stroke="#ef4444"
                            strokeWidth={2}
                            name="Contratación Tradicional"
                          />
                          <Bar 
                            dataKey="platform" 
                            fill="url(#platformGradient)"
                            radius={[8, 8, 0, 0]}
                            stroke="#22c55e"
                            strokeWidth={2}
                            name="Nuestra Plataforma"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  );
                })()}
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* ===== FIN DE NUEVAS SECCIONES ===== */}

    </Box>
  );
};

export default ReportesYAnalytics; 