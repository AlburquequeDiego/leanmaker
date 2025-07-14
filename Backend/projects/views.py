"""
Views para la app projects.
"""

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.db.models import Q
from users.models import User
from .models import Proyecto
from core.views import verify_token


@csrf_exempt
@require_http_methods(["GET"])
def projects_list(request):
    """Lista de proyectos."""
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
        search = request.GET.get('search', '')
        company = request.GET.get('company', '')
        status = request.GET.get('status', '')
        api_level = request.GET.get('api_level', '')
        trl_level = request.GET.get('trl_level', '')
        
        # Query base
        queryset = Proyecto.objects.select_related('company', 'status', 'area', 'trl').all()
        
        # Aplicar filtros
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(company__company_name__icontains=search)
            )
        
        if company:
            queryset = queryset.filter(company_id=company)
        
        if status:
            queryset = queryset.filter(status__name=status)
        
        if api_level:
            queryset = queryset.filter(api_level=api_level)
        
        if trl_level:
            queryset = queryset.filter(trl_id=trl_level)
        
        # Contar total
        total_count = queryset.count()
        
        # Paginar
        projects = queryset[offset:offset + limit]
        
        # Serializar datos
        projects_data = []
        for project in projects:
            projects_data.append({
                'id': str(project.id),
                'title': project.title,
                'description': project.description,
                'company': str(project.company.id) if project.company else None,
                'company_name': project.company.company_name if project.company else 'Sin empresa',
                'status': project.status.name if project.status else 'Sin estado',
                'area': project.area.name if project.area else 'Sin área',
                'trl_level': project.trl.level if project.trl else 1,
                'api_level': project.api_level or 1,
                'max_students': project.max_students,
                'current_students': project.current_students,
                'applications_count': project.applications_count,
                'start_date': project.start_date.isoformat() if project.start_date else None,
                'estimated_end_date': project.estimated_end_date.isoformat() if project.estimated_end_date else None,
                'location': project.location or 'Remoto',
                'modality': project.modality,
                'difficulty': project.difficulty,
                'duration_weeks': project.duration_weeks,
                'hours_per_week': project.hours_per_week,
                'required_hours': project.required_hours,
                'budget': project.budget,
                'created_at': project.created_at.isoformat(),
                'updated_at': project.updated_at.isoformat(),
            })
        
        return JsonResponse({
            'results': projects_data,
            'count': total_count,
            'page': page,
            'limit': limit,
            'total_pages': (total_count + limit - 1) // limit
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def projects_detail(request, projects_id):
    """Detalle de un proyecto."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Obtener proyecto
        try:
            project = Proyecto.objects.select_related('company', 'status', 'area', 'trl').get(id=projects_id)
        except Proyecto.DoesNotExist:
            return JsonResponse({'error': 'Proyecto no encontrado'}, status=404)
        
        # Serializar datos
        project_data = {
            'id': str(project.id),
            'title': project.title,
            'description': project.description,
            'company': str(project.company.id) if project.company else None,
            'company_name': project.company.company_name if project.company else 'Sin empresa',
            'status': project.status.name if project.status else 'Sin estado',
            'area': project.area.name if project.area else 'Sin área',
            'trl_level': project.trl.level if project.trl else 1,
            'api_level': project.api_level or 1,
            'max_students': project.max_students,
            'current_students': project.current_students,
            'applications_count': project.applications_count,
            'start_date': project.start_date.isoformat() if project.start_date else None,
            'estimated_end_date': project.estimated_end_date.isoformat() if project.estimated_end_date else None,
            'location': project.location or 'Remoto',
            'modality': project.modality,
            'difficulty': project.difficulty,
            'duration_weeks': project.duration_weeks,
            'hours_per_week': project.hours_per_week,
            'required_hours': project.required_hours,
            'budget': project.budget,
            'created_at': project.created_at.isoformat(),
            'updated_at': project.updated_at.isoformat(),
        }
        
        return JsonResponse(project_data)
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def projects_create(request):
    """Crear nuevo proyecto."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Solo empresas pueden crear proyectos
        if current_user.role != 'company':
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        # Procesar datos
        data = json.loads(request.body)
        
        # Crear proyecto
        project = Proyecto.objects.create(
            title=data.get('title'),
            description=data.get('description', ''),
            company_id=data.get('company_id'),
            status_id=data.get('status_id'),
            area_id=data.get('area_id'),
            trl_id=data.get('trl_id'),
            api_level=data.get('api_level', 1),
            max_students=data.get('max_students', 1),
            current_students=data.get('current_students', 0),
            applications_count=data.get('applications_count', 0),
            start_date=data.get('start_date'),
            estimated_end_date=data.get('estimated_end_date'),
            location=data.get('location', 'Remoto'),
            modality=data.get('modality', 'remoto'),
            difficulty=data.get('difficulty', 'intermedio'),
            duration_weeks=data.get('duration_weeks', 12),
            hours_per_week=data.get('hours_per_week', 10),
            required_hours=data.get('required_hours', 120),
            budget=data.get('budget', 0),
        )
        
        return JsonResponse({
            'message': 'Proyecto creado correctamente',
            'id': str(project.id)
        }, status=201)
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["PUT", "PATCH"])
def projects_update(request, projects_id):
    """Actualizar proyecto."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Obtener proyecto
        try:
            project = Proyecto.objects.get(id=projects_id)
        except Proyecto.DoesNotExist:
            return JsonResponse({'error': 'Proyecto no encontrado'}, status=404)
        
        # Verificar permisos
        if current_user.role == 'company' and str(project.company.user.id) != str(current_user.id):
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        # Procesar datos
        data = json.loads(request.body)
        
        # Actualizar campos del proyecto
        fields_to_update = [
            'title', 'description', 'company_id', 'status_id', 'area_id', 'trl_id',
            'api_level', 'max_students', 'current_students', 'applications_count',
            'start_date', 'estimated_end_date', 'location', 'modality', 'difficulty',
            'duration_weeks', 'hours_per_week', 'required_hours', 'budget'
        ]
        
        for field in fields_to_update:
            if field in data:
                setattr(project, field, data[field])
        
        project.save()
        
        # Retornar datos actualizados
        return JsonResponse({
            'message': 'Proyecto actualizado correctamente',
            'id': str(project.id)
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["DELETE"])
def projects_delete(request, projects_id):
    """Eliminar proyecto."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Obtener proyecto
        try:
            project = Proyecto.objects.get(id=projects_id)
        except Proyecto.DoesNotExist:
            return JsonResponse({'error': 'Proyecto no encontrado'}, status=404)
        
        # Verificar permisos
        if current_user.role == 'company' and str(project.company.user.id) != str(current_user.id):
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        project.delete()
        
        return JsonResponse({
            'message': 'Proyecto eliminado correctamente'
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
