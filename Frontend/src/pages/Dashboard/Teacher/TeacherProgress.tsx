/**
 * 📈 TEACHER PROGRESS - GESTIÓN DE AVANCE DE GRUPOS
 * 
 * DESCRIPCIÓN:
 * Esta interfaz permite al docente monitorear el progreso de los grupos dentro
 * de las secciones académicas que ha creado, con sistema de checks y reportes.
 * 
 * FUNCIONALIDADES PRINCIPALES:
 * - Monitoreo en tiempo real del progreso de grupos
 * - Sistema de checks/validaciones para avance
 * - Reportes de progreso por grupo y sección
 * - Comunicación con admin sobre el avance
 * - Métricas y estadísticas de rendimiento
 * 
 * AUTOR: Sistema LeanMaker
 * FECHA: 2024
 * VERSIÓN: 1.0
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
  Badge,
  Tooltip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  People as PeopleIcon,
  Groups as GroupsIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Business as BusinessIcon,
  Schedule as ScheduleIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { apiService } from '../../../services/api.service';
import { useTheme } from '../../../contexts/ThemeContext';

interface SeccionConProgreso {
  id: string;
  nombre: string;
  desafio: string;
  empresa: string;
  semestre: string;
  estado: 'activa' | 'completada' | 'pausada';
  grupos: GrupoConProgreso[];
  progreso_promedio: number;
  total_estudiantes: number;
}

interface GrupoConProgreso {
  id: string;
  nombre: string;
  estudiantes: number;
  progreso: number;
  estado: 'activo' | 'completado' | 'pausado' | 'atrasado';
  ultima_actividad: string;
  checks_completados: number;
  checks_totales: number;
  milestones: Milestone[];
}

interface Milestone {
  id: string;
  nombre: string;
  descripcion: string;
  fecha_limite: string;
  completado: boolean;
  fecha_completado?: string;
  comentarios?: string;
}

interface CheckValidacion {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: 'obligatorio' | 'opcional' | 'revision';
  completado: boolean;
  fecha_completado?: string;
  comentarios?: string;
}

export const TeacherProgress: React.FC = () => {
  const { themeMode } = useTheme();
  const [secciones, setSecciones] = useState<SeccionConProgreso[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedSeccion, setSelectedSeccion] = useState<SeccionConProgreso | null>(null);
  const [selectedGrupo, setSelectedGrupo] = useState<GrupoConProgreso | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [checkDialogOpen, setCheckDialogOpen] = useState(false);
  const [filtros, setFiltros] = useState({
    seccion: 'all',
    estado: 'all',
    progreso: 'all',
  });

  // Datos de ejemplo (será reemplazado por API real)
  useEffect(() => {
    const mockSecciones: SeccionConProgreso[] = [
      {
        id: '1',
        nombre: 'Sección A - Inventario IA',
        desafio: 'Optimización del Sistema de Inventario con IA',
        empresa: 'TechCorp Solutions',
        semestre: '2024-1',
        estado: 'activa',
        progreso_promedio: 68,
        total_estudiantes: 15,
        grupos: [
          {
            id: '1',
            nombre: 'Grupo Alpha',
            estudiantes: 8,
            progreso: 75,
            estado: 'activo',
            ultima_actividad: '2024-01-20T14:30:00Z',
            checks_completados: 6,
            checks_totales: 8,
            milestones: [
              {
                id: '1',
                nombre: 'Análisis de Requerimientos',
                descripcion: 'Documento de análisis completo',
                fecha_limite: '2024-01-25',
                completado: true,
                fecha_completado: '2024-01-22',
                comentarios: 'Excelente trabajo, muy detallado'
              },
              {
                id: '2',
                nombre: 'Prototipo Inicial',
                descripcion: 'Primera versión del prototipo',
                fecha_limite: '2024-02-05',
                completado: false,
              }
            ]
          },
          {
            id: '2',
            nombre: 'Grupo Beta',
            estudiantes: 7,
            progreso: 60,
            estado: 'atrasado',
            ultima_actividad: '2024-01-18T10:15:00Z',
            checks_completados: 4,
            checks_totales: 8,
            milestones: [
              {
                id: '3',
                nombre: 'Análisis de Requerimientos',
                descripcion: 'Documento de análisis completo',
                fecha_limite: '2024-01-25',
                completado: true,
                fecha_completado: '2024-01-24',
                comentarios: 'Buen trabajo, necesita más detalle'
              },
              {
                id: '4',
                nombre: 'Prototipo Inicial',
                descripcion: 'Primera versión del prototipo',
                fecha_limite: '2024-02-05',
                completado: false,
              }
            ]
          }
        ]
      },
      {
        id: '2',
        nombre: 'Sección B - E-commerce',
        desafio: 'Plataforma de E-commerce Sostenible',
        empresa: 'EcoMarket',
        semestre: '2024-1',
        estado: 'activa',
        progreso_promedio: 45,
        total_estudiantes: 12,
        grupos: [
          {
            id: '3',
            nombre: 'Grupo Gamma',
            estudiantes: 6,
            progreso: 50,
            estado: 'activo',
            ultima_actividad: '2024-01-19T16:45:00Z',
            checks_completados: 3,
            checks_totales: 6,
            milestones: [
              {
                id: '5',
                nombre: 'Investigación de Mercado',
                descripcion: 'Análisis del mercado sostenible',
                fecha_limite: '2024-01-30',
                completado: true,
                fecha_completado: '2024-01-28',
              },
              {
                id: '6',
                nombre: 'Diseño de UI/UX',
                descripcion: 'Prototipos de interfaz',
                fecha_limite: '2024-02-10',
                completado: false,
              }
            ]
          },
          {
            id: '4',
            nombre: 'Grupo Delta',
            estudiantes: 6,
            progreso: 40,
            estado: 'activo',
            ultima_actividad: '2024-01-17T11:20:00Z',
            checks_completados: 2,
            checks_totales: 6,
            milestones: [
              {
                id: '7',
                nombre: 'Investigación de Mercado',
                descripcion: 'Análisis del mercado sostenible',
                fecha_limite: '2024-01-30',
                completado: true,
                fecha_completado: '2024-01-29',
              },
              {
                id: '8',
                nombre: 'Diseño de UI/UX',
                descripcion: 'Prototipos de interfaz',
                fecha_limite: '2024-02-10',
                completado: false,
              }
            ]
          }
        ]
      }
    ];

    setTimeout(() => {
      setSecciones(mockSecciones);
      setLoading(false);
    }, 1000);
  }, []);

  const handleVerDetalleGrupo = (seccion: SeccionConProgreso, grupo: GrupoConProgreso) => {
    setSelectedSeccion(seccion);
    setSelectedGrupo(grupo);
    setDialogOpen(true);
  };

  const handleAgregarCheck = () => {
    setCheckDialogOpen(true);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activo': return 'success';
      case 'completado': return 'primary';
      case 'pausado': return 'warning';
      case 'atrasado': return 'error';
      default: return 'default';
    }
  };

  const getProgresoColor = (progreso: number) => {
    if (progreso >= 80) return 'success';
    if (progreso >= 60) return 'info';
    if (progreso >= 40) return 'warning';
    return 'error';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calcularEstadisticas = () => {
    const totalGrupos = secciones.reduce((acc, seccion) => acc + seccion.grupos.length, 0);
    const gruposActivos = secciones.reduce((acc, seccion) => 
      acc + seccion.grupos.filter(g => g.estado === 'activo').length, 0);
    const gruposAtrasados = secciones.reduce((acc, seccion) => 
      acc + seccion.grupos.filter(g => g.estado === 'atrasado').length, 0);
    const progresoPromedio = secciones.length > 0 
      ? Math.round(secciones.reduce((acc, seccion) => acc + seccion.progreso_promedio, 0) / secciones.length)
      : 0;

    return {
      totalGrupos,
      gruposActivos,
      gruposAtrasados,
      progresoPromedio,
      totalSecciones: secciones.length
    };
  };

  const stats = calcularEstadisticas();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Cargando progreso de grupos...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header principal mejorado */}
      <Box sx={{ 
        mb: 4,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 4,
        p: 4,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
      }}>
        {/* Elementos decorativos */}
        <Box sx={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 100,
          height: 100,
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          zIndex: 1
        }} />
        <Box sx={{
          position: 'absolute',
          bottom: -30,
          left: -30,
          width: 80,
          height: 80,
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '50%',
          zIndex: 1
        }} />
        
        {/* Contenido del header */}
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Typography 
            variant="h3" 
            fontWeight={700} 
            sx={{ 
              color: 'white', 
              mb: 1,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            📈 Gestión de Avance de Grupos
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: 400,
              textShadow: '0 1px 2px rgba(0,0,0,0.2)'
            }}
          >
            Monitorea el progreso de tus grupos académicos, gestiona checks de validación y genera reportes de avance
          </Typography>
        </Box>
      </Box>

      {/* Estadísticas generales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <GroupsIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {stats.totalGrupos}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Grupos
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
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <CheckCircleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {stats.gruposActivos}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Grupos Activos
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
                <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
                  <WarningIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {stats.gruposAtrasados}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Grupos Atrasados
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
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {stats.progresoPromedio}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Progreso Promedio
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', px: 2 }}>
            <Button
              variant={activeTab === 0 ? 'contained' : 'text'}
              onClick={() => setActiveTab(0)}
              startIcon={<BarChartIcon />}
              sx={{ mr: 2 }}
            >
              Resumen General
            </Button>
            <Button
              variant={activeTab === 1 ? 'contained' : 'text'}
              onClick={() => setActiveTab(1)}
              startIcon={<GroupsIcon />}
              sx={{ mr: 2 }}
            >
              Detalle por Sección
            </Button>
            <Button
              variant={activeTab === 2 ? 'contained' : 'text'}
              onClick={() => setActiveTab(2)}
              startIcon={<CheckCircleIcon />}
              sx={{ mr: 2 }}
            >
              Sistema de Checks
            </Button>
            <Button
              variant={activeTab === 3 ? 'contained' : 'text'}
              onClick={() => setActiveTab(3)}
              startIcon={<DownloadIcon />}
              sx={{ mr: 2 }}
            >
              Reportes
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Contenido de las tabs */}
      {activeTab === 0 && (
        <Box>
          <Typography variant="h5" fontWeight={600} sx={{ mb: 3, color: 'primary.main' }}>
            📊 Resumen General de Progreso
          </Typography>
          
          <Grid container spacing={3}>
            {secciones.map((seccion) => (
              <Grid item xs={12} md={6} key={seccion.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" fontWeight={600}>
                          {seccion.nombre}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {seccion.desafio} • {seccion.empresa}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Semestre: {seccion.semestre} • {seccion.total_estudiantes} estudiantes
                        </Typography>
                      </Box>
                      <Chip
                        label={seccion.estado}
                        color={getEstadoColor(seccion.estado) as any}
                        size="small"
                      />
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Progreso Promedio</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {seccion.progreso_promedio}%
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={seccion.progreso_promedio}
                        color={getProgresoColor(seccion.progreso_promedio) as any}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                    
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                      Grupos ({seccion.grupos.length})
                    </Typography>
                    
                    <Grid container spacing={1}>
                      {seccion.grupos.map((grupo) => (
                        <Grid item xs={6} key={grupo.id}>
                          <Paper sx={{ p: 1, bgcolor: 'grey.50' }}>
                            <Typography variant="caption" fontWeight={600}>
                              {grupo.nombre}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={grupo.progreso}
                                color={getProgresoColor(grupo.progreso) as any}
                                sx={{ flexGrow: 1, height: 4 }}
                              />
                              <Typography variant="caption">
                                {grupo.progreso}%
                              </Typography>
                            </Box>
                            <Chip
                              label={grupo.estado}
                              color={getEstadoColor(grupo.estado) as any}
                              size="small"
                              sx={{ mt: 0.5 }}
                            />
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                  
                  <CardActions>
                    <Button 
                      size="small" 
                      startIcon={<VisibilityIcon />}
                      onClick={() => setActiveTab(1)}
                    >
                      Ver Detalle
                    </Button>
                    <Button 
                      size="small" 
                      startIcon={<AssessmentIcon />}
                      onClick={() => setActiveTab(2)}
                    >
                      Checks
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <Typography variant="h5" fontWeight={600} sx={{ mb: 3, color: 'primary.main' }}>
            🔍 Detalle por Sección
          </Typography>
          
          <FormControl sx={{ mb: 3, minWidth: 200 }}>
            <InputLabel>Seleccionar Sección</InputLabel>
            <Select
              value={filtros.seccion}
              onChange={(e) => setFiltros(prev => ({ ...prev, seccion: e.target.value }))}
              label="Seleccionar Sección"
            >
              <MenuItem value="all">Todas las Secciones</MenuItem>
              {secciones.map((seccion) => (
                <MenuItem key={seccion.id} value={seccion.id}>
                  {seccion.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Grupo</TableCell>
                  <TableCell>Estudiantes</TableCell>
                  <TableCell>Progreso</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Última Actividad</TableCell>
                  <TableCell>Checks</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {secciones
                  .filter(seccion => filtros.seccion === 'all' || seccion.id === filtros.seccion)
                  .map((seccion) => 
                    seccion.grupos.map((grupo) => (
                      <TableRow key={grupo.id}>
                        <TableCell>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {grupo.nombre}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {seccion.nombre}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{grupo.estudiantes}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={grupo.progreso}
                              color={getProgresoColor(grupo.progreso) as any}
                              sx={{ width: 60, height: 6 }}
                            />
                            <Typography variant="body2">
                              {grupo.progreso}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={grupo.estado}
                            color={getEstadoColor(grupo.estado) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">
                            {formatDate(grupo.ultima_actividad)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {grupo.checks_completados}/{grupo.checks_totales}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={() => handleVerDetalleGrupo(seccion, grupo)}
                          >
                            Ver Detalle
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {activeTab === 2 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" fontWeight={600} color="primary.main">
              ✅ Sistema de Checks y Validaciones
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAgregarCheck}
            >
              Agregar Check
            </Button>
          </Box>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            Sistema de validaciones para monitorear el progreso de los grupos. 
            Los checks ayudan a asegurar que los grupos cumplan con los hitos establecidos.
          </Alert>
          
          <Grid container spacing={3}>
            {secciones.map((seccion) => (
              <Grid item xs={12} key={seccion.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                      {seccion.nombre}
                    </Typography>
                    
                    {seccion.grupos.map((grupo) => (
                      <Box key={grupo.id} sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {grupo.nombre}
                          </Typography>
                          <Chip
                            label={`${grupo.checks_completados}/${grupo.checks_totales} checks`}
                            color="info"
                            size="small"
                          />
                        </Box>
                        
                        <Grid container spacing={2}>
                          {grupo.milestones.map((milestone) => (
                            <Grid item xs={12} sm={6} md={4} key={milestone.id}>
                              <Paper sx={{ p: 2, bgcolor: milestone.completado ? 'success.light' : 'grey.50' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <Checkbox
                                    checked={milestone.completado}
                                    color="success"
                                    size="small"
                                  />
                                  <Typography variant="subtitle2" fontWeight={600}>
                                    {milestone.nombre}
                                  </Typography>
                                </Box>
                                
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                  {milestone.descripcion}
                                </Typography>
                                
                                <Typography variant="caption" color="text.secondary">
                                  Fecha límite: {milestone.fecha_limite}
                                </Typography>
                                
                                {milestone.completado && milestone.fecha_completado && (
                                  <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 0.5 }}>
                                    Completado: {formatDate(milestone.fecha_completado)}
                                  </Typography>
                                )}
                                
                                {milestone.comentarios && (
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                    {milestone.comentarios}
                                  </Typography>
                                )}
                              </Paper>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {activeTab === 3 && (
        <Box>
          <Typography variant="h5" fontWeight={600} sx={{ mb: 3, color: 'primary.main' }}>
            📋 Reportes y Exportación
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                    📊 Reporte de Progreso General
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Genera un reporte completo del progreso de todas las secciones y grupos.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    fullWidth
                  >
                    Descargar Reporte General
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                    📈 Reporte por Sección
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Genera un reporte detallado de una sección específica.
                  </Typography>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Seleccionar Sección</InputLabel>
                    <Select
                      value=""
                      label="Seleccionar Sección"
                    >
                      {secciones.map((seccion) => (
                        <MenuItem key={seccion.id} value={seccion.id}>
                          {seccion.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    fullWidth
                  >
                    Descargar Reporte de Sección
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                    ✅ Reporte de Checks
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Reporte detallado de todos los checks y validaciones.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AssessmentIcon />}
                    fullWidth
                  >
                    Descargar Reporte de Checks
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                    📅 Reporte de Actividades
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Historial de actividades y últimas actualizaciones.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<TimelineIcon />}
                    fullWidth
                  >
                    Descargar Reporte de Actividades
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Dialog de detalle del grupo */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <GroupsIcon />
            <Typography variant="h6">
              Detalle del Grupo: {selectedGrupo?.nombre}
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {selectedGrupo && selectedSeccion && (
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  Sección: {selectedSeccion.nombre}
                </Typography>
                <Typography variant="body2">
                  {selectedSeccion.desafio} • {selectedSeccion.empresa}
                </Typography>
              </Alert>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                    📊 Información del Grupo
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText 
                        primary="Estudiantes" 
                        secondary={selectedGrupo.estudiantes} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Progreso" 
                        secondary={`${selectedGrupo.progreso}%`} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Estado" 
                        secondary={selectedGrupo.estado} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Última Actividad" 
                        secondary={formatDate(selectedGrupo.ultima_actividad)} 
                      />
                    </ListItem>
                  </List>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                    ✅ Checks Completados
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Progreso de Checks</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {selectedGrupo.checks_completados}/{selectedGrupo.checks_totales}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={(selectedGrupo.checks_completados / selectedGrupo.checks_totales) * 100}
                      color="success"
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                🎯 Milestones del Grupo
              </Typography>
              
              <Grid container spacing={2}>
                {selectedGrupo.milestones.map((milestone) => (
                  <Grid item xs={12} sm={6} key={milestone.id}>
                    <Paper sx={{ p: 2, bgcolor: milestone.completado ? 'success.light' : 'grey.50' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Checkbox
                          checked={milestone.completado}
                          color="success"
                          size="small"
                        />
                        <Typography variant="subtitle2" fontWeight={600}>
                          {milestone.nombre}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {milestone.descripcion}
                      </Typography>
                      
                      <Typography variant="caption" color="text.secondary">
                        Fecha límite: {milestone.fecha_limite}
                      </Typography>
                      
                      {milestone.completado && milestone.fecha_completado && (
                        <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 0.5 }}>
                          Completado: {formatDate(milestone.fecha_completado)}
                        </Typography>
                      )}
                      
                      {milestone.comentarios && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          {milestone.comentarios}
                        </Typography>
                      )}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Cerrar
          </Button>
          <Button variant="contained" startIcon={<EditIcon />}>
            Editar Grupo
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para agregar check */}
      <Dialog open={checkDialogOpen} onClose={() => setCheckDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AddIcon />
            <Typography variant="h6">
              Agregar Nuevo Check
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <TextField
            fullWidth
            label="Nombre del Check"
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="Descripción"
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Tipo de Check</InputLabel>
            <Select label="Tipo de Check">
              <MenuItem value="obligatorio">Obligatorio</MenuItem>
              <MenuItem value="opcional">Opcional</MenuItem>
              <MenuItem value="revision">Revisión</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            label="Fecha Límite"
            type="date"
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setCheckDialogOpen(false)}>
            Cancelar
          </Button>
          <Button variant="contained">
            Agregar Check
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeacherProgress;
