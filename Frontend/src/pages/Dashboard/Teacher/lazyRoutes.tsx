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
      Preparando la interfaz para gestionar tus actividades académicas
    </Typography>
  </Box>
);

// Componentes principales del dashboard de docente - Carga lazy
export const TeacherDashboard = lazy(() => import('./TeacherDashboard'));
export const TeacherProfile = lazy(() => import('./TeacherProfile'));
export const TeacherChallenges = lazy(() => import('./TeacherChallenges'));
export const TeacherNotifications = lazy(() => import('./TeacherNotifications'));
export const TeacherSections = lazy(() => import('./TeacherSections'));
export const TeacherProgress = lazy(() => import('./TeacherProgress'));

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
export const LazyTeacherProfile = withLazyFallback(TeacherProfile);
export const LazyTeacherChallenges = withLazyFallback(TeacherChallenges);
export const LazyTeacherNotifications = withLazyFallback(TeacherNotifications);
export const LazyTeacherSections = withLazyFallback(TeacherSections);
export const LazyTeacherProgress = withLazyFallback(TeacherProgress);
