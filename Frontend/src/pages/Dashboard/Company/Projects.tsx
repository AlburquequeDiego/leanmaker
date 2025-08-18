import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Chip,
  Tabs,
  Tab,
  IconButton,
  TextField,
  FormControl,
  MenuItem,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Grid,
  Paper,
  Stepper,
  Step,
  StepLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  InputLabel,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  PlayArrow as PlayArrowIcon,
  CheckCircle as CheckCircleIcon,
  Publish as PublishIcon,
  Drafts as DraftsIcon,
  TaskAlt as TaskAltIcon,
  Restore as RestoreIcon,
} from '@mui/icons-material';
import Tooltip from '@mui/material/Tooltip';
import { useApi } from '../../../hooks/useApi';
import { adaptProjectList } from '../../../utils/adapters';
import type { Project } from '../../../types';
import { projectService } from '../../../services/project.service';
import { PublishProjects } from './PublishProjects';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';

// Función para obtener descripción del TRL
const getTrlDescription = (trlLevel: number) => {
  const descriptions = [
    'El proyecto está en fase de idea inicial. Aún no hay desarrollo previo y se está definiendo qué se quiere lograr.',
    'El proyecto tiene una definición clara de lo que se quiere lograr y se conocen los antecedentes del problema a resolver.',
    'Se han realizado pruebas iniciales y validaciones de concepto. Algunas partes del proyecto ya han sido evaluadas por separado.',
    'Existe un prototipo básico que ha sido probado en condiciones controladas y simples.',
    'Existe un prototipo que ha sido probado en condiciones similares a las reales donde funcionará.',
    'El prototipo ha sido probado en un entorno real mediante un piloto o prueba inicial.',
    'El proyecto ha sido probado en condiciones reales durante un tiempo prolongado, demostrando su funcionamiento.',
    'El proyecto está validado tanto técnicamente como comercialmente, listo para su implementación.',
    'El proyecto está completamente desarrollado y disponible para ser utilizado por la sociedad.'
  ];
  return descriptions[trlLevel - 1] || 'Estado no especificado';
};

const COUNT_OPTIONS = [5, 20, 50, 100, 150, 200, 250, -1];

// Constantes para edición de proyectos
const editSteps = ['Información Básica', 'Etapa y Duración', 'General', 'Resumen'];

const TRL_HOURS_LIMITS = {
  1: { min: 20, max: 40, description: 'Opción 1-2: Proyectos en fase de idea' },
  2: { min: 20, max: 40, description: 'Opción 1-2: Proyectos en fase de idea' },
  3: { min: 40, max: 80, description: 'Opción 3-4: Prototipos básicos' },
  4: { min: 40, max: 80, description: 'Opción 3-4: Prototipos básicos' },
  5: { min: 80, max: 160, description: 'Opción 5-6: Prototipos avanzados' },
  6: { min: 80, max: 160, description: 'Opción 5-6: Prototipos avanzados' },
  7: { min: 160, max: 350, description: 'Opción 7-9: Productos desarrollados' },
  8: { min: 160, max: 350, description: 'Opción 7-9: Productos desarrollados' },
  9: { min: 160, max: 350, description: 'Opción 7-9: Productos desarrollados' },
} as const;

const TRL_QUESTIONS = [
  'Este proyecto está en fase de idea, sin una definición clara y no cuenta con desarrollo previo.',
  'Este proyecto cuenta con una definición clara y antecedentes de lo que se desea desarrollar.',
  'Hemos desarrollados pruebas y validaciones de concepto. Algunos componentes del proyecto se han evaluado por separado.',
  'Contamos con un prototipo mínimo viable que ha sido probado en condiciones controladas simples.',
  'Contamos con un prototipo mínimo viable que ha sido probado en condiciones similares al entorno real.',
  'Contamos con un prototipo que ha sido probado mediante un piloto en condiciones reales.',
  'Contamos con un desarrollo que ha sido probado en condiciones reales, por un periodo de tiempo prolongado.',
  'Contamos con un producto validado en lo técnico y lo comercial.',
  'Contamos con un producto completamente desarrollado y disponible para la sociedad.'
];

const AREAS_ESTATICAS = [
  { id: 1, name: 'Tecnología y Sistemas' },
  { id: 2, name: 'Administración y Gestión' },
  { id: 3, name: 'Comunicación y Marketing' },
  { id: 4, name: 'Salud y Ciencias' },
  { id: 5, name: 'Ingeniería y Construcción' },
  { id: 6, name: 'Educación y Formación' },
  { id: 7, name: 'Arte y Diseño' },
  { id: 8, name: 'Investigación y Desarrollo' },
  { id: 9, name: 'Servicios y Atención al Cliente' },
  { id: 10, name: 'Sostenibilidad y Medio Ambiente' },
  { id: 11, name: 'Otro' },
];

