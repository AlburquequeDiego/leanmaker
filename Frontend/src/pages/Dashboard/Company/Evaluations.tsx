import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Person as PersonIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Star as StarIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';

interface Evaluation {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  projectId: string;
  projectTitle: string;
  type: 'midterm' | 'final' | 'weekly' | 'monthly';
  status: 'pending' | 'completed' | 'overdue';
  dueDate: string;
  completedDate?: string;
  technicalSkills: number;
  communication: number;
  teamwork: number;
  problemSolving: number;
  overallRating: number;
  comments: string;
  strengths: string[];
  areasForImprovement: string[];
}

const mockEvaluations: Evaluation[] = [
  {
    id: '1',
    studentId: '1',
    studentName: 'Juan Pérez',
    studentEmail: 'juan.perez@email.com',
    projectId: '1',
    projectTitle: 'Desarrollo Web Frontend',
    type: 'midterm',
    status: 'completed',
    dueDate: '2024-01-15',
    completedDate: '2024-01-14',
    technicalSkills: 4,
    communication: 3,
    teamwork: 4,
    problemSolving: 4,
    overallRating: 3.8,
    comments: 'Excelente progreso en el desarrollo frontend. Muestra buena comprensión de React y TypeScript.',
    strengths: ['React', 'TypeScript', 'Git'],
    areasForImprovement: ['Documentación', 'Testing'],
  },
  {
    id: '2',
    studentId: '2',
    studentName: 'María González',
    studentEmail: 'maria.gonzalez@email.com',
    projectId: '2',
    projectTitle: 'API REST con Django',
    type: 'final',
    status: 'pending',
    dueDate: '2024-01-25',
    technicalSkills: 5,
    communication: 4,
    teamwork: 5,
    problemSolving: 4,
    overallRating: 4.5,
    comments: 'Desarrollo excepcional del backend. API bien estructurada y documentada.',
    strengths: ['Django', 'PostgreSQL', 'REST API', 'Documentación'],
    areasForImprovement: ['Performance optimization'],
  },
  {
    id: '3',
    studentId: '3',
    studentName: 'Carlos Rodríguez',
    studentEmail: 'carlos.rodriguez@email.com',
    projectId: '3',
    projectTitle: 'App Móvil React Native',
    type: 'weekly',
    status: 'overdue',
    dueDate: '2024-01-10',
    technicalSkills: 3,
    communication: 2,
    teamwork: 3,
    problemSolving: 3,
    overallRating: 2.8,
    comments: 'Necesita mejorar la comunicación y cumplir con los deadlines establecidos.',
    strengths: ['React Native', 'JavaScript'],
    areasForImprovement: ['Comunicación', 'Puntualidad', 'Testing'],
  },
];

