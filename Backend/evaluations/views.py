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
from django.db import models
from django.utils import timezone


@csrf_exempt
@require_http_methods(["GET"])
def evaluations_list(request):
    """Lista de evaluaciones."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'results': [], 'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'results': [], 'error': 'Token inválido'}, status=401)
        
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
            from students.models import Estudiante
            try:
                estudiante = Estudiante.objects.get(user=current_user)
                queryset = queryset.filter(student=estudiante)
            except Estudiante.DoesNotExist:
                return JsonResponse({'results': [], 'error': 'No existe perfil de estudiante para este usuario.'}, status=404)
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
                'student_name': evaluation.student.user.full_name if evaluation.student.user else 'Sin nombre',
                'student_email': evaluation.student.user.email if evaluation.student.user else 'Sin email',
                'company_name': evaluation.project.company.company_name if evaluation.project.company else 'Sin empresa',
                'score': evaluation.score,
                'comments': evaluation.comments,
                'evaluation_date': evaluation.evaluation_date.isoformat() if evaluation.evaluation_date else evaluation.created_at.isoformat(),
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
        return JsonResponse({'results': [], 'error': str(e)}, status=500)


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
    """Crear nueva evaluación (empresa o estudiante)."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Permitir que empresas, estudiantes y admins creen evaluaciones
        if current_user.role not in ['company', 'admin', 'student']:
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        # Procesar datos
        data = json.loads(request.body)
        
        # Validar que los IDs sean correctos
        project_id = data.get('project_id')
        student_id = data.get('student_id')
        if not project_id or not student_id:
            return JsonResponse({'error': 'project_id y student_id son requeridos.'}, status=400)
        try:
            project_uuid = str(project_id)  # Si el proyecto es UUID, mantenerlo
            student_int = int(student_id)   # Ahora el estudiante es Integer
        except Exception:
            return JsonResponse({'error': 'project_id o student_id no tienen formato válido.'}, status=400)
        # Buscar estudiante por Integer
        from students.models import Estudiante
        try:
            estudiante = Estudiante.objects.get(id=student_int)
        except Estudiante.DoesNotExist:
            return JsonResponse({'error': 'Estudiante no encontrado.'}, status=404)
        
        # Determinar el evaluador y el evaluador_role
        if current_user.role == 'company':
            evaluator_role = 'company'
        elif current_user.role == 'student':
            evaluator_role = 'student'
        else:
            evaluator_role = data.get('evaluator_role', 'admin')
        
        # Validar que la empresa solo pueda calificar a estudiantes de proyectos completados donde ambos participaron
        if current_user.role == 'company':
            from projects.models import Proyecto
            from applications.models import Aplicacion
            try:
                proyecto = Proyecto.objects.get(id=project_uuid)
            except Proyecto.DoesNotExist:
                return JsonResponse({'error': 'Proyecto no encontrado.'}, status=404)
            # Validar que el proyecto pertenezca a la empresa
            if proyecto.company.user != current_user:
                return JsonResponse({'error': 'El proyecto no pertenece a tu empresa.'}, status=400)
            # Validar que el proyecto esté completado
            if proyecto.status != 'completed' and getattr(proyecto.status, 'name', None) != 'completed':
                return JsonResponse({'error': 'Solo puedes calificar proyectos completados.'}, status=400)
            # Validar que el estudiante haya participado y completado el proyecto
            participo = Aplicacion.objects.filter(project=proyecto, student_id=student_int, status='completed').exists()
            if not participo:
                return JsonResponse({'error': 'Solo puedes calificar estudiantes que hayan completado el proyecto.'}, status=400)
        
        # Crear evaluación
        evaluation = Evaluation.objects.create(
            project_id=project_uuid,
            student=estudiante,
            evaluator=current_user,
            score=data.get('score'),
            evaluation_date=data.get('evaluation_date'),
            status=data.get('status', 'completed'),
            evaluator_role=evaluator_role,
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

# NUEVO ENDPOINT: Listar evaluaciones mutuas por proyecto
@csrf_exempt
@require_http_methods(["GET"])
def evaluations_by_project(request, project_id):
    """Lista de evaluaciones mutuas (empresa<->estudiante) para un proyecto."""
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'results': [], 'error': 'Token requerido'}, status=401)
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'results': [], 'error': 'Token inválido'}, status=401)
        # Permitir acceso a empresa, estudiante o admin
        if current_user.role not in ['company', 'student', 'admin']:
            return JsonResponse({'results': [], 'error': 'Acceso denegado'}, status=403)
        # Filtrar evaluaciones por proyecto
        queryset = Evaluation.objects.filter(project_id=project_id)
        # Serializar
        evaluations_data = []
        for evaluation in queryset:
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
        return JsonResponse({'results': evaluations_data})
    except Exception as e:
        return JsonResponse({'results': [], 'error': str(e)}, status=500)

