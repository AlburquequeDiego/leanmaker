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
import { AvailableProjects } from '../pages/Dashboard/Student/Projects';
import CompanyDashboard from '../pages/Dashboard/Company';
import AdminDashboard from '../pages/Dashboard/Admin';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { useAuth } from '../hooks/useAuth';

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

        {/* Rutas específicas por rol */}
        <Route
          path="/dashboard/admin/*"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
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
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/profile"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/notifications"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/available-projects"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <AvailableProjects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/my-applications"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <MyApplications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/my-projects"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <MyProjects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/evaluations"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <Evaluations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/calendar"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <Calendar />
            </ProtectedRoute>
          }
        />
        {/* Ruta por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}; 