import { useState, useEffect } from 'react';
import { useHubAnalytics } from '../../../../hooks/useHubAnalytics';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  LinearProgress,
  IconButton,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Business as BusinessIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  MoreVert as MoreVertIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Colores para los estados de proyectos
const projectStatusColors = {
  'Activos': '#10B981',
  'Completados': '#3B82F6', 
  'Pendientes': '#F59E0B',
  'Cancelados': '#EF4444'
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
    case 'active':
      return 'success';
    case 'pending':
      return 'warning';
    case 'error':
      return 'error';
    default:
      return 'default';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircleIcon fontSize="small" />;
    case 'active':
      return <TrendingUpIcon fontSize="small" />;
    case 'pending':
      return <ScheduleIcon fontSize="small" />;
    case 'error':
      return <ErrorIcon fontSize="small" />;
    default:
      return <WarningIcon fontSize="small" />;
  }
};

export const ReportesYAnalytics = () => {
  const { data, loading, error, refreshData } = useHubAnalytics();
  
  // Usar datos del backend o valores por defecto
  const stats = data?.stats || {
    totalUsers: 0,
    totalProjects: 0,
    totalCompanies: 0,
    totalStudents: 0,
    activeProjects: 0,
    completedProjects: 0,
    pendingProjects: 0,
    cancelledProjects: 0,
  };
  
  // Usar únicamente datos reales del backend
  const activityData = data?.activityData || [];
  const projectStatusData = data?.projectStatusData || [];
  const monthlyStats = data?.monthlyStats || [];
  const topStudents = data?.topStudents || [];
  const topCompanies = data?.topCompanies || [];
  
  // Debug: Verificar datos de empresas
  console.log('🔍 [FRONTEND DEBUG] Top Companies:', topCompanies);
  if (topCompanies && topCompanies.length > 0) {
    console.log('🔍 [FRONTEND DEBUG] Primera empresa:', topCompanies[0]);
    console.log('🔍 [FRONTEND DEBUG] Segunda empresa:', topCompanies[1]);
  }
  const recentActivity = data?.recentActivity || [];
  const pendingRequests = data?.pendingRequests || [];
  
  // Nuevas métricas
  const applicationsMetrics = data?.applicationsMetrics || {
    totalApplications: 0,
    acceptedApplications: 0,
    acceptanceRate: 0,
    byStatus: [],
    topRequestedProjects: []
  };
  
  const strikesMetrics = data?.strikesMetrics || {
    activeStrikes: 0,
    studentsWithStrikes: 0,
    studentsByStrikes: [],
    topReportingCompanies: [],
    monthlyTrend: []
  };
  
  const notificationsMetrics = data?.notificationsMetrics || {
    totalNotifications: 0,
    readNotifications: 0,
    readRate: 0,
    byType: [],
    massNotifications: 0,
    massNotificationsSent: 0
  };
  
  const apiTrlMetrics = data?.apiTrlMetrics || {
    studentsByApiLevel: [],
    projectsByTrl: [],
    totalApiRequests: 0,
    pendingApiRequests: 0,
    approvedApiRequests: 0
  };

  // Mostrar loading mientras se cargan los datos
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Mostrar error si hay algún problema
  if (error) {
    return (
      <Box sx={{ maxWidth: 1400, mx: 'auto', mt: 4, mb: 4, px: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <AnalyticsIcon sx={{ fontSize: 40, color: 'error.main' }} />
          <Typography variant="h4" color="error">Error al cargar datos</Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          {error}
        </Typography>
        <Button variant="contained" onClick={refreshData}>
          Reintentar
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh' }}>
      {/* Header con gradiente */}
      <Card sx={{ 
        mb: 3, 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
        borderRadius: 3
      }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ 
                background: 'rgba(255, 255, 255, 0.2)', 
                borderRadius: 2, 
                p: 1.5, 
                mr: 2,
                backdropFilter: 'blur(10px)'
              }}>
                <AnalyticsIcon sx={{ color: 'white', fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold', mb: 0.5 }}>
                  Gestión de Analytics y Reportes
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  Dashboard de métricas globales y estadísticas del sistema LeanMaker
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={refreshData}
              disabled={loading}
              sx={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.3)',
                }
              }}
            >
              Actualizar Datos
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* KPI Cards Superiores - Diseño Mejorado */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: 2.5, 
        mb: 4 
      }}>
        <Card sx={{ 
          borderRadius: 3, 
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
          bgcolor: '#22c55e', 
          color: 'white',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
          }
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                  {stats.totalUsers.toLocaleString()}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Usuarios Registrados
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  +12% este mes
                </Typography>
              </Box>
              <Box sx={{ 
                p: 2, 
                borderRadius: 2, 
                bgcolor: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <PeopleIcon sx={{ fontSize: 32 }} />
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ 
          borderRadius: 3, 
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
          bgcolor: '#3b82f6', 
          color: 'white',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
          }
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                  {stats.totalProjects.toLocaleString()}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Proyectos Activos
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {stats.activeProjects} en curso
                </Typography>
              </Box>
              <Box sx={{ 
                p: 2, 
                borderRadius: 2, 
                bgcolor: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <WorkIcon sx={{ fontSize: 32 }} />
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ 
          borderRadius: 3, 
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
          bgcolor: '#f59e0b', 
          color: 'white',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
          }
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                  {stats.totalCompanies.toLocaleString()}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Empresas Colaboradoras
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {stats.totalStudents} estudiantes
                </Typography>
              </Box>
              <Box sx={{ 
                p: 2, 
                borderRadius: 2, 
                bgcolor: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <BusinessIcon sx={{ fontSize: 32 }} />
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ 
          borderRadius: 3, 
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
          bgcolor: '#8b5cf6', 
          color: 'white',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
          }
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                  {stats.totalStudents.toLocaleString()}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Estudiantes Activos
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Participando en proyectos
                </Typography>
              </Box>
              <Box sx={{ 
                p: 2, 
                borderRadius: 2, 
                bgcolor: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <SchoolIcon sx={{ fontSize: 32 }} />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Gráficos y Tablas */}
      <Box sx={{ display: 'flex', gap: 10, mb: 10, flexWrap: 'wrap' }}>
        {/* Gráfico de Actividad Semanal */}
        <Box sx={{ flex: '2 1 600px', minWidth: 400 }}>
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Actividad Semanal</Typography>
              {activityData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="semana" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => {
                        const labels = {
                          usuarios: 'Usuarios',
                          proyectos: 'Proyectos',
                          aplicaciones: 'Aplicaciones',
                          horas: 'Horas'
                        };
                        return [value, labels[name as keyof typeof labels] || name];
                      }}
                    />
                    <Legend 
                      formatter={(value) => {
                        const labels = {
                          usuarios: 'Usuarios',
                          proyectos: 'Proyectos',
                          aplicaciones: 'Aplicaciones',
                          horas: 'Horas'
                        };
                        return labels[value as keyof typeof labels] || value;
                      }}
                    />
                    <Line type="monotone" dataKey="usuarios" stroke="#22c55e" strokeWidth={2} />
                    <Line type="monotone" dataKey="proyectos" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="aplicaciones" stroke="#f59e0b" strokeWidth={2} />
                    {activityData.some(item => item.horas !== undefined) && (
                      <Line type="monotone" dataKey="horas" stroke="#8b5cf6" strokeWidth={2} />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                  <Typography color="text.secondary">No hay datos de actividad disponibles</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>

                        {/* Gráfico de Estado de Proyectos */}
        <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Estado de Proyectos</Typography>
              {projectStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={projectStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : '0'}%`}
                      outerRadius={80}
                      innerRadius={40}
                      dataKey="value"
                    >
                      {projectStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || projectStatusColors[entry.name as keyof typeof projectStatusColors] || '#3B82F6'} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                  <Typography color="text.secondary">No hay datos de proyectos disponibles</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

             {/* Gráficos de Estadísticas Mensuales */}
       <Box sx={{ display: 'flex', gap: 10, flexWrap: 'wrap', mb: 4 }}>
        {/* Gráfico de Estadísticas Mensuales */}
        <Box sx={{ flex: '1 1 100%', minWidth: 600 }}>
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Estadísticas Mensuales</Typography>
              {monthlyStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => {
                        const labels = {
                          usuarios: 'Usuarios',
                          proyectos: 'Proyectos',
                          aplicaciones: 'Aplicaciones',
                          horas: 'Horas'
                        };
                        return [value, labels[name as keyof typeof labels] || name];
                      }}
                    />
                    <Legend 
                      formatter={(value) => {
                        const labels = {
                          usuarios: 'Usuarios',
                          proyectos: 'Proyectos',
                          aplicaciones: 'Aplicaciones',
                          horas: 'Horas'
                        };
                        return labels[value as keyof typeof labels] || value;
                      }}
                    />
                    <Bar dataKey="usuarios" fill="#22c55e" />
                    <Bar dataKey="proyectos" fill="#3b82f6" />
                    <Bar dataKey="aplicaciones" fill="#f59e0b" />
                    {monthlyStats.some(item => item.horas !== undefined) && (
                      <Bar dataKey="horas" fill="#8b5cf6" />
                    )}
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                  <Typography color="text.secondary">No hay datos mensuales disponibles</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

       {/* Tablas de Top 20 */}
       <Box sx={{ display: 'flex', gap: 10, flexWrap: 'wrap', mt: 6 }}>
         {/* Top 20 Estudiantes */}
         <Box sx={{ flex: '1 1 500px', minWidth: 400 }}>
           <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
             <CardContent>
               <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                 <Typography variant="h6">Top 20 Estudiantes</Typography>
                 <Typography variant="body2" color="text.secondary">Por horas en proyectos</Typography>
               </Box>
               {topStudents.length > 0 ? (
                 <TableContainer>
                   <Table>
                     <TableHead>
                       <TableRow>
                         <TableCell>Estudiante</TableCell>
                         <TableCell>Nivel API</TableCell>
                         <TableCell>Horas</TableCell>
                         <TableCell>Proyectos</TableCell>
                         <TableCell>Rating</TableCell>
                       </TableRow>
                     </TableHead>
                     <TableBody>
                       {topStudents.map((student, index) => (
                         <TableRow 
                           key={student.id} 
                           sx={index === 0 ? { 
                             bgcolor: '#fef3c7', 
                             '&:hover': { bgcolor: '#fde68a' } 
                           } : {}}
                         >
                           <TableCell>
                             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                               <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                                 {index < 3 ? ['🥇', '🥈', '🥉'][index] : student.name.charAt(0)}
                               </Avatar>
                               <Box>
                                 <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                   {student.name}
                                 </Typography>
                                 <Typography variant="caption" color="text.secondary">
                                   {student.email}
                                 </Typography>
                               </Box>
                             </Box>
                           </TableCell>
                           <TableCell>
                             <Chip 
                               label={`API ${student.level}`}
                               size="small"
                               color={student.level >= 3 ? 'success' : student.level >= 2 ? 'warning' : 'default'}
                               variant={student.level >= 3 ? 'filled' : 'outlined'}
                             />
                           </TableCell>
                           <TableCell>
                             <Typography variant="body2" sx={{ color: '#22c55e', fontWeight: 600 }}>
                               {student.totalHours.toLocaleString()}
                             </Typography>
                           </TableCell>
                           <TableCell>
                             <Chip 
                               label={student.completedProjects}
                               size="small"
                               color={student.completedProjects > 0 ? 'primary' : 'default'}
                               variant={student.completedProjects > 0 ? 'filled' : 'outlined'}
                             />
                           </TableCell>
                           <TableCell>
                             <Typography variant="body2" sx={{ fontWeight: 600 }}>
                               {student.averageRating ? student.averageRating.toFixed(1) : '0.0'} ⭐
                             </Typography>
                           </TableCell>
                         </TableRow>
                       ))}
                     </TableBody>
                   </Table>
                 </TableContainer>
               ) : (
                 <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                   <Typography color="text.secondary">No hay datos de estudiantes disponibles</Typography>
                 </Box>
               )}
             </CardContent>
           </Card>
         </Box>

         {/* Top 20 Empresas */}
         <Box sx={{ flex: '1 1 500px', minWidth: 400 }}>
           <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
             <CardContent>
               <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                 <Typography variant="h6">Top 20 Empresas</Typography>
                 <Typography variant="body2" color="text.secondary">Por proyectos y horas ofrecidas</Typography>
               </Box>
               {topCompanies.length > 0 ? (
                 <TableContainer>
                   <Table>
                     <TableHead>
                       <TableRow>
                         <TableCell>Empresa</TableCell>
                         <TableCell>Proyectos</TableCell>
                         <TableCell>Activos</TableCell>
                         <TableCell>Estudiantes</TableCell>
                         <TableCell>Horas Ofrecidas</TableCell>
                         <TableCell>Rating</TableCell>
                       </TableRow>
                     </TableHead>
                     <TableBody>
                       {topCompanies.map((company, index) => (
                         <TableRow 
                           key={company.id} 
                           sx={index === 0 ? { 
                             bgcolor: '#dbeafe', 
                             '&:hover': { bgcolor: '#bfdbfe' } 
                           } : {}}
                         >
                           <TableCell>
                             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                               <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                                 {index < 3 ? ['🏆', '🥈', '🥉'][index] : company.name.charAt(0)}
                               </Avatar>
                               <Box>
                                 <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                   {company.name}
                                 </Typography>
                                 <Typography variant="caption" color="text.secondary">
                                   {company.industry}
                                 </Typography>
                               </Box>
                             </Box>
                           </TableCell>
                           <TableCell>
                             <Typography variant="body2" sx={{ color: '#3b82f6', fontWeight: 600 }}>
                               {company.totalProjects}
                             </Typography>
                           </TableCell>
                           <TableCell>
                             <Chip 
                               label={company.activeProjects}
                               size="small"
                               color={company.activeProjects > 0 ? 'success' : 'default'}
                               variant={company.activeProjects > 0 ? 'filled' : 'outlined'}
                             />
                           </TableCell>
                           <TableCell>
                             <Chip 
                               label={company.totalStudents}
                               size="small"
                               color={company.totalStudents > 0 ? 'info' : 'default'}
                               variant={company.totalStudents > 0 ? 'filled' : 'outlined'}
                             />
                           </TableCell>
                           <TableCell>
                             <Typography variant="body2" sx={{ color: '#10B981', fontWeight: 600 }}>
                               {company.realHoursOffered ? company.realHoursOffered.toLocaleString() : '0'}
                             </Typography>
                           </TableCell>
                           <TableCell>
                             <Typography variant="body2" sx={{ fontWeight: 600 }}>
                               {company.averageRating ? company.averageRating.toFixed(1) : '0.0'} ⭐
                             </Typography>
                           </TableCell>
                         </TableRow>
                       ))}
                     </TableBody>
                   </Table>
                 </TableContainer>
               ) : (
                 <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                   <Typography color="text.secondary">No hay datos de empresas disponibles</Typography>
                 </Box>
               )}
             </CardContent>
           </Card>
         </Box>
       </Box>

        {/* Sección: Métricas de Aplicaciones */}
        <Box sx={{ mt: 6, mb: 4 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            mb: 3,
            pb: 2,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}>
            <Box sx={{ 
              p: 1.5, 
              borderRadius: 2, 
              bgcolor: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Typography sx={{ fontSize: 20, color: 'white' }}>📝</Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
              Métricas de Aplicaciones y Proceso de Selección
            </Typography>
          </Box>
          
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px rgba(0,0,0,0.12)'
            }
          }}>
            <CardContent sx={{ p: 4 }}>
              {/* KPI Cards de Aplicaciones - Diseño Mejorado */}
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: 3, 
                mb: 4 
              }}>
                <Box sx={{ 
                  p: 3, 
                  borderRadius: 2, 
                  bgcolor: '#f8fafc',
                  textAlign: 'center',
                  border: '1px solid',
                  borderColor: '#e2e8f0',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: '#f1f5f9',
                    transform: 'translateY(-1px)'
                  }
                }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: '#3b82f6', mb: 1 }}>
                    {applicationsMetrics.totalApplications}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Total de Aplicaciones
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 3, 
                  borderRadius: 2, 
                  bgcolor: '#f0fdf4',
                  textAlign: 'center',
                  border: '1px solid',
                  borderColor: '#bbf7d0',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: '#dcfce7',
                    transform: 'translateY(-1px)'
                  }
                }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: '#22c55e', mb: 1 }}>
                    {applicationsMetrics.acceptanceRate}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Tasa de Aceptación
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 3, 
                  borderRadius: 2, 
                  bgcolor: '#fffbeb',
                  textAlign: 'center',
                  border: '1px solid',
                  borderColor: '#fde68a',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: '#fef3c7',
                    transform: 'translateY(-1px)'
                  }
                }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: '#f59e0b', mb: 1 }}>
                    {applicationsMetrics.acceptedApplications}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Aplicaciones Aceptadas
                  </Typography>
                </Box>
              </Box>

              {/* Gráficos de Aplicaciones - Nuevo Diseño */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 4 }}>
                {/* Gráfico de Barras - Total de Aplicaciones vs Aceptadas */}
                <Box>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                    Comparación de Aplicaciones
                  </Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={[
                      { 
                        name: 'Total', 
                        aplicaciones: applicationsMetrics.totalApplications || 0, 
                        aceptadas: applicationsMetrics.acceptedApplications || 0 
                      }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#ffffff', 
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px'
                        }}
                        formatter={(value, name) => [
                          value, 
                          name === 'aplicaciones' ? 'Total Aplicaciones' : 'Aplicaciones Aceptadas'
                        ]}
                      />
                      <Legend 
                        formatter={(value) => 
                          value === 'aplicaciones' ? 'Total Aplicaciones' : 'Aplicaciones Aceptadas'
                        }
                      />
                      <Bar dataKey="aplicaciones" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="aceptadas" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  {applicationsMetrics.totalApplications === 0 && (
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      height: 50,
                      color: 'text.secondary',
                      fontStyle: 'italic',
                      mt: 2
                    }}>
                      No hay aplicaciones registradas
                    </Box>
                  )}
                </Box>

                {/* Gráfico Circular - Tasa de Aceptación */}
                <Box>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                    Tasa de Aceptación
                  </Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={
                          applicationsMetrics.totalApplications > 0 
                            ? [
                                { 
                                  name: 'Aceptadas', 
                                  value: applicationsMetrics.acceptedApplications || 0, 
                                  color: '#22c55e' 
                                },
                                { 
                                  name: 'Pendientes/Rechazadas', 
                                  value: (applicationsMetrics.totalApplications || 0) - (applicationsMetrics.acceptedApplications || 0), 
                                  color: '#f59e0b' 
                                }
                              ].filter(item => item.value > 0)
                            : [
                                { name: 'Sin Datos', value: 1, color: '#e2e8f0' }
                              ]
                        }
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => 
                          name === 'Sin Datos' 
                            ? 'Sin Datos' 
                            : `${name} ${percent ? (percent * 100).toFixed(0) : '0'}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {(
                          applicationsMetrics.totalApplications > 0 
                            ? [
                                { 
                                  name: 'Aceptadas', 
                                  value: applicationsMetrics.acceptedApplications || 0, 
                                  color: '#22c55e' 
                                },
                                { 
                                  name: 'Pendientes/Rechazadas', 
                                  value: (applicationsMetrics.totalApplications || 0) - (applicationsMetrics.acceptedApplications || 0), 
                                  color: '#f59e0b' 
                                }
                              ].filter(item => item.value > 0)
                            : [
                                { name: 'Sin Datos', value: 1, color: '#e2e8f0' }
                              ]
                        ).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#ffffff', 
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {applicationsMetrics.totalApplications === 0 && (
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      height: 50,
                      color: 'text.secondary',
                      fontStyle: 'italic',
                      mt: 2
                    }}>
                      No hay aplicaciones para calcular la tasa
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Gráfico de Aplicaciones por Estado */}
              {applicationsMetrics.byStatus.length > 0 && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                    Distribución de Aplicaciones por Estado
                  </Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={applicationsMetrics.byStatus}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="estado" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#ffffff', 
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Sección: Métricas de Strikes y Disciplina */}
        <Box sx={{ mt: 6, mb: 4 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            mb: 3,
            pb: 2,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}>
            <Box sx={{ 
              p: 1.5, 
              borderRadius: 2, 
              bgcolor: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Typography sx={{ fontSize: 20, color: 'white' }}>⚠️</Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
              Métricas de Strikes y Disciplina
            </Typography>
          </Box>
          
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px rgba(0,0,0,0.12)'
            }
          }}>
            <CardContent sx={{ p: 4 }}>
              {/* KPI Cards de Strikes - Diseño Mejorado */}
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: 3, 
                mb: 4 
              }}>
                <Box sx={{ 
                  p: 3, 
                  borderRadius: 2, 
                  bgcolor: '#fef2f2',
                  textAlign: 'center',
                  border: '1px solid',
                  borderColor: '#fecaca',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: '#fee2e2',
                    transform: 'translateY(-1px)'
                  }
                }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: '#ef4444', mb: 1 }}>
                    {strikesMetrics.activeStrikes}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Strikes Activos
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 3, 
                  borderRadius: 2, 
                  bgcolor: '#fef3c7',
                  textAlign: 'center',
                  border: '1px solid',
                  borderColor: '#fde68a',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: '#fde68a',
                    transform: 'translateY(-1px)'
                  }
                }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: '#f59e0b', mb: 1 }}>
                    {strikesMetrics.studentsWithStrikes}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Estudiantes con Strikes
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 3, 
                  borderRadius: 2, 
                  bgcolor: '#f0fdf4',
                  textAlign: 'center',
                  border: '1px solid',
                  borderColor: '#bbf7d0',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: '#dcfce7',
                    transform: 'translateY(-1px)'
                  }
                }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: '#22c55e', mb: 1 }}>
                    {strikesMetrics.topReportingCompanies.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Empresas Reportando
                  </Typography>
                </Box>
              </Box>

              {/* Gráficos de Strikes - Nuevo Diseño */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 4 }}>
                {/* Gráfico de Líneas - Tendencia de Strikes */}
                {strikesMetrics.monthlyTrend.length > 0 && (
                  <Box>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                      Tendencia Mensual de Strikes
                    </Typography>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={strikesMetrics.monthlyTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#ffffff', 
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="strikes" 
                          stroke="#ef4444" 
                          strokeWidth={3}
                          dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                )}

                {/* Gráfico de Barras - Distribución de Strikes */}
                <Box>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                    Distribución de Strikes
                  </Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={[
                      { 
                        categoria: 'Strikes Activos', 
                        cantidad: strikesMetrics.activeStrikes,
                        color: '#ef4444'
                      },
                      { 
                        categoria: 'Estudiantes con Strikes', 
                        cantidad: strikesMetrics.studentsWithStrikes,
                        color: '#f59e0b'
                      },
                      { 
                        categoria: 'Empresas Reportando', 
                        cantidad: strikesMetrics.topReportingCompanies.length,
                        color: '#22c55e'
                      }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="categoria" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#ffffff', 
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="cantidad" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Sección: Métricas de Notificaciones */}
        <Box sx={{ mt: 6, mb: 4 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            mb: 3,
            pb: 2,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}>
            <Box sx={{ 
              p: 1.5, 
              borderRadius: 2, 
              bgcolor: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Typography sx={{ fontSize: 20, color: 'white' }}>🔔</Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
              Métricas de Notificaciones
            </Typography>
          </Box>
          
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px rgba(0,0,0,0.12)'
            }
          }}>
            <CardContent sx={{ p: 4 }}>
              {/* KPI Cards de Notificaciones - Diseño Mejorado */}
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: 3, 
                mb: 4 
              }}>
                <Box sx={{ 
                  p: 3, 
                  borderRadius: 2, 
                  bgcolor: '#f8fafc',
                  textAlign: 'center',
                  border: '1px solid',
                  borderColor: '#e2e8f0',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: '#f1f5f9',
                    transform: 'translateY(-1px)'
                  }
                }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: '#3b82f6', mb: 1 }}>
                    {notificationsMetrics.totalNotifications}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Total de Notificaciones
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 3, 
                  borderRadius: 2, 
                  bgcolor: '#f0fdf4',
                  textAlign: 'center',
                  border: '1px solid',
                  borderColor: '#bbf7d0',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: '#dcfce7',
                    transform: 'translateY(-1px)'
                  }
                }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: '#22c55e', mb: 1 }}>
                    {notificationsMetrics.readRate}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Tasa de Lectura
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 3, 
                  borderRadius: 2, 
                  bgcolor: '#fffbeb',
                  textAlign: 'center',
                  border: '1px solid',
                  borderColor: '#fde68a',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: '#fef3c7',
                    transform: 'translateY(-1px)'
                  }
                }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: '#f59e0b', mb: 1 }}>
                    {notificationsMetrics.massNotifications}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Notificaciones Masivas
                  </Typography>
                </Box>
              </Box>

              {/* Gráficos de Notificaciones - Nuevo Diseño */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 4 }}>
                {/* Gráfico Circular - Tasa de Lectura */}
                <Box>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                    Tasa de Lectura de Notificaciones
                  </Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Leídas', value: notificationsMetrics.readNotifications, color: '#22c55e' },
                          { name: 'No Leídas', value: notificationsMetrics.totalNotifications - notificationsMetrics.readNotifications, color: '#f59e0b' }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : '0'}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          { name: 'Leídas', value: notificationsMetrics.readNotifications, color: '#22c55e' },
                          { name: 'No Leídas', value: notificationsMetrics.totalNotifications - notificationsMetrics.readNotifications, color: '#f59e0b' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#ffffff', 
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>

                {/* Gráfico de Notificaciones por Tipo */}
                {notificationsMetrics.byType.length > 0 && (
                  <Box>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                      Notificaciones por Tipo
                    </Typography>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={notificationsMetrics.byType}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="type" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#ffffff', 
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Sección: Métricas de API y TRL */}
        <Box sx={{ mt: 6, mb: 4 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            mb: 3,
            pb: 2,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}>
            <Box sx={{ 
              p: 1.5, 
              borderRadius: 2, 
              bgcolor: '#8b5cf6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Typography sx={{ fontSize: 20, color: 'white' }}>📊</Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
              Métricas de Niveles API y TRL
            </Typography>
          </Box>
          
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px rgba(0,0,0,0.12)'
            }
          }}>
            <CardContent sx={{ p: 4 }}>
              {/* KPI Cards de API - Diseño Mejorado */}
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: 3, 
                mb: 4 
              }}>
                <Box sx={{ 
                  p: 3, 
                  borderRadius: 2, 
                  bgcolor: '#f8fafc',
                  textAlign: 'center',
                  border: '1px solid',
                  borderColor: '#e2e8f0',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: '#f1f5f9',
                    transform: 'translateY(-1px)'
                  }
                }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: '#3b82f6', mb: 1 }}>
                    {apiTrlMetrics.totalApiRequests}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Total de Solicitudes API
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 3, 
                  borderRadius: 2, 
                  bgcolor: '#fffbeb',
                  textAlign: 'center',
                  border: '1px solid',
                  borderColor: '#fde68a',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: '#fef3c7',
                    transform: 'translateY(-1px)'
                  }
                }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: '#f59e0b', mb: 1 }}>
                    {apiTrlMetrics.pendingApiRequests}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Solicitudes Pendientes
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 3, 
                  borderRadius: 2, 
                  bgcolor: '#f0fdf4',
                  textAlign: 'center',
                  border: '1px solid',
                  borderColor: '#bbf7d0',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: '#dcfce7',
                    transform: 'translateY(-1px)'
                  }
                }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: '#22c55e', mb: 1 }}>
                    {apiTrlMetrics.approvedApiRequests}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Solicitudes Aprobadas
                  </Typography>
                </Box>
              </Box>

              {/* Gráficos de API y TRL - Nuevo Diseño */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 4 }}>
                {/* Gráfico de Barras - Solicitudes API */}
                <Box>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                    Estado de Solicitudes API
                  </Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={[
                      { 
                        estado: 'Total', 
                        solicitudes: apiTrlMetrics.totalApiRequests || 0,
                        color: '#3b82f6'
                      },
                      { 
                        estado: 'Pendientes', 
                        solicitudes: apiTrlMetrics.pendingApiRequests || 0,
                        color: '#f59e0b'
                      },
                      { 
                        estado: 'Aprobadas', 
                        solicitudes: apiTrlMetrics.approvedApiRequests || 0,
                        color: '#22c55e'
                      }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="estado" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#ffffff', 
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px'
                        }}
                        formatter={(value, name) => [value, 'Solicitudes']}
                      />
                      <Bar dataKey="solicitudes" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>

                {/* Gráfico Circular - Distribución de Solicitudes */}
                <Box>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                    Distribución de Solicitudes API
                  </Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={
                          apiTrlMetrics.totalApiRequests > 0 
                            ? [
                                { 
                                  name: 'Aprobadas', 
                                  value: apiTrlMetrics.approvedApiRequests || 0, 
                                  color: '#22c55e' 
                                },
                                { 
                                  name: 'Pendientes', 
                                  value: apiTrlMetrics.pendingApiRequests || 0, 
                                  color: '#f59e0b' 
                                },
                                { 
                                  name: 'Rechazadas', 
                                  value: Math.max(0, (apiTrlMetrics.totalApiRequests || 0) - (apiTrlMetrics.approvedApiRequests || 0) - (apiTrlMetrics.pendingApiRequests || 0)), 
                                  color: '#ef4444' 
                                }
                              ].filter(item => item.value > 0)
                            : [
                                { name: 'Sin Datos', value: 1, color: '#e2e8f0' }
                              ]
                        }
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => 
                          name === 'Sin Datos' 
                            ? 'Sin Datos' 
                            : `${name} ${percent ? (percent * 100).toFixed(0) : '0'}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {(
                          apiTrlMetrics.totalApiRequests > 0 
                            ? [
                                { 
                                  name: 'Aprobadas', 
                                  value: apiTrlMetrics.approvedApiRequests || 0, 
                                  color: '#22c55e' 
                                },
                                { 
                                  name: 'Pendientes', 
                                  value: apiTrlMetrics.pendingApiRequests || 0, 
                                  color: '#f59e0b' 
                                },
                                { 
                                  name: 'Rechazadas', 
                                  value: Math.max(0, (apiTrlMetrics.totalApiRequests || 0) - (apiTrlMetrics.approvedApiRequests || 0) - (apiTrlMetrics.pendingApiRequests || 0)), 
                                  color: '#ef4444' 
                                }
                              ].filter(item => item.value > 0)
                            : [
                                { name: 'Sin Datos', value: 1, color: '#e2e8f0' }
                              ]
                        ).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#ffffff', 
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Mensaje cuando no hay datos */}
                  {apiTrlMetrics.totalApiRequests === 0 && (
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      height: 50,
                      color: 'text.secondary',
                      fontStyle: 'italic',
                      mt: 2
                    }}>
                      No hay solicitudes API registradas
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Gráficos de Estudiantes por Nivel API y Proyectos por TRL */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 4, mt: 4 }}>
                {/* Gráfico de Estudiantes por Nivel API */}
                <Box>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                    Distribución de Estudiantes por Nivel API
                  </Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={
                      apiTrlMetrics.studentsByApiLevel.length > 0 
                        ? apiTrlMetrics.studentsByApiLevel.map(item => ({
                            api_level: `API ${item.api_level}`,
                            count: item.count
                          }))
                        : [
                            { api_level: 'API 1', count: 0 },
                            { api_level: 'API 2', count: 0 },
                            { api_level: 'API 3', count: 0 },
                            { api_level: 'API 4', count: 0 },
                            { api_level: 'API 5', count: 0 }
                          ]
                    }>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="api_level" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#ffffff', 
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px'
                        }}
                        formatter={(value, name) => [value, 'Estudiantes']}
                      />
                      <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  {apiTrlMetrics.studentsByApiLevel.length === 0 && (
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      height: 50,
                      color: 'text.secondary',
                      fontStyle: 'italic'
                    }}>
                      No hay datos de distribución de estudiantes por nivel API
                    </Box>
                  )}
                </Box>

                {/* Gráfico de Proyectos por Nivel TRL */}
                <Box>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                    Proyectos por Nivel TRL
                  </Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={
                      apiTrlMetrics.projectsByTrl.length > 0 
                        ? apiTrlMetrics.projectsByTrl.map(item => ({
                            trl_level: `TRL ${item.trl_level}`,
                            count: item.count
                          }))
                        : [
                            { trl_level: 'TRL 1', count: 0 },
                            { trl_level: 'TRL 2', count: 0 },
                            { trl_level: 'TRL 3', count: 0 },
                            { trl_level: 'TRL 4', count: 0 },
                            { trl_level: 'TRL 5', count: 0 },
                            { trl_level: 'TRL 6', count: 0 },
                            { trl_level: 'TRL 7', count: 0 },
                            { trl_level: 'TRL 8', count: 0 },
                            { trl_level: 'TRL 9', count: 0 }
                          ]
                    }>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="trl_level" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#ffffff', 
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px'
                        }}
                        formatter={(value, name) => [value, 'Proyectos']}
                      />
                      <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  {apiTrlMetrics.projectsByTrl.length === 0 && (
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      height: 50,
                      color: 'text.secondary',
                      fontStyle: 'italic'
                    }}>
                      No hay datos de distribución de proyectos por nivel TRL
                    </Box>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
    </Box>
  );
};

export default ReportesYAnalytics; 