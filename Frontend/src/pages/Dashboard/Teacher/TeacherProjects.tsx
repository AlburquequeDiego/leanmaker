/**
 * 🎓 TEACHER PROJECTS - GESTIÓN DE PROYECTOS DEL DOCENTE
 * 
 * DESCRIPCIÓN:
 * Esta página permite al docente gestionar los proyectos asignados a sus estudiantes,
 * supervisar el progreso y realizar evaluaciones.
 * 
 * FUNCIONALIDADES PRINCIPALES:
 * - Lista de proyectos asignados
 * - Seguimiento de progreso
 * - Evaluación de proyectos
 * - Gestión de estudiantes por proyecto
 * 
 * CONEXIONES CON LA BASE DE DATOS:
 * - Endpoint: /api/teacher/projects/
 * - Hook: useTeacherProjects
 * - Datos: Proyectos asignados, estudiantes, progreso
 * 
 * AUTOR: Sistema LeanMaker
 * FECHA: 2024
 * VERSIÓN: 1.0
 */

import { useState, useEffect } from 'react';
import {
  Box, 
  Typography, 
  Paper, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  CircularProgress, 
  Alert, 
  Chip,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Stack,
  InputAdornment,
  Grid,
  LinearProgress,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Assessment as AssessmentIcon,
  Timer as TimerIcon,
  Star as StarIcon,
  Work as WorkIcon,
} from '@mui/icons-material';
import { apiService } from '../../../services/api.service';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../contexts/ThemeContext';

interface Project {
  id: string;
  title: string;
  description: string;
  company_name: string;
  company_id: string;
  status: 'draft' | 'published' | 'active' | 'completed' | 'cancelled';
  start_date: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
  assigned_students: Student[];
  progress: number;
  total_hours: number;
  completed_hours: number;
  trl_level: number;
  area: string;
  requirements: string;
  modality: 'remote' | 'onsite' | 'hybrid';
}

interface Student {
  id: string;
  name: string;
  email: string;
  api_level: number;
  hours_worked: number;
  status: 'active' | 'inactive' | 'completed';
  performance_score?: number;
}

