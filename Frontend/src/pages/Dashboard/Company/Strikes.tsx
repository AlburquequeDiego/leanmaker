import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Avatar,
  Badge,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Business as BusinessIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  Assessment as AssessmentIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useApi } from '../../../hooks/useApi';
import { adaptStrike } from '../../../utils/adapters';
import type { Strike } from '../../../types';

// Interfaz extendida para el formulario
interface StrikeFormData {
  student: string;
  project?: string;
  reason: string;
  description?: string;
  severity: 'low' | 'medium' | 'high';
}

export const CompanyStrikes: React.FC = () => {
  const api = useApi();
  const [strikeReports, setStrikeReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [cantidadPorTab, setCantidadPorTab] = useState<(number | string)[]>([5, 5, 5]);
  const [sectionCount, setSectionCount] = useState(10);

  useEffect(() => {
    loadStrikeReports();
  }, []);

  const loadStrikeReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/strikes/reports/company/');
      setStrikeReports(response.data?.results || response.results || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar reportes de strikes');
      setStrikeReports([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Aprobado';
      case 'pending':
        return 'Pendiente';
      case 'rejected':
        return 'Rechazado';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon />;
      case 'pending':
        return <ScheduleIcon />;
      case 'rejected':
        return <CancelIcon />;
      default:
        return <WarningIcon />;
    }
  };

  const filteredReports = strikeReports.filter(report => {
    if (selectedTab === 0) return true;
    if (selectedTab === 1) return report.status === 'pending';
    if (selectedTab === 2) return report.status === 'approved';
    if (selectedTab === 3) return report.status === 'rejected';
    return true;
  });

  const cantidadActual = cantidadPorTab[selectedTab];
  const reportsMostrados = cantidadActual === 'todas' ? filteredReports : filteredReports.slice(0, Number(cantidadActual));
  const reportsToShow = reportsMostrados.slice(0, sectionCount);

  const totalReports = strikeReports.length;
  const pendingReports = strikeReports.filter(r => r.status === 'pending').length;
  const approvedReports = strikeReports.filter(r => r.status === 'approved').length;
  const rejectedReports = strikeReports.filter(r => r.status === 'rejected').length;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button onClick={loadStrikeReports} variant="contained">
          Reintentar
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3, bgcolor: '#f7fafd', minHeight: '100vh' }}>
      {/* Header mejorado con icono */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar sx={{ 
            bgcolor: 'primary.main', 
            width: 56, 
            height: 56,
            boxShadow: 3
          }}>
            <SecurityIcon sx={{ fontSize: 28 }} />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Gestión de Reportes de Strikes
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Administra y revisa todos los reportes de strikes enviados a estudiantes en tus proyectos
            </Typography>
          </Box>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={totalReports > 0 ? (pendingReports / totalReports) * 100 : 0} 
          sx={{ 
            height: 4, 
            borderRadius: 2,
            bgcolor: 'rgba(255, 167, 38, 0.2)',
            '& .MuiLinearProgress-bar': {
              bgcolor: '#ffa726'
            }
          }} 
        />
      </Box>

      {/* Estadísticas mejoradas con gradientes */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        <Card sx={{ 
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          color: 'white', 
          borderRadius: 3, 
          boxShadow: 4, 
          minWidth: 220,
          transition: 'all 0.3s ease',
          '&:hover': { 
            transform: 'translateY(-6px)',
            boxShadow: 8
          }
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h3" fontWeight={700}>{totalReports}</Typography>
                <Typography variant="body1" fontWeight={600}>Total Reportes</Typography>
              </Box>
              <Avatar sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.2)', 
                width: 56, 
                height: 56 
              }}>
                <WarningIcon sx={{ fontSize: 28 }} />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ 
          background: 'linear-gradient(135deg, #ffa726 0%, #ff9800 100%)',
          color: 'white', 
          borderRadius: 3, 
          boxShadow: 4, 
          minWidth: 220,
          transition: 'all 0.3s ease',
          '&:hover': { 
            transform: 'translateY(-6px)',
            boxShadow: 8
          }
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h3" fontWeight={700}>{pendingReports}</Typography>
                <Typography variant="body1" fontWeight={600}>Pendientes</Typography>
              </Box>
              <Avatar sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.2)', 
                width: 56, 
                height: 56 
              }}>
                <ScheduleIcon sx={{ fontSize: 28 }} />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ 
          background: 'linear-gradient(135deg, #388e3c 0%, #2e7d32 100%)',
          color: 'white', 
          borderRadius: 3, 
          boxShadow: 4, 
          minWidth: 220,
          transition: 'all 0.3s ease',
          '&:hover': { 
            transform: 'translateY(-6px)',
            boxShadow: 8
          }
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h3" fontWeight={700}>{approvedReports}</Typography>
                <Typography variant="body1" fontWeight={600}>Aprobados</Typography>
              </Box>
              <Avatar sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.2)', 
                width: 56, 
                height: 56 
              }}>
                <CheckCircleIcon sx={{ fontSize: 28 }} />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ 
          background: 'linear-gradient(135deg, #e53935 0%, #d32f2f 100%)',
          color: 'white', 
          borderRadius: 3, 
          boxShadow: 4, 
          minWidth: 220,
          transition: 'all 0.3s ease',
          '&:hover': { 
            transform: 'translateY(-6px)',
            boxShadow: 8
          }
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h3" fontWeight={700}>{rejectedReports}</Typography>
                <Typography variant="body1" fontWeight={600}>Rechazados</Typography>
              </Box>
              <Avatar sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.2)', 
                width: 56, 
                height: 56 
              }}>
                <CancelIcon sx={{ fontSize: 28 }} />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs mejorados con mejor diseño */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3, boxShadow: 3, bgcolor: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <FilterIcon color="primary" />
          <Typography variant="h6" fontWeight={600}>
            Filtrar por Estado
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {['Todos', 'Pendientes', 'Aprobados', 'Rechazados'].map((tab, index) => (
            <Button
              key={index}
              variant={selectedTab === index ? 'contained' : 'outlined'}
              onClick={() => setSelectedTab(index)}
              sx={{ 
                minWidth: 140, 
                fontWeight: 600, 
                fontSize: 16, 
                borderRadius: 3, 
                boxShadow: selectedTab === index ? 3 : 0,
                textTransform: 'none',
                py: 1.5,
                px: 3,
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: selectedTab === index ? 4 : 2
                }
              }}
            >
              {tab}
            </Button>
          ))}
        </Box>
      </Paper>

      {/* Control de cantidad mejorado */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3, boxShadow: 2, bgcolor: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AssessmentIcon color="primary" />
            <Typography variant="body1" fontWeight={600}>Mostrar:</Typography>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                value={String(sectionCount)}
                onChange={e => setSectionCount(Number(e.target.value))}
                sx={{ borderRadius: 2 }}
              >
                {[10, 20, 50, 100, 200].map(val => (
                  <MenuItem key={val} value={val}>{`Últimos ${val}`}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Chip 
              label={`${reportsToShow.length} de ${filteredReports.length}`} 
              color="primary" 
              size="medium"
              sx={{ fontWeight: 600 }}
            />
          </Box>
          <Tooltip title="Actualizar datos">
            <IconButton 
              onClick={loadStrikeReports}
              sx={{ 
                bgcolor: 'primary.main', 
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' }
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {/* Lista de Reportes mejorada */}
      <Box>
        {reportsToShow.length === 0 ? (
          <Paper sx={{ 
            textAlign: 'center', 
            py: 8, 
            px: 4,
            borderRadius: 3, 
            boxShadow: 3,
            bgcolor: 'white',
            border: '2px dashed #e0e0e0'
          }}>
            <Avatar sx={{ 
              width: 80, 
              height: 80, 
              bgcolor: 'grey.100', 
              mx: 'auto', 
              mb: 3 
            }}>
              <WarningIcon sx={{ fontSize: 40, color: 'grey.500' }} />
            </Avatar>
            <Typography variant="h5" color="text.secondary" fontWeight={600} gutterBottom>
              No hay reportes en esta categoría
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Los reportes de strikes aparecerán aquí una vez que sean enviados
            </Typography>
            <Button 
              variant="outlined" 
              startIcon={<RefreshIcon />}
              onClick={loadStrikeReports}
              sx={{ borderRadius: 2 }}
            >
              Actualizar
            </Button>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {reportsToShow.map((report) => (
              <Card key={report.id} sx={{ 
                borderRadius: 3, 
                boxShadow: 3, 
                bgcolor: 'white', 
                transition: 'all 0.3s ease',
                border: '1px solid rgba(0,0,0,0.05)',
                '&:hover': { 
                  boxShadow: 6,
                  transform: 'translateY(-4px)',
                  border: '1px solid rgba(25, 118, 210, 0.2)'
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  {/* Header del reporte mejorado */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ 
                      bgcolor: `${getStatusColor(report.status)}.light`,
                      color: `${getStatusColor(report.status)}.main`,
                      mr: 3,
                      width: 56,
                      height: 56,
                      boxShadow: 2
                    }}>
                      {getStatusIcon(report.status)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight={700} sx={{ color: 'primary.main', mb: 0.5 }}>
                        {report.student_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <HistoryIcon sx={{ fontSize: 16 }} />
                        Reporte enviado el {new Date(report.created_at).toLocaleDateString('es-ES')}
                      </Typography>
                    </Box>
                    <Chip
                      label={getStatusLabel(report.status)}
                      color={getStatusColor(report.status) as any}
                      size="medium"
                      sx={{ fontWeight: 600, px: 2 }}
                    />
                  </Box>

                  <Divider sx={{ mb: 3 }} />

                  {/* Información del reporte mejorada */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                      <AssignmentIcon sx={{ fontSize: 24, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                          Proyecto:
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {report.project_title}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, p: 2, bgcolor: '#fff3e0', borderRadius: 2 }}>
                      <WarningIcon sx={{ fontSize: 24, color: 'warning.main', mt: 0.2 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                          Motivo del Strike:
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {report.reason}
                        </Typography>
                      </Box>
                    </Box>

                    {report.description && (
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, p: 2, bgcolor: '#f3e5f5', borderRadius: 2 }}>
                        <BusinessIcon sx={{ fontSize: 24, color: 'secondary.main', mt: 0.2 }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                            Descripción Adicional:
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {report.description}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Box>

                  {/* Acciones mejoradas */}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                    <Button
                      variant="contained"
                      size="medium"
                      onClick={() => { setSelectedReport(report); setShowDetailDialog(true); }}
                      startIcon={<VisibilityIcon />}
                      sx={{ 
                        borderRadius: 2, 
                        textTransform: 'none', 
                        fontWeight: 600,
                        px: 3,
                        py: 1,
                        boxShadow: 2,
                        '&:hover': {
                          boxShadow: 4
                        }
                      }}
                    >
                      Ver Detalles Completos
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>

      {/* Dialog de Detalles mejorado */}
      <Dialog
        open={showDetailDialog}
        onClose={() => setShowDetailDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, boxShadow: 8 }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          color: 'white',
          fontWeight: 600
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ 
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              width: 56,
              height: 56
            }}>
              {selectedReport && getStatusIcon(selectedReport.status)}
            </Avatar>
            <Box>
              <Typography variant="h6">
                Detalles del Reporte de Strike
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {selectedReport && getStatusLabel(selectedReport.status)}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedReport && (
            <Box>
              {/* Información del estudiante */}
              <Paper sx={{ p: 3, mb: 3, bgcolor: '#e3f2fd', borderRadius: 2, border: '1px solid #bbdefb' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <PersonIcon color="primary" />
                  <Typography variant="h6" fontWeight={600}>
                    Estudiante: {selectedReport.student_name}
                  </Typography>
                </Box>
              </Paper>

              {/* Información del proyecto */}
              <Paper sx={{ p: 3, mb: 3, bgcolor: '#f3e5f5', borderRadius: 2, border: '1px solid #e1bee7' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <AssignmentIcon color="secondary" />
                  <Typography variant="h6" fontWeight={600}>
                    Proyecto: {selectedReport.project_title}
                  </Typography>
                </Box>
              </Paper>

              {/* Motivo y descripción */}
              <Paper sx={{ p: 3, mb: 3, bgcolor: '#fff3e0', borderRadius: 2, border: '1px solid #ffcc02' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <WarningIcon color="warning" />
                  <Typography variant="h6" fontWeight={600}>
                    Motivo del Strike
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                  {selectedReport.reason}
                </Typography>
                {selectedReport.description && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                      Descripción adicional:
                    </Typography>
                    <Typography variant="body1">
                      {selectedReport.description}
                    </Typography>
                  </>
                )}
              </Paper>

              {/* Estado y fecha */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <Chip
                  label={getStatusLabel(selectedReport.status)}
                  color={getStatusColor(selectedReport.status) as any}
                  size="medium"
                  sx={{ fontWeight: 600, px: 2 }}
                />
                <Chip
                  label={`Enviado: ${new Date(selectedReport.created_at).toLocaleString('es-ES')}`}
                  variant="outlined"
                  size="medium"
                  sx={{ fontWeight: 600 }}
                />
              </Box>

              {/* Notas del administrador */}
              {selectedReport.admin_notes && (
                <Alert severity="info" sx={{ borderRadius: 2, bgcolor: '#e8f5e8', border: '1px solid #4caf50' }}>
                  <Typography variant="body2" fontWeight={600} gutterBottom>
                    Notas del Administrador:
                  </Typography>
                  <Typography variant="body2">
                    {selectedReport.admin_notes}
                  </Typography>
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f5f5f5', gap: 2 }}>
          <Button 
            onClick={() => setShowDetailDialog(false)}
            variant="outlined"
            sx={{ borderRadius: 2, px: 3, fontWeight: 600 }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CompanyStrikes; 