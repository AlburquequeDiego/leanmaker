import { useState } from 'react';
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
} from '@mui/material';
import { Search as SearchIcon, Visibility as VisibilityIcon } from '@mui/icons-material';

const mockProjects = [
  {
    id: '1',
    title: 'Desarrollo de Aplicación Web',
    company: 'Tech Solutions',
    description: 'Desarrollo de una aplicación web full-stack utilizando React y Node.js.',
    requirements: ['React', 'Node.js', 'MongoDB'],
    duration: '3 meses',
    publishedAt: '2024-06-01',
  },
  {
    id: '2',
    title: 'Análisis de Datos',
    company: 'Data Analytics Corp',
    description: 'Proyecto de análisis de datos y visualización para dashboard empresarial.',
    requirements: ['Python', 'Pandas', 'Power BI'],
    duration: '2 meses',
    publishedAt: '2024-05-28',
  },
  {
    id: '3',
    title: 'Diseño de UI/UX',
    company: 'Creative Design',
    description: 'Diseño de interfaz de usuario y experiencia para aplicación móvil.',
    requirements: ['Figma', 'Adobe XD', 'UI/UX'],
    duration: '1 mes',
    publishedAt: '2024-06-03',
  },
];

export default function AvailableProjects() {
  const [searchTerm, setSearchTerm] = useState('');
  const [applied, setApplied] = useState<string[]>([]);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({ open: false, message: '' });
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const filteredProjects = mockProjects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApply = (id: string) => {
    setApplied((prev) => [...prev, id]);
    setSnackbar({ open: true, message: '¡Postulación enviada con éxito!' });
  };

  const handleOpenDetail = (project: any) => {
    setSelectedProject(project);
    setDetailOpen(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Proyectos Disponibles
      </Typography>
      {/* Barra de búsqueda */}
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
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
        />
      </Box>
      {/* Lista de proyectos */}
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
                  {project.requirements.map((req, index) => (
                    <Chip
                      key={index}
                      label={req}
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
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
      {/* Dialog de detalle de proyecto */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
        {selectedProject && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              {selectedProject.title}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              {selectedProject.company}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>{selectedProject.description}</Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">Requisitos:</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {selectedProject.requirements.map((req: string, idx: number) => (
                  <Chip key={idx} label={req} size="small" variant="outlined" />
                ))}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Duración</Typography>
                <Typography variant="body1">{selectedProject.duration}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Publicado</Typography>
                <Typography variant="body1">{new Date(selectedProject.publishedAt).toLocaleDateString('es-ES')}</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                disabled={applied.includes(selectedProject.id)}
                onClick={() => { handleApply(selectedProject.id); setDetailOpen(false); }}
                sx={{ minWidth: 160, borderRadius: 2 }}
              >
                {applied.includes(selectedProject.id) ? 'Postulado' : 'Postularme'}
              </Button>
              <Button onClick={() => setDetailOpen(false)} sx={{ ml: 2, borderRadius: 2 }}>
                Cerrar
              </Button>
            </Box>
          </Box>
        )}
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ open: false, message: '' })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 