from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Aplicacion
from notifications.models import Notification

@receiver(post_save, sender=Aplicacion)
def create_application_status_notification(sender, instance, created, **kwargs):
    """
    Envía una notificación al estudiante cuando el estado de su postulación cambia.
    """
    if not created: # Solo notificar en actualizaciones de estado, no en la creación inicial
        student_user = instance.estudiante.usuario
        project_title = instance.proyecto.titulo
        
        message = ""
        if instance.estado == 'ACEPTADA':
            title = f"¡Felicitaciones! Has sido aceptado en el proyecto {project_title}"
            message = f"La empresa {instance.proyecto.empresa.nombre_empresa} ha aceptado tu postulación. Pronto se pondrán en contacto contigo."
        elif instance.estado == 'RECHAZADA':
            title = f"Actualización sobre tu postulación a {project_title}"
            message = f"La empresa {instance.proyecto.empresa.nombre_empresa} ha revisado tu postulación. En esta ocasión, no has sido seleccionado."
        
        if message:
            Notification.objects.create(
                recipient=student_user,
                title=title,
                message=message,
                # link=f'/projects/{instance.proyecto.id}/' # Ejemplo de enlace
            ) 
