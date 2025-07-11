"""
Views para la app interviews.
"""

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count, Avg
from django.utils import timezone
from datetime import datetime, timedelta

from .models import Interview
from .serializers import (
    InterviewSerializer, InterviewFeedbackSerializer,
    InterviewScheduleSerializer
)
from users.models import User
from applications.models import Aplicacion
from projects.models import Proyecto
from core.auth_utils import require_auth, require_admin, require_company, require_student


@csrf_exempt
@require_http_methods(["GET", "POST"])
@require_auth
def interview_list_create(request):
    """Vista para listar y crear entrevistas"""
    if request.method == 'GET':
        return interview_list(request)
    elif request.method == 'POST':
        return interview_create(request)


def interview_list(request):
    """Listar entrevistas según el rol del usuario"""
    try:
        user = request.user
        
        if user.role == 'admin':
            # Admin ve todas las entrevistas
            interviews = Interview.objects.all()
        elif user.role == 'company':
            # Empresa ve entrevistas de sus proyectos
            company_projects = Proyecto.objects.filter(company=user.company)
            company_applications = Aplicacion.objects.filter(project__in=company_projects)
            interviews = Interview.objects.filter(application__in=company_applications)
        elif user.role == 'student':
            # Estudiante ve entrevistas de sus aplicaciones
            student_applications = Aplicacion.objects.filter(student=user)
            interviews = Interview.objects.filter(application__in=student_applications)
        else:
            interviews = Interview.objects.none()
        
        # Aplicar filtros
        status_filter = request.GET.get('status')
        if status_filter:
            interviews = interviews.filter(status=status_filter)
        
        interview_type_filter = request.GET.get('interview_type')
        if interview_type_filter:
            interviews = interviews.filter(interview_type=interview_type_filter)
        
        # Ordenar por fecha de entrevista descendente
        interviews = interviews.order_by('-interview_date')
        
        # Serializar resultados
        interviews_data = [InterviewSerializer.to_dict(interview) for interview in interviews]
        
        return JsonResponse({
            'success': True,
            'interviews': interviews_data,
            'count': len(interviews_data)
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error al listar entrevistas: {str(e)}'
        }, status=500)


def interview_create(request):
    """Crear una nueva entrevista"""
    try:
        user = request.user
        
        # Solo admin y empresa pueden crear entrevistas
        if user.role not in ['admin', 'company']:
            return JsonResponse({
                'success': False,
                'error': 'No tienes permisos para crear entrevistas'
            }, status=403)
        
        data = json.loads(request.body)
        
        # Validar datos
        errors = InterviewSerializer.validate_data(data)
        if errors:
            return JsonResponse({
                'success': False,
                'errors': errors
            }, status=400)
        
        # Crear entrevista
        interview = InterviewSerializer.create(data, user)
        
        return JsonResponse({
            'success': True,
            'message': 'Entrevista creada exitosamente',
            'interview': InterviewSerializer.to_dict(interview)
        }, status=201)
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Datos JSON inválidos'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error al crear entrevista: {str(e)}'
        }, status=500)


@csrf_exempt
@require_http_methods(["GET", "PUT", "DELETE"])
@require_auth
def interview_detail(request, interview_id):
    """Vista para ver, actualizar y eliminar una entrevista específica"""
    if request.method == 'GET':
        return interview_retrieve(request, interview_id)
    elif request.method == 'PUT':
        return interview_update(request, interview_id)
    elif request.method == 'DELETE':
        return interview_delete(request, interview_id)


