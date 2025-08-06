import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Divider,
  Grid,
} from '@mui/material';
import {
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
  Assignment as AssignmentIcon,
  Visibility as VisibilityIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Science as ScienceIcon,
} from '@mui/icons-material';
import { apiService } from '../../../services/api.service';
import { ShowLatestFilter, ProjectDetailsModal } from '../../../components/common';
import { useTheme } from '../../../contexts/ThemeContext';

interface Project {
  id: string;
  title: string;
  company: string;
  status: 'published' | 'active' | 'completed' | 'deleted';
  startDate: string;
  endDate: string;
  progress: number;
  hoursWorked: number;
  totalHours: number;
  location: string;
  description: string;
  technologies: string[];
  teamMembers: number;
  mentor: string;
  deliverables: string[];
  nextMilestone: string;
  nextMilestoneDate: string;
  modality?: string;
  hoursPerWeek?: number;
  maxStudents?: number;
  currentStudents?: number;
  trlLevel?: string;
  apiLevel?: string;
  createdAt?: string;
  requirements?: string;
  objetivo?: string;
}

export const MyProjects = () => {
  const { themeMode } = useTheme();
  const [projects, setProjects] = useState<Project[]>([]);

  const [publishedLimit, setPublishedLimit] = useState(20);
  const [activeLimit, setActiveLimit] = useState(20);
  const [completedLimit, setCompletedLimit] = useState(20);
  const [deletedLimit, setDeletedLimit] = useState(5);
  const [tab, setTab] = useState(0);

  // Estados para el modal de detalles
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedProjectDetail, setSelectedProjectDetail] = useState<Project | null>(null);
  const [loadingProjectDetail, setLoadingProjectDetail] = useState(false);

  // Adaptador de datos del backend al frontend
  const adaptProjectData = (backend: any): Project => ({
    id: backend.id,
    title: backend.title,
    company: backend.company || 'Sin empresa',
    status: backend.status || 'published', // Estado por defecto sincronizado con empresa
    startDate: backend.startDate || '',
    endDate: backend.endDate || '',
    progress: typeof backend.progress === 'number' ? backend.progress : (backend.status === 'completed' ? 100 : 50),
    hoursWorked: backend.hoursWorked ?? backend.hours_worked ?? 0,
    totalHours: backend.totalHours ?? backend.total_hours ?? 0,
    location: backend.location || '',
    description: backend.description || '',
    technologies: Array.isArray(backend.technologies) ? backend.technologies : [],
    teamMembers: backend.teamMembers ?? backend.team_members ?? 1,
    mentor: backend.mentor || '',
    deliverables: Array.isArray(backend.deliverables) ? backend.deliverables : [],
    nextMilestone: backend.nextMilestone || '',
    nextMilestoneDate: backend.nextMilestoneDate || '',
    modality: backend.modality,
    hoursPerWeek: backend.hours_per_week,
    maxStudents: backend.max_students,
    currentStudents: backend.current_students,
    trlLevel: backend.trl_level,
    apiLevel: backend.api_level,
    createdAt: backend.created_at,
    requirements: backend.requirements,
  });

  useEffect(() => {
    async function fetchProjects() {
      try {
        console.log('[MyProjects] 🔍 Iniciando fetch de proyectos...');
        const response = await apiService.get('/api/projects/my_projects/');
        console.log('[MyProjects] 🔍 Response completa:', response);
        
        // El backend devuelve {success: true, data: Array, total: number}
        const projectsData = response.data || response;
        console.log('[MyProjects] 🔍 projectsData:', projectsData);
        
        const arr = Array.isArray(projectsData) ? projectsData : projectsData.data;
        console.log('[MyProjects] 🔍 Array de proyectos:', arr);
        console.log('[MyProjects] 🔍 Es array?', Array.isArray(arr));
        
        // Mostrar proyectos con estado 'published', 'active' o 'completed' (sincronizado con empresa)
        const filtered = Array.isArray(arr) ? arr.filter(p => {
          console.log('[MyProjects] 🔍 Proyecto:', p.title, 'Status:', p.status);
          return p.status === 'published' || p.status === 'active' || p.status === 'completed';
        }) : [];
        
        console.log('[MyProjects] 🔍 Proyectos filtrados:', filtered);
        console.log('[MyProjects] 🔍 Cantidad de proyectos filtrados:', filtered.length);
        
        const adaptedProjects = filtered.map(adaptProjectData);
        console.log('[MyProjects] 🔍 Proyectos adaptados:', adaptedProjects);
        console.log('[MyProjects] 🔍 Cantidad de proyectos adaptados:', adaptedProjects.length);
        
        setProjects(adaptedProjects);
      } catch (error) {
        console.error('[MyProjects] ❌ Error fetching projects:', error);
        setProjects([]);
      }
    }
    fetchProjects();
  }, []);

  const handleViewProjectDetails = async (project: Project) => {
    setSelectedProjectDetail(project);
    setDetailModalOpen(true);
    setLoadingProjectDetail(true);
    
    try {
      // Obtener detalles completos del proyecto desde el backend
      const response = await apiService.get(`/api/projects/${project.id}/`);
      setSelectedProjectDetail(response.data || response);
    } catch (error) {
      console.error('Error obteniendo detalles del proyecto:', error);
    } finally {
      setLoadingProjectDetail(false);
    }
  };

  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedProjectDetail(null);
  };

  const handleTabChange = (_: any, newValue: number) => setTab(newValue);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'info'; // Azul para publicado (sincronizado con empresa)
      case 'active':
        return 'primary'; // Azul para activo (sincronizado con empresa)
      case 'completed':
        return 'success'; // Verde para completado (sincronizado con empresa)
      case 'deleted':
        return 'error'; // Rojo para eliminado (sincronizado con empresa)
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published':
        return 'Publicado'; // Sincronizado con empresa
      case 'active':
        return 'Activo'; // Sincronizado con empresa
      case 'completed':
        return 'Completado'; // Sincronizado con empresa
      case 'deleted':
        return 'Eliminado'; // Sincronizado con empresa
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <AssignmentIcon />; // Icono de proyecto publicado
      case 'active':
        return <TrendingUpIcon />; // Icono de proyecto activo
      case 'completed':
        return <CheckCircleIcon />; // Icono de proyecto completado
      case 'deleted':
        return <ScheduleIcon />; // Icono de proyecto eliminado
      default:
        return <AssignmentIcon />;
    }
  };

  const publishedProjects = projects.filter(project => project.status === 'published');
  const activeProjects = projects.filter(project => project.status === 'active'); // Solo active para la pestaña "Activo"
  const completedProjects = projects.filter(project => project.status === 'completed');
  
  console.log('[MyProjects] Filtros de pestañas:', {
    total: projects.length,
    published: publishedProjects.length,
    active: activeProjects.length,
    completed: completedProjects.length,
    tab: tab
  });
  
  console.log('[MyProjects] Proyectos publicados:', publishedProjects);
  const deletedProjects = projects.filter(project => project.status === 'deleted');
  const totalHoursWorked = projects.reduce((sum, project) => sum + project.hoursWorked, 0);

  return (
    <Box sx={{ 
      flexGrow: 1, 
      p: 3,
      bgcolor: themeMode === 'dark' ? '#0f172a' : '#f8fafc',
      color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
      minHeight: '100vh'
    }}>
      {/* Header principal mejorado */}
      <Box sx={{ 
        mb: 4,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 4,
        p: 4,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
      }}>
        {/* Elementos decorativos */}
        <Box sx={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 100,
          height: 100,
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          zIndex: 1
        }} />
        <Box sx={{
          position: 'absolute',
          bottom: -30,
          left: -30,
          width: 80,
          height: 80,
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '50%',
          zIndex: 1
        }} />
        
        {/* Contenido del header */}
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Typography 
            variant="h3" 
            fontWeight={700} 
            sx={{ 
              color: 'white', 
              mb: 1,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            🚀 Mis Proyectos
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: 400,
              textShadow: '0 1px 2px rgba(0,0,0,0.2)'
            }}
          >
            Gestiona y da seguimiento a todos tus proyectos publicados, activos y completados
          </Typography>
        </Box>
      </Box>

             {/* Header con título */}
       <Typography variant="h4" fontWeight={600} sx={{ 
         mb: 3, 
         display: 'flex', 
         alignItems: 'center', 
         pl: 1,
         color: themeMode === 'dark' ? '#f1f5f9' : 'primary'
       }}>
        <AssignmentIcon sx={{ mr: 2, color: themeMode === 'dark' ? '#60a5fa' : 'primary.main' }} />
        Resumen de Proyectos
      </Typography>

             {/* Dashboard mejorado */}
       <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3, mb: 3, pl: 1 }}>
        {/* Proyectos Publicados - Azul marino */}
        <Card sx={{ 
          background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
          color: 'white',
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(30, 64, 175, 0.3)',
          transition: 'transform 0.2s',
          '&:hover': { transform: 'translateY(-4px)' }
        }}>
          <CardContent sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
              {typeof publishedProjects.length === 'number' && !isNaN(publishedProjects.length) ? publishedProjects.length : 0}
            </Typography>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
              Publicados
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Proyectos donde fuiste seleccionado
            </Typography>
          </CardContent>
        </Card>

        {/* Proyectos Activos - Verde lima vibrante */}
        <Card sx={{ 
          background: 'linear-gradient(135deg, #84cc16 0%, #65a30d 100%)',
          color: 'white',
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(132, 204, 22, 0.3)',
          transition: 'transform 0.2s',
          '&:hover': { transform: 'translateY(-4px)' }
        }}>
          <CardContent sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
              {typeof activeProjects.length === 'number' && !isNaN(activeProjects.length) ? activeProjects.length : 0}
            </Typography>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
              Activos
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Proyectos en progreso activo
            </Typography>
          </CardContent>
        </Card>

        {/* Proyectos Completados - Verde esmeralda */}
        <Card sx={{ 
          background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
          color: 'white',
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)',
          transition: 'transform 0.2s',
          '&:hover': { transform: 'translateY(-4px)' }
        }}>
          <CardContent sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
              {typeof completedProjects.length === 'number' && !isNaN(completedProjects.length) ? completedProjects.length : 0}
            </Typography>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
              Completados
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Proyectos completados exitosamente
            </Typography>
          </CardContent>
        </Card>
      </Box>

             {/* Tabs de secciones */}
       <Box sx={{ 
         display: 'flex', 
         justifyContent: 'space-between', 
         alignItems: 'center', 
         mb: 2,
         bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
         borderRadius: 2,
         p: 1
       }}>
        <Tabs value={tab} onChange={handleTabChange} sx={{
          '& .MuiTab-root': {
            color: themeMode === 'dark' ? '#cbd5e1' : '#64748b',
            fontWeight: 600,
            '&.Mui-selected': {
              color: themeMode === 'dark' ? '#60a5fa' : 'primary.main',
            }
          }
        }}>
          <Tab label={`Publicados (${publishedProjects.length})`} />
          <Tab label={`Activos (${activeProjects.length})`} />
          <Tab label={`Completados (${completedProjects.length})`} />
        </Tabs>
        <ShowLatestFilter
          value={tab === 0 ? publishedLimit : (tab === 1 ? activeLimit : completedLimit)}
          onChange={(value) => {
            if (tab === 0) setPublishedLimit(value);
            else if (tab === 1) setActiveLimit(value);
            else setCompletedLimit(value);
          }}
          options={[20, 50, 100, 150, -1]}
        />
      </Box>

      {/* Sección de proyectos publicados */}
      {tab === 0 && (
        <Box>
          {console.log('[MyProjects] Renderizando pestaña publicados:', { publishedProjects: publishedProjects.length, projects: publishedProjects })}
          {console.log('[MyProjects] publishedProjects.length === 0:', publishedProjects.length === 0)}
          {publishedProjects.length === 0 ? (
            <Paper sx={{ 
              p: 4, 
              textAlign: 'center', 
              color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary',
              bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff'
            }}>
              No tienes proyectos publicados aún.
            </Paper>
          ) : (
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
              gap: 3,
              alignItems: 'stretch'
            }}>
              {publishedProjects.slice(0, publishedLimit).map((project) => {
                console.log('[MyProjects] Renderizando proyecto:', project);
                return (
                  <Card key={project.id} sx={{ 
                    height: '100%',
                    minHeight: '320px',
                    cursor: 'default', 
                    borderRadius: 3, 
                    boxShadow: 4, 
                    background: themeMode === 'dark' 
                      ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' 
                      : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                    border: themeMode === 'dark' 
                      ? '2px solid #475569' 
                      : '2px solid #1976d2',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': { 
                      transform: 'translateY(-8px) scale(1.02)', 
                      boxShadow: themeMode === 'dark' 
                        ? '0 12px 40px rgba(96, 165, 250, 0.3)' 
                        : '0 12px 40px rgba(25, 118, 210, 0.3)',
                      borderColor: themeMode === 'dark' ? '#60a5fa' : '#1565c0'
                    }
                  }}>
                    <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1, gap: 1 }}>
                        <Typography variant="h6" fontWeight={700} sx={{ 
                          flex: 1, 
                          color: themeMode === 'dark' ? '#60a5fa' : '#1976d2',
                          lineHeight: 1.2,
                          minHeight: '2.4em',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>{project.title}</Typography>
                        <Chip 
                          icon={getStatusIcon(project.status)} 
                          label={getStatusText(project.status)} 
                          color={getStatusColor(project.status) as any} 
                          size="small" 
                          sx={{ fontWeight: 600, flexShrink: 0 }} 
                        />
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <BusinessIcon sx={{ color: themeMode === 'dark' ? '#60a5fa' : '#1976d2', fontSize: 20, flexShrink: 0 }} />
                        <Typography variant="body2" sx={{ 
                          fontWeight: 500,
                          color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary'
                        }}><b>Empresa:</b> {project.company}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                        {project.apiLevel && <Chip label={`API ${project.apiLevel}`} color="success" size="small" icon={<TrendingUpIcon />} />}
                        {project.modality && <Chip label={project.modality} color="info" size="small" />}
                        {project.hoursPerWeek && <Chip label={`Horas/sem: ${project.hoursPerWeek}`} color="default" size="small" />}
                        {project.maxStudents && <Chip label={`Máx. estudiantes: ${project.maxStudents}`} color="success" size="small" />}
                      </Box>
                      {/* Descripción TRL en azul para proyectos publicados */}
                      {project.trlLevel && (
                        <Box sx={{ 
                          bgcolor: themeMode === 'dark' ? '#1e3a8a' : '#e3f2fd', 
                          borderRadius: 2, 
                          p: 1.2, 
                          mb: 1, 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1, 
                          border: themeMode === 'dark' ? '1px solid #60a5fa' : '1px solid #1976d2' 
                        }}>
                          <ScienceIcon sx={{ color: themeMode === 'dark' ? '#60a5fa' : '#1976d2', fontSize: 20 }} />
                          <Typography variant="body2" sx={{ 
                            color: themeMode === 'dark' ? '#93c5fd' : '#1565c0', 
                            fontWeight: 600 
                          }}>
                            {getTrlDescriptionOnly(Number(project.trlLevel))}
                          </Typography>
                        </Box>
                      )}
                      <Typography variant="body2" sx={{ 
                        mb: 1, 
                        fontStyle: 'italic', 
                        flex: 1, 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        display: '-webkit-box', 
                        WebkitLineClamp: 3, 
                        WebkitBoxOrient: 'vertical',
                        color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary',
                        minHeight: '4.5em'
                      }}>
                        {project.description.slice(0, 120)}...
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                        {project.technologies.slice(0, 3).map((tech) => (
                          <Chip key={tech} label={tech} size="small" variant="outlined" />
                        ))}
                        {project.technologies.length > 3 && (
                          <Chip label={`+${project.technologies.length - 3}`} size="small" variant="outlined" />
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                        <Typography variant="caption" sx={{ 
                          color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary'
                        }}>
                          {typeof project.totalHours === 'number' && !isNaN(project.totalHours) ? project.totalHours : 0} horas • {project.location}
                        </Typography>
                        <IconButton 
                          size="small" 
                          sx={{ color: themeMode === 'dark' ? '#60a5fa' : '#1976d2' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewProjectDetails(project);
                          }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          )}
        </Box>
      )}

      {/* Sección de proyectos activos */}
      {tab === 1 && (
        <Box>
          {activeProjects.length === 0 ? (
            <Paper sx={{ 
              p: 4, 
              textAlign: 'center', 
              color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary',
              bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff'
            }}>
              No tienes proyectos activos aún.
            </Paper>
          ) : (
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
              gap: 3,
              alignItems: 'stretch'
            }}>
              {activeProjects.slice(0, activeLimit).map((project) => (
                <Card key={project.id} sx={{ 
                  height: '100%',
                  minHeight: '320px',
                  cursor: 'default', 
                  borderRadius: 3, 
                  boxShadow: 4, 
                  background: themeMode === 'dark' 
                    ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' 
                    : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                  border: themeMode === 'dark' 
                    ? '2px solid #475569' 
                    : '2px solid #388e3c',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': { 
                    transform: 'translateY(-8px) scale(1.02)', 
                    boxShadow: themeMode === 'dark' 
                      ? '0 12px 40px rgba(156, 39, 176, 0.3)' 
                      : '0 12px 40px rgba(156, 39, 176, 0.3)',
                    borderColor: themeMode === 'dark' ? '#a855f7' : '#7B1FA2'
                  }
                }}>
                  <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1, gap: 1 }}>
                      <Typography variant="h6" fontWeight={700} sx={{ 
                        flex: 1, 
                        color: themeMode === 'dark' ? '#a855f7' : '#9C27B0',
                        lineHeight: 1.2,
                        minHeight: '2.4em',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>{project.title}</Typography>
                      <Chip 
                        icon={getStatusIcon(project.status)} 
                        label={getStatusText(project.status)} 
                        color={getStatusColor(project.status) as any} 
                        size="small" 
                        sx={{ fontWeight: 600, flexShrink: 0 }} 
                      />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <BusinessIcon sx={{ color: themeMode === 'dark' ? '#a855f7' : '#9C27B0', fontSize: 20, flexShrink: 0 }} />
                      <Typography variant="body2" sx={{ 
                        fontWeight: 500,
                        color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary'
                      }}><b>Empresa:</b> {project.company}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                      {project.apiLevel && <Chip label={`API ${project.apiLevel}`} color="success" size="small" icon={<TrendingUpIcon />} />}
                      {project.modality && <Chip label={project.modality} color="info" size="small" />}
                      {project.hoursPerWeek && <Chip label={`Horas/sem: ${project.hoursPerWeek}`} color="default" size="small" />}
                      {project.maxStudents && <Chip label={`Máx. estudiantes: ${project.maxStudents}`} color="success" size="small" />}
                    </Box>
                    {/* Descripción TRL en morado para proyectos activos */}
                    {project.trlLevel && (
                      <Box sx={{ 
                        bgcolor: themeMode === 'dark' ? '#581c87' : '#f3e5f5', 
                        borderRadius: 2, 
                        p: 1.2, 
                        mb: 1, 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1, 
                        border: themeMode === 'dark' ? '1px solid #a855f7' : '1px solid #9C27B0' 
                      }}>
                        <ScienceIcon sx={{ color: themeMode === 'dark' ? '#a855f7' : '#9C27B0', fontSize: 20 }} />
                        <Typography variant="body2" sx={{ 
                          color: themeMode === 'dark' ? '#c084fc' : '#7B1FA2', 
                          fontWeight: 600 
                        }}>
                          {getTrlDescriptionOnly(Number(project.trlLevel))}
                        </Typography>
                      </Box>
                    )}
                    <Typography variant="body2" sx={{ 
                      mb: 1, 
                      fontStyle: 'italic', 
                      flex: 1, 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      display: '-webkit-box', 
                      WebkitLineClamp: 3, 
                      WebkitBoxOrient: 'vertical',
                      color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary',
                      minHeight: '4.5em'
                    }}>
                      {project.description.slice(0, 120)}...
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                      {project.technologies.slice(0, 3).map((tech) => (
                        <Chip key={tech} label={tech} size="small" variant="outlined" />
                      ))}
                      {project.technologies.length > 3 && (
                        <Chip label={`+${project.technologies.length - 3}`} size="small" variant="outlined" />
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                      <Typography variant="caption" sx={{ 
                        color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary'
                      }}>
                        {typeof project.totalHours === 'number' && !isNaN(project.totalHours) ? project.totalHours : 0} horas • {project.location}
                      </Typography>
                      <IconButton 
                        size="small" 
                        sx={{ color: themeMode === 'dark' ? '#a855f7' : '#9C27B0' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewProjectDetails(project);
                        }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* Sección de proyectos completados */}
      {tab === 2 && (
        <Box>
          {completedProjects.length === 0 ? (
            <Paper sx={{ 
              p: 4, 
              textAlign: 'center', 
              color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary',
              bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff'
            }}>
              No tienes proyectos completados aún.
            </Paper>
          ) : (
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
              gap: 3,
              alignItems: 'stretch'
            }}>
              {completedProjects.slice(0, completedLimit).map((project) => (
                <Card key={project.id} sx={{ 
                  height: '100%',
                  minHeight: '320px',
                  cursor: 'default', 
                  borderRadius: 3,
                  boxShadow: 4,
                  background: themeMode === 'dark' 
                    ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' 
                    : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                  border: themeMode === 'dark' 
                    ? '2px solid #475569' 
                    : '2px solid #2196F3',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': { 
                    transform: 'translateY(-8px) scale(1.02)', 
                    boxShadow: themeMode === 'dark' 
                      ? '0 12px 40px rgba(34, 197, 94, 0.3)' 
                      : '0 12px 40px rgba(33, 150, 243, 0.3)',
                    borderColor: themeMode === 'dark' ? '#22c55e' : '#1976D2'
                  }
                }}>
                  <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1, gap: 1 }}>
                      <Typography variant="h6" fontWeight={700} sx={{ 
                        flex: 1, 
                        color: themeMode === 'dark' ? '#22c55e' : '#2196F3',
                        lineHeight: 1.2,
                        minHeight: '2.4em',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {project.title}
                      </Typography>
                      <Chip 
                        icon={getStatusIcon(project.status)} 
                        label={getStatusText(project.status)} 
                        color={getStatusColor(project.status) as any} 
                        size="small" 
                        sx={{ fontWeight: 600, flexShrink: 0 }} 
                      />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <BusinessIcon sx={{ color: themeMode === 'dark' ? '#22c55e' : '#2196F3', fontSize: 20, flexShrink: 0 }} />
                      <Typography variant="body2" sx={{ 
                        fontWeight: 500,
                        color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary'
                      }}><b>Empresa:</b> {project.company}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                      {project.apiLevel && <Chip label={`API ${project.apiLevel}`} color="success" size="small" icon={<TrendingUpIcon />} />}
                      {project.modality && <Chip label={project.modality} color="info" size="small" />}
                      {project.hoursPerWeek && <Chip label={`Horas/sem: ${project.hoursPerWeek}`} color="default" size="small" />}
                      {project.maxStudents && <Chip label={`Máx. estudiantes: ${project.maxStudents}`} color="success" size="small" />}
                    </Box>
                    {/* Descripción TRL en verde para proyectos completados */}
                    {project.trlLevel && (
                      <Box sx={{ 
                        bgcolor: themeMode === 'dark' ? '#14532d' : '#f0fdf4', 
                        borderRadius: 2, 
                        p: 1.2, 
                        mb: 1, 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1, 
                        border: themeMode === 'dark' ? '1px solid #22c55e' : '1px solid #16a34a' 
                      }}>
                        <ScienceIcon sx={{ color: themeMode === 'dark' ? '#22c55e' : '#16a34a', fontSize: 20 }} />
                        <Typography variant="body2" sx={{ 
                          color: themeMode === 'dark' ? '#86efac' : '#166534', 
                          fontWeight: 600 
                        }}>
                          {getTrlDescriptionOnly(Number(project.trlLevel))}
                        </Typography>
                      </Box>
                    )}
                    <Typography variant="body2" sx={{ 
                      mb: 1, 
                      fontStyle: 'italic', 
                      flex: 1, 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      display: '-webkit-box', 
                      WebkitLineClamp: 3, 
                      WebkitBoxOrient: 'vertical',
                      color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary',
                      minHeight: '4.5em'
                    }}>
                      {project.description.slice(0, 120)}...
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                      {project.technologies.slice(0, 3).map((tech) => (
                        <Chip key={tech} label={tech} size="small" variant="outlined" />
                      ))}
                      {project.technologies.length > 3 && (
                        <Chip label={`+${project.technologies.length - 3}`} size="small" variant="outlined" />
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                      <Typography variant="caption" sx={{ 
                        color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary'
                      }}>
                        {typeof project.totalHours === 'number' && !isNaN(project.totalHours) ? project.totalHours : 0} horas • {project.location}
                      </Typography>
                      <IconButton 
                        size="small" 
                        sx={{ color: themeMode === 'dark' ? '#22c55e' : '#2196F3' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewProjectDetails(project);
                        }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* Modal de detalles del proyecto */}
      {selectedProjectDetail && (
        <ProjectDetailsModal
          open={detailModalOpen}
          onClose={handleCloseDetailModal}
          project={selectedProjectDetail}
          loading={loadingProjectDetail}
          showStudents={false}
          userRole="student"
        />
      )}
    </Box>
  );
};

// Función para obtener descripción del TRL
function getTrlDescriptionOnly(trlLevel: number) {
  const descriptions = [
    'El proyecto está en fase de idea inicial. Aún no hay desarrollo previo y se está definiendo qué se quiere lograr.',
    'El proyecto tiene una definición clara de lo que se quiere lograr y se conocen los antecedentes del problema a resolver.',
    'Se han realizado pruebas iniciales y validaciones de concepto. Algunas partes del proyecto ya han sido evaluadas por separado.',
    'Existe un prototipo básico que ha sido probado en condiciones controladas y simples.',
    'Existe un prototipo que ha sido probado en condiciones similares a las reales donde funcionará.',
    'El prototipo ha sido probado en un entorno real mediante un piloto o prueba inicial.',
    'El proyecto ha sido probado en condiciones reales durante un tiempo prolongado, demostrando su funcionamiento.',
    'El proyecto está validado tanto técnicamente como comercialmente, listo para su implementación.',
    'El proyecto está completamente desarrollado y disponible para ser utilizado por la sociedad.'
  ];
  return descriptions[trlLevel - 1] || '';
}

export default MyProjects; 