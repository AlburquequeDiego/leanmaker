"""
Views para la app areas.
"""

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .models import Area
from core.views import verify_token

@csrf_exempt
@require_http_methods(["GET"])
def areas_list(request):
    try:
        # Autenticación opcional (áreas públicas, pero si hay token, verificar)
        auth_header = request.headers.get('Authorization')
        current_user = None
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            current_user = verify_token(token)
        
        # Filtros
        is_active = request.GET.get('is_active')
        queryset = Area.objects.all()
        if is_active is not None:
            queryset = queryset.filter(is_active=(is_active.lower() == 'true'))
        
        areas_data = []
        for area in queryset:
            areas_data.append({
                'id': area.id,
                'name': area.name,
                'description': area.description,
                'color': area.color,
                'icon': area.icon,
                'is_active': area.is_active,
                'created_at': area.created_at.isoformat(),
                'updated_at': area.updated_at.isoformat(),
            })
        return JsonResponse({'results': areas_data, 'count': queryset.count()})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def areas_detail(request, areas_id):
    try:
        area = Area.objects.get(id=areas_id)
        area_data = {
            'id': area.id,
            'name': area.name,
            'description': area.description,
            'color': area.color,
            'icon': area.icon,
            'is_active': area.is_active,
            'created_at': area.created_at.isoformat(),
            'updated_at': area.updated_at.isoformat(),
        }
        return JsonResponse(area_data)
    except Area.DoesNotExist:
        return JsonResponse({'error': 'Área no encontrada'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def areas_create(request):
    try:
        # Solo admin puede crear
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user or current_user.role != 'admin':
            return JsonResponse({'error': 'Solo administradores pueden crear áreas'}, status=403)
        data = json.loads(request.body)
        required_fields = ['name']
        for field in required_fields:
            if not data.get(field):
                return JsonResponse({'error': f'El campo {field} es requerido'}, status=400)
        area = Area.objects.create(
            name=data['name'],
            description=data.get('description'),
            color=data.get('color', '#007bff'),
            icon=data.get('icon'),
            is_active=data.get('is_active', True)
        )
        area_data = {
            'id': area.id,
            'name': area.name,
            'description': area.description,
            'color': area.color,
            'icon': area.icon,
            'is_active': area.is_active,
            'created_at': area.created_at.isoformat(),
            'updated_at': area.updated_at.isoformat(),
        }
        return JsonResponse(area_data, status=201)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["PUT"])
def areas_update(request, areas_id):
    try:
        # Solo admin puede actualizar
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user or current_user.role != 'admin':
            return JsonResponse({'error': 'Solo administradores pueden actualizar áreas'}, status=403)
        try:
            area = Area.objects.get(id=areas_id)
        except Area.DoesNotExist:
            return JsonResponse({'error': 'Área no encontrada'}, status=404)
        data = json.loads(request.body)
        for field in ['name', 'description', 'color', 'icon', 'is_active']:
            if field in data:
                setattr(area, field, data[field])
        area.save()
        area_data = {
            'id': area.id,
            'name': area.name,
            'description': area.description,
            'color': area.color,
            'icon': area.icon,
            'is_active': area.is_active,
            'created_at': area.created_at.isoformat(),
            'updated_at': area.updated_at.isoformat(),
        }
        return JsonResponse(area_data)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["DELETE"])
def areas_delete(request, areas_id):
    try:
        # Solo admin puede eliminar
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user or current_user.role != 'admin':
            return JsonResponse({'error': 'Solo administradores pueden eliminar áreas'}, status=403)
        try:
            area = Area.objects.get(id=areas_id)
        except Area.DoesNotExist:
            return JsonResponse({'error': 'Área no encontrada'}, status=404)
        area.delete()
        return JsonResponse({'message': 'Área eliminada exitosamente'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
