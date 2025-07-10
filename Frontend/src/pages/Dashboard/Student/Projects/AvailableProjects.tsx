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
  company: string;
  description: string;
  requirements: string[];
  duration: string;
  publishedAt: string;
  status: string;
  max_students?: number;
  current_students?: number;
  difficulty?: string;
  api_level?: number;
  location?: string;
  modality?: string;
  skills?: string[];
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
      const availableProjects = Array.isArray(data) ? data.filter((project: any) => 
        project.status === 'published' || project.status === 'active'
      ) : [];
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
    project.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (area) {
    filteredProjects = filteredProjects.filter(project =>
      project.requirements?.some((req: string) => req.toLowerCase().includes(area.toLowerCase())) ||
      project.skills?.some((skill: string) => skill.toLowerCase().includes(area.toLowerCase()))
    );
  }
  
  if (modalidad) {
    filteredProjects = filteredProjects.filter(project => 
      project.modality?.toLowerCase() === modalidad.toLowerCase()
    );
  }
  
  if (duracion) {
    filteredProjects = filteredProjects.filter(project => project.duration === duracion);
  }
  
  if (tecs.length > 0) {
    filteredProjects = filteredProjects.filter(project =>
      tecs.every(tec => 
        (project.requirements?.map((r: string) => r.toLowerCase()).includes(tec.toLowerCase())) ||
        (project.skills?.map((s: string) => s.toLowerCase()).includes(tec.toLowerCase()))
      )
    );
  }
  
  if (empresa) {
    filteredProjects = filteredProjects.filter(project => project.company === empresa);
  }
  
  if (ordenFecha === 'recientes') {
    filteredProjects = filteredProjects.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  } else {
    filteredProjects = filteredProjects.sort((a, b) => 
      new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
    );
  }

  const empresas = [...new Set(projects.map(p => p.company))];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Proyectos Disponibles
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
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
            <MenuItem value="">Todas</MenuItem>
            {areas.map(a => <MenuItem key={a} value={a}>{a}</MenuItem>)}
          </TextField>
          <TextField
            select
            label="Modalidad"
            value={modalidad}
            onChange={e => setModalidad(e.target.value)}
            sx={{ minWidth: 140 }}
            size="small"
          >
            <MenuItem value="">Todas</MenuItem>
            {modalidades.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
          </TextField>
          <TextField
            select
            label="Duración"
            value={duracion}
            onChange={e => setDuracion(e.target.value)}
            sx={{ minWidth: 120 }}
            size="small"
          >
            <MenuItem value="">Todas</MenuItem>
            {duraciones.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
          </TextField>
          <Autocomplete
            multiple
            options={tecnologias}
            value={tecs}
            onChange={(_, value) => setTecs(value)}
            renderInput={(params) => <TextField {...params} label="Tecnologías" size="small" />}
            sx={{ minWidth: 180 }}
          />
          <TextField
            select
            label="Empresa"
            value={empresa}
            onChange={e => setEmpresa(e.target.value)}
            sx={{ minWidth: 140 }}
            size="small"
          >
            <MenuItem value="">Todas</MenuItem>
            {empresas.map(emp => <MenuItem key={emp} value={emp}>{emp}</MenuItem>)}
          </TextField>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Ordenar por</InputLabel>
            <Select
              value={ordenFecha}
              label="Ordenar por"
              onChange={e => setOrdenFecha(e.target.value)}
            >
              <MenuItem value="recientes">Más recientes</MenuItem>
              <MenuItem value="antiguos">Más antiguos</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Resultados */}
      <Typography variant="h6" gutterBottom>
        {filteredProjects.length} proyecto{filteredProjects.length !== 1 ? 's' : ''} encontrado{filteredProjects.length !== 1 ? 's' : ''}
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: { xs: 'center', md: 'flex-start' } }}>
        {filteredProjects.map((project) => (
          <Box key={project.id} sx={{ width: { xs: '100%', sm: '48%', md: '32%' }, mb: 3, display: 'flex' }}>
            <Card sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {project.title}
                  </Typography>
                  <IconButton color="primary" onClick={e => { e.stopPropagation(); handleOpenDetail(project); }}>
                    <VisibilityIcon />
                  </IconButton>
                </Box>
                <Typography color="textSecondary" gutterBottom>
                  {project.company}
                </Typography>
                <Typography variant="body2" paragraph>
                  {project.description}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  {(project.requirements || project.skills || []).slice(0, 3).map((req, index) => (
                    <Chip
                      key={index}
                      label={req}
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                  {(project.requirements || project.skills || []).length > 3 && (
                    <Chip
                      label={`+${(project.requirements || project.skills || []).length - 3}`}
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                    />
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Duración: {project.duration}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Publicado: {new Date(project.publishedAt).toLocaleDateString('es-ES')}
                </Typography>
              </CardContent>
              <CardActions sx={{ mt: 'auto', p: 2 }}>
                <Button
                  size="small"
                  color="primary"
                  variant="contained"
                  fullWidth
                  disabled={applied.includes(project.id)}
                  onClick={() => handleApply(project.id)}
                >
                  {applied.includes(project.id) ? 'Postulado' : 'Postularme'}
                </Button>
              </CardActions>
            </Card>
          </Box>
        ))}
      </Box>

      {filteredProjects.length === 0 && !loading && (
        <Alert severity="info" sx={{ mt: 3 }}>
          No se encontraron proyectos que coincidan con los filtros aplicados.
        </Alert>
      )}

      {/* Dialog de detalles */}
      <Dialog open={detailOpen} onClose={handleCloseDetail} maxWidth="md" fullWidth>
        {selectedProject && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5">{selectedProject.title}</Typography>
              <IconButton onClick={handleCloseDetail}>
                <CloseIcon />
              </IconButton>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">Empresa</Typography>
                <Typography variant="body1">{selectedProject.company}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle1" fontWeight="bold">Descripción</Typography>
                <Typography variant="body1">{selectedProject.description}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle1" fontWeight="bold">Requerimientos</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {(selectedProject.requirements || selectedProject.skills || []).map((req, index) => (
                    <Chip key={index} label={req} color="primary" />
                  ))}
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 4 }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">Duración</Typography>
                  <Typography variant="body1">{selectedProject.duration}</Typography>
                </Box>
                {selectedProject.location && (
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">Ubicación</Typography>
                    <Typography variant="body1">{selectedProject.location}</Typography>
                  </Box>
                )}
                {selectedProject.modality && (
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">Modalidad</Typography>
                    <Typography variant="body1">{selectedProject.modality}</Typography>
                  </Box>
                )}
              </Box>

              {selectedProject.difficulty && (
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">Dificultad</Typography>
                  <Typography variant="body1">{selectedProject.difficulty}</Typography>
                </Box>
              )}

              {selectedProject.api_level && (
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">Nivel API Requerido</Typography>
                  <Typography variant="body1">Nivel {selectedProject.api_level}</Typography>
                </Box>
              )}

              {selectedProject.max_students && (
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">Estudiantes</Typography>
                  <Typography variant="body1">
                    {selectedProject.current_students || 0} de {selectedProject.max_students} estudiantes
                  </Typography>
                </Box>
              )}
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
              <Button onClick={handleCloseDetail}>Cerrar</Button>
              <Button
                variant="contained"
                disabled={applied.includes(selectedProject.id)}
                onClick={() => {
                  handleApply(selectedProject.id);
                  handleCloseDetail();
                }}
              >
                {applied.includes(selectedProject.id) ? 'Ya Postulado' : 'Postularse'}
              </Button>
            </Box>
          </Box>
        )}
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
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