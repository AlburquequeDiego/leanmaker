from django.db import models
from django.conf import settings
from projects.models import Project

class CalendarEvent(models.Model):
    EVENT_TYPE_CHOICES = [
        ('MEETING', 'Reunión'),
        ('DEADLINE', 'Fecha Límite'),
        ('MILESTONE', 'Hito'),
        ('PRESENTATION', 'Presentación'),
        ('OTHER', 'Otro'),
    ]
    
    title = models.CharField(max_length=255, verbose_name='Título')
    description = models.TextField(blank=True, verbose_name='Descripción')
    event_type = models.CharField(max_length=20, choices=EVENT_TYPE_CHOICES, verbose_name='Tipo de Evento')
    
    # Fechas
    start_date = models.DateTimeField(verbose_name='Fecha de Inicio')
    end_date = models.DateTimeField(verbose_name='Fecha de Fin')
    
    # Relaciones
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='events', verbose_name='Proyecto')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_events', verbose_name='Creado por')
    
    # Participantes (opcional)
    participants = models.ManyToManyField(settings.AUTH_USER_MODEL, blank=True, related_name='participating_events', verbose_name='Participantes')
    
    # Ubicación (opcional)
    location = models.CharField(max_length=255, blank=True, verbose_name='Ubicación')
    
    # Color para el calendario
    color = models.CharField(max_length=7, default='#3788d8', verbose_name='Color')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Evento de Calendario'
        verbose_name_plural = 'Eventos de Calendario'
        ordering = ['start_date']

    def __str__(self):
        return f'{self.title} - {self.project.title}'

    @property
    def is_all_day(self):
        """
        Determina si el evento es de todo el día.
        """
        return self.start_date.date() == self.end_date.date() and \
               self.start_date.hour == 0 and self.start_date.minute == 0 and \
               self.end_date.hour == 23 and self.end_date.minute == 59
