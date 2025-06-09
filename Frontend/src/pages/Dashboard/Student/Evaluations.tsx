import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Stack,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Divider,
  Rating,
  LinearProgress,
  Avatar,
  Grid,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  Star as StarIcon,
  StarHalf as StarHalfIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';

// Mock de evaluaciones
const mockEvaluations = [
  {
    id: '1',
    projectTitle: 'Desarrollo de Aplicación Web',
    company: 'Tech Solutions',
    evaluator: 'Juan Pérez',
    evaluatorRole: 'Mentor Técnico',
    date: '2024-06-10',
    status: 'completed',
    type: 'intermediate',
    overallRating: 4.5,
    categories: [
      { name: 'Calidad del Código', rating: 4.5 },
      { name: 'Cumplimiento de Plazos', rating: 5 },
      { name: 'Trabajo en Equipo', rating: 4 },
      { name: 'Comunicación', rating: 4.5 },
    ],
    comments: 'Excelente trabajo en la implementación de la autenticación y el dashboard. La calidad del código es muy buena y la documentación está bien estructurada. Se sugiere mejorar la comunicación en las reuniones de equipo.',
    strengths: [
      'Buen manejo de Git y control de versiones',
      'Documentación clara y concisa',
      'Implementación eficiente de funcionalidades',
    ],
    areasForImprovement: [
      'Participación más activa en las reuniones',
      'Mejorar la cobertura de pruebas',
    ],
  },
  {
    id: '2',
    projectTitle: 'Análisis de Datos',
    company: 'Data Analytics Corp',
    evaluator: 'María García',
    evaluatorRole: 'Líder de Proyecto',
    date: '2024-06-15',
    status: 'pending',
    type: 'final',
    overallRating: null,
    categories: [
      { name: 'Análisis de Datos', rating: null },
      { name: 'Visualización', rating: null },
      { name: 'Documentación', rating: null },
      { name: 'Presentación', rating: null },
    ],
    comments: null,
    strengths: null,
    areasForImprovement: null,
  },
  {
    id: '3',
    projectTitle: 'Diseño de UI/UX',
    company: 'Creative Design',
    evaluator: 'Carlos López',
    evaluatorRole: 'Diseñador Senior',
    date: '2024-05-28',
    status: 'completed',
    type: 'intermediate',
    overallRating: 4.8,
    categories: [
      { name: 'Diseño Visual', rating: 5 },
      { name: 'Experiencia de Usuario', rating: 4.5 },
      { name: 'Prototipado', rating: 4.8 },
      { name: 'Documentación', rating: 4.5 },
    ],
    comments: 'Destacable trabajo en la creación de prototipos y la atención al detalle en el diseño visual. La documentación de los componentes es muy completa. Se sugiere profundizar en la investigación de usuarios.',
    strengths: [
      'Excelente manejo de Figma',
      'Prototipos interactivos de alta calidad',
      'Documentación detallada de componentes',
    ],
    areasForImprovement: [
      'Realizar más pruebas con usuarios',
      'Mejorar la accesibilidad de los diseños',
    ],
  },
];

