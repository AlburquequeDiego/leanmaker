# Serializers simples para Django puro + TypeScript
# Sin REST Framework, solo Django

import json
from django.core.serializers.json import DjangoJSONEncoder
from .models import Empresa, CalificacionEmpresa
from users.serializers import UserSerializer

class EmpresaSerializer:
    """Serializer simple para convertir Empresa a JSON para TypeScript"""
    
    @staticmethod
    def to_dict(empresa):
        """Convierte una empresa a diccionario para JSON"""
        if not empresa:
            return {}
        
        return {
            'id': str(empresa.id),
            'user': UserSerializer.to_dict(empresa.user) if empresa.user else None,
            'company_name': empresa.company_name,
            'description': empresa.description,
            'industry': empresa.industry,
            'size': empresa.size,
            'website': empresa.website,
            'address': empresa.address,
            'city': empresa.city,
            'country': empresa.country,
            'founded_year': empresa.founded_year,
            'logo_url': empresa.logo_url,
            'verified': empresa.verified,
            'rating': empresa.rating,
            'total_projects': empresa.total_projects,
            'projects_completed': empresa.projects_completed,
            'total_hours_offered': empresa.total_hours_offered,
            'technologies_used': empresa.get_technologies_list() if hasattr(empresa, 'get_technologies_list') else [],
            'benefits_offered': empresa.get_benefits_list() if hasattr(empresa, 'get_benefits_list') else [],
            'remote_work_policy': empresa.remote_work_policy,
            'internship_duration': empresa.internship_duration,
            'stipend_range': empresa.stipend_range,
            'contact_email': empresa.contact_email,
            'contact_phone': empresa.contact_phone,
            'status': empresa.status,
            'created_at': empresa.created_at.isoformat() if empresa.created_at else None,
            'updated_at': empresa.updated_at.isoformat() if empresa.updated_at else None,
        }
    
    @staticmethod
    def to_json(empresa):
        """Convierte una empresa a JSON string"""
        return json.dumps(EmpresaSerializer.to_dict(empresa), cls=DjangoJSONEncoder)

# Alias para compatibilidad
CompanySerializer = EmpresaSerializer

class CalificacionEmpresaSerializer:
    """Serializer simple para convertir CalificacionEmpresa a JSON para TypeScript"""
    
    @staticmethod
    def to_dict(calificacion):
        """Convierte una calificación a diccionario para JSON"""
        if not calificacion:
            return {}
        
        return {
            'id': str(calificacion.id),
            'empresa': EmpresaSerializer.to_dict(calificacion.empresa) if calificacion.empresa else None,
            'estudiante': UserSerializer.to_dict(calificacion.estudiante) if calificacion.estudiante else None,
            'puntuacion': calificacion.puntuacion,
            'comentario': calificacion.comentario,
            'comunicacion': calificacion.comunicacion,
            'flexibilidad': calificacion.flexibilidad,
            'aprendizaje': calificacion.aprendizaje,
            'ambiente_trabajo': calificacion.ambiente_trabajo,
            'fecha_calificacion': calificacion.fecha_calificacion.isoformat() if calificacion.fecha_calificacion else None,
        }
    
    @staticmethod
    def to_json(calificacion):
        """Convierte una calificación a JSON string"""
        return json.dumps(CalificacionEmpresaSerializer.to_dict(calificacion), cls=DjangoJSONEncoder) 