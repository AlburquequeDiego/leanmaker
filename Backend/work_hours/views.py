from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.paginator import Paginator
from django.db.models import Sum, Q
from core.views import verify_token
import json
from datetime import datetime, date
from .models import WorkHour
from projects.models import Proyecto
from students.models import Estudiante
from django.utils import timezone
from notifications.services import NotificationService


@csrf_exempt
@require_http_methods(["GET"])
def work_hours_list(request):
    """Lista todas las horas de trabajo"""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        work_hours = WorkHour.objects.select_related('student', 'student__user', 'project').all().order_by('-date', '-created_at')
        
        # Filtros
        student_filter = request.GET.get('student')
        project_filter = request.GET.get('project')
        date_from = request.GET.get('date_from')
        date_to = request.GET.get('date_to')
        
        if student_filter:
            work_hours = work_hours.filter(student__user__first_name__icontains=student_filter)
        if project_filter:
            work_hours = work_hours.filter(project__title__icontains=project_filter)
        if date_from:
            work_hours = work_hours.filter(date__gte=date_from)
        if date_to:
            work_hours = work_hours.filter(date__lte=date_to)
        
        # Paginación
        page = int(request.GET.get('page', 1))
        limit = int(request.GET.get('limit', 15))
        offset = (page - 1) * limit
        
        total_count = work_hours.count()
        work_hours_page = work_hours[offset:offset + limit]
        
        work_hours_data = []
        for work_hour in work_hours_page:
            work_hours_data.append({
                'id': str(work_hour.id),
                'student_id': str(work_hour.student.id),
                'student_name': f"{work_hour.student.user.first_name} {work_hour.student.user.last_name}",
                'student_email': work_hour.student.user.email,
                'project_id': str(work_hour.project.id),
                'project_title': work_hour.project.title,
                'company_name': work_hour.project.company.company_name if work_hour.project.company else 'Sin empresa',
                'date': work_hour.date.strftime('%Y-%m-%d'),
                'hours_worked': float(work_hour.hours_worked),
                'description': work_hour.description,
                'is_verified': work_hour.is_verified,
                'verified_by': str(work_hour.verified_by.id) if work_hour.verified_by else None,
                'verified_at': work_hour.verified_at.isoformat() if work_hour.verified_at else None,
                'created_at': work_hour.created_at.isoformat(),
                'updated_at': work_hour.updated_at.isoformat(),
            })
        
        total_hours = work_hours.aggregate(Sum('hours_worked'))['hours_worked__sum'] or 0
        
        return JsonResponse({
            'success': True,
            'results': work_hours_data,
            'count': total_count,
            'page': page,
            'limit': limit,
            'total_pages': (total_count + limit - 1) // limit,
            'total_hours': float(total_hours)
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def work_hours_create(request):
    """Crear nueva hora de trabajo"""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Parsear datos
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Datos JSON inválidos'}, status=400)
        
        # Validar datos requeridos
        required_fields = ['project_id', 'date', 'hours_worked', 'description']
        for field in required_fields:
            if field not in data:
                return JsonResponse({'error': f'Campo requerido: {field}'}, status=400)
        
        # Obtener proyecto
        try:
            project = Proyecto.objects.get(id=data['project_id'])
        except Proyecto.DoesNotExist:
            return JsonResponse({'error': 'Proyecto no encontrado'}, status=404)
        
        # Obtener perfil de estudiante
        try:
            student = current_user.estudiante_profile
        except Exception:
            return JsonResponse({'error': 'Perfil de estudiante no encontrado'}, status=404)
        
        # Crear hora de trabajo
        work_hour = WorkHour.objects.create(
            student=student,
            project=project,
            date=data['date'],
            hours_worked=data['hours_worked'],
            description=data['description'],
            is_verified=False
        )
        
        return JsonResponse({
            'success': True,
            'message': 'Hora de trabajo creada exitosamente',
            'work_hour_id': str(work_hour.id)
        }, status=201)
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def work_hours_detail(request, pk):
    """Detalle de una hora de trabajo específica"""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        work_hour = get_object_or_404(WorkHour, pk=pk)
        
        # Verificar permisos (solo el estudiante propietario o admin puede ver)
        if current_user.role != 'admin' and work_hour.student.user != current_user:
            return JsonResponse({'error': 'No tienes permisos para ver esta hora de trabajo'}, status=403)
        
        work_hour_data = {
            'id': str(work_hour.id),
            'student_id': str(work_hour.student.id),
            'student_name': f"{work_hour.student.user.first_name} {work_hour.student.user.last_name}",
            'student_email': work_hour.student.user.email,
            'project_id': str(work_hour.project.id),
            'project_title': work_hour.project.title,
            'company_name': work_hour.project.company.company_name if work_hour.project.company else 'Sin empresa',
            'date': work_hour.date.strftime('%Y-%m-%d'),
            'hours_worked': float(work_hour.hours_worked),
            'description': work_hour.description,
            'is_verified': work_hour.is_verified,
            'verified_by': str(work_hour.verified_by.id) if work_hour.verified_by else None,
            'verified_at': work_hour.verified_at.isoformat() if work_hour.verified_at else None,
            'created_at': work_hour.created_at.isoformat(),
            'updated_at': work_hour.updated_at.isoformat(),
        }
        
        return JsonResponse({
            'success': True,
            'data': work_hour_data
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["PUT", "PATCH"])
def work_hours_update(request, pk):
    """Actualizar una hora de trabajo"""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        work_hour = get_object_or_404(WorkHour, pk=pk)
        
        # Verificar permisos (solo el estudiante propietario puede editar)
        if work_hour.student.user != current_user:
            return JsonResponse({'error': 'No tienes permisos para editar esta hora de trabajo'}, status=403)
        
        # Parsear datos
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Datos JSON inválidos'}, status=400)
        
        # Actualizar campos permitidos
        allowed_fields = ['date', 'hours_worked', 'description']
        for field in allowed_fields:
            if field in data:
                setattr(work_hour, field, data[field])
        
        work_hour.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Hora de trabajo actualizada exitosamente',
            'work_hour_id': str(work_hour.id)
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["DELETE"])
def work_hours_delete(request, pk):
    """Eliminar una hora de trabajo"""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        work_hour = get_object_or_404(WorkHour, pk=pk)
        work_hour.delete()
        
        return JsonResponse({
            'success': True,
            'message': 'Hora de trabajo eliminada exitosamente'
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def student_work_hours(request, student_id):
    """Horas de trabajo de un estudiante específico"""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        student = get_object_or_404(Estudiante, id=student_id)
        work_hours = WorkHour.objects.filter(student=student).select_related('project').order_by('-date')
        
        work_hours_data = []
        for work_hour in work_hours:
            work_hours_data.append({
                'id': work_hour.id,
                'project_id': str(work_hour.project.id),
                'project_title': work_hour.project.title,
                'date': work_hour.date.strftime('%Y-%m-%d'),
                'hours_worked': float(work_hour.hours_worked),
                'description': work_hour.description,
                'is_verified': work_hour.is_verified,
            })
        
        total_hours = work_hours.aggregate(Sum('hours_worked'))['hours_worked__sum'] or 0
        
        return JsonResponse({
            'success': True,
            'results': work_hours_data,
            'total_hours': float(total_hours)
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def project_work_hours(request, project_id):
    """Horas de trabajo de un proyecto específico"""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        project = get_object_or_404(Proyecto, id=project_id)
        work_hours = WorkHour.objects.filter(project=project).select_related('student', 'student__user').order_by('-date')
        
        work_hours_data = []
        for work_hour in work_hours:
            work_hours_data.append({
                'id': work_hour.id,
                'student_id': str(work_hour.student.id),
                'student_name': f"{work_hour.student.user.first_name} {work_hour.student.user.last_name}",
                'date': work_hour.date.strftime('%Y-%m-%d'),
                'hours_worked': float(work_hour.hours_worked),
                'description': work_hour.description,
                'is_verified': work_hour.is_verified,
            })
        
        total_hours = work_hours.aggregate(Sum('hours_worked'))['hours_worked__sum'] or 0
        
        return JsonResponse({
            'success': True,
            'results': work_hours_data,
            'total_hours': float(total_hours)
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def approve_work_hour(request, pk):
    """Aprobar o rechazar una hora de trabajo individual"""
    try:
        # Verificar autenticación y permisos de admin
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user or current_user.role != 'admin':
            return JsonResponse({'error': 'Acceso denegado. Solo administradores pueden aprobar horas.'}, status=403)
        
        # Obtener la hora de trabajo
        work_hour = get_object_or_404(WorkHour, pk=pk)
        
        # Parsear datos
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Datos JSON inválidos'}, status=400)
        
        action = data.get('action')  # 'approve' o 'reject'
        comment = data.get('comment', '')
        
        if action not in ['approve', 'reject']:
            return JsonResponse({'error': 'Acción inválida. Debe ser "approve" o "reject"'}, status=400)
        
        # Actualizar la hora de trabajo
        if action == 'approve':
            work_hour.is_verified = True
            work_hour.verified_by = current_user
            work_hour.verified_at = timezone.now()
            message = 'Hora aprobada correctamente'
        else:  # reject
            work_hour.is_verified = False
            work_hour.verified_by = current_user
            work_hour.verified_at = timezone.now()
            message = 'Hora rechazada correctamente'
        
        # Guardar comentario si se proporciona
        if comment:
            work_hour.comentario_validacion = comment
        
        work_hour.save()
        
        # Enviar notificación al estudiante
        try:
            NotificationService.notify_hours_validation(work_hour, action == 'approve')
        except Exception as e:
            print(f"Error al enviar notificación de validación: {str(e)}")
        
        return JsonResponse({
            'success': True,
            'message': message,
            'work_hour_id': str(work_hour.id),
            'is_verified': work_hour.is_verified
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500) 