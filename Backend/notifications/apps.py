from django.apps import AppConfig


class NotificationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'notifications'
    verbose_name = 'Notificaciones'

    def ready(self):
        """Importar signals cuando la app está lista"""
        import notifications.signals
