from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Strike
from notifications.models import Notification

@receiver(post_save, sender=Strike)
def create_strike_notification(sender, instance, created, **kwargs):
    """
    Envía una notificación al estudiante cuando recibe una amonestación.
    """
    if created:
        Notification.objects.create(
            recipient=instance.student.user,
            title=f"Has recibido una amonestación en el proyecto {instance.project.title}",
            message=f"La empresa {instance.company.name} te ha emitido una amonestación. Motivo: {instance.reason}",
            # link=f'/projects/{instance.project.id}/strikes/' # Ejemplo
        ) 