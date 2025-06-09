import { useState } from 'react';
import {
  Box, Paper, Typography, TextField, Select, MenuItem, InputLabel, FormControl, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Stack, Button, Chip
} from '@mui/material';
import { CheckCircle as CheckCircleIcon, Cancel as CancelIcon, Visibility as VisibilityIcon, Download as DownloadIcon } from '@mui/icons-material';

const mockHorasPendientes = [
  { 
    id: 1, 
    estudiante: 'Juan Pérez', 
    empresa: 'Empresa ACME', 
    proyecto: 'Desarrollo App Web', 
    horas: 120, 
    fechaReporte: '2024-01-15', 
    estado: 'Pendiente',
    carrera: 'Ingeniería de Software'
  },
  { 
    id: 2, 
    estudiante: 'María García', 
    empresa: 'Tech Solutions', 
    proyecto: 'Sistema de Inventario', 
    horas: 80, 
    fechaReporte: '2024-01-14', 
    estado: 'Pendiente',
    carrera: 'Ingeniería de Sistemas'
  },
  { 
    id: 3, 
    estudiante: 'Carlos López', 
    empresa: 'Digital Corp', 
    proyecto: 'App Móvil', 
    horas: 150, 
    fechaReporte: '2024-01-13', 
    estado: 'Pendiente',
    carrera: 'Ingeniería de Software'
  },
];

export default function ValidacionHorasAdmin() {
  const [search, setSearch] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [estado, setEstado] = useState('');

  const filteredHoras = mockHorasPendientes.filter(registro =>
    (registro.estudiante.toLowerCase().includes(search.toLowerCase()) || 
     registro.empresa.toLowerCase().includes(search.toLowerCase()) ||
     registro.proyecto.toLowerCase().includes(search.toLowerCase())) &&
    (empresa ? registro.empresa === empresa : true) &&
    (estado ? registro.estado === estado : true)
  );

  const empresas = [...new Set(mockHorasPendientes.map(r => r.empresa))];

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4, mb: 4, px: 2 }}>
      <Typography variant="h4" gutterBottom>Validación de Horas de Práctica Profesional</Typography>
      
      {/* Filtros y búsqueda */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            label="Buscar por estudiante, empresa o proyecto"
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{ minWidth: 300 }}
          />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Empresa</InputLabel>
            <Select
              value={empresa}
              label="Empresa"
              onChange={e => setEmpresa(e.target.value)}
            >
              <MenuItem value="">Todas</MenuItem>
              {empresas.map(emp => (
                <MenuItem key={emp} value={emp}>{emp}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Estado</InputLabel>
            <Select
              value={estado}
              label="Estado"
              onChange={e => setEstado(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="Pendiente">Pendiente</MenuItem>
              <MenuItem value="Aprobado">Aprobado</MenuItem>
              <MenuItem value="Rechazado">Rechazado</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" startIcon={<DownloadIcon />}>
            Descargar Reporte
          </Button>
        </Stack>
      </Paper>

      {/* Tabla de registros */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Estudiante</TableCell>
              <TableCell>Carrera</TableCell>
              <TableCell>Empresa</TableCell>
              <TableCell>Proyecto</TableCell>
              <TableCell align="center">Horas</TableCell>
              <TableCell>Fecha Reporte</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredHoras.map(registro => (
              <TableRow key={registro.id}>
                <TableCell>{registro.estudiante}</TableCell>
                <TableCell>{registro.carrera}</TableCell>
                <TableCell>{registro.empresa}</TableCell>
                <TableCell>{registro.proyecto}</TableCell>
                <TableCell align="center">
                  <Chip label={`${registro.horas} hrs`} color="primary" variant="outlined" />
                </TableCell>
                <TableCell>{new Date(registro.fechaReporte).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Chip 
                    label={registro.estado} 
                    color={registro.estado === 'Pendiente' ? 'warning' : 
                           registro.estado === 'Aprobado' ? 'success' : 'error'}
                    variant="filled"
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton color="primary" title="Ver detalles">
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton color="success" title="Aprobar horas">
                    <CheckCircleIcon />
                  </IconButton>
                  <IconButton color="error" title="Rechazar horas">
                    <CancelIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
} 