"""
Views para la app evaluations.
"""

import json
import uuid
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.exceptions import ValidationError
from django.db.models import Q, Avg, Count
from .models import Evaluation, EvaluationTemplate, StudentSkill, StudentPortfolio, StudentAchievement
from .serializers import EvaluationSerializer, EvaluationTemplateSerializer, StudentSkillSerializer
from users.models import User
from projects.models import Proyecto
from core.auth_utils import get_user_from_token, require_auth

# --- EVALUACIONES ---

@csrf_exempt
@require_http_methods(["GET"])
@require_auth
def evaluations_list(request):
    """Lista evaluaciones con filtros y paginación"""
    try:
        user = get_user_from_token(request)
        
        # Filtros
        status = request.GET.get('status')
        type_filter = request.GET.get('type')
        category_id = request.GET.get('category_id')
        project_id = request.GET.get('project_id')
        student_id = request.GET.get('student_id')
        search = request.GET.get('search')
        page = int(request.GET.get('page', 1))
        limit = min(int(request.GET.get('limit', 20)), 100)
        
        # Construir query base
        queryset = Evaluation.objects.select_related('project', 'student', 'evaluator', 'category')
        
        # Filtrar por rol
        if user.role == 'company':
            try:
                company = user.empresa_profile
                if company:
                    company_projects = Proyecto.objects.filter(company=company)
                    queryset = queryset.filter(project__in=company_projects)
            except:
                # Si no tiene perfil de empresa, no mostrar evaluaciones
                queryset = queryset.none()
        elif user.role == 'student':
            queryset = queryset.filter(student=user)
        
        # Aplicar filtros
        if status:
            queryset = queryset.filter(status=status)
        if type_filter:
            queryset = queryset.filter(type=type_filter)
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        if search:
            queryset = queryset.filter(
                Q(comments__icontains=search) | 
                Q(strengths__icontains=search) | 
                Q(areas_for_improvement__icontains=search)
            )
        
        # Paginación
        total = queryset.count()
        offset = (page - 1) * limit
        queryset = queryset.order_by('-evaluation_date')[offset:offset + limit]
        
        # Serializar resultados
        data = [EvaluationSerializer.to_dict(evaluation) for evaluation in queryset]
        
        return JsonResponse({
            'success': True,
            'data': data,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total,
                'pages': (total + limit - 1) // limit
            }
        })
        
    except Exception as e:
        return JsonResponse({'error': f'Error al listar evaluaciones: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
@require_auth
def evaluations_detail(request, evaluation_id):
    """Obtiene los detalles de una evaluación específica"""
    try:
        user = get_user_from_token(request)
        
        # Validar UUID
        try:
            evaluation_uuid = uuid.UUID(evaluation_id)
        except ValueError:
            return JsonResponse({'error': 'ID de evaluación inválido'}, status=400)
        
        # Buscar evaluación
        try:
            evaluation = Evaluation.objects.select_related('project', 'student', 'evaluator', 'category').get(id=evaluation_uuid)
        except Evaluation.DoesNotExist:
            return JsonResponse({'error': 'Evaluación no encontrada'}, status=404)
        
        # Verificar permisos
        if user.role == 'company':
            try:
                company = user.empresa_profile
                if not company or evaluation.project.company != company:
                    return JsonResponse({'error': 'No tienes permisos para ver esta evaluación'}, status=403)
            except:
                return JsonResponse({'error': 'No tienes permisos para ver esta evaluación'}, status=403)
        elif user.role == 'student':
            if evaluation.student != user:
                return JsonResponse({'error': 'No tienes permisos para ver esta evaluación'}, status=403)
        
        return JsonResponse({
            'success': True,
            'data': EvaluationSerializer.to_dict(evaluation)
        })
        
    except Exception as e:
        return JsonResponse({'error': f'Error al obtener evaluación: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
@require_auth
def evaluations_create(request):
    """Crea una nueva evaluación"""
    try:
        user = get_user_from_token(request)
        
        # Verificar permisos
        if user.role not in ['admin', 'company']:
            return JsonResponse({'error': 'No tienes permisos para crear evaluaciones'}, status=403)
        
        # Parsear datos
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Datos JSON inválidos'}, status=400)
        
        # Validar datos
        errors = EvaluationSerializer.validate_data(data)
        if errors:
            return JsonResponse({'error': 'Datos inválidos', 'details': errors}, status=400)
        
        # Crear evaluación
        try:
            evaluation = EvaluationSerializer.create(data, user)
        except ValidationError as e:
            return JsonResponse({'error': str(e)}, status=400)
        
        return JsonResponse({
            'success': True,
            'message': 'Evaluación creada exitosamente',
            'data': EvaluationSerializer.to_dict(evaluation)
        }, status=201)
        
    except Exception as e:
        return JsonResponse({'error': f'Error al crear evaluación: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["PUT"])
@require_auth
def evaluations_update(request, evaluation_id):
    """Actualiza una evaluación existente"""
    try:
        user = get_user_from_token(request)
        
        # Validar UUID
        try:
            evaluation_uuid = uuid.UUID(evaluation_id)
        except ValueError:
            return JsonResponse({'error': 'ID de evaluación inválido'}, status=400)
        
        # Buscar evaluación
        try:
            evaluation = Evaluation.objects.get(id=evaluation_uuid)
        except Evaluation.DoesNotExist:
            return JsonResponse({'error': 'Evaluación no encontrada'}, status=404)
        
        # Verificar permisos
        if user.role != 'admin' and evaluation.evaluator != user:
            return JsonResponse({'error': 'No tienes permisos para actualizar esta evaluación'}, status=403)
        
        # Parsear datos
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Datos JSON inválidos'}, status=400)
        
        # Validar datos
        errors = EvaluationSerializer.validate_data(data)
        if errors:
            return JsonResponse({'error': 'Datos inválidos', 'details': errors}, status=400)
        
        # Actualizar evaluación
        evaluation = EvaluationSerializer.update(evaluation, data)
        
        return JsonResponse({
            'success': True,
            'message': 'Evaluación actualizada exitosamente',
            'data': EvaluationSerializer.to_dict(evaluation)
        })
        
    except Exception as e:
        return JsonResponse({'error': f'Error al actualizar evaluación: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["DELETE"])
@require_auth
def evaluations_delete(request, evaluation_id):
    """Elimina una evaluación"""
    try:
        user = get_user_from_token(request)
        
        # Validar UUID
        try:
            evaluation_uuid = uuid.UUID(evaluation_id)
        except ValueError:
            return JsonResponse({'error': 'ID de evaluación inválido'}, status=400)
        
        # Buscar evaluación
        try:
            evaluation = Evaluation.objects.get(id=evaluation_uuid)
        except Evaluation.DoesNotExist:
            return JsonResponse({'error': 'Evaluación no encontrada'}, status=404)
        
        # Verificar permisos
        if user.role != 'admin' and evaluation.evaluator != user:
            return JsonResponse({'error': 'No tienes permisos para eliminar esta evaluación'}, status=403)
        
        # Eliminar evaluación
        evaluation.delete()
        
        return JsonResponse({
            'success': True,
            'message': 'Evaluación eliminada exitosamente'
        })
        
    except Exception as e:
        return JsonResponse({'error': f'Error al eliminar evaluación: {str(e)}'}, status=500)

# --- PLANTILLAS DE EVALUACIÓN ---

@csrf_exempt
@require_http_methods(["GET"])
@require_auth
def evaluation_templates_list(request):
    """Lista plantillas de evaluación"""
    try:
        user = get_user_from_token(request)
        
        # Filtros
        is_active = request.GET.get('is_active')
        search = request.GET.get('search')
        page = int(request.GET.get('page', 1))
        limit = min(int(request.GET.get('limit', 20)), 100)
        
        # Construir query
        queryset = EvaluationTemplate.objects.all()
        
        # Filtrar por rol
        if user.role != 'admin':
            queryset = queryset.filter(is_active=True)
        
        # Aplicar filtros
        if is_active is not None:
            queryset = queryset.filter(is_active=(is_active.lower() == 'true'))
        if search:
            queryset = queryset.filter(Q(name__icontains=search) | Q(description__icontains=search))
        
        # Paginación
        total = queryset.count()
        offset = (page - 1) * limit
        queryset = queryset.order_by('name')[offset:offset + limit]
        
        # Serializar resultados
        data = [EvaluationTemplateSerializer.to_dict(template) for template in queryset]
        
        return JsonResponse({
            'success': True,
            'data': data,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total,
                'pages': (total + limit - 1) // limit
            }
        })
        
    except Exception as e:
        return JsonResponse({'error': f'Error al listar plantillas: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
@require_auth
def evaluation_templates_create(request):
    """Crea una nueva plantilla de evaluación"""
    try:
        user = get_user_from_token(request)
        
        # Solo admin puede crear plantillas
        if user.role != 'admin':
            return JsonResponse({'error': 'Solo los administradores pueden crear plantillas'}, status=403)
        
        # Parsear datos
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Datos JSON inválidos'}, status=400)
        
        # Validar datos
        errors = EvaluationTemplateSerializer.validate_data(data)
        if errors:
            return JsonResponse({'error': 'Datos inválidos', 'details': errors}, status=400)
        
        # Crear plantilla
        template = EvaluationTemplateSerializer.create(data)
        
        return JsonResponse({
            'success': True,
            'message': 'Plantilla creada exitosamente',
            'data': EvaluationTemplateSerializer.to_dict(template)
        }, status=201)
        
    except Exception as e:
        return JsonResponse({'error': f'Error al crear plantilla: {str(e)}'}, status=500)

# --- HABILIDADES DE ESTUDIANTES ---

@csrf_exempt
@require_http_methods(["GET"])
@require_auth
def student_skills_list(request):
    """Lista habilidades de estudiantes"""
    try:
        user = get_user_from_token(request)
        
        # Filtros
        level = request.GET.get('level')
        is_verified = request.GET.get('is_verified')
        student_id = request.GET.get('student_id')
        search = request.GET.get('search')
        page = int(request.GET.get('page', 1))
        limit = min(int(request.GET.get('limit', 20)), 100)
        
        # Construir query
        queryset = StudentSkill.objects.select_related('student')
        
        # Filtrar por rol
        if user.role == 'company':
            company_projects = Proyecto.objects.filter(company=user.company)
            project_students = User.objects.filter(role='student', projects__in=company_projects)
            queryset = queryset.filter(student__in=project_students)
        elif user.role == 'student':
            queryset = queryset.filter(student=user)
        
        # Aplicar filtros
        if level:
            queryset = queryset.filter(level=level)
        if is_verified is not None:
            queryset = queryset.filter(is_verified=(is_verified.lower() == 'true'))
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        if search:
            queryset = queryset.filter(skill_name__icontains=search)
        
        # Paginación
        total = queryset.count()
        offset = (page - 1) * limit
        queryset = queryset.order_by('skill_name')[offset:offset + limit]
        
        # Serializar resultados
        data = [StudentSkillSerializer.to_dict(skill) for skill in queryset]
        
        return JsonResponse({
            'success': True,
            'data': data,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total,
                'pages': (total + limit - 1) // limit
            }
        })
        
    except Exception as e:
        return JsonResponse({'error': f'Error al listar habilidades: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
@require_auth
def student_skills_create(request):
    """Crea una nueva habilidad de estudiante"""
    try:
        user = get_user_from_token(request)
        
        # Verificar permisos
        if user.role not in ['admin', 'student']:
            return JsonResponse({'error': 'No tienes permisos para crear habilidades'}, status=403)
        
        # Parsear datos
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Datos JSON inválidos'}, status=400)
        
        # Validar datos
        errors = StudentSkillSerializer.validate_data(data)
        if errors:
            return JsonResponse({'error': 'Datos inválidos', 'details': errors}, status=400)
        
        # Crear habilidad
        skill = StudentSkillSerializer.create(data, user)
        
        return JsonResponse({
            'success': True,
            'message': 'Habilidad creada exitosamente',
            'data': StudentSkillSerializer.to_dict(skill)
        }, status=201)
        
    except Exception as e:
        return JsonResponse({'error': f'Error al crear habilidad: {str(e)}'}, status=500)
