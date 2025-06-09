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
  };

  const handleActionConfirm = () => {
    // Aquí se implementaría la lógica para aplicar la acción
    console.log(`Aplicando acción ${actionType} a ${selectedCompany?.name}`, actionReason);
    setActionDialog(false);
    setActionReason('');
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
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Gestión de Empresas
      </Typography>

      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="company management tabs">
          <Tab label="Empresas" />
          <Tab label="Historial de Proyectos" />
          <Tab label="Evaluaciones" />
          <Tab label="Documentos" />
          <Tab label="Acciones Administrativas" />
        </Tabs>

        {/* Tab: Empresas */}
        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Empresa</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Proyectos</TableCell>
                  <TableCell>Calificación</TableCell>
                  <TableCell>Última Actividad</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {companies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          <BusinessIcon />
                        </Avatar>
                        <Typography variant="body1">{company.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{company.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(company.status)}
                        color={getStatusColor(company.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{company.projectsCount}</TableCell>
                    <TableCell>
                      <Rating value={company.rating} readOnly size="small" />
                      <Typography variant="body2" color="text.secondary">
                        ({company.rating})
                      </Typography>
                    </TableCell>
                    <TableCell>{company.lastActivity}</TableCell>
                    <TableCell>
                      <IconButton size="small" color="primary">
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton size="small" color="primary">
                        <EditIcon />
                      </IconButton>
                      {company.status === 'active' ? (
                        <>
                          <IconButton
                            size="small"
                            color="warning"
                            onClick={() => handleAction(company, 'suspend')}
                          >
                            <WarningIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleAction(company, 'block')}
                          >
                            <BlockIcon />
                          </IconButton>
                        </>
                      ) : (
                        <IconButton
                          size="small"
                          color="success"
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

        {/* Tab: Documentos */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" gutterBottom>
              Gestión de Documentos
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Aquí puedes gestionar los documentos de las empresas
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                startIcon={<UploadIcon />}
                sx={{ mr: 2 }}
              >
                Subir Documentos
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
              >
                Descargar Reportes
              </Button>
            </Box>
          </Box>
        </TabPanel>

        {/* Tab: Acciones Administrativas */}
        <TabPanel value={tabValue} index={4}>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" gutterBottom>
              Acciones Administrativas
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Gestiona las acciones administrativas para las empresas
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3, flexWrap: 'wrap' }}>
              <Button variant="contained" color="warning" startIcon={<WarningIcon />}>
                Suspender Empresa
              </Button>
              <Button variant="contained" color="error" startIcon={<BlockIcon />}>
                Bloquear Empresa
              </Button>
              <Button variant="contained" color="success" startIcon={<CheckCircleIcon />}>
                Activar Empresa
              </Button>
            </Box>
          </Box>
        </TabPanel>
      </Paper>

      {/* Dialog para acciones administrativas */}
      <Dialog open={actionDialog} onClose={() => setActionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {actionType === 'block' && 'Bloquear Empresa'}
          {actionType === 'suspend' && 'Suspender Empresa'}
          {actionType === 'activate' && 'Activar Empresa'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Empresa: {selectedCompany?.name}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Motivo"
            value={actionReason}
            onChange={(e) => setActionReason(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog(false)}>Cancelar</Button>
          <Button onClick={handleActionConfirm} variant="contained" color="primary">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GestionEmpresasAdmin; 