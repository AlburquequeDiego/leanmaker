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
    """Detalle de una hora de trabajo con información completa del proyecto y estudiante"""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        work_hour = get_object_or_404(WorkHour.objects.select_related(
            'student', 'student__user', 'project', 'project__company', 'project__area', 'project__trl'
        ), pk=pk)
        
        # Información del estudiante
        student_data = {
            'id': str(work_hour.student.id),
            'name': f"{work_hour.student.user.first_name} {work_hour.student.user.last_name}",
            'email': work_hour.student.user.email,
            'career': work_hour.student.career,
            'university': work_hour.student.university,
            'semester': work_hour.student.semester,
            'api_level': work_hour.student.api_level,
            'trl_level': work_hour.student.trl_level,
            'gpa': float(work_hour.student.gpa),
            'total_hours': work_hour.student.total_hours,
            'completed_projects': work_hour.student.completed_projects,
            'strikes': work_hour.student.strikes,
            'status': work_hour.student.status,
            'portfolio_url': work_hour.student.portfolio_url,
            'github_url': work_hour.student.github_url,
            'linkedin_url': work_hour.student.linkedin_url,
        }
        
        # Información del proyecto
        project_data = {
            'id': str(work_hour.project.id),
            'title': work_hour.project.title,
            'description': work_hour.project.description,
            'requirements': work_hour.project.requirements,
            'tipo': work_hour.project.tipo,
            'objetivo': work_hour.project.objetivo,
            'encargado': work_hour.project.encargado,
            'contacto': work_hour.project.contacto,
            'api_level': work_hour.project.api_level,
            'required_hours': work_hour.project.required_hours,
            'duration_weeks': work_hour.project.duration_weeks,
            'hours_per_week': work_hour.project.hours_per_week,
            'min_api_level': work_hour.project.min_api_level,
            'max_students': work_hour.project.max_students,
            'current_students': work_hour.project.current_students,
            'modality': work_hour.project.modality,
            'location': work_hour.project.location,

            'start_date': work_hour.project.start_date.strftime('%Y-%m-%d') if work_hour.project.start_date else None,
            'estimated_end_date': work_hour.project.estimated_end_date.strftime('%Y-%m-%d') if work_hour.project.estimated_end_date else None,
            'real_end_date': work_hour.project.real_end_date.strftime('%Y-%m-%d') if work_hour.project.real_end_date else None,
            'application_deadline': work_hour.project.application_deadline.strftime('%Y-%m-%d') if work_hour.project.application_deadline else None,
            'is_featured': work_hour.project.is_featured,
            'is_urgent': work_hour.project.is_urgent,
            'is_project_completion': work_hour.project.is_project_completion,
            'published_at': work_hour.project.published_at.isoformat() if work_hour.project.published_at else None,
            'created_at': work_hour.project.created_at.isoformat(),
            'updated_at': work_hour.project.updated_at.isoformat(),
        }
        
        # Información de la empresa
        company_data = {
            'id': str(work_hour.project.company.id),
            'name': work_hour.project.company.company_name,
            'email': work_hour.project.company.user.email if work_hour.project.company.user else None,
            'phone': work_hour.project.company.company_phone,
            'website': work_hour.project.company.website,
            'description': work_hour.project.company.description,
            'industry': work_hour.project.company.industry,
            'size': work_hour.project.company.size,
            'location': f"{work_hour.project.company.city}, {work_hour.project.company.country}" if work_hour.project.company.city and work_hour.project.company.country else (work_hour.project.company.city or work_hour.project.company.country or 'No especificada'),
        } if work_hour.project.company else None
        
        # Información del área
        area_data = {
            'id': str(work_hour.project.area.id),
            'name': work_hour.project.area.name,
            'description': work_hour.project.area.description,
        } if work_hour.project.area else None
        
        # Información del TRL
        trl_data = {
            'id': str(work_hour.project.trl.id),
            'name': work_hour.project.trl.name,
            'description': work_hour.project.trl.description,
            'level': work_hour.project.trl.level,
        } if work_hour.project.trl else None
        
        work_hour_data = {
            'id': work_hour.id,
            'date': work_hour.date.strftime('%Y-%m-%d'),
            'hours_worked': float(work_hour.hours_worked),
            'description': work_hour.description,
            'is_verified': work_hour.is_verified,
            'verified_by': str(work_hour.verified_by.id) if work_hour.verified_by else None,
            'verified_at': work_hour.verified_at.isoformat() if work_hour.verified_at else None,
            'is_project_completion': work_hour.is_project_completion,
            'created_at': work_hour.created_at.isoformat(),
            'updated_at': work_hour.updated_at.isoformat(),
            'student': student_data,
            'project': project_data,
            'company': company_data,
            'area': area_data,
            'trl': trl_data,
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