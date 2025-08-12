import { useEffect, useState, useImperativeHandle, forwardRef, useCallback } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  IconButton,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  ViewModule as ViewModuleIcon,
  ViewWeek as ViewWeekIcon,
  ViewDay as ViewDayIcon,
  Today as TodayIcon,
  Event as EventIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useTheme } from '../../../contexts/ThemeContext';

import 'react-big-calendar/lib/css/react-big-calendar.css';

// Estilos adicionales para asegurar que los eventos sean visibles
const additionalStyles = `
  .rbc-event {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
    background-color: #1976d2 !important;
    color: white !important;
    border: 1px solid #1976d2 !important;
    border-radius: 4px !important;
    padding: 2px 4px !important;
    margin: 1px 0 !important;
    font-size: 12px !important;
    font-weight: bold !important;
    min-height: 20px !important;
    z-index: 10 !important;
    position: relative !important;
  }
  
  .rbc-event-content {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
  }
  
  .rbc-month-view .rbc-event {
    position: relative !important;
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
    background-color: #1976d2 !important;
    color: white !important;
    border: 1px solid #1976d2 !important;
    border-radius: 4px !important;
    padding: 2px 4px !important;
    margin: 1px 0 !important;
    font-size: 12px !important;
    font-weight: bold !important;
    min-height: 20px !important;
    z-index: 10 !important;
  }
  
  .rbc-month-view .rbc-event-content {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
    color: white !important;
    font-weight: bold !important;
  }
  
  .rbc-day-slot .rbc-event {
    position: absolute !important;
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
  }
  
  .rbc-month-row .rbc-event {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
  }
  
  .rbc-date-cell .rbc-event {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
  }
`;

// Agregar estilos al documento
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = additionalStyles;
  document.head.appendChild(styleElement);
}
import { useApi } from '../../../hooks/useApi';
import { adaptCalendarEvent } from '../../../utils/adapters';
import type { CalendarEvent } from '../../../types/calendar';

const locales = { es };
const localizer = dateFnsLocalizer({ 
  format, 
  parse, 
  startOfWeek, 
  getDay, 
  locales 
});

const calendarStyles = `
  .rbc-calendar { 
    font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif; 
    border-radius: 16px; 
    overflow: hidden; 
    box-shadow: 0 8px 32px rgba(0,0,0,0.12); 
    background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
    border: 1px solid rgba(255,255,255,0.2);
  }
  
  .rbc-header { 
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
    border-bottom: 2px solid #e0e0e0; 
    font-weight: 700; 
    color: white; 
    padding: 16px 12px; 
    text-transform: uppercase;
    letter-spacing: 1px;
    font-size: 14px;
  }
  
  .rbc-toolbar { 
    background: linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%); 
    border-bottom: 2px solid #e0e0e0; 
    padding: 20px; 
    margin-bottom: 0; 
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }
  
  .rbc-toolbar button { 
    background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%); 
    border: 2px solid #e0e0e0; 
    color: #555; 
    border-radius: 12px; 
    padding: 10px 20px; 
    font-weight: 600; 
    transition: all 0.3s ease; 
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-size: 13px;
  }
  
  .rbc-toolbar button:hover { 
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
    border-color: #667eea; 
    color: white; 
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
  }
  
  .rbc-toolbar button.rbc-active { 
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
    border-color: #667eea; 
    color: white; 
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
  }
  
  .rbc-month-view { 
    border: 2px solid #e0e0e0; 
    border-radius: 0 0 16px 16px;
    overflow: hidden;
  }
  
  .rbc-month-row { 
    border-bottom: 2px solid #f0f0f0; 
    transition: background-color 0.2s ease;
  }
  
  .rbc-month-row:hover {
    background-color: rgba(102, 126, 234, 0.02);
  }
  
  .rbc-date-cell { 
    padding: 12px; 
    border-right: 2px solid #f0f0f0; 
    position: relative;
    min-height: 120px;
    background: linear-gradient(135deg, #ffffff 0%, #fafbff 100%);
    transition: all 0.2s ease;
  }
  
  .rbc-date-cell:hover {
    background: linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%);
    transform: scale(1.02);
    z-index: 1;
    box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  }
  
  .rbc-off-range-bg { 
    background: linear-gradient(135deg, #f8f9fa 0%, #f0f2f5 100%); 
    opacity: 0.6;
  }
  
  .rbc-today { 
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%); 
    border: 2px solid #667eea;
    border-radius: 8px;
    position: relative;
  }
  
  .rbc-today::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
    border-radius: 6px;
    pointer-events: none;
  }
  
  .rbc-event { 
    border-radius: 8px; 
    font-weight: 700; 
    font-size: 12px; 
    padding: 4px 8px; 
    margin: 2px; 
    border: none; 
    box-shadow: 0 4px 12px rgba(0,0,0,0.15); 
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    text-shadow: 0 1px 2px rgba(0,0,0,0.2);
    position: relative;
    overflow: hidden;
  }
  
  .rbc-event::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
    pointer-events: none;
  }
  
  .rbc-event:hover { 
    box-shadow: 0 6px 20px rgba(0,0,0,0.25); 
    transform: translateY(-2px) scale(1.05); 
    transition: all 0.3s ease; 
  }
  
  .rbc-event-content { 
    font-weight: 700; 
    position: relative;
    z-index: 1;
  }
  
  .rbc-show-more {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 6px;
    padding: 4px 8px;
    font-weight: 600;
    font-size: 11px;
    text-decoration: none;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  }
  
  .rbc-show-more:hover {
    background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
  
  .rbc-time-view {
    border-radius: 0 0 16px 16px;
    overflow: hidden;
  }
  
  .rbc-time-header {
    background: linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%);
    border-bottom: 2px solid #e0e0e0;
  }
  
  .rbc-time-content {
    background: linear-gradient(135deg, #ffffff 0%, #fafbff 100%);
  }
  
  .rbc-timeslot-group {
    border-bottom: 1px solid #f0f0f0;
  }
  
  .rbc-time-slot {
    border-bottom: 1px solid #f8f8f8;
  }
`;

if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = calendarStyles;
  document.head.appendChild(styleElement);
}

