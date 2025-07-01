from rest_framework import serializers
from .models import Assignment
from projects.serializers import ProjectSerializer
# from applications.serializers import AplicacionSerializer  # No existe este módulo
from users.serializers import UserSerializer

class AssignmentSerializer(serializers.ModelSerializer):
    project = ProjectSerializer(read_only=True)
    # application = AplicacionSerializer(read_only=True)  # Comentado hasta que exista
    assigned_by = UserSerializer(read_only=True)
    assigned_to = UserSerializer(read_only=True)
    project_id = serializers.UUIDField(write_only=True)
    application_id = serializers.UUIDField(write_only=True)
    assigned_by_id = serializers.UUIDField(write_only=True)
    assigned_to_id = serializers.UUIDField(write_only=True)
    
    class Meta:
        model = Assignment
        fields = [
            'id', 'project', 'assigned_by', 'assigned_to',
            'project_id', 'application_id', 'assigned_by_id', 'assigned_to_id',
            'title', 'description', 'due_date', 'priority', 'status',
            'estimated_hours', 'actual_hours', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class AssignmentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = [
            'project', 'application', 'assigned_by', 'assigned_to',
            'title', 'description', 'due_date', 'priority', 'estimated_hours'
        ]

class AssignmentUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = [
            'title', 'description', 'due_date', 'priority', 'status',
            'estimated_hours', 'actual_hours', 'notes'
        ] 