
from .models import ActivityLog


class ActivityLogSerializer(serializers.ModelSerializer):
    """Serializer para logs de actividad"""
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    is_recent = serializers.ReadOnlyField()
    
    class Meta:
        model = ActivityLog
        fields = [
            'id', 'user', 'user_name', 'user_email', 'action', 'entity_type',
            'entity_id', 'details', 'ip_address', 'user_agent', 'content_type',
            'object_id', 'created_at', 'is_recent'
        ]
        read_only_fields = [
            'user', 'created_at', 'ip_address', 'user_agent', 'content_type', 'object_id'
        ]


class ActivityLogListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listar logs de actividad"""
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    is_recent = serializers.ReadOnlyField()
    
    class Meta:
        model = ActivityLog
        fields = [
            'id', 'user_name', 'user_email', 'action', 'entity_type',
            'entity_id', 'details', 'ip_address', 'created_at', 'is_recent'
        ]


class ActivityLogStatsSerializer(serializers.Serializer):
    """Serializer para estadísticas de logs de actividad"""
    total_logs = serializers.IntegerField()
    logs_today = serializers.IntegerField()
    logs_this_week = serializers.IntegerField()
    logs_this_month = serializers.IntegerField()
    unique_users = serializers.IntegerField()
    top_actions = serializers.ListField()
    top_users = serializers.ListField()
    activity_by_hour = serializers.DictField()
    activity_by_day = serializers.DictField()


class ActivityLogByUserSerializer(serializers.Serializer):
    """Serializer para logs de actividad por usuario"""
    user_id = serializers.IntegerField()
    user_name = serializers.CharField()
    user_email = serializers.CharField()
    total_actions = serializers.IntegerField()
    last_activity = serializers.DateTimeField()
    actions_breakdown = serializers.DictField()


class ActivityLogByActionSerializer(serializers.Serializer):
    """Serializer para logs de actividad por acción"""
    action = serializers.CharField()
    total_occurrences = serializers.IntegerField()
    unique_users = serializers.IntegerField()
    last_occurrence = serializers.DateTimeField()
    users_breakdown = serializers.ListField()


class ActivityLogSearchSerializer(serializers.Serializer):
    """Serializer para búsqueda de logs de actividad"""
    user = serializers.IntegerField(required=False)
    action = serializers.CharField(required=False)
    entity_type = serializers.CharField(required=False)
    entity_id = serializers.CharField(required=False)
    date_from = serializers.DateTimeField(required=False)
    date_to = serializers.DateTimeField(required=False)
    ip_address = serializers.CharField(required=False) 