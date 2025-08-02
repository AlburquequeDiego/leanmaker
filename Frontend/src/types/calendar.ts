// Tipos específicos para el calendario
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  event_type: 'meeting' | 'deadline' | 'reminder' | 'interview' | 'other' | string;
  priority: 'low' | 'normal' | 'medium' | 'high' | 'urgent';
  start_date: string;
  end_date: string;
  start: Date;
  end: Date;
  all_day: boolean;
  location?: string;
  room?: string;
  attendees: string[];
  attendee_names?: string[]; // Nombres de los participantes para mostrar
  created_by: string;
  created_at: string;
  updated_at: string;
  project?: string;
  project_title?: string;
  status?: string;
  // Campos adicionales para reuniones/entrevistas
  meeting_type?: 'online' | 'onsite';
  meeting_link?: string;
  meeting_room?: string;
  duration?: string;
  representative_name?: string;
  representative_position?: string;
} 