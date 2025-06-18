import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  ListItemText,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
  PauseCircle as PauseCircleIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  Star as StarIcon,
  Visibility as VisibilityIcon,
  RateReview as RateReviewIcon,
} from '@mui/icons-material';

// Mock de proyectos y estudiantes
const mockProjects = [
  {
    id: 'p1',
    title: 'Sistema de Gestión de Inventarios',
    company: 'TechCorp Solutions',
    description: 'Desarrollo de un sistema web para gestión de inventarios con base de datos MySQL y frontend en React...',
    status: 'active',
    progress: 65,
    tech: ['React', 'Node.js', 'MySQL'],
    hours: 52,
    totalHours: 80,
    location: 'Remoto',
    students: [
      { id: 's1', name: 'Juan Pérez', evaluated: false },
      { id: 's2', name: 'María González', evaluated: true },
    ],
  },
  {
    id: 'p2',
    title: 'Sistema de Gestión de Clientes',
    company: 'Business Solutions',
    description: 'Sistema CRM para gestión de clientes y ventas con reportes avanzados....',
    status: 'active',
    progress: 40,
    tech: ['Angular', 'Spring Boot', 'MySQL'],
    hours: 32,
    totalHours: 80,
    location: 'Medellín',
    students: [
      { id: 's3', name: 'Carlos Rodríguez', evaluated: false },
    ],
  },
  {
    id: 'p3',
    title: 'Dashboard de Analytics',
    company: 'DataCorp',
    description: 'Desarrollo de dashboard de analytics para visualización de datos empresariales....',
    status: 'completed',
    progress: 100,
    tech: ['Python', 'Pandas', 'Power BI'],
    hours: 60,
    totalHours: 60,
    location: 'Remoto',
    students: [
      { id: 's4', name: 'Ana Torres', evaluated: true },
    ],
  },
  {
    id: 'p4',
    title: 'Plataforma de E-learning',
    company: 'EduTech Solutions',
    description: 'Desarrollo de plataforma web para cursos online con sistema de videoconferencias....',
    status: 'completed',
    progress: 100,
    tech: ['Vue.js', 'Laravel', 'PostgreSQL'],
    hours: 120,
    totalHours: 120,
    location: 'Remoto',
    students: [
      { id: 's5', name: 'Luis Fernández', evaluated: false },
      { id: 's6', name: 'Sofía Ramírez', evaluated: true },
    ],
  },
  {
    id: 'p5',
    title: 'App de Gestión de Tareas',
    company: 'Productivity Inc',
    description: 'Aplicación móvil para gestión de tareas y proyectos con colaboración en tiempo real....',
    status: 'completed',
    progress: 100,
    tech: ['Flutter', 'Firebase', 'Dart'],
    hours: 100,
    totalHours: 100,
    location: 'Remoto',
    students: [
      { id: 's7', name: 'Pedro López', evaluated: false },
    ],
  },
  {
    id: 'p6',
    title: 'Sistema de Reservas',
    company: 'BookingPro',
    description: 'Sistema de reservas para hoteles y restaurantes...',
    status: 'paused',
    progress: 30,
    tech: ['Java', 'Spring', 'Oracle'],
    hours: 20,
    totalHours: 80,
    location: 'Remoto',
    students: [
      { id: 's8', name: 'Marta Ruiz', evaluated: false },
    ],
  },
];

// Mock de evaluaciones recibidas por la empresa
const mockEvaluacionesRecibidas = [
  {
    id: 'e1',
    project: 'Sistema de Gestión de Inventarios',
    student: 'Juan Pérez',
    date: '2024-06-10',
    gpa: 4.7,
    code: 5,
    deadlines: 5,
    teamwork: 4,
    communication: 5,
    documentation: 4,
    innovation: 5,
    comment: 'Excelente ambiente de trabajo y apoyo del equipo de la empresa.',
    fortalezas: ['Comunicación clara', 'Soporte técnico'],
    mejoras: ['Más feedback en las reuniones'],
  },
  {
    id: 'e2',
    project: 'Dashboard de Analytics',
    student: 'Ana Torres',
    date: '2024-05-20',
    gpa: 4.5,
    code: 4,
    deadlines: 5,
    teamwork: 5,
    communication: 4,
    documentation: 4,
    innovation: 5,
    comment: 'Me sentí muy apoyada por la empresa y aprendí mucho.',
    fortalezas: ['Mentoría', 'Recursos disponibles'],
    mejoras: ['Mejorar onboarding inicial'],
  },
  // ...más mock data...
];

