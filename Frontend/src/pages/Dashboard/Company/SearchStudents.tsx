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
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Language as LanguageIcon,
  GitHub as GitHubIcon,
  LinkedIn as LinkedInIcon,
  Description as DescriptionIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  Clear as ClearIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { useTheme } from '../../../contexts/ThemeContext';
import { useCompanyStudentsHistory } from '../../../hooks/useStudentProfile';
import { notificationService } from '../../../services/notification.service';
import type { Student } from '../../../types';

export const SearchStudents: React.FC = () => {
  const { themeMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [maxResults, setMaxResults] = useState<number>(10); // Nuevo estado para cantidad de resultados

  // Hook para obtener el historial de estudiantes de la empresa
  const { students, stats, loading, error, refreshStudents, studentProfiles } = useCompanyStudentsHistory();

  // Función para mostrar notificaciones
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    // Auto-ocultar después de 3 segundos
    setTimeout(() => setNotification(null), 3000);
  };

  // Procesar estudiantes para mostrar
  const processedStudents = useMemo(() => {
    if (!students || !Array.isArray(students)) {
      return [];
    }

    return students.map(student => {
      const profile = studentProfiles[student.id];
      return {
        ...student,
        profile,
        hasProfile: !!profile
      };
    });
  }, [students, studentProfiles]);

  // Filtrar estudiantes según búsqueda y habilidades
  const filteredStudents = useMemo(() => {
    if (!processedStudents || processedStudents.length === 0) {
      return [];
    }

    let filtered = processedStudents;

    // Filtrar por término de búsqueda
    if (searchTerm.trim()) {
      filtered = filtered.filter(student => {
        const studentName = student.student_name || student.name || '';
        const studentEmail = student.student_email || student.email || '';
        const studentData = student.student_data || {};
        
        const searchLower = searchTerm.toLowerCase();
        
        // Buscar en nombre
        if (studentName.toLowerCase().includes(searchLower)) {
          return true;
        }

        // Buscar en email
        if (studentEmail.toLowerCase().includes(searchLower)) {
          return true;
        }

        // Buscar en universidad
        if (studentData.university && studentData.university.toLowerCase().includes(searchLower)) {
          return true;
        }

        // Buscar en carrera
        if (studentData.career && studentData.career.toLowerCase().includes(searchLower)) {
          return true;
        }

        // Buscar en habilidades
        if (studentData.skills && Array.isArray(studentData.skills)) {
          if (studentData.skills.some(skill => skill.toLowerCase().includes(searchLower))) {
            return true;
          }
        }
        
        // Fallback: buscar en campos básicos
        if (studentName.toLowerCase().includes(searchLower)) {
          return true;
        }

        if (studentEmail.toLowerCase().includes(searchLower)) {
          return true;
      }

      return false;
    });
    }

    // Filtrar por habilidades seleccionadas
    if (selectedSkills.length > 0) {
      filtered = filtered.filter(student => {
        const studentData = student.student_data || {};
        const studentSkills = studentData.skills || [];
        
        return selectedSkills.every(skill => 
          studentSkills.some(studentSkill => 
            studentSkill.toLowerCase().includes(skill.toLowerCase())
          )
        );
      });
    }

    // Aplicar límite de resultados
    if (maxResults > 0) {
      filtered = filtered.slice(0, maxResults);
    }

    return filtered;
  }, [processedStudents, searchTerm, selectedSkills, maxResults]);

  // Extraer todas las habilidades únicas para el filtro
  const allSkills = useMemo(() => {
    const skillsSet = new Set<string>();
    
    processedStudents.forEach(student => {
      const studentData = student.student_data || {};
      const studentSkills = studentData.skills || [];
      
      studentSkills.forEach(skill => {
          if (skill && typeof skill === 'string') {
            skillsSet.add(skill);
          }
        });
    });
    
    return Array.from(skillsSet).sort();
  }, [processedStudents]);

  console.log('🔍 [SearchStudents] Datos procesados:', {
    filteredStudents: filteredStudents.length,
    allSkills: allSkills.length
  });

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleContactStudent = (student: any) => {
    setSelectedStudent(student);
    setShowContactDialog(true);
  };

  const handleViewProfile = (student: any) => {
    setSelectedStudent(student);
    setShowProfileDialog(true);
  };

  const handleSendMessage = async () => {
    if (!selectedStudent) return;
    
    try {
      setSendingMessage(true);
      
      // Obtener el ID del usuario del estudiante desde studentProfiles
      // Ya que los datos de students no tienen user_id, pero studentProfiles sí
      let userId = null;
      
      // Buscar en studentProfiles usando el ID de la aplicación
      if (studentProfiles[selectedStudent.id]) {
        const profile = studentProfiles[selectedStudent.id];
        
        if (profile.user_data?.id) {
          userId = profile.user_data.id;
        } else if (profile.student?.user) {
          userId = profile.student.user;
        }
      }
      
      // Si no se encontró en studentProfiles, intentar otras opciones
      if (!userId) {
        // Opción 1: Intentar desde student_data
        if (selectedStudent.student_data?.user_id) {
          userId = selectedStudent.student_data.user_id;
        }
        // Opción 2: Intentar desde el campo student
        else if (selectedStudent.student) {
          userId = selectedStudent.student;
        }
        // Opción 3: Buscar por nombre o email en studentProfiles
        else if (selectedStudent.student_name || selectedStudent.student_email) {
          // Buscar en studentProfiles por nombre o email
          for (const [profileId, profile] of Object.entries(studentProfiles)) {
            if (profile.user_data?.full_name === selectedStudent.student_name || 
                profile.user_data?.email === selectedStudent.student_email) {
              userId = profile.user_data.id;
              break;
            }
          }
        }
      }
      
      if (!userId) {
        showNotification('error', 'No se pudo identificar al estudiante. Revisa la consola para más detalles.');
        return;
      }
      
      // Enviar el mensaje usando el user_id del estudiante
      const response = await notificationService.sendCompanyMessage({
        student_id: userId,
        message: 'Hemos revisado tu perfil y estamos interesados en establecer contacto contigo. Nuestro equipo de recursos humanos se pondrá en contacto a través de tu correo institucional para discutir oportunidades de colaboración y próximos pasos. Por favor, revisa tu bandeja de entrada y carpeta de spam regularmente.'
      });
      
      // Verificar si la respuesta es exitosa
      const isSuccess = response && (response.success === true || response.success === 'true');
      
      if (isSuccess) {
        // Cerrar el diálogo y mostrar mensaje de éxito
        setShowContactDialog(false);
        
        // Mostrar notificación de éxito
        showNotification('success', '✅ Mensaje enviado correctamente al estudiante');
      } else {
        showNotification('error', '❌ Error al enviar el mensaje: ' + (response?.message || 'Error desconocido'));
      }
          } catch (error) {
      showNotification('error', '❌ Error al enviar el mensaje: ' + (error instanceof Error ? error.message : 'Error desconocido'));
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
        <Typography variant="body1" sx={{ ml: 2 }}>
          Cargando estudiantes...
        </Typography>
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
          <Typography variant="h6" sx={{ mb: 1 }}>
            Error al cargar estudiantes
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
          {error}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
            Debug: students={JSON.stringify(students?.length || 'undefined')}, 
            loading={loading}, 
            error={error}
          </Typography>
        </Alert>
        <Button onClick={refreshStudents} variant="contained" sx={{ mr: 2 }}>
          Reintentar
        </Button>
        <Button onClick={() => console.log('Debug completo:', { students, loading, error, stats })} variant="outlined">
          Debug Console
        </Button>
      </Box>
    );
  }

  // Debug: verificar que students sea un array válido
  if (!students || !Array.isArray(students)) {
    console.error('❌ [SearchStudents] students no es un array válido:', students);
    return (
      <Box sx={{ 
        p: 3,
        bgcolor: themeMode === 'dark' ? '#0f172a' : '#f8fafc',
        color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
      }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Datos de estudiantes no válidos
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            El sistema recibió datos en un formato inesperado. Esto puede indicar un problema en la API.
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
            Tipo recibido: {typeof students}, Valor: {JSON.stringify(students)}
          </Typography>
        </Alert>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button onClick={refreshStudents} variant="contained">
            Reintentar
          </Button>
        </Box>
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
            onClick={refreshStudents}
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
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3, mb: 4 }}>
        <Paper elevation={0} sx={{ 
          borderRadius: 3, 
          p: 3, 
          border: themeMode === 'dark' ? '1px solid #475569' : '1px solid #e2e8f0',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
      </Box>

      {/* Filtros de búsqueda */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b' }}>
          Buscar Estudiantes
            </Typography>
        
        {/* Fila de búsqueda y filtros */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          alignItems: 'center', 
          flexWrap: 'wrap',
          mb: 2
        }}>
          {/* Buscador principal */}
          <Box sx={{ flex: 1, minWidth: 300 }}>
              <TextField
                fullWidth
              placeholder="Buscar por nombre, email, universidad o carrera..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setSearchTerm('')}
                      edge="end"
                    >
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  bgcolor: themeMode === 'dark' ? '#334155' : '#f8fafc',
                  '&:hover': {
                    bgcolor: themeMode === 'dark' ? '#475569' : '#f1f5f9',
                  },
                  '&.Mui-focused': {
                    bgcolor: themeMode === 'dark' ? '#475569' : '#f1f5f9',
                  },
                },
              }}
            />
              </Box>

          {/* Selector de cantidad de resultados */}
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Mostrar</InputLabel>
            <Select
              value={maxResults}
              onChange={(e) => setMaxResults(e.target.value as number)}
              label="Mostrar"
              sx={{
                borderRadius: 2,
                bgcolor: themeMode === 'dark' ? '#334155' : '#f8fafc',
                '&:hover': {
                  bgcolor: themeMode === 'dark' ? '#475569' : '#f1f5f9',
                },
              }}
            >
              <MenuItem value={10}>Últimos 10</MenuItem>
              <MenuItem value={50}>Últimos 50</MenuItem>
              <MenuItem value={100}>Últimos 100</MenuItem>
              <MenuItem value={-1}>Todos</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Lista de estudiantes */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b' }}>
          Estudiantes Postulantes
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        {filteredStudents.map((student) => (
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
                        {(() => {
                          const studentProfile = studentProfiles[student.id];
                          if (studentProfile) {
                            const userData = studentProfile.user_data || {};
                            const displayName = userData.full_name || student.name || 'E';
                            return displayName.charAt(0).toUpperCase();
                          } else {
                            // Mostrar inicial del ID si no hay perfil
                            return student.id.charAt(0).toUpperCase();
                          }
                        })()}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={700} sx={{ color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b', mb: 0.5 }}>
                          {(() => {
                            const studentProfile = studentProfiles[student.id];
                            if (studentProfile) {
                              const userData = studentProfile.user_data || {};
                              return userData.full_name || student.name || 'Sin nombre';
                            } else {
                              // Mostrar información básica mientras se carga el perfil
                              return student.student_name !== 'Estudiante no encontrado' ? student.student_name : 'Cargando perfil...';
                            }
                          })()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                          {(() => {
                            const studentProfile = studentProfiles[student.id];
                            if (studentProfile) {
                              const userData = studentProfile.user_data || {};
                              return userData.email || student.email || 'Sin email';
                            } else {
                              // Mostrar información básica mientras se carga el perfil
                              return student.student_email !== 'Sin email' ? student.student_email : 'Cargando...';
                            }
                          })()}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>

                {/* Información del estudiante */}
                <Box sx={{ p: 3, pt: 2, pb: 2, bgcolor: themeMode === 'dark' ? '#1e293b' : 'white' }}>
                   {/* Obtener perfil completo del estudiante */}
                   {(() => {
                     const studentProfile = studentProfiles[student.id];
                     
                     if (!studentProfile) {
                       // Mostrar indicador de carga
                       return (
                         <Box sx={{ textAlign: 'center', py: 2 }}>
                           <CircularProgress size={24} sx={{ mb: 1 }} />
                           <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                             Cargando perfil completo...
                           </Typography>
                         </Box>
                       );
                     }
                     
                     const userData = studentProfile.user_data || {};
                     const studentData = studentProfile.student || {};
                     
                     return (
                       <>
                         {/* Solo mostrar información si está disponible */}
                         {studentData.university && studentData.university !== 'No especificada' && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                             <strong>Universidad:</strong> {studentData.university}
                  </Typography>
                         )}
                         
                         {studentData.career && studentData.career !== 'No especificada' && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                             <strong>Carrera:</strong> {studentData.career}
                  </Typography>
                         )}
                  
                  {/* Habilidades */}
                         {studentData.skills && studentData.skills.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1, color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                        <strong>Habilidades:</strong>
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                               {studentData.skills.slice(0, 3).map((skill, index) => (
                          <Chip 
                            key={index} 
                            label={skill} 
                            size="small" 
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }} 
                          />
                        ))}
                               {studentData.skills.length > 3 && (
                          <Chip 
                                   label={`+${studentData.skills.length - 3}`} 
                            size="small" 
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }} 
                          />
                        )}
                      </Box>
                    </Box>
                  )}

                         {/* Información del proyecto - solo si está disponible */}
                         {student.applications && student.applications.length > 0 && (
                           <Box sx={{ mb: 2 }}>
                             <Typography variant="body2" color="text.secondary" sx={{ mb: 1, color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                               <strong>Proyecto:</strong> {student.applications[0].project_title}
                             </Typography>
                             <Typography variant="body2" color="text.secondary" sx={{ mb: 1, color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                               <strong>Estado:</strong> {student.applications[0].status}
                             </Typography>
                           </Box>
                         )}
                         
                         {/* Historial de aplicaciones */}
                         {student.applications && student.applications.length > 0 && (
                           <Box sx={{ mb: 2 }}>
                             <Typography variant="body2" color="text.secondary" sx={{ mb: 1, color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                               <strong>Proyectos postulados:</strong> {student.applications.length}
                             </Typography>
                           </Box>
                         )}

                  {/* Botones de acción */}
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
                       </>
                     );
                   })()}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
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
            No se encontraron estudiantes
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2, color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
            Intenta ajustar los filtros de búsqueda.
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
      <Dialog open={showContactDialog} onClose={() => setShowContactDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <PersonIcon />
            Contactar Estudiante
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedStudent && (
                <Box>
              {/* Información del estudiante */}
              <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {selectedStudent.student_name || 'Estudiante'}
                  </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedStudent.student_email || 'Sin email'}
                  </Typography>
                </Box>

              {/* Advertencia importante */}
              <Box sx={{ mb: 3, p: 2, bgcolor: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="#856404" gutterBottom sx={{ fontWeight: 'bold' }}>
                  ⚠️ Acción No Reversible
                </Typography>
                <Typography variant="body2" color="#856404" sx={{ mb: 1 }}>
                  Una vez enviado el mensaje, esta acción no se podrá deshacer.
                </Typography>
                <Typography variant="body2" color="#856404" sx={{ fontWeight: 'bold' }}>
                  El estudiante recibirá una notificación inmediata y revisará su correo institucional.
                </Typography>
              </Box>

              {/* Mensaje que se enviará */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                ¿Deseas contactar a este estudiante?
              </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Se enviará automáticamente el siguiente mensaje:
              </Typography>
              
                <Box sx={{ p: 2, bgcolor: 'background.paper', border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                   "Hemos revisado tu perfil y estamos interesados en establecer contacto contigo. Nuestro equipo de recursos humanos se pondrá en contacto a través de tu correo institucional para discutir oportunidades de colaboración y próximos pasos. Por favor, revisa tu bandeja de entrada y carpeta de spam regularmente."
                 </Typography>
                </Box>
              </Box>
              
              {/* Confirmación final */}
              <Box sx={{ p: 2, bgcolor: '#e8f5e8', border: '1px solid #c8e6c9', borderRadius: 1 }}>
                <Typography variant="body2" color="#2e7d32" sx={{ fontWeight: 'bold' }}>
                  ✅ Confirmación
                </Typography>
                <Typography variant="body2" color="#2e7d32">
                  Al hacer clic en "Enviar Mensaje", confirmas que deseas contactar a este estudiante y que entiendes que la acción no se puede deshacer.
              </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowContactDialog(false)} color="inherit">
            Cancelar
          </Button>
          <Button 
            onClick={handleSendMessage} 
            variant="contained" 
            startIcon={<SendIcon />}
            disabled={sendingMessage}
            sx={{
              bgcolor: '#1976d2',
              '&:hover': {
                bgcolor: '#1565c0',
              },
            }}
          >
            {sendingMessage ? <CircularProgress size={20} /> : 'Enviar Mensaje'}
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
             <Typography variant="body1" fontWeight={700} sx={{ color: themeMode === 'dark' ? '#f1f5f9' : 'inherit', fontSize: '1.25rem' }}>
              Perfil del Estudiante
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3, bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff' }}>
          {selectedStudent ? (
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
                  {(() => {
                    const studentProfile = studentProfiles[selectedStudent.id];
                    const userData = studentProfile?.user_data || {};
                    const displayName = userData.full_name || selectedStudent.name || 'E';
                    return displayName.charAt(0).toUpperCase();
                  })()}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600} sx={{ color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b' }}>
                    {(() => {
                      const studentProfile = studentProfiles[selectedStudent.id];
                      const userData = studentProfile?.user_data || {};
                      return userData.full_name || selectedStudent.name || 'Nombre no disponible';
                    })()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                    {(() => {
                      const studentProfile = studentProfiles[selectedStudent.id];
                      const userData = studentProfile?.user_data || {};
                      return userData.email || selectedStudent.email || 'Email no disponible';
                    })()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                    Teléfono: {(() => {
                      const studentProfile = studentProfiles[selectedStudent.id];
                      const userData = studentProfile?.user_data || {};
                      return userData.phone || 'No disponible';
                    })()}
                  </Typography>
                </Box>
              </Box>

              {/* Información Personal */}
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b' }}>
                Información Personal
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                    <strong>Nombre:</strong><br />
                    {(() => {
                      const studentProfile = studentProfiles[selectedStudent.id];
                      const userData = studentProfile?.user_data || {};
                      return userData.full_name || 'No disponible';
                    })()}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                    <strong>Email:</strong><br />
                    {(() => {
                      const studentProfile = studentProfiles[selectedStudent.id];
                      const userData = studentProfile?.user_data || {};
                      return userData.email || 'No disponible';
                    })()}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                    <strong>Teléfono:</strong><br />
                    {(() => {
                      const studentProfile = studentProfiles[selectedStudent.id];
                      const userData = studentProfile?.user_data || {};
                      return userData.phone || 'No disponible';
                    })()}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                    <strong>Fecha de Nacimiento:</strong><br />
                    {(() => {
                      const studentProfile = studentProfiles[selectedStudent.id];
                      const userData = studentProfile?.user_data || {};
                      return userData.birthdate || 'No disponible';
                    })()}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                    <strong>Género:</strong><br />
                    {(() => {
                      const studentProfile = studentProfiles[selectedStudent.id];
                      const userData = studentProfile?.user_data || {};
                      return userData.gender || 'No disponible';
                    })()}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                    <strong>Carrera:</strong><br />
                    {(() => {
                      const studentProfile = studentProfiles[selectedStudent.id];
                      const studentData = studentProfile?.student || {};
                      return studentData.career || 'No disponible';
                    })()}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                    <strong>Universidad:</strong><br />
                    {(() => {
                      const studentProfile = studentProfiles[selectedStudent.id];
                      const studentData = studentProfile?.student || {};
                      return studentData.university || 'No disponible';
                    })()}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                    <strong>Nivel Educativo:</strong><br />
                    {(() => {
                      const studentProfile = studentProfiles[selectedStudent.id];
                      const studentData = studentProfile?.student || {};
                      return studentData.education_level || 'No disponible';
                    })()}
                  </Typography>
                </Grid>
              </Grid>

              {/* Habilidades y Experiencia */}
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b' }}>
                Habilidades y Experiencia
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                    <strong>Experiencia:</strong><br />
                    {(() => {
                      const studentProfile = studentProfiles[selectedStudent.id];
                      const studentData = studentProfile?.student || {};
                      return `${studentData.experience_years || 0} años`;
                    })()}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                    <strong>Horas semanales:</strong><br />
                    {(() => {
                      const studentProfile = studentProfiles[selectedStudent.id];
                      const studentData = studentProfile?.student || {};
                      return `${studentData.hours_per_week || 0} horas`;
                    })()}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                    <strong>Habilidades:</strong><br />
                    {(() => {
                      const studentProfile = studentProfiles[selectedStudent.id];
                      const studentData = studentProfile?.student || {};
                      return studentData.skills?.join(', ') || 'No especificadas';
                    })()}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                    <strong>Área de Interés:</strong><br />
                    {(() => {
                      const studentProfile = studentProfiles[selectedStudent.id];
                      const studentData = studentProfile?.student || {};
                      return studentData.area || 'No especificado';
                    })()}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                    <strong>Modalidad:</strong><br />
                    {(() => {
                      const studentProfile = studentProfiles[selectedStudent.id];
                      const studentData = studentProfile?.student || {};
                      return studentData.availability || 'No especificado';
                    })()}
                  </Typography>
                </Grid>
              </Grid>

              {/* Enlaces Profesionales */}
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b' }}>
                Enlaces Profesionales
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                    <strong>LinkedIn:</strong><br />
                    {(() => {
                      const studentProfile = studentProfiles[selectedStudent.id];
                      const studentData = studentProfile?.student || {};
                      return studentData.linkedin_url ? (
                        <a href={studentData.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ color: '#0077b5', textDecoration: 'underline' }}>
                          Ver perfil
                        </a>
                      ) : 'No disponible';
                    })()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                    <strong>GitHub:</strong><br />
                    {(() => {
                      const studentProfile = studentProfiles[selectedStudent.id];
                      const studentData = studentProfile?.student || {};
                      return studentData.github_url ? (
                        <a href={studentData.github_url} target="_blank" rel="noopener noreferrer" style={{ color: '#333', textDecoration: 'underline' }}>
                          Ver repositorio
                        </a>
                      ) : 'No disponible';
                    })()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                    <strong>Portafolio:</strong><br />
                    {(() => {
                      const studentProfile = studentProfiles[selectedStudent.id];
                      const studentData = studentProfile?.student || {};
                      return studentData.portfolio_url ? (
                        <a href={studentData.portfolio_url} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', textDecoration: 'underline' }}>
                          Ver portafolio
                        </a>
                      ) : 'No disponible';
                    })()}
                    </Typography>
                  </Grid>
                </Grid>

              {/* Documentos */}
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b' }}>
                Documentos
                  </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                    <strong>CV:</strong><br />
                    {(() => {
                      const studentProfile = studentProfiles[selectedStudent.id];
                      const studentData = studentProfile?.student || {};
                      return studentData.cv_link ? (
                        <a href={studentData.cv_link} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', textDecoration: 'underline' }}>
                          Ver CV
                        </a>
                      ) : 'No disponible';
                    })()}
                    </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ color: themeMode === 'dark' ? '#cbd5e1' : 'text.secondary' }}>
                    <strong>Certificados:</strong><br />
                    {(() => {
                      const studentProfile = studentProfiles[selectedStudent.id];
                      const studentData = studentProfile?.student || {};
                      return studentData.certificado_link ? (
                        <a href={studentData.certificado_link} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', textDecoration: 'underline' }}>
                          Ver certificados
                        </a>
                      ) : 'No disponible';
                    })()}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No se ha seleccionado ningún estudiante
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
          borderTop: themeMode === 'dark' ? '1px solid #475569' : '1px solid #e2e8f0',
          p: 2
        }}>
          <Button 
            onClick={() => setShowProfileDialog(false)}
            variant="outlined"
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Notificación Toast */}
      {notification && (
        <Box
          sx={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 9999,
            backgroundColor: notification.type === 'success' ? '#4caf50' : '#f44336',
            color: 'white',
            padding: 2,
            borderRadius: 1,
            boxShadow: 3,
            minWidth: 300,
            animation: 'slideIn 0.3s ease-out',
            '@keyframes slideIn': {
              '0%': {
                transform: 'translateX(100%)',
                opacity: 0,
              },
              '100%': {
                transform: 'translateX(0)',
                opacity: 1,
              },
            },
          }}
        >
          <Typography variant="body1">
            {notification.message}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default SearchStudents;