const statusConfig = {
  completed: {
    label: 'Completada',
    color: 'success',
    icon: <CheckCircleIcon />,
  },
  pending: {
    label: 'Pendiente',
    color: 'warning',
    icon: <AccessTimeIcon />,
  },
};

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
  const [actionType, setActionType] = useState<'view' | 'edit' | 'delete' | null>(null);

  const handleAction = (evaluation: any, type: 'view' | 'edit' | 'delete') => {
    setSelectedEvaluation(evaluation);
    setActionType(type);
    setDialogOpen(true);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'received':
        return 'primary';
      case 'given':
        return 'success';
      default:
        return 'default';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'received':
        return 'Recibida';
      case 'given':
        return 'Dada';
      default:
        return type;
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'technical':
        return 'Técnico';
      case 'soft_skills':
        return 'Habilidades Blandas';
      case 'punctuality':
        return 'Puntualidad';
      case 'teamwork':
        return 'Trabajo en Equipo';
      case 'communication':
        return 'Comunicación';
      case 'overall':
        return 'General';
      default:
        return category;
    }
  };

  const receivedEvaluations = mockEvaluations.filter(e => e.type === 'received');
  const givenEvaluations = mockEvaluations.filter(e => e.type === 'given');

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Evaluaciones
      </Typography>

      <Grid container spacing={3}>
        {/* Evaluaciones Recibidas */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Evaluaciones Recibidas ({receivedEvaluations.length})
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Proyecto</TableCell>
                    <TableCell>Empresa</TableCell>
                    <TableCell>Calificación</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {receivedEvaluations.map((evaluation) => (
                    <TableRow key={evaluation.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {evaluation.projectTitle}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 1, bgcolor: 'primary.main', width: 20, height: 20 }}>
                            <BusinessIcon fontSize="small" />
                          </Avatar>
                          <Typography variant="body2">
                            {evaluation.company}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Rating value={evaluation.overallRating} readOnly size="small" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {evaluation.date}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleAction(evaluation, 'view')}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Evaluaciones Dadas */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Evaluaciones Dadas ({givenEvaluations.length})
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Proyecto</TableCell>
                    <TableCell>Empresa</TableCell>
                    <TableCell>Calificación</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {givenEvaluations.map((evaluation) => (
                    <TableRow key={evaluation.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {evaluation.projectTitle}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 1, bgcolor: 'primary.main', width: 20, height: 20 }}>
                            <BusinessIcon fontSize="small" />
                          </Avatar>
                          <Typography variant="body2">
                            {evaluation.company}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Rating value={evaluation.overallRating} readOnly size="small" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {evaluation.date}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleAction(evaluation, 'view')}
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleAction(evaluation, 'edit')}
                        >
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Estadísticas */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Estadísticas de Evaluaciones
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {receivedEvaluations.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Evaluaciones Recibidas
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {givenEvaluations.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Evaluaciones Dadas
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main">
                  {receivedEvaluations.length > 0 ? (receivedEvaluations.reduce((acc, e) => acc + e.overallRating, 0) / receivedEvaluations.length).toFixed(1) : '0'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Promedio Recibido
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="info.main">
                  {givenEvaluations.length > 0 ? (givenEvaluations.reduce((acc, e) => acc + e.overallRating, 0) / givenEvaluations.length).toFixed(1) : '0'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Promedio Dado
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Dialog para mostrar detalles de la evaluación */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {actionType === 'view' && 'Detalles de la Evaluación'}
          {actionType === 'edit' && 'Editar Evaluación'}
          {actionType === 'delete' && 'Eliminar Evaluación'}
        </DialogTitle>
        <DialogContent>
          {selectedEvaluation && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedEvaluation.projectTitle}
              </Typography>

              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Información General
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          <strong>Empresa:</strong> {selectedEvaluation.company}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <ScheduleIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          <strong>Fecha:</strong> {selectedEvaluation.date}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <StarIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          <strong>Tipo:</strong> {getTypeText(selectedEvaluation.type)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AssignmentIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          <strong>Categoría:</strong> {getCategoryText(selectedEvaluation.category)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Calificación
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Rating value={selectedEvaluation.overallRating} readOnly size="large" />
                        <Typography variant="h6" sx={{ ml: 2 }}>
                          {selectedEvaluation.overallRating}/5
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Evaluador:</strong> {selectedEvaluation.evaluator}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Comentario
                      </Typography>
                      <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                        "{selectedEvaluation.comments}"
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cerrar</Button>
          {actionType === 'edit' && (
            <Button variant="contained" color="primary">
              Guardar Cambios
            </Button>
          )}
          {actionType === 'delete' && (
            <Button variant="contained" color="error">
              Eliminar
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Evaluations; 