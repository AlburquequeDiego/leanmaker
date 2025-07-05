import { useState, useEffect } from 'react';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BarChartIcon from '@mui/icons-material/BarChart';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { UserTutorial } from '../../../components/common/UserTutorial';
import { ConnectionStatus } from '../../../components/common/ConnectionStatus';
import { NotificationSystem, useNotifications } from '../../../components/common/NotificationSystem';
import { useDashboardStats } from '../../../hooks/useRealTimeData';

export default function StudentDashboard() {
  const [showTutorial, setShowTutorial] = useState(true);
  const [previousStats, setPreviousStats] = useState<any>(null);
  
  // Usar hook de tiempo real para estadísticas
  const { data: stats, loading, error, lastUpdate, refresh, isPolling } = useDashboardStats('student');
  
  // Sistema de notificaciones
  const { notifications, addNotification, removeNotification } = useNotifications();

  // Detectar cambios en las estadísticas y mostrar notificaciones
  useEffect(() => {
    if (stats && previousStats) {
      // Detectar cambios en aplicaciones pendientes
      if (stats.pending_applications > previousStats.pending_applications) {
        addNotification({
          type: 'info',
          title: 'Nueva aplicación pendiente',
          message: `Tienes ${stats.pending_applications} aplicaciones esperando respuesta`,
        });
      }

      // Detectar cambios en aplicaciones aceptadas
      if (stats.accepted_applications > previousStats.accepted_applications) {
        addNotification({
          type: 'success',
          title: '¡Aplicación aceptada!',
          message: 'Una empresa ha aceptado tu aplicación',
        });
      }

      // Detectar cambios en proyectos activos
      if (stats.active_projects > previousStats.active_projects) {
        addNotification({
          type: 'success',
          title: '¡Nuevo proyecto activo!',
          message: `Ahora tienes ${stats.active_projects} proyectos en curso`,
        });
      }

      // Detectar cambios en strikes
      if (stats.strikes > previousStats.strikes) {
        addNotification({
          type: 'warning',
          title: 'Strike asignado',
          message: `Tienes ${stats.strikes} strikes. Ten cuidado con las entregas.`,
        });
      }
    }

    if (stats) {
      setPreviousStats(stats);
    }
  }, [stats, previousStats, addNotification]);

  // Cálculos de KPIs usando datos reales
  const totalHours = stats?.total_hours || 0;
  const currentGPA = stats?.gpa || 0;
  const strikes = stats?.strikes || 0;
  const maxStrikes = 3;
  const proyectosDisponibles = stats?.available_projects || 0;
  const misAplicaciones = stats?.total_applications || 0;
  const proyectosActivos = stats?.active_projects || 0;
  const proyectosCompletados = stats?.completed_projects || 0;
  const aplicacionesPendientes = stats?.pending_applications || 0;
  const aplicacionesAceptadas = stats?.accepted_applications || 0;
  const rating = stats?.rating || 0;

  return (
    <Box sx={{ p: 3, bgcolor: '#f7fafd', minHeight: '100vh' }}>
      {/* Sistema de notificaciones */}
      <NotificationSystem
        notifications={notifications}
        onClose={removeNotification}
        maxNotifications={3}
      />

      {/* Tutorial para usuarios nuevos */}
      {showTutorial && (
        <UserTutorial 
          userRole="student" 
          onClose={() => setShowTutorial(false)} 
        />
      )}
      
      {/* Header con título y estado de conexión */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" fontWeight={700}>
          Bienvenido a tu Dashboard (Estudiante)
        </Typography>
        <ConnectionStatus
          isConnected={!error}
          isPolling={isPolling}
          lastUpdate={lastUpdate}
          error={error}
          onRefresh={refresh}
        />
      </Box>
      
      {loading && !stats ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress />
        </Box>
      ) : (
      <>
      {/* KPIs principales */}
      <Box sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 3,
        mb: 4,
        justifyContent: { xs: 'center', md: 'flex-start' }
      }}>
        <Paper sx={{ p: 2.5, minWidth: 220, flex: '1 1 260px', display: 'flex', flexDirection: 'column', bgcolor: '#42a5f5', color: 'white', boxShadow: 2, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <TrendingUpIcon sx={{ fontSize: 32, mr: 1 }} />
            <Typography variant="h6" fontWeight={700}>Horas Acumuladas</Typography>
          </Box>
          <Typography variant="h4" fontWeight={700}>{totalHours}</Typography>
          <Typography variant="body2">Horas de experiencia en proyectos</Typography>
        </Paper>
        <Paper sx={{ p: 2.5, minWidth: 220, flex: '1 1 260px', display: 'flex', flexDirection: 'column', bgcolor: '#ffa726', color: 'white', boxShadow: 2, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <BarChartIcon sx={{ fontSize: 32, mr: 1 }} />
            <Typography variant="h6" fontWeight={700}>GPA Actual</Typography>
          </Box>
          <Typography variant="h4" fontWeight={700}>{currentGPA.toFixed(2)}</Typography>
          <Typography variant="body2">Promedio académico actual</Typography>
        </Paper>
        <Paper sx={{ p: 2.5, minWidth: 220, flex: '1 1 260px', display: 'flex', flexDirection: 'column', bgcolor: '#42a5f5', color: 'white', boxShadow: 2, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700}>Proyectos Disponibles</Typography>
          <Typography variant="h4" fontWeight={700}>{proyectosDisponibles}</Typography>
          <Typography variant="body2">Nuevas oportunidades para ti</Typography>
        </Paper>
        <Paper sx={{ p: 2.5, minWidth: 220, flex: '1 1 260px', display: 'flex', flexDirection: 'column', bgcolor: '#ab47bc', color: 'white', boxShadow: 2, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700}>Mis Aplicaciones</Typography>
          <Typography variant="h4" fontWeight={700}>{misAplicaciones}</Typography>
          <Typography variant="body2">Aplicaciones en proceso</Typography>
        </Paper>
        <Paper sx={{ p: 2.5, minWidth: 220, flex: '1 1 260px', display: 'flex', flexDirection: 'column', bgcolor: '#ffb300', color: 'white', boxShadow: 2, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <WarningAmberIcon sx={{ fontSize: 32, mr: 1 }} />
            <Typography variant="h6" fontWeight={700}>Strikes</Typography>
          </Box>
          <Typography variant="h4" fontWeight={700}>{strikes} / {maxStrikes}</Typography>
          <Typography variant="body2">Tienes {strikes} de 3 strikes asignados por no entregar proyectos.</Typography>
        </Paper>
        <Paper sx={{ p: 2.5, minWidth: 220, flex: '1 1 260px', display: 'flex', flexDirection: 'column', bgcolor: '#43a047', color: 'white', boxShadow: 2, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700}>Proyectos Activos</Typography>
          <Typography variant="h4" fontWeight={700}>{proyectosActivos}</Typography>
          <Typography variant="body2">Proyectos en curso</Typography>
        </Paper>
        <Paper sx={{ p: 2.5, minWidth: 220, flex: '1 1 260px', display: 'flex', flexDirection: 'column', bgcolor: '#8bc34a', color: 'white', boxShadow: 2, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700}>Proyectos Completados</Typography>
          <Typography variant="h4" fontWeight={700}>{proyectosCompletados}</Typography>
          <Typography variant="body2">Proyectos finalizados exitosamente</Typography>
        </Paper>
        <Paper sx={{ p: 2.5, minWidth: 220, flex: '1 1 260px', display: 'flex', flexDirection: 'column', bgcolor: '#ff9800', color: 'white', boxShadow: 2, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700}>Aplicaciones Pendientes</Typography>
          <Typography variant="h4" fontWeight={700}>{aplicacionesPendientes}</Typography>
          <Typography variant="body2">Esperando respuesta de empresas</Typography>
        </Paper>
        <Paper sx={{ p: 2.5, minWidth: 220, flex: '1 1 260px', display: 'flex', flexDirection: 'column', bgcolor: '#4caf50', color: 'white', boxShadow: 2, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700}>Aplicaciones Aceptadas</Typography>
          <Typography variant="h4" fontWeight={700}>{aplicacionesAceptadas}</Typography>
          <Typography variant="body2">Aplicaciones aprobadas</Typography>
        </Paper>
        <Paper sx={{ p: 2.5, minWidth: 220, flex: '1 1 260px', display: 'flex', flexDirection: 'column', bgcolor: '#9c27b0', color: 'white', boxShadow: 2, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700}>Rating Promedio</Typography>
          <Typography variant="h4" fontWeight={700}>{rating.toFixed(1)}</Typography>
          <Typography variant="body2">Calificación promedio recibida</Typography>
        </Paper>
      </Box>
      {/* Puedes agregar más secciones aquí si lo deseas, usando los datos reales */}
      </>
      )}
    </Box>
  );
} 