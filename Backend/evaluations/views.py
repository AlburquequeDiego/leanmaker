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
            required_fields = ['student_id', 'project_id', 'rating']
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
            student.actualizar_calificacion()
            
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
            from companies.models import Empresa
            company = Empresa.objects.get(id=company_id)
            evaluations = Evaluation.objects.filter(
                evaluator=company.user,
                evaluation_type='company_to_student'
            ).select_related('student__user', 'project')
            
            evaluations_data = []
            for evaluation in evaluations:
                evaluations_data.append({
                    'id': str(evaluation.id),
                    'score': evaluation.score,
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
            
        except Empresa.DoesNotExist:
            return JsonResponse({'error': 'Empresa no encontrada'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def company_completed_evaluations(request):
    """Endpoint para que empresas vean evaluaciones ya realizadas"""
    # Autenticación por token
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return JsonResponse({'error': 'Token requerido'}, status=401)
    
    token = auth_header.split(' ')[1]
    user = verify_token(token)
    if not user or not user.is_authenticated or getattr(user, 'role', None) != 'company':
        return JsonResponse({'error': 'Solo empresas pueden acceder a este endpoint.'}, status=403)
    
    try:
        from companies.models import Empresa
        from applications.models import Aplicacion
        from projects.models import Proyecto
        from project_status.models import ProjectStatus
        from .models import Evaluation
        
        print(f"[DEBUG] Iniciando company_completed_evaluations para usuario: {user.full_name}")
        
        # Obtener la empresa
        company = Empresa.objects.get(user=user)
        print(f"[DEBUG] Empresa encontrada: {company.company_name} (ID: {company.id}, User ID: {company.user.id})")
        
        # Buscar directamente las evaluaciones de la empresa
        company_evaluations = Evaluation.objects.filter(
            evaluator=user,
            evaluation_type='company_to_student'
        ).select_related('student__user', 'project')
        
        print(f"[DEBUG] Evaluaciones encontradas: {company_evaluations.count()}")
        
        completed_evaluations_data = []
        
        for evaluation in company_evaluations:
            project = evaluation.project
            student = evaluation.student
            print(f"[DEBUG] Procesando evaluación: {evaluation.id} - Proyecto: {project.title}")
            
            # Buscar la aplicación correspondiente
            try:
                application = Aplicacion.objects.get(
                    student=student,
                    project=project
                )
                
                completed_evaluations_data.append({
                    'student_id': str(student.id),
                    'student_name': student.user.full_name,
                    'student_email': student.user.email,
                    'project_id': str(project.id),
                    'project_title': project.title,
                    'project_description': project.description or '',
                    'completion_date': application.updated_at.isoformat(),
                    'already_evaluated': True,
                    'evaluation_id': str(evaluation.id),
                    'score': evaluation.score
                })
                
                print(f"[DEBUG] Agregada evaluación: {project.title} - Score: {evaluation.score}")
                
            except Aplicacion.DoesNotExist:
                print(f"[DEBUG] No se encontró aplicación para proyecto: {project.title}")
                continue
        
        response_data = {
            'success': True,
            'data': completed_evaluations_data,
            'total': len(completed_evaluations_data),
            'company_name': company.company_name,
            'total_evaluations_completed': len(completed_evaluations_data)
        }
        
        print(f"[DEBUG] Respuesta final: {response_data}")
        return JsonResponse(response_data)
        
    except Empresa.DoesNotExist:
        return JsonResponse({'error': 'Perfil de empresa no encontrado'}, status=404)
    except Exception as e:
        print(f"[DEBUG] Error en company_completed_evaluations: {str(e)}")
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
        from companies.models import Empresa
        from applications.models import Aplicacion
        from projects.models import Proyecto
        
        # Obtener la empresa
        company = Empresa.objects.get(user=user)
        
        # Obtener proyectos completados de la empresa
        from project_status.models import ProjectStatus
        try:
            status_completado = ProjectStatus.objects.get(name='Completado')
            completed_projects = Proyecto.objects.filter(
                company=company,
                status=status_completado
            )
        except ProjectStatus.DoesNotExist:
            # Si no existe el estado 'Completado', buscar por nombre alternativo
            try:
                status_completado = ProjectStatus.objects.get(name='completed')
                completed_projects = Proyecto.objects.filter(
                    company=company,
                    status=status_completado
                )
            except ProjectStatus.DoesNotExist:
                # Si no existe ningún estado de completado, usar lista vacía
                completed_projects = Proyecto.objects.none()
        
        students_data = []
        print(f"[DEBUG] Proyectos completados encontrados: {completed_projects.count()}")
        
        for project in completed_projects:
            print(f"[DEBUG] Procesando proyecto: {project.title}")
            
            # Obtener estudiantes que completaron este proyecto
            completed_applications = Aplicacion.objects.filter(
                project=project,
                status='completed'
            ).select_related('student__user')
            
            # Si no hay aplicaciones con status 'completed', usar todas las aplicaciones del proyecto
            if completed_applications.count() == 0:
                print(f"[DEBUG] No hay aplicaciones con status 'completed' para el proyecto {project.title}")
                all_applications = Aplicacion.objects.filter(
                    project=project
                ).select_related('student__user')
                
                # Marcar todas las aplicaciones como completadas
                for app in all_applications:
                    if app.status != 'completed':
                        app.status = 'completed'
                        app.save()
                        print(f"[DEBUG] Marcada aplicación {app.id} del proyecto {project.title} como completada")
                
                completed_applications = all_applications
            
            print(f"[DEBUG] Aplicaciones completadas para {project.title}: {completed_applications.count()}")
            
            for application in completed_applications:
                student = application.student
                print(f"[DEBUG] Procesando estudiante: {student.user.full_name}")
                
                # Debug: verificar cover_letter antes de procesar
                print(f"[DEBUG] Cover letter original: '{application.cover_letter}'")
                print(f"[DEBUG] Cover letter es None: {application.cover_letter is None}")
                print(f"[DEBUG] Cover letter es string vacío: {application.cover_letter == ''}")
                print(f"[DEBUG] Cover letter longitud: {len(application.cover_letter) if application.cover_letter else 0}")
                
                # Verificar si ya evaluó este estudiante para este proyecto
                existing_evaluation = Evaluation.objects.filter(
                    project=project,
                    student=student,
                    evaluator=user,
                    evaluation_type='company_to_student'
                ).first()
                
                students_data.append({
                    'student_id': str(student.id),
                    'student_name': student.user.full_name,
                    'student_email': student.user.email,
                    'project_id': str(project.id),
                    'project_title': project.title,
                    'project_description': project.description,
                    'completion_date': application.updated_at.isoformat(),
                    'already_evaluated': existing_evaluation is not None,
                    'evaluation_id': str(existing_evaluation.id) if existing_evaluation else None,
                    'score': existing_evaluation.score if existing_evaluation else None,
                    'cover_letter': application.cover_letter or ''
                })
                
                # Debug: verificar cover_letter
                print(f"[DEBUG] Cover letter para {student.user.full_name}: '{application.cover_letter}'")
                print(f"[DEBUG] Cover letter procesada: '{application.cover_letter or ''}'")
        
        return JsonResponse({
            'success': True,
            'data': students_data,
            'total': len(students_data),
            'company_name': company.company_name,
            'total_students_to_evaluate': len([s for s in students_data if not s['already_evaluated']])
        })
        
    except Empresa.DoesNotExist:
        return JsonResponse({'error': 'Perfil de empresa no encontrado'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST", "GET"])
def student_evaluate_company(request):
    """Endpoint para que estudiantes evalúen empresas con estrellas (1-5)"""
    # Autenticación por token
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return JsonResponse({'error': 'Token requerido'}, status=401)
    
    token = auth_header.split(' ')[1]
    user = verify_token(token)
    if not user or not user.is_authenticated or getattr(user, 'role', None) != 'student':
        return JsonResponse({'error': 'Solo estudiantes pueden evaluar empresas.'}, status=403)
    
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            
            # Validar campos requeridos
            required_fields = ['company_id', 'project_id', 'rating']
            for field in required_fields:
                if field not in data:
                    return JsonResponse({'error': f'Campo requerido: {field}'}, status=400)
            
            # Validar rating (1-5 estrellas)
            rating = data.get('rating')
            if not isinstance(rating, (int, float)) or rating < 1 or rating > 5:
                return JsonResponse({'error': 'Rating debe ser un número entre 1 y 5'}, status=400)
            
            # Verificar que el proyecto existe y el estudiante participó
            try:
                from projects.models import Proyecto
                from applications.models import Aplicacion
                from companies.models import Empresa
                from students.models import Estudiante
                
                project = Proyecto.objects.get(id=data['project_id'])
                company = Empresa.objects.get(id=data['company_id'])
                student = Estudiante.objects.get(user=user)
                
                # Verificar que el estudiante participó en el proyecto y está completado
                application = Aplicacion.objects.get(
                    project=project,
                    student=student,
                    status='completed'
                )
                
                # Verificar que el proyecto pertenece a la empresa
                if project.company != company:
                    return JsonResponse({'error': 'El proyecto no pertenece a la empresa especificada'}, status=400)
                
            except (Proyecto.DoesNotExist, Empresa.DoesNotExist, Estudiante.DoesNotExist, Aplicacion.DoesNotExist):
                return JsonResponse({'error': 'Proyecto, empresa o aplicación no encontrada'}, status=404)
            
            # Verificar que no haya evaluación previa para este proyecto
            existing_evaluation = Evaluation.objects.filter(
                project=project,
                evaluator=user,
                evaluation_type='student_to_company'
            ).first()
            
            if existing_evaluation:
                return JsonResponse({'error': 'Ya has evaluado esta empresa para este proyecto'}, status=400)
            
            # Crear la evaluación
            evaluation = Evaluation.objects.create(
                project=project,
                student=student,
                evaluator=user,
                score=rating,
                comments=data.get('comments', ''),
                evaluation_date=timezone.now(),
                status='completed',
                evaluation_type='student_to_company'
            )
            
            # Actualizar rating de la empresa
            company.actualizar_calificacion()
            
            return JsonResponse({
                'message': 'Evaluación enviada correctamente',
                'evaluation_id': str(evaluation.id),
                'rating': rating,
                'company_name': company.company_name,
                'project_title': project.title
            }, status=201)
            
        except json.JSONDecodeError:
            return JsonResponse({'error': 'JSON inválido'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    elif request.method == "GET":
        # Obtener evaluaciones de empresas por estudiante
        try:
            from students.models import Estudiante
            student = Estudiante.objects.get(user=user)
            evaluations = Evaluation.objects.filter(
                evaluator=user,
                evaluation_type='student_to_company'
            ).select_related('project__company')
            
            evaluations_data = []
            for evaluation in evaluations:
                evaluations_data.append({
                    'id': str(evaluation.id),
                    'score': evaluation.score,
                    'comments': evaluation.comments,
                    'evaluation_date': evaluation.evaluation_date.isoformat(),
                    'company_name': evaluation.project.company.company_name,
                    'company_id': str(evaluation.project.company.id),
                    'project_title': evaluation.project.title,
                    'project_id': str(evaluation.project.id)
                })
            
            return JsonResponse({
                'student_name': student.user.full_name,
                'total_evaluations': len(evaluations_data),
                'evaluations': evaluations_data
            })
            
        except Estudiante.DoesNotExist:
            return JsonResponse({'error': 'Perfil de estudiante no encontrado'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def student_companies_to_evaluate(request):
    """Endpoint para que estudiantes vean empresas que pueden evaluar"""
    # Autenticación por token
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return JsonResponse({'error': 'Token requerido'}, status=401)
    
    token = auth_header.split(' ')[1]
    user = verify_token(token)
    if not user or not user.is_authenticated or getattr(user, 'role', None) != 'student':
        return JsonResponse({'error': 'Solo estudiantes pueden acceder a este endpoint.'}, status=403)
    
    try:
        from students.models import Estudiante
        from applications.models import Aplicacion
        from projects.models import Proyecto
        from project_status.models import ProjectStatus
        from .models import Evaluation
        
        # Obtener el estudiante
        student = Estudiante.objects.get(user=user)
        print(f"[DEBUG] Estudiante encontrado: {student.user.full_name} (ID: {student.id})")
        print(f"[DEBUG] Usuario: {user.full_name} (ID: {user.id}, Role: {user.role})")
        
        # Obtener proyectos completados del estudiante
        # Primero buscar el status de proyecto completado
        try:
            completed_status = ProjectStatus.objects.get(name='Completado')
        except ProjectStatus.DoesNotExist:
            try:
                completed_status = ProjectStatus.objects.get(name='completed')
            except ProjectStatus.DoesNotExist:
                print("[DEBUG] No se encontró status de proyecto completado")
                return JsonResponse({
                    'success': True,
                    'data': [],
                    'total': 0,
                    'student_name': student.user.full_name,
                    'total_companies_to_evaluate': 0
                })
        
        print(f"[DEBUG] Status completado encontrado: {completed_status.name} (ID: {completed_status.id})")
        
        # Buscar TODAS las aplicaciones del estudiante en proyectos completados
        completed_applications = Aplicacion.objects.filter(
            student=student,
            project__status=completed_status
        ).select_related('project__company')
        
        print(f"[DEBUG] Aplicaciones en proyectos completados: {completed_applications.count()}")
        
        # Verificar todas las aplicaciones del estudiante para debug
        all_applications = Aplicacion.objects.filter(student=student).select_related('project__company', 'project__status')
        print(f"[DEBUG] Total aplicaciones del estudiante: {all_applications.count()}")
        
        for app in all_applications[:10]:  # Mostrar las primeras 10
            if app.project:
                project_status = app.project.status.name if app.project.status else "Sin status"
                project_title = app.project.title
            else:
                project_status = "Sin proyecto"
                project_title = "Sin proyecto"
            print(f"[DEBUG] Aplicación {app.id}: proyecto={project_title}, status_app={app.status}, status_proyecto={project_status}")
        
        # Marcar todas las aplicaciones de proyectos completados como 'completed'
        updated_count = 0
        for app in completed_applications:
            if app.status != 'completed':
                app.status = 'completed'
                app.save()
                updated_count += 1
                print(f"[DEBUG] Marcada aplicación {app.id} como completada")
        
        print(f"[DEBUG] Aplicaciones actualizadas: {updated_count}")
        
        # Ahora buscar aplicaciones con status 'completed' (que deberían ser todas las de proyectos completados)
        final_applications = Aplicacion.objects.filter(
            student=student,
            status='completed'
        ).select_related('project__company')
        
        print(f"[DEBUG] Aplicaciones finales con status 'completed': {final_applications.count()}")
        
        # Limpiar evaluaciones con proyectos inexistentes
        print("[DEBUG] Limpiando evaluaciones con proyectos inexistentes...")
        evaluations_to_delete = []
        for eval in Evaluation.objects.filter(evaluator=user, evaluation_type='student_to_company'):
            try:
                # Intentar acceder al proyecto para verificar si existe
                _ = eval.project.id
            except Exception:
                evaluations_to_delete.append(eval.id)
                print(f"[DEBUG] Evaluación {eval.id} marcada para eliminar (proyecto inexistente)")
        
        if evaluations_to_delete:
            Evaluation.objects.filter(id__in=evaluations_to_delete).delete()
            print(f"[DEBUG] {len(evaluations_to_delete)} evaluaciones eliminadas")
        
        # Limpiar aplicaciones con proyectos inexistentes
        print("[DEBUG] Limpiando aplicaciones con proyectos inexistentes...")
        applications_to_delete = []
        for app in Aplicacion.objects.filter(student=student):
            try:
                # Intentar acceder al proyecto para verificar si existe
                _ = app.project.id
            except Exception:
                applications_to_delete.append(app.id)
                print(f"[DEBUG] Aplicación {app.id} marcada para eliminar (proyecto inexistente)")
        
        if applications_to_delete:
            Aplicacion.objects.filter(id__in=applications_to_delete).delete()
            print(f"[DEBUG] {len(applications_to_delete)} aplicaciones eliminadas")
        
        # Debug: Ver todas las evaluaciones del estudiante (después de limpieza)
        all_student_evaluations = Evaluation.objects.filter(
            evaluator=user,
            evaluation_type='student_to_company'
        )
        print(f"[DEBUG] Total evaluaciones del estudiante (después de limpieza): {all_student_evaluations.count()}")
        for eval in all_student_evaluations:
            project_title = eval.project.title if eval.project else "Sin proyecto"
            print(f"[DEBUG] Evaluación: ID={eval.id}, Proyecto={project_title}, Score={eval.score}")
        
        companies_data = []
        print(f"[DEBUG] Aplicaciones completadas encontradas: {final_applications.count()}")
        
        for application in final_applications:
            project = application.project
            if not project:
                print(f"[DEBUG] Aplicación {application.id} sin proyecto, saltando...")
                continue
                
            company = project.company
            if not company:
                print(f"[DEBUG] Proyecto {project.title} sin empresa, saltando...")
                continue
                
            print(f"[DEBUG] Procesando proyecto: {project.title} - Empresa: {company.company_name}")
            
            # Verificar si ya evaluó esta empresa para este proyecto
            existing_evaluation = Evaluation.objects.filter(
                project=project,
                evaluator=user,
                evaluation_type='student_to_company'
            ).first()
            
            print(f"[DEBUG] Proyecto {project.title}: existing_evaluation = {existing_evaluation}")
            if existing_evaluation:
                print(f"[DEBUG] Evaluación encontrada: ID={existing_evaluation.id}, Score={existing_evaluation.score}")
            else:
                print(f"[DEBUG] No se encontró evaluación para proyecto {project.title}")
                # Debug adicional: verificar todas las evaluaciones del usuario para este proyecto
                all_project_evals = Evaluation.objects.filter(project=project, evaluator=user)
                print(f"[DEBUG] Todas las evaluaciones del usuario para este proyecto: {all_project_evals.count()}")
                for eval in all_project_evals:
                    print(f"[DEBUG]   - Tipo: {eval.evaluation_type}, Score: {eval.score}")
            
            companies_data.append({
                'company_id': str(company.id),
                'company_name': company.company_name,
                'company_email': company.user.email,
                'project_id': str(project.id),
                'project_title': project.title,
                'project_description': project.description,
                'completion_date': application.updated_at.isoformat(),
                'already_evaluated': existing_evaluation is not None,
                'evaluation_id': str(existing_evaluation.id) if existing_evaluation else None,
                'score': existing_evaluation.score if existing_evaluation else None
            })
        
        # Filtrar solo proyectos NO evaluados para la sección "Evaluar Empresas"
        projects_to_evaluate = [c for c in companies_data if not c['already_evaluated']]
        
        response_data = {
            'success': True,
            'data': projects_to_evaluate,  # Solo proyectos NO evaluados
            'total': len(projects_to_evaluate),
            'student_name': student.user.full_name,
            'total_companies_to_evaluate': len(projects_to_evaluate)
        }
        print(f"[DEBUG] Respuesta final: {response_data}")
        print(f"[DEBUG] Proyectos para evaluar: {len(projects_to_evaluate)}")
        print(f"[DEBUG] Proyectos ya evaluados: {len([c for c in companies_data if c['already_evaluated']])}")
        return JsonResponse(response_data)
        
    except Estudiante.DoesNotExist:
        print(f"[DEBUG] Error: Perfil de estudiante no encontrado para usuario {user.id}")
        return JsonResponse({'error': 'Perfil de estudiante no encontrado'}, status=404)
    except Exception as e:
        print(f"[DEBUG] Error inesperado: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def student_completed_evaluations(request):
    """Endpoint para que estudiantes vean evaluaciones ya realizadas"""
    # Autenticación por token
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return JsonResponse({'error': 'Token requerido'}, status=401)
    
    token = auth_header.split(' ')[1]
    user = verify_token(token)
    if not user or not user.is_authenticated or getattr(user, 'role', None) != 'student':
        return JsonResponse({'error': 'Solo estudiantes pueden acceder a este endpoint.'}, status=403)
    
    try:
        from students.models import Estudiante
        from applications.models import Aplicacion
        from projects.models import Proyecto
        from project_status.models import ProjectStatus
        from .models import Evaluation
        
        print(f"[DEBUG] Iniciando student_completed_evaluations para usuario: {user.full_name}")
        
        # Obtener el estudiante
        student = Estudiante.objects.get(user=user)
        print(f"[DEBUG] Estudiante encontrado: {student.user.full_name} (ID: {student.id}, User ID: {student.user.id})")
        print(f"[DEBUG] Usuario: {user.full_name} (ID: {user.id}, Email: {user.email})")
        
        # Buscar directamente las evaluaciones del estudiante
        student_evaluations = Evaluation.objects.filter(
            evaluator=user,
            evaluation_type='student_to_company'
        ).select_related('project__company')
        
        print(f"[DEBUG] Evaluaciones encontradas: {student_evaluations.count()}")
        
        completed_evaluations_data = []
        
        for evaluation in student_evaluations:
            project = evaluation.project
            company = project.company
            print(f"[DEBUG] Procesando evaluación: {evaluation.id} - Proyecto: {project.title}")
            
            # Buscar la aplicación correspondiente
            try:
                application = Aplicacion.objects.get(
                    student=student,
                    project=project
                )
                
                completed_evaluations_data.append({
                    'company_id': str(company.id),
                    'company_name': company.company_name,
                    'company_email': company.user.email,
                    'project_id': str(project.id),
                    'project_title': project.title,
                    'project_description': project.description or '',
                    'completion_date': application.updated_at.isoformat(),
                    'already_evaluated': True,
                    'evaluation_id': str(evaluation.id),
                    'score': evaluation.score
                })
                
                print(f"[DEBUG] Agregada evaluación: {project.title} - Score: {evaluation.score}")
                
            except Aplicacion.DoesNotExist:
                print(f"[DEBUG] No se encontró aplicación para proyecto: {project.title}")
                continue
        
        response_data = {
            'success': True,
            'data': completed_evaluations_data,
            'total': len(completed_evaluations_data),
            'student_name': student.user.full_name,
            'total_evaluations_completed': len(completed_evaluations_data)
        }
        
        print(f"[DEBUG] Respuesta final: {response_data}")
        return JsonResponse(response_data)
        
    except Estudiante.DoesNotExist:
        print(f"[DEBUG] Error: Perfil de estudiante no encontrado para usuario {user.id}")
        return JsonResponse({'error': 'Perfil de estudiante no encontrado'}, status=404)
    except Exception as e:
        print(f"[DEBUG] Error inesperado: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def admin_evaluations_management(request):
    """Endpoint para que admin gestione todas las evaluaciones"""
    # Autenticación por token
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return JsonResponse({'error': 'Token requerido'}, status=401)
    
    token = auth_header.split(' ')[1]
    user = verify_token(token)
    if not user or not user.is_authenticated or getattr(user, 'role', None) != 'admin':
        return JsonResponse({'error': 'Solo administradores pueden acceder a este endpoint.'}, status=403)
    
    try:
        # Parámetros de paginación y filtros
        page = int(request.GET.get('page', 1))
        limit = int(request.GET.get('limit', 10))
        offset = (page - 1) * limit
        evaluation_type = request.GET.get('evaluation_type', '')
        status = request.GET.get('status', '')
        
        # Query base
        queryset = Evaluation.objects.select_related(
            'project', 'student__user', 'project__company', 'evaluator'
        ).all()
        
        # Filtros
        if evaluation_type:
            queryset = queryset.filter(evaluation_type=evaluation_type)
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
                'evaluation_type': evaluation.evaluation_type,
                'score': evaluation.score,
                'comments': evaluation.comments,
                'status': evaluation.status,
                'evaluation_date': evaluation.evaluation_date.isoformat() if evaluation.evaluation_date else None,
                'project_id': str(evaluation.project.id),
                'project_title': evaluation.project.title,
                'student_id': str(evaluation.student.id),
                'student_name': evaluation.student.user.full_name,
                'student_email': evaluation.student.user.email,
                'company_id': str(evaluation.project.company.id),
                'company_name': evaluation.project.company.company_name,
                'evaluator_id': str(evaluation.evaluator.id),
                'evaluator_name': evaluation.evaluator.full_name,
                'evaluator_role': evaluation.evaluator.role,
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
def admin_strikes_management(request):
    """Endpoint para que admin gestione todos los strikes"""
    # Autenticación por token
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return JsonResponse({'error': 'Token requerido'}, status=401)
    
    token = auth_header.split(' ')[1]
    user = verify_token(token)
    if not user or not user.is_authenticated or getattr(user, 'role', None) != 'admin':
        return JsonResponse({'error': 'Solo administradores pueden acceder a este endpoint.'}, status=403)
    
    try:
        from strikes.models import Strike, StrikeReport
        
        # Parámetros de paginación y filtros
        page = int(request.GET.get('page', 1))
        limit = int(request.GET.get('limit', 10))
        offset = (page - 1) * limit
        status = request.GET.get('status', '')
        
        # Query base - incluir tanto strikes como reportes
        strikes_queryset = Strike.objects.select_related(
            'student__user', 'company', 'project', 'issued_by'
        ).all()
        
        reports_queryset = StrikeReport.objects.select_related(
            'student__user', 'company', 'project', 'reviewed_by'
        ).all()
        
        # Filtros
        if status:
            strikes_queryset = strikes_queryset.filter(is_active=(status == 'active'))
            reports_queryset = reports_queryset.filter(status=status)
        
        # Combinar y ordenar
        strikes_data = []
        for strike in strikes_queryset[offset:offset + limit]:
            strikes_data.append({
                'id': str(strike.id),
                'type': 'strike',
                'student_id': str(strike.student.id),
                'student_name': strike.student.user.full_name,
                'student_email': strike.student.user.email,
                'company_id': str(strike.company.id),
                'company_name': strike.company.company_name,
                'project_id': str(strike.project.id) if strike.project else None,
                'project_title': strike.project.title if strike.project else None,
                'reason': strike.reason,
                'description': strike.description,
                'severity': strike.severity,
                'status': 'active' if strike.is_active else 'inactive',
                'issued_by_id': str(strike.issued_by.id) if strike.issued_by else None,
                'issued_by_name': strike.issued_by.full_name if strike.issued_by else None,
                'issued_at': strike.issued_at.isoformat(),
                'expires_at': strike.expires_at.isoformat() if strike.expires_at else None,
                'resolved_at': strike.resolved_at.isoformat() if strike.resolved_at else None,
                'resolution_notes': strike.resolution_notes,
                'created_at': strike.created_at.isoformat(),
                'updated_at': strike.updated_at.isoformat(),
            })
        
        reports_data = []
        for report in reports_queryset[offset:offset + limit]:
            reports_data.append({
                'id': str(report.id),
                'type': 'report',
                'student_id': str(report.student.id),
                'student_name': report.student.user.full_name,
                'student_email': report.student.user.email,
                'company_id': str(report.company.id),
                'company_name': report.company.company_name,
                'project_id': str(report.project.id) if report.project else None,
                'project_title': report.project.title if report.project else None,
                'reason': report.reason,
                'description': report.description,
                'status': report.status,
                'reviewed_by_id': str(report.reviewed_by.id) if report.reviewed_by else None,
                'reviewed_by_name': report.reviewed_by.full_name if report.reviewed_by else None,
                'reviewed_at': report.reviewed_at.isoformat() if report.reviewed_at else None,
                'admin_notes': report.admin_notes,
                'created_at': report.created_at.isoformat(),
                'updated_at': report.updated_at.isoformat(),
            })
        
        # Combinar ambos tipos
        all_data = strikes_data + reports_data
        total_count = strikes_queryset.count() + reports_queryset.count()
        
        return JsonResponse({
            'results': all_data,
            'count': total_count,
            'page': page,
            'limit': limit,
            'total_pages': (total_count + limit - 1) // limit
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
