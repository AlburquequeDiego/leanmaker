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
            notifications_data.append({
                'id': str(notification.id),
                'title': notification.title,
                'message': notification.message,
                'type': notification.type,
                'priority': notification.priority,
                'read': notification.read,
                'related_url': notification.related_url,
                'created_at': notification.created_at.isoformat(),
                'updated_at': notification.updated_at.isoformat(),
            })
        
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
        
        # Marcar como leída
        notification.marcar_como_leida()
        
        return JsonResponse({
            'success': True,
            'message': 'Notificación marcada como leída'
        })
        
    except Exception as e:
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
            return JsonResponse({'error': 'Solo las empresas pueden enviar mensajes'}, status=403)
        
        # Parsear datos
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Datos JSON inválidos'}, status=400)
        
        # Validar datos requeridos
        student_id = data.get('student_id')
        message = data.get('message', '').strip()
        
        if not student_id:
            return JsonResponse({'error': 'El ID del estudiante es requerido'}, status=400)
        if not message:
            return JsonResponse({'error': 'El mensaje es requerido'}, status=400)
        
        # Obtener el estudiante
        from students.models import Estudiante
        try:
            student = Estudiante.objects.select_related('user').get(id=student_id)
        except Estudiante.DoesNotExist:
            return JsonResponse({'error': 'Estudiante no encontrado'}, status=404)
        
        # Obtener datos de la empresa
        from companies.models import Empresa
        try:
            company = Empresa.objects.get(user=current_user)
            company_name = company.company_name
        except Empresa.DoesNotExist:
            company_name = current_user.email
        
        # Crear notificación para el estudiante
        notification = Notification.objects.create(
            user=student.user,
            title=f'Nueva comunicación de empresa',
            message=f'La empresa {company_name} se quiere comunicar contigo a través de tu correo institucional. Revisa tu correo para más detalles.',
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
        return JsonResponse({'error': f'Error al enviar mensaje: {str(e)}'}, status=500)

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
