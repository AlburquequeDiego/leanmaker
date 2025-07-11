"""
Serializers para la app documents.
"""

import json
from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone
from .models import Document
from users.models import User
from projects.models import Proyecto

class DocumentSerializer:
    """Serializer para el modelo Document"""
    
    @staticmethod
    def to_dict(document):
        """Convierte un objeto Document a diccionario"""
        return {
            'id': str(document.id),
            'title': document.title,
            'description': document.description,
            'document_type': document.document_type,
            'file': document.file.url if document.file else None,
            'file_url': document.file_url,
            'file_type': document.file_type,
            'file_size': document.file_size,
            'file_size_mb': round(document.file_size / (1024 * 1024), 2) if document.file_size else 0,
            'file_extension': document.file.name.split('.')[-1].lower() if document.file and '.' in document.file.name else None,
            'uploaded_by_id': str(document.uploaded_by.id) if document.uploaded_by else None,
            'uploaded_by_name': document.uploaded_by.full_name if document.uploaded_by else None,
            'project_id': str(document.project.id) if document.project else None,
            'project_title': document.project.title if document.project else None,
            'is_public': document.is_public,
            'download_count': document.download_count,
            'created_at': document.created_at.isoformat(),
            'updated_at': document.updated_at.isoformat()
        }
    
    @staticmethod
    def validate_data(data):
        """Valida los datos del documento"""
        errors = {}
        
        # Validar título
        if 'title' in data:
            title = data['title'].strip()
            if len(title) < 3:
                errors['title'] = 'El título debe tener al menos 3 caracteres'
            data['title'] = title
        
        # Validar project_id
        if 'project_id' in data and data['project_id']:
            try:
                project = Proyecto.objects.get(id=data['project_id'])
                data['project'] = project
            except Proyecto.DoesNotExist:
                errors['project_id'] = 'El proyecto especificado no existe'
            except Exception as e:
                errors['project_id'] = f'Error al validar el proyecto: {str(e)}'
        
        # Validar document_type
        if 'document_type' in data:
            valid_types = [choice[0] for choice in Document.DOCUMENT_TYPE_CHOICES]
            if data['document_type'] not in valid_types:
                errors['document_type'] = 'Tipo de documento no válido'
        
        return errors
    
    @staticmethod
    def create(data, user):
        """Crea un nuevo documento"""
        with transaction.atomic():
            document = Document.objects.create(
                title=data.get('title'),
                description=data.get('description', ''),
                document_type=data.get('document_type', 'other'),
                file=data.get('file'),
                uploaded_by=user,
                project=data.get('project'),
                is_public=data.get('is_public', False)
            )
            
            # Calcular información del archivo
            if document.file:
                document.file_url = document.file.url if hasattr(document.file, 'url') else ''
                document.file_type = document.file.content_type
                document.file_size = document.file.size
                document.save(update_fields=['file_url', 'file_type', 'file_size'])
            
            return document
    
    @staticmethod
    def update(document, data):
        """Actualiza un documento existente"""
        with transaction.atomic():
            # Actualizar campos básicos
            basic_fields = [
                'title', 'description', 'document_type', 'is_public'
            ]
            
            for field in basic_fields:
                if field in data:
                    setattr(document, field, data[field])
            
            # Actualizar archivo si se proporciona
            if 'file' in data:
                document.file = data['file']
                document.file_url = document.file.url if hasattr(document.file, 'url') else ''
                document.file_type = document.file.content_type
                document.file_size = document.file.size
            
            # Actualizar proyecto si se proporciona
            if 'project' in data:
                document.project = data['project']
            
            document.save()
            return document

class DocumentListSerializer:
    """Serializer para listar documentos"""
    
    @staticmethod
    def to_dict(document):
        """Convierte un objeto Document a diccionario para listado"""
        return {
            'id': str(document.id),
            'title': document.title,
            'description': document.description,
            'document_type': document.document_type,
            'file_url': document.file_url,
            'file_type': document.file_type,
            'file_size_mb': round(document.file_size / (1024 * 1024), 2) if document.file_size else 0,
            'file_extension': document.file.name.split('.')[-1].lower() if document.file and '.' in document.file.name else None,
            'uploaded_by_name': document.uploaded_by.full_name if document.uploaded_by else None,
            'project_title': document.project.title if document.project else None,
            'is_public': document.is_public,
            'download_count': document.download_count,
            'created_at': document.created_at.isoformat()
        } 