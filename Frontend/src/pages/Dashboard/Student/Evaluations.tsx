import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Rating,
  Avatar,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  TextField,
  MenuItem,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Visibility as VisibilityIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  EmojiEvents as EmojiEventsIcon,
  Psychology as PsychologyIcon,
  Code as CodeIcon,
  Group as GroupIcon,
  ScheduleSend as ScheduleSendIcon,
} from '@mui/icons-material';

// Mock de evaluaciones mejorado
const mockEvaluations = [
  {
    id: '1',
    projectTitle: 'Desarrollo de Aplicación Web E-commerce',
    company: 'Tech Solutions',
    evaluator: 'Juan Pérez',
    evaluatorRole: 'Mentor Técnico Senior',
    date: '2024-06-10',
    status: 'completed',
    type: 'final',
    overallRating: 4.5,
    categories: [
      { name: 'Calidad del Código', rating: 4.5, icon: <CodeIcon /> },
      { name: 'Cumplimiento de Plazos', rating: 5, icon: <ScheduleSendIcon /> },
      { name: 'Trabajo en Equipo', rating: 4, icon: <GroupIcon /> },
      { name: 'Comunicación', rating: 4.5, icon: <PsychologyIcon /> },
      { name: 'Documentación', rating: 4, icon: <AssessmentIcon /> },
      { name: 'Innovación', rating: 4.5, icon: <TrendingUpIcon /> },
    ],
    comments: 'Excelente trabajo en la implementación de la autenticación y el dashboard. La calidad del código es muy buena y la documentación está bien estructurada. Se sugiere mejorar la comunicación en las reuniones de equipo.',
    strengths: [
      'Buen manejo de Git y control de versiones',
      'Documentación clara y concisa',
      'Implementación eficiente de funcionalidades',
      'Excelente resolución de problemas',
      'Código limpio y bien estructurado',
    ],
    areasForImprovement: [
      'Participación más activa en las reuniones',
      'Mejorar la cobertura de pruebas unitarias',
      'Optimizar consultas a la base de datos',
    ],
    projectDuration: '3 meses',
    technologies: ['React', 'Node.js', 'MongoDB', 'JWT'],
    deliverables: ['Frontend completo', 'API REST', 'Documentación técnica'],
  },
  {
    id: '2',
    projectTitle: 'Análisis de Datos y Machine Learning',
    company: 'Data Analytics Corp',
    evaluator: 'María García',
    evaluatorRole: 'Líder de Proyecto',
    date: '2024-06-15',
    status: 'completed',
    type: 'final',
    overallRating: 4.8,
    categories: [
      { name: 'Análisis de Datos', rating: 5, icon: <AssessmentIcon /> },
      { name: 'Machine Learning', rating: 4.5, icon: <TrendingUpIcon /> },
      { name: 'Visualización', rating: 4.8, icon: <PsychologyIcon /> },
      { name: 'Documentación', rating: 4.5, icon: <AssessmentIcon /> },
      { name: 'Presentación', rating: 5, icon: <EmojiEventsIcon /> },
    ],
    comments: 'Destacable trabajo en el análisis exploratorio de datos y la implementación de modelos de ML. Las visualizaciones son muy claras y la presentación final fue excepcional.',
    strengths: [
      'Excelente análisis estadístico',
      'Visualizaciones impactantes',
      'Documentación técnica completa',
      'Presentación profesional',
      'Innovación en metodologías',
    ],
    areasForImprovement: [
      'Optimizar tiempo de entrenamiento de modelos',
      'Mejorar la interpretabilidad de resultados',
    ],
    projectDuration: '4 meses',
    technologies: ['Python', 'Pandas', 'Scikit-learn', 'Matplotlib', 'Power BI'],
    deliverables: ['Modelo predictivo', 'Dashboard interactivo', 'Reporte ejecutivo'],
  },
  {
    id: '3',
    projectTitle: 'Diseño de UI/UX para App Móvil',
    company: 'Creative Design Studio',
    evaluator: 'Carlos López',
    evaluatorRole: 'Diseñador Senior',
    date: '2024-05-28',
    status: 'completed',
    type: 'intermediate',
    overallRating: 4.2,
    categories: [
      { name: 'Diseño Visual', rating: 4.5, icon: <PsychologyIcon /> },
      { name: 'Experiencia de Usuario', rating: 4, icon: <AssessmentIcon /> },
      { name: 'Prototipado', rating: 4.8, icon: <CodeIcon /> },
      { name: 'Documentación', rating: 4, icon: <AssessmentIcon /> },
      { name: 'Creatividad', rating: 4.5, icon: <EmojiEventsIcon /> },
    ],
    comments: 'Destacable trabajo en la creación de prototipos y la atención al detalle en el diseño visual. La documentación de los componentes es muy completa.',
    strengths: [
      'Excelente manejo de Figma',
      'Prototipos interactivos de alta calidad',
      'Documentación detallada de componentes',
      'Creatividad en soluciones de diseño',
    ],
    areasForImprovement: [
      'Realizar más pruebas con usuarios',
      'Mejorar la accesibilidad de los diseños',
    ],
    projectDuration: '2 meses',
    technologies: ['Figma', 'Adobe XD', 'Principle', 'Sketch'],
    deliverables: ['Prototipos interactivos', 'Sistema de diseño', 'Guía de componentes'],
  },
  {
    id: '4',
    projectTitle: 'Sistema de Gestión de Inventarios',
    company: 'Logistics Solutions',
    evaluator: 'Ana Rodríguez',
    evaluatorRole: 'Project Manager',
    date: '2024-06-20',
    status: 'pending',
    type: 'final',
    overallRating: null,
    categories: [
      { name: 'Desarrollo Backend', rating: null, icon: <CodeIcon /> },
      { name: 'Base de Datos', rating: null, icon: <AssessmentIcon /> },
      { name: 'Testing', rating: null, icon: <AssessmentIcon /> },
      { name: 'Documentación', rating: null, icon: <AssessmentIcon /> },
    ],
    comments: null,
    strengths: null,
    areasForImprovement: null,
    projectDuration: '3 meses',
    technologies: ['Java', 'Spring Boot', 'PostgreSQL', 'JUnit'],
    deliverables: ['API REST', 'Base de datos', 'Tests automatizados'],
  },
];

