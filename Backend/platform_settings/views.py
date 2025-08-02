from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
import json
from .models import PlatformSetting


@login_required
def settings_list(request):
    """Lista todas las configuraciones de la plataforma"""
    settings = PlatformSetting.objects.filter(is_active=True).order_by('key')
    
    context = {
        'settings': settings,
        'total_settings': settings.count(),
    }
    
    return render(request, 'platform_settings/settings_list.html', context)


@login_required
def setting_create(request):
    """Crear nueva configuración"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            setting = PlatformSetting.objects.create(
                key=data['key'],
                value=data['value'],
                setting_type=data.get('setting_type', 'string'),
                description=data.get('description', ''),
                is_active=data.get('is_active', True)
            )
            
            return JsonResponse({
                'success': True,
                'message': 'Configuración creada exitosamente',
                'setting_id': setting.id
            })
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': f'Error al crear configuración: {str(e)}'
            }, status=400)
    
    return JsonResponse({'message': 'Método no permitido'}, status=405)


@login_required
def setting_detail(request, pk):
    """Detalle de una configuración"""
    setting = get_object_or_404(PlatformSetting, pk=pk)
    
    context = {
        'setting': setting,
    }
    
    return render(request, 'platform_settings/setting_detail.html', context)


@login_required
def setting_edit(request, pk):
    """Editar configuración"""
    setting = get_object_or_404(PlatformSetting, pk=pk)
    
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            setting.key = data['key']
            setting.value = data['value']
            setting.setting_type = data.get('setting_type', 'string')
            setting.description = data.get('description', '')
            setting.is_active = data.get('is_active', True)
            setting.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Configuración actualizada exitosamente'
            })
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': f'Error al actualizar configuración: {str(e)}'
            }, status=400)
    
    return JsonResponse({'message': 'Método no permitido'}, status=405)


@login_required
def setting_delete(request, pk):
    """Eliminar configuración"""
    setting = get_object_or_404(PlatformSetting, pk=pk)
    
    if request.method == 'POST':
        setting.delete()
        return JsonResponse({
            'success': True,
            'message': 'Configuración eliminada exitosamente'
        })
    
    return JsonResponse({'message': 'Método no permitido'}, status=405) 