export const CompanyCalendar = forwardRef((_, ref) => {
  const { themeMode } = useTheme();
  const api = useApi();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());
  const [newEvent, setNewEvent] = useState<any>({
    title: '',
    description: '',
    event_type: 'interview',
    start_date: '',
    end_date: '',
    location: '',
    attendees: [],
    is_public: false,
    priority: 'medium',
    meeting_type: 'online', // 'online' o 'onsite'
    meeting_link: '', // Para reuniones online
    meeting_room: '', // Para reuniones en sede
    representative_name: '', // Nombre del representante
    representative_position: '', // Cargo del representante
  });

  // Estado para el proyecto seleccionado
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [companyProjects, setCompanyProjects] = useState<any[]>([]);

  useEffect(() => {
    loadCalendarData();
  }, []); // Empty dependency array to run only once

  const loadCalendarData = useCallback(async () => {
      try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Iniciando carga de datos del calendario...');
      console.log('🔍 Token de autorización disponible:', !!localStorage.getItem('accessToken'));
      console.log('🔍 Token completo:', localStorage.getItem('accessToken')?.substring(0, 20) + '...');
      console.log('🔍 Usuario actual:', localStorage.getItem('user'));
      
      // Obtener eventos de calendario
      const eventsResponse = await api.get('/api/calendar/events/company_events/');
      // console.log('Raw company events response:', eventsResponse);
      
      // El backend devuelve {'results': events_data}, no un array plano
      const eventsArray = Array.isArray(eventsResponse)
        ? eventsResponse
        : Array.isArray(eventsResponse.data)
          ? eventsResponse.data
          : Array.isArray(eventsResponse.results)
            ? eventsResponse.results
            : eventsResponse?.results || [];
      
      // Validar que eventsArray sea un array válido
      if (!Array.isArray(eventsArray)) {
        console.error('eventsArray no es un array válido:', eventsArray);
        setEvents([]);
        return;
      }
      // console.log('Company events array:', eventsArray);
      
      // console.log('Events array length:', eventsArray.length);
      // console.log('First event in array:', eventsArray[0]);
      
      const adaptedEvents = eventsArray.map((event: any) => {
        try {
          const adapted = adaptCalendarEvent(event);
          // console.log('Adapted company event:', adapted);
          
          // Verificar que las fechas sean válidas
          if (adapted.start && adapted.end) {
            // console.log('Evento con fechas válidas:', adapted.title, adapted.start, adapted.end);
          } else {
            console.warn('Evento con fechas inválidas:', adapted.title, adapted.start, adapted.end);
          }
          
          return adapted;
        } catch (error) {
          console.error('Error adaptando evento:', event, error);
          return null;
        }
      }).filter((e): e is CalendarEvent => e !== null); // Filtrar eventos nulos
      
      // console.log('All adapted company events:', adaptedEvents);
      // console.log('Company Calendar - Formatted events details:', adaptedEvents.map(e => ({
      //   id: e.id,
      //   title: e.title,
      //   start: e.start,
      //   end: e.end,
      //   isValidStart: !isNaN(e.start.getTime()),
      //   isValidEnd: !isNaN(e.end.getTime())
      // })));
      setEvents(adaptedEvents);

      // Obtener proyectos de la empresa
      console.log('🔍 Llamando endpoint de proyectos de empresa...');
      const projectsResponse = await api.get('/api/projects/company_projects/');
      console.log('🔍 Respuesta del endpoint:', projectsResponse);
      
      const projects = Array.isArray(projectsResponse.data) ? projectsResponse.data : (projectsResponse.data?.data || []);
      console.log('🔍 Proyectos extraídos:', projects);
      
      // Filtrar solo proyectos activos o publicados (excluir completados, cancelados, etc.)
      console.log('🔍 Aplicando filtro de proyectos...');
      const activeProjects = projects.filter((project: any) => {
        const status = project.status?.toLowerCase() || '';
        console.log(`  🔍 Proyecto ${project.title}: estado='${status}'`);
        
        // Solo permitir proyectos activos o publicados para crear eventos
        // El backend usa: 'open', 'in-progress', 'completed', 'cancelled'
        const allowedStatuses = ['open', 'in-progress', 'active', 'published', 'activo', 'publicado'];
        const isAllowed = allowedStatuses.includes(status);
        console.log(`  🔍 Estado permitido: ${isAllowed}`);
        
        return isAllowed;
      });
      
      console.log('🔍 Proyectos totales recibidos:', projects);
      console.log('🔍 Estados de proyectos:', projects.map(p => ({ id: p.id, title: p.title, status: p.status })));
      console.log(`📊 Proyectos totales: ${projects.length}, Proyectos activos/publicados: ${activeProjects.length}`);
      console.log('🔍 Proyectos filtrados:', activeProjects);
      setCompanyProjects(activeProjects);

      // Obtener postulaciones recibidas
      console.log('🔍 Llamando endpoint de aplicaciones recibidas...');
      const applicationsResponse = await api.get('/api/applications/received_applications/');
      console.log('🔍 Respuesta completa de aplicaciones:', applicationsResponse);
      console.log('🔍 Tipo de respuesta:', typeof applicationsResponse);
      console.log('🔍 Claves de respuesta:', Object.keys(applicationsResponse || {}));
      
      // El backend devuelve {'success': True, 'data': [...]}
      const applications = applicationsResponse.data || applicationsResponse.results || [];
      console.log('🔍 Aplicaciones extraídas:', applications);
      console.log('🔍 Número de aplicaciones:', applications.length);
      
      // Debug: Imprimir información de las aplicaciones
      if (applications.length > 0) {
        console.log('🔍 Primera aplicación:', applications[0]);
        console.log('🔍 Estructura del proyecto en primera aplicación:', applications[0].project);
        console.log('🔍 Estructura del estudiante en primera aplicación:', applications[0].student);
        console.log('🔍 ID del proyecto:', applications[0].project?.id);
        console.log('🔍 ID del estudiante:', applications[0].student?.user);
        
        // Verificar que todas las aplicaciones tengan la estructura correcta
        applications.forEach((app: any, index: number) => {
          console.log(`🔍 Aplicación ${index}:`, {
            id: app.id,
            projectId: app.project?.id || app.project,
            projectTitle: app.project?.title,
            studentId: app.student?.id,
            studentUserId: app.student?.user,
            studentName: app.student?.name,
            status: app.status
          });
        });
      }
      
      // Normalizar la estructura de datos para asegurar consistencia
      const normalizedApplications = applications.map((app: any) => {
        // Extraer el ID del proyecto
        let projectId = null;
        if (app.project) {
          if (typeof app.project === 'string') {
            projectId = app.project;
          } else if (app.project.id) {
            projectId = app.project.id;
          }
        }
        
        // Extraer el ID del estudiante - CORREGIDO
        let studentId = null;
        if (app.student) {
          // Prioridad 1: app.student.user (ID del usuario)
          if (app.student.user) {
            studentId = app.student.user;
          }
          // Prioridad 2: app.student.id (ID del perfil de estudiante)
          else if (app.student.id) {
            studentId = app.student.id;
          }
        }
        
        console.log(`🔍 [NORMALIZATION] Aplicación ${app.id}:`, {
          originalProject: app.project,
          originalStudent: app.student,
          normalizedProjectId: projectId,
          normalizedStudentId: studentId
        });
        
        return {
          ...app,
          // Asegurar que project tenga siempre un ID accesible
          project: projectId,
          // Asegurar que student tenga siempre un ID accesible
          student: {
            ...app.student,
            // Usar el ID del usuario (student.user) como identificador principal
            id: app.student?.id || null,
            user: studentId, // Este será el ID que usaremos para attendees
            name: app.student?.name || 'Estudiante',
            career: app.student?.career || null,
            semester: app.student?.semester || null
          }
        };
      });
      
      console.log('🔍 Aplicaciones normalizadas:', normalizedApplications);
      
      // Guardar todas las aplicaciones para filtrar después
      setUsers(normalizedApplications);
      
    } catch (err: any) {
      console.error('Error cargando datos del calendario:', err);
      setError(err.response?.data?.error || 'Error al cargar datos del calendario');
    } finally {
      setLoading(false);
    }
  }, []); // Remove api dependency to prevent infinite re-renders

  // Debug: Verificar datos cuando cambian
  useEffect(() => {
    console.log('🔍 Estado actual de users:', users);
    console.log('🔍 Estado actual de companyProjects:', companyProjects);
    console.log('🔍 Proyecto seleccionado:', selectedProject);
  }, [users, companyProjects, selectedProject]);

  const messages = {
    allDay: 'Todo el día', 
    previous: 'Anterior', 
    next: 'Siguiente', 
    today: 'Hoy', 
    month: 'Mes', 
    week: 'Semana', 
    day: 'Día', 
    agenda: 'Agenda', 
    date: 'Fecha', 
    time: 'Hora', 
    event: 'Evento', 
    noEventsInRange: 'No hay eventos en este rango', 
    showMore: (total: number) => `+ Ver más (${total})`,
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'interview': return <BusinessIcon color="primary" />;
      case 'deadline': return <AssignmentIcon color="error" />;
      case 'meeting': return <ScheduleIcon color="info" />;
      case 'reminder': return <InfoIcon color="warning" />;
      case 'other': return <EventIcon color="success" />;
      default: return <InfoIcon color="action" />;
    }
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#3174ad';
    let borderColor = '#3174ad';
    switch (event.event_type) {
      case 'interview': backgroundColor = '#1976d2'; borderColor = '#1976d2'; break;
      case 'deadline': backgroundColor = '#d32f2f'; borderColor = '#d32f2f'; break;
      case 'meeting': backgroundColor = '#0288d1'; borderColor = '#0288d1'; break;
      case 'reminder': backgroundColor = '#f57c00'; borderColor = '#f57c00'; break;
      case 'other': backgroundColor = '#388e3c'; borderColor = '#388e3c'; break;
    }
    return {
      style: {
        backgroundColor,
        borderColor,
        borderRadius: '4px',
        color: 'white',
        border: '1px solid ' + borderColor,
        display: 'block',
        fontSize: '12px',
        fontWeight: 'bold',
        minHeight: '20px',
        padding: '2px 4px',
        margin: '1px 0',
      },
    };
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    // console.log('Evento seleccionado:', event);
    setSelectedEvent(event);
    setDialogOpen(true);
  };

  const handleSelectSlot = (slotInfo: any) => {
    // Validar que el slot seleccionado esté dentro del horario permitido
    const startHour = slotInfo.start.getHours();
    const endHour = slotInfo.end.getHours();
    
    if (startHour < 8 || startHour >= 19 || endHour > 19) {
      alert('Solo se pueden crear eventos entre las 8:00 AM y las 19:00 PM (7:00 PM)');
      return;
    }
    
    setShowAddDialog(true);
    setNewEvent({
      ...newEvent,
      start_date: format(slotInfo.start, "yyyy-MM-dd'T'HH:mm"),
      end_date: format(slotInfo.end, "yyyy-MM-dd'T'HH:mm"),
      title: 'Entrevista - [Selecciona un proyecto]', // Título sugerido
      // IMPORTANTE: Preservar el array attendees
      attendees: newEvent.attendees || []
    });
  };

  const handleAddEvent = async () => {
    try {
      console.log('🔍 [EVENT CREATION] Iniciando creación de evento...');
      console.log('🔍 [EVENT CREATION] Estado completo de newEvent:', newEvent);
      console.log('🔍 [EVENT CREATION] selectedProject:', selectedProject);
      
      // Validar que se haya seleccionado un proyecto
      if (!selectedProject) {
        alert('Debes seleccionar un proyecto para crear el evento.');
        return;
      }
      
      // Validar que se haya seleccionado al menos un estudiante
      if (!newEvent.attendees || newEvent.attendees.length === 0) {
        alert('Debes seleccionar al menos un estudiante para el evento.');
        return;
      }
      
      console.log('Fecha de inicio original:', newEvent.start_date);
      const startDate = new Date(newEvent.start_date);
      console.log('Fecha de inicio parseada:', startDate);
      console.log('Hora de inicio (local):', startDate.getHours());
      console.log('Hora de inicio (UTC):', startDate.getUTCHours());
      
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // +1 hora
      console.log('Fecha de fin calculada:', endDate);
      console.log('Hora de fin (local):', endDate.getHours());
      console.log('Hora de fin (UTC):', endDate.getUTCHours());
      
      // Validar que el evento esté dentro del horario permitido (8:00 AM - 19:00 PM)
      // Usar hora local para la validación
      const startHour = startDate.getHours();
      const endHour = endDate.getHours();
      
      console.log('Validando horario - Inicio:', startHour, 'Fin:', endHour);
      
      if (startHour < 8 || startHour >= 19) {
        alert(`Los eventos solo pueden programarse entre las 8:00 AM y las 19:00 PM (7:00 PM). Hora seleccionada: ${startHour}:00`);
        return;
      }
      
      if (endHour > 19) {
        alert(`Los eventos no pueden extenderse más allá de las 19:00 PM (7:00 PM). Hora de fin: ${endHour}:00`);
        return;
      }
      
      // Validar que el proyecto seleccionado esté activo
      if (selectedProject) {
        const selectedProjectData = companyProjects.find(p => p.id === selectedProject);
        if (!selectedProjectData) {
          alert('El proyecto seleccionado no está disponible o no está activo.');
          return;
        }
        
        const projectStatus = selectedProjectData.status?.toLowerCase() || '';
        const allowedStatuses = ['open', 'in-progress', 'active', 'published', 'activo', 'publicado'];
        
        if (!allowedStatuses.includes(projectStatus)) {
          alert(`No se pueden crear eventos para proyectos con estado "${selectedProjectData.status}". Solo se permiten proyectos activos o publicados.`);
          return;
        }
      }
      
      // Asegurar que attendees sea siempre un array válido
      let attendees = [];
      if (Array.isArray(newEvent.attendees)) {
        attendees = [...newEvent.attendees];
      } else if (typeof newEvent.attendees === 'string' && newEvent.attendees) {
        attendees = [newEvent.attendees];
      } else if (newEvent.attendees) {
        attendees = [newEvent.attendees];
      }
      
      // Validar que tengamos al menos un estudiante
      if (attendees.length === 0) {
        alert('Debes seleccionar al menos un estudiante para el evento.');
        return;
      }
      
      console.log('🔍 [EVENT CREATION] Estado de attendees antes de enviar:');
      console.log('🔍 [EVENT CREATION] newEvent.attendees:', newEvent.attendees);
      console.log('🔍 [EVENT CREATION] attendees procesado:', attendees);
      console.log('🔍 [EVENT CREATION] selectedProject:', selectedProject);
      console.log('🔍 [EVENT CREATION] Tipo de attendees:', typeof attendees);
      console.log('🔍 [EVENT CREATION] Es array:', Array.isArray(attendees));
      console.log('🔍 [EVENT CREATION] Longitud:', attendees.length);
      
      // Enviar las fechas en UTC al backend para evitar problemas de zona horaria
      const eventData = {
        title: newEvent.title,
        description: newEvent.description,
        event_type: newEvent.event_type,
        start_date: startDate.toISOString(), // Enviar en UTC
        end_date: endDate.toISOString(), // Enviar en UTC
        location: newEvent.location,
        attendees: attendees, // Siempre enviar el array de IDs
        is_public: newEvent.is_public,
        priority: newEvent.priority,
        project: selectedProject, // Enviar el proyecto seleccionado
        meeting_type: newEvent.meeting_type,
        meeting_link: newEvent.meeting_link,
        meeting_room: newEvent.meeting_room,
        representative_name: newEvent.representative_name,
        representative_position: newEvent.representative_position,
      };

      console.log('🔍 [EVENT CREATION] Datos enviados al backend:', eventData);
      console.log('🔍 [EVENT CREATION] start_date UTC:', startDate.toISOString());
      console.log('🔍 [EVENT CREATION] end_date UTC:', endDate.toISOString());
      console.log('🔍 [EVENT CREATION] attendees enviados:', attendees);
      console.log('🔍 [EVENT CREATION] Zona horaria offset:', startDate.getTimezoneOffset(), 'minutos');
      
      const createdEventResponse = await api.post('/api/calendar/events/', eventData);
      console.log('🔍 [EVENT CREATION] Respuesta del backend:', createdEventResponse);
      
      // Soportar ambos formatos de respuesta
      const createdEvent = createdEventResponse?.data?.id ? createdEventResponse.data : createdEventResponse;

      if (!createdEvent || !createdEvent.id) {
        throw new Error(createdEvent?.error || 'Error desconocido al crear el evento');
      }

      console.log('🔍 [EVENT CREATION] Evento creado exitosamente:', createdEvent);

      // Adaptar el evento creado
      const adaptedEvent = {
        id: createdEvent.id,
        title: createdEvent.title,
        description: createdEvent.description,
        event_type: createdEvent.event_type,
        start_date: createdEvent.start_date,
        end_date: createdEvent.end_date,
        start: new Date(createdEvent.start_date),
        end: new Date(createdEvent.end_date),
        all_day: createdEvent.all_day,
        location: createdEvent.location,
        attendees: createdEvent.attendees || [],
        created_by: createdEvent.created_by,
        created_at: createdEvent.created_at,
        updated_at: createdEvent.updated_at,
        priority: createdEvent.priority || 'normal',
        meeting_type: createdEvent.meeting_type,
        meeting_link: createdEvent.meeting_link,
        meeting_room: createdEvent.meeting_room,
        representative_name: createdEvent.representative_name,
        representative_position: createdEvent.representative_position,
      };

      console.log('🔍 [EVENT CREATION] Evento adaptado:', adaptedEvent);

      setEvents(prev => [...prev, adaptedEvent]);
      setShowAddDialog(false);
      
      // Resetear el formulario
      setNewEvent({
        title: '',
        description: '',
        event_type: 'interview',
        start_date: '',
        end_date: '',
        location: '',
        attendees: [],
        is_public: false,
        priority: 'medium',
        meeting_type: 'online',
        meeting_link: '',
        meeting_room: '',
        representative_name: '',
        representative_position: '',
      });
      
      // Resetear el proyecto seleccionado
      setSelectedProject('');
      
      // Mostrar mensaje de éxito
      alert('Evento creado exitosamente. Los estudiantes han sido notificados.');
      
    } catch (error: any) {
      console.error('❌ [EVENT CREATION] Error creando evento:', error);
      console.error('❌ [EVENT CREATION] Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      let errorMessage = 'Error al crear evento';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      alert(`Error al crear el evento: ${errorMessage}`);
    }
  };

  useImperativeHandle(ref, () => ({
    addEvent: (event: CalendarEvent) => setEvents(prev => [...prev, event]),
  }));

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button onClick={loadCalendarData} variant="contained">
          Reintentar
        </Button>
      </Box>
    );
  }



  // Log temporal para debug
  // console.log('Renderizando calendario con', events.length, 'eventos');
  // if (events.length > 0) {
  //   console.log('Primer evento:', events[0]);
  //   console.log('Fecha del primer evento:', events[0].start);
  // }

  return (
    <Box sx={{ 
      flexGrow: 1, 
      p: 3,
      bgcolor: themeMode === 'dark' ? '#0f172a' : '#f8fafc',
      color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
      minHeight: '100vh'
    }}>
      {/* Header mejorado con gradiente y estadísticas - ARRIBA DE TODO */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 3,
        p: 3,
        mb: 3,
        color: 'white',
        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box sx={{ 
          position: 'absolute', 
          top: 0, 
          right: 0, 
          width: '200px', 
          height: '200px', 
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          transform: 'translate(50px, -50px)'
        }} />
        <Box sx={{ 
          position: 'absolute', 
          bottom: 0, 
          left: 0, 
          width: '150px', 
          height: '150px', 
          background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
          transform: 'translate(-50px, 50px)'
        }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <Box>
            <Typography variant="h3" fontWeight={700} sx={{ mb: 1, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
              📅 Calendario Empresarial
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
              Gestiona tus entrevistas y reuniones de proyecto
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Estadísticas rápidas */}
            <Box sx={{ 
              background: 'rgba(255,255,255,0.15)', 
              borderRadius: 2, 
              p: 2, 
              textAlign: 'center',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <Typography variant="h4" fontWeight={700}>
                {events.length}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Eventos
              </Typography>
            </Box>
            
            <Button 
              variant="contained" 
              startIcon={<AddIcon />} 
              onClick={() => setShowAddDialog(true)}
              sx={{ 
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                fontWeight: 600,
                px: 3,
                py: 1.5,
                borderRadius: 3,
                textTransform: 'uppercase',
                letterSpacing: 1,
                '&:hover': {
                  background: 'rgba(255,255,255,0.3)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
                }
              }}
            >
              Agregar Evento
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Sección de estadísticas y resumen */}
      {events.length > 0 && (
        <Box sx={{ 
          background: themeMode === 'dark' 
            ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' 
            : 'linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%)',
          borderRadius: 3,
          p: 3,
          mb: 3,
          boxShadow: themeMode === 'dark' 
            ? '0 4px 16px rgba(0,0,0,0.3)' 
            : '0 4px 16px rgba(0,0,0,0.08)',
          border: themeMode === 'dark' 
            ? '1px solid #334155' 
            : '1px solid rgba(102, 126, 234, 0.1)'
        }}>
          <Typography variant="h6" fontWeight={600} color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            📊 Resumen de Actividad
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
            {/* Tarjeta de Entrevistas - Azul */}
            <Box sx={{ 
              background: themeMode === 'dark' 
                ? 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)' 
                : 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', 
              borderRadius: 2, 
              p: 2, 
              textAlign: 'center',
              boxShadow: themeMode === 'dark' 
                ? '0 4px 12px rgba(30, 64, 175, 0.4)' 
                : '0 4px 12px rgba(59, 130, 246, 0.2)',
              border: themeMode === 'dark' 
                ? '1px solid #3b82f6' 
                : '1px solid #60a5fa',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Box sx={{ 
                position: 'absolute', 
                top: 0, 
                right: 0, 
                width: '60px', 
                height: '60px', 
                background: themeMode === 'dark' 
                  ? 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)' 
                  : 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
                transform: 'translate(20px, -20px)'
              }} />
              <Typography variant="h4" fontWeight={700} sx={{ 
                color: themeMode === 'dark' ? '#60a5fa' : '#1e40af',
                position: 'relative',
                zIndex: 1
              }}>
                {events.filter(e => e.event_type === 'interview').length}
              </Typography>
              <Typography variant="body2" sx={{ 
                color: themeMode === 'dark' ? '#cbd5e1' : '#1e40af',
                fontWeight: 600,
                position: 'relative',
                zIndex: 1
              }}>
                Entrevistas
              </Typography>
            </Box>
            
            {/* Tarjeta de Reuniones - Verde */}
            <Box sx={{ 
              background: themeMode === 'dark' 
                ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' 
                : 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', 
              borderRadius: 2, 
              p: 2, 
              textAlign: 'center',
              boxShadow: themeMode === 'dark' 
                ? '0 4px 12px rgba(5, 150, 105, 0.4)' 
                : '0 4px 12px rgba(16, 185, 129, 0.2)',
              border: themeMode === 'dark' 
                ? '1px solid #10b981' 
                : '1px solid #34d399',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Box sx={{ 
                position: 'absolute', 
                top: 0, 
                right: 0, 
                width: '60px', 
                height: '60px', 
                background: themeMode === 'dark' 
                  ? 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)' 
                  : 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
                transform: 'translate(20px, -20px)'
              }} />
              <Typography variant="h4" fontWeight={700} sx={{ 
                color: themeMode === 'dark' ? '#34d399' : '#059669',
                position: 'relative',
                zIndex: 1
              }}>
                {events.filter(e => e.event_type === 'meeting').length}
              </Typography>
              <Typography variant="body2" sx={{ 
                color: themeMode === 'dark' ? '#cbd5e1' : '#059669',
                fontWeight: 600,
                position: 'relative',
                zIndex: 1
              }}>
                Reuniones
              </Typography>
            </Box>
            
            {/* Tarjeta de Online - Púrpura */}
            <Box sx={{ 
              background: themeMode === 'dark' 
                ? 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' 
                : 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)', 
              borderRadius: 2, 
              p: 2, 
              textAlign: 'center',
              boxShadow: themeMode === 'dark' 
                ? '0 4px 12px rgba(124, 58, 237, 0.4)' 
                : '0 4px 12px rgba(139, 92, 246, 0.2)',
              border: themeMode === 'dark' 
                ? '1px solid #8b5cf6' 
                : '1px solid #a78bfa',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Box sx={{ 
                position: 'absolute', 
                top: 0, 
                right: 0, 
                width: '60px', 
                height: '60px', 
                background: themeMode === 'dark' 
                  ? 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)' 
                  : 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
                transform: 'translate(20px, -20px)'
              }} />
              <Typography variant="h4" fontWeight={700} sx={{ 
                color: themeMode === 'dark' ? '#a78bfa' : '#7c3aed',
                position: 'relative',
                zIndex: 1
              }}>
                {events.filter(e => e.meeting_type === 'online').length}
              </Typography>
              <Typography variant="body2" sx={{ 
                color: themeMode === 'dark' ? '#cbd5e1' : '#7c3aed',
                fontWeight: 600,
                position: 'relative',
                zIndex: 1
              }}>
                Online
              </Typography>
            </Box>
            
            {/* Tarjeta de En Sede - Rojo */}
            <Box sx={{ 
              background: themeMode === 'dark' 
                ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' 
                : 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)', 
              borderRadius: 2, 
              p: 2, 
              textAlign: 'center',
              boxShadow: themeMode === 'dark' 
                ? '0 4px 12px rgba(220, 38, 38, 0.4)' 
                : '0 4px 12px rgba(239, 68, 68, 0.2)',
              border: themeMode === 'dark' 
                ? '1px solid #ef4444' 
                : '1px solid #f87171',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Box sx={{ 
                position: 'absolute', 
                top: 0, 
                right: 0, 
                width: '60px', 
                height: '60px', 
                background: themeMode === 'dark' 
                  ? 'radial-gradient(circle, rgba(239, 68, 68, 0.2) 0%, transparent 70%)' 
                  : 'radial-gradient(circle, rgba(239, 68, 68, 0.1) 0%, transparent 70%)',
                transform: 'translate(20px, -20px)'
              }} />
              <Typography variant="h4" fontWeight={700} sx={{ 
                color: themeMode === 'dark' ? '#f87171' : '#dc2626',
                position: 'relative',
                zIndex: 1
              }}>
                {events.filter(e => e.meeting_type === 'cowork' || e.meeting_type === 'fablab' || e.meeting_type === 'onsite').length}
              </Typography>
              <Typography variant="body2" sx={{ 
                color: themeMode === 'dark' ? '#cbd5e1' : '#dc2626',
                fontWeight: 600,
                position: 'relative',
                zIndex: 1
              }}>
                En Sede
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* Controles de vista mejorados */}
      <Box sx={{ 
        background: themeMode === 'dark' 
          ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' 
          : 'linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%)',
        borderRadius: 3,
        p: 2,
        mb: 3,
        boxShadow: themeMode === 'dark' 
          ? '0 4px 16px rgba(0,0,0,0.3)' 
          : '0 4px 16px rgba(0,0,0,0.08)',
        border: themeMode === 'dark' 
          ? '1px solid #334155' 
          : '1px solid rgba(102, 126, 234, 0.1)'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={600} color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ViewModuleIcon /> Vistas del Calendario
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Vista de mes">
              <IconButton 
                onClick={() => setView('month')} 
                sx={{ 
                  background: view === 'month' 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                    : themeMode === 'dark' 
                      ? 'rgba(255,255,255,0.1)' 
                      : 'rgba(255,255,255,0.8)',
                  color: view === 'month' ? 'white' : themeMode === 'dark' ? '#f1f5f9' : '#666',
                  borderRadius: 2,
                  p: 1.5,
                  '&:hover': {
                    background: view === 'month' 
                      ? 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)' 
                      : themeMode === 'dark' 
                        ? 'rgba(96, 165, 250, 0.2)' 
                        : 'rgba(102, 126, 234, 0.1)',
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                <ViewModuleIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Vista de semana">
              <IconButton 
                onClick={() => setView('week')} 
                sx={{ 
                  background: view === 'week' 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                    : themeMode === 'dark' 
                      ? 'rgba(255,255,255,0.1)' 
                      : 'rgba(255,255,255,0.8)',
                  color: view === 'week' ? 'white' : themeMode === 'dark' ? '#f1f5f9' : '#666',
                  borderRadius: 2,
                  p: 1.5,
                  '&:hover': {
                    background: view === 'week' 
                      ? 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)' 
                      : themeMode === 'dark' 
                        ? 'rgba(96, 165, 250, 0.2)' 
                        : 'rgba(102, 126, 234, 0.1)',
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                <ViewWeekIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Vista de día">
              <IconButton 
                onClick={() => setView('day')} 
                sx={{ 
                  background: view === 'day' 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                    : themeMode === 'dark' 
                      ? 'rgba(255,255,255,0.1)' 
                      : 'rgba(255,255,255,0.8)',
                  color: view === 'day' ? 'white' : themeMode === 'dark' ? '#f1f5f9' : '#666',
                  borderRadius: 2,
                  p: 1.5,
                  '&:hover': {
                    background: view === 'day' 
                      ? 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)' 
                      : themeMode === 'dark' 
                        ? 'rgba(96, 165, 250, 0.2)' 
                        : 'rgba(102, 126, 234, 0.1)',
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                <ViewDayIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* Calendario principal */}
      <Paper sx={{ 
        p: 3, 
        mb: 3,
        bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
        color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
        border: themeMode === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0'
      }}>
        <Box sx={{ 
          border: themeMode === 'dark' ? '1px solid #334155' : '1px solid #ddd', 
          borderRadius: 1, 
          overflow: 'hidden' 
        }}>
          {/* Navegación del calendario */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            p: 2, 
            borderBottom: themeMode === 'dark' ? '1px solid #334155' : '1px solid #ddd',
            bgcolor: themeMode === 'dark' ? '#334155' : '#f8f9fa'
          }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                onClick={() => setDate(new Date())} 
                variant="outlined" 
                size="small"
                sx={{
                  color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                  borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
                  '&:hover': {
                    borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    backgroundColor: themeMode === 'dark' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(59, 130, 246, 0.1)'
                  }
                }}
              >
                HOY
              </Button>
              <Button 
                onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1))} 
                variant="outlined" 
                size="small"
                sx={{
                  color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                  borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
                  '&:hover': {
                    borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    backgroundColor: themeMode === 'dark' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(59, 130, 246, 0.1)'
                  }
                }}
              >
                ANTERIOR
              </Button>
              <Button 
                onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1))} 
                variant="outlined" 
                size="small"
                sx={{
                  color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                  borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
                  '&:hover': {
                    borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    backgroundColor: themeMode === 'dark' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(59, 130, 246, 0.1)'
                  }
                }}
              >
                SIGUIENTE
              </Button>
            </Box>
            <Typography variant="h6" sx={{ color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b' }}>
              {date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                onClick={() => setView('month')} 
                variant={view === 'month' ? 'contained' : 'outlined'} 
                size="small"
                sx={{
                  ...(view === 'month' ? {
                    bgcolor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    color: 'white',
                    '&:hover': {
                      bgcolor: themeMode === 'dark' ? '#3b82f6' : '#2563eb'
                    }
                  } : {
                    color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                    borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
                    '&:hover': {
                      borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                      backgroundColor: themeMode === 'dark' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(59, 130, 246, 0.1)'
                    }
                  })
                }}
              >
                MES
              </Button>
              <Button 
                onClick={() => setView('week')} 
                variant={view === 'week' ? 'contained' : 'outlined'} 
                size="small"
                sx={{
                  ...(view === 'week' ? {
                    bgcolor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    color: 'white',
                    '&:hover': {
                      bgcolor: themeMode === 'dark' ? '#3b82f6' : '#2563eb'
                    }
                  } : {
                    color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                    borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
                    '&:hover': {
                      borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                      backgroundColor: themeMode === 'dark' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(59, 130, 246, 0.1)'
                    }
                  })
                }}
              >
                SEMANA
              </Button>
              <Button 
                onClick={() => setView('day')} 
                variant={view === 'day' ? 'contained' : 'outlined'} 
                size="small"
                sx={{
                  ...(view === 'day' ? {
                    bgcolor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    color: 'white',
                    '&:hover': {
                      bgcolor: themeMode === 'dark' ? '#3b82f6' : '#2563eb'
                    }
                  } : {
                    color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                    borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
                    '&:hover': {
                      borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                      backgroundColor: themeMode === 'dark' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(59, 130, 246, 0.1)'
                    }
                  })
                }}
              >
                DÍA
              </Button>
              <Button 
                onClick={() => setView('agenda')} 
                variant={view === 'agenda' ? 'contained' : 'outlined'} 
                size="small"
                sx={{
                  ...(view === 'agenda' ? {
                    bgcolor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    color: 'white',
                    '&:hover': {
                      bgcolor: themeMode === 'dark' ? '#3b82f6' : '#2563eb'
                    }
                  } : {
                    color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                    borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
                    '&:hover': {
                      borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                      backgroundColor: themeMode === 'dark' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(59, 130, 246, 0.1)'
                    }
                  })
                }}
              >
                AGENDA
              </Button>
            </Box>
          </Box>

          {/* Vista de mes personalizada */}
          {view === 'month' && (
            <Box sx={{ height: 750, p: 2, overflow: 'hidden' }}>
              {/* Días de la semana */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, mb: 1 }}>
                {['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'].map(day => (
                  <Box key={day} sx={{ 
                    p: 1, 
                    textAlign: 'center', 
                    fontWeight: 'bold', 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    borderRadius: '4px 4px 0 0',
                    boxShadow: '0 2px 4px rgba(102, 126, 234, 0.2)'
                  }}>
                    {day}
                  </Box>
                ))}
              </Box>
              
              {/* Días del mes */}
      <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(7, 1fr)', 
                gap: 1, 
                height: 'calc(100% - 60px)',
                overflow: 'hidden'
              }}>
                {(() => {
                  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
                  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
                  const startDate = new Date(firstDay);
                  startDate.setDate(startDate.getDate() - firstDay.getDay());
                  
                  const days = [];
                  for (let i = 0; i < 42; i++) {
                    const currentDate = new Date(startDate);
                    currentDate.setDate(startDate.getDate() + i);
                    
                    // Encontrar eventos para este día
                    const dayEvents = events.filter(event => {
                      const eventDate = new Date(event.start);
                      return eventDate.toDateString() === currentDate.toDateString();
                    });
                    
                    const isCurrentMonth = currentDate.getMonth() === date.getMonth();
                    const isToday = currentDate.toDateString() === new Date().toDateString();
                    
                    days.push(
                      <Box 
                        key={i} 
                        sx={{ 
                          height: '100%',
                          p: 1, 
                          border: themeMode === 'dark' ? '1px solid #334155' : '1px solid #ddd',
                          backgroundColor: isToday 
                            ? (themeMode === 'dark' ? '#1e40af' : '#e3f2fd') 
                            : isCurrentMonth 
                              ? (themeMode === 'dark' ? '#1e293b' : 'white') 
                              : (themeMode === 'dark' ? '#0f172a' : '#f9f9f9'),
                          position: 'relative',
        overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                      >
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: isToday ? 'bold' : 'normal',
                            color: isCurrentMonth 
                              ? (themeMode === 'dark' ? '#f1f5f9' : '#1e293b') 
                              : (themeMode === 'dark' ? '#64748b' : '#64748b'),
                            mb: 0.5
                          }}
                        >
                          {currentDate.getDate()}
                        </Typography>
                        
                        {/* Eventos del día */}
                        <Box sx={{ 
                          flex: 1, 
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 0.5
                        }}>
                          {dayEvents.slice(0, 3).map((event, index) => (
                            <Box
                              key={event.id}
                              onClick={() => handleSelectEvent(event)}
                              sx={{
                                backgroundColor: event.event_type === 'interview' ? '#1976d2' : 
                                               event.event_type === 'deadline' ? '#d32f2f' : 
                                               event.event_type === 'meeting' ? '#0288d1' : '#3174ad',
                                color: 'white',
                                p: 0.5,
                                borderRadius: 1,
                                fontSize: '9px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                minHeight: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                '&:hover': {
                                  opacity: 0.8
                                }
                              }}
                            >
                              {event.title}
                            </Box>
                          ))}
                          {dayEvents.length > 3 && (
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                fontSize: '8px',
                                color: themeMode === 'dark' ? '#94a3b8' : '#64748b'
                              }}
                            >
                              +{dayEvents.length - 3} más
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    );
                  }
                  return days;
                })()}
              </Box>
            </Box>
          )}

          {/* Vista de agenda */}
          {view === 'agenda' && (
            <Box sx={{ height: 'calc(100% - 80px)', p: 2 }}>
              {events.length === 0 ? (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: '100%',
                  background: 'linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%)',
                  borderRadius: 3,
                  p: 4
                }}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    📅 No hay eventos programados
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    No tienes eventos en tu agenda. Crea tu primer evento para comenzar.
                  </Typography>
                  <Button 
                    variant="contained" 
                    startIcon={<AddIcon />} 
                    onClick={() => setShowAddDialog(true)}
                    sx={{ 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      fontWeight: 600
                    }}
                  >
                    Crear Evento
                  </Button>
                </Box>
              ) : (
                <Box sx={{ height: '100%', overflow: 'auto' }}>
                  {/* Vista de agenda personalizada */}
                  <Typography variant="h5" fontWeight={600} color="primary" gutterBottom sx={{ mb: 3 }}>
                    📅 Agenda de Eventos ({events.length} eventos)
                  </Typography>
                  
                  {events
                    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
                    .map((event, index) => (
                      <Paper
                        key={event.id || index}
                        sx={{
                          p: 3,
                          mb: 2,
                          borderRadius: 3,
                          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                          border: '1px solid rgba(102, 126, 234, 0.1)',
                          background: 'linear-gradient(135deg, #ffffff 0%, #fafbff 100%)',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 25px rgba(102, 126, 234, 0.15)',
                            borderColor: 'rgba(102, 126, 234, 0.3)'
                          }
                        }}
                        onClick={() => handleSelectEvent(event)}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                          {/* Icono del tipo de evento */}
                          <Box sx={{ 
                            p: 1, 
                            borderRadius: 2, 
                            bgcolor: 'primary.main', 
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: 40,
                            height: 40
                          }}>
                            {getEventIcon(event.event_type)}
                          </Box>
                          
                          {/* Contenido del evento */}
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                              <Typography variant="h6" fontWeight={600} color="primary">
                                {event.title}
                              </Typography>
                              <Chip 
                                label={event.event_type === 'interview' ? 'Entrevista' : 
                                       event.event_type === 'meeting' ? 'Reunión' : 
                                       event.event_type === 'deadline' ? 'Fecha Límite' : 'Otro'}
                                size="small"
                                color={event.event_type === 'interview' ? 'primary' : 
                                       event.event_type === 'meeting' ? 'info' : 
                                       event.event_type === 'deadline' ? 'error' : 'default'}
                              />
                            </Box>
                            
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              📅 {new Date(event.start).toLocaleDateString('es-ES', { 
                                weekday: 'long', 
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </Typography>
                            
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              🕐 {new Date(event.start).toLocaleTimeString('es-ES', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })} - {new Date(event.end).toLocaleTimeString('es-ES', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </Typography>
                            
                            {event.location && (
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                📍 {event.location}
                              </Typography>
                            )}
                            
                            {event.description && (
                              <Typography variant="body2" color="text.secondary">
                                {event.description}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Paper>
                    ))}
                </Box>
              )}
            </Box>
          )}

          {/* Vista de semana */}
          {view === 'week' && (
            <Box sx={{ height: 'calc(100% - 80px)', p: 2 }}>
              <BigCalendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                titleAccessor="title"
                style={{ height: '100%' }}
                eventPropGetter={eventStyleGetter}
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleSelectSlot}
                selectable
                view="week"
          date={date}
          onNavigate={(newDate) => setDate(newDate)}
          step={30}
          timeslots={2}
                min={new Date(0, 0, 0, 8, 0, 0)}
                max={new Date(0, 0, 0, 19, 0, 0)}
                culture="es"
                toolbar={false}
                messages={{
                  next: "Siguiente",
                  previous: "Anterior",
                  today: "Hoy",
                  noEventsInRange: "No hay eventos en este rango de fechas.",
                  week: "Semana",
                  work_week: "Semana Laboral",
                  day: "Día",
                  month: "Mes",
                  yesterday: "Ayer",
                  tomorrow: "Mañana",
                }}
                formats={{
                  dayHeaderFormat: (date) => date.toLocaleDateString('es-ES', { 
                    weekday: 'short', 
                    day: 'numeric',
                    month: 'short'
                  }),
                  dayRangeHeaderFormat: ({ start, end }) => {
                    const startDate = new Date(start);
                    const endDate = new Date(end);
                    return `${startDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })} - ${endDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}`;
                  }
                }}
              />
            </Box>
          )}

          {/* Vista de día */}
          {view === 'day' && (
            <Box sx={{ height: 'calc(100% - 80px)', p: 2 }}>
              <BigCalendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                titleAccessor="title"
                style={{ height: '100%' }}
                eventPropGetter={eventStyleGetter}
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleSelectSlot}
                selectable
                view="day"
                date={date}
                onNavigate={(newDate) => setDate(newDate)}
                step={30}
                timeslots={2}
                min={new Date(0, 0, 0, 8, 0, 0)}
                max={new Date(0, 0, 0, 19, 0, 0)}
                culture="es"
                toolbar={false}
                messages={{
                  next: "Siguiente",
                  previous: "Anterior",
                  today: "Hoy",
                  noEventsInRange: "No hay eventos en este rango de fechas.",
                  week: "Semana",
                  work_week: "Semana Laboral",
                  day: "Día",
                  month: "Mes",
                  yesterday: "Ayer",
                  tomorrow: "Mañana",
                }}
                formats={{
                  dayHeaderFormat: (date) => date.toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })
                }}
              />
      </Box>
          )}
        </Box>
      </Paper>
      
      {/* Mensaje cuando no hay eventos */}
      {events.length === 0 && !loading && (
        <Box sx={{ 
          background: 'linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%)',
          borderRadius: 3,
          p: 4,
          mt: 3,
          textAlign: 'center',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          border: '1px solid rgba(102, 126, 234, 0.1)'
        }}>
          <Typography variant="h5" fontWeight={600} color="primary" gutterBottom>
            🎯 ¡Comienza a programar eventos!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            No tienes eventos programados aún. Haz clic en "Agregar Evento" para crear tu primera entrevista o reunión.
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => setShowAddDialog(true)}
            sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              fontWeight: 600,
              px: 4,
              py: 1.5,
              borderRadius: 3,
              textTransform: 'uppercase',
              letterSpacing: 1,
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
              }
            }}
          >
            Crear Primer Evento
          </Button>
        </Box>
      )}
      
      {/* Modal para agregar evento mejorado */}
      <Dialog 
        open={showAddDialog} 
        onClose={() => setShowAddDialog(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
            color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
            borderRadius: 3,
            boxShadow: themeMode === 'dark' 
              ? '0 20px 40px rgba(0,0,0,0.5)' 
              : '0 20px 40px rgba(0,0,0,0.15)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontWeight: 600,
          borderRadius: '12px 12px 0 0'
        }}>
          Programar Entrevista/Reunión
        </DialogTitle>
        <DialogContent sx={{ 
          mt: 2,
          bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
          color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
        }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Información del Representante */}
            <Box sx={{ 
              p: 2, 
              bgcolor: themeMode === 'dark' ? '#334155' : '#f8f9fa', 
              borderRadius: 2, 
              border: themeMode === 'dark' ? '1px solid #475569' : '1px solid #e0e0e0'
            }}>
              <Typography variant="h6" fontWeight={600} sx={{ 
                color: themeMode === 'dark' ? '#60a5fa' : '#1976d2',
                mb: 2
              }}>
                Información del Representante
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <TextField 
              fullWidth 
                  label="Nombre del Representante" 
                  value={newEvent.representative_name} 
                  onChange={(e) => setNewEvent((prev: any) => ({ ...prev, representative_name: e.target.value }))} 
                  placeholder="Ej: María González López"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: themeMode === 'dark' ? '#475569' : '#ffffff',
                      color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                      '& fieldset': {
                        borderColor: themeMode === 'dark' ? '#64748b' : '#d1d5db',
                      },
                      '&:hover fieldset': {
                        borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: themeMode === 'dark' ? '#cbd5e1' : '#64748b',
                      '&.Mui-focused': {
                        color: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                      },
                    },
                  }}
            />
            <TextField 
              fullWidth 
                  label="Cargo" 
                  value={newEvent.representative_position} 
                  onChange={(e) => setNewEvent((prev: any) => ({ ...prev, representative_position: e.target.value }))} 
                  placeholder="Ej: Directora de Recursos Humanos"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: themeMode === 'dark' ? '#475569' : '#ffffff',
                      color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                      '& fieldset': {
                        borderColor: themeMode === 'dark' ? '#64748b' : '#d1d5db',
                      },
                      '&:hover fieldset': {
                        borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: themeMode === 'dark' ? '#cbd5e1' : '#64748b',
                      '&.Mui-focused': {
                        color: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                      },
                    },
                  }}
                />
              </Box>
            </Box>

            {/* Selección de Proyecto y Participante */}
            <Box sx={{ 
              p: 2, 
              bgcolor: themeMode === 'dark' ? '#334155' : '#f0f8ff', 
              borderRadius: 2, 
              border: themeMode === 'dark' ? '1px solid #475569' : '1px solid #bbdefb'
            }}>
              <Typography variant="h6" fontWeight={600} sx={{ 
                color: themeMode === 'dark' ? '#60a5fa' : '#1976d2',
                mb: 2
              }}>
                Proyecto y Participante
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel sx={{ 
                    color: themeMode === 'dark' ? '#cbd5e1' : '#64748b',
                    '&.Mui-focused': {
                      color: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                  }}>
                    Proyecto
                  </InputLabel>
              <Select
                value={selectedProject}
                onChange={e => {
                      const projectId = e.target.value;
                      setSelectedProject(projectId);
                      setNewEvent((prev: any) => ({ 
                        ...prev, 
                        attendees: [],
                        title: projectId ? `Entrevista - ${companyProjects.find(p => p.id === projectId)?.title || 'Proyecto'}` : 'Entrevista - [Selecciona un proyecto]'
                      }));
                }}
                label="Proyecto"
                    sx={{
                      bgcolor: themeMode === 'dark' ? '#475569' : '#ffffff',
                      color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: themeMode === 'dark' ? '#64748b' : '#d1d5db',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                      },
                    }}
              >
                <MenuItem value="">Selecciona un proyecto (solo activos/publicados)</MenuItem>
                {companyProjects.length === 0 ? (
                  <MenuItem disabled>
                    No hay proyectos activos disponibles
                  </MenuItem>
                ) : (
                  companyProjects.map(project => (
                      <MenuItem key={project.id} value={project.id} sx={{
                        bgcolor: themeMode === 'dark' ? '#475569' : '#ffffff',
                        color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                        '&:hover': {
                          bgcolor: themeMode === 'dark' ? '#64748b' : '#f1f5f9',
                        },
                      }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <Typography variant="body2" fontWeight={600}>
                        {project.title}
                        </Typography>
                        <Typography variant="caption" sx={{ 
                          color: themeMode === 'dark' ? '#94a3b8' : '#64748b'
                        }}>
                          Estado: {project.status}
                        </Typography>
                      </Box>
                      </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
                
            <FormControl fullWidth>
                  <InputLabel sx={{ 
                    color: themeMode === 'dark' ? '#cbd5e1' : '#64748b',
                    '&.Mui-focused': {
                      color: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                  }}>
                    Participante
                  </InputLabel>
                  
                  {/* Información de debug */}
                  {selectedProject && (
                    <Box sx={{ mb: 1, p: 1, bgcolor: 'rgba(255, 193, 7, 0.1)', borderRadius: 1, border: '1px solid rgba(255, 193, 7, 0.3)' }}>
                      <Typography variant="caption" sx={{ color: 'warning.main', fontWeight: 500 }}>
                        🔍 Debug: {users.filter(u => String(u.project) === selectedProject).length} estudiantes disponibles para este proyecto
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'warning.main', fontWeight: 500, display: 'block', mt: 0.5 }}>
                        📋 Attendees actuales: {newEvent.attendees.length > 0 ? newEvent.attendees.join(', ') : 'NINGUNO'}
                      </Typography>
                    </Box>
                  )}
              <Select
                    value={newEvent.attendees.length > 0 ? newEvent.attendees[0] : ''}
                    onChange={e => {
                      const selectedStudentId = e.target.value;
                      console.log('🔍 [SELECT CHANGE] Valor seleccionado:', selectedStudentId);
                      console.log('🔍 [SELECT CHANGE] Estado previo:', newEvent);
                      
                      if (selectedStudentId) {
                        const newState = { ...newEvent, attendees: [selectedStudentId] };
                        console.log('🔍 [SELECT CHANGE] Nuevo estado:', newState);
                        setNewEvent(newState);
                      } else {
                        const newState = { ...newEvent, attendees: [] };
                        console.log('🔍 [SELECT CHANGE] Limpiando attendees:', newState);
                        setNewEvent(newState);
                      }
                    }}
                    label="Participante"
                disabled={!selectedProject}
                    sx={{
                      bgcolor: themeMode === 'dark' ? '#475569' : '#ffffff',
                      color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: themeMode === 'dark' ? '#64748b' : '#d1d5db',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                      },
                    }}
              >
                    <MenuItem value="">Selecciona un participante</MenuItem>
                {!selectedProject && (
                  <MenuItem disabled sx={{
                    bgcolor: themeMode === 'dark' ? '#475569' : '#ffffff',
                    color: themeMode === 'dark' ? '#94a3b8' : '#64748b',
                    fontStyle: 'italic'
                  }}>
                    Primero selecciona un proyecto
                  </MenuItem>
                )}
                {(() => {
                  console.log('🔍 [STUDENT FILTER] Filtrando usuarios para proyecto:', selectedProject);
                  console.log('🔍 [STUDENT FILTER] Usuarios disponibles:', users);
                  console.log('🔍 [STUDENT FILTER] Estructura de usuarios:', users.map((u: any) => ({
                    id: u.id,
                    project: u.project,
                    student: u.student,
                    studentUser: u.student?.user,
                    studentId: u.student?.id
                  })));
                  
                  const filteredUsers = users.filter((u: any) => {
                    // u.project ahora es directamente el ID del proyecto (string) después de la normalización
                    const projectId = u.project;
                    const isMatch = String(projectId) === selectedProject;
                    console.log(`🔍 [STUDENT FILTER] Usuario ${u.id}: projectId=${projectId}, selectedProject=${selectedProject}, isMatch=${isMatch}`);
                    return isMatch;
                  });
                  
                  console.log('🔍 [STUDENT FILTER] Usuarios filtrados:', filteredUsers);
                  console.log('🔍 [STUDENT FILTER] Detalle de usuarios filtrados:', filteredUsers.map((u: any) => ({
                    id: u.id,
                    project: u.project,
                    student: u.student,
                    studentUser: u.student?.user,
                    studentId: u.student?.id,
                    studentName: u.student?.name
                  })));
                  
                  if (filteredUsers.length === 0 && selectedProject) {
                    return (
                      <MenuItem disabled sx={{
                        bgcolor: themeMode === 'dark' ? '#475569' : '#ffffff',
                        color: themeMode === 'dark' ? '#94a3b8' : '#64748b',
                        fontStyle: 'italic'
                      }}>
                        No hay estudiantes postulados para este proyecto
                      </MenuItem>
                    );
                  }
                  
                  return filteredUsers.map((user: any) => {
                    // Usar el ID del usuario (student.user) como valor del Select
                    const studentId = user.student?.user || user.student?.id || user.id;
                    const studentName = user.student?.name || user.student_name || user.student_email || 'Estudiante';
                    const studentCareer = user.student?.career;
                    const studentSemester = user.student?.semester;
                    
                    console.log(`🔍 [STUDENT SELECT] Renderizando estudiante:`, {
                      id: studentId,
                      name: studentName,
                      career: studentCareer,
                      semester: studentSemester,
                      studentUser: user.student?.user,
                      studentId: user.student?.id
                    });
                    
                    return (
                      <MenuItem key={studentId} value={studentId} sx={{
                        bgcolor: themeMode === 'dark' ? '#475569' : '#ffffff',
                        color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                        '&:hover': {
                          bgcolor: themeMode === 'dark' ? '#64748b' : '#f1f5f9',
                        },
                      }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                          <Typography variant="body2" fontWeight={600}>
                            {studentName}
                          </Typography>
                          <Typography variant="caption" sx={{ 
                            color: themeMode === 'dark' ? '#94a3b8' : '#64748b'
                          }}>
                            Estado: {user.status === 'pending' ? 'Pendiente' : 
                                   user.status === 'accepted' ? 'Aceptado' : 
                                   user.status === 'rejected' ? 'Rechazado' : user.status}
                          </Typography>
                          {studentCareer && (
                            <Typography variant="caption" sx={{ 
                              color: themeMode === 'dark' ? '#94a3b8' : '#64748b'
                            }}>
                              {studentCareer} - Semestre {studentSemester || 'N/A'}
                            </Typography>
                          )}
                          {/* Debug: Mostrar IDs para verificación */}
                          <Typography variant="caption" sx={{ 
                            color: themeMode === 'dark' ? '#ef4444' : '#dc2626',
                            fontFamily: 'monospace',
                            fontSize: '10px'
                          }}>
                            User ID: {user.student?.user || 'N/A'} | Student ID: {user.student?.id || 'N/A'}
                          </Typography>
                        </Box>
                      </MenuItem>
                    );
                  });
                })()}
              </Select>
            </FormControl>
              </Box>
            </Box>

            {/* Detalles del Evento */}
            <Box sx={{ 
              p: 2, 
              bgcolor: themeMode === 'dark' ? '#334155' : '#fff3e0', 
              borderRadius: 2, 
              border: themeMode === 'dark' ? '1px solid #475569' : '1px solid #ffcc02'
            }}>
              <Typography variant="h6" fontWeight={600} sx={{ 
                color: themeMode === 'dark' ? '#60a5fa' : '#1976d2',
                mb: 2
              }}>
                Detalles del Evento
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField 
                  fullWidth 
                  label="Título del Evento" 
                  value={newEvent.title} 
                  onChange={(e) => setNewEvent((prev: any) => ({ ...prev, title: e.target.value }))} 
                  placeholder="Ej: Entrevista - Desarrollo de Aplicación Móvil"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: themeMode === 'dark' ? '#475569' : '#ffffff',
                      color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                      '& fieldset': {
                        borderColor: themeMode === 'dark' ? '#64748b' : '#d1d5db',
                      },
                      '&:hover fieldset': {
                        borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: themeMode === 'dark' ? '#cbd5e1' : '#64748b',
                      '&.Mui-focused': {
                        color: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                      },
                    },
                  }}
                />
                <TextField 
                  fullWidth 
                  multiline 
                  rows={3} 
                  label="Descripción" 
                  value={newEvent.description} 
                  onChange={(e) => setNewEvent((prev: any) => ({ ...prev, description: e.target.value }))} 
                  placeholder="Ej: Reunión para discutir los detalles del proyecto, revisar el cronograma y establecer los próximos pasos de desarrollo."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: themeMode === 'dark' ? '#475569' : '#ffffff',
                      color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                      '& fieldset': {
                        borderColor: themeMode === 'dark' ? '#64748b' : '#d1d5db',
                      },
                      '&:hover fieldset': {
                        borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: themeMode === 'dark' ? '#cbd5e1' : '#64748b',
                      '&.Mui-focused': {
                        color: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                      },
                    },
                  }}
                />
              <TextField 
                fullWidth 
                type="datetime-local" 
                label="Fecha y hora de inicio" 
                value={newEvent.start_date} 
                onChange={(e) => {
                  const selectedDate = new Date(e.target.value);
                  const hour = selectedDate.getHours();
                  
                  // Validar que la hora esté entre 8:00 AM y 19:00 PM
                  if (hour < 8 || hour >= 19) {
                    alert('Los eventos solo pueden programarse entre las 8:00 AM y las 19:00 PM (7:00 PM)');
                    return;
                  }
                  
                  setNewEvent((prev: any) => ({ ...prev, start_date: e.target.value }));
                }} 
                InputLabelProps={{ shrink: true }} 
                helperText="Solo se permiten eventos entre las 8:00 AM y las 19:00 PM"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: themeMode === 'dark' ? '#475569' : '#ffffff',
                      color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                      '& fieldset': {
                        borderColor: themeMode === 'dark' ? '#64748b' : '#d1d5db',
                      },
                      '&:hover fieldset': {
                        borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: themeMode === 'dark' ? '#cbd5e1' : '#64748b',
                      '&.Mui-focused': {
                        color: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                      },
                    },
                    '& .MuiFormHelperText-root': {
                      color: themeMode === 'dark' ? '#94a3b8' : '#64748b',
                    },
                  }}
              />
              
              {/* Alerta informativa sobre la duración */}
              <Alert 
                severity="info" 
                sx={{ 
                  mt: 2, 
                  borderRadius: 2,
                    background: themeMode === 'dark' 
                      ? 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)' 
                      : 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                    border: themeMode === 'dark' ? '1px solid #3b82f6' : '1px solid #2196f3',
                  '& .MuiAlert-icon': {
                      color: themeMode === 'dark' ? '#60a5fa' : '#1976d2'
                  }
                }}
                icon={<ScheduleIcon />}
              >
                <Box>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ 
                      color: themeMode === 'dark' ? '#60a5fa' : '#1976d2', 
                      mb: 0.5 
                    }}>
                    ⏰ Duración automática
                  </Typography>
                    <Typography variant="body2" sx={{ 
                      color: themeMode === 'dark' ? '#cbd5e1' : '#1565c0' 
                    }}>
                    La reunión durará exactamente <strong>1 hora</strong> desde la hora seleccionada. 
                    Por ejemplo: si seleccionas las 9:00 AM, la reunión terminará a las 10:00 AM.
                  </Typography>
                </Box>
              </Alert>
            </Box>
            </Box>

            {/* Tipo de Reunión */}
            <Box sx={{ 
              p: 2, 
              bgcolor: themeMode === 'dark' ? '#334155' : '#e8f5e8', 
              borderRadius: 2, 
              border: themeMode === 'dark' ? '1px solid #475569' : '1px solid #4caf50'
            }}>
              <Typography variant="h6" fontWeight={600} sx={{ 
                color: themeMode === 'dark' ? '#60a5fa' : '#1976d2',
                mb: 2
              }}>
                Tipo de Reunión
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel sx={{ 
                    color: themeMode === 'dark' ? '#cbd5e1' : '#64748b',
                    '&.Mui-focused': {
                      color: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                  }}>
                    Tipo de Reunión
                  </InputLabel>
                  <Select 
                    value={newEvent.meeting_type} 
                    label="Tipo de Reunión" 
                    onChange={(e) => {
                      const meetingType = e.target.value;
                      console.log('Tipo de reunión seleccionado:', meetingType);
                      setNewEvent((prev: any) => ({ 
                        ...prev, 
                        meeting_type: meetingType,
                        location: meetingType === 'online' ? 'Videollamada' : 'Sede',
                        meeting_room: '' // Reset sala cuando cambia el tipo
                      }));
                    }}
                    sx={{
                      bgcolor: themeMode === 'dark' ? '#475569' : '#ffffff',
                      color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: themeMode === 'dark' ? '#64748b' : '#d1d5db',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                      },
                    }}
                  >
                    <MenuItem value="online" sx={{
                      bgcolor: themeMode === 'dark' ? '#475569' : '#ffffff',
                      color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                      '&:hover': {
                        bgcolor: themeMode === 'dark' ? '#64748b' : '#f1f5f9',
                      },
                    }}>
                      Online (Videollamada)
                    </MenuItem>
                    <MenuItem value="cowork" sx={{
                      bgcolor: themeMode === 'dark' ? '#475569' : '#ffffff',
                      color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                      '&:hover': {
                        bgcolor: themeMode === 'dark' ? '#64748b' : '#f1f5f9',
                      },
                    }}>
                      En Sede - Cowork
                    </MenuItem>
                    <MenuItem value="fablab" sx={{
                      bgcolor: themeMode === 'dark' ? '#475569' : '#ffffff',
                      color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                      '&:hover': {
                        bgcolor: themeMode === 'dark' ? '#64748b' : '#f1f5f9',
                      },
                    }}>
                      En Sede - FabLab
                    </MenuItem>
                  </Select>
                </FormControl>

                {/* Campos condicionales según el tipo de reunión */}
                {newEvent.meeting_type === 'online' ? (
            <TextField 
              fullWidth 
                    label="Link de la Videollamada" 
                    value={newEvent.meeting_link} 
                    onChange={(e) => setNewEvent((prev: any) => ({ ...prev, meeting_link: e.target.value }))} 
                    placeholder="Ej: https://meet.google.com/abc-defg-hij"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: themeMode === 'dark' ? '#475569' : '#ffffff',
                        color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                        '& fieldset': {
                          borderColor: themeMode === 'dark' ? '#64748b' : '#d1d5db',
                        },
                        '&:hover fieldset': {
                          borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: themeMode === 'dark' ? '#cbd5e1' : '#64748b',
                        '&.Mui-focused': {
                          color: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                        },
                      },
                    }}
                  />
                ) : (newEvent.meeting_type === 'cowork' || newEvent.meeting_type === 'fablab') ? (
                  <Box>
                    <Typography variant="body2" sx={{ 
                      color: themeMode === 'dark' ? '#cbd5e1' : '#64748b',
                      mb: 1 
                    }}>
                      Selecciona una sala:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {newEvent.meeting_type === 'cowork' && (
                        <>
                          <Button
                            variant={newEvent.meeting_room === 'cowork-sala1' ? 'contained' : 'outlined'}
                            size="small"
                            onClick={() => {
                              console.log('Sala seleccionada: cowork-sala1');
                              setNewEvent((prev: any) => ({ ...prev, meeting_room: 'cowork-sala1' }));
                            }}
                            sx={{
                              bgcolor: newEvent.meeting_room === 'cowork-sala1' 
                                ? (themeMode === 'dark' ? '#60a5fa' : '#1976d2')
                                : 'transparent',
                              color: newEvent.meeting_room === 'cowork-sala1' 
                                ? 'white' 
                                : (themeMode === 'dark' ? '#f1f5f9' : '#1e293b'),
                              borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
                              '&:hover': {
                                bgcolor: newEvent.meeting_room === 'cowork-sala1'
                                  ? (themeMode === 'dark' ? '#3b82f6' : '#1565c0')
                                  : (themeMode === 'dark' ? '#475569' : '#f1f5f9'),
                              }
                            }}
                          >
                            Sala 1 - Cowork
                          </Button>
                          <Button
                            variant={newEvent.meeting_room === 'cowork-sala2' ? 'contained' : 'outlined'}
                            size="small"
                            onClick={() => {
                              console.log('Sala seleccionada: cowork-sala2');
                              setNewEvent((prev: any) => ({ ...prev, meeting_room: 'cowork-sala2' }));
                            }}
                            sx={{
                              bgcolor: newEvent.meeting_room === 'cowork-sala2' 
                                ? (themeMode === 'dark' ? '#60a5fa' : '#1976d2')
                                : 'transparent',
                              color: newEvent.meeting_room === 'cowork-sala2' 
                                ? 'white' 
                                : (themeMode === 'dark' ? '#f1f5f9' : '#1e293b'),
                              borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
                              '&:hover': {
                                bgcolor: newEvent.meeting_room === 'cowork-sala2'
                                  ? (themeMode === 'dark' ? '#3b82f6' : '#1565c0')
                                  : (themeMode === 'dark' ? '#475569' : '#f1f5f9'),
                              }
                            }}
                          >
                            Sala 2 - Cowork
                          </Button>
                          <Button
                            variant={newEvent.meeting_room === 'cowork-sala3' ? 'contained' : 'outlined'}
                            size="small"
                            onClick={() => {
                              console.log('Sala seleccionada: cowork-sala3');
                              setNewEvent((prev: any) => ({ ...prev, meeting_room: 'cowork-sala3' }));
                            }}
                            sx={{
                              bgcolor: newEvent.meeting_room === 'cowork-sala3' 
                                ? (themeMode === 'dark' ? '#60a5fa' : '#1976d2')
                                : 'transparent',
                              color: newEvent.meeting_room === 'cowork-sala3' 
                                ? 'white' 
                                : (themeMode === 'dark' ? '#f1f5f9' : '#1e293b'),
                              borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
                              '&:hover': {
                                bgcolor: newEvent.meeting_room === 'cowork-sala3'
                                  ? (themeMode === 'dark' ? '#3b82f6' : '#1565c0')
                                  : (themeMode === 'dark' ? '#475569' : '#f1f5f9'),
                              }
                            }}
                          >
                            Sala 3 - Cowork
                          </Button>
                        </>
                      )}
                      {newEvent.meeting_type === 'fablab' && (
                        <>
                          <Button
                            variant={newEvent.meeting_room === 'fablab-sala1' ? 'contained' : 'outlined'}
                            size="small"
                            onClick={() => {
                              console.log('Sala seleccionada: fablab-sala1');
                              setNewEvent((prev: any) => ({ ...prev, meeting_room: 'fablab-sala1' }));
                            }}
                            sx={{
                              bgcolor: newEvent.meeting_room === 'fablab-sala1' 
                                ? (themeMode === 'dark' ? '#60a5fa' : '#1976d2')
                                : 'transparent',
                              color: newEvent.meeting_room === 'fablab-sala1' 
                                ? 'white' 
                                : (themeMode === 'dark' ? '#f1f5f9' : '#1e293b'),
                              borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
                              '&:hover': {
                                bgcolor: newEvent.meeting_room === 'fablab-sala1'
                                  ? (themeMode === 'dark' ? '#3b82f6' : '#1565c0')
                                  : (themeMode === 'dark' ? '#475569' : '#f1f5f9'),
                              }
                            }}
                          >
                            Sala 1 - FabLab
                          </Button>
                          <Button
                            variant={newEvent.meeting_room === 'fablab-sala2' ? 'contained' : 'outlined'}
                            size="small"
                            onClick={() => {
                              console.log('Sala seleccionada: fablab-sala2');
                              setNewEvent((prev: any) => ({ ...prev, meeting_room: 'fablab-sala2' }));
                            }}
                            sx={{
                              bgcolor: newEvent.meeting_room === 'fablab-sala2' 
                                ? (themeMode === 'dark' ? '#60a5fa' : '#1976d2')
                                : 'transparent',
                              color: newEvent.meeting_room === 'fablab-sala2' 
                                ? 'white' 
                                : (themeMode === 'dark' ? '#f1f5f9' : '#1e293b'),
                              borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
                              '&:hover': {
                                bgcolor: newEvent.meeting_room === 'fablab-sala2'
                                  ? (themeMode === 'dark' ? '#3b82f6' : '#1565c0')
                                  : (themeMode === 'dark' ? '#475569' : '#f1f5f9'),
                              }
                            }}
                          >
                            Sala 2 - FabLab
                          </Button>
                          <Button
                            variant={newEvent.meeting_room === 'fablab-sala3' ? 'contained' : 'outlined'}
                            size="small"
                            onClick={() => {
                              console.log('Sala seleccionada: fablab-sala3');
                              setNewEvent((prev: any) => ({ ...prev, meeting_room: 'fablab-sala3' }));
                            }}
                            sx={{
                              bgcolor: newEvent.meeting_room === 'fablab-sala3' 
                                ? (themeMode === 'dark' ? '#60a5fa' : '#1976d2')
                                : 'transparent',
                              color: newEvent.meeting_room === 'fablab-sala3' 
                                ? 'white' 
                                : (themeMode === 'dark' ? '#f1f5f9' : '#1e293b'),
                              borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
                              '&:hover': {
                                bgcolor: newEvent.meeting_room === 'fablab-sala3'
                                  ? (themeMode === 'dark' ? '#3b82f6' : '#1565c0')
                                  : (themeMode === 'dark' ? '#475569' : '#f1f5f9'),
                              }
                            }}
                          >
                            Sala 3 - FabLab
                          </Button>
                        </>
                      )}
                    </Box>
                    {newEvent.meeting_room && (
                      <Typography variant="caption" sx={{ 
                        color: themeMode === 'dark' ? '#10b981' : '#2e7d32',
                        mt: 1, 
                        display: 'block' 
                      }}>
                        ✅ Sala seleccionada: {newEvent.meeting_room}
                      </Typography>
                    )}
                  </Box>
                ) : null}
              </Box>
            </Box>

            {/* Configuración Adicional */}
            <Box sx={{ 
              p: 2, 
              bgcolor: themeMode === 'dark' ? '#334155' : '#f3e5f5', 
              borderRadius: 2, 
              border: themeMode === 'dark' ? '1px solid #475569' : '1px solid #9c27b0'
            }}>
              <Typography variant="h6" fontWeight={600} sx={{ 
                color: themeMode === 'dark' ? '#60a5fa' : '#1976d2',
                mb: 2
              }}>
                Configuración Adicional
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <FormControl fullWidth>
                  <InputLabel sx={{ 
                    color: themeMode === 'dark' ? '#cbd5e1' : '#64748b',
                    '&.Mui-focused': {
                      color: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                  }}>
                    Tipo de Evento
                  </InputLabel>
              <Select 
                value={newEvent.event_type} 
                label="Tipo de Evento" 
                onChange={(e) => setNewEvent((prev: any) => ({ ...prev, event_type: e.target.value }))}
                    sx={{
                      bgcolor: themeMode === 'dark' ? '#475569' : '#ffffff',
                      color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: themeMode === 'dark' ? '#64748b' : '#d1d5db',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                      },
                    }}
                  >
                    <MenuItem value="interview" sx={{
                      bgcolor: themeMode === 'dark' ? '#475569' : '#ffffff',
                      color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                      '&:hover': {
                        bgcolor: themeMode === 'dark' ? '#64748b' : '#f1f5f9',
                      },
                    }}>
                      Entrevista
                    </MenuItem>
                    <MenuItem value="meeting" sx={{
                      bgcolor: themeMode === 'dark' ? '#475569' : '#ffffff',
                      color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                      '&:hover': {
                        bgcolor: themeMode === 'dark' ? '#64748b' : '#f1f5f9',
                      },
                    }}>
                      Reunión de Proyecto
                    </MenuItem>
                    <MenuItem value="other" sx={{
                      bgcolor: themeMode === 'dark' ? '#475569' : '#ffffff',
                      color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                      '&:hover': {
                        bgcolor: themeMode === 'dark' ? '#64748b' : '#f1f5f9',
                      },
                    }}>
                      Otro
                    </MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
                  <InputLabel sx={{ 
                    color: themeMode === 'dark' ? '#cbd5e1' : '#64748b',
                    '&.Mui-focused': {
                      color: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                    },
                  }}>
                    Prioridad
                  </InputLabel>
              <Select 
                value={newEvent.priority} 
                label="Prioridad" 
                onChange={(e) => setNewEvent((prev: any) => ({ ...prev, priority: e.target.value }))}
                    sx={{
                      bgcolor: themeMode === 'dark' ? '#475569' : '#ffffff',
                      color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: themeMode === 'dark' ? '#64748b' : '#d1d5db',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                      },
                    }}
                  >
                    <MenuItem value="low" sx={{
                      bgcolor: themeMode === 'dark' ? '#475569' : '#ffffff',
                      color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                      '&:hover': {
                        bgcolor: themeMode === 'dark' ? '#64748b' : '#f1f5f9',
                      },
                    }}>
                      Baja
                    </MenuItem>
                    <MenuItem value="normal" sx={{
                      bgcolor: themeMode === 'dark' ? '#475569' : '#ffffff',
                      color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                      '&:hover': {
                        bgcolor: themeMode === 'dark' ? '#64748b' : '#f1f5f9',
                      },
                    }}>
                      Normal
                    </MenuItem>
                    <MenuItem value="medium" sx={{
                      bgcolor: themeMode === 'dark' ? '#475569' : '#ffffff',
                      color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                      '&:hover': {
                        bgcolor: themeMode === 'dark' ? '#64748b' : '#f1f5f9',
                      },
                    }}>
                      Media
                    </MenuItem>
                    <MenuItem value="high" sx={{
                      bgcolor: themeMode === 'dark' ? '#475569' : '#ffffff',
                      color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                      '&:hover': {
                        bgcolor: themeMode === 'dark' ? '#64748b' : '#f1f5f9',
                      },
                    }}>
                      Alta
                    </MenuItem>
                    <MenuItem value="urgent" sx={{
                      bgcolor: themeMode === 'dark' ? '#475569' : '#ffffff',
                      color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
                      '&:hover': {
                        bgcolor: themeMode === 'dark' ? '#64748b' : '#f1f5f9',
                      },
                    }}>
                      Urgente
                    </MenuItem>
              </Select>
            </FormControl>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          p: 3, 
          bgcolor: themeMode === 'dark' ? '#334155' : '#f5f5f5',
          borderTop: themeMode === 'dark' ? '1px solid #475569' : '1px solid #e0e0e0'
        }}>
          <Button 
            onClick={() => setShowAddDialog(false)} 
            variant="outlined"
            sx={{ 
              borderRadius: 2, 
              px: 3,
              color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
              borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
              '&:hover': {
                borderColor: themeMode === 'dark' ? '#60a5fa' : '#3b82f6',
                backgroundColor: themeMode === 'dark' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(59, 130, 246, 0.1)'
              }
            }}
          >
            Cancelar
          </Button>
          
          {/* Botón de debug temporal */}
          <Button 
            onClick={() => {
              console.log('🔍 DEBUG - Estado actual:');
              console.log('🔍 users:', users);
              console.log('🔍 companyProjects:', companyProjects);
              console.log('🔍 selectedProject:', selectedProject);
              console.log('🔍 newEvent:', newEvent);
              
              if (selectedProject) {
                const filteredUsers = users.filter((u: any) => String(u.project) === selectedProject);
                console.log('🔍 Usuarios filtrados para proyecto:', selectedProject, ':', filteredUsers);
                
                // Mostrar información detallada de cada usuario filtrado
                filteredUsers.forEach((user: any, index: number) => {
                  console.log(`🔍 Usuario ${index}:`, {
                    id: user.id,
                    project: user.project,
                    student: user.student,
                    studentId: user.student?.id,
                    studentUserId: user.student?.user,
                    studentName: user.student?.name,
                    status: user.status
                  });
                });
              }
              
              // Verificar la estructura de datos
              console.log('🔍 Estructura de datos:');
              console.log('  - users.length:', users.length);
              console.log('  - companyProjects.length:', companyProjects.length);
              console.log('  - selectedProject:', selectedProject);
              console.log('  - newEvent.attendees:', newEvent.attendees);
              console.log('  - newEvent.attendees type:', typeof newEvent.attendees);
              console.log('  - newEvent.attendees isArray:', Array.isArray(newEvent.attendees));
            }} 
            variant="outlined"
            color="warning"
            sx={{ 
              borderRadius: 2, 
              px: 2,
              fontSize: '0.75rem'
            }}
          >
            Debug
          </Button>
          
          <Button 
            onClick={handleAddEvent} 
            variant="contained"
            sx={{ 
              borderRadius: 2, 
              px: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
              }
            }}
          >
            Programar Evento
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Modal de detalle de evento mejorado */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
            color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
            borderRadius: 3,
            boxShadow: themeMode === 'dark' 
              ? '0 20px 40px rgba(0,0,0,0.5)' 
              : '0 20px 40px rgba(0,0,0,0.15)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontWeight: 600,
          borderRadius: '12px 12px 0 0'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {selectedEvent && getEventIcon(selectedEvent.event_type)}
            <Typography variant="h6">Detalles del Evento</Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ 
          mt: 2,
          bgcolor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
          color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b'
        }}>
          {selectedEvent && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Header del evento */}
              <Box sx={{ 
                p: 2, 
                bgcolor: themeMode === 'dark' ? '#334155' : '#f8f9fa', 
                borderRadius: 2, 
                border: themeMode === 'dark' ? '1px solid #475569' : '1px solid #e0e0e0'
              }}>
                <Typography variant="h5" gutterBottom sx={{ 
                  color: themeMode === 'dark' ? '#60a5fa' : '#1976d2',
                  fontWeight: 600
                }}>
                  {selectedEvent.title}
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: themeMode === 'dark' ? '#cbd5e1' : '#64748b'
                }}>
                  {selectedEvent.description || 'Sin descripción'}
                </Typography>
              </Box>

              {/* Información del representante */}
              {(selectedEvent.representative_name || selectedEvent.representative_position) && (
                <Box sx={{ 
                  p: 2, 
                  bgcolor: themeMode === 'dark' ? '#334155' : '#e3f2fd', 
                  borderRadius: 2, 
                  border: themeMode === 'dark' ? '1px solid #475569' : '1px solid #bbdefb'
                }}>
                  <Typography variant="h6" fontWeight={600} sx={{ 
                    color: themeMode === 'dark' ? '#60a5fa' : '#1976d2',
                    mb: 2
                  }}>
                    Representante de la Empresa
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  <Box>
                      <Typography variant="body2" sx={{ 
                        color: themeMode === 'dark' ? '#cbd5e1' : '#64748b'
                      }}>
                        Nombre:
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {selectedEvent.representative_name || 'No especificado'}
                  </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ 
                        color: themeMode === 'dark' ? '#cbd5e1' : '#64748b'
                      }}>
                        Cargo:
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {selectedEvent.representative_position || 'No especificado'}
                  </Typography>
                    </Box>
                  </Box>
                </Box>
              )}

              {/* Detalles de la reunión */}
              <Box sx={{ 
                p: 2, 
                bgcolor: themeMode === 'dark' ? '#334155' : '#fff3e0', 
                borderRadius: 2, 
                border: themeMode === 'dark' ? '1px solid #475569' : '1px solid #ffcc02'
              }}>
                <Typography variant="h6" fontWeight={600} sx={{ 
                  color: themeMode === 'dark' ? '#60a5fa' : '#1976d2',
                  mb: 2
                }}>
                  Detalles de la Reunión
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  <Box>
                    <Typography variant="body2" sx={{ 
                      color: themeMode === 'dark' ? '#cbd5e1' : '#64748b'
                    }}>
                      Tipo de Evento:
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {selectedEvent.event_type === 'interview' ? 'Entrevista' : 
                       selectedEvent.event_type === 'meeting' ? 'Reunión de Proyecto' : 
                       selectedEvent.event_type}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ 
                      color: themeMode === 'dark' ? '#cbd5e1' : '#64748b'
                    }}>
                      Tipo de Reunión:
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {selectedEvent.meeting_type === 'online' ? 'Online (Videollamada)' : 
                       selectedEvent.meeting_type === 'onsite' ? 'En Sede' : 
                       selectedEvent.meeting_type || 'No especificado'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ 
                      color: themeMode === 'dark' ? '#cbd5e1' : '#64748b'
                    }}>
                      Fecha:
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {selectedEvent.start_date ? format(new Date(selectedEvent.start_date), 'EEEE, d MMMM yyyy', { locale: es }) : '-'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ 
                      color: themeMode === 'dark' ? '#cbd5e1' : '#64748b'
                    }}>
                      Hora:
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {selectedEvent.start_date && selectedEvent.end_date ? 
                      `${format(new Date(selectedEvent.start_date), 'HH:mm')} - ${format(new Date(selectedEvent.end_date), 'HH:mm')}` : '-'}
                  </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Ubicación específica */}
              <Box sx={{ 
                p: 2, 
                bgcolor: themeMode === 'dark' ? '#334155' : '#e3f2fd', 
                borderRadius: 2, 
                border: themeMode === 'dark' ? '1px solid #475569' : '1px solid #bbdefb'
              }}>
                <Typography variant="h6" fontWeight={600} sx={{ 
                  color: themeMode === 'dark' ? '#60a5fa' : '#1976d2',
                  mb: 2
                }}>
                  Ubicación
                  </Typography>
                {selectedEvent.meeting_type === 'online' ? (
                  <Box>
                    <Typography variant="body2" sx={{ 
                      color: themeMode === 'dark' ? '#cbd5e1' : '#64748b'
                    }}>
                      Link de Videollamada:
                    </Typography>
                    <Typography variant="body1" fontWeight={600} sx={{ wordBreak: 'break-all' }}>
                      {selectedEvent.meeting_link ? (
                        <a 
                          href={selectedEvent.meeting_link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          style={{ 
                            color: themeMode === 'dark' ? '#60a5fa' : '#1976d2', 
                            textDecoration: 'underline' 
                          }}
                        >
                          {selectedEvent.meeting_link}
                        </a>
                      ) : 'No especificado'}
                  </Typography>
                  </Box>
                ) : (selectedEvent.meeting_type === 'cowork' || selectedEvent.meeting_type === 'fablab') ? (
                  <Box>
                    <Typography variant="body2" sx={{ 
                      color: themeMode === 'dark' ? '#cbd5e1' : '#64748b'
                    }}>
                      Ubicación:
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {selectedEvent.meeting_type === 'cowork' ? 'Cowork' : 'FabLab'}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: themeMode === 'dark' ? '#cbd5e1' : '#64748b', 
                      mt: 1 
                    }}>
                      Sala:
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {selectedEvent.meeting_room || 'No especificado'}
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="body2" sx={{ 
                      color: themeMode === 'dark' ? '#cbd5e1' : '#64748b'
                    }}>
                      Ubicación:
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {selectedEvent.location || 'No especificado'}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Participantes */}
              <Box sx={{ 
                p: 2, 
                bgcolor: themeMode === 'dark' ? '#334155' : '#f3e5f5', 
                borderRadius: 2, 
                border: themeMode === 'dark' ? '1px solid #475569' : '1px solid #9c27b0'
              }}>
                <Typography variant="h6" fontWeight={600} sx={{ 
                  color: themeMode === 'dark' ? '#60a5fa' : '#1976d2',
                  mb: 2
                }}>
                  Participantes
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedEvent.attendees && selectedEvent.attendees.length > 0 ? (
                    selectedEvent.attendees.map((attendee: any, index: number) => (
                      <Box key={index} sx={{ 
                        p: 1, 
                        bgcolor: themeMode === 'dark' ? '#475569' : 'white', 
                        borderRadius: 1, 
                        border: themeMode === 'dark' ? '1px solid #64748b' : '1px solid #e0e0e0',
                        minWidth: 200
                      }}>
                        <Typography variant="body2" fontWeight={600}>
                          {typeof attendee === 'object' ? attendee.full_name || attendee.email || attendee.id : String(attendee)}
                        </Typography>
                        <Typography variant="caption" sx={{ 
                          color: themeMode === 'dark' ? '#94a3b8' : '#64748b'
                        }}>
                          Participante
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" sx={{ 
                      color: themeMode === 'dark' ? '#cbd5e1' : '#64748b'
                    }}>
                      No hay participantes registrados
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Información del proyecto */}
              {selectedEvent.project_title && (
                <Box sx={{ 
                  p: 2, 
                  bgcolor: themeMode === 'dark' ? '#334155' : '#e8f5e8', 
                  borderRadius: 2, 
                  border: themeMode === 'dark' ? '1px solid #475569' : '1px solid #4caf50'
                }}>
                  <Typography variant="h6" fontWeight={600} sx={{ 
                    color: themeMode === 'dark' ? '#60a5fa' : '#1976d2',
                    mb: 2
                  }}>
                    Proyecto
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {selectedEvent.project_title}
                  </Typography>
                </Box>
              )}

              {/* Información adicional */}
              <Box sx={{ 
                p: 2, 
                bgcolor: themeMode === 'dark' ? '#334155' : '#fafafa', 
                borderRadius: 2, 
                border: themeMode === 'dark' ? '1px solid #475569' : '1px solid #e0e0e0'
              }}>
                <Typography variant="h6" fontWeight={600} sx={{ 
                  color: themeMode === 'dark' ? '#60a5fa' : '#1976d2',
                  mb: 2
                }}>
                  Información Adicional
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  <Box>
                    <Typography variant="body2" sx={{ 
                      color: themeMode === 'dark' ? '#cbd5e1' : '#64748b'
                    }}>
                      Prioridad:
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {selectedEvent.priority === 'low' ? 'Baja' : 
                       selectedEvent.priority === 'normal' ? 'Normal' : 
                       selectedEvent.priority === 'medium' ? 'Media' : 
                       selectedEvent.priority === 'high' ? 'Alta' : 
                       selectedEvent.priority === 'urgent' ? 'Urgente' : 
                       selectedEvent.priority}
                  </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ 
                      color: themeMode === 'dark' ? '#cbd5e1' : '#64748b'
                    }}>
                      Creado por:
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {selectedEvent.created_by || 'No especificado'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
                  </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          p: 3, 
          bgcolor: themeMode === 'dark' ? '#334155' : '#f5f5f5',
          borderTop: themeMode === 'dark' ? '1px solid #475569' : '1px solid #e0e0e0'
        }}>
          <Button 
            onClick={() => setDialogOpen(false)} 
            variant="contained"
            sx={{ 
              borderRadius: 2, 
              px: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              }
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
});

export default CompanyCalendar; 