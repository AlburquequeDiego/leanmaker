import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Card,
  CardContent,
  TextField,
  Button,
  Switch,
  FormControl,
  Select,
  MenuItem,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
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

interface SystemConfig {
  id: string;
  name: string;
  value: string | number | boolean;
  type: 'text' | 'number' | 'boolean' | 'select';
  category: string;
  description: string;
  options?: string[];
  min?: number;
  max?: number;
}

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
  const [configs, setConfigs] = useState<SystemConfig[]>([
    {
      id: '2',
      name: 'Máximo de Strikes',
      value: 3,
      type: 'number',
      category: 'academic',
      description: 'Número máximo de strikes antes de suspensión',
      min: 1,
      max: 10,
    },
    {
      id: '3',
      name: 'Horas Mínimas por Proyecto',
      value: 60,
      type: 'number',
      category: 'academic',
      description: 'Horas mínimas requeridas para completar un proyecto',
      min: 20,
      max: 500,
    },
    {
      id: '5',
      name: 'Nivel API por Defecto',
      value: '1',
      type: 'select',
      category: 'academic',
      description: 'Nivel API asignado por defecto a nuevos estudiantes',
      options: ['1', '2', '3', '4'],
    },
    {
      id: '7',
      name: 'Backup Automático',
      value: true,
      type: 'boolean',
      category: 'system',
      description: 'Realizar backup automático de la base de datos',
    },
  ]);

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
      component: 'Servicio de Email',
      status: 'warning',
      lastCheck: '2024-01-25 10:25:00',
      responseTime: 2500,
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

  const handleConfigChange = (id: string, value: string | number | boolean) => {
    setConfigs(prev => prev.map(config => 
      config.id === id ? { ...config, value } : config
    ));
  };

  const handleSaveConfig = () => {
    setSuccessMessage('Configuración guardada exitosamente');
    setShowSuccess(true);
    console.log('Guardando configuración:', configs);
  };

  const handleSystemAction = (action: string) => {
    setSuccessMessage(`Acción ${action} ejecutada exitosamente`);
    setShowSuccess(true);
  };

  const showManual = (type: string) => {
    const manuals = {
      usuarios: {
        title: '📋 Manual de Gestión de Usuarios',
        content: [
          '👥 Ver y buscar usuarios en la plataforma',
          '🔍 Filtrar por tipo: estudiantes, empresas, administradores',
          '🚫 Bloquear, suspender o eliminar usuarios problemáticos',
          '✅ Verificar perfiles y restablecer contraseñas',
          '📊 Monitorear actividad y estado de los usuarios'
        ]
      },
      estudiantes: {
        title: '📋 Manual de Gestión de Estudiantes',
        content: [
          '👨‍🎓 Visualizar y filtrar estudiantes registrados',
          '🔎 Consultar detalles académicos y strikes',
          '✏️ Editar información y estado del estudiante',
          '📈 Ver historial de proyectos y desempeño',
          '🚨 Suspender estudiantes con mal comportamiento'
        ]
      },
      empresas: {
        title: '📋 Manual de Gestión de Empresas',
        content: [
          '🏢 Ver y buscar empresas registradas',
          '🔍 Filtrar por sector o estado de verificación',
          '✅ Aprobar o rechazar nuevas empresas',
          '📄 Consultar proyectos activos de cada empresa',
          '🚫 Bloquear empresas con actividad sospechosa'
        ]
      },
      proyectos: {
        title: '📋 Manual de Gestión de Proyectos',
        content: [
          '📚 Revisar y aprobar proyectos propuestos',
          '👥 Asignar estudiantes a proyectos',
          '⏸️ Suspender o eliminar proyectos problemáticos',
          '📊 Monitorear avance y entregables',
          '📝 Ver historial y evaluaciones de proyectos'
        ]
      },
      evaluaciones: {
        title: '📋 Manual de Gestión de Evaluaciones',
        content: [
          '📝 Revisar evaluaciones entre empresas y estudiantes',
          '✅ Aprobar o rechazar evaluaciones',
          '🔍 Filtrar por estado o tipo de evaluación',
          '📊 Analizar resultados y estadísticas',
          '🚫 Eliminar evaluaciones incorrectas'
        ]
      },
      strikes: {
        title: '📋 Manual de Gestión de Strikes',
        content: [
          '⚠️ Revisar reportes de strikes enviados por empresas',
          '✅ Aprobar o rechazar strikes',
          '🔍 Filtrar por estado (pendiente, aprobado, rechazado)',
          '📈 Ver historial de strikes por estudiante',
          '🚨 Suspender estudiantes con 3 strikes activos'
        ]
      },
      notificaciones: {
        title: '📋 Manual de Gestión de Notificaciones',
        content: [
          '🔔 Crear y enviar notificaciones masivas',
          '📬 Ver historial de notificaciones enviadas',
          '🔍 Filtrar por tipo o destinatario',
          '✏️ Editar plantillas de notificación',
          '📊 Monitorear lecturas y respuestas'
        ]
      },
      academica: {
        title: '📋 Manual de Configuración Académica',
        content: [
          '⚙️ Ajustar parámetros académicos globales',
          '⚠️ Definir máximo de strikes antes de suspensión',
          '⏰ Establecer horas mínimas por proyecto',
          '📊 Configurar nivel API por defecto',
          '🔄 Guardar y aplicar cambios en tiempo real'
        ]
      },
      monitoreo: {
        title: '📋 Manual de Monitoreo del Sistema',
        content: [
          '📊 Revisar dashboard de estadísticas en tiempo real',
          '⏳ Monitorear postulaciones y actividad reciente',
          '🚨 Ver alertas de strikes y suspensiones',
          '👀 Supervisar actividad de empresas y estudiantes',
          '🛠️ Diagnosticar problemas de rendimiento'
        ]
      },
      reportes: {
        title: '📋 Manual de Reportes y Descargas',
        content: [
          '📄 Generar reportes de actividad y desempeño',
          '⬇️ Descargar datos en formato Excel o PDF',
          '🔍 Filtrar reportes por fechas o usuarios',
          '📊 Analizar tendencias y métricas',
          '🗂️ Compartir reportes con otros administradores'
        ]
      }
    };
    const manual = manuals[type as keyof typeof manuals];
    if (manual) {
      setManualContent(manual);
      setManualDialog(true);
    }
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

  const renderConfigField = (config: SystemConfig) => {
    switch (config.type) {
      case 'text':
        return (
          <TextField
            fullWidth
            value={config.value}
            onChange={(e) => handleConfigChange(config.id, e.target.value)}
            variant="outlined"
            size="small"
            sx={{ borderRadius: 2 }}
          />
        );
      case 'number':
        return (
          <TextField
            fullWidth
            type="number"
            value={config.value}
            onChange={(e) => handleConfigChange(config.id, Number(e.target.value))}
            variant="outlined"
            size="small"
            inputProps={{ min: config.min, max: config.max }}
            sx={{ borderRadius: 2 }}
          />
        );
      case 'boolean':
        return (
          <Switch
            checked={config.value as boolean}
            onChange={(e) => handleConfigChange(config.id, e.target.checked)}
            color="primary"
          />
        );
      case 'select':
        return (
          <FormControl fullWidth size="small">
            <Select
              value={config.value}
              onChange={(e) => handleConfigChange(config.id, e.target.value)}
              sx={{ borderRadius: 2 }}
            >
              {config.options?.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      default:
        return null;
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
          <Tab label="Configuración General" />
          <Tab label="Manual" />
        </Tabs>

        {/* Tab: Configuración General */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SettingsIcon color="primary" />
              Configuración General
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ajusta los parámetros generales de la plataforma
            </Typography>
          </Box>

          <Stack spacing={4}>
            {/* Eliminar el bloque de UI de Modo Mantenimiento */}
          </Stack>
        </TabPanel>

        {/* Tab: Manual */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SecurityIcon color="primary" />
              Manual del Administrador
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Guía completa para gestionar y administrar el sistema LeanMaker
            </Typography>
          </Box>

          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SecurityIcon color="primary" />
                Manual del Administrador
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Guía completa para gestionar y administrar el sistema LeanMaker
              </Typography>
              
              <List>
                <ListItem sx={{ borderRadius: 2, mb: 1, bgcolor: 'grey.50' }}>
                  <ListItemIcon>
                    <SecurityIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Gestión de Usuarios"
                    secondary="Cómo administrar estudiantes, empresas y usuarios del sistema"
                  />
                  <ListItemSecondaryAction>
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => showManual('usuarios')}
                      sx={{ borderRadius: 2 }}
                    >
                      Ver Manual
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
                
                <ListItem sx={{ borderRadius: 2, mb: 1, bgcolor: 'grey.50' }}>
                  <ListItemIcon>
                    <SecurityIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Gestión de Estudiantes"
                    secondary="Cómo gestionar y monitorear estudiantes registrados"
                  />
                  <ListItemSecondaryAction>
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => showManual('estudiantes')}
                      sx={{ borderRadius: 2 }}
                    >
                      Ver Manual
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
                
                <ListItem sx={{ borderRadius: 2, mb: 1, bgcolor: 'grey.50' }}>
                  <ListItemIcon>
                    <SecurityIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Gestión de Empresas"
                    secondary="Cómo administrar y verificar empresas registradas"
                  />
                  <ListItemSecondaryAction>
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => showManual('empresas')}
                      sx={{ borderRadius: 2 }}
                    >
                      Ver Manual
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
                
                <ListItem sx={{ borderRadius: 2, mb: 1, bgcolor: 'grey.50' }}>
                  <ListItemIcon>
                    <SecurityIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Gestión de Proyectos"
                    secondary="Cómo revisar, aprobar y gestionar proyectos de empresas"
                  />
                  <ListItemSecondaryAction>
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => showManual('proyectos')}
                      sx={{ borderRadius: 2 }}
                    >
                      Ver Manual
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
                
                <ListItem sx={{ borderRadius: 2, mb: 1, bgcolor: 'grey.50' }}>
                  <ListItemIcon>
                    <SecurityIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Gestión de Evaluaciones"
                    secondary="Cómo revisar, aprobar y gestionar evaluaciones"
                  />
                  <ListItemSecondaryAction>
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => showManual('evaluaciones')}
                      sx={{ borderRadius: 2 }}
                    >
                      Ver Manual
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
                
                <ListItem sx={{ borderRadius: 2, mb: 1, bgcolor: 'grey.50' }}>
                  <ListItemIcon>
                    <SecurityIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Gestión de Strikes"
                    secondary="Cómo gestionar y monitorear strikes de estudiantes"
                  />
                  <ListItemSecondaryAction>
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => showManual('strikes')}
                      sx={{ borderRadius: 2 }}
                    >
                      Ver Manual
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
                
                <ListItem sx={{ borderRadius: 2, mb: 1, bgcolor: 'grey.50' }}>
                  <ListItemIcon>
                    <SecurityIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Gestión de Notificaciones"
                    secondary="Cómo enviar y monitorear notificaciones"
                  />
                  <ListItemSecondaryAction>
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => showManual('notificaciones')}
                      sx={{ borderRadius: 2 }}
                    >
                      Ver Manual
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
                
                <ListItem sx={{ borderRadius: 2, mb: 1, bgcolor: 'grey.50' }}>
                  <ListItemIcon>
                    <SecurityIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Configuración Académica"
                    secondary="Cómoajustar parámetros académicos del sistema"
                  />
                  <ListItemSecondaryAction>
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => showManual('academica')}
                      sx={{ borderRadius: 2 }}
                    >
                      Ver Manual
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
                
                <ListItem sx={{ borderRadius: 2, mb: 1, bgcolor: 'grey.50' }}>
                  <ListItemIcon>
                    <SecurityIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Monitoreo del Sistema"
                    secondary="Cómo supervisar el funcionamiento y rendimiento"
                  />
                  <ListItemSecondaryAction>
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => showManual('monitoreo')}
                      sx={{ borderRadius: 2 }}
                    >
                      Ver Manual
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
                
                <ListItem sx={{ borderRadius: 2, mb: 1, bgcolor: 'grey.50' }}>
                  <ListItemIcon>
                    <SecurityIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Reportes y Descargas"
                    secondary="Cómo generar y descargar reportes de actividad"
                  />
                  <ListItemSecondaryAction>
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => showManual('reportes')}
                      sx={{ borderRadius: 2 }}
                    >
                      Ver Manual
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
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