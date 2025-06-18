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
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Star as StarIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Language as LanguageIcon,
  GitHub as GitHubIcon,
  LinkedIn as LinkedInIcon,
} from '@mui/icons-material';

interface Application {
  id: string;
  projectId: string;
  projectTitle: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  studentAvatar: string;
  apiLevel: number;
  skills: string[];
  experience: string;
  portfolio: string;
  github: string;
  linkedin: string;
  status: 'pending' | 'accepted' | 'rejected' | 'interviewed';
  rating: number;
  appliedAt: string;
  coverLetter: string;
  interviewDate?: string;
  interviewNotes?: string;
}

const mockApplications: Application[] = [
  {
    id: '1',
    projectId: '1',
    projectTitle: 'Desarrollo Web Frontend',
    studentId: '1',
    studentName: 'Juan Pérez',
    studentEmail: 'juan.perez@email.com',
    studentPhone: '+56 9 1234 5678',
    studentAvatar: '',
    apiLevel: 3,
    skills: ['React', 'TypeScript', 'Material-UI', 'Node.js'],
    experience: '2 años desarrollando aplicaciones web',
    portfolio: 'https://juanperez.dev',
    github: 'https://github.com/juanperez',
    linkedin: 'https://linkedin.com/in/juanperez',
    status: 'pending',
    rating: 4.2,
    appliedAt: '2024-01-15T10:30:00Z',
    coverLetter: 'Me interesa mucho este proyecto porque me permitirá aplicar mis conocimientos en React y TypeScript...',
  },
  {
    id: '2',
    projectId: '1',
    projectTitle: 'Desarrollo Web Frontend',
    studentId: '2',
    studentName: 'María González',
    studentEmail: 'maria.gonzalez@email.com',
    studentPhone: '+56 9 8765 4321',
    studentAvatar: '',
    apiLevel: 4,
    skills: ['React', 'Vue.js', 'JavaScript', 'CSS', 'HTML'],
    experience: '1 año en desarrollo frontend',
    portfolio: 'https://mariagonzalez.dev',
    github: 'https://github.com/mariagonzalez',
    linkedin: 'https://linkedin.com/in/mariagonzalez',
    status: 'interviewed',
    rating: 4.5,
    appliedAt: '2024-01-14T15:20:00Z',
    coverLetter: 'Tengo experiencia en proyectos similares y me gustaría contribuir al desarrollo...',
    interviewDate: '2024-01-20T15:00:00Z',
    interviewNotes: 'Excelente candidata, muy preparada técnicamente.',
  },
  {
    id: '3',
    projectId: '2',
    projectTitle: 'API REST con Django',
    studentId: '3',
    studentName: 'Carlos Rodríguez',
    studentEmail: 'carlos.rodriguez@email.com',
    studentPhone: '+56 9 5555 1234',
    studentAvatar: '',
    apiLevel: 4,
    skills: ['Python', 'Django', 'PostgreSQL', 'REST API'],
    experience: '3 años en desarrollo backend',
    portfolio: 'https://carlosrodriguez.dev',
    github: 'https://github.com/carlosrodriguez',
    linkedin: 'https://linkedin.com/in/carlosrodriguez',
    status: 'accepted',
    rating: 4.8,
    appliedAt: '2024-01-10T09:15:00Z',
    coverLetter: 'Mi experiencia con Django y APIs REST me hace un candidato ideal...',
  },
];

const cantidadOpciones = [5, 10, 20, 50, 'todas'];

