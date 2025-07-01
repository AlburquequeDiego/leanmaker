from rest_framework import serializers
from .models import Estudiante, PerfilEstudiante

class EstudianteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Estudiante
        fields = '__all__'

# Alias para compatibilidad
StudentSerializer = EstudianteSerializer

class EstudianteCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Estudiante
        fields = '__all__'

class EstudianteUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Estudiante
        fields = '__all__'

class PerfilEstudianteSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerfilEstudiante
        fields = '__all__'

class PerfilEstudianteCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerfilEstudiante
        fields = '__all__'

class PerfilEstudianteUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerfilEstudiante
        fields = '__all__' 