from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.paginator import Paginator
from django.utils import timezone
from core.views import verify_token
import json
from .models import MassNotification, NotificationTemplate


@csrf_exempt
@require_http_methods(["GET"])
def notification_list(request):
    """Lista todas las notificaciones masivas"""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Solo admins pueden ver notificaciones masivas
        if current_user.role != 'admin':
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        notifications = MassNotification.objects.all().order_by('-created_at')
        
        # Filtros
        status_filter = request.GET.get('status')
        type_filter = request.GET.get('type')
        
        if status_filter == 'sent':
            notifications = notifications.filter(is_sent=True)
        elif status_filter == 'pending':
            notifications = notifications.filter(is_sent=False)
        
        if type_filter:
            notifications = notifications.filter(notification_type=type_filter)
        
        # Paginación
        page = int(request.GET.get('page', 1))
        limit = int(request.GET.get('limit', 20))
        offset = (page - 1) * limit
        
        total_count = notifications.count()
        notifications_page = notifications[offset:offset + limit]
        
        notifications_data = []
        for notification in notifications_page:
            # Mapear notification_type del backend al frontend
            type_mapping = {
                'email': 'announcement',
                'sms': 'alert',
                'push': 'update',
                'in_app': 'announcement'
            }
            
            # Mapear target_audience del backend al frontend
            target_all_students = notification.target_audience in ['students', 'all']
            target_all_companies = notification.target_audience in ['companies', 'all']
            
            notifications_data.append({
                'id': notification.id,
                'title': notification.title,
                'message': notification.message,
                'notification_type': type_mapping.get(notification.notification_type, 'announcement'),
                'priority': 'normal',  # Valor por defecto
                'status': 'sent' if notification.is_sent else 'draft',
                'target_all_students': target_all_students,
                'target_all_companies': target_all_companies,
                'target_students': [],
                'target_companies': [],
                'scheduled_at': notification.scheduled_at.isoformat() if notification.scheduled_at else None,
                'sent_at': notification.sent_at.isoformat() if notification.sent_at else None,
                'created_at': notification.created_at.isoformat(),
                'created_by_name': notification.sent_by.first_name if notification.sent_by else 'Admin',
                'total_recipients': 0,  # Valor por defecto
                'sent_count': 1 if notification.is_sent else 0,
                'failed_count': 0,
                'read_count': 0,
            })
        
        return JsonResponse({
            'success': True,
            'results': notifications_data,
            'count': total_count,
            'page': page,
            'limit': limit,
            'total_pages': (total_count + limit - 1) // limit
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def notification_create(request):
    """Crear nueva notificación masiva"""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Solo admins pueden crear notificaciones masivas
        if current_user.role != 'admin':
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        data = json.loads(request.body)
        
        # Mapear notification_type del frontend al backend
        type_mapping = {
            'announcement': 'in_app',
            'reminder': 'in_app',
            'alert': 'push',
            'update': 'push',
            'event': 'in_app',
            'deadline': 'in_app'
        }
        
        # Mapear target_audience del frontend al backend
        target_audience = 'all'
        if data.get('target_all_students') and not data.get('target_all_companies'):
            target_audience = 'students'
        elif data.get('target_all_companies') and not data.get('target_all_students'):
            target_audience = 'companies'
        elif data.get('target_all_students') and data.get('target_all_companies'):
            target_audience = 'all'
        
        notification = MassNotification.objects.create(
            title=data['title'],
            message=data['message'],
            notification_type=type_mapping.get(data.get('notification_type', 'announcement'), 'in_app'),
            target_audience=target_audience,
            sent_by=current_user,
            scheduled_at=data.get('scheduled_at'),
        )
        
        return JsonResponse({
            'success': True,
            'message': 'Notificación creada exitosamente',
            'notification_id': notification.id
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def notification_detail(request, pk):
    """Detalle de una notificación masiva"""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Solo admins pueden ver detalles
        if current_user.role != 'admin':
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        notification = get_object_or_404(MassNotification, pk=pk)
        
        notification_data = {
            'id': notification.id,
            'title': notification.title,
            'message': notification.message,
            'notification_type': notification.notification_type,
            'target_audience': notification.target_audience,
            'is_sent': notification.is_sent,
            'scheduled_at': notification.scheduled_at.isoformat() if notification.scheduled_at else None,
            'sent_at': notification.sent_at.isoformat() if notification.sent_at else None,
            'created_at': notification.created_at.isoformat(),
            'sent_by': str(notification.sent_by.id) if notification.sent_by else None,
        }
        
        return JsonResponse({
            'success': True,
            'data': notification_data
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def notification_send(request, pk):
    """Enviar notificación masiva"""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Solo admins pueden enviar notificaciones
        if current_user.role != 'admin':
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        notification = get_object_or_404(MassNotification, pk=pk)
        
        # Aquí iría la lógica para enviar la notificación
        notification.is_sent = True
        notification.sent_at = timezone.now()
        notification.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Notificación enviada exitosamente'
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def template_list(request):
    """Lista todas las plantillas de notificaciones"""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Solo admins pueden ver plantillas
        if current_user.role != 'admin':
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        templates = NotificationTemplate.objects.all().order_by('-created_at')
        
        templates_data = []
        for template in templates:
            templates_data.append({
                'id': template.id,
                'name': template.name,
                'subject': template.subject,
                'content': template.content,
                'template_type': template.template_type,
                'created_at': template.created_at.isoformat(),
            })
        
        return JsonResponse({
            'success': True,
            'results': templates_data,
            'count': len(templates_data)
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def template_create(request):
    """Crear nueva plantilla de notificación"""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Solo admins pueden crear plantillas
        if current_user.role != 'admin':
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        data = json.loads(request.body)
        
        template = NotificationTemplate.objects.create(
            name=data['name'],
            subject=data['subject'],
            content=data['content'],
            template_type=data.get('template_type', 'email'),
        )
        
        return JsonResponse({
            'success': True,
            'message': 'Plantilla creada exitosamente',
            'template_id': template.id
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500) 