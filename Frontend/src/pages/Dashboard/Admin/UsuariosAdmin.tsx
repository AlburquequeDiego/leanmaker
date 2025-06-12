import { useState } from 'react';
import {
  Box, Paper, Typography, TextField, Select, MenuItem, InputLabel, FormControl, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Stack, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Avatar, Snackbar
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Block as BlockIcon, 
  CheckCircle as CheckCircleIcon,
  People as PeopleIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon
} from '@mui/icons-material';

const mockUsers = [
  { 
    id: 1, 
    name: 'Juan Pérez', 
    email: 'juan@email.com', 
    role: 'Estudiante', 
    status: 'Activo',
    avatar: 'JP',
    lastActivity: '2024-01-20',
    joinDate: '2023-08-15'
  },
  { 
    id: 2, 
    name: 'Empresa ACME', 
    email: 'contacto@acme.com', 
    role: 'Empresa', 
    status: 'Pendiente',
    avatar: 'EA',
    lastActivity: '2024-01-18',
    joinDate: '2024-01-10'
  },
  { 
    id: 3, 
    name: 'Ana Admin', 
    email: 'ana@admin.com', 
    role: 'Administrador', 
    status: 'Activo',
    avatar: 'AA',
    lastActivity: '2024-01-22',
    joinDate: '2022-12-01'
  },
  { 
    id: 4, 
    name: 'Pedro López', 
    email: 'pedro@email.com', 
    role: 'Estudiante', 
    status: 'Suspendido',
    avatar: 'PL',
    lastActivity: '2024-01-15',
    joinDate: '2023-09-20'
  },
  { 
    id: 5, 
    name: 'TechCorp Solutions', 
    email: 'info@techcorp.com', 
    role: 'Empresa', 
    status: 'Activo',
    avatar: 'TS',
    lastActivity: '2024-01-21',
    joinDate: '2023-03-15'
  },
];

