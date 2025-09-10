/**
 * 🎓 TEACHER CHALLENGES - TOMA DE DESAFÍOS ACADÉMICOS
 * 
 * DESCRIPCIÓN:
 * Esta interfaz permite al docente gestionar y tomar desafíos académicos colectivos
 * publicados por las empresas para sus estudiantes.
 * 
 * FUNCIONALIDADES PRINCIPALES:
 * - Ver desafíos disponibles
 * - Tomar desafíos para sus estudiantes
 * - Gestionar desafíos asignados
 * - Seguimiento del progreso
 * 
 * AUTOR: Sistema LeanMaker
 * FECHA: 2024
 * VERSIÓN: 1.0
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  Divider,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  EmojiEvents as EmojiEventsIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as AccessTimeIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Info as InfoIcon,
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useTheme } from '../../../contexts/ThemeContext';

interface Challenge {
  id: string;
  title: string;
  description: string;
  company: string;
  area: string;
  period_type: 'trimestral' | 'semestral';
  academic_year: string;
  status: 'available' | 'taken' | 'completed';
  students_needed: number;
  current_students: number;
  deadline: string;
  requirements: string;
  benefits: string[];
  technologies: string[];
}

export const TeacherChallenges: React.FC = () => {
  const { themeMode } = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [showTakeDialog, setShowTakeDialog] = useState(false);
  const [studentsToAssign, setStudentsToAssign] = useState<number>(1);

  // Datos de ejemplo (será reemplazado por API real)
  useEffect(() => {
    const mockChallenges: Challenge[] = [
      {
        id: '1',
        title: 'Optimización del Sistema de Inventario con IA',
        description: 'Desarrollar un sistema inteligente para optimizar el inventario de una empresa retail',
        company: 'TechCorp Solutions',
        area: 'Tecnología',
        period_type: 'trimestral',
        academic_year: '2024',
        status: 'available',
        students_needed: 4,
        current_students: 0,
        deadline: '2024-12-31',
        requirements: 'Conocimientos en Python, Machine Learning y bases de datos',
        benefits: ['Certificado', 'Oportunidad de empleo', 'Mentoría técnica'],
        technologies: ['Python', 'TensorFlow', 'PostgreSQL', 'Docker']
      },
      {
        id: '2',
        title: 'Plataforma de E-commerce Sostenible',
        description: 'Crear una plataforma de comercio electrónico enfocada en productos sostenibles',
        company: 'EcoMarket',
        area: 'Negocios',
        period_type: 'semestral',
        academic_year: '2024',
        status: 'available',
        students_needed: 6,
        current_students: 0,
        deadline: '2025-06-30',
        requirements: 'Experiencia en desarrollo web y diseño UX/UI',
        benefits: ['Premio económico', 'Certificado', 'Networking'],
        technologies: ['React', 'Node.js', 'MongoDB', 'Figma']
      }
    ];

    setTimeout(() => {
      setChallenges(mockChallenges);
      setLoading(false);
    }, 1000);
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleTakeChallenge = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setShowTakeDialog(true);
  };

  const handleConfirmTake = () => {
    if (selectedChallenge) {
      // Aquí se implementará la lógica para tomar el desafío
      console.log('Tomando desafío:', selectedChallenge.title, 'con', studentsToAssign, 'estudiantes');
      setShowTakeDialog(false);
      setSelectedChallenge(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'success';
      case 'taken': return 'warning';
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Disponible';
      case 'taken': return 'Tomado';
      case 'completed': return 'Completado';
      default: return 'Desconocido';
    }
  };

  const getPeriodText = (period: string) => {
    return period === 'trimestral' ? 'Trimestral (3 meses)' : 'Semestral (6 meses)';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Cargando desafíos académicos...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header principal mejorado */}
      <Box sx={{ 
        mb: 4,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 4,
        p: 4,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
      }}>
        {/* Elementos decorativos */}
        <Box sx={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 100,
          height: 100,
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          zIndex: 1
        }} />
        <Box sx={{
          position: 'absolute',
          bottom: -30,
          left: -30,
          width: 80,
          height: 80,
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '50%',
          zIndex: 1
        }} />
        
        {/* Contenido del header */}
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Typography 
            variant="h3" 
            fontWeight={700} 
            sx={{ 
              color: 'white', 
              mb: 1,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            🎯 Desafíos Académicos Disponibles
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: 400,
              textShadow: '0 1px 2px rgba(0,0,0,0.2)'
            }}
          >
            Descubre y toma desafíos empresariales para que tus estudiantes desarrollen proyectos reales y adquieran experiencia práctica
          </Typography>
        </Box>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
          <Tab 
            label="Desafíos Disponibles" 
            icon={<EmojiEventsIcon />}
            iconPosition="start"
          />
          <Tab 
            label="Mis Desafíos" 
            icon={<AssignmentIcon />}
            iconPosition="start"
          />
          <Tab 
            label="Historial" 
            icon={<TrendingUpIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Contenido de las tabs */}
      {activeTab === 0 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight={600}>
              Desafíos Disponibles ({challenges.filter(c => c.status === 'available').length})
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<SearchIcon />}
                sx={{ minWidth: 120 }}
              >
                Buscar
              </Button>
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                sx={{ minWidth: 120 }}
              >
                Filtrar
              </Button>
            </Box>
          </Box>

          {challenges.filter(c => c.status === 'available').length === 0 ? (
            <Alert severity="info" sx={{ mb: 3 }}>
              No hay desafíos disponibles en este momento. Revisa más tarde.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {challenges.filter(c => c.status === 'available').map((challenge) => (
                <Grid item xs={12} md={6} lg={4} key={challenge.id}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Chip 
                          label={getStatusText(challenge.status)}
                          color={getStatusColor(challenge.status) as any}
                          size="small"
                        />
                        <Chip 
                          label={getPeriodText(challenge.period_type)}
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                      </Box>

                      <Typography variant="h6" fontWeight={600} sx={{ mb: 1, color: 'primary.main' }}>
                        {challenge.title}
                      </Typography>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {challenge.description}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: 'primary.main' }}>
                          <SchoolIcon sx={{ fontSize: 16 }} />
                        </Avatar>
                        <Typography variant="body2" fontWeight={500}>
                          {challenge.company}
                        </Typography>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                          📋 Requisitos:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {challenge.requirements}
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                          ⚙️ Tecnologías:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {challenge.technologies.map((tech, index) => (
                            <Chip key={index} label={tech} size="small" variant="outlined" />
                          ))}
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PeopleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {challenge.current_students}/{challenge.students_needed} estudiantes
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {challenge.deadline}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>

                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<AddIcon />}
                        onClick={() => handleTakeChallenge(challenge)}
                        sx={{ 
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                          }
                        }}
                      >
                        Tomar Desafío
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
            Mis Desafíos Asignados
          </Typography>
          <Alert severity="info">
            No tienes desafíos asignados actualmente. Toma un desafío disponible para comenzar.
          </Alert>
        </Box>
      )}

      {activeTab === 2 && (
        <Box>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
            Historial de Desafíos
          </Typography>
          <Alert severity="info">
            Tu historial de desafíos aparecerá aquí una vez que completes algunos desafíos.
          </Alert>
        </Box>
      )}

      {/* Dialog para tomar desafío */}
      <Dialog 
        open={showTakeDialog} 
        onClose={() => setShowTakeDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmojiEventsIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h6" fontWeight={600}>
              Tomar Desafío Académico
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedChallenge && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                {selectedChallenge.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {selectedChallenge.description}
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Número de Estudiantes</InputLabel>
                <Select
                  value={studentsToAssign}
                  onChange={(e) => setStudentsToAssign(Number(e.target.value))}
                  label="Número de Estudiantes"
                >
                  {Array.from({ length: selectedChallenge.students_needed }, (_, i) => i + 1).map((num) => (
                    <MenuItem key={num} value={num}>
                      {num} estudiante{num > 1 ? 's' : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Alert severity="info" sx={{ mt: 2 }}>
                Al tomar este desafío, se asignará a tus estudiantes seleccionados y comenzará el seguimiento del progreso.
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTakeDialog(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmTake}
            variant="contained"
            sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              }
            }}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeacherChallenges;
