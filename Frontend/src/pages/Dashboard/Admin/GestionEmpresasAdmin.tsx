import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Card,
  CardContent,
  Avatar,
  Rating,
  Snackbar
} from '@mui/material';
import {
  Business as BusinessIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';

interface Company {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'suspended' | 'blocked';
  projectsCount: number;
  rating: number;
  joinDate: string;
  lastActivity: string;
}

interface Project {
  id: string;
  title: string;
  status: 'active' | 'completed' | 'cancelled';
  studentsCount: number;
  startDate: string;
  endDate: string;
  rating: number;
}

interface Evaluation {
  id: string;
  projectTitle: string;
  studentName: string;
  rating: number;
  comment: string;
  date: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`company-tabpanel-${index}`}
      aria-labelledby={`company-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const GestionEmpresasAdmin = () => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [actionDialog, setActionDialog] = useState(false);
  const [actionType, setActionType] = useState<'block' | 'suspend' | 'activate' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Mock data
  const companies: Company[] = [
    {
      id: '1',
      name: 'TechCorp Solutions',
      email: 'contact@techcorp.com',
      status: 'active',
      projectsCount: 8,
      rating: 4.5,
      joinDate: '2023-01-15',
      lastActivity: '2024-01-20',
    },
    {
      id: '2',
      name: 'InnovateLab',
      email: 'info@innovatelab.com',
      status: 'suspended',
      projectsCount: 3,
      rating: 3.8,
      joinDate: '2023-03-20',
      lastActivity: '2024-01-10',
    },
    {
      id: '3',
      name: 'Digital Dynamics',
      email: 'hello@digitaldynamics.com',
      status: 'active',
      projectsCount: 12,
      rating: 4.2,
      joinDate: '2023-02-10',
      lastActivity: '2024-01-22',
    },
  ];

  const projects: Project[] = [
    {
      id: '1',
      title: 'Sistema de Gestión de Inventarios',
      status: 'completed',
      studentsCount: 3,
      startDate: '2023-09-01',
      endDate: '2023-12-15',
      rating: 4.5,
    },
    {
      id: '2',
      title: 'Aplicación Móvil de Delivery',
      status: 'active',
      studentsCount: 2,
      startDate: '2024-01-01',
      endDate: '2024-04-30',
      rating: 4.0,
    },
  ];

  const evaluations: Evaluation[] = [
    {
      id: '1',
      projectTitle: 'Sistema de Gestión de Inventarios',
      studentName: 'María González',
      rating: 5,
      comment: 'Excelente experiencia, aprendí mucho sobre desarrollo backend.',
      date: '2023-12-20',
    },
    {
      id: '2',
      projectTitle: 'Aplicación Móvil de Delivery',
      studentName: 'Carlos Ruiz',
      rating: 4,
      comment: 'Buena oportunidad de aprendizaje, equipo muy colaborativo.',
      date: '2024-01-15',
    },
  ];

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAction = (company: Company, type: 'block' | 'suspend' | 'activate') => {
    setSelectedCompany(company);
    setActionType(type);
    setActionDialog(true);
    setActionReason('');
  };

  const handleActionConfirm = () => {
    let message = '';
    switch (actionType) {
      case 'block':
        message = `Empresa ${selectedCompany?.name} bloqueada exitosamente`;
        break;
      case 'suspend':
        message = `Empresa ${selectedCompany?.name} suspendida`;
        break;
      case 'activate':
        message = `Empresa ${selectedCompany?.name} activada`;
        break;
    }
    setSuccessMessage(message);
    setShowSuccess(true);
    setActionDialog(false);
    setActionReason('');
  };

  const getDialogTitle = () => {
    switch (actionType) {
      case 'block': return 'Bloquear Empresa';
      case 'suspend': return 'Suspender Empresa';
      case 'activate': return 'Activar Empresa';
      default: return '';
    }
  };

  const getDialogContent = () => {
    if (!selectedCompany) return null;

    return (
      <Box>
        <Typography variant="h6" gutterBottom>Empresa: {selectedCompany.name}</Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {selectedCompany.email}
        </Typography>
        <Typography variant="body2" gutterBottom>
          Estado actual: <strong>{selectedCompany.status === 'active' ? 'Activa' : 
                                  selectedCompany.status === 'suspended' ? 'Suspendida' : 'Bloqueada'}</strong>
        </Typography>
        
        {(actionType === 'block' || actionType === 'suspend') && (
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Razón de la acción"
            value={actionReason}
            onChange={(e) => setActionReason(e.target.value)}
            sx={{ mt: 2, borderRadius: 2 }}
            required
          />
        )}
        
        {actionType === 'activate' && (
          <Typography variant="body1" sx={{ mt: 2, p: 2, bgcolor: 'success.light', borderRadius: 2, color: 'success.contrastText' }}>
            ¿Estás seguro de que deseas reactivar esta empresa? Esto permitirá que vuelva a publicar proyectos y gestionar estudiantes.
          </Typography>
        )}
      </Box>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'suspended':
        return 'warning';
      case 'blocked':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activa';
      case 'suspended':
        return 'Suspendida';
      case 'blocked':
        return 'Bloqueada';
      default:
        return status;
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4, mb: 4, px: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <BusinessIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Typography variant="h4">Gestión de Empresas</Typography>
      </Box>

      <Paper sx={{ borderRadius: 3, boxShadow: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Empresas" />
          <Tab label="Proyectos" />
          <Tab label="Evaluaciones" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Empresa</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Estado</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Proyectos</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Rating</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Fecha Registro</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 600 }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {companies.map(company => (
                  <TableRow key={company.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                          <BusinessIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {company.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Última actividad: {new Date(company.lastActivity).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{company.email}</TableCell>
                    <TableCell>
                      <Chip 
                        label={company.status === 'active' ? 'Activa' : 
                               company.status === 'suspended' ? 'Suspendida' : 'Bloqueada'} 
                        color={company.status === 'active' ? 'success' : 
                               company.status === 'suspended' ? 'warning' : 'error'}
                        variant="filled"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={company.projectsCount} 
                        color="primary" 
                        variant="filled"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Rating value={company.rating} readOnly size="small" />
                        <Typography variant="body2" fontWeight={600}>
                          {company.rating}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{new Date(company.joinDate).toLocaleDateString()}</TableCell>
                    <TableCell align="center">
                      <IconButton 
                        color="info" 
                        title="Ver detalles"
                        onClick={() => handleAction(company, 'activate')}
                        sx={{ mr: 1 }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                      {company.status === 'active' && (
                        <>
                          <IconButton 
                            color="warning" 
                            title="Suspender empresa"
                            onClick={() => handleAction(company, 'suspend')}
                            sx={{ mr: 1 }}
                          >
                            <WarningIcon />
                          </IconButton>
                          <IconButton 
                            color="error" 
                            title="Bloquear empresa"
                            onClick={() => handleAction(company, 'block')}
                            sx={{ mr: 1 }}
                          >
                            <BlockIcon />
                          </IconButton>
                        </>
                      )}
                      {company.status !== 'active' && (
                        <IconButton 
                          color="success" 
                          title="Activar empresa"
                          onClick={() => handleAction(company, 'activate')}
                        >
                          <CheckCircleIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Tab: Historial de Proyectos */}
        <TabPanel value={tabValue} index={1}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Proyecto</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Estudiantes</TableCell>
                  <TableCell>Fecha Inicio</TableCell>
                  <TableCell>Fecha Fin</TableCell>
                  <TableCell>Calificación</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>{project.title}</TableCell>
                    <TableCell>
                      <Chip
                        label={project.status === 'active' ? 'Activo' : 'Completado'}
                        color={project.status === 'active' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{project.studentsCount}</TableCell>
                    <TableCell>{project.startDate}</TableCell>
                    <TableCell>{project.endDate}</TableCell>
                    <TableCell>
                      <Rating value={project.rating} readOnly size="small" />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" color="primary">
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Tab: Evaluaciones */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
            {evaluations.map((evaluation) => (
              <Card key={evaluation.id}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {evaluation.projectTitle}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Estudiante: {evaluation.studentName}
                  </Typography>
                  <Rating value={evaluation.rating} readOnly size="small" />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {evaluation.comment}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {evaluation.date}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </TabPanel>
      </Paper>

      {/* Diálogo de acción */}
      <Dialog 
        open={actionDialog} 
        onClose={() => setActionDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {actionType === 'block' && <BlockIcon color="error" />}
          {actionType === 'suspend' && <WarningIcon color="warning" />}
          {actionType === 'activate' && <CheckCircleIcon color="success" />}
          {getDialogTitle()}
        </DialogTitle>
        <DialogContent>
          {getDialogContent()}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setActionDialog(false)}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleActionConfirm}
            variant="contained"
            color={
              actionType === 'block' ? 'error' : 
              actionType === 'suspend' ? 'warning' : 'success'
            }
            sx={{ borderRadius: 2 }}
            disabled={
              (actionType === 'block' || actionType === 'suspend') && !actionReason.trim()
            }
          >
            {actionType === 'block' ? 'Bloquear' : 
             actionType === 'suspend' ? 'Suspender' : 'Activar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar de éxito */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={4000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Paper elevation={3} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircleIcon color="success" />
          <Typography color="success.main" fontWeight={600}>
            {successMessage}
          </Typography>
        </Paper>
      </Snackbar>
    </Box>
  );
};

export default GestionEmpresasAdmin; 