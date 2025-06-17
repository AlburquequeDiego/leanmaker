import { Box, Paper, Typography, Grid, Button, List, ListItem, ListItemText, ListItemAvatar, Avatar, Chip, LinearProgress } from '@mui/material';
import { Add as AddIcon, ErrorOutline as ErrorOutlineIcon, People as PeopleIcon, Business as BusinessIcon, School as SchoolIcon, Assignment as AssignmentIcon, HowToReg as HowToRegIcon, Work as WorkIcon, TrendingUp as TrendingUpIcon, Schedule as ScheduleIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';

export default function AdminDashboard() {
  // Datos mock
  const postulaciones = 87;
  const alertas = [
    'Estudiante Juan Pérez alcanzó 3 strikes',
  ];

  // Datos para últimos usuarios registrados
  const ultimosUsuarios = [
    { id: 1, nombre: 'María González', email: 'maria@email.com', rol: 'Estudiante', fecha: '2024-01-22', avatar: 'MG' },
    { id: 2, nombre: 'TechCorp Solutions', email: 'info@techcorp.com', rol: 'Empresa', fecha: '2024-01-21', avatar: 'TS' },
    { id: 3, nombre: 'Carlos López', email: 'carlos@email.com', rol: 'Estudiante', fecha: '2024-01-20', avatar: 'CL' },
  ];

  // Datos para actividad del sistema
  const actividadSistema = [
    { id: 1, accion: 'Nuevo proyecto publicado', usuario: 'TechCorp Solutions', tiempo: '2 horas', tipo: 'proyecto' },
    { id: 2, accion: 'Evaluación completada', usuario: 'Juan Pérez', tiempo: '4 horas', tipo: 'evaluacion' },
    { id: 3, accion: 'Usuario registrado', usuario: 'María González', tiempo: '6 horas', tipo: 'registro' },
  ];

  // Datos para estadísticas de proyectos
  const estadisticasProyectos = [
    { nombre: 'Tecnología', activos: 15, completados: 8, porcentaje: 65 },
    { nombre: 'Marketing', activos: 12, completados: 5, porcentaje: 45 },
    { nombre: 'Diseño', activos: 8, completados: 6, porcentaje: 75 },
    { nombre: 'Administración', activos: 10, completados: 4, porcentaje: 40 },
  ];

  const getRolColor = (rol: string) => {
    switch (rol) {
      case 'Estudiante': return 'primary';
      case 'Empresa': return 'secondary';
      case 'Administrador': return 'error';
      default: return 'default';
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'proyecto': return 'primary';
      case 'evaluacion': return 'success';
      case 'registro': return 'info';
      case 'postulacion': return 'warning';
      case 'verificacion': return 'secondary';
      default: return 'default';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'proyecto': return <WorkIcon />;
      case 'evaluacion': return <CheckCircleIcon />;
      case 'registro': return <PeopleIcon />;
      case 'postulacion': return <HowToRegIcon />;
      case 'verificacion': return <BusinessIcon />;
      default: return <AssignmentIcon />;
    }
  };

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4, mb: 4, px: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" align="center">
            Panel de Administración (Admin)
          </Typography>
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

        {/* Tres tarjetas principales en una fila */}
        <Box sx={{ display: 'flex', flexWrap: { xs: 'wrap', md: 'nowrap' }, gap: 3, mb: 4 }}>
          {/* Últimos Usuarios Registrados */}
          <Box sx={{ flex: 1, minWidth: 280, maxWidth: 400, display: 'flex' }}>
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2, width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'stretch' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <PeopleIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  Últimos Usuarios Registrados
                </Typography>
              </Box>
              <List sx={{ p: 0 }}>
                {ultimosUsuarios.map((usuario, index) => (
                  <ListItem key={usuario.id} sx={{ px: 0, py: 0.5 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: getRolColor(usuario.rol) + '.main', width: 32, height: 32 }}>
                        {usuario.avatar}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" fontWeight={600}>
                            {usuario.nombre}
                          </Typography>
                          <Chip 
                            label={usuario.rol} 
                            size="small" 
                            color={getRolColor(usuario.rol) as any}
                            sx={{ fontSize: '0.6rem', height: 20 }}
                          />
                        </Box>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {usuario.email} • {new Date(usuario.fecha).toLocaleDateString()}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Box>

          {/* Actividad del Sistema */}
          <Box sx={{ flex: 1, minWidth: 280, maxWidth: 400, display: 'flex' }}>
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2, width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'stretch' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <TrendingUpIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  Actividad del Sistema
                </Typography>
              </Box>
              <List sx={{ p: 0 }}>
                {actividadSistema.map((actividad) => (
                  <ListItem key={actividad.id} sx={{ px: 0, py: 0.5 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: getTipoColor(actividad.tipo) + '.main', width: 28, height: 28 }}>
                        {getTipoIcon(actividad.tipo)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight={500}>
                          {actividad.accion}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {actividad.usuario} • {actividad.tiempo}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Box>

          {/* Estadísticas de Proyectos por Área */}
          <Box sx={{ flex: 1, minWidth: 280, maxWidth: 400, display: 'flex' }}>
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2, width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'stretch' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <WorkIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  Estadísticas de Proyectos por Área
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {estadisticasProyectos.map((area) => (
                  <Box key={area.nombre} sx={{ flex: '1 1 200px', minWidth: 120 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="body1" fontWeight={600} color="primary">
                        {area.nombre}
                      </Typography>
                      <Typography variant="body1" fontWeight={600} color="primary">
                        {area.porcentaje}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={area.porcentaje}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        background: '#e3eafc',
                        '& .MuiLinearProgress-bar': {
                          background: '#1976d2',
                          borderRadius: 4,
                        },
                      }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Activos: {area.activos}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Completados: {area.completados}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  );
} 