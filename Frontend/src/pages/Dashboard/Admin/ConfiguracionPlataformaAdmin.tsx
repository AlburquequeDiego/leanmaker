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
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon,
  Backup as BackupIcon,
  Update as UpdateIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
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
      id: '1',
      name: 'Nombre de la Plataforma',
      value: 'LeanMaker',
      type: 'text',
      category: 'general',
      description: 'Nombre que se muestra en la plataforma',
    },
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
      min: 30,
      max: 500,
    },
    {
      id: '4',
      name: 'Notificaciones por Email',
      value: true,
      type: 'boolean',
      category: 'notifications',
      description: 'Habilitar envío de notificaciones por email',
    },
    {
      id: '5',
      name: 'Nivel API por Defecto',
      value: '1',
      type: 'select',
      category: 'academic',
      description: 'Nivel API asignado por defecto a nuevos estudiantes',
      options: ['1', '2', '3'],
    },
    {
      id: '6',
      name: 'Tiempo de Sesión (minutos)',
      value: 120,
      type: 'number',
      category: 'security',
      description: 'Tiempo de inactividad antes de cerrar sesión',
      min: 30,
      max: 480,
    },
    {
      id: '7',
      name: 'Backup Automático',
      value: true,
      type: 'boolean',
      category: 'system',
      description: 'Realizar backup automático de la base de datos',
    },
    {
      id: '8',
      name: 'Modo Mantenimiento',
      value: false,
      type: 'boolean',
      category: 'system',
      description: 'Activar modo mantenimiento (solo admins pueden acceder)',
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

  const [backupDialog, setBackupDialog] = useState(false);
  const [maintenanceDialog, setMaintenanceDialog] = useState(false);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleConfigChange = (id: string, value: string | number | boolean) => {
    setConfigs(prev => prev.map(config => 
      config.id === id ? { ...config, value } : config
    ));
  };

  const handleSaveConfig = () => {
    console.log('Guardando configuración:', configs);
    // Aquí se implementaría la lógica para guardar en la API
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
        return <WarningIcon color="warning" />;
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
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Configuración de Plataforma
      </Typography>

      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="platform configuration tabs">
          <Tab label="Configuración General" />
          <Tab label="Estado del Sistema" />
          <Tab label="Mantenimiento" />
          <Tab label="Seguridad" />
        </Tabs>

        {/* Tab: Configuración General */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Configuración General
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Ajusta los parámetros generales de la plataforma
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            {configs.filter(config => config.category === 'general').map((config) => (
              <Card key={config.id} sx={{ flex: 1 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {config.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {config.description}
                  </Typography>
                  {renderConfigField(config)}
                </CardContent>
              </Card>
            ))}
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Configuración Académica
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {configs.filter(config => config.category === 'academic').map((config) => (
                <Card key={config.id} sx={{ flex: 1 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {config.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {config.description}
                    </Typography>
                    {renderConfigField(config)}
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Configuración de Notificaciones
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {configs.filter(config => config.category === 'notifications').map((config) => (
                <Card key={config.id} sx={{ flex: 1 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {config.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {config.description}
                    </Typography>
                    {renderConfigField(config)}
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveConfig}>
              Guardar Cambios
            </Button>
            <Button variant="outlined" startIcon={<RefreshIcon />}>
              Restaurar Valores por Defecto
            </Button>
          </Box>
        </TabPanel>

        {/* Tab: Estado del Sistema */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Estado del Sistema
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Monitoreo en tiempo real de los componentes del sistema
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            {systemStatus.map((status) => (
              <Card key={status.component} sx={{ flex: 1 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {getStatusIcon(status.status)}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      {status.component}
                    </Typography>
                    <Chip
                      label={getStatusText(status.status)}
                      color={getStatusColor(status.status) as any}
                      size="small"
                      sx={{ ml: 'auto' }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Última verificación: {status.lastCheck}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tiempo de respuesta: {status.responseTime}ms
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>

          <Box sx={{ mt: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Acciones del Sistema
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button variant="outlined" startIcon={<BackupIcon />} onClick={() => setBackupDialog(true)}>
                    Crear Backup Manual
                  </Button>
                  <Button variant="outlined" startIcon={<UpdateIcon />}>
                    Verificar Actualizaciones
                  </Button>
                  <Button variant="outlined" startIcon={<SpeedIcon />}>
                    Optimizar Base de Datos
                  </Button>
                  <Button variant="outlined" startIcon={<StorageIcon />}>
                    Limpiar Cache
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>

        {/* Tab: Mantenimiento */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Mantenimiento del Sistema
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Configuraciones para mantenimiento y administración del sistema
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            {configs.filter(config => config.category === 'system').map((config) => (
              <Card key={config.id} sx={{ flex: 1 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {config.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {config.description}
                  </Typography>
                  {renderConfigField(config)}
                </CardContent>
              </Card>
            ))}
          </Box>

          <Box sx={{ mt: 3 }}>
            <Alert severity="warning">
              <Typography variant="body2">
                <strong>Advertencia:</strong> El modo mantenimiento restringe el acceso a todos los usuarios excepto administradores. 
                Úsalo solo cuando sea necesario realizar mantenimiento del sistema.
              </Typography>
            </Alert>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Button 
              variant="contained" 
              color="warning" 
              startIcon={<SettingsIcon />}
              onClick={() => setMaintenanceDialog(true)}
            >
              Activar Modo Mantenimiento
            </Button>
          </Box>
        </TabPanel>

        {/* Tab: Seguridad */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Configuración de Seguridad
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Ajustes de seguridad y políticas de acceso
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            {configs.filter(config => config.category === 'security').map((config) => (
              <Card key={config.id} sx={{ flex: 1 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {config.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {config.description}
                  </Typography>
                  {renderConfigField(config)}
                </CardContent>
              </Card>
            ))}
          </Box>

          <Box sx={{ mt: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Políticas de Seguridad
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <SecurityIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Autenticación de dos factores"
                      secondary="Recomendado para todos los usuarios"
                    />
                    <ListItemSecondaryAction>
                      <Switch color="primary" />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <SecurityIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Registro de actividades"
                      secondary="Mantener logs de todas las acciones"
                    />
                    <ListItemSecondaryAction>
                      <Switch color="primary" defaultChecked />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <SecurityIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Encriptación de datos"
                      secondary="Encriptar datos sensibles en la base de datos"
                    />
                    <ListItemSecondaryAction>
                      <Switch color="primary" defaultChecked />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>
      </Paper>

      {/* Dialog para Backup */}
      <Dialog open={backupDialog} onClose={() => setBackupDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Crear Backup Manual</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            ¿Estás seguro de que deseas crear un backup manual de la base de datos?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Esta acción puede tomar varios minutos dependiendo del tamaño de los datos.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBackupDialog(false)}>Cancelar</Button>
          <Button onClick={() => setBackupDialog(false)} variant="contained" color="primary">
            Crear Backup
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para Mantenimiento */}
      <Dialog open={maintenanceDialog} onClose={() => setMaintenanceDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Activar Modo Mantenimiento</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>¡Advertencia!</strong> El modo mantenimiento:
            </Typography>
            <Typography variant="body2" component="ul" sx={{ mt: 1, pl: 2 }}>
              <li>Bloqueará el acceso a todos los usuarios excepto administradores</li>
              <li>Interrumpirá todas las sesiones activas</li>
              <li>No se podrán realizar operaciones normales</li>
            </Typography>
          </Alert>
          <Typography variant="body2" gutterBottom>
            ¿Estás seguro de que deseas activar el modo mantenimiento?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMaintenanceDialog(false)}>Cancelar</Button>
          <Button onClick={() => setMaintenanceDialog(false)} variant="contained" color="warning">
            Activar Modo Mantenimiento
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ConfiguracionPlataformaAdmin; 