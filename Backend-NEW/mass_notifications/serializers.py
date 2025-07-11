
from .models import MassNotification, NotificationTemplate

class NotificationTemplateSerializer(serializers.ModelSerializer):
    """Serializer para plantillas de notificaciones"""
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    
    class Meta:
        model = NotificationTemplate
        fields = [
            'id', 'name', 'title_template', 'message_template', 
            'notification_type', 'is_active', 'created_by', 
            'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']

class MassNotificationSerializer(serializers.ModelSerializer):
    """Serializer para notificaciones masivas"""
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    
    class Meta:
        model = MassNotification
        fields = [
            'id', 'title', 'message', 'notification_type', 'priority', 'status',
            'target_students', 'target_companies', 'target_all_students', 'target_all_companies',
            'scheduled_at', 'sent_at', 'total_recipients', 'sent_count', 
            'failed_count', 'read_count', 'created_by', 'created_by_name', 
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'created_by', 'created_at', 'updated_at', 'sent_at', 
            'total_recipients', 'sent_count', 'failed_count', 'read_count'
        ] 