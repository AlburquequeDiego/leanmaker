import React, { useState } from 'react';
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

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  university: string;
  career: string;
  semester: number;
  skills: string[];
  experience: string;
  rating: number;
  projectsCompleted: number;
  github: string;
  linkedin: string;
  portfolio: string;
  availability: 'full-time' | 'part-time' | 'flexible';
  location: string;
  languages: string[];
}

const mockStudents: Student[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    email: 'juan.perez@email.com',
    phone: '+56 9 1234 5678',
    avatar: '',
    university: 'Universidad de Chile',
    career: 'Ingeniería Civil en Informática',
    semester: 8,
    skills: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'Git'],
    experience: '2 años desarrollando aplicaciones web',
    rating: 4.5,
    projectsCompleted: 3,
    github: 'https://github.com/juanperez',
    linkedin: 'https://linkedin.com/in/juanperez',
    portfolio: 'https://juanperez.dev',
    availability: 'full-time',
    location: 'Santiago, Chile',
    languages: ['Español', 'Inglés'],
  },
  {
    id: '2',
    name: 'María González',
    email: 'maria.gonzalez@email.com',
    phone: '+56 9 8765 4321',
    avatar: '',
    university: 'Pontificia Universidad Católica',
    career: 'Ingeniería Civil en Computación',
    semester: 7,
    skills: ['Python', 'Django', 'PostgreSQL', 'Docker', 'AWS'],
    experience: '1.5 años en desarrollo backend',
    rating: 4.2,
    projectsCompleted: 2,
    github: 'https://github.com/mariagonzalez',
    linkedin: 'https://linkedin.com/in/mariagonzalez',
    portfolio: 'https://mariagonzalez.dev',
    availability: 'part-time',
    location: 'Valparaíso, Chile',
    languages: ['Español', 'Inglés', 'Portugués'],
  },
  {
    id: '3',
    name: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@email.com',
    phone: '+56 9 5555 1234',
    avatar: '',
    university: 'Universidad Técnica Federico Santa María',
    career: 'Ingeniería Civil Informática',
    semester: 9,
    skills: ['Java', 'Spring Boot', 'MySQL', 'React Native', 'Firebase'],
    experience: '3 años en desarrollo móvil y backend',
    rating: 4.8,
    projectsCompleted: 5,
    github: 'https://github.com/carlosrodriguez',
    linkedin: 'https://linkedin.com/in/carlosrodriguez',
    portfolio: 'https://carlosrodriguez.dev',
    availability: 'flexible',
    location: 'Concepción, Chile',
    languages: ['Español', 'Inglés'],
  },
];

export const SearchStudents: React.FC = () => {
  const students = mockStudents;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);

  const allSkills = Array.from(new Set(students.flatMap(student => student.skills)));

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.university.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.career.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSkills = selectedSkills.length === 0 || 
                         selectedSkills.some(skill => student.skills.includes(skill));
    
    const matchesAvailability = !availabilityFilter || student.availability === availabilityFilter;

    return matchesSearch && matchesSkills && matchesAvailability;
  });

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleContactStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowContactDialog(true);
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Buscar Estudiantes
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
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' } }}>
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
        {filteredStudents.map((student) => (
          <Box key={student.id} sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)', lg: '1 1 calc(33.333% - 16px)' } }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                    <PersonIcon />
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {student.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating value={student.rating} readOnly size="small" />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        ({student.rating})
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <SchoolIcon sx={{ mr: 1, fontSize: 16, verticalAlign: 'middle' }} />
                  {student.university}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <WorkIcon sx={{ mr: 1, fontSize: 16, verticalAlign: 'middle' }} />
                  {student.career} - {student.semester}° semestre
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <StarIcon sx={{ mr: 1, fontSize: 16, verticalAlign: 'middle' }} />
                  {student.projectsCompleted} proyectos completados
                </Typography>

                <Box sx={{ mt: 2, mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Habilidades:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {student.skills.slice(0, 4).map((skill) => (
                      <Chip
                        key={skill}
                        label={skill}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                    {student.skills.length > 4 && (
                      <Chip
                        label={`+${student.skills.length - 4}`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Box>

                <Chip
                  label={student.availability === 'full-time' ? 'Tiempo completo' : 
                         student.availability === 'part-time' ? 'Tiempo parcial' : 'Flexible'}
                  color="primary"
                  size="small"
                  sx={{ mb: 2 }}
                />
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  startIcon={<VisibilityIcon />}
                  onClick={() => {
                    setSelectedStudent(student);
                    setShowDetailDialog(true);
                  }}
                >
                  Ver Detalles
                </Button>
                <Button
                  size="small"
                  color="primary"
                  startIcon={<SendIcon />}
                  onClick={() => handleContactStudent(student)}
                >
                  Contactar
                </Button>
              </CardActions>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Dialog de detalles del estudiante */}
      <Dialog open={showDetailDialog} onClose={() => setShowDetailDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Detalles del Estudiante</DialogTitle>
        <DialogContent>
          {selectedStudent && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ mr: 2, width: 80, height: 80, bgcolor: 'primary.main' }}>
                  <PersonIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Box>
                  <Typography variant="h5" gutterBottom>
                    {selectedStudent.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Rating value={selectedStudent.rating} readOnly />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      ({selectedStudent.rating}) - {selectedStudent.projectsCompleted} proyectos
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
                        secondary={selectedStudent.university}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Carrera"
                        secondary={selectedStudent.career}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Semestre"
                        secondary={`${selectedStudent.semester}° semestre`}
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
                      <ListItemText primary={selectedStudent.email} />
                    </ListItem>
                    <ListItem>
                      <PhoneIcon sx={{ mr: 2, color: 'text.secondary' }} />
                      <ListItemText primary={selectedStudent.phone} />
                    </ListItem>
                    <ListItem>
                      <LanguageIcon sx={{ mr: 2, color: 'text.secondary' }} />
                      <ListItemText primary={selectedStudent.location} />
                    </ListItem>
                  </List>
                </Box>

                <Box sx={{ flex: '1 1 100%' }}>
                  <Typography variant="h6" gutterBottom>
                    Habilidades
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedStudent.skills.map((skill) => (
                      <Chip key={skill} label={skill} color="primary" />
                    ))}
                  </Box>
                </Box>

                <Box sx={{ flex: '1 1 100%' }}>
                  <Typography variant="h6" gutterBottom>
                    Experiencia
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {selectedStudent.experience}
                  </Typography>
                </Box>

                <Box sx={{ flex: '1 1 100%' }}>
                  <Typography variant="h6" gutterBottom>
                    Enlaces
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      startIcon={<GitHubIcon />}
                      href={selectedStudent.github}
                      target="_blank"
                      variant="outlined"
                      size="small"
                    >
                      GitHub
                    </Button>
                    <Button
                      startIcon={<LinkedInIcon />}
                      href={selectedStudent.linkedin}
                      target="_blank"
                      variant="outlined"
                      size="small"
                    >
                      LinkedIn
                    </Button>
                    <Button
                      startIcon={<LanguageIcon />}
                      href={selectedStudent.portfolio}
                      target="_blank"
                      variant="outlined"
                      size="small"
                    >
                      Portfolio
                    </Button>
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
              handleContactStudent(selectedStudent!);
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
        <DialogTitle>Contactar Estudiante</DialogTitle>
        <DialogContent>
          {selectedStudent && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" gutterBottom>
                ¿Deseas contactar a <strong>{selectedStudent.name}</strong>?
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Se enviará una notificación al estudiante con tu interés en trabajar con él/ella.
              </Typography>
              <List dense>
                <ListItem>
                  <EmailIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <ListItemText primary={selectedStudent.email} />
                </ListItem>
                <ListItem>
                  <PhoneIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <ListItemText primary={selectedStudent.phone} />
                </ListItem>
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowContactDialog(false)}>Cancelar</Button>
          <Button
            onClick={() => {
              // Aquí se implementaría la lógica para contactar al estudiante
              setShowContactDialog(false);
            }}
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
