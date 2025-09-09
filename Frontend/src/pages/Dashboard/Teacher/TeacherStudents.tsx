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
  Badge,
} from '@mui/material';
import {
  Person as PersonIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  History as HistoryIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Assessment as AssessmentIcon,
  Timer as TimerIcon,
  Star as StarIcon,
  Group as GroupIcon,
  Work as WorkIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  Grade as GradeIcon,
} from '@mui/icons-material';
import { useAuth } from '../../../hooks/useAuth';
import { apiService } from '../../../services/api.service';
import { TeacherStudent } from '../../../types';


export default function TeacherStudents() {
  const { user } = useAuth();
  
  const [students, setStudents] = useState<TeacherStudent[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<TeacherStudent[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<TeacherStudent | null>(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🎓 [TeacherStudents] Cargando estudiantes supervisados...');
      
      // Intentar cargar datos reales del backend
      const response = await apiService.get('/api/teachers/teacher/students/');
      const studentsData = Array.isArray(response) ? response : (response as any)?.students || [];
      
      console.log('🎓 [TeacherStudents] Datos recibidos:', studentsData);
      
      setStudents(studentsData);
      setFilteredStudents(studentsData);
      
    } catch (err: any) {
      console.error('🎓 [TeacherStudents] Error cargando estudiantes:', err);
      setError('Error al cargar estudiantes supervisados');
      
      // Si hay error, mostrar lista vacía
      setStudents([]);
      setFilteredStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const openStudentModal = (student: TeacherStudent) => {
    setSelectedStudent(student);
    setShowStudentModal(true);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const filtered = students.filter(student => {
      const studentName = student.student.name;
      const studentEmail = student.student.email;
      const studentCareer = student.student.career || '';
      
      const matchesSearch = studentName.toLowerCase().includes(term.toLowerCase()) ||
                           studentEmail.toLowerCase().includes(term.toLowerCase()) ||
                           studentCareer.toLowerCase().includes(term.toLowerCase());
      
      const matchesStatus = !statusFilter || student.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
    setFilteredStudents(filtered);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    const filtered = students.filter(student => {
      const studentName = student.student.name;
      const studentEmail = student.student.email;
      const studentCareer = student.student.career || '';
      
      const matchesSearch = studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           studentCareer.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = !status || student.status === status;
      
      return matchesSearch && matchesStatus;
    });
    setFilteredStudents(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'info';
      case 'suspended': return 'warning';
      case 'transferred': return 'default';
      default: return 'default';
    }
  };

  const getSupervisionTypeColor = (type: string) => {
    switch (type) {
      case 'thesis': return '#9c27b0';
      case 'internship': return '#ff9800';
      case 'project': return '#4caf50';
      case 'course': return '#2196f3';
      case 'mentoring': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Cargando estudiantes supervisados...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="outlined" onClick={loadStudents} startIcon={<RefreshIcon />}>
          Reintentar
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} sx={{ color: 'primary.main', mb: 1 }}>
          👥 Mis Estudiantes Supervisados
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestiona y supervisa el progreso académico de tus estudiantes asignados.
        </Typography>
      </Box>

      {/* Filtros y búsqueda */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Buscar por nombre, email o carrera..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
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
                onChange={(e) => handleStatusFilter(e.target.value)}
                label="Estado"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="active">Activo</MenuItem>
                <MenuItem value="completed">Completado</MenuItem>
                <MenuItem value="suspended">Suspendido</MenuItem>
                <MenuItem value="transferred">Transferido</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadStudents}
              fullWidth
            >
              Actualizar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Estadísticas */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {students.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Estudiantes
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircleIcon color="success" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {students.filter(s => s.status === 'active').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Activos
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TimerIcon color="info" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {students.reduce((sum, s) => sum + (s.total_hours_supervised || 0), 0).toFixed(1)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Horas Supervisadas
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AssessmentIcon color="warning" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {students.reduce((sum, s) => sum + (s.evaluations_count || 0), 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Evaluaciones
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Lista de estudiantes */}
      <Paper>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" fontWeight={600}>
            Estudiantes Supervisados ({filteredStudents.length})
          </Typography>
        </Box>
        
        {filteredStudents.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No se encontraron estudiantes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ajusta los filtros de búsqueda o contacta al administrador para asignar estudiantes.
            </Typography>
          </Box>
        ) : (
          <List>
            {filteredStudents.map((teacherStudent, index) => (
              <ListItem
                key={teacherStudent.id}
                sx={{
                  borderBottom: index < filteredStudents.length - 1 ? 1 : 0,
                  borderColor: 'divider',
                  '&:hover': { backgroundColor: 'action.hover' }
                }}
              >
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: getSupervisionTypeColor(teacherStudent.supervision_type) }}>
                    <PersonIcon />
                  </Avatar>
                </ListItemIcon>
                
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }} component="span">
                      <Typography variant="subtitle1" fontWeight={600} component="span">
                        {teacherStudent.student.name}
                      </Typography>
                      <Chip
                        label={teacherStudent.status}
                        color={getStatusColor(teacherStudent.status) as any}
                        size="small"
                      />
                      <Chip
                        label={teacherStudent.supervision_type}
                        size="small"
                        sx={{ 
                          backgroundColor: getSupervisionTypeColor(teacherStudent.supervision_type),
                          color: 'white'
                        }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box component="span">
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }} component="span">
                        📧 {teacherStudent.student.email}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }} component="span">
                        🎓 {teacherStudent.student.career || 'Sin carrera'} - Semestre {teacherStudent.student.semester || 'N/A'}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }} component="span">
                        <Typography variant="caption" color="text.secondary" component="span">
                          ⏱️ {teacherStudent.total_hours_supervised}h supervisadas
                        </Typography>
                        <Typography variant="caption" color="text.secondary" component="span">
                          📅 {teacherStudent.meetings_count} reuniones
                        </Typography>
                        <Typography variant="caption" color="text.secondary" component="span">
                          📊 {teacherStudent.evaluations_count} evaluaciones
                        </Typography>
                        <Typography variant="caption" color="text.secondary" component="span">
                          📈 {teacherStudent.progress_percentage.toFixed(1)}% progreso
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Ver detalles">
                    <IconButton onClick={() => openStudentModal(teacherStudent)}>
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Editar supervisión">
                    <IconButton>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {/* Modal de detalles del estudiante */}
      <Dialog
        open={showStudentModal}
        onClose={() => setShowStudentModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <PersonIcon color="primary" />
            <Typography variant="h6">
              Detalles de Supervisión - {selectedStudent?.student.name}
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {selectedStudent && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Información del Estudiante
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Nombre:</strong> {selectedStudent.student.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Email:</strong> {selectedStudent.student.email}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Carrera:</strong> {selectedStudent.student.career}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Semestre:</strong> {selectedStudent.student.semester}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Información de Supervisión
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Tipo:</strong> {selectedStudent.supervision_type}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Estado:</strong> {selectedStudent.status}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Fecha inicio:</strong> {new Date(selectedStudent.start_date).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Fecha esperada:</strong> {selectedStudent.expected_completion_date ? new Date(selectedStudent.expected_completion_date).toLocaleDateString() : 'No definida'}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Métricas de Supervisión
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Card variant="outlined">
                        <CardContent sx={{ textAlign: 'center' }}>
                          <TimerIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
                          <Typography variant="h6">{selectedStudent.total_hours_supervised}h</Typography>
                          <Typography variant="caption">Horas Supervisadas</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Card variant="outlined">
                        <CardContent sx={{ textAlign: 'center' }}>
                          <ScheduleIcon color="info" sx={{ fontSize: 32, mb: 1 }} />
                          <Typography variant="h6">{selectedStudent.meetings_count}</Typography>
                          <Typography variant="caption">Reuniones</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Card variant="outlined">
                        <CardContent sx={{ textAlign: 'center' }}>
                          <AssessmentIcon color="warning" sx={{ fontSize: 32, mb: 1 }} />
                          <Typography variant="h6">{selectedStudent.evaluations_count}</Typography>
                          <Typography variant="caption">Evaluaciones</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Card variant="outlined">
                        <CardContent sx={{ textAlign: 'center' }}>
                          <TrendingUpIcon color="success" sx={{ fontSize: 32, mb: 1 }} />
                          <Typography variant="h6">{selectedStudent.progress_percentage.toFixed(1)}%</Typography>
                          <Typography variant="caption">Progreso</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Grid>
                
                {selectedStudent.notes && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Notas de Supervisión
                    </Typography>
                    <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
                      <Typography variant="body2">
                        {selectedStudent.notes}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
                
                {selectedStudent.objectives && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Objetivos
                    </Typography>
                    <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
                      <Typography variant="body2">
                        {selectedStudent.objectives}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setShowStudentModal(false)}>
            Cerrar
          </Button>
          <Button variant="contained" startIcon={<EditIcon />}>
            Editar Supervisión
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}