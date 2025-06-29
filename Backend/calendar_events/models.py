from django.db import models
from django.conf import settings
from projects.models import Proyecto, AplicacionProyecto
from django.core.validators import MinValueValidator, MaxValueValidator
from users.models import Usuario
import uuid
import json

class CalendarEvent(models.Model):
    TYPE_CHOICES = (
        # Eventos de proyectos
        ('project_start', 'Inicio de Proyecto'),
        ('project_end', 'Fin de Proyecto'),
        ('project_milestone', 'Hito de Proyecto'),
        ('project_meeting', 'Reunión de Proyecto'),
        ('project_deadline', 'Fecha Límite de Proyecto'),
        
        # Eventos de entrevistas
        ('interview', 'Entrevista'),
        ('interview_prep', 'Preparación de Entrevista'),
        ('interview_followup', 'Seguimiento de Entrevista'),
        
        # Eventos de evaluaciones
        ('evaluation_due', 'Evaluación Pendiente'),
        ('evaluation_review', 'Revisión de Evaluación'),
        ('evaluation_feedback', 'Feedback de Evaluación'),
        
        # Eventos de horas
        ('hours_submission', 'Envío de Horas'),
        ('hours_approval', 'Aprobación de Horas'),
        ('hours_review', 'Revisión de Horas'),
        
        # Eventos de sistema
        ('system_maintenance', 'Mantenimiento del Sistema'),
        ('system_update', 'Actualización del Sistema'),
        ('system_announcement', 'Anuncio del Sistema'),
        
        # Eventos personales
        ('personal', 'Evento Personal'),
        ('reminder', 'Recordatorio'),
        ('deadline', 'Fecha Límite'),
        ('meeting', 'Reunión'),
        ('presentation', 'Presentación'),
        ('workshop', 'Taller'),
        ('training', 'Capacitación'),
        
        # Eventos de API
        ('api_test', 'Prueba de API'),
        ('api_review', 'Revisión de API'),
        ('api_deadline', 'Fecha Límite de API'),
    )
    
    PRIORITY_CHOICES = (
        ('low', 'Baja'),
        ('medium', 'Media'),
        ('high', 'Alta'),
        ('urgent', 'Urgente'),
    )
    
    STATUS_CHOICES = (
        ('scheduled', 'Programado'),
        ('in_progress', 'En Progreso'),
        ('completed', 'Completado'),
        ('cancelled', 'Cancelado'),
        ('postponed', 'Pospuesto'),
    )
    
    id = models.AutoField(primary_key=True)
    
    # Información básica
    title = models.CharField(max_length=200)
    description = models.TextField(null=True, blank=True)
    event_type = models.CharField(max_length=50, default='general')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    
    # Fechas y horarios
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    is_all_day = models.BooleanField(default=False)
    
    # Ubicación
    location = models.CharField(max_length=200, null=True, blank=True)
    is_online = models.BooleanField(default=False)
    meeting_url = models.URLField(blank=True, null=True)
    
    # Participantes
    user = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='calendar_events')
    attendees = models.ManyToManyField(Usuario, related_name='attended_events', blank=True)
    
    # Relaciones opcionales
    project = models.ForeignKey(Proyecto, on_delete=models.CASCADE, null=True, blank=True, related_name='calendar_events')
    related_application = models.ForeignKey(AplicacionProyecto, on_delete=models.CASCADE, blank=True, null=True, related_name='calendar_events')
    
    # Configuración
    is_public = models.BooleanField(default=False)
    is_recurring = models.BooleanField(default=False)
    recurrence_rule = models.TextField(default='{}')  # JSON dict de reglas de recurrencia
    
    # Recordatorios
    reminder_minutes = models.PositiveIntegerField(default=15)  # Minutos antes del evento
    reminder_sent = models.BooleanField(default=False)
    
    # Colores y personalización
    color = models.CharField(max_length=7, default='#1976d2')  # Color hexadecimal
    icon = models.CharField(max_length=50, blank=True, null=True)
    
    # Fechas de sistema
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='created_events')
    
    class Meta:
        db_table = 'calendar_events'
        verbose_name = 'Evento de Calendario'
        verbose_name_plural = 'Eventos de Calendario'
        ordering = ['-start_date']
        indexes = [
            models.Index(fields=['user', 'start_date']),
            models.Index(fields=['event_type']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.start_date}"
    
    def get_recurrence_rule_dict(self):
        """Obtiene las reglas de recurrencia como diccionario de Python"""
        if self.recurrence_rule:
            try:
                return json.loads(self.recurrence_rule)
            except json.JSONDecodeError:
                return {}
        return {}
    
    def set_recurrence_rule_dict(self, rule_dict):
        """Establece las reglas de recurrencia desde un diccionario de Python"""
        if isinstance(rule_dict, dict):
            self.recurrence_rule = json.dumps(rule_dict, ensure_ascii=False)
        else:
            self.recurrence_rule = '{}'
    
    @property
    def duration_minutes(self):
        """Calcula la duración del evento en minutos"""
        diff = self.end_date - self.start_date
        return int(diff.total_seconds() / 60)
    
    @property
    def is_overdue(self):
        """Verifica si el evento está vencido"""
        from django.utils import timezone
        return self.end_date < timezone.now() and self.status == 'scheduled'
    
    @property
    def is_today(self):
        """Verifica si el evento es hoy"""
        from django.utils import timezone
        today = timezone.now().date()
        return self.start_date.date() == today
    
    @property
    def is_upcoming(self):
        """Verifica si el evento está próximo"""
        from django.utils import timezone
        now = timezone.now()
        return self.start_date > now and self.status == 'scheduled'
    
    def add_attendee(self, user):
        """Agrega un participante al evento"""
        self.attendees.add(user)
    
    def remove_attendee(self, user):
        """Remueve un participante del evento"""
        self.attendees.remove(user)
    
    def mark_completed(self):
        """Marca el evento como completado"""
        self.status = 'completed'
        self.save(update_fields=['status'])
    
    def cancel(self, reason=None):
        """Cancela el evento"""
        self.status = 'cancelled'
        if reason:
            self.description = f"{self.description}\n\nCANCELADO: {reason}"
        self.save(update_fields=['status', 'description'])

class EventReminder(models.Model):
    """Recordatorios específicos para eventos"""
    
    TYPE_CHOICES = (
        ('email', 'Email'),
        ('push', 'Notificación Push'),
        ('sms', 'SMS'),
        ('in_app', 'En la Aplicación'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event = models.ForeignKey(CalendarEvent, on_delete=models.CASCADE, related_name='reminders')
    user = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='event_reminders')
    
    # Configuración del recordatorio
    reminder_type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    minutes_before = models.PositiveIntegerField(default=15)
    
    # Estado
    is_sent = models.BooleanField(default=False)
    sent_at = models.DateTimeField(blank=True, null=True)
    
    # Fechas
    created_at = models.DateTimeField(auto_now_add=True)
    scheduled_for = models.DateTimeField()
    
    class Meta:
        db_table = 'event_reminders'
        verbose_name = 'Recordatorio de Evento'
        verbose_name_plural = 'Recordatorios de Eventos'
        ordering = ['scheduled_for']
        unique_together = ['event', 'user', 'reminder_type']
    
    def __str__(self):
        return f"Recordatorio para {self.event.title} - {self.user.get_full_name()}"
    
    def mark_sent(self):
        """Marca el recordatorio como enviado"""
        self.is_sent = True
        from django.utils import timezone
        self.sent_at = timezone.now()
        self.save(update_fields=['is_sent', 'sent_at'])

class CalendarSettings(models.Model):
    """Configuraciones de calendario por usuario"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='calendar_settings')
    
    # Configuración de vista
    default_view = models.CharField(max_length=20, choices=(
        ('month', 'Mes'),
        ('week', 'Semana'),
        ('day', 'Día'),
        ('agenda', 'Agenda'),
    ), default='week')
    
    # Configuración de horarios
    work_start_time = models.TimeField(default='09:00')
    work_end_time = models.TimeField(default='18:00')
    work_days = models.TextField(default='[1,2,3,4,5]')  # JSON array [1,2,3,4,5] para lunes a viernes
    
    # Configuración de recordatorios
    default_reminder_minutes = models.PositiveIntegerField(default=15)
    enable_notifications = models.BooleanField(default=True)
    
    # Configuración de privacidad
    show_public_events = models.BooleanField(default=True)
    allow_event_invites = models.BooleanField(default=True)
    
    # Configuración de colores
    event_colors = models.TextField(default='{}')  # JSON dict de colores por tipo de evento
    
    # Fechas
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'calendar_settings'
        verbose_name = 'Configuración de Calendario'
        verbose_name_plural = 'Configuraciones de Calendario'
        unique_together = ['user']
    
    def __str__(self):
        return f"Configuración de calendario de {self.user.get_full_name()}"
    
    def get_work_days_list(self):
        """Obtiene la lista de días laborables como lista de Python"""
        if self.work_days:
            try:
                return json.loads(self.work_days)
            except json.JSONDecodeError:
                return [1, 2, 3, 4, 5]  # Lunes a viernes por defecto
        return [1, 2, 3, 4, 5]
    
    def set_work_days_list(self, days_list):
        """Establece la lista de días laborables desde una lista de Python"""
        if isinstance(days_list, list):
            self.work_days = json.dumps(days_list, ensure_ascii=False)
        else:
            self.work_days = '[1,2,3,4,5]'
    
    def get_event_colors_dict(self):
        """Obtiene el diccionario de colores de eventos como diccionario de Python"""
        if self.event_colors:
            try:
                return json.loads(self.event_colors)
            except json.JSONDecodeError:
                return {}
        return {}
    
    def set_event_colors_dict(self, colors_dict):
        """Establece el diccionario de colores de eventos desde un diccionario de Python"""
        if isinstance(colors_dict, dict):
            self.event_colors = json.dumps(colors_dict, ensure_ascii=False)
        else:
            self.event_colors = '{}'
    
    def is_work_day(self, date):
        """Verifica si una fecha es un día laborable"""
        return date.weekday() + 1 in self.get_work_days_list()
    
    def is_work_time(self, time):
        """Verifica si una hora está dentro del horario laboral"""
        return self.work_start_time <= time <= self.work_end_time
