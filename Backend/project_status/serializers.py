from rest_framework import serializers
from .models import ProjectStatus, ProjectStatusHistory
from users.serializers import UserSerializer
from projects.serializers import ProyectoSerializer

class ProjectStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectStatus
        fields = [
            'id', 'name', 'description', 'color', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_name(self, value):
        if len(value.strip()) < 2:
            raise serializers.ValidationError("El nombre debe tener al menos 2 caracteres")
        return value.strip()

    def validate_color(self, value):
        if not value.startswith('#') or len(value) != 7:
            raise serializers.ValidationError("El color debe ser un código hexadecimal válido, por ejemplo #007bff")
        return value

class ProjectStatusHistorySerializer(serializers.ModelSerializer):
    project = ProyectoSerializer(read_only=True)
    status = ProjectStatusSerializer(read_only=True)
    user = UserSerializer(read_only=True)
    project_id = serializers.IntegerField(write_only=True)
    status_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = ProjectStatusHistory
        fields = [
            'id', 'project', 'project_id', 'status', 'status_id', 'user', 'fecha_cambio', 'comentario'
        ]
        read_only_fields = ['id', 'project', 'status', 'user', 'fecha_cambio'] 