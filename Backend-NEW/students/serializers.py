
from .models import Estudiante, PerfilEstudiante
import json

class EstudianteSerializer(serializers.ModelSerializer):
    # Campos calculados
    skills = serializers.SerializerMethodField()
    languages = serializers.SerializerMethodField()
    
    class Meta:
        model = Estudiante
        fields = [
            'id', 'user', 'career', 'semester', 'graduation_year', 'status', 'api_level',
            'strikes', 'gpa', 'completed_projects', 'total_hours', 'experience_years',
            'portfolio_url', 'github_url', 'linkedin_url', 'availability', 'location',
            'rating', 'skills', 'languages', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_skills(self, obj):
        """Obtiene las habilidades como lista"""
        return obj.get_skills_list()
    
    def get_languages(self, obj):
        """Obtiene los idiomas como lista"""
        return obj.get_languages_list()
    
    def to_representation(self, instance):
        """Convierte la instancia a diccionario para la API"""
        data = super().to_representation(instance)
        # Asegurar que el campo user sea un string (UUID)
        if instance.user:
            data['user'] = str(instance.user.id)
        # Asegurar que el ID sea string
        data['id'] = str(instance.id)
        return data

# Alias para compatibilidad
StudentSerializer = EstudianteSerializer

class EstudianteCreateSerializer(serializers.ModelSerializer):
    skills = serializers.ListField(child=serializers.CharField(), required=False)
    languages = serializers.ListField(child=serializers.CharField(), required=False)
    
    class Meta:
        model = Estudiante
        fields = [
            'career', 'semester', 'graduation_year', 'status', 'api_level',
            'strikes', 'gpa', 'completed_projects', 'total_hours', 'experience_years',
            'portfolio_url', 'github_url', 'linkedin_url', 'availability', 'location',
            'rating', 'skills', 'languages'
        ]
    
    def create(self, validated_data):
        # Manejar campos JSON
        skills = validated_data.pop('skills', [])
        languages = validated_data.pop('languages', [])
        
        estudiante = Estudiante.objects.create(**validated_data)
        estudiante.set_skills_list(skills)
        estudiante.set_languages_list(languages)
        estudiante.save()
        
        return estudiante

class EstudianteUpdateSerializer(serializers.ModelSerializer):
    skills = serializers.ListField(child=serializers.CharField(), required=False)
    languages = serializers.ListField(child=serializers.CharField(), required=False)
    
    class Meta:
        model = Estudiante
        fields = [
            'career', 'semester', 'graduation_year', 'status', 'api_level',
            'strikes', 'gpa', 'completed_projects', 'total_hours', 'experience_years',
            'portfolio_url', 'github_url', 'linkedin_url', 'availability', 'location',
            'rating', 'skills', 'languages'
        ]
    
    def update(self, instance, validated_data):
        # Manejar campos JSON
        if 'skills' in validated_data:
            instance.set_skills_list(validated_data.pop('skills'))
        if 'languages' in validated_data:
            instance.set_languages_list(validated_data.pop('languages'))
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance

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