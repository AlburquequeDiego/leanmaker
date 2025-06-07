import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Stack,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Business as BusinessIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  CalendarToday as CalendarIcon,
  Assignment as AssignmentIcon,
  Description as DescriptionIcon,
  Chat as ChatIcon,
} from '@mui/icons-material';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';

// Mock de proyectos
const mockProjects = [
  {
    id: '1',
    title: 'Desarrollo de Aplicación Web',
    company: 'Tech Solutions',
    status: 'in_progress',
    progress: 65,
    description: 'Desarrollo de una aplicación web full-stack utilizando React y Node.js.',
    startDate: '2024-05-01',
    endDate: '2024-07-31',
    nextDeadline: '2024-06-15',
    tasks: [
      { id: 1, title: 'Implementar autenticación', status: 'completed' },
      { id: 2, title: 'Desarrollar dashboard', status: 'in_progress' },
      { id: 3, title: 'Integrar API', status: 'pending' },
    ],
    mentor: 'Juan Pérez',
    mentorEmail: 'juan.perez@techsolutions.com',
  },
  {
    id: '2',
    title: 'Análisis de Datos',
    company: 'Data Analytics Corp',
    status: 'on_track',
    progress: 85,
    description: 'Proyecto de análisis de datos y visualización para dashboard empresarial.',
    startDate: '2024-04-15',
    endDate: '2024-06-15',
    nextDeadline: '2024-06-10',
    tasks: [
      { id: 1, title: 'Recolección de datos', status: 'completed' },
      { id: 2, title: 'Análisis estadístico', status: 'completed' },
      { id: 3, title: 'Visualización', status: 'in_progress' },
    ],
    mentor: 'María García',
    mentorEmail: 'maria.garcia@dataanalytics.com',
  },
  {
    id: '3',
    title: 'Diseño de UI/UX',
    company: 'Creative Design',
    status: 'at_risk',
    progress: 30,
    description: 'Diseño de interfaz de usuario y experiencia para aplicación móvil.',
    startDate: '2024-06-01',
    endDate: '2024-06-30',
    nextDeadline: '2024-06-12',
    tasks: [
      { id: 1, title: 'Wireframes', status: 'completed' },
      { id: 2, title: 'Prototipos', status: 'in_progress' },
      { id: 3, title: 'Testing', status: 'pending' },
    ],
    mentor: 'Carlos López',
    mentorEmail: 'carlos.lopez@creativedesign.com',
  },
];

const statusConfig = {
  in_progress: {
    label: 'En Progreso',
    color: 'info',
    icon: <AccessTimeIcon />,
  },
  on_track: {
    label: 'En Tiempo',
    color: 'success',
    icon: <CheckCircleIcon />,
  },
  at_risk: {
    label: 'En Riesgo',
    color: 'warning',
    icon: <WarningIcon />,
  },
};

const taskStatusConfig = {
  completed: {
    label: 'Completado',
    color: 'success',
  },
  in_progress: {
    label: 'En Progreso',
    color: 'info',
  },
  pending: {
    label: 'Pendiente',
    color: 'warning',
  },
};

