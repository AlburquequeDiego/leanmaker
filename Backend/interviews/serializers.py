"""
Serializers para la app interviews.
"""

import json
from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone
from .models import Interview
from users.models import User

class InterviewSerializer:
    """Serializer para el modelo Interview"""
    
    @staticmethod
    def to_dict(interview):
        """Convierte un objeto Interview a diccionario"""
        return {
            'id': str(interview.id),
            'application_id': str(interview.application.id) if interview.application else None,
            'application_title': interview.application.project.title if interview.application and interview.application.project else None,
            'interviewer_id': str(interview.interviewer.id) if interview.interviewer else None,
            'interviewer_name': interview.interviewer.full_name if interview.interviewer else None,
            'interview_date': interview.interview_date.isoformat() if interview.interview_date else None,
            'duration_minutes': interview.duration_minutes,
            'status': interview.status,
            'notes': interview.notes,
            'feedback': interview.feedback,
            'rating': interview.rating,
            'interview_type': interview.interview_type,
            'created_at': interview.created_at.isoformat(),
            'updated_at': interview.updated_at.isoformat()
        }
    
    @staticmethod
    def validate_data(data):
        """Valida los datos de la entrevista"""
        errors = {}
        
        # Validar application_id
        if 'application_id' in data and data['application_id']:
            try:
                from applications.models import Aplicacion
                application = Aplicacion.objects.get(id=data['application_id'])
                data['application'] = application
            except Aplicacion.DoesNotExist:
                errors['application_id'] = 'La aplicación especificada no existe'
            except Exception as e:
                errors['application_id'] = f'Error al validar la aplicación: {str(e)}'
        
        # Validar interview_date
        if 'interview_date' in data and data['interview_date']:
            try:
                interview_date = timezone.datetime.fromisoformat(data['interview_date'].replace('Z', '+00:00'))
                if interview_date <= timezone.now():
                    errors['interview_date'] = 'La fecha de entrevista debe ser futura'
                data['interview_date'] = interview_date
            except (ValueError, TypeError):
                errors['interview_date'] = 'Formato de fecha inválido'
        
        # Validar duration_minutes
        if 'duration_minutes' in data:
            try:
                duration = int(data['duration_minutes'])
                if duration < 15 or duration > 480:
                    errors['duration_minutes'] = 'La duración debe estar entre 15 y 480 minutos'
                data['duration_minutes'] = duration
            except (ValueError, TypeError):
                errors['duration_minutes'] = 'La duración debe ser un número entero'
        
        # Validar rating
        if 'rating' in data and data['rating'] is not None:
            try:
                rating = float(data['rating'])
                if rating < 1 or rating > 5:
                    errors['rating'] = 'La calificación debe estar entre 1 y 5'
                data['rating'] = rating
            except (ValueError, TypeError):
                errors['rating'] = 'La calificación debe ser un número'
        
        # Validar status
        if 'status' in data:
            valid_statuses = [choice[0] for choice in Interview.STATUS_CHOICES]
            if data['status'] not in valid_statuses:
                errors['status'] = 'Estado de entrevista no válido'
        
        # Validar interview_type
        if 'interview_type' in data:
            valid_types = [choice[0] for choice in Interview.INTERVIEW_TYPE_CHOICES]
            if data['interview_type'] not in valid_types:
                errors['interview_type'] = 'Tipo de entrevista no válido'
        
        return errors
    
    @staticmethod
    def create(data, user):
        """Crea una nueva entrevista"""
        with transaction.atomic():
            interview = Interview.objects.create(
                application=data.get('application'),
                interviewer=user,
                interview_date=data.get('interview_date'),
                duration_minutes=data.get('duration_minutes', 60),
                status=data.get('status', 'scheduled'),
                notes=data.get('notes', ''),
                feedback=data.get('feedback', ''),
                rating=data.get('rating'),
                interview_type=data.get('interview_type', 'technical')
            )
            
            return interview
    
    @staticmethod
    def update(interview, data):
        """Actualiza una entrevista existente"""
        with transaction.atomic():
            # Actualizar campos básicos
            basic_fields = [
                'interview_date', 'duration_minutes', 'status', 'notes',
                'feedback', 'rating', 'interview_type'
            ]
            
            for field in basic_fields:
                if field in data:
                    setattr(interview, field, data[field])
            
            # Actualizar relaciones
            if 'application' in data:
                interview.application = data['application']
            
            # Marcar como completada si se proporciona feedback
            if 'feedback' in data and data['feedback']:
                interview.status = 'completed'
            
            interview.save()
            return interview