def interview_retrieve(request, interview_id):
    """Obtener una entrevista específica"""
    try:
        user = request.user
        
        # Obtener entrevista según permisos
        if user.role == 'admin':
            interview = get_object_or_404(Interview, id=interview_id)
        elif user.role == 'company':
            company_projects = Proyecto.objects.filter(company=user.company)
            company_applications = Aplicacion.objects.filter(project__in=company_projects)
            interview = get_object_or_404(Interview, id=interview_id, application__in=company_applications)
        elif user.role == 'student':
            student_applications = Aplicacion.objects.filter(student=user)
            interview = get_object_or_404(Interview, id=interview_id, application__in=student_applications)
        else:
            return JsonResponse({
                'success': False,
                'error': 'No tienes permisos para ver esta entrevista'
            }, status=403)
        
        return JsonResponse({
            'success': True,
            'interview': InterviewSerializer.to_dict(interview)
        })
        
    except Interview.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Entrevista no encontrada'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error al obtener entrevista: {str(e)}'
        }, status=500)


def interview_update(request, interview_id):
    """Actualizar una entrevista"""
    try:
        user = request.user
        
        # Obtener entrevista según permisos
        if user.role == 'admin':
            interview = get_object_or_404(Interview, id=interview_id)
        elif user.role == 'company':
            company_projects = Proyecto.objects.filter(company=user.company)
            company_applications = Aplicacion.objects.filter(project__in=company_projects)
            interview = get_object_or_404(Interview, id=interview_id, application__in=company_applications)
        else:
            return JsonResponse({
                'success': False,
                'error': 'No tienes permisos para actualizar esta entrevista'
            }, status=403)
        
        # Verificar que sea el entrevistador o admin
        if user.role != 'admin' and interview.interviewer != user:
            return JsonResponse({
                'success': False,
                'error': 'No tienes permisos para actualizar esta entrevista'
            }, status=403)
        
        data = json.loads(request.body)
        
        # Validar datos
        errors = InterviewSerializer.validate_data(data)
        if errors:
            return JsonResponse({
                'success': False,
                'errors': errors
            }, status=400)
        
        # Actualizar entrevista
        interview = InterviewSerializer.update(interview, data)
        
        return JsonResponse({
            'success': True,
            'message': 'Entrevista actualizada exitosamente',
            'interview': InterviewSerializer.to_dict(interview)
        })
        
    except Interview.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Entrevista no encontrada'
        }, status=404)
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Datos JSON inválidos'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error al actualizar entrevista: {str(e)}'
        }, status=500)


