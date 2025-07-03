import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  Snackbar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,

} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { apiService } from '../../../services/api.service';

interface AdminProfile {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  position?: string;
  department?: string;
  avatar?: string;
  is_active: boolean;
  date_joined: string;
  last_login?: string;
}

interface ChangePasswordData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export default function PerfilAdmin() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showAvatarDialog, setShowAvatarDialog] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
  });

  const [passwordData, setPasswordData] = useState<ChangePasswordData>({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await apiService.get('/api/users/profile/') as any;
      const adminProfile = {
        id: data.id,
        username: data.username,
        email: data.email,
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        phone: data.phone || '',
        position: data.position || '',
        department: data.department || '',
        avatar: data.avatar,
        is_active: data.is_active,
        date_joined: data.date_joined,
        last_login: data.last_login,
      };
      
      setProfile(adminProfile);
      setFormData({
        first_name: adminProfile.first_name,
        last_name: adminProfile.last_name,
        email: adminProfile.email,
        phone: adminProfile.phone,
        position: adminProfile.position,
        department: adminProfile.department,
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const updateData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        position: formData.position,
        department: formData.department,
      };

      await apiService.patch('/api/users/profile/', updateData);
      
      setSuccess('Perfil actualizado exitosamente');
      setIsEditing(false);
      await fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Error al actualizar el perfil');
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('Las contraseñas nuevas no coinciden');
      return;
    }

    if (passwordData.new_password.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }

    try {
      await apiService.post('/api/users/change-password/', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      
      setSuccess('Contraseña cambiada exitosamente');
      setShowPasswordDialog(false);
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (error) {
      console.error('Error changing password:', error);
      setError('Error al cambiar la contraseña. Verifica tu contraseña actual.');
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;

    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);

      await apiService.patch('/api/users/profile/', formData);
      
      setSuccess('Avatar actualizado exitosamente');
      setShowAvatarDialog(false);
      setAvatarFile(null);
      setAvatarPreview('');
      await fetchProfile();
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setError('Error al subir el avatar');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancelEdit = () => {
    if (profile) {
      setFormData({
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
        phone: profile.phone || '',
        position: profile.position || '',
        department: profile.department || '',
      });
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Alert severity="error">
        No se pudo cargar el perfil del administrador.
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <PersonIcon sx={{ mr: 2, color: 'primary.main' }} />
        Perfil de Administrador
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Información del perfil */}
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5">Información Personal</Typography>
              <Box>
                {!isEditing ? (
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => setIsEditing(true)}
                  >
                    Editar
                  </Button>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSaveProfile}
                    >
                      Guardar
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={handleCancelEdit}
                    >
                      Cancelar
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <TextField
                label="Nombre"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                disabled={!isEditing}
                sx={{ minWidth: { xs: '100%', sm: '48%' } }}
              />
              <TextField
                label="Apellido"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                disabled={!isEditing}
                sx={{ minWidth: { xs: '100%', sm: '48%' } }}
              />
              <TextField
                label="Correo electrónico"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!isEditing}
                InputProps={{
                  startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                sx={{ width: '100%' }}
              />
              <TextField
                label="Teléfono"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!isEditing}
                InputProps={{
                  startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                sx={{ minWidth: { xs: '100%', sm: '48%' } }}
              />
              <TextField
                label="Cargo"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                disabled={!isEditing}
                InputProps={{
                  startAdornment: <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                sx={{ minWidth: { xs: '100%', sm: '48%' } }}
              />
              <TextField
                label="Departamento"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                disabled={!isEditing}
                InputProps={{
                  startAdornment: <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                sx={{ width: '100%' }}
              />
            </Box>
          </Paper>
        </Box>

        {/* Avatar y acciones */}
        <Box sx={{ width: { xs: '100%', md: 350 } }}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Avatar
              src={avatarPreview || profile.avatar}
              sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
            >
              {profile.first_name?.[0]}{profile.last_name?.[0]}
            </Avatar>
            
            <Button
              variant="outlined"
              onClick={() => setShowAvatarDialog(true)}
              sx={{ mb: 2 }}
            >
              Cambiar Avatar
            </Button>

            <Divider sx={{ my: 2 }} />

            <Button
              variant="outlined"
              startIcon={<LockIcon />}
              onClick={() => setShowPasswordDialog(true)}
              fullWidth
            >
              Cambiar Contraseña
            </Button>
          </Paper>

          {/* Información de la cuenta */}
          <Paper sx={{ p: 3, mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Información de la Cuenta
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Nombre de usuario
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {profile.username}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Estado
              </Typography>
              <Typography 
                variant="body1" 
                color={profile.is_active ? 'success.main' : 'error.main'}
                fontWeight="bold"
              >
                {profile.is_active ? 'Activo' : 'Inactivo'}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Fecha de registro
              </Typography>
              <Typography variant="body1">
                {new Date(profile.date_joined).toLocaleDateString()}
              </Typography>
            </Box>

            {profile.last_login && (
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Último acceso
                </Typography>
                <Typography variant="body1">
                  {new Date(profile.last_login).toLocaleString()}
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>

      {/* Dialog para cambiar contraseña */}
      <Dialog open={showPasswordDialog} onClose={() => setShowPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cambiar Contraseña</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Contraseña actual"
              type={showPasswords.current ? 'text' : 'password'}
              value={passwordData.current_password}
              onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
              required
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                  >
                    {showPasswords.current ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                ),
              }}
            />
            <TextField
              label="Nueva contraseña"
              type={showPasswords.new ? 'text' : 'password'}
              value={passwordData.new_password}
              onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
              required
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                  >
                    {showPasswords.new ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                ),
              }}
            />
            <TextField
              label="Confirmar nueva contraseña"
              type={showPasswords.confirm ? 'text' : 'password'}
              value={passwordData.confirm_password}
              onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
              required
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                  >
                    {showPasswords.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                ),
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPasswordDialog(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleChangePassword}
            disabled={!passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password}
          >
            Cambiar Contraseña
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para cambiar avatar */}
      <Dialog open={showAvatarDialog} onClose={() => setShowAvatarDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cambiar Avatar</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Avatar
              src={avatarPreview || profile.avatar}
              sx={{ width: 100, height: 100, mx: 'auto', mb: 2 }}
            >
              {profile.first_name?.[0]}{profile.last_name?.[0]}
            </Avatar>
            
            <input
              accept="image/*"
              type="file"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              id="avatar-upload"
            />
            <label htmlFor="avatar-upload">
              <Button variant="outlined" component="span">
                Seleccionar Imagen
              </Button>
            </label>
            
            {avatarFile && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Archivo seleccionado: {avatarFile.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAvatarDialog(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleAvatarUpload}
            disabled={!avatarFile}
          >
            Subir Avatar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
} 