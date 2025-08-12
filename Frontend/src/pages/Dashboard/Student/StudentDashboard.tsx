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

/**
 * 🎨 PALETA DE COLORES ESTILO POWER BI
 * Colores profesionales y accesibles para las visualizaciones de datos
 * Cada color tiene un propósito específico en la interfaz
 */
const powerBIColors = [
  '#FF8C00', // Naranja principal - Color principal del sistema
  '#9370DB', // Púrpura claro - Color secundario
  '#FFA500', // Naranja estándar - Para elementos destacados
  '#DDA0DD', // Púrpura claro suave - Para elementos premium
  '#FF7F50', // Coral naranja - Para elementos importantes
  '#BA55D3', // Púrpura medio - Para elementos de confianza
  '#FF6347', // Tomate naranja - Para alertas
  '#8A2BE2', // Púrpura azulado - Para elementos especiales
  '#FF4500', // Naranja rojizo - Para elementos críticos
  '#D8BFD8'  // Púrpura muy claro - Para elementos suaves
];

/**
 * 🎨 ESTILOS POWER BI PARA TOOLTIPS EN TEMA CLARO
 * Estilos modernos con efectos de blur y sombras para tooltips profesionales
 */
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

/**
 * 🎨 ESTILOS POWER BI PARA TOOLTIPS EN TEMA OSCURO
 * Adaptación de los estilos para el modo oscuro manteniendo la consistencia visual
 */
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
const KPICard = ({ title, value, description, icon, bgColor, textColor }: KPICardProps) => {
  // Estado para controlar la visibilidad del tooltip
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <Paper sx={{
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
      transition: 'box-shadow 0.2s', // Transición suave para hover
      flexShrink: 0,             // No permitir reducción
      flexGrow: 0,               // No permitir crecimiento
      '&:hover': {
        boxShadow: 4             // Sombra aumentada en hover
      }
    }}>
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
            onClick={() => setShowTooltip(!showTooltip)}
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
  );
};

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
  
  // Hook para obtener estadísticas del dashboard en tiempo real
  const { data: stats, loading, error, lastUpdate, isPolling } = useDashboardStats('student');

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
  const apiLevel = stats?.api_level ?? 1;
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
   * Muestra un indicador de carga mientras se obtienen las estadísticas
   * del backend. Incluye icono de reloj de arena y mensaje descriptivo.
   */
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <HourglassBottomIcon sx={{ fontSize: 48, color: 'primary.main', mr: 2 }} />
        <Typography variant="h6">Cargando dashboard...</Typography>
      </Box>
    );
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
        <Typography variant="h4" fontWeight={700} sx={{ color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b' }}>
          Bienvenido a tu Dashboard - {getUserDisplayName()}
        </Typography>
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
        />
        
        {/* 📋 TARJETA 2: PROYECTOS DISPONIBLES */}
        <KPICard
          title="Proyectos Disponibles"
          value={availableProjects}
          description="Número de proyectos activos que están abiertos para aplicaciones. Estos proyectos representan nuevas oportunidades para desarrollar tus habilidades y ganar experiencia profesional."
          icon={<AssignmentIcon sx={{ fontSize: 28 }} />}
          bgColor="#42a5f5"  // Azul claro
          textColor="white"
        />
        
        {/* 📝 TARJETA 3: MIS APLICACIONES */}
        <KPICard
          title="Mis Aplicaciones"
          value={totalApplications}
          description="Total de aplicaciones que has enviado a proyectos. Incluye aplicaciones pendientes de revisión, aceptadas y rechazadas. Monitorea el estado de tus aplicaciones activas."
          icon={<AssignmentIcon sx={{ fontSize: 28 }} />}
          bgColor="#8e24aa"  // Púrpura
          textColor="white"
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
        />
        
        {/* 📊 TARJETA 6: GPA ACTUAL */}
        <KPICard
          title="GPA Actual"
          value={gpa && gpa > 0 ? gpa : 'Sin GPA'}
          description="Promedio académico actual basado en las calificaciones recibidas por tu trabajo en proyectos. Refleja tu rendimiento académico y profesional en la plataforma."
          icon={<TrendingUpIcon sx={{ fontSize: 28, color: 'white' }} />}
          bgColor="#f57c00"  // Naranja
          textColor="white"
        />
         
        {/* 🏁 TARJETA 7: PROYECTOS COMPLETADOS */}
        <KPICard
          title="Proyectos Completados"
          value={completedProjects}
          description="Número total de proyectos que has terminado exitosamente. Cada proyecto completado representa una experiencia valiosa y contribuye a tu portafolio profesional."
          icon={<CheckCircleIcon sx={{ fontSize: 28 }} />}
          bgColor="#4caf50"  // Verde lima
          textColor="white"
        />
        
        {/* 🔧 TARJETA 8: NIVEL DE API */}
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
          bgColor="#8e24aa"  // Púrpura
          textColor="white"
        />
         
        {/* 🔔 TARJETA 9: NOTIFICACIONES NUEVAS */}
        <KPICard
          title="Notificaciones Nuevas"
          value={unreadNotifications}
          description="Número de notificaciones no leídas que requieren tu atención. Incluye actualizaciones de proyectos, evaluaciones y mensajes importantes del sistema."
          icon={<NotificationsIcon sx={{ fontSize: 28 }} />}
          bgColor="#f44336"  // Rojo de alerta
          textColor="white"
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
            
            {/* Renderizado condicional del gráfico de dona */}
            {stats?.application_distribution && stats.application_distribution.length > 0 ? (
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
                  >
                    {/* Celdas del gráfico con colores personalizados */}
                    {stats.application_distribution.map((_: any, index: number) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={powerBIColors[index % powerBIColors.length]}
                        stroke={themeMode === 'dark' ? '#1e293b' : '#ffffff'}
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  
                  {/* Tooltip personalizado para el gráfico */}
                  <RechartsTooltip 
                    contentStyle={themeMode === 'dark' ? powerBITooltipDarkStyles : powerBITooltipStyles}
                    formatter={(value: any, name: any) => [
                      `${value} aplicaciones`, 
                      name
                    ]}
                  />
                  
                  {/* Leyenda del gráfico */}
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
                    formatter={(value: any, name: any) => [value, name]}
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