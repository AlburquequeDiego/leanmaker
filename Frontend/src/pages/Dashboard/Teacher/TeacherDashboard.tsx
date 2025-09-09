/**
 * 🎓 TEACHER DASHBOARD - DASHBOARD PRINCIPAL DEL DOCENTE
 * 
 * DESCRIPCIÓN:
 * Este componente es el dashboard principal del docente que muestra métricas clave (KPIs),
 * estadísticas en tiempo real y visualizaciones de datos sobre sus actividades académicas.
 * 
 * FUNCIONALIDADES PRINCIPALES:
 * - 6 tarjetas KPI con métricas clave del docente
 * - Gráfico de dona para distribución de estudiantes por proyecto
 * - Gráfico de barras para actividad mensual
 * - Diseño responsivo con tema claro/oscuro
 * - Conexión en tiempo real con el backend
 * 
 * CONEXIONES CON LA BASE DE DATOS:
 * - Endpoint: /api/dashboard/teacher_stats/
 * - Hook: useOptimizedDashboardStats('teacher')
 * - Datos: Estadísticas del docente, estudiantes, proyectos, evaluaciones
 * 
 * ARQUITECTURA:
 * - Frontend: React + TypeScript + Material-UI + Recharts
 * - Backend: Django REST API
 * - Estado: useAuth, useTheme, useOptimizedDashboardStats
 * 
 * AUTOR: Sistema LeanMaker
 * FECHA: 2024
 * VERSIÓN: 1.0
 */

import { useEffect, useState, memo, Suspense } from 'react';
import { Box, Paper, Typography, Tooltip, IconButton, Grid, Skeleton, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import NotificationsIcon from '@mui/icons-material/Notifications';
import InfoIcon from '@mui/icons-material/Info';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useOptimizedDashboardStats } from '../../../hooks/useOptimizedDashboardStats';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../contexts/ThemeContext';
import { ConnectionStatus } from '../../../components/common/ConnectionStatus';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

/**
 * 🦴 COMPONENTE SKELETON PARA CARGA DEL DASHBOARD
 * Muestra esqueletos animados mientras se cargan los datos
 */
const DashboardSkeleton = () => (
  <Box sx={{ p: 3 }}>
    {/* Header skeleton */}
    <Box sx={{ mb: 3 }}>
      <Skeleton variant="text" width="60%" height={48} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="40%" height={24} />
    </Box>
    
    {/* Grid de tarjetas skeleton */}
    <Box sx={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 3, 
      mb: 3 
    }}>
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton 
          key={index}
          variant="rectangular" 
          width="100%" 
          height={160}
          sx={{ borderRadius: 2 }}
        />
      ))}
    </Box>
    
    {/* Gráficos skeleton */}
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Skeleton variant="rectangular" width="100%" height={400} sx={{ borderRadius: 2 }} />
      </Grid>
      <Grid item xs={12} md={6}>
        <Skeleton variant="rectangular" width="100%" height={400} sx={{ borderRadius: 2 }} />
      </Grid>
    </Grid>
  </Box>
);

/**
 * 🎨 PALETA DE COLORES ESTILO POWER BI
 * Colores profesionales, claros y vibrantes para mejor visibilidad
 * Cada color tiene un propósito específico en la interfaz
 */
const powerBIColors = [
  '#00D4AA', // Teal brillante - Color principal del sistema
  '#6366F1', // Indigo vibrante - Color secundario
  '#EF4444', // Rojo brillante - Para elementos destacados
  '#F59E0B', // Amarillo dorado - Para elementos premium
  '#10B981', // Verde esmeralda - Para elementos importantes
  '#8B5CF6', // Púrpura vibrante - Para elementos especiales
  '#06B6D4', // Cian brillante - Para elementos informativos
  '#84CC16', // Verde lima - Para elementos de éxito
  '#F97316', // Naranja vibrante - Para elementos de atención
];

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