def interview_delete(request, interview_id):
    """Eliminar una entrevista"""
    try:
        user = request.user
        
        # Obtener entrevista según permisos
        if user.role == 'admin':
            interview = get_object_or_404(Interview, id=interview_id)
        elif user.role == 'company':
            company_projects = Proyecto.objects.filter(company=user.company)
            company_applications = Aplicacion.objects.filter(project__in=company_projects)
            interview = get_object_or_404(Interview, id=interview_id, application__in=company_applications)
        else:
            return JsonResponse({
                'success': False,
                'error': 'No tienes permisos para eliminar esta entrevista'
            }, status=403)
        
        # Verificar que sea el entrevistador o admin
        if user.role != 'admin' and interview.interviewer != user:
            return JsonResponse({
                'success': False,
                'error': 'No tienes permisos para eliminar esta entrevista'
            }, status=403)
        
        interview.delete()
        
        return JsonResponse({
            'success': True,
            'message': 'Entrevista eliminada exitosamente'
        })
        
    except Interview.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Entrevista no encontrada'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error al eliminar entrevista: {str(e)}'
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
@require_auth
def complete_interview(request, interview_id):
    """Endpoint para completar una entrevista"""
    try:
        user = request.user
        
        # Verificar permisos
        if user.role not in ['admin', 'company']:
            return JsonResponse({
                'success': False,
                'error': 'No tienes permisos para completar entrevistas'
            }, status=403)
        
        # Obtener entrevista según permisos
        if user.role == 'admin':
            interview = get_object_or_404(Interview, id=interview_id)
        else:
            company_projects = Proyecto.objects.filter(company=user.company)
            company_applications = Aplicacion.objects.filter(project__in=company_projects)
            interview = get_object_or_404(Interview, id=interview_id, application__in=company_applications)
        
        if interview.interviewer != user and user.role != 'admin':
            return JsonResponse({
                'success': False,
                'error': 'Solo el entrevistador puede completar la entrevista'
            }, status=403)
        
        data = json.loads(request.body)
        
        # Validar datos de feedback
        errors = InterviewFeedbackSerializer.validate_data(data)
        if errors:
            return JsonResponse({
                'success': False,
                'errors': errors
            }, status=400)
        
        # Completar entrevista
        interview = InterviewFeedbackSerializer.update(interview, data)
        
        return JsonResponse({
            'success': True,
            'message': 'Entrevista completada exitosamente',
            'interview': InterviewSerializer.to_dict(interview)
        })
        
    except Interview.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Entrevista no encontrada'
        }, status=404)
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Datos JSON inválidos'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error al completar la entrevista: {str(e)}'
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
@require_auth
def cancel_interview(request, interview_id):
    """Endpoint para cancelar una entrevista"""
    try:
        user = request.user
        
        # Verificar permisos
        if user.role not in ['admin', 'company']:
            return JsonResponse({
                'success': False,
                'error': 'No tienes permisos para cancelar entrevistas'
            }, status=403)
        
        # Obtener entrevista según permisos
        if user.role == 'admin':
            interview = get_object_or_404(Interview, id=interview_id)
        else:
            company_projects = Proyecto.objects.filter(company=user.company)
            company_applications = Aplicacion.objects.filter(project__in=company_projects)
            interview = get_object_or_404(Interview, id=interview_id, application__in=company_applications)
        
        if interview.interviewer != user and user.role != 'admin':
            return JsonResponse({
                'success': False,
                'error': 'Solo el entrevistador puede cancelar la entrevista'
            }, status=403)
        
        data = json.loads(request.body)
        motivo = data.get('motivo', 'Cancelada por el entrevistador')
        
        interview.cancelar(motivo=motivo)
        
        return JsonResponse({
            'success': True,
            'message': 'Entrevista cancelada exitosamente',
            'interview': InterviewSerializer.to_dict(interview)
        })
        
    except Interview.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Entrevista no encontrada'
        }, status=404)
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Datos JSON inválidos'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error al cancelar la entrevista: {str(e)}'
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
@require_auth
def mark_no_show(request, interview_id):
    """Endpoint para marcar como no-show"""
    try:
        user = request.user
        
        # Verificar permisos
        if user.role not in ['admin', 'company']:
            return JsonResponse({
                'success': False,
                'error': 'No tienes permisos para marcar no-show'
            }, status=403)
        
        # Obtener entrevista según permisos
        if user.role == 'admin':
            interview = get_object_or_404(Interview, id=interview_id)
        else:
            company_projects = Proyecto.objects.filter(company=user.company)
            company_applications = Aplicacion.objects.filter(project__in=company_projects)
            interview = get_object_or_404(Interview, id=interview_id, application__in=company_applications)
        
        if interview.interviewer != user and user.role != 'admin':
            return JsonResponse({
                'success': False,
                'error': 'Solo el entrevistador puede marcar no-show'
            }, status=403)
        
        data = json.loads(request.body)
        motivo = data.get('motivo', 'No se presentó el candidato')
        
        interview.marcar_no_show(motivo=motivo)
        
        return JsonResponse({
            'success': True,
            'message': 'Entrevista marcada como no-show exitosamente',
            'interview': InterviewSerializer.to_dict(interview)
        })
        
    except Interview.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Entrevista no encontrada'
        }, status=404)
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Datos JSON inválidos'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error al marcar no-show: {str(e)}'
        }, status=500)


