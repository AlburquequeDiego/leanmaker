import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Rating,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Add as AddIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';

interface Interview {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  projectId: string;
  projectTitle: string;
  type: 'technical' | 'behavioral' | 'final' | 'follow-up';
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  scheduledDate: string;
  duration: number; // en minutos
  location: string;
  interviewers: string[];
  notes: string;
  outcome: 'passed' | 'failed' | 'pending' | 'needs-follow-up';
  feedback: string;
  nextSteps: string;
  rating?: number;
}

const mockInterviews: Interview[] = [
  {
    id: '1',
    studentId: '1',
    studentName: 'Juan Pérez',
    studentEmail: 'juan.perez@email.com',
    studentPhone: '+56 9 1234 5678',
    projectId: '1',
    projectTitle: 'Desarrollo Web Frontend',
    type: 'technical',
    status: 'completed',
    scheduledDate: '2024-01-15T14:00:00Z',
    duration: 60,
    location: 'Sala de Reuniones A',
    interviewers: ['María González', 'Carlos Rodríguez'],
    notes: 'Entrevista técnica enfocada en React y TypeScript',
    outcome: 'passed',
    feedback: 'Excelente conocimiento técnico. Buenas habilidades de resolución de problemas.',
    nextSteps: 'Contratación inmediata para el proyecto',
  },
  {
    id: '2',
    studentId: '2',
    studentName: 'María González',
    studentEmail: 'maria.gonzalez@email.com',
    studentPhone: '+56 9 8765 4321',
    projectId: '2',
    projectTitle: 'API REST con Django',
    type: 'final',
    status: 'scheduled',
    scheduledDate: '2024-01-20T10:00:00Z',
    duration: 90,
    location: 'Zoom Meeting',
    interviewers: ['Juan Pérez'],
    notes: 'Entrevista final para evaluación completa',
    outcome: 'pending',
    feedback: '',
    nextSteps: '',
  },
  {
    id: '3',
    studentId: '3',
    studentName: 'Carlos Rodríguez',
    studentEmail: 'carlos.rodriguez@email.com',
    studentPhone: '+56 9 5555 1234',
    projectId: '3',
    projectTitle: 'App Móvil React Native',
    type: 'behavioral',
    status: 'cancelled',
    scheduledDate: '2024-01-18T16:00:00Z',
    duration: 45,
    location: 'Oficina Principal',
    interviewers: ['Ana Silva'],
    notes: 'Entrevista cancelada por el estudiante',
    outcome: 'failed',
    feedback: 'No se presentó a la entrevista',
    nextSteps: 'No proceder con la candidatura',
  },
];

