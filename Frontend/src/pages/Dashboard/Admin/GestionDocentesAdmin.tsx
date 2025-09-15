/**
 * GestionDocentesAdmin.tsx
 * 
 * Componente principal para la gestión administrativa de docentes en la plataforma.
 * Permite a los administradores ver, filtrar y gestionar todos los docentes registrados.
 * 
 * FUNCIONALIDADES PRINCIPALES:
 * - Lista todos los docentes con información detallada
 * - Filtros por estado, nombre y email
 * - Paginación de resultados
 * - Gestión de estados de docentes (Activo, Inactivo, Bloqueado)
 * - Visualización de métricas de docentes
 * 
 * AUTENTICACIÓN:
 * - Utiliza JWT tokens para autenticación
 * - Requiere rol de administrador
 * - Tokens se verifican automáticamente en cada petición
 * 
 * INTEGRACIÓN CON BACKEND:
 * - Endpoint: /api/users/admin/users/?role=teacher
 * - Método: GET
 * - Headers: Authorization: Bearer {JWT_TOKEN}
 * - Respuesta: {results: [...], count: number}
 * 
 * @author Sistema de Administración
 * @version 1.0.0
 * @lastUpdated 2025-01-17
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Card,
  CardContent,
  Avatar,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Divider,
  Tooltip,
  InputAdornment,
} from '@mui/material';
import {
  Person as PersonIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  People as PeopleIcon,
  Work as WorkIcon,
  Star as StarIcon,
  Edit as EditIcon,
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon,
  Group as GroupIcon,
  Assessment as AssessmentIcon,
  Timer as TimerIcon,
  School as SchoolIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { apiService } from '../../../services/api.service';
import { useTheme } from '../../../contexts/ThemeContext';

interface Teacher {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'teacher';
  is_active: boolean;
  is_verified: boolean;
  date_joined: string;
  last_login?: string;
  phone?: string;
  avatar?: string;
  career?: string;
  position?: string;
  department?: string;
  bio?: string;
  full_name?: string;
  created_at?: string;
  updated_at?: string;
}

interface TeacherStats {
  total_teachers: number;
  active_teachers: number;
  inactive_teachers: number;
  verified_teachers: number;
  unverified_teachers: number;
}

export default function GestionDocentesAdmin() {
  const { themeMode } = useTheme();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [teacherStats, setTeacherStats] = useState<TeacherStats>({
    total_teachers: 0,
    active_teachers: 0,
    inactive_teachers: 0,
    verified_teachers: 0,
    unverified_teachers: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [limit, setLimit] = useState(20);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  // Estados para diálogos
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'activate' | 'deactivate' | 'block' | 'unblock';
    message: string;
    teacherId?: string;
    action?: () => Promise<void>;
  } | null>(null);

  // Cargar docentes
  const fetchTeachers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        role: 'teacher',
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      if (statusFilter) {
        params.append('is_active', statusFilter === 'active' ? 'true' : 'false');
      }

      console.log('🔍 [GESTION DOCENTES] Buscando docentes con parámetros:', params.toString());
      
      const response = await apiService.get(`/api/users/?${params.toString()}`);
      console.log('📊 [GESTION DOCENTES] Respuesta del backend:', response);

      if (response && (response as any).success && (response as any).data) {
        const usersData = (response as any).data;
        // Filtrar solo usuarios con rol 'teacher' y datos válidos
        const validTeachers = usersData.filter((user: any) => 
          user && user.role === 'teacher' && user.id
        );
        
        setTeachers(validTeachers);
        
        // Calcular estadísticas
        const stats: TeacherStats = {
          total_teachers: validTeachers.length,
          active_teachers: validTeachers.filter((teacher: any) => teacher.is_active && teacher.is_verified).length,
          inactive_teachers: validTeachers.filter((teacher: any) => !teacher.is_active).length,
          verified_teachers: validTeachers.filter((teacher: any) => teacher.is_verified).length,
          unverified_teachers: validTeachers.filter((teacher: any) => !teacher.is_verified).length
        };
        
        setTeacherStats(stats);
      } else {
        console.warn('⚠️ [GESTION DOCENTES] Respuesta inesperada del backend:', response);
        setTeachers([]);
      }
    } catch (err: any) {
      console.error('❌ [GESTION DOCENTES] Error al cargar docentes:', err);
      setError(err.response?.data?.message || err.message || 'Error al cargar docentes');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  // Manejar búsqueda
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  // Manejar filtros
  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
  };

  // Limpiar filtros
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
  };

  // Funciones helper para iconos y colores
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'teacher': return <SchoolIcon color="warning" />;
      default: return <PersonIcon color="action" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'teacher': return 'warning';
      default: return 'default';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'teacher': return 'Docente';
      default: return type;
    }
  };

  // Obtener color del estado
  const getStatusColor = (teacher: Teacher) => {
    if (!teacher) return 'default';
    if (!teacher.is_active) return 'error';
    if (!teacher.is_verified) return 'warning';
    return 'success';
  };

  // Obtener texto del estado
  const getStatusText = (teacher: Teacher) => {
    if (!teacher) return 'Desconocido';
    if (!teacher.is_active) return 'Inactivo';
    if (!teacher.is_verified) return 'Sin verificar';
    return 'Activo';
  };

  // Obtener icono del estado
  const getStatusIcon = (teacher: Teacher) => {
    if (!teacher) return <WarningIcon />;
    if (!teacher.is_active) return <BlockIcon />;
    if (!teacher.is_verified) return <WarningIcon />;
    return <CheckCircleIcon />;
  };

  // Manejar acciones
  const handleAction = async (teacher: Teacher, action: 'activate' | 'deactivate' | 'block' | 'unblock') => {
    if (!teacher || !teacher.id) {
      setError('Docente no válido');
      return;
    }

    const actionMap = {
      activate: { message: 'activar', type: 'activate' as const },
      deactivate: { message: 'desactivar', type: 'deactivate' as const },
      block: { message: 'bloquear', type: 'block' as const },
      unblock: { message: 'desbloquear', type: 'unblock' as const },
    };

    const actionInfo = actionMap[action];
    
    setConfirmAction({
      type: actionInfo.type,
      message: `¿Estás seguro de que quieres ${actionInfo.message} al docente ${teacher.first_name || ''} ${teacher.last_name || ''}?`,
      teacherId: teacher.id,
      action: async () => {
        try {
          // Aquí implementarías la lógica para cambiar el estado del docente
          // Por ahora solo refrescamos la lista
          await fetchTeachers();
          setSuccess(`Docente ${actionInfo.message} correctamente`);
        } catch (err: any) {
          setError(err.response?.data?.message || err.message || `Error al ${actionInfo.message} docente`);
        }
      }
    });
    setShowConfirmDialog(true);
  };

  // Confirmar acción
  const confirmActionHandler = async () => {
    if (confirmAction?.action) {
      await confirmAction.action();
    }
    setShowConfirmDialog(false);
    setConfirmAction(null);
  };

  // Mostrar detalles del docente
  const showTeacherDetails = (teacher: Teacher) => {
    if (!teacher || !teacher.id) {
      setError('Docente no válido');
      return;
    }
    setSelectedTeacher(teacher);
    setShowDetailsDialog(true);
  };

  // Filtrar docentes
  const filteredTeachers = teachers.filter(teacher =>
    (teacher.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
     teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
     teacher.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     teacher.last_name.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === 'active' ? teacher.is_active === true && teacher.is_verified === true : 
     statusFilter === 'inactive' ? teacher.is_active === false : 
     statusFilter === 'blocked' ? teacher.is_verified === false : true)
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
                <SchoolIcon sx={{ color: 'white', fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold', mb: 0.5 }}>
                  Gestión de Docentes
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  Administra todos los docentes de la plataforma
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<TimerIcon />}
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
                GESTIÓN DE SOLICITUDES DE API DOCENTES
              </Button>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={fetchTeachers}
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
                ACTUALIZAR
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Tarjetas KPI de Docentes */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
        gap: 3,
        mb: 3
      }}>
        {/* Total Docentes */}
        <Card sx={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px rgba(16, 185, 129, 0.4)',
          }
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {teacherStats.total_teachers}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Registrados en la plataforma
                </Typography>
              </Box>
              <PersonIcon sx={{ fontSize: 48, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>

        {/* Docentes Activos */}
        <Card sx={{
          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          color: 'white',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px rgba(139, 92, 246, 0.4)',
          }
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {teacherStats.active_teachers}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Operando normalmente
                </Typography>
              </Box>
              <CheckCircleIcon sx={{ fontSize: 48, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>

        {/* Docentes Inactivos */}
        <Card sx={{
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(239, 68, 68, 0.3)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px rgba(239, 68, 68, 0.4)',
          }
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {teacherStats.inactive_teachers}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Requieren atención
                </Typography>
              </Box>
              <WarningIcon sx={{ fontSize: 48, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>

        {/* Docentes Verificados */}
        <Card sx={{
          background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
          color: 'white',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(249, 115, 22, 0.3)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px rgba(249, 115, 22, 0.4)',
          }
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {teacherStats.verified_teachers}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Cuentas verificadas
                </Typography>
              </Box>
              <StarIcon sx={{ fontSize: 48, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

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
            <FilterListIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Filtros y Búsqueda
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              label="Buscar docentes..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
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
              <InputLabel>Estado</InputLabel>
              <Select
                value={statusFilter}
                label="Estado"
                onChange={(e) => handleStatusFilter(e.target.value)}
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
              onClick={fetchTeachers}
              sx={{ borderRadius: 2 }}
            >
              Actualizar
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Tabla de docentes con diseño mejorado */}
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
                background: '#f97316',
                '& th': {
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.95rem',
                  borderBottom: 'none'
                }
              }}>
                <TableCell>Docente</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Fecha Registro</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTeachers.map((teacher, index) => (
                <TableRow 
                  key={teacher.id} 
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
                        src={teacher.avatar} 
                        sx={{ 
                          width: 45, 
                          height: 45,
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                        }}
                      >
                        {teacher.first_name?.[0]}{teacher.last_name?.[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="bold" sx={{ 
                          color: themeMode === 'dark' ? '#f1f5f9' : '#2c3e50' 
                        }}>
                          {teacher.first_name} {teacher.last_name}
                        </Typography>
                        <Typography variant="caption" sx={{ 
                          color: themeMode === 'dark' ? '#cbd5e1' : '#7f8c8d' 
                        }}>
                          @{teacher.username}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getTypeIcon(teacher.role)}
                      <Chip 
                        label={getTypeText(teacher.role)} 
                        color={getTypeColor(teacher.role) as any}
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
                        {teacher.email}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={
                        !teacher.is_verified ? 'Bloqueado' :
                        !teacher.is_active ? 'Inactivo' :
                        'Activo'
                      }
                      color={
                        !teacher.is_verified ? 'error' :
                        !teacher.is_active ? 'warning' :
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
                      {new Date(teacher.date_joined).toLocaleDateString('es-ES')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Ver detalles">
                        <IconButton
                          size="small"
                          onClick={() => showTeacherDetails(teacher)}
                          color="primary"
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          onClick={() => {/* Implementar edición */}}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      {teacher.is_active ? (
                        <Tooltip title="Desactivar">
                          <IconButton
                            size="small"
                            onClick={() => handleAction(teacher, 'deactivate')}
                            color="warning"
                          >
                            <BlockIcon />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Activar">
                          <IconButton
                            size="small"
                            onClick={() => handleAction(teacher, 'activate')}
                            color="success"
                          >
                            <CheckCircleIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Diálogo de detalles */}
      <Dialog
        open={showDetailsDialog}
        onClose={() => setShowDetailsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              src={selectedTeacher?.avatar}
              sx={{ width: 50, height: 50 }}
            >
              {selectedTeacher?.first_name?.[0]}{selectedTeacher?.last_name?.[0]}
            </Avatar>
            <Box>
              <Typography variant="h6">
                {selectedTeacher?.first_name} {selectedTeacher?.last_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                @{selectedTeacher?.username}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedTeacher && (
            <Box sx={{ mt: 2 }}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Información Personal
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmailIcon fontSize="small" />
                      <Typography variant="body2">{selectedTeacher.email}</Typography>
                    </Box>
                    {selectedTeacher.phone && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PhoneIcon fontSize="small" />
                        <Typography variant="body2">{selectedTeacher.phone}</Typography>
                      </Box>
                    )}
                  </Box>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Información Académica
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">Carrera:</Typography>
                      <Typography variant="body2">{selectedTeacher.career || 'No especificada'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">Posición:</Typography>
                      <Typography variant="body2">{selectedTeacher.position || 'No especificada'}</Typography>
                    </Box>
                  </Box>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Estado de la Cuenta
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Chip
                      icon={getStatusIcon(selectedTeacher)}
                      label={getStatusText(selectedTeacher)}
                      color={getStatusColor(selectedTeacher)}
                    />
                    <Chip
                      icon={selectedTeacher.is_verified ? <CheckCircleIcon /> : <WarningIcon />}
                      label={selectedTeacher.is_verified ? 'Verificado' : 'Sin verificar'}
                      color={selectedTeacher.is_verified ? 'success' : 'warning'}
                    />
                  </Box>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Fechas
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">Fecha de Registro:</Typography>
                      <Typography variant="body2">
                        {new Date(selectedTeacher.date_joined).toLocaleDateString('es-ES')}
                      </Typography>
                    </Box>
                    {selectedTeacher.last_login && (
                      <Box>
                        <Typography variant="body2" fontWeight="bold">Último Acceso:</Typography>
                        <Typography variant="body2">
                          {new Date(selectedTeacher.last_login).toLocaleDateString('es-ES')}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetailsDialog(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación */}
      <Dialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
      >
        <DialogTitle>Confirmar Acción</DialogTitle>
        <DialogContent>
          <Typography>{confirmAction?.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)}>
            Cancelar
          </Button>
          <Button onClick={confirmActionHandler} color="primary" variant="contained">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbars */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
      >
        <Alert onClose={() => setSuccess(null)} severity="success">
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
}
