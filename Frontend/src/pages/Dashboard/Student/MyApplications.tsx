import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  Business as BusinessIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

// Mock de aplicaciones
const mockApplications = [
  {
    id: '1',
    projectTitle: 'Desarrollo de Aplicación Web',
    company: 'Tech Solutions',
    appliedAt: '2024-06-01',
    status: 'pending',
    description: 'Desarrollo de una aplicación web full-stack utilizando React y Node.js.',
    requirements: ['React', 'Node.js', 'MongoDB'],
    duration: '3 meses',
  },
  {
    id: '2',
    projectTitle: 'Análisis de Datos',
    company: 'Data Analytics Corp',
    appliedAt: '2024-05-28',
    status: 'accepted',
    description: 'Proyecto de análisis de datos y visualización para dashboard empresarial.',
    requirements: ['Python', 'Pandas', 'Power BI'],
    duration: '2 meses',
  },
  {
    id: '3',
    projectTitle: 'Diseño de UI/UX',
    company: 'Creative Design',
    appliedAt: '2024-05-25',
    status: 'rejected',
    description: 'Diseño de interfaz de usuario y experiencia para aplicación móvil.',
    requirements: ['Figma', 'Adobe XD', 'UI/UX'],
    duration: '1 mes',
  },
];

const statusConfig = {
  pending: {
    label: 'Pendiente',
    color: 'warning',
    icon: <AccessTimeIcon />,
  },
  accepted: {
    label: 'Aceptada',
    color: 'success',
    icon: <CheckCircleIcon />,
  },
  rejected: {
    label: 'Rechazada',
    color: 'error',
    icon: <CancelIcon />,
  },
};

export default function MyApplications() {
  const [applications, setApplications] = useState(mockApplications);
  const [selectedTab, setSelectedTab] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const filteredApplications = applications.filter(app => 
    selectedTab === 'all' || app.status === selectedTab
  );

  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    setSelectedTab(newValue);
  };

  const handleDeleteClick = (id: string) => {
    setSelectedApplication(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedApplication) {
      setApplications(prev => prev.filter(app => app.id !== selectedApplication));
      setDeleteDialogOpen(false);
      setSelectedApplication(null);
    }
  };

  const getStatusCount = (status: string) => {
    return applications.filter(app => app.status === status).length;
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Mis Aplicaciones
      </Typography>

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
            label={`Todas (${applications.length})`} 
            value="all"
          />
          <Tab 
            label={`Pendientes (${getStatusCount('pending')})`} 
            value="pending"
          />
          <Tab 
            label={`Aceptadas (${getStatusCount('accepted')})`} 
            value="accepted"
          />
          <Tab 
            label={`Rechazadas (${getStatusCount('rejected')})`} 
            value="rejected"
          />
        </Tabs>
      </Paper>

      {/* Lista de aplicaciones */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        {filteredApplications.map((application) => (
          <Box key={application.id}>
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
                    {application.projectTitle}
                  </Typography>
                  <Chip
                    icon={statusConfig[application.status as keyof typeof statusConfig].icon}
                    label={statusConfig[application.status as keyof typeof statusConfig].label}
                    color={statusConfig[application.status as keyof typeof statusConfig].color as any}
                    size="small"
                  />
                </Stack>

                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                  <BusinessIcon color="action" fontSize="small" />
                  <Typography variant="body2" color="text.secondary">
                    {application.company}
                  </Typography>
                </Stack>

                <Typography variant="body2" color="text.secondary" paragraph>
                  {application.description}
                </Typography>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mb={2}>
                  {application.requirements.map((req, index) => (
                    <Chip
                      key={index}
                      label={req}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Aplicado el {new Date(application.appliedAt).toLocaleDateString('es-ES')}
                  </Typography>
                  {application.status === 'pending' && (
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeleteClick(application.id)}
                    >
                      Cancelar
                    </Button>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Diálogo de confirmación de eliminación */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Cancelar Aplicación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas cancelar esta aplicación? Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>No, mantener</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Sí, cancelar
          </Button>
        </DialogActions>
      </Dialog>

      {filteredApplications.length === 0 && (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No hay aplicaciones {selectedTab !== 'all' ? `con estado ${statusConfig[selectedTab as keyof typeof statusConfig]?.label.toLowerCase()}` : ''}.
          </Typography>
        </Paper>
      )}
    </Box>
  );
} 