import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
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
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../hooks/useAuth';
import type { User, Company } from '../../../types';

interface CompanyProfileData {
  // Datos del usuario
  user: User;
  // Datos de la empresa
  company: Company;
  // Estadísticas
  totalProjects: number;
  activeStudents: number;
  completedProjects: number;
  averageRating: number;
}

export const CompanyProfile: React.FC = () => {
  const api = useApi();
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<CompanyProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Company>>({});
  const [saving, setSaving] = useState(false);
  // 3. Agrego feedback visual de éxito:
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      loadProfile();
    }
  }, [authLoading, user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      // Obtener datos del usuario
      const userData = await api.get('/api/users/profile/');
      // Obtener datos de la empresa
      const companyData = await api.get('/api/companies/company_me/');
      // Obtener estadísticas del dashboard
      const statsResponse = await api.get('/api/dashboard/company_stats/');
      const statsData = statsResponse.data;
      const totalProjects = statsData?.total_projects ?? 0;
      const activeStudents = statsData?.active_students ?? 0;
      const completedProjects = statsData?.completed_projects ?? 0;
      const averageRating = statsData?.rating ?? 0;
      const profileData: CompanyProfileData = {
        user: userData,
        company: companyData,
        totalProjects,
        activeStudents,
        completedProjects,
        averageRating,
      };
      setProfile(profileData);
      setEditData(companyData);
    } catch (err: any) {
      console.error('Error cargando perfil:', err);
      setError(err.response?.data?.error || err.message || 'Error al cargar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (profile) {
      setEditData(profile.company);
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    // Validación básica: nombre de empresa obligatorio
    if (!editData.company_name || editData.company_name.trim() === "") {
      setError("El nombre de la empresa es obligatorio.");
      return;
    }
    try {
      setSaving(true);
      // Solo enviar los campos que existen en el modelo del backend
      const payload = {
        company_name: editData.company_name,
        rut: editData.rut,
        personality: editData.personality,
        business_name: editData.business_name,
        address: editData.address,
        city: editData.city,
        country: editData.country,
        contact_phone: editData.contact_phone,
        contact_email: editData.contact_email,
        website: editData.website,
        industry: editData.industry,
        size: editData.size,
        description: editData.description,
      };
      const response = await api.patch(`/api/companies/${profile.company.id}/update/`, payload);
      // Refrescar datos tras guardar
      await loadProfile();
      setIsEditing(false);
      setError(null);
      // En handleSave, después de guardar correctamente:
      setSuccess("Perfil actualizado correctamente.");
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al guardar perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setEditData(profile.company);
    }
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof Company, value: any) => {
    setEditData(prev => ({ ...prev, [field]: value }));
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
        <Button onClick={loadProfile} variant="contained">
          Reintentar
        </Button>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          No se pudo cargar el perfil de empresa
        </Alert>
      </Box>
    );
  }

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
                  {profile.company.company_name}
                </Typography>
                {/* Eliminar la visualización de la calificación promedio */}
                {/* <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <StarIcon sx={{ color: 'warning.main', mr: 1 }} />
                  <Typography variant="body1">
                    {profile.averageRating.toFixed(1)} / 5.0
                  </Typography>
                </Box> */}
                <Chip label={profile.company.industry || 'Sin industria'} color="primary" size="small" />
                {profile.company.verified && (
                  <Chip label="Verificada" color="success" size="small" sx={{ ml: 1 }} />
                )}
              </Box>
            </Box>

            <Typography variant="h6" gutterBottom>
              Información de la Empresa
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {profile.company.rut && (
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <BadgeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      <strong>RUT:</strong> {profile.company.rut}
                    </Typography>
                  </Box>
                </Box>
              )}
              {profile.company.personality && (
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      <strong>Personalidad:</strong> {profile.company.personality}
                    </Typography>
                  </Box>
                </Box>
              )}
              {profile.company.business_name && (
                <Box sx={{ flex: '1 1 100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      <strong>Razón Social:</strong> {profile.company.business_name}
                    </Typography>
                  </Box>
                </Box>
              )}
              {profile.company.address && (
                <Box sx={{ flex: '1 1 100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      <strong>Dirección:</strong> {profile.company.address}
                    </Typography>
                  </Box>
                </Box>
              )}
              {profile.company.contact_phone && (
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      <strong>Teléfono:</strong> {profile.company.contact_phone}
                    </Typography>
                  </Box>
                </Box>
              )}
              {profile.company.contact_email && (
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      <strong>Email:</strong> {profile.company.contact_email}
                    </Typography>
                  </Box>
                </Box>
              )}
              {profile.company.website && (
                <Box sx={{ flex: '1 1 100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <WebIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      <strong>Sitio Web:</strong> {profile.company.website}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>

            {profile.company.description && (
              <>
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Descripción
                </Typography>
                <Typography variant="body2" paragraph>
                  {profile.company.description}
                </Typography>
              </>
            )}

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Usuario Responsable
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    <strong>Nombre:</strong> {profile.user.full_name}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    <strong>Email:</strong> {profile.user.email}
                  </Typography>
                </Box>
              </Box>
              {profile.user.phone && (
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      <strong>Teléfono:</strong> {profile.user.phone}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Paper>
        </Box>
        {/* Eliminar la sección de estadísticas */}
        {/* <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 0' } }}>
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
                    <Typography variant="h4">{profile.averageRating.toFixed(1)}</Typography>
                    <Typography variant="body2">Rating Promedio</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Paper>
        </Box> */}
      </Box>

      {/* Dialog para editar perfil */}
      <Dialog open={isEditing} onClose={handleCancel} maxWidth="md" fullWidth>
        <DialogTitle>Editar Perfil de Empresa</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Nombre de la Empresa"
              value={editData.company_name || ''}
              onChange={(e) => handleInputChange('company_name', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="RUT"
              value={editData.rut || ''}
              onChange={(e) => handleInputChange('rut', e.target.value)}
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Personalidad</InputLabel>
              <Select
                value={editData.personality || ''}
                label="Personalidad"
                onChange={(e) => handleInputChange('personality', e.target.value)}
              >
                <MenuItem value="Jurídica">Jurídica</MenuItem>
                <MenuItem value="Natural">Natural</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Razón Social"
              value={editData.business_name || ''}
              onChange={(e) => handleInputChange('business_name', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Dirección"
              value={editData.address || ''}
              onChange={(e) => handleInputChange('address', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Ciudad"
              value={editData.city || ''}
              onChange={(e) => handleInputChange('city', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="País"
              value={editData.country || ''}
              onChange={(e) => handleInputChange('country', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Teléfono"
              value={editData.contact_phone || ''}
              onChange={(e) => handleInputChange('contact_phone', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Email de Contacto"
              value={editData.contact_email || ''}
              onChange={(e) => handleInputChange('contact_email', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Sitio Web"
              value={editData.website || ''}
              onChange={(e) => handleInputChange('website', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Industria"
              value={editData.industry || ''}
              onChange={(e) => handleInputChange('industry', e.target.value)}
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Tamaño</InputLabel>
              <Select
                value={editData.size || ''}
                label="Tamaño"
                onChange={(e) => handleInputChange('size', e.target.value)}
              >
                <MenuItem value="Pequeña">Pequeña</MenuItem>
                <MenuItem value="Mediana">Mediana</MenuItem>
                <MenuItem value="Grande">Grande</MenuItem>
                <MenuItem value="Startup">Startup</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Descripción"
              value={editData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} startIcon={<CancelIcon />}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
            disabled={saving}
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Muestro el mensaje de éxito si existe: */}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}
    </Box>
  );
};

export default CompanyProfile;
