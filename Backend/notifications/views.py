"""
Views para la app notifications.
"""

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.db.models import Q
from users.models import User
from .models import Notification
from core.views import verify_token


@csrf_exempt
@require_http_methods(["GET"])
def notifications_list(request):
    """Lista de notificaciones."""
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
        type_filter = request.GET.get('type', '')
        read = request.GET.get('read', '')
        
        # Query base - usuarios solo ven sus propias notificaciones
        queryset = Notification.objects.filter(user=current_user)
        
        # Aplicar filtros
        if type_filter:
            queryset = queryset.filter(type=type_filter)
        
        if read:
            if read == 'true':
                queryset = queryset.filter(read=True)
            elif read == 'false':
                queryset = queryset.filter(read=False)
        
        # Contar total
        total_count = queryset.count()
        
        # Paginar
        notifications = queryset[offset:offset + limit]
        
        # Serializar datos
        notifications_data = []
        for notification in notifications:
            notifications_data.append({
                'id': str(notification.id),
                'user': str(notification.user.id),
                'title': notification.title,
                'message': notification.message,
                'type': notification.type,
                'read': notification.read,
                'related_url': notification.related_url,
                'created_at': notification.created_at.isoformat(),
                'updated_at': notification.updated_at.isoformat(),
            })
        
        return JsonResponse({
            'results': notifications_data,
            'count': total_count,
            'page': page,
            'limit': limit,
            'total_pages': (total_count + limit - 1) // limit
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def notifications_detail(request, notifications_id):
    """Detalle de una notificación."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Obtener notificación
        try:
            notification = Notification.objects.get(id=notifications_id, user=current_user)
        except Notification.DoesNotExist:
            return JsonResponse({'error': 'Notificación no encontrada'}, status=404)
        
        # Marcar como leída
        if not notification.read:
            notification.read = True
            notification.save()
        
        # Serializar datos
        notification_data = {
            'id': str(notification.id),
            'user': str(notification.user.id),
            'title': notification.title,
            'message': notification.message,
            'type': notification.type,
            'read': notification.read,
            'related_url': notification.related_url,
            'created_at': notification.created_at.isoformat(),
            'updated_at': notification.updated_at.isoformat(),
        }
        
        return JsonResponse(notification_data)
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def notifications_create(request):
    """Crear nueva notificación."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Solo admins pueden crear notificaciones
        if current_user.role != 'admin':
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        # Procesar datos
        data = json.loads(request.body)
        
        # Crear notificación
        notification = Notification.objects.create(
            user_id=data.get('user_id'),
            title=data.get('title'),
            message=data.get('message'),
            type=data.get('type', 'info'),
            read=data.get('read', False),
            related_url=data.get('related_url', ''),
        )
        
        return JsonResponse({
            'message': 'Notificación creada correctamente',
            'id': str(notification.id)
        }, status=201)
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["PUT", "PATCH"])
def notifications_update(request, notifications_id):
    """Actualizar notificación."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Obtener notificación
        try:
            notification = Notification.objects.get(id=notifications_id, user=current_user)
        except Notification.DoesNotExist:
            return JsonResponse({'error': 'Notificación no encontrada'}, status=404)
        
        # Procesar datos
        data = json.loads(request.body)
        
        # Actualizar campos de la notificación
        fields_to_update = [
            'title', 'message', 'type', 'read', 'related_url'
        ]
        
        for field in fields_to_update:
            if field in data:
                setattr(notification, field, data[field])
        
        notification.save()
        
        # Retornar datos actualizados
        return JsonResponse({
            'message': 'Notificación actualizada correctamente',
            'id': str(notification.id)
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["DELETE"])
def notifications_delete(request, notifications_id):
    """Eliminar notificación."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Obtener notificación
        try:
            notification = Notification.objects.get(id=notifications_id, user=current_user)
        except Notification.DoesNotExist:
            return JsonResponse({'error': 'Notificación no encontrada'}, status=404)
        
        notification.delete()
        
        return JsonResponse({
            'message': 'Notificación eliminada correctamente'
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def notifications_mark_read(request, notifications_id):
    """Marcar notificación como leída."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Obtener notificación
        try:
            notification = Notification.objects.get(id=notifications_id, user=current_user)
        except Notification.DoesNotExist:
            return JsonResponse({'error': 'Notificación no encontrada'}, status=404)
        
        # Marcar como leída
        notification.read = True
        notification.save()
        
        return JsonResponse({
            'message': 'Notificación marcada como leída',
            'id': str(notification.id)
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def notifications_mark_all_read(request):
    """Marcar todas las notificaciones como leídas."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Marcar todas las notificaciones como leídas
        count = Notification.objects.filter(user=current_user, read=False).update(read=True)
        
        return JsonResponse({
            'message': f'{count} notificaciones marcadas como leídas'
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