export const CompanyApplications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>(mockApplications);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showInterviewDialog, setShowInterviewDialog] = useState(false);
  const [interviewData, setInterviewData] = useState({ date: '', notes: '' });

  // Filtros de cantidad por tab
  const [cantidadPorTab, setCantidadPorTab] = useState<(number | string)[]>([5, 5, 5, 5, 5]);

  const handleCantidadChange = (tabIdx: number, value: number | string) => {
    setCantidadPorTab(prev => prev.map((v, i) => (i === tabIdx ? value : v)));
  };

  const getStatusFilter = (tabIdx: number) => {
    switch (tabIdx) {
      case 0: return undefined; // Todas
      case 1: return 'pending';
      case 2: return 'interviewed';
      case 3: return 'accepted';
      case 4: return 'rejected';
      default: return undefined;
    }
  };

  const filteredApplications = applications.filter(app => {
    const status = getStatusFilter(selectedTab);
    return status ? app.status === status : true;
  });

  const cantidadActual = cantidadPorTab[selectedTab];
  const aplicacionesMostradas = cantidadActual === 'todas' ? filteredApplications : filteredApplications.slice(0, Number(cantidadActual));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'error';
      case 'interviewed':
        return 'info';
      default:
        return 'warning';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'accepted':
        return 'Aceptada';
      case 'rejected':
        return 'Rechazada';
      case 'interviewed':
        return 'Entrevistada';
      default:
        return status;
    }
  };

  const handleStatusChange = (applicationId: string, newStatus: Application['status']) => {
    setApplications(prev =>
      prev.map(app =>
        app.id === applicationId ? { ...app, status: newStatus } : app
      )
    );
  };

  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application);
    setShowDetailDialog(true);
  };

  const handleScheduleInterview = (application: Application) => {
    setSelectedApplication(application);
    setShowInterviewDialog(true);
  };

  const handleSaveInterview = () => {
    if (selectedApplication) {
      setApplications(prev =>
        prev.map(app =>
          app.id === selectedApplication.id
            ? {
                ...app,
                status: 'interviewed',
                interviewDate: interviewData.date,
                interviewNotes: interviewData.notes,
              }
            : app
        )
      );
      setShowInterviewDialog(false);
      setInterviewData({ date: '', notes: '' });
      setSelectedApplication(null);
    }
  };

  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'pending').length,
    interviewed: applications.filter(app => app.status === 'interviewed').length,
    accepted: applications.filter(app => app.status === 'accepted').length,
    rejected: applications.filter(app => app.status === 'rejected').length,
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Revisión de Postulaciones
      </Typography>

      {/* Estadísticas */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 3 }}>
        <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AssignmentIcon sx={{ mr: 1 }} />
              <Box>
                <Typography variant="h4">{stats.total}</Typography>
                <Typography variant="body2">Total Postulaciones</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
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
        <Card sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PersonIcon sx={{ mr: 1 }} />
              <Box>
                <Typography variant="h4">{stats.interviewed}</Typography>
                <Typography variant="body2">Entrevistadas</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CheckCircleIcon sx={{ mr: 1 }} />
              <Box>
                <Typography variant="h4">{stats.accepted}</Typography>
                <Typography variant="body2">Aceptadas</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={selectedTab} onChange={(_, newValue) => setSelectedTab(newValue)}>
          <Tab label={`Todas (${stats.total})`} />
          <Tab label={`Pendientes (${stats.pending})`} />
          <Tab label={`Entrevistadas (${stats.interviewed})`} />
          <Tab label={`Aceptadas (${stats.accepted})`} />
          <Tab label={`Rechazadas (${stats.rejected})`} />
        </Tabs>
      </Paper>

      {/* Filtro de cantidad por tab */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="cantidad-label">Mostrar</InputLabel>
          <Select
            labelId="cantidad-label"
            value={cantidadActual}
            label="Mostrar"
            onChange={e => handleCantidadChange(selectedTab, e.target.value)}
          >
            {cantidadOpciones.map(opt => (
              <MenuItem key={opt} value={opt}>{opt === 'todas' ? 'Todas' : opt}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Lista de Postulaciones */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
        {aplicacionesMostradas.map((application) => (
          <Card key={application.id}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                  <PersonIcon />
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6">{application.studentName}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {application.projectTitle}
                  </Typography>
                </Box>
                <Chip
                  label={getStatusLabel(application.status)}
                  color={getStatusColor(application.status) as any}
                  size="small"
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  <strong>API Level:</strong> {application.apiLevel}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <StarIcon sx={{ fontSize: 16, color: 'warning.main', mr: 0.5 }} />
                  <Typography variant="body2">
                    {application.rating} / 5.0
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Habilidades:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {application.skills.slice(0, 3).map((skill) => (
                    <Chip key={skill} label={skill} size="small" />
                  ))}
                  {application.skills.length > 3 && (
                    <Chip label={`+${application.skills.length - 3}`} size="small" />
                  )}
                </Box>
              </Box>

              <Typography variant="caption" color="text.secondary">
                Postuló: {new Date(application.appliedAt).toLocaleDateString()}
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                onClick={() => handleViewDetails(application)}
              >
                Ver Detalles
              </Button>
              {application.status === 'pending' && (
                <Button
                  size="small"
                  color="primary"
                  onClick={() => handleScheduleInterview(application)}
                >
                  Entrevistar
                </Button>
              )}
              {application.status === 'pending' && (
                <>
                  <Button
                    size="small"
                    color="success"
                    onClick={() => handleStatusChange(application.id, 'accepted')}
                  >
                    Aceptar
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleStatusChange(application.id, 'rejected')}
                  >
                    Rechazar
                  </Button>
                </>
              )}
            </CardActions>
          </Card>
        ))}
      </Box>

      {aplicacionesMostradas.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No hay postulaciones en esta categoría
          </Typography>
        </Paper>
      )}

      {/* Dialog de Detalles */}
      <Dialog open={showDetailDialog} onClose={() => setShowDetailDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Detalles de la Postulación</DialogTitle>
        <DialogContent>
          {selectedApplication && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ width: 80, height: 80, mr: 2, bgcolor: 'primary.main' }}>
                  <PersonIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Box>
                  <Typography variant="h5">{selectedApplication.studentName}</Typography>
                  <Typography variant="body1" color="text.secondary">
                    {selectedApplication.projectTitle}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <StarIcon sx={{ color: 'warning.main', mr: 0.5 }} />
                    <Typography variant="body1">
                      {selectedApplication.rating} / 5.0
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">{selectedApplication.studentEmail}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">{selectedApplication.studentPhone}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LanguageIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">{selectedApplication.portfolio}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <GitHubIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">{selectedApplication.github}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LinkedInIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">{selectedApplication.linkedin}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2">
                    <strong>API Level:</strong> {selectedApplication.apiLevel}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  <strong>Experiencia:</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedApplication.experience}
                </Typography>
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  <strong>Habilidades:</strong>
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selectedApplication.skills.map((skill) => (
                    <Chip key={skill} label={skill} />
                  ))}
                </Box>
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  <strong>Carta de Presentación:</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedApplication.coverLetter}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetailDialog(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Entrevista */}
      <Dialog open={showInterviewDialog} onClose={() => setShowInterviewDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Programar Entrevista</DialogTitle>
        <DialogContent>
          {selectedApplication && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedApplication.studentName} - {selectedApplication.projectTitle}
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  type="datetime-local"
                  label="Fecha y Hora de la Entrevista"
                  value={interviewData.date}
                  onChange={(e) => setInterviewData(prev => ({ ...prev, date: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Notas de la Entrevista"
                  value={interviewData.notes}
                  onChange={(e) => setInterviewData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Agrega notas sobre la entrevista..."
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowInterviewDialog(false)}>Cancelar</Button>
          <Button
            onClick={handleSaveInterview}
            variant="contained"
            disabled={!interviewData.date}
          >
            Programar Entrevista
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CompanyApplications; 