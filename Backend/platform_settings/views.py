"""
Views para la app platform_settings.
"""

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.shortcuts import get_object_or_404

from .models import PlatformSetting
from .serializers import PlatformSettingSerializer
from core.auth_utils import require_auth, require_admin


@csrf_exempt
@require_http_methods(["GET", "POST"])
@require_admin
def platform_setting_list_create(request):
    """Vista para listar y crear configuraciones de plataforma"""
    if request.method == 'GET':
        return platform_setting_list(request)
    elif request.method == 'POST':
        return platform_setting_create(request)


def platform_setting_list(request):
    """Listar configuraciones de plataforma"""
    try:
        settings = PlatformSetting.objects.all().order_by('key')
        
        # Aplicar filtros
        setting_type_filter = request.GET.get('setting_type')
        if setting_type_filter:
            settings = settings.filter(setting_type=setting_type_filter)
        
        # Serializar resultados
        settings_data = [PlatformSettingSerializer.to_dict(setting) for setting in settings]
        
        return JsonResponse({
            'success': True,
            'settings': settings_data,
            'count': len(settings_data)
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error al listar configuraciones: {str(e)}'
        }, status=500)


def platform_setting_create(request):
    """Crear una nueva configuración de plataforma"""
    try:
        data = json.loads(request.body)
        
        # Validar datos
        errors = PlatformSettingSerializer.validate_data(data)
        if errors:
            return JsonResponse({
                'success': False,
                'errors': errors
            }, status=400)
        
        # Crear configuración
        setting = PlatformSettingSerializer.create(data)
        
        return JsonResponse({
            'success': True,
            'message': 'Configuración creada exitosamente',
            'setting': PlatformSettingSerializer.to_dict(setting)
        }, status=201)
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Datos JSON inválidos'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error al crear configuración: {str(e)}'
        }, status=500)


@csrf_exempt
@require_http_methods(["GET", "PUT", "DELETE"])
@require_admin
def platform_setting_detail(request, setting_id):
    """Vista para ver, actualizar y eliminar una configuración específica"""
    if request.method == 'GET':
        return platform_setting_retrieve(request, setting_id)
    elif request.method == 'PUT':
        return platform_setting_update(request, setting_id)
    elif request.method == 'DELETE':
        return platform_setting_delete(request, setting_id)


def platform_setting_retrieve(request, setting_id):
    """Obtener una configuración específica"""
    try:
        setting = get_object_or_404(PlatformSetting, id=setting_id)
        
        return JsonResponse({
            'success': True,
            'setting': PlatformSettingSerializer.to_dict(setting)
        })
        
    except PlatformSetting.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Configuración no encontrada'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error al obtener configuración: {str(e)}'
        }, status=500)


def platform_setting_update(request, setting_id):
    """Actualizar una configuración"""
    try:
        setting = get_object_or_404(PlatformSetting, id=setting_id)
        
        data = json.loads(request.body)
        
        # Validar datos
        errors = PlatformSettingSerializer.validate_data(data)
        if errors:
            return JsonResponse({
                'success': False,
                'errors': errors
            }, status=400)
        
        # Actualizar configuración
        setting = PlatformSettingSerializer.update(setting, data)
        
        return JsonResponse({
            'success': True,
            'message': 'Configuración actualizada exitosamente',
            'setting': PlatformSettingSerializer.to_dict(setting)
        })
        
    except PlatformSetting.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Configuración no encontrada'
        }, status=404)
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Datos JSON inválidos'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error al actualizar configuración: {str(e)}'
        }, status=500)


def platform_setting_delete(request, setting_id):
    """Eliminar una configuración"""
    try:
        setting = get_object_or_404(PlatformSetting, id=setting_id)
        
        setting.delete()
        
        return JsonResponse({
            'success': True,
            'message': 'Configuración eliminada exitosamente'
        })
        
    except PlatformSetting.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Configuración no encontrada'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error al eliminar configuración: {str(e)}'
        }, status=500)


@require_http_methods(["GET"])
@require_auth
def get_setting_by_key(request, key):
    """Endpoint para obtener una configuración por clave"""
    try:
        setting = PlatformSetting.objects.filter(key=key).first()
        
        if not setting:
            return JsonResponse({
                'success': False,
                'error': 'Configuración no encontrada'
            }, status=404)
        
        return JsonResponse({
            'success': True,
            'setting': PlatformSettingSerializer.to_dict(setting)
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error al obtener configuración: {str(e)}'
        }, status=500)
