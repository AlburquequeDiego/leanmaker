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
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Web as WebIcon,
} from '@mui/icons-material';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../hooks/useAuth';
import type { User, Company } from '../../../types';

interface CompanyProfileData {
  // Datos del usuario
  user: User;
  // Datos de la empresa
  company: Company;
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

export const CompanyProfile: React.FC = () => {
  const api = useApi();
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<CompanyProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Company>>({});
  const [editUserData, setEditUserData] = useState<Partial<User>>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Estados para cambio de contraseña
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [dialogKey, setDialogKey] = useState(Date.now());

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
      
      console.log('🔍 [CompanyProfile] Datos de empresa recibidos:', companyData);
      
      // DEBUG: Log campos específicos del registro
      console.log('🔍 [CompanyProfile] company_address:', companyData.company_address);
      console.log('🔍 [CompanyProfile] company_phone:', companyData.company_phone);
      console.log('🔍 [CompanyProfile] company_email:', companyData.company_email);
      console.log('🔍 [CompanyProfile] rut:', companyData.rut);
      console.log('🔍 [CompanyProfile] personality:', companyData.personality);
      console.log('🔍 [CompanyProfile] business_name:', companyData.business_name);
      
      // Combinar datos del usuario con los datos de user_data de la empresa
      const combinedUserData = {
        ...userData,
        // Si userData no tiene birthdate/gender, usar los de companyData.user_data
        birthdate: userData.birthdate || (companyData.user_data && companyData.user_data.birthdate),
        gender: userData.gender || (companyData.user_data && companyData.user_data.gender),
      };
      
      console.log('🔍 [CompanyProfile] Datos combinados del usuario:', combinedUserData);
      console.log('🔍 [CompanyProfile] birthdate del usuario:', combinedUserData.birthdate);
      console.log('🔍 [CompanyProfile] gender del usuario:', combinedUserData.gender);
      console.log('🔍 [CompanyProfile] Datos de userData del backend:', userData);
      console.log('🔍 [CompanyProfile] Datos de companyData.user_data del backend:', companyData.user_data);
      console.log('🔍 [CompanyProfile] companyData completo:', companyData);
      console.log('🔍 [CompanyProfile] userData.birthdate:', userData.birthdate);
      console.log('🔍 [CompanyProfile] userData.gender:', userData.gender);
      console.log('🔍 [CompanyProfile] companyData.user_data?.birthdate:', companyData.user_data?.birthdate);
      console.log('🔍 [CompanyProfile] companyData.user_data?.gender:', companyData.user_data?.gender);
      
      const profileData: CompanyProfileData = {
        user: combinedUserData,
        company: companyData,
      };
      
      setProfile(profileData);
      setEditData(companyData);
      setEditUserData(combinedUserData);
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
      setEditUserData(profile.user);
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
        // Campos específicos del registro
        company_address: editData.company_address,
        company_phone: editData.company_phone,
        company_email: editData.company_email,
      };

      // Preparar payload completo con datos de empresa y usuario
      const completePayload = {
        ...payload,
        // Incluir datos del usuario si hay cambios
        ...(Object.keys(editUserData).length > 0 && {
          user_data: {
            first_name: editUserData.first_name,
            last_name: editUserData.last_name,
            phone: editUserData.phone,
            birthdate: editUserData.birthdate,
            gender: editUserData.gender,
          }
        })
      };

      console.log('🔍 [CompanyProfile] Enviando datos completos:', completePayload);
      console.log('🔍 [CompanyProfile] Campos específicos del registro:');
      console.log('  - company_address:', payload.company_address);
      console.log('  - company_phone:', payload.company_phone);
      console.log('  - company_email:', payload.company_email);
      console.log('  - rut:', payload.rut);
      console.log('  - personality:', payload.personality);
      console.log('  - business_name:', payload.business_name);
      
      if (completePayload.user_data) {
        console.log('🔍 [CompanyProfile] Campos de usuario:');
        console.log('  - birthdate:', completePayload.user_data.birthdate);
        console.log('  - gender:', completePayload.user_data.gender);
      }
      
      // Guardar datos completos en una sola petición
      await api.patch(`/api/companies/${profile.company.id}/update/`, completePayload);
      
