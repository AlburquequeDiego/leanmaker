import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Divider,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  MenuItem,
  Snackbar,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import { apiService } from '../../../services/api.service';
import { useAuth } from '../../../hooks/useAuth';

interface TeacherProfileData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  career: string;
  bio: string;
  birthdate: string;
  gender: string;
  avatar: string;
  role: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

interface ChangePasswordData {
  current_password: string;
  new_password: string;
  confirm_password: string;
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
    current_password: '',
    new_password: '',
    confirm_password: '',
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
      current_password: '',
      new_password: '',
      confirm_password: '',
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
        }, 50);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = () => {
    onSubmit(passwordData);
  };

  return (
    <>
      <DialogTitle>Cambiar Contraseña</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Box sx={{ position: 'relative' }}>
            <input
              ref={currentPasswordRef}
              type={showPasswords.current ? 'text' : 'password'}
              value={passwordData.current_password}
              onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
              required
              autoComplete="off"
              style={{
                width: '100%',
                padding: '16.5px 14px',
                border: '1px solid rgba(0, 0, 0, 0.23)',
                borderRadius: '4px',
                fontSize: '16px',
                fontFamily: 'inherit',
                backgroundColor: 'transparent',
              }}
              placeholder="Contraseña actual *"
            />
            <IconButton
              onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
              sx={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            >
              {showPasswords.current ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </IconButton>
          </Box>
          
          <TextField
            label="Nueva contraseña"
            type={showPasswords.new ? 'text' : 'password'}
            value={passwordData.new_password}
            onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
            required
            autoComplete="off"
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
            autoComplete="off"
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
        <Button onClick={onCancel}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password}
        >
          Cambiar Contraseña
        </Button>
      </DialogActions>
    </>
  );
};