export const CompanyEvaluations: React.FC = () => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>(mockEvaluations);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [newEvaluation, setNewEvaluation] = useState<Partial<Evaluation>>({
    studentName: '',
    projectTitle: '',
    type: 'weekly',
    technicalSkills: 3,
    communication: 3,
    teamwork: 3,
    problemSolving: 3,
    comments: '',
    strengths: [],
    areasForImprovement: [],
  });

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'midterm':
        return 'Intermedia';
      case 'final':
        return 'Final';
      case 'weekly':
        return 'Semanal';
      case 'monthly':
        return 'Mensual';
      default:
        return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'completed':
        return 'success';
      case 'overdue':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'completed':
        return 'Completada';
      case 'overdue':
        return 'Vencida';
      default:
        return status;
    }
  };

  const calculateOverallRating = (evaluation: Partial<Evaluation>) => {
    const { technicalSkills = 0, communication = 0, teamwork = 0, problemSolving = 0 } = evaluation;
    return ((technicalSkills + communication + teamwork + problemSolving) / 4).toFixed(1);
  };

  const handleAddEvaluation = () => {
    const evaluation: Evaluation = {
      ...newEvaluation as Evaluation,
      id: Date.now().toString(),
      studentId: 'temp',
      studentEmail: 'temp@email.com',
      projectId: 'temp',
      status: 'pending',
      dueDate: new Date().toISOString().split('T')[0],
      overallRating: parseFloat(calculateOverallRating(newEvaluation)),
    };
    setEvaluations(prev => [evaluation, ...prev]);
    setShowAddDialog(false);
    setNewEvaluation({
      studentName: '',
      projectTitle: '',
      type: 'weekly',
      technicalSkills: 3,
      communication: 3,
      teamwork: 3,
      problemSolving: 3,
      comments: '',
      strengths: [],
      areasForImprovement: [],
    });
  };

  const handleCompleteEvaluation = (evaluationId: string) => {
    setEvaluations(prev =>
      prev.map(evaluation =>
        evaluation.id === evaluationId
          ? {
              ...evaluation,
              status: 'completed',
              completedDate: new Date().toISOString().split('T')[0],
            }
          : evaluation
      )
    );
  };

  const stats = {
    total: evaluations.length,
    pending: evaluations.filter(e => e.status === 'pending').length,
    completed: evaluations.filter(e => e.status === 'completed').length,
    overdue: evaluations.filter(e => e.status === 'overdue').length,
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Evaluaciones
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowAddDialog(true)}
        >
          Nueva Evaluación
        </Button>
      </Box>

      {/* Estadísticas */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(25% - 12px)' } }}>
          <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AssessmentIcon sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="h4">{stats.total}</Typography>
                  <Typography variant="body2">Total</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(25% - 12px)' } }}>
          <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ScheduleIcon sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="h4">{stats.pending}</Typography>
                  <Typography variant="body2">Pendientes</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(25% - 12px)' } }}>
          <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircleIcon sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="h4">{stats.completed}</Typography>
                  <Typography variant="body2">Completadas</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(25% - 12px)' } }}>
          <Card sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <WarningIcon sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="h4">{stats.overdue}</Typography>
                  <Typography variant="body2">Vencidas</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Lista de Evaluaciones */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {evaluations.map((evaluation) => (
          <Box key={evaluation.id} sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)', lg: '1 1 calc(33.333% - 16px)' } }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                    <PersonIcon />
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {evaluation.studentName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {evaluation.studentEmail}
                    </Typography>
                  </Box>
                  <Box>
                    <Chip
                      label={getStatusLabel(evaluation.status)}
                      color={getStatusColor(evaluation.status) as any}
                      size="small"
                    />
                  </Box>
                </Box>

                <Typography variant="body1" gutterBottom>
                  <strong>Proyecto:</strong> {evaluation.projectTitle}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip
                    label={getTypeLabel(evaluation.type)}
                    color="primary"
                    size="small"
                    variant="outlined"
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <StarIcon sx={{ color: 'warning.main', mr: 0.5 }} />
                    <Typography variant="body2">
                      {evaluation.overallRating}
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" paragraph>
                  {evaluation.comments}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  <strong>Fecha límite:</strong> {new Date(evaluation.dueDate).toLocaleDateString()}
                </Typography>

                {evaluation.completedDate && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Completada:</strong> {new Date(evaluation.completedDate).toLocaleDateString()}
                  </Typography>
                )}
              </CardContent>
              <Box sx={{ p: 2, pt: 0 }}>
                <Button
                  size="small"
                  onClick={() => {
                    setSelectedEvaluation(evaluation);
                    setShowDetailDialog(true);
                  }}
                  sx={{ mr: 1 }}
                >
                  Ver Detalles
                </Button>
                {evaluation.status === 'pending' && (
                  <Button
                    size="small"
                    color="success"
                    onClick={() => handleCompleteEvaluation(evaluation.id)}
                  >
                    Completar
                  </Button>
                )}
              </Box>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Dialog para agregar evaluación */}
      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Nueva Evaluación</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
              <TextField
                fullWidth
                label="Nombre del Estudiante"
                value={newEvaluation.studentName}
                onChange={(e) => setNewEvaluation(prev => ({ ...prev, studentName: e.target.value }))}
                margin="normal"
              />
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
              <TextField
                fullWidth
                label="Proyecto"
                value={newEvaluation.projectTitle}
                onChange={(e) => setNewEvaluation(prev => ({ ...prev, projectTitle: e.target.value }))}
                margin="normal"
              />
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={newEvaluation.type}
                  label="Tipo"
                  onChange={(e) => setNewEvaluation(prev => ({ ...prev, type: e.target.value as Evaluation['type'] }))}
                >
                  <MenuItem value="weekly">Semanal</MenuItem>
                  <MenuItem value="monthly">Mensual</MenuItem>
                  <MenuItem value="midterm">Intermedia</MenuItem>
                  <MenuItem value="final">Final</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
              <TextField
                fullWidth
                label="Habilidades Técnicas"
                type="number"
                value={newEvaluation.technicalSkills}
                onChange={(e) => setNewEvaluation(prev => ({ ...prev, technicalSkills: parseInt(e.target.value) }))}
                margin="normal"
                inputProps={{ min: 1, max: 5 }}
              />
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
              <TextField
                fullWidth
                label="Comunicación"
                type="number"
                value={newEvaluation.communication}
                onChange={(e) => setNewEvaluation(prev => ({ ...prev, communication: parseInt(e.target.value) }))}
                margin="normal"
                inputProps={{ min: 1, max: 5 }}
              />
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
              <TextField
                fullWidth
                label="Trabajo en Equipo"
                type="number"
                value={newEvaluation.teamwork}
                onChange={(e) => setNewEvaluation(prev => ({ ...prev, teamwork: parseInt(e.target.value) }))}
                margin="normal"
                inputProps={{ min: 1, max: 5 }}
              />
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
              <TextField
                fullWidth
                label="Resolución de Problemas"
                type="number"
                value={newEvaluation.problemSolving}
                onChange={(e) => setNewEvaluation(prev => ({ ...prev, problemSolving: parseInt(e.target.value) }))}
                margin="normal"
                inputProps={{ min: 1, max: 5 }}
              />
            </Box>
            <Box sx={{ flex: '1 1 100%' }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Comentarios"
                value={newEvaluation.comments}
                onChange={(e) => setNewEvaluation(prev => ({ ...prev, comments: e.target.value }))}
                margin="normal"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>Cancelar</Button>
          <Button onClick={handleAddEvaluation} variant="contained">
            Crear Evaluación
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de detalles */}
      <Dialog open={showDetailDialog} onClose={() => setShowDetailDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Detalles de la Evaluación</DialogTitle>
        <DialogContent>
          {selectedEvaluation && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ mr: 2, width: 60, height: 60, bgcolor: 'primary.main' }}>
                  <PersonIcon sx={{ fontSize: 30 }} />
                </Avatar>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {selectedEvaluation.studentName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedEvaluation.studentEmail}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Rating value={selectedEvaluation.overallRating} readOnly />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      ({selectedEvaluation.overallRating})
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Typography variant="h6" gutterBottom>
                Proyecto: {selectedEvaluation.projectTitle}
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Chip label={getTypeLabel(selectedEvaluation.type)} color="primary" />
                <Chip
                  label={getStatusLabel(selectedEvaluation.status)}
                  color={getStatusColor(selectedEvaluation.status) as any}
                />
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Habilidades Técnicas
                  </Typography>
                  <Rating value={selectedEvaluation.technicalSkills} readOnly />
                </Box>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Comunicación
                  </Typography>
                  <Rating value={selectedEvaluation.communication} readOnly />
                </Box>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Trabajo en Equipo
                  </Typography>
                  <Rating value={selectedEvaluation.teamwork} readOnly />
                </Box>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Resolución de Problemas
                  </Typography>
                  <Rating value={selectedEvaluation.problemSolving} readOnly />
                </Box>
              </Box>

              <Typography variant="h6" gutterBottom>
                Comentarios
              </Typography>
              <Typography variant="body2" paragraph>
                {selectedEvaluation.comments}
              </Typography>

              {selectedEvaluation.strengths.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Fortalezas
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedEvaluation.strengths.map((strength, index) => (
                      <Chip key={index} label={strength} color="success" size="small" />
                    ))}
                  </Box>
                </Box>
              )}

              {selectedEvaluation.areasForImprovement.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Áreas de Mejora
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedEvaluation.areasForImprovement.map((area, index) => (
                      <Chip key={index} label={area} color="warning" size="small" />
                    ))}
                  </Box>
                </Box>
              )}

              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Fecha límite:</strong> {new Date(selectedEvaluation.dueDate).toLocaleDateString()}
                </Typography>
                {selectedEvaluation.completedDate && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Completada:</strong> {new Date(selectedEvaluation.completedDate).toLocaleDateString()}
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetailDialog(false)}>Cerrar</Button>
          {selectedEvaluation?.status === 'pending' && (
            <Button
              onClick={() => {
                handleCompleteEvaluation(selectedEvaluation.id);
                setShowDetailDialog(false);
              }}
              variant="contained"
              color="success"
            >
              Completar Evaluación
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CompanyEvaluations;
