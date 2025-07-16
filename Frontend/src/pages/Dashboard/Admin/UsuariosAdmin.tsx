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
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  School as SchoolIcon,
  AdminPanelSettings as AdminIcon,
  Warning as WarningIcon,
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
  status?: string; // Added status field
}

export default function UsuariosAdmin() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [limit, setLimit] = useState(20);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);


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
    // Hacer la función fetchUsers disponible globalmente
    if (typeof window !== 'undefined') {
      (window as any).refreshUsers = fetchUsers;
    }
    return () => {
      if (typeof window !== 'undefined') {
        (window as any).refreshUsers = undefined;
      }
    };
  }, [statusFilter, typeFilter, limit]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      let params = [];
      if (statusFilter === 'active') params.push('is_active=true');
      if (statusFilter === 'inactive') params.push('is_active=false');
      if (statusFilter === 'blocked') params.push('is_verified=false');
      if (typeFilter) params.push(`role=${typeFilter}`);
      const query = params.length ? `?${params.join('&')}` : '';
      const response = await apiService.get(`/api/users/${query}`);
      console.log('Respuesta del backend:', response);
      
      // El backend envía {success: true, data: [...]}
      const usersData = response.data || response;
      
      const formattedUsers = Array.isArray(usersData) ? usersData.map((user: any) => ({
        id: user.id,
        username: user.username || '',
        email: user.email,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        user_type: user.role || 'student', // El backend envía 'role', no 'user_type'
        is_active: user.is_active,
        is_verified: user.is_verified, // <-- Agregado
        date_joined: user.date_joined,
        last_login: user.last_login,
        phone: user.phone || '',
        avatar: user.avatar,
        company_name: user.company_name || '',
        career: user.career || '',
        position: user.position || '',
        status: user.status, // Added status to formatted users
      })) : [];
      
      console.log('Usuarios formateados:', formattedUsers);
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
        role: formData.user_type, // Cambiado de user_type a role
        phone: formData.phone,
        company_name: formData.company_name,
        career: formData.career,
        position: formData.position,
        password: formData.password,
      };

      const response = await apiService.post('/api/users/create/', userData);
      console.log('Respuesta al crear usuario:', response);
      
      setSuccess('Usuario creado exitosamente');
      setShowCreateDialog(false);
      resetForm();
      await fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      // Si el error tiene response y status 201, considerar éxito
      if (error?.response?.status === 201) {
        setSuccess('Usuario creado exitosamente');
        setShowCreateDialog(false);
        resetForm();
        await fetchUsers();
        return;
      }
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



  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        // Usuario está activo, lo suspendemos
        await apiService.post(`/api/users/${userId}/suspend/`);
        setSuccess('Usuario suspendido exitosamente');
      } else {
        // Usuario está inactivo, lo activamos
        await apiService.post(`/api/users/${userId}/activate/`);
        setSuccess('Usuario activado exitosamente');
      }
      
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
    (statusFilter === 'active' ? user.is_active === true : 
     statusFilter === 'inactive' ? user.is_active === false : true) &&
    (statusFilter === 'blocked' ? user.is_verified === false : true) // Filtro para usuarios bloqueados
  ).slice(0, limit);

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
              <MenuItem value="blocked">Bloqueados</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Mostrar</InputLabel>
            <Select
              value={limit}
              label="Mostrar"
              onChange={(e) => setLimit(Number(e.target.value))}
            >
              <MenuItem value={20}>20 últimos</MenuItem>
              <MenuItem value={50}>50 últimos</MenuItem>
              <MenuItem value={100}>100 últimos</MenuItem>
              <MenuItem value={150}>150 últimos</MenuItem>
              <MenuItem value={200}>200 últimos</MenuItem>
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
                      label={
                        !user.is_verified ? 'Bloqueado' :
                        !user.is_active ? 'Inactivo' :
                        'Activo'
                      }
                      color={
                        !user.is_verified ? 'error' :
                        !user.is_active ? 'warning' :
                        'success'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(user.date_joined).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Editar">
                        <span>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditUser(user)}
                          >
                            <EditIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                      {/* Acciones solo para empresas */}
                      {(user.user_type === 'company' || user.user_type === 'student') && (
                        <>
                          <Tooltip title="Activar">
                            <span>
                              <IconButton
                                size="small"
                                color="success"
                                onClick={async () => {
                                  await apiService.post(`/api/users/${user.id}/activate/`);
                                  setSuccess('Usuario activado exitosamente');
                                  fetchUsers();
                                }}
                                disabled={user.is_active}
                              >
                                <CheckCircleIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Suspender">
                            <span>
                              <IconButton
                                size="small"
                                color="warning"
                                onClick={async () => {
                                  await apiService.post(`/api/users/${user.id}/suspend/`);
                                  setSuccess('Usuario suspendido exitosamente');
                                  fetchUsers();
                                }}
                                disabled={!user.is_active}
                              >
                                <WarningIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Bloquear">
                            <span>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={async () => {
                                  await apiService.post(`/api/users/${user.id}/block/`);
                                  setSuccess('Usuario bloqueado exitosamente');
                                  fetchUsers();
                                }}
                                disabled={!user.is_verified}
                              >
                                <BlockIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Desbloquear">
                            <span>
                              <IconButton
                                size="small"
                                color="info"
                                onClick={async () => {
                                  await apiService.post(`/api/users/${user.id}/unblock/`);
                                  setSuccess('Usuario desbloqueado exitosamente');
                                  fetchUsers();
                                }}
                                disabled={user.is_verified}
                              >
                                <CheckCircleIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </>
                      )}
                      {/* Acciones para admin u otros tipos, si aplica, aquí... */}
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