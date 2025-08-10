from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils import timezone
from django.db.models import Count, Q
from core.views import verify_token
from .models import MassNotification, EventRegistration
from .serializers import (
    EventRegistrationSerializer,
    MassNotificationEventSerializer,
    EventAttendanceSerializer,
    EventStatisticsSerializer
)
import json


@csrf_exempt
@require_http_methods(["POST"])
def register_event_attendance(request):
    """Registrar confirmación de asistencia a un evento"""
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
        serializer = EventAttendanceSerializer(data=data)
        
        if not serializer.is_valid():
            return JsonResponse({'error': 'Datos inválidos', 'details': serializer.errors}, status=400)
        
        event_id = data.get('event_id')
        event = get_object_or_404(MassNotification, pk=event_id, notification_type='event')
        
        # Verificar si el usuario ya tiene un registro
        registration, created = EventRegistration.objects.get_or_create(
            event=event,
            user=current_user,
            defaults={
                'status': serializer.validated_data['status'],
                'notes': serializer.validated_data.get('notes', '')
            }
        )
        
        if not created:
            # Actualizar registro existente
            registration.status = serializer.validated_data['status']
            if serializer.validated_data.get('notes'):
                registration.notes = serializer.validated_data['notes']
            registration.save()
        
        # Serializar respuesta
        response_serializer = EventRegistrationSerializer(registration)
        
        return JsonResponse({
            'success': True,
            'message': 'Asistencia registrada exitosamente',
            'data': response_serializer.data
        })
        
    except MassNotification.DoesNotExist:
        return JsonResponse({'error': 'Evento no encontrado'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def get_event_details(request, event_id):
    """Obtener detalles completos de un evento"""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        event = get_object_or_404(MassNotification, pk=event_id, notification_type='event')
        
        # Obtener registro del usuario si existe
        user_registration = None
        if current_user.role in ['student', 'company']:
            try:
                user_registration = EventRegistration.objects.get(event=event, user=current_user)
            except EventRegistration.DoesNotExist:
                pass
        
        # Serializar evento
        event_serializer = MassNotificationEventSerializer(event)
        event_data = event_serializer.data
        
        # Agregar información del usuario
        if user_registration:
            event_data['user_registration'] = EventRegistrationSerializer(user_registration).data
        else:
            event_data['user_registration'] = None
        
        return JsonResponse({
            'success': True,
            'data': event_data
        })
        
    except MassNotification.DoesNotExist:
        return JsonResponse({'error': 'Evento no encontrado'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def get_event_attendance_stats(request, event_id):
    """Obtener estadísticas de asistencia de un evento (solo admin)"""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Solo admins pueden ver estadísticas
        if current_user.role != 'admin':
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        event = get_object_or_404(MassNotification, pk=event_id, notification_type='event')
        
        # Obtener estadísticas
        stats = EventRegistration.objects.filter(event=event).aggregate(
            total=Count('id'),
            confirmed=Count('id', filter=Q(status='confirmed')),
            maybe=Count('id', filter=Q(status='maybe')),
            declined=Count('id', filter=Q(status='declined')),
            pending=Count('id', filter=Q(status='pending'))
        )
        
        # Calcular tasa de asistencia
        total = stats['total']
        confirmed = stats['confirmed']
        maybe = stats['maybe']
        
        attendance_rate = 0
        if total > 0:
            attendance_rate = ((confirmed + maybe) / total) * 100
        
        # Obtener lista de registros
        registrations = EventRegistration.objects.filter(event=event).select_related('user')
        registrations_data = EventRegistrationSerializer(registrations, many=True).data
        
        return JsonResponse({
            'success': True,
            'data': {
                'event_id': event.id,
                'event_title': event.title,
                'total_registrations': total,
                'confirmed_count': confirmed,
                'maybe_count': maybe,
                'declined_count': stats['declined'],
                'pending_count': stats['pending'],
                'attendance_rate': round(attendance_rate, 2),
                'registrations': registrations_data
            }
        })
        
    except MassNotification.DoesNotExist:
        return JsonResponse({'error': 'Evento no encontrado'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def get_all_events_stats(request):
    """Obtener estadísticas de todos los eventos (solo admin)"""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Solo admins pueden ver estadísticas
        if current_user.role != 'admin':
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        # Obtener todos los eventos
        events = MassNotification.objects.filter(notification_type='event').order_by('-created_at')
        events_stats = []
        
        for event in events:
            stats = EventRegistration.objects.filter(event=event).aggregate(
                total=Count('id'),
                confirmed=Count('id', filter=Q(status='confirmed')),
                maybe=Count('id', filter=Q(status='maybe')),
                declined=Count('id', filter=Q(status='declined')),
                pending=Count('id', filter=Q(status='pending'))
            )
            
            total = stats['total']
            confirmed = stats['confirmed']
            maybe = stats['maybe']
            
            attendance_rate = 0
            if total > 0:
                attendance_rate = ((confirmed + maybe) / total) * 100
            
            events_stats.append({
                'event_id': event.id,
                'event_title': event.title,
                'event_date': event.event_date.isoformat() if event.event_date else None,
                'event_location': event.event_location,
                'event_type': event.event_type,
                'total_registrations': total,
                'confirmed_count': confirmed,
                'maybe_count': maybe,
                'declined_count': stats['declined'],
                'pending_count': stats['pending'],
                'attendance_rate': round(attendance_rate, 2),
                'created_at': event.created_at.isoformat()
            })
        
        return JsonResponse({
            'success': True,
            'data': events_stats
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
