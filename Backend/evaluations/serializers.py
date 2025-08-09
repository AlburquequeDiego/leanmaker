"""
Serializers para la app evaluations.
"""

import json
from django.core.exceptions import ValidationError
from django.db import transaction
from .models import Evaluation, StudentSkill, StudentPortfolio, StudentAchievement
from users.models import User
from projects.models import Proyecto


class EvaluationSerializer:
    """Serializer para el modelo Evaluation"""
    
    @staticmethod
    def to_dict(evaluation):
        """Convierte un objeto Evaluation a diccionario"""
        return {
            'id': str(evaluation.id),
            'project_id': str(evaluation.project.id) if evaluation.project else None,
            'project_title': evaluation.project.title if evaluation.project else None,
            'student_id': evaluation.student.id,  # Integer
            'student_name': evaluation.student.user.full_name if hasattr(evaluation.student, 'user') else '',
            'student_user_id': evaluation.student.user.id if hasattr(evaluation.student, 'user') else '',
            'evaluator_id': str(evaluation.evaluator.id) if evaluation.evaluator else None,
            'evaluator_name': evaluation.evaluator.full_name if evaluation.evaluator else None,
            'evaluation_type': evaluation.evaluation_type,
            'criteria_scores': evaluation.criteria_scores,
            'score': evaluation.score,
            'evaluation_date': evaluation.evaluation_date.isoformat() if evaluation.evaluation_date else None,
            'status': evaluation.status,
            'type': evaluation.type,
            'overall_rating': evaluation.overall_rating,
            'strengths': evaluation.strengths,
            'areas_for_improvement': evaluation.areas_for_improvement,
            'project_duration': evaluation.project_duration,
            'technologies': evaluation.technologies,
            'deliverables': evaluation.deliverables,
            'created_at': evaluation.created_at.isoformat(),
            'updated_at': evaluation.updated_at.isoformat(),
            'criteria_scores': evaluation.criteria_scores or {}
        }
    
    @staticmethod
    def validate_data(data):
        """Valida los datos de la evaluación"""
        errors = {}
        
        # Validar project_id
        if 'project_id' in data and data['project_id']:
            try:
                project = Proyecto.objects.get(id=data['project_id'])
                data['project'] = project
            except Proyecto.DoesNotExist:
                errors['project_id'] = 'El proyecto especificado no existe'
            except Exception as e:
                errors['project_id'] = f'Error al validar el proyecto: {str(e)}'
        
        # Validar student_id
        if 'student_id' in data and data['student_id']:
            try:
                from students.models import Estudiante
                student = Estudiante.objects.get(id=data['student_id'])
                data['student'] = student
            except Estudiante.DoesNotExist:
                errors['student_id'] = 'El estudiante especificado no existe'
            except Exception as e:
                errors['student_id'] = f'Error al validar el estudiante: {str(e)}'
        
        # Validar evaluation_type
        if 'evaluation_type' in data and data['evaluation_type']:
            valid_types = ['company_to_student', 'student_to_company']
            if data['evaluation_type'] not in valid_types:
                errors['evaluation_type'] = 'El tipo de evaluación debe ser company_to_student o student_to_company'
        
        # Validar score
        if 'score' in data:
            try:
                score = float(data['score'])
                if score < 1 or score > 5:
                    errors['score'] = 'El puntaje debe estar entre 1 y 5'
                data['score'] = score
            except (ValueError, TypeError):
                errors['score'] = 'El puntaje debe ser un número'
        
        # Validar overall_rating
        if 'overall_rating' in data:
            try:
                rating = float(data['overall_rating'])
                if rating < 0 or rating > 5:
                    errors['overall_rating'] = 'La calificación general debe estar entre 0 y 5'
                data['overall_rating'] = rating
            except (ValueError, TypeError):
                errors['overall_rating'] = 'La calificación general debe ser un número'
        
        # Validar campos de texto
        if 'strengths' in data and data['strengths']:
            strengths_list = [s.strip() for s in data['strengths'].split(',') if s.strip()]
            if len(strengths_list) < 1:
                errors['strengths'] = 'Debe especificar al menos una fortaleza'
        
        if 'areas_for_improvement' in data and data['areas_for_improvement']:
            areas_list = [a.strip() for a in data['areas_for_improvement'].split(',') if a.strip()]
            if len(areas_list) < 1:
                errors['areas_for_improvement'] = 'Debe especificar al menos un área de mejora'
        
        return errors
    
    @staticmethod
    def create(data, user):
        """Crea una nueva evaluación"""
        with transaction.atomic():
            evaluation = Evaluation.objects.create(
                project=data.get('project'),
                student=data.get('student'),
                evaluator=user,
                evaluation_type=data.get('evaluation_type', 'company_to_student'),
                score=data.get('score', 0),
                status=data.get('status', 'pendiente'),
                type=data.get('type', 'proyecto'),
                overall_rating=data.get('overall_rating', 0),
                strengths=data.get('strengths', ''),
                areas_for_improvement=data.get('areas_for_improvement', ''),
                project_duration=data.get('project_duration', ''),
                technologies=data.get('technologies', ''),
                deliverables=data.get('deliverables', '')
            )
            
            return evaluation
    
    @staticmethod
    def update(evaluation, data):
        """Actualiza una evaluación existente"""
        with transaction.atomic():
            # Actualizar campos básicos
            basic_fields = [
                'score', 'status', 'type', 'overall_rating',
                'strengths', 'areas_for_improvement', 'project_duration',
                'technologies', 'deliverables'
            ]
            
            for field in basic_fields:
                if field in data:
                    setattr(evaluation, field, data[field])
            
            # Actualizar relaciones
            if 'project' in data:
                evaluation.project = data['project']
            if 'student' in data:
                evaluation.student = data['student']
            if 'evaluation_type' in data:
                evaluation.evaluation_type = data['evaluation_type']
            
            evaluation.save()
            return evaluation



