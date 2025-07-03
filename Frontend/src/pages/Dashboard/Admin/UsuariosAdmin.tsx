import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Snackbar,
  Avatar,

} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  School as SchoolIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { apiService } from '../../../services/api.service';

interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: 'student' | 'company' | 'admin';
  is_active: boolean;
  date_joined: string;
  last_login?: string;
  phone?: string;
  avatar?: string;
  company_name?: string;
  career?: string;
  position?: string;
}

export default function UsuariosAdmin() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    user_type: 'student' as 'student' | 'company' | 'admin',
    phone: '',
    company_name: '',
    career: '',
    position: '',
    password: '',
    confirm_password: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await apiService.get('/api/users/');
      const formattedUsers = Array.isArray(data) ? data.map((user: any) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        user_type: user.user_type || 'student',
        is_active: user.is_active,
        date_joined: user.date_joined,
        last_login: user.last_login,
        phone: user.phone || '',
        avatar: user.avatar,
        company_name: user.company_name || '',
        career: user.career || '',
        position: user.position || '',
      })) : [];
      
      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (formData.password !== formData.confirm_password) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    try {
      const userData = {
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        user_type: formData.user_type,
        phone: formData.phone,
        company_name: formData.company_name,
        career: formData.career,
        position: formData.position,
        password: formData.password,
      };

      await apiService.post('/api/users/', userData);
      
      setSuccess('Usuario creado exitosamente');
      setShowCreateDialog(false);
      resetForm();
      await fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      setError('Error al crear el usuario');
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      const updateData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        company_name: formData.company_name,
        career: formData.career,
        position: formData.position,
      };

      await apiService.patch(`/api/users/${selectedUser.id}/`, updateData);
      
      setSuccess('Usuario actualizado exitosamente');
      setShowEditDialog(false);
      resetForm();
      await fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Error al actualizar el usuario');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await apiService.delete(`/api/users/${selectedUser.id}/`);
      
      setSuccess('Usuario eliminado exitosamente');
      setShowDeleteDialog(false);
      await fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Error al eliminar el usuario');
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await apiService.patch(`/api/users/${userId}/`, {
        is_active: !currentStatus,
      });
      
      setSuccess(`Usuario ${currentStatus ? 'desactivado' : 'activado'} exitosamente`);
      await fetchUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
      setError('Error al cambiar el estado del usuario');
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      user_type: user.user_type,
      phone: user.phone || '',
      company_name: user.company_name || '',
      career: user.career || '',
      position: user.position || '',
      password: '',
      confirm_password: '',
    });
    setShowEditDialog(true);
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      user_type: 'student',
      phone: '',
      company_name: '',
      career: '',
      position: '',
      password: '',
      confirm_password: '',
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'admin': return <AdminIcon color="error" />;
      case 'company': return <BusinessIcon color="primary" />;
      case 'student': return <SchoolIcon color="success" />;
      default: return <PersonIcon color="action" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'admin': return 'error';
      case 'company': return 'primary';
      case 'student': return 'success';
      default: return 'default';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'admin': return 'Administrador';
      case 'company': return 'Empresa';
      case 'student': return 'Estudiante';
      default: return type;
    }
  };

  const filteredUsers = users.filter(user =>
    (user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
     user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
     user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     user.last_name.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (typeFilter ? user.user_type === typeFilter : true) &&
    (statusFilter ? user.is_active === (statusFilter === 'active') : true)
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <PersonIcon sx={{ mr: 2, color: 'primary.main' }} />
        Gestión de Usuarios
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filtros y búsqueda */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            label="Buscar usuarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300 }}
          />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Tipo</InputLabel>
            <Select
              value={typeFilter}
              label="Tipo"
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="student">Estudiantes</MenuItem>
              <MenuItem value="company">Empresas</MenuItem>
              <MenuItem value="admin">Administradores</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Estado</InputLabel>
            <Select
              value={statusFilter}
              label="Estado"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="active">Activos</MenuItem>
              <MenuItem value="inactive">Inactivos</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowCreateDialog(true)}
          >
            Nuevo Usuario
          </Button>
        </Box>
      </Paper>

      {/* Tabla de usuarios */}
      <Paper sx={{ overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'primary.main' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Usuario</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tipo</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha Registro</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar src={user.avatar} sx={{ width: 40, height: 40 }}>
                        {user.first_name?.[0]}{user.last_name?.[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {user.first_name} {user.last_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          @{user.username}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getTypeIcon(user.user_type)}
                      <Chip 
                        label={getTypeText(user.user_type)} 
                        color={getTypeColor(user.user_type) as any}
                        size="small"
                      />
                    </Box>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip 
                      label={user.is_active ? 'Activo' : 'Inactivo'} 
                      color={user.is_active ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(user.date_joined).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEditUser(user)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color={user.is_active ? 'warning' : 'success'}
                        onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                      >
                        {user.is_active ? <BlockIcon /> : <CheckCircleIcon />}
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowDeleteDialog(true);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {filteredUsers.length === 0 && !loading && (
        <Alert severity="info" sx={{ mt: 3 }}>
          No se encontraron usuarios que coincidan con los filtros aplicados.
        </Alert>
      )}

      {/* Dialog para crear usuario */}
      <Dialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Crear Nuevo Usuario</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
            <TextField
              label="Nombre de usuario"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              fullWidth
              required
            />
            <FormControl fullWidth required>
              <InputLabel>Tipo de usuario</InputLabel>
              <Select
                value={formData.user_type}
                label="Tipo de usuario"
                onChange={(e) => setFormData({ ...formData, user_type: e.target.value as any })}
              >
                <MenuItem value="student">Estudiante</MenuItem>
                <MenuItem value="company">Empresa</MenuItem>
                <MenuItem value="admin">Administrador</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Nombre"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Apellido"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Teléfono"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              fullWidth
            />
            {formData.user_type === 'company' && (
              <TextField
                label="Nombre de la empresa"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                fullWidth
              />
            )}
            {formData.user_type === 'student' && (
              <TextField
                label="Carrera"
                value={formData.career}
                onChange={(e) => setFormData({ ...formData, career: e.target.value })}
                fullWidth
              />
            )}
            <TextField
              label="Contraseña"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Confirmar contraseña"
              type="password"
              value={formData.confirm_password}
              onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
              fullWidth
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateDialog(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleCreateUser}
            disabled={!formData.username || !formData.email || !formData.password || !formData.confirm_password}
          >
            Crear Usuario
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para editar usuario */}
      <Dialog open={showEditDialog} onClose={() => setShowEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Editar Usuario</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
            <TextField
              label="Nombre de usuario"
              value={formData.username}
              disabled
              fullWidth
            />
            <TextField
              label="Tipo de usuario"
              value={getTypeText(formData.user_type)}
              disabled
              fullWidth
            />
            <TextField
              label="Nombre"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Apellido"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Teléfono"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              fullWidth
            />
            {formData.user_type === 'company' && (
              <TextField
                label="Nombre de la empresa"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                fullWidth
              />
            )}
            {formData.user_type === 'student' && (
              <TextField
                label="Carrera"
                value={formData.career}
                onChange={(e) => setFormData({ ...formData, career: e.target.value })}
                fullWidth
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditDialog(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleUpdateUser}
            disabled={!formData.first_name || !formData.last_name || !formData.email}
          >
            Actualizar Usuario
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para confirmar eliminación */}
      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar al usuario "{selectedUser?.first_name} {selectedUser?.last_name}"?
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancelar</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteUser}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
} 