import React, { useState, useEffect } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  Autocomplete,
  Alert,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { challengeService } from '../../../../services/challenge.service';
import { ChallengeFormData, CollectiveChallenge } from '../../../../types';
import { useNavigate } from 'react-router-dom';

const steps = [
  'Problema Empresarial',
  'Contexto del Desafío', 
  'Requisitos y Beneficios',
  'Resumen Final'
];

interface ChallengeCreateFormProps {
  onSuccess?: (challengeId: string) => void;
  onCancel?: () => void;
}

export const ChallengeCreateForm: React.FC<ChallengeCreateFormProps> = ({
  onSuccess,
  onCancel
}) => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [areas, setAreas] = useState<any[]>([]);

  const [formData, setFormData] = useState<ChallengeFormData>({
    // Información Básica
    title: '',
    description: '',
    requirements: '',
    academic_year: '',
    period_type: 'trimestral',
    
    // Información Detallada
    objetivo: '',
    tipo: '',
    encargado: '',
    contacto: '',
    
    // Requisitos y Beneficios
    area_id: null,
    required_skills: [],
    technologies: [],
    benefits: [],
    
    // Estado
    status: 'draft'
  });

  // Cargar áreas disponibles
  useEffect(() => {
    const loadAreas = async () => {
      try {
        // Aquí deberías cargar las áreas desde tu API
        // Por ahora usamos datos de ejemplo
        setAreas([
          { id: 1, name: 'Tecnología' },
          { id: 2, name: 'Negocios' },
          { id: 3, name: 'Diseño' },
          { id: 4, name: 'Marketing' },
        ]);
      } catch (err) {
        console.error('Error cargando áreas:', err);
      }
    };
    loadAreas();
  }, []);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleInputChange = (field: keyof ChallengeFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validar campos obligatorios (sin fechas)
      if (!formData.title || !formData.description || !formData.requirements || !formData.academic_year) {
        throw new Error('Los campos título, descripción, contexto del problema y año académico son obligatorios');
      }

      // Crear desafío
      const response = await challengeService.createChallenge(formData);
      
      if (onSuccess) {
        onSuccess(response.challenge_id);
      } else {
        navigate(`/dashboard/company/challenges/${response.challenge_id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Error al crear el desafío');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
                🎯 Define el Problema que Quieres Resolver
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Describe el desafío específico que enfrenta tu empresa y que quieres que los estudiantes resuelvan.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Título del Desafío"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
                placeholder="Ej: Optimización del Sistema de Inventario con IA"
                helperText="Un título claro que describa el problema a resolver"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Descripción del Problema Empresarial"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
                placeholder="Describe detalladamente el problema que enfrenta tu empresa. ¿Qué necesitas resolver? ¿Cuáles son los desafíos actuales? ¿Qué impacto tiene este problema en tu negocio?"
                helperText="Sé específico sobre el problema que quieres que los estudiantes resuelvan"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Desafío</InputLabel>
                <Select
                  value={formData.period_type}
                  onChange={(e) => handleInputChange('period_type', e.target.value)}
                  label="Tipo de Desafío"
                >
                  <MenuItem value="trimestral">Trimestral (3 meses)</MenuItem>
                  <MenuItem value="semestral">Semestral (6 meses)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Año Académico"
                value={formData.academic_year}
                onChange={(e) => handleInputChange('academic_year', e.target.value)}
                placeholder="Ej: 2024"
                helperText="Año en que se realizará el desafío"
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
                📋 Contexto del Desafío
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Proporciona información adicional que ayudará a los estudiantes a entender mejor tu desafío y cómo abordarlo.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={5}
                label="Contexto Completo del Problema"
                value={formData.requirements}
                onChange={(e) => handleInputChange('requirements', e.target.value)}
                placeholder="Describe el contexto completo del problema: ¿Por qué existe este problema? ¿Qué lo ha causado? ¿Cuál es la situación actual? ¿Qué datos o información relevante tienen los estudiantes? ¿Qué recursos pueden usar?"
                helperText="Proporciona todo el contexto necesario para que los estudiantes entiendan completamente el problema y puedan resolverlo"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Criterios de Evaluación"
                value={formData.objetivo}
                onChange={(e) => handleInputChange('objetivo', e.target.value)}
                placeholder="¿Cómo evaluarás las soluciones? ¿Qué criterios usarás? ¿Qué aspectos son más importantes? ¿Qué resultados esperas ver?"
                helperText="Define claramente cómo evaluarás y seleccionarás las mejores soluciones"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Recursos Disponibles"
                value={formData.tipo}
                onChange={(e) => handleInputChange('tipo', e.target.value)}
                placeholder="Ej: Acceso a datos, APIs, herramientas, presupuesto, mentoría"
                helperText="¿Qué recursos puedes proporcionar a los estudiantes para resolver el problema?"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Información de Contacto"
                value={formData.contacto}
                onChange={(e) => handleInputChange('contacto', e.target.value)}
                placeholder="Email, teléfono o plataforma donde los estudiantes pueden contactarte"
                helperText="¿Cómo pueden los estudiantes comunicarse contigo durante el desafío?"
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
                🎯 Requisitos y Beneficios del Desafío
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Define qué necesitas de los estudiantes y qué beneficios obtendrán al participar en tu desafío.
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Área del Problema</InputLabel>
                <Select
                  value={formData.area_id || ''}
                  onChange={(e) => handleInputChange('area_id', e.target.value)}
                  label="Área del Problema"
                >
                  <MenuItem value="">Seleccionar área</MenuItem>
                  {areas.map((area) => (
                    <MenuItem key={area.id} value={area.id}>
                      {area.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Responsable del Desafío en tu Empresa"
                value={formData.encargado}
                onChange={(e) => handleInputChange('encargado', e.target.value)}
                placeholder="Nombre del responsable que supervisará el desafío"
                helperText="Persona que estará disponible para guiar a los estudiantes"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contacto para Estudiantes"
                value={formData.contacto}
                onChange={(e) => handleInputChange('contacto', e.target.value)}
                placeholder="Email o teléfono de contacto"
                helperText="Información de contacto para que los estudiantes puedan comunicarse"
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                freeSolo
                options={[]}
                value={formData.required_skills}
                onChange={(_, newValue) => handleInputChange('required_skills', newValue)}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Habilidades que Necesitas de los Estudiantes"
                    placeholder="Agregar habilidad..."
                    helperText="¿Qué habilidades específicas necesitas que tengan los estudiantes? (Ej: Programación Python, Diseño UX, Análisis de datos)"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                freeSolo
                options={[]}
                value={formData.technologies}
                onChange={(_, newValue) => handleInputChange('technologies', newValue)}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tecnologías que Quieres que Usen"
                    placeholder="Agregar tecnología..."
                    helperText="¿Qué tecnologías específicas quieres que los estudiantes utilicen? (Ej: React, Python, AWS, Figma)"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                freeSolo
                options={[]}
                value={formData.benefits}
                onChange={(_, newValue) => handleInputChange('benefits', newValue)}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Beneficios para los Estudiantes"
                    placeholder="Agregar beneficio..."
                    helperText="¿Qué beneficios ofreces a los estudiantes? (Ej: Certificado, Oportunidad de empleo, Mentoría, Premio económico)"
                  />
                )}
              />
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
              📋 Resumen del Desafío Colectivo
            </Typography>
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                  {formData.title || 'Sin título'}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {formData.description || 'Sin descripción'}
                </Typography>
                
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Tipo de Desafío:</Typography>
                    <Typography variant="body2">{formData.period_type === 'trimestral' ? 'Trimestral (3 meses)' : 'Semestral (6 meses)'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Año Académico:</Typography>
                    <Typography variant="body2">{formData.academic_year || 'No especificado'}</Typography>
                  </Grid>
                </Grid>

                {/* Mostrar siempre el contexto del problema */}
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main' }}>📋 Contexto del Problema:</Typography>
                  <Typography variant="body2" sx={{ mt: 1, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                    {formData.requirements || 'No se ha proporcionado contexto del problema'}
                  </Typography>
                </Box>

                {/* Mostrar siempre los criterios de evaluación */}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main' }}>🎯 Criterios de Evaluación:</Typography>
                  <Typography variant="body2" sx={{ mt: 1, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                    {formData.objetivo || 'No se han definido criterios de evaluación'}
                  </Typography>
                </Box>

                {/* Mostrar siempre los recursos disponibles */}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main' }}>🛠️ Recursos Disponibles:</Typography>
                  <Typography variant="body2" sx={{ mt: 1, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                    {formData.tipo || 'No se han especificado recursos disponibles'}
                  </Typography>
                </Box>

                {/* Mostrar siempre la información de contacto */}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main' }}>📞 Información de Contacto:</Typography>
                  <Typography variant="body2" sx={{ mt: 1, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                    {formData.contacto || 'No se ha proporcionado información de contacto'}
                  </Typography>
                </Box>

                {/* Mostrar habilidades requeridas */}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main' }}>💼 Habilidades Requeridas:</Typography>
                  <Box sx={{ mt: 1, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                    {formData.required_skills.length > 0 ? (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {formData.required_skills.map((skill, index) => (
                          <Chip key={index} label={skill} size="small" />
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">No se han especificado habilidades requeridas</Typography>
                    )}
                  </Box>
                </Box>

                {/* Mostrar tecnologías */}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main' }}>⚙️ Tecnologías:</Typography>
                  <Box sx={{ mt: 1, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                    {formData.technologies.length > 0 ? (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {formData.technologies.map((tech, index) => (
                          <Chip key={index} label={tech} size="small" color="primary" />
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">No se han especificado tecnologías</Typography>
                    )}
                  </Box>
                </Box>

                {/* Mostrar beneficios */}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main' }}>🎁 Beneficios para Estudiantes:</Typography>
                  <Box sx={{ mt: 1, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                    {formData.benefits.length > 0 ? (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {formData.benefits.map((benefit, index) => (
                          <Chip key={index} label={benefit} size="small" color="success" />
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">No se han especificado beneficios para los estudiantes</Typography>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        );

      default:
        return 'Paso desconocido';
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Crear Desafío Colectivo
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mb: 4 }}>
          {renderStepContent(activeStep)}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            Anterior
          </Button>
          
          <Box>
            {onCancel && (
              <Button
                onClick={onCancel}
                sx={{ mr: 1 }}
              >
                Cancelar
              </Button>
            )}
            
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? 'Creando...' : 'Crear Desafío'}
              </Button>
            ) : (
              <Button variant="contained" onClick={handleNext}>
                Siguiente
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};
