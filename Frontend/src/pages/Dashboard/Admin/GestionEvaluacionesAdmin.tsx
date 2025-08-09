import { useState } from 'react';
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
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useTheme } from '../../../contexts/ThemeContext';

interface Evaluation {
  id: string;
  student_name: string;
  company_name: string;
  project_title: string;
  score: number;
  status: 'pending' | 'completed' | 'flagged';
  evaluator_type: 'company' | 'student';
}

interface StrikeReport {
  id: string;
  student_name: string;
  company_name: string;
  project_title: string;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
}

export const GestionEvaluacionesAdmin = () => {
  const { themeMode } = useTheme();
  const [evaluations] = useState<Evaluation[]>([]);
  const [strikeReports] = useState<StrikeReport[]>([]);
  const [showLimit, setShowLimit] = useState(15);

  // Estadísticas calculadas
  const totalEvaluations = evaluations.length;
  const companyToStudentEvaluations = evaluations.filter(e => e.evaluator_type === 'company').length;
  const studentToCompanyEvaluations = evaluations.filter(e => e.evaluator_type === 'student').length;
  const totalStrikes = strikeReports.length;

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
                <AssessmentIcon sx={{ color: 'white', fontSize: 32 }} />
              </Box>
        <Box>
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold', mb: 0.5, textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
                  Gestión de Evaluaciones
          </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>
                  Administra y revisa todas las evaluaciones y reportes de strikes en la plataforma
              </Typography>
            </Box>
          </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Estadísticas con colores suaves - 3 tarjetas */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
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
                {totalEvaluations}
              </Typography>
              <Avatar sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.2)', 
                width: 64, 
                height: 64 
              }}>
                <AssessmentIcon sx={{ fontSize: 32, color: 'white' }} />
              </Avatar>
            </Box>
            <Typography variant="h6" fontWeight={600} sx={{ fontSize: { xs: '1rem', md: '1.1rem' } }}>
              Total Evaluaciones
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
                {totalStrikes}
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
              Reportes de Strikes
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
                {companyToStudentEvaluations + studentToCompanyEvaluations}
              </Typography>
              <Avatar sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.2)', 
                width: 64, 
                height: 64 
              }}>
                <CheckCircleIcon sx={{ fontSize: 32, color: 'white' }} />
              </Avatar>
      </Box>
            <Typography variant="h6" fontWeight={600} sx={{ fontSize: { xs: '1rem', md: '1.1rem' } }}>
              Evaluaciones Mutuas
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Sección 1: Evaluaciones de Empresa a Estudiante */}
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
              <BusinessIcon sx={{ fontSize: 24, color: 'white' }} />
              <Typography variant="h6" fontWeight={700}>
                Evaluaciones de Empresa a Estudiante
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
            Revisa las evaluaciones que las empresas realizan a los estudiantes por proyecto
              </Typography>
          </Box>

        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Avatar sx={{ 
            width: 80, 
            height: 80, 
            bgcolor: themeMode === 'dark' ? '#64748b' : '#e2e8f0', 
            mx: 'auto', 
            mb: 3 
          }}>
            <BusinessIcon sx={{ fontSize: 40, color: themeMode === 'dark' ? '#94a3b8' : '#64748b' }} />
                          </Avatar>
          <Typography variant="h5" sx={{ 
            fontWeight: 600, 
            mb: 1,
            color: themeMode === 'dark' ? '#ffffff' : '#1e293b'
          }}>
            No hay evaluaciones de empresa a estudiante aún
                            </Typography>
          <Typography variant="body1" sx={{ 
            mb: 3,
            color: themeMode === 'dark' ? '#cbd5e1' : '#64748b'
          }}>
            Las evaluaciones aparecerán aquí una vez que las empresas evalúen a los estudiantes
                            </Typography>
                          </Box>
      </Card>

      {/* Sección 2: Evaluaciones de Estudiante a Empresa */}
      <Card sx={{ 
        mb: 4, 
        border: themeMode === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
        bgcolor: themeMode === 'dark' ? '#1e293b' : 'white',
        overflow: 'hidden'
      }}>
        <Box sx={{ 
          p: 3, 
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <PersonIcon sx={{ fontSize: 24, color: 'white' }} />
              <Typography variant="h6" fontWeight={700}>
                Evaluaciones de Estudiante a Empresa
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
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#10b981' }
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
            Revisa las evaluaciones que los estudiantes realizan a las empresas
                          </Typography>
                        </Box>
        
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Avatar sx={{ 
            width: 80, 
            height: 80, 
            bgcolor: themeMode === 'dark' ? '#64748b' : '#e2e8f0', 
            mx: 'auto', 
            mb: 3 
          }}>
            <PersonIcon sx={{ fontSize: 40, color: themeMode === 'dark' ? '#94a3b8' : '#64748b' }} />
          </Avatar>
          <Typography variant="h5" sx={{ 
            fontWeight: 600, 
            mb: 1,
            color: themeMode === 'dark' ? '#ffffff' : '#1e293b'
          }}>
            No hay evaluaciones de estudiante a empresa aún
            </Typography>
          <Typography variant="body1" sx={{ 
            mb: 3,
            color: themeMode === 'dark' ? '#cbd5e1' : '#64748b'
          }}>
            Las evaluaciones aparecerán aquí una vez que los estudiantes evalúen a las empresas
            </Typography>
          </Box>
      </Card>

      {/* Sección 3: Strikes de Empresa a Estudiantes */}
      <Card sx={{ 
        mb: 4, 
        border: themeMode === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
        bgcolor: themeMode === 'dark' ? '#1e293b' : 'white',
        overflow: 'hidden'
      }}>
        <Box sx={{ 
          p: 3, 
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <WarningIcon sx={{ fontSize: 24, color: 'white' }} />
              <Typography variant="h6" fontWeight={700}>
                Strikes de Empresa a Estudiantes
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
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#ef4444' }
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
            Gestiona los reportes de strikes que las empresas envían sobre estudiantes
                    </Typography>
                  </Box>
                  
        <Box sx={{ p: 4, textAlign: 'center' }}>
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
            No hay reportes de strikes aún
          </Typography>
          <Typography variant="body1" sx={{ 
            mb: 3,
            color: themeMode === 'dark' ? '#cbd5e1' : '#64748b'
          }}>
            Los reportes de strikes aparecerán aquí una vez que las empresas los envíen
                  </Typography>
                  </Box>
              </Card>
    </Box>
  );
};

export default GestionEvaluacionesAdmin; 