// Estilos Power BI para tooltips - Mejorados para mayor visibilidad
const powerBITooltipStyles = {
  backgroundColor: 'rgba(255, 255, 255, 0.98)',
  backdropFilter: 'blur(20px)',
  border: '2px solid rgba(0, 0, 0, 0.15)',
  borderRadius: '16px',
  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.2), 0 4px 20px rgba(0, 0, 0, 0.15)',
  padding: '16px 20px',
  fontSize: '14px',
  fontWeight: 700,
  color: '#1e293b'
};

// Estilos Power BI para dark mode tooltips - Mejorados para mayor visibilidad
const powerBITooltipDarkStyles = {
  backgroundColor: 'rgba(30, 41, 59, 0.98)',
  backdropFilter: 'blur(20px)',
  border: '2px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '16px',
  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4), 0 4px 20px rgba(0, 0, 0, 0.3)',
  padding: '16px 20px',
  fontSize: '14px',
  fontWeight: 700,
  color: '#ffffff'
};

// Componente de tarjeta KPI reutilizable
interface KPICardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
  route?: string;          // Ruta a la que navegar al hacer clic
  onClick?: () => void;    // Función personalizada de clic
}

const KPICard = ({ title, value, description, icon, bgColor, textColor, route, onClick }: KPICardProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const navigate = useNavigate();

  // Función para manejar el clic en la tarjeta
  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else if (route) {
      navigate(route);
    }
  };

  return (
    <Paper 
      onClick={handleCardClick}
      sx={{
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
        cursor: route || onClick ? 'pointer' : 'default',
        transition: 'box-shadow 0.2s',
        flexShrink: 0,
        flexGrow: 0,
        '&:hover': {
          boxShadow: route || onClick ? 6 : 4,
          transform: route || onClick ? 'translateY(-2px)' : 'none'
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
      
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h3" fontWeight={800} sx={{ fontSize: '2.5rem' }}>
          {value}
        </Typography>
        {(route || onClick) && (
          <ArrowForwardIcon 
            sx={{ 
              color: textColor, 
              opacity: 0.7,
              fontSize: 20
            }} 
          />
        )}
      </Box>
    </Paper>
  );
};

// Componente principal del dashboard
const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const { themeMode } = useTheme();
  const navigate = useNavigate();
  
  // Hook para obtener estadísticas del dashboard
  const { data: stats, loading, error, refetch, lastUpdate, isPolling } = useOptimizedDashboardStats('teacher');
  
  // Estado local para datos por defecto (solo si no hay datos del backend)
  const [defaultStats] = useState({
    total_students: 0,
    active_projects: 0,
    completed_evaluations: 0,
    pending_evaluations: 0,
    total_hours_supervised: 0,
    notifications: 0,
  });

  // Datos para gráficos - solo si hay datos reales
  const studentProjectDistribution = stats && (stats as any).student_distribution ? 
    (stats as any).student_distribution : [];

  const monthlyActivity = stats && (stats as any).monthly_activity ? 
    (stats as any).monthly_activity : [];

  // Usar datos del backend si están disponibles, sino usar valores por defecto
  const displayStats = stats ? {
    total_students: (stats as any).total_students || 0,
    active_projects: (stats as any).active_projects || 0,
    completed_evaluations: (stats as any).completed_evaluations || 0,
    pending_evaluations: (stats as any).pending_evaluations || 0,
    total_hours_supervised: (stats as any).total_hours_supervised || 0,
    notifications: (stats as any).notifications || 0,
  } : defaultStats;

  // Debug: Log de los datos recibidos
  console.log('🎓 [TeacherDashboard] Stats recibidos:', stats);
  console.log('🎓 [TeacherDashboard] Display stats:', displayStats);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error" sx={{ mb: 2 }}>
          Error al cargar el dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {error}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Mostrando valores por defecto hasta que se resuelva la conexión con el backend.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button variant="outlined" onClick={() => refetch()}>
            Reintentar
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} sx={{ color: 'primary.main', mb: 1 }}>
          🎓 Dashboard del Docente
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Bienvenido, {user?.full_name || user?.email}. Aquí tienes un resumen de tus actividades académicas.
        </Typography>
        
        {/* Información de datos */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {stats ? '📊 Datos en tiempo real' : '📋 Valores por defecto'}
          </Typography>
          {lastUpdate && (
            <Typography variant="caption" color="text.secondary">
              Última actualización: {lastUpdate.toLocaleTimeString()}
            </Typography>
          )}
        </Box>
        
        <ConnectionStatus 
          isConnected={!error}
          isPolling={isPolling}
          lastUpdate={lastUpdate}
          error={error}
        />
      </Box>

      {/* Tarjetas KPI */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <KPICard
            title="Estudiantes Asignados"
            value={displayStats.total_students}
            description="Total de estudiantes bajo tu supervisión académica"
            icon={<SchoolIcon sx={{ fontSize: 32 }} />}
            bgColor={powerBIColors[0]}
            textColor="white"
            route="/dashboard/teacher/students"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <KPICard
            title="Proyectos Activos"
            value={displayStats.active_projects}
            description="Proyectos en los que tus estudiantes están trabajando actualmente"
            icon={<AssignmentIcon sx={{ fontSize: 32 }} />}
            bgColor={powerBIColors[1]}
            textColor="white"
            route="/dashboard/teacher/projects"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <KPICard
            title="Evaluaciones Completadas"
            value={displayStats.completed_evaluations}
            description="Evaluaciones que has completado este semestre"
            icon={<CheckCircleIcon sx={{ fontSize: 32 }} />}
            bgColor={powerBIColors[2]}
            textColor="white"
            route="/dashboard/teacher/evaluations"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <KPICard
            title="Evaluaciones Pendientes"
            value={displayStats.pending_evaluations}
            description="Evaluaciones que requieren tu atención"
            icon={<HourglassBottomIcon sx={{ fontSize: 32 }} />}
            bgColor={powerBIColors[3]}
            textColor="white"
            route="/dashboard/teacher/evaluations"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <KPICard
            title="Horas Supervisadas"
            value={`${displayStats.total_hours_supervised}h`}
            description="Total de horas de supervisión académica"
            icon={<TrendingUpIcon sx={{ fontSize: 32 }} />}
            bgColor={powerBIColors[4]}
            textColor="white"
            route="/dashboard/teacher/reports"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <KPICard
            title="Notificaciones"
            value={displayStats.notifications}
            description="Notificaciones pendientes de revisar"
            icon={<NotificationsIcon sx={{ fontSize: 32 }} />}
            bgColor={powerBIColors[5]}
            textColor="white"
            route="/dashboard/teacher/notifications"
          />
        </Grid>
      </Grid>

      {/* Gráficos - Solo mostrar si hay datos reales */}
      {(studentProjectDistribution.length > 0 || monthlyActivity.length > 0) && (
        <Grid container spacing={3}>
          {studentProjectDistribution.length > 0 && (
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: 400 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: 'primary.main' }}>
                  📊 Estudiantes por Proyecto
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={studentProjectDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {studentProjectDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || powerBIColors[index % powerBIColors.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={themeMode === 'dark' ? powerBITooltipDarkStyles : powerBITooltipStyles}
                        formatter={(value: any) => [`${value} estudiantes`, 'Cantidad']}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
          )}
          
          {monthlyActivity.length > 0 && (
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: 400 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: 'primary.main' }}>
                  📈 Actividad Mensual
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyActivity}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <RechartsTooltip 
                        contentStyle={themeMode === 'dark' ? powerBITooltipDarkStyles : powerBITooltipStyles}
                        formatter={(value: any, name: string) => [
                          `${value} ${name === 'students' ? 'estudiantes' : 'evaluaciones'}`,
                          name === 'students' ? 'Estudiantes' : 'Evaluaciones'
                        ]}
                      />
                      <Legend />
                      <Bar dataKey="students" fill={powerBIColors[0]} name="Estudiantes" />
                      <Bar dataKey="evaluations" fill={powerBIColors[1]} name="Evaluaciones" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}

      {/* Mensaje cuando no hay datos para gráficos */}
      {studentProjectDistribution.length === 0 && monthlyActivity.length === 0 && stats && (
        <Paper elevation={2} sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            📊 Gráficos y Visualizaciones
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Los gráficos se mostrarán cuando tengas datos de estudiantes y proyectos asignados.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default TeacherDashboard;