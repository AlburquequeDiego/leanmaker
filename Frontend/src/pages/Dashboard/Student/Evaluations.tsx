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
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  Star as StarIcon,
  StarHalf as StarHalfIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';

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

export default function Evaluations() {
  const [evaluations] = useState(mockEvaluations);
  const [selectedTab, setSelectedTab] = useState('all');
  const [selectedEvaluation, setSelectedEvaluation] = useState<string | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const filteredEvaluations = evaluations.filter(evaluation => 
    selectedTab === 'all' || evaluation.status === selectedTab
  );

  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    setSelectedTab(newValue);
  };

  const handleViewDetails = (id: string) => {
    setSelectedEvaluation(id);
    setDetailsDialogOpen(true);
  };

  const getSelectedEvaluation = () => {
    return evaluations.find(e => e.id === selectedEvaluation);
  };

  const getStatusCount = (status: string) => {
    return evaluations.filter(evaluation => evaluation.status === status).length;
  };

  // Calcular estadísticas
  const completedEvaluations = evaluations.filter(e => e.status === 'completed');
  const averageRating = completedEvaluations.length > 0
    ? completedEvaluations.reduce((acc, curr) => acc + (curr.overallRating || 0), 0) / completedEvaluations.length
    : 0;

  return (
    <DashboardLayout userRole="student">
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Evaluaciones
        </Typography>

        {/* Estadísticas */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, 
          gap: 3, 
          mb: 4 
        }}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Stack spacing={1}>
              <Typography variant="subtitle2" color="text.secondary">
                Evaluaciones Completadas
              </Typography>
              <Typography variant="h4">
                {completedEvaluations.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                de {evaluations.length} totales
              </Typography>
            </Stack>
          </Paper>

          <Paper sx={{ p: 2, height: '100%' }}>
            <Stack spacing={1}>
              <Typography variant="subtitle2" color="text.secondary">
                Calificación Promedio
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="h4">
                  {averageRating.toFixed(1)}
                </Typography>
                <Rating 
                  value={averageRating} 
                  precision={0.5} 
                  readOnly 
                  size="small"
                />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                basado en {completedEvaluations.length} evaluaciones
              </Typography>
            </Stack>
          </Paper>

          <Paper sx={{ p: 2, height: '100%' }}>
            <Stack spacing={1}>
              <Typography variant="subtitle2" color="text.secondary">
                Evaluaciones Pendientes
              </Typography>
              <Typography variant="h4">
                {evaluations.filter(e => e.status === 'pending').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                por completar
              </Typography>
            </Stack>
          </Paper>
        </Box>

        {/* Tabs de filtrado */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab 
              label={`Todas (${evaluations.length})`} 
              value="all"
            />
            <Tab 
              label={`Completadas (${getStatusCount('completed')})`} 
              value="completed"
            />
            <Tab 
              label={`Pendientes (${getStatusCount('pending')})`} 
              value="pending"
            />
          </Tabs>
        </Paper>

        {/* Lista de evaluaciones */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          {filteredEvaluations.map((evaluation) => (
            <Box key={evaluation.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  '&:hover': {
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Typography variant="h6" component="div" sx={{ pr: 4 }}>
                      {evaluation.projectTitle}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Chip
                        icon={statusConfig[evaluation.status as keyof typeof statusConfig].icon}
                        label={statusConfig[evaluation.status as keyof typeof statusConfig].label}
                        color={statusConfig[evaluation.status as keyof typeof statusConfig].color as any}
                        size="small"
                      />
                      <Chip
                        label={typeConfig[evaluation.type as keyof typeof typeConfig].label}
                        color={typeConfig[evaluation.type as keyof typeof typeConfig].color as any}
                        size="small"
                      />
                    </Stack>
                  </Stack>

                  <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                    <BusinessIcon color="action" fontSize="small" />
                    <Typography variant="body2" color="text.secondary">
                      {evaluation.company}
                    </Typography>
                  </Stack>

                  <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                    <PersonIcon color="action" fontSize="small" />
                    <Typography variant="body2" color="text.secondary">
                      Evaluador: {evaluation.evaluator} ({evaluation.evaluatorRole})
                    </Typography>
                  </Stack>

                  {evaluation.status === 'completed' && (
                    <Stack spacing={2}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="body2" color="text.secondary">
                          Calificación:
                        </Typography>
                        <Rating 
                          value={evaluation.overallRating || 0} 
                          precision={0.5} 
                          readOnly 
                          size="small"
                        />
                        <Typography variant="body2" color="text.secondary">
                          ({evaluation.overallRating?.toFixed(1)})
                        </Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {evaluation.comments}
                      </Typography>
                    </Stack>
                  )}

                  <Divider sx={{ my: 2 }} />

                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Fecha: {new Date(evaluation.date).toLocaleDateString('es-ES')}
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleViewDetails(evaluation.id)}
                    >
                      Ver Detalles
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>

        {/* Diálogo de detalles */}
        <Dialog
          open={detailsDialogOpen}
          onClose={() => setDetailsDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          {selectedEvaluation && getSelectedEvaluation() && (
            <>
              <DialogTitle>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">
                      {getSelectedEvaluation()?.projectTitle}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Chip
                        icon={statusConfig[getSelectedEvaluation()!.status as keyof typeof statusConfig].icon}
                        label={statusConfig[getSelectedEvaluation()!.status as keyof typeof statusConfig].label}
                        color={statusConfig[getSelectedEvaluation()!.status as keyof typeof statusConfig].color as any}
                        size="small"
                      />
                      <Chip
                        label={typeConfig[getSelectedEvaluation()!.type as keyof typeof typeConfig].label}
                        color={typeConfig[getSelectedEvaluation()!.type as keyof typeof typeConfig].color as any}
                        size="small"
                      />
                    </Stack>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2">
                        {getSelectedEvaluation()?.evaluator}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {getSelectedEvaluation()?.evaluatorRole} - {getSelectedEvaluation()?.company}
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </DialogTitle>
              <DialogContent>
                {getSelectedEvaluation()?.status === 'completed' ? (
                  <Stack spacing={3}>
                    {/* Calificación general */}
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Calificación General
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography variant="h4">
                          {getSelectedEvaluation()?.overallRating?.toFixed(1)}
                        </Typography>
                        <Rating 
                          value={getSelectedEvaluation()?.overallRating || 0} 
                          precision={0.5} 
                          readOnly 
                          size="large"
                        />
                      </Stack>
                    </Box>

                    {/* Calificaciones por categoría */}
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Calificaciones por Categoría
                      </Typography>
                      <Stack spacing={2}>
                        {getSelectedEvaluation()?.categories.map((category, index) => (
                          <Box key={index}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                              <Typography variant="body2">
                                {category.name}
                              </Typography>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Rating 
                                  value={category.rating || 0} 
                                  precision={0.5} 
                                  readOnly 
                                  size="small"
                                />
                                <Typography variant="body2" color="text.secondary">
                                  ({category.rating?.toFixed(1)})
                                </Typography>
                              </Stack>
                            </Stack>
                            <LinearProgress 
                              variant="determinate" 
                              value={(category.rating || 0) * 20} 
                              color="primary"
                            />
                          </Box>
                        ))}
                      </Stack>
                    </Box>

                    {/* Comentarios */}
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Comentarios
                      </Typography>
                      <Typography variant="body2" paragraph>
                        {getSelectedEvaluation()?.comments}
                      </Typography>
                    </Box>

                    {/* Fortalezas */}
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Fortalezas
                      </Typography>
                      <Stack spacing={1}>
                        {getSelectedEvaluation()?.strengths?.map((strength, index) => (
                          <Stack key={index} direction="row" spacing={1} alignItems="center">
                            <StarIcon color="success" fontSize="small" />
                            <Typography variant="body2">
                              {strength}
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>
                    </Box>

                    {/* Áreas de mejora */}
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Áreas de Mejora
                      </Typography>
                      <Stack spacing={1}>
                        {getSelectedEvaluation()?.areasForImprovement?.map((area, index) => (
                          <Stack key={index} direction="row" spacing={1} alignItems="center">
                            <StarHalfIcon color="warning" fontSize="small" />
                            <Typography variant="body2">
                              {area}
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>
                    </Box>
                  </Stack>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <AccessTimeIcon color="warning" sx={{ fontSize: 48, mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Evaluación Pendiente
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Esta evaluación será completada por el evaluador en la fecha programada.
                    </Typography>
                  </Box>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDetailsDialogOpen(false)}>
                  Cerrar
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {filteredEvaluations.length === 0 && (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No hay evaluaciones {selectedTab !== 'all' ? `con estado ${statusConfig[selectedTab as keyof typeof statusConfig]?.label.toLowerCase()}` : ''}.
            </Typography>
          </Paper>
        )}
      </Box>
    </DashboardLayout>
  );
} 