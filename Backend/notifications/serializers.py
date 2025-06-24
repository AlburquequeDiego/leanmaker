from rest_framework import serializers
from .models import Notification, NotificationTemplate, NotificationPreference
from users.serializers import UserSerializer
from projects.serializers import ProjectSerializer, ProjectApplicationSerializer

class NotificationSerializer(serializers.ModelSerializer):
    """Serializer básico para notificaciones"""
    recipient_name = serializers.CharField(source='recipient.get_full_name', read_only=True)
    recipient_avatar = serializers.CharField(source='recipient.avatar', read_only=True)
    time_ago = serializers.CharField(read_only=True)
    is_urgent = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id', 'recipient', 'recipient_name', 'recipient_avatar', 'title', 'message',
            'notification_type', 'priority', 'is_read', 'is_archived', 'created_at',
            'read_at', 'scheduled_for', 'data', 'time_ago', 'is_urgent'
        ]
        read_only_fields = ['id', 'created_at', 'read_at', 'time_ago', 'is_urgent']

class NotificationDetailSerializer(NotificationSerializer):
    """Serializer detallado para notificaciones"""
    recipient_details = UserSerializer(source='recipient', read_only=True)
    related_project = ProjectSerializer(read_only=True)
    related_application = ProjectApplicationSerializer(read_only=True)
    related_user = UserSerializer(read_only=True)
    
    class Meta(NotificationSerializer.Meta):
        fields = NotificationSerializer.Meta.fields + [
            'recipient_details', 'related_project', 'related_application', 'related_user'
        ]

class NotificationCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear notificaciones"""
    
    class Meta:
        model = Notification
        fields = [
            'recipient', 'title', 'message', 'notification_type', 'priority',
            'data', 'scheduled_for', 'related_project', 'related_application', 'related_user'
        ]
    
    def validate(self, attrs):
        # Validar que el tipo de notificación sea válido
        notification_type = attrs.get('notification_type')
        if notification_type not in dict(Notification.TYPE_CHOICES):
            raise serializers.ValidationError("Tipo de notificación inválido.")
        
        # Validar que la prioridad sea válida
        priority = attrs.get('priority', 'medium')
        if priority not in dict(Notification.PRIORITY_CHOICES):
            raise serializers.ValidationError("Prioridad inválida.")
        
        return attrs

class NotificationUpdateSerializer(serializers.ModelSerializer):
    """Serializer para actualizar notificaciones"""
    
    class Meta:
        model = Notification
        fields = ['is_read', 'is_archived']
    
    def update(self, instance, validated_data):
        # Si se marca como leída, actualizar la fecha de lectura
        if validated_data.get('is_read') and not instance.is_read:
            from django.utils import timezone
            validated_data['read_at'] = timezone.now()
        
        return super().update(instance, validated_data)

class NotificationTemplateSerializer(serializers.ModelSerializer):
    """Serializer para plantillas de notificaciones"""
    
    class Meta:
        model = NotificationTemplate
        fields = [
            'id', 'name', 'notification_type', 'title_template', 'message_template',
            'is_active', 'priority', 'available_variables', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate(self, attrs):
        # Validar que el tipo de notificación sea válido
        notification_type = attrs.get('notification_type')
        if notification_type not in dict(Notification.TYPE_CHOICES):
            raise serializers.ValidationError("Tipo de notificación inválido.")
        
        # Validar que la prioridad sea válida
        priority = attrs.get('priority', 'medium')
        if priority not in dict(Notification.PRIORITY_CHOICES):
            raise serializers.ValidationError("Prioridad inválida.")
        
        return attrs

class NotificationPreferenceSerializer(serializers.ModelSerializer):
    """Serializer para preferencias de notificación"""
    
    class Meta:
        model = NotificationPreference
        fields = [
            'id', 'user', 'enabled_types', 'email_enabled', 'push_enabled', 'sms_enabled',
            'digest_frequency', 'quiet_hours_start', 'quiet_hours_end', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class NotificationPreferenceUpdateSerializer(serializers.ModelSerializer):
    """Serializer para actualizar preferencias de notificación"""
    
    class Meta:
        model = NotificationPreference
        fields = [
            'enabled_types', 'email_enabled', 'push_enabled', 'sms_enabled',
            'digest_frequency', 'quiet_hours_start', 'quiet_hours_end'
        ]
    
    def validate(self, attrs):
        # Validar que los tipos habilitados sean válidos
        enabled_types = attrs.get('enabled_types', [])
        valid_types = [choice[0] for choice in Notification.TYPE_CHOICES]
        
        for notification_type in enabled_types:
            if notification_type not in valid_types:
                raise serializers.ValidationError(f"Tipo de notificación inválido: {notification_type}")
        
        # Validar que la frecuencia de digest sea válida
        digest_frequency = attrs.get('digest_frequency', 'immediate')
        valid_frequencies = ['immediate', 'hourly', 'daily', 'weekly']
        if digest_frequency not in valid_frequencies:
            raise serializers.ValidationError("Frecuencia de digest inválida.")
        
        return attrs

class NotificationStatsSerializer(serializers.Serializer):
    """Serializer para estadísticas de notificaciones"""
    total_notifications = serializers.IntegerField()
    unread_count = serializers.IntegerField()
    read_count = serializers.IntegerField()
    archived_count = serializers.IntegerField()
    notifications_by_type = serializers.DictField()
    notifications_by_priority = serializers.DictField()
    recent_notifications = NotificationSerializer(many=True)
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        
        # Calcular estadísticas por tipo
        notifications = instance.notifications.all()
        type_stats = {}
        
        for notification_type, _ in Notification.TYPE_CHOICES:
            type_notifications = notifications.filter(notification_type=notification_type)
            if type_notifications.exists():
                type_stats[notification_type] = type_notifications.count()
        
        data['notifications_by_type'] = type_stats
        
        # Calcular estadísticas por prioridad
        priority_stats = {}
        for priority, _ in Notification.PRIORITY_CHOICES:
            priority_notifications = notifications.filter(priority=priority)
            if priority_notifications.exists():
                priority_stats[priority] = priority_notifications.count()
        
        data['notifications_by_priority'] = priority_stats
        return data

class NotificationBulkUpdateSerializer(serializers.Serializer):
    """Serializer para actualización masiva de notificaciones"""
    notification_ids = serializers.ListField(
        child=serializers.UUIDField(),
        help_text="Lista de IDs de notificaciones a actualizar"
    )
    action = serializers.ChoiceField(
        choices=['mark_read', 'mark_unread', 'archive', 'unarchive'],
        help_text="Acción a realizar en las notificaciones"
    )
    
    def validate(self, attrs):
        notification_ids = attrs.get('notification_ids', [])
        if not notification_ids:
            raise serializers.ValidationError("Debe proporcionar al menos un ID de notificación.")
        
        # Verificar que todas las notificaciones pertenezcan al usuario
        user = self.context['request'].user
        existing_notifications = Notification.objects.filter(
            id__in=notification_ids,
            recipient=user
        )
        
        if existing_notifications.count() != len(notification_ids):
            raise serializers.ValidationError("Algunas notificaciones no existen o no te pertenecen.")
        
        return attrs
    
    def update(self, instance, validated_data):
        notification_ids = validated_data['notification_ids']
        action = validated_data['action']
        
        notifications = Notification.objects.filter(id__in=notification_ids)
        
        if action == 'mark_read':
            from django.utils import timezone
            notifications.update(is_read=True, read_at=timezone.now())
        elif action == 'mark_unread':
            notifications.update(is_read=False, read_at=None)
        elif action == 'archive':
            notifications.update(is_archived=True)
        elif action == 'unarchive':
            notifications.update(is_archived=False)
        
        return {'updated_count': notifications.count()}

class NotificationSummarySerializer(serializers.Serializer):
    """Serializer para resumen de notificaciones"""
    user = UserSerializer()
    total_notifications = serializers.IntegerField()
    unread_count = serializers.IntegerField()
    urgent_count = serializers.IntegerField()
    recent_notifications = NotificationSerializer(many=True)
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        
        # Obtener notificaciones recientes
        recent_notifications = instance.notifications.filter(
            is_archived=False
        ).order_by('-created_at')[:10]
        
        data['recent_notifications'] = NotificationSerializer(recent_notifications, many=True).data
        return data 