// Opciones para fortalezas y áreas de mejora
const fortalezasOpciones = [
  'Buen manejo de Git y control de versiones',
  'Documentación clara y concisa',
  'Implementación eficiente de funcionalidades',
  'Excelente resolución de problemas',
  'Código limpio y bien estructurado',
];
const mejorasOpciones = [
  'Participación más activa en las reuniones',
  'Mejorar la cobertura de pruebas unitarias',
  'Optimizar consultas a la base de datos',
  'Comunicación en equipo',
  'Gestión del tiempo',
];

// Agrega la card de estudiantes a evaluar
const totalEstudiantesAEvaluar = mockProjects
  .filter(p => p.status === 'completed')
  .reduce((acc, p) => acc + p.students.filter(stu => !stu.evaluated).length, 0);
const resumen = [
  { label: 'Proyectos Activos', value: mockProjects.filter(p => p.status === 'active').length, icon: <CheckCircleIcon />, color: '#66BB6A' },
  { label: 'Proyectos Completados', value: mockProjects.filter(p => p.status === 'completed').length, icon: <AssessmentIcon />, color: '#42A5F5' },
  { label: 'Proyectos Pausados', value: mockProjects.filter(p => p.status === 'paused').length, icon: <PauseCircleIcon />, color: '#FFA726' },
  { label: 'Estudiantes a Evaluar', value: totalEstudiantesAEvaluar, icon: <PersonIcon />, color: '#AB47BC' },
];

const cantidadOpciones = [5, 10, 20, 'todas'];

// Define un tipo para el estado de evaluación
interface EvaluationFormState {
  code: number;
  deadlines: number;
  teamwork: number;
  communication: number;
  documentation: number;
  innovation: number;
  comment: string;
  fortalezas: string[];
  fortalezasExtra: string;
  mejoras: string[];
  mejorasExtra: string;
  tecnologias: string;
  entregables: string;
}

