from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.utils import timezone
from .services import NotificationService
from applications.models import Aplicacion
from projects.models import Proyecto, AplicacionProyecto, MiembroProyecto
from work_hours.models import WorkHour
from project_status.models import ProjectStatus
import logging

logger = logging.getLogger(__name__)

# ===== SIGNALS PARA APLICACIONES =====

@receiver(post_save, sender=Aplicacion)
def notify_application_created(sender, instance, created, **kwargs):
    """Notifica cuando se crea una nueva aplicación"""
    if created:
        try:
            logger.info(f"Nueva aplicación creada: {instance.id}")
            NotificationService.notify_project_application(instance)
        except Exception as e:
            logger.error(f"Error en signal de aplicación creada: {str(e)}")

@receiver(post_save, sender=Aplicacion)
def notify_application_status_change(sender, instance, **kwargs):
    """Notifica cuando cambia el estado de una aplicación"""
    if not kwargs.get('created', False):  # Solo para actualizaciones
        try:
            # Obtener el estado anterior
            if instance.pk:
                old_instance = Aplicacion.objects.get(pk=instance.pk)
                old_status = old_instance.status
                
                # Notificar cambios específicos
                if instance.status == 'accepted' and old_status != 'accepted':
                    logger.info(f"Aplicación aceptada: {instance.id}")
                    NotificationService.notify_application_accepted(instance)
                elif instance.status == 'rejected' and old_status != 'rejected':
                    logger.info(f"Aplicación rechazada: {instance.id}")
                    NotificationService.notify_application_rejected(instance)
        except Exception as e:
            logger.error(f"Error en signal de cambio de estado de aplicación: {str(e)}")

@receiver(post_save, sender=AplicacionProyecto)
def notify_project_application_created(sender, instance, created, **kwargs):
    """Notifica cuando se crea una nueva aplicación de proyecto"""
    if created:
        try:
            logger.info(f"Nueva aplicación de proyecto creada: {instance.id}")
            NotificationService.notify_project_application(instance)
        except Exception as e:
            logger.error(f"Error en signal de aplicación de proyecto creada: {str(e)}")

@receiver(post_save, sender=AplicacionProyecto)
def notify_project_application_status_change(sender, instance, **kwargs):
    """Notifica cuando cambia el estado de una aplicación de proyecto"""
    if not kwargs.get('created', False):  # Solo para actualizaciones
        try:
            # Obtener el estado anterior
            if instance.pk:
                old_instance = AplicacionProyecto.objects.get(pk=instance.pk)
                old_status = old_instance.estado
                
                # Notificar cambios específicos
                if instance.estado == 'accepted' and old_status != 'accepted':
                    logger.info(f"Aplicación de proyecto aceptada: {instance.id}")
                    NotificationService.notify_application_accepted(instance)
                elif instance.estado == 'rejected' and old_status != 'rejected':
                    logger.info(f"Aplicación de proyecto rechazada: {instance.id}")
                    NotificationService.notify_application_rejected(instance)
        except Exception as e:
            logger.error(f"Error en signal de cambio de estado de aplicación de proyecto: {str(e)}")

# ===== SIGNALS PARA PROYECTOS =====

@receiver(post_save, sender=Proyecto)
def notify_project_status_change(sender, instance, **kwargs):
    """Notifica cuando cambia el estado de un proyecto"""
    if not kwargs.get('created', False):  # Solo para actualizaciones
        try:
            # Obtener el estado anterior
            if instance.pk:
                old_instance = Proyecto.objects.get(pk=instance.pk)
                old_status = old_instance.status.name if old_instance.status else None
                new_status = instance.status.name if instance.status else None
                
                if old_status != new_status:
                    logger.info(f"Estado de proyecto cambiado: {instance.id} de {old_status} a {new_status}")
                    
                    # Notificar cambios específicos
                    if new_status == 'in-progress':
                        NotificationService.notify_project_activated(instance)
                    elif new_status == 'completed':
                        NotificationService.notify_project_completed(instance)
                    else:
                        # Notificar cambio general de estado
                        NotificationService.notify_project_status_change(instance, old_status, new_status)
        except Exception as e:
            logger.error(f"Error en signal de cambio de estado de proyecto: {str(e)}")

# ===== SIGNALS PARA HORAS DE TRABAJO =====

@receiver(post_save, sender=WorkHour)
def notify_hours_validation(sender, instance, **kwargs):
    """Notifica cuando se valida o rechaza una hora de trabajo"""
    if not kwargs.get('created', False):  # Solo para actualizaciones
        try:
            # Obtener el estado anterior
            if instance.pk:
                old_instance = WorkHour.objects.get(pk=instance.pk)
                old_verified = old_instance.is_verified
                
                # Notificar cuando cambia el estado de verificación
                if instance.is_verified != old_verified:
                    logger.info(f"Horas validadas: {instance.id} - Verificado: {instance.is_verified}")
                    NotificationService.notify_hours_validation(instance, instance.is_verified)
        except Exception as e:
            logger.error(f"Error en signal de validación de horas: {str(e)}")

# ===== SIGNALS PARA MIEMBROS DE PROYECTO =====

@receiver(post_save, sender=MiembroProyecto)
def notify_project_member_activated(sender, instance, **kwargs):
    """Notifica cuando un miembro del proyecto se activa"""
    if not kwargs.get('created', False):  # Solo para actualizaciones
        try:
            # Obtener el estado anterior
            if instance.pk:
                old_instance = MiembroProyecto.objects.get(pk=instance.pk)
                old_activo = old_instance.esta_activo
                
                # Notificar cuando se activa un miembro
                if instance.esta_activo and not old_activo:
                    logger.info(f"Miembro de proyecto activado: {instance.id}")
                    title = "Proyecto Activado"
                    message = f"Has sido activado en el proyecto '{instance.proyecto.title}'. ¡Ya puedes comenzar a trabajar!"
                    related_url = f"/dashboard/student/projects"
                    
                    NotificationService.create_notification(
                        user=instance.usuario,
                        title=title,
                        message=message,
                        notification_type='success',
                        related_url=related_url
                    )
        except Exception as e:
            logger.error(f"Error en signal de activación de miembro: {str(e)}")

# ===== SIGNALS PARA ESTADOS DE PROYECTO =====

@receiver(post_save, sender=ProjectStatus)
def notify_project_status_created(sender, instance, created, **kwargs):
    """Notifica cuando se crea un nuevo estado de proyecto"""
    if created:
        try:
            logger.info(f"Nuevo estado de proyecto creado: {instance.name}")
            # Aquí podrías agregar lógica adicional si es necesario
        except Exception as e:
            logger.error(f"Error en signal de estado de proyecto creado: {str(e)}")

# ===== FUNCIÓN PARA CONECTAR SIGNALS =====

def connect_notification_signals():
    """Conecta todos los signals de notificaciones"""
    try:
        # Los signals se conectan automáticamente cuando se importa este módulo
        logger.info("Signals de notificaciones conectados exitosamente")
    except Exception as e:
        logger.error(f"Error al conectar signals de notificaciones: {str(e)}")

# Conectar signals al importar el módulo
connect_notification_signals() 