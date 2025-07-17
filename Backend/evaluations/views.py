"""
Views para la app evaluations.
"""

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.db.models import Q
from users.models import User
from .models import Evaluation
from core.views import verify_token


@csrf_exempt
@require_http_methods(["GET"])
def evaluations_list(request):
    """Lista de evaluaciones."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Parámetros de paginación y filtros
        page = int(request.GET.get('page', 1))
        limit = int(request.GET.get('limit', 10))
        offset = (page - 1) * limit
        student = request.GET.get('student', '')
        project = request.GET.get('project', '')
        status = request.GET.get('status', '')
        
        # Query base
        queryset = Evaluation.objects.select_related('project', 'student', 'project__company').all()
        
        # Aplicar filtros según el rol del usuario
        if current_user.role == 'student':
            # Estudiantes solo ven sus propias evaluaciones
            queryset = queryset.filter(student=current_user)
        elif current_user.role == 'company':
            # Empresas ven evaluaciones de sus proyectos
            queryset = queryset.filter(project__company__user=current_user)
        # Admins ven todas las evaluaciones
        
        # Filtros adicionales
        if student:
            queryset = queryset.filter(student_id=student)
        
        if project:
            queryset = queryset.filter(project_id=project)
        
        if status:
            queryset = queryset.filter(status=status)
        
        # Contar total
        total_count = queryset.count()
        
        # Paginar
        evaluations = queryset[offset:offset + limit]
        
        # Serializar datos
        evaluations_data = []
        for evaluation in evaluations:
            evaluations_data.append({
                'id': str(evaluation.id),
                'project': str(evaluation.project.id),
                'project_title': evaluation.project.title,
                'student': str(evaluation.student.id),
                'student_name': evaluation.student.full_name,
                'student_email': evaluation.student.email,
                'company_name': evaluation.project.company.company_name if evaluation.project.company else 'Sin empresa',
                'score': evaluation.score,
                'comments': evaluation.comments,
                'evaluation_date': evaluation.evaluation_date.isoformat(),
                'status': evaluation.status,
                'evaluator_role': evaluation.evaluator_role,
                'overall_rating': evaluation.overall_rating,
                'strengths': evaluation.strengths,
                'areas_for_improvement': evaluation.areas_for_improvement,
                'created_at': evaluation.created_at.isoformat(),
                'updated_at': evaluation.updated_at.isoformat(),
            })
        
        return JsonResponse({
            'results': evaluations_data,
            'count': total_count,
            'page': page,
            'limit': limit,
            'total_pages': (total_count + limit - 1) // limit
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def evaluation_detail(request, evaluation_id):
    """Detalle de una evaluación."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Obtener evaluación
        try:
            evaluation = Evaluation.objects.select_related('project', 'student', 'project__company').get(id=evaluation_id)
        except Evaluation.DoesNotExist:
            return JsonResponse({'error': 'Evaluación no encontrada'}, status=404)
        
        # Verificar permisos
        if current_user.role == 'student' and str(evaluation.student.id) != str(current_user.id):
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        elif current_user.role == 'company' and str(evaluation.project.company.user.id) != str(current_user.id):
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        # Serializar datos
        evaluation_data = {
            'id': str(evaluation.id),
            'project': str(evaluation.project.id),
            'project_title': evaluation.project.title,
            'student': str(evaluation.student.id),
            'student_name': evaluation.student.full_name,
            'student_email': evaluation.student.email,
            'company_name': evaluation.project.company.company_name if evaluation.project.company else 'Sin empresa',
            'score': evaluation.score,
            'comments': evaluation.comments,
            'evaluation_date': evaluation.evaluation_date.isoformat(),
            'status': evaluation.status,
            'evaluator_role': evaluation.evaluator_role,
            'overall_rating': evaluation.overall_rating,
            'strengths': evaluation.strengths,
            'areas_for_improvement': evaluation.areas_for_improvement,
            'created_at': evaluation.created_at.isoformat(),
            'updated_at': evaluation.updated_at.isoformat(),
        }
        
        return JsonResponse(evaluation_data)
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def evaluations_create(request):
    """Crear nueva evaluación."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Solo empresas y admins pueden crear evaluaciones
        if current_user.role not in ['company', 'admin']:
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        # Procesar datos
        data = json.loads(request.body)
        
        # Crear evaluación
        evaluation = Evaluation.objects.create(
            project_id=data.get('project_id'),
            student_id=data.get('student_id'),
            score=data.get('score'),
            comments=data.get('comments', ''),
            evaluation_date=data.get('evaluation_date'),
            status=data.get('status', 'completed'),
            evaluator_role=data.get('evaluator_role', 'company'),
            overall_rating=data.get('overall_rating'),
            strengths=data.get('strengths', ''),
            areas_for_improvement=data.get('areas_for_improvement', ''),
        )
        
        return JsonResponse({
            'message': 'Evaluación creada correctamente',
            'id': str(evaluation.id)
        }, status=201)
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["PUT", "PATCH"])
def evaluations_update(request, evaluation_id):
    """Actualizar evaluación."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Obtener evaluación
        try:
            evaluation = Evaluation.objects.get(id=evaluation_id)
        except Evaluation.DoesNotExist:
            return JsonResponse({'error': 'Evaluación no encontrada'}, status=404)
        
        # Verificar permisos - solo admins pueden actualizar evaluaciones
        if current_user.role != 'admin':
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        # Procesar datos
        data = json.loads(request.body)
        
        # Actualizar campos de la evaluación
        fields_to_update = [
            'score', 'comments', 'evaluation_date', 'status', 'evaluator_role',
            'overall_rating', 'strengths', 'areas_for_improvement'
        ]
        
        for field in fields_to_update:
            if field in data:
                setattr(evaluation, field, data[field])
        
        evaluation.save()
        
        # Retornar datos actualizados
        return JsonResponse({
            'message': 'Evaluación actualizada correctamente',
            'id': str(evaluation.id)
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["PATCH"])
def evaluation_approve(request, evaluation_id):
    """Aprobar evaluación."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Solo admins pueden aprobar evaluaciones
        if current_user.role != 'admin':
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        # Obtener evaluación
        try:
            evaluation = Evaluation.objects.get(id=evaluation_id)
        except Evaluation.DoesNotExist:
            return JsonResponse({'error': 'Evaluación no encontrada'}, status=404)
        
        # Cambiar estado a aprobado
        evaluation.status = 'completed'
        evaluation.save()
        
        return JsonResponse({
            'message': 'Evaluación aprobada correctamente',
            'id': str(evaluation.id),
            'status': evaluation.status
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["PATCH"])
def evaluation_reject(request, evaluation_id):
    """Rechazar evaluación."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Solo admins pueden rechazar evaluaciones
        if current_user.role != 'admin':
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        # Obtener evaluación
        try:
            evaluation = Evaluation.objects.get(id=evaluation_id)
        except Evaluation.DoesNotExist:
            return JsonResponse({'error': 'Evaluación no encontrada'}, status=404)
        
        # Cambiar estado a rechazado
        evaluation.status = 'flagged'
        evaluation.save()
        
        return JsonResponse({
            'message': 'Evaluación rechazada correctamente',
            'id': str(evaluation.id),
            'status': evaluation.status
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
