import { Box, Paper, Typography, Grid, Button, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Add as AddIcon, ErrorOutline as ErrorOutlineIcon } from '@mui/icons-material';

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
            Panel de Administración
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {/* TODO: Implementar creación de usuario */}}
          >
            Nuevo Usuario Admin
          </Button>
        </Box>
        <Grid container spacing={3}>
          {/* Resumen de Usuarios */}
          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6', lg: 'span 3' } }}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                height: 140,
                bgcolor: 'primary.light',
                color: 'primary.contrastText',
              }}
            >
              <Typography variant="h6" gutterBottom>
                Total Usuarios
              </Typography>
              <Typography variant="h4">150</Typography>
              <Typography variant="body2">
                Usuarios registrados
              </Typography>
            </Paper>
          </Grid>

          {/* Resumen de Empresas */}
          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6', lg: 'span 3' } }}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                height: 140,
                bgcolor: 'secondary.light',
                color: 'secondary.contrastText',
              }}
            >
              <Typography variant="h6" gutterBottom>
                Empresas
              </Typography>
              <Typography variant="h4">25</Typography>
              <Typography variant="body2">
                Empresas activas
              </Typography>
            </Paper>
          </Grid>

          {/* Resumen de Estudiantes */}
          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6', lg: 'span 3' } }}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                height: 140,
                bgcolor: 'success.light',
                color: 'success.contrastText',
              }}
            >
              <Typography variant="h6" gutterBottom>
                Estudiantes
              </Typography>
              <Typography variant="h4">120</Typography>
              <Typography variant="body2">
                Estudiantes activos
              </Typography>
            </Paper>
          </Grid>

          {/* Resumen de Proyectos */}
          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6', lg: 'span 3' } }}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                height: 140,
                bgcolor: 'info.light',
                color: 'info.contrastText',
              }}
            >
              <Typography variant="h6" gutterBottom>
                Proyectos
              </Typography>
              <Typography variant="h4">45</Typography>
              <Typography variant="body2">
                Proyectos activos
              </Typography>
            </Paper>
          </Grid>

          {/* Postulaciones realizadas */}
          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6', lg: 'span 3' } }}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                height: 140,
                bgcolor: 'purple.light',
                color: 'purple.contrastText',
              }}
            >
              <Typography variant="h6" gutterBottom>
                Postulaciones
              </Typography>
              <Typography variant="h4">{postulaciones}</Typography>
              <Typography variant="body2">
                Postulaciones realizadas
              </Typography>
            </Paper>
          </Grid>

          {/* Alertas pendientes */}
          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6', lg: 'span 3' } }}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                height: 180,
                bgcolor: 'warning.main',
                color: 'warning.contrastText',
              }}
            >
              <Typography variant="h6" gutterBottom>
                Alertas Pendientes
              </Typography>
              <Typography variant="h4" sx={{ mb: 1 }}>{alertas.length}</Typography>
              <Box sx={{
                bgcolor: 'warning.light',
                color: 'warning.dark',
                borderRadius: 1,
                p: 1,
                boxShadow: 0,
                minHeight: 60,
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
              }}>
                <List dense sx={{ p: 0 }}>
                  {alertas.slice(0, 3).map((alerta, idx) => (
                    <ListItem key={idx} sx={{ py: 0.5, px: 0 }} disableGutters>
                      <ListItemIcon sx={{ minWidth: 28, color: 'warning.dark' }}>
                        <ErrorOutlineIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={alerta}
                        primaryTypographyProps={{
                          fontSize: 13,
                          color: 'warning.dark',
                          sx: {
                            whiteSpace: 'normal',
                            wordBreak: 'break-word'
                          }
                        }}
                      />
                    </ListItem>
                  ))}
                  {/* Mostrar '+N más...' solo si hay más de 3 alertas */}
                  {alertas.length > 3 && (
                    <ListItem sx={{ py: 0.5, px: 0 }} disableGutters>
                      <ListItemText
                        primary={`+${alertas.length - 3} más...`}
                        primaryTypographyProps={{
                          fontSize: 13,
                          fontStyle: 'italic',
                          color: 'warning.dark'
                        }}
                      />
                    </ListItem>
                  )}
                </List>
              </Box>
            </Paper>
          </Grid>

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