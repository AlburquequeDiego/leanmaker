/**
 * 🎓 STUDENT DASHBOARD - DASHBOARD PRINCIPAL DEL ESTUDIANTE
 * 
 * DESCRIPCIÓN:
 * Este componente es el dashboard principal del estudiante que muestra métricas clave (KPIs),
 * estadísticas en tiempo real y visualizaciones de datos sobre su progreso académico y profesional.
 * 
 * FUNCIONALIDADES PRINCIPALES:
 * - 9 tarjetas KPI con métricas clave del estudiante
 * - Gráfico de dona para distribución de aplicaciones
 * - Gráfico de barras para actividad mensual
 * - Diseño responsivo con tema claro/oscuro
 * - Conexión en tiempo real con el backend
 * 
 * CONEXIONES CON LA BASE DE DATOS:
 * - Endpoint: /api/dashboard/student_stats/
 * - Hook: useDashboardStats('student')
 * - Datos: Estadísticas del estudiante, aplicaciones, proyectos, horas trabajadas
 * 
 * ARQUITECTURA:
 * - Frontend: React + TypeScript + Material-UI + Recharts
 * - Backend: Django REST API
 * - Estado: useAuth, useTheme, useDashboardStats
 * 
 * AUTOR: Sistema LeanMaker
 * FECHA: 2024
 * VERSIÓN: 1.0
 */

