import { useState } from 'react';
import {
  Box, Paper, Typography, TextField, Select, MenuItem, InputLabel, FormControl, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Stack, Button
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Block as BlockIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';

const mockUsers = [
  { id: 1, name: 'Juan Pérez', email: 'juan@email.com', role: 'Estudiante', status: 'Activo' },
  { id: 2, name: 'Empresa ACME', email: 'contacto@acme.com', role: 'Empresa', status: 'Pendiente' },
  { id: 3, name: 'Ana Admin', email: 'ana@admin.com', role: 'Administrador', status: 'Activo' },
  { id: 4, name: 'Pedro López', email: 'pedro@email.com', role: 'Estudiante', status: 'Suspendido' },
];

export default function UsuariosAdmin() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');

  const filteredUsers = mockUsers.filter(user =>
    (user.name.toLowerCase().includes(search.toLowerCase()) || user.email.toLowerCase().includes(search.toLowerCase())) &&
    (role ? user.role === role : true) &&
    (status ? user.status === status : true)
  );

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4, mb: 4, px: 2 }}>
      <Typography variant="h4" gutterBottom>Gestión de Usuarios</Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            label="Buscar usuario"
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{ minWidth: 200 }}
          />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Rol</InputLabel>
            <Select
              value={role}
              label="Rol"
              onChange={e => setRole(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="Estudiante">Estudiante</MenuItem>
              <MenuItem value="Empresa">Empresa</MenuItem>
              <MenuItem value="Administrador">Administrador</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Estado</InputLabel>
            <Select
              value={status}
              label="Estado"
              onChange={e => setStatus(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="Activo">Activo</MenuItem>
              <MenuItem value="Pendiente">Pendiente</MenuItem>
              <MenuItem value="Suspendido">Suspendido</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained">Agregar Usuario</Button>
        </Stack>
      </Paper>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map(user => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.status}</TableCell>
                <TableCell align="center">
                  <IconButton color="primary"><EditIcon /></IconButton>
                  <IconButton color="error"><DeleteIcon /></IconButton>
                  {user.status === 'Activo' ? (
                    <IconButton color="warning"><BlockIcon /></IconButton>
                  ) : (
                    <IconButton color="success"><CheckCircleIcon /></IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
} 