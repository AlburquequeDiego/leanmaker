import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense } from 'react';
import { CircularProgress, Box } from '@mui/material';
import { Home, Login, Register, ForgotPassword } from '../pages';
import StudentDashboard from '../pages/Dashboard/Student/StudentDashboard';
import Profile from '../pages/Dashboard/Student/Profile';
import Notifications from '../pages/Dashboard/Student/Notifications';
import MyApplications from '../pages/Dashboard/Student/MyApplications';
import MyProjects from '../pages/Dashboard/Student/MyProjects';
import Evaluations from '../pages/Dashboard/Student/Evaluations';
import Calendar from '../pages/Dashboard/Student/Calendar';
import APIQuestionnaire from '../pages/Dashboard/Student/APIQuestionnaire';
import APIResults from '../pages/Dashboard/Student/APIResults';
import { AvailableProjects } from '../pages/Dashboard/Student/Projects';
import CompanyDashboard from '../pages/Dashboard/Company';
import AdminDashboard from '../pages/Dashboard/Admin';
import UsuariosAdmin from '../pages/Dashboard/Admin/UsuariosAdmin';
import ValidacionHorasAdmin from '../pages/Dashboard/Admin/ValidacionHorasAdmin';
import PerfilAdmin from '../pages/Dashboard/Admin/PerfilAdmin';
import NotificacionesAdmin from '../pages/Dashboard/Admin/NotificacionesAdmin';
import GestionEmpresasAdmin from '../pages/Dashboard/Admin/GestionEmpresasAdmin';
import GestionEstudiantesAdmin from '../pages/Dashboard/Admin/GestionEstudiantesAdmin';
import GestionProyectosAdmin from '../pages/Dashboard/Admin/GestionProyectosAdmin';
import GestionEvaluacionesAdmin from '../pages/Dashboard/Admin/GestionEvaluacionesAdmin';
import ConfiguracionPlataformaAdmin from '../pages/Dashboard/Admin/ConfiguracionPlataformaAdmin';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { useAuth } from '../hooks/useAuth';
import DashboardLayout from '../components/layout/DashboardLayout';

// Componente de carga
const LoadingFallback = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="100vh"
  >
    <CircularProgress />
  </Box>
);

// Componente que renderiza el dashboard según el rol del usuario
const RoleBasedDashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case 'admin':
      return <Navigate to="/dashboard/admin" replace />;
    case 'company':
      return <Navigate to="/dashboard/company" replace />;
    case 'student':
      return <Navigate to="/dashboard/student" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Rutas protegidas */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <RoleBasedDashboard />
            </ProtectedRoute>
          }
        />

        {/* Rutas del admin con layout persistente */}
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout userRole="admin" />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="usuarios" element={<UsuariosAdmin />} />
          <Route path="validacion-horas" element={<ValidacionHorasAdmin />} />
          <Route path="perfil" element={<PerfilAdmin />} />
          <Route path="notificaciones" element={<NotificacionesAdmin />} />
          <Route path="gestion-empresas" element={<GestionEmpresasAdmin />} />
          <Route path="gestion-estudiantes" element={<GestionEstudiantesAdmin />} />
          <Route path="gestion-proyectos" element={<GestionProyectosAdmin />} />
          <Route path="gestion-evaluaciones" element={<GestionEvaluacionesAdmin />} />
          <Route path="configuracion-plataforma" element={<ConfiguracionPlataformaAdmin />} />
        </Route>

        {/* Rutas específicas por rol */}
        <Route
          path="/dashboard/company/*"
          element={
            <ProtectedRoute allowedRoles={['company']}>
              <CompanyDashboard />
            </ProtectedRoute>
          }
        />
        {/* Rutas del estudiante */}
        <Route
          path="/dashboard/student"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <DashboardLayout userRole="student" />
            </ProtectedRoute>
          }
        >
          <Route index element={<StudentDashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="available-projects" element={<AvailableProjects />} />
          <Route path="my-applications" element={<MyApplications />} />
          <Route path="my-projects" element={<MyProjects />} />
          <Route path="evaluations" element={<Evaluations />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="api-questionnaire" element={<APIQuestionnaire />} />
          <Route path="api-results" element={<APIResults />} />
        </Route>
        {/* Ruta por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}; 