import { useEffect, useState, memo, Suspense } from 'react';
import { Box, Paper, Typography, Tooltip, IconButton, Grid, Skeleton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CodeIcon from '@mui/icons-material/Code';
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
      {Array.from({ length: 9 }).map((_, index) => (
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
  '#3B82F6', // Azul brillante - Para elementos de confianza
  '#F97316', // Naranja vibrante - Para alertas
  '#8B5CF6', // Púrpura vibrante - Para elementos especiales
  '#06B6D4', // Cian brillante - Para elementos críticos
  '#EC4899'  // Rosa vibrante - Para elementos suaves
];

/**
 * 🌍 FUNCIÓN PARA TRADUCIR MESES DEL INGLÉS AL ESPAÑOL
 * Convierte los nombres de meses recibidos del backend en inglés a español
 * para mostrar en la interfaz del usuario
 */
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

/**
 * 🎨 ESTILOS POWER BI PARA TOOLTIPS EN TEMA CLARO
 * Estilos modernos con efectos de blur y sombras para tooltips profesionales
 */
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

/**
 * 🎨 ESTILOS POWER BI PARA TOOLTIPS EN TEMA OSCURO
 * Adaptación de los estilos para el modo oscuro manteniendo la consistencia visual
 */
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

/**
 * 📊 INTERFAZ PARA PROPIEDADES DE LA TARJETA KPI
 * Define la estructura de datos necesaria para crear tarjetas de métricas
 */
interface KPICardProps {
  title: string;           // Título principal de la tarjeta
  value: string | number;  // Valor numérico o texto a mostrar
  description: string;     // Descripción detallada para el tooltip
  icon: React.ReactNode;   // Icono de Material-UI
  bgColor: string;         // Color de fondo de la tarjeta
  textColor: string;       // Color del texto y elementos
  route?: string;          // Ruta a la que navegar al hacer clic
  onClick?: () => void;    // Función personalizada de clic
}

/**
 * 📊 COMPONENTE TARJETA KPI REUTILIZABLE
 * 
 * DESCRIPCIÓN:
 * Componente que renderiza una tarjeta de métrica clave (KPI) con diseño interactivo.
 * Incluye tooltip informativo, iconografía y efectos hover.
 * 
 * CARACTERÍSTICAS:
 * - Diseño responsivo con altura fija
 * - Tooltip informativo con botón de información
 * - Efectos hover con sombras
 * - Iconografía descriptiva
 * - Colores personalizables
 * 
 * PROPS:
 * - title: Título de la métrica
 * - value: Valor numérico o texto
 * - description: Descripción detallada
 * - icon: Icono representativo
 * - bgColor: Color de fondo
 * - textColor: Color del texto
 */
const KPICard = memo(({ title, value, description, icon, bgColor, textColor, route, onClick }: KPICardProps) => {
  // Estado para controlar la visibilidad del tooltip
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
    <Tooltip
      title={route || onClick ? `Haz clic para ir a ${title}` : title}
      placement="top"
      arrow
    >
      <Paper 
        onClick={handleCardClick}
        sx={{
        p: 2.5,                    // Padding interno
        width: '100%',             // Ancho completo del contenedor
        height: 160,               // Altura fija para consistencia visual
        minHeight: 160,            // Altura mínima
        maxHeight: 160,            // Altura máxima
        display: 'flex',           // Layout flexbox
        flexDirection: 'column',   // Dirección vertical
        bgcolor: bgColor,          // Color de fondo personalizable
        color: textColor,          // Color del texto personalizable
        boxShadow: 2,              // Sombra base
        borderRadius: 3,            // Bordes redondeados
        justifyContent: 'space-between', // Distribución del espacio
        cursor: 'pointer',         // Cursor de puntero
        transition: 'all 0.2s ease', // Transición suave para hover
        flexShrink: 0,             // No permitir reducción
        flexGrow: 0,               // No permitir crecimiento
        '&:hover': {
          boxShadow: 6,            // Sombra aumentada en hover
          transform: 'translateY(-2px)', // Efecto de elevación
          bgcolor: `${bgColor}dd`  // Color ligeramente más oscuro en hover
        },
        '&:active': {
          transform: 'translateY(0px)', // Efecto de presión al hacer clic
          boxShadow: 3
        }
      }}
    >
      {/* Header de la tarjeta con título e icono de información */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Contenedor del icono principal */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            flexShrink: 0        // Evitar que el icono se reduzca
          }}>
            {icon}
          </Box>
          {/* Título de la tarjeta con tipografía responsiva */}
          <Typography variant="h6" fontWeight={700} sx={{ 
            ml: 1,               // Margen izquierdo del icono
            fontSize: 'clamp(0.8rem, 2vw, 1.25rem)', // Tamaño responsivo
            lineHeight: 1.1,     // Altura de línea compacta
            wordBreak: 'break-word',     // Romper palabras largas
            overflowWrap: 'break-word'   // Envolver texto largo
          }}>
            {title}
          </Typography>
        </Box>
        
        {/* Indicador de navegación y tooltip informativo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Flecha indicadora de navegación (solo si hay ruta o onClick) */}
          {(route || onClick) && (
            <ArrowForwardIcon 
              sx={{ 
                fontSize: 16, 
                color: textColor,
                opacity: 0.8,
                transition: 'all 0.2s ease',
                '&:hover': {
                  opacity: 1,
                  transform: 'translateX(2px)'
                }
              }} 
            />
          )}
          
          {/* Tooltip informativo con botón de información */}
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
              onClick={(e) => {
                e.stopPropagation(); // Evitar que se active el clic de la tarjeta
                setShowTooltip(!showTooltip);
              }}
              sx={{
                color: textColor,
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)' // Efecto hover sutil
                }
              }}
            >
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Valor principal de la métrica con tipografía destacada */}
      <Typography variant="h3" fontWeight={700} sx={{ 
        textAlign: 'center',     // Centrado horizontal
        my: 2,                   // Margen vertical
        fontSize: 'clamp(1.5rem, 4vw, 3rem)', // Tamaño responsivo grande
        lineHeight: 1.1,         // Altura de línea compacta
        wordBreak: 'break-word', // Romper palabras largas
        overflowWrap: 'break-word' // Envolver texto largo
      }}>
        {value}
      </Typography>
    </Paper>
    </Tooltip>
  );
});

/**
 * 🎓 COMPONENTE PRINCIPAL DEL DASHBOARD DEL ESTUDIANTE
 * 
 * DESCRIPCIÓN:
 * Dashboard principal que muestra todas las métricas y estadísticas del estudiante
 * en tiempo real. Incluye 9 tarjetas KPI y 2 gráficos de visualización de datos.
 * 
 * FUNCIONALIDADES:
 * - Métricas en tiempo real del estudiante
 * - Visualización de datos con gráficos interactivos
 * - Diseño responsivo y adaptable
 * - Tema claro/oscuro
 * - Estado de conexión con el backend
 * 
 * HOOKS UTILIZADOS:
 * - useAuth: Para obtener información del usuario autenticado
 * - useTheme: Para el modo de tema (claro/oscuro)
 * - useDashboardStats: Para obtener estadísticas en tiempo real
 * 
 * CONEXIONES CON BACKEND:
 * - Endpoint: /api/dashboard/student_stats/
 * - Autenticación: Token Bearer en headers
 * - Datos: Estadísticas del estudiante, aplicaciones, proyectos, horas
 */
