"""
Views para la app notifications.
"""

import json
import uuid
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.exceptions import ValidationError
from django.db.models import Q
from django.utils import timezone
from .models import Notification, NotificationTemplate, NotificationPreference
from .serializers import NotificationSerializer, NotificationTemplateSerializer, NotificationPreferenceSerializer
from users.models import User
from core.auth_utils import get_user_from_token, require_auth, require_admin

# --- NOTIFICACIONES ---

@csrf_exempt
@require_http_methods(["GET"])
@require_auth
def notifications_list(request):
    """Lista notificaciones del usuario con filtros y paginación"""
    try:
        user = get_user_from_token(request)
        
        # Filtros
        type_filter = request.GET.get('type')
        read = request.GET.get('read')
        priority = request.GET.get('priority')
        search = request.GET.get('search')
        page = int(request.GET.get('page', 1))
        limit = min(int(request.GET.get('limit', 20)), 100)
        
        # Construir query base
        queryset = Notification.objects.filter(user=user)
        
        # Aplicar filtros
        if type_filter:
            queryset = queryset.filter(type=type_filter)
        if read is not None:
            queryset = queryset.filter(read=(read.lower() == 'true'))
        if priority:
            queryset = queryset.filter(priority=priority)
        if search:
            queryset = queryset.filter(Q(title__icontains=search) | Q(message__icontains=search))
        
        # Paginación
        total = queryset.count()
        offset = (page - 1) * limit
        queryset = queryset.order_by('-created_at')[offset:offset + limit]
        
        # Serializar resultados
        data = [NotificationSerializer.to_dict(notification) for notification in queryset]
        
        return JsonResponse({
            'success': True,
            'data': data,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total,
                'pages': (total + limit - 1) // limit
            }
        })
        
    except Exception as e:
        return JsonResponse({'error': f'Error al listar notificaciones: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
@require_auth
def notifications_detail(request, notification_id):
    """Obtiene los detalles de una notificación específica"""
    try:
        user = get_user_from_token(request)
        
        # Validar UUID
        try:
            notification_uuid = uuid.UUID(notification_id)
        except ValueError:
            return JsonResponse({'error': 'ID de notificación inválido'}, status=400)
        
        # Buscar notificación
        try:
            notification = Notification.objects.get(id=notification_uuid, user=user)
        except Notification.DoesNotExist:
            return JsonResponse({'error': 'Notificación no encontrada'}, status=404)
        
        return JsonResponse({
            'success': True,
            'data': NotificationSerializer.to_dict(notification)
        })
        
    except Exception as e:
        return JsonResponse({'error': f'Error al obtener notificación: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
@require_auth
def notifications_create(request):
    """Crea una nueva notificación"""
    try:
        user = get_user_from_token(request)
        
        # Parsear datos
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Datos JSON inválidos'}, status=400)
        
        # Validar datos
        errors = NotificationSerializer.validate_data(data)
        if errors:
            return JsonResponse({'error': 'Datos inválidos', 'details': errors}, status=400)
        
        # Crear notificación
        notification = NotificationSerializer.create(data, user)
        
        return JsonResponse({
            'success': True,
            'message': 'Notificación creada exitosamente',
            'data': NotificationSerializer.to_dict(notification)
        }, status=201)
        
    except Exception as e:
        return JsonResponse({'error': f'Error al crear notificación: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["PUT"])
@require_auth
def notifications_update(request, notification_id):
    """Actualiza una notificación existente"""
    try:
        user = get_user_from_token(request)
        
        # Validar UUID
        try:
            notification_uuid = uuid.UUID(notification_id)
        except ValueError:
            return JsonResponse({'error': 'ID de notificación inválido'}, status=400)
        
        # Buscar notificación
        try:
            notification = Notification.objects.get(id=notification_uuid, user=user)
        except Notification.DoesNotExist:
            return JsonResponse({'error': 'Notificación no encontrada'}, status=404)
        
        # Parsear datos
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Datos JSON inválidos'}, status=400)
        
        # Validar datos
        errors = NotificationSerializer.validate_data(data)
        if errors:
            return JsonResponse({'error': 'Datos inválidos', 'details': errors}, status=400)
        
        # Actualizar notificación
        notification = NotificationSerializer.update(notification, data)
        
        return JsonResponse({
            'success': True,
            'message': 'Notificación actualizada exitosamente',
            'data': NotificationSerializer.to_dict(notification)
        })
        
    except Exception as e:
        return JsonResponse({'error': f'Error al actualizar notificación: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["DELETE"])
@require_auth
def notifications_delete(request, notification_id):
    """Elimina una notificación"""
    try:
        user = get_user_from_token(request)
        
        # Validar UUID
        try:
            notification_uuid = uuid.UUID(notification_id)
        except ValueError:
            return JsonResponse({'error': 'ID de notificación inválido'}, status=400)
        
        # Buscar notificación
        try:
            notification = Notification.objects.get(id=notification_uuid, user=user)
        except Notification.DoesNotExist:
            return JsonResponse({'error': 'Notificación no encontrada'}, status=404)
        
        # Eliminar notificación
        notification.delete()
        
        return JsonResponse({
            'success': True,
            'message': 'Notificación eliminada exitosamente'
        })
        
    except Exception as e:
        return JsonResponse({'error': f'Error al eliminar notificación: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
@require_auth
def mark_notifications_read(request):
    """Marca notificaciones como leídas"""
    try:
        user = get_user_from_token(request)
        
        # Parsear datos
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Datos JSON inválidos'}, status=400)
        
        notification_ids = data.get('notification_ids', [])
        if not notification_ids:
            return JsonResponse({'error': 'Debe proporcionar al menos una notificación'}, status=400)
        
        updated = 0
        for notif_id in notification_ids:
            try:
                notification = Notification.objects.get(id=notif_id, user=user)
                notification.read = True
                notification.read_at = timezone.now()
                notification.save()
                updated += 1
            except Notification.DoesNotExist:
                continue
        
        return JsonResponse({
            'success': True,
            'message': f'{updated} notificaciones marcadas como leídas',
            'updated': updated
        })
        
    except Exception as e:
        return JsonResponse({'error': f'Error al marcar notificaciones: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
@require_auth
def bulk_notification_action(request):
    """Acciones masivas en notificaciones"""
    try:
        user = get_user_from_token(request)
        
        # Parsear datos
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Datos JSON inválidos'}, status=400)
        
        action = data.get('action')
        notification_ids = data.get('notification_ids', [])
        
        if not notification_ids:
            return JsonResponse({'error': 'Debe proporcionar al menos una notificación'}, status=400)
        
        valid_actions = ['mark_read', 'mark_unread', 'delete']
        if action not in valid_actions:
            return JsonResponse({'error': 'Acción no válida'}, status=400)
        
        updated = 0
        deleted = 0
        
        for notif_id in notification_ids:
            try:
                notification = Notification.objects.get(id=notif_id, user=user)
                
                if action == 'mark_read':
                    notification.read = True
                    notification.read_at = timezone.now()
                    notification.save()
                    updated += 1
                elif action == 'mark_unread':
                    notification.read = False
                    notification.read_at = None
                    notification.save()
                    updated += 1
                elif action == 'delete':
                    notification.delete()
                    deleted += 1
                    
            except Notification.DoesNotExist:
                continue
        
        return JsonResponse({
            'success': True,
            'message': f'Acción completada: {updated} actualizadas, {deleted} eliminadas',
            'updated': updated,
            'deleted': deleted
        })
        
    except Exception as e:
        return JsonResponse({'error': f'Error en acción masiva: {str(e)}'}, status=500)

# --- PLANTILLAS DE NOTIFICACIÓN ---

@csrf_exempt
@require_http_methods(["GET"])
@require_auth
def notification_templates_list(request):
    """Lista plantillas de notificación"""
    try:
        user = get_user_from_token(request)
        
        # Filtros
        notification_type = request.GET.get('notification_type')
        is_active = request.GET.get('is_active')
        priority = request.GET.get('priority')
        search = request.GET.get('search')
        page = int(request.GET.get('page', 1))
        limit = min(int(request.GET.get('limit', 20)), 100)
        
        # Construir query
        queryset = NotificationTemplate.objects.all()
        
        # Filtrar por rol
        if user.role != 'admin':
            queryset = queryset.filter(is_active=True)
        
        # Aplicar filtros
        if notification_type:
            queryset = queryset.filter(notification_type=notification_type)
        if is_active is not None:
            queryset = queryset.filter(is_active=(is_active.lower() == 'true'))
        if priority:
            queryset = queryset.filter(priority=priority)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(title_template__icontains=search) | 
                Q(message_template__icontains=search)
            )
        
        # Paginación
        total = queryset.count()
        offset = (page - 1) * limit
        queryset = queryset.order_by('name')[offset:offset + limit]
        
        # Serializar resultados
        data = [NotificationTemplateSerializer.to_dict(template) for template in queryset]
        
        return JsonResponse({
            'success': True,
            'data': data,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total,
                'pages': (total + limit - 1) // limit
            }
        })
        
    except Exception as e:
        return JsonResponse({'error': f'Error al listar plantillas: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
@require_admin
def notification_templates_create(request):
    """Crea una nueva plantilla de notificación"""
    try:
        # Parsear datos
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Datos JSON inválidos'}, status=400)
        
        # Validar datos
        errors = NotificationTemplateSerializer.validate_data(data)
        if errors:
            return JsonResponse({'error': 'Datos inválidos', 'details': errors}, status=400)
        
        # Crear plantilla
        template = NotificationTemplateSerializer.create(data)
        
        return JsonResponse({
            'success': True,
            'message': 'Plantilla creada exitosamente',
            'data': NotificationTemplateSerializer.to_dict(template)
        }, status=201)
        
    except Exception as e:
        return JsonResponse({'error': f'Error al crear plantilla: {str(e)}'}, status=500)

# --- PREFERENCIAS DE NOTIFICACIÓN ---

@csrf_exempt
@require_http_methods(["GET"])
@require_auth
def notification_preferences_list(request):
    """Lista preferencias de notificación"""
    try:
        user = get_user_from_token(request)
        
        # Filtros
        page = int(request.GET.get('page', 1))
        limit = min(int(request.GET.get('limit', 20)), 100)
        
        # Construir query
        if user.role == 'admin':
            queryset = NotificationPreference.objects.all()
        else:
            queryset = NotificationPreference.objects.filter(user=user)
        
        # Paginación
        total = queryset.count()
        offset = (page - 1) * limit
        queryset = queryset.order_by('-created_at')[offset:offset + limit]
        
        # Serializar resultados
        data = [NotificationPreferenceSerializer.to_dict(preference) for preference in queryset]
        
        return JsonResponse({
            'success': True,
            'data': data,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total,
                'pages': (total + limit - 1) // limit
            }
        })
        
    except Exception as e:
        return JsonResponse({'error': f'Error al listar preferencias: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
@require_auth
def notification_preferences_create(request):
    """Crea nuevas preferencias de notificación"""
    try:
        user = get_user_from_token(request)
        
        # Parsear datos
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Datos JSON inválidos'}, status=400)
        
        # Validar datos
        errors = NotificationPreferenceSerializer.validate_data(data)
        if errors:
            return JsonResponse({'error': 'Datos inválidos', 'details': errors}, status=400)
        
        # Crear preferencias
        preference = NotificationPreferenceSerializer.create(data, user)
        
        return JsonResponse({
            'success': True,
            'message': 'Preferencias creadas exitosamente',
            'data': NotificationPreferenceSerializer.to_dict(preference)
        }, status=201)
        
    except Exception as e:
        return JsonResponse({'error': f'Error al crear preferencias: {str(e)}'}, status=500)
