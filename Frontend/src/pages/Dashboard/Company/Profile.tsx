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
  MenuItem,
  Divider,
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
  Person as PersonIcon,
  Badge as BadgeIcon,
} from '@mui/icons-material';

interface CompanyProfileData {
  // Datos de la empresa
  id: string;
  rut: string;
  personalidad: 'Jurídica' | 'Natural';
  razonSocial: string;
  nombreEmpresa: string;
  direccion: string;
  telefonoEmpresa: string;
  email: string;
  website: string;
  description: string;
  industry: string;
  // Datos del responsable
  nombreResponsable: string;
  apellidoResponsable: string;
  correoResponsable: string;
  telefonoResponsable: string;
  fechaNacimientoResponsable: string;
  generoResponsable: string;
  // Estadísticas
  rating: number;
  totalProjects: number;
  activeStudents: number;
  completedProjects: number;
  averageRating: number;
}

const mockCompanyProfile: CompanyProfileData = {
  id: '1',
  rut: '76.123.456-7',
  personalidad: 'Jurídica',
  razonSocial: 'TechCorp Solutions SpA',
  nombreEmpresa: 'TechCorp Solutions',
  direccion: 'Av. Providencia 1234, Providencia',
  telefonoEmpresa: '+56 2 2345 6789',
  email: 'contacto@techcorp.cl',
  website: 'www.techcorp.cl',
  description: 'Empresa líder en desarrollo de software y soluciones tecnológicas innovadoras.',
  industry: 'Tecnología',
  nombreResponsable: 'Juan',
  apellidoResponsable: 'Pérez',
  correoResponsable: 'juan.perez@techcorp.cl',
  telefonoResponsable: '+56 9 8765 4321',
  fechaNacimientoResponsable: '1985-06-15',
  generoResponsable: 'Hombre',
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
  const [activeTab, setActiveTab] = useState<'empresa' | 'responsable'>('empresa');

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
          variant="contained"
          startIcon={<EditIcon />}
          onClick={handleEdit}
          color="primary"
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
                  {profile.nombreEmpresa}
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

            <Typography variant="h6" gutterBottom>
              Información de la Empresa
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <BadgeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    <strong>RUT:</strong> {profile.rut}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    <strong>Personalidad:</strong> {profile.personalidad}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ flex: '1 1 100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    <strong>Razón Social:</strong> {profile.razonSocial}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ flex: '1 1 100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    <strong>Dirección:</strong> {profile.direccion}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    <strong>Teléfono:</strong> {profile.telefonoEmpresa}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    <strong>Email:</strong> {profile.email}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ flex: '1 1 100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <WebIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    <strong>Sitio Web:</strong> {profile.website}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Descripción
            </Typography>
            <Typography variant="body2" paragraph>
              {profile.description}
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Usuario Responsable
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    <strong>Nombre:</strong> {profile.nombreResponsable} {profile.apellidoResponsable}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    <strong>Email:</strong> {profile.correoResponsable}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    <strong>Teléfono:</strong> {profile.telefonoResponsable}
                  </Typography>
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

            <Card>
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
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Editar Perfil de Empresa</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant={activeTab === 'empresa' ? 'contained' : 'outlined'}
                onClick={() => setActiveTab('empresa')}
              >
                Datos Empresa
              </Button>
              <Button
                variant={activeTab === 'responsable' ? 'contained' : 'outlined'}
                onClick={() => setActiveTab('responsable')}
              >
                Usuario Responsable
              </Button>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {activeTab === 'empresa' ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
              <TextField
                fullWidth
                label="RUT"
                value={editData.rut}
                onChange={(e) => handleInputChange('rut', e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                select
                label="Personalidad"
                value={editData.personalidad}
                onChange={(e) => handleInputChange('personalidad', e.target.value)}
                margin="normal"
              >
                <MenuItem value="Jurídica">Jurídica</MenuItem>
                <MenuItem value="Natural">Natural</MenuItem>
              </TextField>
              <TextField
                fullWidth
                label="Razón Social"
                value={editData.razonSocial}
                onChange={(e) => handleInputChange('razonSocial', e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Nombre de la Empresa"
                value={editData.nombreEmpresa}
                onChange={(e) => handleInputChange('nombreEmpresa', e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Dirección"
                value={editData.direccion}
                onChange={(e) => handleInputChange('direccion', e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Teléfono de la Empresa"
                value={editData.telefonoEmpresa}
                onChange={(e) => handleInputChange('telefonoEmpresa', e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Email"
                value={editData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Sitio Web"
                value={editData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Industria"
                value={editData.industry}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                margin="normal"
              />
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
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
              <TextField
                fullWidth
                label="Nombre"
                value={editData.nombreResponsable}
                onChange={(e) => handleInputChange('nombreResponsable', e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Apellido"
                value={editData.apellidoResponsable}
                onChange={(e) => handleInputChange('apellidoResponsable', e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Email"
                value={editData.correoResponsable}
                onChange={(e) => handleInputChange('correoResponsable', e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Teléfono"
                value={editData.telefonoResponsable}
                onChange={(e) => handleInputChange('telefonoResponsable', e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Fecha de Nacimiento"
                type="date"
                value={editData.fechaNacimientoResponsable}
                onChange={(e) => handleInputChange('fechaNacimientoResponsable', e.target.value)}
                InputLabelProps={{ shrink: true }}
                margin="normal"
              />
              <TextField
                fullWidth
                select
                label="Género"
                value={editData.generoResponsable}
                onChange={(e) => handleInputChange('generoResponsable', e.target.value)}
                margin="normal"
              >
                <MenuItem value="Mujer">Mujer</MenuItem>
                <MenuItem value="Hombre">Hombre</MenuItem>
                <MenuItem value="Otro">Otro</MenuItem>
              </TextField>
            </Box>
          )}
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