export default function TeacherProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<TeacherProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<TeacherProfileData>>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Estados para cambio de contraseña
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [dialogKey, setDialogKey] = useState(Date.now());

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🎓 [TeacherProfile] Cargando perfil del profesor...');
      const userData = await apiService.get('/api/users/profile/');
      
      console.log('🎓 [TeacherProfile] Datos recibidos:', userData);
      
      setProfile(userData as TeacherProfileData);
      setEditData(userData as TeacherProfileData);
    } catch (err: any) {
      console.error('Error cargando perfil:', err);
      setError(err.response?.data?.error || err.message || 'Error al cargar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (profile) {
      setEditData(profile);
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    
    // Validación básica: nombre obligatorio
    if (!editData.first_name || editData.first_name.trim() === "") {
      setError("El nombre es obligatorio.");
      return;
    }
    
    if (!editData.last_name || editData.last_name.trim() === "") {
      setError("El apellido es obligatorio.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      // Preparar datos para enviar
      const updateData = {
        first_name: editData.first_name,
        last_name: editData.last_name,
        phone: editData.phone,
        position: editData.position,
        department: editData.department,
        career: editData.career,
        bio: editData.bio,
        birthdate: editData.birthdate,
        gender: editData.gender,
      };

      console.log('🎓 [TeacherProfile] Actualizando perfil:', updateData);
      
      await apiService.patch('/api/users/profile/', updateData);
      
      // Refrescar datos tras guardar
      await loadProfile();
      setIsEditing(false);
      setSuccess("Perfil actualizado correctamente.");
    } catch (err: any) {
      console.error('Error actualizando perfil:', err);
      setError(err.response?.data?.error || 'Error al guardar perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setEditData(profile);
    }
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof TeacherProfileData, value: any) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleChangePassword = async (formData: ChangePasswordData) => {
    if (formData.new_password !== formData.confirm_password) {
      setError('Las contraseñas nuevas no coinciden');
      return;
    }

    if (formData.new_password.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }

    try {
      const passwordData = {
        old_password: formData.current_password,
        new_password: formData.new_password,
        new_password_confirm: formData.confirm_password,
      };
      
      await apiService.post('/api/users/change-password/', passwordData);
      
      setSuccess('Contraseña cambiada exitosamente');
      setShowPasswordDialog(false);
    } catch (error) {
      console.error('❌ [TeacherProfile] Error al cambiar contraseña:', error);
      setError('Error al cambiar la contraseña. Verifica tu contraseña actual.');
    }
  };

  const handleOpenPasswordDialog = () => {
    // Limpiar errores y mensajes
    setError(null);
    setSuccess(null);
    
    // Cerrar el diálogo primero para destruir el componente
    setShowPasswordDialog(false);
    
    // Generar una nueva key única y abrir el diálogo después de un delay
    setTimeout(() => {
      setDialogKey(Date.now());
      setShowPasswordDialog(true);
    }, 100);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Cargando perfil del profesor...
        </Typography>
      </Box>
    );
  }

  if (error && !profile) {
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
          No se pudo cargar el perfil del profesor
        </Alert>
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
            🎓 Gestión de Perfil Docente
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: 400,
              textShadow: '0 1px 2px rgba(0,0,0,0.2)'
            }}
          >
            Administra tu información personal y profesional como docente
          </Typography>
        </Box>
      </Box>

      {/* Header con botones de acción */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={600} color="primary">Información Personal</Typography>
        {!isEditing ? (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<LockIcon />}
              onClick={handleOpenPasswordDialog}
            >
              Cambiar Contraseña
            </Button>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEdit}
            >
              Editar Perfil
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={handleSave}
              disabled={saving}
              sx={{ minWidth: 140, borderRadius: 2 }}
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={handleCancel}
              disabled={saving}
              sx={{ minWidth: 120, borderRadius: 2 }}
            >
              Cancelar
            </Button>
          </Box>
        )}
      </Box>

      {/* Banner de éxito */}
      {success && (
        <Alert 
          severity="success" 
          sx={{ 
            mb: 3, 
            borderRadius: 2,
            '& .MuiAlert-icon': { fontSize: 28 },
            '& .MuiAlert-message': { fontSize: '1rem' }
          }} 
          onClose={() => setSuccess(null)}
        >
          {success}
        </Alert>
      )}

      <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3, maxWidth: 800, mx: 'auto' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Información Personal */}
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Información Personal
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField
              label="Nombre *"
              value={isEditing ? (editData.first_name || '') : (profile.first_name || '')}
              onChange={(e) => handleInputChange('first_name', e.target.value)}
              disabled={!isEditing}
              fullWidth
              required
            />
            <TextField
              label="Apellido *"
              value={isEditing ? (editData.last_name || '') : (profile.last_name || '')}
              onChange={(e) => handleInputChange('last_name', e.target.value)}
              disabled={!isEditing}
              fullWidth
              required
            />
          </Box>
          
          <TextField
            label="Email"
            value={profile.email || ''}
            disabled
            fullWidth
            helperText="El email no se puede cambiar desde aquí"
          />
          
          <TextField
            label="Teléfono"
            value={isEditing ? (editData.phone || '') : (profile.phone || '')}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            disabled={!isEditing}
            fullWidth
            placeholder="+56 9 1234 5678"
          />
          
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField
              label="Fecha de nacimiento"
              value={isEditing ? (editData.birthdate || '') : (profile.birthdate || '')}
              onChange={(e) => handleInputChange('birthdate', e.target.value)}
              disabled={!isEditing}
              fullWidth
              type="date"
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth>
              <InputLabel>Género</InputLabel>
              <Select
                value={isEditing ? (editData.gender || '') : (profile.gender || '')}
                label="Género"
                onChange={(e) => handleInputChange('gender', e.target.value)}
                disabled={!isEditing}
              >
                <MenuItem value="Femenino">Femenino</MenuItem>
                <MenuItem value="Masculino">Masculino</MenuItem>
                <MenuItem value="Otro">Otro</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Información Profesional */}
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Información Profesional
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField
              label="Cargo/Posición"
              value={isEditing ? (editData.position || '') : (profile.position || '')}
              onChange={(e) => handleInputChange('position', e.target.value)}
              disabled={!isEditing}
              fullWidth
              placeholder="Profesor, Docente, etc."
            />
            <TextField
              label="Departamento"
              value={isEditing ? (editData.department || '') : (profile.department || '')}
              onChange={(e) => handleInputChange('department', e.target.value)}
              disabled={!isEditing}
              fullWidth
              placeholder="Ingeniería, Ciencias, etc."
            />
          </Box>
          
          <TextField
            label="Especialidad/Carrera"
            value={isEditing ? (editData.career || '') : (profile.career || '')}
            onChange={(e) => handleInputChange('career', e.target.value)}
            disabled={!isEditing}
            fullWidth
            placeholder="Ingeniería en Informática, Ciencias de la Computación, etc."
          />
          
          <TextField
            label="Biografía"
            value={isEditing ? (editData.bio || '') : (profile.bio || '')}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            disabled={!isEditing}
            fullWidth
            multiline
            rows={4}
            placeholder="Cuéntanos sobre tu experiencia académica, especialidades, logros..."
          />

          <Divider sx={{ my: 2 }} />

          {/* Información del Sistema */}
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Información del Sistema
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip
              icon={<SchoolIcon />}
              label={`Rol: ${profile.role || 'Docente'}`}
              color="primary"
              variant="outlined"
            />
            <Chip
              icon={profile.is_verified ? <PersonIcon /> : <WorkIcon />}
              label={profile.is_verified ? 'Verificado' : 'No verificado'}
              color={profile.is_verified ? 'success' : 'warning'}
              variant="outlined"
            />
            <Chip
              label={`Miembro desde: ${new Date(profile.created_at).toLocaleDateString()}`}
              color="info"
              variant="outlined"
            />
          </Box>
        </Box>
      </Paper>

      {/* Dialog para cambio de contraseña */}
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

      {/* Snackbar para errores */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}