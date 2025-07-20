"""
Views para la app mass_notifications.
"""

import json
import uuid
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.exceptions import ValidationError
from django.db.models import Q, Count, Sum
from django.utils import timezone
from django.db import transaction
from .models import MassNotification, NotificationTemplate
from .serializers import MassNotificationSerializer, NotificationTemplateSerializer
from users.models import User
from students.models import Estudiante
from companies.models import Empresa
from notifications.models import Notification
from core.auth_utils import get_user_from_token, require_auth, require_admin

# --- NOTIFICACIONES MASIVAS ---

@csrf_exempt
@require_http_methods(["GET"])
@require_admin
def mass_notifications_list(request):
    """Lista notificaciones masivas con filtros y paginación"""
    try:
        user = get_user_from_token(request)
        
        # Filtros
        status_filter = request.GET.get('status')
        notification_type = request.GET.get('notification_type')
        priority = request.GET.get('priority')
        search = request.GET.get('search')
        page = int(request.GET.get('page', 1))
        limit = min(int(request.GET.get('limit', 20)), 100)
        
        # Construir query base
        queryset = MassNotification.objects.select_related('created_by')
        
        # Aplicar filtros
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if notification_type:
            queryset = queryset.filter(notification_type=notification_type)
        if priority:
            queryset = queryset.filter(priority=priority)
        if search:
            queryset = queryset.filter(Q(title__icontains=search) | Q(message__icontains=search))
        
        # Paginación
        total = queryset.count()
        offset = (page - 1) * limit
        queryset = queryset.order_by('-created_at')[offset:offset + limit]
        
        # Serializar resultados
        data = [MassNotificationSerializer.to_dict(notification) for notification in queryset]
        
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
        return JsonResponse({'error': f'Error al listar notificaciones masivas: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
@require_admin
def mass_notifications_detail(request, notification_id):
    """Obtiene los detalles de una notificación masiva específica"""
    try:
        user = get_user_from_token(request)
        
        # Validar ID (AutoField, no UUID)
        try:
            notification_id_int = int(notification_id)
        except ValueError:
            return JsonResponse({'error': 'ID de notificación inválido'}, status=400)
        
        # Buscar notificación
        try:
            notification = MassNotification.objects.select_related('created_by').get(id=notification_id_int)
        except MassNotification.DoesNotExist:
            return JsonResponse({'error': 'Notificación no encontrada'}, status=404)
        
        return JsonResponse({
            'success': True,
            'data': MassNotificationSerializer.to_dict(notification)
        })
        
    except Exception as e:
        return JsonResponse({'error': f'Error al obtener notificación: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
@require_admin
def mass_notifications_create(request):
    """Crea una nueva notificación masiva"""
    try:
        user = get_user_from_token(request)
        
        # Parsear datos
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Datos JSON inválidos'}, status=400)
        
        # Validar datos
        errors = MassNotificationSerializer.validate_data(data)
        if errors:
            return JsonResponse({'error': 'Datos inválidos', 'details': errors}, status=400)
        
        # Crear notificación
        notification = MassNotificationSerializer.create(data, user)
        
        return JsonResponse({
            'success': True,
            'message': 'Notificación masiva creada exitosamente',
            'data': MassNotificationSerializer.to_dict(notification)
        }, status=201)
        
    except Exception as e:
        return JsonResponse({'error': f'Error al crear notificación: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["PUT"])
@require_admin
def mass_notifications_update(request, notification_id):
    """Actualiza una notificación masiva existente"""
    try:
        user = get_user_from_token(request)
        
        # Validar ID (AutoField, no UUID)
        try:
            notification_id_int = int(notification_id)
        except ValueError:
            return JsonResponse({'error': 'ID de notificación inválido'}, status=400)
        
        # Buscar notificación
        try:
            notification = MassNotification.objects.get(id=notification_id_int)
        except MassNotification.DoesNotExist:
            return JsonResponse({'error': 'Notificación no encontrada'}, status=404)
        
        # Parsear datos
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Datos JSON inválidos'}, status=400)
        
        # Validar datos
        errors = MassNotificationSerializer.validate_data(data)
        if errors:
            return JsonResponse({'error': 'Datos inválidos', 'details': errors}, status=400)
        
        # Actualizar notificación
        notification = MassNotificationSerializer.update(notification, data)
        
        return JsonResponse({
            'success': True,
            'message': 'Notificación actualizada exitosamente',
            'data': MassNotificationSerializer.to_dict(notification)
        })
        
    except Exception as e:
        return JsonResponse({'error': f'Error al actualizar notificación: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["DELETE"])
@require_admin
def mass_notifications_delete(request, notification_id):
    """Elimina una notificación masiva"""
    try:
        user = get_user_from_token(request)
        
        # Validar ID (AutoField, no UUID)
        try:
            notification_id_int = int(notification_id)
        except ValueError:
            return JsonResponse({'error': 'ID de notificación inválido'}, status=400)
        
        # Buscar notificación
        try:
            notification = MassNotification.objects.get(id=notification_id_int)
        except MassNotification.DoesNotExist:
            return JsonResponse({'error': 'Notificación no encontrada'}, status=404)
        
        # Marcar como cancelada en lugar de eliminar
        notification.status = 'cancelled'
        notification.save(update_fields=['status'])
        
        return JsonResponse({
            'success': True,
            'message': 'Notificación cancelada exitosamente'
        })
        
    except Exception as e:
        return JsonResponse({'error': f'Error al eliminar notificación: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
@require_admin
def send_notification(request, notification_id):
    """Envía una notificación masiva creando notificaciones individuales"""
    try:
        user = get_user_from_token(request)
        
        # Validar ID (AutoField, no UUID)
        try:
            notification_id_int = int(notification_id)
        except ValueError:
            return JsonResponse({'error': 'ID de notificación inválido'}, status=400)
        
        # Buscar notificación
        try:
            notification = MassNotification.objects.get(id=notification_id_int)
        except MassNotification.DoesNotExist:
            return JsonResponse({'error': 'Notificación no encontrada'}, status=404)
        
        # Verificar que la notificación esté en estado válido
        if notification.status not in ['draft', 'scheduled']:
            return JsonResponse({
                'error': 'La notificación no puede ser enviada en su estado actual'
            }, status=400)
        
        # Marcar como enviando
        notification.status = 'sending'
        notification.save(update_fields=['status'])
        
        # Obtener destinatarios
        recipients = []
        
        # Estudiantes
        if notification.target_all_students:
            students = Estudiante.objects.all()
        else:
            students = notification.target_students.all()
        
        for student in students:
            if student.user:
                recipients.append(student.user)
        
        # Empresas
        if notification.target_all_companies:
            companies = Empresa.objects.all()
        else:
            companies = notification.target_companies.all()
        
        for company in companies:
            if company.user:
                recipients.append(company.user)
        
        # Crear notificaciones individuales
        with transaction.atomic():
            notifications_created = []
            for recipient in recipients:
                try:
                    individual_notification = Notification.objects.create(
                        user=recipient,
                        title=notification.title,
                        message=notification.message,
                        type=notification.notification_type,
                        priority=notification.priority,
                        related_url=f"/mass-notifications/{notification.id}/"
                    )
                    notifications_created.append(individual_notification)
                except Exception as e:
                    print(f"Error creando notificación para {recipient.email}: {e}")
                    notification.increment_failed_count()
            
            # Actualizar estadísticas
            notification.sent_count = len(notifications_created)
        notification.mark_as_sent()
        notification.save(update_fields=['sent_count'])
        
        return JsonResponse({
            'success': True,
            'message': f'Notificación enviada a {len(notifications_created)} destinatarios',
            'data': {
                'sent_count': len(notifications_created),
                'total_recipients': len(recipients),
                'failed_count': notification.failed_count
            }
        })
        
    except Exception as e:
        return JsonResponse({'error': f'Error al enviar notificación: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
@require_admin
def schedule_notification(request, notification_id):
    """Programa una notificación masiva"""
    try:
        user = get_user_from_token(request)
        
        # Validar ID (AutoField, no UUID)
        try:
            notification_id_int = int(notification_id)
        except ValueError:
            return JsonResponse({'error': 'ID de notificación inválido'}, status=400)
        
        # Buscar notificación
        try:
            notification = MassNotification.objects.get(id=notification_id_int)
        except MassNotification.DoesNotExist:
            return JsonResponse({'error': 'Notificación no encontrada'}, status=404)
        
        # Parsear datos
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Datos JSON inválidos'}, status=400)
        
        scheduled_at = data.get('scheduled_at')
        if not scheduled_at:
            return JsonResponse({'error': 'La fecha programada es requerida'}, status=400)
        
        # Validar fecha programada
        try:
            scheduled_datetime = timezone.datetime.fromisoformat(scheduled_at.replace('Z', '+00:00'))
            if scheduled_datetime <= timezone.now():
                return JsonResponse({'error': 'La fecha programada debe ser futura'}, status=400)
        except (ValueError, TypeError):
            return JsonResponse({'error': 'Formato de fecha inválido'}, status=400)
        
        # Programar notificación
        notification.scheduled_at = scheduled_datetime
        notification.status = 'scheduled'
        notification.save(update_fields=['scheduled_at', 'status'])
        
        return JsonResponse({
            'success': True,
            'message': 'Notificación programada exitosamente',
            'data': MassNotificationSerializer.to_dict(notification)
        })
        
    except Exception as e:
        return JsonResponse({'error': f'Error al programar notificación: {str(e)}'}, status=500)

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
        search = request.GET.get('search')
        page = int(request.GET.get('page', 1))
        limit = min(int(request.GET.get('limit', 20)), 100)
        
        # Construir query
        queryset = NotificationTemplate.objects.select_related('created_by')
        
        # Filtrar por rol
        if user.role != 'admin':
            queryset = queryset.filter(is_active=True)
        
        # Aplicar filtros
        if notification_type:
            queryset = queryset.filter(notification_type=notification_type)
        if is_active is not None:
            queryset = queryset.filter(is_active=(is_active.lower() == 'true'))
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
        user = get_user_from_token(request)
        
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
        template = NotificationTemplateSerializer.create(data, user)
        
        return JsonResponse({
            'success': True,
            'message': 'Plantilla creada exitosamente',
            'data': NotificationTemplateSerializer.to_dict(template)
        }, status=201)
        
    except Exception as e:
        return JsonResponse({'error': f'Error al crear plantilla: {str(e)}'}, status=500)
