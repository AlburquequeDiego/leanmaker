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
    <DashboardLayout userRole={userRole}>
      <Routes>
        <Route index element={getDashboardContent()} />
        {/* Aquí irán las rutas específicas de cada dashboard */}
        <Route path="profile" element={<div>Perfil de Usuario</div>} />
        <Route path="notifications" element={<div>Notificaciones</div>} />
        {/* Rutas específicas del admin */}
        {userRole === 'admin' && (
          <>
            <Route path="users" element={<div>Gestión de Usuarios</div>} />
            <Route path="companies" element={<div>Gestión de Empresas</div>} />
            <Route path="students" element={<div>Gestión de Estudiantes</div>} />
            <Route path="projects" element={<div>Gestión de Proyectos</div>} />
            <Route path="evaluations" element={<div>Evaluaciones</div>} />
            <Route path="settings" element={<div>Configuración</div>} />
          </>
        )}
        {/* Rutas específicas de la empresa */}
        {userRole === 'company' && (
          <>
            <Route path="my-projects" element={<div>Mis Proyectos</div>} />
            <Route path="applicants" element={<div>Postulantes</div>} />
            <Route path="evaluations" element={<div>Evaluaciones</div>} />
            <Route path="calendar" element={<div>Calendario</div>} />
          </>
        )}
        {/* Rutas específicas del estudiante */}
        {userRole === 'student' && (
          <>
            <Route path="available-projects" element={<div>Proyectos Disponibles</div>} />
            <Route path="my-applications" element={<div>Mis Aplicaciones</div>} />
            <Route path="my-projects" element={<div>Mis Proyectos</div>} />
            <Route path="evaluations" element={<div>Evaluaciones</div>} />
            <Route path="calendar" element={<div>Calendario</div>} />
          </>
        )}
      </Routes>
    </DashboardLayout>
  );
};

export default Dashboard; 