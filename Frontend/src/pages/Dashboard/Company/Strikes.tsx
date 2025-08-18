import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  FormControl,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  Security as SecurityIcon,
  Assessment as AssessmentIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useTheme } from '../../../contexts/ThemeContext';
import { apiService } from '../../../services/api.service';
import { useStudentProfile } from '../../../hooks/useStudentProfile';
import ProjectDetailsModal from '../../../components/common/ProjectDetailsModal';

export const CompanyStrikes: React.FC = () => {
  const { themeMode } = useTheme();
  const [strikeReports, setStrikeReports] = useState<any[]>([]);
  const [showLimit, setShowLimit] = useState(15);
  const [loading, setLoading] = useState(true);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [projectDetailsModalOpen, setProjectDetailsModalOpen] = useState(false);
  const [selectedProjectForDetails, setSelectedProjectForDetails] = useState<any>(null);
  const [strikeDetailsModalOpen, setStrikeDetailsModalOpen] = useState(false);
  const [selectedStrikeForDetails, setSelectedStrikeForDetails] = useState<any>(null);

  // Hook para obtener el perfil detallado del estudiante
  const { profile: studentProfile, loading: profileLoading, error: profileError } = useStudentProfile(selectedStudentId);

  const totalReports = strikeReports.length;
  const pendingReports = strikeReports.filter(r => r.status === 'pending').length;
  const approvedReports = strikeReports.filter(r => r.status === 'approved').length;
  const rejectedReports = strikeReports.filter(r => r.status === 'rejected').length;

  // Cargar reportes de strikes
  const loadStrikeReports = async () => {
    try {
      setLoading(true);
      
      // Llamar a la API real
      const response = await apiService.getCompanyStrikeReports();
      const results = (response as any).results || [];
      setStrikeReports(results);
    } catch (error) {
      console.error('Error cargando reportes de strikes:', error);
      setStrikeReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = (strike: any) => {
    console.log('🔍 Abriendo perfil del estudiante:', strike);
    if (strike.student_id) {
      setSelectedStudentId(strike.student_id);
      setShowProfileDialog(true);
    } else {
      console.error('❌ No se pudo obtener el ID del estudiante');
    }
  };

  const handleViewProjectDetails = async (strike: any) => {
    console.log('🔍 Abriendo detalles del proyecto:', strike);
    
    try {
      // Obtener el ID del proyecto del strike
      const projectId = strike.project_id;
      
      if (!projectId) {
        console.error('❌ No se pudo obtener el ID del proyecto');
        return;
      }

      // Obtener los datos completos del proyecto desde la API usando apiService
      const response = await apiService.getProjectDetails(projectId);
      console.log('🔍 Datos completos del proyecto obtenidos:', response);
      
      // Usar los datos reales del proyecto
      setSelectedProjectForDetails(response);
      setProjectDetailsModalOpen(true);
      
    } catch (error) {
      console.error('❌ Error al obtener detalles del proyecto:', error);
      
      // Fallback: crear un objeto con la información disponible
      const projectData = {
        id: strike.project_id,
        title: strike.project_title,
        description: strike.project_description || 'Descripción no disponible',
        company_name: strike.company_name || 'Empresa no especificada',
        // Agregar otros campos que puedan estar disponibles
      };
      setSelectedProjectForDetails(projectData);
      setProjectDetailsModalOpen(true);
    }
  };

  const handleViewStrikeDetails = (strike: any) => {
    setSelectedStrikeForDetails(strike);
    setStrikeDetailsModalOpen(true);
  };

  useEffect(() => {
    loadStrikeReports();
  }, []);

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header con tarjeta morada */}
      <Card sx={{ 
        mb: 4, 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
        borderRadius: 3,
        overflow: 'hidden'
      }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ 
                background: 'rgba(255, 255, 255, 0.2)', 
                borderRadius: 2, 
                p: 1.5, 
                mr: 2,
                backdropFilter: 'blur(10px)'
              }}>
                <SecurityIcon sx={{ color: 'white', fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold', mb: 0.5, textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
                  Reportes de Strikes Enviados
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>
                  Revisa el estado de los reportes de strikes que has enviado a estudiantes
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Información del proceso */}
      <Card sx={{ 
        mb: 4, 
        border: themeMode === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
        bgcolor: themeMode === 'dark' ? '#1e293b' : 'white',
        overflow: 'hidden'
      }}>
        <Box sx={{ 
          p: 3, 
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          color: 'white'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <WarningIcon sx={{ fontSize: 24 }} />
            <Typography variant="h6" fontWeight={700}>
              Proceso de Reportes de Strikes
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
            Los reportes que envíes serán revisados por administración. Solo ellos pueden aprobar o rechazar strikes.
          </Typography>
        </Box>
      </Card>

      {/* Estadísticas con colores suaves - Mejoradas */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
        gap: 3, 
        mb: 4 
      }}>
        <Card sx={{ 
          background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
          color: 'white', 
          borderRadius: 3, 
          boxShadow: '0 4px 20px rgba(79, 70, 229, 0.2)', 
          transition: 'box-shadow 0.3s ease',
          height: '100%',
          '&:hover': { 
            boxShadow: '0 8px 32px rgba(79, 70, 229, 0.3)'
          }
        }}>
          <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h4" fontWeight={700} sx={{ fontSize: { xs: '2rem', md: '2.5rem' } }}>
                {totalReports}
              </Typography>
              <Avatar sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.2)', 
                width: 64, 
                height: 64 
              }}>
                <WarningIcon sx={{ fontSize: 32, color: 'white' }} />
              </Avatar>
            </Box>
            <Typography variant="h6" fontWeight={600} sx={{ fontSize: { xs: '1rem', md: '1.1rem' } }}>
              Total Reportes
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ 
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          color: 'white', 
          borderRadius: 3, 
          boxShadow: '0 4px 20px rgba(245, 158, 11, 0.2)', 
          transition: 'box-shadow 0.3s ease',
          height: '100%',
          '&:hover': { 
            boxShadow: '0 8px 32px rgba(245, 158, 11, 0.3)'
          }
        }}>
          <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h4" fontWeight={700} sx={{ fontSize: { xs: '2rem', md: '2.5rem' } }}>
                {pendingReports}
              </Typography>
              <Avatar sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.2)', 
                width: 64, 
                height: 64 
              }}>
                <ScheduleIcon sx={{ fontSize: 32, color: 'white' }} />
              </Avatar>
            </Box>
            <Typography variant="h6" fontWeight={600} sx={{ fontSize: { xs: '1rem', md: '1.1rem' } }}>
              Pendientes
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ 
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white', 
          borderRadius: 3, 
          boxShadow: '0 4px 20px rgba(16, 185, 129, 0.2)', 
          transition: 'box-shadow 0.3s ease',
          height: '100%',
          '&:hover': { 
            boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)'
          }
        }}>
          <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h4" fontWeight={700} sx={{ fontSize: { xs: '2rem', md: '2.5rem' } }}>
                {approvedReports}
              </Typography>
              <Avatar sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.2)', 
                width: 64, 
                height: 64 
              }}>
                <ScheduleIcon sx={{ fontSize: 32, color: 'white' }} />
              </Avatar>
            </Box>
            <Typography variant="h6" fontWeight={600} sx={{ fontSize: { xs: '1rem', md: '1.1rem' } }}>
              Aprobados
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ 
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white', 
          borderRadius: 3, 
          boxShadow: '0 4px 20px rgba(239, 68, 68, 0.2)', 
          transition: 'box-shadow 0.3s ease',
          height: '100%',
          '&:hover': { 
            boxShadow: '0 8px 32px rgba(239, 68, 68, 0.3)'
          }
        }}>
          <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h4" fontWeight={700} sx={{ fontSize: { xs: '2rem', md: '2.5rem' } }}>
                {rejectedReports}
              </Typography>
              <Avatar sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.2)', 
                width: 64, 
                height: 64 
              }}>
                <WarningIcon sx={{ fontSize: 32, color: 'white' }} />
              </Avatar>
            </Box>
            <Typography variant="h6" fontWeight={600} sx={{ fontSize: { xs: '1rem', md: '1.1rem' } }}>
              Rechazados
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Estado vacío mejorado con selector */}
      <Card sx={{ 
        mb: 4, 
        border: themeMode === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
        bgcolor: themeMode === 'dark' ? '#1e293b' : 'white',
        overflow: 'hidden'
      }}>
        <Box sx={{ 
          p: 3, 
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          color: 'white'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AssessmentIcon sx={{ fontSize: 24 }} />
              <Typography variant="h6" fontWeight={700}>
                Estado de Reportes
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" sx={{ 
                color: themeMode === 'dark' ? '#ffffff' : '#1e293b',
                fontWeight: 600 
              }}>
                Mostrar
              </Typography>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={showLimit}
                  onChange={(e) => setShowLimit(Number(e.target.value))}
                  sx={{ 
                    bgcolor: 'white',
                    color: '#1e293b',
                    '& .MuiSelect-icon': { color: '#1e293b' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 0, 0, 0.2)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 0, 0, 0.4)' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3b82f6' }
                  }}
                >
                  <MenuItem value={15}>Últimos 15</MenuItem>
                  <MenuItem value={50}>Últimos 50</MenuItem>
                  <MenuItem value={100}>Últimos 100</MenuItem>
                  <MenuItem value={-1}>Todas</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
            Revisa el estado de los reportes de strikes que has enviado. Solo administración puede aprobar o rechazar.
          </Typography>
        </Box>
        
        <Box sx={{ p: 4 }}>
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress />
              <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
                Cargando reportes de strikes...
              </Typography>
            </Box>
          ) : strikeReports.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Avatar sx={{ 
                width: 80, 
                height: 80, 
                bgcolor: themeMode === 'dark' ? '#64748b' : '#e2e8f0', 
                mx: 'auto', 
                mb: 3 
              }}>
                <WarningIcon sx={{ fontSize: 40, color: themeMode === 'dark' ? '#94a3b8' : '#64748b' }} />
              </Avatar>
              <Typography variant="h5" sx={{ 
                fontWeight: 600, 
                mb: 1,
                color: themeMode === 'dark' ? '#ffffff' : '#1e293b'
              }}>
                No has enviado reportes de strikes aún
              </Typography>
              <Typography variant="body1" sx={{ 
                mb: 3,
                color: themeMode === 'dark' ? '#cbd5e1' : '#64748b'
              }}>
                Los reportes de strikes aparecerán aquí una vez que los envíes desde las evaluaciones de estudiantes
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {strikeReports.slice(0, showLimit === -1 ? undefined : showLimit).map((strike) => (
                <Card key={strike.id} sx={{ 
                  border: themeMode === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
                  bgcolor: themeMode === 'dark' ? '#1e293b' : 'white',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: themeMode === 'dark' 
                      ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
                      : '0 4px 20px rgba(0, 0, 0, 0.1)',
                    transform: 'translateY(-2px)'
                  }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                          {strike.student_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          {strike.student_email || 'No disponible'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          <strong>Proyecto:</strong> {strike.project_title}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          <strong>Motivo:</strong> {strike.reason}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Reportado el {new Date(strike.created_at).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                        <Chip
                          label={strike.status === 'pending' ? 'Pendiente' : 
                                 strike.status === 'approved' ? 'Aceptado' : 'Rechazado'}
                          color={strike.status === 'pending' ? 'warning' : 
                                 strike.status === 'approved' ? 'success' : 'error'}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                        {strike.status === 'pending' && (
                          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            En revisión por administración
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    
                    {/* Botones de acción */}
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                      <Button 
                        size="small" 
                        startIcon={<PersonIcon />}
                        variant="outlined"
                        onClick={() => handleViewProfile(strike)}
                        sx={{
                          color: themeMode === 'dark' ? '#60a5fa' : '#1976d2',
                          borderColor: themeMode === 'dark' ? '#60a5fa' : '#1976d2',
                          '&:hover': {
                            borderColor: themeMode === 'dark' ? '#3b82f6' : '#1565c0',
                            backgroundColor: themeMode === 'dark' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(25, 118, 210, 0.1)'
                          }
                        }}
                      >
                        Ver Perfil
                      </Button>
                      <Button 
                        size="small" 
                        startIcon={<WorkIcon />}
                        variant="outlined"
                        onClick={() => handleViewProjectDetails(strike)}
                        sx={{
                          color: themeMode === 'dark' ? '#10b981' : '#388e3c',
                          borderColor: themeMode === 'dark' ? '#10b981' : '#388e3c',
                          '&:hover': {
                            borderColor: themeMode === 'dark' ? '#059669' : '#2e7d32',
                            backgroundColor: themeMode === 'dark' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(56, 142, 60, 0.1)'
                          }
                        }}
                      >
                        Ver Proyecto
                      </Button>
                      <Button 
                        size="small" 
                        startIcon={<VisibilityIcon />}
                        variant="outlined"
                        onClick={() => handleViewStrikeDetails(strike)}
                        sx={{
                          color: themeMode === 'dark' ? '#f59e0b' : '#f97316',
                          borderColor: themeMode === 'dark' ? '#f59e0b' : '#f97316',
                          '&:hover': {
                            borderColor: themeMode === 'dark' ? '#d97706' : '#ea580c',
                            backgroundColor: themeMode === 'dark' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(249, 115, 22, 0.1)'
                          }
                        }}
                      >
                        Ver Detalles
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      </Card>

      {/* Modal de perfil del estudiante */}
      <Dialog
        open={showProfileDialog}
        onClose={() => setShowProfileDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
            color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
            borderRadius: 3,
            boxShadow: themeMode === 'dark' 
              ? '0 20px 40px rgba(0,0,0,0.5)' 
              : '0 20px 40px rgba(0,0,0,0.15)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: themeMode === 'dark' 
            ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' 
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontWeight: 600,
          borderRadius: '12px 12px 0 0'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <PersonIcon sx={{ fontSize: 28, color: 'white' }} />
            <Typography variant="h6">Perfil del Estudiante</Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ 
          mt: 2,
          bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
          color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
        }}>
          {profileLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : profileError ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="error">
                Error al cargar el perfil: {profileError}
              </Typography>
            </Box>
          ) : studentProfile ? (
            <Box>
              {/* Información básica */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                  Información Básica
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Nombre:</strong> {studentProfile.user_data?.full_name || 'No disponible'}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Email:</strong> {studentProfile.user_data?.email || 'No disponible'}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Teléfono:</strong> {studentProfile.user_data?.phone || 'No disponible'}
                </Typography>
              </Box>

              {/* Información personal */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                  Información Personal
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Fecha de Nacimiento:</strong> {studentProfile.user_data?.birthdate || 'No disponible'}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Género:</strong> {studentProfile.user_data?.gender || 'No disponible'}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Carrera:</strong> {studentProfile.student?.career || 'No disponible'}
                </Typography>

              </Box>

              {/* Información académica */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                  Información Académica
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Universidad:</strong> {studentProfile.student?.university || 'No disponible'}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Nivel Educativo:</strong> {studentProfile.student?.education_level || 'No disponible'}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Semestre:</strong> {studentProfile.student?.semester || 'No disponible'}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Estado:</strong> {studentProfile.student?.status || 'No disponible'}
                </Typography>
              </Box>

              {/* Habilidades y experiencia */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                  Habilidades y Experiencia
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Habilidades:</strong> {studentProfile.student?.skills?.length > 0 ? studentProfile.student.skills.join(', ') : 'No hay habilidades registradas'}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Idiomas:</strong> {studentProfile.student?.languages?.length > 0 ? studentProfile.student.languages.join(', ') : 'No hay idiomas registrados'}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Área de Interés:</strong> {studentProfile.student?.area || 'No especificado'}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Modalidad:</strong> {studentProfile.student?.availability || 'No especificado'}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Experiencia Previa:</strong> {studentProfile.student?.experience_years || 0} años
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Horas Semanales:</strong> {studentProfile.student?.hours_per_week || 'No disponible'}
                </Typography>
              </Box>

              {/* Carta de presentación */}
              {studentProfile.user_data?.bio && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                    Carta de Presentación
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    p: 2, 
                    bgcolor: themeMode === 'dark' ? '#334155' : '#f8fafc',
                    borderRadius: 2,
                    fontStyle: 'italic'
                  }}>
                    {studentProfile.user_data.bio}
                  </Typography>
                </Box>
              )}

              {/* Enlaces Profesionales */}
              {(studentProfile.student?.linkedin_url || studentProfile.student?.github_url || studentProfile.student?.portfolio_url) && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                    Enlaces Profesionales
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {studentProfile.student?.linkedin_url && (
                      <Typography variant="body2">
                        <strong>LinkedIn:</strong> 
                        <a href={studentProfile.student.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ color: '#0077b5', textDecoration: 'underline', marginLeft: 8 }}>
                          Ver perfil
                        </a>
                      </Typography>
                    )}
                    {studentProfile.student?.github_url && (
                      <Typography variant="body2">
                        <strong>GitHub:</strong> 
                        <a href={studentProfile.student.github_url} target="_blank" rel="noopener noreferrer" style={{ color: '#333', textDecoration: 'underline', marginLeft: 8 }}>
                          Ver repositorio
                        </a>
                      </Typography>
                    )}
                    {studentProfile.student?.portfolio_url && (
                      <Typography variant="body2">
                        <strong>Portafolio:</strong> 
                        <a href={studentProfile.student.portfolio_url} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', textDecoration: 'underline', marginLeft: 8 }}>
                          Ver portafolio
                        </a>
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}

              {/* Documentos */}
              {(studentProfile.student?.cv_link || studentProfile.student?.certificado_link) && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                    Documentos
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {studentProfile.student?.cv_link && (
                      <Typography variant="body2">
                        <strong>CV:</strong> 
                        <a href={studentProfile.student.cv_link} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', textDecoration: 'underline', marginLeft: 8 }}>
                          Ver CV
                        </a>
                      </Typography>
                    )}
                    {studentProfile.student?.certificado_link && (
                      <Typography variant="body2">
                        <strong>Certificado:</strong> 
                        <a href={studentProfile.student.certificado_link} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', textDecoration: 'underline', marginLeft: 8 }}>
                          Ver certificado
                        </a>
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">
                No se pudo cargar el perfil del estudiante
              </Typography>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 3, 
          pt: 0,
          bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
          borderTop: themeMode === 'dark' ? '1px solid #334155' : '1px solid #e0e0e0'
        }}>
          <Button 
            onClick={() => setShowProfileDialog(false)}
            variant="contained"
            sx={{
              background: themeMode === 'dark' 
                ? 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)' 
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: themeMode === 'dark' 
                  ? 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)' 
                  : 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              }
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de detalles del proyecto */}
      <ProjectDetailsModal
        open={projectDetailsModalOpen}
        onClose={() => setProjectDetailsModalOpen(false)}
        project={selectedProjectForDetails}
      />

      {/* Modal de detalles del strike */}
      <Dialog
        open={strikeDetailsModalOpen}
        onClose={() => setStrikeDetailsModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
            color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
            borderRadius: 3,
            boxShadow: themeMode === 'dark' 
              ? '0 20px 40px rgba(0,0,0,0.5)' 
              : '0 20px 40px rgba(0,0,0,0.15)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: themeMode === 'dark' 
            ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' 
            : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          color: 'white',
          fontWeight: 600,
          borderRadius: '12px 12px 0 0'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <WarningIcon sx={{ fontSize: 28, color: 'white' }} />
            <Typography variant="h6">Detalles del Strike</Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ 
          mt: 2,
          bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
          color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
        }}>
          {selectedStrikeForDetails && (
            <Box>
              
              
                             {/* Información del estudiante */}
               <Box sx={{ mb: 3 }}>
                 <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                   Estudiante Reportado
                 </Typography>
                 <Typography variant="body1" sx={{ mb: 1 }}>
                   <strong>Nombre:</strong> {selectedStrikeForDetails.student_name}
                 </Typography>
                 <Typography variant="body1" sx={{ mb: 1 }}>
                   <strong>Email:</strong> {selectedStrikeForDetails.student_email || 'No disponible'}
                 </Typography>
               </Box>

              {/* Información del proyecto */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                  Proyecto Relacionado
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Título:</strong> {selectedStrikeForDetails.project_title}
                </Typography>

              </Box>

              {/* Detalles del strike */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                  Motivo del Strike
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Razón:</strong> {selectedStrikeForDetails.reason}
                </Typography>
              </Box>

              {/* Estado del reporte */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                  Estado del Reporte
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Chip
                    label={selectedStrikeForDetails.status === 'pending' ? 'Pendiente' : 
                           selectedStrikeForDetails.status === 'approved' ? 'Aceptado' : 'Rechazado'}
                    color={selectedStrikeForDetails.status === 'pending' ? 'warning' : 
                           selectedStrikeForDetails.status === 'approved' ? 'success' : 'error'}
                    size="medium"
                    sx={{ fontWeight: 600 }}
                  />
                  {selectedStrikeForDetails.status === 'pending' && (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      En revisión por administración
                    </Typography>
                  )}
                </Box>
                
                {selectedStrikeForDetails.status !== 'pending' && (
                  <Box>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Revisado por:</strong> {selectedStrikeForDetails.reviewed_by_name || 'No especificado'}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Fecha de revisión:</strong> {selectedStrikeForDetails.reviewed_at ? 
                        new Date(selectedStrikeForDetails.reviewed_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'No especificada'}
                    </Typography>
                    {selectedStrikeForDetails.admin_notes && (
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Notas del administrador:</strong> {selectedStrikeForDetails.admin_notes}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>

              {/* Fechas */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                  Fechas
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Fecha de reporte:</strong> {new Date(selectedStrikeForDetails.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Última actualización:</strong> {new Date(selectedStrikeForDetails.updated_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 3, 
          pt: 0,
          bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
          borderTop: themeMode === 'dark' ? '1px solid #334155' : '1px solid #e0e0e0'
        }}>
          <Button 
            onClick={() => setStrikeDetailsModalOpen(false)}
            variant="contained"
            sx={{
              background: themeMode === 'dark' 
                ? 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)' 
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: themeMode === 'dark' 
                  ? 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)' 
                  : 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              }
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

 