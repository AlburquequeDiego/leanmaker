#!/usr/bin/env python
"""
Script para generar automáticamente los endpoints de API para todas las apps.
"""

import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

# Apps que necesitan endpoints de API
APPS = [
    'companies',
    'projects', 
    'applications',
    'areas',
    'trl_levels',
    'project_status',
    'assignments',
    'evaluations',
    'evaluation_categories',
    'ratings',
    'notifications',
    'mass_notifications',
    'calendar_events',
    'work_hours',
    'strikes',
    'questionnaires',
    'interviews',
    'platform_settings',
    'documents',
    'disciplinary_records',
    'activity_logs',
    'reports',
    'data_backups'
]

def create_urls_file(app_name):
    """Crear archivo urls.py para una app."""
    urls_content = f'''"""
URLs para la app {app_name}.
"""

from django.urls import path
from . import views

urlpatterns = [
    # Lista de {app_name}
    path('', views.{app_name}_list, name='{app_name}_list'),
    
    # Detalle de {app_name}
    path('<str:{app_name}_id>/', views.{app_name}_detail, name='{app_name}_detail'),
    
    # Crear {app_name}
    path('create/', views.{app_name}_create, name='{app_name}_create'),
    
    # Actualizar {app_name}
    path('<str:{app_name}_id>/update/', views.{app_name}_update, name='{app_name}_update'),
    
    # Eliminar {app_name}
    path('<str:{app_name}_id>/delete/', views.{app_name}_delete, name='{app_name}_delete'),
]
'''
    
    urls_path = f'{app_name}/urls.py'
    with open(urls_path, 'w', encoding='utf-8') as f:
        f.write(urls_content)
    
    print(f"✅ Creado: {urls_path}")


def create_views_file(app_name):
    """Crear archivo views.py para una app."""
    views_content = f'''"""
Views para la app {app_name}.
"""

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from core.views import verify_token


@csrf_exempt
@require_http_methods(["GET"])
def {app_name}_list(request):
    """Lista de {app_name}."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({{'error': 'Token requerido'}}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({{'error': 'Token inválido'}}, status=401)
        
        # Por ahora retornamos una lista vacía
        # Se implementará cuando tengamos el modelo correspondiente
        data = []
        
        return JsonResponse(data, safe=False)
        
    except Exception as e:
        return JsonResponse({{'error': str(e)}}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def {app_name}_detail(request, {app_name}_id):
    """Detalle de un {app_name}."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({{'error': 'Token requerido'}}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({{'error': 'Token inválido'}}, status=401)
        
        # Por ahora retornamos un objeto vacío
        # Se implementará cuando tengamos el modelo correspondiente
        data = {{'id': {app_name}_id, 'message': 'Endpoint en desarrollo'}}
        
        return JsonResponse(data)
        
    except Exception as e:
        return JsonResponse({{'error': str(e)}}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def {app_name}_create(request):
    """Crear un nuevo {app_name}."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({{'error': 'Token requerido'}}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({{'error': 'Token inválido'}}, status=401)
        
        data = json.loads(request.body)
        
        # Por ahora retornamos un mensaje de éxito
        # Se implementará cuando tengamos el modelo correspondiente
        response_data = {{'message': f'{app_name} creado exitosamente', 'data': data}}
        
        return JsonResponse(response_data, status=201)
        
    except json.JSONDecodeError:
        return JsonResponse({{'error': 'JSON inválido'}}, status=400)
    except Exception as e:
        return JsonResponse({{'error': str(e)}}, status=500)


@csrf_exempt
@require_http_methods(["PUT"])
def {app_name}_update(request, {app_name}_id):
    """Actualizar un {app_name}."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({{'error': 'Token requerido'}}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({{'error': 'Token inválido'}}, status=401)
        
        data = json.loads(request.body)
        
        # Por ahora retornamos un mensaje de éxito
        # Se implementará cuando tengamos el modelo correspondiente
        response_data = {{'message': f'{app_name} actualizado exitosamente', 'id': {app_name}_id, 'data': data}}
        
        return JsonResponse(response_data)
        
    except json.JSONDecodeError:
        return JsonResponse({{'error': 'JSON inválido'}}, status=400)
    except Exception as e:
        return JsonResponse({{'error': str(e)}}, status=500)


@csrf_exempt
@require_http_methods(["DELETE"])
def {app_name}_delete(request, {app_name}_id):
    """Eliminar un {app_name}."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({{'error': 'Token requerido'}}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({{'error': 'Token inválido'}}, status=401)
        
        # Por ahora retornamos un mensaje de éxito
        # Se implementará cuando tengamos el modelo correspondiente
        response_data = {{'message': f'{app_name} eliminado exitosamente', 'id': {app_name}_id}}
        
        return JsonResponse(response_data)
        
    except Exception as e:
        return JsonResponse({{'error': str(e)}}, status=500)
'''
    
    views_path = f'{app_name}/views.py'
    with open(views_path, 'w', encoding='utf-8') as f:
        f.write(views_content)
    
    print(f"✅ Creado: {views_path}")


def main():
    """Función principal."""
    print("🚀 Generando endpoints de API para todas las apps...")
    print("=" * 60)
    
    for app in APPS:
        print(f"\n📦 Procesando app: {app}")
        
        # Verificar si la app existe
        if not os.path.exists(app):
            print(f"⚠️  App {app} no existe, saltando...")
            continue
        
        # Crear archivos si no existen
        if not os.path.exists(f'{app}/urls.py'):
            create_urls_file(app)
        else:
            print(f"ℹ️  {app}/urls.py ya existe")
        
        if not os.path.exists(f'{app}/views.py'):
            create_views_file(app)
        else:
            print(f"ℹ️  {app}/views.py ya existe")
    
    print("\n" + "=" * 60)
    print("🎉 Generación de endpoints completada!")
    print("\n📝 Próximos pasos:")
    print("1. Revisar y personalizar las vistas según los modelos específicos")
    print("2. Agregar validaciones y lógica de negocio")
    print("3. Probar los endpoints con el frontend")
    print("4. Implementar funcionalidades específicas para cada app")


if __name__ == '__main__':
    main() 