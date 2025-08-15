import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Paper,
  Typography,
  Avatar,
  Chip,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Language as LanguageIcon,
  GitHub as GitHubIcon,
  LinkedIn as LinkedInIcon,
} from '@mui/icons-material';
import { useStudentProfile } from '../../hooks/useStudentProfile';
import { useTheme } from '../../contexts/ThemeContext';

interface StudentProfileModalProps {
  open: boolean;
  onClose: () => void;
  studentProfile: any; // Cambiado para recibir el perfil ya obtenido
  loading?: boolean;
  error?: string | null;
  projectTitle?: string;
  applicationStatus?: string;
  coverLetter?: string;
  onStatusChange?: (newStatus: string) => void;
  updatingStatus?: boolean;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  open,
  onClose,
  studentProfile,
  loading: profileLoading = false,
  error: profileError = null,
  projectTitle,
  applicationStatus,
  coverLetter,
  onStatusChange,
  updatingStatus = false,
}) => {
  const { themeMode } = useTheme();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'success';
      case 'rejected': return 'error';
      case 'interviewed': return 'info';
      case 'reviewing': return 'warning';
      default: return 'warning';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'reviewing': return 'En Revisión';
      case 'accepted': return 'Aceptada';
      case 'rejected': return 'Rechazada';
      case 'interviewed': return 'Entrevistada';
      case 'withdrawn': return 'Retirada';
      case 'completed': return 'Completada';
      default: return status;
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
          borderRadius: 3,
          boxShadow: themeMode === 'dark' ? '0 20px 60px rgba(0,0,0,0.8)' : '0 20px 60px rgba(0,0,0,0.15)',
          border: themeMode === 'dark' ? '1px solid #475569' : '1px solid #e0e0e0'
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: themeMode === 'dark' ? '#334155' : 'primary.main', 
        color: 'white',
        fontWeight: 600,
        borderBottom: themeMode === 'dark' ? '1px solid #475569' : 'none'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <PersonIcon sx={{ fontSize: 28 }} />
          Perfil Completo del Estudiante
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ 
        p: 0, 
        bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          bgcolor: themeMode === 'dark' ? '#334155' : '#f1f5f9',
        },
        '&::-webkit-scrollbar-thumb': {
          bgcolor: themeMode === 'dark' ? '#475569' : '#cbd5e1',
          borderRadius: '4px',
        },
      }}>
        {studentProfile ? (
          <>
            {/* Indicador de carga del perfil */}
            {profileLoading && (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                p: 4,
                bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff'
              }}>
                <Box sx={{ textAlign: 'center' }}>
                  <CircularProgress size={40} sx={{ mb: 2 }} />
                  <Typography variant="body1" sx={{ 
                    color: themeMode === 'dark' ? '#cbd5e1' : '#64748b' 
                  }}>
                    Cargando perfil del estudiante...
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Error al cargar el perfil */}
            {profileError && !profileLoading && (
              <Box sx={{ 
                p: 3, 
                bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff' 
              }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Error al cargar el perfil
                  </Typography>
                  <Typography variant="body2">
                    {profileError}
                  </Typography>
                </Alert>
                <Button 
                  variant="outlined" 
                  onClick={handleClose}
                  sx={{ mr: 1 }}
                >
                  Cerrar
                </Button>
                <Button 
                  variant="text" 
                  onClick={handleClose}
                >
                  Cerrar
                </Button>
              </Box>
            )}

            {/* Contenido del perfil cuando está cargado */}
            {!profileLoading && !profileError && studentProfile && (
              <Box sx={{ p: 3 }}>
                
                {/* Header con información principal */}
                <Paper sx={{ 
                  p: 3, 
                  mb: 3, 
                  borderRadius: 3, 
                  bgcolor: themeMode === 'dark' ? '#334155' : '#f8f9fa',
                  border: themeMode === 'dark' ? '1px solid #475569' : '1px solid #e0e0e0'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ 
                      width: 80, 
                      height: 80, 
                      mr: 3, 
                      bgcolor: 'primary.main', 
                      boxShadow: 3,
                      border: themeMode === 'dark' ? '3px solid #60a5fa' : '3px solid #1976d2'
                    }}>
                      <PersonIcon sx={{ fontSize: 40 }} />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h4" fontWeight={700} sx={{ 
                        color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                        mb: 1
                      }}>
                        {studentProfile.user_data?.full_name || 'Estudiante'}
                      </Typography>
                      <Typography variant="h6" sx={{ 
                        color: themeMode === 'dark' ? '#60a5fa' : 'primary.main',
                        mb: 1,
                        fontWeight: 600
                      }}>
                        {studentProfile.user_data?.email || 'Email no disponible'}
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        color: themeMode === 'dark' ? '#cbd5e1' : '#64748b',
                        mb: 1
                      }}>
                        {studentProfile.user_data?.phone || studentProfile.perfil_detallado?.telefono || 'Teléfono no disponible'}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        {projectTitle && (
                          <Chip 
                            label={`Proyecto: ${projectTitle}`}
                            color="primary"
                            variant="outlined"
                            sx={{ 
                              borderColor: themeMode === 'dark' ? '#60a5fa' : 'primary.main',
                              color: themeMode === 'dark' ? '#60a5fa' : 'primary.main'
                            }}
                          />
                        )}
                        {applicationStatus && (
                          <Chip 
                            label={`Estado: ${getStatusLabel(applicationStatus)}`}
                            color={getStatusColor(applicationStatus) as any}
                            sx={{ fontWeight: 600 }}
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Paper>

                {/* Información personal */}
                <Paper sx={{ 
                  p: 3, 
                  mb: 3, 
                  borderRadius: 3, 
                  bgcolor: themeMode === 'dark' ? '#334155' : '#f8f9fa',
                  border: themeMode === 'dark' ? '1px solid #475569' : '1px solid #e0e0e0'
                }}>
                  <Typography variant="h6" fontWeight={600} sx={{ 
                    color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <PersonIcon sx={{ fontSize: 20 }} />
                    Información Personal
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
                    <Box>
                      <Typography variant="body2" sx={{ 
                        color: themeMode === 'dark' ? '#94a3b8' : '#64748b',
                        mb: 1,
                        fontWeight: 500
                      }}>
                        Fecha de Nacimiento:
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                        fontWeight: 600
                      }}>
                        {studentProfile.perfil_detallado?.fecha_nacimiento || 'No disponible'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ 
                        color: themeMode === 'dark' ? '#94a3b8' : '#64748b',
                        mb: 1,
                        fontWeight: 500
                      }}>
                        Género:
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                        fontWeight: 600
                      }}>
                        {studentProfile.perfil_detallado?.genero || 'No disponible'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ 
                        color: themeMode === 'dark' ? '#94a3b8' : '#64748b',
                        mb: 1,
                        fontWeight: 500
                      }}>
                        Carrera:
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                        fontWeight: 600
                      }}>
                        {studentProfile.student?.career || 'No disponible'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" sx={{ 
                        color: themeMode === 'dark' ? '#94a3b8' : '#64748b',
                        mb: 1,
                        fontWeight: 500
                      }}>
                        Universidad:
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                        fontWeight: 600
                      }}>
                        {studentProfile.student?.university || 'No disponible'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ 
                        color: themeMode === 'dark' ? '#94a3b8' : '#64748b',
                        mb: 1,
                        fontWeight: 500
                      }}>
                        Nivel Educativo:
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                        fontWeight: 600
                      }}>
                        {studentProfile.student?.education_level || 'No disponible'}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>

                {/* Habilidades básicas */}
                <Paper sx={{ 
                  p: 3, 
                  mb: 3, 
                  borderRadius: 3, 
                  bgcolor: themeMode === 'dark' ? '#334155' : '#f8f9fa',
                  border: themeMode === 'dark' ? '1px solid #475569' : '1px solid #e0e0e0'
                }}>
                  <Typography variant="h6" fontWeight={600} sx={{ 
                    color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <AssignmentIcon sx={{ fontSize: 20 }} />
                    Habilidades Básicas
                  </Typography>
                  
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
                    <Box>
                      <Typography variant="body2" sx={{ 
                        color: themeMode === 'dark' ? '#94a3b8' : '#64748b',
                        mb: 1,
                        fontWeight: 500
                      }}>
                        Habilidades:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {studentProfile.student?.skills && Array.isArray(studentProfile.student.skills) && studentProfile.student.skills.length > 0 ? (
                          studentProfile.student.skills.map((skill: string, index: number) => (
                            <Chip 
                              key={index} 
                              label={skill} 
                              color="primary" 
                              variant="outlined"
                              size="small"
                              sx={{ 
                                borderColor: themeMode === 'dark' ? '#60a5fa' : 'primary.main',
                                color: themeMode === 'dark' ? '#60a5fa' : 'primary.main',
                                fontWeight: 600
                              }}
                            />
                          ))
                        ) : (
                          <Typography variant="body2" sx={{ 
                            color: themeMode === 'dark' ? '#94a3b8' : '#64748b',
                            fontStyle: 'italic'
                          }}>
                            No hay habilidades registradas
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    

                  </Box>
                  
                  <Box sx={{ mt: 3, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
                    <Box>
                      <Typography variant="body2" sx={{ 
                        color: themeMode === 'dark' ? '#94a3b8' : '#64748b',
                        mb: 1,
                        fontWeight: 500
                      }}>
                        Área de Interés:
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                        fontWeight: 600
                      }}>
                        {studentProfile.student?.area || 'No especificado'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ 
                        color: themeMode === 'dark' ? '#94a3b8' : '#64748b',
                        mb: 1,
                        fontWeight: 500
                      }}>
                        Modalidad:
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                        fontWeight: 600
                      }}>
                        {studentProfile.student?.availability || 'No especificado'}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>

                                 {/* Información académica básica */}
                 <Paper sx={{ 
                   p: 3, 
                   mb: 3, 
                   borderRadius: 3, 
                   bgcolor: themeMode === 'dark' ? '#334155' : '#f8f9fa',
                   border: themeMode === 'dark' ? '1px solid #475569' : '1px solid #e0e0e0'
                 }}>
                   <Typography variant="h6" fontWeight={600} sx={{ 
                     color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                     mb: 2,
                     display: 'flex',
                     alignItems: 'center',
                     gap: 1
                   }}>
                     <AssignmentIcon sx={{ fontSize: 20 }} />
                     Información Académica
                   </Typography>
                   
                   
                   {/* Enlaces Profesionales */}
                   <Box sx={{ mt: 3 }}>
                     <Typography variant="h6" fontWeight={600} sx={{ 
                       color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                       mb: 2,
                       display: 'flex',
                       alignItems: 'center',
                       gap: 1
                     }}>
                       <GitHubIcon sx={{ fontSize: 20 }} />
                       Enlaces Profesionales
                     </Typography>
                     <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
                       {studentProfile.student?.linkedin_url && (
                         <Box>
                           <Typography variant="body2" sx={{ 
                             color: themeMode === 'dark' ? '#94a3b8' : '#64748b',
                             mb: 1,
                             fontWeight: 500
                           }}>
                             LinkedIn:
                           </Typography>
                           <Button
                             variant="outlined"
                             size="small"
                             href={studentProfile.student.linkedin_url}
                             target="_blank"
                             rel="noopener noreferrer"
                             startIcon={<LinkedInIcon />}
                             sx={{ 
                               borderColor: themeMode === 'dark' ? '#0ea5e9' : '#0ea5e9',
                               color: themeMode === 'dark' ? '#0ea5e9' : '#0ea5e9',
                               '&:hover': {
                                 borderColor: themeMode === 'dark' ? '#0284c7' : '#0284c7',
                                 bgcolor: themeMode === 'dark' ? 'rgba(14, 165, 233, 0.1)' : 'rgba(14, 165, 233, 0.1)'
                               }
                             }}
                           >
                             Ver perfil
                           </Button>
                         </Box>
                       )}
                       
                       {studentProfile.student?.github_url && (
                         <Box>
                           <Typography variant="body2" sx={{ 
                             color: themeMode === 'dark' ? '#94a3b8' : '#64748b',
                             mb: 1,
                             fontWeight: 500
                           }}>
                             GitHub:
                           </Typography>
                           <Button
                             variant="outlined"
                             size="small"
                             href={studentProfile.student.github_url}
                             target="_blank"
                             rel="noopener noreferrer"
                             startIcon={<GitHubIcon />}
                             sx={{ 
                               borderColor: themeMode === 'dark' ? '#475569' : '#475569',
                               color: themeMode === 'dark' ? '#475569' : '#475569',
                               '&:hover': {
                                 borderColor: themeMode === 'dark' ? '#64748b' : '#64748b',
                                 bgcolor: themeMode === 'dark' ? 'rgba(71, 85, 105, 0.1)' : 'rgba(71, 85, 105, 0.1)'
                               }
                             }}
                           >
                             Ver repositorio
                           </Button>
                         </Box>
                       )}
                       
                       {studentProfile.student?.portfolio_url && (
                         <Box>
                           <Typography variant="body2" sx={{ 
                             color: themeMode === 'dark' ? '#94a3b8' : '#64748b',
                             mb: 1,
                             fontWeight: 500
                           }}>
                             Portafolio:
                           </Typography>
                           <Button
                             variant="outlined"
                             size="small"
                             href={studentProfile.student.portfolio_url}
                             target="_blank"
                             rel="noopener noreferrer"
                             sx={{ 
                               borderColor: themeMode === 'dark' ? '#8b5cf6' : '#8b5cf6',
                               color: themeMode === 'dark' ? '#8b5cf6' : '#8b5cf6',
                               '&:hover': {
                                 borderColor: themeMode === 'dark' ? '#7c3aed' : '#7c3aed',
                                 bgcolor: themeMode === 'dark' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.1)'
                               }
                             }}
                           >
                             Ver portafolio
                           </Button>
                         </Box>
                       )}
                     </Box>
                   </Box>
                   
                   {/* Documentos */}
                   <Box sx={{ mt: 3 }}>
                     <Typography variant="h6" fontWeight={600} sx={{ 
                       color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                       mb: 2,
                       display: 'flex',
                       alignItems: 'center',
                       gap: 1
                     }}>
                       <AssignmentIcon sx={{ fontSize: 20 }} />
                       Documentos
                     </Typography>
                     <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
                       {studentProfile.student?.cv_link && (
                         <Box>
                           <Typography variant="body2" sx={{ 
                             color: themeMode === 'dark' ? '#94a3b8' : '#64748b',
                             mb: 1,
                             fontWeight: 500
                           }}>
                             CV:
                           </Typography>
                           <Button
                             variant="outlined"
                             size="small"
                             href={studentProfile.student.cv_link}
                             target="_blank"
                             rel="noopener noreferrer"
                             sx={{ 
                               borderColor: themeMode === 'dark' ? '#059669' : '#059669',
                               color: themeMode === 'dark' ? '#059669' : '#059669',
                               '&:hover': {
                                 borderColor: themeMode === 'dark' ? '#047857' : '#047857',
                                 bgcolor: themeMode === 'dark' ? 'rgba(5, 150, 105, 0.1)' : 'rgba(5, 150, 105, 0.1)'
                               }
                             }}
                           >
                             Ver CV
                           </Button>
                         </Box>
                       )}
                       
                       {studentProfile.student?.certificado_link && (
                         <Box>
                           <Typography variant="body2" sx={{ 
                             color: themeMode === 'dark' ? '#94a3b8' : '#64748b',
                             mb: 1,
                             fontWeight: 500
                           }}>
                             Certificado:
                           </Typography>
                           <Button
                             variant="outlined"
                             size="small"
                             href={studentProfile.student.certificado_link}
                             target="_blank"
                             rel="noopener noreferrer"
                             sx={{ 
                               borderColor: themeMode === 'dark' ? '#dc2626' : '#dc2626',
                               color: themeMode === 'dark' ? '#dc2626' : '#dc2626',
                               '&:hover': {
                                 borderColor: themeMode === 'dark' ? '#b91c1c' : '#b91c1c',
                                 bgcolor: themeMode === 'dark' ? 'rgba(220, 38, 38, 0.1)' : 'rgba(220, 38, 38, 0.1)'
                               }
                             }}
                           >
                             Ver certificado
                           </Button>
                         </Box>
                       )}
                     </Box>
                   </Box>
                 </Paper>

                  {/* Carta de Presentación - ELIMINADA TEMPORALMENTE */}
                  {/* {(() => {
                    console.log('🔍 [StudentProfileModal] coverLetter recibido:', coverLetter);
                    console.log('🔍 [StudentProfileModal] coverLetter.trim():', coverLetter?.trim());
                    console.log('🔍 [StudentProfileModal] Condición cumplida:', coverLetter && coverLetter.trim() !== '');
                    return coverLetter && coverLetter.trim() !== '';
                  })() && (
                    <Paper sx={{ 
                      p: 3, 
                      mb: 3, 
                      borderRadius: 3, 
                      bgcolor: themeMode === 'dark' ? '#334155' : '#f8f9fa',
                      border: themeMode === 'dark' ? '1px solid #475569' : '1px solid #e0e0e0'
                    }}>
                      <Typography variant="h6" fontWeight={600} sx={{ 
                        color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <AssignmentIcon sx={{ fontSize: 20 }} />
                        Carta de Presentación
                      </Typography>
                      <Box sx={{ 
                        p: 3, 
                        bgcolor: themeMode === 'dark' ? '#475569' : '#e2e8f0', 
                        borderRadius: 2,
                        border: themeMode === 'dark' ? '1px solid #64748b' : '1px solid #cbd5e1'
                      }}>
                        <Typography variant="body1" sx={{ 
                          color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                          lineHeight: 1.6
                        }}>
                          {coverLetter}
                        </Typography>
                      </Box>
                    </Paper>
                  )} */}
              </Box>
            )}
          </>
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" sx={{ 
              color: themeMode === 'dark' ? '#cbd5e1' : '#64748b' 
            }}>
              No se ha seleccionado ningún estudiante
            </Typography>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ 
        p: 3, 
        bgcolor: themeMode === 'dark' ? '#334155' : '#f5f5f5', 
        gap: 2,
        borderTop: themeMode === 'dark' ? '1px solid #475569' : '1px solid #e0e0e0'
      }}>
        <Button 
          onClick={handleClose}
          variant="outlined"
          sx={{ 
            borderRadius: 2, 
            px: 3,
            fontWeight: 600,
            borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
            color: themeMode === 'dark' ? '#cbd5e1' : '#475569',
            '&:hover': {
              borderColor: themeMode === 'dark' ? '#60a5fa' : 'primary.main',
              bgcolor: themeMode === 'dark' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(25, 118, 210, 0.1)'
            }
          }}
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StudentProfileModal;
