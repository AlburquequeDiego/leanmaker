from rest_framework import serializers
from .models import Empresa, CalificacionEmpresa
from users.serializers import UserSerializer

class EmpresaSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
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

# Alias para compatibilidad
CompanySerializer = EmpresaSerializer

class EmpresaCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empresa
        fields = [
            'company_name', 'description', 'industry', 'size', 'website',
            'address', 'city', 'country', 'founded_year', 'logo_url',
            'technologies_used', 'benefits_offered', 'remote_work_policy',
            'internship_duration', 'stipend_range', 'contact_email', 'contact_phone'
        ]

class EmpresaUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empresa
        fields = [
            'company_name', 'description', 'industry', 'size', 'website',
            'address', 'city', 'country', 'founded_year', 'logo_url',
            'technologies_used', 'benefits_offered', 'remote_work_policy',
            'internship_duration', 'stipend_range', 'contact_email', 'contact_phone', 'status'
        ]

class CalificacionEmpresaSerializer(serializers.ModelSerializer):
    empresa = EmpresaSerializer(read_only=True)
    estudiante = UserSerializer(read_only=True)
    
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