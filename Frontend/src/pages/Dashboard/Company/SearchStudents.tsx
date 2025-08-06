import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  Divider,
  Badge,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  Star as StarIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Language as LanguageIcon,
  GitHub as GitHubIcon,
  LinkedIn as LinkedInIcon,
  Visibility as VisibilityIcon,
  Send as SendIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Group as GroupIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useApi } from '../../../hooks/useApi';
import { notificationService } from '../../../services/notification.service';
import { adaptStudentList } from '../../../utils/adapters';
import type { Student } from '../../../types';
import { useTheme } from '../../../contexts/ThemeContext';


export const SearchStudents: React.FC = () => {
  const api = useApi();
  const { themeMode } = useTheme();
  const [students, setStudents] = useState<Student[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [resultsLimit, setResultsLimit] = useState<number>(20);
  const [showAllStudents, setShowAllStudents] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Cargar estudiantes al montar el componente
  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 Iniciando carga de estudiantes...');
      
      // Obtener usuarios con rol student
      try {
        const usersResponse = await api.get('/api/users/');
        console.log('🔍 Users response:', usersResponse);
        const studentUsers = usersResponse.data ? usersResponse.data.filter((user: any) => user.role === 'student') : [];
        console.log('👥 Estudiantes encontrados en users:', studentUsers.length);
        setUsers(studentUsers);
      } catch (userError) {
        console.error('❌ Error cargando usuarios:', userError);
        setUsers([]);
      }

      // Obtener perfiles de estudiantes que hayan participado en proyectos
      try {
        const studentsResponse = await api.get('/api/students/');
        console.log('🔍 Students response completa:', studentsResponse);
        
        // Manejar diferentes formatos de respuesta
        let studentsData;
        if (studentsResponse && studentsResponse.results) {
          studentsData = studentsResponse.results;
          console.log('📊 Usando studentsResponse.results');
        } else if (Array.isArray(studentsResponse)) {
          studentsData = studentsResponse;
          console.log('📊 Usando studentsResponse como array');
        } else {
          studentsData = [];
          console.log('📊 No se encontraron datos de estudiantes');
        }
        
              // Mostrar TODOS los estudiantes que han postulado a proyectos
      // La empresa verá un registro completo de todos los postulantes
      const allStudents = studentsData;
      
      console.log('📊 Total de estudiantes disponibles:', allStudents.length);
        
        console.log('📊 Datos de estudiantes sin adaptar:', studentsData);
        console.log('📊 Todos los estudiantes:', allStudents);
        
        if (allStudents.length > 0) {
          console.log('📊 Primer estudiante sin adaptar:', allStudents[0]);
          const adaptedStudents = adaptStudentList(allStudents);
          console.log('✅ Primer estudiante adaptado:', adaptedStudents[0]);
          console.log('✅ Total de estudiantes adaptados:', adaptedStudents.length);
          setStudents(adaptedStudents);
        } else {
          console.log('⚠️ No hay estudiantes disponibles');
          setStudents([]);
        }
        
      } catch (studentError) {
        console.error('❌ Error cargando estudiantes:', studentError);
        setStudents([]);
      }
      
    } catch (err: any) {
      console.error('❌ Error general cargando estudiantes:', err);
      setError(err.message || 'Error al cargar estudiantes');
    } finally {
      setLoading(false);
    }
  };

  // Combinar datos de usuario y perfil de estudiante
  const getStudentWithUser = (student: Student): Student & { userData?: any } => {
    const userData = users.find(user => user.id === student.user);
    return { ...student, userData };
  };

  // Obtener todas las habilidades únicas de los estudiantes
  const allSkills = Array.from(
    new Set(
      students.flatMap(student => student.skills || [])
    )
  );

  // Lógica de filtrado optimizada con useMemo
  const filteredStudents = useMemo(() => {
    const filtered = students
      .map(getStudentWithUser)
      .filter(student => {
        const userData = student.userData;
        if (!userData) return false;

        const matchesSearch = 
          userData.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          userData.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          userData.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.university?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.career?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesSkills = selectedSkills.length === 0 || 
          selectedSkills.some(skill => student.skills?.includes(skill));
        
                return matchesSearch && matchesSkills;
      });

    // Aplicar límite de resultados según la selección del usuario
    if (showAllStudents) {
      return filtered; // Mostrar todos
    } else {
      return filtered.slice(0, resultsLimit); // Mostrar según límite seleccionado
    }
      }, [students, searchTerm, selectedSkills, resultsLimit, showAllStudents, users]);

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleContactStudent = (student: Student & { userData?: User }) => {
    console.log('🔍 Datos del estudiante seleccionado:', student);
    console.log('🔍 Datos del usuario seleccionado:', student.userData);
    setSelectedStudent(student);
    setSelectedUser(student.userData || null);
    setShowContactDialog(true);
  };

  const handleSendMessage = async (student: Student & { userData?: any }) => {
    try {
      setSendingMessage(true);
      console.log(' Enviando notificación de contacto a estudiante:', student.id);
      
      const response = await notificationService.sendCompanyMessage({
        student_id: student.id,
        message: 'La empresa quiere comunicarse contigo. Revisa tu correo institucional para más detalles.'
      });
      
      console.log(' Respuesta del servidor:', response);
      
      if (response.success || response.message === 'Mensaje enviado exitosamente') {
        alert('Notificación enviada exitosamente. El estudiante recibirá una notificación para revisar su correo institucional.');
        setShowContactDialog(false);
        setMessageText('');
      } else {
        alert('Error al enviar notificación: ' + (response.error || response.message || 'Error desconocido'));
      }
    } catch (error: any) {
      console.error('❌ Error enviando notificación:', error);
      alert('Error al enviar notificación: ' + (error.response?.data?.error || error.message || 'Error desconocido'));
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        bgcolor: themeMode === 'dark' ? '#0f172a' : '#f8fafc',
        color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        p: 3,
        bgcolor: themeMode === 'dark' ? '#0f172a' : '#f8fafc',
        color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
      }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button onClick={loadStudents} variant="contained">
          Reintentar
        </Button>
      </Box>
    );
  }

  // Si no hay estudiantes cargados
  if (students.length === 0 && !loading) {
    return (
      <Box sx={{ 
        flexGrow: 1, 
        p: { xs: 2, md: 4 }, 
        bgcolor: themeMode === 'dark' ? '#0f172a' : '#f8fafc', 
        minHeight: '100vh',
        color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
      }}>
        {/* Banner superior con gradiente y contexto */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '20px',
            p: 4,
            mb: 4,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: themeMode === 'dark' ? '0 8px 32px rgba(102, 126, 234, 0.4)' : '0 8px 32px rgba(102, 126, 234, 0.3)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              width: '200%',
              height: '200%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
              animation: 'float 6s ease-in-out infinite',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: '-30%',
              right: '-30%',
              width: '60%',
              height: '60%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
              animation: 'float 8s ease-in-out infinite reverse',
            },
            '@keyframes float': {
              '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
              '50%': { transform: 'translateY(-20px) rotate(180deg)' },
            },
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                }}
              >
                <GroupIcon sx={{ fontSize: 32, color: 'white' }} />
              </Box>
              <Box>
                <Typography
                  variant="h3"
                  sx={{
                    color: 'white',
                    fontWeight: 'bold',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    mb: 1,
                  }}
                >
                  Registro de Estudiantes Postulantes
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: 300,
                    textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                  }}
                >
                  Historial completo de todos los estudiantes que han postulado a proyectos de tu empresa.
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
        
        <Box sx={{ 
          textAlign: 'center', 
          py: 8,
          bgcolor: themeMode === 'dark' ? '#1e293b' : 'white',
          borderRadius: 3,
          border: themeMode === 'dark' ? '2px dashed #475569' : '2px dashed #cbd5e1',
          boxShadow: themeMode === 'dark' ? '0 4px 20px rgba(0,0,0,0.3)' : 'none'
        }}>
          <GroupIcon sx={{ fontSize: 80, color: themeMode === 'dark' ? '#94a3b8' : '#cbd5e1', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" fontWeight={500} sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'text.secondary' }}>
            No hay estudiantes registrados
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2, color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
            Aún no hay estudiantes que hayan postulado a proyectos de tu empresa. Los estudiantes aparecerán aquí una vez que postulen.
          </Typography>
          <Button 
            variant="outlined" 
            onClick={loadStudents}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Actualizar Registro
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      flexGrow: 1, 
      p: { xs: 2, md: 4 }, 
      bgcolor: themeMode === 'dark' ? '#0f172a' : '#f8fafc', 
      minHeight: '100vh',
      color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
    }}>
      {/* Banner superior con gradiente y contexto */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '20px',
          p: 4,
          mb: 4,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: themeMode === 'dark' ? '0 8px 32px rgba(102, 126, 234, 0.4)' : '0 8px 32px rgba(102, 126, 234, 0.3)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            animation: 'float 6s ease-in-out infinite',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-30%',
            right: '-30%',
            width: '60%',
            height: '60%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
            animation: 'float 8s ease-in-out infinite reverse',
          },
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
            '50%': { transform: 'translateY(-20px) rotate(180deg)' },
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              <GroupIcon sx={{ fontSize: 32, color: 'white' }} />
            </Box>
            <Box>
              <Typography
                variant="h3"
                sx={{
                  color: 'white',
                  fontWeight: 'bold',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  mb: 1,
                }}
              >
                Registro de Estudiantes Postulantes
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: 300,
                  textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                }}
              >
                Historial completo de todos los estudiantes que han postulado a proyectos de tu empresa. Puedes contactarlos enviando un mensaje.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Estadísticas */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 4 }}>
        <Paper elevation={0} sx={{ 
          borderRadius: 3, 
          p: 3, 
          border: themeMode === 'dark' ? '1px solid #475569' : '1px solid #e2e8f0',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: themeMode === 'dark' ? '0 8px 32px rgba(102, 126, 234, 0.4)' : 'none',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
            pointerEvents: 'none'
          }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
            <Box>
              <Typography variant="h3" fontWeight={800} sx={{ mb: 0.5 }}>
                {students.length}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.95, fontWeight: 500 }}>
                Total Postulantes
              </Typography>
            </Box>
            <GroupIcon sx={{ fontSize: 48, opacity: 0.9 }} />
          </Box>
        </Paper>

        <Paper elevation={0} sx={{ 
          borderRadius: 3, 
          p: 3, 
          border: themeMode === 'dark' ? '1px solid #475569' : '1px solid #e2e8f0',
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: themeMode === 'dark' ? '0 8px 32px rgba(240, 147, 251, 0.4)' : 'none',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
            pointerEvents: 'none'
          }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
            <Box>
              <Typography variant="h3" fontWeight={800} sx={{ mb: 0.5 }}>
                {filteredStudents.length}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.95, fontWeight: 500 }}>
                Postulantes Visibles
              </Typography>
            </Box>
            <SearchIcon sx={{ fontSize: 48, opacity: 0.9 }} />
          </Box>
        </Paper>

        <Paper elevation={0} sx={{ 
          borderRadius: 3, 
          p: 3, 
          border: themeMode === 'dark' ? '1px solid #475569' : '1px solid #e2e8f0',
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: themeMode === 'dark' ? '0 8px 32px rgba(79, 172, 254, 0.4)' : 'none',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
            pointerEvents: 'none'
          }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
            <Box>
              <Typography variant="h3" fontWeight={800} sx={{ mb: 0.5 }}>
                {allSkills.length}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.95, fontWeight: 500 }}>
                Habilidades Únicas
              </Typography>
            </Box>
            <TrendingUpIcon sx={{ fontSize: 48, opacity: 0.9 }} />
          </Box>
        </Paper>
      </Box>

      {/* Filtros de búsqueda */}
      <Paper elevation={0} sx={{ 
        mb: 4, 
        borderRadius: 3, 
        border: themeMode === 'dark' ? '1px solid #475569' : '1px solid #e2e8f0', 
        bgcolor: themeMode === 'dark' ? '#1e293b' : 'white',
        boxShadow: themeMode === 'dark' ? '0 4px 20px rgba(0,0,0,0.3)' : 'none'
      }}>
        <Box sx={{ p: 3, borderBottom: themeMode === 'dark' ? '1px solid #475569' : '1px solid #e2e8f0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <FilterIcon sx={{ color: themeMode === 'dark' ? '#60a5fa' : '#64748b' }} />
            <Typography variant="h6" fontWeight={600} sx={{ color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b' }}>
              Filtros de Búsqueda
            </Typography>
          </Box>
        </Box>
        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Buscar por nombre, universidad o carrera"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: themeMode === 'dark' ? '#60a5fa' : 'text.secondary' }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: themeMode === 'dark' ? '#334155' : '#ffffff',
                    color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                    '& fieldset': {
                      borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db'
                    },
                    '&:hover fieldset': {
                      borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary'
                  },
                  '& .MuiInputBase-input': {
                    color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'inherit' }}>Mostrar</InputLabel>
                <Select
                  value={showAllStudents ? 'all' : resultsLimit}
                  label="Mostrar"
                  onChange={(e) => {
                    if (e.target.value === 'all') {
                      setShowAllStudents(true);
                      setResultsLimit(20); // Reset para cuando se desactive
                    } else {
                      setShowAllStudents(false);
                      setResultsLimit(Number(e.target.value));
                    }
                  }}
                  sx={{
                    borderRadius: 2,
                    bgcolor: themeMode === 'dark' ? '#334155' : '#ffffff',
                    color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6'
                    }
                  }}
                >
                  <MenuItem value={20}>Últimos 20</MenuItem>
                  <MenuItem value={50}>Últimos 50</MenuItem>
                  <MenuItem value={100}>Últimos 100</MenuItem>
                  <MenuItem value={1500}>Últimos 1500</MenuItem>
                  <MenuItem value="all">Todos</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Contador de resultados */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" fontWeight={600} sx={{ color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b' }}>
            Registro de Postulantes
          </Typography>
          <Chip 
            label={filteredStudents.length} 
            color="primary" 
            size="small"
            sx={{ fontWeight: 600 }}
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
            {showAllStudents ? 'Mostrando todos los estudiantes' : `Mostrando últimos ${resultsLimit}`}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
            ({filteredStudents.length} de {students.length} total)
          </Typography>
        </Box>
      </Box>

      {/* Lista de estudiantes */}
      <Grid container spacing={3}>
        {filteredStudents.map((student) => {
          const userData = student.userData;
          if (!userData) return null;

          return (
            <Grid item xs={12} md={6} lg={4} key={student.id}>
              <Card elevation={0} sx={{ 
                borderRadius: 3, 
                border: themeMode === 'dark' ? '1px solid #475569' : '1px solid #e2e8f0',
                bgcolor: themeMode === 'dark' ? '#1e293b' : 'white',
                transition: 'all 0.3s ease',
                overflow: 'hidden',
                boxShadow: themeMode === 'dark' ? '0 4px 20px rgba(0,0,0,0.3)' : 'none',
                '&:hover': { 
                  transform: 'translateY(-4px)',
                  boxShadow: themeMode === 'dark' ? '0 12px 40px rgba(0,0,0,0.4)' : '0 12px 40px rgba(0,0,0,0.15)',
                  borderColor: themeMode === 'dark' ? '#60a5fa' : '#cbd5e1'
                }
              }}>
                <CardContent sx={{ p: 0 }}>
                  {/* Header del estudiante */}
                  <Box sx={{ 
                    p: 3, 
                    pb: 2,
                    background: themeMode === 'dark' ? 'linear-gradient(135deg, #334155 0%, #475569 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                    borderBottom: themeMode === 'dark' ? '1px solid #475569' : '1px solid #e2e8f0'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ 
                          width: 60, 
                          height: 60, 
                          bgcolor: '#3b82f6',
                          fontSize: '1.5rem',
                          fontWeight: 600
                        }}>
                          {userData.full_name ? userData.full_name.charAt(0).toUpperCase() : 'E'}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight={700} sx={{ color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b', mb: 0.5 }}>
                            {userData.full_name || `${userData.first_name} ${userData.last_name}`}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                            {userData.email}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {student.university && (
                        <Chip
                          icon={<SchoolIcon sx={{ fontSize: 16 }} />}
                          label={student.university}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem', height: 24 }}
                        />
                      )}
                      {student.career && (
                        <Chip
                          icon={<WorkIcon sx={{ fontSize: 16 }} />}
                          label={student.career}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem', height: 24 }}
                        />
                      )}
                    </Box>
                  </Box>

                  {/* Contenido del estudiante */}
                  <Box sx={{ p: 3, pt: 2, bgcolor: themeMode === 'dark' ? '#1e293b' : 'white' }}>

                    {/* Habilidades */}
                    {student.skills && student.skills.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 1, display: 'block', color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                          Habilidades:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {student.skills.slice(0, 3).map((skill, index) => (
                            <Chip
                              key={index}
                              label={skill}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.65rem', height: 20 }}
                            />
                          ))}
                          {student.skills.length > 3 && (
                            <Chip
                              label={`+${student.skills.length - 3}`}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.65rem', height: 20 }}
                            />
                          )}
                        </Box>
                      </Box>
                    )}

                    {/* Botones de acción */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        color="info"
                        onClick={() => {
                          setSelectedStudent(student);
                          setSelectedUser(userData);
                          setShowDetailDialog(true);
                        }}
                        sx={{ 
                          borderRadius: 2, 
                          textTransform: 'none',
                          flex: 1,
                          fontSize: '0.8rem',
                          fontWeight: 600
                        }}
                        startIcon={<PersonIcon />}
                      >
                        Ver Portafolio
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => handleContactStudent(student)}
                        sx={{ 
                          borderRadius: 2, 
                          textTransform: 'none',
                          flex: 1,
                          fontSize: '0.8rem',
                          fontWeight: 600
                        }}
                        startIcon={<SendIcon />}
                      >
                        Contactar
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Mensaje cuando no hay resultados */}
      {filteredStudents.length === 0 && !loading && (
        <Box sx={{ 
          textAlign: 'center', 
          py: 8,
          bgcolor: themeMode === 'dark' ? '#1e293b' : 'white',
          borderRadius: 3,
          border: themeMode === 'dark' ? '2px dashed #475569' : '2px dashed #cbd5e1',
          boxShadow: themeMode === 'dark' ? '0 4px 20px rgba(0,0,0,0.3)' : 'none'
        }}>
          <PersonIcon sx={{ fontSize: 80, color: themeMode === 'dark' ? '#94a3b8' : '#cbd5e1', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" fontWeight={500} sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'text.secondary' }}>
            No se encontraron estudiantes postulantes
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2, color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
            Aún no hay estudiantes que hayan postulado a proyectos de tu empresa. Intenta ajustar los filtros de búsqueda.
          </Typography>
          <Button 
            variant="outlined" 
            onClick={() => {
              setSearchTerm('');
              setSelectedSkills([]);
            }}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Limpiar Filtros
          </Button>
        </Box>
      )}

      {/* Dialog de detalles del estudiante */}
      <Dialog 
        open={showDetailDialog} 
        onClose={() => setShowDetailDialog(false)} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main', 
          color: 'white',
          fontWeight: 600
        }}>
          Perfil Completo del Estudiante
        </DialogTitle>
        <DialogContent sx={{ p: 3, bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff' }}>
          {selectedStudent && selectedUser && (
            <Box sx={{ pt: 2 }}>
              {console.log('🎨 Renderizando portafolio con datos:', { selectedStudent, selectedUser })}
              
              {/* Header con nombre y apellido */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ width: 80, height: 80, mr: 3, bgcolor: 'primary.main', boxShadow: 3 }}>
                  <PersonIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={700} sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit' }}>
                    {selectedUser.full_name || `${selectedUser.first_name || ''} ${selectedUser.last_name || ''}` || '-'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                    {selectedUser.email || '-'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                    {selectedUser.phone || '-'}
                  </Typography>
                </Box>
              </Box>

              <Paper sx={{ p: 3, mb: 3, borderRadius: 2, bgcolor: themeMode === 'dark' ? '#334155' : '#f8f9fa' }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ flex: 1, minWidth: 220 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#94a3b8' : 'text.secondary' }}>Fecha de Nacimiento:</Typography>
                    <Typography variant="body1" sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit' }}>{selectedStudent.perfil_detallado?.fecha_nacimiento || '-'}</Typography>
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 220 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#94a3b8' : 'text.secondary' }}>Género:</Typography>
                    <Typography variant="body1" sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit' }}>{selectedStudent.perfil_detallado?.genero || '-'}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
                  <Box sx={{ flex: 1, minWidth: 220 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#94a3b8' : 'text.secondary' }}>Carrera:</Typography>
                    <Typography variant="body1" sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit' }}>{selectedStudent.career || '-'}</Typography>
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 220 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#94a3b8' : 'text.secondary' }}>Nivel Educativo:</Typography>
                    <Typography variant="body1" sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit' }}>{selectedStudent.api_level || '-'}</Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Habilidades */}
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" fontWeight={600} sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit' }}>Habilidades</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {(selectedStudent.skills || []).map((h: string) => (
                  <Chip key={h} label={h} color="primary" />
                ))}
                {(!selectedStudent.skills || selectedStudent.skills.length === 0) && <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#94a3b8' : 'text.secondary' }}>-</Typography>}
              </Box>

              {/* Documentos */}
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" fontWeight={600} sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit' }}>Documentos</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                {selectedStudent.cv_link && (
                  <Typography variant="body2" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'inherit' }}>
                    <strong>CV:</strong> <a href={selectedStudent.cv_link} target="_blank" rel="noopener noreferrer" style={{ color: themeMode === 'dark' ? '#60a5fa' : '#1976d2' }}>{selectedStudent.cv_link}</a>
                  </Typography>
                )}
                {selectedStudent.certificado_link && (
                  <Typography variant="body2" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'inherit' }}>
                    <strong>Certificado:</strong> <a href={selectedStudent.certificado_link} target="_blank" rel="noopener noreferrer" style={{ color: themeMode === 'dark' ? '#60a5fa' : '#1976d2' }}>{selectedStudent.certificado_link}</a>
                  </Typography>
                )}
                {(!selectedStudent.cv_link && !selectedStudent.certificado_link) && <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#94a3b8' : 'text.secondary' }}>No hay documentos</Typography>}
              </Box>

              {/* Área de interés y modalidades */}
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" fontWeight={600} sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit' }}>Área y Modalidad</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <Box sx={{ flex: 1, minWidth: 220 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#94a3b8' : 'text.secondary' }}>Área de interés:</Typography>
                  <Typography variant="body1" sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit' }}>{selectedStudent.area || '-'}</Typography>
                </Box>
                <Box sx={{ flex: 1, minWidth: 220 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#94a3b8' : 'text.secondary' }}>Modalidad:</Typography>
                  <Typography variant="body1" sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit' }}>{selectedStudent.availability || '-'}</Typography>
                </Box>
              </Box>

              {/* Experiencia previa */}
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" fontWeight={600} sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit' }}>Experiencia Previa</Typography>
              <Typography variant="body2" sx={{ mb: 2, color: themeMode === 'dark' ? '#cbd5e1' : 'inherit' }}>{selectedStudent.experience_years ? `${selectedStudent.experience_years} años` : '-'}</Typography>

              {/* Enlaces */}
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" fontWeight={600} sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit' }}>Enlaces</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                {selectedStudent.linkedin_url && (
                  <Typography variant="body2" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'inherit' }}>
                    <strong>LinkedIn:</strong> <a href={selectedStudent.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ color: themeMode === 'dark' ? '#60a5fa' : '#1976d2' }}>{selectedStudent.linkedin_url}</a>
                  </Typography>
                )}
                {selectedStudent.github_url && (
                  <Typography variant="body2" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'inherit' }}>
                    <strong>GitHub:</strong> <a href={selectedStudent.github_url} target="_blank" rel="noopener noreferrer" style={{ color: themeMode === 'dark' ? '#60a5fa' : '#1976d2' }}>{selectedStudent.github_url}</a>
                  </Typography>
                )}
                {selectedStudent.portfolio_url && (
                  <Typography variant="body2" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'inherit' }}>
                    <strong>Portafolio:</strong> <a href={selectedStudent.portfolio_url} target="_blank" rel="noopener noreferrer" style={{ color: themeMode === 'dark' ? '#60a5fa' : '#1976d2' }}>{selectedStudent.portfolio_url}</a>
                  </Typography>
                )}
                {(!selectedStudent.linkedin_url && !selectedStudent.github_url && !selectedStudent.portfolio_url) && <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#94a3b8' : 'text.secondary' }}>No hay enlaces</Typography>}
              </Box>

              {/* Carta de Presentación */}
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" fontWeight={600} sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit' }}>Carta de Presentación</Typography>
              <Typography variant="body2" sx={{ mb: 2, color: themeMode === 'dark' ? '#cbd5e1' : 'inherit' }}>
                {selectedStudent.bio || selectedStudent.user_data?.bio || '-'}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: themeMode === 'dark' ? '#334155' : '#f5f5f5', gap: 2 }}>
          <Button 
            onClick={() => setShowDetailDialog(false)}
            variant="outlined"
            sx={{ borderRadius: 2, px: 3 }}
          >
            Cerrar
          </Button>
          <Button
            onClick={() => {
              setShowDetailDialog(false);
              handleContactStudent(selectedStudent!);
            }}
            variant="contained"
            color="primary"
            sx={{ borderRadius: 2, px: 3 }}
            startIcon={<SendIcon />}
          >
            Contactar Estudiante
          </Button>
        </DialogActions>
      </Dialog>
      {/* Dialog de contacto */}
      <Dialog 
        open={showContactDialog} 
        onClose={() => setShowContactDialog(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: themeMode === 'dark' ? '#334155' : '#f8fafc', 
          borderBottom: themeMode === 'dark' ? '1px solid #475569' : '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <SendIcon color="primary" />
          <Typography variant="h6" fontWeight={700} sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit' }}>
            Contactar Estudiante
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3, bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff' }}>
          {selectedStudent && selectedUser && (
            <Box sx={{ pt: 2 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2, 
                mb: 3,
                p: 2,
                bgcolor: themeMode === 'dark' ? '#334155' : '#f8fafc',
                borderRadius: 2,
                border: themeMode === 'dark' ? '1px solid #475569' : '1px solid #e2e8f0'
              }}>
                <Avatar sx={{ 
                  width: 50, 
                  height: 50, 
                  bgcolor: '#3b82f6',
                  fontSize: '1.2rem',
                  fontWeight: 600
                }}>
                  {selectedUser.full_name ? selectedUser.full_name.charAt(0).toUpperCase() : 'E'}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600} sx={{ color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b' }}>
                    {selectedUser.full_name || `${selectedUser.first_name} ${selectedUser.last_name}`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                    {selectedUser.email}
                  </Typography>
                </Box>
              </Box>

              <Typography variant="body1" sx={{ mb: 2, fontWeight: 500, color: themeMode === 'dark' ? '#f1f5f9' : 'inherit' }}>
                ¿Deseas contactar a este estudiante?
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6, color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                Se enviará una notificación al estudiante indicando que tu empresa se quiere comunicar con él/ella. 
                El estudiante recibirá el mensaje: <strong>"La empresa quiere comunicarse contigo. Revisa tu correo institucional para más detalles."</strong>
              </Typography>
              
              <Box sx={{ 
                p: 2, 
                bgcolor: themeMode === 'dark' ? '#1e3a8a' : '#f0f9ff', 
                border: themeMode === 'dark' ? '1px solid #3b82f6' : '1px solid #0ea5e9', 
                borderRadius: 2,
                borderLeft: themeMode === 'dark' ? '4px solid #3b82f6' : '4px solid #0ea5e9'
              }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                  💡 <strong>Nota:</strong> El estudiante será notificado para revisar su correo institucional donde podrás contactarlo directamente.
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: themeMode === 'dark' ? '#334155' : '#f8fafc', borderTop: themeMode === 'dark' ? '1px solid #475569' : '1px solid #e2e8f0' }}>
          <Button 
            onClick={() => setShowContactDialog(false)}
            variant="outlined"
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={() => handleSendMessage(selectedStudent!)} 
            variant="contained" 
            color="primary"
            disabled={sendingMessage}
            sx={{ borderRadius: 2, textTransform: 'none' }}
            startIcon={sendingMessage ? <CircularProgress size={16} /> : <SendIcon />}
          >
            {sendingMessage ? 'Enviando...' : 'Enviar Notificación'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SearchStudents;
