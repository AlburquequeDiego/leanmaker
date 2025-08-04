import { Box, Typography, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Avatar, Tooltip, IconButton } from '@mui/material';
import { People as PeopleIcon, Business as BusinessIcon, School as SchoolIcon, Work as WorkIcon, Pending as PendingIcon, EmojiEvents as TrophyIcon, Info as InfoIcon } from '@mui/icons-material';
import { ConnectionStatus } from '../../../components/common/ConnectionStatus';
import { useDashboardStats } from '../../../hooks/useRealTimeData';
import { useAuth } from '../../../hooks/useAuth';
import { useState } from 'react';

// Definir el tipo localmente para evitar problemas de importación
interface TopStudent {
  student_id: string;
  user_data: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
  };
  total_hours: number;
  completed_projects: number;
  api_level: number;
  strikes: number;
  gpa: number;
  career: string;
  university: string;
}

// Componente para mostrar el ranking de top estudiantes
const TopStudentsRanking = ({ topStudents }: { topStudents: TopStudent[] }) => {
  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return '#FFD700'; // Oro
      case 2: return '#C0C0C0'; // Plata
      case 3: return '#CD7F32'; // Bronce
      default: return '#E0E0E0'; // Gris
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `${rank}`;
    }
  };

  return (
    <Paper sx={{ p: 3, bgcolor: '#ffffff', boxShadow: 2, borderRadius: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <TrophyIcon sx={{ fontSize: 32, mr: 2, color: '#FFD700' }} />
        <Typography variant="h5" fontWeight={700} color="#333333">
          Top 10 Estudiantes - Más Horas Registradas
        </Typography>
      </Box>
      
      {topStudents.length === 0 ? (
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          No hay estudiantes con horas registradas aún.
        </Typography>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 700, fontSize: 16 }}>Ranking</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 16 }}>Estudiante</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 16 }}>Universidad</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 16 }}>Carrera</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 16 }}>Horas Totales</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 16 }}>Proyectos</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 16 }}>API Level</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 16 }}>GPA</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 16 }}>Strikes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {topStudents.map((student, index) => (
                <TableRow 
                  key={student.student_id}
                  sx={{ 
                    '&:hover': { bgcolor: '#f8f9fa' },
                    '&:nth-of-type(odd)': { bgcolor: '#fafafa' }
                  }}
                >
                  <TableCell>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: getRankColor(index + 1),
                      color: index < 3 ? '#333' : '#666',
                      fontWeight: 700,
                      fontSize: 16
                    }}>
                      {getRankIcon(index + 1)}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        sx={{ 
                          width: 40, 
                          height: 40, 
                          mr: 2,
                          bgcolor: index < 3 ? '#1976d2' : '#757575'
                        }}
                      >
                        {student.user_data.full_name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight={600}>
                          {student.user_data.full_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {student.user_data.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {student.university}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {student.career}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={`${student.total_hours}h`} 
                      color={index < 3 ? "primary" : "default"}
                      variant={index < 3 ? "filled" : "outlined"}
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {student.completed_projects}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={`API ${student.api_level}`} 
                      color="info" 
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {student.gpa.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={student.strikes} 
                      color={student.strikes === 0 ? "success" : "warning"}
                      size="small"
                      variant={student.strikes === 0 ? "filled" : "outlined"}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};

// Componente para tarjetas KPI con tooltip
interface KPICardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
}

const KPICard = ({ title, value, description, icon, bgColor, textColor }: KPICardProps) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
        <Paper sx={{
      p: 2.5,
      width: '100%',
      height: 160,
      minHeight: 160,
      maxHeight: 160,
      display: 'flex',
      flexDirection: 'column',
      bgcolor: bgColor,
      color: textColor,
      boxShadow: 2,
      borderRadius: 3,
      justifyContent: 'space-between',
      cursor: 'pointer',
      transition: 'transform 0.2s, box-shadow 0.2s',
      flexShrink: 0,
      flexGrow: 0,
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: 4
      }
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            flexShrink: 0
          }}>
            {icon}
          </Box>
          <Typography variant="h6" fontWeight={700} sx={{ ml: 1 }}>
            {title}
          </Typography>
        </Box>
        <Tooltip 
          title={description}
          open={showTooltip}
          onClose={() => setShowTooltip(false)}
          placement="top"
          arrow
          sx={{
            '& .MuiTooltip-tooltip': {
              bgcolor: 'rgba(0, 0, 0, 0.9)',
              color: 'white',
              fontSize: '14px',
              padding: '8px 12px',
              borderRadius: '6px'
            }
          }}
        >
          <IconButton
            size="small"
            onClick={() => setShowTooltip(!showTooltip)}
            sx={{ 
              color: textColor,
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      <Typography variant="h3" fontWeight={700} sx={{ textAlign: 'center', my: 2 }}>
        {value}
      </Typography>
    </Paper>
  );
};

export default function AdminDashboard() {
  const { user } = useAuth();

  // Obtener el nombre del usuario para personalizar el dashboard
  const getUserDisplayName = () => {
    if (user?.full_name) {
      return user.full_name;
    }
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user?.first_name) {
      return user.first_name;
    }
    return 'Administrador';
  };
  
  // Usar hook de tiempo real para estadísticas
  const { data: stats, loading, error, lastUpdate, isPolling } = useDashboardStats('admin');

  // Cálculos de KPIs usando datos reales
  const totalUsers = stats?.total_users || 0;
  const totalStudents = stats?.students || 0; // Corregido: usar el campo mapeado por el adaptador
  const totalCompanies = stats?.companies || 0; // Corregido: usar el campo mapeado por el adaptador
  const totalProjects = stats?.total_projects || 0;
  const pendingApplications = stats?.pending_applications || 0;
  const strikesAlerts = stats?.strikes_alerts || 0;

  return (
    <Box sx={{ p: 3, bgcolor: '#f7fafd', minHeight: '100vh' }}>
      {/* Header con título y estado de conexión */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" fontWeight={700}>
          Dashboard de Administrador - {getUserDisplayName()}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ConnectionStatus
            isConnected={!error}
            isPolling={isPolling}
            lastUpdate={lastUpdate}
            error={error}
          />
        </Box>
      </Box>
      
      {/* Estado de carga */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error discreto */}
      {error && !loading && (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
          No se pudo cargar la información.
        </Typography>
      )}

      {/* Contenido solo si hay datos */}
      {!loading && !error && stats && (
        <>
          {/* KPIs principales - 2 filas × 3 columnas */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridTemplateRows: 'repeat(2, 160px)',
            gap: 3,
            mb: 4,
            maxWidth: '100%',
            width: '100%'
          }}>
            {/* Usuarios - Azul primario vibrante */}
            <KPICard
              title="Usuarios"
              value={totalUsers}
              description="Total de usuarios registrados en el sistema, incluyendo estudiantes, empresas y administradores"
              icon={<PeopleIcon sx={{ fontSize: 32, mr: 1 }} />}
              bgColor="#3b82f6"
              textColor="white"
            />
            
            {/* Empresas - Rojo primario vibrante */}
            <KPICard
              title="Empresas"
              value={totalCompanies}
              description="Empresas activas que han publicado proyectos y están participando en el programa"
              icon={<BusinessIcon sx={{ fontSize: 32, mr: 1 }} />}
              bgColor="#ef4444"
              textColor="white"
            />
            
            {/* Estudiantes - Verde primario vibrante */}
            <KPICard
              title="Estudiantes"
              value={totalStudents}
              description="Estudiantes universitarios activos que pueden aplicar a proyectos y registrar horas de trabajo"
              icon={<SchoolIcon sx={{ fontSize: 32, mr: 1 }} />}
              bgColor="#10b981"
              textColor="white"
            />
            
            {/* Proyectos - Amarillo primario vibrante */}
            <KPICard
              title="Proyectos"
              value={totalProjects}
              description="Proyectos activos disponibles para que los estudiantes apliquen y desarrollen sus habilidades"
              icon={<WorkIcon sx={{ fontSize: 32, mr: 1 }} />}
              bgColor="#f59e0b"
              textColor="white"
            />
            
            {/* Postulaciones - Púrpura primario vibrante */}
            <KPICard
              title="Postulaciones"
              value={pendingApplications}
              description="Aplicaciones de estudiantes a proyectos que están pendientes de revisión por las empresas"
              icon={<PendingIcon sx={{ fontSize: 32, mr: 1, color: '#ffffff' }} />}
              bgColor="#8b5cf6"
              textColor="white"
            />
            
            {/* Asignaciones de Strikes - Naranja primario vibrante */}
            <KPICard
              title="Asignaciones de Strikes"
              value={strikesAlerts}
              description="Reportes de incidencias pendientes que requieren revisión administrativa y posible asignación de strikes"
              icon={<PendingIcon sx={{ fontSize: 32, mr: 1 }} />}
              bgColor="#f97316"
              textColor="white"
            />
          </Box>

          {/* Top 10 Estudiantes */}
          <TopStudentsRanking topStudents={stats.top_students || []} />
        </>
      )}
    </Box>
  );
} 