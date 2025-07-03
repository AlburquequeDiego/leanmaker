import { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { People as PeopleIcon, Business as BusinessIcon, School as SchoolIcon, HowToReg as HowToRegIcon, Work as WorkIcon } from '@mui/icons-material';
import { apiService } from '../../../services/api.service';

export default function AdminDashboard() {
  // Estados para los totales
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [usersData, companiesData, studentsData, projectsData, applicationsData] = await Promise.all([
          apiService.get('/api/users/'),
          apiService.get('/api/companies/'),
          apiService.get('/api/students/'),
          apiService.get('/api/projects/'),
          apiService.get('/api/project-applications/'),
        ]);
        setUsers(usersData as any[]);
        setCompanies(companiesData as any[]);
        setStudents(studentsData as any[]);
        setProjects(projectsData as any[]);
        setApplications(applicationsData as any[]);
      } catch (error) {
        // Puedes mostrar un mensaje de error si lo deseas
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4, mb: 4, px: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" align="center">
            Panel de Administración (Admin)
          </Typography>
        </Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
            <CircularProgress />
          </Box>
        ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4, justifyContent: { xs: 'center', md: 'flex-start' } }}>
          {/* Usuarios */}
          <Box sx={{ flex: '1 1 260px', minWidth: 220, bgcolor: 'primary.main', color: 'primary.contrastText', borderRadius: 3, boxShadow: 2, p: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PeopleIcon sx={{ fontSize: 32, mr: 1 }} />
              <Typography variant="h6" fontWeight={700}>Usuarios</Typography>
            </Box>
            <Typography variant="h3" fontWeight={700}>{users.length}</Typography>
            <Typography variant="body2">Usuarios registrados</Typography>
          </Box>
          {/* Empresas */}
          <Box sx={{ flex: '1 1 260px', minWidth: 220, bgcolor: 'secondary.main', color: 'secondary.contrastText', borderRadius: 3, boxShadow: 2, p: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <BusinessIcon sx={{ fontSize: 32, mr: 1 }} />
              <Typography variant="h6" fontWeight={700}>Empresas</Typography>
            </Box>
            <Typography variant="h3" fontWeight={700}>{companies.length}</Typography>
            <Typography variant="body2">Empresas activas</Typography>
          </Box>
          {/* Estudiantes */}
          <Box sx={{ flex: '1 1 260px', minWidth: 220, bgcolor: 'success.main', color: 'success.contrastText', borderRadius: 3, boxShadow: 2, p: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <SchoolIcon sx={{ fontSize: 32, mr: 1 }} />
              <Typography variant="h6" fontWeight={700}>Estudiantes</Typography>
            </Box>
            <Typography variant="h3" fontWeight={700}>{students.length}</Typography>
            <Typography variant="body2">Estudiantes activos</Typography>
          </Box>
          {/* Proyectos */}
          <Box sx={{ flex: '1 1 260px', minWidth: 220, bgcolor: 'info.main', color: 'info.contrastText', borderRadius: 3, boxShadow: 2, p: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <WorkIcon sx={{ fontSize: 32, mr: 1 }} />
              <Typography variant="h6" fontWeight={700}>Proyectos</Typography>
            </Box>
            <Typography variant="h3" fontWeight={700}>{projects.length}</Typography>
            <Typography variant="body2">Proyectos activos</Typography>
          </Box>
          {/* Postulaciones */}
          <Box sx={{ flex: '1 1 260px', minWidth: 220, bgcolor: 'purple.main', color: 'purple.contrastText', borderRadius: 3, boxShadow: 2, p: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <HowToRegIcon sx={{ fontSize: 32, mr: 1 }} />
              <Typography variant="h6" fontWeight={700}>Postulaciones</Typography>
            </Box>
            <Typography variant="h3" fontWeight={700}>{applications.length}</Typography>
            <Typography variant="body2">Postulaciones realizadas</Typography>
          </Box>
        </Box>
        )}
      </Box>
    </Box>
  );
} 