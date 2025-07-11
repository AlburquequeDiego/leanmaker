"""
Views para la app ratings.
"""

import json
import uuid
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.exceptions import ValidationError, ObjectDoesNotExist
from django.db.models import Avg, Count, Q
from django.utils.decorators import method_decorator
from django.views import View

from .models import Rating
from .serializers import RatingSerializer
from projects.models import Proyecto
from users.models import User
from core.auth_utils import get_user_from_token, require_auth

@csrf_exempt
@require_http_methods(["GET"])
@require_auth
def ratings_list(request):
    """Lista todas las calificaciones con filtros opcionales"""
    try:
        user = get_user_from_token(request)
        
        # Parámetros de filtrado
        project_id = request.GET.get('project_id')
        user_id = request.GET.get('user_id')
        min_rating = request.GET.get('min_rating')
        max_rating = request.GET.get('max_rating')
        page = int(request.GET.get('page', 1))
        limit = min(int(request.GET.get('limit', 20)), 100)
        
        # Construir query
        ratings = Rating.objects.select_related('project', 'user')
        
        # Aplicar filtros
        if project_id:
            try:
                ratings = ratings.filter(project_id=project_id)
            except:
                return JsonResponse({'error': 'ID de proyecto inválido'}, status=400)
        
        if user_id:
            try:
                ratings = ratings.filter(user_id=user_id)
            except:
                return JsonResponse({'error': 'ID de usuario inválido'}, status=400)
        
        if min_rating:
            try:
                ratings = ratings.filter(rating__gte=int(min_rating))
            except:
                return JsonResponse({'error': 'Rating mínimo inválido'}, status=400)
        
        if max_rating:
            try:
                ratings = ratings.filter(rating__lte=int(max_rating))
            except:
                return JsonResponse({'error': 'Rating máximo inválido'}, status=400)
        
        # Paginación
        total = ratings.count()
        offset = (page - 1) * limit
        ratings = ratings[offset:offset + limit]
        
        # Serializar resultados
        data = [RatingSerializer.to_dict(rating) for rating in ratings]
        
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
        return JsonResponse({'error': f'Error al listar calificaciones: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
@require_auth
def ratings_detail(request, ratings_id):
    """Obtiene los detalles de una calificación específica"""
    try:
        user = get_user_from_token(request)
        
        # Validar UUID
        try:
            rating_uuid = uuid.UUID(ratings_id)
        except ValueError:
            return JsonResponse({'error': 'ID de calificación inválido'}, status=400)
        
        # Buscar rating
        try:
            rating = Rating.objects.select_related('project', 'user').get(id=rating_uuid)
        except Rating.DoesNotExist:
            return JsonResponse({'error': 'Calificación no encontrada'}, status=404)
        
        # Verificar permisos (solo el autor o admin puede ver)
        if rating.user != user and user.role != 'admin':
            return JsonResponse({'error': 'No tienes permisos para ver esta calificación'}, status=403)
        
        return JsonResponse({
            'success': True,
            'data': RatingSerializer.to_dict(rating)
        })
        
    except Exception as e:
        return JsonResponse({'error': f'Error al obtener calificación: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
@require_auth
def ratings_create(request):
    """Crea una nueva calificación"""
    try:
        user = get_user_from_token(request)
        
        # Verificar que el usuario no sea admin (solo estudiantes y empresas pueden calificar)
        if user.role == 'admin':
            return JsonResponse({'error': 'Los administradores no pueden crear calificaciones'}, status=403)
        
        # Parsear datos
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Datos JSON inválidos'}, status=400)
        
        # Validar datos
        errors = RatingSerializer.validate_data(data)
        if errors:
            return JsonResponse({'error': 'Datos inválidos', 'details': errors}, status=400)
        
        # Crear rating
        try:
            rating = RatingSerializer.create(data, user)
        except ValidationError as e:
            return JsonResponse({'error': str(e)}, status=400)
        
        return JsonResponse({
            'success': True,
            'message': 'Calificación creada exitosamente',
            'data': RatingSerializer.to_dict(rating)
        }, status=201)
        
    except Exception as e:
        return JsonResponse({'error': f'Error al crear calificación: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["PUT"])
@require_auth
def ratings_update(request, ratings_id):
    """Actualiza una calificación existente"""
    try:
        user = get_user_from_token(request)
        
        # Validar UUID
        try:
            rating_uuid = uuid.UUID(ratings_id)
        except ValueError:
            return JsonResponse({'error': 'ID de calificación inválido'}, status=400)
        
        # Buscar rating
        try:
            rating = Rating.objects.get(id=rating_uuid)
        except Rating.DoesNotExist:
            return JsonResponse({'error': 'Calificación no encontrada'}, status=404)
        
        # Verificar permisos (solo el autor puede editar)
        if rating.user != user:
            return JsonResponse({'error': 'No tienes permisos para editar esta calificación'}, status=403)
        
        # Parsear datos
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Datos JSON inválidos'}, status=400)
        
        # Validar datos (sin project_id ya que no se puede cambiar)
        if 'project_id' in data:
            return JsonResponse({'error': 'No se puede cambiar el proyecto de una calificación'}, status=400)
        
        # Validar rating si se proporciona
        if 'rating' in data:
            try:
                rating_value = int(data['rating'])
                if rating_value < 1 or rating_value > 5:
                    return JsonResponse({'error': 'La calificación debe estar entre 1 y 5'}, status=400)
            except (ValueError, TypeError):
                return JsonResponse({'error': 'La calificación debe ser un número entero'}, status=400)
        
        # Validar comment si se proporciona
        if 'comment' in data and data['comment'] and len(data['comment']) > 1000:
            return JsonResponse({'error': 'El comentario no puede exceder 1000 caracteres'}, status=400)
        
        # Actualizar rating
        rating = RatingSerializer.update(rating, data)
        
        return JsonResponse({
            'success': True,
            'message': 'Calificación actualizada exitosamente',
            'data': RatingSerializer.to_dict(rating)
        })
        
    except Exception as e:
        return JsonResponse({'error': f'Error al actualizar calificación: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["DELETE"])
@require_auth
def ratings_delete(request, ratings_id):
    """Elimina una calificación"""
    try:
        user = get_user_from_token(request)
        
        # Validar UUID
        try:
            rating_uuid = uuid.UUID(ratings_id)
        except ValueError:
            return JsonResponse({'error': 'ID de calificación inválido'}, status=400)
        
        # Buscar rating
        try:
            rating = Rating.objects.get(id=rating_uuid)
        except Rating.DoesNotExist:
            return JsonResponse({'error': 'Calificación no encontrada'}, status=404)
        
        # Verificar permisos (solo el autor o admin puede eliminar)
        if rating.user != user and user.role != 'admin':
            return JsonResponse({'error': 'No tienes permisos para eliminar esta calificación'}, status=403)
        
        # Eliminar rating
        rating.delete()
        
        return JsonResponse({
            'success': True,
            'message': 'Calificación eliminada exitosamente'
        })
        
    except Exception as e:
        return JsonResponse({'error': f'Error al eliminar calificación: {str(e)}'}, status=500)

# Endpoints adicionales para estadísticas y funcionalidades especiales

@csrf_exempt
@require_http_methods(["GET"])
@require_auth
def ratings_stats(request):
    """Obtiene estadísticas de calificaciones"""
    try:
        user = get_user_from_token(request)
        
        # Parámetros
        project_id = request.GET.get('project_id')
        
        # Construir query base
        ratings = Rating.objects.all()
        
        if project_id:
            try:
                ratings = ratings.filter(project_id=project_id)
            except:
                return JsonResponse({'error': 'ID de proyecto inválido'}, status=400)
        
        # Calcular estadísticas
        stats = ratings.aggregate(
            total_ratings=Count('id'),
            avg_rating=Avg('rating'),
            rating_1=Count('id', filter=Q(rating=1)),
            rating_2=Count('id', filter=Q(rating=2)),
            rating_3=Count('id', filter=Q(rating=3)),
            rating_4=Count('id', filter=Q(rating=4)),
            rating_5=Count('id', filter=Q(rating=5))
        )
        
        # Calcular porcentajes
        total = stats['total_ratings']
        if total > 0:
            stats['rating_1_percent'] = round((stats['rating_1'] / total) * 100, 2)
            stats['rating_2_percent'] = round((stats['rating_2'] / total) * 100, 2)
            stats['rating_3_percent'] = round((stats['rating_3'] / total) * 100, 2)
            stats['rating_4_percent'] = round((stats['rating_4'] / total) * 100, 2)
            stats['rating_5_percent'] = round((stats['rating_5'] / total) * 100, 2)
        else:
            stats['rating_1_percent'] = 0
            stats['rating_2_percent'] = 0
            stats['rating_3_percent'] = 0
            stats['rating_4_percent'] = 0
            stats['rating_5_percent'] = 0
        
        return JsonResponse({
            'success': True,
            'data': stats
        })
        
    except Exception as e:
        return JsonResponse({'error': f'Error al obtener estadísticas: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
@require_auth
def user_ratings(request):
    """Obtiene las calificaciones de un usuario específico"""
    try:
        user = get_user_from_token(request)
        
        # Parámetros
        target_user_id = request.GET.get('user_id')
        page = int(request.GET.get('page', 1))
        limit = min(int(request.GET.get('limit', 20)), 100)
        
        # Determinar usuario objetivo
        if target_user_id:
            try:
                target_user = User.objects.get(id=target_user_id)
            except User.DoesNotExist:
                return JsonResponse({'error': 'Usuario no encontrado'}, status=404)
        else:
            target_user = user
        
        # Verificar permisos
        if target_user != user and user.role != 'admin':
            return JsonResponse({'error': 'No tienes permisos para ver estas calificaciones'}, status=403)
        
        # Obtener calificaciones
        ratings = Rating.objects.filter(user=target_user).select_related('project')
        
        # Paginación
        total = ratings.count()
        offset = (page - 1) * limit
        ratings = ratings[offset:offset + limit]
        
        # Serializar resultados
        data = [RatingSerializer.to_dict(rating) for rating in ratings]
        
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
        return JsonResponse({'error': f'Error al obtener calificaciones del usuario: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
@require_auth
def project_ratings(request, project_id):
    """Obtiene todas las calificaciones de un proyecto específico"""
    try:
        user = get_user_from_token(request)
        
        # Validar proyecto
        try:
            project = Proyecto.objects.get(id=project_id)
        except Proyecto.DoesNotExist:
            return JsonResponse({'error': 'Proyecto no encontrado'}, status=404)
        
        # Parámetros
        page = int(request.GET.get('page', 1))
        limit = min(int(request.GET.get('limit', 20)), 100)
        sort_by = request.GET.get('sort_by', '-created_at')
        
        # Validar ordenamiento
        allowed_sort = ['created_at', '-created_at', 'rating', '-rating', 'updated_at', '-updated_at']
        if sort_by not in allowed_sort:
            sort_by = '-created_at'
        
        # Obtener calificaciones
        ratings = Rating.objects.filter(project=project).select_related('user').order_by(sort_by)
        
        # Paginación
        total = ratings.count()
        offset = (page - 1) * limit
        ratings = ratings[offset:offset + limit]
        
        # Serializar resultados
        data = [RatingSerializer.to_dict(rating) for rating in ratings]
        
        return JsonResponse({
            'success': True,
            'data': data,
            'project': {
                'id': str(project.id),
                'title': project.title
            },
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total,
                'pages': (total + limit - 1) // limit
            }
        })
        
    except Exception as e:
        return JsonResponse({'error': f'Error al obtener calificaciones del proyecto: {str(e)}'}, status=500)
