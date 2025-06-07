import { Box, Typography } from '@mui/material';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';

export default function StudentCalendar() {
  return (
    <DashboardLayout userRole="student">
      <Box sx={{ p: 3 }}>
        <Typography variant="h4">
          Calendario (Versión Simple)
        </Typography>
        <Typography>
          Si puedes ver este texto, el problema está en el componente del calendario.
        </Typography>
      </Box>
    </DashboardLayout>
  );
} 