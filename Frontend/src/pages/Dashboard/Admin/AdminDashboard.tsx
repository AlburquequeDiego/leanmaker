import { Box, Paper, Typography, Grid, Button } from '@mui/material';
import { Add as AddIcon, ErrorOutline as ErrorOutlineIcon, People as PeopleIcon, Business as BusinessIcon, School as SchoolIcon, Assignment as AssignmentIcon, HowToReg as HowToRegIcon, Work as WorkIcon } from '@mui/icons-material';

export default function AdminDashboard() {
  // Datos mock
  const postulaciones = 87;
  const alertas = [
    'Estudiante Juan Pérez alcanzó 3 strikes',
  ];

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4, mb: 4, px: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" align="center">
            Panel de Administración (Admin)
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {/* TODO: Implementar creación de usuario */}}
          >
            Nuevo Usuario Admin
          </Button>
        </Box>
        {/* Tarjetas de resumen estilo dashboard estudiante */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4, justifyContent: { xs: 'center', md: 'flex-start' } }}>
          {/* Usuarios */}
          <Box sx={{ flex: '1 1 260px', minWidth: 220, bgcolor: 'primary.main', color: 'primary.contrastText', borderRadius: 3, boxShadow: 2, p: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PeopleIcon sx={{ fontSize: 32, mr: 1 }} />
              <Typography variant="h6" fontWeight={700}>Usuarios</Typography>
            </Box>
            <Typography variant="h3" fontWeight={700}>150</Typography>
            <Typography variant="body2">Usuarios registrados</Typography>
          </Box>
          {/* Empresas */}
          <Box sx={{ flex: '1 1 260px', minWidth: 220, bgcolor: 'secondary.main', color: 'secondary.contrastText', borderRadius: 3, boxShadow: 2, p: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <BusinessIcon sx={{ fontSize: 32, mr: 1 }} />
              <Typography variant="h6" fontWeight={700}>Empresas</Typography>
            </Box>
            <Typography variant="h3" fontWeight={700}>25</Typography>
            <Typography variant="body2">Empresas activas</Typography>
          </Box>
          {/* Estudiantes */}
          <Box sx={{ flex: '1 1 260px', minWidth: 220, bgcolor: 'success.main', color: 'success.contrastText', borderRadius: 3, boxShadow: 2, p: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <SchoolIcon sx={{ fontSize: 32, mr: 1 }} />
              <Typography variant="h6" fontWeight={700}>Estudiantes</Typography>
            </Box>
            <Typography variant="h3" fontWeight={700}>120</Typography>
            <Typography variant="body2">Estudiantes activos</Typography>
          </Box>
          {/* Proyectos */}
          <Box sx={{ flex: '1 1 260px', minWidth: 220, bgcolor: 'info.main', color: 'info.contrastText', borderRadius: 3, boxShadow: 2, p: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <WorkIcon sx={{ fontSize: 32, mr: 1 }} />
              <Typography variant="h6" fontWeight={700}>Proyectos</Typography>
            </Box>
            <Typography variant="h3" fontWeight={700}>45</Typography>
            <Typography variant="body2">Proyectos activos</Typography>
          </Box>
          {/* Postulaciones */}
          <Box sx={{ flex: '1 1 260px', minWidth: 220, bgcolor: 'purple.main', color: 'purple.contrastText', borderRadius: 3, boxShadow: 2, p: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <HowToRegIcon sx={{ fontSize: 32, mr: 1 }} />
              <Typography variant="h6" fontWeight={700}>Postulaciones</Typography>
            </Box>
            <Typography variant="h3" fontWeight={700}>{postulaciones}</Typography>
            <Typography variant="body2">Postulaciones realizadas</Typography>
          </Box>
          {/* Alertas */}
          <Box sx={{ flex: '1 1 260px', minWidth: 220, bgcolor: 'warning.main', color: 'warning.contrastText', borderRadius: 3, boxShadow: 2, p: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <ErrorOutlineIcon sx={{ fontSize: 32, mr: 1 }} />
              <Typography variant="h6" fontWeight={700}>Alertas</Typography>
            </Box>
            <Typography variant="h3" fontWeight={700}>{alertas.length}</Typography>
            <Typography variant="body2">Alertas pendientes</Typography>
          </Box>
        </Box>
        <Grid container spacing={3}>
          {/* Últimos Usuarios Registrados */}
          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Últimos Usuarios Registrados
              </Typography>
              {/* Aquí irá la tabla de últimos usuarios */}
              <Typography variant="body2" color="text.secondary">
                No hay usuarios recientes
              </Typography>
            </Paper>
          </Grid>

          {/* Actividad del Sistema */}
          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Actividad del Sistema
              </Typography>
              {/* Aquí irá el componente de actividad del sistema */}
              <Typography variant="body2" color="text.secondary">
                No hay actividad reciente
              </Typography>
            </Paper>
          </Grid>

          {/* Estadísticas de Proyectos */}
          <Grid sx={{ gridColumn: { xs: 'span 12' } }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Estadísticas de Proyectos
              </Typography>
              {/* Aquí irá el gráfico de estadísticas */}
              <Typography variant="body2" color="text.secondary">
                No hay estadísticas disponibles
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
} 