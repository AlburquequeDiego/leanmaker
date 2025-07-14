"""
Views para la app notifications.
"""

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .models import Notification
from core.views import verify_token

@csrf_exempt
@require_http_methods(["GET"])
def notification_list(request):
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
        
        notifications = Notification.objects.all()
        notifications_data = []
        
        for notification in notifications:
            notifications_data.append({
                'id': str(notification.id),
                'title': notification.title,
                'message': notification.message,
                'is_read': notification.read,
                'created_at': notification.created_at.isoformat(),
                'updated_at': notification.updated_at.isoformat(),
            })
        
        return JsonResponse({
            'success': True,
            'data': notifications_data
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def notification_detail(request, notification_id):
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
        
        try:
            notification = Notification.objects.get(id=notification_id)
        except Notification.DoesNotExist:
            return JsonResponse({'error': 'Notificación no encontrada'}, status=404)
        
        notification_data = {
            'id': str(notification.id),
            'title': notification.title,
            'message': notification.message,
            'is_read': notification.read,
            'created_at': notification.created_at.isoformat(),
            'updated_at': notification.updated_at.isoformat(),
        }
        
        return JsonResponse(notification_data)
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
