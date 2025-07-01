from rest_framework import serializers
from .models import CalendarEvent, EventReminder, CalendarSettings
from users.serializers import UserSerializer
from projects.serializers import ProjectSerializer, ProjectApplicationSerializer

class CalendarEventSerializer(serializers.ModelSerializer):
    """Serializer básico para eventos de calendario"""
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    user_avatar = serializers.CharField(source='user.avatar', read_only=True)
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    duration_minutes = serializers.IntegerField(read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    is_today = serializers.BooleanField(read_only=True)
    is_upcoming = serializers.BooleanField(read_only=True)
    attendees_count = serializers.SerializerMethodField()
    
    class Meta:
        model = CalendarEvent
        fields = [
            'id', 'title', 'description', 'event_type', 'priority', 'status',
            'start_date', 'end_date', 'is_all_day', 'location', 'is_online', 'meeting_url',
            'user', 'user_name', 'user_avatar', 'created_by', 'created_by_name',
            'project', 'related_application', 'is_public', 'is_recurring',
            'recurrence_rule', 'reminder_minutes', 'reminder_sent', 'color', 'icon',
            'created_at', 'updated_at', 'duration_minutes', 'is_overdue', 'is_today',
            'is_upcoming', 'attendees_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'duration_minutes', 'is_overdue', 'is_today', 'is_upcoming', 'attendees_count']
    
    def get_attendees_count(self, obj):
        return obj.attendees.count()

class CalendarEventDetailSerializer(CalendarEventSerializer):
    """Serializer detallado para eventos de calendario"""
    attendees = UserSerializer(many=True, read_only=True)
    project = ProjectSerializer(read_only=True)
    related_application = ProjectApplicationSerializer(read_only=True)
    reminders = serializers.SerializerMethodField()
    
    class Meta(CalendarEventSerializer.Meta):
        fields = CalendarEventSerializer.Meta.fields + ['attendees', 'reminders']
    
    def get_reminders(self, obj):
        reminders = obj.reminders.all()
        return EventReminderSerializer(reminders, many=True).data

class CalendarEventCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear eventos de calendario"""
    
    class Meta:
        model = CalendarEvent
        fields = [
            'title', 'description', 'event_type', 'priority', 'start_date', 'end_date',
            'is_all_day', 'location', 'is_online', 'meeting_url', 'project',
            'related_application', 'is_public', 'is_recurring', 'recurrence_rule',
            'reminder_minutes', 'color', 'icon', 'attendees'
        ]
    
    def validate(self, attrs):
        # Validar que las fechas sean coherentes
        start_date = attrs.get('start_date')
        end_date = attrs.get('end_date')
        
        if start_date and end_date and start_date >= end_date:
            raise serializers.ValidationError("La fecha de inicio debe ser anterior a la fecha de fin.")
        
        # Validar que el tipo de evento sea válido
        event_type = attrs.get('event_type')
        if event_type not in dict(CalendarEvent.TYPE_CHOICES):
            raise serializers.ValidationError("Tipo de evento inválido.")
        
        # Validar que la prioridad sea válida
        priority = attrs.get('priority', 'medium')
        if priority not in dict(CalendarEvent.PRIORITY_CHOICES):
            raise serializers.ValidationError("Prioridad inválida.")
        
        return attrs
    
    def create(self, validated_data):
        attendees = validated_data.pop('attendees', [])
        validated_data['user'] = self.context['request'].user
        validated_data['created_by'] = self.context['request'].user
        
        event = super().create(validated_data)
        
        # Agregar asistentes
        for attendee in attendees:
            event.attendees.add(attendee)
        
        return event

class CalendarEventUpdateSerializer(serializers.ModelSerializer):
    """Serializer para actualizar eventos de calendario"""
    
    class Meta:
        model = CalendarEvent
        fields = [
            'title', 'description', 'event_type', 'priority', 'status', 'start_date',
            'end_date', 'is_all_day', 'location', 'is_online', 'meeting_url',
            'is_public', 'is_recurring', 'recurrence_rule', 'reminder_minutes',
            'color', 'icon', 'attendees'
        ]
    
    def validate(self, attrs):
        # Validaciones similares a CalendarEventCreateSerializer
        if 'start_date' in attrs and 'end_date' in attrs:
            if attrs['start_date'] >= attrs['end_date']:
                raise serializers.ValidationError("La fecha de inicio debe ser anterior a la fecha de fin.")
        
        return attrs
    
    def update(self, instance, validated_data):
        attendees = validated_data.pop('attendees', None)
        
        event = super().update(instance, validated_data)
        
        # Actualizar asistentes si se proporcionan
        if attendees is not None:
            event.attendees.clear()
            for attendee in attendees:
                event.attendees.add(attendee)
        
        return event

class EventReminderSerializer(serializers.ModelSerializer):
    """Serializer para recordatorios de eventos"""
    event_title = serializers.CharField(source='event.title', read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    
    class Meta:
        model = EventReminder
        fields = [
            'id', 'event', 'event_title', 'user', 'user_name', 'reminder_type',
            'minutes_before', 'is_sent', 'sent_at', 'created_at', 'scheduled_for'
        ]
        read_only_fields = ['id', 'created_at', 'is_sent', 'sent_at']

class EventReminderCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear recordatorios"""
    
    class Meta:
        model = EventReminder
        fields = ['event', 'reminder_type', 'minutes_before']
    
    def validate(self, attrs):
        # Verificar que el evento pertenezca al usuario
        user = self.context['request'].user
        event = attrs.get('event')
        
        if event.user != user and user not in event.attendees.all():
            raise serializers.ValidationError("No tienes permisos para crear recordatorios para este evento.")
        
        # Verificar que el tipo de recordatorio sea válido
        reminder_type = attrs.get('reminder_type')
        if reminder_type not in dict(EventReminder.TYPE_CHOICES):
            raise serializers.ValidationError("Tipo de recordatorio inválido.")
        
        return attrs
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        
        # Calcular la fecha programada del recordatorio
        event = validated_data['event']
        minutes_before = validated_data['minutes_before']
        from datetime import timedelta
        validated_data['scheduled_for'] = event.start_date - timedelta(minutes=minutes_before)
        
        return super().create(validated_data)

class CalendarSettingsSerializer(serializers.ModelSerializer):
    """Serializer para configuraciones de calendario"""
    
    class Meta:
        model = CalendarSettings
        fields = [
            'id', 'user', 'default_view', 'work_start_time', 'work_end_time',
            'work_days', 'default_reminder_minutes', 'enable_notifications',
            'show_public_events', 'allow_event_invites', 'event_colors',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class CalendarSettingsUpdateSerializer(serializers.ModelSerializer):
    """Serializer para actualizar configuraciones de calendario"""
    
    class Meta:
        model = CalendarSettings
        fields = [
            'default_view', 'work_start_time', 'work_end_time', 'work_days',
            'default_reminder_minutes', 'enable_notifications', 'show_public_events',
            'allow_event_invites', 'event_colors'
        ]
    
    def validate(self, attrs):
        # Validar que la vista por defecto sea válida
        default_view = attrs.get('default_view')
        valid_views = ['month', 'week', 'day', 'agenda']
        if default_view and default_view not in valid_views:
            raise serializers.ValidationError("Vista por defecto inválida.")
        
        # Validar que los días laborales sean válidos
        work_days = attrs.get('work_days', [])
        if work_days:
            for day in work_days:
                if day < 0 or day > 6:
                    raise serializers.ValidationError("Los días laborales deben estar entre 0 y 6.")
        
        # Validar que las horas de trabajo sean coherentes
        work_start_time = attrs.get('work_start_time')
        work_end_time = attrs.get('work_end_time')
        if work_start_time and work_end_time and work_start_time >= work_end_time:
            raise serializers.ValidationError("La hora de inicio debe ser anterior a la hora de fin.")
        
        return attrs

class CalendarEventSearchSerializer(serializers.ModelSerializer):
    """Serializer para búsqueda de eventos"""
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    duration_minutes = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = CalendarEvent
        fields = [
            'id', 'title', 'description', 'event_type', 'priority', 'status',
            'start_date', 'end_date', 'is_all_day', 'location', 'is_online',
            'user_name', 'duration_minutes', 'color', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'duration_minutes']

class CalendarStatsSerializer(serializers.Serializer):
    """Serializer para estadísticas de calendario"""
    total_events = serializers.IntegerField()
    upcoming_events = serializers.IntegerField()
    overdue_events = serializers.IntegerField()
    events_by_type = serializers.DictField()
    events_by_priority = serializers.DictField()
    events_by_month = serializers.ListField()
    recent_events = CalendarEventSerializer(many=True)
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        
        # Calcular estadísticas por tipo
        events = instance.calendar_events.all()
        type_stats = {}
        
        for event_type, _ in CalendarEvent.TYPE_CHOICES:
            type_events = events.filter(event_type=event_type)
            if type_events.exists():
                type_stats[event_type] = type_events.count()
        
        data['events_by_type'] = type_stats
        
        # Calcular estadísticas por prioridad
        priority_stats = {}
        for priority, _ in CalendarEvent.PRIORITY_CHOICES:
            priority_events = events.filter(priority=priority)
            if priority_events.exists():
                priority_stats[priority] = priority_events.count()
        
        data['events_by_priority'] = priority_stats
        return data

class CalendarEventBulkSerializer(serializers.Serializer):
    """Serializer para operaciones masivas de eventos"""
    event_ids = serializers.ListField(
        child=serializers.UUIDField(),
        help_text="Lista de IDs de eventos a procesar"
    )
    action = serializers.ChoiceField(
        choices=['mark_completed', 'cancel', 'duplicate'],
        help_text="Acción a realizar en los eventos"
    )
    
    def validate(self, attrs):
        event_ids = attrs.get('event_ids', [])
        if not event_ids:
            raise serializers.ValidationError("Debe proporcionar al menos un ID de evento.")
        
        # Verificar que todos los eventos pertenezcan al usuario
        user = self.context['request'].user
        existing_events = CalendarEvent.objects.filter(
            id__in=event_ids,
            user=user
        )
        
        if existing_events.count() != len(event_ids):
            raise serializers.ValidationError("Algunos eventos no existen o no te pertenecen.")
        
        return attrs
    
    def update(self, instance, validated_data):
        event_ids = validated_data['event_ids']
        action = validated_data['action']
        
        events = CalendarEvent.objects.filter(id__in=event_ids)
        
        if action == 'mark_completed':
            events.update(status='completed')
        elif action == 'cancel':
            events.update(status='cancelled')
        elif action == 'duplicate':
            # Crear copias de los eventos
            for event in events:
                event.pk = None
                event.title = f"Copia de {event.title}"
                event.save()
        
        return {'processed_count': events.count()} 