export const CompanyInterviews: React.FC = () => {
  const [interviews, setInterviews] = useState<Interview[]>(mockInterviews);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    rating: 0,
    feedback: '',
  });
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newInterview, setNewInterview] = useState<Partial<Interview>>({
    studentName: '',
    projectTitle: '',
    type: 'technical',
    scheduledDate: '',
    duration: 60,
    location: '',
    interviewers: [],
    notes: '',
  });

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'technical':
        return 'Técnica';
      case 'behavioral':
        return 'Conductual';
      case 'final':
        return 'Final';
      case 'follow-up':
        return 'Seguimiento';
      default:
        return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'info';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'rescheduled':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Programada';
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      case 'rescheduled':
        return 'Reprogramada';
      default:
        return status;
    }
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'passed':
        return 'success';
      case 'failed':
        return 'error';
      case 'pending':
        return 'warning';
      case 'needs-follow-up':
        return 'info';
      default:
        return 'default';
    }
  };

  const getOutcomeLabel = (outcome: string) => {
    switch (outcome) {
      case 'passed':
        return 'Aprobada';
      case 'failed':
        return 'Reprobada';
      case 'pending':
        return 'Pendiente';
      case 'needs-follow-up':
        return 'Necesita Seguimiento';
      default:
        return outcome;
    }
  };

  const handleSaveFeedback = () => {
    if (selectedInterview) {
      setInterviews(prev =>
        prev.map(interview =>
          interview.id === selectedInterview.id
            ? { ...interview, ...feedbackData }
            : interview
        )
      );
      setShowFeedbackDialog(false);
      setSelectedInterview(null);
    }
  };

  const handleAddInterview = () => {
    const interview: Interview = {
      ...newInterview as Interview,
      id: Date.now().toString(),
      studentId: 'temp',
      studentEmail: 'temp@email.com',
      studentPhone: '+56 9 0000 0000',
      projectId: 'temp',
      status: 'scheduled',
      outcome: 'pending',
      feedback: '',
      nextSteps: '',
    };
    setInterviews(prev => [interview, ...prev]);
    setShowAddDialog(false);
    setNewInterview({
      studentName: '',
      projectTitle: '',
      type: 'technical',
      scheduledDate: '',
      duration: 60,
      location: '',
      interviewers: [],
      notes: '',
    });
  };

  const filteredInterviews = interviews.filter(interview => {
    switch (selectedTab) {
      case 0: // Todas
        return true;
      case 1: // Programadas
        return interview.status === 'scheduled';
      case 2: // Completadas
        return interview.status === 'completed';
      case 3: // Canceladas
        return interview.status === 'cancelled';
      default:
        return true;
    }
  });

  const stats = {
    total: interviews.length,
    scheduled: interviews.filter(i => i.status === 'scheduled').length,
    completed: interviews.filter(i => i.status === 'completed').length,
    cancelled: interviews.filter(i => i.status === 'cancelled').length,
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Typography variant="h4" gutterBottom>
          Entrevistas
      </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowAddDialog(true)}
        >
          Nueva Entrevista
        </Button>
      </Box>

      {/* Estadísticas */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(25% - 12px)' } }}>
          <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ScheduleIcon sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="h4">{stats.total}</Typography>
                  <Typography variant="body2">Total</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(25% - 12px)' } }}>
          <Card sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ScheduleIcon sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="h4">{stats.scheduled}</Typography>
                  <Typography variant="body2">Programadas</Typography>
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
                <EventIcon sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="h4">{stats.cancelled}</Typography>
                  <Typography variant="body2">Canceladas</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={selectedTab} onChange={(_, newValue) => setSelectedTab(newValue)}>
          <Tab label="Todas" />
          <Tab label="Programadas" />
          <Tab label="Completadas" />
          <Tab label="Canceladas" />
        </Tabs>
      </Paper>

      {/* Lista de Entrevistas */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {filteredInterviews.map((interview) => (
          <Box key={interview.id} sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)', lg: '1 1 calc(33.333% - 16px)' } }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                    <PersonIcon />
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {interview.studentName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {interview.studentEmail}
                    </Typography>
                  </Box>
                  <Chip
                    label={getStatusLabel(interview.status)}
                    color={getStatusColor(interview.status) as any}
                    size="small"
                  />
                </Box>

                <Typography variant="body1" gutterBottom>
                  <strong>Proyecto:</strong> {interview.projectTitle}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip
                    label={getTypeLabel(interview.type)}
                    color="primary"
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={`${interview.duration} min`}
                    color="secondary"
                    size="small"
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" paragraph>
                  {interview.notes}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  <strong>Fecha:</strong> {new Date(interview.scheduledDate).toLocaleString()}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  <strong>Ubicación:</strong> {interview.location}
                </Typography>

                {interview.outcome !== 'pending' && (
                  <Alert severity={interview.outcome === 'passed' ? 'success' : 'error'} sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <strong>Resultado:</strong> {getOutcomeLabel(interview.outcome)}
                    </Typography>
                  </Alert>
                )}
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  onClick={() => {
                    setSelectedInterview(interview);
                    setShowDialog(true);
                  }}
                >
                  Ver Detalles
                </Button>
                {interview.status === 'scheduled' && (
                  <Button
                    size="small"
                    color="success"
                    onClick={() => {
                      setSelectedInterview(interview);
                      setShowDialog(true);
                    }}
                  >
                    Completar
                  </Button>
                )}
              </CardActions>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Dialog para editar entrevista */}
      <Dialog open={showDialog} onClose={() => setShowDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Detalles de la Entrevista</DialogTitle>
        <DialogContent>
          {selectedInterview && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ mr: 2, width: 60, height: 60, bgcolor: 'primary.main' }}>
                  <PersonIcon sx={{ fontSize: 30 }} />
                </Avatar>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {selectedInterview.studentName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedInterview.studentEmail}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Chip
                      label={getStatusLabel(selectedInterview.status)}
                      color={getStatusColor(selectedInterview.status) as any}
                      size="small"
                    />
                    {selectedInterview.outcome !== 'pending' && (
                      <Chip
                        label={getOutcomeLabel(selectedInterview.outcome)}
                        color={getOutcomeColor(selectedInterview.outcome) as any}
                        size="small"
                />
                    )}
                  </Box>
              </Box>
              </Box>

              <Typography variant="h6" gutterBottom>
                Proyecto: {selectedInterview.projectTitle}
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Chip label={getTypeLabel(selectedInterview.type)} color="primary" />
                <Chip label={`${selectedInterview.duration} minutos`} color="secondary" />
              </Box>

              <List dense>
                <ListItem>
                  <ScheduleIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <ListItemText
                    primary="Fecha y Hora"
                    secondary={new Date(selectedInterview.scheduledDate).toLocaleString()}
                  />
                </ListItem>
                <ListItem>
                  <LocationIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <ListItemText
                    primary="Ubicación"
                    secondary={selectedInterview.location}
                  />
                </ListItem>
                <ListItem>
                  <EmailIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <ListItemText
                    primary="Email"
                    secondary={selectedInterview.studentEmail}
                />
                </ListItem>
                <ListItem>
                  <PhoneIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <ListItemText
                    primary="Teléfono"
                    secondary={selectedInterview.studentPhone}
                  />
                </ListItem>
              </List>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Entrevistadores
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {selectedInterview.interviewers.map((interviewer, index) => (
                  <Chip key={index} label={interviewer} color="primary" size="small" />
                ))}
              </Box>

              <Typography variant="h6" gutterBottom>
                Notas
              </Typography>
              <Typography variant="body2" paragraph>
                {selectedInterview.notes}
              </Typography>

              {selectedInterview.feedback && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Feedback
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {selectedInterview.feedback}
                  </Typography>
                </>
              )}

              {selectedInterview.nextSteps && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Próximos Pasos
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {selectedInterview.nextSteps}
                  </Typography>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)}>Cerrar</Button>
          {selectedInterview?.status === 'scheduled' && (
            <Button
              onClick={() => {
                // Aquí se implementaría la lógica para completar la entrevista
              setShowDialog(false);
              }}
              variant="contained"
              color="success"
            >
              Completar Entrevista
          </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Dialog para feedback */}
      <Dialog open={showFeedbackDialog} onClose={() => setShowFeedbackDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Agregar Feedback</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
            <Box sx={{ flex: '1 1 100%' }}>
              <Typography variant="body1" gutterBottom>
                Calificación:
              </Typography>
              <Rating
                value={feedbackData.rating}
                onChange={(_, value) => setFeedbackData(prev => ({ ...prev, rating: value || 0 }))}
                size="large"
              />
            </Box>
            <Box sx={{ flex: '1 1 100%' }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Comentarios"
                value={feedbackData.feedback}
                onChange={(e) => setFeedbackData(prev => ({ ...prev, feedback: e.target.value }))}
                margin="normal"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFeedbackDialog(false)}>Cancelar</Button>
          <Button onClick={handleSaveFeedback} variant="contained">
            Guardar Feedback
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para agregar entrevista */}
      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Nueva Entrevista</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
              <TextField
                fullWidth
                label="Nombre del Estudiante"
                value={newInterview.studentName}
                onChange={(e) => setNewInterview(prev => ({ ...prev, studentName: e.target.value }))}
                margin="normal"
              />
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
              <TextField
                fullWidth
                label="Proyecto"
                value={newInterview.projectTitle}
                onChange={(e) => setNewInterview(prev => ({ ...prev, projectTitle: e.target.value }))}
                margin="normal"
              />
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={newInterview.type}
                  label="Tipo"
                  onChange={(e) => setNewInterview(prev => ({ ...prev, type: e.target.value as Interview['type'] }))}
                >
                  <MenuItem value="technical">Técnica</MenuItem>
                  <MenuItem value="behavioral">Conductual</MenuItem>
                  <MenuItem value="final">Final</MenuItem>
                  <MenuItem value="follow-up">Seguimiento</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
              <TextField
                fullWidth
                label="Duración (minutos)"
                type="number"
                value={newInterview.duration}
                onChange={(e) => setNewInterview(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                margin="normal"
              />
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
              <TextField
                fullWidth
                label="Fecha y Hora"
                type="datetime-local"
                value={newInterview.scheduledDate}
                onChange={(e) => setNewInterview(prev => ({ ...prev, scheduledDate: e.target.value }))}
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
              <TextField
                fullWidth
                label="Ubicación"
                value={newInterview.location}
                onChange={(e) => setNewInterview(prev => ({ ...prev, location: e.target.value }))}
                margin="normal"
              />
            </Box>
            <Box sx={{ flex: '1 1 100%' }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notas"
                value={newInterview.notes}
                onChange={(e) => setNewInterview(prev => ({ ...prev, notes: e.target.value }))}
                margin="normal"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>Cancelar</Button>
          <Button onClick={handleAddInterview} variant="contained">
            Crear Entrevista
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CompanyInterviews;