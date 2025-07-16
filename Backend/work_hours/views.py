"""
Views para la app work_hours.
"""

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.db.models import Q
from users.models import User
from .models import WorkHour
from core.views import verify_token
from .serializers import WorkHourSerializer


@csrf_exempt
@require_http_methods(["GET"])
def work_hours_list(request):
    """Lista de horas trabajadas."""
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
        company = request.GET.get('company', '')
        status = request.GET.get('status', '')
        
        # Query base
        queryset = WorkHour.objects.select_related('student', 'project', 'company', 'student__user', 'project__company').all()
        
        # Aplicar filtros según el rol del usuario
        if current_user.role == 'student':
            # Estudiantes solo ven sus propias horas
            queryset = queryset.filter(student__user=current_user)
        elif current_user.role == 'company':
            # Empresas ven horas de sus proyectos
            queryset = queryset.filter(project__company__user=current_user)
        # Admins ven todas las horas
        
        # Filtros adicionales
        if student:
            queryset = queryset.filter(student_id=student)
        
        if project:
            queryset = queryset.filter(project_id=project)
        
        if company:
            queryset = queryset.filter(company_id=company)
        
        if status:
            if status == 'approved':
                queryset = queryset.filter(approved=True)
            elif status == 'pending':
                queryset = queryset.filter(approved=False)
        
        # Contar total
        total_count = queryset.count()
        
        # Paginar
        work_hours = queryset[offset:offset + limit]
        
        # Serializar datos con el serializer
        serializer = WorkHourSerializer(work_hours, many=True)
        
        return JsonResponse({
            'results': serializer.data,
            'count': total_count,
            'page': page,
            'limit': limit,
            'total_pages': (total_count + limit - 1) // limit
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def work_hours_detail(request, work_hours_id):
    """Detalle de horas trabajadas."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Obtener horas trabajadas
        try:
            work_hour = WorkHour.objects.select_related('student', 'project', 'company', 'student__user', 'project__company', 'approved_by').get(id=work_hours_id)
        except WorkHour.DoesNotExist:
            return JsonResponse({'error': 'Horas trabajadas no encontradas'}, status=404)
        
        # Verificar permisos
        if current_user.role == 'student' and str(work_hour.student.user.id) != str(current_user.id):
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        elif current_user.role == 'company' and str(work_hour.project.company.user.id) != str(current_user.id):
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        # Serializar datos
        work_hour_data = {
            'id': str(work_hour.id),
            'student': str(work_hour.student.id),
            'student_name': work_hour.student.user.full_name,
            'student_email': work_hour.student.user.email,
            'project': str(work_hour.project.id),
            'project_title': work_hour.project.title,
            'company': str(work_hour.company.id) if work_hour.company else None,
            'company_name': work_hour.company.company_name if work_hour.company else 'Sin empresa',
            'date': work_hour.date.isoformat(),
            'hours_worked': work_hour.hours_worked,
            'description': work_hour.description,
            'approved': work_hour.approved,
            'approved_by': str(work_hour.approved_by.id) if work_hour.approved_by else None,
            'approved_by_name': work_hour.approved_by.full_name if work_hour.approved_by else None,
            'approved_at': work_hour.approved_at.isoformat() if work_hour.approved_at else None,
            'created_at': work_hour.created_at.isoformat(),
            'updated_at': work_hour.updated_at.isoformat(),
        }
        
        return JsonResponse(work_hour_data)
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def work_hours_create(request):
    """Crear nuevas horas trabajadas."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Solo estudiantes pueden crear horas trabajadas
        if current_user.role != 'student':
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        # Procesar datos
        data = json.loads(request.body)
        
        # Crear horas trabajadas
        work_hour = WorkHour.objects.create(
            student_id=data.get('student_id'),
            project_id=data.get('project_id'),
            company_id=data.get('company_id'),
            date=data.get('date'),
            hours_worked=data.get('hours_worked'),
            description=data.get('description', ''),
            approved=data.get('approved', False),
            approved_by_id=data.get('approved_by_id'),
            approved_at=data.get('approved_at'),
        )
        
        return JsonResponse({
            'message': 'Horas trabajadas creadas correctamente',
            'id': str(work_hour.id)
        }, status=201)
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["PUT", "PATCH"])
def work_hours_update(request, work_hours_id):
    """Actualizar horas trabajadas."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Obtener horas trabajadas
        try:
            work_hour = WorkHour.objects.get(id=work_hours_id)
        except WorkHour.DoesNotExist:
            return JsonResponse({'error': 'Horas trabajadas no encontradas'}, status=404)
        
        # Verificar permisos
        if current_user.role == 'student' and str(work_hour.student.user.id) != str(current_user.id):
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        elif current_user.role == 'company' and str(work_hour.project.company.user.id) != str(current_user.id):
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        # Procesar datos
        data = json.loads(request.body)
        
        # Actualizar campos de las horas trabajadas
        fields_to_update = [
            'student_id', 'project_id', 'company_id', 'date', 'hours_worked',
            'description', 'approved', 'approved_by_id', 'approved_at'
        ]
        
        for field in fields_to_update:
            if field in data:
                setattr(work_hour, field, data[field])
        
        work_hour.save()
        
        # Retornar datos actualizados
        return JsonResponse({
            'message': 'Horas trabajadas actualizadas correctamente',
            'id': str(work_hour.id)
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def work_hour_list(request):
    """Lista de horas trabajadas (alias para work_hours_list)."""
    return work_hours_list(request)

@csrf_exempt
@require_http_methods(["GET"])
def work_hour_detail(request, work_hour_id):
    """Detalle de horas trabajadas (alias para work_hours_detail)."""
    return work_hours_detail(request, work_hour_id)

@csrf_exempt
@require_http_methods(["DELETE"])
def work_hours_delete(request, work_hours_id):
    """Eliminar horas trabajadas."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Obtener horas trabajadas
        try:
            work_hour = WorkHour.objects.get(id=work_hours_id)
        except WorkHour.DoesNotExist:
            return JsonResponse({'error': 'Horas trabajadas no encontradas'}, status=404)
        
        # Verificar permisos
        if current_user.role == 'student' and str(work_hour.student.user.id) != str(current_user.id):
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        elif current_user.role == 'company' and str(work_hour.project.company.user.id) != str(current_user.id):
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        work_hour.delete()
        
        return JsonResponse({
            'message': 'Horas trabajadas eliminadas correctamente'
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
