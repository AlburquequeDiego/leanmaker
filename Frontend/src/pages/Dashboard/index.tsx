import { Navigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../hooks/useAuth';

export const Dashboard = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Determine user role based on user data
  const userRole = user?.role || (user?.is_staff ? 'admin' : 'student');

  return (
    <DashboardLayout userRole={userRole} />
  );
};

export default Dashboard; 