import { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Snackbar,
  Alert,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { DashboardLayout } from '../../../../components/layout/DashboardLayout';

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

  const filteredProjects = mockProjects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApply = (id: string) => {
    setApplied((prev) => [...prev, id]);
    setSnackbar({ open: true, message: '¡Postulación enviada con éxito!' });
  };

  return (
    <DashboardLayout userRole="student">
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
        <Grid container spacing={3}>
          {filteredProjects.map((project) => (
            <Box key={project.id} sx={{ width: { xs: '100%', md: '50%', lg: '33.33%' }, p: 1, display: 'flex' }}>
              <Card sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {project.title}
                  </Typography>
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
        </Grid>
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
    </DashboardLayout>
  );
} 