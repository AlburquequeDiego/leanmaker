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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Snackbar,
  Stack,
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
  School as SchoolIcon,
  Api as ApiIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';

interface Student {
  id: string;
  name: string;
  email: string;
  career: string;
  semester: number;
  graduationYear: number;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  apiLevel: 1 | 2 | 3 | 4;
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
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'strike' | 'api_level' | 'suspend' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [selectedApiLevel, setSelectedApiLevel] = useState<number>(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Nuevos estados para filtros
  const [search, setSearch] = useState('');
  const [selectedCareer, setSelectedCareer] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedApiLevelFilter, setSelectedApiLevelFilter] = useState('');

  // Estados para límite de registros por sección
  const [studentsLimit, setStudentsLimit] = useState<number | 'all'>(10);
  const [applicationsLimit, setApplicationsLimit] = useState<number | 'all'>(10);
  const [evaluationsLimit, setEvaluationsLimit] = useState<number | 'all'>(10);

  // Mock data
  const students: Student[] = [
    {
      id: '1',
      name: 'María González',
      email: 'maria.gonzalez@estudiante.edu',
      career: 'Ingeniería de Sistemas',
      semester: 8,
      graduationYear: 2024,
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
      graduationYear: 2025,
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
      graduationYear: 2024,
      status: 'approved',
      apiLevel: 4,
      strikes: 0,
      joinDate: '2022-09-20',
      lastActivity: '2024-01-22',
      gpa: 4.5,
      completedProjects: 5,
      totalHours: 320,
    },
    {
      id: '4',
      name: 'Pedro López',
      email: 'pedro.lopez@estudiante.edu',
      career: 'Ingeniería de Sistemas',
      semester: 4,
      graduationYear: 2026,
      status: 'approved',
      apiLevel: 1,
      strikes: 2,
      joinDate: '2023-08-15',
      lastActivity: '2024-01-19',
      gpa: 3.5,
      completedProjects: 2,
      totalHours: 120,
    },
    {
      id: '5',
      name: 'Laura Silva',
      email: 'laura.silva@estudiante.edu',
      career: 'Ingeniería Informática',
      semester: 8,
      graduationYear: 2024,
      status: 'suspended',
      apiLevel: 3,
      strikes: 3,
      joinDate: '2022-03-10',
      lastActivity: '2024-01-15',
      gpa: 4.0,
      completedProjects: 4,
      totalHours: 240,
    },
  ];

  // Filtrado de estudiantes
  const filteredStudents = students.filter(student =>
    (student.name.toLowerCase().includes(search.toLowerCase()) || 
     student.email.toLowerCase().includes(search.toLowerCase()) ||
     student.career.toLowerCase().includes(search.toLowerCase())) &&
    (selectedCareer ? student.career === selectedCareer : true) &&
    (selectedSemester ? student.semester.toString() === selectedSemester : true) &&
    (selectedYear ? student.graduationYear.toString() === selectedYear : true) &&
    (selectedStatus ? student.status === selectedStatus : true) &&
    (selectedApiLevelFilter ? student.apiLevel.toString() === selectedApiLevelFilter : true)
  );

  // Obtener valores únicos para los filtros
  const careers = Array.from(new Set(students.map(s => s.career)));
  const semesters = Array.from(new Set(students.map(s => s.semester))).sort((a, b) => a - b);
  const years = Array.from(new Set(students.map(s => s.graduationYear))).sort((a, b) => a - b);

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

  const handleAction = (student: Student, type: 'approve' | 'reject' | 'strike' | 'api_level' | 'suspend') => {
    setSelectedStudent(student);
    setActionType(type);
    setActionDialog(true);
    setActionReason('');
    if (type === 'api_level') {
      setSelectedApiLevel(student.apiLevel);
    }
  };

