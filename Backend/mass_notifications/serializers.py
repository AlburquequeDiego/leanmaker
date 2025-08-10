from rest_framework import serializers
from .models import MassNotification, EventRegistration
from users.models import User


class EventRegistrationSerializer(serializers.ModelSerializer):
    """Serializer para registros de asistencia a eventos"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_role = serializers.CharField(source='user.role', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = EventRegistration
        fields = [
            'id', 'event', 'user', 'user_name', 'user_email', 'user_role',
            'status', 'status_display', 'notes', 'registered_at', 'updated_at'
        ]
        read_only_fields = ['id', 'registered_at', 'updated_at']


class MassNotificationEventSerializer(serializers.ModelSerializer):
    """Serializer para notificaciones de eventos con información adicional"""
    event_registrations_count = serializers.IntegerField(read_only=True)
    confirmed_count = serializers.SerializerMethodField()
    maybe_count = serializers.SerializerMethodField()
    declined_count = serializers.SerializerMethodField()
    pending_count = serializers.SerializerMethodField()
    
    class Meta:
        model = MassNotification
        fields = [
            'id', 'title', 'message', 'notification_type', 'priority',
            'target_audience', 'sent_by', 'scheduled_at', 'sent_at',
            'is_sent', 'created_at', 'event_date', 'event_location',
            'event_description', 'event_capacity', 'event_type',
            'event_registrations_count', 'confirmed_count', 'maybe_count',
            'declined_count', 'pending_count'
        ]
        read_only_fields = ['id', 'created_at', 'event_registrations_count']
    
    def get_confirmed_count(self, obj):
        if obj.is_event:
            return obj.event_registrations.filter(status='confirmed').count()
        return 0
    
    def get_maybe_count(self, obj):
        if obj.is_event:
            return obj.event_registrations.filter(status='maybe').count()
        return 0
    
    def get_declined_count(self, obj):
        if obj.is_event:
            return obj.event_registrations.filter(status='declined').count()
        return 0
    
    def get_pending_count(self, obj):
        if obj.is_event:
            return obj.event_registrations.filter(status='pending').count()
        return 0


class EventAttendanceSerializer(serializers.Serializer):
    """Serializer para confirmar asistencia a eventos"""
    status = serializers.ChoiceField(
        choices=EventRegistration.ATTENDANCE_STATUS_CHOICES,
        required=True
    )
    notes = serializers.CharField(required=False, allow_blank=True)


class EventStatisticsSerializer(serializers.Serializer):
    """Serializer para estadísticas de eventos"""
    event_id = serializers.IntegerField()
    event_title = serializers.CharField()
    total_registrations = serializers.IntegerField()
    confirmed_count = serializers.IntegerField()
    maybe_count = serializers.IntegerField()
    declined_count = serializers.IntegerField()
    pending_count = serializers.IntegerField()
    attendance_rate = serializers.FloatField()
    created_at = serializers.DateTimeField()
