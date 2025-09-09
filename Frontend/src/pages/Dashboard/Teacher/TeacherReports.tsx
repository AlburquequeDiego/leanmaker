import { useState } from 'react';
import {
  Box, 
  Typography, 
  Paper, 
  Card,
  CardContent,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Divider,
  Button,
  LinearProgress,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
} from '@mui/icons-material';

export default function TeacherReports() {
  const [reports] = useState([
    {
      id: '1',
      title: 'Reporte de Progreso Mensual',
      description: 'Resumen del progreso de todos los estudiantes en enero 2024',
      type: 'monthly',
      status: 'completed',
      created_at: '2024-01-31T18:00:00Z',
      data: {
        total_students: 24,
        active_projects: 8,
        completed_evaluations: 45,
        average_score: 7.8,
      }
    },
    {
      id: '2',
      title: 'Evaluación por Proyecto',
      description: 'Análisis detallado del desempeño por proyecto',
      type: 'project',
      status: 'completed',
      created_at: '2024-01-25T14:30:00Z',
      data: {
        total_projects: 8,
        completed_projects: 2,
        average_progress: 65,
        total_hours: 320,
      }
    },
    {
      id: '3',
      title: 'Reporte de Estudiantes',
      description: 'Estadísticas individuales de cada estudiante',
      type: 'student',
      status: 'pending',
      created_at: '2024-01-20T10:00:00Z',
      data: {
        total_students: 24,
        high_performers: 8,
        average_performers: 12,
        low_performers: 4,
      }
    },
  ]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'monthly': return 'primary';
      case 'project': return 'warning';
      case 'student': return 'info';
      default: return 'default';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'monthly': return 'Mensual';
      case 'project': return 'Proyecto';
      case 'student': return 'Estudiante';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'processing': return 'info';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'pending': return 'Pendiente';
      case 'processing': return 'Procesando';
      default: return status;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} sx={{ color: 'primary.main', mb: 1 }}>
          📊 Reportes y Estadísticas
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Genera y visualiza reportes detallados de tus actividades académicas.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Resumen */}
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                📈 Resumen General
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Total reportes:
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {reports.length}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Completados:
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {reports.filter(r => r.status === 'completed').length}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Pendientes:
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {reports.filter(r => r.status === 'pending').length}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Lista de reportes */}
        <Grid item xs={12} md={8}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  📋 Reportes Disponibles
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AssessmentIcon />}
                  size="small"
                >
                  Generar Nuevo
                </Button>
              </Box>
              <List>
                {reports.map((report, index) => (
                  <Box key={report.id}>
                    <ListItem
                      sx={{
                        borderRadius: 1,
                        mb: 1,
                      }}
                    >
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: `${getTypeColor(report.type)}.main` }}>
                          <AssessmentIcon />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }} component="span">
                            <Typography variant="subtitle1" fontWeight={600} component="span">
                              {report.title}
                            </Typography>
                            <Chip 
                              label={getTypeLabel(report.type)}
                              color={getTypeColor(report.type) as any}
                              size="small"
                            />
                            <Chip 
                              label={getStatusLabel(report.status)}
                              color={getStatusColor(report.status) as any}
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <Box component="span">
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }} component="span">
                              {report.description}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" component="span">
                              📅 {new Date(report.created_at).toLocaleDateString()}
                            </Typography>
                          </Box>
                        }
                      />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          startIcon={<DownloadIcon />}
                          disabled={report.status !== 'completed'}
                        >
                          Descargar
                        </Button>
                        <Button
                          size="small"
                          startIcon={<PrintIcon />}
                          disabled={report.status !== 'completed'}
                        >
                          Imprimir
                        </Button>
                      </Box>
                    </ListItem>
                    {index < reports.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}