const typeConfig = {
  intermediate: {
    label: 'Intermedia',
    color: 'info',
  },
  final: {
    label: 'Final',
    color: 'primary',
  },
};

export const Evaluations = () => {
  const [selectedEvaluation, setSelectedEvaluation] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [completedLimit, setCompletedLimit] = useState(5);
  const [pendingLimit, setPendingLimit] = useState(5);

  const handleAction = (evaluation: any) => {
    setSelectedEvaluation(evaluation);
    setDialogOpen(true);
  };

  const completedEvaluations = mockEvaluations.filter(e => e.status === 'completed');
  const pendingEvaluations = mockEvaluations.filter(e => e.status === 'pending');
  const averageRating = completedEvaluations.length > 0 
    ? (completedEvaluations.reduce((acc, e) => acc + (e.overallRating ?? 0), 0) / completedEvaluations.length).toFixed(1)
    : '0';

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Mis Evaluaciones
      </Typography>

      {/* Estadísticas Generales */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Box sx={{ flex: '1 1 200px', minWidth: 0 }}>
          <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" fontWeight="bold">
                {completedEvaluations.length}
              </Typography>
              <Typography variant="body2">
                Evaluaciones Completadas
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 200px', minWidth: 0 }}>
          <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" fontWeight="bold">
                {pendingEvaluations.length}
              </Typography>
              <Typography variant="body2">
                Evaluaciones Pendientes
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 200px', minWidth: 0 }}>
          <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" fontWeight="bold">
                {averageRating}
              </Typography>
              <Typography variant="body2">
                Promedio General
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 200px', minWidth: 0 }}>
          <Card sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" fontWeight="bold">
                {mockEvaluations.length}
              </Typography>
              <Typography variant="body2">
                Total Proyectos
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Evaluaciones Completadas */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 0, display: 'flex', alignItems: 'center' }}>
            <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
            Evaluaciones Completadas ({completedEvaluations.length})
          </Typography>
          <TextField
            select
            size="small"
            label="Mostrar"
            value={completedLimit}
            onChange={e => setCompletedLimit(Number(e.target.value))}
            sx={{ minWidth: 110 }}
          >
            <MenuItem value={5}>Últimos 5</MenuItem>
            <MenuItem value={10}>Últimos 10</MenuItem>
            <MenuItem value={15}>Últimos 15</MenuItem>
            <MenuItem value={20}>Últimos 20</MenuItem>
            <MenuItem value={completedEvaluations.length}>Todos</MenuItem>
          </TextField>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {completedEvaluations.slice(0, completedLimit).map((evaluation) => (
            <Box key={evaluation.id} sx={{ flex: '1 1 400px', minWidth: 0 }}>
              <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={() => handleAction(evaluation)}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {evaluation.projectTitle}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Avatar sx={{ mr: 1, bgcolor: 'primary.main', width: 24, height: 24 }}>
                          <BusinessIcon fontSize="small" />
                        </Avatar>
                        <Typography variant="body2" color="text.secondary">
                          {evaluation.company}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={typeConfig[evaluation.type as keyof typeof typeConfig].label}
                      color={typeConfig[evaluation.type as keyof typeof typeConfig].color as any}
                      size="small"
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Rating value={evaluation.overallRating} readOnly size="small" />
                    <Typography variant="body2" sx={{ ml: 1, fontWeight: 'bold' }}>
                      {evaluation.overallRating}/5
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {evaluation.comments?.substring(0, 100)}...
                  </Typography>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                    {evaluation.technologies?.slice(0, 3).map((tech: string) => (
                      <Chip key={tech} label={tech} size="small" variant="outlined" />
                    ))}
                    {evaluation.technologies?.length > 3 && (
                      <Chip label={`+${evaluation.technologies.length - 3}`} size="small" variant="outlined" />
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      {evaluation.date} • {evaluation.projectDuration}
                    </Typography>
                    <IconButton size="small" color="primary">
                      <VisibilityIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Evaluaciones Pendientes */}
      {pendingEvaluations.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 0, display: 'flex', alignItems: 'center' }}>
              <AccessTimeIcon sx={{ mr: 1, color: 'warning.main' }} />
              Evaluaciones Pendientes ({pendingEvaluations.length})
            </Typography>
            <TextField
              select
              size="small"
              label="Mostrar"
              value={pendingLimit}
              onChange={e => setPendingLimit(Number(e.target.value))}
              sx={{ minWidth: 110 }}
            >
              <MenuItem value={5}>Últimos 5</MenuItem>
              <MenuItem value={10}>Últimos 10</MenuItem>
              <MenuItem value={15}>Últimos 15</MenuItem>
              <MenuItem value={20}>Últimos 20</MenuItem>
              <MenuItem value={pendingEvaluations.length}>Todos</MenuItem>
            </TextField>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {pendingEvaluations.slice(0, pendingLimit).map((evaluation) => (
              <Box key={evaluation.id} sx={{ flex: '1 1 400px', minWidth: 0 }}>
                <Card sx={{ height: '100%', opacity: 0.7 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          {evaluation.projectTitle}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Avatar sx={{ mr: 1, bgcolor: 'primary.main', width: 24, height: 24 }}>
                            <BusinessIcon fontSize="small" />
                          </Avatar>
                          <Typography variant="body2" color="text.secondary">
                            {evaluation.company}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        label="Pendiente"
                        color="warning"
                        size="small"
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Evaluación en proceso...
                    </Typography>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                      {evaluation.technologies?.slice(0, 3).map((tech: string) => (
                        <Chip key={tech} label={tech} size="small" variant="outlined" />
                      ))}
                    </Box>

                    <Typography variant="caption" color="text.secondary">
                      {evaluation.date} • {evaluation.projectDuration}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        </Paper>
      )}

      {/* Dialog para mostrar detalles de la evaluación */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">
              Detalles de la Evaluación
            </Typography>
            <Chip
              label={selectedEvaluation?.status === 'completed' ? 'Completada' : 'Pendiente'}
              color={selectedEvaluation?.status === 'completed' ? 'success' : 'warning'}
              size="small"
            />
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedEvaluation && (
            <Box>
              <Typography variant="h5" gutterBottom>
                {selectedEvaluation.projectTitle}
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Información General y Calificación */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  {/* Información General */}
                  <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Información del Proyecto
                        </Typography>
                        <List dense>
                          <ListItem>
                            <ListItemIcon>
                              <BusinessIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Empresa"
                              secondary={selectedEvaluation.company}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <PersonIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Evaluador"
                              secondary={`${selectedEvaluation.evaluator} - ${selectedEvaluation.evaluatorRole}`}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <ScheduleIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Fecha"
                              secondary={selectedEvaluation.date}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <AssignmentIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Duración"
                              secondary={selectedEvaluation.projectDuration}
                            />
                          </ListItem>
                        </List>
                      </CardContent>
                    </Card>
                  </Box>

                  {/* Calificación General */}
                  <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Calificación General
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Rating value={selectedEvaluation.overallRating} readOnly size="large" />
                          <Typography variant="h4" sx={{ ml: 2, fontWeight: 'bold' }}>
                            {selectedEvaluation.overallRating}/5
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          Evaluación {typeConfig[selectedEvaluation.type as keyof typeof typeConfig].label}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                </Box>

                {/* Categorías de Evaluación */}
                <Box>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Evaluación por Categorías
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        {selectedEvaluation.categories?.map((category: any, index: number) => (
                          <Box key={index} sx={{ flex: '1 1 250px', minWidth: 0 }}>
                            <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                {category.icon}
                                <Typography variant="body2" sx={{ ml: 1, fontWeight: 'bold' }}>
                                  {category.name}
                                </Typography>
                              </Box>
                              <Rating value={category.rating} readOnly size="small" />
                              <Typography variant="body2" color="text.secondary">
                                {category.rating}/5
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Box>

                {/* Tecnologías y Entregables */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Tecnologías Utilizadas
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {selectedEvaluation.technologies?.map((tech: string) => (
                            <Chip key={tech} label={tech} color="primary" variant="outlined" />
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>

                  <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Entregables
                        </Typography>
                        <List dense>
                          {selectedEvaluation.deliverables?.map((deliverable: string, index: number) => (
                            <ListItem key={index}>
                              <ListItemIcon>
                                <CheckCircleIcon color="success" />
                              </ListItemIcon>
                              <ListItemText primary={deliverable} />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </Box>
                </Box>

                {/* Comentarios */}
                {selectedEvaluation.comments && (
                  <Box>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Comentarios del Evaluador
                        </Typography>
                        <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 3 }}>
                          "{selectedEvaluation.comments}"
                        </Typography>

                        {selectedEvaluation.strengths && (
                          <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle1" gutterBottom sx={{ color: 'success.main' }}>
                              Fortalezas
                            </Typography>
                            <List dense>
                              {selectedEvaluation.strengths.map((strength: string, index: number) => (
                                <ListItem key={index}>
                                  <ListItemIcon>
                                    <CheckCircleIcon color="success" />
                                  </ListItemIcon>
                                  <ListItemText primary={strength} />
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        )}

                        {selectedEvaluation.areasForImprovement && (
                          <Box>
                            <Typography variant="subtitle1" gutterBottom sx={{ color: 'warning.main' }}>
                              Áreas de Mejora
                            </Typography>
                            <List dense>
                              {selectedEvaluation.areasForImprovement.map((area: string, index: number) => (
                                <ListItem key={index}>
                                  <ListItemIcon>
                                    <AccessTimeIcon color="warning" />
                                  </ListItemIcon>
                                  <ListItemText primary={area} />
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Evaluations; 