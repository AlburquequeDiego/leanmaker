"""
🎓 ENDPOINTS ESPECÍFICOS PARA EL DOCENTE

Este archivo contiene endpoints específicos para las funcionalidades del docente.
"""

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.paginator import Paginator
from django.db.models import Q
import json
from datetime import datetime, date
from core.views import verify_token


@csrf_exempt
@require_http_methods(["GET"])
def api_teacher_students(request):
    """API endpoint para obtener estudiantes supervisados por el docente."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token de autenticación requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        user = verify_token(token)
        
        if not user or user.role != 'teacher':
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        # Obtener parámetros de consulta
        page = int(request.GET.get('page', 1))
        limit = int(request.GET.get('limit', 10))
        status_filter = request.GET.get('status', 'active')
        search = request.GET.get('search', '')
        
        # Construir consulta
        from teachers.models import TeacherStudent
        
        queryset = TeacherStudent.objects.filter(teacher=user)
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        if search:
            queryset = queryset.filter(
                Q(student__user__first_name__icontains=search) |
                Q(student__user__last_name__icontains=search) |
                Q(student__user__email__icontains=search)
            )
        
        # Paginación
        paginator = Paginator(queryset, limit)
        page_obj = paginator.get_page(page)
        
        # Serializar datos
        students_data = []
        for teacher_student in page_obj:
            student_data = {
                'id': str(teacher_student.id),
                'student': {
                    'id': str(teacher_student.student.id),
                    'name': teacher_student.student.user.full_name,
                    'email': teacher_student.student.user.email,
                    'career': teacher_student.student.career,
                    'semester': teacher_student.student.semester,
                },
                'supervision_type': teacher_student.supervision_type,
                'status': teacher_student.status,
                'start_date': teacher_student.start_date.isoformat(),
                'end_date': teacher_student.end_date.isoformat() if teacher_student.end_date else None,
                'expected_completion_date': teacher_student.expected_completion_date.isoformat() if teacher_student.expected_completion_date else None,
                'total_hours_supervised': float(teacher_student.total_hours_supervised),
                'meetings_count': teacher_student.meetings_count,
                'evaluations_count': teacher_student.evaluations_count,
                'progress_percentage': teacher_student.progress_percentage,
                'notes': teacher_student.notes,
                'objectives': teacher_student.objectives,
            }
            students_data.append(student_data)
        
        return JsonResponse({
            'students': students_data,
            'pagination': {
                'current_page': page,
                'total_pages': paginator.num_pages,
                'total_count': paginator.count,
                'has_next': page_obj.has_next(),
                'has_previous': page_obj.has_previous(),
            }
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def api_teacher_projects(request):
    """API endpoint para obtener proyectos supervisados por el docente."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token de autenticación requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        user = verify_token(token)
        
        if not user or user.role != 'teacher':
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        # Obtener parámetros de consulta
        page = int(request.GET.get('page', 1))
        limit = int(request.GET.get('limit', 10))
        phase_filter = request.GET.get('phase', '')
        search = request.GET.get('search', '')
        
        # Construir consulta
        from teachers.models import TeacherProject
        
        queryset = TeacherProject.objects.filter(teacher=user)
        
        if phase_filter:
            queryset = queryset.filter(current_phase=phase_filter)
        
        if search:
            queryset = queryset.filter(
                Q(project__title__icontains=search) |
                Q(project__description__icontains=search)
            )
        
        # Paginación
        paginator = Paginator(queryset, limit)
        page_obj = paginator.get_page(page)
        
        # Serializar datos
        projects_data = []
        for teacher_project in page_obj:
            project_data = {
                'id': str(teacher_project.id),
                'project': {
                    'id': str(teacher_project.project.id),
                    'title': teacher_project.project.title,
                    'description': teacher_project.project.description,
                    'company': teacher_project.project.company.company_name,
                    'area': teacher_project.project.area.name if teacher_project.project.area else None,
                    'status': teacher_project.project.status.name if teacher_project.project.status else None,
                },
                'role': teacher_project.role,
                'current_phase': teacher_project.current_phase,
                'assigned_date': teacher_project.assigned_date.isoformat(),
                'last_review_date': teacher_project.last_review_date.isoformat() if teacher_project.last_review_date else None,
                'next_review_date': teacher_project.next_review_date.isoformat() if teacher_project.next_review_date else None,
                'review_count': teacher_project.review_count,
                'feedback_count': teacher_project.feedback_count,
                'hours_supervised': float(teacher_project.hours_supervised),
                'supervision_notes': teacher_project.supervision_notes,
                'evaluation_criteria': teacher_project.get_evaluation_criteria_list(),
            }
            projects_data.append(project_data)
        
        return JsonResponse({
            'projects': projects_data,
            'pagination': {
                'current_page': page,
                'total_pages': paginator.num_pages,
                'total_count': paginator.count,
                'has_next': page_obj.has_next(),
                'has_previous': page_obj.has_previous(),
            }
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def api_teacher_evaluations(request):
    """API endpoint para obtener evaluaciones realizadas por el docente."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token de autenticación requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        user = verify_token(token)
        
        if not user or user.role != 'teacher':
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        # Obtener parámetros de consulta
        page = int(request.GET.get('page', 1))
        limit = int(request.GET.get('limit', 10))
        status_filter = request.GET.get('status', '')
        eval_type_filter = request.GET.get('type', '')
        
        # Construir consulta
        from teachers.models import TeacherEvaluation
        
        queryset = TeacherEvaluation.objects.filter(teacher=user)
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        if eval_type_filter:
            queryset = queryset.filter(evaluation_type=eval_type_filter)
        
        # Paginación
        paginator = Paginator(queryset, limit)
        page_obj = paginator.get_page(page)
        
        # Serializar datos
        evaluations_data = []
        for teacher_eval in page_obj:
            eval_data = {
                'id': str(teacher_eval.id),
                'student': {
                    'id': str(teacher_eval.student.id),
                    'name': teacher_eval.student.user.full_name,
                    'email': teacher_eval.student.user.email,
                },
                'project': {
                    'id': str(teacher_eval.project.id),
                    'title': teacher_eval.project.title,
                },
                'evaluation_type': teacher_eval.evaluation_type,
                'status': teacher_eval.status,
                'scores': {
                    'technical_skills': teacher_eval.technical_skills,
                    'communication': teacher_eval.communication,
                    'problem_solving': teacher_eval.problem_solving,
                    'teamwork': teacher_eval.teamwork,
                    'punctuality': teacher_eval.punctuality,
                    'overall_score': teacher_eval.overall_score,
                },
                'comments': {
                    'strengths': teacher_eval.strengths,
                    'areas_for_improvement': teacher_eval.areas_for_improvement,
                    'general_comments': teacher_eval.general_comments,
                    'recommendations': teacher_eval.recommendations,
                },
                'evaluation_date': teacher_eval.evaluation_date.isoformat(),
                'due_date': teacher_eval.due_date.isoformat() if teacher_eval.due_date else None,
                'completed_date': teacher_eval.completed_date.isoformat() if teacher_eval.completed_date else None,
            }
            evaluations_data.append(eval_data)
        
        return JsonResponse({
            'evaluations': evaluations_data,
            'pagination': {
                'current_page': page,
                'total_pages': paginator.num_pages,
                'total_count': paginator.count,
                'has_next': page_obj.has_next(),
                'has_previous': page_obj.has_previous(),
            }
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def api_teacher_reports(request):
    """API endpoint para obtener reportes generados por el docente."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token de autenticación requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        user = verify_token(token)
        
        if not user or user.role != 'teacher':
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        # Obtener parámetros de consulta
        page = int(request.GET.get('page', 1))
        limit = int(request.GET.get('limit', 10))
        report_type_filter = request.GET.get('type', '')
        status_filter = request.GET.get('status', '')
        
        # Construir consulta
        from teachers.models import TeacherReport
        
        queryset = TeacherReport.objects.filter(teacher=user)
        
        if report_type_filter:
            queryset = queryset.filter(report_type=report_type_filter)
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Paginación
        paginator = Paginator(queryset, limit)
        page_obj = paginator.get_page(page)
        
        # Serializar datos
        reports_data = []
        for teacher_report in page_obj:
            report_data = {
                'id': str(teacher_report.id),
                'title': teacher_report.title,
                'report_type': teacher_report.report_type,
                'status': teacher_report.status,
                'summary': teacher_report.summary,
                'date_from': teacher_report.date_from.isoformat() if teacher_report.date_from else None,
                'date_to': teacher_report.date_to.isoformat() if teacher_report.date_to else None,
                'generated_date': teacher_report.generated_date.isoformat(),
                'published_date': teacher_report.published_date.isoformat() if teacher_report.published_date else None,
                'file_path': teacher_report.file_path,
                'parameters': teacher_report.get_parameters_dict(),
            }
            reports_data.append(report_data)
        
        return JsonResponse({
            'reports': reports_data,
            'pagination': {
                'current_page': page,
                'total_pages': paginator.num_pages,
                'total_count': paginator.count,
                'has_next': page_obj.has_next(),
                'has_previous': page_obj.has_previous(),
            }
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def api_teacher_schedule(request):
    """API endpoint para obtener horarios del docente."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token de autenticación requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        user = verify_token(token)
        
        if not user or user.role != 'teacher':
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        # Obtener horarios del docente
        from teachers.models import TeacherSchedule
        
        schedules = TeacherSchedule.objects.filter(teacher=user, is_active=True)
        
        # Serializar datos
        schedules_data = []
        for schedule in schedules:
            schedule_data = {
                'id': str(schedule.id),
                'day_of_week': schedule.day_of_week,
                'start_time': schedule.start_time.strftime('%H:%M'),
                'end_time': schedule.end_time.strftime('%H:%M'),
                'activity_type': schedule.activity_type,
                'title': schedule.title,
                'description': schedule.description,
                'location': schedule.location,
                'is_recurring': schedule.is_recurring,
                'specific_date': schedule.specific_date.isoformat() if schedule.specific_date else None,
                'duration_hours': schedule.duration_hours,
            }
            schedules_data.append(schedule_data)
        
        return JsonResponse({
            'schedules': schedules_data,
            'total_count': len(schedules_data)
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