export default function MyProjects() {
  const projects = mockProjects;
  const [selectedTab, setSelectedTab] = useState('all');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const filteredProjects = projects.filter(project => 
    selectedTab === 'all' || project.status === selectedTab
  );

  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    setSelectedTab(newValue);
  };

  const handleViewDetails = (id: string) => {
    setSelectedProject(id);
    setDetailsDialogOpen(true);
  };

  const getSelectedProject = () => {
    return projects.find(p => p.id === selectedProject);
  };

  const getStatusCount = (status: string) => {
    return projects.filter(project => project.status === status).length;
  };

  return (
    <DashboardLayout userRole="student">
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Mis Proyectos
        </Typography>

        {/* Tabs de filtrado */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab 
              label={`Todos (${projects.length})`} 
              value="all"
            />
            <Tab 
              label={`En Progreso (${getStatusCount('in_progress')})`} 
              value="in_progress"
            />
            <Tab 
              label={`En Tiempo (${getStatusCount('on_track')})`} 
              value="on_track"
            />
            <Tab 
              label={`En Riesgo (${getStatusCount('at_risk')})`} 
              value="at_risk"
            />
          </Tabs>
        </Paper>

        {/* Lista de proyectos */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          {filteredProjects.map((project) => (
            <Box key={project.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  '&:hover': {
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Typography variant="h6" component="div" sx={{ pr: 4 }}>
                      {project.title}
                    </Typography>
                    <Chip
                      icon={statusConfig[project.status as keyof typeof statusConfig].icon}
                      label={statusConfig[project.status as keyof typeof statusConfig].label}
                      color={statusConfig[project.status as keyof typeof statusConfig].color as any}
                      size="small"
                    />
                  </Stack>

                  <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                    <BusinessIcon color="action" fontSize="small" />
                    <Typography variant="body2" color="text.secondary">
                      {project.company}
                    </Typography>
                  </Stack>

                  <Typography variant="body2" color="text.secondary" paragraph>
                    {project.description}
                  </Typography>

                  {/* Barra de progreso */}
                  <Box sx={{ mb: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2" color="text.secondary">
                        Progreso
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {project.progress}%
                      </Typography>
                    </Stack>
                    <LinearProgress 
                      variant="determinate" 
                      value={project.progress}
                      color={project.status === 'at_risk' ? 'warning' : 'primary'}
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Fechas y acciones */}
                  <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CalendarIcon color="action" fontSize="small" />
                      <Typography variant="body2" color="text.secondary">
                        Próxima fecha: {new Date(project.nextDeadline).toLocaleDateString('es-ES')}
                      </Typography>
                    </Stack>
                    
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Ver Detalles">
                        <IconButton 
                          size="small" 
                          onClick={() => handleViewDetails(project.id)}
                          color="primary"
                        >
                          <DescriptionIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Tareas">
                        <IconButton size="small" color="primary">
                          <AssignmentIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Chat con Mentor">
                        <IconButton size="small" color="primary">
                          <ChatIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>

        {/* Diálogo de detalles */}
        <Dialog
          open={detailsDialogOpen}
          onClose={() => setDetailsDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          {selectedProject && getSelectedProject() && (
            <>
              <DialogTitle>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">
                    {getSelectedProject()?.title}
                  </Typography>
                  <Chip
                    icon={statusConfig[getSelectedProject()!.status as keyof typeof statusConfig].icon}
                    label={statusConfig[getSelectedProject()!.status as keyof typeof statusConfig].label}
                    color={statusConfig[getSelectedProject()!.status as keyof typeof statusConfig].color as any}
                    size="small"
                  />
                </Stack>
              </DialogTitle>
              <DialogContent>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Descripción
                    </Typography>
                    <Typography variant="body2">
                      {getSelectedProject()?.description}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Fechas Importantes
                    </Typography>
                    <Stack spacing={1}>
                      <Typography variant="body2">
                        Inicio: {new Date(getSelectedProject()!.startDate).toLocaleDateString('es-ES')}
                      </Typography>
                      <Typography variant="body2">
                        Fin: {new Date(getSelectedProject()!.endDate).toLocaleDateString('es-ES')}
                      </Typography>
                      <Typography variant="body2" color="primary">
                        Próxima fecha: {new Date(getSelectedProject()!.nextDeadline).toLocaleDateString('es-ES')}
                      </Typography>
                    </Stack>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Mentor
                    </Typography>
                    <Stack spacing={1}>
                      <Typography variant="body2">
                        {getSelectedProject()?.mentor}
                      </Typography>
                      <Typography variant="body2" color="primary">
                        {getSelectedProject()?.mentorEmail}
                      </Typography>
                    </Stack>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Tareas
                    </Typography>
                    <Stack spacing={1}>
                      {getSelectedProject()?.tasks.map((task) => (
                        <Stack 
                          key={task.id} 
                          direction="row" 
                          justifyContent="space-between" 
                          alignItems="center"
                          sx={{ 
                            p: 1, 
                            bgcolor: 'action.hover',
                            borderRadius: 1,
                          }}
                        >
                          <Typography variant="body2">
                            {task.title}
                          </Typography>
                          <Chip
                            label={taskStatusConfig[task.status as keyof typeof taskStatusConfig].label}
                            color={taskStatusConfig[task.status as keyof typeof taskStatusConfig].color as any}
                            size="small"
                          />
                        </Stack>
                      ))}
                    </Stack>
                  </Box>
                </Stack>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDetailsDialogOpen(false)}>
                  Cerrar
                </Button>
                <Button variant="contained" color="primary">
                  Ver Tareas
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {filteredProjects.length === 0 && (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No hay proyectos {selectedTab !== 'all' ? `con estado ${statusConfig[selectedTab as keyof typeof statusConfig]?.label.toLowerCase()}` : ''}.
            </Typography>
          </Paper>
        )}
      </Box>
    </DashboardLayout>
  );
} 