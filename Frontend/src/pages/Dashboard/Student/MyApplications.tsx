import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';

interface Application {
  id: string;
  projectTitle: string;
  company: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  appliedDate: string;
  responseDate?: string;
  requiredSkills: string[];
  projectDuration: string;
  salary: string;
  location: string;
  description: string;
  compatibility: number;
  notes?: string;
}

const mockApplications: Application[] = [
  {
    id: '1',
    projectTitle: 'Sistema de Gestión de Inventarios',
    company: 'TechCorp Solutions',
    status: 'accepted',
    appliedDate: '2024-01-15',
    responseDate: '2024-01-20',
    requiredSkills: ['React', 'Node.js', 'MySQL'],
    projectDuration: '3 meses',
    salary: '$500,000 COP/mes',
    location: 'Remoto',
    description: 'Desarrollo de un sistema web para gestión de inventarios con base de datos MySQL y frontend en React.',
    compatibility: 95,
    notes: 'Proyecto aceptado. Inicio programado para febrero.',
  },
  {
    id: '2',
    projectTitle: 'Aplicación Móvil de Delivery',
    company: 'Digital Dynamics',
    status: 'pending',
    appliedDate: '2024-01-18',
    requiredSkills: ['React Native', 'Firebase', 'JavaScript'],
    projectDuration: '4 meses',
    salary: '$600,000 COP/mes',
    location: 'Bogotá',
    description: 'Desarrollo de aplicación móvil para delivery de alimentos con geolocalización y pagos en línea.',
    compatibility: 88,
  },
  {
    id: '3',
    projectTitle: 'Plataforma de E-learning',
    company: 'EduTech Solutions',
    status: 'rejected',
    appliedDate: '2024-01-10',
    responseDate: '2024-01-12',
    requiredSkills: ['Vue.js', 'Laravel', 'PostgreSQL'],
    projectDuration: '6 meses',
    salary: '$550,000 COP/mes',
    location: 'Medellín',
    description: 'Plataforma web para cursos online con sistema de videoconferencias y evaluaciones automáticas.',
    compatibility: 72,
    notes: 'Rechazado por falta de experiencia en Vue.js.',
  },
  {
    id: '4',
    projectTitle: 'Dashboard de Analytics',
    company: 'DataCorp',
    status: 'completed',
    appliedDate: '2023-09-01',
    responseDate: '2023-09-05',
    requiredSkills: ['Python', 'Pandas', 'Power BI'],
    projectDuration: '2 meses',
    salary: '$450,000 COP/mes',
    location: 'Remoto',
    description: 'Desarrollo de dashboard de analytics para visualización de datos empresariales.',
    compatibility: 92,
    notes: 'Proyecto completado exitosamente. Evaluación: 4.5/5.',
  },
];

export const MyApplications = () => {
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application);
    setDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'error';
      case 'completed':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'accepted':
        return 'Aceptada';
      case 'rejected':
        return 'Rechazada';
      case 'completed':
        return 'Completada';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ScheduleIcon />;
      case 'accepted':
        return <CheckCircleIcon />;
      case 'rejected':
        return <CancelIcon />;
      case 'completed':
        return <TrendingUpIcon />;
      default:
        return <AssignmentIcon />;
    }
  };

  const getCompatibilityColor = (compatibility: number) => {
    if (compatibility >= 90) return 'success';
    if (compatibility >= 80) return 'warning';
    return 'error';
  };

  const pendingApplications = mockApplications.filter(app => app.status === 'pending');
  const acceptedApplications = mockApplications.filter(app => app.status === 'accepted');
  const completedApplications = mockApplications.filter(app => app.status === 'completed');
  const rejectedApplications = mockApplications.filter(app => app.status === 'rejected');

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <AssignmentIcon sx={{ mr: 2, color: 'primary.main' }} />
        Mis Aplicaciones
      </Typography>

      {/* Estadísticas */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Card sx={{ flex: '1 1 200px', minWidth: 0 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h3" color="warning.main">
              {pendingApplications.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pendientes
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ flex: '1 1 200px', minWidth: 0 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h3" color="success.main">
              {acceptedApplications.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Aceptadas
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ flex: '1 1 200px', minWidth: 0 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h3" color="info.main">
              {completedApplications.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Completadas
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ flex: '1 1 200px', minWidth: 0 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h3" color="error.main">
              {rejectedApplications.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Rechazadas
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Tabla de aplicaciones */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Historial de Aplicaciones ({mockApplications.length})
        </Typography>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Proyecto</TableCell>
                <TableCell>Empresa</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Compatibilidad</TableCell>
                <TableCell>Fecha Aplicación</TableCell>
                <TableCell>Duración</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockApplications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body1" fontWeight="bold">
                        {application.projectTitle}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {application.description.substring(0, 60)}...
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 1, bgcolor: 'primary.main', width: 24, height: 24 }}>
                        <BusinessIcon fontSize="small" />
                      </Avatar>
                      {application.company}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(application.status)}
                      label={getStatusText(application.status)}
                      color={getStatusColor(application.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`${application.compatibility}%`}
                      color={getCompatibilityColor(application.compatibility) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(application.appliedDate).toLocaleDateString('es-ES')}
                  </TableCell>
                  <TableCell>
                    {application.projectDuration}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleViewDetails(application)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialog para detalles */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">
              Detalles de la Aplicación
            </Typography>
            {selectedApplication && (
              <Chip
                icon={getStatusIcon(selectedApplication.status)}
                label={getStatusText(selectedApplication.status)}
                color={getStatusColor(selectedApplication.status) as any}
              />
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedApplication && (
            <Box>
              <Typography variant="h5" gutterBottom>
                {selectedApplication.projectTitle}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ mr: 1, bgcolor: 'primary.main' }}>
                  <BusinessIcon />
                </Avatar>
                <Typography variant="body1">
                  {selectedApplication.company}
                </Typography>
              </Box>

              <Typography variant="body1" sx={{ mb: 3 }}>
                {selectedApplication.description}
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Duración
                  </Typography>
                  <Typography variant="body1">
                    {selectedApplication.projectDuration}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Salario
                  </Typography>
                  <Typography variant="body1">
                    {selectedApplication.salary}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Ubicación
                  </Typography>
                  <Typography variant="body1">
                    {selectedApplication.location}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Compatibilidad
                  </Typography>
                  <Chip
                    label={`${selectedApplication.compatibility}%`}
                    color={getCompatibilityColor(selectedApplication.compatibility) as any}
                  />
                </Box>
              </Box>

              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Habilidades Requeridas:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                {selectedApplication.requiredSkills.map((skill) => (
                  <Chip key={skill} label={skill} size="small" variant="outlined" />
                ))}
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Fecha de Aplicación
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedApplication.appliedDate).toLocaleDateString('es-ES')}
                  </Typography>
                </Box>
                {selectedApplication.responseDate && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Fecha de Respuesta
                    </Typography>
                    <Typography variant="body1">
                      {new Date(selectedApplication.responseDate).toLocaleDateString('es-ES')}
                    </Typography>
                  </Box>
                )}
              </Box>

              {selectedApplication.notes && (
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>Notas:</strong> {selectedApplication.notes}
                  </Typography>
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyApplications; 