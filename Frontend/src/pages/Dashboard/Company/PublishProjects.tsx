import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, Stepper, Step, StepLabel, FormControl, MenuItem, Select, Alert, Radio, RadioGroup, FormControlLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper as MuiPaper
} from '@mui/material';
import { projectService } from '../../../services/project.service';
import { authService } from '../../../services/auth.service';
import { useNavigate } from 'react-router-dom';

const steps = ['Información Básica', 'TRL y Horas', 'General', 'Resumen'];
const trlToApi = { 1: 1, 2: 1, 3: 2, 4: 2, 5: 3, 6: 3, 7: 4, 8: 4, 9: 4 } as const;
const apiToHours = { 1: 20, 2: 40, 3: 80, 4: 160 } as const;
const trlOptions = [
  { value: 1, label: 'TRL 1', desc: 'Fase de idea, sin definición clara ni desarrollo previo.' },
  { value: 2, label: 'TRL 2', desc: 'Definición clara y antecedentes de lo que se desea desarrollar.' },
  { value: 3, label: 'TRL 3', desc: 'Pruebas y validaciones de concepto. Componentes evaluados por separado.' },
  { value: 4, label: 'TRL 4', desc: 'Prototipo mínimo viable probado en condiciones controladas simples.' },
  { value: 5, label: 'TRL 5', desc: 'Prototipo mínimo viable probado en condiciones similares al entorno real.' },
  { value: 6, label: 'TRL 6', desc: 'Prototipo probado mediante un piloto en condiciones reales.' },
  { value: 7, label: 'TRL 7', desc: 'Desarrollo probado en condiciones reales, por un periodo prolongado.' },
  { value: 8, label: 'TRL 8', desc: 'Producto validado en lo técnico y lo comercial.' },
  { value: 9, label: 'TRL 9', desc: 'Producto completamente desarrollado y disponible para la sociedad.' },
];

const TRL_QUESTIONS = [
  'Este proyecto está en fase de idea, sin una definición clara y no cuenta con desarrollo previo.',
  'Este proyecto cuenta con una definición clara y antecedentes de lo que se desea desarrollar.',
  'Hemos desarrollados pruebas y validaciones de concepto. Algunos componentes del proyecto se han evaluado por separado.',
  'Contamos con un prototipo mínimo viable que ha sido probado en condiciones controladas simples.',
  'Contamos con un prototipo mínimo viable que ha sido probado en condiciones similares al entorno real.',
  'Contamos con un prototipo que ha sido probado mediante un piloto en condiciones reales.',
  'Contamos con un desarrollo que ha sido probado en condiciones reales, por un periodo de tiempo prolongado.',
  'Contamos con un producto validado en lo técnico y lo comercial.',
  'Contamos con un producto completamente desarrollado y disponible para la sociedad.'
];

// Lista estática de áreas
const AREAS_ESTATICAS = [
  { id: 1, name: 'Tecnología y Sistemas' },
  { id: 2, name: 'Administración y Gestión' },
  { id: 3, name: 'Comunicación y Marketing' },
  { id: 4, name: 'Salud y Ciencias' },
  { id: 5, name: 'Ingeniería y Construcción' },
  { id: 6, name: 'Educación y Formación' },
  { id: 7, name: 'Arte y Diseño' },
  { id: 8, name: 'Investigación y Desarrollo' },
  { id: 9, name: 'Servicios y Atención al Cliente' },
  { id: 10, name: 'Sostenibilidad y Medio Ambiente' },
];

