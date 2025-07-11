"""
Views para la app evaluation_categories.
"""

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.exceptions import ValidationError
from django.db.models import Q
from .models import EvaluationCategory
from core.auth_utils import get_user_from_token, require_auth, require_admin

class EvaluationCategorySerializer:
    """Serializer para el modelo EvaluationCategory"""
    
    @staticmethod
    def to_dict(category):
        """Convierte un objeto EvaluationCategory a diccionario"""
        return {
            'id': str(category.id),
            'name': category.name,
            'description': category.description,
            'weight': category.weight,
            'is_active': category.is_active,
            'created_at': category.created_at.isoformat(),
            'updated_at': category.updated_at.isoformat()
        }
    
    @staticmethod
    def validate_data(data):
        """Valida los datos de la categoría"""
        errors = {}
        
        # Validar campos requeridos
        if 'name' not in data or not data['name']:
            errors['name'] = 'El nombre es requerido'
        elif len(data['name'].strip()) < 2:
            errors['name'] = 'El nombre debe tener al menos 2 caracteres'
        else:
            data['name'] = data['name'].strip()
        
        # Validar weight
        if 'weight' in data:
            try:
                weight = float(data['weight'])
                if weight < 0 or weight > 100:
                    errors['weight'] = 'El peso debe estar entre 0 y 100'
                data['weight'] = weight
            except (ValueError, TypeError):
                errors['weight'] = 'El peso debe ser un número'
        
        return errors
    
    @staticmethod
    def create(data):
        """Crea una nueva categoría"""
        category = EvaluationCategory.objects.create(
            name=data['name'],
            description=data.get('description', ''),
            weight=data.get('weight', 1.0),
            is_active=data.get('is_active', True)
        )
        
        return category
    
    @staticmethod
    def update(category, data):
        """Actualiza una categoría existente"""
        # Actualizar campos
        if 'name' in data:
            category.name = data['name']
        if 'description' in data:
            category.description = data['description']
        if 'weight' in data:
            category.weight = data['weight']
        if 'is_active' in data:
            category.is_active = data['is_active']
        
        category.save()
        return category

@csrf_exempt
@require_http_methods(["GET"])
@require_auth
def evaluation_categories_list(request):
    """Lista categorías de evaluación con filtros"""
    try:
        user = get_user_from_token(request)
        
        # Filtros
        is_active = request.GET.get('is_active')
        search = request.GET.get('search')
        page = int(request.GET.get('page', 1))
        limit = min(int(request.GET.get('limit', 50)), 200)
        
        # Construir query
        queryset = EvaluationCategory.objects.all()
        
        # Filtrar por rol
        if user.role != 'admin':
            queryset = queryset.filter(is_active=True)
        
        # Aplicar filtros
        if is_active is not None:
            queryset = queryset.filter(is_active=(is_active.lower() == 'true'))
        if search:
            queryset = queryset.filter(Q(name__icontains=search) | Q(description__icontains=search))
        
        # Paginación
        total = queryset.count()
        offset = (page - 1) * limit
        queryset = queryset.order_by('name')[offset:offset + limit]
        
        # Serializar resultados
        data = [EvaluationCategorySerializer.to_dict(category) for category in queryset]
        
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
        return JsonResponse({'error': f'Error al listar categorías: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
@require_auth
def evaluation_categories_detail(request, category_id):
    """Obtiene los detalles de una categoría específica"""
    try:
        user = get_user_from_token(request)
        
        # Buscar categoría
        try:
            category = EvaluationCategory.objects.get(id=category_id)
        except EvaluationCategory.DoesNotExist:
            return JsonResponse({'error': 'Categoría no encontrada'}, status=404)
        
        # Verificar permisos
        if user.role != 'admin' and not category.is_active:
            return JsonResponse({'error': 'No tienes permisos para ver esta categoría'}, status=403)
        
        return JsonResponse({
            'success': True,
            'data': EvaluationCategorySerializer.to_dict(category)
        })
        
    except Exception as e:
        return JsonResponse({'error': f'Error al obtener categoría: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
@require_admin
def evaluation_categories_create(request):
    """Crea una nueva categoría de evaluación"""
    try:
        # Parsear datos
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Datos JSON inválidos'}, status=400)
        
        # Validar datos
        errors = EvaluationCategorySerializer.validate_data(data)
        if errors:
            return JsonResponse({'error': 'Datos inválidos', 'details': errors}, status=400)
        
        # Crear categoría
        category = EvaluationCategorySerializer.create(data)
        
        return JsonResponse({
            'success': True,
            'message': 'Categoría creada exitosamente',
            'data': EvaluationCategorySerializer.to_dict(category)
        }, status=201)
        
    except Exception as e:
        return JsonResponse({'error': f'Error al crear categoría: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["PUT"])
@require_admin
def evaluation_categories_update(request, category_id):
    """Actualiza una categoría existente"""
    try:
        # Buscar categoría
        try:
            category = EvaluationCategory.objects.get(id=category_id)
        except EvaluationCategory.DoesNotExist:
            return JsonResponse({'error': 'Categoría no encontrada'}, status=404)
        
        # Parsear datos
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Datos JSON inválidos'}, status=400)
        
        # Validar datos
        errors = EvaluationCategorySerializer.validate_data(data)
        if errors:
            return JsonResponse({'error': 'Datos inválidos', 'details': errors}, status=400)
        
        # Actualizar categoría
        category = EvaluationCategorySerializer.update(category, data)
        
        return JsonResponse({
            'success': True,
            'message': 'Categoría actualizada exitosamente',
            'data': EvaluationCategorySerializer.to_dict(category)
        })
        
    except Exception as e:
        return JsonResponse({'error': f'Error al actualizar categoría: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["DELETE"])
@require_admin
def evaluation_categories_delete(request, category_id):
    """Elimina una categoría"""
    try:
        # Buscar categoría
        try:
            category = EvaluationCategory.objects.get(id=category_id)
        except EvaluationCategory.DoesNotExist:
            return JsonResponse({'error': 'Categoría no encontrada'}, status=404)
        
        # Eliminar categoría
        category.delete()
        
        return JsonResponse({
            'success': True,
            'message': 'Categoría eliminada exitosamente'
        })
        
    except Exception as e:
        return JsonResponse({'error': f'Error al eliminar categoría: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
@require_auth
def active_categories(request):
    """Obtiene solo categorías activas"""
    try:
        categories = EvaluationCategory.objects.filter(is_active=True).order_by('name')
        data = [EvaluationCategorySerializer.to_dict(category) for category in categories]
        
        return JsonResponse({
            'success': True,
            'data': data
        })
        
    except Exception as e:
        return JsonResponse({'error': f'Error al obtener categorías activas: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
@require_admin
def toggle_category_status(request, category_id):
    """Activa/desactiva una categoría"""
    try:
        # Buscar categoría
        try:
            category = EvaluationCategory.objects.get(id=category_id)
        except EvaluationCategory.DoesNotExist:
            return JsonResponse({'error': 'Categoría no encontrada'}, status=404)
        
        # Cambiar estado
        category.is_active = not category.is_active
        category.save()
        
        return JsonResponse({
            'success': True,
            'message': f'Categoría {"activada" if category.is_active else "desactivada"} exitosamente',
            'data': EvaluationCategorySerializer.to_dict(category)
        })
        
    except Exception as e:
        return JsonResponse({'error': f'Error al cambiar el estado: {str(e)}'}, status=500)