  const handleActionConfirm = () => {
    let message = '';
    switch (actionType) {
      case 'approve':
        message = `Estudiante ${selectedStudent?.name} aprobado exitosamente`;
        break;
      case 'reject':
        message = `Estudiante ${selectedStudent?.name} rechazado`;
        break;
      case 'strike':
        message = `Strike asignado a ${selectedStudent?.name}`;
        break;
      case 'api_level':
        message = `Nivel API actualizado a ${selectedApiLevel} para ${selectedStudent?.name}`;
        break;
      case 'suspend':
        message = `Estudiante ${selectedStudent?.name} suspendido`;
        break;
    }
    setSuccessMessage(message);
    setShowSuccess(true);
    setActionDialog(false);
    setActionReason('');
  };

  const getDialogTitle = () => {
    switch (actionType) {
      case 'approve': return 'Aprobar Estudiante';
      case 'reject': return 'Rechazar Estudiante';
      case 'strike': return 'Asignar Strike';
      case 'api_level': return 'Cambiar Nivel API';
      case 'suspend': return 'Suspender Estudiante';
      default: return '';
    }
  };

  const getDialogContent = () => {
    if (!selectedStudent) return null;

    return (
      <Box>
        <Typography variant="h6" gutterBottom>Estudiante: {selectedStudent.name}</Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {selectedStudent.email} - {selectedStudent.career}
        </Typography>
        
        {actionType === 'api_level' ? (
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Nivel API</InputLabel>
            <Select
              value={selectedApiLevel}
              label="Nivel API"
              onChange={(e) => setSelectedApiLevel(Number(e.target.value))}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value={1}>Nivel 1 - Básico</MenuItem>
              <MenuItem value={2}>Nivel 2 - Intermedio</MenuItem>
              <MenuItem value={3}>Nivel 3 - Avanzado</MenuItem>
              <MenuItem value={4}>Nivel 4 - Experto</MenuItem>
            </Select>
          </FormControl>
        ) : (
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Razón o comentario"
            value={actionReason}
            onChange={(e) => setActionReason(e.target.value)}
            sx={{ mt: 2, borderRadius: 2 }}
            required={actionType === 'reject' || actionType === 'strike' || actionType === 'suspend'}
          />
        )}
      </Box>
    );
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
      case 4:
        return 'Nivel 4: Experto en el área';
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
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4, mb: 4, px: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <SchoolIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Typography variant="h4">Gestión de Estudiantes</Typography>
      </Box>

      <Paper sx={{ borderRadius: 3, boxShadow: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Estudiantes" />
          <Tab label="Postulaciones" />
          <Tab label="Evaluaciones" />
          <Tab label="Registros Disciplinarios" />
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
              direction={{ xs: 'column', md: 'row' }} 
              spacing={{ xs: 2, sm: 2 }} 
              alignItems={{ xs: 'stretch', md: 'center' }}
              flexWrap="wrap"
              sx={{ mb: 2 }}
            >
              <TextField
                label="Buscar por nombre, email o carrera"
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
              
              <FormControl sx={{ minWidth: { xs: '100%', sm: 180 } }}>
                <InputLabel>Carrera</InputLabel>
                <Select
                  value={selectedCareer}
                  label="Carrera"
                  onChange={(e) => setSelectedCareer(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">Todas las carreras</MenuItem>
                  {careers.map((career) => (
                    <MenuItem key={career} value={career}>{career}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl sx={{ minWidth: { xs: '100%', sm: 150 } }}>
                <InputLabel>Semestre</InputLabel>
                <Select
                  value={selectedSemester}
                  label="Semestre"
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">Todos los semestres</MenuItem>
                  {semesters.map((semester) => (
                    <MenuItem key={semester} value={semester.toString()}>{semester}°</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl sx={{ minWidth: { xs: '100%', sm: 150 } }}>
                <InputLabel>Año de Graduación</InputLabel>
                <Select
                  value={selectedYear}
                  label="Año de Graduación"
                  onChange={(e) => setSelectedYear(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">Todos los años</MenuItem>
                  {years.map((year) => (
                    <MenuItem key={year} value={year.toString()}>{year}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={{ xs: 2, sm: 2 }} 
              alignItems={{ xs: 'stretch', sm: 'center' }}
              flexWrap="wrap"
            >
              <FormControl sx={{ minWidth: { xs: '100%', sm: 150 } }}>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={selectedStatus}
                  label="Estado"
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">Todos los estados</MenuItem>
                  <MenuItem value="approved">Aprobados</MenuItem>
                  <MenuItem value="pending">Pendientes</MenuItem>
                  <MenuItem value="rejected">Rechazados</MenuItem>
                  <MenuItem value="suspended">Suspendidos</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl sx={{ minWidth: { xs: '100%', sm: 150 } }}>
                <InputLabel>Nivel API</InputLabel>
                <Select
                  value={selectedApiLevelFilter}
                  label="Nivel API"
                  onChange={(e) => setSelectedApiLevelFilter(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">Todos los niveles</MenuItem>
                  <MenuItem value="1">Nivel 1 - Básico</MenuItem>
                  <MenuItem value="2">Nivel 2 - Intermedio</MenuItem>
                  <MenuItem value="3">Nivel 3 - Avanzado</MenuItem>
                  <MenuItem value="4">Nivel 4 - Experto</MenuItem>
                </Select>
              </FormControl>
              
              <Button 
                variant="outlined" 
                onClick={() => {
                  setSearch('');
                  setSelectedCareer('');
                  setSelectedSemester('');
                  setSelectedYear('');
                  setSelectedStatus('');
                  setSelectedApiLevelFilter('');
                }}
                sx={{ 
                  borderRadius: 2,
                  minWidth: { xs: '100%', sm: 'auto' }
                }}
              >
                Limpiar Filtros
              </Button>
            </Stack>
            
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Mostrando {filteredStudents.length} de {students.length} estudiantes
              </Typography>
            </Box>
          </Paper>

          {/* Selector de cantidad de registros para estudiantes */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <TextField
              select
              size="small"
              label="Mostrar"
              value={studentsLimit}
              onChange={e => setStudentsLimit(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              sx={{ minWidth: 110 }}
            >
              {[5, 10, 15, 20, 30, 40, 100, 150].map(val => (
                <MenuItem key={val} value={val}>Últimos {val}</MenuItem>
              ))}
              <MenuItem value="all">Todas</MenuItem>
            </TextField>
          </Box>

          {/* Tabla responsiva */}
          <Box sx={{ overflowX: 'auto' }}>
            <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2, minWidth: 900 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'primary.main' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 600, minWidth: 180, whiteSpace: 'nowrap' }}>Estudiante</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600, minWidth: 120, whiteSpace: 'nowrap' }}>Carrera</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600, minWidth: 80, whiteSpace: 'nowrap' }}>Semestre</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600, minWidth: 120, whiteSpace: 'nowrap' }}>Año Graduación</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600, minWidth: 100, whiteSpace: 'nowrap' }}>Estado</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600, minWidth: 100, whiteSpace: 'nowrap' }}>Nivel API</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600, minWidth: 80, whiteSpace: 'nowrap' }}>Strikes</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600, minWidth: 80, whiteSpace: 'nowrap' }}>GPA</TableCell>
                    <TableCell align="center" sx={{ color: 'white', fontWeight: 600, minWidth: 150, whiteSpace: 'nowrap' }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(studentsLimit === 'all' ? filteredStudents : filteredStudents.slice(0, studentsLimit)).map(student => (
                    <TableRow key={student.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 28, height: 28 }}>
                            {student.name.charAt(0)}
                          </Avatar>
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="body2" fontWeight={600} noWrap>
                              {student.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {student.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap>
                          {student.career}
                        </Typography>
                      </TableCell>
                      <TableCell>{student.semester}°</TableCell>
                      <TableCell>{student.graduationYear}</TableCell>
                      <TableCell>
                        <Chip 
                          label={getStatusText(student.status)} 
                          color={getStatusColor(student.status) as any}
                          variant="filled"
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={`API ${student.apiLevel}`} 
                          color="primary" 
                          variant="filled"
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={student.strikes} 
                          color={student.strikes === 0 ? 'success' : student.strikes >= 3 ? 'error' : 'warning'}
                          variant="filled"
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {student.gpa}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'center' }}>
                          <IconButton 
                            color="info" 
                            title="Ver detalles"
                            onClick={() => handleAction(student, 'approve')}
                            size="small"
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                          {student.status === 'pending' && (
                            <>
                              <IconButton 
                                color="success" 
                                title="Aprobar estudiante"
                                onClick={() => handleAction(student, 'approve')}
                                size="small"
                              >
                                <CheckCircleIcon fontSize="small" />
                              </IconButton>
                              <IconButton 
                                color="error" 
                                title="Rechazar estudiante"
                                onClick={() => handleAction(student, 'reject')}
                                size="small"
                              >
                                <CancelIcon fontSize="small" />
                              </IconButton>
                            </>
                          )}
                          <IconButton 
                            color="warning" 
                            title="Asignar strike"
                            onClick={() => handleAction(student, 'strike')}
                            size="small"
                          >
                            <WarningIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            color="primary" 
                            title="Cambiar nivel API"
                            onClick={() => handleAction(student, 'api_level')}
                            size="small"
                          >
                            <ApiIcon fontSize="small" />
                          </IconButton>
                          {student.strikes >= 3 && (
                            <>
                              <Chip label="3 strikes" color="error" size="small" sx={{ mr: 1 }} />
                              <Button
                                variant="contained"
                                color="error"
                                size="small"
                                onClick={() => handleAction(student, 'suspend')}
                              >
                                Suspender
                              </Button>
                            </>
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

        {/* Tab: Postulaciones */}
        <TabPanel value={tabValue} index={1}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2 }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
              <AssignmentIcon sx={{ mr: 2, color: 'primary.main' }} />
              Postulaciones de Estudiantes
            </Typography>
            
            {/* Selector de cantidad de registros para postulaciones */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <TextField
                select
                size="small"
                label="Mostrar"
                value={applicationsLimit}
                onChange={e => setApplicationsLimit(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                sx={{ minWidth: 110 }}
              >
                {[5, 10, 15, 20, 30, 40, 100, 150].map(val => (
                  <MenuItem key={val} value={val}>Últimos {val}</MenuItem>
                ))}
                <MenuItem value="all">Todas</MenuItem>
              </TextField>
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Estudiante</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Proyecto</TableCell>
                    <TableCell>Empresa</TableCell>
                    <TableCell>Fecha de Postulación</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* Datos mock de postulaciones globales */}
                  {(applicationsLimit === 'all' ? [
                    { id: '1', student: 'María González', email: 'maria.gonzalez@estudiante.edu', project: 'Sistema de Gestión de Inventarios', company: 'TechCorp Solutions', date: '2024-01-15', status: 'accepted' },
                    { id: '2', student: 'Carlos Ruiz', email: 'carlos.ruiz@estudiante.edu', project: 'Aplicación Móvil de Delivery', company: 'Digital Dynamics', date: '2024-01-18', status: 'pending' },
                    { id: '3', student: 'Ana Martínez', email: 'ana.martinez@estudiante.edu', project: 'Plataforma de E-learning', company: 'EduTech Solutions', date: '2024-01-10', status: 'rejected' },
                    { id: '4', student: 'Pedro López', email: 'pedro.lopez@estudiante.edu', project: 'Dashboard de Analytics', company: 'DataCorp', date: '2023-09-01', status: 'completed' },
                    { id: '5', student: 'Laura Silva', email: 'laura.silva@estudiante.edu', project: 'Sistema de Inventarios', company: 'TechCorp Solutions', date: '2024-02-01', status: 'pending' },
                  ] : [
                    { id: '1', student: 'María González', email: 'maria.gonzalez@estudiante.edu', project: 'Sistema de Gestión de Inventarios', company: 'TechCorp Solutions', date: '2024-01-15', status: 'accepted' },
                    { id: '2', student: 'Carlos Ruiz', email: 'carlos.ruiz@estudiante.edu', project: 'Aplicación Móvil de Delivery', company: 'Digital Dynamics', date: '2024-01-18', status: 'pending' },
                    { id: '3', student: 'Ana Martínez', email: 'ana.martinez@estudiante.edu', project: 'Plataforma de E-learning', company: 'EduTech Solutions', date: '2024-01-10', status: 'rejected' },
                    { id: '4', student: 'Pedro López', email: 'pedro.lopez@estudiante.edu', project: 'Dashboard of Analytics', company: 'DataCorp', date: '2023-09-01', status: 'completed' },
                    { id: '5', student: 'Laura Silva', email: 'laura.silva@estudiante.edu', project: 'Sistema de Inventarios', company: 'TechCorp Solutions', date: '2024-02-01', status: 'pending' },
                  ].slice(0, applicationsLimit)).map((post) => (
                    <TableRow key={post.id} hover>
                      <TableCell>{post.student}</TableCell>
                      <TableCell>{post.email}</TableCell>
                      <TableCell>{post.project}</TableCell>
                      <TableCell>{post.company}</TableCell>
                      <TableCell>{new Date(post.date).toLocaleDateString('es-ES')}</TableCell>
                      <TableCell>
                        <Chip
                          label={
                            post.status === 'pending' ? 'Pendiente' :
                            post.status === 'accepted' ? 'Aceptada' :
                            post.status === 'rejected' ? 'Rechazada' :
                            post.status === 'completed' ? 'Completada' : post.status
                          }
                          color={
                            post.status === 'accepted' ? 'success' :
                            post.status === 'pending' ? 'warning' :
                            post.status === 'completed' ? 'info' : 'error'
                          }
                          size="small"
                          icon={
                            post.status === 'pending' ? <ScheduleIcon fontSize="small" /> :
                            post.status === 'accepted' ? <CheckCircleIcon fontSize="small" /> :
                            post.status === 'rejected' ? <CancelIcon fontSize="small" /> :
                            post.status === 'completed' ? <TrendingUpIcon fontSize="small" /> : undefined
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" color="primary" title="Ver detalles">
                          <VisibilityIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </TabPanel>

        {/* Tab: Evaluaciones */}
        <TabPanel value={tabValue} index={2}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2 }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
              <AssessmentIcon sx={{ mr: 2, color: 'primary.main' }} />
              Evaluaciones Recibidas por Estudiantes
            </Typography>
            
            {/* Selector de cantidad de registros para evaluaciones */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <TextField
                select
                size="small"
                label="Mostrar"
                value={evaluationsLimit}
                onChange={e => setEvaluationsLimit(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                sx={{ minWidth: 110 }}
              >
                {[5, 10, 15, 20, 30, 40, 100, 150].map(val => (
                  <MenuItem key={val} value={val}>Últimos {val}</MenuItem>
                ))}
                <MenuItem value="all">Todas</MenuItem>
              </TextField>
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Estudiante</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Proyecto</TableCell>
                    <TableCell>Empresa</TableCell>
                    <TableCell>Calificación</TableCell>
                    <TableCell>Comentario</TableCell>
                    <TableCell>Categoría</TableCell>
                    <TableCell>Fecha</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* Datos mock de evaluaciones globales */}
                  {(evaluationsLimit === 'all' ? [
                    { id: '1', student: 'María González', email: 'maria.gonzalez@estudiante.edu', project: 'Sistema de Gestión de Inventarios', company: 'TechCorp Solutions', rating: 4.5, comment: 'Excelente trabajo técnico, muy responsable y puntual.', category: 'Técnico', date: '2023-12-20' },
                    { id: '2', student: 'Carlos Ruiz', email: 'carlos.ruiz@estudiante.edu', project: 'Aplicación Móvil de Delivery', company: 'Digital Dynamics', rating: 4.0, comment: 'Buena comunicación y trabajo en equipo.', category: 'Habilidades Blandas', date: '2024-01-25' },
                    { id: '3', student: 'Ana Martínez', email: 'ana.martinez@estudiante.edu', project: 'Plataforma de E-learning', company: 'EduTech Solutions', rating: 3.5, comment: 'Cumplió con los entregables, pero puede mejorar en puntualidad.', category: 'Puntualidad', date: '2024-01-15' },
                    { id: '4', student: 'Pedro López', email: 'pedro.lopez@estudiante.edu', project: 'Dashboard de Analytics', company: 'DataCorp', rating: 5.0, comment: 'Liderazgo sobresaliente en el equipo.', category: 'Trabajo en equipo', date: '2023-10-10' },
                    { id: '5', student: 'Laura Silva', email: 'laura.silva@estudiante.edu', project: 'Sistema de Inventarios', company: 'TechCorp Solutions', rating: 4.2, comment: 'Muy buena adaptación a cambios.', category: 'Adaptabilidad', date: '2024-02-10' },
                  ] : [
                    { id: '1', student: 'María González', email: 'maria.gonzalez@estudiante.edu', project: 'Sistema de Gestión de Inventarios', company: 'TechCorp Solutions', rating: 4.5, comment: 'Excelente trabajo técnico, muy responsable y puntual.', category: 'Técnico', date: '2023-12-20' },
                    { id: '2', student: 'Carlos Ruiz', email: 'carlos.ruiz@estudiante.edu', project: 'Aplicación Móvil de Delivery', company: 'Digital Dynamics', rating: 4.0, comment: 'Buena comunicación y trabajo en equipo.', category: 'Habilidades Blandas', date: '2024-01-25' },
                    { id: '3', student: 'Ana Martínez', email: 'ana.martinez@estudiante.edu', project: 'Plataforma de E-learning', company: 'EduTech Solutions', rating: 3.5, comment: 'Cumplió con los entregables, pero puede mejorar en puntualidad.', category: 'Puntualidad', date: '2024-01-15' },
                    { id: '4', student: 'Pedro López', email: 'pedro.lopez@estudiante.edu', project: 'Dashboard de Analytics', company: 'DataCorp', rating: 5.0, comment: 'Liderazgo sobresaliente en el equipo.', category: 'Trabajo en equipo', date: '2023-10-10' },
                    { id: '5', student: 'Laura Silva', email: 'laura.silva@estudiante.edu', project: 'Sistema de Inventarios', company: 'TechCorp Solutions', rating: 4.2, comment: 'Muy buena adaptación a cambios.', category: 'Adaptabilidad', date: '2024-02-10' },
                  ].slice(0, evaluationsLimit)).map((ev) => (
                    <TableRow key={ev.id} hover>
                      <TableCell>{ev.student}</TableCell>
                      <TableCell>{ev.email}</TableCell>
                      <TableCell>{ev.project}</TableCell>
                      <TableCell>{ev.company}</TableCell>
                      <TableCell><Rating value={ev.rating} precision={0.5} readOnly size="small" /></TableCell>
                      <TableCell>{ev.comment}</TableCell>
                      <TableCell>{ev.category}</TableCell>
                      <TableCell>{new Date(ev.date).toLocaleDateString('es-ES')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </TabPanel>

        {/* Tab: Historial Disciplinario */}
        <TabPanel value={tabValue} index={3}>
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
      </Paper>

      {/* Diálogo de acción */}
      <Dialog 
        open={actionDialog} 
        onClose={() => setActionDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {actionType === 'approve' && <CheckCircleIcon color="success" />}
          {actionType === 'reject' && <CancelIcon color="error" />}
          {actionType === 'strike' && <WarningIcon color="warning" />}
          {actionType === 'api_level' && <ApiIcon color="primary" />}
          {actionType === 'suspend' && <WarningIcon color="warning" />}
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
              actionType === 'approve' ? 'success' : 
              actionType === 'reject' ? 'error' : 
              actionType === 'strike' ? 'warning' : 
              actionType === 'suspend' ? 'warning' : 'primary'
            }
            sx={{ borderRadius: 2 }}
            disabled={
              (actionType === 'reject' || actionType === 'strike' || actionType === 'suspend') && !actionReason.trim()
            }
          >
            {actionType === 'approve' ? 'Aprobar' : 
             actionType === 'reject' ? 'Rechazar' : 
             actionType === 'strike' ? 'Asignar Strike' : 
             actionType === 'suspend' ? 'Suspender' : 'Actualizar'}
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

export default GestionEstudiantesAdmin; 