import React from 'react';
import { Box, Drawer, AppBar, Toolbar, Typography, IconButton, Avatar, List, ListItemIcon, ListItemText, Divider, InputBase, ListItemButton } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MailIcon from '@mui/icons-material/Mail';
import PersonIcon from '@mui/icons-material/Person';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';

const drawerWidth = 220;

const navItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard/student' },
  { text: 'Proyectos', icon: <AssignmentIcon />, path: '/dashboard/student/my-projects' },
  { text: 'Aplicaciones', icon: <MailIcon />, path: '/dashboard/student/my-applications' },
  { text: 'Evaluaciones', icon: <NotificationsIcon />, path: '/dashboard/student/evaluations' },
  { text: 'Perfil', icon: <PersonIcon />, path: '/dashboard/student/profile' },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f8fa' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: '#232e3c',
            color: 'white',
            borderRight: 0,
          },
        }}
      >
        <Toolbar sx={{ justifyContent: 'center', minHeight: 64 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>LM</Avatar>
            <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 1 }}>
              Leanmaker
            </Typography>
          </Box>
        </Toolbar>
        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: 1 }} />
        <List>
          {navItems.map((item) => (
            <ListItemButton
              key={item.text}
              sx={{ borderRadius: 2, mx: 1, mb: 0.5, '&:hover': { bgcolor: 'primary.dark', color: 'white' } }}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>
      {/* Main content */}
      <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: '#f5f8fa' }}>
        {/* AppBar */}
        <AppBar position="static" color="inherit" elevation={0} sx={{ bgcolor: '#fff', borderBottom: '1px solid #e0e0e0' }}>
          <Toolbar>
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
              <InputBase
                placeholder="Buscar..."
                startAdornment={<SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />}
                sx={{ bgcolor: '#f0f2f5', px: 2, py: 0.5, borderRadius: 2, width: 280, fontSize: 15 }}
              />
            </Box>
            <IconButton sx={{ ml: 2 }}>
              <NotificationsIcon color="primary" />
            </IconButton>
            <IconButton sx={{ ml: 2 }}>
              <Avatar alt="Estudiante" src="/avatar.png" />
            </IconButton>
          </Toolbar>
        </AppBar>
        {/* Content */}
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>{children}</Box>
      </Box>
    </Box>
  );
} 