@require_http_methods(["GET"])
@require_auth
def interview_stats(request):
    """Endpoint para obtener estadísticas de entrevistas"""
    try:
        user = request.user
        
        if user.role == 'admin':
            # Admin ve estadísticas globales
            total_interviews = Interview.objects.count()
            completed_interviews = Interview.objects.filter(status='completed').count()
            cancelled_interviews = Interview.objects.filter(status='cancelled').count()
            no_show_interviews = Interview.objects.filter(status='no_show').count()
            scheduled_interviews = Interview.objects.filter(status='scheduled').count()
            
            avg_rating = Interview.objects.filter(
                status='completed', 
                rating__isnull=False
            ).aggregate(avg_rating=Avg('rating'))['avg_rating'] or 0
            
        elif user.role == 'company':
            # Empresa ve estadísticas de sus proyectos
            company_projects = Proyecto.objects.filter(company=user.company)
            company_applications = Aplicacion.objects.filter(project__in=company_projects)
            company_interviews = Interview.objects.filter(application__in=company_applications)
            
            total_interviews = company_interviews.count()
            completed_interviews = company_interviews.filter(status='completed').count()
            cancelled_interviews = company_interviews.filter(status='cancelled').count()
            no_show_interviews = company_interviews.filter(status='no_show').count()
            scheduled_interviews = company_interviews.filter(status='scheduled').count()
            
            avg_rating = company_interviews.filter(
                status='completed', 
                rating__isnull=False
            ).aggregate(avg_rating=Avg('rating'))['avg_rating'] or 0
            
        elif user.role == 'student':
            # Estudiante ve estadísticas de sus aplicaciones
            student_applications = Aplicacion.objects.filter(student=user)
            student_interviews = Interview.objects.filter(application__in=student_applications)
            
            total_interviews = student_interviews.count()
            completed_interviews = student_interviews.filter(status='completed').count()
            cancelled_interviews = student_interviews.filter(status='cancelled').count()
            no_show_interviews = student_interviews.filter(status='no_show').count()
            scheduled_interviews = student_interviews.filter(status='scheduled').count()
            
            avg_rating = student_interviews.filter(
                status='completed', 
                rating__isnull=False
            ).aggregate(avg_rating=Avg('rating'))['avg_rating'] or 0
        else:
            return JsonResponse({
                'success': False,
                'error': 'Rol de usuario no válido'
            }, status=400)
        
        return JsonResponse({
            'success': True,
            'stats': {
                'total_interviews': total_interviews,
                'completed_interviews': completed_interviews,
                'cancelled_interviews': cancelled_interviews,
                'no_show_interviews': no_show_interviews,
                'scheduled_interviews': scheduled_interviews,
                'average_rating': round(avg_rating, 2),
                'completion_rate': round((completed_interviews / total_interviews * 100) if total_interviews > 0 else 0, 2)
            }
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error al obtener estadísticas: {str(e)}'
        }, status=500)


@require_http_methods(["GET"])
@require_auth
def upcoming_interviews(request):
    """Endpoint para obtener próximas entrevistas"""
    try:
        user = request.user
        today = timezone.now().date()
        
        if user.role == 'admin':
            # Admin ve todas las próximas entrevistas
            upcoming = Interview.objects.filter(
                interview_date__date__gte=today,
                status='scheduled'
            ).order_by('interview_date')
            
        elif user.role == 'company':
            # Empresa ve próximas entrevistas de sus proyectos
            company_projects = Proyecto.objects.filter(company=user.company)
            company_applications = Aplicacion.objects.filter(project__in=company_projects)
            upcoming = Interview.objects.filter(
                application__in=company_applications,
                interview_date__date__gte=today,
                status='scheduled'
            ).order_by('interview_date')
            
        elif user.role == 'student':
            # Estudiante ve sus próximas entrevistas
            student_applications = Aplicacion.objects.filter(student=user)
            upcoming = Interview.objects.filter(
                application__in=student_applications,
                interview_date__date__gte=today,
                status='scheduled'
            ).order_by('interview_date')
        else:
            return JsonResponse({
                'success': False,
                'error': 'Rol de usuario no válido'
            }, status=400)
        
        upcoming_data = [InterviewSerializer.to_dict(interview) for interview in upcoming]
        
        return JsonResponse({
            'success': True,
            'upcoming_interviews': upcoming_data,
            'count': len(upcoming_data)
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error al obtener próximas entrevistas: {str(e)}'
        }, status=500)
