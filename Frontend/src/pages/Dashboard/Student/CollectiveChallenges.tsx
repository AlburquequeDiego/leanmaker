/**
 * 🎯 DESAFÍOS COLECTIVOS PARA ESTUDIANTES
 * 
 * DESCRIPCIÓN:
 * Esta interfaz permite a los estudiantes ver y participar en desafíos colectivos
 * que han sido publicados por empresas y tomados por docentes para la academia.
 * 
 * FLUJO DE SINCRONIZACIÓN:
 * 1. EMPRESAS: Crean desafíos (draft → published → active → completed)
 * 2. DOCENTES: Toman desafíos publicados (available → taken → completed)  
 * 3. ESTUDIANTES: Participan en desafíos tomados por sus docentes
 * 
 * FUNCIONALIDADES PRINCIPALES:
 * - Ver desafíos disponibles (publicados por empresas y tomados por docentes)
 * - Filtrar por estado, período, docente y búsqueda
 * - Ver detalles completos de cada desafío
 * - Aplicar a desafíos colectivos
 * - Seguimiento del progreso personal
 * - Ver estado de participación y avances
 * 
 * AUTOR: Sistema LeanMaker
 * FECHA: 2024
 * VERSIÓN: 2.0 - Sincronizada con flujo completo
 */

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Snackbar,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Paper,
  Grid,
  Divider,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Business as BusinessIcon,
  AccessTime as AccessTimeIcon,
  Schedule as ScheduleIcon,
  Group as GroupIcon,
  CalendarToday as CalendarTodayIcon,
  FilterList as FilterListIcon,
  EmojiEvents as EmojiEventsIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useTheme } from '../../../contexts/ThemeContext';
