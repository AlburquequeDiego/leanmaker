import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Publish as PublishIcon,
  EditNote as DraftIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  EmojiEvents as EmojiEventsIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationOnIcon,
  Code as CodeIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { challengeService } from '../../../../services/challenge.service';
import { CollectiveChallenge } from '../../../../types';

interface ChallengeHistoryProps {
  onEdit?: (challenge: CollectiveChallenge) => void;
  onDelete?: (challengeId: string) => void;
}

export const ChallengeHistory: React.FC<ChallengeHistoryProps> = ({
  onEdit,
  onDelete
}) => {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<CollectiveChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<CollectiveChallenge | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      const data = await challengeService.getCompanyChallenges();
      setChallenges(data.challenges);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, challenge: CollectiveChallenge) => {
    setAnchorEl(event.currentTarget);
    setSelectedChallenge(challenge);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedChallenge(null);
  };

  const handleEdit = () => {
    if (selectedChallenge && onEdit) {
      onEdit(selectedChallenge);
    }
    handleMenuClose();
  };

  const handleView = () => {
    if (selectedChallenge) {
      navigate(`/dashboard/company/challenges/${selectedChallenge.id}`);
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedChallenge) return;

    try {
      setDeleting(true);
      await challengeService.deleteChallenge(selectedChallenge.id);
      await loadChallenges();
      setDeleteDialogOpen(false);
      if (onDelete) {
        onDelete(selectedChallenge.id);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'active':
        return 'primary';
      case 'draft':
        return 'default';
      case 'completed':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published':
        return 'Publicado';
      case 'active':
        return 'Activo';
      case 'draft':
        return 'Borrador';
      case 'completed':
        return 'Completado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <PublishIcon />;
      case 'active':
        return <TrendingUpIcon />;
      case 'draft':
        return <DraftIcon />;
      case 'completed':
        return <CheckCircleIcon />;
      case 'cancelled':
        return <CancelIcon />;
      default:
        return <EmojiEventsIcon />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const activeChallenges = challenges.filter(c => c.status === 'active' || c.status === 'published');
  const allChallenges = challenges;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
        Historial de Desafíos
      </Typography>

      <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
        <Tab label={`Desafíos en Marcha (${activeChallenges.length})`} />
        <Tab label={`Todos los Desafíos (${allChallenges.length})`} />
      </Tabs>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {tabValue === 0 && (
        <Box>
          {activeChallenges.length === 0 ? (
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <EmojiEventsIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No hay desafíos en marcha
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Los desafíos activos y publicados aparecerán aquí
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {activeChallenges.map((challenge) => (
                <Grid item xs={12} md={6} lg={4} key={challenge.id}>
                  <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" component="h3" sx={{ flexGrow: 1, mr: 1 }}>
                          {challenge.title}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, challenge)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Chip
                          icon={getStatusIcon(challenge.status)}
                          label={getStatusLabel(challenge.status)}
                          color={getStatusColor(challenge.status) as any}
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        <Chip
                          label={challenge.period_type}
                          variant="outlined"
                          size="small"
                        />
                      </Box>

                      <Typography variant="body2" color="text.secondary" paragraph>
                        {challenge.description.substring(0, 120)}...
                      </Typography>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Equipos:
                        </Typography>
                        <Typography variant="body2">
                          {challenge.current_teams} / {challenge.max_teams}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Modalidad:
                        </Typography>
                        <Typography variant="body2">
                          {challenge.modality}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Duración:
                        </Typography>
                        <Typography variant="body2">
                          {challenge.duration_weeks} semanas
                        </Typography>
                      </Box>
                    </CardContent>

                    <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {challenge.applications_count} aplicaciones • {challenge.views_count} vistas
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => navigate(`/dashboard/company/challenges/${challenge.id}`)}
                      >
                        Ver
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {tabValue === 1 && (
        <Box>
          {allChallenges.length === 0 ? (
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <EmojiEventsIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No hay desafíos creados
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Crea tu primer desafío colectivo para comenzar
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Box>
              {allChallenges.map((challenge) => (
                <Accordion key={challenge.id} sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" component="h3">
                          {challenge.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {challenge.academic_year} • {challenge.semester}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          icon={getStatusIcon(challenge.status)}
                          label={getStatusLabel(challenge.status)}
                          color={getStatusColor(challenge.status) as any}
                          size="small"
                        />
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMenuOpen(e, challenge);
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                          Información Básica
                        </Typography>
                        <List dense>
                          <ListItem>
                            <ListItemIcon>
                              <EmojiEventsIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Título"
                              secondary={challenge.title}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <SchoolIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Año Académico"
                              secondary={`${challenge.academic_year} • ${challenge.semester}`}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <TrendingUpIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Tipo de Período"
                              secondary={challenge.period_type}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <LocationOnIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Modalidad"
                              secondary={challenge.modality}
                            />
                          </ListItem>
                        </List>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                          Configuración de Equipos
                        </Typography>
                        <List dense>
                          <ListItem>
                            <ListItemIcon>
                              <PeopleIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Equipos Máximos"
                              secondary={`${challenge.max_teams} equipos`}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <PeopleIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Estudiantes por Equipo"
                              secondary={`${challenge.students_per_team} estudiantes`}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <AccessTimeIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Duración"
                              secondary={`${challenge.duration_weeks} semanas`}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <ScheduleIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Horas por Semana"
                              secondary={`${challenge.hours_per_week} horas`}
                            />
                          </ListItem>
                        </List>
                      </Grid>

                      <Grid item xs={12}>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                          Descripción
                        </Typography>
                        <Typography variant="body2" paragraph>
                          {challenge.description}
                        </Typography>
                      </Grid>

                      <Grid item xs={12}>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                          Requisitos
                        </Typography>
                        <Typography variant="body2" paragraph>
                          {challenge.requirements}
                        </Typography>
                      </Grid>

                      {challenge.required_skills && challenge.required_skills.length > 0 && (
                        <Grid item xs={12}>
                          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                            Habilidades Requeridas
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {challenge.required_skills.map((skill, index) => (
                              <Chip key={index} label={skill} variant="outlined" size="small" />
                            ))}
                          </Box>
                        </Grid>
                      )}

                      {challenge.technologies && challenge.technologies.length > 0 && (
                        <Grid item xs={12}>
                          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                            Tecnologías
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {challenge.technologies.map((tech, index) => (
                              <Chip key={index} label={tech} color="primary" size="small" />
                            ))}
                          </Box>
                        </Grid>
                      )}

                      <Grid item xs={12}>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                          Fechas Clave
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">
                              Inicio Inscripción:
                            </Typography>
                            <Typography variant="body2">
                              {formatDate(challenge.registration_start)}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">
                              Fin Inscripción:
                            </Typography>
                            <Typography variant="body2">
                              {formatDate(challenge.registration_end)}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">
                              Inicio Desafío:
                            </Typography>
                            <Typography variant="body2">
                              {formatDate(challenge.challenge_start)}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">
                              Fin Desafío:
                            </Typography>
                            <Typography variant="body2">
                              {formatDate(challenge.challenge_end)}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Grid>

                      <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Creado: {formatDate(challenge.created_at)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {challenge.applications_count} aplicaciones • {challenge.views_count} vistas
                            </Typography>
                          </Box>
                          <Button
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={() => navigate(`/dashboard/company/challenges/${challenge.id}`)}
                          >
                            Ver Detalles
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* Menú de acciones */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleView}>
          <VisibilityIcon sx={{ mr: 1 }} />
          Ver Detalles
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Eliminar
        </MenuItem>
      </Menu>

      {/* Diálogo de confirmación de eliminación */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que quieres eliminar el desafío "{selectedChallenge?.title}"?
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={20} /> : null}
          >
            {deleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
