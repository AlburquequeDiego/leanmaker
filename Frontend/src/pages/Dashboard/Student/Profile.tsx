import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Avatar,
  Divider,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
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
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import Stack from '@mui/material/Stack';

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
  const [newSkill, setNewSkill] = useState('');
  const [certFile, setCertFile] = useState<File | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);

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

  const handleAddSkill = () => {
    if (newSkill.trim() && !editData.skills.includes(newSkill.trim())) {
      setEditData(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
      setNewSkill('');
    }
  };

  const handleDeleteSkill = (skill: string) => {
    setEditData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  const handleCertChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setCertFile(e.target.files[0]);
  };

  const handleCvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setCvFile(e.target.files[0]);
  };

  const handleRemoveCert = () => setCertFile(null);
  const handleRemoveCv = () => setCvFile(null);

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

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        <Box sx={{ flex: 2, minWidth: 0 }}>
          <Stack spacing={3}>
            {/* Información Personal */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ width: 64, height: 64, mr: 2 }}>
                  <PersonIcon fontSize="large" />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={700}>{isEditing ? editData.name : profileData.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{isEditing ? editData.email : profileData.email}</Typography>
                </Box>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Stack direction="row" spacing={2}>
                <Stack direction="column" spacing={1}>
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
                  <TextField
                    fullWidth
                    label="GPA"
                    type="number"
                    value={isEditing ? editData.gpa : profileData.gpa}
                    onChange={(e) => handleInputChange('gpa', Number(e.target.value))}
                    disabled={!isEditing}
                    inputProps={{ step: 0.1, min: 0, max: 5 }}
                  />
                </Stack>
              </Stack>
            </Paper>

            {/* Habilidades */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: 2 }}>
              <Typography variant="h6" gutterBottom>Habilidades</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {(isEditing ? editData.skills : profileData.skills).map((skill) => (
                  <Chip
                    key={skill}
                    label={skill}
                    color="primary"
                    onDelete={isEditing ? () => handleDeleteSkill(skill) : undefined}
                    sx={{ fontWeight: 500 }}
                  />
                ))}
              </Box>
              {isEditing && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    size="small"
                    label="Agregar habilidad"
                    value={newSkill}
                    onChange={e => setNewSkill(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
                  />
                  <Button variant="contained" onClick={handleAddSkill}>Agregar</Button>
                </Box>
              )}
            </Paper>

            {/* Certificados y CV */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: 2 }}>
              <Typography variant="h6" gutterBottom>Documentos</Typography>
              <Stack direction="row" spacing={2}>
                <Stack direction="column" spacing={1}>
                  <Typography variant="subtitle1">Certificado</Typography>
                  {certFile ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <Chip label={certFile.name} color="info" />
                      <IconButton onClick={handleRemoveCert}><DeleteIcon /></IconButton>
                    </Box>
                  ) : isEditing && (
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<CloudUploadIcon />}
                    >
                      Subir Certificado
                      <input type="file" hidden accept="application/pdf,image/*" onChange={handleCertChange} />
                    </Button>
                  )}
                </Stack>
                <Stack direction="column" spacing={1}>
                  <Typography variant="subtitle1">CV</Typography>
                  {cvFile ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <Chip label={cvFile.name} color="info" />
                      <IconButton onClick={handleRemoveCv}><DeleteIcon /></IconButton>
                    </Box>
                  ) : isEditing && (
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<CloudUploadIcon />}
                    >
                      Subir CV
                      <input type="file" hidden accept="application/pdf" onChange={handleCvChange} />
                    </Button>
                  )}
                </Stack>
              </Stack>
            </Paper>

            {/* Biografía */}
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2 }}>
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
          </Stack>
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack spacing={3}>
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
          </Stack>
        </Box>
      </Box>

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