import { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Badge,
  Tooltip,
  Modal,
  Fade,
  Backdrop,
  Button,
  TextField,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Notifications as NotificationsIcon,
  CalendarMonth as CalendarIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  Business as BusinessIcon,
  School as SchoolIcon,
  Settings as SettingsIcon,
  Assessment as AssessmentIcon,
  AccessTime as AccessTimeIcon,
  Quiz as QuizIcon,
  Search as SearchIcon,
  VideoCall as VideoCallIcon,
  Warning as WarningIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  HelpOutline as HelpOutlineIcon,
} from '@mui/icons-material';
import { useAuth } from '../../../hooks/useAuth';

const drawerWidth = 280;

interface DashboardLayoutProps {
  userRole: 'admin' | 'company' | 'student';
}

// Este componente define la estructura principal del dashboard, incluyendo el menú lateral (Drawer),
// la barra superior (AppBar) y el área de contenido dinámico (Outlet). El menú y las opciones
// se adaptan según el rol del usuario (admin, empresa o estudiante).
export const DashboardLayout = ({ userRole }: DashboardLayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('dark');
  const [openSupport, setOpenSupport] = useState(false);
  const [supportForm, setSupportForm] = useState({ nombre: '', correo: '', mensaje: '' });

  // Simulación de notificaciones nuevas
  const notificationCount = 3;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleThemeToggle = () => {
    setThemeMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleOpenSupport = () => setOpenSupport(true);
  const handleCloseSupport = () => setOpenSupport(false);

  const getMenuItems = () => {
    const commonItems = {
      admin: [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard/admin' },
        { text: 'Perfil', icon: <AccountCircleIcon />, path: '/dashboard/admin/perfil' },
        { text: 'Notificaciones', icon: <NotificationsIcon />, path: '/dashboard/admin/notificaciones' },
      ],
      company: [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard/company' },
        { text: 'Perfil', icon: <AccountCircleIcon />, path: '/dashboard/company/profile' },
        { text: 'Notificaciones', icon: <NotificationsIcon />, path: '/dashboard/company/notifications' },
      ],
      student: [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard/student' },
        { text: 'Perfil', icon: <AccountCircleIcon />, path: '/dashboard/student/profile' },
        { text: 'Notificaciones', icon: <NotificationsIcon />, path: '/dashboard/student/notifications' },
      ],
    };

    const roleSpecificItems = {
      admin: [
        { text: 'Gestión de Usuarios', icon: <PeopleIcon />, path: '/dashboard/admin/usuarios' },
        { text: 'Validación de Horas', icon: <AccessTimeIcon />, path: '/dashboard/admin/validacion-horas' },
        { text: 'Gestión de Empresas', icon: <BusinessIcon />, path: '/dashboard/admin/gestion-empresas' },
        { text: 'Gestión de Estudiantes', icon: <SchoolIcon />, path: '/dashboard/admin/gestion-estudiantes' },
        { text: 'Gestión de Proyectos', icon: <AssignmentIcon />, path: '/dashboard/admin/gestion-proyectos' },
        { text: 'Gestión de Evaluaciones', icon: <AssessmentIcon />, path: '/dashboard/admin/gestion-evaluaciones' },
        { text: 'Configuración de Plataforma', icon: <SettingsIcon />, path: '/dashboard/admin/configuracion-plataforma' },
      ],
      company: [
        { text: 'Proyectos', icon: <AssignmentIcon />, path: '/dashboard/company/projects' },
        { text: 'Postulaciones', icon: <PeopleIcon />, path: '/dashboard/company/applications' },
        { text: 'Buscar Estudiantes', icon: <SearchIcon />, path: '/dashboard/company/search-students' },
        { text: 'Evaluaciones', icon: <AssessmentIcon />, path: '/dashboard/company/evaluations' },
        { text: 'Entrevistas', icon: <VideoCallIcon />, path: '/dashboard/company/interviews' },
        { text: 'Calendario', icon: <CalendarIcon />, path: '/dashboard/company/calendar' },
        { text: 'Strikes', icon: <WarningIcon />, path: '/dashboard/company/strikes' },
      ],
      student: [
        { text: 'Proyectos Disponibles', icon: <AssignmentIcon />, path: '/dashboard/student/available-projects' },
        { text: 'Mis Aplicaciones', icon: <AssignmentIcon />, path: '/dashboard/student/my-applications' },
        { text: 'Mis Proyectos', icon: <AssignmentIcon />, path: '/dashboard/student/my-projects' },
        { text: 'Evaluaciones', icon: <AssessmentIcon />, path: '/dashboard/student/evaluations' },
        { text: 'Calendario', icon: <CalendarIcon />, path: '/dashboard/student/calendar' },
        { text: 'Cuestionario API', icon: <QuizIcon />, path: '/dashboard/student/api-questionnaire' },
        { text: 'Resultados API', icon: <AssessmentIcon />, path: '/dashboard/student/api-results' },
      ],
    };

    return [...commonItems[userRole], ...roleSpecificItems[userRole]];
  };

  const drawer = (
    <Box>
      <Toolbar sx={{ justifyContent: 'center', py: 2 }}>
        <Typography variant="h6" noWrap component="div" sx={{ color: '#e3eafc', fontWeight: 700, letterSpacing: 1 }}>
          LeanMaker
        </Typography>
      </Toolbar>
      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.08)' }} />
      <List>
        {getMenuItems().map((item) => {
          const selected = location.pathname === item.path || (item.path !== '/dashboard/student' && location.pathname.startsWith(item.path));
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={selected}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 3,
                  background: selected ? '#22345a' : 'transparent',
                  color: '#e3eafc',
                  my: 0.5,
                  mx: 1,
                  height: 56,
                  transition: 'background 0.2s',
                  '&:hover': {
                    background: '#22345a',
                    color: '#fff',
                  },
                  fontWeight: selected ? 700 : 500,
                }}
              >
                <ListItemIcon sx={{ color: '#b6c6e3', minWidth: 40, fontSize: 28 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: 600, fontSize: 18 }} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  // Helper para obtener el nombre de la sección actual
  const getSectionName = () => {
    const path = location.pathname;
    const sections = getMenuItems();
    const found = sections.find((item) => path === item.path || (item.path !== '/dashboard/student' && path.startsWith(item.path)));
    return found ? found.text : '';
  };

  return (
    <Box sx={{ display: 'flex', width: '100vw', maxWidth: '100vw', overflowX: 'hidden', minHeight: '100vh' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100vw - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: themeMode === 'light' ? '#fff' : '#10213a',
          color: themeMode === 'light' ? '#22345a' : '#e3eafc',
          boxShadow: themeMode === 'light' ? '0 2px 8px rgba(0,0,0,0.06)' : undefined,
          maxWidth: '100vw',
          overflowX: 'hidden',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ fontWeight: 600, flexGrow: 1, textAlign: { xs: 'center', sm: 'left' }, color: themeMode === 'light' ? '#22345a' : '#e3eafc' }}
          >
            {getSectionName()}
          </Typography>
          {/* Iconos adicionales a la derecha */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: 1 }}>
            {/* Notificaciones */}
            <Tooltip title="Notificaciones">
              <IconButton color={themeMode === 'light' ? 'default' : 'inherit'}>
                <Badge badgeContent={notificationCount} color="error">
                  <NotificationsIcon sx={{ color: themeMode === 'light' ? '#22345a' : '#e3eafc' }} />
                </Badge>
              </IconButton>
            </Tooltip>
            {/* Tema claro/oscuro */}
            <Tooltip title={themeMode === 'light' ? 'Modo oscuro' : 'Modo claro'}>
              <IconButton color={themeMode === 'light' ? 'default' : 'inherit'} onClick={handleThemeToggle}>
                {themeMode === 'light' ? <DarkModeIcon sx={{ color: '#22345a' }} /> : <LightModeIcon />}
              </IconButton>
            </Tooltip>
            {/* Soporte */}
            <Tooltip title="Soporte / Ayuda">
              <IconButton color={themeMode === 'light' ? 'default' : 'inherit'} onClick={handleOpenSupport}>
                <HelpOutlineIcon sx={{ color: themeMode === 'light' ? '#22345a' : '#e3eafc' }} />
              </IconButton>
            </Tooltip>
          </Box>
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color={themeMode === 'light' ? 'default' : 'inherit'}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: themeMode === 'light' ? '#e3eafc' : undefined }}>
              <AccountCircleIcon sx={{ color: themeMode === 'light' ? '#22345a' : undefined }} />
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
          >
            <MenuItem onClick={() => navigate(`/dashboard/${userRole === 'admin' ? 'admin/perfil' : userRole === 'student' ? 'student/profile' : 'company/profile'}`)}>
              <ListItemIcon>
                <AccountCircleIcon fontSize="small" />
              </ListItemIcon>
              Mi Perfil
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Cerrar Sesión
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      {/* Modal de soporte */}
      <Modal
        open={openSupport}
        onClose={handleCloseSupport}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{ backdrop: { timeout: 300 } }}
      >
        <Fade in={openSupport}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: '#f4f8ff',
            borderRadius: 3,
            boxShadow: 24,
            p: 4,
            minWidth: 320,
            maxWidth: '90vw',
          }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              ¿Tienes dudas? Contáctanos y te responderemos a la brevedad
            </Typography>
            <TextField
              label="Nombre"
              variant="outlined"
              fullWidth
              sx={{ mb: 2, background: '#eaf2fb', borderRadius: 1 }}
              value={supportForm.nombre}
              onChange={e => setSupportForm(f => ({ ...f, nombre: e.target.value }))}
            />
            <TextField
              label="Correo electrónico"
              variant="outlined"
              fullWidth
              sx={{ mb: 2, background: '#eaf2fb', borderRadius: 1 }}
              value={supportForm.correo}
              onChange={e => setSupportForm(f => ({ ...f, correo: e.target.value }))}
            />
            <TextField
              label="Mensaje"
              variant="outlined"
              fullWidth
              multiline
              minRows={3}
              sx={{ mb: 3, background: '#eaf2fb', borderRadius: 1 }}
              value={supportForm.mensaje}
              onChange={e => setSupportForm(f => ({ ...f, mensaje: e.target.value }))}
            />
            <Button variant="contained" color="primary" fullWidth sx={{ borderRadius: 2, fontWeight: 600 }} onClick={handleCloseSupport}>
              Enviar mensaje
            </Button>
          </Box>
        </Fade>
      </Modal>
      {/* Fin modal soporte */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              maxWidth: drawerWidth,
              bgcolor: themeMode === 'light' ? '#fff' : '#10213a',
              color: themeMode === 'light' ? '#22345a' : '#e3eafc',
              borderRight: 0,
            },
            '& .MuiListItemText-primary': {
              color: themeMode === 'light' ? '#22345a' : '#e3eafc',
              fontWeight: 600,
            },
            '& .MuiListItemIcon-root': {
              color: themeMode === 'light' ? '#22345a' : '#b6c6e3',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              maxWidth: drawerWidth,
              background: themeMode === 'light' ? '#fff' : '#10213a',
              color: themeMode === 'light' ? '#22345a' : '#e3eafc',
              borderRight: 0,
            },
            '& .MuiListItemText-primary': {
              color: themeMode === 'light' ? '#22345a' : '#e3eafc',
              fontWeight: 600,
            },
            '& .MuiListItemIcon-root': {
              color: themeMode === 'light' ? '#22345a' : '#b6c6e3',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100vw - ${drawerWidth}px)` }, maxWidth: '100vw', overflowX: 'hidden' }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardLayout; 