import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../hooks/useAuth';

// Componentes de dashboard específicos por rol
const AdminDashboard = () => (
  <div>
    <h1>Dashboard de Administrador</h1>
    {/* Aquí irá el contenido específico del admin */}
  </div>
);

const CompanyDashboard = () => (
  <div>
    <h1>Dashboard de Empresa</h1>
    {/* Aquí irá el contenido específico de la empresa */}
  </div>
);

const StudentDashboard = () => (
  <div>
    <h1>Dashboard de Estudiante</h1>
    {/* Aquí irá el contenido específico del estudiante */}
  </div>
);

interface DashboardProps {
  userRole: 'admin' | 'company' | 'student';
}

export const Dashboard = ({ userRole }: DashboardProps) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const getDashboardContent = () => {
    switch (userRole) {
      case 'admin':
        return <AdminDashboard />;
      case 'company':
        return <CompanyDashboard />;
      case 'student':
        return <StudentDashboard />;
      default:
        return <Navigate to="/login" replace />;
    }
  };

  return (
    <DashboardLayout userRole={userRole} />
  );
};

export default Dashboard; 