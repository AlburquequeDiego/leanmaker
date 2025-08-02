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
                'id': work_hour.id,
                'student_id': str(work_hour.student.id),
                'student_name': f"{work_hour.student.user.first_name} {work_hour.student.user.last_name}",
                'project_id': str(work_hour.project.id),
                'project_title': work_hour.project.title,
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
        
        data = json.loads(request.body)
        student = get_object_or_404(Estudiante, id=data['student_id'])
        project = get_object_or_404(Proyecto, id=data['project_id'])
        
        work_hour = WorkHour.objects.create(
            student=student,
            project=project,
            date=datetime.strptime(data['date'], '%Y-%m-%d').date(),
            hours_worked=data['hours_worked'],
            description=data.get('description', '')
        )
        
        return JsonResponse({
            'success': True,
            'message': 'Hora de trabajo registrada exitosamente',
            'work_hour': {
                'id': work_hour.id,
                'student_name': f"{work_hour.student.user.first_name} {work_hour.student.user.last_name}",
                'project_title': work_hour.project.title,
                'date': work_hour.date.strftime('%Y-%m-%d'),
                'hours_worked': float(work_hour.hours_worked),
                'description': work_hour.description
            }
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def work_hours_detail(request, pk):
    """Detalle de una hora de trabajo"""
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
        
        work_hour_data = {
            'id': work_hour.id,
            'student_id': str(work_hour.student.id),
            'student_name': f"{work_hour.student.user.first_name} {work_hour.student.user.last_name}",
            'project_id': str(work_hour.project.id),
            'project_title': work_hour.project.title,
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
    """Actualizar hora de trabajo"""
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
        data = json.loads(request.body)
        
        # Actualizar campos
        if 'date' in data:
            work_hour.date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        if 'hours_worked' in data:
            work_hour.hours_worked = data['hours_worked']
        if 'description' in data:
            work_hour.description = data['description']
        if 'is_verified' in data:
            work_hour.is_verified = data['is_verified']
            if data['is_verified']:
                work_hour.verified_by = current_user
                work_hour.verified_at = timezone.now()
        
        work_hour.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Hora de trabajo actualizada exitosamente'
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["DELETE"])
def work_hours_delete(request, pk):
    """Eliminar hora de trabajo"""
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