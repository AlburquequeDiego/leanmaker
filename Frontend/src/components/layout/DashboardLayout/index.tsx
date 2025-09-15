import { useState, useEffect, useCallback, useMemo } from 'react';
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
  useTheme as useMuiTheme,
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
  Analytics as AnalyticsIcon,
  EmojiEvents as EmojiEventsIcon,
  Groups as GroupsIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme as useCustomTheme } from '../../../contexts/ThemeContext';
import { NotificationCenter } from '../../notifications/NotificationCenter';

const drawerWidth = 280;
const collapsedDrawerWidth = 70;

interface DashboardLayoutProps {
  userRole: 'admin' | 'company' | 'student' | 'teacher';
}

export const DashboardLayout = ({ userRole }: DashboardLayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { themeMode, toggleTheme } = useCustomTheme();
  const muiTheme = useMuiTheme();

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

  const handleDrawerToggle = useCallback(() => {
    setMobileOpen(!mobileOpen);
  }, [mobileOpen]);

  const handleSidebarToggle = useCallback(() => {
    setSidebarCollapsed(!sidebarCollapsed);
  }, [sidebarCollapsed]);

  const handleProfileMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleProfileMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  // Memoize menu items to prevent unnecessary re-renders
  const menuItems = useMemo(() => {
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
      teacher: [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard/teacher' },
        { text: 'Perfil', icon: <AccountCircleIcon />, path: '/dashboard/teacher/profile' },
        { text: 'Notificaciones', icon: <NotificationsIcon />, path: '/dashboard/teacher/notifications' },
        { text: 'Desafíos Académicos', icon: <EmojiEventsIcon />, path: '/dashboard/teacher/challenges' },
        { text: 'Gestión de Secciones', icon: <GroupsIcon />, path: '/dashboard/teacher/sections' },
        { text: 'Gestión de Avance', icon: <TrendingUpIcon />, path: '/dashboard/teacher/progress' },
      ],
    };

    const roleSpecificItems = {
      admin: [
        { text: 'Gestión de Usuarios', icon: <PeopleIcon />, path: '/dashboard/admin/usuarios' },
        { text: 'Validación de Horas', icon: <AccessTimeIcon />, path: '/dashboard/admin/validacion-horas' },
        { text: 'Gestión de Empresas', icon: <BusinessIcon />, path: '/dashboard/admin/gestion-empresas' },
        { text: 'Gestión de Estudiantes', icon: <SchoolIcon />, path: '/dashboard/admin/gestion-estudiantes' },
        { text: 'Gestión de Docentes', icon: <SchoolIcon />, path: '/dashboard/admin/gestion-docentes' },
        { text: 'Gestión de Proyectos', icon: <AssignmentIcon />, path: '/dashboard/admin/gestion-proyectos' },
        { text: 'Gestión de Evaluaciones', icon: <AssessmentIcon />, path: '/dashboard/admin/gestion-evaluaciones' },
        { text: 'Reportes y Analytics', icon: <AnalyticsIcon />, path: '/dashboard/admin/configuracion-plataforma' },
      ],
      company: [
        { text: 'Proyectos', icon: <AssignmentIcon />, path: '/dashboard/company/projects' },
        { text: 'Desafíos Colectivos', icon: <EmojiEventsIcon />, path: '/dashboard/company/challenges' },
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
      teacher: [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard/teacher' },
        { text: 'Perfil', icon: <AccountCircleIcon />, path: '/dashboard/teacher/profile' },
      ],
    };

    return userRole === 'teacher' ? commonItems[userRole] : [...commonItems[userRole], ...roleSpecificItems[userRole]];
  }, [userRole]);

  // Memoize the drawer content
  const drawer = useMemo(() => (
    <Box sx={{ 
      bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
      color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Toolbar sx={{ justifyContent: 'center', py: 2 }}>
        {!sidebarCollapsed && (
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              color: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
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
              color: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
              fontWeight: 700, 
              letterSpacing: 1,
              fontSize: '1.2rem'
            }}
          >
            LM
          </Typography>
        )}
      </Toolbar>
      <Divider sx={{ bgcolor: themeMode === 'dark' ? '#334155' : '#e2e8f0' }} />
      <Box sx={{ 
        flex: 1, 
        overflowY: 'auto',
        overflowX: 'hidden',
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
          borderRadius: '3px',
          '&:hover': {
            background: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.25)',
          },
        },
      }}>
        <List>
        {menuItems.map((item) => {
          // Lógica mejorada para la selección
          let selected = false;
          
          if (item.path === location.pathname) {
            // Coincidencia exacta
            selected = true;
          } else if (item.text === 'Dashboard') {
            // Para Dashboard, solo seleccionar si estamos exactamente en la ruta del dashboard
            selected = location.pathname === item.path;
          } else {
            // Para otros elementos, verificar si la ruta actual comienza con el path del item
            // pero solo si no es el dashboard
            selected = location.pathname.startsWith(item.path) && item.path !== '/dashboard/admin' && item.path !== '/dashboard/company' && item.path !== '/dashboard/student' && item.path !== '/dashboard/teacher';
          }
          
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
                    my: 0.5,
                    mx: 1,
                    height: 56,
                    minHeight: 56,
                    justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                    transition: 'all 0.2s ease-in-out',
                    bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
                    color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                    '&.Mui-selected': {
                      backgroundColor: themeMode === 'dark' ? '#ffffff' : '#2563eb',
                      color: themeMode === 'dark' ? '#1e293b' : '#ffffff',
                      '&:hover': {
                        backgroundColor: themeMode === 'dark' ? '#f1f5f9' : '#1d4ed8',
                      },
                      '& .MuiListItemIcon-root': {
                        color: themeMode === 'dark' ? '#1e293b' : '#ffffff',
                      },
                    },
                    '&:hover': {
                      backgroundColor: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(37, 99, 235, 0.08)',
                    },
                    fontWeight: selected ? 700 : 500,
                  }}
                >
                  <ListItemIcon 
                    sx={{ 
                      color: selected 
                        ? (themeMode === 'dark' ? '#1e293b' : '#ffffff')
                        : (themeMode === 'dark' ? '#cbd5e1' : '#64748b'),
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
                        fontWeight: selected ? 700 : 600, 
                        fontSize: 18,
                        color: selected 
                          ? (themeMode === 'dark' ? '#1e293b' : '#ffffff')
                          : (themeMode === 'dark' ? '#f1f5f9' : '#1e293b')
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
    </Box>
  ), [menuItems, location.pathname, sidebarCollapsed, themeMode, navigate]);

  // Helper para obtener el nombre de la sección actual
  const sectionName = useMemo(() => {
    const path = location.pathname;
    const exactMatch = menuItems.find((item) => path === item.path);
    if (exactMatch) {
      return exactMatch.text;
    }
    
    // pero excluir el dashboard para evitar que se muestre "Dashboard" en todas las páginas
    const partialMatch = menuItems.find((item) => {
      if (item.text === 'Dashboard') {
        return false;
      }
      return path.startsWith(item.path) && item.path !== '/dashboard/admin' && item.path !== '/dashboard/company' && item.path !== '/dashboard/student' && item.path !== '/dashboard/teacher';
    });
    
    return partialMatch ? partialMatch.text : '';
  }, [location.pathname, menuItems]);

  // Memoize the AppBar styles
  const appBarStyles = useMemo(() => ({
    width: { sm: `calc(100vw - ${sidebarCollapsed ? collapsedDrawerWidth : drawerWidth}px)` },
    ml: { sm: `${sidebarCollapsed ? collapsedDrawerWidth : drawerWidth}px` },
    bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
    color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
    boxShadow: themeMode === 'dark' ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.06)',
    maxWidth: '100vw',
    overflowX: 'hidden',
    transition: 'width 0.2s ease-in-out, margin-left 0.2s ease-in-out',
  }), [sidebarCollapsed, themeMode]);

  return (
    <Box sx={{ display: 'flex', width: '100vw', maxWidth: '100vw', overflowX: 'hidden', minHeight: '100vh' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={appBarStyles}
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
            sx={{ fontWeight: 600, flexGrow: 1, textAlign: { xs: 'center', sm: 'left' }, color: themeMode === 'dark' ? '#60a5fa' : '#3b82f6' }}
          >
            {sectionName}
          </Typography>
          {/* Iconos adicionales a la derecha */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: 1 }}>
            {/* Tema claro/oscuro */}
            <Tooltip title={themeMode === 'light' ? 'Modo oscuro' : 'Modo claro'}>
              <IconButton color="inherit" onClick={toggleTheme}>
                {themeMode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
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
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6' }}>
              <AccountCircleIcon />
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            PaperProps={{
              sx: {
                bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
                color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                boxShadow: themeMode === 'dark' ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.1)',
                '& .MuiMenuItem-root': {
                  '&:hover': {
                    bgcolor: themeMode === 'dark' ? '#334155' : '#f1f5f9',
                  },
                },
              },
            }}
          >
            <MenuItem onClick={() => navigate(`/dashboard/${userRole === 'admin' ? 'admin/perfil' : userRole === 'student' ? 'student/profile' : userRole === 'teacher' ? 'teacher/profile' : 'company/profile'}`)}>
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
          transition: 'width 0.2s ease-in-out'
        }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              maxWidth: drawerWidth,
              bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
              color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
              borderRight: 0,
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
                borderRadius: '3px',
                '&:hover': {
                  background: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.25)',
                },
              },
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
              background: themeMode === 'dark' ? '#1e293b' : '#ffffff',
              color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
              borderRight: 0,
              transition: 'width 0.2s ease-in-out',
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
                borderRadius: '3px',
                '&:hover': {
                  background: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.25)',
                },
              },
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
          transition: 'width 0.2s ease-in-out',
          bgcolor: themeMode === 'dark' ? '#0f172a' : '#f8fafc',
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardLayout; 