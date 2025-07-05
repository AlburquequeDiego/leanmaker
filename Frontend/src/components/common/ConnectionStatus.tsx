import React from 'react';
import { Box, Chip, Tooltip, Typography } from '@mui/material';
import {
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  Sync as SyncIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

interface ConnectionStatusProps {
  isConnected: boolean;
  isPolling: boolean;
  lastUpdate: Date | null;
  error: string | null;
  onRefresh?: () => void;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  isPolling,
  lastUpdate,
  error,
  onRefresh
}) => {
  const getStatusColor = () => {
    if (error) return 'error';
    if (isConnected) return 'success';
    return 'warning';
  };

  const getStatusIcon = () => {
    if (error) return <ErrorIcon />;
    if (isConnected) return <WifiIcon />;
    return <WifiOffIcon />;
  };

  const getStatusText = () => {
    if (error) return 'Error de conexión';
    if (isConnected) return 'Conectado';
    return 'Desconectado';
  };

  const formatLastUpdate = (date: Date | null) => {
    if (!date) return 'Nunca';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Hace un momento';
    if (minutes === 1) return 'Hace 1 minuto';
    if (minutes < 60) return `Hace ${minutes} minutos`;
    
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return 'Hace 1 hora';
    if (hours < 24) return `Hace ${hours} horas`;
    
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Hace 1 día';
    return `Hace ${days} días`;
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
      {/* Estado de conexión */}
      <Tooltip title={getStatusText()}>
        <Chip
          icon={getStatusIcon()}
          label={getStatusText()}
          color={getStatusColor()}
          size="small"
          variant="outlined"
        />
      </Tooltip>

      {/* Indicador de polling */}
      {isPolling && (
        <Tooltip title="Actualizando automáticamente">
          <Chip
            icon={<SyncIcon />}
            label="Auto"
            color="info"
            size="small"
            variant="outlined"
          />
        </Tooltip>
      )}

      {/* Última actualización */}
      {lastUpdate && (
        <Tooltip title={`Última actualización: ${lastUpdate.toLocaleString()}`}>
          <Chip
            icon={<CheckCircleIcon />}
            label={formatLastUpdate(lastUpdate)}
            color="default"
            size="small"
            variant="outlined"
          />
        </Tooltip>
      )}

      {/* Botón de actualización manual */}
      {onRefresh && (
        <Tooltip title="Actualizar manualmente">
          <Chip
            icon={<SyncIcon />}
            label="Actualizar"
            color="primary"
            size="small"
            variant="outlined"
            onClick={onRefresh}
            sx={{ cursor: 'pointer' }}
          />
        </Tooltip>
      )}

      {/* Mensaje de error */}
      {error && (
        <Typography variant="caption" color="error" sx={{ ml: 1 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}; 