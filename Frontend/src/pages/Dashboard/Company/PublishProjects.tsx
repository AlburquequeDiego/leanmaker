import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, Stepper, Step, StepLabel, FormControl, MenuItem, Select, Alert, Radio, RadioGroup, FormControlLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper as MuiPaper, InputLabel, FormHelperText
} from '@mui/material';
import { projectService } from '../../../services/project.service';
import { authService } from '../../../services/auth.service';
import { useNavigate } from 'react-router-dom';
import { MODALIDADES } from '../../../modalidades';

const steps = ['Información Básica', 'Etapa y Duración', 'General', 'Resumen'];
const trlToApi = { 1: 1, 2: 1, 3: 2, 4: 2, 5: 3, 6: 3, 7: 4, 8: 4, 9: 4 } as const;
const apiToHours = { 1: 20, 2: 40, 3: 80, 4: 160 } as const;

// Nuevos límites de horas por TRL
const TRL_HOURS_LIMITS = {
  1: { min: 20, max: 40, description: 'Opción 1-2: Proyectos en fase de idea' },
  2: { min: 20, max: 40, description: 'Opción 1-2: Proyectos en fase de idea' },
  3: { min: 40, max: 80, description: 'Opción 3-4: Prototipos básicos' },
  4: { min: 40, max: 80, description: 'Opción 3-4: Prototipos básicos' },
  5: { min: 80, max: 160, description: 'Opción 5-6: Prototipos avanzados' },
  6: { min: 80, max: 160, description: 'Opción 5-6: Prototipos avanzados' },
  7: { min: 160, max: 350, description: 'Opción 7-9: Productos desarrollados' },
  8: { min: 160, max: 350, description: 'Opción 7-9: Productos desarrollados' },
  9: { min: 160, max: 350, description: 'Opción 7-9: Productos desarrollados' },
} as const;

const trlOptions = [
  { value: 1, label: 'Opción 1', desc: 'Fase de idea, sin definición clara ni desarrollo previo.' },
  { value: 2, label: 'Opción 2', desc: 'Definición clara y antecedentes de lo que se desea desarrollar.' },
  { value: 3, label: 'Opción 3', desc: 'Pruebas y validaciones de concepto. Componentes evaluados por separado.' },
  { value: 4, label: 'Opción 4', desc: 'Prototipo mínimo viable probado en condiciones controladas simples.' },
  { value: 5, label: 'Opción 5', desc: 'Prototipo mínimo viable probado en condiciones similares al entorno real.' },
  { value: 6, label: 'Opción 6', desc: 'Prototipo probado mediante un piloto en condiciones reales.' },
  { value: 7, label: 'Opción 7', desc: 'Desarrollo probado en condiciones reales, por un periodo prolongado.' },
  { value: 8, label: 'Opción 8', desc: 'Producto validado en lo técnico y lo comercial.' },
  { value: 9, label: 'Opción 9', desc: 'Producto completamente desarrollado y disponible para la sociedad.' },
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
  { id: 11, name: 'Otro' },
];

