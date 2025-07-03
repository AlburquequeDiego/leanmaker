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
} from '@mui/icons-material';
import { apiService } from '../../../services/api.service';

interface Project {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  duration: string;
  studentsNeeded: number;
  selectedStudents: number;
  status: 'active' | 'completed' | 'published' | 'draft';
  applicationsCount: number;
  createdAt: string;
  horas?: number;
  meses?: number;
  tipo?: string;
  comoLlegaronInstitucion?: string;
  comentario?: string;
  fechaIngreso?: string;
  fechaEgreso?: string;
  encargado?: string;
  equipo?: string;
  cierre?: string;
  trlLevel?: number;
}

const STATUS_LABELS: Record<Project['status'], string> = {
  active: 'En Curso',
  completed: 'Completado',
  published: 'Publicado',
  draft: 'Borrador',
};
const STATUS_COLORS: Record<Project['status'], 'primary' | 'success' | 'info' | 'default'> = {
  active: 'primary',
  completed: 'success',
  published: 'info',
  draft: 'default',
};

const COUNT_OPTIONS = [5, 10, 15, 20, 30, 40, -1];

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

const TRL_TO_SEMESTER = {
  1: 1,
  2: 1,
  3: 2,
  4: 2,
  5: 3,
  6: 3,
  7: 4,
  8: 4,
  9: 4,
};
const SEMESTER_MIN_HOURS = {
  1: 20,
  2: 40,
  3: 80,
  4: 160,
};

