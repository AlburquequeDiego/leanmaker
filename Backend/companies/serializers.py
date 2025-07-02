from rest_framework import serializers
from .models import Empresa, CalificacionEmpresa
from users.serializers import UsuarioSerializer

class EmpresaSerializer(serializers.ModelSerializer):
    user = UsuarioSerializer(read_only=True)
    technologies_used = serializers.SerializerMethodField()
    benefits_offered = serializers.SerializerMethodField()
    
    class Meta:
        model = Empresa
        fields = [
            'id', 'user', 'company_name', 'description', 'industry', 'size',
            'website', 'address', 'city', 'country', 'founded_year', 'logo_url',
            'verified', 'rating', 'total_projects', 'projects_completed',
            'total_hours_offered', 'technologies_used', 'benefits_offered',
            'remote_work_policy', 'internship_duration', 'stipend_range',
            'contact_email', 'contact_phone', 'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'rating', 'total_projects', 'projects_completed', 'created_at', 'updated_at']
    
    def get_technologies_used(self, obj):
        """Obtiene las tecnologías como lista"""
        return obj.get_technologies_list()
    
    def get_benefits_offered(self, obj):
        """Obtiene los beneficios como lista"""
        return obj.get_benefits_list()
    
    def to_representation(self, instance):
        """Convierte la instancia a diccionario para la API"""
        data = super().to_representation(instance)
        # Asegurar que el campo user sea un string (UUID)
        if instance.user:
            data['user'] = str(instance.user.id)
        return data

# Alias para compatibilidad
CompanySerializer = EmpresaSerializer

class EmpresaCreateSerializer(serializers.ModelSerializer):
    technologies_used = serializers.ListField(child=serializers.CharField(), required=False)
    benefits_offered = serializers.ListField(child=serializers.CharField(), required=False)
    
    class Meta:
        model = Empresa
        fields = [
            'company_name', 'description', 'industry', 'size', 'website',
            'address', 'city', 'country', 'founded_year', 'logo_url',
            'technologies_used', 'benefits_offered', 'remote_work_policy',
            'internship_duration', 'stipend_range', 'contact_email', 'contact_phone'
        ]
    
    def create(self, validated_data):
        # Manejar campos JSON
        technologies = validated_data.pop('technologies_used', [])
        benefits = validated_data.pop('benefits_offered', [])
        
        empresa = Empresa.objects.create(**validated_data)
        empresa.set_technologies_list(technologies)
        empresa.set_benefits_list(benefits)
        empresa.save()
        
        return empresa

class EmpresaUpdateSerializer(serializers.ModelSerializer):
    technologies_used = serializers.ListField(child=serializers.CharField(), required=False)
    benefits_offered = serializers.ListField(child=serializers.CharField(), required=False)
    
    class Meta:
        model = Empresa
        fields = [
            'company_name', 'description', 'industry', 'size', 'website',
            'address', 'city', 'country', 'founded_year', 'logo_url',
            'technologies_used', 'benefits_offered', 'remote_work_policy',
            'internship_duration', 'stipend_range', 'contact_email', 'contact_phone', 'status'
        ]
    
    def update(self, instance, validated_data):
        # Manejar campos JSON
        if 'technologies_used' in validated_data:
            instance.set_technologies_list(validated_data.pop('technologies_used'))
        if 'benefits_offered' in validated_data:
            instance.set_benefits_list(validated_data.pop('benefits_offered'))
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance

class CalificacionEmpresaSerializer(serializers.ModelSerializer):
    empresa = EmpresaSerializer(read_only=True)
    estudiante = UsuarioSerializer(read_only=True)
    
    class Meta:
        model = CalificacionEmpresa
        fields = [
            'id', 'empresa', 'estudiante', 'puntuacion', 'comentario',
            'comunicacion', 'flexibilidad', 'aprendizaje', 'ambiente_trabajo',
            'fecha_calificacion'
        ]
        read_only_fields = ['id', 'fecha_calificacion']

class CalificacionEmpresaCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CalificacionEmpresa
        fields = [
            'empresa', 'puntuacion', 'comentario', 'comunicacion',
            'flexibilidad', 'aprendizaje', 'ambiente_trabajo'
        ] 