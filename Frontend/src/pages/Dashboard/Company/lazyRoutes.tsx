/**
 * 🚀 RUTAS LAZY PARA DASHBOARD DE EMPRESA
 * 
 * Este archivo centraliza la carga lazy de todos los componentes relacionados
 * con el dashboard de empresa para mejorar el rendimiento y reducir el bundle inicial.
 */

import { lazy, Suspense } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

// Componente de fallback para rutas lazy
const CompanyRouteFallback = () => (
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
      Cargando módulo de empresa...
    </Typography>
    <Typography variant="body2" color="text.secondary" textAlign="center">
      Preparando la interfaz para gestionar tus proyectos y aplicaciones
    </Typography>
  </Box>
);

// Componentes principales del dashboard de empresa - Carga lazy
export const CompanyDashboard = lazy(() => import('./CompanyDashboard'));

// Gestión de proyectos
export const CompanyProjects = lazy(() => import('./Projects/CompanyProjects'));
export const CreateProject = lazy(() => import('./Projects/CreateProject'));
export const EditProject = lazy(() => import('./Projects/EditProject'));
export const ProjectDetails = lazy(() => import('./Projects/ProjectDetails'));

// Gestión de aplicaciones
export const CompanyApplications = lazy(() => import('./Applications/CompanyApplications'));
export const ApplicationDetails = lazy(() => import('./Applications/ApplicationDetails'));
export const ReviewApplication = lazy(() => import('./Applications/ReviewApplication'));

// Gestión de estudiantes
export const CompanyStudents = lazy(() => import('./Students/CompanyStudents'));
export const StudentProfile = lazy(() => import('./Students/StudentProfile'));
export const StudentEvaluations = lazy(() => import('./Students/StudentEvaluations'));

// Evaluaciones y calificaciones
export const CompanyEvaluations = lazy(() => import('./Evaluations/CompanyEvaluations'));
export const CreateEvaluation = lazy(() => import('./Evaluations/CreateEvaluation'));

// Configuración y perfil de empresa
export const CompanyProfile = lazy(() => import('./Profile/CompanyProfile'));
export const CompanySettings = lazy(() => import('./Settings/CompanySettings'));

// Reportes y analytics
export const CompanyReports = lazy(() => import('./Reports/CompanyReports'));
export const CompanyAnalytics = lazy(() => import('./Analytics/CompanyAnalytics'));

// Notificaciones
export const CompanyNotifications = lazy(() => import('./Notifications/CompanyNotifications'));

// Wrapper para componentes lazy con fallback
export const withLazyFallback = (Component: React.ComponentType<any>) => {
  return (props: any) => (
    <Suspense fallback={<CompanyRouteFallback />}>
      <Component {...props} />
    </Suspense>
  );
};

// Exportar componentes con fallback
export const LazyCompanyDashboard = withLazyFallback(CompanyDashboard);
export const LazyCompanyProjects = withLazyFallback(CompanyProjects);
export const LazyCreateProject = withLazyFallback(CreateProject);
export const LazyEditProject = withLazyFallback(EditProject);
export const LazyProjectDetails = withLazyFallback(ProjectDetails);
export const LazyCompanyApplications = withLazyFallback(CompanyApplications);
export const LazyApplicationDetails = withLazyFallback(ApplicationDetails);
export const LazyReviewApplication = withLazyFallback(ReviewApplication);
export const LazyCompanyStudents = withLazyFallback(CompanyStudents);
export const LazyStudentProfile = withLazyFallback(StudentProfile);
export const LazyStudentEvaluations = withLazyFallback(StudentEvaluations);
export const LazyCompanyEvaluations = withLazyFallback(CompanyEvaluations);
export const LazyCreateEvaluation = withLazyFallback(CreateEvaluation);
export const LazyCompanyProfile = withLazyFallback(CompanyProfile);
export const LazyCompanySettings = withLazyFallback(CompanySettings);
export const LazyCompanyReports = withLazyFallback(CompanyReports);
export const LazyCompanyAnalytics = withLazyFallback(CompanyAnalytics);
export const LazyCompanyNotifications = withLazyFallback(CompanyNotifications);

// Configuración de preload para rutas críticas
export const preloadCriticalRoutes = () => {
  // Preload de componentes críticos
  const criticalComponents = [
    CompanyProjects,
    CompanyApplications,
    CompanyStudents
  ];
  
  criticalComponents.forEach(Component => {
    // Trigger lazy loading
    Component.preload?.();
  });
};

// Configuración de rutas con metadata
export const COMPANY_ROUTES_CONFIG = {
  dashboard: {
    path: '/dashboard/company',
    component: LazyCompanyDashboard,
    title: 'Dashboard de Empresa',
    description: 'Vista general de métricas y estadísticas de la empresa'
  },
  projects: {
    path: '/dashboard/company/projects',
    component: LazyCompanyProjects,
    title: 'Gestión de Proyectos',
    description: 'Crear, editar y gestionar proyectos de la empresa'
  },
  applications: {
    path: '/dashboard/company/applications',
    component: LazyCompanyApplications,
    title: 'Aplicaciones de Estudiantes',
    description: 'Revisar y gestionar aplicaciones de estudiantes a proyectos'
  },
  students: {
    path: '/dashboard/company/students',
    component: LazyCompanyStudents,
    title: 'Estudiantes Activos',
    description: 'Gestionar estudiantes que trabajan en proyectos de la empresa'
  },
  evaluations: {
    path: '/dashboard/company/evaluations',
    component: LazyCompanyEvaluations,
    title: 'Evaluaciones',
    description: 'Crear y gestionar evaluaciones de estudiantes'
  },
  profile: {
    path: '/dashboard/company/profile',
    component: LazyCompanyProfile,
    title: 'Perfil de Empresa',
    description: 'Gestionar información y configuración de la empresa'
  }
};
