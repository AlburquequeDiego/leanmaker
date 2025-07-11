"""
Serializers para la app ratings.
"""

import json
from django.core.exceptions import ValidationError
from django.db import transaction
from projects.models import Proyecto
from users.models import User

class RatingSerializer:
    """Serializer para el modelo Rating"""
    
    @staticmethod
    def to_dict(rating):
        """Convierte un objeto Rating a diccionario"""
        return {
            'id': str(rating.id),
            'project_id': str(rating.project.id),
            'project_title': rating.project.title,
            'user_id': str(rating.user.id),
            'user_name': rating.user.full_name,
            'rating': rating.rating,
            'comment': rating.comment,
            'created_at': rating.created_at.isoformat(),
            'updated_at': rating.updated_at.isoformat()
        }
    
    @staticmethod
    def validate_data(data):
        """Valida los datos del rating"""
        errors = {}
        
        # Validar project_id
        if 'project_id' not in data:
            errors['project_id'] = 'El ID del proyecto es requerido'
        else:
            try:
                project = Proyecto.objects.get(id=data['project_id'])
                data['project'] = project
            except Proyecto.DoesNotExist:
                errors['project_id'] = 'El proyecto especificado no existe'
            except Exception as e:
                errors['project_id'] = f'Error al validar el proyecto: {str(e)}'
        
        # Validar rating
        if 'rating' not in data:
            errors['rating'] = 'La calificación es requerida'
        else:
            try:
                rating = int(data['rating'])
                if rating < 1 or rating > 5:
                    errors['rating'] = 'La calificación debe estar entre 1 y 5'
                else:
                    data['rating'] = rating
            except (ValueError, TypeError):
                errors['rating'] = 'La calificación debe ser un número entero'
        
        # Validar comment (opcional)
        if 'comment' in data and data['comment']:
            if len(data['comment']) > 1000:
                errors['comment'] = 'El comentario no puede exceder 1000 caracteres'
        
        return errors
    
    @staticmethod
    def create(data, user):
        """Crea un nuevo rating"""
        with transaction.atomic():
            # Verificar que el usuario no haya calificado este proyecto antes
            existing_rating = Rating.objects.filter(
                project=data['project'],
                user=user
            ).first()
            
            if existing_rating:
                raise ValidationError('Ya has calificado este proyecto')
            
            # Crear el rating
            rating = Rating.objects.create(
                project=data['project'],
                user=user,
                rating=data['rating'],
                comment=data.get('comment', '')
            )
            
            return rating
    
    @staticmethod
    def update(rating, data):
        """Actualiza un rating existente"""
        with transaction.atomic():
            if 'rating' in data:
                rating.rating = data['rating']
            
            if 'comment' in data:
                rating.comment = data['comment']
            
            rating.save()
            return rating

# Importar el modelo al final para evitar referencias circulares
from .models import Rating 