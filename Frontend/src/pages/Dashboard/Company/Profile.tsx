import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Button,
  TextField,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Edit as EditIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Web as WebIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';

interface CompanyProfileData {
  id: string;
  name: string;
  description: string;
  industry: string;
  location: string;
  phone: string;
  email: string;
  website: string;
  rating: number;
  totalProjects: number;
  activeStudents: number;
  completedProjects: number;
  averageRating: number;
}

const mockCompanyProfile: CompanyProfileData = {
  id: '1',
  name: 'TechCorp Solutions',
  description: 'Empresa líder en desarrollo de software y soluciones tecnológicas innovadoras.',
  industry: 'Tecnología',
  location: 'Santiago, Chile',
  phone: '+56 9 1234 5678',
  email: 'contacto@techcorp.cl',
  website: 'www.techcorp.cl',
  rating: 4.5,
  totalProjects: 25,
  activeStudents: 8,
  completedProjects: 17,
  averageRating: 4.2,
};

export const CompanyProfile: React.FC = () => {
  const [profile, setProfile] = useState<CompanyProfileData>(mockCompanyProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<CompanyProfileData>(profile);

  const handleEdit = () => {
    setEditData(profile);
    setIsEditing(true);
  };

  const handleSave = () => {
    setProfile(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(profile);
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof CompanyProfileData, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Perfil de Empresa
        </Typography>
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={handleEdit}
        >
          Editar Perfil
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {/* Información Principal */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '2 1 0' } }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar sx={{ width: 80, height: 80, mr: 2, bgcolor: 'primary.main' }}>
                <BusinessIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Box>
                <Typography variant="h5" gutterBottom>
                  {profile.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <StarIcon sx={{ color: 'warning.main', mr: 1 }} />
                  <Typography variant="body1">
                    {profile.rating} / 5.0
                  </Typography>
                </Box>
                <Chip label={profile.industry} color="primary" size="small" />
              </Box>
            </Box>

            <Typography variant="body1" paragraph>
              {profile.description}
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">{profile.location}</Typography>
                </Box>
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">{profile.phone}</Typography>
                </Box>
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">{profile.email}</Typography>
                </Box>
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <WebIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">{profile.website}</Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Estadísticas */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 0' } }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Estadísticas
            </Typography>
            
            <Card sx={{ mb: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AssignmentIcon sx={{ mr: 1 }} />
                  <Box>
                    <Typography variant="h4">{profile.totalProjects}</Typography>
                    <Typography variant="body2">Total Proyectos</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ mb: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PeopleIcon sx={{ mr: 1 }} />
                  <Box>
                    <Typography variant="h4">{profile.activeStudents}</Typography>
                    <Typography variant="body2">Estudiantes Activos</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ mb: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingUpIcon sx={{ mr: 1 }} />
                  <Box>
                    <Typography variant="h4">{profile.completedProjects}</Typography>
                    <Typography variant="body2">Proyectos Completados</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <StarIcon sx={{ mr: 1 }} />
                  <Box>
                    <Typography variant="h4">{profile.averageRating}</Typography>
                    <Typography variant="body2">Rating Promedio</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Paper>
        </Box>
      </Box>

      {/* Dialog para editar perfil */}
      <Dialog open={isEditing} onClose={handleCancel} maxWidth="md" fullWidth>
        <DialogTitle>Editar Perfil de Empresa</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
              <TextField
                fullWidth
                label="Nombre de la Empresa"
                value={editData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                margin="normal"
              />
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
              <TextField
                fullWidth
                label="Industria"
                value={editData.industry}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                margin="normal"
              />
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
              <TextField
                fullWidth
                label="Ubicación"
                value={editData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                margin="normal"
              />
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
              <TextField
                fullWidth
                label="Teléfono"
                value={editData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                margin="normal"
              />
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
              <TextField
                fullWidth
                label="Email"
                value={editData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                margin="normal"
              />
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
              <TextField
                fullWidth
                label="Sitio Web"
                value={editData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                margin="normal"
              />
            </Box>
            <Box sx={{ flex: '1 1 100%' }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Descripción"
                value={editData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                margin="normal"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CompanyProfile;
