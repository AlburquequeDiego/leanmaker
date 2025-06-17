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
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
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
  Search as SearchIcon,
  FilterList as FilterListIcon,
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
  companyName: string;
}

interface Evaluation {
  id: string;
  projectTitle: string;
  studentName: string;
  rating: number;
  comment: string;
  date: string;
  companyName: string;
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
  
  // Nuevos estados para filtros
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedRating, setSelectedRating] = useState('');

  // Nuevos estados para limitar la cantidad de registros mostrados
  const [empresasLimit, setEmpresasLimit] = useState<number | 'all'>(10);
  const [proyectosLimit, setProyectosLimit] = useState<number | 'all'>(10);
  const [evaluacionesLimit, setEvaluacionesLimit] = useState<number | 'all'>(10);

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
    {
      id: '4',
      name: 'StartupXYZ',
      email: 'contact@startupxyz.com',
      status: 'blocked',
      projectsCount: 1,
      rating: 2.5,
      joinDate: '2023-06-15',
      lastActivity: '2023-12-01',
    },
    {
      id: '5',
      name: 'TechInnovate',
      email: 'info@techinnovate.com',
      status: 'active',
      projectsCount: 5,
      rating: 4.8,
      joinDate: '2023-04-10',
      lastActivity: '2024-01-25',
    },
  ];

  // Filtrado de empresas
  const filteredCompanies = companies.filter(company =>
    (company.name.toLowerCase().includes(search.toLowerCase()) || 
     company.email.toLowerCase().includes(search.toLowerCase())) &&
    (selectedStatus ? company.status === selectedStatus : true) &&
    (selectedRating ? 
      (selectedRating === 'high' && company.rating >= 4.5) ||
      (selectedRating === 'medium' && company.rating >= 3.5 && company.rating < 4.5) ||
      (selectedRating === 'low' && company.rating < 3.5)
      : true)
  );

  const projects: Project[] = [
    {
      id: '1',
      title: 'Sistema de Gestión de Inventarios',
      status: 'completed',
      studentsCount: 3,
      startDate: '2023-09-01',
      endDate: '2023-12-15',
      rating: 4.5,
      companyName: 'TechCorp Solutions',
    },
    {
      id: '2',
      title: 'Aplicación Móvil de Delivery',
      status: 'active',
      studentsCount: 2,
      startDate: '2024-01-01',
      endDate: '2024-04-30',
      rating: 4.0,
      companyName: 'Digital Dynamics',
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
      companyName: 'TechCorp Solutions',
    },
    {
      id: '2',
      projectTitle: 'Aplicación Móvil de Delivery',
      studentName: 'Carlos Ruiz',
      rating: 4,
      comment: 'Buena oportunidad de aprendizaje, equipo muy colaborativo.',
      date: '2024-01-15',
      companyName: 'Digital Dynamics',
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
          {/* Sección de filtros mejorada y responsiva */}
          <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: 3, boxShadow: 2, bgcolor: 'grey.50' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <FilterListIcon color="primary" />
              <Typography variant="h6" color="primary">
                Filtros de Búsqueda
              </Typography>
            </Box>
            
            <Stack 
              direction={{ xs: 'column', lg: 'row' }} 
              spacing={{ xs: 2, sm: 2 }} 
              alignItems={{ xs: 'stretch', lg: 'center' }}
              flexWrap="wrap"
              sx={{ mb: 2 }}
            >
              <TextField
                label="Buscar por nombre o email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ 
                  minWidth: { xs: '100%', sm: 250 },
                  borderRadius: 2 
                }}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
              
              <FormControl sx={{ minWidth: { xs: '100%', sm: 150 } }}>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={selectedStatus}
                  label="Estado"
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">Todos los estados</MenuItem>
                  <MenuItem value="active">Activas</MenuItem>
                  <MenuItem value="suspended">Suspendidas</MenuItem>
                  <MenuItem value="blocked">Bloqueadas</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl sx={{ minWidth: { xs: '100%', sm: 150 } }}>
                <InputLabel>Calificación</InputLabel>
                <Select
                  value={selectedRating}
                  label="Calificación"
                  onChange={(e) => setSelectedRating(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">Todas las calificaciones</MenuItem>
                  <MenuItem value="high">Alta (4.5+)</MenuItem>
                  <MenuItem value="medium">Media (3.5-4.4)</MenuItem>
                  <MenuItem value="low">Baja (menos de 3.5)</MenuItem>
                </Select>
              </FormControl>
              
              <Button 
                variant="outlined" 
                onClick={() => {
                  setSearch('');
                  setSelectedStatus('');
                  setSelectedRating('');
                }}
                sx={{ 
                  borderRadius: 2,
                  minWidth: { xs: '100%', sm: 'auto' }
                }}
              >
                Limpiar Filtros
              </Button>
            </Stack>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <TextField
                select
                size="small"
                label="Mostrar"
                value={empresasLimit}
                onChange={e => setEmpresasLimit(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                sx={{ minWidth: 110 }}
              >
                {[5, 10, 15, 20, 30, 40, 100, 150].map(val => (
                  <MenuItem key={val} value={val}>Últimos {val}</MenuItem>
                ))}
                <MenuItem value="all">Todas</MenuItem>
              </TextField>
            </Box>
            
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Mostrando {filteredCompanies.length} de {companies.length} empresas
              </Typography>
            </Box>
          </Paper>

          {/* Tabla responsiva */}
          <Box sx={{ overflowX: 'auto' }}>
            <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2, minWidth: 900 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'primary.main' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 600, minWidth: 180, whiteSpace: 'nowrap' }}>Empresa</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600, minWidth: 150, whiteSpace: 'nowrap' }}>Email</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600, minWidth: 90, whiteSpace: 'nowrap' }}>Estado</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600, minWidth: 90, whiteSpace: 'nowrap' }}>Proyectos</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600, minWidth: 80, whiteSpace: 'nowrap' }}>Rating</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600, minWidth: 100, whiteSpace: 'nowrap' }}>Fecha Registro</TableCell>
                    <TableCell align="center" sx={{ color: 'white', fontWeight: 600, minWidth: 120, whiteSpace: 'nowrap' }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(empresasLimit === 'all' ? filteredCompanies : filteredCompanies.slice(0, empresasLimit)).map(company => (
                    <TableRow key={company.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main' }}>
                            <BusinessIcon fontSize="small" />
                          </Avatar>
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="body2" fontWeight={600} noWrap>
                              {company.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>
                              Última actividad: {new Date(company.lastActivity).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap>
                          {company.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={getStatusText(company.status)} 
                          color={getStatusColor(company.status) as any}
                          variant="filled"
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={company.projectsCount} 
                          color="primary" 
                          variant="filled"
                          size="small"
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
                      <TableCell>
                        <Typography variant="body2" noWrap>
                          {new Date(company.joinDate).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'center' }}>
                          <IconButton 
                            color="info" 
                            title="Ver detalles"
                            onClick={() => handleAction(company, 'activate')}
                            size="small"
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                          {company.status === 'active' && (
                            <>
                              <IconButton 
                                color="warning" 
                                title="Suspender empresa"
                                onClick={() => handleAction(company, 'suspend')}
                                size="small"
                              >
                                <WarningIcon fontSize="small" />
                              </IconButton>
                              <IconButton 
                                color="error" 
                                title="Bloquear empresa"
                                onClick={() => handleAction(company, 'block')}
                                size="small"
                              >
                                <BlockIcon fontSize="small" />
                              </IconButton>
                            </>
                          )}
                          {company.status !== 'active' && (
                            <IconButton 
                              color="success" 
                              title="Activar empresa"
                              onClick={() => handleAction(company, 'activate')}
                              size="small"
                            >
                              <CheckCircleIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>

        {/* Tab: Historial de Proyectos */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <TextField
              select
              size="small"
              label="Mostrar"
              value={proyectosLimit}
              onChange={e => setProyectosLimit(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              sx={{ minWidth: 110 }}
            >
              {[5, 10, 15, 20, 30, 40, 100, 150].map(val => (
                <MenuItem key={val} value={val}>Últimos {val}</MenuItem>
              ))}
              <MenuItem value="all">Todos</MenuItem>
            </TextField>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Proyecto</TableCell>
                  <TableCell>Empresa</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Estudiantes</TableCell>
                  <TableCell>Fecha Inicio</TableCell>
                  <TableCell>Fecha Fin</TableCell>
                  <TableCell>Calificación</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(proyectosLimit === 'all' ? projects : projects.slice(0, proyectosLimit)).map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>{project.title}</TableCell>
                    <TableCell>{project.companyName}</TableCell>
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <TextField
              select
              size="small"
              label="Mostrar"
              value={evaluacionesLimit}
              onChange={e => setEvaluacionesLimit(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              sx={{ minWidth: 110 }}
            >
              {[5, 10, 15, 20, 30, 40, 100, 150].map(val => (
                <MenuItem key={val} value={val}>Últimos {val}</MenuItem>
              ))}
              <MenuItem value="all">Todas</MenuItem>
            </TextField>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
            {(evaluacionesLimit === 'all' ? evaluations : evaluations.slice(0, evaluacionesLimit)).map((evaluation) => (
              <Card key={evaluation.id}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {evaluation.projectTitle}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Estudiante: {evaluation.studentName}
                  </Typography>
                  <Typography variant="body2" color="primary.main" gutterBottom>
                    Empresa: {evaluation.companyName}
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