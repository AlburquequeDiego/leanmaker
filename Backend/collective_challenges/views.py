"""
🎯 ENDPOINTS PARA DESAFÍOS COLECTIVOS

Este archivo contiene endpoints específicos para la gestión de desafíos colectivos
que las empresas pueden publicar para la academia.
"""

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.paginator import Paginator
from django.db.models import Q
import json
from datetime import datetime, date
from core.views import verify_token


@csrf_exempt
@require_http_methods(["GET"])
def api_challenges_list(request):
    """Endpoint para obtener lista de desafíos colectivos."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token de autenticación requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        user = verify_token(token)
        
        if not user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Obtener parámetros de consulta
        page = int(request.GET.get('page', 1))
        limit = int(request.GET.get('limit', 10))
        status_filter = request.GET.get('status', '')
        period_filter = request.GET.get('period', '')
        search = request.GET.get('search', '')
        
        # Construir consulta
        from collective_challenges.models import DesafioColectivo
        
        queryset = DesafioColectivo.objects.select_related('company', 'area').all()
        
        # Filtros
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        if period_filter:
            queryset = queryset.filter(period_type=period_filter)
        
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(company__company_name__icontains=search)
            )
        
        # Paginación
        paginator = Paginator(queryset, limit)
        page_obj = paginator.get_page(page)
        
        # Serializar datos
        challenges_data = []
        for challenge in page_obj:
            challenge_data = {
                'id': str(challenge.id),
                'title': challenge.title,
                'description': challenge.description,
                'requirements': challenge.requirements,
                'company': {
                    'id': str(challenge.company.id),
                    'name': challenge.company.company_name,
                    'logo': challenge.company.logo_url,
                },
                'area': {
                    'id': challenge.area.id if challenge.area else None,
                    'name': challenge.area.name if challenge.area else None,
                },
                'period_type': challenge.period_type,
                'academic_year': challenge.academic_year,
                'semester': challenge.semester,
                'max_teams': challenge.max_teams,
                'current_teams': challenge.current_teams,
                'modality': challenge.modality,
                'duration_weeks': challenge.duration_weeks,
                'hours_per_week': challenge.hours_per_week,
                'total_hours': challenge.total_hours,
                'registration_start': challenge.registration_start.isoformat(),
                'registration_end': challenge.registration_end.isoformat(),
                'challenge_start': challenge.challenge_start.isoformat(),
                'challenge_end': challenge.challenge_end.isoformat(),
                'status': challenge.status,
                'applications_count': challenge.applications_count,
                'views_count': challenge.views_count,
                'is_featured': challenge.is_featured,
                'is_urgent': challenge.is_urgent,
                'is_active': challenge.is_active,
                'is_registration_open': challenge.is_registration_open,
                'is_challenge_active': challenge.is_challenge_active,
                'registration_progress': challenge.registration_progress,
                'time_remaining_registration': challenge.time_remaining_registration,
                'time_remaining_challenge': challenge.time_remaining_challenge,
                'required_skills': challenge.get_required_skills_list(),
                'technologies': challenge.get_technologies_list(),
                'benefits': challenge.get_benefits_list(),
                'created_at': challenge.created_at.isoformat(),
                'updated_at': challenge.updated_at.isoformat(),
                'published_at': challenge.published_at.isoformat() if challenge.published_at else None,
            }
            challenges_data.append(challenge_data)
        
        return JsonResponse({
            'challenges': challenges_data,
            'pagination': {
                'current_page': page,
                'total_pages': paginator.num_pages,
                'total_count': paginator.count,
                'has_next': page_obj.has_next(),
                'has_previous': page_obj.has_previous(),
            }
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def api_challenge_detail(request, challenge_id):
    """Endpoint para obtener detalles de un desafío específico."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token de autenticación requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        user = verify_token(token)
        
        if not user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Obtener desafío
        from collective_challenges.models import DesafioColectivo
        
        try:
            challenge = DesafioColectivo.objects.select_related('company', 'area').get(id=challenge_id)
        except DesafioColectivo.DoesNotExist:
            return JsonResponse({'error': 'Desafío no encontrado'}, status=404)
        
        # Incrementar contador de vistas
        challenge.views_count += 1
        challenge.save(update_fields=['views_count'])
        
        # Serializar datos completos
        challenge_data = {
            'id': str(challenge.id),
            'title': challenge.title,
            'description': challenge.description,
            'requirements': challenge.requirements,
            'company': {
                'id': str(challenge.company.id),
                'name': challenge.company.company_name,
                'description': challenge.company.description,
                'logo': challenge.company.logo_url,
                'website': challenge.company.website,
                'industry': challenge.company.industry,
            },
            'area': {
                'id': challenge.area.id if challenge.area else None,
                'name': challenge.area.name if challenge.area else None,
            },
            'period_type': challenge.period_type,
            'academic_year': challenge.academic_year,
            'semester': challenge.semester,
            'tipo': challenge.tipo,
            'objetivo': challenge.objetivo,
            'encargado': challenge.encargado,
            'contacto': challenge.contacto,
            'max_teams': challenge.max_teams,
            'students_per_team': challenge.students_per_team,
            'total_students_needed': challenge.total_students_needed,
            'current_teams': challenge.current_teams,
            'modality': challenge.modality,
            'duration_weeks': challenge.duration_weeks,
            'hours_per_week': challenge.hours_per_week,
            'total_hours': challenge.total_hours,
            'registration_start': challenge.registration_start.isoformat(),
            'registration_end': challenge.registration_end.isoformat(),
            'challenge_start': challenge.challenge_start.isoformat(),
            'challenge_end': challenge.challenge_end.isoformat(),
            'evaluation_criteria': challenge.get_evaluation_criteria_dict(),
            'prizes': challenge.get_prizes_list(),
            'judges': challenge.get_judges_list(),
            'status': challenge.status,
            'applications_count': challenge.applications_count,
            'views_count': challenge.views_count,
            'is_featured': challenge.is_featured,
            'is_urgent': challenge.is_urgent,
            'is_active': challenge.is_active,
            'is_registration_open': challenge.is_registration_open,
            'is_challenge_active': challenge.is_challenge_active,
            'registration_progress': challenge.registration_progress,
            'time_remaining_registration': challenge.time_remaining_registration,
            'time_remaining_challenge': challenge.time_remaining_challenge,
            'required_skills': challenge.get_required_skills_list(),
            'preferred_skills': challenge.get_preferred_skills_list(),
            'technologies': challenge.get_technologies_list(),
            'benefits': challenge.get_benefits_list(),
            'created_at': challenge.created_at.isoformat(),
            'updated_at': challenge.updated_at.isoformat(),
            'published_at': challenge.published_at.isoformat() if challenge.published_at else None,
        }
        
        return JsonResponse({'challenge': challenge_data})
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def api_challenge_create(request):
    """Endpoint para crear un nuevo desafío colectivo."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token de autenticación requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        user = verify_token(token)
        
        if not user or user.role != 'company':
            return JsonResponse({'error': 'Solo las empresas pueden crear desafíos'}, status=403)
        
        # Obtener datos del request
        data = json.loads(request.body)
        
        # Validar campos obligatorios
        required_fields = ['title', 'description', 'requirements', 'academic_year']
        for field in required_fields:
            if not data.get(field):
                return JsonResponse({'error': f'El campo {field} es obligatorio'}, status=400)
        
        # Obtener empresa del usuario
        from companies.models import Empresa
        try:
            company = Empresa.objects.get(user=user)
        except Empresa.DoesNotExist:
            return JsonResponse({'error': 'Empresa no encontrada'}, status=404)
        
        # Crear desafío
        from collective_challenges.models import DesafioColectivo
        
        challenge = DesafioColectivo(
            company=company,
            title=data['title'],
            description=data['description'],
            requirements=data['requirements'],
            academic_year=data['academic_year'],
            period_type=data.get('period_type', 'trimestral'),
            objetivo=data.get('objetivo'),
            tipo=data.get('tipo'),
            contacto=data.get('contacto'),
            status='draft',
        )
        
        # Asignar área si se proporciona
        if data.get('area_id'):
            from areas.models import Area
            try:
                challenge.area = Area.objects.get(id=data['area_id'])
            except Area.DoesNotExist:
                pass
        
        # Guardar desafío
        challenge.save()
        
        # Establecer campos JSON si se proporcionan
        if data.get('required_skills'):
            challenge.set_required_skills_list(data['required_skills'])
        if data.get('technologies'):
            challenge.set_technologies_list(data['technologies'])
        if data.get('benefits'):
            challenge.set_benefits_list(data['benefits'])
        
        challenge.save()
        
        return JsonResponse({
            'message': 'Desafío creado exitosamente',
            'challenge_id': str(challenge.id)
        }, status=201)
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Datos JSON inválidos'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["PUT"])
def api_challenge_update(request, challenge_id):
    """Endpoint para actualizar un desafío colectivo."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token de autenticación requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        user = verify_token(token)
        
        if not user or user.role != 'company':
            return JsonResponse({'error': 'Solo las empresas pueden actualizar desafíos'}, status=403)
        
        # Obtener desafío
        from collective_challenges.models import DesafioColectivo
        
        try:
            challenge = DesafioColectivo.objects.get(id=challenge_id, company__user=user)
        except DesafioColectivo.DoesNotExist:
            return JsonResponse({'error': 'Desafío no encontrado'}, status=404)
        
        # Obtener datos del request
        data = json.loads(request.body)
        
        # Actualizar campos
        fields_to_update = [
            'title', 'description', 'requirements', 'academic_year', 'semester',
            'period_type', 'tipo', 'objetivo', 'encargado', 'contacto',
            'max_teams', 'students_per_team', 'modality', 'duration_weeks',
            'hours_per_week', 'registration_start', 'registration_end',
            'challenge_start', 'challenge_end', 'status'
        ]
        
        for field in fields_to_update:
            if field in data:
                setattr(challenge, field, data[field])
        
        # Actualizar área si se proporciona
        if 'area_id' in data:
            if data['area_id']:
                from areas.models import Area
                try:
                    challenge.area = Area.objects.get(id=data['area_id'])
                except Area.DoesNotExist:
                    pass
            else:
                challenge.area = None
        
        # Actualizar campos JSON
        if 'required_skills' in data:
            challenge.set_required_skills_list(data['required_skills'])
        if 'technologies' in data:
            challenge.set_technologies_list(data['technologies'])
        if 'benefits' in data:
            challenge.set_benefits_list(data['benefits'])
        
        # Guardar cambios
        challenge.save()
        
        return JsonResponse({
            'message': 'Desafío actualizado exitosamente',
            'challenge_id': str(challenge.id)
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Datos JSON inválidos'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["DELETE"])
def api_challenge_delete(request, challenge_id):
    """Endpoint para eliminar un desafío colectivo."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token de autenticación requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        user = verify_token(token)
        
        if not user or user.role != 'company':
            return JsonResponse({'error': 'Solo las empresas pueden eliminar desafíos'}, status=403)
        
        # Obtener desafío
        from collective_challenges.models import DesafioColectivo
        
        try:
            challenge = DesafioColectivo.objects.get(id=challenge_id, company__user=user)
        except DesafioColectivo.DoesNotExist:
            return JsonResponse({'error': 'Desafío no encontrado'}, status=404)
        
        # Eliminar desafío
        challenge.delete()
        
        return JsonResponse({'message': 'Desafío eliminado exitosamente'})
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def api_company_challenges(request):
    """Endpoint para obtener desafíos de una empresa específica."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token de autenticación requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        user = verify_token(token)
        
        if not user or user.role != 'company':
            return JsonResponse({'error': 'Solo las empresas pueden acceder a sus desafíos'}, status=403)
        
        # Obtener empresa del usuario
        from companies.models import Empresa
        try:
            company = Empresa.objects.get(user=user)
        except Empresa.DoesNotExist:
            return JsonResponse({'error': 'Empresa no encontrada'}, status=404)
        
        # Obtener parámetros de consulta
        page = int(request.GET.get('page', 1))
        limit = int(request.GET.get('limit', 10))
        status_filter = request.GET.get('status', '')
        
        # Construir consulta
        from collective_challenges.models import DesafioColectivo
        
        queryset = DesafioColectivo.objects.filter(company=company)
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Paginación
        paginator = Paginator(queryset, limit)
        page_obj = paginator.get_page(page)
        
        # Serializar datos
        challenges_data = []
        for challenge in page_obj:
            challenge_data = {
                'id': str(challenge.id),
                'title': challenge.title,
                'description': challenge.description,
                'period_type': challenge.period_type,
                'academic_year': challenge.academic_year,
                'semester': challenge.semester,
                'max_teams': challenge.max_teams,
                'current_teams': challenge.current_teams,
                'status': challenge.status,
                'applications_count': challenge.applications_count,
                'views_count': challenge.views_count,
                'is_registration_open': challenge.is_registration_open,
                'is_challenge_active': challenge.is_challenge_active,
                'registration_progress': challenge.registration_progress,
                'created_at': challenge.created_at.isoformat(),
                'published_at': challenge.published_at.isoformat() if challenge.published_at else None,
            }
            challenges_data.append(challenge_data)
        
        return JsonResponse({
            'challenges': challenges_data,
            'pagination': {
                'current_page': page,
                'total_pages': paginator.num_pages,
                'total_count': paginator.count,
                'has_next': page_obj.has_next(),
                'has_previous': page_obj.has_previous(),
            }
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
