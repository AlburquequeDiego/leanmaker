from rest_framework import serializers
from .models import MassNotification
from users.models import User


class MassNotificationSerializer(serializers.ModelSerializer):
    """Serializer para notificaciones de eventos con información adicional"""
    user_name = serializers.CharField(source='sent_by.get_full_name', read_only=True)
    user_email = serializers.CharField(source='sent_by.email', read_only=True)
    user_role = serializers.CharField(source='sent_by.role', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = MassNotification
        fields = [
            'id', 'title', 'message', 'notification_type', 'priority',
            'target_audience', 'sent_by', 'scheduled_at', 'sent_at',
            'is_sent', 'created_at', 'status', 'status_display'
        ]
        read_only_fields = ['id', 'created_at']
