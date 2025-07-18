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
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,

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

  const filteredReports = strikeReports.filter(report => {
    if (selectedTab === 0) return true;
    if (selectedTab === 1) return report.status === 'pending';
    if (selectedTab === 2) return report.status === 'approved';
    if (selectedTab === 3) return report.status === 'rejected';
    return true;
  });

  const cantidadActual = cantidadPorTab[selectedTab];
  const reportsMostrados = cantidadActual === 'todas' ? filteredReports : filteredReports.slice(0, Number(cantidadActual));

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
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

  // Cambios visuales principales:
  // 1. Fondo suave y espaciado generoso
  // 2. Tarjetas de estadísticas arriba
  // 3. Tabs modernos
  // 4. Tarjetas de reporte con chips y acciones alineadas
  // 5. Mensaje amigable si no hay reportes

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 1, md: 3 }, bgcolor: '#f7fafd', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Reportes de Strikes Enviados
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Consulta el estado de los reportes de strikes enviados a estudiantes en tus proyectos
        </Typography>
      </Box>

      {/* Estadísticas */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        <Card sx={{ bgcolor: '#1976d2', color: 'white', borderRadius: 3, boxShadow: 3, minWidth: 220 }}>
          <CardContent>
            <Typography variant="h3" fontWeight={700}>{strikeReports.length}</Typography>
            <Typography variant="body1" fontWeight={600}>Total Reportes</Typography>
          </CardContent>
        </Card>
        <Card sx={{ bgcolor: '#ffa726', color: 'white', borderRadius: 3, boxShadow: 3, minWidth: 220 }}>
          <CardContent>
            <Typography variant="h3" fontWeight={700}>{strikeReports.filter(r => r.status === 'pending').length}</Typography>
            <Typography variant="body1" fontWeight={600}>Pendientes</Typography>
          </CardContent>
        </Card>
        <Card sx={{ bgcolor: '#388e3c', color: 'white', borderRadius: 3, boxShadow: 3, minWidth: 220 }}>
          <CardContent>
            <Typography variant="h3" fontWeight={700}>{strikeReports.filter(r => r.status === 'approved').length}</Typography>
            <Typography variant="body1" fontWeight={600}>Aprobados</Typography>
          </CardContent>
        </Card>
        <Card sx={{ bgcolor: '#e53935', color: 'white', borderRadius: 3, boxShadow: 3, minWidth: 220 }}>
          <CardContent>
            <Typography variant="h3" fontWeight={700}>{strikeReports.filter(r => r.status === 'rejected').length}</Typography>
            <Typography variant="body1" fontWeight={600}>Rechazados</Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs modernos */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={1}>
          {['Todos', 'Pendientes', 'Aprobados', 'Rechazados'].map((tab, index) => (
            <Grid item key={index}>
              <Button
                variant={selectedTab === index ? 'contained' : 'outlined'}
                onClick={() => setSelectedTab(index)}
                sx={{ minWidth: 140, fontWeight: 600, fontSize: 16, borderRadius: 2, boxShadow: selectedTab === index ? 2 : 0 }}
              >
                {tab}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Lista de Reportes */}
      <Box>
        {reportsMostrados.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h5" color="text.secondary" fontWeight={500}>
              No hay reportes en esta categoría
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {reportsMostrados.map((report) => (
              <Grid item xs={12} md={6} key={report.id}>
                <Card sx={{ borderRadius: 3, boxShadow: 3, p: 2, bgcolor: 'white', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 6 } }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1, color: 'primary.main' }}>
                        {report.student_name}
                      </Typography>
                      <Chip
                        label={getStatusLabel(report.status)}
                        color={getStatusColor(report.status) as any}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      <strong>Proyecto:</strong> {report.project_title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      <strong>Motivo:</strong> {report.reason}
                    </Typography>
                    {report.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        <strong>Descripción:</strong> {report.description}
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary">
                      <strong>Fecha:</strong> {new Date(report.created_at).toLocaleDateString()}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <IconButton
                        size="small"
                        onClick={() => { setSelectedReport(report); setShowDetailDialog(true); }}
                        color="primary"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Dialog de Detalles (sin cambios visuales aquí, ya está bien estructurado) */}
      <Dialog
        open={showDetailDialog}
        onClose={() => setShowDetailDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Detalles del Reporte de Strike</DialogTitle>
        <DialogContent>
          {selectedReport && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Estudiante: {selectedReport.student_name}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Proyecto:</strong> {selectedReport.project_title}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Motivo:</strong> {selectedReport.reason}
              </Typography>
              {selectedReport.description && (
                <Typography variant="body1" sx={{ mb: 2 }}>
                  <strong>Descripción:</strong> {selectedReport.description}
                </Typography>
              )}
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Chip
                  label={getStatusLabel(selectedReport.status)}
                  color={getStatusColor(selectedReport.status) as any}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                <strong>Fecha de envío:</strong> {new Date(selectedReport.created_at).toLocaleString()}
              </Typography>
              {selectedReport.admin_notes && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <strong>Notas del Administrador:</strong> {selectedReport.admin_notes}
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetailDialog(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CompanyStrikes; 