export const PublishProjects: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState({
    title: '',
    description: '',
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
    horas: '', // <-- aseguramos que horas siempre sea string
    horasPorSemana: 10 // <-- nuevo campo para horas por semana
  });
  const [trlSelected, setTrlSelected] = useState(1);
  const [hoursError, setHoursError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Usar los nuevos límites de TRL
  const trlKey = trlSelected as keyof typeof TRL_HOURS_LIMITS;
  const trlLimits = TRL_HOURS_LIMITS[trlKey];
  const minHours = trlLimits.min;
  const maxHours = trlLimits.max;
  
  const [areas, setAreas] = useState<{ id: number; name: string }[]>(AREAS_ESTATICAS);
  const [loadingAreas, setLoadingAreas] = useState(false); // Ya no se carga desde API
  const [validatedSteps, setValidatedSteps] = useState<Set<number>>(new Set());
  const [modifiedSteps, setModifiedSteps] = useState<Set<number>>(new Set());
  const navigate = useNavigate();

  // Función para calcular duración en meses
  const calcularDuracionMeses = (fechaInicio: string, fechaFin: string) => {
    if (!fechaInicio || !fechaFin) return '';
    
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    
    if (fin <= inicio) return '0';
    
    const diferenciaMs = fin.getTime() - inicio.getTime();
    const diferenciaDias = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));
    const meses = Math.ceil(diferenciaDias / 30);
    
    return meses.toString();
  };

  // Función para calcular horas por semana
  const calcularHorasPorSemana = (horasTotales: number, meses: number) => {
    const semanas = meses * 4;
    return Math.ceil(horasTotales / semanas);
  };

  // Función para obtener el mensaje de advertencia de horas por semana
  const getHorasPorSemanaWarning = (horasPorSemana: number) => {
    if (horasPorSemana > 35) {
      return `⚠️ Las horas por semana (${horasPorSemana}) son muy altas. Considera aumentar la duración del proyecto. Recuerda que esto es una experiencia formativa, no un trabajo de jornada completa.`;
    }
    if (horasPorSemana < 5) {
      return `⚠️ Las horas por semana (${horasPorSemana}) son muy bajas. Considera reducir la duración del proyecto.`;
    }
    return null;
  };

  // Función para calcular la fecha de fin recomendada
  const calcularFechaFinRecomendada = (fechaInicio: string, horasTotales: number) => {
    if (!fechaInicio || !horasTotales) return '';
    
    const inicio = new Date(fechaInicio);
    const horasPorSemana = 35; // Límite máximo
    const semanasNecesarias = Math.ceil(horasTotales / horasPorSemana);
    const diasNecesarios = semanasNecesarias * 7;
    
    const fechaFin = new Date(inicio);
    fechaFin.setDate(fechaFin.getDate() + diasNecesarios);
    
    return fechaFin.toISOString().split('T')[0];
  };

  // Nueva función para calcular fecha de fin basada en horas por semana
  const calcularFechaFinConHorasSemanales = (fechaInicio: string, horasTotales: number, horasPorSemana: number) => {
    if (!fechaInicio || !horasTotales || !horasPorSemana) return '';
    
    if (horasPorSemana < 5) return ''; // Mínimo 5 horas por semana
    
    const inicio = new Date(fechaInicio);
    const semanasNecesarias = horasTotales / horasPorSemana;
    const diasNecesarios = Math.ceil(semanasNecesarias * 7);
    
    const fechaFin = new Date(inicio);
    fechaFin.setDate(fechaFin.getDate() + diasNecesarios);
    
    return fechaFin.toISOString().split('T')[0];
  };

  // Función para calcular meses basado en fechas
  const calcularMesesDesdeFechas = (fechaInicio: string, fechaFin: string) => {
    if (!fechaInicio || !fechaFin) return '';
    
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    
    if (fin <= inicio) return '0';
    
    const diferenciaMs = fin.getTime() - inicio.getTime();
    const diferenciaDias = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));
    const meses = Math.ceil(diferenciaDias / 30);
    
    return meses.toString();
  };

  // Efecto para validación (sin avance automático)
  useEffect(() => {
    const currentStepErrors = validateCurrentStep();
    console.log('🔍 Debug - Paso:', activeStep, 'Errores:', currentStepErrors.length, 'Validado:', validatedSteps.has(activeStep), 'Modificado:', modifiedSteps.has(activeStep));
    
    // Si no hay errores y el paso no está validado, marcarlo como validado
    if (currentStepErrors.length === 0 && !validatedSteps.has(activeStep)) {
      console.log('✅ Marcando paso', activeStep, 'como validado');
      setValidatedSteps(prev => new Set([...prev, activeStep]));
    }
    
    // El avance automático ha sido eliminado - ahora es completamente manual
  }, [form, trlSelected, activeStep]);

  // Efecto para calcular automáticamente la fecha de fin cuando cambian las horas o fecha de inicio
  useEffect(() => {
    if (form.fechaInicio && form.horas && form.horasPorSemana && Number(form.horas) > 0 && Number(form.horasPorSemana) >= 5) {
      const fechaFinCalculada = calcularFechaFinConHorasSemanales(
        form.fechaInicio, 
        Number(form.horas), 
        Number(form.horasPorSemana)
      );
      
      if (fechaFinCalculada) {
        const mesesCalculados = calcularMesesDesdeFechas(form.fechaInicio, fechaFinCalculada);
        
        setForm(prev => ({
          ...prev,
          fechaFin: fechaFinCalculada,
          meses: mesesCalculados
        }));
        
        console.log('📅 Fecha de fin calculada automáticamente:', fechaFinCalculada);
        console.log('📊 Meses calculados:', mesesCalculados);
      }
    }
  }, [form.fechaInicio, form.horas, form.horasPorSemana]);

  // Efecto para recalcular meses cuando la empresa modifica manualmente la fecha de fin
  useEffect(() => {
    if (form.fechaInicio && form.fechaFin) {
      const mesesCalculados = calcularMesesDesdeFechas(form.fechaInicio, form.fechaFin);
      setForm(prev => ({
        ...prev,
        meses: mesesCalculados
      }));
    }
  }, [form.fechaFin]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let value = e.target.value;
    
    // Limpiar errores generales cuando el usuario está editando
    if (error) {
      setError(null);
    }
    
    if (e.target.name === 'horas') {
      let numValue = Number(value);
      
      // Validar y corregir el valor si es necesario
      if (numValue > maxHours) {
        numValue = maxHours;
        value = maxHours.toString();
      }
      
      // Actualizar el formulario
      setForm({ ...form, [e.target.name]: value });
      
      // Marcar el paso actual como modificado
      setModifiedSteps(prev => new Set([...prev, activeStep]));
      
      // Validar y mostrar errores apropiados
      if (numValue < minHours) {
        setHoursError(`El mínimo para ${trlLimits.description} es ${minHours} horas.`);
      } else if (numValue > maxHours) {
        setHoursError(`El máximo para ${trlLimits.description} es ${maxHours} horas.`);
      } else {
        setHoursError(null);
      }
      return;
    }
    
    setForm({ ...form, [e.target.name]: value });
    // Marcar el paso actual como modificado
    setModifiedSteps(prev => new Set([...prev, activeStep]));
  };

  const handleTrlChange = (e: any) => {
    const value = Number(e.target.value) as keyof typeof TRL_HOURS_LIMITS;
    setTrlSelected(value);
    setForm({ ...form, trl: value });
    
    // Limpiar errores generales
    if (error) {
      setError(null);
    }
    
    // Marcar el paso actual como modificado
    setModifiedSteps(prev => new Set([...prev, activeStep]));
    
    // Validar las horas actuales contra el nuevo mínimo y máximo
    const newLimits = TRL_HOURS_LIMITS[value];
    const currentHours = Number(form.horas);
    
    if (currentHours > 0) {
      if (currentHours < newLimits.min) {
        setHoursError(`El mínimo para ${newLimits.description} es ${newLimits.min} horas.`);
      } else if (currentHours > newLimits.max) {
        setHoursError(`El máximo para ${newLimits.description} es ${newLimits.max} horas.`);
      } else {
        setHoursError(null);
      }
    }
  };

  const nextStep = () => {
    setError(null);
    setSuccess(null);
    
    // Validar el paso actual antes de avanzar
    const currentStepErrors = validateCurrentStep();
    if (currentStepErrors.length > 0) {
      setError(currentStepErrors.join(' '));
      return;
    }
    
    // Marcar el paso como validado
    setValidatedSteps(prev => new Set([...prev, activeStep]));
    
    // Avanzar al siguiente paso
    setActiveStep((s) => Math.min(s + 1, steps.length - 1));
  };
  
  const prevStep = () => {
    setError(null);
    setSuccess(null);
    setActiveStep((s) => Math.max(s - 1, 0));
  };

  const validateCurrentStep = () => {
    const errors: string[] = [];
    
    switch (activeStep) {
      case 0: // Información Básica
        if (!form.title || form.title.trim().length < 5) {
          errors.push('El título es obligatorio y debe tener al menos 5 caracteres.');
        }
        if (!form.description || form.description.trim().length < 5) {
          errors.push('La descripción es obligatoria y debe tener al menos 5 caracteres.');
        }
        if (!form.tipo || form.tipo.trim().length === 0) {
          errors.push('El tipo de actividad es obligatorio.');
        }
        if (!form.area) {
          errors.push('Debes seleccionar un área.');
        }
        if (!form.objetivo || form.objetivo.trim().length < 5) {
          errors.push('El objetivo del proyecto es obligatorio y debe tener al menos 5 caracteres.');
        }
        // Los requisitos son opcionales, pero si se proporcionan deben tener al menos 10 caracteres
        if (form.requirements && form.requirements.trim().length > 0 && form.requirements.trim().length < 10) {
          errors.push('Si proporcionas requisitos, deben tener al menos 10 caracteres.');
        }
        break;
        
      case 1: // Etapa y Duración
        if (!trlSelected) {
          errors.push('Debes seleccionar una etapa de desarrollo.');
        }
        if (!form.horas || Number(form.horas) < minHours) {
          errors.push(`Debes ingresar las horas ofrecidas (mínimo ${minHours} para ${trlLimits.description}).`);
        }
        if (Number(form.horas) > maxHours) {
          errors.push(`Las horas ofrecidas no pueden exceder ${maxHours} para ${trlLimits.description}.`);
        }
        break;
        
      case 2: // General
        if (!form.modalidad) {
          errors.push('Debes seleccionar una modalidad.');
        }
        if (!form.encargado || form.encargado.trim().length === 0) {
          errors.push('El responsable del proyecto es obligatorio.');
        }
        if (!form.contacto || form.contacto.trim().length === 0) {
          errors.push('El contacto de la empresa es obligatorio.');
        }
        if (!form.fechaInicio) {
          errors.push('La fecha de inicio es obligatoria.');
        }
        if (!form.horasPorSemana || Number(form.horasPorSemana) < 5) {
          errors.push('Las horas por semana deben ser al menos 5.');
        }
        if (Number(form.horasPorSemana) > 35) {
          errors.push('Las horas por semana no pueden exceder 35.');
        }
        if (!form.fechaFin) {
          errors.push('La fecha de finalización es obligatoria.');
        }
        if (form.fechaInicio && form.fechaFin && new Date(form.fechaInicio) >= new Date(form.fechaFin)) {
          errors.push('La fecha de finalización debe ser posterior a la fecha de inicio.');
        }
        break;
    }
    
    return errors;
  };

  const validateForm = () => {
    const errors: string[] = [];
    if (!form.title || form.title.trim().length < 5) {
      errors.push('El título es obligatorio y debe tener al menos 5 caracteres.');
    }
         if (!form.description || form.description.trim().length < 5) {
       errors.push('La descripción es obligatoria y debe tener al menos 5 caracteres.');
     }
    // Los requisitos son opcionales, pero si se proporcionan deben tener al menos 10 caracteres
    if (form.requirements && form.requirements.trim().length > 0 && form.requirements.trim().length < 10) {
      errors.push('Si proporcionas requisitos, deben tener al menos 10 caracteres.');
    }
    if (!form.area) {
      errors.push('Debes seleccionar un área.');
    }
         if (!trlSelected) {
       errors.push('Debes seleccionar una etapa de desarrollo.');
     }
         if (!form.horas || Number(form.horas) < minHours) {
       errors.push(`Debes ingresar las horas ofrecidas (mínimo ${minHours} para ${trlLimits.description}).`);
     }
    if (Number(form.horas) > maxHours) {
      errors.push(`Las horas ofrecidas no pueden exceder ${maxHours} para ${trlLimits.description}.`);
    }
    
    // Validar coherencia entre horas totales y duración (solo si hay datos válidos)
    const horasTotales = Number(form.horas) || 0;
    const duracionMeses = Number(form.meses) || 1;
    
    if (horasTotales > 0 && duracionMeses > 0) {
      const horasPorSemana = calcularHorasPorSemana(horasTotales, duracionMeses);
      const warning = getHorasPorSemanaWarning(horasPorSemana);
      if (warning) {
        errors.push(warning);
      }
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
        status_id: 1, // ID del estado "published" (publicado)
        max_students: Number(form.studentsNeeded) || 1,
        duration_weeks: Number(form.meses) || 1,
        // Usar las horas por semana definidas por el usuario
        hours_per_week: Number(form.horasPorSemana) || 10,
        modality: (form.modalidad || '').toLowerCase() === 'remoto' ? 'remote' : (form.modalidad || '').toLowerCase() === 'presencial' ? 'onsite' : (form.modalidad || '').toLowerCase() === 'híbrido' || (form.modalidad || '').toLowerCase() === 'hibrido' ? 'hybrid' : 'remote',

      };
      console.log('Datos enviados al backend:', datosAEnviar);
      const response = await projectService.createProject(datosAEnviar);
      // El servicio ya maneja la respuesta y devuelve directamente los datos
      const projectId = response?.id || response?.data?.id;
      if (projectId) {
        setSuccess('Proyecto creado exitosamente.');
        
        // Scroll hacia arriba para mostrar el mensaje de éxito
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        setTimeout(() => {
          setSuccess(null);
          navigate('/dashboard/company/projects', { state: { initialTab: 0 } });
        }, 1500);
        setForm({ title: '', description: '', area: '', tipo: '', objetivo: '', modalidad: '', encargado: '', contacto: '', fechaInicio: '', fechaFin: '', requirements: '', duration: '', studentsNeeded: 1, meses: '', trl: 1, horas: '', horasPorSemana: 10 });
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
                                                                                               <TextField 
                label="Nombre del Proyecto" 
                name="title" 
                value={form.title} 
                onChange={handleChange} 
                fullWidth 
                required 
                placeholder="Ejemplo: App móvil para gestión de inventarios"
                helperText="Mínimo 5 caracteres"
                InputLabelProps={{ required: false }}
              />
              <TextField 
                label="Descripción del Proyecto" 
                name="description" 
                value={form.description} 
                onChange={handleChange} 
                fullWidth 
                required 
                multiline 
                minRows={2} 
                placeholder="Ejemplo: Desarrollar una aplicación móvil para gestionar inventarios en tiempo real, con escaneo de códigos de barras y reportes básicos."
                helperText="Mínimo 5 caracteres"
                InputLabelProps={{ required: false }}
              />
            <TextField 
              label="Tipo de Actividad" 
              name="tipo" 
              value={form.tipo} 
              onChange={handleChange} 
              fullWidth 
              required 
              placeholder="FINANCIERO, ADMINISTRATIVO, SOPORTE, etc."
              InputLabelProps={{ required: false }}
            />
          <FormControl fullWidth required disabled={loadingAreas}>
            <InputLabel id="area-label" shrink required={false}>Área del Proyecto</InputLabel>
            <Select
              labelId="area-label"
              name="area"
              value={form.area}
              onChange={e => {
                setForm({ ...form, area: e.target.value });
                setModifiedSteps(prev => new Set([...prev, activeStep]));
              }}
              displayEmpty
              label="Área del Proyecto"
            >
              <MenuItem value=""><em>Selecciona un área</em></MenuItem>
              {areas.map(area => (
                <MenuItem key={area.id} value={area.id}>{area.name}</MenuItem>
              ))}
            </Select>
            <FormHelperText>Selecciona el área que mejor describe tu proyecto</FormHelperText>
          </FormControl>
                     <TextField 
             label="Objetivo del Proyecto" 
             name="objetivo" 
             value={form.objetivo} 
             onChange={handleChange} 
             fullWidth 
             required 
             multiline 
             minRows={2}
             placeholder="¿Cuál es el resultado que esperas del proyecto?"
                            helperText="Mínimo 5 caracteres"
             InputLabelProps={{ required: false }}
           />
           
                                               <TextField 
               label="Requisitos del Proyecto" 
               name="requirements" 
               value={form.requirements} 
               onChange={handleChange} 
               fullWidth 
               multiline 
               minRows={2}
               placeholder="Este campo es OPCIONAL. Describe los conocimientos previos, habilidades técnicas y competencias que debe tener el estudiante para participar exitosamente en este proyecto. Ejemplos: conocimientos básicos en administración, experiencia en trabajo en equipo, disponibilidad de 20 horas semanales, responsabilidad, compromiso, habilidades de comunicación, capacidad de análisis, etc."
               InputLabelProps={{ required: false }}
             />
        </Box>
      )}
             {activeStep === 1 && (
         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
           <Typography variant="subtitle1" sx={{ mb: 1 }}>¿En qué etapa de desarrollo se encuentra tu proyecto?</Typography>
                       <RadioGroup value={trlSelected} onChange={handleTrlChange}>
              {TRL_QUESTIONS.map((q, idx) => {
                return (
                  <Box
                    key={idx + 1}
                    sx={{
                      borderRadius: 2,
                      transition: 'background 0.2s',
                      '&:hover': {
                        background: '#757575',
                        color: '#fff',
                      },
                      mb: 1,
                    }}
                  >
                   <FormControlLabel
                     value={idx + 1}
                     control={<Radio />}
                     label={<span><b>Opción {idx + 1}:</b> {q}</span>}
                   />
                 </Box>
               );
             })}
           </RadioGroup>
           
           <TextField
             label="Horas ofrecidas"
             name="horas"
             type="number"
             value={form.horas}
             onChange={handleChange}
             fullWidth
             required
             error={!!hoursError}
             helperText={hoursError || `${trlLimits.description}: ${minHours}-${maxHours} horas`}
             inputProps={{ min: minHours, max: maxHours }}
             InputLabelProps={{ required: false }}
           />
           
           
           
           
         </Box>
       )}
             {activeStep === 2 && (
         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
           <FormControl fullWidth required>
             <InputLabel id="modalidad-label" shrink required={false}>Modalidad</InputLabel>
             <Select
               labelId="modalidad-label"
               name="modalidad"
               value={form.modalidad}
               label="Modalidad"
               onChange={e => {
                 setForm({ ...form, modalidad: e.target.value });
                 setModifiedSteps(prev => new Set([...prev, activeStep]));
               }}
               displayEmpty
             >
               <MenuItem value=""><em>Selecciona la modalidad</em></MenuItem>
               <MenuItem value="Remoto">
                 <Box>
                   <Typography variant="body1">Remoto</Typography>
                   <Typography variant="caption" color="text.secondary">
                     Comunicación solo a través de correos
                   </Typography>
                 </Box>
               </MenuItem>
               <MenuItem value="Presencial">
                 <Box>
                   <Typography variant="body1">Presencial</Typography>
                   <Typography variant="caption" color="text.secondary">
                     En sede, seleccionarás el fablab y cowork. Te reunirás con el estudiante en sede para entrevistas o presentaciones de avance
                   </Typography>
                 </Box>
               </MenuItem>
               <MenuItem value="Híbrido">
                 <Box>
                   <Typography variant="body1">Híbrido</Typography>
                   <Typography variant="caption" color="text.secondary">
                     Se puede hacer todo por correo, pero algunas veces se juntarán en la sede
                   </Typography>
                 </Box>
               </MenuItem>
             </Select>
           </FormControl>
           <TextField 
             label="Responsable del proyecto de la empresa" 
             name="encargado" 
             value={form.encargado} 
             onChange={handleChange} 
             fullWidth 
             required 
             placeholder="Ejemplo: Juan Pérez - Gerente de Desarrollo"
             helperText="Nombre y cargo de la persona responsable del proyecto"
             InputLabelProps={{ required: false }} 
           />
           <TextField 
             label="Contacto de la Empresa" 
             name="contacto" 
             value={form.contacto} 
             onChange={handleChange} 
             fullWidth 
             required 
             placeholder="Ejemplo: +56912345678 o contacto@empresa.cl"
             helperText="Teléfono o correo electrónico para contacto directo"
             InputLabelProps={{ required: false }} 
           />
                                <TextField 
             label="¿Cuándo te gustaría comenzar el proyecto?" 
             name="fechaInicio" 
             type="date" 
             value={form.fechaInicio} 
             onChange={handleChange} 
             fullWidth 
             required 
             InputLabelProps={{ shrink: true, required: false }}
           />
           
           <TextField 
             label="Horas por semana que se dedicarán al proyecto" 
             name="horasPorSemana" 
             type="number" 
             value={form.horasPorSemana || ''} 
             onChange={handleChange}
             fullWidth 
             required 
             inputProps={{ min: 5, max: 35 }}
             helperText="Define cuántas horas por semana se dedicarán al proyecto. Mínimo 5, máximo 35 horas/semana."
             InputLabelProps={{ required: false }} 
           />
           
           <TextField 
             label="Fecha estimada de finalización" 
             name="fechaFin" 
             type="date" 
             value={form.fechaFin} 
             fullWidth 
             disabled
             helperText="Se calcula automáticamente basado en las horas totales y semanales"
             InputLabelProps={{ shrink: true, required: false }} 
           />
           
           <TextField 
             label="Duración calculada (meses)" 
             name="meses" 
             value={form.meses} 
             fullWidth 
             disabled
             helperText="Duración calculada automáticamente"
             InputLabelProps={{ required: false }} 
           />
                     <Box sx={{ 
                       p: 2, 
                       bgcolor: 'background.paper', 
                       borderRadius: 1, 
                       border: '1px solid',
                       borderColor: 'divider',
                       boxShadow: 1
                     }}>
             <Typography variant="body2" color="text.primary">
               <strong>💡 Importante:</strong> Por proyecto solo puedes aceptar a un estudiante
             </Typography>
           </Box>
           
           {/* Advertencias al final de la etapa 3 */}
           <Alert severity="info" sx={{ mt: 1, mb: 1 }}>
             <Typography variant="body2">
               <strong>💡 Importante:</strong> Las horas por semana se pueden ajustar durante la entrevista con el estudiante según su disponibilidad real.
             </Typography>
           </Alert>
           
           <Alert severity="info" sx={{ mt: 1, mb: 1 }}>
             <Typography variant="body2">
               <strong>Importante:</strong> Tendrás 10 días desde la publicación para que se asigne un estudiante al proyecto. Las entrevistas se realizarán en sede o online.
             </Typography>
           </Alert>
           
           <Alert severity="warning" sx={{ mt: 1, mb: 1 }}>
             <Typography variant="body2">
               <strong>⚠️ Advertencia:</strong> Al momento de acordar las horas con el estudiante, podrás editar la publicación en el futuro. Recuerda que tendrás 10 días desde la publicación para hacer una entrevista y asignar a un estudiante. También podrás hacer más cambios al proyecto antes de publicarlo. Ten en cuenta que los estudiantes tendrán diferentes tiempos dependiendo de cada uno.
             </Typography>
           </Alert>
        </Box>
      )}
             {activeStep === 3 && (
         <Box sx={{ maxWidth: '100%', mx: 'auto' }}>
           {/* Título Simple */}
           <Typography variant="h5" sx={{ textAlign: 'center', mb: 4, color: 'text.primary', fontWeight: 500 }}>
             Resumen del Proyecto
           </Typography>
           
           {/* Grid Principal - 3 Columnas */}
           <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3 }}>
             
             {/* Columna 1: Información Básica */}
             <Box sx={{ 
               bgcolor: 'background.paper', 
               p: 2.5, 
               borderRadius: 1.5, 
               boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
               border: '1px solid',
               borderColor: 'divider'
             }}>
               <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                 Información Básica
               </Typography>
               <Box sx={{ display: 'grid', gap: 1.5 }}>
                 <Box>
                   <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>Nombre</Typography>
                   <Typography variant="body2" sx={{ fontWeight: 500 }}>{form.title}</Typography>
                 </Box>
                 <Box>
                   <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>Tipo</Typography>
                   <Typography variant="body2">{form.tipo}</Typography>
                 </Box>
                 <Box>
                   <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>Área</Typography>
                   <Typography variant="body2">{areas.find(a => a.id === Number(form.area))?.name || 'No seleccionada'}</Typography>
                 </Box>
                 <Box>
                   <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>Objetivo</Typography>
                   <Typography variant="body2" sx={{ lineHeight: 1.4 }}>{form.objetivo}</Typography>
                 </Box>
               </Box>
             </Box>
             
             {/* Columna 2: Detalles Técnicos */}
             <Box sx={{ 
               bgcolor: 'background.paper', 
               p: 2.5, 
               borderRadius: 1.5, 
               boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
               border: '1px solid',
               borderColor: 'divider'
             }}>
               <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                 Detalles Técnicos
               </Typography>
               <Box sx={{ display: 'grid', gap: 1.5 }}>
                 <Box>
                   <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>Nivel de Madurez</Typography>
                   <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.4 }}>
                     {TRL_QUESTIONS[trlSelected - 1]}
                   </Typography>
                 </Box>
                 <Box>
                   <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>Horas Totales</Typography>
                   <Typography variant="body2" sx={{ fontWeight: 500 }}>{form.horas} horas</Typography>
                 </Box>
                 <Box>
                   <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>Horas por Semana</Typography>
                   <Typography variant="body2" sx={{ fontWeight: 500 }}>{form.horasPorSemana || 10} h/sem</Typography>
                 </Box>
                 <Box>
                   <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>Duración</Typography>
                   <Typography variant="body2" sx={{ fontWeight: 500 }}>{form.meses} mes(es)</Typography>
                 </Box>
               </Box>
             </Box>
             
             {/* Columna 3: Calendario y Contacto */}
             <Box sx={{ 
               bgcolor: 'background.paper', 
               p: 2.5, 
               borderRadius: 1.5, 
               boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
               border: '1px solid',
               borderColor: 'divider'
             }}>
               <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                 Calendario y Contacto
               </Typography>
               <Box sx={{ display: 'grid', gap: 1.5 }}>
                 <Box>
                   <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>Fecha de Inicio</Typography>
                   <Typography variant="body2" sx={{ fontWeight: 500 }}>{form.fechaInicio}</Typography>
                 </Box>
                 <Box>
                   <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>Fecha de Fin</Typography>
                   <Typography variant="body2" sx={{ fontWeight: 500 }}>{form.fechaFin}</Typography>
                 </Box>
                 <Box>
                   <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>Modalidad</Typography>
                   <Typography variant="body2">{form.modalidad}</Typography>
                 </Box>
                 <Box>
                   <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>Responsable</Typography>
                   <Typography variant="body2">{form.encargado}</Typography>
                 </Box>
               </Box>
             </Box>
           </Box>
           
           {/* Fila Inferior - Descripción y Requisitos */}
           {(form.description || form.requirements) && (
             <Box sx={{ mt: 3, display: 'grid', gridTemplateColumns: form.description && form.requirements ? '1fr 1fr' : '1fr', gap: 3 }}>
               {form.description && (
                 <Box sx={{ 
                   bgcolor: 'background.paper', 
                   p: 2.5, 
                   borderRadius: 1.5, 
                   boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                   border: '1px solid',
                   borderColor: 'divider'
                 }}>
                   <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                     Descripción del Proyecto
                   </Typography>
                   <Typography variant="body2" sx={{ lineHeight: 1.5, color: 'text.secondary' }}>
                     {form.description}
                   </Typography>
                 </Box>
               )}
               
               {form.requirements && (
                 <Box sx={{ 
                   bgcolor: 'background.paper', 
                   p: 2.5, 
                   borderRadius: 1.5, 
                   boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                   border: '1px solid',
                   borderColor: 'divider'
                 }}>
                   <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                     Requisitos del Estudiante
                   </Typography>
                   <Typography variant="body2" sx={{ lineHeight: 1.5, color: 'text.secondary' }}>
                     {form.requirements}
                   </Typography>
                 </Box>
               )}
             </Box>
           )}
         </Box>
       )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button disabled={activeStep === 0} onClick={prevStep} variant="outlined">Anterior</Button>
        {activeStep < steps.length - 1 ? (
          <Button 
            variant="contained" 
            color="primary" 
            onClick={nextStep} 
            disabled={activeStep === 2 && !!hoursError}
          >
            Siguiente
          </Button>
        ) : (
          <Button variant="contained" color="success" onClick={handleSubmit} disabled={!!hoursError}>Publicar Proyecto</Button>
        )}
      </Box>
    </Box>
  );
};

export default PublishProjects;