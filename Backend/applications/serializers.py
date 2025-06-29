from rest_framework import serializers
from .models import Aplicacion
from projects.serializers import ProjectSerializer
from students.serializers import StudentSerializer

class ApplicationSerializer(serializers.ModelSerializer):
    project = ProjectSerializer(read_only=True)
    student = StudentSerializer(read_only=True)

    class Meta:
        model = Aplicacion
        fields = ['id', 'project', 'student', 'application_date', 'status', 'cover_letter']

class ApplicationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Aplicacion
        fields = ['project', 'cover_letter']
        
    def validate_project(self, value):
        """
        Verifica que el proyecto esté publicado y acepte postulaciones.
        """
        if value.status != 'PUBLISHED':
            raise serializers.ValidationError("Solo puedes postular a proyectos que estén publicados.")
        return value 
