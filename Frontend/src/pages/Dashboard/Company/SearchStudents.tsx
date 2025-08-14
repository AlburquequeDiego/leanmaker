import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Avatar,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Paper,
  Grid,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Send as SendIcon,
  Group as GroupIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useApi } from '../../../hooks/useApi';
import { notificationService } from '../../../services/notification.service';
import { useStudentProfileDetails } from '../../../hooks/useStudentProfileDetails';
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
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Hook para obtener el perfil detallado del estudiante
  const { profile: studentProfile, loading: profileLoading, error: profileError } = useStudentProfileDetails(selectedStudentId);
  
  // Logs de depuración para el hook
  console.log('🔍 [SearchStudents] Hook state:', {
    selectedStudentId,
    studentProfile: !!studentProfile,
    profileLoading,
    profileError
  });
  
  // Log adicional cuando cambia el selectedStudentId
  useEffect(() => {
    console.log('🔍 [SearchStudents] selectedStudentId cambió:', selectedStudentId);
    if (selectedStudentId) {
      console.log('🔍 [SearchStudents] Iniciando carga del perfil para ID:', selectedStudentId);
    }
  }, [selectedStudentId]);
  
  // Efecto para manejar el estado del diálogo
  useEffect(() => {
    if (showProfileDialog && selectedStudentId) {
      console.log('🔍 [SearchStudents] Dialog abierto y studentId establecido:', selectedStudentId);
    } else if (showProfileDialog && !selectedStudentId) {
      console.log('❌ [SearchStudents] Dialog abierto pero no hay studentId');
      setShowProfileDialog(false);
    }
  }, [showProfileDialog, selectedStudentId]);

  // Cargar estudiantes al montar el componente
  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 Iniciando carga de estudiantes postulantes...');
      
      // Obtener solo los estudiantes que han postulado a proyectos de la empresa
      try {
        const applicationsResponse = await api.get('/api/applications/company/');
        console.log('🔍 Applications response:', applicationsResponse);
        
        let applicationsData;
        if (applicationsResponse && applicationsResponse.results) {
          applicationsData = applicationsResponse.results;
          console.log('📊 Usando applicationsResponse.results');
        } else if (Array.isArray(applicationsResponse)) {
          applicationsData = applicationsResponse;
          console.log('📊 Usando applicationsResponse como array');
        } else {
          applicationsData = [];
          console.log('📊 No se encontraron postulaciones');
        }
        
        console.log('📊 Total de postulaciones encontradas:', applicationsData.length);
        
        if (applicationsData.length > 0) {
          console.log('🔍 [SearchStudents] Primera aplicación:', applicationsData[0]);
          // Crear un mapa de estudiantes únicos basado en las postulaciones
          const uniqueStudents = new Map();
          
          applicationsData.forEach((application: any) => {
            console.log('🔍 [SearchStudents] Procesando aplicación:', application);
            const studentId = application.student_id;
            console.log('🔍 [SearchStudents] Student ID:', studentId);
            if (!uniqueStudents.has(studentId)) {
              // Crear objeto estudiante con datos de la postulación
              const student = {
                id: studentId,
                user: studentId, // Para compatibilidad con el sistema existente
                name: application.student_name,
                email: application.student_email,
                university: application.student_university || 'No especificada',
                career: application.student_major || 'No especificada',
                skills: application.student_skills || [],
                experience_years: application.student_experience_years || 0,
                availability: application.student_availability || 'No especificada',
                bio: application.student_bio || '',
                phone: application.student_phone || '',
                location: application.student_location || '',
                gpa: application.student_gpa || null,
                api_level: application.student_api_level || 1,
                cv_url: application.student_cv_url || '',
                portfolio_url: application.portfolio_url || '',
                github_url: application.github_url || '',
                linkedin_url: application.linkedin_url || '',
                // Datos adicionales de la postulación
                applications: []
              };
              
              uniqueStudents.set(studentId, student);
            }
            
            // Agregar información de la postulación al estudiante
            const student = uniqueStudents.get(studentId);
            student.applications.push({
              id: application.id,
              project_title: application.project_title,
              project_id: application.project_id,
              status: application.status,
              applied_at: application.applied_at,
              compatibility_score: application.compatibility_score,
              cover_letter: application.cover_letter
            });
          });
          
          const studentsList = Array.from(uniqueStudents.values());
          console.log('✅ Estudiantes únicos encontrados:', studentsList.length);
          setStudents(studentsList);
        } else {
          console.log('⚠️ No hay estudiantes que hayan postulado a proyectos de la empresa');
          setStudents([]);
        }
        
      } catch (applicationsError) {
        console.error('❌ Error cargando postulaciones:', applicationsError);
        setError('Error al cargar los estudiantes postulantes. Intenta de nuevo.');
        setStudents([]);
      }
      
    } catch (err: any) {
      console.error('❌ Error general cargando estudiantes:', err);
      setError(err.message || 'Error al cargar estudiantes postulantes');
    } finally {
      setLoading(false);
    }
  };

  // Combinar datos de usuario y perfil de estudiante
  const getStudentWithUser = (student: Student): Student & { userData?: any } => {
    // Crear un objeto userData simulado con los datos que ya tenemos
    const userData = {
      id: student.user,
      full_name: student.user_data?.full_name || student.user_data?.first_name + ' ' + student.user_data?.last_name || 'Sin nombre',
      first_name: student.user_data?.first_name || '',
      last_name: student.user_data?.last_name || '',
      email: student.user_data?.email || '',
      bio: student.user_data?.bio || '',
      phone: student.user_data?.phone || '',
      location: student.location || ''
    };
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
  }, [students, searchTerm, selectedSkills, resultsLimit, showAllStudents]);

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleContactStudent = (student: Student & { userData?: any }) => {
    console.log('🔍 Datos del estudiante seleccionado:', student);
    console.log('🔍 Datos del usuario seleccionado:', student.userData);
    setSelectedStudent(student);
    setSelectedUser(student.userData || null);
    setShowContactDialog(true);
  };

  const handleViewProfile = (student: Student & { userData?: any }) => {
    console.log('🔍 Abriendo perfil del estudiante:', student);
    console.log('🔍 Student ID:', student.id);
    console.log('🔍 Student object completo:', student);
    
    // Verificar que el ID sea válido
    if (!student.id) {
      console.error('❌ Error: Student ID es undefined o null');
      alert('Error: No se pudo obtener el ID del estudiante');
      return;
    }
    
    // Convertir a string si es necesario
    const studentId = String(student.id);
    console.log('🔍 Student ID convertido a string:', studentId);
    
    setSelectedStudentId(studentId);
    setShowProfileDialog(true);
    
    console.log('🔍 Estado actualizado - selectedStudentId:', studentId);
    console.log('🔍 Estado actualizado - showProfileDialog:', true);
  };

  const handleSendMessage = async (student: Student & { userData?: any }) => {
    try {
      setSendingMessage(true);
      console.log(' Enviando notificación de contacto a estudiante:', student.id);
      
      const response = await notificationService.sendCompanyMessage({
        student_id: Number(student.id),
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
                  Estudiantes Postulantes
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: 300,
                    textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                  }}
                >
                  Historial completo de todos los estudiantes que han postulado a proyectos de tu empresa. Solo puedes contactar a estudiantes que han mostrado interés en tus proyectos.
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
            <GroupIcon sx={{ fontSize: 48, opacity: 0.9 }} />
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
            Estudiantes Postulantes
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
            {showAllStudents ? 'Mostrando todos los postulantes' : `Mostrando últimos ${resultsLimit} postulantes`}
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
                  </Box>

                  {/* Contenido del estudiante */}
                  <Box sx={{ p: 3, pt: 2, bgcolor: themeMode === 'dark' ? '#1e293b' : 'white' }}>
                    
                    {/* Botón de contacto */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        onClick={() => handleViewProfile(student)}
                        sx={{ 
                          borderRadius: 2, 
                          textTransform: 'none',
                          flex: 1,
                          fontSize: '0.8rem',
                          fontWeight: 600
                        }}
                        startIcon={<PersonIcon />}
                      >
                        Ver Perfil
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
          <GroupIcon sx={{ fontSize: 80, color: themeMode === 'dark' ? '#94a3b8' : '#cbd5e1', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" fontWeight={500} sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'text.secondary' }}>
            No se encontraron estudiantes postulantes
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2, color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
            Aún no hay estudiantes que hayan postulado a proyectos de tu empresa. Los estudiantes aparecerán aquí una vez que postulen a tus proyectos.
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

      {/* Dialog de perfil del estudiante */}
      <Dialog 
        open={showProfileDialog} 
        onClose={() => setShowProfileDialog(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
        onEnter={() => console.log('🔍 [SearchStudents] Dialog abriendo con selectedStudentId:', selectedStudentId)}
        onEntered={() => console.log('🔍 [SearchStudents] Dialog abierto completamente')}
      >
        <DialogTitle sx={{ 
          bgcolor: themeMode === 'dark' ? '#334155' : '#f8fafc', 
          borderBottom: themeMode === 'dark' ? '1px solid #475569' : '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <PersonIcon color="primary" />
            <Typography variant="h6" fontWeight={700} sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit' }}>
              Perfil Completo del Estudiante
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
              ID: {selectedStudentId || 'N/A'}
            </Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                console.log('🔍 [SearchStudents] Estado actual del hook:', {
                  selectedStudentId,
                  profileLoading,
                  profileError,
                  studentProfile: !!studentProfile
                });
              }}
              sx={{ ml: 1 }}
            >
              Debug
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3, bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff' }}>
          {(() => {
            console.log('🔍 [SearchStudents] Renderizando contenido del diálogo:', { 
              profileLoading, 
              profileError, 
              studentProfile: !!studentProfile,
              selectedStudentId,
              studentProfileData: studentProfile
            });
            return null;
          })()}
          {profileLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : profileError ? (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              Error al cargar el perfil del estudiante: {profileError}
            </Alert>
          ) : studentProfile ? (
            <Box sx={{ pt: 2 }}>
              {/* Información básica del estudiante */}
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
                  width: 60, 
                  height: 60, 
                  bgcolor: '#3b82f6',
                  fontSize: '1.5rem',
                  fontWeight: 600
                }}>
                  {studentProfile.student?.name?.charAt(0).toUpperCase() || 'E'}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600} sx={{ color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b' }}>
                    {studentProfile.student?.name || 'Nombre no disponible'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                    {studentProfile.student?.email || 'Email no disponible'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                    Teléfono: {studentProfile.student?.phone || 'No disponible'}
                  </Typography>
                </Box>
              </Box>

              {/* Información personal */}
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b' }}>
                Información Personal
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                    <strong>Fecha de Nacimiento:</strong><br />
                    {studentProfile.user_data?.birthdate || 'No disponible'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                    <strong>Género:</strong><br />
                    {studentProfile.user_data?.gender || 'No disponible'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                    <strong>Carrera:</strong><br />
                    {studentProfile.student?.career || 'No disponible'}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                    <strong>Universidad:</strong><br />
                    {studentProfile.student?.university || 'No disponible'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                    <strong>Nivel Educativo:</strong><br />
                    {studentProfile.student?.education_level || 'No disponible'}
                  </Typography>
                </Grid>
              </Grid>

              {/* Habilidades básicas */}
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b' }}>
                Habilidades Básicas
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                    <strong>Habilidades:</strong><br />
                    {studentProfile.student?.skills && studentProfile.student.skills.length > 0 ? (
                      studentProfile.student.skills.map((skill: string, index: number) => (
                        <Chip 
                          key={index} 
                          label={skill} 
                          size="small" 
                          sx={{ mr: 0.5, mb: 0.5 }} 
                        />
                      ))
                    ) : (
                      'No hay habilidades registradas'
                    )}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                    <strong>Idiomas:</strong><br />
                    {studentProfile.student?.languages && studentProfile.student.languages.length > 0 ? (
                      studentProfile.student.languages.map((language: string, index: number) => (
                        <Chip 
                          key={index} 
                          label={language} 
                          size="small" 
                          sx={{ mr: 0.5, mb: 0.5 }} 
                        />
                      ))
                    ) : (
                      'No hay idiomas registrados'
                    )}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                    <strong>Área de Interés:</strong><br />
                    {studentProfile.student?.area || 'No especificado'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                    <strong>Modalidad:</strong><br />
                    {studentProfile.student?.modality || 'No especificado'}
                  </Typography>
                </Grid>
              </Grid>

              {/* Información académica */}
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b' }}>
                Información Académica
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                    <strong>Semestre:</strong><br />
                    {studentProfile.student?.semester || 'No especificado'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                    <strong>Estado:</strong><br />
                    {studentProfile.student?.status || 'No especificado'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                    <strong>Horas Semanales:</strong><br />
                    {studentProfile.student?.hours_per_week || 'No especificado'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                    <strong>Experiencia Previa:</strong><br />
                    {studentProfile.student?.experience_years || 'No especificado'}
                  </Typography>
                </Grid>
              </Grid>

              {/* Carta de presentación */}
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b' }}>
                Carta de Presentación
              </Typography>
              <Box sx={{ 
                p: 2, 
                bgcolor: themeMode === 'dark' ? '#334155' : '#f8fafc',
                borderRadius: 2,
                border: themeMode === 'dark' ? '1px solid #475569' : '1px solid #e2e8f0'
              }}>
                <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary', fontStyle: 'italic' }}>
                  {studentProfile.student?.bio || 'No se ha proporcionado carta de presentación'}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              No se pudo cargar el perfil del estudiante
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: themeMode === 'dark' ? '#334155' : '#f8fafc', borderTop: themeMode === 'dark' ? '1px solid #475569' : '1px solid #e2e8f0' }}>
          <Button 
            onClick={() => setShowProfileDialog(false)}
            variant="outlined"
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SearchStudents;