export const PublishProjects: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState({
    title: '',
    description: '',
    publicDescription: '',
    area: '',
    tipo: '',
    objetivo: '',
    modalidad: '',
    encargado: '',
    contacto: '',
    fechaInicio: '',
    fechaFin: '',
    requirements: '',
    duration: '',
    studentsNeeded: 1,
    meses: '',
    trl: 1,
    horas: '' // <-- aseguramos que horas siempre sea string
  });
  const [trlSelected, setTrlSelected] = useState(1);
  const [hoursError, setHoursError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const trlKey = trlSelected as keyof typeof trlToApi;
  const apiKey = trlToApi[trlKey] as keyof typeof apiToHours;
  const minHours = apiToHours[apiKey];
  const [areas, setAreas] = useState<{ id: number; name: string }[]>(AREAS_ESTATICAS);
  const [loadingAreas, setLoadingAreas] = useState(false); // Ya no se carga desde API
  const navigate = useNavigate();

  // Elimina el useEffect que cargaba áreas desde la API

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === 'horas') {
      if (Number(e.target.value) < minHours) {
        setHoursError(`El mínimo para este TRL es ${minHours} horas.`);
      } else {
        setHoursError(null);
      }
    }
  };

  const handleTrlChange = (e: any) => {
    const value = Number(e.target.value) as keyof typeof trlToApi;
    setTrlSelected(value);
    setForm({ ...form, trl: value });
    const min = apiToHours[trlToApi[value]];
    if (Number(form.horas) < min) {
      setHoursError(`El mínimo para este TRL es ${min} horas.`);
    } else {
      setHoursError(null);
    }
  };

  const nextStep = () => {
    setError(null);
    setSuccess(null);
    setActiveStep((s) => Math.min(s + 1, steps.length - 1));
  };
  const prevStep = () => {
    setError(null);
    setSuccess(null);
    setActiveStep((s) => Math.max(s - 1, 0));
  };

  const validateForm = () => {
    const errors: string[] = [];
    if (!form.title || form.title.trim().length < 5) {
      errors.push('El título es obligatorio y debe tener al menos 5 caracteres.');
    }
    if (!form.description || form.description.trim().length < 20) {
      errors.push('La descripción es obligatoria y debe tener al menos 20 caracteres.');
    }
    if (!form.requirements || form.requirements.trim().length < 10) {
      errors.push('Los requisitos son obligatorios y deben tener al menos 10 caracteres.');
    }
    if (!form.area) {
      errors.push('Debes seleccionar un área.');
    }
    if (!trlSelected) {
      errors.push('Debes seleccionar un nivel TRL.');
    }
    if (!form.horas || Number(form.horas) < minHours) {
      errors.push(`Debes ingresar las horas ofrecidas (mínimo ${minHours}).`);
    }
    
    // Validar coherencia entre horas totales y duración
    const horasTotales = Number(form.horas) || 0;
    const duracionMeses = Number(form.meses) || 1;
    const duracionSemanas = duracionMeses * 4;
    const horasPorSemana = Math.ceil(horasTotales / duracionSemanas);
    
    if (horasPorSemana > 40) {
      errors.push(`Las horas por semana (${horasPorSemana}) son muy altas. Considera aumentar la duración del proyecto.`);
    }
    if (horasPorSemana < 5) {
      errors.push(`Las horas por semana (${horasPorSemana}) son muy bajas. Considera reducir la duración del proyecto.`);
    }
    
    return errors;
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);
    // Solo permitir publicar si está en el último paso
    if (activeStep !== steps.length - 1) {
      setError('Debes completar todo el cuestionario antes de publicar el proyecto.');
      return;
    }
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(' '));
      return;
    }
    try {
      // Forzar recarga del perfil de usuario para obtener el company_id actualizado
      const user = await authService.getCurrentUser();
      const company_id = user?.company_profile?.id;
      if (!company_id) {
        setError('No se pudo obtener el ID de la empresa. Asegúrate de que tu cuenta esté correctamente vinculada a un perfil de empresa.');
        return;
      }
      const datosAEnviar = {
        title: form.title,
        description: form.description,
        requirements: form.requirements,
        publicDescription: form.publicDescription,
        tipo: form.tipo,
        objetivo: form.objetivo,
        modalidad: form.modalidad,
        encargado: form.encargado,
        contacto: form.contacto,
        start_date: form.fechaInicio,
        estimated_end_date: form.fechaFin,
        area_id: form.area, // nombre correcto para backend
        trl_id: trlSelected,
        required_hours: Number(form.horas) || 0,
        api_level: trlToApi[trlKey],
        company_id,
        status_id: 4, // ID del estado "Publicado" (no 9)
        max_students: Number(form.studentsNeeded) || 1,
        duration_weeks: Number(form.meses) || 1,
        // Calcular hours_per_week de forma coherente
        hours_per_week: Math.ceil((Number(form.horas) || 0) / (Number(form.meses) * 4 || 1)),
        modality: (form.modalidad || '').toLowerCase() === 'remoto' ? 'remote' : (form.modalidad || '').toLowerCase() === 'presencial' ? 'onsite' : (form.modalidad || '').toLowerCase() === 'híbrido' || (form.modalidad || '').toLowerCase() === 'hibrido' ? 'hybrid' : 'remote',
        difficulty: form.dificultad || 'intermediate',
      };
      console.log('Datos enviados al backend:', datosAEnviar);
      const response = await projectService.createProject(datosAEnviar);
      // El servicio ya maneja la respuesta y devuelve directamente los datos
      const projectId = response?.id || response?.data?.id;
      if (projectId) {
        setSuccess('Proyecto creado exitosamente.');
        setTimeout(() => {
          setSuccess(null);
          navigate('/dashboard/company/projects', { state: { initialTab: 0 } });
        }, 1500);
        setForm({ title: '', description: '', publicDescription: '', area: '', tipo: '', objetivo: '', modalidad: '', encargado: '', contacto: '', fechaInicio: '', fechaFin: '', requirements: '', duration: '', studentsNeeded: 1, meses: '', trl: 1, horas: '' });
        setActiveStep(0);
      } else {
        setError('Error al crear el proyecto: Respuesta inesperada del servidor');
      }
    } catch (e: any) {
      console.error('Error al crear proyecto:', e, e.response, e?.message, e?.stack);
      setError(e.response?.data?.error || e.message || 'Error al crear el proyecto');
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 2 }}>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {activeStep === 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Nombre del Proyecto" name="title" value={form.title} onChange={handleChange} fullWidth required helperText="Mínimo 5 caracteres" />
          <TextField label="Descripción del Proyecto" name="description" value={form.description} onChange={handleChange} fullWidth required multiline minRows={2} helperText="Mínimo 20 caracteres" />
          <TextField label="Descripción Pública" name="publicDescription" value={form.publicDescription} onChange={handleChange} fullWidth required />
          <TextField label="Tipo de Actividad" name="tipo" value={form.tipo} onChange={handleChange} fullWidth required placeholder="Formación, Curricular, Co-curricular, Otro" />
          <FormControl fullWidth required disabled={loadingAreas}>
            <Select
              name="area"
              value={form.area}
              onChange={e => setForm({ ...form, area: e.target.value })}
              displayEmpty
            >
              <MenuItem value=""><em>Selecciona un área</em></MenuItem>
              {areas.map(area => (
                <MenuItem key={area.id} value={area.id}>{area.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField label="Objetivo del Proyecto" name="objetivo" value={form.objetivo} onChange={handleChange} fullWidth required />
          <TextField label="Requisitos del Proyecto" name="requirements" value={form.requirements} onChange={handleChange} fullWidth required helperText="Mínimo 10 caracteres" />
        </Box>
      )}
      {activeStep === 1 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>¿En qué etapa TRL se encuentra tu proyecto?</Typography>
          <RadioGroup value={trlSelected} onChange={handleTrlChange}>
            {TRL_QUESTIONS.map((q, idx) => (
              <FormControlLabel
                key={idx + 1}
                value={idx + 1}
                control={<Radio />}
                label={<span><b>TRL {idx + 1}:</b> {q}</span>}
              />
            ))}
          </RadioGroup>
          <TextField
            label={`Horas ofrecidas (mínimo ${minHours} horas)`}
            name="horas"
            type="number"
            value={form.horas}
            onChange={handleChange}
            fullWidth
            required
            error={!!hoursError}
            helperText={hoursError}
            inputProps={{ min: minHours }}
          />
          
          {/* Visualización del cálculo en tiempo real */}
          {form.horas && form.meses && (
            <MuiPaper sx={{ bgcolor: '#e3f2fd', p: 2, borderRadius: 2, border: '1px solid #2196f3' }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: '#1976d2' }}>
                📊 Cálculo de horas por semana
              </Typography>
              <Typography variant="body2" sx={{ color: '#1976d2' }}>
                <strong>Horas totales:</strong> {form.horas} horas<br/>
                <strong>Duración:</strong> {form.meses} mes(es) = {(Number(form.meses) || 1) * 4} semanas<br/>
                <strong>Horas por semana:</strong> {Math.ceil(Number(form.horas) / ((Number(form.meses) || 1) * 4))} horas/semana
              </Typography>
              {Math.ceil(Number(form.horas) / ((Number(form.meses) || 1) * 4)) > 40 && (
                <Typography variant="body2" sx={{ mt: 1, color: '#f57c00', fontWeight: 'bold' }}>
                  ⚠️ Las horas por semana son muy altas. Considera aumentar la duración.
                </Typography>
              )}
              {Math.ceil(Number(form.horas) / ((Number(form.meses) || 1) * 4)) < 5 && (
                <Typography variant="body2" sx={{ mt: 1, color: '#f57c00', fontWeight: 'bold' }}>
                  ⚠️ Las horas por semana son muy bajas. Considera reducir la duración.
                </Typography>
              )}
            </MuiPaper>
          )}
          
          <MuiPaper sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 2, mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Relación entre TRL, API y Horas mínimas</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><b>Año</b></TableCell>
                    <TableCell><b>Nivel de desarrollo</b></TableCell>
                    <TableCell><b>Horas en proyecto</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>1</TableCell>
                    <TableCell>Asesoría</TableCell>
                    <TableCell>20</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>2</TableCell>
                    <TableCell>Asesoría + Propuesta solución</TableCell>
                    <TableCell>40</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>3</TableCell>
                    <TableCell>Asesoría + Propuesta solución + implementación</TableCell>
                    <TableCell>80</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>4</TableCell>
                    <TableCell>Asesoría + Propuesta solución + implementación + upgrade/control</TableCell>
                    <TableCell>160</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                <b>Mapeo implementado:</b><br/>
                API 1 → TRL 1-2 (20 horas)<br/>
                API 2 → TRL 1-4 (40 horas)<br/>
                API 3 → TRL 1-6 (80 horas)<br/>
                API 4 → TRL 1-9 (160 horas)
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                El TRL seleccionado determina el nivel API y las horas mínimas que debe ofrecer el proyecto. Mientras mayor el TRL, mayor el compromiso y la madurez del proyecto.
              </Typography>
            </Box>
          </MuiPaper>
        </Box>
      )}
      {activeStep === 2 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Modalidad" name="modalidad" value={form.modalidad} onChange={handleChange} fullWidth required placeholder="Presencial, Remoto, Híbrido" />
          <FormControl fullWidth required>
            <Select
              name="dificultad"
              value={form.dificultad || ''}
              onChange={e => setForm({ ...form, dificultad: e.target.value })}
              displayEmpty
            >
              <MenuItem value=""><em>Selecciona la dificultad</em></MenuItem>
              <MenuItem value="intermediate">Intermedio</MenuItem>
              <MenuItem value="intermediate-advanced">Intermedio-Avanzado</MenuItem>
              <MenuItem value="advanced">Avanzado</MenuItem>
            </Select>
          </FormControl>
          <TextField label="Encargado del Proyecto" name="encargado" value={form.encargado} onChange={handleChange} fullWidth required />
          <TextField label="Contacto de la Empresa" name="contacto" value={form.contacto} onChange={handleChange} fullWidth required />
          <TextField label="Fecha de Inicio Estimada" name="fechaInicio" type="date" value={form.fechaInicio} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} required />
          <TextField label="Fecha de Finalización Estimada" name="fechaFin" type="date" value={form.fechaFin} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} required />
          <TextField label="Duración (meses)" name="meses" type="number" value={form.meses} onChange={handleChange} fullWidth required />
          <TextField label="Estudiantes requeridos" name="studentsNeeded" type="number" value={form.studentsNeeded} onChange={handleChange} fullWidth required />
        </Box>
      )}
      {activeStep === 3 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h6">Resumen</Typography>
          <Typography variant="subtitle2">Nombre: {form.title}</Typography>
          <Typography variant="subtitle2">Tipo: {form.tipo}</Typography>
          <Typography variant="subtitle2">Objetivo: {form.objetivo}</Typography>
          <Typography variant="subtitle2">Estudiantes requeridos: {form.studentsNeeded}</Typography>
          <Typography variant="subtitle2">TRL Seleccionado: TRL {trlSelected}</Typography>
          <Typography variant="subtitle2">Horas ofrecidas: {form.horas}</Typography>
          <Typography variant="subtitle2">Duración: {form.meses} mes(es) = {(Number(form.meses) || 1) * 4} semanas</Typography>
          <Typography variant="subtitle2">Horas por semana: {Math.ceil(Number(form.horas) / ((Number(form.meses) || 1) * 4))} horas/semana</Typography>
        </Box>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button disabled={activeStep === 0} onClick={prevStep} variant="outlined">Anterior</Button>
        {activeStep < steps.length - 1 ? (
          <Button variant="contained" color="primary" onClick={nextStep} disabled={activeStep === 2 && !!hoursError}>Siguiente</Button>
        ) : (
          <Button variant="contained" color="success" onClick={handleSubmit} disabled={!!hoursError}>Publicar Proyecto</Button>
        )}
      </Box>
    </Box>
  );
};

export default PublishProjects;