const Projects: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [projects, setProjects] = useState<Project[]>([]);
  const [sectionCounts, setSectionCounts] = useState({
    active: 5,
    published: 5,
    completed: 5,
    draft: 5,
  });
  const [createStep, setCreateStep] = useState(0);
  const [trlSelected, setTrlSelected] = useState<number | null>(null);
  const [form, setForm] = useState({
    nombre: '',
    tipo: '',
    objetivo: '',
    comoLlegaronInstitucion: '',
    comentario: '',
    fechaIngreso: '',
    fechaEgreso: '',
    encargado: '',
    equipo: '',
    participantes: '',
    cierre: '',
    horas: '',
    meses: '',
  });
  const [hoursError, setHoursError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [editProjectId, setEditProjectId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const data = await apiService.get('/api/projects/');
        setProjects(Array.isArray(data) ? data : []);
      } catch (error) {
        setProjects([]);
      }
    }
    fetchProjects();
  }, []);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => setTab(newValue);

  const handleSectionCountChange = (status: Project['status']) => (e: SelectChangeEvent<number>) => {
    setSectionCounts({ ...sectionCounts, [status]: Number(e.target.value) });
  };

  const statusCounts = {
    active: projects.filter(p => p.status === 'active').length,
    published: projects.filter(p => p.status === 'published').length,
    completed: projects.filter(p => p.status === 'completed').length,
    draft: projects.filter(p => p.status === 'draft').length,
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === 'horas' && trlSelected) {
      const semestre = TRL_TO_SEMESTER[trlSelected as keyof typeof TRL_TO_SEMESTER];
      const minHoras = SEMESTER_MIN_HOURS[semestre as keyof typeof SEMESTER_MIN_HOURS];
      if (Number(e.target.value) < minHoras) {
        setHoursError(`El mínimo para este nivel es ${minHoras} horas.`);
      } else {
        setHoursError(null);
      }
    }
  };

  const nextStep = () => {
    if (createStep === 1 && trlSelected) {
      const semestre = TRL_TO_SEMESTER[trlSelected as keyof typeof TRL_TO_SEMESTER];
      const minHoras = SEMESTER_MIN_HOURS[semestre as keyof typeof SEMESTER_MIN_HOURS];
      if (Number(form.horas) < minHoras) {
        setHoursError(`El mínimo para este nivel es ${minHoras} horas.`);
        return;
      }
    }
    setCreateStep((s) => Math.min(s + 1, 3));
  };

  const prevStep = () => setCreateStep((s) => Math.max(s - 1, 0));

  const handleCreateProjectWizard = () => {
    if (!form.nombre || !form.tipo || !form.objetivo || !trlSelected || !form.horas || !form.meses) return;
    setProjects([
      ...projects,
      {
        id: (projects.length + 1).toString(),
        title: form.nombre,
        description: form.objetivo,
        requirements: [],
        duration: `${form.meses} meses`,
        studentsNeeded: Number(form.participantes) || 1,
        selectedStudents: 0,
        status: 'published',
        applicationsCount: 0,
        createdAt: new Date().toISOString(),
      },
    ]);
    setForm({
      nombre: '', tipo: '', objetivo: '', comoLlegaronInstitucion: '', comentario: '', fechaIngreso: '', fechaEgreso: '', encargado: '', equipo: '', participantes: '', cierre: '', horas: '', meses: '',
    });
    setTrlSelected(null);
    setCreateStep(0);
    setTab(0);
  };

  const renderStep = () => {
    switch (createStep) {
      case 0:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6">Información Básica del Proyecto</Typography>
            <TextField label="Nombre del Proyecto" name="nombre" value={form.nombre} onChange={handleFormChange} fullWidth required />
            <TextField label="Tipo de Actividad" name="tipo" value={form.tipo} onChange={handleFormChange} fullWidth required placeholder="Formación, Curricular, Co-curricular, Otro" />
            <TextField label="Objetivo del Proyecto" name="objetivo" value={form.objetivo} onChange={handleFormChange} fullWidth required />
            <TextField label="¿Cómo llegaron a la institución?" name="comoLlegaronInstitucion" value={form.comoLlegaronInstitucion} onChange={handleFormChange} fullWidth />
            <TextField label="Comentario adicional de registro (opcional)" name="comentario" value={form.comentario} onChange={handleFormChange} fullWidth />
          </Box>
        );
      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6">Diagnóstico TRL</Typography>
            {TRL_QUESTIONS.map((q, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <input
                  type="radio"
                  id={`trl${idx + 1}`}
                  name="trl"
                  checked={trlSelected === idx + 1}
                  onChange={() => {
                    setTrlSelected(idx + 1);
                    // Autocompletar horas según TRL
                    let minHoras = 20;
                    if (idx + 1 >= 3 && idx + 1 <= 4) minHoras = 40;
                    if (idx + 1 >= 5 && idx + 1 <= 6) minHoras = 80;
                    if (idx + 1 >= 7) minHoras = 160;
                    setForm(f => ({ ...f, horas: minHoras.toString() }));
                  }}
                  style={{ marginRight: 8 }}
                />
                <label htmlFor={`trl${idx + 1}`} style={{ cursor: 'pointer' }}>
                  <b>TRL {idx + 1}:</b> {q}
                </label>
              </Box>
            ))}
            {/* Tabla de referencia */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" fontWeight={700}>Referencia de horas mínimas según TRL</Typography>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
                <thead>
                  <tr style={{ background: '#f5f5f5' }}>
                    <th style={{ padding: 6, border: '1px solid #ddd' }}>Semestre</th>
                    <th style={{ padding: 6, border: '1px solid #ddd' }}>Nivel de desarrollo</th>
                    <th style={{ padding: 6, border: '1px solid #ddd' }}>Horas de práctica</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td style={{ padding: 6, border: '1px solid #ddd' }}>1</td><td style={{ padding: 6, border: '1px solid #ddd' }}>Asesoría</td><td style={{ padding: 6, border: '1px solid #ddd' }}>20</td></tr>
                  <tr><td style={{ padding: 6, border: '1px solid #ddd' }}>2</td><td style={{ padding: 6, border: '1px solid #ddd' }}>Asesoría + Propuesta solución</td><td style={{ padding: 6, border: '1px solid #ddd' }}>40</td></tr>
                  <tr><td style={{ padding: 6, border: '1px solid #ddd' }}>3</td><td style={{ padding: 6, border: '1px solid #ddd' }}>Asesoría + Propuesta solución + implementación</td><td style={{ padding: 6, border: '1px solid #ddd' }}>80</td></tr>
                  <tr><td style={{ padding: 6, border: '1px solid #ddd' }}>4</td><td style={{ padding: 6, border: '1px solid #ddd' }}>Asesoría + Propuesta solución + implementación + upgrade/controll</td><td style={{ padding: 6, border: '1px solid #ddd' }}>160</td></tr>
                </tbody>
              </table>
            </Box>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6">Información General</Typography>
            <TextField label="Fecha de ingreso" name="fechaIngreso" type="date" value={form.fechaIngreso} onChange={handleFormChange} fullWidth InputLabelProps={{ shrink: true }} />
            <TextField label="Fecha de egreso" name="fechaEgreso" type="date" value={form.fechaEgreso} onChange={handleFormChange} fullWidth InputLabelProps={{ shrink: true }} />
            <TextField label="Encargado de proyecto" name="encargado" value={form.encargado} onChange={handleFormChange} fullWidth />
            <TextField label="Equipo de proyecto" name="equipo" value={form.equipo} onChange={handleFormChange} fullWidth />
            <TextField label="Número de participantes" name="participantes" type="number" value={form.participantes} onChange={handleFormChange} fullWidth />
            <TextField label="Estado de cierre" name="cierre" value={form.cierre} onChange={handleFormChange} fullWidth placeholder="Egresado o Cerrado" />
            <TextField label="Horas de práctica ofrecidas" name="horas" type="number" value={form.horas} onChange={handleFormChange} fullWidth error={Boolean(hoursError) || Boolean(trlSelected && Number(form.horas) < (trlSelected <= 2 ? 20 : trlSelected <= 4 ? 40 : trlSelected <= 6 ? 80 : 160))} helperText={trlSelected && Number(form.horas) < (trlSelected <= 2 ? 20 : trlSelected <= 4 ? 40 : trlSelected <= 6 ? 80 : 160) ? `Debe ofrecer al menos ${trlSelected <= 2 ? 20 : trlSelected <= 4 ? 40 : trlSelected <= 6 ? 80 : 160} horas para el TRL seleccionado` : hoursError} required />
            <TextField label="Duración en meses" name="meses" type="number" value={form.meses} onChange={handleFormChange} fullWidth required />
          </Box>
        );
      case 3:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6">Confirmación y Resumen</Typography>
            <Typography variant="subtitle2">Nombre: {form.nombre}</Typography>
            <Typography variant="subtitle2">Tipo: {form.tipo}</Typography>
            <Typography variant="subtitle2">Objetivo: {form.objetivo}</Typography>
            <Typography variant="subtitle2">¿Cómo llegaron?: {form.comoLlegaronInstitucion}</Typography>
            <Typography variant="subtitle2">Comentario: {form.comentario}</Typography>
            <Typography variant="subtitle2">Fecha de ingreso: {form.fechaIngreso}</Typography>
            <Typography variant="subtitle2">Fecha de egreso: {form.fechaEgreso}</Typography>
            <Typography variant="subtitle2">Encargado: {form.encargado}</Typography>
            <Typography variant="subtitle2">Equipo: {form.equipo}</Typography>
            <Typography variant="subtitle2">Participantes: {form.participantes}</Typography>
            <Typography variant="subtitle2">Cierre: {form.cierre}</Typography>
            <Typography variant="subtitle2">Horas de práctica ofrecidas: {form.horas}</Typography>
            <Typography variant="subtitle2">Duración en meses: {form.meses}</Typography>
            <Typography variant="subtitle2">TRL Seleccionado: {trlSelected ? `TRL ${trlSelected}` : 'No seleccionado'}</Typography>
          </Box>
        );
      default:
        return null;
    }
  };

  const renderDashboard = () => (
    <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
      <Box sx={{ flex: 1, minWidth: 220 }}>
        <Card sx={{ bgcolor: '#e8f5e9', color: '#388e3c', p: 3, boxShadow: 2, borderRadius: 4, textAlign: 'center' }}>
          <Typography variant="h4" fontWeight={700} sx={{ color: '#388e3c' }}>{statusCounts.active}</Typography>
          <Typography variant="subtitle1" sx={{ color: '#388e3c' }}>Proyectos Activos</Typography>
        </Card>
      </Box>
      <Box sx={{ flex: 1, minWidth: 220 }}>
        <Card sx={{ bgcolor: '#e3f2fd', color: '#1976d2', p: 3, boxShadow: 2, borderRadius: 4, textAlign: 'center' }}>
          <Typography variant="h4" fontWeight={700} sx={{ color: '#1976d2' }}>{statusCounts.completed}</Typography>
          <Typography variant="subtitle1" sx={{ color: '#1976d2' }}>Proyectos Completados</Typography>
          </Card>
        </Box>
      <Box sx={{ flex: 1, minWidth: 220 }}>
        <Card sx={{ bgcolor: '#fff3e0', color: '#f57c00', p: 3, boxShadow: 2, borderRadius: 4, textAlign: 'center' }}>
          <Typography variant="h4" fontWeight={700} sx={{ color: '#f57c00' }}>{statusCounts.published}</Typography>
          <Typography variant="subtitle1" sx={{ color: '#f57c00' }}>Proyectos Publicados</Typography>
          </Card>
        </Box>
      <Box sx={{ flex: 1, minWidth: 220 }}>
        <Card sx={{ bgcolor: '#f5f5f5', color: '#757575', p: 3, boxShadow: 2, borderRadius: 4, textAlign: 'center' }}>
          <Typography variant="h4" fontWeight={700} sx={{ color: '#757575' }}>{statusCounts.draft}</Typography>
          <Typography variant="subtitle1" sx={{ color: '#757575' }}>Proyectos Borradores</Typography>
          </Card>
        </Box>
      </Box>
  );

  const renderSection = (status: Project['status'], icon: React.ReactNode) => {
    const filtered = projects.filter(p => p.status === status);
    const count = sectionCounts[status];
    const toShow = count === -1 ? filtered : filtered.slice(0, count);
    return (
      <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon}
          <Typography variant="h6" fontWeight={700} color="primary" sx={{ ml: 1 }}>
            {STATUS_LABELS[status]} ({filtered.length})
                    </Typography>
          <Box sx={{ ml: 2 }}>
            <FormControl size="small">
              <Select
                value={count}
                onChange={handleSectionCountChange(status)}
                sx={{ minWidth: 90, fontSize: 14 }}
              >
                {COUNT_OPTIONS.map(opt => (
                  <MenuItem key={opt} value={opt}>{opt === -1 ? 'Todas' : opt}</MenuItem>
                ))}
              </Select>
            </FormControl>
                  </Box>
                </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {toShow.length === 0 && (
            <Typography color="text.secondary">No hay proyectos {STATUS_LABELS[status].toLowerCase()}.</Typography>
          )}
          {toShow.map((project) => (
            <Card key={project.id} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', p: 2, boxShadow: 1, borderRadius: 2 }}>
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mr: 1 }}>{project.title}</Typography>
                  <Chip label={STATUS_LABELS[project.status]} color={STATUS_COLORS[project.status]} size="small" />
                </Box>
                    <Typography variant="body2" color="text.secondary">
                  {project.description.length > 120 ? project.description.slice(0, 120) + '...' : project.description}
                    </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                  {project.requirements.map((req, idx) => (
                    <Chip key={idx} label={req} size="small" variant="outlined" />
                  ))}
                  </Box>
                <Box sx={{ display: 'flex', gap: 2, mt: 1, alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    {project.horas ? `${project.horas} horas • ` : ''} {project.duration}
                  </Typography>
                  <Chip label={`${project.applicationsCount} postulaciones`} size="small" color="info" />
                  <Chip label={`${project.selectedStudents}/${project.studentsNeeded} estudiantes`} size="small" color="success" />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1, minWidth: 120, ml: 2 }}>
                {(project.status === 'published' || project.status === 'active') && (
                  <IconButton color="info" size="small" onClick={() => handleEditClick(project)}><EditIcon /></IconButton>
                )}
                {(project.status === 'active' || project.status === 'published') && (
                  <IconButton color="success" size="small" onClick={() => handleCompleteClick(project)}><TaskAltIcon /></IconButton>
                )}
                <IconButton color="primary" size="small" onClick={() => handleViewClick(project)}><VisibilityIcon /></IconButton>
                <IconButton color="error" size="small" onClick={() => handleDeleteClick(project)}><DeleteIcon /></IconButton>
              </Box>
            </Card>
          ))}
          </Box>
      </Box>
    );
  };

  // Eliminar proyecto
  const handleDeleteClick = (project: Project) => {
    setSelectedProject(project);
    setDeleteDialogOpen(true);
  };
  const handleDeleteConfirm = () => {
    if (selectedProject) {
      setProjects(projects.filter(p => p.id !== selectedProject.id));
    }
    setDeleteDialogOpen(false);
    setSelectedProject(null);
  };
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedProject(null);
  };

  // Completar proyecto
  const handleCompleteClick = (project: Project) => {
    setSelectedProject(project);
    setCompleteDialogOpen(true);
  };
  const handleCompleteConfirm = () => {
    if (selectedProject) {
      setProjects(projects.map(p =>
        p.id === selectedProject.id
          ? { ...p, status: 'completed' as const }
          : p
      ));
    }
    setCompleteDialogOpen(false);
    setSelectedProject(null);
  };
  const handleCompleteCancel = () => {
    setCompleteDialogOpen(false);
    setSelectedProject(null);
  };

  // Ver proyecto
  const handleViewClick = (project: Project) => {
    setSelectedProject(project);
    setViewDialogOpen(true);
  };
  const handleViewClose = () => {
    setViewDialogOpen(false);
    setSelectedProject(null);
  };

  // Editar proyecto (precarga y modo edición)
  const handleEditClick = (project: Project) => {
    setSelectedProject(project);
    setEditMode(true);
    setEditProjectId(project.id);
    setTab(1);
    setCreateStep(0);
    setForm({
      nombre: project.title,
      tipo: project.tipo || '',
      objetivo: project.description,
      comoLlegaronInstitucion: project.comoLlegaronInstitucion || '',
      comentario: project.comentario || '',
      fechaIngreso: project.fechaIngreso || '',
      fechaEgreso: project.fechaEgreso || '',
      encargado: project.encargado || '',
      equipo: project.equipo || '',
      participantes: project.studentsNeeded?.toString() || '',
      cierre: project.cierre || '',
      horas: project.horas ? project.horas.toString() : '',
      meses: project.duration ? project.duration.replace(' meses', '') : '',
    });
    setTrlSelected(project.trlLevel || null);
  };

  // Guardar cambios al editar
  const handleSaveEditProject = () => {
    if (!editProjectId) return;
    setProjects(projects.map(p =>
      p.id === editProjectId
        ? {
            ...p,
            title: form.nombre,
            description: form.objetivo,
            studentsNeeded: Number(form.participantes) || 1,
            horas: Number(form.horas) || undefined,
            duration: form.meses ? `${form.meses} meses` : '',
            tipo: form.tipo,
            comoLlegaronInstitucion: form.comoLlegaronInstitucion,
            comentario: form.comentario,
            fechaIngreso: form.fechaIngreso,
            fechaEgreso: form.fechaEgreso,
            encargado: form.encargado,
            equipo: form.equipo,
            cierre: form.cierre,
            trlLevel: trlSelected || undefined,
          } as Project
        : p
    ));
    setEditMode(false);
    setEditProjectId(null);
    setForm({ nombre: '', tipo: '', objetivo: '', comoLlegaronInstitucion: '', comentario: '', fechaIngreso: '', fechaEgreso: '', encargado: '', equipo: '', participantes: '', cierre: '', horas: '', meses: '' });
    setTrlSelected(null);
    setCreateStep(0);
    setTab(0);
  };

  return (
    <Box sx={{ width: '100%', p: { xs: 1, md: 3 } }}>
      <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Proyectos" />
        <Tab label="Crear Proyecto" icon={<AddIcon />} iconPosition="start" />
      </Tabs>
      {tab === 0 && (
        <Box>
          {renderDashboard()}
          {renderSection('active', <PlayArrowIcon color="primary" />)}
          {renderSection('published', <PublishIcon color="info" />)}
          {renderSection('completed', <CheckCircleIcon color="success" />)}
          {renderSection('draft', <DraftsIcon color="disabled" />)}
        </Box>
      )}
      {tab === 1 && (
        <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 2 }}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
            {[0, 1, 2, 3].map((step) => (
              <Box key={step} sx={{ width: 40, height: 8, borderRadius: 4, bgcolor: createStep === step ? 'primary.main' : 'grey.300' }} />
            ))}
          </Box>
          {renderStep()}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button disabled={createStep === 0} onClick={prevStep} variant="outlined">Anterior</Button>
            {editMode ? (
              createStep < 3 ? (
                <Button variant="contained" color="primary" onClick={nextStep}>Siguiente</Button>
              ) : (
              <Button variant="contained" color="success" onClick={handleSaveEditProject}>Guardar Cambios</Button>
              )
            ) : (
              createStep < 3 ? (
                <Button variant="contained" color="primary" onClick={nextStep}>Siguiente</Button>
              ) : (
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleCreateProjectWizard}
                  disabled={
                    !form.nombre ||
                    !form.tipo ||
                    !form.objetivo ||
                    !trlSelected ||
                    !form.horas ||
                    !form.meses
                  }
                >
                  Crear Proyecto
                </Button>
              )
            )}
          </Box>
        </Box>
      )}
      {/* Diálogo de eliminar */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>¿Eliminar proyecto?</DialogTitle>
        <DialogContent>¿Seguro que deseas eliminar el proyecto "{selectedProject?.title}"?</DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancelar</Button>
          <Button onClick={handleDeleteConfirm} color="error">Eliminar</Button>
        </DialogActions>
      </Dialog>
      {/* Diálogo de completar proyecto */}
      <Dialog open={completeDialogOpen} onClose={handleCompleteCancel}>
        <DialogTitle>¿Marcar proyecto como completado?</DialogTitle>
        <DialogContent>
          ¿Seguro que deseas marcar el proyecto "{selectedProject?.title}" como completado?
          <br />
          <br />
          <strong>Esta acción no se puede deshacer.</strong>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCompleteCancel}>Cancelar</Button>
          <Button onClick={handleCompleteConfirm} color="success" variant="contained">
            Marcar como Completado
          </Button>
        </DialogActions>
      </Dialog>
      {/* Modal de ver proyecto */}
      <Dialog open={viewDialogOpen} onClose={handleViewClose} maxWidth="md" fullWidth>
        <DialogTitle>Detalles del Proyecto</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" color="primary">{selectedProject?.title}</Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Descripción</Typography>
          <Typography variant="body2">{selectedProject?.description}</Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Tipo de Actividad</Typography>
                <Typography variant="body2">{selectedProject?.tipo || 'No especificado'}</Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Duración</Typography>
                <Typography variant="body2">{selectedProject?.duration}</Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Horas de Práctica</Typography>
                <Typography variant="body2">{selectedProject?.horas ? `${selectedProject.horas} horas` : 'No especificado'}</Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Fecha de Ingreso</Typography>
                <Typography variant="body2">{selectedProject?.fechaIngreso || 'No especificado'}</Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Fecha de Egreso</Typography>
                <Typography variant="body2">{selectedProject?.fechaEgreso || 'No especificado'}</Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Encargado</Typography>
                <Typography variant="body2">{selectedProject?.encargado || 'No especificado'}</Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Equipo</Typography>
                <Typography variant="body2">{selectedProject?.equipo || 'No especificado'}</Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Estado de Cierre</Typography>
                <Typography variant="body2">{selectedProject?.cierre || 'No especificado'}</Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">TRL Level</Typography>
                <Typography variant="body2">{selectedProject?.trlLevel ? `TRL ${selectedProject.trlLevel}` : 'No especificado'}</Typography>
              </Box>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="text.secondary">¿Cómo llegaron a la institución?</Typography>
              <Typography variant="body2">{selectedProject?.comoLlegaronInstitucion || 'No especificado'}</Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Comentario Adicional</Typography>
              <Typography variant="body2">{selectedProject?.comentario || 'No especificado'}</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label={`${selectedProject?.applicationsCount} postulaciones`} size="small" color="info" />
              <Chip label={`${selectedProject?.selectedStudents}/${selectedProject?.studentsNeeded} estudiantes`} size="small" color="success" />
              <Chip label={STATUS_LABELS[selectedProject?.status || 'draft']} color={STATUS_COLORS[selectedProject?.status || 'draft']} size="small" />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleViewClose}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Projects;
