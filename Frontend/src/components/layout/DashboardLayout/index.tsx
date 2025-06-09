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
} from '@mui/icons-material';
import { useAuth } from '../../../hooks/useAuth';

const drawerWidth = 280;

interface DashboardLayoutProps {
  userRole: 'admin' | 'company' | 'student';
}

export const DashboardLayout = ({ userRole }: DashboardLayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

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
        { text: 'Mis Proyectos', icon: <AssignmentIcon />, path: '/dashboard/company/my-projects' },
        { text: 'Postulantes', icon: <PeopleIcon />, path: '/dashboard/company/applicants' },
        { text: 'Evaluaciones', icon: <AssessmentIcon />, path: '/dashboard/company/evaluations' },
        { text: 'Calendario', icon: <CalendarIcon />, path: '/dashboard/company/calendar' },
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
        <Typography variant="h6" noWrap component="div">
          LeanMaker
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {getMenuItems().map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path || (item.path !== '/dashboard/student' && location.pathname.startsWith(item.path))}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
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
          <Box sx={{ flexGrow: 1 }} />
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32 }}>
              <AccountCircleIcon />
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
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardLayout; 