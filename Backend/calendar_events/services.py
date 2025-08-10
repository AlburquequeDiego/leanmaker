from django.db import transaction
from django.utils import timezone
from .models import CalendarEvent, EventAttendance
from notifications.models import Notification
from users.models import User
import logging

logger = logging.getLogger(__name__)

class EventAttendanceService:
    """Servicio para manejar confirmaciones de asistencia a eventos"""
    
    @staticmethod
    def create_attendance_record(event, user):
        """Crea un registro de asistencia para un usuario en un evento"""
        try:
            attendance, created = EventAttendance.objects.get_or_create(
                event=event,
                user=user,
                defaults={'status': 'pending'}
            )
            return attendance, created
        except Exception as e:
            logger.error(f"Error al crear registro de asistencia: {str(e)}")
            return None, False
    
    @staticmethod
    def confirm_attendance(event_id, user_id, notes=None):
        """Confirma la asistencia de un usuario a un evento"""
        try:
            with transaction.atomic():
                attendance = EventAttendance.objects.get(
                    event_id=event_id,
                    user_id=user_id
                )
                attendance.confirm_attendance(notes)
                
                # Crear notificación de confirmación
                EventAttendanceService._create_confirmation_notification(attendance)
                
                return attendance
        except EventAttendance.DoesNotExist:
            logger.error(f"Registro de asistencia no encontrado para evento {event_id} y usuario {user_id}")
            return None
        except Exception as e:
            logger.error(f"Error al confirmar asistencia: {str(e)}")
            return None
    
    @staticmethod
    def decline_attendance(event_id, user_id, notes=None):
        """Declina la asistencia de un usuario a un evento"""
        try:
            with transaction.atomic():
                attendance = EventAttendance.objects.get(
                    event_id=event_id,
                    user_id=user_id
                )
                attendance.decline_attendance(notes)
                
                # Crear notificación de declinación
                EventAttendanceService._create_declination_notification(attendance)
                
                return attendance
        except EventAttendance.DoesNotExist:
            logger.error(f"Registro de asistencia no encontrado para evento {event_id} y usuario {user_id}")
            return None
        except Exception as e:
            logger.error(f"Error al declinar asistencia: {str(e)}")
            return None
    
    @staticmethod
    def maybe_attendance(event_id, user_id, notes=None):
        """Marca como posible asistencia de un usuario a un evento"""
        try:
            with transaction.atomic():
                attendance = EventAttendance.objects.get(
                    event_id=event_id,
                    user_id=user_id
                )
                attendance.maybe_attendance(notes)
                
                # Crear notificación de posible asistencia
                EventAttendanceService._create_maybe_notification(attendance)
                
                return attendance
        except EventAttendance.DoesNotExist:
            logger.error(f"Registro de asistencia no encontrado para evento {event_id} y usuario {user_id}")
            return None
        except Exception as e:
            logger.error(f"Error al marcar posible asistencia: {str(e)}")
            return None
    
    @staticmethod
    def get_event_attendance_stats(event_id):
        """Obtiene estadísticas de asistencia para un evento"""
        try:
            attendance_records = EventAttendance.objects.filter(event_id=event_id)
            
            stats = {
                'total_invited': attendance_records.count(),
                'confirmed': attendance_records.filter(status='confirmed').count(),
                'declined': attendance_records.filter(status='declined').count(),
                'maybe': attendance_records.filter(status='maybe').count(),
                'pending': attendance_records.filter(status='pending').count(),
                'no_response': attendance_records.filter(status='no_response').count(),
            }
            
            # Calcular porcentajes
            total = stats['total_invited']
            if total > 0:
                stats['confirmed_percentage'] = round((stats['confirmed'] / total) * 100, 1)
                stats['declined_percentage'] = round((stats['declined'] / total) * 100, 1)
                stats['maybe_percentage'] = round((stats['maybe'] / total) * 100, 1)
                stats['pending_percentage'] = round((stats['pending'] / total) * 100, 1)
            else:
                stats['confirmed_percentage'] = 0
                stats['declined_percentage'] = 0
                stats['maybe_percentage'] = 0
                stats['pending_percentage'] = 0
            
            return stats
        except Exception as e:
            logger.error(f"Error al obtener estadísticas de asistencia: {str(e)}")
            return None
    
    @staticmethod
    def get_user_attendance_status(event_id, user_id):
        """Obtiene el estado de asistencia de un usuario para un evento específico"""
        try:
            attendance = EventAttendance.objects.get(
                event_id=event_id,
                user_id=user_id
            )
            return {
                'status': attendance.status,
                'response_date': attendance.response_date,
                'notes': attendance.notes,
                'has_responded': attendance.has_responded
            }
        except EventAttendance.DoesNotExist:
            return {'status': 'not_invited', 'has_responded': False}
        except Exception as e:
            logger.error(f"Error al obtener estado de asistencia: {str(e)}")
            return None
    
    @staticmethod
    def _create_confirmation_notification(attendance):
        """Crea una notificación de confirmación de asistencia"""
        try:
            title = f"Asistencia confirmada: {attendance.event.title}"
            message = f"Has confirmado tu asistencia al evento '{attendance.event.title}' que se realizará el {attendance.event.start_date.strftime('%d/%m/%Y a las %H:%M')}."
            
            if attendance.event.location:
                message += f" Ubicación: {attendance.event.location}"
            
            Notification.objects.create(
                user=attendance.user,
                title=title,
                message=message,
                type='success',
                related_url=f"/dashboard/calendar"
            )
        except Exception as e:
            logger.error(f"Error al crear notificación de confirmación: {str(e)}")
    
    @staticmethod
    def _create_declination_notification(attendance):
        """Crea una notificación de declinación de asistencia"""
        try:
            title = f"Asistencia declinada: {attendance.event.title}"
            message = f"Has declinado tu asistencia al evento '{attendance.event.title}' que se realizará el {attendance.event.start_date.strftime('%d/%m/%Y a las %H:%M')}."
            
            if attendance.notes:
                message += f" Nota: {attendance.notes}"
            
            Notification.objects.create(
                user=attendance.user,
                title=title,
                message=message,
                type='info',
                related_url=f"/dashboard/calendar"
            )
        except Exception as e:
            logger.error(f"Error al crear notificación de declinación: {str(e)}")
    
    @staticmethod
    def _create_maybe_notification(attendance):
        """Crea una notificación de posible asistencia"""
        try:
            title = f"Posible asistencia: {attendance.event.title}"
            message = f"Has marcado como posible tu asistencia al evento '{attendance.event.title}' que se realizará el {attendance.event.start_date.strftime('%d/%m/%Y a las %H:%M')}."
            
            if attendance.notes:
                message += f" Nota: {attendance.notes}"
            
            Notification.objects.create(
                user=attendance.user,
                title=title,
                message=message,
                type='info',
                related_url=f"/dashboard/calendar"
            )
        except Exception as e:
            logger.error(f"Error al crear notificación de posible asistencia: {str(e)}")

