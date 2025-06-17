import { Box, Paper, Typography, Avatar, Button, TextField, Divider, Alert } from '@mui/material';
import { AccountCircle as AccountCircleIcon } from '@mui/icons-material';
import { useState } from 'react';

export default function PerfilAdmin() {
  // Mock de datos del admin
  const [admin, setAdmin] = useState({
    nombre: 'Administrador Principal',
    email: 'admin@leanmaker.com',
    rol: 'Administrador',
  });

  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState(admin);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleEdit = () => {
    setEditData(admin);
    setEditMode(true);
    setSuccessMessage('');
  };

  const handleSave = () => {
    setAdmin(editData);
    setEditMode(false);
    setSuccessMessage('Perfil actualizado correctamente.');
  };

  const handlePasswordChange = () => {
    setPasswordError('');
    if (password.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden.');
      return;
    }
    setPassword('');
    setConfirmPassword('');
    setShowPasswordFields(false);
    setSuccessMessage('Contraseña cambiada correctamente.');
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 8, mb: 4, px: 2 }}>
      <Paper sx={{ p: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: 4 }}>
        <Avatar sx={{ width: 120, height: 120, mb: 3 }}>
          <AccountCircleIcon sx={{ fontSize: 100 }} />
        </Avatar>
        {successMessage && <Alert severity="success" sx={{ mb: 2, width: '100%' }}>{successMessage}</Alert>}
        {editMode ? (
          <>
            <TextField
              label="Nombre"
              value={editData.nombre}
              onChange={e => setEditData({ ...editData, nombre: e.target.value })}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Email"
              value={editData.email}
              onChange={e => setEditData({ ...editData, email: e.target.value })}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Rol"
              value={editData.rol}
              disabled
              fullWidth
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button variant="contained" color="primary" onClick={handleSave}>Guardar</Button>
              <Button variant="outlined" color="secondary" onClick={() => setEditMode(false)}>Cancelar</Button>
            </Box>
          </>
        ) : (
          <>
            <Typography variant="h4" gutterBottom>{admin.nombre}</Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>{admin.email}</Typography>
            <Typography variant="h6" color="primary" gutterBottom>{admin.rol}</Typography>
            <Button variant="outlined" sx={{ mt: 3, fontSize: 18, px: 4, py: 1.5 }} onClick={handleEdit}>Editar Perfil</Button>
          </>
        )}
        <Divider sx={{ my: 4, width: '100%' }} />
        <Typography variant="h6" sx={{ mb: 2 }}>Cambio de Contraseña</Typography>
        {showPasswordFields ? (
          <Box sx={{ width: '100%' }}>
            <TextField
              label="Nueva contraseña"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Repetir nueva contraseña"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            />
            {passwordError && <Alert severity="error" sx={{ mb: 2 }}>{passwordError}</Alert>}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="contained" color="primary" onClick={handlePasswordChange}>Guardar Contraseña</Button>
              <Button variant="outlined" color="secondary" onClick={() => { setShowPasswordFields(false); setPassword(''); setConfirmPassword(''); setPasswordError(''); }}>Cancelar</Button>
            </Box>
          </Box>
        ) : (
          <Button variant="text" color="secondary" sx={{ mt: 2, fontSize: 16 }} onClick={() => { setShowPasswordFields(true); setSuccessMessage(''); }}>Cambiar Contraseña</Button>
        )}
      </Paper>
    </Box>
  );
} 