export default function StudentDashboard() {
  // Hook para obtener información del usuario autenticado
  const { user } = useAuth();
  
  // Hook para obtener el modo de tema (claro/oscuro)
  const { themeMode } = useTheme();
  
  // Hook optimizado para obtener estadísticas del dashboard
  const { data: stats, loading, error, lastUpdate, isPolling } = useOptimizedDashboardStats('student', {
    pollingInterval: 30000, // 30 segundos
    enablePolling: true,
    cacheTime: 60000 // 1 minuto
  });

  /**
   * 🔍 FUNCIÓN PARA OBTENER NOMBRE DE DISPLAY DEL USUARIO
   * 
   * LÓGICA:
   * 1. Prioriza full_name si está disponible
   * 2. Combina first_name + last_name si ambos están disponibles
   * 3. Usa solo first_name si está disponible
   * 4. Fallback a 'Estudiante' si no hay información
   * 
   * RETORNA: String con el nombre más apropiado para mostrar
   */
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

  /**
   * 📊 EXTRACCIÓN Y VALIDACIÓN DE DATOS DE ESTADÍSTICAS
   * 
   * DESCRIPCIÓN:
   * Extrae los valores de las estadísticas del backend con valores por defecto
   * para evitar errores cuando los datos están cargando o son undefined.
   * 
   * DATOS EXTRAÍDOS:
   * - strikes: Número de strikes del estudiante (máximo 3)
   * - gpa: Promedio académico
   * - total_hours: Horas totales trabajadas
   * - active_projects: Proyectos activos
   * - total_applications: Total de aplicaciones enviadas
   * - available_projects: Proyectos disponibles para aplicar
   * - completed_projects: Proyectos completados exitosamente
   * - api_level: Nivel de acceso a la API (1-4)
   * - unread_notifications: Notificaciones no leídas
   */
  const strikes = stats?.strikes ?? 0;
  const maxStrikes = 3; // Máximo de strikes permitidos antes de restricciones
  const gpa = stats?.gpa ?? 0;
  const totalHours = stats?.total_hours ?? 0;
  const activeProjects = stats?.active_projects ?? 0;
  const totalApplications = stats?.total_applications ?? 0;
  const availableProjects = stats?.available_projects ?? 0;
  const completedProjects = stats?.completed_projects ?? 0;
  const apiLevel = stats?.api_level ?? null; // NO usar valor por defecto
  const unreadNotifications = stats?.unread_notifications ?? 0;

  /**
   * 🐛 LOG PARA DEBUGGING DE GRÁFICOS
   * 
   * DESCRIPCIÓN:
   * Efecto que se ejecuta cuando cambian las estadísticas para mostrar
   * información de debugging en la consola del navegador.
   * 
   * DATOS LOGGEADOS:
   * - Estadísticas completas recibidas
   * - Distribución de aplicaciones
   * - Actividad mensual
   * 
   * PROPÓSITO: Ayudar en el desarrollo y debugging de la interfaz
   */
  useEffect(() => {
    if (stats) {
      console.log('[StudentDashboard] Stats received:', stats);
      console.log('[StudentDashboard] Application distribution:', stats.application_distribution);
      console.log('[StudentDashboard] Monthly activity:', stats.monthly_activity);
    }
  }, [stats]);

  /**
   * ⏳ ESTADO DE CARGA
   * 
   * DESCRIPCIÓN:
   * Muestra un skeleton animado mientras se obtienen las estadísticas
   * del backend para una mejor experiencia de usuario.
   */
  if (loading) {
    return <DashboardSkeleton />;
  }

  /**
   * ❌ ESTADO DE ERROR
   * 
   * DESCRIPCIÓN:
   * Muestra un mensaje de error cuando falla la obtención de estadísticas
   * del backend. Incluye el mensaje de error específico para debugging.
   */
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

  // Función para traducir nombres de estados del inglés al español
  const translateChartData = (data: any[]) => {
    if (!data || !Array.isArray(data)) return [];
    
    return data.map(item => ({
      ...item,
      name: item.name === 'reviewing' ? 'En Revisión' : 
            item.name === 'pending' ? 'Pendiente' :
            item.name === 'accepted' ? 'Aceptada' :
            item.name === 'rejected' ? 'Rechazada' :
            item.name === 'completed' ? 'Completada' :
            item.name === 'active' ? 'Activa' :
            item.name === 'withdrawn' ? 'Retirada' :
            item.name
    }));
  };

  // Datos traducidos para el gráfico circular
  const translatedApplicationData = translateChartData(stats?.application_distribution || []);

  // Componente de tooltip personalizado para el gráfico circular
  const CustomPieTooltip = ({ active, payload, themeMode }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <Box
          sx={{
            backgroundColor: themeMode === 'dark' ? 'rgba(30, 41, 59, 0.98)' : 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            border: themeMode === 'dark' ? '2px solid rgba(255, 255, 255, 0.2)' : '2px solid rgba(0, 0, 0, 0.15)',
            borderRadius: '16px',
            boxShadow: themeMode === 'dark' ? '0 12px 40px rgba(0, 0, 0, 0.4), 0 4px 20px rgba(0, 0, 0, 0.3)' : '0 12px 40px rgba(0, 0, 0, 0.2), 0 4px 20px rgba(0, 0, 0, 0.15)',
            padding: '16px 20px',
            fontSize: '14px',
            fontWeight: 700,
            color: themeMode === 'dark' ? '#ffffff' : '#1e293b'
          }}
        >
          <Typography variant="body2" sx={{ color: 'inherit', fontWeight: 600 }}>
            {data.name}
          </Typography>
          <Typography variant="body2" sx={{ color: 'inherit', fontWeight: 700, mt: 1 }}>
            {data.value} aplicaciones
          </Typography>
        </Box>
      );
    }
    return null;
  };

  /**
   * 🎨 RENDERIZADO PRINCIPAL DEL DASHBOARD
   * 
   * ESTRUCTURA:
   * 1. Header con título personalizado y estado de conexión
   * 2. Grid de 9 tarjetas KPI (3x3)
   * 3. Gráficos de visualización de datos
   * 
   * DISEÑO:
   * - Tema adaptable (claro/oscuro)
   * - Layout responsivo con CSS Grid
   * - Colores consistentes con el sistema de diseño
   */
  return (
    <Box sx={{ 
      flexGrow: 1, 
      p: 3, 
      bgcolor: themeMode === 'dark' ? '#0f172a' : '#f8fafc', 
      minHeight: '100vh',
      color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
    }}>
      {/* Header del dashboard con título personalizado y estado de conexión */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b' }}>
            Bienvenido a tu Dashboard - {getUserDisplayName()}
          </Typography>
          <Typography variant="body2" sx={{ 
            color: themeMode === 'dark' ? '#94a3b8' : '#64748b', 
            mt: 0.5,
            fontStyle: 'italic'
          }}>
            💡 Haz clic en cualquier tarjeta para ir a la sección correspondiente
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Componente de estado de conexión que muestra el estado del backend */}
          <ConnectionStatus
            isConnected={!error}
            isPolling={isPolling}
            lastUpdate={lastUpdate}
            error={error}
          />
        </Box>
      </Box>
      
      {/* Grid de tarjetas KPI principales - Diseño 3x3 con altura fija */}
      {/* 💡 TIP: Todas las tarjetas son clickeables y te llevan a las secciones específicas */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)',    // 3 columnas de igual ancho
        gridTemplateRows: 'repeat(3, 160px)',    // 3 filas de altura fija
        gap: 3,                                  // Espaciado entre tarjetas
        mb: 3,                                   // Margen inferior
        maxWidth: '100%',                        // Ancho máximo
        width: '100%'                            // Ancho completo
      }}>
        
        {/* 🕐 TARJETA 1: HORAS ACUMULADAS */}
        <KPICard
          title="Horas Acumuladas"
          value={totalHours}
          description="Total de horas de experiencia acumuladas trabajando en proyectos. Cada hora registrada y validada contribuye a tu experiencia profesional y desarrollo de habilidades técnicas."
          icon={<TrendingUpIcon sx={{ fontSize: 28 }} />}
          bgColor="#1565c0"  // Azul profesional
          textColor="white"
          route="/dashboard/student/my-projects"
        />
        
                 {/* 📋 TARJETA 2: PROYECTOS DISPONIBLES */}
         <KPICard
           title="Proyectos Disponibles"
           value={availableProjects}
           description="Número de proyectos activos que están abiertos para aplicaciones. Estos proyectos representan nuevas oportunidades para desarrollar tus habilidades y ganar experiencia profesional."
           icon={<AssignmentIcon sx={{ fontSize: 28 }} />}
           bgColor="#42a5f5"  // Azul claro
           textColor="white"
           route="/dashboard/student/available-projects"
         />
        
        {/* 📝 TARJETA 3: MIS APLICACIONES */}
        <KPICard
          title="Mis Aplicaciones"
          value={totalApplications}
          description="Total de aplicaciones que has enviado a proyectos. Incluye aplicaciones pendientes de revisión, aceptadas y rechazadas. Monitorea el estado de tus aplicaciones activas."
          icon={<AssignmentIcon sx={{ fontSize: 28 }} />}
          bgColor="#8e24aa"  // Púrpura
          textColor="white"
          route="/dashboard/student/my-applications"
        />
        
                 {/* ⚠️ TARJETA 4: STRIKES */}
         <KPICard
           title="Strikes"
           value={`${strikes} / ${maxStrikes}`}
           description="Sistema de advertencias por incumplimiento de entregas. Tienes un máximo de 3 strikes antes de restricciones. Los strikes se asignan cuando no entregas proyectos en tiempo y forma."
           icon={<WarningAmberIcon sx={{ fontSize: 28, color: '#d32f2f' }} />}
           bgColor="#ff9800"  // Naranja de advertencia
           textColor="white"
         />
        
                 {/* ✅ TARJETA 5: PROYECTOS ACTIVOS */}
         <KPICard
           title="Proyectos Activos"
           value={activeProjects}
           description="Proyectos en los que actualmente estás participando y trabajando activamente. Estos son proyectos donde has sido aceptado y estás registrando horas de trabajo."
           icon={<CheckCircleIcon sx={{ fontSize: 28 }} />}
           bgColor="#2e7d32"  // Verde de éxito
           textColor="white"
           route="/dashboard/student/my-projects?tab=1"
         />
        
        {/* 📊 TARJETA 6: GPA ACTUAL */}
        <KPICard
          title="GPA Actual"
          value={gpa && gpa > 0 ? gpa : 'Sin GPA'}
          description="Promedio académico actual basado en las calificaciones recibidas por tu trabajo en proyectos. Refleja tu rendimiento académico y profesional en la plataforma."
          icon={<TrendingUpIcon sx={{ fontSize: 28, color: 'white' }} />}
          bgColor="#f57c00"  // Naranja
          textColor="white"
          route="/dashboard/student/evaluations"
        />
         
                 {/* 🏁 TARJETA 7: PROYECTOS COMPLETADOS */}
         <KPICard
           title="Proyectos Completados"
           value={completedProjects}
           description="Número total de proyectos que has terminado exitosamente. Cada proyecto completado representa una experiencia valiosa y contribuye a tu portafolio profesional."
           icon={<CheckCircleIcon sx={{ fontSize: 28 }} />}
           bgColor="#4caf50"  // Verde lima
           textColor="white"
           route="/dashboard/student/my-projects?tab=2"
         />
        
        {/* 🔧 TARJETA 8: NIVEL DE API */}
        <KPICard
          title="Nivel API"
          value={apiLevel || 'Cargando...'}
          description={
            !apiLevel 
              ? "Cargando nivel API..."
              : apiLevel === 1 
              ? "Nivel API 1: Asesoría - Puedes comprender conceptos básicos y trabajar bajo supervisión directa. Horas máximas permitidas: 20 horas."
              : apiLevel === 2 
              ? "Nivel API 2: Asesoría + Propuesta - Puedes trabajar en tareas prácticas con guía y supervisión. Horas máximas permitidas: 40 horas."
              : apiLevel === 3 
              ? "Nivel API 3: Asesoría + Propuesta + Implementación - Puedes trabajar de forma independiente en proyectos complejos. Horas máximas permitidas: 80 horas."
              : "Nivel API 4: Asesoría + Propuesta + Implementación + Upgrade - Puedes liderar proyectos complejos e innovar en soluciones. Horas máximas permitidas: 160 horas."
          }
          icon={<CodeIcon sx={{ fontSize: 28 }} />}
          bgColor="#8e24aa"  // Púrpura
          textColor="white"
          route="/dashboard/student/api-questionnaire"
        />
         
        {/* 🔔 TARJETA 9: NOTIFICACIONES NUEVAS */}
        <KPICard
          title="Notificaciones Nuevas"
          value={unreadNotifications}
          description="Número de notificaciones no leídas que requieren tu atención. Incluye actualizaciones de proyectos, evaluaciones y mensajes importantes del sistema."
          icon={<NotificationsIcon sx={{ fontSize: 28 }} />}
          bgColor="#f44336"  // Rojo de alerta
          textColor="white"
          route="/dashboard/student/notifications"
        />
      </Box>
      
      {/* 📈 SECCIÓN DE GRÁFICOS DE VISUALIZACIÓN DE DATOS */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        
                 {/* 🥧 GRÁFICO 1: GRÁFICO DE DONA - DISTRIBUCIÓN DE APLICACIONES POR ESTADO */}
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
             
             {/* Loading state para gráficos */}
             {!stats?.application_distribution && (
               <Box sx={{ 
                 display: 'flex', 
                 flexDirection: 'column', 
                 alignItems: 'center', 
                 justifyContent: 'center', 
                 height: 300,
                 gap: 2
               }}>
                 <Skeleton variant="circular" width={100} height={100} />
                 <Skeleton variant="text" width="60%" height={24} />
                 <Skeleton variant="text" width="40%" height={20} />
               </Box>
             )}
            
            {/* Renderizado condicional del gráfico de dona */}
            {translatedApplicationData && translatedApplicationData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  {/* Definición de filtros para efectos visuales */}
                  <defs>
                    <filter id="pieShadow" x="-50%" y="-50%" width="200%" height="200%">
                      <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="rgba(0,0,0,0.15)"/>
                    </filter>
                  </defs>
                  
                  {/* Componente principal del gráfico de dona */}
                  <Pie
                    data={translatedApplicationData}
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
                      fill: themeMode === 'dark' ? '#fbbf24' : '#1e293b',
                      fontSize: '14px',
                      fontWeight: 800,
                      textShadow: themeMode === 'dark' ? '3px 3px 6px rgba(0,0,0,1)' : '2px 2px 4px rgba(255,255,255,0.9)',
                      stroke: themeMode === 'dark' ? '#000000' : '#ffffff',
                      strokeWidth: themeMode === 'dark' ? '2px' : '1px'
                    }}
                  >
                    {/* Celdas del gráfico con colores personalizados */}
                    {translatedApplicationData.map((_: any, index: number) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={powerBIColors[index % powerBIColors.length]}
                        stroke={themeMode === 'dark' ? '#ffffff' : '#ffffff'}
                        strokeWidth={themeMode === 'dark' ? 3 : 2}
                        opacity={0.9}
                      />
                    ))}
                  </Pie>
                  
                  {/* Tooltip personalizado para el gráfico */}
                  <RechartsTooltip 
                    content={<CustomPieTooltip themeMode={themeMode} />}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              /* Estado vacío cuando no hay datos disponibles */
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

                 {/* 📊 GRÁFICO 2: GRÁFICO DE BARRAS - ACTIVIDAD MENSUAL */}
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
             
             {/* Loading state para gráficos */}
             {!stats?.monthly_activity && (
               <Box sx={{ 
                 display: 'flex', 
                 flexDirection: 'column', 
                 alignItems: 'center', 
                 justifyContent: 'center', 
                 height: 300,
                 gap: 2
               }}>
                 <Skeleton variant="rectangular" width="80%" height={200} sx={{ borderRadius: 1 }} />
                 <Skeleton variant="text" width="60%" height={24} />
                 <Skeleton variant="text" width="40%" height={20} />
               </Box>
             )}
            
            {/* Renderizado condicional del gráfico de barras */}
            {stats?.monthly_activity && stats.monthly_activity.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.monthly_activity}>
                  {/* Definición de gradientes para las barras */}
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
                  
                  {/* Cuadrícula del gráfico */}
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke={themeMode === 'dark' ? '#334155' : '#f1f5f9'}
                    opacity={0.3}
                  />
                  
                  {/* Eje X con configuración de tema */}
                  <XAxis 
                    dataKey="month" 
                    tickFormatter={translateMonthToSpanish}
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
                  
                  {/* Eje Y con configuración de tema */}
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
                  
                  {/* Tooltip personalizado */}
                  <RechartsTooltip 
                    contentStyle={themeMode === 'dark' ? powerBITooltipDarkStyles : powerBITooltipStyles}
                    formatter={(value: any, name: any) => {
                      const labels = {
                        applications: '📝 Aplicaciones Enviadas',
                        hours: '⏰ Horas Trabajadas'
                      };
                      return [value, labels[name as keyof typeof labels] || name];
                    }}
                  />
                  
                  {/* Leyenda con etiquetas personalizadas */}
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
                  
                  {/* Barra para aplicaciones enviadas */}
                  <Bar 
                    dataKey="applications" 
                    fill="url(#applicationsGradient)" 
                    radius={[8, 8, 0, 0]}
                    stroke="#3b82f6"
                    strokeWidth={1}
                  />
                  
                  {/* Barra para horas trabajadas */}
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
              /* Estado vacío cuando no hay datos de actividad mensual */
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