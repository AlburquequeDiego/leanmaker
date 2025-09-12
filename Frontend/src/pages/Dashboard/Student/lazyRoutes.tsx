import { lazy } from 'react';

/**
 * 🚀 RUTAS LAZY PARA INTERFACES DEL ESTUDIANTE
 * 
 * BENEFICIOS:
 * - Carga de componentes solo cuando son necesarios
 * - Reducción del bundle inicial
 * - Mejor tiempo de carga inicial
 * - Carga progresiva de funcionalidades
 */

// Dashboard principal - Carga inmediata (es la página principal)
export const StudentDashboard = lazy(() => import('./StudentDashboard'));

// Interfaces secundarias - Carga bajo demanda
export const MyProjects = lazy(() => import('./MyProjects'));
export const AvailableProjects = lazy(() => import('./Projects/AvailableProjects'));
export const CollectiveChallenges = lazy(() => import('./CollectiveChallenges'));
export const MyApplications = lazy(() => import('./MyApplications'));
export const Evaluations = lazy(() => import('./Evaluations'));
export const ApiQuestionnaire = lazy(() => import('./APIQuestionnaire'));
export const Notifications = lazy(() => import('./Notifications'));
export const Strikes = lazy(() => import('./Strikes'));

// Componente de fallback para loading
export const StudentRouteFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '50vh',
    fontSize: '18px',
    color: '#666'
  }}>
    Cargando interfaz del estudiante...
  </div>
);
