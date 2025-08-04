import { useState, useEffect } from 'react';
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
  Tooltip,
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
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { useAuth } from '../../../hooks/useAuth';
import { NotificationCenter } from '../../notifications/NotificationCenter';

const drawerWidth = 280;
const collapsedDrawerWidth = 70;

interface DashboardLayoutProps {
  userRole: 'admin' | 'company' | 'student';
}

// Este componente define la estructura principal del dashboard, incluyendo el menú lateral (Drawer),
// la barra superior (AppBar) y el área de contenido dinámico (Outlet). El menú y las opciones
// se adaptan según el rol del usuario (admin, empresa o estudiante).
export const DashboardLayout = ({ userRole }: DashboardLayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('dark');

  // Cargar estado del sidebar desde localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      setSidebarCollapsed(JSON.parse(savedState));
    }
  }, []);

  // Guardar estado del sidebar en localStorage
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
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
        {!sidebarCollapsed && (
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              color: themeMode === 'light' ? '#1976d2' : '#e3eafc', 
              fontWeight: 700, 
              letterSpacing: 1 
            }}
          >
            LeanMaker
          </Typography>
        )}
        {sidebarCollapsed && (
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              color: themeMode === 'light' ? '#1976d2' : '#e3eafc', 
              fontWeight: 700, 
              letterSpacing: 1,
              fontSize: '1.2rem'
            }}
          >
            LM
          </Typography>
        )}
      </Toolbar>
      <Divider sx={{ bgcolor: themeMode === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)' }} />
      <List>
        {getMenuItems().map((item) => {
          const selected = location.pathname === item.path || (item.path !== '/dashboard/student' && location.pathname.startsWith(item.path));
          return (
            <ListItem key={item.text} disablePadding>
              <Tooltip 
                title={sidebarCollapsed ? item.text : ''} 
                placement="right"
                disableHoverListener={!sidebarCollapsed}
              >
                <ListItemButton
                  selected={selected}
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 3,
                    background: selected 
                      ? (themeMode === 'light' ? '#1976d2' : '#22345a') 
                      : 'transparent',
                    color: selected 
                      ? '#fff' 
                      : (themeMode === 'light' ? '#22345a' : '#e3eafc'),
                    my: 0.5,
                    mx: 1,
                    height: 56,
                    minHeight: 56,
                    justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                    transition: 'background 0.2s, color 0.2s',
                    '&:hover': {
                      background: themeMode === 'light' ? '#1976d2' : '#22345a',
                      color: '#fff',
                    },
                    fontWeight: selected ? 700 : 500,
                  }}
                >
                  <ListItemIcon 
                    sx={{ 
                      color: selected 
                        ? '#fff' 
                        : (themeMode === 'light' ? '#1976d2' : '#b6c6e3'), 
                      minWidth: sidebarCollapsed ? 'auto' : 40, 
                      fontSize: 28,
                      margin: sidebarCollapsed ? 0 : undefined
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {!sidebarCollapsed && (
                    <ListItemText 
                      primary={item.text} 
                      primaryTypographyProps={{ 
                        fontWeight: 600, 
                        fontSize: 18,
                        color: selected 
                          ? '#fff' 
                          : (themeMode === 'light' ? '#22345a' : '#e3eafc')
                      }} 
                    />
                  )}
                </ListItemButton>
              </Tooltip>
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
    // Ordenar por longitud de path descendente para que las coincidencias más largas tengan prioridad
    const sortedSections = sections.sort((a, b) => b.path.length - a.path.length);
    const found = sortedSections.find((item) => path === item.path || path.startsWith(item.path));
    return found ? found.text : '';
  };

  return (
    <Box sx={{ display: 'flex', width: '100vw', maxWidth: '100vw', overflowX: 'hidden', minHeight: '100vh' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100vw - ${sidebarCollapsed ? collapsedDrawerWidth : drawerWidth}px)` },
          ml: { sm: `${sidebarCollapsed ? collapsedDrawerWidth : drawerWidth}px` },
          bgcolor: themeMode === 'light' ? '#fff' : '#10213a',
          color: themeMode === 'light' ? '#22345a' : '#e3eafc',
          boxShadow: themeMode === 'light' ? '0 2px 8px rgba(0,0,0,0.06)' : undefined,
          maxWidth: '100vw',
          overflowX: 'hidden',
          transition: 'width 0.3s, margin-left 0.3s',
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
            {/* Tema claro/oscuro */}
            <Tooltip title={themeMode === 'light' ? 'Modo oscuro' : 'Modo claro'}>
              <IconButton color={themeMode === 'light' ? 'default' : 'inherit'} onClick={handleThemeToggle}>
                {themeMode === 'light' ? <DarkModeIcon sx={{ color: '#22345a' }} /> : <LightModeIcon />}
              </IconButton>
            </Tooltip>
            {/* Botón de colapso/expansión */}
            <Tooltip title={sidebarCollapsed ? 'Expandir menú' : 'Colapsar menú'}>
              <IconButton color="inherit" onClick={handleSidebarToggle}>
                {sidebarCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
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
      <Box
        component="nav"
        sx={{ 
          width: { sm: sidebarCollapsed ? collapsedDrawerWidth : drawerWidth }, 
          flexShrink: { sm: 0 },
          transition: 'width 0.3s'
        }}
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
            width: sidebarCollapsed ? collapsedDrawerWidth : drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: sidebarCollapsed ? collapsedDrawerWidth : drawerWidth,
              maxWidth: sidebarCollapsed ? collapsedDrawerWidth : drawerWidth,
              background: themeMode === 'light' ? '#fff' : '#10213a',
              color: themeMode === 'light' ? '#22345a' : '#e3eafc',
              borderRight: 0,
              transition: 'width 0.3s',
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
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { sm: `calc(100vw - ${sidebarCollapsed ? collapsedDrawerWidth : drawerWidth}px)` }, 
          maxWidth: '100vw', 
          overflowX: 'hidden',
          transition: 'width 0.3s'
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardLayout; 