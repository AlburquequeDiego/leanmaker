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
} from '@mui/material';
import {
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  Security as SecurityIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { useTheme } from '../../../contexts/ThemeContext';
import { apiService } from '../../../services/api.service';

export const CompanyStrikes: React.FC = () => {
  const { themeMode } = useTheme();
  const [strikeReports, setStrikeReports] = useState<any[]>([]);
  const [showLimit, setShowLimit] = useState(15);
  const [loading, setLoading] = useState(true);

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
      setStrikeReports((response as any).results || []);
    } catch (error) {
      console.error('Error cargando reportes de strikes:', error);
      setStrikeReports([]);
    } finally {
      setLoading(false);
    }
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
                          {strike.student_email}
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
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      </Card>
    </Box>
  );
};

 