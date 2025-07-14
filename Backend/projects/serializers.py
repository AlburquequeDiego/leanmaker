"""
Serializers para la app projects.
"""

import json
from django.core.exceptions import ValidationError
from django.db import transaction
from .models import Proyecto, HistorialEstadosProyecto, AplicacionProyecto, MiembroProyecto
from users.models import User
from companies.models import Empresa
from areas.models import Area
from trl_levels.models import TRLLevel
from project_status.models import ProjectStatus

class ProyectoSerializer:
    """Serializer para el modelo Proyecto"""
    
    @staticmethod
    def to_dict(proyecto):
        """Convierte un objeto Proyecto a diccionario"""
        return {
            'id': str(proyecto.id),
            'company_id': str(proyecto.company.id) if proyecto.company else None,
            'company_name': proyecto.company.company_name if proyecto.company else None,
            'status_id': proyecto.status.id if proyecto.status else None,
            'status_name': proyecto.status.name if proyecto.status else None,
            'area_id': proyecto.area.id if proyecto.area else None,
            'area_name': proyecto.area.name if proyecto.area else None,
            'title': proyecto.title,
            'description': proyecto.description,
            'requirements': proyecto.requirements,
            'trl_id': proyecto.trl.id if proyecto.trl else None,
            'trl_name': proyecto.trl.name if proyecto.trl else None,
            'api_level': proyecto.api_level,
            'required_hours': proyecto.required_hours,
            'min_api_level': proyecto.min_api_level,
            'max_students': proyecto.max_students,
            'current_students': proyecto.current_students,
            'duration_weeks': proyecto.duration_weeks,
            'hours_per_week': proyecto.hours_per_week,
            'start_date': proyecto.start_date.isoformat() if proyecto.start_date else None,
            'estimated_end_date': proyecto.estimated_end_date.isoformat() if proyecto.estimated_end_date else None,
            'real_end_date': proyecto.real_end_date.isoformat() if proyecto.real_end_date else None,
            'application_deadline': proyecto.application_deadline.isoformat() if proyecto.application_deadline else None,
            'modality': proyecto.modality,
            'location': proyecto.location,
            'difficulty': proyecto.difficulty,
            'required_skills': proyecto.get_required_skills_list(),
            'preferred_skills': proyecto.get_preferred_skills_list(),
            'tags': proyecto.get_tags_list(),
            'technologies': proyecto.get_technologies_list(),
            'benefits': proyecto.get_benefits_list(),
            'is_paid': proyecto.is_paid,
            'payment_amount': proyecto.payment_amount,
            'payment_currency': proyecto.payment_currency,
            'stipend_amount': proyecto.stipend_amount,
            'stipend_currency': proyecto.stipend_currency,
            'applications_count': proyecto.applications_count,
            'views_count': proyecto.views_count,
            'is_featured': proyecto.is_featured,
            'is_urgent': proyecto.is_urgent,
            'published_at': proyecto.published_at.isoformat() if proyecto.published_at else None,
            'created_at': proyecto.created_at.isoformat(),
            'updated_at': proyecto.updated_at.isoformat()
        }
    
    @staticmethod
    def validate_data(data):
        """Valida los datos del proyecto"""
        errors = {}
        
        # Validar campos requeridos
        required_fields = ['title', 'description', 'requirements']
        for field in required_fields:
            if field not in data or not data[field]:
                errors[field] = f'El campo {field} es requerido'
        
        # Validación TRL/API/horas ofrecidas y preguntas TRL
        API_MIN_HOURS = {1: 20, 2: 40, 3: 80, 4: 160}
        def get_api_from_trl(trl):
            trl = int(trl)
            if trl <= 2:
                return 1
            elif trl <= 4:
                return 2
            elif trl <= 6:
                return 3
            else:
                return 4
        # TRL y preguntas TRL
        trl = int(data.get('trl', 0) or data.get('trl_id', 0) or 0)
        trl_answers = data.get('trlAnswers')
        if trl:
            api_min = get_api_from_trl(trl)
            # Validar API mínimo
            if int(data.get('apiMin', api_min)) != api_min:
                errors['apiMin'] = f'El TRL seleccionado requiere API mínimo {api_min}.'
            # Validar horas ofrecidas
            min_hours = API_MIN_HOURS[api_min]
            horas = int(data.get('hours', 0) or data.get('required_hours', 0) or 0)
            if horas < min_hours:
                errors['hours'] = f'Las horas ofrecidas deben ser al menos {min_hours} para API {api_min}.'
            # Validar preguntas TRL
            trl_questions_count = 2
            if not isinstance(trl_answers, list) or len(trl_answers) != trl_questions_count or any(not ans for ans in trl_answers):
                errors['trlAnswers'] = 'Debes responder todas las preguntas TRL para el nivel seleccionado.'
        
        # Validar company_id
        if 'company_id' in data and data['company_id']:
            try:
                company = Empresa.objects.get(id=data['company_id'])
                data['company'] = company
            except Empresa.DoesNotExist:
                errors['company_id'] = 'La empresa especificada no existe'
            except Exception as e:
                errors['company_id'] = f'Error al validar la empresa: {str(e)}'
        
        # Validar status_id
        if 'status_id' in data and data['status_id']:
            try:
                status = ProjectStatus.objects.get(id=data['status_id'])
                data['status'] = status
            except ProjectStatus.DoesNotExist:
                errors['status_id'] = 'El estado especificado no existe'
            except Exception as e:
                errors['status_id'] = f'Error al validar el estado: {str(e)}'
        
        # Validar area_id
        if 'area_id' in data and data['area_id']:
            try:
                area = Area.objects.get(id=data['area_id'])
                data['area'] = area
            except Area.DoesNotExist:
                errors['area_id'] = 'El área especificada no existe'
            except Exception as e:
                errors['area_id'] = f'Error al validar el área: {str(e)}'
        
        # Validar trl_id
        if 'trl_id' in data and data['trl_id']:
            try:
                trl = TRLLevel.objects.get(id=data['trl_id'])
                data['trl'] = trl
            except TRLLevel.DoesNotExist:
                errors['trl_id'] = 'El nivel TRL especificado no existe'
            except Exception as e:
                errors['trl_id'] = f'Error al validar el nivel TRL: {str(e)}'
        
        # Validar campos numéricos
        numeric_fields = ['max_students', 'duration_weeks', 'hours_per_week', 'payment_amount', 'stipend_amount']
        for field in numeric_fields:
            if field in data and data[field] is not None:
                try:
                    value = int(data[field])
                    if value < 0:
                        errors[field] = f'El campo {field} no puede ser negativo'
                    data[field] = value
                except (ValueError, TypeError):
                    errors[field] = f'El campo {field} debe ser un número entero'
        
        # Validar campos de texto
        if 'title' in data and data['title']:
            if len(data['title'].strip()) < 5:
                errors['title'] = 'El título debe tener al menos 5 caracteres'
            data['title'] = data['title'].strip()
        
        if 'description' in data and data['description']:
            if len(data['description'].strip()) < 20:
                errors['description'] = 'La descripción debe tener al menos 20 caracteres'
            data['description'] = data['description'].strip()
        
        if 'requirements' in data and data['requirements']:
            if len(data['requirements'].strip()) < 10:
                errors['requirements'] = 'Los requisitos deben tener al menos 10 caracteres'
            data['requirements'] = data['requirements'].strip()
        
        return errors
    
    @staticmethod
    def create(data, user):
        """Crea un nuevo proyecto"""
        with transaction.atomic():
            proyecto = Proyecto.objects.create(
                company=data.get('company'),
                status=data.get('status'),
                area=data.get('area'),
                title=data['title'],
                description=data['description'],
                requirements=data['requirements'],
                trl=data.get('trl'),
                api_level=data.get('api_level', 1),
                required_hours=data.get('required_hours', 0),
                min_api_level=data.get('min_api_level', 1),
                max_students=data.get('max_students', 1),
                duration_weeks=data.get('duration_weeks', 1),
                hours_per_week=data.get('hours_per_week', 1),
                start_date=data.get('start_date'),
                estimated_end_date=data.get('estimated_end_date'),
                application_deadline=data.get('application_deadline'),
                modality=data.get('modality', 'presencial'),
                location=data.get('location', ''),
                difficulty=data.get('difficulty', 'intermedio'),
                required_skills=data.get('required_skills', '[]'),
                preferred_skills=data.get('preferred_skills', '[]'),
                tags=data.get('tags', '[]'),
                technologies=data.get('technologies', '[]'),
                benefits=data.get('benefits', '[]'),
                is_paid=data.get('is_paid', False),
                payment_amount=data.get('payment_amount', 0),
                payment_currency=data.get('payment_currency', 'USD'),
                stipend_amount=data.get('stipend_amount', 0),
                stipend_currency=data.get('stipend_currency', 'USD'),
                is_featured=data.get('is_featured', False),
                is_urgent=data.get('is_urgent', False)
            )
            
            return proyecto
    
    @staticmethod
    def update(proyecto, data):
        """Actualiza un proyecto existente"""
        with transaction.atomic():
            # Actualizar campos básicos
            basic_fields = [
                'title', 'description', 'requirements', 'api_level', 'required_hours',
                'min_api_level', 'max_students', 'duration_weeks', 'hours_per_week',
                'start_date', 'estimated_end_date', 'application_deadline', 'modality',
                'location', 'difficulty', 'required_skills', 'preferred_skills',
                'tags', 'technologies', 'benefits', 'is_paid', 'payment_amount',
                'payment_currency', 'stipend_amount', 'stipend_currency',
                'is_featured', 'is_urgent'
            ]
            
            for field in basic_fields:
                if field in data:
                    setattr(proyecto, field, data[field])
            
            # Actualizar relaciones
            if 'company' in data:
                proyecto.company = data['company']
            if 'status' in data:
                proyecto.status = data['status']
            if 'area' in data:
                proyecto.area = data['area']
            if 'trl' in data:
                proyecto.trl = data['trl']
            
            proyecto.save()
            return proyecto