const Projects: React.FC<{ initialTab?: number }> = ({ initialTab = 0 }) => {
  const location = useLocation();
  const api = useApi();
  const { themeMode } = useTheme();
  const [tab, setTab] = useState(initialTab);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sectionCounts, setSectionCounts] = useState({
    published: 5,
    active: 5,
    completed: 5,
    deleted: 5,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [updatingProject, setUpdatingProject] = useState<string | null>(null);
  const [projectDetails, setProjectDetails] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [savingProject, setSavingProject] = useState(false);
  const [editActiveStep, setEditActiveStep] = useState(0);
  const [editTrlSelected, setEditTrlSelected] = useState(1);
  const [editHoursError, setEditHoursError] = useState<string | null>(null);

  // Sincronizar tab con location.state.initialTab si cambia
  useEffect(() => {
    if (location.state && typeof location.state.initialTab === 'number') {
      setTab(location.state.initialTab);
    }
  }, [location.state]);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const adaptedProjects = await projectService.getMyProjects();
      console.log('🔍 [Projects] Proyectos adaptados recibidos:', adaptedProjects);
      console.log('🔍 [Projects] Estructura de proyectos:');
      adaptedProjects.forEach((project: any, index: number) => {
        console.log(`  - Proyecto ${index + 1}: ${project.title}`);
        console.log(`    - status: ${project.status}`);
        console.log(`    - estudiantes length: ${project.estudiantes?.length || 0}`);
        console.log(`    - estudiantes:`, project.estudiantes);
      });
      setProjects(adaptedProjects);
    } catch (err: any) {
      console.error('Error cargando proyectos:', err);
      setError(err.response?.data?.error || 'Error al cargar proyectos');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => setTab(newValue);

  const handleSectionCountChange = (status: string) => (e: SelectChangeEvent<number>) => {
    setSectionCounts({ ...sectionCounts, [status]: Number(e.target.value) });
  };

  const getStatusCounts = () => {
    return {
      published: projects.filter(p => p.status === 'published').length,
      active: projects.filter(p => p.status === 'active').length,
      completed: projects.filter(p => p.status === 'completed').length,
      deleted: projects.filter(p => p.status === 'deleted').length,
    };
  };

  const statusCounts = getStatusCounts();

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published':
        return 'Publicado';
      case 'active':
        return 'Activo';
      case 'completed':
        return 'Completado';
      case 'deleted':
        return 'Eliminado';
      default:
        return 'Publicado';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'info';
      case 'active':
        return 'primary';
      case 'completed':
        return 'success';
      case 'deleted':
        return 'error';
      default:
        return 'info';
    }
  };

  const statusConfig = {
    published: {
      label: 'Publicado',
      color: '#1976d2',
      icon: <PublishIcon fontSize="small" sx={{ verticalAlign: 'middle' }} />,
      tooltip: 'El proyecto está publicado y visible para los estudiantes.'
    },
    active: {
      label: 'Activo',
      color: '#388e3c',
      icon: <PlayArrowIcon fontSize="small" sx={{ verticalAlign: 'middle' }} />,
      tooltip: 'El proyecto está en curso y los estudiantes están trabajando en él.'
    },
    completed: {
      label: 'Completado',
      color: '#fbc02d',
      icon: <CheckCircleIcon fontSize="small" sx={{ verticalAlign: 'middle' }} />,
      tooltip: 'El proyecto ha sido finalizado.'
    },
    deleted: {
      label: 'Eliminado',
      color: '#d32f2f',
      icon: <DeleteIcon fontSize="small" sx={{ verticalAlign: 'middle' }} />,
      tooltip: 'El proyecto ha sido eliminado.'
    }
  };

  /**
   * StatusBadge
   * Componente visual para mostrar el estado de un proyecto con color, icono y tooltip.
   * Uso: <StatusBadge status={project.status} />
   * Estados soportados: published, active, completed, deleted
   * Traduce y estiliza el estado para hacerlo más visual e intuitivo.
   */
  function StatusBadge({ status }) {
    const config = statusConfig[status] || statusConfig['published'];
    return (
      <Tooltip title={config.tooltip} arrow>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          background: config.color,
          color: '#fff',
          borderRadius: 12,
          padding: '2px 10px',
          fontWeight: 600,
          fontSize: '0.95em',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          marginLeft: 4
        }}>
          {config.icon}
          <span style={{ marginLeft: 6 }}>{config.label}</span>
        </span>
      </Tooltip>
    );
  }

  const handleDeleteClick = (project: Project) => {
    setSelectedProject(project);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProject) return;
    
    try {
      setUpdatingProject(selectedProject.id);
      const response = await api.patch(`/api/projects/${selectedProject.id}/update/`, {
        status: 'deleted'
      });
      
      const updatedProject = response;
      console.log('Respuesta del backend (eliminar):', updatedProject); // Debug
      
      if (updatedProject && (updatedProject.status || updatedProject.status_name)) {
        const newStatus = updatedProject.status || updatedProject.status_name;
        setProjects(projects.map(p =>
          p.id === selectedProject.id ? {
            ...p,
            status: newStatus
          } : p
        ));
        setDeleteDialogOpen(false);
        setSelectedProject(null);
      } else {
        console.error('Respuesta inesperada del backend (eliminar):', updatedProject);
        setError('Respuesta inesperada del servidor');
      }
    } catch (error: any) {
      console.error('Error eliminando proyecto:', error);
      setError(error.response?.data?.error || 'Error al eliminar proyecto');
    } finally {
      setUpdatingProject(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedProject(null);
  };

  const handleActivateClick = (project: Project) => {
    setSelectedProject(project);
    setActivateDialogOpen(true);
  };

  const handleActivateConfirm = async () => {
    if (!selectedProject) return;
    try {
      setUpdatingProject(selectedProject.id);
      // Llamar al nuevo endpoint para activar el proyecto y estudiantes
      const response = await api.post(`/api/projects/${selectedProject.id}/activate/`);
      console.log('Respuesta del backend (activar proyecto):', response);
      if (response && response.success) {
        // Recargar la lista de proyectos desde el backend
        await loadProjects();
        setActivateDialogOpen(false);
        setSelectedProject(null);
      } else {
        setError('Error al activar el proyecto o respuesta inesperada del servidor');
      }
    } catch (error: any) {
      console.error('Error activando proyecto:', error);
      const errorMessage = error.response?.data?.error || 'Error al activar proyecto';
      
      // Mostrar mensaje específico para el caso de no tener estudiantes aceptados
      if (errorMessage.includes('estudiante aceptado')) {
        setError('❌ No puedes activar este proyecto. Debes tener al menos un estudiante aceptado antes de poder activar el proyecto. Revisa las aplicaciones pendientes y acepta a un estudiante primero.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setUpdatingProject(null);
    }
  };

  const handleActivateCancel = () => {
    setActivateDialogOpen(false);
    setSelectedProject(null);
  };

  const handleCompleteClick = (project: Project) => {
    setSelectedProject(project);
    setCompleteDialogOpen(true);
  };

  const handleCompleteConfirm = async () => {
    if (!selectedProject) return;
    
    try {
      setUpdatingProject(selectedProject.id);
      const response = await api.patch(`/api/projects/${selectedProject.id}/update/`, {
        status: 'completed'
      });
      
      const updatedProject = response;
      console.log('Respuesta del backend:', updatedProject); // Debug
      
      if (updatedProject && (updatedProject.status || updatedProject.status_name)) {
        const newStatus = updatedProject.status || updatedProject.status_name;
        setProjects(projects.map(p =>
          p.id === selectedProject.id ? {
            ...p,
            status: newStatus
          } : p
        ));
        setCompleteDialogOpen(false);
        setSelectedProject(null);
      } else {
        console.error('Respuesta inesperada del backend:', updatedProject);
        setError('Respuesta inesperada del servidor');
      }
    } catch (error: any) {
      console.error('Error completando proyecto:', error);
      setError(error.response?.data?.error || 'Error al completar proyecto');
    } finally {
      setUpdatingProject(null);
    }
  };

  const handleCompleteCancel = () => {
    setCompleteDialogOpen(false);
    setSelectedProject(null);
  };

  const handleRestoreClick = (project: Project) => {
    setSelectedProject(project);
    setRestoreDialogOpen(true);
  };

  const handleRestoreConfirm = async () => {
    if (!selectedProject) return;

    try {
      setUpdatingProject(selectedProject.id);
      await api.patch(`/api/projects/${selectedProject.id}/restore/`);
      
      // Recargar proyectos
      await loadProjects();
      
      setRestoreDialogOpen(false);
      setSelectedProject(null);
    } catch (err: any) {
      console.error('Error restaurando proyecto:', err);
      setError(err.response?.data?.error || 'Error al restaurar proyecto');
    } finally {
      setUpdatingProject(null);
    }
  };

  const handleRestoreCancel = () => {
    setRestoreDialogOpen(false);
    setSelectedProject(null);
  };

  const handleEditClick = (project: Project) => {
    console.log('🔍 [Projects] Proyecto para editar:', project);
    console.log('🔍 [Projects] Campos disponibles:', Object.keys(project));
    console.log('🔍 [Projects] Valores específicos:');
    console.log('  - tipo:', project.tipo);
    console.log('  - objectives:', project.objectives);
    console.log('  - objetivo:', project.objetivo);
    console.log('  - encargado:', project.encargado);
    console.log('  - company_mentor:', project.company_mentor);
    console.log('  - contacto:', project.contacto);
    console.log('  - company_contact:', project.company_contact);
    console.log('  - start_date:', project.start_date);
    console.log('  - estimated_end_date:', project.estimated_end_date);
    
    setEditingProject(project);
    setEditTrlSelected(project.trl_level || 1);
    
    setEditFormData({
      title: project.title || '',
      description: project.description || '',
      area: project.area || '',
      tipo: project.tipo || project.objectives || '', // Intentar ambos campos
      objetivo: project.objetivo || project.objectives || '', // Intentar ambos campos
      trl: project.trl_level || 1,
      horas: project.required_hours || '',
      horasPorSemana: project.hours_per_week || 10,
      modalidad: project.modality === 'remote' ? 'Remoto' : 
                 project.modality === 'onsite' ? 'Presencial' : 
                 project.modality === 'hybrid' ? 'Híbrido' : '',
      encargado: project.encargado || project.company_mentor || '', // Intentar ambos campos
      contacto: project.contacto || project.company_contact || '', // Intentar ambos campos
      fechaInicio: project.start_date || '',
      fechaFin: project.estimated_end_date || '',
      requirements: project.requirements || '',
      duration: project.duration_weeks || '',
      studentsNeeded: 1,
      meses: project.duration_weeks || ''
    });
    
    console.log('🔍 [Projects] editFormData inicializado:', editFormData);
    setEditDialogOpen(true);
  };

  // Función auxiliar para traducir la modalidad del backend al español
  const translateModality = (modality: string) => {
    switch (modality) {
      case 'remote': return 'Remoto';
      case 'onsite': return 'Presencial';
      case 'hybrid': return 'Híbrido';
      default: return modality;
    }
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setEditingProject(null);
    setEditFormData({});
    setEditActiveStep(0);
    setEditTrlSelected(1);
    setEditHoursError(null);
  };

  const handleEditSave = async () => {
    if (!editingProject) return;
    
    try {
      setSavingProject(true);
      
      // Mapear los campos del formulario a los campos del backend
      // Ahora el backend puede actualizar todos estos campos
      const backendData = {
        title: editFormData.title || '',
        description: editFormData.description || '',
        requirements: editFormData.requirements || '',
        // Campos adicionales del formulario de creación
        tipo: editFormData.tipo || '',
        objetivo: editFormData.objetivo || '',
        encargado: editFormData.encargado || '',
        contacto: editFormData.contacto || '',
        // Campos de configuración
        required_hours: Number(editFormData.horas) || 0,
        hours_per_week: Number(editFormData.horasPorSemana) || 10,
        duration_weeks: Number(editFormData.meses) || 1,
        start_date: editFormData.fechaInicio || null,
        estimated_end_date: editFormData.fechaFin || null,
        modality: editFormData.modalidad === 'Remoto' ? 'remote' : 
                  editFormData.modalidad === 'Presencial' ? 'onsite' : 
                  editFormData.modalidad === 'Híbrido' ? 'hybrid' : 'remote', // Convertir del frontend al backend
        trl_id: Number(editFormData.trl) || 1, // El backend espera trl_id
        // Nota: area_id se maneja por separado si es necesario
        // Por ahora solo actualizamos el nombre del área
      };
      
      const response = await api.patch(`/api/projects/${editingProject.id}/update/`, backendData);
      
      console.log('Respuesta del backend (editar):', response);
      
      if (response && response.id) {
        // Actualizar el proyecto en la lista local
        // Convertir la modalidad de vuelta al formato del frontend para la visualización
        const updatedProject = {
          ...editingProject,
          ...backendData,
          modality: editFormData.modalidad === 'Remoto' ? 'remote' : 
                    editFormData.modalidad === 'Presencial' ? 'onsite' : 
                    editFormData.modalidad === 'Híbrido' ? 'hybrid' : 'remote'
        };
        
        setProjects(projects.map(p =>
          p.id === editingProject.id ? updatedProject : p
        ));
        
        // Cerrar el modal
        handleEditClose();
        
        // Mostrar mensaje de éxito
        setError(null);
      } else {
        setError('Respuesta inesperada del servidor al editar el proyecto');
      }
    } catch (error: any) {
      console.error('Error editando proyecto:', error);
      setError(error.response?.data?.error || 'Error al editar proyecto');
    } finally {
      setSavingProject(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setEditFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Lógica de cálculo automático para horas y duración
      if (field === 'horasPorSemana') {
        const horasPorSemana = Number(value);
        const horas = Number(newData.horas);
        if (horas > 0 && horasPorSemana > 0) {
          // Calcular duración en meses basada en horas totales y horas por semana
          const duracionMeses = Math.ceil(horas / (horasPorSemana * 4.33)); // 4.33 semanas por mes
          newData.meses = duracionMeses.toString();
        }
      } else if (field === 'horas') {
        const horas = Number(value);
        const horasPorSemana = Number(newData.horasPorSemana);
        if (horas > 0 && horasPorSemana > 0) {
          // Calcular duración en meses basada en horas totales y horas por semana
          const duracionMeses = Math.ceil(horas / (horasPorSemana * 4.33)); // 4.33 semanas por mes
          newData.meses = duracionMeses.toString();
        }
      } else if (field === 'fechaInicio') {
        // Si se cambia la fecha de inicio, recalcular la duración basada en horas y horas por semana
        const horas = Number(newData.horas);
        const horasPorSemana = Number(newData.horasPorSemana);
        if (horas > 0 && horasPorSemana > 0) {
          const duracionMeses = Math.ceil(horas / (horasPorSemana * 4.33));
          newData.meses = duracionMeses.toString();
        }
      }
      
      return newData;
    });
  };

  const handleEditTrlChange = (e: any) => {
    const value = Number(e.target.value) as keyof typeof TRL_HOURS_LIMITS;
    setEditTrlSelected(value);
    setEditFormData(prev => ({ ...prev, trl: value }));
    
    // Validar las horas actuales contra el nuevo mínimo y máximo
    const newLimits = TRL_HOURS_LIMITS[value];
    const currentHours = Number(editFormData.horas);
    
    if (currentHours > 0) {
      if (currentHours < newLimits.min) {
        setEditHoursError(`El mínimo para ${newLimits.description} es ${newLimits.min} horas.`);
      } else if (currentHours > newLimits.max) {
        setEditHoursError(`El máximo para ${newLimits.description} es ${newLimits.max} horas.`);
      } else {
        setEditHoursError(null);
      }
    }
  };

  const handleEditHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numValue = Number(value);
    
    // Obtener límites del TRL actual
    const trlKey = editTrlSelected as keyof typeof TRL_HOURS_LIMITS;
    const trlLimits = TRL_HOURS_LIMITS[trlKey];
    const minHours = trlLimits.min;
    const maxHours = trlLimits.max;
    
    // Validar y corregir el valor si es necesario
    let finalValue = value;
    if (numValue > maxHours) {
      finalValue = maxHours.toString();
    }
    
    setEditFormData(prev => ({ ...prev, horas: finalValue }));
    
    // Validar y mostrar errores apropiados
    if (numValue < minHours) {
      setEditHoursError(`El mínimo para ${trlLimits.description} es ${minHours} horas.`);
    } else if (numValue > maxHours) {
      setEditHoursError(`El máximo para ${trlLimits.description} es ${maxHours} horas.`);
    } else {
      setEditHoursError(null);
    }
  };

  const nextEditStep = () => {
    setEditActiveStep((s) => Math.min(s + 1, editSteps.length - 1));
  };
  
  const prevEditStep = () => {
    setEditActiveStep((s) => Math.max(s - 1, 0));
  };

  const handleViewClick = async (project: Project) => {
    setSelectedProject(project);
    setViewDialogOpen(true);
    setLoadingDetails(true);
    try {
      const response = await api.get(`/api/projects/${project.id}/`);
      console.log('🔍 [Projects] Detalles del proyecto recibidos:', response);
      console.log('🔍 [Projects] Estructura de detalles:');
      console.log(`  - title: ${response.title}`);
      console.log(`  - status: ${response.status}`);
      console.log(`  - estudiantes length: ${response.estudiantes?.length || 0}`);
      console.log(`  - estudiantes:`, response.estudiantes);
      setProjectDetails(response.data || response);
    } catch (e) {
      console.error('🔍 [Projects] Error obteniendo detalles:', e);
      setProjectDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleViewClose = () => {
    setViewDialogOpen(false);
    setSelectedProject(null);
    setProjectDetails(null);
  };

  if (loading) {
        return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
          </Box>
        );
  }

  if (error) {
        return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button onClick={loadProjects} variant="contained">
          Reintentar
        </Button>
          </Box>
        );
    }

  const renderDashboard = () => (
    <Grid container spacing={3} sx={{ mb: 4, justifyContent: 'center', alignItems: 'stretch' }}>
      <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
        <Card sx={{ 
          bgcolor: '#ff9800', 
          color: 'white', 
          p: 3, 
          boxShadow: themeMode === 'dark' ? '0 8px 32px rgba(255, 152, 0, 0.4)' : 2, 
          borderRadius: 4, 
          textAlign: 'center', 
          minWidth: 240, 
          maxWidth: 320, 
          width: '100%' 
        }}>
          <Typography variant="h4" fontWeight={700} sx={{ color: 'white' }}>{statusCounts.published}</Typography>
          <Typography variant="subtitle1" sx={{ color: 'white' }}>Proyectos Publicados</Typography>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
        <Card sx={{ 
          bgcolor: '#4caf50', 
          color: 'white', 
          p: 3, 
          boxShadow: themeMode === 'dark' ? '0 8px 32px rgba(76, 175, 80, 0.4)' : 2, 
          borderRadius: 4, 
          textAlign: 'center', 
          minWidth: 240, 
          maxWidth: 320, 
          width: '100%' 
        }}>
          <Typography variant="h4" fontWeight={700} sx={{ color: 'white' }}>{statusCounts.active}</Typography>
          <Typography variant="subtitle1" sx={{ color: 'white' }}>Proyectos Activos</Typography>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
        <Card sx={{ 
          bgcolor: '#2196f3', 
          color: 'white', 
          p: 3, 
          boxShadow: themeMode === 'dark' ? '0 8px 32px rgba(33, 150, 243, 0.4)' : 2, 
          borderRadius: 4, 
          textAlign: 'center', 
          minWidth: 240, 
          maxWidth: 320, 
          width: '100%' 
        }}>
          <Typography variant="h4" fontWeight={700} sx={{ color: 'white' }}>{statusCounts.completed}</Typography>
          <Typography variant="subtitle1" sx={{ color: 'white' }}>Proyectos Completados</Typography>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
        <Card sx={{ 
          bgcolor: '#f44336', 
          color: 'white', 
          p: 3, 
          boxShadow: themeMode === 'dark' ? '0 8px 32px rgba(244, 67, 54, 0.4)' : 2, 
          borderRadius: 4, 
          textAlign: 'center', 
          minWidth: 240, 
          maxWidth: 320, 
          width: '100%' 
        }}>
          <Typography variant="h4" fontWeight={700} sx={{ color: 'white' }}>{statusCounts.deleted}</Typography>
          <Typography variant="subtitle1" sx={{ color: 'white' }}>Proyectos Eliminados</Typography>
        </Card>
      </Grid>
    </Grid>
  );

  const renderSection = (status: string, icon: React.ReactNode, title: string) => {
    const filtered = projects.filter(p => {
      // Verificar que el proyecto tenga las propiedades básicas necesarias
      if (!p || !p.id || !p.title) return false;
      
      return p.status === status;
    });
    const count = sectionCounts[status as keyof typeof sectionCounts];
    const toShow = count === -1 ? filtered : filtered.slice(0, count);
    
    return (
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon}
          <Typography variant="h6" fontWeight={700} color="primary" sx={{ ml: 1, color: themeMode === 'dark' ? '#60a5fa' : 'primary.main' }}>
            {title} ({filtered.length})
          </Typography>
          <Box sx={{ ml: 2 }}>
            <FormControl size="medium" sx={{ minWidth: 140 }}>
              <Select
                value={count}
                onChange={handleSectionCountChange(status)}
                sx={{ 
                  minWidth: 140, 
                  fontSize: 16,
                  bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
                  color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6'
                  }
                }}
                displayEmpty
                renderValue={selected => selected === -1 ? 'Todas' : `Últimos ${selected}`}
              >
                {COUNT_OPTIONS.map(opt => (
                  <MenuItem key={opt} value={opt}>{opt === -1 ? 'Todas' : `Últimos ${opt}`}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {toShow.length === 0 && (
            <Paper sx={{ 
              p: 4, 
              textAlign: 'center',
              bgcolor: themeMode === 'dark' ? '#1e293b' : '#f8f9fa',
              borderRadius: 3,
              border: themeMode === 'dark' ? '1px solid #475569' : '1px solid #e2e8f0'
            }}>
              <Typography color="text.secondary" variant="h6" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                No hay proyectos {title.toLowerCase()}.
              </Typography>
            </Paper>
          )}
          {toShow.map((project) => {
            // Verificar que el proyecto tenga las propiedades necesarias
            if (!project || !project.id || !project.title) {
              return null;
            }
            
            return (
            <Card key={project.id} sx={{ 
              display: 'flex', 
              flexDirection: 'row', 
              alignItems: 'center', 
              p: 3, 
              boxShadow: themeMode === 'dark' ? '0 4px 20px rgba(0,0,0,0.3)' : 3, 
              borderRadius: 3,
              bgcolor: themeMode === 'dark' ? '#1e293b' : 'white',
              border: themeMode === 'dark' ? '1px solid #475569' : '1px solid #e0e0e0',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: themeMode === 'dark' ? '0 8px 32px rgba(0,0,0,0.4)' : 6,
                transform: 'translateY(-2px)',
                borderColor: themeMode === 'dark' ? '#60a5fa' : 'primary.main'
              }
            }}>
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mr: 1, color: themeMode === 'dark' ? '#60a5fa' : 'primary.main' }}>
                    {project.title}
                  </Typography>
                  <StatusBadge status={project.status} />
                </Box>
                {project.area && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip 
                      label={project.area} 
                      size="small" 
                      color="secondary"
                      variant="outlined"
                      sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                    />
                  </Box>
                )}
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                  {project.description && project.description.length > 120 ? project.description.slice(0, 120) + '...' : project.description || 'Sin descripción'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, color: themeMode === 'dark' ? '#94a3b8' : 'text.secondary' }}>
                    {project.duration_weeks ? `${project.duration_weeks} meses • ` : ''} {project.hours_per_week || 0} horas/semana
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, color: themeMode === 'dark' ? '#94a3b8' : 'text.secondary', display: 'block', mt: 0.5 }}>
                    Horas totales: {project.required_hours || ((project.duration_weeks || 0) * (project.hours_per_week || 0))} horas
                  </Typography>
                  <Chip 
                    label={`${project.current_students || 0}/${project.max_students || 1} estudiantes`} 
                    size="small" 
                    color={project.current_students > 0 ? "success" : "warning"}
                    sx={{ 
                      fontWeight: 600,
                      transition: 'all 0.2s ease-in-out'
                    }}
                  />
                  {project.estudiantes && project.estudiantes.length > 0 && (
                    <Chip 
                      label={`${project.estudiantes.length} postulaciones de estudiantes`} 
                      size="small" 
                      color="info"
                      variant="outlined"
                      sx={{ fontWeight: 500 }}
                    />
                  )}
                </Box>
              </Box>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'flex-end', 
                gap: 1, 
                minWidth: 120, 
                ml: 2 
              }}>
                {project.status === 'published' && tab !== 1 && (
                  <IconButton 
                    color={project.current_students > 0 ? "success" : "warning"}
                    size="small" 
                    onClick={() => handleActivateClick(project)}
                    disabled={updatingProject === project.id}
                    sx={{ 
                      bgcolor: project.current_students > 0 ? 'success.light' : 'warning.light',
                      color: project.current_students > 0 ? 'success.contrastText' : 'warning.contrastText',
                      '&:hover': { 
                        bgcolor: project.current_students > 0 ? 'success.main' : 'warning.main' 
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                    title={project.current_students > 0 ? 
                      "Activar proyecto - Los estudiantes podrán comenzar a trabajar" : 
                      "No se puede activar - Debes tener al menos un estudiante aceptado"
                    }
                  >
                    {updatingProject === project.id ? <CircularProgress size={16} /> : <PlayArrowIcon />}
                  </IconButton>
                )}
                {project.status === 'active' && tab !== 1 && (
                  <IconButton 
                    color="success" 
                    size="small" 
                    onClick={() => handleCompleteClick(project)}
                    disabled={updatingProject === project.id}
                    sx={{ 
                      bgcolor: 'success.light',
                      color: 'success.contrastText',
                      '&:hover': { bgcolor: 'success.main' }
                    }}
                  >
                    {updatingProject === project.id ? <CircularProgress size={16} /> : <TaskAltIcon />}
                  </IconButton>
                )}
                <IconButton 
                  color="primary" 
                  size="small" 
                  onClick={() => handleViewClick(project)}
                  sx={{ 
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText',
                    '&:hover': { bgcolor: 'primary.main' }
                  }}
                >
                  <VisibilityIcon />
                </IconButton>
                {project.status === 'published' && (
                  <IconButton 
                    color="warning" 
                    size="small" 
                    onClick={() => handleEditClick(project)}
                    sx={{ 
                      bgcolor: 'warning.light',
                      color: 'warning.contrastText',
                      '&:hover': { bgcolor: 'warning.main' }
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                )}
                {project.status === 'deleted' && (
                  <IconButton 
                    color="success" 
                    size="small" 
                    onClick={() => handleRestoreClick(project)}
                    disabled={updatingProject === project.id}
                    sx={{ 
                      bgcolor: 'success.light',
                      color: 'success.contrastText',
                      '&:hover': { bgcolor: 'success.main' }
                    }}
                  >
                    {updatingProject === project.id ? <CircularProgress size={16} /> : <RestoreIcon />}
                  </IconButton>
                )}
                {project.status === 'published' && tab !== 1 && (
                  <IconButton 
                    color="error" 
                    size="small" 
                    onClick={() => handleDeleteClick(project)}
                    disabled={updatingProject === project.id}
                    sx={{ 
                      bgcolor: 'error.light',
                      color: 'error.contrastText',
                      '&:hover': { bgcolor: 'error.main' }
                    }}
                  >
                    {updatingProject === project.id ? <CircularProgress size={16} /> : <DeleteIcon />}
                  </IconButton>
                )}
              </Box>
            </Card>
            );
          })}
          </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ 
      width: '100%', 
      p: { xs: 1, md: 3 }, 
      bgcolor: themeMode === 'dark' ? '#0f172a' : '#f7fafd', 
      minHeight: '100vh',
      color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
    }}>
      {/* Banner superior con gradiente y contexto */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '20px',
          p: 4,
          mb: 4,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: themeMode === 'dark' ? '0 8px 32px rgba(102, 126, 234, 0.4)' : '0 8px 32px rgba(102, 126, 234, 0.3)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            animation: 'float 6s ease-in-out infinite',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-30%',
            right: '-30%',
            width: '60%',
            height: '60%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
            animation: 'float 8s ease-in-out infinite reverse',
          },
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
            '50%': { transform: 'translateY(-20px) rotate(180deg)' },
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              <TaskAltIcon sx={{ fontSize: 32, color: 'white' }} />
            </Box>
            <Box>
              <Typography
                variant="h3"
                sx={{
                  color: 'white',
                  fontWeight: 'bold',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  mb: 1,
                }}
              >
                Gestión de Proyectos
              </Typography>
                             <Typography
                 variant="h6"
                 sx={{
                   color: 'rgba(255, 255, 255, 0.9)',
                   fontWeight: 300,
                   textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                 }}
               >
                 {tab === 0 && "Administra y supervisa todos tus proyectos de la plataforma"}
                 {tab === 1 && "Gestiona y restaura proyectos que han sido eliminados anteriormente"}
                 {tab === 2 && "Crea y publica nuevos proyectos para atraer talento universitario"}
               </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      <Tabs 
        value={tab} 
        onChange={handleTabChange} 
        sx={{ 
          mb: 4,
          '& .MuiTab-root': {
            fontSize: '1rem',
            fontWeight: 600,
            textTransform: 'none',
            minHeight: 48,
            color: themeMode === 'dark' ? '#cbd5e1' : 'inherit'
          },
          '& .MuiTabs-indicator': {
            backgroundColor: themeMode === 'dark' ? '#60a5fa' : 'primary.main'
          }
        }}
      >
        <Tab label="Mis Proyectos" />
        <Tab label="Proyectos Eliminados" />
        <Tab label="Crear Proyecto" icon={<AddIcon />} iconPosition="start" />
      </Tabs>
      
      {tab === 0 && (
        <Box>
          {renderDashboard()}
          {renderSection('published', <PublishIcon color="info" />, 'Proyectos Publicados')}
          {renderSection('active', <PlayArrowIcon color="primary" />, 'Proyectos Activos')}
          {renderSection('completed', <CheckCircleIcon color="success" />, 'Proyectos Completados')}
        </Box>
      )}
      
      {tab === 1 && (
        <Box>
          <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 3, color: themeMode === 'dark' ? '#f1f5f9' : 'inherit' }}>
            Proyectos Eliminados
          </Typography>
          {renderSection('deleted', <DeleteIcon color="error" />, 'Proyectos Eliminados')}
        </Box>
      )}
      
      {tab === 2 && (
        <PublishProjects />
      )}

      {/* Diálogo de eliminar mejorado */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle sx={{ 
          bgcolor: 'error.main', 
          color: 'white',
          fontWeight: 600
        }}>
          ¿Eliminar proyecto?
        </DialogTitle>
        <DialogContent sx={{ p: 3, bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff' }}>
          <Typography variant="body1" gutterBottom sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit' }}>
            ¿Seguro que deseas eliminar el proyecto <strong>"{selectedProject?.title}"</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#94a3b8' : 'text.secondary' }}>
            Esta acción no se puede deshacer y se perderán todos los datos asociados al proyecto.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: themeMode === 'dark' ? '#334155' : '#f5f5f5' }}>
          <Button 
            onClick={handleDeleteCancel}
            variant="outlined"
            sx={{ borderRadius: 2, px: 3 }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error"
            variant="contained"
            sx={{ borderRadius: 2, px: 3 }}
          >
            {updatingProject === selectedProject?.id ? <CircularProgress size={20} /> : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de activar proyecto */}
      <Dialog open={activateDialogOpen} onClose={handleActivateCancel}>
        <DialogTitle sx={{ 
          bgcolor: selectedProject && selectedProject.current_students > 0 ? 'success.main' : 'warning.main', 
          color: 'white',
          fontWeight: 600
        }}>
          {selectedProject && selectedProject.current_students > 0 ? '¿Activar proyecto?' : 'No se puede activar'}
        </DialogTitle>
        <DialogContent sx={{ p: 3, bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff' }}>
          {selectedProject && selectedProject.current_students > 0 ? (
            <>
              <Typography variant="body1" gutterBottom sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit' }}>
                ¿Estás seguro de que deseas activar el proyecto <strong>"{selectedProject?.title}"</strong>?
              </Typography>
              
              <Alert severity="info" sx={{ mb: 2 }}>
                ✅ <strong>Proyecto listo para activar:</strong> Tienes {selectedProject.current_students} estudiante(s) aceptado(s).
              </Alert>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, color: themeMode === 'dark' ? '#94a3b8' : 'text.secondary' }}>
                <strong>Al activar el proyecto:</strong><br/>
                - El proyecto cambiará a estado "Activo".<br/>
                - Los estudiantes aceptados pasarán a "Proyectos Activos" y podrán comenzar a trabajar.<br/>
                - Los estudiantes recibirán una notificación de que el proyecto está en curso.<br/>
                - Ya no podrás modificar los estudiantes asignados a este proyecto.<br/>
                - El avance y las entregas de los estudiantes comenzarán a registrarse desde este momento.<br/>
                - Debes haber realizado al menos una reunión de inicio con los estudiantes.<br/>
                - El proyecto debe estar completamente preparado para comenzar.<br/>
              </Typography>
              
              <Alert severity="warning" sx={{ mb: 2 }}>
                ⚠️ <strong>Importante:</strong> Esta acción no se puede deshacer. Una vez activado, el proyecto estará en curso.
              </Alert>
            </>
          ) : (
            <>
              <Typography variant="body1" gutterBottom sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit' }}>
                El proyecto <strong>"{selectedProject?.title}"</strong> no se puede activar en este momento.
              </Typography>
              
              <Alert severity="warning" sx={{ mb: 2 }}>
                ⚠️ <strong>No se puede activar:</strong> Este proyecto no tiene estudiantes aceptados.
              </Alert>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, color: themeMode === 'dark' ? '#94a3b8' : 'text.secondary' }}>
                <strong>Para poder activar el proyecto necesitas:</strong><br/>
                - Tener al menos un estudiante aceptado en el proyecto.<br/>
                - Revisar las aplicaciones pendientes y aceptar a un estudiante.<br/>
                - Asegurarte de que el estudiante esté disponible para comenzar.<br/>
                - Tener todo preparado para el inicio del proyecto.<br/>
              </Typography>
              
              <Alert severity="info" sx={{ mb: 2 }}>
                💡 <strong>Sugerencia:</strong> Ve a la pestaña "Aplicaciones" para revisar y aceptar estudiantes.
              </Alert>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: themeMode === 'dark' ? '#334155' : '#f5f5f5' }}>
          <Button 
            onClick={handleActivateCancel}
            variant="outlined"
            sx={{ borderRadius: 2, px: 3 }}
          >
            Cancelar
          </Button>
          {selectedProject && selectedProject.current_students > 0 ? (
            <Button 
              onClick={handleActivateConfirm} 
              color="success" 
              variant="contained"
              sx={{ borderRadius: 2, px: 3 }}
              disabled={updatingProject === selectedProject?.id}
            >
              {updatingProject === selectedProject?.id ? <CircularProgress size={20} /> : 'Activar Proyecto'}
            </Button>
          ) : (
            <Button 
              onClick={handleActivateCancel} 
              color="warning" 
              variant="contained"
              sx={{ borderRadius: 2, px: 3 }}
            >
              Entendido
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Diálogo de completar proyecto mejorado */}
      <Dialog open={completeDialogOpen} onClose={handleCompleteCancel}>
        <DialogTitle sx={{ 
          bgcolor: 'success.main', 
          color: 'white',
          fontWeight: 600
        }}>
          ¿Marcar proyecto como completado?
        </DialogTitle>
        <DialogContent sx={{ p: 3, bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff' }}>
          <Typography variant="body1" gutterBottom sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit' }}>
            ¿Seguro que deseas marcar el proyecto <strong>"{selectedProject?.title}"</strong> como completado?
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ color: themeMode === 'dark' ? '#94a3b8' : 'text.secondary' }}>
            <b>Una vez que completes el proyecto:</b><br/>
            - El soporte del sistema validará y asignará las horas correspondientes de proyecto a los integrantes.<br/>
            - Si algún estudiante no completó los trabajos asignados, el soporte podrá asignarle un strike como penalización.<br/>
            - Esta acción es irreversible y no se podrá modificar ni corregir posteriormente.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: themeMode === 'dark' ? '#334155' : '#f5f5f5' }}>
          <Button 
            onClick={handleCompleteCancel}
            variant="outlined"
            sx={{ borderRadius: 2, px: 3 }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleCompleteConfirm} 
            color="success" 
            variant="contained"
            sx={{ borderRadius: 2, px: 3 }}
            disabled={updatingProject === selectedProject?.id}
          >
            {updatingProject === selectedProject?.id ? <CircularProgress size={20} /> : 'Marcar como Completado'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de ver proyecto mejorado */}
      <Dialog open={viewDialogOpen} onClose={handleViewClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ 
          bgcolor: 'primary.main', 
          color: 'white',
          fontWeight: 600
        }}>
          Detalles del Proyecto
        </DialogTitle>
        <DialogContent sx={{ p: 3, bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff' }}>
          {selectedProject && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box>
                <Typography variant="h5" fontWeight={700} color="primary" gutterBottom sx={{ color: themeMode === 'dark' ? '#60a5fa' : 'primary.main' }}>
                  {projectDetails?.title || selectedProject.title}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  <Chip label={getStatusLabel(projectDetails?.status || selectedProject.status)} color={getStatusColor(projectDetails?.status || selectedProject.status) as any} size="medium" />
                  <Chip label={`${projectDetails?.current_students || selectedProject.current_students}/${projectDetails?.max_students || selectedProject.max_students} estudiantes`} size="medium" color="success" />
                  {(projectDetails?.is_paid || selectedProject.is_paid) && (
                    <Chip label="Remunerado" size="medium" color="warning" />
                  )}
                  {(projectDetails?.is_featured || selectedProject.is_featured) && (
                    <Chip label="Destacado" size="medium" color="secondary" />
                  )}
                </Box>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit' }}>
                    Descripción
                  </Typography>
                  <Typography variant="body1" sx={{ bgcolor: themeMode === 'dark' ? '#334155' : '#f8f9fa', p: 2, borderRadius: 2, color: themeMode === 'dark' ? '#cbd5e1' : 'inherit' }}>
                    {projectDetails?.description || selectedProject.description || 'Sin descripción'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit' }}>
                    Requerimientos
                  </Typography>
                  <Typography variant="body1" sx={{ bgcolor: themeMode === 'dark' ? '#334155' : '#f8f9fa', p: 2, borderRadius: 2, color: themeMode === 'dark' ? '#cbd5e1' : 'inherit' }}>
                    {projectDetails?.requirements || selectedProject.requirements || 'Sin requisitos especificados'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit' }}>
                    Tipo de Actividad
                  </Typography>
                  <Typography variant="body1" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'inherit' }}>
                    {projectDetails?.tipo || selectedProject.tipo || 'No especificado'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit' }}>
                    Objetivo del Proyecto
                  </Typography>
                  <Typography variant="body1" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'inherit' }}>
                    {projectDetails?.objetivo || selectedProject.objetivo || 'No especificado'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit' }}>
                    Duración
                  </Typography>
                  <Typography variant="body1" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'inherit' }}>
                    {(projectDetails?.duration_weeks || selectedProject.duration_weeks) || 0} meses • {(projectDetails?.hours_per_week || selectedProject.hours_per_week) || 0} horas/semana
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#94a3b8' : 'text.secondary' }}>
                    Horas totales del proyecto: <b>{projectDetails?.required_hours || selectedProject.required_hours || ((projectDetails?.duration_weeks || selectedProject.duration_weeks) || 0) * ((projectDetails?.hours_per_week || selectedProject.hours_per_week) || 0)}</b>
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit' }}>
                    Modalidad
                  </Typography>
                  <Typography variant="body1" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'inherit' }}>
                    {translateModality(projectDetails?.modality || selectedProject.modality) || 'No especificada'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit' }}>
                    Responsable del Proyecto
                  </Typography>
                  <Typography variant="body1" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'inherit' }}>
                    {projectDetails?.encargado || selectedProject.encargado || 'No especificado'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit' }}>
                    Contacto de la Empresa
                  </Typography>
                  <Typography variant="body1" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'inherit' }}>
                    {projectDetails?.contacto || selectedProject.contacto || 'No especificado'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit' }}>
                    Estado del Proyecto
                  </Typography>
                  <Typography variant="body1" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'inherit' }}>
                    {getTrlDescription(projectDetails?.trl_id || selectedProject.trl_id)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit' }}>
                    Horas Ofrecidas
                  </Typography>
                  <Typography variant="body1" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'inherit' }}>
                    {projectDetails?.required_hours || selectedProject.required_hours} horas
                  </Typography>
                </Grid>
                
 

                
                {(projectDetails?.start_date || selectedProject.start_date) && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit' }}>
                      Fecha de Inicio
                    </Typography>
                    <Typography variant="body1" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'inherit' }}>
                      {new Date(projectDetails?.start_date || selectedProject.start_date).toLocaleDateString()}
                    </Typography>
                  </Grid>
                )}
                
                {(projectDetails?.estimated_end_date || selectedProject.estimated_end_date) && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit' }}>
                      Fecha Estimada de Fin
                    </Typography>
                    <Typography variant="body1" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'inherit' }}>
                      {new Date(projectDetails?.estimated_end_date || selectedProject.estimated_end_date).toLocaleDateString()}
                    </Typography>
                  </Grid>
                )}
              </Grid>
              {projectDetails && projectDetails.estudiantes && (
                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit' }}>
                    Postulaciones de estudiantes ({projectDetails.estudiantes.length})
                  </Typography>
                  {projectDetails.estudiantes.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#94a3b8' : 'text.secondary' }}>
                      No hay estudiantes asignados a este proyecto.
                    </Typography>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {projectDetails.estudiantes.map((est: any) => (
                        <Box key={est.id} sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          p: 2, 
                          bgcolor: themeMode === 'dark' ? '#334155' : '#f8f9fa', 
                          borderRadius: 2,
                          border: themeMode === 'dark' ? '1px solid #475569' : '1px solid #e0e0e0'
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Chip 
                              label={est.nombre} 
                              color={est.status === 'active' ? 'success' : est.status === 'completed' ? 'secondary' : 'primary'} 
                              size="medium"
                            />
                            <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                              {est.email}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip 
                              label={est.status === 'accepted' ? 'Aceptado' : 
                                     est.status === 'active' ? 'Activo' : 
                                     est.status === 'completed' ? 'Completado' : est.status} 
                              color={est.status === 'active' ? 'success' : 
                                     est.status === 'completed' ? 'secondary' : 'primary'} 
                              size="small"
                              variant="outlined"
                            />
                            {est.applied_at && (
                              <Typography variant="caption" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#94a3b8' : 'text.secondary' }}>
                                Aplicó: {new Date(est.applied_at).toLocaleDateString()}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Grid>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: themeMode === 'dark' ? '#334155' : '#f5f5f5' }}>
          <Button 
            onClick={handleViewClose}
            variant="contained"
            sx={{ borderRadius: 2, px: 3 }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de restaurar proyecto */}
      <Dialog open={restoreDialogOpen} onClose={handleRestoreCancel} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ 
          bgcolor: 'success.main', 
          color: 'white',
          fontWeight: 600
        }}>
          Restaurar Proyecto
        </DialogTitle>
        <DialogContent sx={{ p: 3, bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff' }}>
          <Typography variant="body1" gutterBottom sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit' }}>
            ¿Estás seguro de que quieres restaurar el proyecto "{selectedProject?.title}"?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#94a3b8' : 'text.secondary' }}>
            El proyecto volverá a estar publicado y será visible para los estudiantes.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: themeMode === 'dark' ? '#334155' : '#f5f5f5' }}>
          <Button 
            onClick={handleRestoreCancel}
            variant="outlined"
            sx={{ borderRadius: 2, px: 3 }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleRestoreConfirm}
            variant="contained"
            color="success"
            sx={{ borderRadius: 2, px: 3 }}
            disabled={updatingProject === selectedProject?.id}
          >
            {updatingProject === selectedProject?.id ? <CircularProgress size={20} /> : 'Restaurar Proyecto'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de editar proyecto */}
      <Dialog open={editDialogOpen} onClose={handleEditClose} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ 
          bgcolor: 'warning.main', 
          color: 'white',
          fontWeight: 600
        }}>
          Editar Proyecto
        </DialogTitle>
        <DialogContent sx={{ p: 3, bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff' }}>
          {editingProject && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Alert severity="warning" sx={{ mb: 2 }}>
                ⚠️ <strong>Advertencia:</strong> Estás editando un proyecto publicado. 
                Los cambios se reflejarán inmediatamente en la base de datos.
              </Alert>

              {/* Stepper */}
              <Box sx={{ mb: 3 }}>
                <Stepper activeStep={editActiveStep} sx={{ 
                  '& .MuiStepLabel-root .Mui-completed': {
                    color: 'success.main',
                  },
                  '& .MuiStepLabel-root .Mui-active': {
                    color: 'warning.main',
                  }
                }}>
                  {editSteps.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>

              {/* Etapa 0: Información Básica */}
              {editActiveStep === 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Typography variant="h6" fontWeight={600} color="primary">
                    Información Básica del Proyecto
                  </Typography>
                  
                  <TextField
                    fullWidth
                    label="Título del Proyecto"
                    value={editFormData.title || ''}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    variant="outlined"
                    required
                    helperText="Nombre descriptivo del proyecto"
                  />
                  
                  <TextField
                    fullWidth
                    label="Descripción"
                    value={editFormData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    variant="outlined"
                    multiline
                    rows={4}
                    required
                    helperText="Descripción detallada del proyecto"
                  />
                  
                  <TextField
                    fullWidth
                    label="Tipo de Actividad"
                    value={editFormData.tipo || ''}
                    onChange={(e) => handleInputChange('tipo', e.target.value)}
                    variant="outlined"
                    required
                    helperText="Tipo de actividad que se realizará"
                  />
                  
                  <FormControl fullWidth required>
                    <InputLabel>Área del Proyecto</InputLabel>
                    <Select
                      value={editFormData.area || ''}
                      onChange={(e) => handleInputChange('area', e.target.value)}
                      variant="outlined"
                    >
                      {AREAS_ESTATICAS.map((area) => (
                        <MenuItem key={area.id} value={area.name}>
                          {area.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <TextField
                    fullWidth
                    label="Objetivo del Proyecto"
                    value={editFormData.objetivo || ''}
                    onChange={(e) => handleInputChange('objetivo', e.target.value)}
                    variant="outlined"
                    multiline
                    rows={3}
                    required
                    helperText="Objetivo principal que se busca alcanzar"
                  />
                  
                  <TextField
                    fullWidth
                    label="Requisitos (Opcional)"
                    value={editFormData.requirements || ''}
                    onChange={(e) => handleInputChange('requirements', e.target.value)}
                    variant="outlined"
                    multiline
                    rows={3}
                    helperText="Requisitos que deben cumplir los estudiantes"
                  />
                </Box>
              )}

              {/* Etapa 1: Etapa y Duración */}
              {editActiveStep === 1 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Typography variant="h6" fontWeight={600} color="primary">
                    Etapa de Desarrollo y Duración
                  </Typography>
                  
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    ¿En qué etapa de desarrollo se encuentra tu proyecto?
                  </Typography>
                  
                  <RadioGroup value={editTrlSelected} onChange={handleEditTrlChange}>
                    {TRL_QUESTIONS.map((q, idx) => {
                      const trlKey = (idx + 1) as keyof typeof TRL_HOURS_LIMITS;
                      const trlLimits = TRL_HOURS_LIMITS[trlKey];
                      return (
                        <Box
                          key={idx + 1}
                          sx={{
                            borderRadius: 2,
                            transition: 'background 0.2s',
                            '&:hover': {
                              background: themeMode === 'dark' ? '#475569' : '#f3f4f6',
                            },
                            mb: 1,
                            p: 1,
                          }}
                        >
                          <FormControlLabel
                            value={idx + 1}
                            control={<Radio />}
                            label={
                              <span>
                                <b>Opción {idx + 1}:</b> {q}
                                <br />
                                <Typography variant="caption" color="text.secondary">
                                  {trlLimits.description}: {trlLimits.min}-{trlLimits.max} horas
                                </Typography>
                              </span>
                            }
                          />
                        </Box>
                      );
                    })}
                  </RadioGroup>
                  
                  <TextField
                    label="Horas ofrecidas"
                    name="horas"
                    type="number"
                    value={editFormData.horas || ''}
                    onChange={handleEditHoursChange}
                    fullWidth
                    required
                    error={!!editHoursError}
                    helperText={editHoursError || `${TRL_HOURS_LIMITS[editTrlSelected as keyof typeof TRL_HOURS_LIMITS].description}: ${TRL_HOURS_LIMITS[editTrlSelected as keyof typeof TRL_HOURS_LIMITS].min}-${TRL_HOURS_LIMITS[editTrlSelected as keyof typeof TRL_HOURS_LIMITS].max} horas`}
                    inputProps={{ 
                      min: TRL_HOURS_LIMITS[editTrlSelected as keyof typeof TRL_HOURS_LIMITS].min, 
                      max: TRL_HOURS_LIMITS[editTrlSelected as keyof typeof TRL_HOURS_LIMITS].max 
                    }}
                  />
                </Box>
              )}

              {/* Etapa 2: General */}
              {editActiveStep === 2 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Typography variant="h6" fontWeight={600} color="primary">
                    Información General del Proyecto
                  </Typography>
                  
                  <FormControl fullWidth required>
                    <InputLabel>Modalidad</InputLabel>
                    <Select
                      name="modalidad"
                      value={editFormData.modalidad || ''}
                      label="Modalidad"
                      onChange={(e) => handleInputChange('modalidad', e.target.value)}
                      displayEmpty
                    >
                      <MenuItem value=""><em>Selecciona la modalidad</em></MenuItem>
                      <MenuItem value="Remoto">
                        <Box>
                          <Typography variant="body1">Remoto</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Comunicación solo a través de correos
                          </Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="Presencial">
                        <Box>
                          <Typography variant="body1">Presencial</Typography>
                          <Typography variant="caption" color="text.secondary">
                            En sede, seleccionarás el fablab y cowork. Te reunirás con el estudiante en sede para entrevistas o presentaciones de avance
                          </Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="Híbrido">
                        <Box>
                          <Typography variant="body1">Híbrido</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Se puede hacer todo por correo, pero algunas veces se juntarán en la sede
                          </Typography>
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                  
                  <TextField 
                    label="Responsable del proyecto de la empresa" 
                    name="encargado" 
                    value={editFormData.encargado || ''} 
                    onChange={(e) => handleInputChange('encargado', e.target.value)} 
                    fullWidth 
                    required 
                    placeholder="Ejemplo: Juan Pérez - Gerente de Desarrollo"
                    helperText="Nombre y cargo de la persona responsable del proyecto"
                  />
                  
                  <TextField 
                    label="Contacto de la Empresa" 
                    name="contacto" 
                    value={editFormData.contacto || ''} 
                    onChange={(e) => handleInputChange('contacto', e.target.value)} 
                    fullWidth 
                    required 
                    placeholder="Ejemplo: +56912345678 o contacto@empresa.cl"
                    helperText="Teléfono o correo electrónico para contacto directo"
                  />
                  
                  <TextField 
                    label="¿Cuándo te gustaría comenzar el proyecto?" 
                    name="fechaInicio" 
                    type="date" 
                    value={editFormData.fechaInicio || ''} 
                    onChange={(e) => handleInputChange('fechaInicio', e.target.value)} 
                    fullWidth 
                    required 
                    inputProps={{ 
                      min: new Date().toISOString().split('T')[0]
                    }}
                    InputLabelProps={{ shrink: true, required: false }}
                  />
                  
                  <TextField 
                    label="Horas por semana que se dedicarán al proyecto" 
                    name="horasPorSemana" 
                    type="number" 
                    value={editFormData.horasPorSemana || ''} 
                    onChange={(e) => handleInputChange('horasPorSemana', e.target.value)}
                    fullWidth 
                    required 
                    inputProps={{ min: 5, max: 35 }}
                    helperText="Define cuántas horas por semana se dedicarán al proyecto. Mínimo 5, máximo 35 horas/semana."
                  />
                  
                  <TextField 
                    label="Fecha estimada de finalización" 
                    name="fechaFin" 
                    type="date" 
                    value={editFormData.fechaFin || ''} 
                    fullWidth 
                    disabled
                    helperText="Fecha estimada de finalización del proyecto (no editable)"
                    InputLabelProps={{ shrink: true, required: false }} 
                  />
                  
                  <TextField 
                    label="Duración calculada (meses)" 
                    name="meses" 
                    value={editFormData.meses || ''} 
                    fullWidth 
                    disabled
                    sx={{
                      '& .MuiInputBase-input.Mui-disabled': {
                        color: 'text.secondary',
                        WebkitTextFillColor: 'text.secondary'
                      }
                    }}
                    helperText="Duración del proyecto en meses (se calcula automáticamente)"
                  />
                  

                  
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: 'background.paper', 
                    borderRadius: 1, 
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: 1
                  }}>
                    <Typography variant="body2" color="text.primary">
                      <strong>💡 Importante:</strong> Por proyecto solo puedes aceptar a un estudiante
                    </Typography>
                  </Box>
                  
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: 'info.light', 
                    borderRadius: 1, 
                    border: '1px solid',
                    borderColor: 'info.main',
                    boxShadow: 1
                  }}>
                    <Typography variant="body2" color="info.contrastText">
                      <strong>🔄 Cálculo Automático:</strong> Al cambiar las horas totales o las horas por semana, 
                      la duración en meses se calcula automáticamente. La duración se muestra en gris porque no es editable.
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Etapa 3: Resumen */}
              {editActiveStep === 3 && (
                <Box sx={{ maxWidth: '100%', mx: 'auto' }}>
                  <Typography variant="h5" sx={{ textAlign: 'center', mb: 4, color: 'text.primary', fontWeight: 500 }}>
                    Resumen de Cambios
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" color="primary" gutterBottom>
                        Información Básica
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Título:</strong> {editFormData.title}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Área:</strong> {editFormData.area}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Tipo:</strong> {editFormData.tipo}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" color="primary" gutterBottom>
                        Etapa y Duración
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Etapa:</strong> Opción {editFormData.trl}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Horas:</strong> {editFormData.horas} horas
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Horas/Semana:</strong> {editFormData.horasPorSemana} horas
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" color="primary" gutterBottom>
                        Información General
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Modalidad:</strong> {editFormData.modalidad}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Responsable:</strong> {editFormData.encargado}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Fecha Inicio:</strong> {editFormData.fechaInicio}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" color="primary" gutterBottom>
                        Detalles
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Máximo Estudiantes:</strong> 1
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Duración:</strong> {editFormData.meses} meses
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: themeMode === 'dark' ? '#334155' : '#f5f5f5' }}>
          <Button 
            onClick={handleEditClose}
            variant="outlined"
            sx={{ borderRadius: 2, px: 3 }}
          >
            Cancelar
          </Button>
          
          {editActiveStep > 0 && (
            <Button 
              onClick={prevEditStep}
              variant="outlined"
              sx={{ borderRadius: 2, px: 3 }}
            >
              Anterior
            </Button>
          )}
          
          {editActiveStep < editSteps.length - 1 ? (
            <Button 
              onClick={nextEditStep}
              variant="contained"
              color="primary"
              sx={{ borderRadius: 2, px: 3 }}
            >
              Siguiente
            </Button>
          ) : (
            <Button 
              onClick={handleEditSave}
              variant="contained"
              color="warning"
              sx={{ borderRadius: 2, px: 3 }}
              disabled={savingProject}
            >
              {savingProject ? <CircularProgress size={20} /> : 'Guardar Cambios'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Projects;
