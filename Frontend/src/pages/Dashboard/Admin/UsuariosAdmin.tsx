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
  Card,
  CardContent,
  Divider,
  Stack,
  // Nuevos componentes para alertas
  DialogContentText,
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
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Group as GroupIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  School as SchoolIcon2,
  Delete as DeleteIcon,
  LockOpen as LockOpenIcon,
  Pause as PauseIcon,
} from '@mui/icons-material';
import { apiService } from '../../../services/api.service';
import { useTheme } from '../../../contexts/ThemeContext';

interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: 'student' | 'company' | 'admin' | 'teacher';
  is_active: boolean;
  is_verified: boolean; // <-- Agregado para sincronización
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
  const { themeMode } = useTheme();
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

  // Nuevos estados para alertas de confirmación
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'create' | 'update' | 'activate' | 'suspend' | 'block' | 'unblock';
    message: string;
    userId?: string;
    userType?: string;
    action?: () => Promise<void>;
  } | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    user_type: 'student' as 'student' | 'company' | 'admin' | 'teacher',
    phone: '',
    company_name: '',
    career: '',
    position: '',
    password: '',
    confirm_password: '',
  });

  useEffect(() => {
    fetchUsers();
    
    // Hacer la función fetchUsers disponible globalmente como refreshUsers
    if (typeof window !== 'undefined') {
      (window as any).refreshUsers = fetchUsers;
      console.log('✅ [UsuariosAdmin] refreshUsers expuesto globalmente');
      
      // Verificación adicional inmediata
      setTimeout(() => {
        console.log('🔍 [UsuariosAdmin] Verificación post-exposición - refreshUsers disponible:', typeof (window as any).refreshUsers === 'function');
        console.log('🔍 [UsuariosAdmin] Tipo de refreshUsers:', typeof (window as any).refreshUsers);
        console.log('🔍 [UsuariosAdmin] Valor de refreshUsers:', (window as any).refreshUsers);
      }, 100);
    }
    
    // Agregar listener para cambios en otras interfaces
    const handleUserStateChanged = () => {
      console.log('🔄 [UsuariosAdmin] Evento userStateChanged recibido, refrescando datos...');
      fetchUsers();
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('userStateChanged', handleUserStateChanged);
      console.log('✅ [UsuariosAdmin] Listener para userStateChanged agregado');
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        (window as any).refreshUsers = undefined;
        console.log('🔄 [UsuariosAdmin] refreshUsers removido globalmente');
        
        window.removeEventListener('userStateChanged', handleUserStateChanged);
        console.log('🔄 [UsuariosAdmin] Listener para userStateChanged removido');
      }
    };
  }, []);

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
      const usersData = (response as any).data || response;
      
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

  const refreshOtherInterfaces = () => {
    console.log('🔄 [UsuariosAdmin] Iniciando sincronización con otras interfaces...');
    console.log('🔄 [UsuariosAdmin] Estado actual de usuarios:', users.length);
    
    // Función para intentar refrescar con reintentos
    const attemptRefresh = (maxAttempts = 5, delay = 200) => {
      let attempts = 0;
      
      const tryRefresh = () => {
        attempts++;
        console.log(`🔄 [UsuariosAdmin] Intento ${attempts} de sincronización...`);
        
        // Verificar qué funciones están disponibles
        const refreshCompaniesAvailable = typeof (window as any).refreshCompanies === 'function';
        const refreshStudentsAvailable = typeof (window as any).refreshStudents === 'function';
        
        console.log('🔍 refreshCompanies disponible:', refreshCompaniesAvailable);
        console.log('🔍 refreshStudents disponible:', refreshStudentsAvailable);
        
        // Refrescar gestión de empresas si existe
        if (refreshCompaniesAvailable) {
          console.log('🔄 Llamando a refreshCompanies()...');
          try {
            (window as any).refreshCompanies();
            console.log('✅ refreshCompanies() ejecutado exitosamente');
          } catch (error) {
            console.error('❌ Error al ejecutar refreshCompanies():', error);
          }
        }
        
        // Refrescar gestión de estudiantes si existe
        if (refreshStudentsAvailable) {
          console.log('🔄 Llamando a refreshStudents()...');
          try {
            (window as any).refreshStudents();
            console.log('✅ refreshStudents() ejecutado exitosamente');
          } catch (error) {
            console.error('❌ Error al ejecutar refreshStudents():', error);
          }
        }
        
        // Si no están disponibles y aún tenemos intentos, reintentar
        if (!refreshCompaniesAvailable && !refreshStudentsAvailable && attempts < maxAttempts) {
          console.log(`⏳ Esperando ${delay}ms antes del siguiente intento...`);
          setTimeout(tryRefresh, delay);
        } else if (attempts >= maxAttempts) {
          console.log('⚠️ Máximo de intentos alcanzado, algunas interfaces no están disponibles');
        }
      };
      
      tryRefresh();
    };
    
    // Iniciar el proceso de reintentos
    attemptRefresh();
    
    // Disparar evento personalizado para otras interfaces
    if (typeof window !== 'undefined') {
      console.log('🔄 Disparando evento userStateChanged...');
      try {
        window.dispatchEvent(new CustomEvent('userStateChanged'));
        console.log('✅ Evento userStateChanged disparado exitosamente');
      } catch (error) {
        console.error('❌ Error al disparar evento userStateChanged:', error);
      }
    }
    
    console.log('✅ [UsuariosAdmin] Sincronización completada');
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

    // Mostrar alerta de confirmación antes de crear
    setConfirmAction({
      type: 'create',
      message: `¿Estás seguro de que quieres crear el usuario "${formData.username}"? Se enviará un email de verificación y se creará inmediatamente.`,
      userType: formData.user_type,
      action: async () => {
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
          
          // ✅ NUEVO: Llamar directamente a refreshCompanies() si se creó una empresa
          if (formData.user_type === 'company' && typeof window !== 'undefined' && typeof (window as any).refreshCompanies === 'function') {
            console.log('🔄 Llamando directamente a refreshCompanies()...');
            try {
              (window as any).refreshCompanies();
              console.log('✅ refreshCompanies() ejecutado exitosamente');
            } catch (error) {
              console.error('❌ Error al ejecutar refreshCompanies():', error);
            }
          }
          
          // Luego sincronizar otras interfaces
          setTimeout(() => {
            refreshOtherInterfaces();
          }, 200);
        } catch (error) {
          console.error('Error creating user:', error);
          // Si el error tiene response y status 201, considerar éxito
          if (error?.response?.status === 201) {
            setSuccess('Usuario creado exitosamente');
            setShowCreateDialog(false);
            resetForm();
            await fetchUsers();
            // Luego sincronizar otras interfaces
            setTimeout(() => {
              refreshOtherInterfaces();
            }, 200); // Reducido de 1000ms a 200ms
            return;
          }
          setError('Error al crear el usuario');
        }
      }
    });
    setShowConfirmDialog(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    // Mostrar alerta de confirmación antes de actualizar
    setConfirmAction({
      type: 'update',
      message: `¿Estás seguro de que quieres actualizar el usuario "${selectedUser.username}"? Los cambios se aplicarán inmediatamente y podrían afectar su experiencia en la plataforma.`,
      userId: selectedUser.id,
      userType: selectedUser.user_type,
      action: async () => {
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
          
          // ✅ NUEVO: Llamar directamente a refreshCompanies() si se actualizó una empresa
          if (selectedUser && selectedUser.user_type === 'company' && typeof window !== 'undefined' && typeof (window as any).refreshCompanies === 'function') {
            console.log('🔄 Llamando directamente a refreshCompanies()...');
            try {
              (window as any).refreshCompanies();
              console.log('✅ refreshCompanies() ejecutado exitosamente');
            } catch (error) {
              console.error('❌ Error al ejecutar refreshCompanies():', error);
            }
          }
          
          // Luego sincronizar otras interfaces
          setTimeout(() => {
            refreshOtherInterfaces();
          }, 200);
        } catch (error) {
          console.error('Error updating user:', error);
          setError('Error al actualizar el usuario');
        }
      }
    });
    setShowConfirmDialog(true);
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    // Mostrar alerta de confirmación antes de cambiar estado
    const action = currentStatus ? 'suspender' : 'activar';
    const message = currentStatus 
      ? `¿Estás seguro de que quieres suspender este usuario? No podrá acceder a la plataforma hasta que sea reactivado.`
      : `¿Estás seguro de que quieres activar este usuario? Tendrá acceso completo a la plataforma.`;

    setConfirmAction({
      type: currentStatus ? 'suspend' : 'activate',
      message,
      userId,
      userType: users.find(u => u.id === userId)?.user_type,
      action: async () => {
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
          
          // Primero actualizar usuarios locales
          await fetchUsers();
          
          // ✅ NUEVO: Llamar directamente a refreshCompanies() si se cambió el estado de una empresa
          // Necesito encontrar el usuario para verificar su tipo
          const user = users.find(u => u.id === userId);
          if (user && user.user_type === 'company' && typeof window !== 'undefined' && typeof (window as any).refreshCompanies === 'function') {
            console.log('🔄 Llamando directamente a refreshCompanies()...');
            try {
              (window as any).refreshCompanies();
              console.log('✅ refreshCompanies() ejecutado exitosamente');
            } catch (error) {
              console.error('❌ Error al ejecutar refreshCompanies():', error);
            }
          }
          
          // Luego sincronizar otras interfaces
          setTimeout(() => {
            refreshOtherInterfaces();
          }, 200);
        } catch (error) {
          console.error('Error toggling user status:', error);
          setError('Error al cambiar el estado del usuario');
        }
      }
    });
    setShowConfirmDialog(true);
  };

  // Función para manejar bloqueo de usuarios
  const handleBlockUser = async (userId: string) => {
    setConfirmAction({
      type: 'block',
      message: `¿Estás seguro de que quieres bloquear este usuario? No podrá acceder a la plataforma y se marcará como no verificado.`,
      userId,
      userType: users.find(u => u.id === userId)?.user_type,
      action: async () => {
        try {
          await apiService.post(`/api/users/${userId}/block/`);
          setSuccess('Usuario bloqueado exitosamente');
          await fetchUsers();
          
          // ✅ NUEVO: Llamar directamente a refreshCompanies() si se bloqueó una empresa
          const user = users.find(u => u.id === userId);
          if (user && user.user_type === 'company' && typeof window !== 'undefined' && typeof (window as any).refreshCompanies === 'function') {
            console.log('🔄 Llamando directamente a refreshCompanies()...');
            try {
              (window as any).refreshCompanies();
              console.log('✅ refreshCompanies() ejecutado exitosamente');
            } catch (error) {
              console.error('❌ Error al ejecutar refreshCompanies():', error);
            }
          }
          
          // Luego sincronizar otras interfaces
          setTimeout(() => {
            refreshOtherInterfaces();
          }, 200);
        } catch (error) {
          console.error('Error blocking user:', error);
          setError('Error al bloquear el usuario');
        }
      }
    });
    setShowConfirmDialog(true);
  };

  // Función para manejar desbloqueo de usuarios
  const handleUnblockUser = async (userId: string) => {
    setConfirmAction({
      type: 'unblock',
      message: `¿Estás seguro de que quieres desbloquear este usuario? Tendrá acceso completo a la plataforma y se marcará como verificado.`,
      userId,
      userType: users.find(u => u.id === userId)?.user_type,
      action: async () => {
        try {
          await apiService.post(`/api/users/${userId}/unblock/`);
          setSuccess('Usuario desbloqueado exitosamente');
          await fetchUsers();
          
          // ✅ NUEVO: Llamando directamente a refreshCompanies() si se desbloqueó una empresa
          const user = users.find(u => u.id === userId);
          if (user && user.user_type === 'company' && typeof window !== 'undefined' && typeof (window as any).refreshCompanies === 'function') {
            console.log('🔄 Llamando directamente a refreshCompanies()...');
            try {
              (window as any).refreshCompanies();
              console.log('✅ refreshCompanies() ejecutado exitosamente');
            } catch (error) {
              console.error('❌ Error al ejecutar refreshCompanies():', error);
            }
          }
          
          // Luego sincronizar otras interfaces
          setTimeout(() => {
            refreshOtherInterfaces();
          }, 200);
        } catch (error) {
          console.error('Error unblocking user:', error);
          setError('Error al desbloquear el usuario');
        }
      }
    });
    setShowConfirmDialog(true);
  };

  // Función para ejecutar la acción confirmada
  const executeConfirmedAction = async () => {
    if (confirmAction?.action) {
      await confirmAction.action();
      setShowConfirmDialog(false);
      setConfirmAction(null);
    }
  };

  // Función para cancelar la confirmación
  const cancelConfirmedAction = () => {
    setShowConfirmDialog(false);
    setConfirmAction(null);
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
      case 'teacher': return <SchoolIcon2 color="warning" />;
      default: return <PersonIcon color="action" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'admin': return 'error';
      case 'company': return 'primary';
      case 'student': return 'success';
      case 'teacher': return 'warning';
      default: return 'default';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'admin': return 'Administrador';
      case 'company': return 'Empresa';
      case 'student': return 'Estudiante';
      case 'teacher': return 'Docente';
      default: return type;
    }
  };

  const filteredUsers = users.filter(user =>
    (user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
     user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
     user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     user.last_name.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (typeFilter ? user.user_type === typeFilter : true) &&
    (statusFilter === 'active' ? user.is_active === true && user.is_verified === true : 
     statusFilter === 'inactive' ? user.is_active === false : 
     statusFilter === 'blocked' ? user.is_verified === false : true)
  ).slice(0, limit);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: 3, 
      bgcolor: themeMode === 'dark' ? '#0f172a' : '#f8fafc', 
      minHeight: '100vh',
      color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
    }}>
      {/* Header con gradiente */}
      <Card sx={{ 
        mb: 3, 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
        borderRadius: 3
      }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ 
                background: 'rgba(255, 255, 255, 0.2)', 
                borderRadius: 2, 
                p: 1.5, 
                mr: 2,
                backdropFilter: 'blur(10px)'
              }}>
                <GroupIcon sx={{ color: 'white', fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold', mb: 0.5 }}>
                  Gestión de Usuarios
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  Administra todos los usuarios de la plataforma
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowCreateDialog(true)}
              sx={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.3)',
                }
              }}
            >
              Nuevo Usuario
            </Button>
          </Box>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filtros y búsqueda con diseño mejorado */}
      <Card 
        className="filter-card"
        sx={{ 
          mb: 3, 
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          borderRadius: 3
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FilterIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Filtros y Búsqueda
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              label="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'primary.main' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                minWidth: 300,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                }
              }}
            />
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Tipo</InputLabel>
              <Select
                value={typeFilter}
                label="Tipo"
                onChange={(e) => setTypeFilter(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="student">Estudiantes</MenuItem>
                <MenuItem value="company">Empresas</MenuItem>
                <MenuItem value="teacher">Docentes</MenuItem>
                <MenuItem value="admin">Administradores</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Estado</InputLabel>
              <Select
                value={statusFilter}
                label="Estado"
                onChange={(e) => setStatusFilter(e.target.value)}
                sx={{ borderRadius: 2 }}
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
                onChange={(e) => setLimit(e.target.value === 'todos' ? 1000000 : Number(e.target.value))}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value={20}>20 últimos</MenuItem>
                <MenuItem value={50}>50 últimos</MenuItem>
                <MenuItem value={100}>100 últimos</MenuItem>
                <MenuItem value={150}>150 últimos</MenuItem>
                <MenuItem value={200}>200 últimos</MenuItem>
                <MenuItem value={'todos'}>Todos</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchUsers}
              sx={{ borderRadius: 2 }}
            >
              Actualizar
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Tabla de usuarios con diseño mejorado */}
      <Card sx={{ 
        background: themeMode === 'dark' 
          ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' 
          : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        borderRadius: 3,
        overflow: 'hidden'
      }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '& th': {
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.95rem',
                  borderBottom: 'none'
                }
              }}>
                <TableCell>Usuario</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Fecha Registro</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user, index) => (
                <TableRow 
                  key={user.id} 
                  hover
                  sx={{ 
                    backgroundColor: themeMode === 'dark' 
                      ? (index % 2 === 0 ? '#1e293b' : '#334155')
                      : (index % 2 === 0 ? 'rgba(102, 126, 234, 0.02)' : 'transparent'),
                    '&:hover': {
                      backgroundColor: themeMode === 'dark' 
                        ? 'rgba(102, 126, 234, 0.1)'
                        : 'rgba(102, 126, 234, 0.05)',
                      transition: 'all 0.2s ease-in-out',
                    }
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar 
                        src={user.avatar} 
                        sx={{ 
                          width: 45, 
                          height: 45,
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                        }}
                      >
                        {user.first_name?.[0]}{user.last_name?.[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="bold" sx={{ 
                          color: themeMode === 'dark' ? '#f1f5f9' : '#2c3e50' 
                        }}>
                          {user.first_name} {user.last_name}
                        </Typography>
                        <Typography variant="caption" sx={{ 
                          color: themeMode === 'dark' ? '#cbd5e1' : '#7f8c8d' 
                        }}>
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
                        sx={{ 
                          borderRadius: 1.5,
                          fontWeight: 'bold',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmailIcon sx={{ fontSize: 16, color: themeMode === 'dark' ? '#cbd5e1' : '#7f8c8d' }} />
                      <Typography variant="body2" sx={{ 
                        color: themeMode === 'dark' ? '#f1f5f9' : '#2c3e50' 
                      }}>
                        {user.email}
                      </Typography>
                    </Box>
                  </TableCell>
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
                      sx={{ 
                        borderRadius: 1.5,
                        fontWeight: 'bold',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ 
                      color: themeMode === 'dark' ? '#cbd5e1' : '#7f8c8d' 
                    }}>
                      {new Date(user.date_joined).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Editar">
                        <span>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditUser(user)}
                            sx={{
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              color: 'white',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                                transform: 'scale(1.1)',
                              }
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                      {/* Acciones para empresas, estudiantes y profesores */}
                      {(user.user_type === 'company' || user.user_type === 'student' || user.user_type === 'teacher') && (
                        <>
                          <Tooltip title="Activar">
                            <span>
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                                disabled={user.is_active}
                                sx={{
                                  background: user.is_active ? '#e0e0e0' : 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                                  color: 'white',
                                  '&:hover': {
                                    background: user.is_active ? '#e0e0e0' : 'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)',
                                    transform: 'scale(1.1)',
                                  }
                                }}
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
                                onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                                disabled={!user.is_active}
                                sx={{
                                  background: !user.is_active ? '#e0e0e0' : 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                                  color: 'white',
                                  '&:hover': {
                                    background: !user.is_active ? '#e0e0e0' : 'linear-gradient(135deg, #ff9800 0%, #ef6c00 100%)',
                                    transform: 'scale(1.1)',
                                  }
                                }}
                              >
                                <PauseIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Bloquear">
                            <span>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleBlockUser(user.id)}
                                disabled={!user.is_verified}
                                sx={{
                                  background: !user.is_verified ? '#e0e0e0' : 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                                  color: 'white',
                                  '&:hover': {
                                    background: !user.is_verified ? '#e0e0e0' : 'linear-gradient(135deg, #d32f2f 0%, #c62828 100%)',
                                    transform: 'scale(1.1)',
                                  }
                                }}
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
                                onClick={() => handleUnblockUser(user.id)}
                                disabled={user.is_verified}
                                sx={{
                                  background: user.is_verified ? '#e0e0e0' : 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                                  color: 'white',
                                  '&:hover': {
                                    background: user.is_verified ? '#e0e0e0' : 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                                    transform: 'scale(1.1)',
                                  }
                                }}
                              >
                                <LockOpenIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {filteredUsers.length === 0 && !loading && (
        <Card sx={{ 
          mt: 3, 
          background: themeMode === 'dark' 
            ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
            : 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
          border: themeMode === 'dark' ? '1px solid #475569' : '1px solid #ffcc02'
        }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <PersonIcon sx={{ fontSize: 64, color: themeMode === 'dark' ? '#cbd5e1' : '#ff9800', mb: 2 }} />
            <Typography variant="h6" sx={{ 
              color: themeMode === 'dark' ? '#f1f5f9' : '#e65100', 
              mb: 1 
            }}>
              No se encontraron usuarios
            </Typography>
            <Typography variant="body2" sx={{ 
              color: themeMode === 'dark' ? '#cbd5e1' : '#bf360c' 
            }}>
              No se encontraron usuarios que coincidan con los filtros aplicados.
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Dialog para crear usuario con diseño mejorado */}
      <Dialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontWeight: 'bold',
          py: 2.5,
          px: 3
        }}>
          Crear Nuevo Usuario
        </DialogTitle>
        <DialogContent sx={{ 
          p: 3, 
          pt: 4,
          bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
          color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
        }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Primera fila */}
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <TextField
                label="Nombre de usuario"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                fullWidth
                variant="outlined"
                InputLabelProps={{ 
                  shrink: true,
                  sx: {
                    color: themeMode === 'dark' ? '#cbd5e1' : '#6b7280',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    '&.Mui-focused': {
                      color: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                  }
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 2,
                    backgroundColor: themeMode === 'dark' ? '#334155' : '#ffffff',
                    minHeight: '56px',
                    '& fieldset': {
                      borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
                    },
                    '&:hover fieldset': {
                      borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                    '& input': {
                      paddingTop: '16px',
                      paddingBottom: '16px',
                      paddingLeft: '16px',
                      paddingRight: '16px',
                      fontSize: '0.875rem',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: themeMode === 'dark' ? '#cbd5e1' : '#6b7280',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    '&.Mui-focused': {
                      color: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                  },
                }}
              />
              <FormControl fullWidth>
                <InputLabel 
                  sx={{
                    color: themeMode === 'dark' ? '#cbd5e1' : '#6b7280',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    '&.Mui-focused': {
                      color: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                  }}
                  shrink={true}
                >
                  Tipo de usuario
                </InputLabel>
                <Select
                  value={formData.user_type}
                  label="Tipo de usuario"
                  onChange={(e) => setFormData({ ...formData, user_type: e.target.value as any })}
                  sx={{ 
                    borderRadius: 2,
                    backgroundColor: themeMode === 'dark' ? '#334155' : '#ffffff',
                    minHeight: '56px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                    '& .MuiSelect-select': {
                      color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                      paddingTop: '16px',
                      paddingBottom: '16px',
                      paddingLeft: '16px',
                      paddingRight: '16px',
                      fontSize: '0.875rem',
                    },
                  }}
                >
                  <MenuItem value="student">Estudiante</MenuItem>
                  <MenuItem value="company">Empresa</MenuItem>
                  <MenuItem value="teacher">Docente</MenuItem>
                  <MenuItem value="admin">Administrador</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            {/* Segunda fila */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Nombre"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                fullWidth
                variant="outlined"
                InputLabelProps={{ 
                  shrink: true,
                  sx: {
                    color: themeMode === 'dark' ? '#cbd5e1' : '#6b7280',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    '&.Mui-focused': {
                      color: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                  }
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 2,
                    backgroundColor: themeMode === 'dark' ? '#334155' : '#ffffff',
                    minHeight: '56px',
                    '& fieldset': {
                      borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
                    },
                    '&:hover fieldset': {
                      borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                    '& input': {
                      paddingTop: '16px',
                      paddingBottom: '16px',
                      paddingLeft: '16px',
                      paddingRight: '16px',
                      fontSize: '0.875rem',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: themeMode === 'dark' ? '#cbd5e1' : '#6b7280',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    '&.Mui-focused': {
                      color: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                  },
                }}
              />
              <TextField
                label="Apellido"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                fullWidth
                variant="outlined"
                InputLabelProps={{ 
                  shrink: true,
                  sx: {
                    color: themeMode === 'dark' ? '#cbd5e1' : '#6b7280',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    '&.Mui-focused': {
                      color: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                  }
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 2,
                    backgroundColor: themeMode === 'dark' ? '#334155' : '#ffffff',
                    minHeight: '56px',
                    '& fieldset': {
                      borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
                    },
                    '&:hover fieldset': {
                      borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                    '& input': {
                      paddingTop: '16px',
                      paddingBottom: '16px',
                      paddingLeft: '16px',
                      paddingRight: '16px',
                      fontSize: '0.875rem',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: themeMode === 'dark' ? '#cbd5e1' : '#6b7280',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    '&.Mui-focused': {
                      color: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                  },
                }}
              />
            </Box>
            
            {/* Tercera fila */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                fullWidth
                variant="outlined"
                InputLabelProps={{ 
                  shrink: true,
                  sx: {
                    color: themeMode === 'dark' ? '#cbd5e1' : '#6b7280',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    '&.Mui-focused': {
                      color: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                  }
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 2,
                    backgroundColor: themeMode === 'dark' ? '#334155' : '#ffffff',
                    minHeight: '56px',
                    '& fieldset': {
                      borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
                    },
                    '&:hover fieldset': {
                      borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                    '& input': {
                      paddingTop: '16px',
                      paddingBottom: '16px',
                      paddingLeft: '16px',
                      paddingRight: '16px',
                      fontSize: '0.875rem',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: themeMode === 'dark' ? '#cbd5e1' : '#6b7280',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    '&.Mui-focused': {
                      color: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                  },
                }}
              />
              <TextField
                label="Teléfono"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                fullWidth
                variant="outlined"
                InputLabelProps={{ 
                  shrink: true,
                  sx: {
                    color: themeMode === 'dark' ? '#cbd5e1' : '#6b7280',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    '&.Mui-focused': {
                      color: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                  }
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 2,
                    backgroundColor: themeMode === 'dark' ? '#334155' : '#ffffff',
                    minHeight: '56px',
                    '& fieldset': {
                      borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
                    },
                    '&:hover fieldset': {
                      borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                    '& input': {
                      paddingTop: '16px',
                      paddingBottom: '16px',
                      paddingLeft: '16px',
                      paddingRight: '16px',
                      fontSize: '0.875rem',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: themeMode === 'dark' ? '#cbd5e1' : '#6b7280',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    '&.Mui-focused': {
                      color: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                  },
                }}
              />
            </Box>
            
            {/* Campos específicos por tipo */}
            {formData.user_type === 'company' && (
              <TextField
                label="Nombre de la empresa"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                fullWidth
                variant="outlined"
                InputLabelProps={{ 
                  shrink: true,
                  sx: {
                    color: themeMode === 'dark' ? '#cbd5e1' : '#6b7280',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    '&.Mui-focused': {
                      color: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                  }
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 2,
                    backgroundColor: themeMode === 'dark' ? '#334155' : '#ffffff',
                    minHeight: '56px',
                    '& fieldset': {
                      borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
                    },
                    '&:hover fieldset': {
                      borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                    '& input': {
                      paddingTop: '16px',
                      paddingBottom: '16px',
                      paddingLeft: '16px',
                      paddingRight: '16px',
                      fontSize: '0.875rem',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: themeMode === 'dark' ? '#cbd5e1' : '#6b7280',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    '&.Mui-focused': {
                      color: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                  },
                }}
              />
            )}
            {formData.user_type === 'student' && (
              <TextField
                label="Carrera"
                value={formData.career}
                onChange={(e) => setFormData({ ...formData, career: e.target.value })}
                fullWidth
                variant="outlined"
                InputLabelProps={{ 
                  shrink: true,
                  sx: {
                    color: themeMode === 'dark' ? '#cbd5e1' : '#6b7280',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    '&.Mui-focused': {
                      color: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                  }
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 2,
                    backgroundColor: themeMode === 'dark' ? '#334155' : '#ffffff',
                    minHeight: '56px',
                    '& fieldset': {
                      borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
                    },
                    '&:hover fieldset': {
                      borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                    '& input': {
                      paddingTop: '16px',
                      paddingBottom: '16px',
                      paddingLeft: '16px',
                      paddingRight: '16px',
                      fontSize: '0.875rem',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: themeMode === 'dark' ? '#cbd5e1' : '#6b7280',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    '&.Mui-focused': {
                      color: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                  },
                }}
              />
            )}
            
            {/* Contraseñas */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Contraseña"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                fullWidth
                variant="outlined"
                InputLabelProps={{ 
                  shrink: true,
                  sx: {
                    color: themeMode === 'dark' ? '#cbd5e1' : '#6b7280',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    '&.Mui-focused': {
                      color: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                  }
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 2,
                    backgroundColor: themeMode === 'dark' ? '#334155' : '#ffffff',
                    minHeight: '56px',
                    '& fieldset': {
                      borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
                    },
                    '&:hover fieldset': {
                      borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                    '& input': {
                      paddingTop: '16px',
                      paddingBottom: '16px',
                      paddingLeft: '16px',
                      paddingRight: '16px',
                      fontSize: '0.875rem',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: themeMode === 'dark' ? '#cbd5e1' : '#6b7280',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    '&.Mui-focused': {
                      color: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                  },
                }}
              />
              <TextField
                label="Confirmar contraseña"
                type="password"
                value={formData.confirm_password}
                onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                fullWidth
                variant="outlined"
                InputLabelProps={{ 
                  shrink: true,
                  sx: {
                    color: themeMode === 'dark' ? '#cbd5e1' : '#6b7280',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    '&.Mui-focused': {
                      color: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                  }
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 2,
                    backgroundColor: themeMode === 'dark' ? '#334155' : '#ffffff',
                    minHeight: '56px',
                    '& fieldset': {
                      borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
                    },
                    '&:hover fieldset': {
                      borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                    '& input': {
                      paddingTop: '16px',
                      paddingBottom: '16px',
                      paddingLeft: '16px',
                      paddingRight: '16px',
                      fontSize: '0.875rem',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: themeMode === 'dark' ? '#cbd5e1' : '#6b7280',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    '&.Mui-focused': {
                      color: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                  },
                }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          p: 3,
          bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
          borderTop: themeMode === 'dark' ? '1px solid #475569' : '1px solid #e5e7eb'
        }}>
          <Button 
            onClick={() => setShowCreateDialog(false)}
            sx={{ 
              borderRadius: 2,
              color: themeMode === 'dark' ? '#cbd5e1' : '#6b7280',
              '&:hover': {
                backgroundColor: themeMode === 'dark' ? '#334155' : '#f3f4f6',
              }
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateUser}
            disabled={!formData.username || !formData.email || !formData.password || !formData.confirm_password}
            sx={{ 
              borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              }
            }}
          >
            Crear Usuario
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para editar usuario con diseño mejorado */}
      <Dialog open={showEditDialog} onClose={() => setShowEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontWeight: 'bold',
          py: 2.5,
          px: 3
        }}>
          Editar Usuario
        </DialogTitle>
        <DialogContent sx={{ 
          p: 3, 
          pt: 4,
          bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
          color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
        }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Primera fila */}
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <TextField
                label="Nombre de usuario"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                fullWidth
                variant="outlined"
                InputLabelProps={{ 
                  shrink: true,
                  sx: {
                    color: themeMode === 'dark' ? '#cbd5e1' : '#6b7280',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    '&.Mui-focused': {
                      color: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                  }
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 2,
                    backgroundColor: themeMode === 'dark' ? '#334155' : '#ffffff',
                    minHeight: '56px',
                    '& fieldset': {
                      borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
                    },
                    '&:hover fieldset': {
                      borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                    '& input': {
                      paddingTop: '16px',
                      paddingBottom: '16px',
                      paddingLeft: '16px',
                      paddingRight: '16px',
                      fontSize: '0.875rem',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: themeMode === 'dark' ? '#cbd5e1' : '#6b7280',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    '&.Mui-focused': {
                      color: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                  },
                }}
              />
              <FormControl fullWidth>
                <InputLabel 
                  sx={{
                    color: themeMode === 'dark' ? '#cbd5e1' : '#6b7280',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    '&.Mui-focused': {
                      color: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                  }}
                  shrink={true}
                >
                  Tipo de usuario
                </InputLabel>
                <Select
                  value={formData.user_type}
                  label="Tipo de usuario"
                  onChange={(e) => setFormData({ ...formData, user_type: e.target.value as any })}
                  sx={{ 
                    borderRadius: 2,
                    backgroundColor: themeMode === 'dark' ? '#334155' : '#ffffff',
                    minHeight: '56px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                    '& .MuiSelect-select': {
                      color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                      paddingTop: '16px',
                      paddingBottom: '16px',
                      paddingLeft: '16px',
                      paddingRight: '16px',
                      fontSize: '0.875rem',
                    },
                  }}
                >
                  <MenuItem value="student">Estudiante</MenuItem>
                  <MenuItem value="company">Empresa</MenuItem>
                  <MenuItem value="teacher">Profesor</MenuItem>
                  <MenuItem value="admin">Administrador</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            {/* Segunda fila */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Nombre"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                fullWidth
                variant="outlined"
                InputLabelProps={{ 
                  shrink: true,
                  sx: {
                    color: themeMode === 'dark' ? '#cbd5e1' : '#6b7280',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    '&.Mui-focused': {
                      color: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                  }
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 2,
                    backgroundColor: themeMode === 'dark' ? '#334155' : '#ffffff',
                    minHeight: '56px',
                    '& fieldset': {
                      borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
                    },
                    '&:hover fieldset': {
                      borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                    '& input': {
                      paddingTop: '16px',
                      paddingBottom: '16px',
                      paddingLeft: '16px',
                      paddingRight: '16px',
                      fontSize: '0.875rem',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: themeMode === 'dark' ? '#cbd5e1' : '#6b7280',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    '&.Mui-focused': {
                      color: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                  },
                }}
              />
              <TextField
                label="Apellido"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                fullWidth
                variant="outlined"
                InputLabelProps={{ 
                  shrink: true,
                  sx: {
                    color: themeMode === 'dark' ? '#cbd5e1' : '#6b7280',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    '&.Mui-focused': {
                      color: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                  }
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 2,
                    backgroundColor: themeMode === 'dark' ? '#334155' : '#ffffff',
                    minHeight: '56px',
                    '& fieldset': {
                      borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
                    },
                    '&:hover fieldset': {
                      borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                    '& input': {
                      paddingTop: '16px',
                      paddingBottom: '16px',
                      paddingLeft: '16px',
                      paddingRight: '16px',
                      fontSize: '0.875rem',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: themeMode === 'dark' ? '#cbd5e1' : '#6b7280',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    '&.Mui-focused': {
                      color: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                  },
                }}
              />
            </Box>
            
            {/* Tercera fila */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                fullWidth
                variant="outlined"
                InputLabelProps={{ 
                  shrink: true,
                  sx: {
                    color: themeMode === 'dark' ? '#cbd5e1' : '#6b7280',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    '&.Mui-focused': {
                      color: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                  }
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 2,
                    backgroundColor: themeMode === 'dark' ? '#334155' : '#ffffff',
                    minHeight: '56px',
                    '& fieldset': {
                      borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
                    },
                    '&:hover fieldset': {
                      borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                    '& input': {
                      paddingTop: '16px',
                      paddingBottom: '16px',
                      paddingLeft: '16px',
                      paddingRight: '16px',
                      fontSize: '0.875rem',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: themeMode === 'dark' ? '#cbd5e1' : '#6b7280',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    '&.Mui-focused': {
                      color: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                  },
                }}
              />
              <TextField
                label="Teléfono"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                fullWidth
                variant="outlined"
                InputLabelProps={{ 
                  shrink: true,
                  sx: {
                    color: themeMode === 'dark' ? '#cbd5e1' : '#6b7280',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    '&.Mui-focused': {
                      color: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                  }
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 2,
                    backgroundColor: themeMode === 'dark' ? '#334155' : '#ffffff',
                    minHeight: '56px',
                    '& fieldset': {
                      borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
                    },
                    '&:hover fieldset': {
                      borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                    '& input': {
                      paddingTop: '16px',
                      paddingBottom: '16px',
                      paddingLeft: '16px',
                      paddingRight: '16px',
                      fontSize: '0.875rem',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: themeMode === 'dark' ? '#cbd5e1' : '#6b7280',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    '&.Mui-focused': {
                      color: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                  },
                }}
              />
            </Box>
            
            {/* Campos específicos por tipo */}
            {formData.user_type === 'company' && (
              <TextField
                label="Nombre de la empresa"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                fullWidth
                variant="outlined"
                InputLabelProps={{ 
                  shrink: true,
                  sx: {
                    color: themeMode === 'dark' ? '#cbd5e1' : '#6b7280',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    '&.Mui-focused': {
                      color: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                  }
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 2,
                    backgroundColor: themeMode === 'dark' ? '#334155' : '#ffffff',
                    minHeight: '56px',
                    '& fieldset': {
                      borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
                    },
                    '&:hover fieldset': {
                      borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                    '& input': {
                      paddingTop: '16px',
                      paddingBottom: '16px',
                      paddingLeft: '16px',
                      paddingRight: '16px',
                      fontSize: '0.875rem',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: themeMode === 'dark' ? '#cbd5e1' : '#6b7280',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    '&.Mui-focused': {
                      color: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                  },
                }}
              />
            )}
            {formData.user_type === 'student' && (
              <TextField
                label="Carrera"
                value={formData.career}
                onChange={(e) => setFormData({ ...formData, career: e.target.value })}
                fullWidth
                variant="outlined"
                InputLabelProps={{ 
                  shrink: true,
                  sx: {
                    color: themeMode === 'dark' ? '#cbd5e1' : '#6b7280',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    '&.Mui-focused': {
                      color: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                  }
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 2,
                    backgroundColor: themeMode === 'dark' ? '#334155' : '#ffffff',
                    minHeight: '56px',
                    '& fieldset': {
                      borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
                    },
                    '&:hover fieldset': {
                      borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                    '& input': {
                      paddingTop: '16px',
                      paddingBottom: '16px',
                      paddingLeft: '16px',
                      paddingRight: '16px',
                      fontSize: '0.875rem',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: themeMode === 'dark' ? '#cbd5e1' : '#6b7280',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    '&.Mui-focused': {
                      color: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                  },
                }}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          p: 3,
          bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
          borderTop: themeMode === 'dark' ? '1px solid #475569' : '1px solid #e5e7eb'
        }}>
          <Button 
            onClick={() => setShowEditDialog(false)}
            sx={{ 
              borderRadius: 2,
              color: themeMode === 'dark' ? '#cbd5e1' : '#6b7280',
              '&:hover': {
                backgroundColor: themeMode === 'dark' ? '#334155' : '#f3f4f6',
              }
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleUpdateUser}
            disabled={!formData.first_name || !formData.last_name || !formData.email}
            sx={{ 
              borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              }
            }}
          >
            Actualizar Usuario
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmación para acciones importantes */}
      <Dialog 
        open={showConfirmDialog} 
        onClose={cancelConfirmedAction}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
          color: 'white',
          fontWeight: 'bold',
          py: 2.5,
          px: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <WarningIcon sx={{ fontSize: 24 }} />
          Confirmar Acción
        </DialogTitle>
        <DialogContent sx={{ 
          p: 3, 
          pt: 4,
          bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
          color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
        }}>
          <DialogContentText sx={{ 
            fontSize: '1rem',
            color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
            lineHeight: 1.6,
            mb: 2
          }}>
            {confirmAction?.message}
          </DialogContentText>
          
          {/* Información adicional según el tipo de acción */}
          {confirmAction?.type === 'create' && (
            <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                Tipo de usuario: <strong>{confirmAction.userType === 'student' ? 'Estudiante' : confirmAction.userType === 'company' ? 'Empresa' : confirmAction.userType === 'teacher' ? 'Docente' : 'Administrador'}</strong>
              </Typography>
            </Alert>
          )}
          
          {confirmAction?.type === 'update' && (
            <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                Los cambios se aplicarán inmediatamente y podrían afectar la experiencia del usuario en la plataforma.
              </Typography>
            </Alert>
          )}
          
          {(confirmAction?.type === 'activate' || confirmAction?.type === 'suspend') && (
            <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                {confirmAction.type === 'activate' 
                  ? 'El usuario tendrá acceso completo a todas las funcionalidades de la plataforma.'
                  : 'El usuario no podrá acceder a la plataforma hasta que sea reactivado.'
                }
              </Typography>
            </Alert>
          )}
          
          {(confirmAction?.type === 'block' || confirmAction?.type === 'unblock') && (
            <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                {confirmAction.type === 'block'
                  ? 'El usuario será marcado como no verificado y no podrá acceder a la plataforma.'
                  : 'El usuario será marcado como verificado y tendrá acceso completo a la plataforma.'
                }
              </Typography>
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          p: 3,
          bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
          borderTop: themeMode === 'dark' ? '1px solid #475569' : '1px solid #e5e7eb'
        }}>
          <Button 
            onClick={cancelConfirmedAction}
            sx={{ 
              borderRadius: 2,
              color: themeMode === 'dark' ? '#cbd5e1' : '#6b7280',
              '&:hover': {
                backgroundColor: themeMode === 'dark' ? '#334155' : '#f3f4f6',
              }
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={executeConfirmedAction}
            sx={{ 
              borderRadius: 2,
              background: confirmAction?.type === 'create' || confirmAction?.type === 'update' 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : confirmAction?.type === 'activate' || confirmAction?.type === 'unblock'
                ? 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)'
                : confirmAction?.type === 'suspend' || confirmAction?.type === 'block'
                ? 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: confirmAction?.type === 'create' || confirmAction?.type === 'update' 
                  ? 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                  : confirmAction?.type === 'activate' || confirmAction?.type === 'unblock'
                  ? 'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)'
                  : confirmAction?.type === 'suspend' || confirmAction?.type === 'block'
                  ? 'linear-gradient(135deg, #f57c00 0%, #ef6c00 100%)'
                  : 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              }
            }}
          >
            {confirmAction?.type === 'create' ? 'Crear Usuario' :
             confirmAction?.type === 'update' ? 'Actualizar Usuario' :
             confirmAction?.type === 'activate' ? 'Activar Usuario' :
             confirmAction?.type === 'suspend' ? 'Suspender Usuario' :
             confirmAction?.type === 'block' ? 'Bloquear Usuario' :
             confirmAction?.type === 'unblock' ? 'Desbloquear Usuario' :
             'Confirmar'}
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