class AplicacionProyectoSerializer:
    """Serializer para el modelo AplicacionProyecto"""
    
    @staticmethod
    def to_dict(aplicacion):
        """Convierte un objeto AplicacionProyecto a diccionario"""
        return {
            'id': str(aplicacion.id),
            'proyecto_id': str(aplicacion.proyecto.id),
            'proyecto_title': aplicacion.proyecto.title,
            'estudiante_id': str(aplicacion.estudiante.id),
            'estudiante_name': aplicacion.estudiante.full_name,
            'cover_letter': aplicacion.cover_letter,
            'estado': aplicacion.estado,
            'compatibility_score': aplicacion.compatibility_score,
            'applied_at': aplicacion.applied_at.isoformat() if aplicacion.applied_at else None,
            'reviewed_at': aplicacion.reviewed_at.isoformat() if aplicacion.reviewed_at else None,
            'responded_at': aplicacion.responded_at.isoformat() if aplicacion.responded_at else None,
            'company_notes': aplicacion.company_notes,
            'student_notes': aplicacion.student_notes,
            'portfolio_url': aplicacion.portfolio_url,
            'github_url': aplicacion.github_url,
            'linkedin_url': aplicacion.linkedin_url,
            'created_at': aplicacion.created_at.isoformat(),
            'updated_at': aplicacion.updated_at.isoformat()
        }
    
    @staticmethod
    def validate_data(data):
        """Valida los datos de la aplicación"""
        errors = {}
        
        # Validar proyecto_id
        if 'proyecto_id' not in data:
            errors['proyecto_id'] = 'El ID del proyecto es requerido'
        else:
            try:
                proyecto = Proyecto.objects.get(id=data['proyecto_id'])
                data['proyecto'] = proyecto
            except Proyecto.DoesNotExist:
                errors['proyecto_id'] = 'El proyecto especificado no existe'
            except Exception as e:
                errors['proyecto_id'] = f'Error al validar el proyecto: {str(e)}'
        
        # Validar cover_letter
        if 'cover_letter' not in data or not data['cover_letter']:
            errors['cover_letter'] = 'La carta de presentación es requerida'
        elif len(data['cover_letter'].strip()) < 50:
            errors['cover_letter'] = 'La carta de presentación debe tener al menos 50 caracteres'
        else:
            data['cover_letter'] = data['cover_letter'].strip()
        
        # Validar compatibility_score
        if 'compatibility_score' in data and data['compatibility_score'] is not None:
            try:
                score = float(data['compatibility_score'])
                if score < 0 or score > 100:
                    errors['compatibility_score'] = 'El puntaje de compatibilidad debe estar entre 0 y 100'
                data['compatibility_score'] = score
            except (ValueError, TypeError):
                errors['compatibility_score'] = 'El puntaje de compatibilidad debe ser un número'
        
        return errors
    
    @staticmethod
    def create(data, user):
        """Crea una nueva aplicación"""
        with transaction.atomic():
            # Verificar que el usuario no haya aplicado antes
            existing_application = AplicacionProyecto.objects.filter(
                proyecto=data['proyecto'],
                estudiante=user
            ).first()
            
            if existing_application:
                raise ValidationError('Ya has aplicado a este proyecto')
            
            # Crear la aplicación
            aplicacion = AplicacionProyecto.objects.create(
                proyecto=data['proyecto'],
                estudiante=user,
                cover_letter=data['cover_letter'],
                estado=data.get('estado', 'pendiente'),
                compatibility_score=data.get('compatibility_score'),
                company_notes=data.get('company_notes', ''),
                student_notes=data.get('student_notes', ''),
                portfolio_url=data.get('portfolio_url', ''),
                github_url=data.get('github_url', ''),
                linkedin_url=data.get('linkedin_url', '')
            )
            
            return aplicacion
    
    @staticmethod
    def update(aplicacion, data):
        """Actualiza una aplicación existente"""
        with transaction.atomic():
            # Solo permitir actualizar ciertos campos
            allowed_fields = [
                'estado', 'compatibility_score', 'company_notes', 'student_notes',
                'portfolio_url', 'github_url', 'linkedin_url'
            ]
            
            for field in allowed_fields:
                if field in data:
                    setattr(aplicacion, field, data[field])
            
            aplicacion.save()
            return aplicacion 