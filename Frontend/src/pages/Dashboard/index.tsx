import { Paper, Typography, Box } from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Notifications as NotificationsIcon,
  CalendarMonth as CalendarIcon,
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';

const DashboardCard = ({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) => (
  <Paper
    sx={{
      p: 3,
      display: 'flex',
      flexDirection: 'column',
      height: 140,
    }}
  >
    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
      <Typography color="text.secondary" variant="h6" gutterBottom>
        {title}
      </Typography>
      {icon}
    </Box>
    <Typography component="p" variant="h4">
      {value}
    </Typography>
  </Paper>
);

export const Dashboard = () => {
  // Aquí se obtendrían los datos reales de la API
  const stats = {
    activeProjects: 3,
    pendingNotifications: 5,
    upcomingEvents: 2,
  };

  return (
    <DashboardLayout>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
          <DashboardCard
            title="Proyectos Activos"
            value={stats.activeProjects}
            icon={<AssignmentIcon color="primary" />}
          />
          <DashboardCard
            title="Notificaciones Pendientes"
            value={stats.pendingNotifications}
            icon={<NotificationsIcon color="primary" />}
          />
          <DashboardCard
            title="Próximos Eventos"
            value={stats.upcomingEvents}
            icon={<CalendarIcon color="primary" />}
          />
          {/* Aquí se pueden agregar más tarjetas o secciones según sea necesario */}
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default Dashboard; 