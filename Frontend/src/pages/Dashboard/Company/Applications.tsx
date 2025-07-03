import React, { useState, useEffect } from 'react';
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
import { apiService } from '../../../services/api.service';

interface Application {
  id: string;
  project_id: string;
  project_title: string;
  student_id: string;
  student_name: string;
  student_email: string;
  student_phone: string;
  student_avatar: string;
  api_level: number;
  skills: string[];
  experience: string;
  portfolio: string;
  github: string;
  linkedin: string;
  status: 'pending' | 'accepted' | 'rejected' | 'interviewed';
  rating: number;
  applied_at: string;
  cover_letter: string;
  interview_date?: string;
  interview_notes?: string;
}

const cantidadOpciones = [5, 10, 20, 50, 'todas'];

export const CompanyApplications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);

  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showInterviewDialog, setShowInterviewDialog] = useState(false);
  const [interviewData, setInterviewData] = useState({ date: '', notes: '' });
  const [cantidadPorTab, setCantidadPorTab] = useState<(number | string)[]>([5, 5, 5, 5, 5]);

  useEffect(() => {
    async function fetchApplications() {
      try {
        const data = await apiService.get('/api/project-applications/');
        setApplications(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching applications:', error);
        setApplications([]);
      }
    }
    fetchApplications();
  }, []);

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

  const handleStatusChange = async (applicationId: string, newStatus: Application['status']) => {
    try {
      const updatedApplication = await apiService.patch(`/api/project-applications/${applicationId}/`, {
        status: newStatus,
      });

      setApplications(prev =>
        prev.map(app =>
          app.id === applicationId ? (updatedApplication as Application) : app
        )
      );
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  };

  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application);
    setShowDetailDialog(true);
  };

  const handleScheduleInterview = (application: Application) => {
    setSelectedApplication(application);
    setShowInterviewDialog(true);
  };

  const handleSaveInterview = async () => {
    if (selectedApplication) {
      try {
        const updatedApplication = await apiService.patch(`/api/project-applications/${selectedApplication.id}/`, {
          status: 'interviewed',
          interview_date: interviewData.date,
          interview_notes: interviewData.notes,
        });

        setApplications(prev =>
          prev.map(app =>
            app.id === selectedApplication.id ? (updatedApplication as Application) : app
          )
        );
        setShowInterviewDialog(false);
        setInterviewData({ date: '', notes: '' });
        setSelectedApplication(null);
      } catch (error) {
        console.error('Error saving interview:', error);
      }
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
                  <Typography variant="h6">{application.student_name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {application.project_title}
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
                  <strong>API Level:</strong> {application.api_level}
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
                Postuló: {new Date(application.applied_at).toLocaleDateString()}
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
                  <Typography variant="h5">{selectedApplication.student_name}</Typography>
                  <Typography variant="body1" color="text.secondary">
                    {selectedApplication.project_title}
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
                  <Typography variant="body2">{selectedApplication.student_email}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">{selectedApplication.student_phone}</Typography>
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
                    <strong>API Level:</strong> {selectedApplication.api_level}
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
                  {selectedApplication.cover_letter}
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
                {selectedApplication.student_name} - {selectedApplication.project_title}
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