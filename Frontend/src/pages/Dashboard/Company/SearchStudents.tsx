import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  Star as StarIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Language as LanguageIcon,
  GitHub as GitHubIcon,
  LinkedIn as LinkedInIcon,
  Visibility as VisibilityIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { useApi } from '../../../hooks/useApi';
import { adaptStudentList } from '../../../utils/adapters';
import type { Student } from '../../../types';

// Agrega las áreas posibles
const AREAS = [
  'Todas',
  'Informática',
  'Administración',
  'Diseño',
  'Ingeniería',
  'Salud',
  'Educación',
];

export const SearchStudents: React.FC = () => {
  const api = useApi();
  const [students, setStudents] = useState<Student[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('');
  const [areaFilter, setAreaFilter] = useState<string>('Todas');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);

  // Cargar estudiantes al montar el componente
  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 Iniciando carga de estudiantes...');
      
      // Obtener usuarios con rol student
      try {
        const usersResponse = await api.get('/api/users/');
        console.log('🔍 Users response:', usersResponse);
        const studentUsers = usersResponse.data ? usersResponse.data.filter((user: any) => user.role === 'student') : [];
        console.log('👥 Estudiantes encontrados en users:', studentUsers.length);
        setUsers(studentUsers);
      } catch (userError) {
        console.error('❌ Error cargando usuarios:', userError);
        setUsers([]);
      }

      // Obtener perfiles de estudiantes que hayan participado en proyectos
      try {
        const studentsResponse = await api.get('/api/students/');
        console.log('🔍 Students response completa:', studentsResponse);
        
        // Manejar diferentes formatos de respuesta
        let studentsData;
        if (studentsResponse && studentsResponse.results) {
          studentsData = studentsResponse.results;
          console.log('📊 Usando studentsResponse.results');
        } else if (Array.isArray(studentsResponse)) {
          studentsData = studentsResponse;
          console.log('📊 Usando studentsResponse como array');
        } else {
          studentsData = [];
          console.log('📊 No se encontraron datos de estudiantes');
        }
        
        // Filtrar solo estudiantes que hayan completado proyectos
        const studentsWithProjects = studentsData.filter((student: any) => 
          student.completed_projects && student.completed_projects > 0
        );
        
        console.log('📊 Datos de estudiantes sin adaptar:', studentsData);
        console.log('📊 Estudiantes con proyectos:', studentsWithProjects);
        
        if (studentsWithProjects.length > 0) {
          const adaptedStudents = adaptStudentList(studentsWithProjects);
          console.log('✅ Estudiantes adaptados:', adaptedStudents);
          setStudents(adaptedStudents);
        } else {
          console.log('⚠️ No hay estudiantes con proyectos completados');
          setStudents([]);
        }
        
      } catch (studentError) {
        console.error('❌ Error cargando estudiantes:', studentError);
        setStudents([]);
      }
      
    } catch (err: any) {
      console.error('❌ Error general cargando estudiantes:', err);
      setError(err.message || 'Error al cargar estudiantes');
    } finally {
      setLoading(false);
    }
  };

  // Combinar datos de usuario y perfil de estudiante
  const getStudentWithUser = (student: Student): Student & { userData?: any } => {
    const userData = users.find(user => user.id === student.user);
    return { ...student, userData };
  };

  // Obtener todas las habilidades únicas de los estudiantes
  const allSkills = Array.from(
    new Set(
      students.flatMap(student => student.skills || [])
    )
  );

  // Lógica de filtrado incluyendo área
  const filteredStudents = students
    .map(getStudentWithUser)
    .filter(student => {
      const userData = student.userData;
      if (!userData) return false;

      const matchesSearch = 
        userData.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.university?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.career?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesSkills = selectedSkills.length === 0 || 
        selectedSkills.some(skill => student.skills?.includes(skill));
      
    const matchesAvailability = !availabilityFilter || student.availability === availabilityFilter;
      
      const matchesArea = areaFilter === 'Todas' || 
        student.career?.toLowerCase().includes(areaFilter.toLowerCase());
      
    return matchesSearch && matchesSkills && matchesAvailability && matchesArea;
  });

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleContactStudent = (student: Student & { userData?: User }) => {
    setSelectedStudent(student);
    setSelectedUser(student.userData || null);
    setShowContactDialog(true);
  };

  const handleSendMessage = async (student: Student & { userData?: any }) => {
    try {
      const response = await api.post('/api/notifications/send-company-message/', {
        student_id: student.id,
        message: `Interés en colaboración con ${student.userData?.full_name || 'estudiante'}`
      });
      
      if (response.data.success) {
        alert('Mensaje enviado exitosamente. El estudiante recibirá una notificación.');
        setShowContactDialog(false);
      }
    } catch (error: any) {
      console.error('Error enviando mensaje:', error);
      alert('Error al enviar mensaje: ' + (error.response?.data?.error || 'Error desconocido'));
    }
  };

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
        <Button onClick={loadStudents} variant="contained">
          Reintentar
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Estudiantes con Experiencia en Proyectos
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Lista de estudiantes que han participado en proyectos con empresas. Puedes contactarlos enviando un mensaje.
      </Typography>

      {/* Filtros de búsqueda */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' } }}>
              <TextField
                fullWidth
                label="Buscar por nombre, universidad o carrera"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(25% - 12px)' }, minWidth: 180 }}>
              <FormControl fullWidth>
                <InputLabel>Disponibilidad</InputLabel>
                <Select
                  value={availabilityFilter}
                  label="Disponibilidad"
                  onChange={(e) => setAvailabilityFilter(e.target.value)}
                >
                  <MenuItem value="">Todas</MenuItem>
                  <MenuItem value="full-time">Tiempo completo</MenuItem>
                  <MenuItem value="part-time">Tiempo parcial</MenuItem>
                  <MenuItem value="flexible">Flexible</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(25% - 12px)' }, minWidth: 180 }}>
              <FormControl fullWidth>
                <InputLabel>Área</InputLabel>
                <Select
                  value={areaFilter}
                  label="Área"
                  onChange={(e) => setAreaFilter(e.target.value)}
                >
                  {AREAS.map(area => (
                    <MenuItem key={area} value={area}>{area}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: '1 1 100%' }}>
              <Typography variant="subtitle2" gutterBottom>
                <FilterIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Filtros por habilidades:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {allSkills.map((skill) => (
                  <Chip
                    key={skill}
                    label={skill}
                    onClick={() => handleSkillToggle(skill)}
                    color={selectedSkills.includes(skill) ? 'primary' : 'default'}
                    variant={selectedSkills.includes(skill) ? 'filled' : 'outlined'}
                    size="small"
                  />
                ))}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Lista de estudiantes */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {filteredStudents.map((student) => {
          const userData = student.userData;
          if (!userData) return null;

          return (
          <Box key={student.id} sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)', lg: '1 1 calc(33.333% - 16px)' } }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                    <PersonIcon />
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {userData.full_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <EmailIcon sx={{ mr: 1, fontSize: 16, verticalAlign: 'middle' }} />
                      {userData.email}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <StarIcon sx={{ mr: 1, fontSize: 16, verticalAlign: 'middle' }} />
                      Nivel API: {student.api_level}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <WorkIcon sx={{ mr: 1, fontSize: 16, verticalAlign: 'middle' }} />
                      {student.completed_projects} proyectos completados
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  color="primary"
                  startIcon={<SendIcon />}
                  onClick={() => handleContactStudent(student)}
                  fullWidth
                >
                  Mandar Mensaje
                </Button>
              </CardActions>
            </Card>
          </Box>
          );
        })}
      </Box>

      {/* Mensaje cuando no hay resultados */}
      {filteredStudents.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No se encontraron estudiantes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Intenta ajustar los filtros de búsqueda
          </Typography>
        </Box>
      )}

      {/* Dialog de detalles del estudiante */}
      <Dialog open={showDetailDialog} onClose={() => setShowDetailDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Detalles del Estudiante</DialogTitle>
        <DialogContent>
          {selectedStudent && selectedUser && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ mr: 2, width: 80, height: 80, bgcolor: 'primary.main' }}>
                  <PersonIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Box>
                  <Typography variant="h5" gutterBottom>
                    {selectedUser.full_name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Rating value={Number(selectedStudent.rating)} readOnly />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      ({selectedStudent.rating}) - {selectedStudent.completed_projects} proyectos
                    </Typography>
                  </Box>
                  <Chip
                    label={selectedStudent.availability === 'full-time' ? 'Tiempo completo' : 
                           selectedStudent.availability === 'part-time' ? 'Tiempo parcial' : 'Flexible'}
                    color="primary"
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' } }}>
                  <Typography variant="h6" gutterBottom>
                    Información Académica
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="Universidad"
                        secondary={selectedStudent.university || 'No especificada'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Carrera"
                        secondary={selectedStudent.career || 'No especificada'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Semestre"
                        secondary={selectedStudent.semester ? `${selectedStudent.semester}° semestre` : 'No especificado'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Años de experiencia"
                        secondary={`${selectedStudent.experience_years || 0} años`}
                      />
                    </ListItem>
                  </List>
                </Box>

                <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' } }}>
                  <Typography variant="h6" gutterBottom>
                    Contacto
                  </Typography>
                  <List dense>
                    <ListItem>
                      <EmailIcon sx={{ mr: 2, color: 'text.secondary' }} />
                      <ListItemText primary={selectedUser.email} />
                    </ListItem>
                    <ListItem>
                      <PhoneIcon sx={{ mr: 2, color: 'text.secondary' }} />
                      <ListItemText primary={selectedUser.phone || 'No especificado'} />
                    </ListItem>
                    <ListItem>
                      <LanguageIcon sx={{ mr: 2, color: 'text.secondary' }} />
                      <ListItemText primary={selectedStudent.location || 'No especificada'} />
                    </ListItem>
                  </List>
                </Box>

                <Box sx={{ flex: '1 1 100%' }}>
                  <Typography variant="h6" gutterBottom>
                    Habilidades
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {(selectedStudent.skills || []).map((skill) => (
                      <Chip key={skill} label={skill} color="primary" />
                    ))}
                    {(selectedStudent.skills || []).length === 0 && (
                      <Typography variant="body2" color="text.secondary">
                        No se han especificado habilidades
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Box sx={{ flex: '1 1 100%' }}>
                  <Typography variant="h6" gutterBottom>
                    Idiomas
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {(selectedStudent.languages || []).map((language) => (
                      <Chip key={language} label={language} variant="outlined" />
                    ))}
                    {(selectedStudent.languages || []).length === 0 && (
                      <Typography variant="body2" color="text.secondary">
                        No se han especificado idiomas
                  </Typography>
                    )}
                  </Box>
                </Box>

                <Box sx={{ flex: '1 1 100%' }}>
                  <Typography variant="h6" gutterBottom>
                    Enlaces
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    {selectedStudent.github_url && (
                    <Button
                      startIcon={<GitHubIcon />}
                        href={selectedStudent.github_url}
                      target="_blank"
                      variant="outlined"
                      size="small"
                    >
                      GitHub
                    </Button>
                    )}
                    {selectedStudent.linkedin_url && (
                    <Button
                      startIcon={<LinkedInIcon />}
                        href={selectedStudent.linkedin_url}
                      target="_blank"
                      variant="outlined"
                      size="small"
                    >
                      LinkedIn
                    </Button>
                    )}
                    {selectedStudent.portfolio_url && (
                    <Button
                      startIcon={<LanguageIcon />}
                        href={selectedStudent.portfolio_url}
                      target="_blank"
                      variant="outlined"
                      size="small"
                    >
                      Portfolio
                    </Button>
                    )}
                    {!selectedStudent.github_url && !selectedStudent.linkedin_url && !selectedStudent.portfolio_url && (
                      <Typography variant="body2" color="text.secondary">
                        No se han especificado enlaces
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetailDialog(false)}>Cerrar</Button>
          <Button
            onClick={() => {
              setShowDetailDialog(false);
              if (selectedStudent && selectedUser) {
                handleContactStudent({ ...selectedStudent, userData: selectedUser });
              }
            }}
            variant="contained"
            color="primary"
          >
            Contactar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de contacto */}
      <Dialog open={showContactDialog} onClose={() => setShowContactDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Mandar Mensaje</DialogTitle>
        <DialogContent>
          {selectedStudent && selectedUser && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" gutterBottom>
                ¿Deseas enviar un mensaje a <strong>{selectedUser.full_name}</strong>?
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Se enviará una notificación al estudiante indicando que tu empresa se quiere comunicar con él/ella a través de su correo institucional.
              </Typography>
              <List dense>
                <ListItem>
                  <EmailIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <ListItemText primary={selectedUser.email} />
                </ListItem>
                <ListItem>
                  <StarIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <ListItemText primary={`Nivel API: ${selectedStudent.api_level}`} />
                </ListItem>
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowContactDialog(false)}>Cancelar</Button>
          <Button
            onClick={() => handleSendMessage({ ...selectedStudent!, userData: selectedUser! })}
            variant="contained"
            color="primary"
          >
            Enviar Mensaje
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SearchStudents;