export const CompanyEvaluations: React.FC = () => {
  // Filtros de cantidad para cada sección
  const [cantidadActivos, setCantidadActivos] = useState<string | number>(5);
  const [cantidadCompletados, setCantidadCompletados] = useState<string | number>(5);

  // Proyectos filtrados
  const activos = mockProjects.filter(p => p.status === 'active');
  const completados = mockProjects.filter(p => p.status === 'completed');

  const activosFiltrados = cantidadActivos === 'todas' ? activos : activos.slice(0, Number(cantidadActivos));
  const completadosFiltrados = cantidadCompletados === 'todas' ? completados : completados.slice(0, Number(cantidadCompletados));

  // Estado para modal de evaluación y detalle
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDetalleOpen, setModalDetalleOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [evaluacion, setEvaluacion] = useState<EvaluationFormState>({
    code: 0,
    deadlines: 0,
    teamwork: 0,
    communication: 0,
    documentation: 0,
    innovation: 0,
    comment: '',
    fortalezas: [],
    fortalezasExtra: '',
    mejoras: [],
    mejorasExtra: '',
    tecnologias: '',
    entregables: '',
  });
  const [evaluacionesGuardadas, setEvaluacionesGuardadas] = useState<any[]>([]);

  // Estado para filtro y modal de evaluaciones recibidas
  const [cantidadRecibidas, setCantidadRecibidas] = useState<string | number>(5);
  const [modalRecibidaOpen, setModalRecibidaOpen] = useState(false);
  const [selectedRecibida, setSelectedRecibida] = useState<any>(null);

  // Handlers para abrir/cerrar modales y guardar evaluación
  const handleOpenEvaluar = (student: any, project: any) => {
    setSelectedStudent(student);
    setSelectedProject(project);
    setModalOpen(true);
  };
  const handleOpenDetalle = (student: any, project: any) => {
    setSelectedStudent(student);
    setSelectedProject(project);
    setModalDetalleOpen(true);
  };
  const handleCloseModal = () => {
    setModalOpen(false);
    setEvaluacion({
      code: 0, deadlines: 0, teamwork: 0, communication: 0, documentation: 0, innovation: 0,
      comment: '', fortalezas: [], fortalezasExtra: '', mejoras: [], mejorasExtra: '', tecnologias: '', entregables: ''
    });
  };
  const handleCloseDetalle = () => setModalDetalleOpen(false);

  const handleSaveEvaluacion = () => {
    setEvaluacionesGuardadas(prev => [
      ...prev,
      {
        studentId: selectedStudent.id,
        projectId: selectedProject.id,
        ...evaluacion,
        gpa: (
          (evaluacion.code + evaluacion.deadlines + evaluacion.teamwork + evaluacion.communication + evaluacion.documentation + evaluacion.innovation) / 6
        ).toFixed(1),
      }
    ]);
    selectedProject.students.find((stu: any) => stu.id === selectedStudent.id).evaluated = true;
    setModalOpen(false);
    setEvaluacion({
      code: 0, deadlines: 0, teamwork: 0, communication: 0, documentation: 0, innovation: 0,
      comment: '', fortalezas: [], fortalezasExtra: '', mejoras: [], mejorasExtra: '', tecnologias: '', entregables: ''
    });
  };

  const getEvaluacionGuardada = (studentId: string, projectId: string) =>
    evaluacionesGuardadas.find((ev: any) => ev.studentId === studentId && ev.projectId === projectId);

  const recibidasFiltradas = cantidadRecibidas === 'todas' ? mockEvaluacionesRecibidas : mockEvaluacionesRecibidas.slice(0, Number(cantidadRecibidas));

  const handleOpenRecibida = (ev: any) => {
    setSelectedRecibida(ev);
    setModalRecibidaOpen(true);
  };
  const handleCloseRecibida = () => setModalRecibidaOpen(false);

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          Evaluaciones
        </Typography>
      {/* Resumen superior: 4 cards en una sola fila */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        {resumen.map((item, idx) => (
          <Box key={idx} sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(25% - 12px)' } }}>
            <Card sx={{ bgcolor: item.color, color: '#fff', borderRadius: 3, boxShadow: 1, minHeight: 100 }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>{item.value}</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>{item.label}</Typography>
                <Box>{item.icon}</Box>
            </CardContent>
          </Card>
        </Box>
        ))}
      </Box>

      {/* Proyectos Activos */}
      <Card sx={{ mb: 4 }}>
            <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
              <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} /> Proyectos Activos ({activos.length})
            </Typography>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Mostrar</InputLabel>
              <Select
                value={cantidadActivos}
                label="Mostrar"
                onChange={e => setCantidadActivos(e.target.value)}
              >
                {cantidadOpciones.map(op => (
                  <MenuItem key={op} value={op}>{op === 'todas' ? 'Todos' : `Últimos ${op}`}</MenuItem>
                ))}
              </Select>
            </FormControl>
                </Box>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {activosFiltrados.map(proj => (
              <Card key={proj.id} sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' }, p: 2 }}>
                <CardContent>
                  <Typography variant="h6">{proj.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {proj.company}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {proj.description}
                  </Typography>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="caption">Progreso</Typography>
                    <Box sx={{ width: '100%', background: '#eee', borderRadius: 1, height: 8, mt: 0.5 }}>
                      <Box sx={{ width: `${proj.progress}%`, background: '#1976d2', height: 8, borderRadius: 1 }} />
              </Box>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>{proj.progress}%</Typography>
        </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                    {proj.tech.map((t, i) => (
                      <Chip key={i} label={t} size="small" variant="outlined" />
                    ))}
                    {proj.tech.length > 3 && <Chip label={`+${proj.tech.length - 3}`} size="small" variant="outlined" />}
                </Box>
                  <Typography variant="caption" color="text.secondary">
                    {proj.hours}/{proj.totalHours} horas • {proj.location}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2">Estudiantes asignados:</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {proj.students.map(stu => (
                      <Chip
                        key={stu.id}
                        avatar={<Avatar><PersonIcon fontSize="small" /></Avatar>}
                        label={stu.name}
                        color={stu.evaluated ? 'success' : 'default'}
                        variant={stu.evaluated ? 'filled' : 'outlined'}
                        onClick={() => alert(`Ver detalles de ${stu.name}`)}
                        icon={<VisibilityIcon fontSize="small" />}
                      />
                    ))}
              </Box>
            </CardContent>
          </Card>
            ))}
            {activosFiltrados.length === 0 && <Typography color="text.secondary">No hay proyectos activos para mostrar.</Typography>}
              </Box>
            </CardContent>
          </Card>

      {/* Proyectos Completados */}
            <Card>
              <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
              <AssessmentIcon sx={{ mr: 1, color: 'info.main' }} /> Proyectos Completados ({completados.length})
                    </Typography>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Mostrar</InputLabel>
              <Select
                value={cantidadCompletados}
                label="Mostrar"
                onChange={e => setCantidadCompletados(e.target.value)}
              >
                {cantidadOpciones.map(op => (
                  <MenuItem key={op} value={op}>{op === 'todas' ? 'Todos' : `Últimos ${op}`}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {completadosFiltrados.map(proj => (
              <Card key={proj.id} sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' }, p: 2 }}>
                <CardContent>
                  <Typography variant="h6">{proj.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                    {proj.company}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {proj.description}
                    </Typography>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="caption">Progreso</Typography>
                    <Box sx={{ width: '100%', background: '#eee', borderRadius: 1, height: 8, mt: 0.5 }}>
                      <Box sx={{ width: `${proj.progress}%`, background: '#1976d2', height: 8, borderRadius: 1 }} />
                    </Box>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>{proj.progress}%</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                    {proj.tech.map((t, i) => (
                      <Chip key={i} label={t} size="small" variant="outlined" />
                    ))}
                    {proj.tech.length > 3 && <Chip label={`+${proj.tech.length - 3}`} size="small" variant="outlined" />}
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {proj.hours}/{proj.totalHours} horas • {proj.location}
                </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2">Estudiantes asignados:</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {proj.students.map(stu => (
                  <Chip
                        key={stu.id}
                        avatar={<Avatar><PersonIcon fontSize="small" /></Avatar>}
                        label={stu.name}
                        color={stu.evaluated ? 'success' : 'default'}
                        variant={stu.evaluated ? 'filled' : 'outlined'}
                        onClick={() => stu.evaluated ? handleOpenDetalle(stu, proj) : handleOpenEvaluar(stu, proj)}
                        icon={stu.evaluated ? <StarIcon fontSize="small" /> : <RateReviewIcon fontSize="small" />}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            ))}
            {completadosFiltrados.length === 0 && <Typography color="text.secondary">No hay proyectos completados para mostrar.</Typography>}
                </Box>
        </CardContent>
      </Card>

      {/* Nueva sección de evaluaciones recibidas */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
              <AssessmentIcon sx={{ mr: 1, color: 'info.main' }} /> Evaluaciones Recibidas ({recibidasFiltradas.length})
                </Typography>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Mostrar</InputLabel>
              <Select
                value={cantidadRecibidas}
                label="Mostrar"
                onChange={e => setCantidadRecibidas(e.target.value)}
              >
                {cantidadOpciones.map(op => (
                  <MenuItem key={op} value={op}>{op === 'todas' ? 'Todas' : `Últimas ${op}`}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {recibidasFiltradas.map(ev => (
              <Card key={ev.id} sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' }, p: 2 }}>
                <CardContent>
                  <Typography variant="h6">{ev.project}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {ev.student}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {ev.date}
                  </Typography>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="caption">Calificación General</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating value={ev.gpa} readOnly precision={0.5} />
                      <Typography variant="h5" sx={{ ml: 1 }}>{ev.gpa}/5</Typography>
                    </Box>
                  </Box>
                  <Typography variant="subtitle1" sx={{ mt: 2 }}>Comentarios del Estudiante</Typography>
                  <Typography variant="body2" paragraph>
                    {ev.comment}
                  </Typography>
                  <Typography variant="subtitle1" color="success.main">Fortalezas</Typography>
                  <ul style={{ margin: 0, paddingLeft: 16 }}>
                    {ev.fortalezas.map((f: string, i: number) => (
                      <li key={i}><Typography variant="body2">{f}</Typography></li>
                    ))}
                  </ul>
                  <Typography variant="subtitle1" color="warning.main">Áreas de Mejora</Typography>
                  <ul style={{ margin: 0, paddingLeft: 16 }}>
                    {ev.mejoras.map((m: string, i: number) => (
                      <li key={i}><Typography variant="body2">{m}</Typography></li>
                    ))}
                  </ul>
              </CardContent>
            </Card>
            ))}
            {recibidasFiltradas.length === 0 && <Typography color="text.secondary">No hay evaluaciones recibidas para mostrar.</Typography>}
          </Box>
        </CardContent>
      </Card>

      {/* Modales */}
      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle>Evaluar Estudiante</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              {selectedStudent?.name} - {selectedProject?.title}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 2 }}>
              <Box>
                <Typography variant="subtitle2">Calidad del Código</Typography>
                <Rating value={evaluacion.code} onChange={(_, v) => setEvaluacion(ev => ({ ...ev, code: v || 1 }))} max={5} />
              </Box>
              <Box>
                <Typography variant="subtitle2">Cumplimiento de Plazos</Typography>
                <Rating value={evaluacion.deadlines} onChange={(_, v) => setEvaluacion(ev => ({ ...ev, deadlines: v || 1 }))} max={5} />
              </Box>
              <Box>
                <Typography variant="subtitle2">Trabajo en Equipo</Typography>
                <Rating value={evaluacion.teamwork} onChange={(_, v) => setEvaluacion(ev => ({ ...ev, teamwork: v || 1 }))} max={5} />
              </Box>
              <Box>
                <Typography variant="subtitle2">Comunicación</Typography>
                <Rating value={evaluacion.communication} onChange={(_, v) => setEvaluacion(ev => ({ ...ev, communication: v || 1 }))} max={5} />
              </Box>
              <Box>
                <Typography variant="subtitle2">Documentación</Typography>
                <Rating value={evaluacion.documentation} onChange={(_, v) => setEvaluacion(ev => ({ ...ev, documentation: v || 1 }))} max={5} />
              </Box>
              <Box>
                <Typography variant="subtitle2">Innovación</Typography>
                <Rating value={evaluacion.innovation} onChange={(_, v) => setEvaluacion(ev => ({ ...ev, innovation: v || 1 }))} max={5} />
              </Box>
            </Box>
              <TextField
              label="Comentarios del Evaluador"
                fullWidth
              multiline
              rows={3}
              value={evaluacion.comment}
              onChange={e => setEvaluacion(ev => ({ ...ev, comment: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Fortalezas</InputLabel>
                <Select
                multiple
                value={evaluacion.fortalezas}
                onChange={e => setEvaluacion(ev => ({ ...ev, fortalezas: Array.isArray(e.target.value) ? e.target.value : [] }))}
                renderValue={selected => (selected as string[]).join(', ')}
                label="Fortalezas"
              >
                {fortalezasOpciones.map(opt => (
                  <MenuItem key={opt} value={opt}>
                    <Checkbox checked={evaluacion.fortalezas.indexOf(opt) > -1} />
                    <ListItemText primary={opt} />
                  </MenuItem>
                ))}
                </Select>
              </FormControl>
              <TextField
              label="Otra fortaleza (opcional)"
                fullWidth
              value={evaluacion.fortalezasExtra}
              onChange={e => setEvaluacion(ev => ({ ...ev, fortalezasExtra: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Áreas de Mejora</InputLabel>
              <Select
                multiple
                value={evaluacion.mejoras}
                onChange={e => setEvaluacion(ev => ({ ...ev, mejoras: Array.isArray(e.target.value) ? e.target.value : [] }))}
                renderValue={selected => (selected as string[]).join(', ')}
                label="Áreas de Mejora"
              >
                {mejorasOpciones.map(opt => (
                  <MenuItem key={opt} value={opt}>
                    <Checkbox checked={evaluacion.mejoras.indexOf(opt) > -1} />
                    <ListItemText primary={opt} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
              <TextField
              label="Otra área de mejora (opcional)"
                fullWidth
              value={evaluacion.mejorasExtra}
              onChange={e => setEvaluacion(ev => ({ ...ev, mejorasExtra: e.target.value }))}
              sx={{ mb: 2 }}
            />
              <TextField
              label="Tecnologías Utilizadas (opcional)"
                fullWidth
              value={evaluacion.tecnologias}
              onChange={e => setEvaluacion(ev => ({ ...ev, tecnologias: e.target.value }))}
              sx={{ mb: 2 }}
            />
              <TextField
              label="Entregables (opcional)"
                fullWidth
              value={evaluacion.entregables}
              onChange={e => setEvaluacion(ev => ({ ...ev, entregables: e.target.value }))}
              sx={{ mb: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancelar</Button>
          <Button onClick={handleSaveEvaluacion} variant="contained">Guardar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={modalDetalleOpen} onClose={handleCloseDetalle} maxWidth="md" fullWidth>
        <DialogTitle>Detalle de Evaluación</DialogTitle>
        <DialogContent>
          {selectedStudent && selectedProject && getEvaluacionGuardada(selectedStudent.id, selectedProject.id) && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedProject.title}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 2 }}>
                <Card sx={{ flex: '1 1 300px', mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle2">Información del Proyecto</Typography>
                    <Typography variant="body2"><b>Empresa:</b> {selectedProject.company}</Typography>
                    <Typography variant="body2"><b>Evaluador:</b> Empresa</Typography>
                    <Typography variant="body2"><b>Fecha:</b> {new Date().toLocaleDateString()}</Typography>
                    <Typography variant="body2"><b>Duración:</b> {selectedProject.totalHours / 40} meses</Typography>
                  </CardContent>
                </Card>
                <Card sx={{ flex: '1 1 200px', mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle2">Calificación General</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating value={Number(getEvaluacionGuardada(selectedStudent.id, selectedProject.id).gpa)} readOnly precision={0.5} />
                      <Typography variant="h5" sx={{ ml: 1 }}>{getEvaluacionGuardada(selectedStudent.id, selectedProject.id).gpa}/5</Typography>
                    </Box>
                    <Typography variant="body2">Evaluación Final</Typography>
                  </CardContent>
                </Card>
              </Box>
              <Typography variant="subtitle1" sx={{ mt: 2 }}>Evaluación por Categorías</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                {[
                  { label: 'Calidad del Código', value: getEvaluacionGuardada(selectedStudent.id, selectedProject.id).code },
                  { label: 'Cumplimiento de Plazos', value: getEvaluacionGuardada(selectedStudent.id, selectedProject.id).deadlines },
                  { label: 'Trabajo en Equipo', value: getEvaluacionGuardada(selectedStudent.id, selectedProject.id).teamwork },
                  { label: 'Comunicación', value: getEvaluacionGuardada(selectedStudent.id, selectedProject.id).communication },
                  { label: 'Documentación', value: getEvaluacionGuardada(selectedStudent.id, selectedProject.id).documentation },
                  { label: 'Innovación', value: getEvaluacionGuardada(selectedStudent.id, selectedProject.id).innovation },
                ].map((cat, i) => (
                  <Card key={i} sx={{ flex: '1 1 200px' }}>
                    <CardContent>
                      <Typography variant="subtitle2">{cat.label}</Typography>
                      <Rating value={cat.value} readOnly />
                      <Typography variant="body2">{cat.value}/5</Typography>
                    </CardContent>
                  </Card>
                ))}
                </Box>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Card sx={{ flex: 1 }}>
                  <CardContent>
                    <Typography variant="subtitle2">Tecnologías Utilizadas</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                      {getEvaluacionGuardada(selectedStudent.id, selectedProject.id).tecnologias?.split(',').map((t: string, i: number) => (
                        <Chip key={i} label={t.trim()} variant="outlined" />
                      ))}
                </Box>
                  </CardContent>
                </Card>
                <Card sx={{ flex: 1 }}>
                  <CardContent>
                    <Typography variant="subtitle2">Entregables</Typography>
                    <ul style={{ margin: 0, paddingLeft: 16 }}>
                      {getEvaluacionGuardada(selectedStudent.id, selectedProject.id).entregables?.split(',').map((e: string, i: number) => (
                        <li key={i}><Typography variant="body2">{e.trim()}</Typography></li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </Box>
              <Typography variant="subtitle1" sx={{ mt: 2 }}>Comentarios del Evaluador</Typography>
              <Typography variant="body2" paragraph>
                {getEvaluacionGuardada(selectedStudent.id, selectedProject.id).comment}
              </Typography>
              <Typography variant="subtitle1" color="success.main">Fortalezas</Typography>
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {getEvaluacionGuardada(selectedStudent.id, selectedProject.id).fortalezas.map((f: string, i: number) => (
                  <li key={i}><Typography variant="body2">{f}</Typography></li>
                ))}
                {getEvaluacionGuardada(selectedStudent.id, selectedProject.id).fortalezasExtra && (
                  <li><Typography variant="body2">{getEvaluacionGuardada(selectedStudent.id, selectedProject.id).fortalezasExtra}</Typography></li>
                )}
              </ul>
              <Typography variant="subtitle1" color="warning.main">Áreas de Mejora</Typography>
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {getEvaluacionGuardada(selectedStudent.id, selectedProject.id).mejoras.map((m: string, i: number) => (
                  <li key={i}><Typography variant="body2">{m}</Typography></li>
                ))}
                {getEvaluacionGuardada(selectedStudent.id, selectedProject.id).mejorasExtra && (
                  <li><Typography variant="body2">{getEvaluacionGuardada(selectedStudent.id, selectedProject.id).mejorasExtra}</Typography></li>
                )}
              </ul>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetalle}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={modalRecibidaOpen} onClose={handleCloseRecibida} maxWidth="md" fullWidth>
        <DialogTitle>Detalle de Evaluación</DialogTitle>
        <DialogContent>
          {selectedRecibida && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedRecibida.project}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 2 }}>
                <Card sx={{ flex: '1 1 300px', mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle2">Información del Proyecto</Typography>
                    <Typography variant="body2"><b>Empresa:</b> {selectedRecibida.company}</Typography>
                    <Typography variant="body2"><b>Evaluador:</b> {selectedRecibida.student}</Typography>
                    <Typography variant="body2"><b>Fecha:</b> {selectedRecibida.date}</Typography>
                    <Typography variant="body2"><b>Duración:</b> {selectedRecibida.totalHours / 40} meses</Typography>
                  </CardContent>
                </Card>
                <Card sx={{ flex: '1 1 200px', mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle2">Calificación General</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating value={selectedRecibida.gpa} readOnly precision={0.5} />
                      <Typography variant="h5" sx={{ ml: 1 }}>{selectedRecibida.gpa}/5</Typography>
                    </Box>
                    <Typography variant="body2">Evaluación Final</Typography>
                  </CardContent>
                </Card>
              </Box>
              <Typography variant="subtitle1" sx={{ mt: 2 }}>Comentarios del Estudiante</Typography>
              <Typography variant="body2" paragraph>
                {selectedRecibida.comment}
              </Typography>
              <Typography variant="subtitle1" color="success.main">Fortalezas</Typography>
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {selectedRecibida.fortalezas.map((f: string, i: number) => (
                  <li key={i}><Typography variant="body2">{f}</Typography></li>
                ))}
              </ul>
              <Typography variant="subtitle1" color="warning.main">Áreas de Mejora</Typography>
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {selectedRecibida.mejoras.map((m: string, i: number) => (
                  <li key={i}><Typography variant="body2">{m}</Typography></li>
                ))}
              </ul>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRecibida}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CompanyEvaluations;