class EventNotificationService:
    """Servicio para crear notificaciones de eventos con botones de confirmación"""
    
    @staticmethod
    def create_event_invitation_notification(event, user):
        """Crea una notificación de invitación a evento con botones de confirmación"""
        try:
            # Determinar el tipo de evento para el mensaje
            event_type_text = "evento"
            if event.event_type == 'meeting':
                event_type_text = "reunión"
            elif event.event_type == 'interview':
                event_type_text = "entrevista"
            elif event.event_type == 'deadline':
                event_type_text = "fecha límite"
            
            # Crear mensaje con información del evento
            title = f"Invitación a {event_type_text}: {event.title}"
            
            message = f"Has sido invitado al {event_type_text} '{event.title}' que se realizará el {event.event.start_date.strftime('%d/%m/%Y a las %H:%M')}."
            
            if event.location:
                message += f"\n📍 Ubicación: {event.location}"
            
            if event.meeting_room:
                message += f"\n🏢 Sala: {event.meeting_room}"
            
            if event.description:
                message += f"\n\n📝 Descripción: {event.description}"
            
            # Agregar advertencia para eventos en sede
            if event.meeting_type in ['cowork', 'fablab']:
                message += f"\n\n⚠️ Este es un evento presencial. Por favor confirma tu asistencia para organizar el espacio."
            
            # Crear la notificación
            notification = Notification.objects.create(
                user=user,
                title=title,
                message=message,
                type='info',
                priority='high' if event.meeting_type in ['cowork', 'fablab'] else 'normal',
                related_url=f"/dashboard/calendar"
            )
            
            # Crear registro de asistencia
            EventAttendanceService.create_attendance_record(event, user)
            
            return notification
            
        except Exception as e:
            logger.error(f"Error al crear notificación de invitación: {str(e)}")
            return None
    
    @staticmethod
    def create_event_reminder_notification(event, user):
        """Crea una notificación de recordatorio de evento"""
        try:
            title = f"Recordatorio: {event.title}"
            message = f"El {event.event_type} '{event.title}' se realizará mañana a las {event.start_date.strftime('%H:%M')}."
            
            if event.location:
                message += f"\n📍 Ubicación: {event.location}"
            
            if event.meeting_room:
                message += f"\n🏢 Sala: {event.meeting_room}"
            
            # Verificar si el usuario ya confirmó asistencia
            try:
                attendance = EventAttendance.objects.get(event=event, user=user)
                if attendance.is_confirmed:
                    message += "\n✅ Ya confirmaste tu asistencia."
                elif attendance.is_declined:
                    message += "\n❌ Declinaste tu asistencia."
                else:
                    message += "\n❓ Aún no has confirmado tu asistencia."
            except EventAttendance.DoesNotExist:
                message += "\n❓ Aún no has confirmado tu asistencia."
            
            return Notification.objects.create(
                user=user,
                title=title,
                message=message,
                type='warning',
                priority='medium',
                related_url=f"/dashboard/calendar"
            )
            
        except Exception as e:
            logger.error(f"Error al crear notificación de recordatorio: {str(e)}")
            return None
