"""
Views para la app calendar_events.
"""

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .models import CalendarEvent
from core.views import verify_token
from django.core.paginator import Paginator
from django.utils import timezone
from datetime import datetime, timedelta
from django.db import models
from projects.models import Proyecto

@csrf_exempt
@require_http_methods(["GET", "POST"])
def calendar_events_list(request):
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Log de depuración: queryset completo antes del filtro
        all_events = CalendarEvent.objects.all()
        print('--- TODOS LOS EVENTOS EN BD ---')
        for e in all_events:
            print('Evento:', e.id, e.title, 'created_by:', e.created_by_id, 'project:', e.project_id)
        print('--- FIN TODOS LOS EVENTOS ---')

        # Filtro según rol (ya existente)
        if current_user.role == 'company':
            print('Empresa autenticada:', current_user.id)

        if request.method == 'POST':
            return calendar_events_create(request)
        
        # Filtros y paginación
        page = request.GET.get('page', 1)
        per_page = request.GET.get('per_page', 20)
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')
        event_type = request.GET.get('event_type')
        status = request.GET.get('status')
        project_id = request.GET.get('project_id')
        
        queryset = CalendarEvent.objects.select_related('created_by', 'user', 'project').prefetch_related('attendees').all()
        
        # Filtros según rol
        if current_user.role == 'student':
            queryset = queryset.filter(
                models.Q(created_by=current_user) | 
                models.Q(attendees=current_user) | 
                models.Q(is_public=True)
            ).distinct()
        elif current_user.role == 'company':
            queryset = queryset.filter(
                models.Q(project__company__user=current_user) | 
                models.Q(created_by=current_user) | 
                models.Q(attendees=current_user) | 
                models.Q(is_public=True)
            ).distinct()
        # Admin ve todo
        
        # Filtros adicionales
        if start_date:
            queryset = queryset.filter(start_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(end_date__lte=end_date)
        if event_type:
            queryset = queryset.filter(event_type=event_type)
        if status:
            queryset = queryset.filter(status=status)
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        
        paginator = Paginator(queryset, per_page)
        page_obj = paginator.get_page(page)
        
        events_data = []
        for event in page_obj:
            events_data.append({
                'id': str(event.id),
                'title': event.title,
                'description': event.description,
                'event_type': event.event_type,
                'start_date': event.start_date.isoformat(),
                'end_date': event.end_date.isoformat(),
                'all_day': bool(event.all_day),
                'location': event.location,
                'priority': event.priority,
                'status': event.status,
                'is_online': bool(event.is_online),
                'meeting_url': event.meeting_url,
                'is_public': bool(event.is_public),
                'color': event.color,
                'icon': event.icon,
                'created_by': str(event.created_by.id) if event.created_by else None,
                'attendees': [str(att.id) for att in event.attendees.all()],
                'project': str(event.project.id) if event.project else None,
                'created_at': event.created_at.isoformat(),
                'updated_at': event.updated_at.isoformat(),
                # Nuevos campos para reuniones/entrevistas
                'meeting_type': event.meeting_type,
                'meeting_link': event.meeting_link,
                'meeting_room': event.meeting_room,
                'representative_name': event.representative_name,
                'representative_position': event.representative_position,
            })
        
        print('Eventos encontrados tras filtro:', queryset.count())
        for e in queryset:
            print('Evento:', e.id, e.title, 'created_by:', e.created_by_id, 'project:', e.project_id)
        print('events_data a devolver:', events_data)
        return JsonResponse({
            'results': events_data,
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
def calendar_events_detail(request, calendar_events_id):
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        try:
            event = CalendarEvent.objects.select_related('created_by', 'user', 'project').prefetch_related('attendees').get(id=calendar_events_id)
        except CalendarEvent.DoesNotExist:
            return JsonResponse({'error': 'Evento no encontrado'}, status=404)
        
        # Verificar permisos
        if not event.is_public and event.created_by != current_user and current_user not in event.attendees.all():
            if current_user.role == 'company' and event.project and event.project.company.user != current_user:
                return JsonResponse({'error': 'Acceso denegado'}, status=403)
            elif current_user.role != 'admin':
                return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        event_data = {
            'id': str(event.id),
            'title': event.title,
            'description': event.description,
            'event_type': event.event_type,
            'start_date': event.start_date.isoformat(),
            'end_date': event.end_date.isoformat(),
            'all_day': event.all_day,
            'location': event.location,
            'priority': event.priority,
            'status': event.status,
            'is_online': event.is_online,
            'meeting_url': event.meeting_url,
            'is_public': event.is_public,
            'is_recurring': event.is_recurring,
            'recurrence_rule': event.get_recurrence_rule_dict(),
            'reminder_minutes': event.reminder_minutes,
            'color': event.color,
            'icon': event.icon,
            'created_by': {
                'id': str(event.created_by.id),
                'full_name': event.created_by.get_full_name(),
                'email': event.created_by.email
            } if event.created_by else None,
            'attendees': [{
                'id': str(attendee.id),
                'full_name': attendee.get_full_name(),
                'email': attendee.email
            } for attendee in event.attendees.all()],
            'project': {
                'id': str(event.project.id),
                'title': event.project.title
            } if event.project else None,
            'created_at': event.created_at.isoformat(),
            'updated_at': event.updated_at.isoformat(),
            # Nuevos campos para reuniones/entrevistas
            'meeting_type': event.meeting_type,
            'meeting_link': event.meeting_link,
            'meeting_room': event.meeting_room,
            'representative_name': event.representative_name,
            'representative_position': event.representative_position,
        }
        
        return JsonResponse(event_data)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def calendar_events_create(request):
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        data = json.loads(request.body)
        required_fields = ['title', 'start_date', 'end_date']
        for field in required_fields:
            if not data.get(field):
                return JsonResponse({'error': f'El campo {field} es requerido'}, status=400)
        
        # Validar fechas
        try:
            # Parsear las fechas ISO y manejar timezone
            start_date_str = data['start_date']
            end_date_str = data['end_date']
            
            # Si las fechas terminan en 'Z', reemplazar con '+00:00' para timezone UTC
            if start_date_str.endswith('Z'):
                start_date_str = start_date_str.replace('Z', '+00:00')
            if end_date_str.endswith('Z'):
                end_date_str = end_date_str.replace('Z', '+00:00')
            
            start_date = datetime.fromisoformat(start_date_str)
            end_date = datetime.fromisoformat(end_date_str)
        except ValueError:
            return JsonResponse({'error': 'Formato de fecha inválido'}, status=400)
        
        if start_date >= end_date:
            return JsonResponse({'error': 'La fecha de inicio debe ser anterior a la fecha de fin'}, status=400)
        
        # Validar que los eventos estén dentro del horario permitido (8:00 AM - 19:00 PM)
        # Convertir a zona horaria local para la validación
        from django.utils import timezone
        import pytz
        
        # Obtener la zona horaria del usuario (asumir Chile por defecto)
        user_timezone = pytz.timezone('America/Santiago')
        
        # Convertir las fechas a la zona horaria local
        # Si las fechas no tienen zona horaria, asumir que están en UTC
        if start_date.tzinfo is None:
            start_date = pytz.utc.localize(start_date)
        if end_date.tzinfo is None:
            end_date = pytz.utc.localize(end_date)
            
        start_date_local = start_date.astimezone(user_timezone)
        end_date_local = end_date.astimezone(user_timezone)
        
        start_hour = start_date_local.hour
        end_hour = end_date_local.hour
        
        print(f'Validando horario - UTC: {start_date.hour}:{start_date.minute}, Local: {start_hour}:{start_date_local.minute}')
        
        if start_hour < 8 or start_hour >= 19:
            return JsonResponse({'error': f'Los eventos solo pueden programarse entre las 8:00 AM y las 19:00 PM (7:00 PM). Hora seleccionada: {start_hour}:{start_date_local.minute:02d}'}, status=400)
        
        if end_hour > 19:
            return JsonResponse({'error': f'Los eventos no pueden extenderse más allá de las 19:00 PM (7:00 PM). Hora de fin: {end_hour}:{end_date_local.minute:02d}'}, status=400)
        
        # Crear evento
        project_instance = None
        if data.get('project'):
            try:
                project_instance = Proyecto.objects.get(id=data['project'])
            except Proyecto.DoesNotExist:
                pass

        event = CalendarEvent.objects.create(
            title=data['title'],
            description=data.get('description'),
            event_type=data.get('event_type', 'other'),
            start_date=start_date,
            end_date=end_date,
            all_day=data.get('all_day', False),
            location=data.get('location'),
            priority=data.get('priority', 'medium'),
            status=data.get('status', 'scheduled'),
            is_online=data.get('is_online', False),
            meeting_url=data.get('meeting_url'),
            is_public=data.get('is_public', False),
            is_recurring=data.get('is_recurring', False),
            color=data.get('color', '#1976d2'),
            icon=data.get('icon'),
            created_by=current_user,
            user=current_user,
            project=project_instance,
            # Nuevos campos para reuniones/entrevistas
            meeting_type=data.get('meeting_type'),
            meeting_link=data.get('meeting_link'),
            meeting_room=data.get('meeting_room'),
            representative_name=data.get('representative_name'),
            representative_position=data.get('representative_position')
        )
        
        # Establecer reglas de recurrencia si aplica
        if data.get('recurrence_rule'):
            event.set_recurrence_rule_dict(data['recurrence_rule'])
            event.save()
        
        # Agregar participantes si se especifican
        if data.get('attendees'):
            from users.models import User
            for attendee_id in data['attendees']:
                try:
                    attendee = User.objects.get(id=attendee_id)
                    event.attendees.add(attendee)
                except User.DoesNotExist:
                    pass
        
        # Agregar log para depuración de asistentes
        print("Attendees recibidos:", data.get('attendees'))

        event_data = {
            'id': str(event.id),
            'title': event.title,
            'description': event.description,
            'event_type': event.event_type,
            'start_date': event.start_date.isoformat(),
            'end_date': event.end_date.isoformat(),
            'all_day': event.all_day,
            'location': event.location,
            'priority': event.priority,
            'status': event.status,
            'is_online': event.is_online,
            'meeting_url': event.meeting_url,
            'is_public': event.is_public,
            'color': event.color,
            'icon': event.icon,
            'created_by': event.created_by.get_full_name(),
            'attendees': [attendee.get_full_name() for attendee in event.attendees.all()],
            'created_at': event.created_at.isoformat(),
            'updated_at': event.updated_at.isoformat(),
            # Nuevos campos para reuniones/entrevistas
            'meeting_type': event.meeting_type,
            'meeting_link': event.meeting_link,
            'meeting_room': event.meeting_room,
            'representative_name': event.representative_name,
            'representative_position': event.representative_position,
        }
        
        return JsonResponse(event_data, status=201)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["PUT"])
def calendar_events_update(request, calendar_events_id):
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        try:
            event = CalendarEvent.objects.get(id=calendar_events_id)
        except CalendarEvent.DoesNotExist:
            return JsonResponse({'error': 'Evento no encontrado'}, status=404)
        
        # Verificar permisos (solo el creador o admin puede actualizar)
        if event.created_by != current_user and current_user.role != 'admin':
            return JsonResponse({'error': 'Solo el creador del evento puede actualizarlo'}, status=403)
        
        data = json.loads(request.body)
        
        # Actualizar campos permitidos
        allowed_fields = ['title', 'description', 'event_type', 'start_date', 'end_date', 
                         'all_day', 'location', 'priority', 'status', 'is_online', 
                         'meeting_url', 'is_public', 'color', 'icon', 'recurrence_rule',
                         'meeting_type', 'meeting_link', 'meeting_room', 'representative_name', 'representative_position']
        
        for field in allowed_fields:
            if field in data:
                if field in ['start_date', 'end_date']:
                    try:
                        date_value = datetime.fromisoformat(data[field].replace('Z', '+00:00'))
                        setattr(event, field, date_value)
                    except ValueError:
                        return JsonResponse({'error': f'Formato de fecha inválido para {field}'}, status=400)
                elif field == 'recurrence_rule':
                    event.set_recurrence_rule_dict(data[field])
                else:
                    setattr(event, field, data[field])
        
        event.save()
        
        # Actualizar participantes si se especifican
        if 'attendees' in data:
            event.attendees.clear()
            from users.models import User
            for attendee_id in data['attendees']:
                try:
                    attendee = User.objects.get(id=attendee_id)
                    event.attendees.add(attendee)
                except User.DoesNotExist:
                    pass
        
        event_data = {
            'id': str(event.id),
            'title': event.title,
            'description': event.description,
            'event_type': event.event_type,
            'start_date': event.start_date.isoformat(),
            'end_date': event.end_date.isoformat(),
            'all_day': event.all_day,
            'location': event.location,
            'priority': event.priority,
            'status': event.status,
            'is_online': event.is_online,
            'meeting_url': event.meeting_url,
            'is_public': event.is_public,
            'color': event.color,
            'icon': event.icon,
            'created_by': event.created_by.get_full_name(),
            'attendees': [attendee.get_full_name() for attendee in event.attendees.all()],
            'created_at': event.created_at.isoformat(),
            'updated_at': event.updated_at.isoformat(),
            # Nuevos campos para reuniones/entrevistas
            'meeting_type': event.meeting_type,
            'meeting_link': event.meeting_link,
            'meeting_room': event.meeting_room,
            'representative_name': event.representative_name,
            'representative_position': event.representative_position,
        }
        
        return JsonResponse(event_data)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["DELETE"])
def calendar_events_delete(request, calendar_events_id):
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        try:
            event = CalendarEvent.objects.get(id=calendar_events_id)
        except CalendarEvent.DoesNotExist:
            return JsonResponse({'error': 'Evento no encontrado'}, status=404)
        
        # Verificar permisos (solo el creador o admin puede eliminar)
        if event.created_by != current_user and current_user.role != 'admin':
            return JsonResponse({'error': 'Solo el creador del evento puede eliminarlo'}, status=403)
        
        event.delete()
        return JsonResponse({'message': 'Evento eliminado exitosamente'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

"""
Views para la app calendar_events.
"""

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .models import CalendarEvent
from core.views import verify_token

@csrf_exempt
@require_http_methods(["GET"])
def calendar_event_list(request):
    """Lista de eventos del calendario."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        events = CalendarEvent.objects.all()
        events_data = []
        
        for event in events:
            events_data.append({
                'id': str(event.id),
                'title': event.title,
                'start_date': event.start_date.isoformat(),
                'end_date': event.end_date.isoformat(),
                'created_at': event.created_at.isoformat(),
                'updated_at': event.updated_at.isoformat(),
            })
        
        return JsonResponse({
            'success': True,
            'data': events_data
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def calendar_event_detail(request, event_id):
    """Detalle de un evento del calendario."""
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
            event = CalendarEvent.objects.get(id=event_id)
        except CalendarEvent.DoesNotExist:
            return JsonResponse({'error': 'Evento no encontrado'}, status=404)
        
        event_data = {
            'id': str(event.id),
            'title': event.title,
            'start_date': event.start_date.isoformat(),
            'end_date': event.end_date.isoformat(),
            'created_at': event.created_at.isoformat(),
            'updated_at': event.updated_at.isoformat(),
        }
        
        return JsonResponse(event_data)
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def student_events(request):
    """Endpoint específico para eventos de estudiantes"""
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Solo estudiantes pueden acceder a este endpoint
        if current_user.role != 'student':
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        # Obtener eventos del estudiante
        queryset = CalendarEvent.objects.select_related('created_by', 'user', 'project', 'project__company').prefetch_related('attendees').filter(
            models.Q(created_by=current_user) | 
            models.Q(attendees=current_user) | 
            models.Q(is_public=True)
        ).distinct()
        
        # Filtros adicionales
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')
        event_type = request.GET.get('event_type')
        status = request.GET.get('status')
        
        if start_date:
            queryset = queryset.filter(start_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(end_date__lte=end_date)
        if event_type:
            queryset = queryset.filter(event_type=event_type)
        if status:
            queryset = queryset.filter(status=status)
        
        events_data = []
        for event in queryset:
            events_data.append({
                'id': str(event.id),
                'title': event.title,
                'description': event.description,
                'event_type': event.event_type,
                'start_date': event.start_date.isoformat(),
                'end_date': event.end_date.isoformat(),
                'all_day': event.all_day,
                'location': event.location,
                'priority': event.priority,
                'status': event.status,
                'is_online': event.is_online,
                'meeting_url': event.meeting_url,
                'is_public': event.is_public,
                'color': event.color,
                'icon': event.icon,
                'created_by': event.created_by.get_full_name() if event.created_by else None,
                'attendees': [
                    {
                        'id': str(att.id),
                        'full_name': att.get_full_name(),
                        'email': att.email,
                        'phone': att.phone,
                        'role': att.role,
                        'career': att.career if att.role == 'student' else None,
                    } for att in event.attendees.all()
                ],
                'project': {
                    'id': str(event.project.id),
                    'title': event.project.title,
                    'empresa': {
                        'nombre': event.project.company.company_name if event.project and event.project.company else 'Sin empresa'
                    }
                } if event.project and hasattr(event.project, 'id') and event.project.id else None,
                'created_at': event.created_at.isoformat(),
                'updated_at': event.updated_at.isoformat(),
                # Nuevos campos para reuniones/entrevistas
                'meeting_type': event.meeting_type,
                'meeting_link': event.meeting_link,
                'meeting_room': event.meeting_room,
                'representative_name': event.representative_name,
                'representative_position': event.representative_position,
            })
        
        return JsonResponse({'results': events_data}, safe=False)
    except Exception as e:
        print(f'Error en student_events: {str(e)}')
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def company_events(request):
    """Endpoint específico para eventos de empresas"""
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)

        from django.db import models
        # Mostrar todos los eventos relevantes para la empresa:
        queryset = CalendarEvent.objects.select_related('created_by', 'user', 'project', 'project__company').prefetch_related('attendees').filter(
            models.Q(project__company__user=current_user) |
            models.Q(created_by=current_user) |
            models.Q(attendees=current_user) |
            models.Q(is_public=True)
        ).distinct()

        # Filtros adicionales
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')
        event_type = request.GET.get('event_type')
        status = request.GET.get('status')
        if start_date:
            queryset = queryset.filter(start_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(end_date__lte=end_date)
        if event_type:
            queryset = queryset.filter(event_type=event_type)
        if status:
            queryset = queryset.filter(status=status)

        events_data = []
        for event in queryset:
            events_data.append({
                'id': str(event.id),
                'title': event.title,
                'description': event.description,
                'event_type': event.event_type,
                'start_date': event.start_date.isoformat(),
                'end_date': event.end_date.isoformat(),
                'all_day': event.all_day,
                'location': event.location,
                'priority': event.priority,
                'status': event.status,
                'is_online': event.is_online,
                'meeting_url': event.meeting_url,
                'is_public': event.is_public,
                'color': event.color,
                'icon': event.icon,
                'created_by': str(event.created_by.id) if event.created_by else None,
                'attendees': [
                    {
                        'id': str(att.id),
                        'full_name': att.get_full_name(),
                        'email': att.email
                    } for att in event.attendees.all()
                ],
                'project': {
                    'id': str(event.project.id),
                    'title': event.project.title,
                    'empresa': {
                        'nombre': event.project.company.company_name if event.project and event.project.company else 'Sin empresa'
                    }
                } if event.project and hasattr(event.project, 'id') and event.project.id else None,
                'created_at': event.created_at.isoformat(),
                'updated_at': event.updated_at.isoformat(),
                # Nuevos campos para reuniones/entrevistas
                'meeting_type': event.meeting_type,
                'meeting_link': event.meeting_link,
                'meeting_room': event.meeting_room,
                'representative_name': event.representative_name,
                'representative_position': event.representative_position,
            })

        # Depuración: mostrar usuario autenticado y eventos encontrados
        print('Usuario autenticado:', current_user.id, current_user.role)
        print('Eventos encontrados:', queryset.count())
        for e in queryset:
            print('Evento:', e.id, e.title, 'project:', e.project_id)

        return JsonResponse({'results': events_data}, safe=False)
    except Exception as e:
        print(f'Error en company_events: {str(e)}')
        return JsonResponse({'error': str(e)}, status=500)