export default function TeacherProjects() {
  const { user } = useAuth();
  const { themeMode } = useTheme();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [areaFilter, setAreaFilter] = useState('');

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data para proyectos asignados al docente
      const mockProjects: Project[] = [
        {
          id: '1',
          title: 'Sistema de Gestión Empresarial',
          description: 'Desarrollo de un sistema web para gestión de inventarios y ventas',
          company_name: 'TechCorp',
          company_id: 'techcorp-001',
          status: 'active',
          start_date: '2024-01-15',
          end_date: '2024-03-15',
          created_at: '2024-01-10T10:00:00Z',
          updated_at: '2024-01-20T14:30:00Z',
          assigned_students: [
            {
              id: '1',
              name: 'Ana García',
              email: 'ana.garcia@estudiante.cl',
              api_level: 2,
              hours_worked: 25,
              status: 'active',
              performance_score: 8.5
            },
            {
              id: '2',
              name: 'Carlos López',
              email: 'carlos.lopez@estudiante.cl',
              api_level: 3,
              hours_worked: 18,
              status: 'active',
              performance_score: 7.2
            }
          ],
          progress: 65,
          total_hours: 120,
          completed_hours: 78,
          trl_level: 3,
          area: 'Desarrollo de Software',
          requirements: 'Conocimientos en React, Node.js, MongoDB',
          modality: 'hybrid'
        },
        {
          id: '2',
          title: 'Aplicación Mobile React Native',
          description: 'Desarrollo de aplicación móvil para gestión de tareas',
          company_name: 'StartupXYZ',
          company_id: 'startup-002',
          status: 'completed',
          start_date: '2023-11-01',
          end_date: '2023-12-31',
          created_at: '2023-10-25T09:00:00Z',
          updated_at: '2023-12-31T16:00:00Z',
          assigned_students: [
            {
              id: '1',
              name: 'Ana García',
              email: 'ana.garcia@estudiante.cl',
              api_level: 2,
              hours_worked: 40,
              status: 'completed',
              performance_score: 9.0
            }
          ],
          progress: 100,
          total_hours: 80,
          completed_hours: 80,
          trl_level: 4,
          area: 'Desarrollo Mobile',
          requirements: 'React Native, JavaScript, Firebase',
          modality: 'remote'
        },
        {
          id: '3',
          title: 'Análisis de Datos con Python',
          description: 'Análisis estadístico de datos de ventas para optimización',
          company_name: 'DataCorp',
          company_id: 'datacorp-003',
          status: 'active',
          start_date: '2024-01-20',
          end_date: '2024-04-20',
          created_at: '2024-01-15T11:00:00Z',
          updated_at: '2024-01-21T13:20:00Z',
          assigned_students: [
            {
              id: '3',
              name: 'María Rodríguez',
              email: 'maria.rodriguez@estudiante.cl',
              api_level: 1,
              hours_worked: 12,
              status: 'active',
              performance_score: 8.8
            }
          ],
          progress: 25,
          total_hours: 60,
          completed_hours: 15,
          trl_level: 2,
          area: 'Ciencia de Datos',
          requirements: 'Python, Pandas, Matplotlib, Estadística',
          modality: 'onsite'
        }
      ];
      
      setProjects(mockProjects);
      
    } catch (err: any) {
      setError('Error al cargar proyectos');
    } finally {
      setLoading(false);
    }
  };

  const openProjectModal = (project: Project) => {
    setSelectedProject(project);
    setShowProjectModal(true);
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.area.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || project.status === statusFilter;
    const matchesArea = !areaFilter || project.area === areaFilter;
    
    return matchesSearch && matchesStatus && matchesArea;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'info';
      case 'draft': return 'default';
      case 'published': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'completed': return 'Completado';
      case 'draft': return 'Borrador';
      case 'published': return 'Publicado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getModalityIcon = (modality: string) => {
    switch (modality) {
      case 'remote': return '🏠';
      case 'onsite': return '🏢';
      case 'hybrid': return '🔄';
      default: return '📋';
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Cargando proyectos...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} sx={{ color: 'primary.main', mb: 1 }}>
          🚀 Mis Proyectos
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Supervisa y gestiona los proyectos asignados a tus estudiantes.
        </Typography>
      </Box>

      {/* Filtros y búsqueda */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Buscar por título, empresa o área..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Estado"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="active">Activo</MenuItem>
                <MenuItem value="completed">Completado</MenuItem>
                <MenuItem value="draft">Borrador</MenuItem>
                <MenuItem value="published">Publicado</MenuItem>
                <MenuItem value="cancelled">Cancelado</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Área</InputLabel>
              <Select
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
                label="Área"
              >
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="Desarrollo de Software">Desarrollo de Software</MenuItem>
                <MenuItem value="Desarrollo Mobile">Desarrollo Mobile</MenuItem>
                <MenuItem value="Ciencia de Datos">Ciencia de Datos</MenuItem>
                <MenuItem value="Inteligencia Artificial">Inteligencia Artificial</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadProjects}
              fullWidth
            >
              Actualizar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Lista de proyectos */}
      <Grid container spacing={3}>
        {filteredProjects.map((project) => (
          <Grid item xs={12} md={6} lg={4} key={project.id}>
            <Card 
              elevation={2}
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
              onClick={() => openProjectModal(project)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <AssignmentIcon />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                      {project.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {project.company_name}
                    </Typography>
                  </Box>
                  <Chip 
                    label={getStatusLabel(project.status)}
                    color={getStatusColor(project.status) as any}
                    size="small"
                  />
                </Box>

                <Divider sx={{ my: 2 }} />

                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Área:
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {project.area}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Modalidad:
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {getModalityIcon(project.modality)} {project.modality}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      TRL:
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      Nivel {project.trl_level}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Estudiantes:
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {project.assigned_students.length} asignados
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Horas:
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {project.completed_hours}h / {project.total_hours}h
                    </Typography>
                  </Box>
                </Stack>

                <Divider sx={{ my: 2 }} />

                {/* Barra de progreso */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Progreso
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {project.progress}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={project.progress} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ScheduleIcon sx={{ color: 'text.secondary', mr: 0.5, fontSize: 16 }} />
                    <Typography variant="body2" color="text.secondary">
                      {new Date(project.end_date || project.start_date).toLocaleDateString()}
                    </Typography>
                  </Box>
                  
                  <Button
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      openProjectModal(project);
                    }}
                  >
                    Ver detalles
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Modal de detalles del proyecto */}
      <Dialog 
        open={showProjectModal} 
        onClose={() => setShowProjectModal(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
              <AssignmentIcon />
            </Avatar>
            <Box>
              <Typography variant="h6">{selectedProject?.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedProject?.company_name}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {selectedProject && (
            <Box>
              {/* Información básica */}
              <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  📋 Información del Proyecto
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Descripción:</Typography>
                    <Typography variant="body1">{selectedProject.description}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Requisitos:</Typography>
                    <Typography variant="body1">{selectedProject.requirements}</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">Estado:</Typography>
                    <Chip 
                      label={getStatusLabel(selectedProject.status)}
                      color={getStatusColor(selectedProject.status) as any}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">Modalidad:</Typography>
                    <Typography variant="body1">
                      {getModalityIcon(selectedProject.modality)} {selectedProject.modality}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">TRL:</Typography>
                    <Typography variant="body1">Nivel {selectedProject.trl_level}</Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Estudiantes asignados */}
              <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  👥 Estudiantes Asignados
                </Typography>
                <List>
                  {selectedProject.assigned_students.map((student) => (
                    <ListItem key={student.id}>
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: 'secondary.main' }}>
                          {student.name.charAt(0)}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={student.name}
                        secondary={`${student.email} - Nivel API ${student.api_level}`}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                          label={`${student.hours_worked}h`}
                          size="small"
                          color="primary"
                        />
                        <Chip 
                          label={student.status}
                          size="small"
                          color={student.status === 'active' ? 'success' : 'default'}
                        />
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </Paper>

              {/* Progreso del proyecto */}
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  📊 Progreso del Proyecto
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Progreso general:</Typography>
                    <Box sx={{ mt: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={selectedProject.progress} 
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {selectedProject.progress}%
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Horas trabajadas:</Typography>
                    <Typography variant="h6" color="primary.main">
                      {selectedProject.completed_hours}h / {selectedProject.total_hours}h
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setShowProjectModal(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}