class StudentSkillSerializer:
    """Serializer para el modelo StudentSkill"""
    
    @staticmethod
    def to_dict(skill):
        """Convierte un objeto StudentSkill a diccionario"""
        return {
            'id': str(skill.id),
            'student_id': str(skill.student.id),
            'student_name': skill.student.full_name,
            'skill_name': skill.skill_name,
            'level': skill.level,
            'years_experience': skill.years_experience,
            'is_verified': skill.is_verified,
            'verified_by_id': str(skill.verified_by.id) if skill.verified_by else None,
            'verified_by_name': skill.verified_by.full_name if skill.verified_by else None,
            'verified_at': skill.verified_at.isoformat() if skill.verified_at else None,
            'created_at': skill.created_at.isoformat(),
            'updated_at': skill.updated_at.isoformat()
        }
    
    @staticmethod
    def validate_data(data):
        """Valida los datos de la habilidad"""
        errors = {}
        
        # Validar skill_name
        if 'skill_name' not in data or not data['skill_name']:
            errors['skill_name'] = 'El nombre de la habilidad es requerido'
        elif len(data['skill_name'].strip()) < 2:
            errors['skill_name'] = 'El nombre de la habilidad debe tener al menos 2 caracteres'
        else:
            data['skill_name'] = data['skill_name'].strip()
        
        # Validar years_experience
        if 'years_experience' in data:
            try:
                years = float(data['years_experience'])
                if years < 0:
                    errors['years_experience'] = 'Los años de experiencia no pueden ser negativos'
                data['years_experience'] = years
            except (ValueError, TypeError):
                errors['years_experience'] = 'Los años de experiencia deben ser un número'
        
        return errors
    
    @staticmethod
    def create(data, user):
        """Crea una nueva habilidad"""
        with transaction.atomic():
            skill = StudentSkill.objects.create(
                student=user,
                skill_name=data['skill_name'],
                level=data.get('level', 'intermedio'),
                years_experience=data.get('years_experience', 0),
                is_verified=data.get('is_verified', False)
            )
            
            return skill
    
    @staticmethod
    def update(skill, data):
        """Actualiza una habilidad existente"""
        with transaction.atomic():
            # Actualizar campos
            if 'skill_name' in data:
                skill.skill_name = data['skill_name']
            if 'level' in data:
                skill.level = data['level']
            if 'years_experience' in data:
                skill.years_experience = data['years_experience']
            if 'is_verified' in data:
                skill.is_verified = data['is_verified']
            
            skill.save()
            return skill 