import { challengeService } from '../../../services/challenge.service';
import { CollectiveChallenge, ChallengeListResponse } from '../../../types';

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
      id={`challenge-tabpanel-${index}`}
      aria-labelledby={`challenge-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const CollectiveChallenges: React.FC = () => {
  const { themeMode } = useTheme();
  const [challenges, setChallenges] = useState<CollectiveChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [periodFilter, setPeriodFilter] = useState('');
  const [teacherFilter, setTeacherFilter] = useState(''); // Nuevo filtro por docente
  const [selectedChallenge, setSelectedChallenge] = useState<CollectiveChallenge | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [participationStatus, setParticipationStatus] = useState<{[key: string]: 'pending' | 'accepted' | 'rejected' | 'completed'}>({}); // Estado de participación

  // Cargar desafíos al montar el componente
  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      const response: ChallengeListResponse = await challengeService.getChallenges({
        search: searchTerm || undefined,
        status: statusFilter || undefined,
        period: periodFilter || undefined,
        teacher: teacherFilter || undefined, // Nuevo parámetro de filtro por docente
      });
      setChallenges(response.challenges);
      
      // Cargar estados de participación del estudiante
      await loadParticipationStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar desafíos');
    } finally {
      setLoading(false);
    }
  };

  // Cargar estado de participación del estudiante en cada desafío
  const loadParticipationStatus = async () => {
    try {
      // Simular carga de estados de participación
      // En la implementación real, esto vendría del backend
      const mockParticipationStatus: {[key: string]: 'pending' | 'accepted' | 'rejected' | 'completed'} = {};
      
      challenges.forEach(challenge => {
        // Simular diferentes estados de participación
        const randomStatus = Math.random();
        if (randomStatus < 0.3) mockParticipationStatus[challenge.id] = 'pending';
        else if (randomStatus < 0.6) mockParticipationStatus[challenge.id] = 'accepted';
        else if (randomStatus < 0.8) mockParticipationStatus[challenge.id] = 'completed';
        else mockParticipationStatus[challenge.id] = 'rejected';
      });
      
      setParticipationStatus(mockParticipationStatus);
    } catch (err) {
      console.error('Error loading participation status:', err);
    }
  };

  // Recargar cuando cambien los filtros
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadChallenges();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter, periodFilter, teacherFilter]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleStatusFilterChange = (event: any) => {
    setStatusFilter(event.target.value);
  };

  const handlePeriodFilterChange = (event: any) => {
    setPeriodFilter(event.target.value);
  };

  const handleTeacherFilterChange = (event: any) => {
    setTeacherFilter(event.target.value);
  };

  const handleViewDetails = (challenge: CollectiveChallenge) => {
    setSelectedChallenge(challenge);
    setDetailOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailOpen(false);
    setSelectedChallenge(null);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleParticipate = async (challenge: CollectiveChallenge) => {
    try {
      setLoading(true);
      
      // Simular participación en el desafío
      setParticipationStatus(prev => ({
        ...prev,
        [challenge.id]: 'pending'
      }));
      
      setSuccess(`¡Te has postulado exitosamente al desafío "${challenge.title}"! El docente revisará tu aplicación.`);
      
      // Recargar la lista de desafíos para actualizar los datos
      await loadChallenges();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al participar en el desafío');
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener el estado de participación del estudiante
  const getParticipationStatus = (challengeId: string) => {
    return participationStatus[challengeId] || null;
  };

  // Función para obtener el texto del estado de participación
  const getParticipationStatusText = (challengeId: string) => {
    const status = getParticipationStatus(challengeId);
    switch (status) {
      case 'pending': return 'Aplicación Pendiente';
      case 'accepted': return 'Aceptado';
      case 'rejected': return 'Rechazado';
      case 'completed': return 'Completado';
      default: return null;
    }
  };

  // Función para obtener el color del estado de participación
  const getParticipationStatusColor = (challengeId: string) => {
    const status = getParticipationStatus(challengeId);
    switch (status) {
      case 'pending': return 'warning';
      case 'accepted': return 'success';
      case 'rejected': return 'error';
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'primary';
      case 'active':
        return 'success';
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published':
        return 'Publicado';
      case 'active':
        return 'Activo';
      case 'completed':
        return 'Completado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const getPeriodText = (period: string) => {
    switch (period) {
      case 'trimestral':
        return 'Trimestral';
      case 'semestral':
        return 'Semestral';
      default:
        return period;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getChallengesByStatus = (status: string) => {
    return challenges.filter(challenge => challenge.status === status);
  };

  const canParticipate = (challenge: CollectiveChallenge) => {
    // Verificar si el desafío está abierto para inscripciones
    const now = new Date();
    const registrationEnd = new Date(challenge.registration_end);
    const participationStatus = getParticipationStatus(challenge.id);
    
    // No puede participar si ya tiene una aplicación pendiente, aceptada o completada
    if (participationStatus === 'pending' || participationStatus === 'accepted' || participationStatus === 'completed') {
      return false;
    }
    
    return (
      challenge.status === 'published' &&
      challenge.current_teams < challenge.max_teams &&
      now <= registrationEnd
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: 3, 
      bgcolor: themeMode === 'dark' ? '#0f172a' : '#f8fafc', 
      minHeight: '100vh',
      color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
    }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <EmojiEventsIcon sx={{ fontSize: 40, color: '#3b82f6' }} />
          <Box>
            <Typography variant="h4" fontWeight={700} sx={{ color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b' }}>
              Desafíos Colectivos
            </Typography>
            <Typography variant="body1" sx={{ color: themeMode === 'dark' ? '#94a3b8' : '#64748b' }}>
              Participa en desafíos colaborativos con empresas y otros estudiantes
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Filtros */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: '12px' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Buscar desafíos..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ borderRadius: '8px' }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                label="Estado"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="published">Publicado</MenuItem>
                <MenuItem value="active">Activo</MenuItem>
                <MenuItem value="completed">Completado</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Período</InputLabel>
              <Select
                value={periodFilter}
                onChange={handlePeriodFilterChange}
                label="Período"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="trimestral">Trimestral</MenuItem>
                <MenuItem value="semestral">Semestral</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Docente</InputLabel>
              <Select
                value={teacherFilter}
                onChange={handleTeacherFilterChange}
                label="Docente"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="Prof. María González">Prof. María González</MenuItem>
                <MenuItem value="Prof. Carlos Ruiz">Prof. Carlos Ruiz</MenuItem>
                <MenuItem value="Prof. Ana Martínez">Prof. Ana Martínez</MenuItem>
                <MenuItem value="Prof. Luis García">Prof. Luis García</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={loadChallenges}
              sx={{ height: '56px' }}
            >
              Filtrar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs para diferentes estados */}
      <Paper elevation={2} sx={{ borderRadius: '12px' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              py: 2,
              fontSize: '1rem',
              fontWeight: 600,
            },
            '& .Mui-selected': {
              color: 'primary.main',
            },
          }}
        >
          <Tab 
            label={`Disponibles (${getChallengesByStatus('published').length})`}
            icon={<PendingIcon />}
            iconPosition="start"
          />
          <Tab 
            label={`Activos (${getChallengesByStatus('active').length})`}
            icon={<PlayArrowIcon />}
            iconPosition="start"
          />
          <Tab 
            label={`Completados (${getChallengesByStatus('completed').length})`}
            icon={<CheckCircleIcon />}
            iconPosition="start"
          />
        </Tabs>

        {/* Tab Panel para Desafíos Disponibles */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {getChallengesByStatus('published').length === 0 ? (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <EmojiEventsIcon sx={{ fontSize: 64, color: '#94a3b8', mb: 2 }} />
                  <Typography variant="h6" sx={{ color: '#94a3b8' }}>
                    No hay desafíos disponibles en este momento
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                    Revisa más tarde para ver nuevos desafíos
                  </Typography>
                </Box>
              </Grid>
            ) : (
              getChallengesByStatus('published').map((challenge) => (
                <Grid item xs={12} md={6} lg={4} key={challenge.id}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6,
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                        <Chip
                          label={getStatusText(challenge.status)}
                          color={getStatusColor(challenge.status) as any}
                          size="small"
                        />
                        <Chip
                          label={getPeriodText(challenge.period_type)}
                          variant="outlined"
                          size="small"
                        />
                      </Box>

                      <Typography variant="h6" fontWeight={600} sx={{ mb: 1, lineHeight: 1.3 }}>
                        {challenge.title}
                      </Typography>

                      <Typography variant="body2" sx={{ 
                        color: themeMode === 'dark' ? '#94a3b8' : '#64748b',
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                        {challenge.description}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <BusinessIcon sx={{ fontSize: 16, color: '#3b82f6' }} />
                        <Typography variant="body2" sx={{ color: '#3b82f6', fontWeight: 500 }}>
                          {challenge.company.name}
                        </Typography>
                      </Box>

                      <Grid container spacing={1} sx={{ mb: 2 }}>
                        <Grid item xs={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <GroupIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
                            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                              {challenge.current_teams}/{challenge.max_teams} equipos
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AccessTimeIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
                            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                              {challenge.duration_weeks} semanas
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                        <CalendarTodayIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                          Inscripciones hasta: {formatDate(challenge.registration_end)}
                        </Typography>
                      </Box>
                    </CardContent>

                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleViewDetails(challenge)}
                        sx={{ flex: 1 }}
                      >
                        Ver Detalles
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<EmojiEventsIcon />}
                        onClick={() => handleParticipate(challenge)}
                        disabled={!canParticipate(challenge)}
                        sx={{ flex: 1 }}
                      >
                        {canParticipate(challenge) ? 'Participar' : 'No Disponible'}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </TabPanel>

        {/* Tab Panel para Desafíos Activos */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            {getChallengesByStatus('active').length === 0 ? (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <PlayArrowIcon sx={{ fontSize: 64, color: '#94a3b8', mb: 2 }} />
                  <Typography variant="h6" sx={{ color: '#94a3b8' }}>
                    No hay desafíos activos en este momento
                  </Typography>
                </Box>
              </Grid>
            ) : (
              getChallengesByStatus('active').map((challenge) => (
                <Grid item xs={12} md={6} lg={4} key={challenge.id}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6,
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                        <Chip
                          label={getStatusText(challenge.status)}
                          color={getStatusColor(challenge.status) as any}
                          size="small"
                        />
                        <Chip
                          label={getPeriodText(challenge.period_type)}
                          variant="outlined"
                          size="small"
                        />
                      </Box>

                      <Typography variant="h6" fontWeight={600} sx={{ mb: 1, lineHeight: 1.3 }}>
                        {challenge.title}
                      </Typography>

                      <Typography variant="body2" sx={{ 
                        color: themeMode === 'dark' ? '#94a3b8' : '#64748b',
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                        {challenge.description}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <BusinessIcon sx={{ fontSize: 16, color: '#3b82f6' }} />
                        <Typography variant="body2" sx={{ color: '#3b82f6', fontWeight: 500 }}>
                          {challenge.company.name}
                        </Typography>
                      </Box>

                      <Grid container spacing={1} sx={{ mb: 2 }}>
                        <Grid item xs={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <GroupIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
                            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                              {challenge.current_teams}/{challenge.max_teams} equipos
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AccessTimeIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
                            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                              {challenge.duration_weeks} semanas
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                        <CalendarTodayIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                          Termina: {formatDate(challenge.challenge_end)}
                        </Typography>
                      </Box>
                    </CardContent>

                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleViewDetails(challenge)}
                        sx={{ flex: 1 }}
                      >
                        Ver Detalles
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<PlayArrowIcon />}
                        sx={{ flex: 1 }}
                        disabled
                      >
                        En Progreso
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </TabPanel>

        {/* Tab Panel para Desafíos Completados */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            {getChallengesByStatus('completed').length === 0 ? (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CheckCircleIcon sx={{ fontSize: 64, color: '#94a3b8', mb: 2 }} />
                  <Typography variant="h6" sx={{ color: '#94a3b8' }}>
                    No hay desafíos completados
                  </Typography>
                </Box>
              </Grid>
            ) : (
              getChallengesByStatus('completed').map((challenge) => (
                <Grid item xs={12} md={6} lg={4} key={challenge.id}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6,
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                        <Chip
                          label={getStatusText(challenge.status)}
                          color={getStatusColor(challenge.status) as any}
                          size="small"
                        />
                        <Chip
                          label={getPeriodText(challenge.period_type)}
                          variant="outlined"
                          size="small"
                        />
                      </Box>

                      <Typography variant="h6" fontWeight={600} sx={{ mb: 1, lineHeight: 1.3 }}>
                        {challenge.title}
                      </Typography>

                      <Typography variant="body2" sx={{ 
                        color: themeMode === 'dark' ? '#94a3b8' : '#64748b',
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                        {challenge.description}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <BusinessIcon sx={{ fontSize: 16, color: '#3b82f6' }} />
                        <Typography variant="body2" sx={{ color: '#3b82f6', fontWeight: 500 }}>
                          {challenge.company.name}
                        </Typography>
                      </Box>

                      <Grid container spacing={1} sx={{ mb: 2 }}>
                        <Grid item xs={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <GroupIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
                            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                              {challenge.current_teams}/{challenge.max_teams} equipos
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AccessTimeIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
                            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                              {challenge.duration_weeks} semanas
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                        <CalendarTodayIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                          Completado: {formatDate(challenge.challenge_end)}
                        </Typography>
                      </Box>
                    </CardContent>

                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleViewDetails(challenge)}
                        sx={{ flex: 1 }}
                      >
                        Ver Resultados
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<CheckCircleIcon />}
                        sx={{ flex: 1 }}
                        disabled
                      >
                        Completado
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </TabPanel>
      </Paper>

      {/* Dialog de detalles */}
      <Dialog
        open={detailOpen}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '12px' }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          pb: 1
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmojiEventsIcon sx={{ color: '#3b82f6' }} />
            <Typography variant="h6" fontWeight={600}>
              Detalles del Desafío
            </Typography>
          </Box>
          <IconButton onClick={handleCloseDetails} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          {selectedChallenge && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>
                    {selectedChallenge.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <BusinessIcon sx={{ fontSize: 16, color: '#3b82f6' }} />
                    <Typography variant="body1" sx={{ color: '#3b82f6', fontWeight: 500 }}>
                      {selectedChallenge.company.name}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end' }}>
                  <Chip
                    label={getStatusText(selectedChallenge.status)}
                    color={getStatusColor(selectedChallenge.status) as any}
                  />
                  <Chip
                    label={getPeriodText(selectedChallenge.period_type)}
                    variant="outlined"
                  />
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Descripción
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                {selectedChallenge.description}
              </Typography>

              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Requisitos
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                {selectedChallenge.requirements}
              </Typography>

              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                    Información del Desafío
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <GroupIcon sx={{ fontSize: 20 }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Equipos" 
                        secondary={`${selectedChallenge.current_teams}/${selectedChallenge.max_teams} equipos`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <PeopleIcon sx={{ fontSize: 20 }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Estudiantes por equipo" 
                        secondary={selectedChallenge.students_per_team}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <AccessTimeIcon sx={{ fontSize: 20 }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Duración" 
                        secondary={`${selectedChallenge.duration_weeks} semanas`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <ScheduleIcon sx={{ fontSize: 20 }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Horas por semana" 
                        secondary={`${selectedChallenge.hours_per_week} horas`}
                      />
                    </ListItem>
                  </List>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                    Fechas Importantes
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <CalendarTodayIcon sx={{ fontSize: 20 }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Inicio de inscripciones" 
                        secondary={formatDate(selectedChallenge.registration_start)}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CalendarTodayIcon sx={{ fontSize: 20 }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Fin de inscripciones" 
                        secondary={formatDate(selectedChallenge.registration_end)}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <PlayArrowIcon sx={{ fontSize: 20 }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Inicio del desafío" 
                        secondary={formatDate(selectedChallenge.challenge_start)}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <StopIcon sx={{ fontSize: 20 }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Fin del desafío" 
                        secondary={formatDate(selectedChallenge.challenge_end)}
                      />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>

              {selectedChallenge.technologies && selectedChallenge.technologies.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                    Tecnologías
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedChallenge.technologies.map((tech, index) => (
                      <Chip
                        key={index}
                        label={tech}
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {selectedChallenge.benefits && selectedChallenge.benefits.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                    Beneficios
                  </Typography>
                  <List dense>
                    {selectedChallenge.benefits.map((benefit, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CheckCircleIcon sx={{ fontSize: 20, color: '#10b981' }} />
                        </ListItemIcon>
                        <ListItemText primary={benefit} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={handleCloseDetails}>
            Cerrar
          </Button>
          {selectedChallenge && canParticipate(selectedChallenge) && (
            <Button 
              variant="contained" 
              startIcon={<EmojiEventsIcon />}
              onClick={() => {
                handleParticipate(selectedChallenge);
                handleCloseDetails();
              }}
            >
              Participar en el Desafío
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbars para notificaciones */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CollectiveChallenges;
