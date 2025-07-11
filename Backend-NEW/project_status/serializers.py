
from .models import ProjectStatus, ProjectStatusHistory

class ProjectStatusSerializer(serializers.ModelSerializer):
    """Serializer para estados de proyecto"""
    
    class Meta:
        model = ProjectStatus
        fields = ['id', 'name', 'description', 'color', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

class ProjectStatusHistorySerializer(serializers.ModelSerializer):
    """Serializer para historial de estados de proyecto"""
    
    class Meta:
        model = ProjectStatusHistory
        fields = ['id', 'project', 'status', 'user', 'fecha_cambio', 'comentario']
        read_only_fields = ['id', 'fecha_cambio'] 