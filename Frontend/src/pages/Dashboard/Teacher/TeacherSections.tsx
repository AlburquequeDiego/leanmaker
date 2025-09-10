/**
 * 📚 TEACHER SECTIONS - GESTIÓN DE SECCIONES ACADÉMICAS
 * 
 * DESCRIPCIÓN:
 * Esta interfaz permite al docente gestionar secciones académicas basadas en
 * los desafíos que ha tomado, organizando estudiantes en grupos para proyectos semestrales.
 * 
 * FUNCIONALIDADES PRINCIPALES:
 * - Ver desafíos tomados disponibles para crear secciones
 * - Crear nuevas secciones académicas
 * - Organizar estudiantes en grupos dentro de cada sección
 * - Gestionar grupos y asignaciones de estudiantes
 * - Seguimiento básico de progreso por sección
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
} from '@mui/material';
import {
  Groups as GroupsIcon,
  Add as AddIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  School as SchoolIcon,
  EmojiEvents as EmojiEventsIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  AddCircle as AddCircleIcon,
  PersonAdd as PersonAddIcon,
  GroupAdd as GroupAddIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { apiService } from '../../../services/api.service';
import { useTheme } from '../../../contexts/ThemeContext';

interface DesafioTomado {
  id: string;
  title: string;
  company: string;
  description: string;
  tipo: 'trimestral' | 'semestral';
  fecha_tomado: string;
  estado: 'activo' | 'completado' | 'pausado';
}

interface SeccionAcademica {
  id: string;
  desafio_id: string;
  nombre: string;
  semestre: string;
  fecha_creacion: string;
  estado: 'activa' | 'completada' | 'pausada';
  grupos: GrupoEstudiante[];
  total_estudiantes: number;
}

interface GrupoEstudiante {
  id: string;
  nombre: string;
  estudiantes: Estudiante[];
  progreso: number;
  estado: 'activo' | 'completado' | 'pausado';
}

interface Estudiante {
  id: string;
  nombre: string;
  email: string;
  avatar?: string;
}

export const TeacherSections: React.FC = () => {
  const { themeMode } = useTheme();
  const [desafiosTomados, setDesafiosTomados] = useState<DesafioTomado[]>([]);
  const [secciones, setSecciones] = useState<SeccionAcademica[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDesafio, setSelectedDesafio] = useState<DesafioTomado | null>(null);
  const [nuevaSeccion, setNuevaSeccion] = useState({
    nombre: '',
    semestre: '',
    grupos: 1,
  });

  // Datos de ejemplo (será reemplazado por API real)
  useEffect(() => {
    const mockDesafiosTomados: DesafioTomado[] = [
      {
        id: '1',
        title: 'Optimización del Sistema de Inventario con IA',
        company: 'TechCorp Solutions',
        description: 'Desarrollar un sistema de inventario inteligente que optimice el almacenamiento y distribución.',
        tipo: 'semestral',
        fecha_tomado: '2024-01-15T10:30:00Z',
        estado: 'activo',
      },
      {
        id: '2',
        title: 'Plataforma de E-commerce Sostenible',
        company: 'EcoMarket',
        description: 'Crear una plataforma de comercio electrónico enfocada en productos sostenibles.',
        tipo: 'trimestral',
        fecha_tomado: '2024-01-10T14:20:00Z',
        estado: 'activo',
      },
    ];

    const mockSecciones: SeccionAcademica[] = [
      {
        id: '1',
        desafio_id: '1',
        nombre: 'Sección A - Inventario IA',
        semestre: '2024-1',
        fecha_creacion: '2024-01-16T09:00:00Z',
        estado: 'activa',
        total_estudiantes: 15,
        grupos: [
          {
            id: '1',
            nombre: 'Grupo Alpha',
            estudiantes: [
              { id: '1', nombre: 'Juan Pérez', email: 'juan.perez@email.com' },
              { id: '2', nombre: 'María García', email: 'maria.garcia@email.com' },
              { id: '3', nombre: 'Carlos López', email: 'carlos.lopez@email.com' },
            ],
            progreso: 75,
            estado: 'activo',
          },
          {
            id: '2',
            nombre: 'Grupo Beta',
            estudiantes: [
              { id: '4', nombre: 'Ana Martínez', email: 'ana.martinez@email.com' },
              { id: '5', nombre: 'Luis Rodríguez', email: 'luis.rodriguez@email.com' },
            ],
            progreso: 60,
            estado: 'activo',
          },
        ],
      },
    ];

    setTimeout(() => {
      setDesafiosTomados(mockDesafiosTomados);
      setSecciones(mockSecciones);
      setLoading(false);
    }, 1000);
  }, []);

  const handleCrearSeccion = (desafio: DesafioTomado) => {
    setSelectedDesafio(desafio);
    setNuevaSeccion({
      nombre: `Sección - ${desafio.title}`,
      semestre: '2024-1',
      grupos: 1,
    });
    setDialogOpen(true);
  };

  const handleGuardarSeccion = () => {
    if (!selectedDesafio) return;

    const nuevaSeccion: SeccionAcademica = {
      id: Date.now().toString(),
      desafio_id: selectedDesafio.id,
      nombre: nuevaSeccion.nombre,
      semestre: nuevaSeccion.semestre,
      fecha_creacion: new Date().toISOString(),
      estado: 'activa',
      total_estudiantes: 0,
      grupos: [],
    };

    setSecciones(prev => [...prev, nuevaSeccion]);
    setDialogOpen(false);
    setSelectedDesafio(null);
    setNuevaSeccion({ nombre: '', semestre: '', grupos: 1 });
  };

  const getDesafioInfo = (desafioId: string) => {
    return desafiosTomados.find(d => d.id === desafioId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Cargando secciones académicas...
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
            📚 Gestión de Secciones Académicas
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: 400,
              textShadow: '0 1px 2px rgba(0,0,0,0.2)'
            }}
          >
            Organiza tus desafíos tomados en secciones académicas y gestiona grupos de estudiantes para proyectos semestrales
          </Typography>
        </Box>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', px: 2 }}>
            <Button
              variant={activeTab === 0 ? 'contained' : 'text'}
              onClick={() => setActiveTab(0)}
              startIcon={<EmojiEventsIcon />}
              sx={{ mr: 2 }}
            >
              Desafíos Tomados
            </Button>
            <Button
              variant={activeTab === 1 ? 'contained' : 'text'}
              onClick={() => setActiveTab(1)}
              startIcon={<GroupsIcon />}
              sx={{ mr: 2 }}
            >
              Mis Secciones
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Contenido de las tabs */}
      {activeTab === 0 && (
        <Box>
          <Typography variant="h5" fontWeight={600} sx={{ mb: 3, color: 'primary.main' }}>
            🎯 Desafíos Disponibles para Crear Secciones
          </Typography>
          
          {desafiosTomados.length === 0 ? (
            <Alert severity="info">
              No tienes desafíos tomados disponibles para crear secciones.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {desafiosTomados.map((desafio) => (
                <Grid item xs={12} md={6} key={desafio.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                          <BusinessIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight={600}>
                            {desafio.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {desafio.company}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {desafio.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Chip
                          label={desafio.tipo === 'semestral' ? 'Semestral' : 'Trimestral'}
                          color="primary"
                          size="small"
                        />
                        <Chip
                          label={desafio.estado}
                          color={desafio.estado === 'activo' ? 'success' : 'default'}
                          size="small"
                        />
                      </Box>
                      
                      <Typography variant="caption" color="text.secondary">
                        Tomado el: {formatDate(desafio.fecha_tomado)}
                      </Typography>
                    </CardContent>
                    
                    <CardActions>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleCrearSeccion(desafio)}
                        fullWidth
                      >
                        Crear Sección
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <Typography variant="h5" fontWeight={600} sx={{ mb: 3, color: 'primary.main' }}>
            📚 Mis Secciones Académicas
          </Typography>
          
          {secciones.length === 0 ? (
            <Alert severity="info">
              No tienes secciones académicas creadas. Toma un desafío y crea tu primera sección.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {secciones.map((seccion) => {
                const desafio = getDesafioInfo(seccion.desafio_id);
                return (
                  <Grid item xs={12} key={seccion.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                          <Box>
                            <Typography variant="h6" fontWeight={600}>
                              {seccion.nombre}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {desafio?.title} • {desafio?.company}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Semestre: {seccion.semestre} • Creada: {formatDate(seccion.fecha_creacion)}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Chip
                              label={seccion.estado}
                              color={seccion.estado === 'activa' ? 'success' : 'default'}
                              size="small"
                            />
                            <Chip
                              label={`${seccion.total_estudiantes} estudiantes`}
                              color="info"
                              size="small"
                            />
                          </Box>
                        </Box>
                        
                        <Divider sx={{ my: 2 }} />
                        
                        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                          Grupos ({seccion.grupos.length})
                        </Typography>
                        
                        <Grid container spacing={2}>
                          {seccion.grupos.map((grupo) => (
                            <Grid item xs={12} sm={6} md={4} key={grupo.id}>
                              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                  <Typography variant="subtitle2" fontWeight={600}>
                                    {grupo.nombre}
                                  </Typography>
                                  <Chip
                                    label={`${grupo.progreso}%`}
                                    color="success"
                                    size="small"
                                  />
                                </Box>
                                
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                  {grupo.estudiantes.length} estudiantes
                                </Typography>
                                
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Button size="small" startIcon={<VisibilityIcon />}>
                                    Ver
                                  </Button>
                                  <Button size="small" startIcon={<EditIcon />}>
                                    Editar
                                  </Button>
                                </Box>
                              </Paper>
                            </Grid>
                          ))}
                        </Grid>
                      </CardContent>
                      
                      <CardActions>
                        <Button startIcon={<GroupAddIcon />}>
                          Agregar Grupo
                        </Button>
                        <Button startIcon={<PersonAddIcon />}>
                          Gestionar Estudiantes
                        </Button>
                        <Button startIcon={<TrendingUpIcon />}>
                          Ver Progreso
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      )}

      {/* Dialog para crear sección */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <GroupsIcon />
            <Typography variant="h6">
              Crear Nueva Sección Académica
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {selectedDesafio && (
            <Box sx={{ mb: 3 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  Desafío seleccionado:
                </Typography>
                <Typography variant="body2">
                  {selectedDesafio.title} • {selectedDesafio.company}
                </Typography>
              </Alert>
            </Box>
          )}
          
          <TextField
            fullWidth
            label="Nombre de la Sección"
            value={nuevaSeccion.nombre}
            onChange={(e) => setNuevaSeccion(prev => ({ ...prev, nombre: e.target.value }))}
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="Semestre"
            value={nuevaSeccion.semestre}
            onChange={(e) => setNuevaSeccion(prev => ({ ...prev, semestre: e.target.value }))}
            sx={{ mb: 2 }}
          />
          
          <FormControl fullWidth>
            <InputLabel>Número de Grupos Iniciales</InputLabel>
            <Select
              value={nuevaSeccion.grupos}
              onChange={(e) => setNuevaSeccion(prev => ({ ...prev, grupos: Number(e.target.value) }))}
              label="Número de Grupos Iniciales"
            >
              <MenuItem value={1}>1 Grupo</MenuItem>
              <MenuItem value={2}>2 Grupos</MenuItem>
              <MenuItem value={3}>3 Grupos</MenuItem>
              <MenuItem value={4}>4 Grupos</MenuItem>
              <MenuItem value={5}>5 Grupos</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            onClick={handleGuardarSeccion}
            disabled={!nuevaSeccion.nombre || !nuevaSeccion.semestre}
          >
            Crear Sección
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeacherSections;
