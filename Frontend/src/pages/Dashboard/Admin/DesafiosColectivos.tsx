import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Avatar,
  Tooltip,
  Alert,
  CircularProgress,
  Fab,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Groups as GroupsIcon,
  Assignment as AssignmentIcon,
  School as SchoolIcon,
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { useTheme as useCustomTheme } from '../../../contexts/ThemeContext';

interface DesafioColectivo {
  id: string;
  titulo: string;
  descripcion: string;
  empresa: string;
  seccion: string;
  fechaInicio: string;
  fechaFin: string;
  estado: 'activo' | 'completado' | 'pausado' | 'cancelado';
  estudiantesParticipantes: number;
  estudiantesCompletaron: number;
  nivelDificultad: 'básico' | 'intermedio' | 'avanzado';
  horasEstimadas: number;
  habilidadesRequeridas: string[];
  recompensas: string[];
  instructor: string;
  fechaCreacion: string;
}

const DesafiosColectivos: React.FC = () => {
  const { themeMode } = useCustomTheme();
  const [desafios, setDesafios] = useState<DesafioColectivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDesafio, setEditingDesafio] = useState<DesafioColectivo | null>(null);
  const [formData, setFormData] = useState<Partial<DesafioColectivo>>({});

  // Datos de ejemplo para demostración
  const desafiosEjemplo: DesafioColectivo[] = [
    {
      id: '1',
      titulo: 'Desarrollo de App Móvil para Gestión de Inventarios',
      descripcion: 'Crear una aplicación móvil completa para gestión de inventarios con funcionalidades de escaneo QR, notificaciones push y sincronización en tiempo real.',
      empresa: 'TechCorp Solutions',
      seccion: 'Sección A',
      fechaInicio: '2024-01-15',
      fechaFin: '2024-03-15',
      estado: 'activo',
      estudiantesParticipantes: 12,
      estudiantesCompletaron: 8,
      nivelDificultad: 'avanzado',
      horasEstimadas: 120,
      habilidadesRequeridas: ['React Native', 'Node.js', 'MongoDB', 'Firebase'],
      recompensas: ['Certificado de participación', 'Posible oferta de trabajo', 'Mentoría técnica'],
      instructor: 'Prof. María González',
      fechaCreacion: '2024-01-10',
    },
    {
      id: '2',
      titulo: 'Análisis de Datos para Optimización de Procesos',
      descripcion: 'Analizar datos históricos de producción para identificar patrones y proponer mejoras en los procesos operativos de la empresa.',
      empresa: 'DataAnalytics Inc',
      seccion: 'Sección B',
      fechaInicio: '2024-02-01',
      fechaFin: '2024-04-01',
      estado: 'completado',
      estudiantesParticipantes: 8,
      estudiantesCompletaron: 8,
      nivelDificultad: 'intermedio',
      horasEstimadas: 80,
      habilidadesRequeridas: ['Python', 'Pandas', 'Matplotlib', 'SQL'],
      recompensas: ['Certificado de participación', 'Referencia profesional'],
      instructor: 'Prof. Carlos Rodríguez',
      fechaCreacion: '2024-01-25',
    },
    {
      id: '3',
      titulo: 'Diseño de Experiencia de Usuario para E-commerce',
      descripcion: 'Rediseñar la experiencia de usuario de una plataforma de e-commerce existente, enfocándose en la conversión y usabilidad.',
      empresa: 'EcommercePro',
      seccion: 'Sección C',
      fechaInicio: '2024-03-01',
      fechaFin: '2024-05-01',
      estado: 'pausado',
      estudiantesParticipantes: 6,
      estudiantesCompletaron: 2,
      nivelDificultad: 'intermedio',
      horasEstimadas: 100,
      habilidadesRequeridas: ['Figma', 'UX Research', 'Prototyping', 'Analytics'],
      recompensas: ['Certificado de participación', 'Portfolio review'],
      instructor: 'Prof. Ana Martínez',
      fechaCreacion: '2024-02-20',
    },
  ];

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setDesafios(desafiosEjemplo);
      setLoading(false);
    }, 1000);
  }, []);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activo':
        return 'success';
      case 'completado':
        return 'primary';
      case 'pausado':
        return 'warning';
      case 'cancelado':
        return 'error';
      default:
        return 'default';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'activo':
        return <CheckCircleIcon />;
      case 'completado':
        return <CheckCircleIcon />;
      case 'pausado':
        return <ScheduleIcon />;
      case 'cancelado':
        return <DeleteIcon />;
      default:
        return <AssignmentIcon />;
    }
  };

  const getNivelDificultadColor = (nivel: string) => {
    switch (nivel) {
      case 'básico':
        return 'success';
      case 'intermedio':
        return 'warning';
      case 'avanzado':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleOpenDialog = (desafio?: DesafioColectivo) => {
    if (desafio) {
      setEditingDesafio(desafio);
      setFormData(desafio);
    } else {
      setEditingDesafio(null);
      setFormData({});
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingDesafio(null);
    setFormData({});
  };

  const handleSaveDesafio = () => {
    // Aquí implementarías la lógica para guardar el desafío
    console.log('Guardando desafío:', formData);
    handleCloseDialog();
  };

  const handleDeleteDesafio = (id: string) => {
    // Aquí implementarías la lógica para eliminar el desafío
    console.log('Eliminando desafío:', id);
  };

  const calcularTasaCompletacion = (participantes: number, completaron: number) => {
    if (participantes === 0) return 0;
    return Math.round((completaron / participantes) * 100);
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
          <GroupsIcon sx={{ fontSize: 40, color: '#3b82f6' }} />
          <Box>
            <Typography variant="h4" fontWeight={700} sx={{ color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b' }}>
              Desafíos Colectivos
            </Typography>
            <Typography variant="body1" sx={{ color: themeMode === 'dark' ? '#94a3b8' : '#64748b' }}>
              Gestión de proyectos colaborativos entre estudiantes y empresas
            </Typography>
          </Box>
        </Box>
        
        {/* Estadísticas rápidas */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#3b82f6' }}>
                    <AssignmentIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      {desafios.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Desafíos
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#10b981' }}>
                    <CheckCircleIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      {desafios.filter(d => d.estado === 'activo').length}
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
            <Card sx={{ bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#f59e0b' }}>
                    <PeopleIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      {desafios.reduce((sum, d) => sum + d.estudiantesParticipantes, 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Estudiantes Participando
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#8b5cf6' }}>
                    <TrendingUpIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      {Math.round(desafios.reduce((sum, d) => sum + calcularTasaCompletacion(d.estudiantesParticipantes, d.estudiantesCompletaron), 0) / desafios.length)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tasa de Completación
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Tabla de Desafíos */}
      <Card sx={{ bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight={700}>
              Lista de Desafíos Colectivos
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' } }}
            >
              Nuevo Desafío
            </Button>
          </Box>

          <TableContainer component={Paper} sx={{ bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b' }}>
                    Desafío
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b' }}>
                    Empresa
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b' }}>
                    Sección
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b' }}>
                    Estado
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b' }}>
                    Participantes
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b' }}>
                    Completación
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b' }}>
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {desafios.map((desafio) => (
                  <TableRow key={desafio.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={600} sx={{ color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b' }}>
                          {desafio.titulo}
                        </Typography>
                        <Typography variant="caption" sx={{ color: themeMode === 'dark' ? '#94a3b8' : '#64748b' }}>
                          {desafio.nivelDificultad} • {desafio.horasEstimadas}h
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b' }}>
                        {desafio.empresa}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b' }}>
                        {desafio.seccion}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getEstadoIcon(desafio.estado)}
                        label={desafio.estado.charAt(0).toUpperCase() + desafio.estado.slice(1)}
                        color={getEstadoColor(desafio.estado) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b' }}>
                        {desafio.estudiantesParticipantes}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b' }}>
                          {calcularTasaCompletacion(desafio.estudiantesParticipantes, desafio.estudiantesCompletaron)}%
                        </Typography>
                        <Typography variant="caption" sx={{ color: themeMode === 'dark' ? '#94a3b8' : '#64748b' }}>
                          ({desafio.estudiantesCompletaron}/{desafio.estudiantesParticipantes})
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Ver detalles">
                          <IconButton size="small" onClick={() => handleOpenDialog(desafio)}>
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton size="small" onClick={() => handleOpenDialog(desafio)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton size="small" onClick={() => handleDeleteDesafio(desafio.id)} color="error">
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Dialog para crear/editar desafío */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingDesafio ? 'Editar Desafío Colectivo' : 'Nuevo Desafío Colectivo'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Título del Desafío"
                value={formData.titulo || ''}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Descripción"
                value={formData.descripcion || ''}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Empresa"
                value={formData.empresa || ''}
                onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Sección</InputLabel>
                <Select
                  value={formData.seccion || ''}
                  onChange={(e) => setFormData({ ...formData, seccion: e.target.value })}
                >
                  <MenuItem value="Sección A">Sección A</MenuItem>
                  <MenuItem value="Sección B">Sección B</MenuItem>
                  <MenuItem value="Sección C">Sección C</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Nivel de Dificultad</InputLabel>
                <Select
                  value={formData.nivelDificultad || ''}
                  onChange={(e) => setFormData({ ...formData, nivelDificultad: e.target.value as any })}
                >
                  <MenuItem value="básico">Básico</MenuItem>
                  <MenuItem value="intermedio">Intermedio</MenuItem>
                  <MenuItem value="avanzado">Avanzado</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Horas Estimadas"
                value={formData.horasEstimadas || ''}
                onChange={(e) => setFormData({ ...formData, horasEstimadas: parseInt(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Fecha de Inicio"
                value={formData.fechaInicio || ''}
                onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Fecha de Fin"
                value={formData.fechaFin || ''}
                onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSaveDesafio} variant="contained">
            {editingDesafio ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DesafiosColectivos;