      // Refrescar datos tras guardar
      await loadProfile();
      setIsEditing(false);
      setError(null);
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
      setEditUserData(profile.user);
    }
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof Company, value: any) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleUserInputChange = (field: keyof User, value: any) => {
    setEditUserData(prev => ({ ...prev, [field]: value }));
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
      
      await api.post('/api/users/change-password/', passwordData);
      
      setSuccess('Contraseña cambiada exitosamente');
      setShowPasswordDialog(false);
    } catch (error) {
      console.error('❌ [CompanyProfile] Error al cambiar contraseña:', error);
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
      {/* Header con botones de acción */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Perfil de Empresa</Typography>
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
          {/* Información de la Empresa */}
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Información de la Empresa
          </Typography>
          
            <TextField
              label="Nombre de la Empresa *"
            value={isEditing ? (editData.company_name || '') : (profile.company.company_name || '')}
              onChange={(e) => handleInputChange('company_name', e.target.value)}
            disabled={!isEditing}
            fullWidth
              required
            />
          
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField
              label="RUT"
              value={isEditing ? (editData.rut || '') : (profile.company.rut || '')}
              onChange={(e) => handleInputChange('rut', e.target.value)}
              disabled={!isEditing}
              fullWidth
              placeholder="12.345.678-9"
            />
            <FormControl fullWidth>
              <InputLabel>Personalidad</InputLabel>
              <Select
                value={isEditing ? (editData.personality || '') : (profile.company.personality || '')}
                label="Personalidad"
                onChange={(e) => handleInputChange('personality', e.target.value)}
                disabled={!isEditing}
              >
                <MenuItem value="Jurídica">Jurídica</MenuItem>
                <MenuItem value="Natural">Natural</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <TextField
            label="Razón Social"
            value={isEditing ? (editData.business_name || '') : (profile.company.business_name || '')}
            onChange={(e) => handleInputChange('business_name', e.target.value)}
            disabled={!isEditing}
            fullWidth
          />
          
          <TextField
            label="Dirección de la Empresa"
            value={isEditing ? (editData.company_address || '') : (profile.company.company_address || profile.company.address || '')}
            onChange={(e) => handleInputChange('company_address', e.target.value)}
            disabled={!isEditing}
            fullWidth
            placeholder="Dirección completa de la empresa"
          />
          
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField
              label="Ciudad"
              value={isEditing ? (editData.city || '') : (profile.company.city || '')}
              onChange={(e) => handleInputChange('city', e.target.value)}
              disabled={!isEditing}
              fullWidth
            />
            <TextField
              label="País"
              value={isEditing ? (editData.country || '') : (profile.company.country || '')}
              onChange={(e) => handleInputChange('country', e.target.value)}
              disabled={!isEditing}
              fullWidth
            />
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField
              label="Teléfono de la Empresa"
              value={isEditing ? (editData.company_phone || '') : (profile.company.company_phone || profile.company.contact_phone || '')}
              onChange={(e) => handleInputChange('company_phone', e.target.value)}
              disabled={!isEditing}
              fullWidth
              placeholder="+56 9 1234 5678"
            />
            <TextField
              label="Email de la Empresa"
              value={isEditing ? (editData.company_email || '') : (profile.company.company_email || profile.company.contact_email || '')}
              onChange={(e) => handleInputChange('company_email', e.target.value)}
              disabled={!isEditing}
              fullWidth
              type="email"
              placeholder="empresa@ejemplo.com"
            />
          </Box>
          
          <TextField
            label="Sitio Web"
            value={isEditing ? (editData.website || '') : (profile.company.website || '')}
            onChange={(e) => handleInputChange('website', e.target.value)}
            disabled={!isEditing}
            fullWidth
            placeholder="https://www.ejemplo.com"
          />
          
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField
              label="Industria"
              value={isEditing ? (editData.industry || '') : (profile.company.industry || '')}
              onChange={(e) => handleInputChange('industry', e.target.value)}
              disabled={!isEditing}
              fullWidth
              placeholder="Tecnología, Marketing, etc."
            />
            <FormControl fullWidth>
              <InputLabel>Tamaño</InputLabel>
              <Select
                value={isEditing ? (editData.size || '') : (profile.company.size || '')}
                label="Tamaño"
                onChange={(e) => handleInputChange('size', e.target.value)}
                disabled={!isEditing}
              >
                <MenuItem value="Pequeña">Pequeña</MenuItem>
                <MenuItem value="Mediana">Mediana</MenuItem>
                <MenuItem value="Grande">Grande</MenuItem>
                <MenuItem value="Startup">Startup</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <TextField
            label="Descripción"
            value={isEditing ? (editData.description || '') : (profile.company.description || '')}
            onChange={(e) => handleInputChange('description', e.target.value)}
            disabled={!isEditing}
            fullWidth
            multiline
            rows={4}
            placeholder="Describe tu empresa, misión, visión..."
          />

          <Divider sx={{ my: 2 }} />

          {/* Información del Usuario Responsable */}
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Usuario Responsable
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField
              label="Nombre"
              value={isEditing ? (editUserData.first_name || '') : (profile.user.first_name || '')}
              onChange={(e) => handleUserInputChange('first_name', e.target.value)}
              disabled={!isEditing}
              fullWidth
            />
            <TextField
              label="Apellido"
              value={isEditing ? (editUserData.last_name || '') : (profile.user.last_name || '')}
              onChange={(e) => handleUserInputChange('last_name', e.target.value)}
              disabled={!isEditing}
              fullWidth
            />
          </Box>
          
          <TextField
            label="Email"
            value={profile.user.email || ''}
            disabled
            fullWidth
            helperText="El email no se puede cambiar desde aquí"
          />
          
          <TextField
            label="Teléfono"
            value={isEditing ? (editUserData.phone || '') : (profile.user.phone || '')}
            onChange={(e) => handleUserInputChange('phone', e.target.value)}
            disabled={!isEditing}
            fullWidth
          />
          
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField
              label="Fecha de nacimiento"
              value={isEditing ? (editUserData.birthdate || '') : (profile.user.birthdate || '')}
              onChange={(e) => handleUserInputChange('birthdate', e.target.value)}
              disabled={!isEditing}
              fullWidth
              type="date"
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth>
              <InputLabel>Género</InputLabel>
              <Select
                value={isEditing ? (editUserData.gender || '') : (profile.user.gender || '')}
                label="Género"
                onChange={(e) => handleUserInputChange('gender', e.target.value)}
                disabled={!isEditing}
              >
                <MenuItem value="Femenino">Femenino</MenuItem>
                <MenuItem value="Masculino">Masculino</MenuItem>
                <MenuItem value="Otro">Otro</MenuItem>
              </Select>
            </FormControl>
            

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
};

export default CompanyProfile;