class InterviewFeedbackSerializer:
    """Serializer para actualizar feedback y calificación"""
    
    @staticmethod
    def validate_data(data):
        """Valida los datos del feedback"""
        errors = {}
        
        # Validar rating
        if 'rating' in data and data['rating'] is not None:
            try:
                rating = float(data['rating'])
                if rating < 1 or rating > 5:
                    errors['rating'] = 'La calificación debe estar entre 1 y 5'
                data['rating'] = rating
            except (ValueError, TypeError):
                errors['rating'] = 'La calificación debe ser un número'
        
        return errors
    
    @staticmethod
    def update(interview, data):
        """Actualiza el feedback de una entrevista"""
        with transaction.atomic():
            # Actualizar campos de feedback
            if 'feedback' in data:
                interview.feedback = data['feedback']
            if 'rating' in data:
                interview.rating = data['rating']
            if 'notes' in data:
                interview.notes = data['notes']
            
            # Marcar como completada si se proporciona feedback
            if 'feedback' in data and data['feedback']:
                interview.status = 'completed'
            
            interview.save()
            return interview

class InterviewScheduleSerializer:
    """Serializer para programar entrevistas"""
    
    @staticmethod
    def validate_data(data):
        """Valida los datos para programar entrevista"""
        errors = {}
        
        # Validar application_id
        if 'application_id' not in data or not data['application_id']:
            errors['application_id'] = 'El ID de la aplicación es requerido'
        else:
            try:
                from applications.models import Aplicacion
                application = Aplicacion.objects.get(id=data['application_id'])
                data['application'] = application
            except Aplicacion.DoesNotExist:
                errors['application_id'] = 'La aplicación especificada no existe'
            except Exception as e:
                errors['application_id'] = f'Error al validar la aplicación: {str(e)}'
        
        # Validar interview_date
        if 'interview_date' not in data or not data['interview_date']:
            errors['interview_date'] = 'La fecha de entrevista es requerida'
        else:
            try:
                interview_date = timezone.datetime.fromisoformat(data['interview_date'].replace('Z', '+00:00'))
                if interview_date <= timezone.now():
                    errors['interview_date'] = 'La fecha de entrevista debe ser futura'
                data['interview_date'] = interview_date
            except (ValueError, TypeError):
                errors['interview_date'] = 'Formato de fecha inválido'
        
        # Validar duration_minutes
        if 'duration_minutes' in data:
            try:
                duration = int(data['duration_minutes'])
                if duration < 15 or duration > 480:
                    errors['duration_minutes'] = 'La duración debe estar entre 15 y 480 minutos'
                data['duration_minutes'] = duration
            except (ValueError, TypeError):
                errors['duration_minutes'] = 'La duración debe ser un número entero'
        
        return errors
    
    @staticmethod
    def create(data, user):
        """Crea una nueva entrevista programada"""
        with transaction.atomic():
            interview = Interview.objects.create(
                application=data['application'],
                interviewer=user,
                interview_date=data['interview_date'],
                duration_minutes=data.get('duration_minutes', 60),
                status='scheduled',
                notes=data.get('notes', ''),
                interview_type=data.get('interview_type', 'technical')
            )
            
            return interview 