export default function UsuariosAdmin() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [actionDialog, setActionDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [actionType, setActionType] = useState<'edit' | 'delete' | 'block' | 'activate' | 'view' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const filteredUsers = mockUsers.filter(user =>
    (user.name.toLowerCase().includes(search.toLowerCase()) || user.email.toLowerCase().includes(search.toLowerCase())) &&
    (role ? user.role === role : true) &&
    (status ? user.status === status : true)
  );

  const handleAction = (user: any, type: 'edit' | 'delete' | 'block' | 'activate' | 'view') => {
    setSelectedUser(user);
    setActionType(type);
    setActionDialog(true);
    setActionReason('');
  };

  const handleActionConfirm = () => {
    let message = '';
    switch (actionType) {
      case 'edit':
        message = `Usuario ${selectedUser?.name} actualizado exitosamente`;
        break;
      case 'delete':
        message = `Usuario ${selectedUser?.name} eliminado`;
        break;
      case 'block':
        message = `Usuario ${selectedUser?.name} bloqueado`;
        break;
      case 'activate':
        message = `Usuario ${selectedUser?.name} activado`;
        break;
      case 'view':
        message = `Viendo detalles de ${selectedUser?.name}`;
        break;
    }
    setSuccessMessage(message);
    setShowSuccess(true);
    setActionDialog(false);
    setActionReason('');
  };

  const getDialogTitle = () => {
    switch (actionType) {
      case 'edit': return 'Editar Usuario';
      case 'delete': return 'Eliminar Usuario';
      case 'block': return 'Bloquear Usuario';
      case 'activate': return 'Activar Usuario';
      case 'view': return 'Detalles del Usuario';
      default: return '';
    }
  };

  const getDialogContent = () => {
    if (!selectedUser) return null;

    if (actionType === 'view') {
      return (
        <Box>
          <Typography variant="h6" gutterBottom>Información del Usuario</Typography>
          <Typography><strong>Nombre:</strong> {selectedUser.name}</Typography>
          <Typography><strong>Email:</strong> {selectedUser.email}</Typography>
          <Typography><strong>Rol:</strong> {selectedUser.role}</Typography>
          <Typography><strong>Estado:</strong> {selectedUser.status}</Typography>
          <Typography><strong>Fecha de Registro:</strong> {new Date(selectedUser.joinDate).toLocaleDateString()}</Typography>
          <Typography><strong>Última Actividad:</strong> {new Date(selectedUser.lastActivity).toLocaleDateString()}</Typography>
        </Box>
      );
    }

    return (
      <Box>
        <Typography variant="h6" gutterBottom>Usuario: {selectedUser.name}</Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {selectedUser.email} - {selectedUser.role}
        </Typography>
        <Typography variant="body2" gutterBottom>
          Estado actual: <strong>{selectedUser.status}</strong>
        </Typography>
        
        {(actionType === 'delete' || actionType === 'block') && (
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Razón de la acción"
            value={actionReason}
            onChange={(e) => setActionReason(e.target.value)}
            sx={{ mt: 2, borderRadius: 2 }}
            required
          />
        )}
        
        {actionType === 'delete' && (
          <Typography variant="body1" sx={{ mt: 2, p: 2, bgcolor: 'error.light', borderRadius: 2, color: 'error.contrastText' }}>
            ⚠️ Esta acción es irreversible. El usuario será eliminado permanentemente.
          </Typography>
        )}
        
        {actionType === 'activate' && (
          <Typography variant="body1" sx={{ mt: 2, p: 2, bgcolor: 'success.light', borderRadius: 2, color: 'success.contrastText' }}>
            ¿Estás seguro de que deseas reactivar este usuario? Esto permitirá que vuelva a acceder a la plataforma.
          </Typography>
        )}
      </Box>
    );
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Administrador': return 'error';
      case 'Empresa': return 'secondary';
      case 'Estudiante': return 'primary';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Activo': return 'success';
      case 'Pendiente': return 'warning';
      case 'Suspendido': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4, mb: 4, px: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Typography variant="h4">Gestión de Usuarios</Typography>
      </Box>
      
      {/* Filtros y búsqueda */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            label="Buscar usuario"
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{ minWidth: 200, borderRadius: 2 }}
          />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Rol</InputLabel>
            <Select
              value={role}
              label="Rol"
              onChange={e => setRole(e.target.value)}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="Estudiante">Estudiante</MenuItem>
              <MenuItem value="Empresa">Empresa</MenuItem>
              <MenuItem value="Administrador">Administrador</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Estado</InputLabel>
            <Select
              value={status}
              label="Estado"
              onChange={e => setStatus(e.target.value)}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="Activo">Activo</MenuItem>
              <MenuItem value="Pendiente">Pendiente</MenuItem>
              <MenuItem value="Suspendido">Suspendido</MenuItem>
            </Select>
          </FormControl>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            sx={{ borderRadius: 2 }}
          >
            Agregar Usuario
          </Button>
        </Stack>
      </Paper>

      {/* Tabla de usuarios */}
      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Usuario</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Email</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Rol</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Estado</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Última Actividad</TableCell>
              <TableCell align="center" sx={{ color: 'white', fontWeight: 600 }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map(user => (
              <TableRow key={user.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: getRoleColor(user.role) + '.main' }}>
                      {user.avatar}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {user.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Registrado: {new Date(user.joinDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip 
                    label={user.role} 
                    color={getRoleColor(user.role) as any}
                    variant="filled"
                    sx={{ fontWeight: 600 }}
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={user.status} 
                    color={getStatusColor(user.status) as any}
                    variant="filled"
                    sx={{ fontWeight: 600 }}
                  />
                </TableCell>
                <TableCell>{new Date(user.lastActivity).toLocaleDateString()}</TableCell>
                <TableCell align="center">
                  <IconButton 
                    color="info" 
                    title="Ver detalles"
                    onClick={() => handleAction(user, 'view')}
                    sx={{ mr: 1 }}
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton 
                    color="primary" 
                    title="Editar usuario"
                    onClick={() => handleAction(user, 'edit')}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  {user.status === 'Activo' ? (
                    <IconButton 
                      color="warning" 
                      title="Bloquear usuario"
                      onClick={() => handleAction(user, 'block')}
                      sx={{ mr: 1 }}
                    >
                      <BlockIcon />
                    </IconButton>
                  ) : (
                    <IconButton 
                      color="success" 
                      title="Activar usuario"
                      onClick={() => handleAction(user, 'activate')}
                      sx={{ mr: 1 }}
                    >
                      <CheckCircleIcon />
                    </IconButton>
                  )}
                  <IconButton 
                    color="error" 
                    title="Eliminar usuario"
                    onClick={() => handleAction(user, 'delete')}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Diálogo de acción */}
      <Dialog 
        open={actionDialog} 
        onClose={() => setActionDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {actionType === 'edit' && <EditIcon color="primary" />}
          {actionType === 'delete' && <DeleteIcon color="error" />}
          {actionType === 'block' && <BlockIcon color="warning" />}
          {actionType === 'activate' && <CheckCircleIcon color="success" />}
          {actionType === 'view' && <VisibilityIcon color="info" />}
          {getDialogTitle()}
        </DialogTitle>
        <DialogContent>
          {getDialogContent()}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setActionDialog(false)}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancelar
          </Button>
          {actionType !== 'view' && (
            <Button 
              onClick={handleActionConfirm}
              variant="contained"
              color={
                actionType === 'edit' ? 'primary' : 
                actionType === 'delete' ? 'error' : 
                actionType === 'block' ? 'warning' : 'success'
              }
              sx={{ borderRadius: 2 }}
              disabled={
                (actionType === 'delete' || actionType === 'block') && !actionReason.trim()
              }
            >
              {actionType === 'edit' ? 'Actualizar' : 
               actionType === 'delete' ? 'Eliminar' : 
               actionType === 'block' ? 'Bloquear' : 'Activar'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar de éxito */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={4000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Paper elevation={3} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircleIcon color="success" />
          <Typography color="success.main" fontWeight={600}>
            {successMessage}
          </Typography>
        </Paper>
      </Snackbar>
    </Box>
  );
} 