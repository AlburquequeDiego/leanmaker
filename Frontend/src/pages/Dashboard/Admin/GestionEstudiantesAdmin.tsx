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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Avatar,
  Rating,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Person as PersonIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  History as HistoryIcon,
} from '@mui/icons-material';

interface Student {
  id: string;
  name: string;
  email: string;
  career: string;
  semester: number;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  apiLevel: 1 | 2 | 3;
  strikes: number;
  joinDate: string;
  lastActivity: string;
  gpa: number;
  completedProjects: number;
  totalHours: number;
}

interface Application {
  id: string;
  projectTitle: string;
  company: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  date: string;
  rating?: number;
}

interface Evaluation {
  id: string;
  projectTitle: string;
  company: string;
  rating: number;
  comment: string;
  date: string;
  category: 'technical' | 'soft_skills' | 'punctuality' | 'teamwork';
}

interface DisciplinaryRecord {
  id: string;
  type: 'strike' | 'warning' | 'commendation';
  reason: string;
  date: string;
  assignedBy: string;
  description: string;
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
      id={`student-tabpanel-${index}`}
      aria-labelledby={`student-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const GestionEstudiantesAdmin = () => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [actionDialog, setActionDialog] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'strike' | 'api_level' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [selectedApiLevel, setSelectedApiLevel] = useState<number>(1);

  // Mock data
  const students: Student[] = [
    {
      id: '1',
      name: 'María González',
      email: 'maria.gonzalez@estudiante.edu',
      career: 'Ingeniería de Sistemas',
      semester: 8,
      status: 'approved',
      apiLevel: 2,
      strikes: 1,
      joinDate: '2023-02-15',
      lastActivity: '2024-01-20',
      gpa: 4.2,
      completedProjects: 3,
      totalHours: 180,
    },
    {
      id: '2',
      name: 'Carlos Ruiz',
      email: 'carlos.ruiz@estudiante.edu',
      career: 'Ingeniería Informática',
      semester: 6,
      status: 'pending',
      apiLevel: 1,
      strikes: 0,
      joinDate: '2024-01-10',
      lastActivity: '2024-01-18',
      gpa: 3.8,
      completedProjects: 1,
      totalHours: 60,
    },
    {
      id: '3',
      name: 'Ana Martínez',
      email: 'ana.martinez@estudiante.edu',
      career: 'Ingeniería de Software',
      semester: 10,
      status: 'approved',
      apiLevel: 3,
      strikes: 0,
      joinDate: '2022-09-20',
      lastActivity: '2024-01-22',
      gpa: 4.5,
      completedProjects: 5,
      totalHours: 320,
    },
  ];

  const applications: Application[] = [
    {
      id: '1',
      projectTitle: 'Sistema de Gestión de Inventarios',
      company: 'TechCorp Solutions',
      status: 'completed',
      date: '2023-09-01',
      rating: 4.5,
    },
    {
      id: '2',
      projectTitle: 'Aplicación Móvil de Delivery',
      company: 'Digital Dynamics',
      status: 'accepted',
      date: '2024-01-15',
    },
  ];

  const evaluations: Evaluation[] = [
    {
      id: '1',
      projectTitle: 'Sistema de Gestión de Inventarios',
      company: 'TechCorp Solutions',
      rating: 4.5,
      comment: 'Excelente trabajo técnico, muy responsable y puntual.',
      date: '2023-12-20',
      category: 'technical',
    },
    {
      id: '2',
      projectTitle: 'Sistema de Gestión de Inventarios',
      company: 'TechCorp Solutions',
      rating: 4.0,
      comment: 'Buena comunicación y trabajo en equipo.',
      date: '2023-12-20',
      category: 'soft_skills',
    },
  ];

  const disciplinaryRecords: DisciplinaryRecord[] = [
    {
      id: '1',
      type: 'strike',
      reason: 'Inasistencia a entrevista programada',
      date: '2023-11-15',
      assignedBy: 'Admin',
      description: 'No se presentó a la entrevista con TechCorp Solutions sin previo aviso.',
    },
    {
      id: '2',
      type: 'commendation',
      reason: 'Excelente desempeño en proyecto',
      date: '2023-12-20',
      assignedBy: 'TechCorp Solutions',
      description: 'Destacado por su profesionalismo y calidad de trabajo.',
    },
  ];

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAction = (student: Student, type: 'approve' | 'reject' | 'strike' | 'api_level') => {
    setSelectedStudent(student);
    setActionType(type);
    setActionDialog(true);
    if (type === 'api_level') {
      setSelectedApiLevel(student.apiLevel);
    }
  };

  const handleActionConfirm = () => {
    console.log(`Aplicando acción ${actionType} a ${selectedStudent?.name}`, actionReason);
    setActionDialog(false);
    setActionReason('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      case 'suspended':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Aprobado';
      case 'pending':
        return 'Pendiente';
      case 'rejected':
        return 'Rechazado';
      case 'suspended':
        return 'Suspendido';
      default:
        return status;
    }
  };

  const getApiLevelText = (level: number) => {
    switch (level) {
      case 1:
        return 'Nivel 1: Habilidades básicas';
      case 2:
        return 'Nivel 2: Capacitado para tareas prácticas supervisadas';
      case 3:
        return 'Nivel 3: Ejecución autónoma de proyectos';
      default:
        return `Nivel ${level}`;
    }
  };

  const getDisciplinaryIcon = (type: string) => {
    switch (type) {
      case 'strike':
        return <WarningIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'commendation':
        return <CheckCircleIcon color="success" />;
      default:
        return <HistoryIcon />;
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Gestión de Estudiantes
      </Typography>

      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="student management tabs">
          <Tab label="Estudiantes" />
          <Tab label="Perfil Detallado" />
          <Tab label="Postulaciones" />
          <Tab label="Evaluaciones" />
          <Tab label="Historial Disciplinario" />
          <Tab label="Nivel API" />
        </Tabs>

        {/* Tab: Estudiantes */}
        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Estudiante</TableCell>
                  <TableCell>Carrera</TableCell>
                  <TableCell>Semestre</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Nivel API</TableCell>
                  <TableCell>Strikes</TableCell>
                  <TableCell>GPA</TableCell>
                  <TableCell>Proyectos</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          <PersonIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="body1">{student.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {student.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{student.career}</TableCell>
                    <TableCell>{student.semester}°</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(student.status)}
                        color={getStatusColor(student.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`Nivel ${student.apiLevel}`}
                        color="primary"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${student.strikes}/3`}
                        color={student.strikes >= 3 ? 'error' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{student.gpa}</TableCell>
                    <TableCell>{student.completedProjects}</TableCell>
                    <TableCell>
                      <IconButton size="small" color="primary">
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton size="small" color="primary">
                        <EditIcon />
                      </IconButton>
                      {student.status === 'pending' && (
                        <>
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleAction(student, 'approve')}
                          >
                            <CheckCircleIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleAction(student, 'reject')}
                          >
                            <CancelIcon />
                          </IconButton>
                        </>
                      )}
                      <IconButton
                        size="small"
                        color="warning"
                        onClick={() => handleAction(student, 'strike')}
                      >
                        <AddIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Tab: Perfil Detallado */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Información Personal
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ mr: 2, width: 64, height: 64 }}>
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">María González</Typography>
                    <Typography variant="body2" color="text.secondary">
                      maria.gonzalez@estudiante.edu
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2">
                  <strong>Carrera:</strong> Ingeniería de Sistemas
                </Typography>
                <Typography variant="body2">
                  <strong>Semestre:</strong> 8°
                </Typography>
                <Typography variant="body2">
                  <strong>GPA:</strong> 4.2
                </Typography>
                <Typography variant="body2">
                  <strong>Fecha de registro:</strong> 15/02/2023
                </Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Estadísticas Académicas
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2">Proyectos completados:</Typography>
                  <Typography variant="body2" fontWeight="bold">3</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2">Horas acumuladas:</Typography>
                  <Typography variant="body2" fontWeight="bold">180 horas</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2">Nivel API actual:</Typography>
                  <Typography variant="body2" fontWeight="bold">Nivel 2</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Strikes:</Typography>
                  <Typography variant="body2" fontWeight="bold" color="error.main">
                    1/3
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>

        {/* Tab: Postulaciones */}
        <TabPanel value={tabValue} index={2}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Proyecto</TableCell>
                  <TableCell>Empresa</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Calificación</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {applications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>{application.projectTitle}</TableCell>
                    <TableCell>{application.company}</TableCell>
                    <TableCell>
                      <Chip
                        label={application.status === 'completed' ? 'Completado' : 'Aceptado'}
                        color={application.status === 'completed' ? 'success' : 'primary'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{application.date}</TableCell>
                    <TableCell>
                      {application.rating ? (
                        <Rating value={application.rating} readOnly size="small" />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Pendiente
                        </Typography>
                      )}
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
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
            {evaluations.map((evaluation) => (
              <Card key={evaluation.id}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {evaluation.projectTitle}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Empresa: {evaluation.company}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Rating value={evaluation.rating} readOnly size="small" />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      ({evaluation.rating})
                    </Typography>
                  </Box>
                  <Chip
                    label={evaluation.category === 'technical' ? 'Técnico' : 'Habilidades Blandas'}
                    size="small"
                    color={evaluation.category === 'technical' ? 'primary' : 'secondary'}
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" sx={{ mb: 1 }}>
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

        {/* Tab: Historial Disciplinario */}
        <TabPanel value={tabValue} index={4}>
          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              color="warning"
              startIcon={<AddIcon />}
              onClick={() => handleAction(students[0], 'strike')}
            >
              Asignar Strike
            </Button>
          </Box>
          <List>
            {disciplinaryRecords.map((record) => (
              <ListItem key={record.id} divider>
                <ListItemIcon>
                  {getDisciplinaryIcon(record.type)}
                </ListItemIcon>
                <ListItemText
                  primary={record.reason}
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {record.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {record.date} - Asignado por: {record.assignedBy}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </TabPanel>

        {/* Tab: Nivel API */}
        <TabPanel value={tabValue} index={5}>
          <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              Asignación de Nivel API
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              El Nivel API (Aptitud Profesional Institucional) determina el tipo de proyectos a los que puede postular el estudiante.
            </Typography>
            
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  María González
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Nivel API actual: <strong>Nivel 2</strong>
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {getApiLevelText(2)}
                </Typography>
                
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel>Nuevo Nivel API</InputLabel>
                  <Select
                    value={selectedApiLevel}
                    label="Nuevo Nivel API"
                    onChange={(e) => setSelectedApiLevel(e.target.value as number)}
                  >
                    <MenuItem value={1}>Nivel 1: Habilidades básicas</MenuItem>
                    <MenuItem value={2}>Nivel 2: Capacitado para tareas prácticas supervisadas</MenuItem>
                    <MenuItem value={3}>Nivel 3: Ejecución autónoma de proyectos</MenuItem>
                  </Select>
                </FormControl>
                
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                  onClick={() => handleAction(students[0], 'api_level')}
                >
                  Actualizar Nivel API
                </Button>
              </CardContent>
            </Card>

            <Alert severity="info">
              <Typography variant="body2">
                <strong>Nota:</strong> El cambio de nivel API debe estar justificado por el desempeño académico, 
                evaluaciones recibidas y certificados del estudiante.
              </Typography>
            </Alert>
          </Box>
        </TabPanel>
      </Paper>

      {/* Dialog para acciones */}
      <Dialog open={actionDialog} onClose={() => setActionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {actionType === 'approve' && 'Aprobar Estudiante'}
          {actionType === 'reject' && 'Rechazar Estudiante'}
          {actionType === 'strike' && 'Asignar Strike'}
          {actionType === 'api_level' && 'Cambiar Nivel API'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Estudiante: {selectedStudent?.name}
          </Typography>
          {actionType === 'api_level' ? (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                Nivel API actual: {selectedStudent?.apiLevel}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Nuevo nivel: {selectedApiLevel}
              </Typography>
            </Box>
          ) : (
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Motivo"
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              sx={{ mt: 2 }}
            />
          )}
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

export default GestionEstudiantesAdmin; 