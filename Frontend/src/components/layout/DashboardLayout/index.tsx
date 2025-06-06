import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
} from '@mui/icons-material';
import { useAuth } from '../../../hooks/useAuth';

const drawerWidth = 280;

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole: 'admin' | 'company' | 'student';
}

export const DashboardLayout = ({ children, userRole }: DashboardLayoutProps) => {
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
    const commonItems = [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
      { text: 'Perfil', icon: <AccountCircleIcon />, path: '/dashboard/profile' },
      { text: 'Notificaciones', icon: <NotificationsIcon />, path: '/dashboard/notifications' },
    ];

    const roleSpecificItems = {
      admin: [
        { text: 'Usuarios', icon: <PeopleIcon />, path: '/dashboard/users' },
        { text: 'Empresas', icon: <BusinessIcon />, path: '/dashboard/companies' },
        { text: 'Estudiantes', icon: <SchoolIcon />, path: '/dashboard/students' },
        { text: 'Proyectos', icon: <AssignmentIcon />, path: '/dashboard/projects' },
        { text: 'Evaluaciones', icon: <AssessmentIcon />, path: '/dashboard/evaluations' },
        { text: 'Configuración', icon: <SettingsIcon />, path: '/dashboard/settings' },
      ],
      company: [
        { text: 'Mis Proyectos', icon: <AssignmentIcon />, path: '/dashboard/my-projects' },
        { text: 'Postulantes', icon: <PeopleIcon />, path: '/dashboard/applicants' },
        { text: 'Evaluaciones', icon: <AssessmentIcon />, path: '/dashboard/evaluations' },
        { text: 'Calendario', icon: <CalendarIcon />, path: '/dashboard/calendar' },
      ],
      student: [
        { text: 'Proyectos Disponibles', icon: <AssignmentIcon />, path: '/dashboard/available-projects' },
        { text: 'Mis Aplicaciones', icon: <AssignmentIcon />, path: '/dashboard/my-applications' },
        { text: 'Mis Proyectos', icon: <AssignmentIcon />, path: '/dashboard/my-projects' },
        { text: 'Evaluaciones', icon: <AssessmentIcon />, path: '/dashboard/evaluations' },
        { text: 'Calendario', icon: <CalendarIcon />, path: '/dashboard/calendar' },
      ],
    };

    return [...commonItems, ...roleSpecificItems[userRole]];
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
              selected={location.pathname === item.path}
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
            <MenuItem onClick={() => navigate('/dashboard/profile')}>
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
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout; 