# NUEVO ENDPOINT: Crear evaluación mutua
@csrf_exempt
@require_http_methods(["POST"])
def create_mutual_evaluation(request):
    """Crear evaluación mutua (empresa->estudiante o estudiante->empresa)"""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Permitir que empresas, estudiantes y admins creen evaluaciones
        if current_user.role not in ['company', 'admin', 'student']:
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        # Procesar datos
        data = json.loads(request.body)
        
        # Validar campos requeridos
        project_id = data.get('project_id')
        student_id = data.get('student_id')
        score = data.get('score')
        evaluation_type = data.get('evaluation_type')
        
        if not all([project_id, student_id, score, evaluation_type]):
            return JsonResponse({'error': 'project_id, student_id, score y evaluation_type son requeridos.'}, status=400)
        
        # Validar score
        if not (1 <= score <= 5):
            return JsonResponse({'error': 'Score debe estar entre 1 y 5.'}, status=400)
        
        # Validar tipo de evaluación
        if evaluation_type not in ['company_to_student', 'student_to_company']:
            return JsonResponse({'error': 'evaluation_type debe ser company_to_student o student_to_company.'}, status=400)
        
        # Buscar proyecto y estudiante
        try:
            from projects.models import Proyecto
            from students.models import Estudiante
            
            proyecto = Proyecto.objects.get(id=project_id)
            estudiante = Estudiante.objects.get(id=student_id)
        except (Proyecto.DoesNotExist, Estudiante.DoesNotExist):
            return JsonResponse({'error': 'Proyecto o estudiante no encontrado.'}, status=404)
        
        # Validar permisos según el tipo de evaluación
        if evaluation_type == 'company_to_student':
            if current_user.role != 'company':
                return JsonResponse({'error': 'Solo empresas pueden evaluar estudiantes.'}, status=403)
            if proyecto.company.user != current_user:
                return JsonResponse({'error': 'Solo puedes evaluar estudiantes de tus proyectos.'}, status=403)
        elif evaluation_type == 'student_to_company':
            if current_user.role != 'student':
                return JsonResponse({'error': 'Solo estudiantes pueden evaluar empresas.'}, status=403)
            if estudiante.user != current_user:
                return JsonResponse({'error': 'Solo puedes evaluar empresas de tus proyectos.'}, status=403)
        
        # Verificar que no exista evaluación previa
        existing_evaluation = Evaluation.objects.filter(
            project=proyecto,
            student=estudiante,
            evaluator=current_user,
            evaluation_type=evaluation_type
        ).first()
        
        if existing_evaluation:
            return JsonResponse({'error': 'Ya existe una evaluación de este tipo para este proyecto.'}, status=400)
        
        # Crear evaluación
        evaluation = Evaluation.objects.create(
            project=proyecto,
            student=estudiante,
            evaluator=current_user,
            score=score,
            evaluation_type=evaluation_type,
            comments=data.get('comments', ''),
            criteria_scores=data.get('criteria_scores', {}),
            status='completed'
        )
        
        return JsonResponse({
            'message': 'Evaluación creada correctamente',
            'id': str(evaluation.id),
            'evaluation_type': evaluation.evaluation_type
        }, status=201)
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# NUEVO ENDPOINT: Obtener promedios de evaluaciones
@csrf_exempt
@require_http_methods(["GET"])
def get_evaluation_averages(request):
    """Obtener promedios de evaluaciones por usuario"""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Parámetros
        user_id = request.GET.get('user_id')
        evaluation_type = request.GET.get('evaluation_type')
        
        # Determinar qué usuario consultar
        if current_user.role == 'admin' and user_id:
            # Admin puede consultar cualquier usuario
            try:
                from users.models import User
                target_user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return JsonResponse({'error': 'Usuario no encontrado.'}, status=404)
        else:
            # Usuario consulta sus propios datos
            target_user = current_user
        
        # Construir query
        queryset = Evaluation.objects.all()
        
        if evaluation_type == 'company_to_student':
            # Evaluaciones recibidas por estudiantes
            if target_user.role == 'student':
                from students.models import Estudiante
                try:
                    estudiante = Estudiante.objects.get(user=target_user)
                    queryset = queryset.filter(student=estudiante, evaluation_type='company_to_student')
                except Estudiante.DoesNotExist:
                    return JsonResponse({'error': 'Perfil de estudiante no encontrado.'}, status=404)
            else:
                return JsonResponse({'error': 'Solo estudiantes pueden recibir evaluaciones de empresas.'}, status=403)
        
        elif evaluation_type == 'student_to_company':
            # Evaluaciones recibidas por empresas
            if target_user.role == 'company':
                from companies.models import Empresa
                try:
                    empresa = Empresa.objects.get(user=target_user)
                    queryset = queryset.filter(company=empresa, evaluation_type='student_to_company')
                except Empresa.DoesNotExist:
                    return JsonResponse({'error': 'Perfil de empresa no encontrado.'}, status=404)
            else:
                return JsonResponse({'error': 'Solo empresas pueden recibir evaluaciones de estudiantes.'}, status=403)
        
        else:
            # Todas las evaluaciones del usuario
            if target_user.role == 'student':
                from students.models import Estudiante
                try:
                    estudiante = Estudiante.objects.get(user=target_user)
                    queryset = queryset.filter(student=estudiante)
                except Estudiante.DoesNotExist:
                    return JsonResponse({'error': 'Perfil de estudiante no encontrado.'}, status=404)
            elif target_user.role == 'company':
                from companies.models import Empresa
                try:
                    empresa = Empresa.objects.get(user=target_user)
                    queryset = queryset.filter(company=empresa)
                except Empresa.DoesNotExist:
                    return JsonResponse({'error': 'Perfil de empresa no encontrado.'}, status=404)
        
        # Calcular promedios
        total_evaluations = queryset.count()
        if total_evaluations > 0:
            average_score = queryset.aggregate(avg_score=models.Avg('score'))['avg_score']
            average_score = round(average_score, 2)
        else:
            average_score = 0
        
        # Agrupar por tipo de evaluación
        evaluations_by_type = {}
        for eval_type in ['company_to_student', 'student_to_company']:
            type_queryset = queryset.filter(evaluation_type=eval_type)
            type_count = type_queryset.count()
            type_average = 0
            if type_count > 0:
                type_average = round(type_queryset.aggregate(avg_score=models.Avg('score'))['avg_score'], 2)
            
            evaluations_by_type[eval_type] = {
                'count': type_count,
                'average': type_average
            }
        
        return JsonResponse({
            'user_id': str(target_user.id),
            'user_role': target_user.role,
            'total_evaluations': total_evaluations,
            'average_score': average_score,
            'evaluations_by_type': evaluations_by_type
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST", "GET"])
def company_evaluate_student(request):
    """Endpoint para que empresas evalúen estudiantes con estrellas (1-5) y opcionalmente den strikes"""
    # Autenticación por token
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return JsonResponse({'error': 'Token requerido'}, status=401)
    
    token = auth_header.split(' ')[1]
    user = verify_token(token)
    if not user or not user.is_authenticated or getattr(user, 'role', None) != 'company':
        return JsonResponse({'error': 'Solo empresas pueden evaluar estudiantes.'}, status=403)
    
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            
            # Validar campos requeridos
            required_fields = ['student_id', 'project_id', 'rating', 'comments']
            for field in required_fields:
                if field not in data:
                    return JsonResponse({'error': f'Campo requerido: {field}'}, status=400)
            
            # Validar rating (1-5 estrellas)
            rating = data.get('rating')
            if not isinstance(rating, (int, float)) or rating < 1 or rating > 5:
                return JsonResponse({'error': 'Rating debe ser un número entre 1 y 5'}, status=400)
            
            # Verificar que el proyecto existe y pertenece a la empresa
            try:
                from projects.models import Proyecto
                from applications.models import Aplicacion
                from students.models import Estudiante
                
                project = Proyecto.objects.get(id=data['project_id'])
                student = Estudiante.objects.get(id=data['student_id'])
                
                # Verificar que el proyecto pertenece a la empresa
                if project.company.user != user:
                    return JsonResponse({'error': 'El proyecto no pertenece a tu empresa'}, status=403)
                
                # Verificar que el estudiante participó en el proyecto
                application = Aplicacion.objects.get(
                    project=project,
                    student=student,
                    status='completed'
                )
            except (Proyecto.DoesNotExist, Estudiante.DoesNotExist, Aplicacion.DoesNotExist):
                return JsonResponse({'error': 'Proyecto o estudiante no encontrado'}, status=404)
            
            # Verificar que no haya evaluación previa para este proyecto
            existing_evaluation = Evaluation.objects.filter(
                project=project,
                student=student,
                evaluator=user
            ).first()
            
            if existing_evaluation:
                return JsonResponse({'error': 'Ya has evaluado este estudiante para este proyecto'}, status=400)
            
            # Crear la evaluación
            evaluation = Evaluation.objects.create(
                project=project,
                student=student,
                evaluator=user,
                score=rating,
                comments=data.get('comments', ''),
                evaluation_date=timezone.now(),
                status='completed',
                evaluation_type='company_to_student'
            )
            
            # Si se incluye un strike, crearlo
            strike_data = data.get('strike')
            strike_created = None
            if strike_data:
                # Validar datos del strike
                if not strike_data.get('reason'):
                    return JsonResponse({'error': 'Razón requerida para el strike'}, status=400)
                
                # Crear el strike
                from strikes.models import Strike
                strike_created = Strike.objects.create(
                    student=student,
                    company=project.company,
                    project=project,
                    reason=strike_data.get('reason'),
                    description=strike_data.get('description', ''),
                    severity=strike_data.get('severity', 'medium'),
                    issued_by=user
                )
                
                # Actualizar contador de strikes del estudiante
                student.strikes = min(student.strikes + 1, 3)  # Máximo 3 strikes
                student.save()
            
            # Actualizar GPA del estudiante
            student.update_gpa()
            
            return JsonResponse({
                'message': 'Evaluación enviada correctamente',
                'evaluation_id': str(evaluation.id),
                'rating': rating,
                'student_name': student.user.full_name,
                'project_title': project.title,
                'strike_created': strike_created.id if strike_created else None
            }, status=201)
            
        except json.JSONDecodeError:
            return JsonResponse({'error': 'JSON inválido'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    elif request.method == "GET":
        # Obtener evaluaciones de estudiantes por empresa
        company_id = request.GET.get('company_id')
        if not company_id:
            return JsonResponse({'error': 'company_id requerido'}, status=400)
        
        try:
            from companies.models import Company
            company = Company.objects.get(id=company_id)
            evaluations = Evaluation.objects.filter(
                evaluator=company.user,
                evaluation_type='company_to_student'
            ).select_related('student__user', 'project')
            
            evaluations_data = []
            for evaluation in evaluations:
                evaluations_data.append({
                    'id': str(evaluation.id),
                    'rating': evaluation.score,
                    'comments': evaluation.comments,
                    'evaluation_date': evaluation.evaluation_date.isoformat(),
                    'student_name': evaluation.student.user.full_name,
                    'student_id': str(evaluation.student.id),
                    'project_title': evaluation.project.title,
                    'project_id': str(evaluation.project.id)
                })
            
            return JsonResponse({
                'company_name': company.company_name,
                'total_evaluations': len(evaluations_data),
                'evaluations': evaluations_data
            })
            
        except Company.DoesNotExist:
            return JsonResponse({'error': 'Empresa no encontrada'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def company_students_to_evaluate(request):
    """Endpoint para que empresas vean estudiantes que pueden evaluar"""
    # Autenticación por token
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return JsonResponse({'error': 'Token requerido'}, status=401)
    
    token = auth_header.split(' ')[1]
    user = verify_token(token)
    if not user or not user.is_authenticated or getattr(user, 'role', None) != 'company':
        return JsonResponse({'error': 'Solo empresas pueden acceder a este endpoint.'}, status=403)
    
    try:
        from companies.models import Company
        from applications.models import Aplicacion
        from projects.models import Proyecto
        
        # Obtener la empresa
        company = Company.objects.get(user=user)
        
        # Obtener proyectos completados de la empresa
        completed_projects = Proyecto.objects.filter(
            company=company,
            status='completed'
        )
        
        students_data = []
        for project in completed_projects:
            # Obtener estudiantes que completaron este proyecto
            completed_applications = Aplicacion.objects.filter(
                project=project,
                status='completed'
            ).select_related('student__user')
            
            for application in completed_applications:
                student = application.student
                
                # Verificar si ya evaluó este estudiante para este proyecto
                existing_evaluation = Evaluation.objects.filter(
                    project=project,
                    student=student,
                    evaluator=user
                ).first()
                
                students_data.append({
                    'student_id': str(student.id),
                    'student_name': student.user.full_name,
                    'student_email': student.user.email,
                    'project_id': str(project.id),
                    'project_title': project.title,
                    'completion_date': application.updated_at.isoformat(),
                    'already_evaluated': existing_evaluation is not None,
                    'evaluation_id': str(existing_evaluation.id) if existing_evaluation else None,
                    'rating': existing_evaluation.score if existing_evaluation else None
                })
        
        return JsonResponse({
            'company_name': company.company_name,
            'total_students_to_evaluate': len([s for s in students_data if not s['already_evaluated']]),
            'students': students_data
        })
        
    except Company.DoesNotExist:
        return JsonResponse({'error': 'Perfil de empresa no encontrado'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
