import { useState, useEffect } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Star as StarIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { apiService } from '../../../services/api.service';
import { adaptEvaluation, adaptStrikeReport } from '../../../utils/adapters';

interface Evaluation {
  id: string;
  student_name: string;
  student_id: string;
  company_name: string;
  company_id: string;
  project_title: string;
  project_id: string;
  score: number;
  comments: string;
  evaluation_date: string;
  status: 'pending' | 'completed' | 'flagged';
  evaluator_name: string;
  evaluator_type: 'company' | 'student';
  criteria_scores?: {
    [key: string]: number;
  };
}

interface EvaluationCriteria {
  id: string;
  name: string;
  description: string;
  weight: number;
  category: string;
}

interface StrikeReport {
  id: string;
  student_name: string;
  student_id: string;
  company_name: string;
  company_id: string;
  project_title: string;
  project_id: string;
  evaluation_date: string;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  evaluator_name: string;
  evaluator_type: 'company' | 'student';
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
      id={`evaluation-tabpanel-${index}`}
      aria-labelledby={`evaluation-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const GestionEvaluacionesAdmin = () => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [actionDialog, setActionDialog] = useState(false);
  const [actionType, setActionType] = useState<'view' | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [evaluationsLimit, setEvaluationsLimit] = useState<number | 'all'>(20);
  const [usersLimit, setUsersLimit] = useState<number | 'all'>(20);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [strikeReports, setStrikeReports] = useState<StrikeReport[]>([]);
  const [criteria, setCriteria] = useState<EvaluationCriteria[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showViewDialog, setShowViewDialog] = useState(false);

  useEffect(() => {
    fetchEvaluations();
    fetchStrikeReports();
    fetchCriteria();
  }, []);

  // Efecto para recargar reportes cuando cambie el filtro de estado
  useEffect(() => {
    if (tabValue === 1) { // Solo si estamos en la pestaña de strikes
      fetchStrikeReports();
    }
  }, [statusFilter, tabValue]);

  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      const response = await apiService.getEvaluations({
        page: 1,
        limit: 100,
        status: statusFilter || undefined,
        type: typeFilter || undefined,
      });
      
      console.log('Datos del backend:', response.results);
      const formattedEvaluations = response.results ? 
        response.results.map((evaluation: any) => adaptEvaluation(evaluation)) : [];
      console.log('Evaluaciones adaptadas:', formattedEvaluations);
      
      setEvaluations(formattedEvaluations);
    } catch (error) {
      console.error('Error fetching evaluations:', error);
      setSuccessMessage('Error al cargar las evaluaciones');
    } finally {
      setLoading(false);
    }
  };

  const fetchStrikeReports = async () => {
    try {
      console.log('🔍 Fetching strike reports with filter:', statusFilter);
      const response = await apiService.getStrikeReports({
        page: 1,
        limit: 100,
        status: statusFilter || undefined,
      });
      
      console.log('📊 Reportes de strikes del backend:', response.results);
      const formattedReports = response.results ? 
        response.results.map((report: any) => adaptStrikeReport(report)) : [];
      console.log('✅ Reportes adaptados:', formattedReports);
      console.log('🎯 Filtro aplicado:', statusFilter);
      
      setStrikeReports(formattedReports);
    } catch (error) {
      console.error('❌ Error fetching strike reports:', error);
      setSuccessMessage('Error al cargar los reportes de strikes');
    }
  };

  const fetchCriteria = async () => {
    try {
      const staticCriteria = [
        {
          id: '1',
          name: 'Calidad del Trabajo',
          description: 'Calidad general del trabajo realizado',
          weight: 1,
          category: 'General',
        },
        {
          id: '2',
          name: 'Comunicación',
          description: 'Habilidad de comunicación y colaboración',
          weight: 1,
          category: 'General',
        },
        {
          id: '3',
          name: 'Puntualidad',
          description: 'Cumplimiento de fechas y horarios',
          weight: 1,
          category: 'General',
        },
        {
          id: '4',
          name: 'Iniciativa',
          description: 'Proactividad y toma de iniciativa',
          weight: 1,
          category: 'General',
        },
      ];
      
      setCriteria(staticCriteria);
    } catch (error) {
      console.error('Error fetching criteria:', error);
    }
  };

  const handleApproveEvaluation = async (evaluationId: string) => {
    try {
      await apiService.approveEvaluation(evaluationId);
      setSuccessMessage('Evaluación aprobada exitosamente');
      await fetchEvaluations();
    } catch (error) {
      console.error('Error approving evaluation:', error);
      setSuccessMessage('Error al aprobar la evaluación');
    }
  };

  const handleRejectEvaluation = async (evaluationId: string) => {
    try {
      await apiService.rejectEvaluation(evaluationId);
      setSuccessMessage('Evaluación rechazada exitosamente');
      await fetchEvaluations();
    } catch (error) {
      console.error('Error rejecting evaluation:', error);
      setSuccessMessage('Error al rechazar la evaluación');
    }
  };

  const handleApproveStrikeReport = async (reportId: string) => {
    try {
      await apiService.approveStrikeReport(reportId);
      setSuccessMessage('Reporte de strike aprobado exitosamente');
      await fetchStrikeReports();
    } catch (error) {
      console.error('Error approving strike report:', error);
      setSuccessMessage('Error al aprobar el reporte de strike');
    }
  };

  const handleRejectStrikeReport = async (reportId: string) => {
    try {
      await apiService.rejectStrikeReport(reportId);
      setSuccessMessage('Reporte de strike rechazado exitosamente');
      await fetchStrikeReports();
    } catch (error) {
      console.error('Error rejecting strike report:', error);
      setSuccessMessage('Error al rechazar el reporte de strike');
    }
  };

  const getDialogTitle = () => {
    switch (actionType) {
      case 'view': return 'Detalles de Evaluación';
      default: return '';
    }
  };

  const getDialogContent = () => {
    if (!selectedEvaluation) return null;

    if (actionType === 'view') {
      return (
        <Box>
          <Typography variant="h6" gutterBottom>Evaluación del Proyecto</Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {selectedEvaluation.project_title}
          </Typography>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>Información General:</Typography>
            <Typography><strong>De:</strong> {selectedEvaluation.student_name}</Typography>
            <Typography><strong>Para:</strong> {selectedEvaluation.company_name}</Typography>
            <Typography><strong>Fecha:</strong> {new Date(selectedEvaluation.evaluation_date).toLocaleDateString()}</Typography>
          </Box>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>Calificación:</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Rating value={selectedEvaluation.score} readOnly size="large" />
              <Typography variant="h6" fontWeight={600}>
                {selectedEvaluation.score}/5
              </Typography>
            </Box>
          </Box>
          
          {selectedEvaluation.comments && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>Comentarios:</Typography>
              <Typography variant="body2" sx={{ 
                p: 2, 
                bgcolor: 'grey.50', 
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'grey.200'
              }}>
                {selectedEvaluation.comments}
              </Typography>
            </Box>
          )}
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>Estado:</Typography>
            <Chip 
              label={getStatusText(selectedEvaluation.status)} 
              color={getStatusColor(selectedEvaluation.status) as any}
              variant="filled"
              sx={{ fontWeight: 600 }}
            />
          </Box>
        </Box>
      );
    }
    
    return null;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'flagged': return 'error';
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Aprobada';
      case 'flagged': return 'Rechazada';
      case 'pending': return 'Pendiente';
      case 'approved': return 'Aprobado';
      case 'rejected': return 'Rechazado';
      default: return status;
    }
  };

  const filteredEvaluations = evaluations.filter(evaluation => {
    const searchLower = searchTerm.toLowerCase().trim();
    const matchesSearch = !searchTerm || 
      evaluation.student_name.toLowerCase().includes(searchLower) ||
      evaluation.company_name.toLowerCase().includes(searchLower) ||
      evaluation.project_title.toLowerCase().includes(searchLower) ||
      evaluation.project_id.toLowerCase().includes(searchLower);
    
    const matchesStatus = !statusFilter || evaluation.status === statusFilter;
    const matchesType = !typeFilter || evaluation.evaluator_type === typeFilter;
    
    // Debug logs
    if (typeFilter) {
      console.log(`Evaluación ${evaluation.id}: evaluator_type=${evaluation.evaluator_type}, typeFilter=${typeFilter}, matchesType=${matchesType}`);
    }
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAction = (evaluation: Evaluation, type: 'view') => {
    setSelectedEvaluation(evaluation);
    setActionType(type);
    setActionDialog(true);
  };

  // Esta función ya no se necesita ya que eliminamos el botón "Ver Detalles"

  const handleConfirmDelete = (evaluation: Evaluation) => {
    // This function is no longer needed as deletion is removed
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setTypeFilter('');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4, mb: 4, px: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <AssessmentIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Typography variant="h4">Gestión de Calificaciones Mutuas</Typography>
      </Box>

      <Paper sx={{ borderRadius: 3, boxShadow: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Evaluaciones" />
          <Tab label="Asignación de Strikes a Estudiantes" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <StarIcon color="primary" />
              Calificaciones Mutuas
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gestión de calificaciones entre empresas y estudiantes por participación en proyectos
            </Typography>
          </Box>

          {/* Filtros */}
          <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SearchIcon color="primary" />
                Filtros y Búsqueda
              </Typography>
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={clearFilters}
                size="small"
                sx={{ borderRadius: 2 }}
              >
                Limpiar Filtros
              </Button>
            </Box>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
                <TextField
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por proyecto, empresa o estudiante..."
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                    ),
                  }}
                  sx={{ 
                    borderRadius: 2,
                    minWidth: 180,
                    flex: 1,
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'divider',
                      },
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
                />
                <FormControl sx={{ minWidth: 180, flex: 1 }} size="small">
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Estado"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="">Todas</MenuItem>
                    <MenuItem value="pending">Pendientes</MenuItem>
                    <MenuItem value="completed">Aprobadas</MenuItem>
                    <MenuItem value="flagged">Rechazadas</MenuItem>
                  </Select>
                </FormControl>
                <FormControl sx={{ minWidth: 180, flex: 1 }} size="small">
                  <InputLabel>Tipo de Evaluador</InputLabel>
                  <Select
                    value={typeFilter}
                    label="Tipo de Evaluador"
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <MenuItem value="">Todos</MenuItem>
                    <MenuItem value="company">Empresa → Estudiante</MenuItem>
                    <MenuItem value="student">Estudiante → Empresa</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
              <Box sx={{ minWidth: 150, ml: { xs: 0, sm: 2 }, mt: { xs: 2, sm: 0 } }}>
                <TextField
                  select
                  size="small"
                  label="Mostrar"
                  value={evaluationsLimit}
                  onChange={e => setEvaluationsLimit(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  sx={{ minWidth: 110 }}
                >
                  {[20, 50, 100, 200, 250].map(val => (
                    <MenuItem key={val} value={val}>Últimos {val}</MenuItem>
                  ))}
                  <MenuItem value="all">Todas</MenuItem>
                </TextField>
              </Box>
            </Box>
            
            {/* Contador de resultados */}
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Mostrando {filteredEvaluations.length} de {evaluations.length} evaluaciones
              </Typography>
              {(searchTerm || statusFilter || typeFilter) && (
                <Chip 
                  label="Filtros activos" 
                  color="primary" 
                  variant="outlined" 
                  size="small"
                />
              )}
            </Box>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Proyecto</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Empresa</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Estudiante</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Calificación</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Estado</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Fecha</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 600 }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEvaluations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <SearchIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                        <Typography variant="h6" color="text.secondary">
                          No se encontraron evaluaciones
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {searchTerm || statusFilter || typeFilter 
                            ? 'Intenta ajustar los filtros o la búsqueda'
                            : 'No hay evaluaciones disponibles'
                          }
                        </Typography>
                        {(searchTerm || statusFilter || typeFilter) && (
                          <Button
                            variant="outlined"
                            startIcon={<ClearIcon />}
                            onClick={clearFilters}
                            size="small"
                          >
                            Limpiar Filtros
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  (evaluationsLimit === 'all' ? filteredEvaluations : filteredEvaluations.slice(0, evaluationsLimit)).map(evaluation => (
                    <TableRow key={evaluation.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {evaluation.project_title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {evaluation.project_id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                            <BusinessIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {evaluation.company_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Publicó el proyecto
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                            <PersonIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {evaluation.student_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Participó en el proyecto
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Rating value={evaluation.score} readOnly size="small" />
                          <Typography variant="body2" fontWeight={600}>
                            {evaluation.score.toFixed(1)}/5
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={getStatusText(evaluation.status)} 
                          color={getStatusColor(evaluation.status) as any}
                          variant="filled"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>{new Date(evaluation.evaluation_date).toLocaleDateString()}</TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                          <IconButton 
                            color="info" 
                            title="Ver detalles"
                            onClick={() => handleAction(evaluation, 'view')}
                            size="small"
                          >
                            <VisibilityIcon />
                          </IconButton>
                          {evaluation.status === 'pending' && (
                            <>
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleApproveEvaluation(evaluation.id)}
                                title="Aprobar evaluación"
                              >
                                <CheckCircleIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="warning"
                                onClick={() => handleRejectEvaluation(evaluation.id)}
                                title="Rechazar evaluación"
                              >
                                <WarningIcon />
                              </IconButton>
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Tab: Asignación de Strikes a Estudiantes */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningIcon color="warning" /> Gestión de Reportes de Strikes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Revisa y gestiona reportes de strikes enviados por empresas sobre estudiantes
            </Typography>
          </Box>

          {/* Filtros para reportes */}
          <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
              <FormControl sx={{ minWidth: 180 }} size="small">
                <InputLabel>Estado del Reporte</InputLabel>
                <Select
                  value={statusFilter}
                  label="Estado del Reporte"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="pending">Pendientes</MenuItem>
                  <MenuItem value="approved">Aprobados</MenuItem>
                  <MenuItem value="rejected">Rechazados</MenuItem>
                </Select>
              </FormControl>
              <TextField
                select
                size="small"
                label="Mostrar"
                value={usersLimit}
                onChange={e => setUsersLimit(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                sx={{ minWidth: 110 }}
              >
                {[20, 50, 100, 200, 250].map(val => (
                  <MenuItem key={val} value={val}>Últimos {val}</MenuItem>
                ))}
                <MenuItem value="all">Todas</MenuItem>
              </TextField>
            </Box>
          </Box>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 3 }}>
            {(usersLimit === 'all' ? strikeReports : strikeReports.slice(0, usersLimit)).map((report) => (
              <Card key={report.id} sx={{ borderRadius: 3, boxShadow: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ mr: 2, bgcolor: 'warning.main' }}>
                      <WarningIcon />
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6">{report.student_name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Reportado por {report.company_name}
                      </Typography>
                    </Box>
                    <Chip 
                      label={getStatusText(report.status)}
                      color={getStatusColor(report.status) as any}
                      variant="filled"
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Proyecto:</Typography>
                    <Typography variant="body2" fontWeight="bold">{report.project_title}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2">Fecha:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {new Date(report.evaluation_date).toLocaleDateString()}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Motivo: {report.reason}
                  </Typography>
                  
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    {report.status === 'pending' && (
                      <>
                        <Button 
                          size="small" 
                          variant="contained" 
                          color="success" 
                          sx={{ flex: 1 }}
                          onClick={() => handleApproveStrikeReport(report.id)}
                        >
                          Aprobar Strike
                        </Button>
                        <Button 
                          size="small" 
                          variant="outlined" 
                          color="error" 
                          sx={{ flex: 1 }}
                          onClick={() => handleRejectStrikeReport(report.id)}
                        >
                          Rechazar
                        </Button>
                      </>
                    )}
                  </Box>
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
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {actionType === 'view' && <VisibilityIcon color="info" />}
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
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para crear evaluación */}
      {/* This dialog is no longer needed as creation is removed */}

      {/* Dialog para confirmar eliminación */}
      {/* This dialog is no longer needed as deletion is removed */}

      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccessMessage('')} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GestionEvaluacionesAdmin; 