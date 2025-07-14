"""
Views para la app work_hours.
"""

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.db.models import Sum, Q
from .models import WorkHour
from students.models import Estudiante
from core.auth_utils import get_user_from_token, require_auth

@csrf_exempt
@require_http_methods(["GET"])
@require_auth
def work_hours_list(request):
    """Lista las horas trabajadas del usuario autenticado"""
    try:
        user = get_user_from_token(request)
        
        # Obtener el estudiante asociado al usuario
        try:
            student = Estudiante.objects.get(user=user)
        except Estudiante.DoesNotExist:
            return JsonResponse({'error': 'Usuario no es un estudiante'}, status=403)
        
        # Obtener horas trabajadas del estudiante
        work_hours = WorkHour.objects.filter(student=student).order_by('-date')
        
        # Calcular estadísticas
        total_hours = work_hours.aggregate(total=Sum('hours_worked'))['total'] or 0
        approved_hours = work_hours.filter(approved=True).aggregate(total=Sum('hours_worked'))['total'] or 0
        pending_hours = work_hours.filter(approved=False).aggregate(total=Sum('hours_worked'))['total'] or 0
        
        # Obtener horas por proyecto
        hours_by_project = work_hours.values('project__title').annotate(
            total_hours=Sum('hours_worked'),
            approved_hours=Sum('hours_worked', filter=Q(approved=True)),
            pending_hours=Sum('hours_worked', filter=Q(approved=False))
        )
        
        # Serializar datos
        work_hours_data = []
        for wh in work_hours[:10]:  # Últimas 10 entradas
            work_hours_data.append({
                'id': str(wh.id),
                'date': wh.date.isoformat(),
                'hours_worked': wh.hours_worked,
                'description': wh.description,
                'approved': wh.approved,
                'project_title': wh.project.title,
                'company_name': wh.company.name,
                'created_at': wh.created_at.isoformat()
            })
        
        return JsonResponse({
            'success': True,
            'data': {
                'total_hours': total_hours,
                'approved_hours': approved_hours,
                'pending_hours': pending_hours,
                'hours_by_project': list(hours_by_project),
                'recent_entries': work_hours_data
            }
        })
        
    except Exception as e:
        return JsonResponse({'error': f'Error al obtener horas trabajadas: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
@require_auth
def student_hours_summary(request):
    """Obtiene el resumen de horas del estudiante autenticado"""
    try:
        user = get_user_from_token(request)
        
        # Obtener el estudiante asociado al usuario
        try:
            student = Estudiante.objects.get(user=user)
        except Estudiante.DoesNotExist:
            return JsonResponse({'error': 'Usuario no es un estudiante'}, status=403)
        
        # Obtener estadísticas de horas
        work_hours = WorkHour.objects.filter(student=student)
        
        total_hours = work_hours.aggregate(total=Sum('hours_worked'))['total'] or 0
        approved_hours = work_hours.filter(approved=True).aggregate(total=Sum('hours_worked'))['total'] or 0
        pending_hours = work_hours.filter(approved=False).aggregate(total=Sum('hours_worked'))['total'] or 0
        
        # Obtener horas del modelo Estudiante (campo total_hours)
        student_total_hours = student.total_hours
        
        return JsonResponse({
            'success': True,
            'data': {
                'total_hours': total_hours,
                'approved_hours': approved_hours,
                'pending_hours': pending_hours,
                'student_total_hours': student_total_hours,
                'hours_from_work_hours': total_hours,
                'hours_from_student_model': student_total_hours
            }
        })
        
    except Exception as e:
        return JsonResponse({'error': f'Error al obtener resumen de horas: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def work_hours_detail(request, work_hours_id):
    return JsonResponse({'message': f'work_hours_detail placeholder for {work_hours_id}'})

@csrf_exempt
@require_http_methods(["POST"])
def work_hours_create(request):
    return JsonResponse({'message': 'work_hours_create placeholder'})

@csrf_exempt
@require_http_methods(["PUT"])
def work_hours_update(request, work_hours_id):
    return JsonResponse({'message': f'work_hours_update placeholder for {work_hours_id}'})

@csrf_exempt
@require_http_methods(["DELETE"])
def work_hours_delete(request, work_hours_id):
    return JsonResponse({'message': f'work_hours_delete placeholder for {work_hours_id}'})
