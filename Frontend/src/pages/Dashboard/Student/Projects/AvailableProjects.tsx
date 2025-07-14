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
  MenuItem,
  Autocomplete,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { 
  Search as SearchIcon, 
  Visibility as VisibilityIcon,

} from '@mui/icons-material';
import { apiService } from '../../../../services/api.service';

interface Project {
  id: string;
  title: string;
  company_name: string;
  description: string;
  requirements: string;
  area: string;
  status: string;
  status_id: number;
  trl_level?: number;
  api_level?: number;
  max_students?: number;
  current_students?: number;
  difficulty?: string;
  modality?: string;
  location?: string;
  duration_weeks?: number;
  hours_per_week?: number;
  is_featured?: boolean;
  is_urgent?: boolean;
  created_at?: string;
  updated_at?: string;
}

const areas = ['Tecnología', 'Marketing', 'Diseño', 'Administración'];
const modalidades = ['Remoto', 'Presencial', 'Híbrido'];
const duraciones = ['1 mes', '2 meses', '3 meses', '6 meses', '12 meses'];
const tecnologias = ['React', 'Node.js', 'MongoDB', 'Python', 'Pandas', 'Power BI', 'Figma', 'Adobe XD', 'UI/UX'];

export default function AvailableProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [applied, setApplied] = useState<string[]>([]);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Filtros avanzados
  const [area, setArea] = useState('');
  const [modalidad, setModalidad] = useState('');
  const [duracion, setDuracion] = useState('');
  const [tecs, setTecs] = useState<string[]>([]);
  const [empresa, setEmpresa] = useState('');
  const [ordenFecha, setOrdenFecha] = useState('recientes');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await apiService.get('/api/projects/');
      const availableProjects = Array.isArray(data.results) ? data.results : [];
      setProjects(availableProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Error al cargar los proyectos disponibles');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (projectId: string) => {
    try {
      const applicationData = {
        project_id: projectId,
        status: 'pending',
        applied_at: new Date().toISOString(),
      };

              await apiService.post('/api/projects/applications/', applicationData);
      setApplied((prev) => [...prev, projectId]);
      setSnackbar({ 
        open: true, 
        message: '¡Postulación enviada con éxito!', 
        severity: 'success' 
      });
    } catch (error) {
      console.error('Error applying to project:', error);
      setSnackbar({ 
        open: true, 
        message: 'Error al enviar la postulación. Inténtalo de nuevo.', 
        severity: 'error' 
      });
    }
  };

  const handleOpenDetail = (project: Project) => {
    setSelectedProject(project);
    setDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setSelectedProject(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Filtrado de proyectos
  let filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (area) {
    filteredProjects = filteredProjects.filter(project =>
      project.area.toLowerCase().includes(area.toLowerCase())
    );
  }
  
  if (modalidad) {
    filteredProjects = filteredProjects.filter(project => 
      project.modality?.toLowerCase() === modalidad.toLowerCase()
    );
  }
  
  if (duracion) {
    const duracionValue = duracion.replace(' meses', '');
    const semanas = parseInt(duracionValue) * 4; // Convertir meses a semanas aproximadas
    filteredProjects = filteredProjects.filter(project => project.duration_weeks === semanas);
  }
  
  if (tecs.length > 0) {
    filteredProjects = filteredProjects.filter(project =>
      tecs.every(tec => 
        project.requirements.toLowerCase().includes(tec.toLowerCase())
      )
    );
  }
  
  if (empresa) {
    filteredProjects = filteredProjects.filter(project => project.company_name === empresa);
  }
  
  if (ordenFecha === 'recientes') {
    filteredProjects = filteredProjects.sort((a, b) => 
      new Date(b.created_at || b.updated_at || '').getTime() - new Date(a.created_at || a.updated_at || '').getTime()
    );
  } else {
    filteredProjects = filteredProjects.sort((a, b) => 
      new Date(a.created_at || a.updated_at || '').getTime() - new Date(b.created_at || b.updated_at || '').getTime()
    );
  }

  const empresas = [...new Set(projects.map(p => p.company_name).filter(Boolean))];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Renderizado de detalles del proyecto
  const renderProjectDetail = (project: Project) => (
    <Dialog open={detailOpen} onClose={handleCloseDetail} maxWidth="md" fullWidth>
      <Box sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>{project.title}</Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Empresa: {project.company_name} | Área: {project.area} | Estado: {project.status}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          <b>Descripción:</b> {project.description}
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          <b>Requisitos:</b> {project.requirements}
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          <b>Modalidad:</b> {project.modality} | <b>Ubicación:</b> {project.location}
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          <b>Dificultad:</b> {project.difficulty} | <b>Duración (semanas):</b> {project.duration_weeks}
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          <b>Estudiantes máximos:</b> {project.max_students} | <b>Actualmente:</b> {project.current_students}
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          <b>TRL:</b> {project.trl_level} | <b>API Level:</b> {project.api_level}
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          <b>Creado:</b> {project.created_at ? new Date(project.created_at).toLocaleString() : '-'}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button onClick={handleCloseDetail} color="secondary" variant="outlined">Cerrar</Button>
          <Button
            variant="contained"
            color="primary"
            disabled={applied.includes(project.id)}
            onClick={() => handleApply(project.id)}
          >
            {applied.includes(project.id) ? 'Postulado' : 'Postularme'}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );

  // Renderizado de tarjetas de proyectos
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Proyectos Disponibles
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      )}
      {/* Filtros avanzados y barra de búsqueda */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <TextField
            variant="outlined"
            placeholder="Buscar proyectos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300, flex: 1 }}
          />
          <TextField
            select
            label="Área"
            value={area}
            onChange={e => setArea(e.target.value)}
            sx={{ minWidth: 140 }}
            size="small"
          >
            <MenuItem key="todas-areas" value="">Todas</MenuItem>
            {areas.map((a, index) => <MenuItem key={`area-${index}-${a}`} value={a}>{a}</MenuItem>)}
          </TextField>
          <TextField
            select
            label="Modalidad"
            value={modalidad}
            onChange={e => setModalidad(e.target.value)}
            sx={{ minWidth: 140 }}
            size="small"
          >
            <MenuItem key="todas-modalidades" value="">Todas</MenuItem>
            {modalidades.map((m, index) => <MenuItem key={`modalidad-${index}-${m}`} value={m}>{m}</MenuItem>)}
          </TextField>
          <TextField
            select
            label="Duración"
            value={duracion}
            onChange={e => setDuracion(e.target.value)}
            sx={{ minWidth: 120 }}
            size="small"
          >
            <MenuItem key="todas-duraciones" value="">Todas</MenuItem>
            {duraciones.map((d, index) => <MenuItem key={`duracion-${index}-${d}`} value={d}>{d}</MenuItem>)}
          </TextField>
          <Autocomplete
            multiple
            options={tecnologias}
            value={tecs}
            onChange={(_, value) => setTecs(value)}
            renderInput={(params) => <TextField {...params} label="Tecnologías" size="small" />}
            sx={{ minWidth: 180 }}
            getOptionLabel={(option) => option}
            isOptionEqualToValue={(option, value) => option === value}
          />
          <TextField
            select
            label="Empresa"
            value={empresa}
            onChange={e => setEmpresa(e.target.value)}
            sx={{ minWidth: 140 }}
            size="small"
          >
            <MenuItem key="todas-empresas" value="">Todas</MenuItem>
            {empresas.map((e, index) => <MenuItem key={`empresa-${index}-${e}`} value={e}>{e}</MenuItem>)}
          </TextField>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Ordenar por</InputLabel>
            <Select
              value={ordenFecha}
              label="Ordenar por"
              onChange={e => setOrdenFecha(e.target.value)}
            >
              <MenuItem key="recientes" value="recientes">Más recientes</MenuItem>
              <MenuItem key="antiguos" value="antiguos">Más antiguos</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Resultados */}
      <Typography variant="h6" gutterBottom>
        {filteredProjects.length} proyecto{filteredProjects.length !== 1 ? 's' : ''} encontrado{filteredProjects.length !== 1 ? 's' : ''}
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: { xs: 'center', md: 'flex-start' } }}>
        {filteredProjects.map(project => (
          <Card key={project.id} sx={{ minWidth: 320, maxWidth: 400, flex: 1 }}>
            <CardContent>
              <Typography variant="h6">{project.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                Empresa: {project.company_name} | Área: {project.area}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {project.description.slice(0, 120)}...
              </Typography>
              <Chip label={project.status} color={project.status === 'Activo' ? 'success' : 'default'} size="small" sx={{ mr: 1 }} />
              <Chip label={`Dificultad: ${project.difficulty}`} size="small" />
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => handleOpenDetail(project)}>
                Ver Detalles
              </Button>
              <Button
                size="small"
                variant="contained"
                color="primary"
                disabled={applied.includes(project.id)}
                onClick={() => handleApply(project.id)}
              >
                {applied.includes(project.id) ? 'Postulado' : 'Postularme'}
              </Button>
            </CardActions>
          </Card>
        ))}
      </Box>

      {filteredProjects.length === 0 && !loading && (
        <Alert severity="info" sx={{ mt: 3 }}>
          No se encontraron proyectos que coincidan con los filtros aplicados.
        </Alert>
      )}

      {selectedProject && renderProjectDetail(selectedProject)}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 