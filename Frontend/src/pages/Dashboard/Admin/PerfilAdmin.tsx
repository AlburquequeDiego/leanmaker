import { useState, useEffect, useRef } from 'react';
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
  Chip,
  Card,
  CardContent,
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
  AdminPanelSettings as AdminIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  VerifiedUser as VerifiedIcon,
  Security as SecurityIcon,
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
  old_password: string;
  new_password: string;
  new_password_confirm: string;
}

// Componente separado para el formulario de contraseña
const PasswordForm = ({ 
  onSubmit, 
  onCancel, 
  error, 
  success 
}: { 
  onSubmit: (data: ChangePasswordData) => void;
  onCancel: () => void;
  error: string | null;
  success: string | null;
}) => {
  const [passwordData, setPasswordData] = useState<ChangePasswordData>({
    old_password: '',
    new_password: '',
    new_password_confirm: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Ref para forzar la limpieza del campo
  const currentPasswordRef = useRef<HTMLInputElement>(null);

  // Efecto para limpiar el campo cuando se monta el componente
  useEffect(() => {
    // Limpiar el estado inmediatamente
    setPasswordData({
      old_password: '',
      new_password: '',
      new_password_confirm: '',
    });
    
    // Esperar a que el DOM esté listo
    const timer = setTimeout(() => {
      if (currentPasswordRef.current) {
        // Forzar la limpieza del campo usando JavaScript directo
        currentPasswordRef.current.value = '';
        
        // Forzar el foco y luego quitar el foco para asegurar la limpieza
        currentPasswordRef.current.focus();
        setTimeout(() => {
          if (currentPasswordRef.current) {
            currentPasswordRef.current.blur();
          }
        }, 100);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = () => {
    if (passwordData.new_password !== passwordData.new_password_confirm) {
      return;
    }
    onSubmit(passwordData);
  };

  return (
    <>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <SecurityIcon color="primary" />
        Cambiar Contraseña
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              ref={currentPasswordRef}
              label="Contraseña actual"
              type={showPasswords.current ? 'text' : 'password'}
              value={passwordData.old_password}
              onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
              fullWidth
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    edge="end"
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
              fullWidth
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    edge="end"
                  >
                    {showPasswords.new ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                ),
              }}
            />
            
            <TextField
              label="Confirmar nueva contraseña"
              type={showPasswords.confirm ? 'text' : 'password'}
              value={passwordData.new_password_confirm}
              onChange={(e) => setPasswordData({ ...passwordData, new_password_confirm: e.target.value })}
              fullWidth
              error={passwordData.new_password !== passwordData.new_password_confirm && passwordData.new_password_confirm !== ''}
              helperText={
                passwordData.new_password !== passwordData.new_password_confirm && passwordData.new_password_confirm !== ''
                  ? 'Las contraseñas no coinciden'
                  : ''
              }
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    edge="end"
                  >
                    {showPasswords.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                ),
              }}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={
            !passwordData.old_password ||
            !passwordData.new_password ||
            !passwordData.new_password_confirm ||
            passwordData.new_password !== passwordData.new_password_confirm
          }
        >
          Cambiar Contraseña
        </Button>
      </DialogActions>
    </>
  );
};

export default function PerfilAdmin() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [dialogKey, setDialogKey] = useState(0);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const userData = await apiService.get('/api/users/profile/');
      setProfile(userData);
      setFormData({
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        position: userData.position || '',
        department: userData.department || '',
      });
    } catch (err) {
      setError('Error al cargar el perfil');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      await apiService.patch('/api/users/profile/', formData);
      setSuccess('Perfil actualizado correctamente');
      await fetchProfile();
      setIsEditing(false);
    } catch (err) {
      setError('Error al actualizar el perfil');
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (formData: ChangePasswordData) => {
    try {
      setLoading(true);
      await apiService.post('/api/users/change-password/', formData);
      setSuccess('Contraseña cambiada correctamente');
      setShowPasswordDialog(false);
      setDialogKey(prev => prev + 1);
    } catch (err: any) {
      setError(err.message || 'Error al cambiar la contraseña');
      console.error('Error changing password:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPasswordDialog = () => {
    setShowPasswordDialog(true);
    setDialogKey(prev => prev + 1);
  };

  const handleCancelEdit = () => {
    setFormData({
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      position: profile?.position || '',
      department: profile?.department || '',
    });
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
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* Banner superior con gradiente y contexto */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '20px',
          p: 4,
          mb: 4,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            animation: 'float 6s ease-in-out infinite',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-30%',
            right: '-30%',
            width: '60%',
            height: '60%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
            animation: 'float 8s ease-in-out infinite reverse',
          },
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
            '50%': { transform: 'translateY(-20px) rotate(180deg)' },
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              <AdminIcon sx={{ fontSize: 32, color: 'white' }} />
            </Box>
            <Box>
              <Typography
                variant="h3"
                sx={{
                  color: 'white',
                  fontWeight: 'bold',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  mb: 1,
                }}
              >
                Gestión de Perfil Administrativo
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: 300,
                  textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                }}
              >
                Administra tu información personal y configuración de cuenta para mantener el control total del sistema
              </Typography>
            </Box>
          </Box>
          
          {/* Indicadores de estado */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip
              icon={<VerifiedIcon />}
              label="Cuenta Verificada"
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(10px)',
              }}
            />
            <Chip
              icon={<SecurityIcon />}
              label="Acceso Administrativo"
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(10px)',
              }}
            />
            <Chip
              icon={<TimeIcon />}
              label={`Último acceso: ${profile?.last_login ? new Date(profile.last_login).toLocaleDateString('es-ES') : 'N/A'}`}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(10px)',
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Contenido principal */}
      <Box sx={{ p: 3 }}>
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

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3 }}>
          {/* Columna principal - Información del perfil */}
          <Box sx={{ flex: 1 }}>
            {/* Información Personal */}
            <Card sx={{ mb: 3, boxShadow: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon color="primary" />
                    <Typography variant="h5" fontWeight="bold">
                      Información Personal
                    </Typography>
                  </Box>
                  <Box>
                    {!isEditing ? (
                      <Button
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={() => setIsEditing(true)}
                        sx={{ borderRadius: 2 }}
                      >
                        Editar
                      </Button>
                    ) : (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          startIcon={<SaveIcon />}
                          onClick={handleSaveProfile}
                          sx={{ borderRadius: 2 }}
                        >
                          Guardar
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<CancelIcon />}
                          onClick={handleCancelEdit}
                          sx={{ borderRadius: 2 }}
                        >
                          Cancelar
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Nombre y Apellido */}
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                    <TextField
                      label="Nombre"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      disabled={!isEditing}
                      fullWidth
                      sx={{ borderRadius: 2 }}
                    />
                    <TextField
                      label="Apellido"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      disabled={!isEditing}
                      fullWidth
                      sx={{ borderRadius: 2 }}
                    />
                  </Box>

                  {/* Email */}
                  <TextField
                    label="Correo electrónico"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                    fullWidth
                    sx={{ borderRadius: 2 }}
                  />

                  {/* Teléfono y Cargo */}
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                    <TextField
                      label="Teléfono"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                      fullWidth
                      sx={{ borderRadius: 2 }}
                    />
                    <TextField
                      label="Cargo"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                      fullWidth
                      sx={{ borderRadius: 2 }}
                    />
                  </Box>

                  {/* Departamento */}
                  <TextField
                    label="Departamento"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                    fullWidth
                    sx={{ borderRadius: 2 }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Columna lateral - Avatar y información de cuenta */}
          <Box sx={{ width: { xs: '100%', lg: 400 } }}>
            {/* Avatar y acciones */}
            <Card sx={{ mb: 3, boxShadow: 3 }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Box sx={{ mb: 3 }}>
                  <Avatar
                    sx={{ 
                      width: 140, 
                      height: 140, 
                      fontSize: '3rem',
                      border: '4px solid',
                      borderColor: 'primary.main',
                      boxShadow: 3,
                      mx: 'auto',
                      backgroundColor: 'primary.main'
                    }}
                  >
                    {profile.first_name?.[0]}{profile.last_name?.[0]}
                  </Avatar>
                </Box>
                
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {profile.first_name} {profile.last_name}
                </Typography>
                
                <Chip
                  icon={<AdminIcon />}
                  label="Administrador"
                  color="primary"
                  variant="filled"
                  sx={{ mb: 2 }}
                />

                <Divider sx={{ my: 2 }} />

                <Button
                  variant="outlined"
                  startIcon={<LockIcon />}
                  onClick={handleOpenPasswordDialog}
                  fullWidth
                  sx={{ borderRadius: 2, mb: 2 }}
                >
                  Cambiar Contraseña
                </Button>
              </CardContent>
            </Card>

            {/* Información de la cuenta */}
            <Card sx={{ boxShadow: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <VerifiedIcon color="primary" />
                  Información de la Cuenta
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon fontSize="small" />
                      Nombre de usuario
                    </Typography>
                    <Typography variant="body1" fontWeight="bold" sx={{ ml: 2 }}>
                      {profile.username}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <VerifiedIcon fontSize="small" />
                      Estado
                    </Typography>
                    <Chip
                      label={profile.is_active ? 'Activo' : 'Inactivo'}
                      color={profile.is_active ? 'success' : 'error'}
                      size="small"
                      sx={{ ml: 2 }}
                    />
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarIcon fontSize="small" />
                      Fecha de registro
                    </Typography>
                    <Typography variant="body1" sx={{ ml: 2 }}>
                      {new Date(profile.date_joined).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Typography>
                  </Box>

                  {profile.last_login && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TimeIcon fontSize="small" />
                        Último acceso
                      </Typography>
                      <Typography variant="body1" sx={{ ml: 2 }}>
                        {new Date(profile.last_login).toLocaleString('es-ES')}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>

      {/* Dialog para cambiar contraseña */}
      {showPasswordDialog && (
        <Dialog 
          key={`password-dialog-${dialogKey}`}
          open={showPasswordDialog} 
          onClose={() => setShowPasswordDialog(false)} 
          maxWidth="sm" 
          fullWidth
        >
          <PasswordForm 
            key={`password-form-${dialogKey}`}
            onSubmit={handleChangePassword} 
            onCancel={() => setShowPasswordDialog(false)} 
            error={error} 
            success={success} 
          />
        </Dialog>
      )}

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