import { Box, Paper, Typography, TextField, Button, Select, MenuItem, InputLabel, FormControl, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Stack } from '@mui/material';
import { useState } from 'react';

const mockHistorial = [
  { id: 1, mensaje: 'Recordatorio: entrega de proyectos', destinatarios: 'Estudiantes', fecha: '2024-06-10 10:00', estado: 'Enviada' },
  { id: 2, mensaje: 'Bienvenida a nuevas empresas', destinatarios: 'Empresas', fecha: '2024-06-09 09:00', estado: 'Enviada' },
  { id: 3, mensaje: 'Aviso de mantenimiento', destinatarios: 'Todos', fecha: '2024-06-08 18:00', estado: 'Enviada' },
];

const plantillas = [
  { id: 1, texto: 'Recordatorio: entrega de proyectos' },
  { id: 2, texto: 'Bienvenida a nuevos usuarios' },
  { id: 3, texto: 'Aviso de mantenimiento' },
];

export default function NotificacionesAdmin() {
  const [mensaje, setMensaje] = useState('');
  const [destinatarios, setDestinatarios] = useState('Todos');
  const [plantilla, setPlantilla] = useState('');

  const handlePlantilla = (id: string) => {
    const plantillaSeleccionada = plantillas.find(p => p.id.toString() === id);
    if (plantillaSeleccionada) {
      setMensaje(plantillaSeleccionada.texto);
      setPlantilla(id);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, mb: 4, px: 2 }}>
      <Typography variant="h4" gutterBottom>Envío de Notificaciones Masivas</Typography>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Stack spacing={2}>
          <FormControl fullWidth>
            <InputLabel>Plantilla</InputLabel>
            <Select
              value={plantilla}
              label="Plantilla"
              onChange={e => handlePlantilla(e.target.value)}
            >
              <MenuItem value="">Sin plantilla</MenuItem>
              {plantillas.map(p => (
                <MenuItem key={p.id} value={p.id}>{p.texto}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Mensaje"
            multiline
            minRows={3}
            value={mensaje}
            onChange={e => setMensaje(e.target.value)}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Destinatarios</InputLabel>
            <Select
              value={destinatarios}
              label="Destinatarios"
              onChange={e => setDestinatarios(e.target.value)}
            >
              <MenuItem value="Todos">Todos</MenuItem>
              <MenuItem value="Estudiantes">Estudiantes</MenuItem>
              <MenuItem value="Empresas">Empresas</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" color="primary">Enviar Notificación</Button>
        </Stack>
      </Paper>
      <Typography variant="h5" gutterBottom>Historial de Notificaciones</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mensaje</TableCell>
              <TableCell>Destinatarios</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Estado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockHistorial.map(n => (
              <TableRow key={n.id}>
                <TableCell>{n.mensaje}</TableCell>
                <TableCell>{n.destinatarios}</TableCell>
                <TableCell>{n.fecha}</TableCell>
                <TableCell>{n.estado}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
} 