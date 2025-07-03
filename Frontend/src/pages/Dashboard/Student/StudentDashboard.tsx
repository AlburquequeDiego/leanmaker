import { useEffect, useState } from 'react';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BarChartIcon from '@mui/icons-material/BarChart';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { UserTutorial } from '../../../components/common/UserTutorial';
import { apiService } from '../../../services/api.service';

export default function StudentDashboard() {
  const [showTutorial, setShowTutorial] = useState(true);
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [activeProjects, setActiveProjects] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Obtener perfil del estudiante actual
        const studentsData = await apiService.get('/api/students/');
        setStudent(Array.isArray(studentsData) && studentsData.length > 0 ? studentsData[0] : null);
        // Obtener proyectos disponibles
        const projectsData = await apiService.get('/api/projects/');
        setProjects(Array.isArray(projectsData) ? projectsData : []);
        // Obtener aplicaciones del estudiante
        const applicationsData = await apiService.get('/api/project-applications/');
        setApplications(Array.isArray(applicationsData) ? applicationsData : []);
        // Obtener proyectos activos del estudiante
        const activeProjectsData = await apiService.get('/api/project-members/');
        setActiveProjects(Array.isArray(activeProjectsData) ? activeProjectsData : []);
      } catch (error) {
        // Puedes mostrar un mensaje de error si lo deseas
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  // Cálculos de KPIs
  const totalHours = student?.total_hours || 0;
  const currentGPA = student?.gpa || 0;
  const strikes = student?.strikes || 0;
  const maxStrikes = 3;
  const proyectosDisponibles = projects.length;
  const misAplicaciones = applications.length;
  const proyectosActivos = activeProjects.length;

  return (
    <Box sx={{ p: 3, bgcolor: '#f7fafd', minHeight: '100vh' }}>
      {/* Tutorial para usuarios nuevos */}
      {showTutorial && (
        <UserTutorial 
          userRole="student" 
          onClose={() => setShowTutorial(false)} 
        />
      )}
      <Typography variant="h4" fontWeight={700} mb={3}>
        Bienvenido a tu Dashboard (Estudiante)
      </Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress />
        </Box>
      ) : (
      <>
      {/* KPIs principales */}
      <Box sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 3,
        mb: 4,
        justifyContent: { xs: 'center', md: 'flex-start' }
      }}>
        <Paper sx={{ p: 2.5, minWidth: 220, flex: '1 1 260px', display: 'flex', flexDirection: 'column', bgcolor: '#42a5f5', color: 'white', boxShadow: 2, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <TrendingUpIcon sx={{ fontSize: 32, mr: 1 }} />
            <Typography variant="h6" fontWeight={700}>Horas Acumuladas</Typography>
          </Box>
          <Typography variant="h4" fontWeight={700}>{totalHours}</Typography>
          <Typography variant="body2">Horas de experiencia en proyectos</Typography>
        </Paper>
        <Paper sx={{ p: 2.5, minWidth: 220, flex: '1 1 260px', display: 'flex', flexDirection: 'column', bgcolor: '#ffa726', color: 'white', boxShadow: 2, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <BarChartIcon sx={{ fontSize: 32, mr: 1 }} />
            <Typography variant="h6" fontWeight={700}>GPA Actual</Typography>
          </Box>
          <Typography variant="h4" fontWeight={700}>{currentGPA}</Typography>
          <Typography variant="body2">Promedio académico actual</Typography>
        </Paper>
        <Paper sx={{ p: 2.5, minWidth: 220, flex: '1 1 260px', display: 'flex', flexDirection: 'column', bgcolor: '#42a5f5', color: 'white', boxShadow: 2, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700}>Proyectos Disponibles</Typography>
          <Typography variant="h4" fontWeight={700}>{proyectosDisponibles}</Typography>
          <Typography variant="body2">Nuevas oportunidades para ti</Typography>
        </Paper>
        <Paper sx={{ p: 2.5, minWidth: 220, flex: '1 1 260px', display: 'flex', flexDirection: 'column', bgcolor: '#ab47bc', color: 'white', boxShadow: 2, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700}>Mis Aplicaciones</Typography>
          <Typography variant="h4" fontWeight={700}>{misAplicaciones}</Typography>
          <Typography variant="body2">Aplicaciones en proceso</Typography>
        </Paper>
        <Paper sx={{ p: 2.5, minWidth: 220, flex: '1 1 260px', display: 'flex', flexDirection: 'column', bgcolor: '#ffb300', color: 'white', boxShadow: 2, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <WarningAmberIcon sx={{ fontSize: 32, mr: 1 }} />
            <Typography variant="h6" fontWeight={700}>Strikes</Typography>
          </Box>
          <Typography variant="h4" fontWeight={700}>{strikes} / {maxStrikes}</Typography>
          <Typography variant="body2">Tienes {strikes} de 3 strikes asignados por no entregar proyectos.</Typography>
        </Paper>
        <Paper sx={{ p: 2.5, minWidth: 220, flex: '1 1 260px', display: 'flex', flexDirection: 'column', bgcolor: '#43a047', color: 'white', boxShadow: 2, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700}>Proyectos Activos</Typography>
          <Typography variant="h4" fontWeight={700}>{proyectosActivos}</Typography>
          <Typography variant="body2">Proyectos en curso</Typography>
        </Paper>
      </Box>
      {/* Puedes agregar más secciones aquí si lo deseas, usando los datos reales */}
      </>
      )}
    </Box>
  );
} 