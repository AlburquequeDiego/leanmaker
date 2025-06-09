import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Avatar,
  Grid,
  Divider,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  School as SchoolIcon,
  Grade as GradeIcon,
  AccessTime as AccessTimeIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

export const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'María González',
    email: 'maria.gonzalez@estudiante.edu',
    phone: '+57 300 123 4567',
    career: 'Ingeniería de Sistemas',
    semester: 8,
    gpa: 4.2,
    totalHours: 180,
    completedProjects: 3,
    strikes: 1,
    skills: ['React', 'Node.js', 'MySQL', 'JavaScript', 'Python'],
    bio: 'Estudiante apasionada por el desarrollo de software y la innovación tecnológica. Busco oportunidades para aplicar mis conocimientos en proyectos reales.',
  });

  const [editData, setEditData] = useState(profileData);

  const handleEdit = () => {
    setEditData(profileData);
    setIsEditing(true);
  };

  const handleSave = () => {
    setProfileData(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(profileData);
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Mi Perfil</Typography>
        {!isEditing ? (
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={handleEdit}
          >
            Editar Perfil
          </Button>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
            >
              Guardar
            </Button>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={handleCancel}
            >
              Cancelar
            </Button>
          </Box>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Información Personal */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Información Personal
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nombre Completo"
                  value={isEditing ? editData.name : profileData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Correo Electrónico"
                  value={isEditing ? editData.email : profileData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Teléfono"
                  value={isEditing ? editData.phone : profileData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Carrera"
                  value={isEditing ? editData.career : profileData.career}
                  onChange={(e) => handleInputChange('career', e.target.value)}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: <SchoolIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Semestre"
                  type="number"
                  value={isEditing ? editData.semester : profileData.semester}
                  onChange={(e) => handleInputChange('semester', Number(e.target.value))}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: <GradeIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="GPA"
                  type="number"
                  value={isEditing ? editData.gpa : profileData.gpa}
                  onChange={(e) => handleInputChange('gpa', Number(e.target.value))}
                  disabled={!isEditing}
                  inputProps={{ step: 0.1, min: 0, max: 5 }}
                />
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Biografía
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={isEditing ? editData.bio : profileData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              disabled={!isEditing}
              placeholder="Cuéntanos sobre ti..."
            />
          </Paper>
        </Grid>

        {/* Sidebar con estadísticas */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3, textAlign: 'center' }}>
            <Avatar
              sx={{ width: 100, height: 100, mx: 'auto', mb: 2, bgcolor: 'primary.main' }}
            >
              <PersonIcon sx={{ fontSize: 50 }} />
            </Avatar>
            <Typography variant="h6" gutterBottom>
              {profileData.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {profileData.career} - {profileData.semester}° Semestre
            </Typography>
            <Chip
              label={`GPA: ${profileData.gpa}`}
              color="primary"
              variant="outlined"
              sx={{ mb: 1 }}
            />
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Estadísticas
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AccessTimeIcon sx={{ mr: 1, color: 'info.main' }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2">Horas Acumuladas</Typography>
                <Typography variant="h6">{profileData.totalHours}</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SchoolIcon sx={{ mr: 1, color: 'success.main' }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2">Proyectos Completados</Typography>
                <Typography variant="h6">{profileData.completedProjects}</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <WarningIcon sx={{ mr: 1, color: profileData.strikes > 0 ? 'warning.main' : 'success.main' }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2">Strikes</Typography>
                <Typography variant="h6" color={profileData.strikes > 0 ? 'warning.main' : 'success.main'}>
                  {profileData.strikes}/3
                </Typography>
              </Box>
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Habilidades
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {profileData.skills.map((skill) => (
                <Chip key={skill} label={skill} size="small" variant="outlined" />
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Alert de strikes */}
      {profileData.strikes > 0 && (
        <Alert severity="warning" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>Advertencia:</strong> Tienes {profileData.strikes} strike(s) asignado(s). 
            Recuerda cumplir con los plazos de entrega para evitar más strikes.
          </Typography>
        </Alert>
      )}

      {/* Dialog para cambiar contraseña */}
      <Dialog open={showPasswordDialog} onClose={() => setShowPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cambiar Contraseña</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            type="password"
            label="Contraseña Actual"
            margin="normal"
          />
          <TextField
            fullWidth
            type="password"
            label="Nueva Contraseña"
            margin="normal"
          />
          <TextField
            fullWidth
            type="password"
            label="Confirmar Nueva Contraseña"
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPasswordDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={() => setShowPasswordDialog(false)}>
            Cambiar Contraseña
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile; 