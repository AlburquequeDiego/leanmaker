from django.db import transaction
from django.utils import timezone
from .models import Notification
from users.models import User
from projects.models import Proyecto, AplicacionProyecto, MiembroProyecto
from applications.models import Aplicacion
from work_hours.models import WorkHour
import logging

logger = logging.getLogger(__name__)

class NotificationService:
    """Servicio para manejar notificaciones automáticas del sistema"""
    
    @staticmethod
    def create_notification(user, title, message, notification_type='info', related_url=None):
        """Crea una notificación para un usuario específico"""
        try:
            notification = Notification.objects.create(
                user=user,
                title=title,
                message=message,
                type=notification_type,
                related_url=related_url,
                created_at=timezone.now()
            )
            logger.info(f"Notificación creada para {user.email}: {title}")
            return notification
        except Exception as e:
            logger.error(f"Error al crear notificación para {user.email}: {str(e)}")
            return None
    
    @staticmethod
    def notify_project_application(application):
        """Notifica cuando un estudiante postula a un proyecto"""
        try:
            student = application.student.user if hasattr(application, 'student') else application.estudiante
            project = application.project if hasattr(application, 'project') else application.proyecto
            
            title = "Postulación Enviada"
            message = f"Tu postulación al proyecto '{project.title}' ha sido enviada exitosamente. Te notificaremos cuando la empresa revise tu aplicación."
            related_url = f"/dashboard/student/applications"
            
            NotificationService.create_notification(
                user=student,
                title=title,
                message=message,
                notification_type='success',
                related_url=related_url
            )
            
            # También notificar a la empresa sobre la nueva postulación
            if project.company:
                company_user = project.company.user
                if company_user:
                    company_title = "Nueva Postulación Recibida"
                    company_message = f"Has recibido una nueva postulación para el proyecto '{project.title}' de {student.user.full_name}."
                    company_url = f"/dashboard/company/applications"
                    
                    NotificationService.create_notification(
                        user=company_user,
                        title=company_title,
                        message=company_message,
                        notification_type='info',
                        related_url=company_url
                    )
                    
        except Exception as e:
            logger.error(f"Error al notificar postulación: {str(e)}")
    
    @staticmethod
    def notify_application_accepted(application):
        """Notifica cuando una aplicación es aceptada"""
        try:
            student = application.student.user if hasattr(application, 'student') else application.estudiante
            project = application.project if hasattr(application, 'project') else application.proyecto
            
            title = "¡Aplicación Aceptada!"
            message = f"¡Felicitaciones! Tu aplicación al proyecto '{project.title}' ha sido aceptada. Ya puedes comenzar a trabajar en el proyecto."
            related_url = f"/dashboard/student/projects"
            
            NotificationService.create_notification(
                user=student,
                title=title,
                message=message,
                notification_type='success',
                related_url=related_url
            )
            
        except Exception as e:
            logger.error(f"Error al notificar aceptación: {str(e)}")
    
    @staticmethod
    def notify_application_rejected(application):
        """Notifica cuando una aplicación es rechazada"""
        try:
            student = application.student.user if hasattr(application, 'student') else application.estudiante
            project = application.project if hasattr(application, 'project') else application.proyecto
            
            title = "Aplicación Rechazada"
            message = f"Tu aplicación al proyecto '{project.title}' no fue seleccionada en esta ocasión. No te desanimes, sigue intentando con otros proyectos."
            related_url = f"/dashboard/student/applications"
            
            NotificationService.create_notification(
                user=student,
                title=title,
                message=message,
                notification_type='info',
                related_url=related_url
            )
            
        except Exception as e:
            logger.error(f"Error al notificar rechazo: {str(e)}")
    
    @staticmethod
    def notify_project_activated(project):
        """Notifica cuando un proyecto se activa a todos los estudiantes aceptados"""
        try:
            # Obtener todos los estudiantes aceptados en el proyecto
            accepted_applications = []
            
            # Buscar en ambos modelos de aplicación
            if hasattr(project, 'project_applications'):
                accepted_applications.extend(
                    project.project_applications.filter(estado='accepted')
                )
            
            if hasattr(project, 'application_project'):
                accepted_applications.extend(
                    project.application_project.filter(status='accepted')
                )
            
            # También buscar en miembros del proyecto
            project_members = MiembroProyecto.objects.filter(
                proyecto=project,
                rol='estudiante',
                esta_activo=True
            ).select_related('usuario')
            
            title = "Proyecto Activado"
            message = f"El proyecto '{project.title}' ha sido activado y está listo para comenzar. ¡Es hora de empezar a trabajar!"
            related_url = f"/dashboard/student/projects"
            
            # Notificar a estudiantes de aplicaciones aceptadas
            for app in accepted_applications:
                student = app.estudiante if hasattr(app, 'estudiante') else app.student.user
                NotificationService.create_notification(
                    user=student,
                    title=title,
                    message=message,
                    notification_type='success',
                    related_url=related_url
                )
            
            # Notificar a miembros activos del proyecto
            for member in project_members:
                NotificationService.create_notification(
                    user=member.usuario,
                    title=title,
                    message=message,
                    notification_type='success',
                    related_url=related_url
                )
                
        except Exception as e:
            logger.error(f"Error al notificar activación de proyecto: {str(e)}")
    
    @staticmethod
    def notify_project_completed(project):
        """Notifica cuando un proyecto se completa a todos los estudiantes"""
        try:
            # Obtener todos los estudiantes del proyecto
            project_members = MiembroProyecto.objects.filter(
                proyecto=project,
                rol='estudiante'
            ).select_related('usuario')
            
            title = "Proyecto Completado"
            message = f"¡Felicitaciones! El proyecto '{project.title}' ha sido marcado como completado. Gracias por tu participación."
            related_url = f"/dashboard/student/projects"
            
            for member in project_members:
                NotificationService.create_notification(
                    user=member.usuario,
                    title=title,
                    message=message,
                    notification_type='success',
                    related_url=related_url
                )
                
        except Exception as e:
            logger.error(f"Error al notificar finalización de proyecto: {str(e)}")
    
    @staticmethod
    def notify_hours_validation(work_hour, is_approved=True):
        """Notifica cuando las horas de trabajo son validadas"""
        try:
            student = work_hour.student.user
            project = work_hour.project
            
            if is_approved:
                title = "Horas Validadas"
                message = f"Tus {work_hour.hours_worked} horas del proyecto '{project.title}' han sido validadas y aprobadas."
                notification_type = 'success'
            else:
                title = "Horas Rechazadas"
                message = f"Tus {work_hour.hours_worked} horas del proyecto '{project.title}' han sido rechazadas. Revisa los comentarios del administrador."
                notification_type = 'warning'
            
            related_url = f"/dashboard/student/work-hours"
            
            NotificationService.create_notification(
                user=student,
                title=title,
                message=message,
                notification_type=notification_type,
                related_url=related_url
            )
            
        except Exception as e:
            logger.error(f"Error al notificar validación de horas: {str(e)}")
    
    @staticmethod
    def notify_project_hours_validation(project, validated_count):
        """Notifica cuando se validan las horas de finalización de un proyecto"""
        try:
            # Obtener todos los estudiantes del proyecto
            project_members = MiembroProyecto.objects.filter(
                proyecto=project,
                rol='estudiante'
            ).select_related('usuario')
            
            title = "Horas de Proyecto Validadas"
            message = f"Se han validado {validated_count} horas por la finalización del proyecto '{project.title}'. Estas horas han sido agregadas a tu total."
            related_url = f"/dashboard/student/work-hours"
            
            for member in project_members:
                NotificationService.create_notification(
                    user=member.usuario,
                    title=title,
                    message=message,
                    notification_type='success',
                    related_url=related_url
                )
                
        except Exception as e:
            logger.error(f"Error al notificar validación de horas de proyecto: {str(e)}")
    
    @staticmethod
    def notify_project_status_change(project, old_status, new_status):
        """Notifica cuando cambia el estado de un proyecto"""
        try:
            # Mapear estados a mensajes
            status_messages = {
                'open': 'El proyecto está abierto para postulaciones',
                'in-progress': 'El proyecto ha comenzado y está en progreso',
                'completed': 'El proyecto ha sido completado exitosamente',
                'cancelled': 'El proyecto ha sido cancelado'
            }
            
            if new_status in status_messages:
                title = f"Estado del Proyecto Actualizado"
                message = f"El proyecto '{project.title}' ha cambiado su estado a: {status_messages[new_status]}"
                related_url = f"/dashboard/student/projects"
                
                # Notificar a todos los miembros del proyecto
                project_members = MiembroProyecto.objects.filter(
                    proyecto=project,
                    rol='estudiante'
                ).select_related('usuario')
                
                for member in project_members:
                    NotificationService.create_notification(
                        user=member.usuario,
                        title=title,
                        message=message,
                        notification_type='info',
                        related_url=related_url
                    )
                    
        except Exception as e:
            logger.error(f"Error al notificar cambio de estado: {str(e)}") 