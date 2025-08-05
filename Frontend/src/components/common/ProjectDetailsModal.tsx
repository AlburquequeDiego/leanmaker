import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Chip,
  Paper,
  Avatar,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  Schedule as ScheduleIcon,
  AccessTime as AccessTimeIcon,
  Group as GroupIcon,
  TrendingUp as TrendingUpIcon,
  Science as ScienceIcon,
  LocationOn as LocationIcon,
  Assignment as AssignmentIcon,
  Flag as FlagIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  PlayArrow as PlayArrowIcon,
  Publish as PublishIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';

interface ProjectDetailsModalProps {
  open: boolean;
  onClose: () => void;
  project: any;
  loading?: boolean;
  showStudents?: boolean;
  userRole?: 'student' | 'company' | 'admin';
}

const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({
  open,
  onClose,
  project,
  loading = false,
  showStudents = false,
  userRole = 'student'
}) => {
  if (!project) return null;

  // Debug: Log project data to see what fields are available
  console.log('🔍 [ProjectDetailsModal] Project data:', project);
  console.log('🔍 [ProjectDetailsModal] trl_level:', project.trl_level);
  console.log('🔍 [ProjectDetailsModal] trl object:', project.trl);
  console.log('🔍 [ProjectDetailsModal] userRole:', userRole);

  // Get TRL level from either trl_level or trl.level
  const trlLevel = project.trl_level || (project.trl && project.trl.level) || 1;

  const getStatusConfig = (status: string) => {
    const configs = {
      'published': {
        label: 'Publicado',
        color: '#1976d2',
        icon: <PublishIcon fontSize="small" />,
        bgColor: '#e3f2fd'
      },
      'active': {
        label: 'Activo',
        color: '#388e3c',
        icon: <PlayArrowIcon fontSize="small" />,
        bgColor: '#e8f5e8'
      },
      'completed': {
        label: 'Completado',
        color: '#fbc02d',
        icon: <CheckCircleIcon fontSize="small" />,
        bgColor: '#fff8e1'
      },
      'deleted': {
        label: 'Eliminado',
        color: '#d32f2f',
        icon: <DeleteIcon fontSize="small" />,
        bgColor: '#ffebee'
      }
    };
    return configs[status as keyof typeof configs] || configs['published'];
  };

  const translateModality = (modality: string) => {
    const translations = {
      'remote': 'Remoto',
      'onsite': 'Presencial',
      'hybrid': 'Híbrido'
    };
    return translations[modality as keyof typeof translations] || modality;
  };

  const getTrlDescription = (trlLevel: number) => {
    const descriptions = [
      'El proyecto está en fase de idea inicial. Aún no hay desarrollo previo y se está definiendo qué se quiere lograr.',
      'El proyecto tiene una definición clara de lo que se quiere lograr y se conocen los antecedentes del problema a resolver.',
      'Se han realizado pruebas iniciales y validaciones de concepto. Algunas partes del proyecto ya han sido evaluadas por separado.',
      'Existe un prototipo básico que ha sido probado en condiciones controladas y simples.',
      'Existe un prototipo que ha sido probado en condiciones similares a las reales donde funcionará.',
      'El prototipo ha sido probado en un entorno real mediante un piloto o prueba inicial.',
      'El proyecto ha sido probado en condiciones reales durante un tiempo prolongado, demostrando su funcionamiento.',
      'El proyecto está validado tanto técnicamente como comercialmente, listo para su implementación.',
      'El proyecto está completamente desarrollado y disponible para ser utilizado por la sociedad.'
    ];
    return descriptions[trlLevel - 1] || 'Estado no definido';
  };

  const getProjectStatusForStudent = (trlLevel: number) => {
    const statusMap = {
      1: 'Idea Inicial',
      2: 'Concepto Definido', 
      3: 'Validación Inicial',
      4: 'Prototipo Básico',
      5: 'Prototipo Avanzado',
      6: 'Prueba Piloto',
      7: 'Validación Real',
      8: 'Listo para Implementar',
      9: 'Completado'
    };
    return statusMap[trlLevel as keyof typeof statusMap] || 'Estado no definido';
  };

  const getProjectStatusDescriptionForStudent = (trlLevel: number) => {
    const descriptions = {
      1: 'El proyecto está en fase de idea inicial. Es una oportunidad para participar desde el comienzo y ayudar a definir la dirección del proyecto.',
      2: 'El proyecto tiene una definición clara. Es ideal para estudiantes que quieren trabajar en un proyecto bien estructurado.',
      3: 'Se están realizando pruebas iniciales. Perfecto para estudiantes interesados en investigación y validación.',
      4: 'Existe un prototipo básico. Excelente para estudiantes que quieren trabajar con tecnología existente.',
      5: 'El prototipo está avanzado. Ideal para estudiantes con experiencia técnica.',
      6: 'El proyecto está en fase de prueba piloto. Oportunidad única para trabajar en un entorno real.',
      7: 'El proyecto ha sido validado en condiciones reales. Proyecto maduro y estable.',
      8: 'El proyecto está listo para implementación. Experiencia en proyectos de producción.',
      9: 'Proyecto completamente desarrollado. Oportunidad de mantenimiento y mejoras.'
    };
    return descriptions[trlLevel as keyof typeof descriptions] || 'Estado del proyecto no definido.';
  };

  const statusConfig = getStatusConfig(project.status);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '90vh',
          borderRadius: 3,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 15px 30px rgba(0,0,0,0.15)'
        }
      }}
    >
      {/* Header con gradiente */}
      <Box sx={{ 
        p: 2.5, 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box sx={{ 
          position: 'absolute', 
          top: -30, 
          right: -30, 
          width: 120, 
          height: 120, 
          borderRadius: '50%', 
          background: 'rgba(255,255,255,0.1)',
          zIndex: 0
        }} />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom sx={{ 
            textShadow: '1px 1px 3px rgba(0,0,0,0.3)',
            letterSpacing: '0.3px'
          }}>
            {project.title}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', mt: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: 'rgba(255,255,255,0.2)', px: 1.5, py: 0.5, borderRadius: 1.5 }}>
              <BusinessIcon sx={{ fontSize: 16 }} />
              <Typography variant="body2" fontWeight={600}>{project.company_name || 'Empresa no especificada'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: 'rgba(255,255,255,0.2)', px: 1.5, py: 0.5, borderRadius: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {statusConfig.icon}
                <Typography variant="body2" fontWeight={600}>{statusConfig.label}</Typography>
              </Box>
            </Box>
            {project.area && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: 'rgba(255,255,255,0.2)', px: 1.5, py: 0.5, borderRadius: 1.5 }}>
                <Typography variant="body2" fontWeight={600}>
                  {typeof project.area === 'string' ? project.area : project.area.name}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Contenido principal */}
      <Box sx={{ 
        p: 2.5, 
        bgcolor: '#fafafa',
        maxHeight: 'calc(90vh - 140px)',
        overflow: 'auto',
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: '#f1f1f1',
          borderRadius: '3px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#c1c1c1',
          borderRadius: '3px',
          '&:hover': {
            background: '#a8a8a8',
          },
        },
      }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {/* Columna principal - Información del proyecto */}
            <Grid item xs={12} lg={8}>
              {/* Descripción del Proyecto */}
              <Paper sx={{ 
                p: 2, 
                mb: 2, 
                borderRadius: 2,
                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                border: '1px solid rgba(255,255,255,0.8)'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Box sx={{ 
                    p: 1, 
                    borderRadius: 1.5, 
                    bgcolor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <DescriptionIcon sx={{ fontSize: 20 }} />
                  </Box>
                  <Typography variant="h6" fontWeight={600} color="primary.main">
                    Descripción del Proyecto
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ 
                  lineHeight: 1.6, 
                  color: '#374151',
                  fontSize: '1rem'
                }}>
                  {project.description || 'Sin descripción disponible'}
                </Typography>
              </Paper>

              {/* Objetivo del Proyecto */}
              {project.objetivo && (
                <Paper sx={{ 
                  p: 2, 
                  mb: 2, 
                  borderRadius: 2,
                  background: 'linear-gradient(145deg, #e8f5e8 0%, #f0f8f0 100%)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  border: '1px solid rgba(76, 175, 80, 0.2)'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Box sx={{ 
                      p: 1, 
                      borderRadius: 1.5, 
                      bgcolor: 'success.main',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <FlagIcon sx={{ fontSize: 20 }} />
                    </Box>
                    <Typography variant="h6" fontWeight={600} color="success.main">
                      Objetivo del Proyecto
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ 
                    lineHeight: 1.6, 
                    color: '#374151',
                    fontSize: '1rem'
                  }}>
                    {project.objetivo}
                  </Typography>
                </Paper>
              )}

              {/* Requerimientos del Proyecto */}
              {project.requirements && (
                <Paper sx={{ 
                  p: 2, 
                  mb: 2, 
                  borderRadius: 2,
                  background: 'linear-gradient(145deg, #fff3e0 0%, #fef7f0 100%)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  border: '1px solid rgba(255, 152, 0, 0.2)'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Box sx={{ 
                      p: 1, 
                      borderRadius: 1.5, 
                      bgcolor: 'warning.main',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <AssignmentIcon sx={{ fontSize: 20 }} />
                    </Box>
                    <Typography variant="h6" fontWeight={600} color="warning.main">
                      Requerimientos del Proyecto
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ 
                    lineHeight: 1.6, 
                    color: '#374151',
                    fontSize: '1rem'
                  }}>
                    {project.requirements}
                  </Typography>
                </Paper>
              )}

              {/* Tipo de Actividad */}
              {project.tipo && (
                <Paper sx={{ 
                  p: 2, 
                  mb: 2, 
                  borderRadius: 2,
                  background: 'linear-gradient(145deg, #f3e5f5 0%, #faf5ff 100%)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  border: '1px solid rgba(156, 39, 176, 0.2)'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Box sx={{ 
                      p: 1, 
                      borderRadius: 1.5, 
                      bgcolor: 'secondary.main',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <AssignmentIcon sx={{ fontSize: 20 }} />
                    </Box>
                    <Typography variant="h6" fontWeight={600} color="secondary.main">
                      Tipo de Actividad
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ 
                    lineHeight: 1.6, 
                    color: '#374151',
                    fontSize: '1rem'
                  }}>
                    {project.tipo}
                  </Typography>
                </Paper>
              )}

                             {/* Estado del Proyecto - Visible para todos pero con diferente formato según el rol */}
               {trlLevel > 0 && (
                <Paper sx={{ 
                  p: 2, 
                  mb: 2, 
                  borderRadius: 2,
                  background: 'linear-gradient(145deg, #e3f2fd 0%, #f0f8ff 100%)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  border: '1px solid rgba(25, 118, 210, 0.2)'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Box sx={{ 
                      p: 1, 
                      borderRadius: 1.5, 
                      bgcolor: 'primary.main',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <ScienceIcon sx={{ fontSize: 20 }} />
                    </Box>
                    <Box>
                                             <Typography variant="h6" fontWeight={600} color="primary.main">
                         {userRole === 'admin' 
                           ? `Etapa de Desarrollo (TRL ${trlLevel})`
                           : 'Estado del Proyecto'
                         }
                       </Typography>
                       <Typography variant="body2" sx={{ color: '#1976d2', fontWeight: 600, mt: 0.5 }}>
                         {userRole === 'admin' 
                           ? getTrlDescription(trlLevel)
                           : getProjectStatusForStudent(trlLevel)
                         }
                       </Typography>
                       {userRole === 'student' && (
                         <Typography variant="body2" sx={{ color: '#374151', mt: 1, lineHeight: 1.5 }}>
                           {getProjectStatusDescriptionForStudent(trlLevel)}
                         </Typography>
                       )}
                    </Box>
                  </Box>
                </Paper>
              )}

              {/* Estudiantes participantes (solo para empresa y admin) */}
              {showStudents && project.estudiantes && (
                <Paper sx={{ 
                  p: 2, 
                  mb: 2, 
                  borderRadius: 2,
                  background: 'linear-gradient(145deg, #e8f5e8 0%, #f0f8f0 100%)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  border: '1px solid rgba(76, 175, 80, 0.2)'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Box sx={{ 
                      p: 1, 
                      borderRadius: 1.5, 
                      bgcolor: 'success.main',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <GroupIcon sx={{ fontSize: 20 }} />
                    </Box>
                    <Typography variant="h6" fontWeight={600} color="success.main">
                      Estudiantes participantes ({project.estudiantes.length})
                    </Typography>
                  </Box>
                  {project.estudiantes.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No hay estudiantes asignados a este proyecto.
                    </Typography>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {project.estudiantes.map((est: any) => (
                        <Box key={est.id} sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          p: 2, 
                          bgcolor: '#f8f9fa', 
                          borderRadius: 2,
                          border: '1px solid #e0e0e0'
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                              <PersonIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {est.nombre}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {est.email}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip 
                              label={est.status === 'accepted' ? 'Aceptado' : 
                                     est.status === 'active' ? 'Activo' : 
                                     est.status === 'completed' ? 'Completado' : est.status} 
                              color={est.status === 'active' ? 'success' : 
                                     est.status === 'completed' ? 'secondary' : 'primary'} 
                              size="small"
                              variant="outlined"
                            />
                            {est.applied_at && (
                              <Typography variant="caption" color="text.secondary">
                                Aplicó: {new Date(est.applied_at).toLocaleDateString()}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Paper>
              )}
            </Grid>

            {/* Columna lateral - Información técnica y de contacto */}
            <Grid item xs={12} lg={4}>
              <Paper sx={{ 
                p: 2, 
                borderRadius: 2,
                background: 'linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                border: '1px solid rgba(0,0,0,0.05)',
                height: 'fit-content',
                position: 'sticky',
                top: 20
              }}>
                <Typography variant="h6" fontWeight={600} gutterBottom color="primary.main" sx={{ mb: 2 }}>
                  Información del Proyecto
                </Typography>
                
                {/* Duración y Horas */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                    <ScheduleIcon sx={{ color: 'text.secondary', fontSize: 16 }} />
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Duración
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ 
                    color: '#374151', 
                    fontWeight: 500,
                    bgcolor: '#f3f4f6',
                    p: 1,
                    borderRadius: 1.5,
                    fontSize: '0.875rem'
                  }}>
                    {project.duration_weeks || 0} semanas • {project.hours_per_week || 0} horas/semana
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Horas totales: <b>{((project.duration_weeks || 0) * (project.hours_per_week || 0))}</b>
                  </Typography>
                </Box>

                {/* Modalidad */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                    <LocationIcon sx={{ color: 'text.secondary', fontSize: 16 }} />
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Modalidad
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ 
                    color: '#374151', 
                    fontWeight: 500,
                    bgcolor: '#f3f4f6',
                    p: 1,
                    borderRadius: 1.5,
                    fontSize: '0.875rem'
                  }}>
                    {translateModality(project.modality)}
                  </Typography>
                </Box>

                {/* Área del Proyecto */}
                {project.area && (
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                      <CategoryIcon sx={{ color: 'text.secondary', fontSize: 16 }} />
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Área del Proyecto
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ 
                      color: '#374151', 
                      fontWeight: 500,
                      bgcolor: '#f3f4f6',
                      p: 1,
                      borderRadius: 1.5,
                      fontSize: '0.875rem'
                    }}>
                      {typeof project.area === 'string' ? project.area : project.area.name}
                    </Typography>
                  </Box>
                )}

                {/* Responsable del Proyecto */}
                {project.encargado && (
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                      <PersonIcon sx={{ color: 'text.secondary', fontSize: 16 }} />
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Responsable del Proyecto
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ 
                      color: '#374151', 
                      fontWeight: 500,
                      bgcolor: '#f3f4f6',
                      p: 1,
                      borderRadius: 1.5,
                      fontSize: '0.875rem'
                    }}>
                      {project.encargado}
                    </Typography>
                  </Box>
                )}

                {/* Contacto de la Empresa */}
                {project.contacto && (
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                      <PhoneIcon sx={{ color: 'text.secondary', fontSize: 16 }} />
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Contacto de la Empresa
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ 
                      color: '#374151', 
                      fontWeight: 500,
                      bgcolor: '#f3f4f6',
                      p: 1,
                      borderRadius: 1.5,
                      fontSize: '0.875rem'
                    }}>
                      {project.contacto}
                    </Typography>
                  </Box>
                )}

                {/* Horas Ofrecidas */}
                {project.required_hours && (
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                      <AccessTimeIcon sx={{ color: 'text.secondary', fontSize: 16 }} />
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Horas Ofrecidas
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ 
                      color: '#374151', 
                      fontWeight: 500,
                      bgcolor: '#f3f4f6',
                      p: 1,
                      borderRadius: 1.5,
                      fontSize: '0.875rem'
                    }}>
                      {project.required_hours} horas
                    </Typography>
                  </Box>
                )}

                {/* Fecha de Inicio */}
                {project.start_date && (
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                      <CalendarIcon sx={{ color: 'text.secondary', fontSize: 16 }} />
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Fecha de Inicio
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ 
                      color: '#374151', 
                      fontWeight: 500,
                      bgcolor: '#f3f4f6',
                      p: 1,
                      borderRadius: 1.5,
                      fontSize: '0.875rem'
                    }}>
                      {new Date(project.start_date).toLocaleDateString()}
                    </Typography>
                  </Box>
                )}

                {/* Fecha Estimada de Fin */}
                {project.estimated_end_date && (
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                      <CalendarIcon sx={{ color: 'text.secondary', fontSize: 16 }} />
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Fecha Estimada de Fin
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ 
                      color: '#374151', 
                      fontWeight: 500,
                      bgcolor: '#f3f4f6',
                      p: 1,
                      borderRadius: 1.5,
                      fontSize: '0.875rem'
                    }}>
                      {new Date(project.estimated_end_date).toLocaleDateString()}
                    </Typography>
                  </Box>
                )}

                {/* Fecha de Creación */}
                {project.created_at && (
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                      <CalendarIcon sx={{ color: 'text.secondary', fontSize: 16 }} />
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Fecha de Creación
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ 
                      color: '#374151', 
                      fontWeight: 500,
                      bgcolor: '#f3f4f6',
                      p: 1,
                      borderRadius: 1.5,
                      fontSize: '0.875rem'
                    }}>
                      {new Date(project.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Typography>
                  </Box>
                )}

                {/* Chips de información adicional */}
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom color="text.primary">
                    Detalles del Proyecto
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {project.api_level && (
                      <Chip 
                        label={`API ${project.api_level}`} 
                        color="primary" 
                        size="small" 
                        icon={<TrendingUpIcon />} 
                        sx={{ fontWeight: 600 }}
                      />
                    )}
                    {project.max_students && (
                      <Chip 
                        label={`${project.current_students || 0}/${project.max_students} estudiantes`} 
                        color="success" 
                        size="small" 
                        icon={<GroupIcon />}
                        sx={{ fontWeight: 600 }}
                      />
                    )}
                    {project.is_featured && (
                      <Chip 
                        label="Destacado" 
                        color="secondary" 
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    )}
                    {project.is_urgent && (
                      <Chip 
                        label="Urgente" 
                        color="error" 
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    )}
                  </Box>
                </Box>

                {/* Botón de cerrar */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 3 }}>
                  <Button 
                    onClick={onClose} 
                    variant="outlined" 
                    color="secondary"
                    size="small"
                    sx={{ 
                      py: 1,
                      fontWeight: 600,
                      borderRadius: 1.5,
                      borderWidth: 1.5,
                      '&:hover': {
                        borderWidth: 1.5,
                        transform: 'translateY(-1px)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        transition: 'all 0.2s'
                      }
                    }}
                  >
                    Cerrar
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Box>
    </Dialog>
  );
};

export default ProjectDetailsModal; 