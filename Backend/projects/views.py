"""
Views para la app projects.
"""

import json
import uuid
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.exceptions import ValidationError
from django.db.models import Q, Count, Avg
from .models import Proyecto, AplicacionProyecto, MiembroProyecto
from .serializers import ProyectoSerializer, AplicacionProyectoSerializer
from users.models import User
from core.auth_utils import get_user_from_token, require_auth

# --- PROYECTOS ---

@csrf_exempt
@require_http_methods(["GET"])
@require_auth
def projects_list(request):
    """Lista proyectos con filtros y paginación"""
    try:
        user = get_user_from_token(request)
        # Filtros
        status = request.GET.get('status')
        area = request.GET.get('area')
        modality = request.GET.get('modality')
        difficulty = request.GET.get('difficulty')
        is_paid = request.GET.get('is_paid')
        is_featured = request.GET.get('is_featured')
        is_urgent = request.GET.get('is_urgent')
        search = request.GET.get('search')
        page = int(request.GET.get('page', 1))
        limit = min(int(request.GET.get('limit', 20)), 100)
        queryset = Proyecto.objects.all()
        if user.role == 'company':
            queryset = queryset.filter(company=user.company)
        elif user.role == 'student':
            queryset = queryset.filter(status__is_active=True)
        # Aplicar filtros
        if status:
            queryset = queryset.filter(status_id=status)
        if area:
            queryset = queryset.filter(area_id=area)
        if modality:
            queryset = queryset.filter(modality=modality)
        if difficulty:
            queryset = queryset.filter(difficulty=difficulty)
        if is_paid is not None:
            queryset = queryset.filter(is_paid=(is_paid.lower() == 'true'))
        if is_featured is not None:
            queryset = queryset.filter(is_featured=(is_featured.lower() == 'true'))
        if is_urgent is not None:
            queryset = queryset.filter(is_urgent=(is_urgent.lower() == 'true'))
        if search:
            queryset = queryset.filter(Q(title__icontains=search) | Q(description__icontains=search) | Q(requirements__icontains=search))
        total = queryset.count()
        offset = (page - 1) * limit
        queryset = queryset.order_by('-created_at')[offset:offset+limit]
        data = [ProyectoSerializer.to_dict(p) for p in queryset]
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
        return JsonResponse({'error': f'Error al listar proyectos: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
@require_auth
def projects_detail(request, project_id):
    try:
        user = get_user_from_token(request)
        try:
            proyecto = Proyecto.objects.get(id=project_id)
        except Proyecto.DoesNotExist:
            return JsonResponse({'error': 'Proyecto no encontrado'}, status=404)
        # Permisos: admin, empresa dueña, o estudiante si es activo
        if user.role == 'company' and proyecto.company != user.company:
            return JsonResponse({'error': 'No tienes permisos para ver este proyecto'}, status=403)
        if user.role == 'student' and not proyecto.status.is_active:
            return JsonResponse({'error': 'No tienes permisos para ver este proyecto'}, status=403)
        return JsonResponse({'success': True, 'data': ProyectoSerializer.to_dict(proyecto)})
    except Exception as e:
        return JsonResponse({'error': f'Error al obtener proyecto: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
@require_auth
def projects_create(request):
    try:
        user = get_user_from_token(request)
        if user.role not in ['admin', 'company']:
            return JsonResponse({'error': 'No tienes permisos para crear proyectos'}, status=403)
        data = json.loads(request.body)
        errors = ProyectoSerializer.validate_data(data)
        if errors:
            return JsonResponse({'error': 'Datos inválidos', 'details': errors}, status=400)
        proyecto = ProyectoSerializer.create(data, user)
        return JsonResponse({'success': True, 'message': 'Proyecto creado exitosamente', 'data': ProyectoSerializer.to_dict(proyecto)}, status=201)
    except Exception as e:
        return JsonResponse({'error': f'Error al crear proyecto: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["PUT"])
@require_auth
def projects_update(request, project_id):
    try:
        user = get_user_from_token(request)
        try:
            proyecto = Proyecto.objects.get(id=project_id)
        except Proyecto.DoesNotExist:
            return JsonResponse({'error': 'Proyecto no encontrado'}, status=404)
        if user.role == 'company' and proyecto.company != user.company:
            return JsonResponse({'error': 'No tienes permisos para actualizar este proyecto'}, status=403)
        data = json.loads(request.body)
        errors = ProyectoSerializer.validate_data(data)
        if errors:
            return JsonResponse({'error': 'Datos inválidos', 'details': errors}, status=400)
        proyecto = ProyectoSerializer.update(proyecto, data)
        return JsonResponse({'success': True, 'message': 'Proyecto actualizado exitosamente', 'data': ProyectoSerializer.to_dict(proyecto)})
    except Exception as e:
        return JsonResponse({'error': f'Error al actualizar proyecto: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["DELETE"])
@require_auth
def projects_delete(request, project_id):
    try:
        user = get_user_from_token(request)
        try:
            proyecto = Proyecto.objects.get(id=project_id)
        except Proyecto.DoesNotExist:
            return JsonResponse({'error': 'Proyecto no encontrado'}, status=404)
        if user.role == 'company' and proyecto.company != user.company:
            return JsonResponse({'error': 'No tienes permisos para eliminar este proyecto'}, status=403)
        proyecto.delete()
        return JsonResponse({'success': True, 'message': 'Proyecto eliminado exitosamente'})
    except Exception as e:
        return JsonResponse({'error': f'Error al eliminar proyecto: {str(e)}'}, status=500)

# Puedes agregar endpoints adicionales para estadísticas, destacados, urgentes, etc. siguiendo este patrón.
