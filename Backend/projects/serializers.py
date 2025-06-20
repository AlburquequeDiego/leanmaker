from rest_framework import serializers
from .models import Project
from companies.serializers import CompanySerializer

class ProjectSerializer(serializers.ModelSerializer):
    # Usamos un serializer anidado para mostrar info de la empresa, pero solo de lectura
    company = CompanySerializer(read_only=True)

    class Meta:
        model = Project
        fields = [
            'id', 'title', 'description', 'requirements', 'duration_in_weeks',
            'positions_to_fill', 'company', 'status', 'created_at'
        ]
        read_only_fields = ['id', 'company', 'status', 'created_at']


class ProjectCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = [
            'title', 'description', 'requirements', 'duration_in_weeks', 'positions_to_fill'
        ] 