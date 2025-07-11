"""
Views para la app assignments.
"""

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .models import Assignment
from core.views import verify_token
from django.core.paginator import Paginator
from django.utils import timezone

@csrf_exempt
@require_http_methods(["GET"])
def assignments_list(request):
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Filtros y paginación
        page = request.GET.get('page', 1)
        per_page = request.GET.get('per_page', 20)
        status = request.GET.get('status')
        assigned_to = request.GET.get('assigned_to')
        project_id = request.GET.get('project_id')
        
        queryset = Assignment.objects.select_related('assigned_to', 'assigned_by', 'project', 'application').all()
        if current_user.role == 'student':
            queryset = queryset.filter(assigned_to=current_user)
        elif current_user.role == 'company':
            queryset = queryset.filter(project__company__user=current_user)
        # Admin ve todo
        if status:
            queryset = queryset.filter(status=status)
        if assigned_to:
            queryset = queryset.filter(assigned_to__id=assigned_to)
        if project_id:
            queryset = queryset.filter(project__id=project_id)
        paginator = Paginator(queryset, per_page)
        page_obj = paginator.get_page(page)
        assignments_data = []
        for assignment in page_obj:
            assignments_data.append({
                'id': str(assignment.id),
                'title': assignment.title,
                'description': assignment.description,
                'due_date': assignment.due_date.isoformat() if assignment.due_date else None,
                'priority': assignment.priority,
                'status': assignment.status,
                'estimated_hours': float(assignment.estimated_hours) if assignment.estimated_hours else None,
                'actual_hours': float(assignment.actual_hours) if assignment.actual_hours else None,
                'notes': assignment.notes,
                'assigned_by': assignment.assigned_by.get_full_name() if assignment.assigned_by else None,
                'assigned_to': assignment.assigned_to.get_full_name() if assignment.assigned_to else None,
                'project': str(assignment.project.id) if assignment.project else None,
                'application': str(assignment.application.id) if assignment.application else None,
                'created_at': assignment.created_at.isoformat(),
                'updated_at': assignment.updated_at.isoformat(),
            })
        return JsonResponse({
            'results': assignments_data,
            'count': paginator.count,
            'total_pages': paginator.num_pages,
            'current_page': page_obj.number,
            'has_next': page_obj.has_next(),
            'has_previous': page_obj.has_previous()
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def assignments_detail(request, assignments_id):
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        try:
            assignment = Assignment.objects.select_related('assigned_to', 'assigned_by', 'project', 'application').get(id=assignments_id)
        except Assignment.DoesNotExist:
            return JsonResponse({'error': 'Asignación no encontrada'}, status=404)
        # Permisos
        if current_user.role == 'student' and assignment.assigned_to != current_user:
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        elif current_user.role == 'company' and assignment.project.company.user != current_user:
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        assignment_data = {
            'id': str(assignment.id),
            'title': assignment.title,
            'description': assignment.description,
            'due_date': assignment.due_date.isoformat() if assignment.due_date else None,
            'priority': assignment.priority,
            'status': assignment.status,
            'estimated_hours': float(assignment.estimated_hours) if assignment.estimated_hours else None,
            'actual_hours': float(assignment.actual_hours) if assignment.actual_hours else None,
            'notes': assignment.notes,
            'assigned_by': assignment.assigned_by.get_full_name() if assignment.assigned_by else None,
            'assigned_to': assignment.assigned_to.get_full_name() if assignment.assigned_to else None,
            'project': str(assignment.project.id) if assignment.project else None,
            'application': str(assignment.application.id) if assignment.application else None,
            'created_at': assignment.created_at.isoformat(),
            'updated_at': assignment.updated_at.isoformat(),
        }
        return JsonResponse(assignment_data)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def assignments_create(request):
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user or current_user.role not in ['company', 'admin']:
            return JsonResponse({'error': 'Solo empresas o administradores pueden crear asignaciones'}, status=403)
        data = json.loads(request.body)
        required_fields = ['title', 'description', 'due_date', 'assigned_to', 'project']
        for field in required_fields:
            if not data.get(field):
                return JsonResponse({'error': f'El campo {field} es requerido'}, status=400)
        from users.models import User
        from projects.models import Proyecto
        try:
            assigned_to = User.objects.get(id=data['assigned_to'])
            project = Proyecto.objects.get(id=data['project'])
        except User.DoesNotExist:
            return JsonResponse({'error': 'Usuario asignado no encontrado'}, status=404)
        except Proyecto.DoesNotExist:
            return JsonResponse({'error': 'Proyecto no encontrado'}, status=404)
        assignment = Assignment.objects.create(
            title=data['title'],
            description=data['description'],
            due_date=data['due_date'],
            priority=data.get('priority', 'medium'),
            status=data.get('status', 'pending'),
            estimated_hours=data.get('estimated_hours'),
            notes=data.get('notes'),
            assigned_by=current_user,
            assigned_to=assigned_to,
            project=project
        )
        assignment_data = {
            'id': str(assignment.id),
            'title': assignment.title,
            'description': assignment.description,
            'due_date': assignment.due_date.isoformat() if assignment.due_date else None,
            'priority': assignment.priority,
            'status': assignment.status,
            'estimated_hours': float(assignment.estimated_hours) if assignment.estimated_hours else None,
            'notes': assignment.notes,
            'assigned_by': assignment.assigned_by.get_full_name() if assignment.assigned_by else None,
            'assigned_to': assignment.assigned_to.get_full_name() if assignment.assigned_to else None,
            'project': str(assignment.project.id) if assignment.project else None,
            'created_at': assignment.created_at.isoformat(),
            'updated_at': assignment.updated_at.isoformat(),
        }
        return JsonResponse(assignment_data, status=201)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["PUT"])
def assignments_update(request, assignments_id):
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user or current_user.role not in ['company', 'admin']:
            return JsonResponse({'error': 'Solo empresas o administradores pueden actualizar asignaciones'}, status=403)
        try:
            assignment = Assignment.objects.get(id=assignments_id)
        except Assignment.DoesNotExist:
            return JsonResponse({'error': 'Asignación no encontrada'}, status=404)
        data = json.loads(request.body)
        for field in ['title', 'description', 'due_date', 'priority', 'status', 'estimated_hours', 'actual_hours', 'notes']:
            if field in data:
                setattr(assignment, field, data[field])
        assignment.updated_at = timezone.now()
        assignment.save()
        assignment_data = {
            'id': str(assignment.id),
            'title': assignment.title,
            'description': assignment.description,
            'due_date': assignment.due_date.isoformat() if assignment.due_date else None,
            'priority': assignment.priority,
            'status': assignment.status,
            'estimated_hours': float(assignment.estimated_hours) if assignment.estimated_hours else None,
            'actual_hours': float(assignment.actual_hours) if assignment.actual_hours else None,
            'notes': assignment.notes,
            'assigned_by': assignment.assigned_by.get_full_name() if assignment.assigned_by else None,
            'assigned_to': assignment.assigned_to.get_full_name() if assignment.assigned_to else None,
            'project': str(assignment.project.id) if assignment.project else None,
            'created_at': assignment.created_at.isoformat(),
            'updated_at': assignment.updated_at.isoformat(),
        }
        return JsonResponse(assignment_data)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["DELETE"])
def assignments_delete(request, assignments_id):
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user or current_user.role not in ['company', 'admin']:
            return JsonResponse({'error': 'Solo empresas o administradores pueden eliminar asignaciones'}, status=403)
        try:
            assignment = Assignment.objects.get(id=assignments_id)
        except Assignment.DoesNotExist:
            return JsonResponse({'error': 'Asignación no encontrada'}, status=404)
        assignment.delete()
        return JsonResponse({'message': 'Asignación eliminada exitosamente'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
