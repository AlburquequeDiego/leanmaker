"""
Views para la app notifications.
"""

import json
import uuid
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.db.models import Q
from django.utils import timezone
from .models import Notification
from core.auth_utils import get_user_from_token, require_auth

@csrf_exempt
@require_http_methods(["GET"])
@require_auth
def notification_list(request):
    """Lista de notificaciones del usuario autenticado."""
    try:
        user = get_user_from_token(request)
        
        # Filtros
        notification_type = request.GET.get('type')
        read_status = request.GET.get('read')
        search = request.GET.get('search')
        page = int(request.GET.get('page', 1))
        limit = min(int(request.GET.get('limit', 20)), 100)
        
        # Construir query base - solo notificaciones del usuario
        queryset = Notification.objects.filter(user=user)
        
        # Aplicar filtros
        if notification_type:
            queryset = queryset.filter(type=notification_type)
        if read_status is not None:
            is_read = read_status.lower() == 'true'
            queryset = queryset.filter(read=is_read)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(message__icontains=search)
            )
        
        # Paginación
        total = queryset.count()
        offset = (page - 1) * limit
        queryset = queryset.order_by('-created_at')[offset:offset + limit]
        
        # Serializar resultados
        notifications_data = []
        for notification in queryset:
            notification_item = {
                'id': str(notification.id),
                'title': notification.title,
                'message': notification.message,
                'type': notification.type,
                'priority': notification.priority,
                'read': notification.read,
                'related_url': notification.related_url,
                'created_at': notification.created_at.isoformat(),
                'updated_at': notification.updated_at.isoformat(),
            }
            print(f"🔍 [notification_list] Notificación {notification.id}: read={notification.read}, is_read={notification.is_read}")
            notifications_data.append(notification_item)
        
        print(f"🔍 [notification_list] Total de notificaciones enviadas: {len(notifications_data)}")
        return JsonResponse({
            'success': True,
            'data': notifications_data,
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
def notification_detail(request, notification_id):
    """Detalle de una notificación específica."""
    try:
        user = get_user_from_token(request)
        
        # Validar UUID
        try:
            notification_uuid = uuid.UUID(notification_id)
        except ValueError:
            return JsonResponse({'error': 'ID de notificación inválido'}, status=400)
        
        # Buscar notificación del usuario
        try:
            notification = Notification.objects.get(id=notification_uuid, user=user)
        except Notification.DoesNotExist:
            return JsonResponse({'error': 'Notificación no encontrada'}, status=404)
        
        notification_data = {
            'id': str(notification.id),
            'title': notification.title,
            'message': notification.message,
            'type': notification.type,
            'priority': notification.priority,
            'read': notification.read,
            'related_url': notification.related_url,
            'created_at': notification.created_at.isoformat(),
            'updated_at': notification.updated_at.isoformat(),
        }
        
        return JsonResponse({
            'success': True,
            'data': notification_data
        })
        
    except Exception as e:
        return JsonResponse({'error': f'Error al obtener notificación: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
@require_auth
def mark_as_read(request, notification_id):
    """Marca una notificación como leída."""
    try:
        print(f"🔍 [mark_as_read] Iniciando para notificación ID: {notification_id}")
        user = get_user_from_token(request)
        print(f"🔍 [mark_as_read] Usuario autenticado: {user.email}")
        
        # Validar UUID
        try:
            notification_uuid = uuid.UUID(notification_id)
            print(f"🔍 [mark_as_read] UUID válido: {notification_uuid}")
        except ValueError:
            print(f"❌ [mark_as_read] UUID inválido: {notification_id}")
            return JsonResponse({'error': 'ID de notificación inválido'}, status=400)
        
        # Buscar notificación del usuario
        try:
            notification = Notification.objects.get(id=notification_uuid, user=user)
            print(f"🔍 [mark_as_read] Notificación encontrada: {notification.id}")
            print(f"🔍 [mark_as_read] Estado actual - read: {notification.read}, is_read: {notification.is_read}")
        except Notification.DoesNotExist:
            print(f"❌ [mark_as_read] Notificación no encontrada: {notification_uuid}")
            return JsonResponse({'error': 'Notificación no encontrada'}, status=404)
        
        # Marcar como leída
        print(f"🔍 [mark_as_read] Marcando como leída...")
        notification.marcar_como_leida()
        print(f"🔍 [mark_as_read] Después de marcar - read: {notification.read}, is_read: {notification.is_read}")
        
        # Verificar que se guardó correctamente
        notification.refresh_from_db()
        print(f"🔍 [mark_as_read] Después de refresh - read: {notification.read}, is_read: {notification.is_read}")
        
        return JsonResponse({
            'success': True,
            'message': 'Notificación marcada como leída'
        })
        
    except Exception as e:
        print(f"❌ [mark_as_read] Error: {str(e)}")
        return JsonResponse({'error': f'Error al marcar notificación: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
@require_auth
def mark_multiple_as_read(request):
    """Marca múltiples notificaciones como leídas."""
    try:
        user = get_user_from_token(request)
        
        # Parsear datos
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Datos JSON inválidos'}, status=400)
        
        notification_ids = data.get('notification_ids', [])
        if not notification_ids:
            return JsonResponse({'error': 'No se proporcionaron IDs de notificaciones'}, status=400)
        
        # Validar UUIDs
        valid_ids = []
        for notification_id in notification_ids:
            try:
                valid_ids.append(uuid.UUID(notification_id))
            except ValueError:
                continue
        
        # Marcar como leídas
        updated_count = Notification.objects.filter(
            id__in=valid_ids,
            user=user,
            read=False
        ).update(
            read=True,
            is_read=True,
            read_at=timezone.now()
        )
        
        return JsonResponse({
            'success': True,
            'message': f'{updated_count} notificaciones marcadas como leídas'
        })
        
    except Exception as e:
        return JsonResponse({'error': f'Error al marcar notificaciones: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
@require_auth
def unread_count(request):
    """Obtiene el conteo de notificaciones no leídas."""
    try:
        user = get_user_from_token(request)
        
        unread_count = Notification.objects.filter(user=user, read=False).count()
        
        return JsonResponse({
            'success': True,
            'data': {
                'unread_count': unread_count
            }
        })
        
    except Exception as e:
        return JsonResponse({'error': f'Error al obtener conteo: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
@require_auth
def create_notification(request):
    """Crea una nueva notificación (solo para el usuario autenticado)."""
    try:
        user = get_user_from_token(request)
        
        # Parsear datos
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Datos JSON inválidos'}, status=400)
        
        # Validar datos requeridos
        title = data.get('title', '').strip()
        message = data.get('message', '').strip()
        
        if not title:
            return JsonResponse({'error': 'El título es requerido'}, status=400)
        if not message:
            return JsonResponse({'error': 'El mensaje es requerido'}, status=400)
        
        # Crear notificación
        notification = Notification.objects.create(
            user=user,
            title=title,
            message=message,
            type=data.get('type', 'info'),
            related_url=data.get('related_url'),
        )
        
        return JsonResponse({
            'success': True,
            'message': 'Notificación creada exitosamente',
            'data': {
                'id': str(notification.id),
                'title': notification.title,
                'message': notification.message,
                'type': notification.type,
                'read': notification.read,
                'created_at': notification.created_at.isoformat(),
            }
        }, status=201)
        
    except Exception as e:
        return JsonResponse({'error': f'Error al crear notificación: {str(e)}'}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
@require_auth
def send_company_message(request):
    """Envía un mensaje de empresa a estudiante."""
    try:
        current_user = get_user_from_token(request)
        
        # Verificar que sea una empresa
        if current_user.role != 'company':
            return JsonResponse({'success': False, 'error': 'Solo las empresas pueden enviar mensajes'}, status=403)
        
        # Parsear datos
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'error': 'Datos JSON inválidos'}, status=400)
        
        # Validar datos requeridos
        user_id = data.get('student_id')  # Mantenemos el nombre del campo para compatibilidad
        message = data.get('message', '').strip()
        
        if not user_id:
            return JsonResponse({'success': False, 'error': 'El ID del usuario del estudiante es requerido'}, status=400)
        if not message:
            return JsonResponse({'success': False, 'error': 'El mensaje es requerido'}, status=400)
        
        # Obtener el usuario directamente (más eficiente)
        from users.models import User
        try:
            # Intentar obtener por ID numérico primero
            try:
                target_user = User.objects.get(id=int(user_id))
            except (ValueError, TypeError):
                # Si no es numérico, intentar por UUID
                target_user = User.objects.get(id=user_id)
            
            # Verificar que sea un estudiante
            if not hasattr(target_user, 'estudiante_profile'):
                return JsonResponse({'success': False, 'error': 'El usuario no es un estudiante'}, status=400)
        except User.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Usuario no encontrado'}, status=404)
        
        # Obtener datos de la empresa
        from companies.models import Empresa
        try:
            company = Empresa.objects.get(user=current_user)
            company_name = company.company_name
        except Empresa.DoesNotExist:
            company_name = current_user.email
        
        # Crear notificación para el estudiante
        notification = Notification.objects.create(
            user=target_user,
            title=f'Nueva comunicación de empresa',
            message=message,  # Usar el mensaje personalizado del frontend
            type='info',
            related_url='/dashboard/student/notifications',
        )
        
        return JsonResponse({
            'success': True,
            'message': 'Mensaje enviado exitosamente',
            'data': {
                'id': str(notification.id),
                'title': notification.title,
                'message': notification.message,
                'type': notification.type,
                'created_at': notification.created_at.isoformat(),
            }
        }, status=201)
        
    except Exception as e:
        return JsonResponse({'success': False, 'error': f'Error al enviar mensaje: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
@require_auth
def create_system_notification(request):
    """Crea una notificación del sistema para un usuario específico."""
    try:
        current_user = get_user_from_token(request)
        
        # Verificar que sea admin o empresa
        if current_user.role not in ['admin', 'company']:
            return JsonResponse({'error': 'No tienes permisos para crear notificaciones del sistema'}, status=403)
        
        # Parsear datos
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Datos JSON inválidos'}, status=400)
        
        # Validar datos requeridos
        user_id = data.get('user_id')
        title = data.get('title', '').strip()
        message = data.get('message', '').strip()
        notification_type = data.get('type', 'info')
        
        if not user_id:
            return JsonResponse({'error': 'El ID del usuario es requerido'}, status=400)
        if not title:
            return JsonResponse({'error': 'El título es requerido'}, status=400)
        if not message:
            return JsonResponse({'error': 'El mensaje es requerido'}, status=400)
        
        # Obtener el usuario
        from users.models import User
        try:
            target_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return JsonResponse({'error': 'Usuario no encontrado'}, status=404)
        
        # Crear notificación
        notification = Notification.objects.create(
            user=target_user,
            title=title,
            message=message,
            type=notification_type,
            related_url=data.get('related_url'),
        )
        
        return JsonResponse({
            'success': True,
            'message': 'Notificación del sistema creada exitosamente',
            'data': {
                'id': str(notification.id),
                'title': notification.title,
                'message': notification.message,
                'type': notification.type,
                'created_at': notification.created_at.isoformat(),
            }
        }, status=201)
        
    except Exception as e:
        return JsonResponse({'error': f'Error al crear notificación del sistema: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
@require_auth
def mark_all_as_read(request):
    """Marca todas las notificaciones del usuario como leídas."""
    try:
        user = get_user_from_token(request)
        
        # Marcar todas como leídas
        updated_count = Notification.objects.filter(
            user=user,
            read=False
        ).update(
            read=True,
            is_read=True,
            read_at=timezone.now()
        )
        
        return JsonResponse({
            'success': True,
            'message': f'{updated_count} notificaciones marcadas como leídas'
        })
        
    except Exception as e:
        return JsonResponse({'error': f'Error al marcar notificaciones: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
@require_auth
def notification_stats(request):
    """Obtiene estadísticas de notificaciones del usuario."""
    try:
        user = get_user_from_token(request)
        
        # Obtener estadísticas
        total_notifications = Notification.objects.filter(user=user).count()
        unread_notifications = Notification.objects.filter(user=user, read=False).count()
        read_notifications = Notification.objects.filter(user=user, read=True).count()
        
        # Notificaciones por tipo
        notifications_by_type = {}
        for notification_type in Notification.objects.filter(user=user).values_list('type', flat=True).distinct():
            count = Notification.objects.filter(user=user, type=notification_type).count()
            notifications_by_type[notification_type] = count
        
        return JsonResponse({
            'success': True,
            'data': {
                'total': total_notifications,
                'unread': unread_notifications,
                'read': read_notifications,
                'by_type': notifications_by_type
            }
        })
        
    except Exception as e:
        return JsonResponse({'error': f'Error al obtener estadísticas: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["DELETE"])
@require_auth
def delete_notification(request, notification_id):
    """Elimina una notificación."""
    try:
        user = get_user_from_token(request)
        
        # Validar UUID
        try:
            notification_uuid = uuid.UUID(notification_id)
        except ValueError:
            return JsonResponse({'error': 'ID de notificación inválido'}, status=400)
        
        # Buscar notificación del usuario
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
def test_endpoint(request):
    """Endpoint de prueba para verificar que POST funciona."""
    try:
        return JsonResponse({
            'success': True,
            'message': 'Endpoint de prueba funcionando correctamente',
            'method': request.method,
            'content_type': request.content_type,
        })
    except Exception as e:
        return JsonResponse({'error': f'Error en endpoint de prueba: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def test_endpoint_no_auth(request):
    """Endpoint de prueba sin autenticación para verificar que POST funciona."""
    try:
        return JsonResponse({
            'success': True,
            'message': 'Endpoint de prueba sin auth funcionando correctamente',
            'method': request.method,
            'content_type': request.content_type,
        })
    except Exception as e:
        return JsonResponse({'error': f'Error en endpoint de prueba: {str(e)}'}, status=500)
