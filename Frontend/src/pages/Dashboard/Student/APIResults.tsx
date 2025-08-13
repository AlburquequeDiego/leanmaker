import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  History as HistoryIcon,
  Quiz as QuizIcon,
  EmojiEvents as EmojiEventsIcon,
  Psychology as PsychologyIcon,
  Code as CodeIcon,
  Star as StarIcon,
  Timeline as TimelineIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  Rocket as RocketIcon,
  Speed as SpeedIcon,
  WorkspacePremium as WorkspacePremiumIcon,
} from '@mui/icons-material';
import Snackbar from '@mui/material/Snackbar';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../../services/api.service';
import { ShowLatestFilter } from '../../../components/common/ShowLatestFilter';
import { useTheme } from '../../../contexts/ThemeContext';

interface APIResult {
  id: string;
  date: string;
  score: number;
  level: number;
  questionsAnswered: number;
  timeSpent: string;
  status: 'pending' | 'approved' | 'rejected';
  feedback?: string;
}

interface ApiLevelRequest {
  id: number;
  requested_level: number;
  current_level: number;
  status: 'pending' | 'approved' | 'rejected';
  feedback?: string;
  submitted_at: string;
  reviewed_at?: string;
}

const apiLevelDescriptions = {
  1: {
    title: 'Nivel API 1: Asesoría',
    description: 'Puedes comprender conceptos básicos y trabajar bajo supervisión directa. Hasta 20 horas de práctica.',
    capabilities: [
      'Comprender problemas simples',
      'Trabajar con supervisión constante',
      'Aplicar conocimientos básicos',
      'Seguir instrucciones detalladas',
    ],
    icon: <PsychologyIcon />,
    color: 'info' as const,
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  2: {
    title: 'Nivel API 2: Asesoría + Propuesta',
    description: 'Puedes trabajar en tareas prácticas con guía y supervisión. Hasta 40 horas de práctica.',
    capabilities: [
      'Analizar problemas con guía',
      'Implementar soluciones básicas',
      'Trabajar en equipo con supervisión',
      'Aplicar metodologías establecidas',
    ],
    icon: <CodeIcon />,
    color: 'primary' as const,
    gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
  },
  3: {
    title: 'Nivel API 3: Asesoría + Propuesta + Implementación',
    description: 'Puedes trabajar de forma independiente en proyectos complejos. Hasta 80 horas de práctica.',
    capabilities: [
      'Analizar problemas complejos',
      'Diseñar soluciones técnicas',
      'Trabajar de forma autónoma',
      'Liderar aspectos del proyecto',
    ],
    icon: <TrendingUpIcon />,
    color: 'success' as const,
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  },
  4: {
    title: 'Nivel API 4: Asesoría + Propuesta + Implementación + Upgrade',
    description: 'Puedes liderar proyectos complejos e innovar en soluciones. Hasta 160 horas de práctica.',
    capabilities: [
      'Liderar proyectos complejos',
      'Innovar en soluciones técnicas',
      'Mentorear a otros desarrolladores',
      'Optimizar y escalar sistemas',
    ],
    icon: <EmojiEventsIcon />,
    color: 'warning' as const,
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  },
};

export const APIResults = () => {
  const { themeMode } = useTheme();
  const [apiRequests, setApiRequests] = useState<ApiLevelRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentApiLevel, setCurrentApiLevel] = useState<number>(1);
  const [showLatest, setShowLatest] = useState(5);

  useEffect(() => {
    fetchApiRequests();
    fetchStudentLevel();
  }, []);

  const fetchApiRequests = async () => {
    try {
      setLoading(true);
      const data = await apiService.get('/api/students/api-level-requests/');
      setApiRequests(data.results || []);
    } catch (error) {
      console.error('Error fetching API level requests:', error);
      setError('Error al cargar las peticiones de subida de nivel API');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentLevel = async () => {
    try {
      const data = await apiService.get('/api/students/me/');
      setCurrentApiLevel(Number(data.api_level) || 1);
    } catch (error) {
      console.error('Error fetching student level:', error);
      setCurrentApiLevel(1);
    }
  };

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'info';
      case 2: return 'primary';
      case 3: return 'success';
      case 4: return 'warning';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Aprobado';
      case 'rejected': return 'Rechazado';
      case 'pending': return 'Pendiente';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircleIcon />;
      case 'rejected': return <CancelIcon />;
      case 'pending': return <PendingIcon />;
      default: return <PendingIcon />;
    }
  };

  // Calcular estadísticas
  const totalRequests = apiRequests.length;
  const approvedRequests = apiRequests.filter(req => req.status === 'approved').length;
  const pendingRequests = apiRequests.filter(req => req.status === 'pending').length;
  const rejectedRequests = apiRequests.filter(req => req.status === 'rejected').length;

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: 400,
        bgcolor: themeMode === 'dark' ? '#0f172a' : '#f5f5f5'
      }}>
        <CircularProgress sx={{ color: themeMode === 'dark' ? '#60a5fa' : 'primary.main' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      flexGrow: 1, 
      p: 3, 
      backgroundColor: themeMode === 'dark' ? '#0f172a' : '#f5f5f5', 
      minHeight: '100vh' 
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
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
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
              <AssessmentIcon sx={{ fontSize: 32, color: 'white' }} />
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
                Resultados del Nivel API
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: 300,
                  textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                }}
              >
                Gestiona y visualiza tu progreso en el sistema de niveles API
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ 
          mb: 3,
          bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
          color: themeMode === 'dark' ? '#f1f5f9' : 'inherit'
        }}>
          {error}
        </Alert>
      )}

      {/* Estadísticas generales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
          }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <RocketIcon sx={{ fontSize: '3rem', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {currentApiLevel}
              </Typography>
              <Typography variant="body2">
                Nivel API Actual
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
            color: 'white',
            boxShadow: '0 8px 32px rgba(17, 153, 142, 0.3)'
          }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <CheckCircleIcon sx={{ fontSize: '3rem', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {approvedRequests}
              </Typography>
              <Typography variant="body2">
                Solicitudes Aprobadas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            boxShadow: '0 8px 32px rgba(240, 147, 251, 0.3)'
          }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <PendingIcon sx={{ fontSize: '3rem', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {pendingRequests}
              </Typography>
              <Typography variant="body2">
                Solicitudes Pendientes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            boxShadow: '0 8px 32px rgba(79, 172, 254, 0.3)'
          }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <HistoryIcon sx={{ fontSize: '3rem', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {totalRequests}
              </Typography>
              <Typography variant="body2">
                Total de Solicitudes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Nivel API Actual con información detallada */}
      <Card sx={{ 
        mb: 4,
        background: apiLevelDescriptions[currentApiLevel as keyof typeof apiLevelDescriptions]?.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
      }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <WorkspacePremiumIcon sx={{ fontSize: '3rem', mr: 2 }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                Nivel API {currentApiLevel}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                {apiLevelDescriptions[currentApiLevel as keyof typeof apiLevelDescriptions]?.title}
              </Typography>
            </Box>
          </Box>
          
          <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
            {apiLevelDescriptions[currentApiLevel as keyof typeof apiLevelDescriptions]?.description}
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {apiLevelDescriptions[currentApiLevel as keyof typeof apiLevelDescriptions]?.capabilities.map((capability, index) => (
              <Chip
                key={index}
                label={capability}
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.3)'
                  }
                }}
              />
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Historial de Peticiones con diseño mejorado */}
      <Card sx={{ 
        boxShadow: themeMode === 'dark' 
          ? '0 8px 30px rgba(0, 0, 0, 0.2)' 
          : '0 8px 30px rgba(0, 0, 0, 0.08)',
        borderRadius: 3,
        bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
        border: themeMode === 'dark' 
          ? '1px solid #475569'
          : '1px solid #e2e8f0',
        color: themeMode === 'dark' ? '#f1f5f9' : 'inherit',
        overflow: 'hidden'
      }}>
        {/* Header con gradiente sutil */}
        <Box sx={{
          background: themeMode === 'dark'
            ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
            : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          borderBottom: themeMode === 'dark' 
            ? '1px solid #475569'
            : '1px solid #e2e8f0',
          p: 3
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2.5,
                boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)'
              }}>
                <TimelineIcon sx={{ fontSize: 22, color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ 
                  fontWeight: 700,
                  color: themeMode === 'dark' ? '#f8fafc' : '#1e293b',
                  letterSpacing: '-0.025em',
                  mb: 0.5
                }}>
                  Historial de Solicitudes
                </Typography>
                <Typography variant="body2" sx={{
                  color: themeMode === 'dark' ? '#94a3b8' : '#64748b',
                  fontWeight: 500,
                  fontSize: '0.875rem'
                }}>
                  Revisa el estado de tus peticiones de nivel API
                </Typography>
              </Box>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="caption" sx={{
                color: themeMode === 'dark' ? '#94a3b8' : '#64748b',
                fontWeight: 500,
                display: 'block',
                mb: 0.5
              }}>
                Mostrar
              </Typography>
              <ShowLatestFilter
                value={showLatest}
                onChange={setShowLatest}
              />
            </Box>
          </Box>
        </Box>
        
        <CardContent sx={{ p: 0 }}>
          {apiRequests.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6, px: 3 }}>
              <Box sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: themeMode === 'dark' 
                  ? 'rgba(100, 116, 139, 0.1)' 
                  : 'rgba(100, 116, 139, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3
              }}>
                <QuizIcon sx={{ 
                  fontSize: 40, 
                  color: themeMode === 'dark' ? '#64748b' : '#94a3b8'
                }} />
              </Box>
              <Typography variant="h6" sx={{ 
                color: themeMode === 'dark' ? '#cbd5e1' : '#475569', 
                mb: 1,
                fontWeight: 600
              }}>
                No tienes solicitudes de subida de nivel API
              </Typography>
              <Typography variant="body2" sx={{ 
                color: themeMode === 'dark' ? '#94a3b8' : '#64748b',
                maxWidth: 400,
                mx: 'auto'
              }}>
                Cuando realices una solicitud, aparecerá aquí tu historial completo
              </Typography>
            </Box>
          ) : (
            <TableContainer sx={{ 
              borderRadius: 0,
              overflow: 'hidden'
            }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ 
                    backgroundColor: themeMode === 'dark' 
                      ? 'rgba(59, 130, 246, 0.08)' 
                      : 'rgba(59, 130, 246, 0.04)'
                  }}>
                    <TableCell sx={{ 
                      color: themeMode === 'dark' ? '#f8fafc' : '#1e293b', 
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      borderBottom: 'none',
                      py: 2.5,
                      px: 3
                    }}>Fecha</TableCell>
                    <TableCell sx={{ 
                      color: themeMode === 'dark' ? '#f8fafc' : '#1e293b', 
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      borderBottom: 'none',
                      py: 2.5,
                      px: 3
                    }}>Nivel Actual</TableCell>
                    <TableCell sx={{ 
                      color: themeMode === 'dark' ? '#f8fafc' : '#1e293b', 
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      borderBottom: 'none',
                      py: 2.5,
                      px: 3
                    }}>Nivel Solicitado</TableCell>
                    <TableCell sx={{ 
                      color: themeMode === 'dark' ? '#f8fafc' : '#1e293b', 
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      borderBottom: 'none',
                      py: 2.5,
                      px: 3
                    }}>Estado</TableCell>
                    <TableCell sx={{ 
                      color: themeMode === 'dark' ? '#f8fafc' : '#1e293b', 
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      borderBottom: 'none',
                      py: 2.5,
                      px: 3
                    }}>Feedback</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* Ordenar historial por fecha descendente (más reciente primero) */}
                  {apiRequests
                    .slice()
                    .sort((a, b) => new Date(b.submitted_at || 0).getTime() - new Date(a.submitted_at || 0).getTime())
                    .slice(0, showLatest)
                    .map((req, index) => {
                      // Si current_level es 0, mostrar currentApiLevel o '-'
                      const nivelActual = req.current_level && req.current_level > 0 && !isNaN(Number(req.current_level)) ? req.current_level : currentApiLevel;
                      const nivelSolicitado = req.requested_level && req.requested_level > 0 && !isNaN(Number(req.requested_level)) ? req.requested_level : '-';
                      let fecha = '-';
                      if (req.submitted_at) {
                        const d = new Date(req.submitted_at);
                        fecha = isNaN(d.getTime()) ? '-' : d.toLocaleDateString();
                      }
                      // Mensaje de avance si fue aprobado
                      let avance = '';
                      if (req.status === 'approved' && nivelActual !== '-' && nivelSolicitado !== '-' && nivelActual !== nivelSolicitado) {
                        avance = `¡Felicidades! Subiste de nivel ${nivelActual} a nivel ${nivelSolicitado}.`;
                      }
                      return (
                        <TableRow 
                          key={req.id}
                          sx={{ 
                            backgroundColor: index % 2 === 0 
                              ? themeMode === 'dark' ? '#1e293b' : '#ffffff' 
                              : themeMode === 'dark' ? '#334155' : '#f8fafc',
                            '&:hover': {
                              backgroundColor: themeMode === 'dark' 
                                ? 'rgba(59, 130, 246, 0.08)' 
                                : 'rgba(59, 130, 246, 0.04)'
                            },
                            transition: 'all 0.2s ease',
                            '&:last-child td': { borderBottom: 0 }
                          }}
                        >
                          <TableCell sx={{ 
                            fontWeight: 500,
                            color: themeMode === 'dark' ? '#f1f5f9' : '#374151',
                            fontSize: '0.875rem',
                            py: 2.5,
                            px: 3
                          }}>{fecha}</TableCell>
                          <TableCell sx={{ py: 2.5, px: 3 }}>
                            <Chip 
                              label={`Nivel ${nivelActual}`} 
                              color={getLevelColor(Number(nivelActual)) as any} 
                              size="small"
                              sx={{ 
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                height: 24,
                                '& .MuiChip-label': {
                                  px: 1.5
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ py: 2.5, px: 3 }}>
                            <Chip 
                              label={`Nivel ${nivelSolicitado}`} 
                              color={getLevelColor(Number(nivelSolicitado)) as any} 
                              size="small"
                              sx={{ 
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                height: 24,
                                '& .MuiChip-label': {
                                  px: 1.5
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ py: 2.5, px: 3 }}>
                            <Chip 
                              label={getStatusText(req.status)} 
                              color={getStatusColor(req.status) as any} 
                              size="small"
                              icon={getStatusIcon(req.status)}
                              sx={{ 
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                height: 24,
                                '& .MuiChip-label': {
                                  px: 1.5
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ py: 2.5, px: 3 }}>
                            <Typography variant="body2" sx={{ 
                              maxWidth: 300,
                              color: themeMode === 'dark' ? '#cbd5e1' : '#475569',
                              fontSize: '0.875rem',
                              lineHeight: 1.5
                            }}>
                              {req.feedback || avance || '-'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}; 