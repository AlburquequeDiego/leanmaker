/**
 * 🚀 RUTAS LAZY PARA DASHBOARD DE DOCENTE
 * 
 * Este archivo centraliza la carga lazy de todos los componentes relacionados
 * con el dashboard de docente para mejorar el rendimiento y reducir el bundle inicial.
 */

import { lazy, Suspense } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

// Componente de fallback para rutas lazy
const TeacherRouteFallback = () => (
  <Box sx={{ 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    minHeight: '400px',
    gap: 2
  }}>
    <CircularProgress size={60} />
    <Typography variant="h6" color="text.secondary">
      Cargando módulo de docente...
    </Typography>
    <Typography variant="body2" color="text.secondary" textAlign="center">
      Preparando la interfaz para gestionar tus estudiantes y proyectos
    </Typography>
  </Box>
);

// Componentes principales del dashboard de docente - Carga lazy
export const TeacherDashboard = lazy(() => import('./TeacherDashboard'));

// Componentes específicos del docente - Carga lazy
export const TeacherStudents = lazy(() => import('./TeacherStudents'));
export const TeacherProjects = lazy(() => import('./TeacherProjects'));
export const TeacherEvaluations = lazy(() => import('./TeacherEvaluations'));
export const TeacherCalendar = lazy(() => import('./TeacherCalendar'));
export const TeacherReports = lazy(() => import('./TeacherReports'));
export const TeacherProfile = lazy(() => import('./TeacherProfile'));
export const TeacherNotifications = lazy(() => import('./TeacherNotifications'));

// Wrapper para componentes lazy con fallback
export const withLazyFallback = (Component: React.ComponentType<any>) => {
  return (props: any) => (
    <Suspense fallback={<TeacherRouteFallback />}>
      <Component {...props} />
    </Suspense>
  );
};

// Exportar componentes con fallback
export const LazyTeacherDashboard = withLazyFallback(TeacherDashboard);
export const LazyTeacherStudents = withLazyFallback(TeacherStudents);
export const LazyTeacherProjects = withLazyFallback(TeacherProjects);
export const LazyTeacherEvaluations = withLazyFallback(TeacherEvaluations);
export const LazyTeacherCalendar = withLazyFallback(TeacherCalendar);
export const LazyTeacherReports = withLazyFallback(TeacherReports);
export const LazyTeacherProfile = withLazyFallback(TeacherProfile);
export const LazyTeacherNotifications = withLazyFallback(TeacherNotifications);
