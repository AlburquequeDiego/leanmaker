import { Navigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../hooks/useAuth';

interface DashboardProps {
  userRole: 'admin' | 'company' | 'student';
}

export const Dashboard = ({ userRole }: DashboardProps) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <DashboardLayout userRole={userRole} />
  );
};

export default Dashboard; 