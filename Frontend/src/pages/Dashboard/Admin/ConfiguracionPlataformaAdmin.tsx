import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Card,
  CardContent,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Stack,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Build as BuildIcon,
  Autorenew as AutorenewIcon,
  PowerSettingsNew as PowerSettingsNewIcon,
} from '@mui/icons-material';



interface SystemStatus {
  component: string;
  status: 'online' | 'warning' | 'error';
  lastCheck: string;
  responseTime: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`config-tabpanel-${index}`}
      aria-labelledby={`config-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const ConfiguracionPlataformaAdmin = () => {
  const [tabValue, setTabValue] = useState(0);

  const [systemStatus] = useState<SystemStatus[]>([
    {
      component: 'Base de Datos',
      status: 'online',
      lastCheck: '2024-01-25 10:30:00',
      responseTime: 45,
    },
    {
      component: 'Servidor Web',
      status: 'online',
      lastCheck: '2024-01-25 10:30:00',
      responseTime: 120,
    },
    {
      component: 'Almacenamiento',
      status: 'online',
      lastCheck: '2024-01-25 10:30:00',
      responseTime: 80,
    },
  ]);

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [manualDialog, setManualDialog] = useState(false);
  const [manualContent, setManualContent] = useState({ title: '', content: [] as string[] });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };



  const handleSystemAction = (action: string) => {
    setSuccessMessage(`Acción ${action} ejecutada exitosamente`);
    setShowSuccess(true);
  };

  const showManual = () => {
    const manual = {
      title: '📋 Manual del Administrador - LeanMaker',
      content: [
        '👥 GESTIÓN DE USUARIOS: Ver, buscar y filtrar todos los usuarios (estudiantes, empresas, administradores). Bloquear, suspender o activar usuarios según sea necesario.',
        '🏢 GESTIÓN DE EMPRESAS: Revisar y aprobar nuevas empresas registradas. Verificar información y proyectos activos. Bloquear empresas con actividad sospechosa.',
        '👨‍🎓 GESTIÓN DE ESTUDIANTES: Monitorear estudiantes registrados, ver sus strikes, historial de proyectos y desempeño. Suspender estudiantes con mal comportamiento.',
        '⚠️ GESTIÓN DE STRIKES: Revisar reportes de strikes enviados por empresas. Aprobar o rechazar strikes. Ver historial por estudiante. Suspender automáticamente con 3 strikes.',
        '⏰ VALIDACIÓN DE HORAS: Revisar y validar horas reportadas por estudiantes en sus proyectos. Aprobar o rechazar solicitudes de validación.',
        '📊 MONITOREO GENERAL: Supervisar actividad en tiempo real, postulaciones recientes, alertas de strikes y suspensiones. Diagnosticar problemas del sistema.',
        '⚙️ CONFIGURACIÓN: Ajustar parámetros académicos (máximo strikes, horas mínimas, nivel API por defecto). Configurar notificaciones y reportes automáticos.',
        '📄 REPORTES: Generar reportes de actividad, desempeño y estadísticas. Descargar datos en Excel/PDF. Analizar tendencias y métricas del sistema.'
      ]
    };
    setManualContent(manual);
    setManualDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircleIcon color="success" />;
      case 'warning':
        return <ErrorIcon color="warning" />; // Changed from WarningIcon to ErrorIcon
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <ErrorIcon />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online':
        return 'En Línea';
      case 'warning':
        return 'Advertencia';
      case 'error':
        return 'Error';
      default:
        return status;
    }
  };



  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4, mb: 4, px: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <BuildIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Typography variant="h4">Configuración de Plataforma</Typography>
      </Box>

      <Paper sx={{ borderRadius: 3, boxShadow: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Estado del Sistema" />
          <Tab label="Manual" />
        </Tabs>

        {/* Tab: Configuración General */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SettingsIcon color="primary" />
              Estado del Sistema
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Monitoreo del estado y funcionamiento de los componentes del sistema
            </Typography>
          </Box>

          <Stack spacing={4}>
            {/* Estado del Sistema */}
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <AutorenewIcon color="primary" />
                  Estado del Sistema
                </Typography>
                
                <Stack spacing={2}>
                  {systemStatus.map((status, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
                      {getStatusIcon(status.status)}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {status.component}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Última verificación: {status.lastCheck} | Tiempo de respuesta: {status.responseTime}ms
                        </Typography>
                      </Box>
                      <Chip 
                        label={getStatusText(status.status)} 
                        color={getStatusColor(status.status) as any}
                        size="small"
                      />
                    </Box>
                  ))}
                </Stack>
                
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={() => handleSystemAction('refresh')}
                    sx={{ 
                      borderRadius: 2,
                      px: 3,
                      py: 1,
                      fontSize: '0.9rem'
                    }}
                  >
                    🔄 Actualizar Estado
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Stack>
        </TabPanel>

        {/* Tab: Manual */}
        <TabPanel value={tabValue} index={1}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <SecurityIcon color="primary" />
                Manual del Administrador
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Guía completa para gestionar y administrar el sistema LeanMaker. Incluye todas las funcionalidades principales como gestión de usuarios, empresas, estudiantes, strikes, validación de horas y más.
              </Typography>
              
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Button 
                  variant="contained" 
                  size="large"
                  onClick={showManual}
                  startIcon={<SecurityIcon />}
                  sx={{ 
                    borderRadius: 3,
                    px: 4,
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1565c0, #1976d2)',
                      transform: 'translateY(-2px)',
                      boxShadow: 4
                    }
                  }}
                >
                  📋 Ver Manual Completo
                </Button>
              </Box>
            </CardContent>
          </Card>
        </TabPanel>
      </Paper>

      {/* Snackbar de éxito */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={4000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Paper elevation={3} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircleIcon color="success" />
          <Typography color="success.main" fontWeight={600}>
            {successMessage}
          </Typography>
        </Paper>
      </Snackbar>

      {/* Modal para el manual */}
      <Dialog 
        open={manualDialog} 
        onClose={() => setManualDialog(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: 4,
            minHeight: '400px',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            background: 'linear-gradient(135deg, #1976d2, #42a5f5 100%)',
            color: 'white',
            textAlign: 'center',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            py: 3
          }}
        >
          {manualContent.title}
        </DialogTitle>
        <DialogContent 
          dividers 
          sx={{ 
            flex: 1, 
            p: 4,
            background: 'linear-gradient(135deg, #f8fa0%, #e9ecef 100%)'
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2}}>
            {manualContent.content.map((item, index) => (
              <Box 
                key={index} 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  p: 2, 
                  borderRadius: 2,
                  backgroundColor: 'white',
                  boxShadow: 1,
                  border: '1px solid #e0e0e0',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: 3,
                    transform: 'translateY(-2px)',
                    borderColor: '#1976d2'
                  }
                }}
              >
                <Box 
                  sx={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: '50%', 
                    backgroundColor: '#1976d2', 
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    mr: 2,
                    flexShrink: 0
                  }}
                >
                  {index + 1}
                </Box>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontSize: '1.1rem',
                    fontWeight: 500,
                    color: '#333'
                  }}
                >
                  {item}
                </Typography>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions 
          sx={{ 
            p: 3, 
            background: '#f8f9fa',
            borderTop: '1px solid #e0e0e0'
          }}
        >
          <Button 
            onClick={() => setManualDialog(false)} 
            variant="contained"
            size="large"
            sx={{ 
              borderRadius: 2,
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 'bold'
            }}
          >
            ✅ Entendido
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ConfiguracionPlataformaAdmin; 