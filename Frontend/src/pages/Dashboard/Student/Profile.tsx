import { useState } from 'react';
import type { ChangeEvent as ReactChangeEvent, FormEvent as ReactFormEvent } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  CardActions,
  Alert,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Upload as UploadIcon,
  LinkedIn as LinkedInIcon,
  GitHub as GitHubIcon,
  Language as LanguageIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';

interface Skill {
  id: number;
  name: string;
  level: string;
}

interface Certificate {
  id: number;
  name: string;
  issuer: string;
  date: string;
  url: string;
}

interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  linkedin: string;
  github: string;
  website: string;
}

interface ProfileData {
  personalInfo: PersonalInfo;
  skills: Skill[];
  certificates: Certificate[];
  cv: {
    url: string;
    lastUpdated: string;
  };
}

// Mock de datos iniciales
const initialProfile: ProfileData = {
  personalInfo: {
    name: 'Juan Pérez',
    email: 'juan.perez@email.com',
    phone: '+51 999 888 777',
    location: 'Lima, Perú',
    bio: 'Estudiante de Ingeniería de Software apasionado por el desarrollo web y la inteligencia artificial.',
    linkedin: 'linkedin.com/in/juanperez',
    github: 'github.com/juanperez',
    website: 'juanperez.dev',
  },
  skills: [
    { id: 1, name: 'React', level: 'Avanzado' },
    { id: 2, name: 'Node.js', level: 'Intermedio' },
    { id: 3, name: 'Python', level: 'Avanzado' },
    { id: 4, name: 'SQL', level: 'Intermedio' },
  ],
  certificates: [
    {
      id: 1,
      name: 'AWS Certified Developer',
      issuer: 'Amazon Web Services',
      date: '2024-01-15',
      url: 'https://example.com/cert1',
    },
    {
      id: 2,
      name: 'React Advanced Concepts',
      issuer: 'Udemy',
      date: '2023-12-10',
      url: 'https://example.com/cert2',
    },
  ],
  cv: {
    url: 'https://example.com/cv.pdf',
    lastUpdated: '2024-03-01',
  },
};

export default function Profile() {
  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState<Omit<Skill, 'id'>>({ name: '', level: '' });
  const [newCertificate, setNewCertificate] = useState<Omit<Certificate, 'id'>>({
    name: '',
    issuer: '',
    date: '',
    url: '',
  });
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSavePersonalInfo = (e: ReactFormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAlert({ type: 'success', message: 'Información personal actualizada' });
    setEditingSection(null);
  };

  const handleAddSkill = () => {
    if (newSkill.name && newSkill.level) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, { id: Date.now(), ...newSkill }],
      }));
      setNewSkill({ name: '', level: '' });
      setAlert({ type: 'success', message: 'Habilidad agregada' });
    }
  };

  const handleDeleteSkill = (id: number) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill.id !== id),
    }));
    setAlert({ type: 'success', message: 'Habilidad eliminada' });
  };

  const handleAddCertificate = () => {
    if (newCertificate.name && newCertificate.issuer) {
      setProfile(prev => ({
        ...prev,
        certificates: [...prev.certificates, { id: Date.now(), ...newCertificate }],
      }));
      setNewCertificate({ name: '', issuer: '', date: '', url: '' });
      setAlert({ type: 'success', message: 'Certificado agregado' });
    }
  };

  const handleDeleteCertificate = (id: number) => {
    setProfile(prev => ({
      ...prev,
      certificates: prev.certificates.filter(cert => cert.id !== id),
    }));
    setAlert({ type: 'success', message: 'Certificado eliminado' });
  };

  const handleCvUpload = (event: ReactChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      setAlert({ type: 'success', message: 'CV actualizado' });
    }
  };

  return (
    <DashboardLayout userRole="student">
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Mi Perfil
        </Typography>

        {alert && (
          <Alert 
            severity={alert.type} 
            onClose={() => setAlert(null)}
            sx={{ mb: 3 }}
          >
            {alert.message}
          </Alert>
        )}

        {/* Información Personal */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Información Personal</Typography>
            <IconButton onClick={() => setEditingSection('personal')}>
              <EditIcon />
            </IconButton>
          </Box>
          
          {editingSection === 'personal' ? (
            <form onSubmit={handleSavePersonalInfo}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
                <Box>
                  <TextField
                    fullWidth
                    label="Nombre Completo"
                    value={profile.personalInfo.name}
                    onChange={(e: ReactChangeEvent<HTMLInputElement>) => setProfile(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, name: e.target.value }
                    }))}
                  />
                </Box>
                <Box>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={profile.personalInfo.email}
                    onChange={(e: ReactChangeEvent<HTMLInputElement>) => setProfile(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, email: e.target.value }
                    }))}
                  />
                </Box>
                <Box>
                  <TextField
                    fullWidth
                    label="Teléfono"
                    value={profile.personalInfo.phone}
                    onChange={(e: ReactChangeEvent<HTMLInputElement>) => setProfile(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, phone: e.target.value }
                    }))}
                  />
                </Box>
                <Box>
                  <TextField
                    fullWidth
                    label="Ubicación"
                    value={profile.personalInfo.location}
                    onChange={(e: ReactChangeEvent<HTMLInputElement>) => setProfile(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, location: e.target.value }
                    }))}
                  />
                </Box>
                <Box sx={{ gridColumn: { md: 'span 2' } }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Biografía"
                    value={profile.personalInfo.bio}
                    onChange={(e: ReactChangeEvent<HTMLInputElement>) => setProfile(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, bio: e.target.value }
                    }))}
                  />
                </Box>
                <Box>
                  <TextField
                    fullWidth
                    label="LinkedIn"
                    value={profile.personalInfo.linkedin}
                    onChange={(e: ReactChangeEvent<HTMLInputElement>) => setProfile(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, linkedin: e.target.value }
                    }))}
                  />
                </Box>
                <Box>
                  <TextField
                    fullWidth
                    label="GitHub"
                    value={profile.personalInfo.github}
                    onChange={(e: ReactChangeEvent<HTMLInputElement>) => setProfile(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, github: e.target.value }
                    }))}
                  />
                </Box>
                <Box sx={{ gridColumn: { md: 'span 2' } }}>
                  <TextField
                    fullWidth
                    label="Sitio Web"
                    value={profile.personalInfo.website}
                    onChange={(e: ReactChangeEvent<HTMLInputElement>) => setProfile(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, website: e.target.value }
                    }))}
                  />
                </Box>
                <Box sx={{ gridColumn: { md: 'span 2' } }}>
                  <Button type="submit" variant="contained" sx={{ mr: 1 }}>
                    Guardar
                  </Button>
                  <Button onClick={() => setEditingSection(null)}>
                    Cancelar
                  </Button>
                </Box>
              </Box>
            </form>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
              <Box>
                <Typography variant="h5" gutterBottom>
                  {profile.personalInfo.name}
                </Typography>
                <Typography variant="body1" paragraph>
                  {profile.personalInfo.bio}
                </Typography>
                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                  <Button
                    startIcon={<LinkedInIcon />}
                    href={`https://${profile.personalInfo.linkedin}`}
                    target="_blank"
                  >
                    LinkedIn
                  </Button>
                  <Button
                    startIcon={<GitHubIcon />}
                    href={`https://${profile.personalInfo.github}`}
                    target="_blank"
                  >
                    GitHub
                  </Button>
                  <Button
                    startIcon={<LanguageIcon />}
                    href={`https://${profile.personalInfo.website}`}
                    target="_blank"
                  >
                    Sitio Web
                  </Button>
                </Stack>
              </Box>
              <List>
                <ListItem>
                  <EmailIcon sx={{ mr: 1 }} />
                  <ListItemText primary={profile.personalInfo.email} />
                </ListItem>
                <ListItem>
                  <PhoneIcon sx={{ mr: 1 }} />
                  <ListItemText primary={profile.personalInfo.phone} />
                </ListItem>
                <ListItem>
                  <LocationIcon sx={{ mr: 1 }} />
                  <ListItemText primary={profile.personalInfo.location} />
                </ListItem>
              </List>
            </Box>
          )}
        </Paper>

        {/* Habilidades */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Habilidades
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, alignItems: 'center' }}>
              <TextField
                fullWidth
                label="Nueva Habilidad"
                value={newSkill.name}
                onChange={(e: ReactChangeEvent<HTMLInputElement>) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
              />
              <TextField
                fullWidth
                select
                label="Nivel"
                value={newSkill.level}
                onChange={(e: ReactChangeEvent<HTMLInputElement>) => setNewSkill(prev => ({ ...prev, level: e.target.value }))}
                SelectProps={{ native: true }}
              >
                <option value="">Seleccionar nivel</option>
                <option value="Básico">Básico</option>
                <option value="Intermedio">Intermedio</option>
                <option value="Avanzado">Avanzado</option>
              </TextField>
              <Button
                fullWidth
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddSkill}
                disabled={!newSkill.name || !newSkill.level}
              >
                Agregar
              </Button>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {profile.skills.map((skill) => (
              <Chip
                key={skill.id}
                label={`${skill.name} (${skill.level})`}
                onDelete={() => handleDeleteSkill(skill.id)}
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
        </Paper>

        {/* Certificados */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Certificados
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
              <TextField
                fullWidth
                label="Nombre del Certificado"
                value={newCertificate.name}
                onChange={(e: ReactChangeEvent<HTMLInputElement>) => setNewCertificate(prev => ({ ...prev, name: e.target.value }))}
              />
              <TextField
                fullWidth
                label="Institución"
                value={newCertificate.issuer}
                onChange={(e: ReactChangeEvent<HTMLInputElement>) => setNewCertificate(prev => ({ ...prev, issuer: e.target.value }))}
              />
              <TextField
                fullWidth
                type="date"
                label="Fecha de Obtención"
                value={newCertificate.date}
                onChange={(e: ReactChangeEvent<HTMLInputElement>) => setNewCertificate(prev => ({ ...prev, date: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="URL del Certificado"
                value={newCertificate.url}
                onChange={(e: ReactChangeEvent<HTMLInputElement>) => setNewCertificate(prev => ({ ...prev, url: e.target.value }))}
              />
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddCertificate}
              disabled={!newCertificate.name || !newCertificate.issuer}
              sx={{ mt: 2 }}
            >
              Agregar Certificado
            </Button>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
            {profile.certificates.map((cert) => (
              <Card key={cert.id}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {cert.name}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    {cert.issuer}
                  </Typography>
                  <Typography variant="body2">
                    Obtenido: {new Date(cert.date).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    href={cert.url}
                    target="_blank"
                  >
                    Ver Certificado
                  </Button>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteCertificate(cert.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            ))}
          </Box>
        </Paper>

        {/* CV */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Curriculum Vitae
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {profile.cv.url ? (
              <>
                <Button
                  variant="outlined"
                  href={profile.cv.url}
                  target="_blank"
                  startIcon={<UploadIcon />}
                >
                  Ver CV Actual
                </Button>
                <Typography variant="body2" color="textSecondary">
                  Última actualización: {new Date(profile.cv.lastUpdated).toLocaleDateString()}
                </Typography>
              </>
            ) : (
              <Typography variant="body2" color="textSecondary">
                No hay CV subido
              </Typography>
            )}
            <Button
              variant="contained"
              component="label"
              startIcon={<UploadIcon />}
            >
              {profile.cv.url ? 'Actualizar CV' : 'Subir CV'}
              <input
                type="file"
                hidden
                accept=".pdf,.doc,.docx"
                onChange={handleCvUpload}
              />
            </Button>
          </Box>
        </Paper>
      </Box>
    </DashboardLayout>
  );
} 