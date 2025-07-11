"""
Views para la app activity_logs.
"""

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.paginator import Paginator
from django.db.models import Q
from .models import ActivityLog
from core.views import verify_token


@csrf_exempt
@require_http_methods(["GET"])
def activity_logs_list(request):
    """Lista de logs de actividad."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Solo admins pueden ver logs de actividad
        if current_user.role != 'admin':
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        # Parámetros de paginación y filtros
        page = request.GET.get('page', 1)
        per_page = request.GET.get('per_page', 20)
        user_id = request.GET.get('user_id')
        action = request.GET.get('action')
        entity_type = request.GET.get('entity_type')
        
        # Query base
        queryset = ActivityLog.objects.select_related('user', 'content_type').all()
        
        # Aplicar filtros
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        if action:
            queryset = queryset.filter(action__icontains=action)
        if entity_type:
            queryset = queryset.filter(entity_type__icontains=entity_type)
        
        # Paginación
        paginator = Paginator(queryset, per_page)
        page_obj = paginator.get_page(page)
        
        logs_data = []
        for log in page_obj:
            logs_data.append({
                'id': log.id,
                'user': {
                    'id': str(log.user.id),
                    'email': log.user.email,
                    'full_name': log.user.full_name
                },
                'action': log.action,
                'entity_type': log.entity_type,
                'entity_id': log.entity_id,
                'details': log.details,
                'ip_address': log.ip_address,
                'user_agent': log.user_agent,
                'created_at': log.created_at.isoformat(),
                'is_recent': log.is_recent
            })
        
        return JsonResponse({
            'results': logs_data,
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
def activity_logs_detail(request, activity_logs_id):
    """Detalle de un log de actividad."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Solo admins pueden ver logs de actividad
        if current_user.role != 'admin':
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        try:
            log = ActivityLog.objects.select_related('user', 'content_type').get(id=activity_logs_id)
        except ActivityLog.DoesNotExist:
            return JsonResponse({'error': 'Log de actividad no encontrado'}, status=404)
        
        log_data = {
            'id': log.id,
            'user': {
                'id': str(log.user.id),
                'email': log.user.email,
                'full_name': log.user.full_name
            },
            'action': log.action,
            'entity_type': log.entity_type,
            'entity_id': log.entity_id,
            'details': log.details,
            'ip_address': log.ip_address,
            'user_agent': log.user_agent,
            'content_type': log.content_type.model if log.content_type else None,
            'object_id': log.object_id,
            'created_at': log.created_at.isoformat(),
            'is_recent': log.is_recent
        }
        
        return JsonResponse(log_data)
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def activity_logs_create(request):
    """Crear un nuevo log de actividad."""
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
        
        # Validar campos requeridos
        required_fields = ['action']
        for field in required_fields:
            if not data.get(field):
                return JsonResponse({'error': f'El campo {field} es requerido'}, status=400)
        
        # Crear log de actividad
        log = ActivityLog.objects.create(
            user=current_user,
            action=data['action'],
            entity_type=data.get('entity_type'),
            entity_id=data.get('entity_id'),
            details=data.get('details'),
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        log_data = {
            'id': log.id,
            'user': {
                'id': str(log.user.id),
                'email': log.user.email,
                'full_name': log.user.full_name
            },
            'action': log.action,
            'entity_type': log.entity_type,
            'entity_id': log.entity_id,
            'details': log.details,
            'ip_address': log.ip_address,
            'user_agent': log.user_agent,
            'created_at': log.created_at.isoformat(),
            'is_recent': log.is_recent
        }
        
        return JsonResponse(log_data, status=201)
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["PUT"])
def activity_logs_update(request, activity_logs_id):
    """Actualizar un log de actividad."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Solo admins pueden actualizar logs
        if current_user.role != 'admin':
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        try:
            log = ActivityLog.objects.get(id=activity_logs_id)
        except ActivityLog.DoesNotExist:
            return JsonResponse({'error': 'Log de actividad no encontrado'}, status=404)
        
        data = json.loads(request.body)
        
        # Actualizar campos permitidos
        if 'action' in data:
            log.action = data['action']
        if 'entity_type' in data:
            log.entity_type = data['entity_type']
        if 'entity_id' in data:
            log.entity_id = data['entity_id']
        if 'details' in data:
            log.details = data['details']
        
        log.save()
        
        log_data = {
            'id': log.id,
            'user': {
                'id': str(log.user.id),
                'email': log.user.email,
                'full_name': log.user.full_name
            },
            'action': log.action,
            'entity_type': log.entity_type,
            'entity_id': log.entity_id,
            'details': log.details,
            'ip_address': log.ip_address,
            'user_agent': log.user_agent,
            'created_at': log.created_at.isoformat(),
            'is_recent': log.is_recent
        }
        
        return JsonResponse(log_data)
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["DELETE"])
def activity_logs_delete(request, activity_logs_id):
    """Eliminar un log de actividad."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Solo admins pueden eliminar logs
        if current_user.role != 'admin':
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        try:
            log = ActivityLog.objects.get(id=activity_logs_id)
        except ActivityLog.DoesNotExist:
            return JsonResponse({'error': 'Log de actividad no encontrado'}, status=404)
        
        log.delete()
        
        return JsonResponse({'message': 'Log de actividad eliminado exitosamente'})
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
