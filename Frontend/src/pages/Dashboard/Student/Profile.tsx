import { useState } from 'react';
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
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';


interface ProfileData {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  fechaNacimiento: string;
  genero: string;
  institucion: string;
  carrera: string;
  nivel: string;
  habilidades: Array<{ nombre: string; nivel: string }>;
  biografia: string;
  cv: File | null;
  certificado: File | null;
  area?: string;
  modalidadesDisponibles?: string[];
  experienciaPrevia?: string;
  linkedin?: string;
  github?: string;
  portafolio?: string;
}

interface ValidationErrors {
  [key: string]: string;
}



export const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const [profileData, setProfileData] = useState<ProfileData>({
    nombre: 'María',
    apellido: 'González',
    email: 'maria.gonzalez@estudiante.edu',
    telefono: '+57 300 123 4567',
    fechaNacimiento: '2000-05-15',
    genero: 'Mujer',
    institucion: 'Universidad de Chile',
    carrera: 'Ingeniería de Sistemas',
    nivel: 'Pregrado',
    habilidades: [
      { nombre: 'React', nivel: 'Avanzado' },
      { nombre: 'Node.js', nivel: 'Intermedio' },
    ],
    biografia: 'Estudiante apasionada por el desarrollo de software y la innovación tecnológica.',
    cv: null,
    certificado: null,
    area: 'Desarrollo Web',
    modalidadesDisponibles: ['Tiempo completo', 'Flexible'],
    experienciaPrevia: 'Práctica profesional en desarrollo frontend en TechCorp Solutions (2023).',
    linkedin: 'https://linkedin.com/in/mariagonzalez',
    github: 'https://github.com/mariagonzalez',
    portafolio: 'https://mariagonzalez.dev',
  });

  const [editData, setEditData] = useState<ProfileData>(profileData);
  const [newSkill, setNewSkill] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('Básico');

  // Validaciones
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (!editData.nombre.trim()) {
      errors.nombre = 'El nombre es requerido';
    }

    if (!editData.apellido.trim()) {
      errors.apellido = 'El apellido es requerido';
    }

    if (!editData.email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!validateEmail(editData.email)) {
      errors.email = 'El email no es válido';
    }

    if (!editData.telefono.trim()) {
      errors.telefono = 'El teléfono es requerido';
    } else if (!validatePhone(editData.telefono)) {
      errors.telefono = 'El teléfono no es válido';
    }

    if (!editData.institucion.trim()) {
      errors.institucion = 'La institución es requerida';
    }

    if (!editData.carrera.trim()) {
      errors.carrera = 'La carrera es requerida';
    }

    if (!editData.biografia.trim()) {
      errors.biografia = 'La biografía es requerida';
    } else if (editData.biografia.length < 50) {
      errors.biografia = 'La biografía debe tener al menos 50 caracteres';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEdit = () => {
    setEditData(profileData);
    setIsEditing(true);
    setValidationErrors({});
  };

  const handleSave = async () => {
    if (!validateForm()) {
      setErrorMessage('Por favor, corrige los errores en el formulario');
      setShowError(true);
      return;
    }

    setIsLoading(true);
    
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setProfileData(editData);
      setIsEditing(false);
      setShowSuccess(true);
      setValidationErrors({});
    } catch (error) {
      setErrorMessage('Error al guardar los cambios. Intenta nuevamente.');
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData(profileData);
    setIsEditing(false);
    setValidationErrors({});
  };

  const handleInputChange = (field: string, value: any) => {
    setEditData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error de validación cuando el usuario empiece a escribir
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Habilidades
  const handleAddSkill = () => {
    if (!newSkill.trim()) {
      setErrorMessage('Por favor, ingresa el nombre de la habilidad');
      setShowError(true);
      return;
    }

    if (editData.habilidades.some(h => h.nombre.toLowerCase() === newSkill.trim().toLowerCase())) {
      setErrorMessage('Esta habilidad ya existe en tu perfil');
      setShowError(true);
      return;
    }

    setEditData(prev => ({
      ...prev,
      habilidades: [...prev.habilidades, { nombre: newSkill.trim(), nivel: newSkillLevel }],
    }));
    setNewSkill('');
    setNewSkillLevel('Básico');
  };

  const handleDeleteSkill = (nombre: string) => {
    setSkillToDelete(nombre);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteSkill = () => {
    setEditData(prev => ({
      ...prev,
      habilidades: prev.habilidades.filter(h => h.nombre !== skillToDelete),
    }));
    setDeleteDialogOpen(false);
    setSkillToDelete('');
  };

  // Documentos
  const handleCvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB
        setErrorMessage('El archivo CV no puede ser mayor a 5MB');
        setShowError(true);
        return;
      }
      if (file.type !== 'application/pdf') {
        setErrorMessage('El CV debe ser un archivo PDF');
        setShowError(true);
        return;
      }
      setEditData(prev => ({ ...prev, cv: file }));
    }
  };

  const handleCertChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) { // 10MB
        setErrorMessage('El archivo de certificado no puede ser mayor a 10MB');
        setShowError(true);
        return;
      }
      setEditData(prev => ({ ...prev, certificado: file }));
    }
  };

  const handleRemoveCv = () => setEditData(prev => ({ ...prev, cv: null }));
  const handleRemoveCert = () => setEditData(prev => ({ ...prev, certificado: null }));

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
              startIcon={isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={handleSave}
              disabled={isLoading}
              sx={{ minWidth: 140, borderRadius: 2 }}
            >
              {isLoading ? 'Guardando...' : 'Guardar cambios'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={handleCancel}
              disabled={isLoading}
              sx={{ minWidth: 120, borderRadius: 2 }}
            >
              Cancelar
            </Button>
          </Box>
        )}
      </Box>

      <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3, maxWidth: 700, mx: 'auto' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Datos personales */}
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField
              label="Nombre"
              value={isEditing ? editData.nombre : profileData.nombre}
              onChange={e => handleInputChange('nombre', e.target.value)}
              disabled={!isEditing}
              fullWidth
              error={!!validationErrors.nombre}
              helperText={validationErrors.nombre}
            />
            <TextField
              label="Apellido"
              value={isEditing ? editData.apellido : profileData.apellido}
              onChange={e => handleInputChange('apellido', e.target.value)}
              disabled={!isEditing}
              fullWidth
              error={!!validationErrors.apellido}
              helperText={validationErrors.apellido}
            />
          </Box>
          <TextField
            label="Correo Electrónico"
            value={isEditing ? editData.email : profileData.email}
            onChange={e => handleInputChange('email', e.target.value)}
            disabled={!isEditing}
            fullWidth
            error={!!validationErrors.email}
            helperText={validationErrors.email}
          />
          <TextField
            label="Teléfono"
            value={isEditing ? editData.telefono : profileData.telefono}
            onChange={e => handleInputChange('telefono', e.target.value)}
            disabled={!isEditing}
            fullWidth
            error={!!validationErrors.telefono}
            helperText={validationErrors.telefono}
          />
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField
              label="Fecha de Nacimiento"
              type="date"
              value={isEditing ? editData.fechaNacimiento : profileData.fechaNacimiento}
              onChange={e => handleInputChange('fechaNacimiento', e.target.value)}
              disabled={!isEditing}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Género"
              select
              value={isEditing ? editData.genero : profileData.genero}
              onChange={e => handleInputChange('genero', e.target.value)}
              disabled={!isEditing}
              fullWidth
            >
              <MenuItem value="">Selecciona el género</MenuItem>
              <MenuItem value="Mujer">Mujer</MenuItem>
              <MenuItem value="Hombre">Hombre</MenuItem>
              <MenuItem value="Otro">Otro</MenuItem>
            </TextField>
          </Box>
          <TextField
            label="Institución Educativa"
            value={isEditing ? editData.institucion : profileData.institucion}
            onChange={e => handleInputChange('institucion', e.target.value)}
            disabled={!isEditing}
            fullWidth
            error={!!validationErrors.institucion}
            helperText={validationErrors.institucion}
          />
          <TextField
            label="Carrera"
            value={isEditing ? editData.carrera : profileData.carrera}
            onChange={e => handleInputChange('carrera', e.target.value)}
            disabled={!isEditing}
            fullWidth
            error={!!validationErrors.carrera}
            helperText={validationErrors.carrera}
          />
          <TextField
            label="Nivel Educativo"
            value={isEditing ? editData.nivel : profileData.nivel}
            onChange={e => handleInputChange('nivel', e.target.value)}
            disabled={!isEditing}
            fullWidth
          />

          {/* Habilidades */}
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" fontWeight={600}>Habilidades</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {editData.habilidades.map((h) => (
              <Chip
                key={h.nombre}
                label={`${h.nombre} (${h.nivel})`}
                color="primary"
                onDelete={isEditing ? () => handleDeleteSkill(h.nombre) : undefined}
                sx={{ fontWeight: 500 }}
              />
            ))}
          </Box>
          {isEditing && (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              <TextField
                size="small"
                label="Agregar habilidad"
                value={newSkill}
                onChange={e => setNewSkill(e.target.value)}
                sx={{ minWidth: 150 }}
              />
              <TextField
                size="small"
                select
                label="Nivel"
                value={newSkillLevel}
                onChange={e => setNewSkillLevel(e.target.value)}
                sx={{ minWidth: 120 }}
              >
                <MenuItem value="Básico">Básico</MenuItem>
                <MenuItem value="Intermedio">Intermedio</MenuItem>
                <MenuItem value="Avanzado">Avanzado</MenuItem>
              </TextField>
              <Button variant="contained" onClick={handleAddSkill} size="small">
                Agregar
              </Button>
            </Box>
          )}

          {/* Documentos */}
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" fontWeight={600}>Documentos</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1">CV</Typography>
              {editData.cv ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <Chip
                    label={typeof editData.cv === 'string' ? editData.cv : editData.cv.name}
                    color="info"
                    icon={<CheckCircleIcon />}
                  />
                  {isEditing && <IconButton onClick={handleRemoveCv}><DeleteIcon /></IconButton>}
                </Box>
              ) : isEditing ? (
                <Button
                  variant="outlined"
                  size="small"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  sx={{ mt: 1, borderRadius: 2 }}
                >
                  Subir CV (PDF, max 5MB)
                  <input type="file" hidden accept="application/pdf" onChange={handleCvChange} />
                </Button>
              ) : (
                <Typography variant="body2" color="text.secondary">No subido</Typography>
              )}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1">Certificado</Typography>
              {editData.certificado ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <Chip
                    label={typeof editData.certificado === 'string' ? editData.certificado : editData.certificado.name}
                    color="info"
                    icon={<CheckCircleIcon />}
                  />
                  {isEditing && <IconButton onClick={handleRemoveCert}><DeleteIcon /></IconButton>}
                </Box>
              ) : isEditing ? (
                <Button
                  variant="outlined"
                  size="small"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  sx={{ mt: 1, borderRadius: 2 }}
                >
                  Subir Certificado (max 10MB)
                  <input type="file" hidden accept="application/pdf,image/*" onChange={handleCertChange} />
                </Button>
              ) : (
                <Typography variant="body2" color="text.secondary">No subido</Typography>
              )}
            </Box>
          </Box>

          {/* Biografía */}
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" fontWeight={600}>Biografía</Typography>
          <TextField
            fullWidth
            multiline
            minRows={4}
            value={isEditing ? editData.biografia : profileData.biografia}
            onChange={e => handleInputChange('biografia', e.target.value)}
            disabled={!isEditing}
            placeholder="Cuéntanos sobre ti... (mínimo 50 caracteres)"
            sx={{ borderRadius: 2 }}
            error={!!validationErrors.biografia}
            helperText={validationErrors.biografia || `${editData.biografia.length}/50 caracteres mínimos`}
          />

          {/* Datos adicionales */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" fontWeight={600}>Área de interés</Typography>
            {isEditing ? (
              <TextField
                fullWidth
                value={editData.area || ''}
                onChange={e => handleInputChange('area', e.target.value)}
                placeholder="Ej: Desarrollo Web, Data Science, etc."
                sx={{ mb: 2 }}
              />
            ) : (
              <Typography variant="body2" sx={{ mb: 2 }}>{profileData.area || '-'}</Typography>
            )}
            <Typography variant="subtitle1" fontWeight={600}>Modalidades disponibles</Typography>
            {isEditing ? (
              <TextField
                select
                fullWidth
                SelectProps={{ multiple: true }}
                value={editData.modalidadesDisponibles || []}
                onChange={e => handleInputChange('modalidadesDisponibles', Array.isArray(e.target.value) ? e.target.value : [e.target.value])}
                sx={{ mb: 2 }}
              >
                <MenuItem value="Tiempo completo">Tiempo completo</MenuItem>
                <MenuItem value="Tiempo parcial">Tiempo parcial</MenuItem>
                <MenuItem value="Flexible">Flexible</MenuItem>
              </TextField>
            ) : (
              <Box sx={{ mb: 2 }}>
                {(profileData.modalidadesDisponibles || []).map(m => (
                  <Chip key={m} label={m} sx={{ mr: 1, mb: 1 }} />
                ))}
                {(!profileData.modalidadesDisponibles || profileData.modalidadesDisponibles.length === 0) && <Typography variant="body2">-</Typography>}
              </Box>
            )}
            <Typography variant="subtitle1" fontWeight={600}>Experiencia previa</Typography>
            {isEditing ? (
              <TextField
                fullWidth
                multiline
                minRows={2}
                value={editData.experienciaPrevia || ''}
                onChange={e => handleInputChange('experienciaPrevia', e.target.value)}
                placeholder="Describe tu experiencia previa en algún puesto, práctica, voluntariado, etc."
                sx={{ mb: 2 }}
              />
            ) : (
              <Typography variant="body2" sx={{ mb: 2 }}>{profileData.experienciaPrevia || '-'}</Typography>
            )}
            <Typography variant="subtitle1" fontWeight={600}>LinkedIn</Typography>
            {isEditing ? (
              <TextField
                fullWidth
                value={editData.linkedin || ''}
                onChange={e => handleInputChange('linkedin', e.target.value)}
                placeholder="https://linkedin.com/in/usuario"
                sx={{ mb: 2 }}
              />
            ) : (
              <Typography variant="body2" sx={{ mb: 2 }}>{profileData.linkedin || '-'}</Typography>
            )}
            <Typography variant="subtitle1" fontWeight={600}>GitHub</Typography>
            {isEditing ? (
              <TextField
                fullWidth
                value={editData.github || ''}
                onChange={e => handleInputChange('github', e.target.value)}
                placeholder="https://github.com/usuario"
                sx={{ mb: 2 }}
              />
            ) : (
              <Typography variant="body2" sx={{ mb: 2 }}>{profileData.github || '-'}</Typography>
            )}
            <Typography variant="subtitle1" fontWeight={600}>Portafolio</Typography>
            {isEditing ? (
              <TextField
                fullWidth
                value={editData.portafolio || ''}
                onChange={e => handleInputChange('portafolio', e.target.value)}
                placeholder="https://miportafolio.com (opcional)"
                sx={{ mb: 2 }}
              />
            ) : (
              <Typography variant="body2" sx={{ mb: 2 }}>{profileData.portafolio || '-'}</Typography>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Snackbars */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={4000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          ¡Perfil actualizado correctamente!
        </Alert>
      </Snackbar>

      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={() => setShowError(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>

      {/* Dialog de confirmación para eliminar habilidad */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que quieres eliminar la habilidad "{skillToDelete}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={confirmDeleteSkill} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile; 