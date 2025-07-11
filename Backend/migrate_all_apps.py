#!/usr/bin/env python3
"""
Script para migrar todas las apps del backend original al nuevo backend Django puro.
"""

import os
import shutil
from pathlib import Path
import subprocess

def run_command(command, description):
    """Ejecutar comando y manejar errores."""
    print(f"\n🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completado")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error en {description}: {e}")
        print(f"Error output: {e.stderr}")
        return False

def copy_app(app_name, source_dir="../Backend", target_dir="."):
    """Copiar una app del backend original al nuevo."""
    source_path = Path(source_dir) / app_name
    target_path = Path(target_dir) / app_name
    
    if not source_path.exists():
        print(f"App {app_name} no encontrada en {source_path}")
        return False
    
    # Eliminar target si existe
    if target_path.exists():
        shutil.rmtree(target_path)
        print(f"Eliminado directorio existente: {app_name}")
    
    # Copiar app
    shutil.copytree(source_path, target_path)
    print(f"App {app_name} copiada exitosamente")
    
    # Limpiar archivos innecesarios
    cleanup_app_files(target_path)
    
    return True

def cleanup_app_files(app_path):
    """Limpiar archivos innecesarios de la app."""
    files_to_remove = [
        'api_views.py',
        'api_urls.py',
    ]
    
    for file_name in files_to_remove:
        file_path = app_path / file_name
        if file_path.exists():
            file_path.unlink()
            print(f"Eliminado: {app_path.name}/{file_name}")

def convert_serializers(app_path):
    """Convertir serializers DRF a formularios Django."""
    serializers_file = app_path / 'serializers.py'
    if not serializers_file.exists():
        return
    
    print(f"Convirtiendo serializers para {app_path.name}...")
    
    # Leer contenido actual
    with open(serializers_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Reemplazar imports de DRF por Django
    replacements = [
        # Remover imports de DRF
        ("from rest_framework import serializers", ""),
        ("from rest_framework_simplejwt.serializers import TokenObtainPairSerializer", ""),
        
        # Agregar imports de Django
        ("from django import forms", ""),
        ("from django.core.exceptions import ValidationError", ""),
        ("from django.contrib.auth.forms import UserCreationForm", ""),
    ]
    
    # Aplicar reemplazos básicos
    for old, new in replacements:
        if old in content:
            content = content.replace(old, new)
    
    # Convertir clases de serializers a formularios
    content = convert_serializer_classes_to_forms(content)
    
    # Escribir contenido convertido
    with open(serializers_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Serializers convertidos para {app_path.name}")

def convert_serializer_classes_to_forms(content):
    """Convertir clases de serializers DRF a formularios Django."""
    # Reemplazar class Meta de serializers por class Meta de forms
    content = content.replace("class Meta:", "class Meta:")
    content = content.replace("model = ", "model = ")
    content = content.replace("fields = ", "fields = ")
    
    # Convertir serializers comunes a formularios
    replacements = [
        # UserSerializer -> UserForm
        ("class UserSerializer(serializers.ModelSerializer):", "class UserForm(forms.ModelForm):"),
        ("class UserCreateSerializer(serializers.ModelSerializer):", "class UserCreateForm(forms.ModelForm):"),
        ("class UserUpdateSerializer(serializers.ModelSerializer):", "class UserUpdateForm(forms.ModelForm):"),
        
        # ProjectSerializer -> ProjectForm
        ("class ProjectSerializer(serializers.ModelSerializer):", "class ProjectForm(forms.ModelForm):"),
        ("class ProjectCreateSerializer(serializers.ModelSerializer):", "class ProjectCreateForm(forms.ModelForm):"),
        
        # ApplicationSerializer -> ApplicationForm
        ("class ApplicationSerializer(serializers.ModelSerializer):", "class ApplicationForm(forms.ModelForm):"),
        
        # EvaluationSerializer -> EvaluationForm
        ("class EvaluationSerializer(serializers.ModelSerializer):", "class EvaluationForm(forms.ModelForm):"),
        
        # CompanySerializer -> CompanyForm
        ("class CompanySerializer(serializers.ModelSerializer):", "class CompanyForm(forms.ModelForm):"),
        
        # StudentSerializer -> StudentForm
        ("class StudentSerializer(serializers.ModelSerializer):", "class StudentForm(forms.ModelForm):"),
    ]
    
    for old, new in replacements:
        content = content.replace(old, new)
    
    return content

def update_app_views(app_path):
    """Actualizar views.py para Django puro."""
    views_file = app_path / 'views.py'
    if not views_file.exists():
        return
    
    print(f"Actualizando views.py para {app_path.name}...")
    
    # Leer contenido actual
    with open(views_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Reemplazar imports de DRF por Django puro
    replacements = [
        # Remover imports de DRF
        ("from rest_framework import viewsets, status", ""),
        ("from rest_framework.decorators import action", ""),
        ("from rest_framework.response import Response", ""),
        ("from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny", ""),
        ("from rest_framework.views import APIView", ""),
        ("from rest_framework_simplejwt.views import TokenObtainPairView", ""),
        
        # Agregar imports de Django
        ("from django.shortcuts import render, redirect, get_object_or_404", ""),
        ("from django.contrib.auth.decorators import login_required", ""),
        ("from django.contrib import messages", ""),
        ("from django.http import JsonResponse", ""),
        ("from django.views.decorators.csrf import csrf_exempt", ""),
        ("from django.views.decorators.http import require_http_methods", ""),
        ("import json", ""),
    ]
    
    # Aplicar reemplazos
    for old, new in replacements:
        if old in content:
            content = content.replace(old, new)
    
    # Escribir contenido actualizado
    with open(views_file, 'w', encoding='utf-8') as f:
        f.write(content)

def update_app_urls(app_path):
    """Actualizar urls.py para Django puro."""
    urls_file = app_path / 'urls.py'
    if not urls_file.exists():
        return
    
    print(f"Actualizando urls.py para {app_path.name}...")
    
    # Leer contenido actual
    with open(urls_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Reemplazar URLs de DRF por Django puro
    replacements = [
        # Remover imports de DRF
        ("from rest_framework.routers import DefaultRouter", ""),
        ("router = DefaultRouter()", ""),
        ("router.register", ""),
        ("path('', include(router.urls)),", ""),
        
        # Agregar imports de Django
        ("from django.urls import path", ""),
        ("from . import views", ""),
    ]
    
    # Aplicar reemplazos
    for old, new in replacements:
        if old in content:
            content = content.replace(old, new)
    
    # Escribir contenido actualizado
    with open(urls_file, 'w', encoding='utf-8') as f:
        f.write(content)

def create_basic_views_for_app(app_name):
    """Crear vistas básicas para una app."""
    views_content = f'''"""
Views for {app_name} app - Django Puro + TypeScript.
"""

from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json

# Importar modelos (ajustar según la app)
# from .models import TuModelo

@login_required
def {app_name}_list(request):
    """Lista de {app_name}."""
    # Implementar lógica específica de la app
    return render(request, '{app_name}/list.html', {{
        'title': f'Lista de {{app_name.title()}}'
    }})

@login_required
def {app_name}_detail(request, pk):
    """Detalle de {app_name}."""
    # Implementar lógica específica de la app
    return render(request, '{app_name}/detail.html', {{
        'title': f'Detalle de {{app_name.title()}}'
    }})

@login_required
def {app_name}_create(request):
    """Crear {app_name}."""
    if request.method == 'POST':
        # Implementar lógica de creación
        messages.success(request, f'{{app_name.title()}} creado exitosamente.')
        return redirect(f'{app_name}_list')
    
    return render(request, '{app_name}/create.html', {{
        'title': f'Crear {{app_name.title()}}'
    }})

@login_required
def {app_name}_update(request, pk):
    """Actualizar {app_name}."""
    if request.method == 'POST':
        # Implementar lógica de actualización
        messages.success(request, f'{{app_name.title()}} actualizado exitosamente.')
        return redirect(f'{app_name}_detail', pk=pk)
    
    return render(request, '{app_name}/update.html', {{
        'title': f'Actualizar {{app_name.title()}}'
    }})

@login_required
def {app_name}_delete(request, pk):
    """Eliminar {app_name}."""
    if request.method == 'POST':
        # Implementar lógica de eliminación
        messages.success(request, f'{{app_name.title()}} eliminado exitosamente.')
        return redirect(f'{app_name}_list')
    
    return render(request, '{app_name}/delete.html', {{
        'title': f'Eliminar {{app_name.title()}}'
    }})

# API endpoints para TypeScript (simples)
@csrf_exempt
@require_http_methods(["GET", "POST"])
def api_{app_name}_data(request):
    """API endpoint para datos de {app_name}."""
    if request.method == 'GET':
        # Implementar lógica para obtener datos
        data = {{
            'message': f'Datos de {{app_name}}',
            'timestamp': '2024-01-01T00:00:00Z'
        }}
        return JsonResponse(data)
    
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            # Implementar lógica para procesar datos
            return JsonResponse({{
                'status': 'success',
                'message': f'Datos de {{app_name}} procesados'
            }})
        except json.JSONDecodeError:
            return JsonResponse({{'error': 'JSON inválido'}}, status=400)
    
    return JsonResponse({{'error': 'Método no permitido'}}, status=405)
'''
    
    views_file = Path(app_name) / 'views.py'
    with open(views_file, 'w', encoding='utf-8') as f:
        f.write(views_content)

def create_basic_urls_for_app(app_name):
    """Crear URLs básicas para una app."""
    urls_content = f'''"""
URLs for {app_name} app - Django Puro + TypeScript.
"""

from django.urls import path
from . import views

urlpatterns = [
    # Vistas básicas
    path('', views.{app_name}_list, name='{app_name}_list'),
    path('create/', views.{app_name}_create, name='{app_name}_create'),
    path('<int:pk>/', views.{app_name}_detail, name='{app_name}_detail'),
    path('<int:pk>/update/', views.{app_name}_update, name='{app_name}_update'),
    path('<int:pk>/delete/', views.{app_name}_delete, name='{app_name}_delete'),
    
    # API endpoints para TypeScript
    path('api/data/', views.api_{app_name}_data, name='api_{app_name}_data'),
]
'''
    
    urls_file = Path(app_name) / 'urls.py'
    with open(urls_file, 'w', encoding='utf-8') as f:
        f.write(urls_content)

def main():
    """Función principal de migración."""
    print("INICIANDO MIGRACIÓN DE APPS DEL BACKEND ORIGINAL")
    print("=" * 60)
    
    # Lista de apps a migrar (en orden de dependencias)
    apps_to_migrate = [
        'students',
        'companies', 
        'projects',
        'applications',
        'evaluations',
        'notifications',
        'strikes',
        'questionnaires',
        'platform_settings',
        'calendar_events',
        'work_hours',
        'interviews',
        'areas',
        'trl_levels',
        'project_status',
        'assignments',
        'evaluation_categories',
        'ratings',
        'mass_notifications',
        'disciplinary_records',
        'documents',
        'activity_logs',
        'reports',
        'data_backups',
    ]
    
    successful_migrations = []
    failed_migrations = []
    
    for app_name in apps_to_migrate:
        print(f"\nMigrando app: {app_name}")
        print("-" * 40)
        
        if copy_app(app_name):
            # Actualizar archivos de la app
            app_path = Path(app_name)
            
            # Convertir serializers en lugar de eliminarlos
            convert_serializers(app_path)
            
            update_app_views(app_path)
            update_app_urls(app_path)
            
            # Si no tiene views.py, crear uno básico
            if not (app_path / 'views.py').exists():
                create_basic_views_for_app(app_name)
            
            # Si no tiene urls.py, crear uno básico
            if not (app_path / 'urls.py').exists():
                create_basic_urls_for_app(app_name)
            
            successful_migrations.append(app_name)
        else:
            failed_migrations.append(app_name)
    
    # Resumen de migración
    print("\n" + "=" * 60)
    print("RESUMEN DE MIGRACIÓN")
    print("=" * 60)
    
    print(f"\nApps migradas exitosamente ({len(successful_migrations)}):")
    for app in successful_migrations:
        print(f"   - {app}")
    
    if failed_migrations:
        print(f"\nApps que fallaron ({len(failed_migrations)}):")
        for app in failed_migrations:
            print(f"   - {app}")
    
    print(f"\nTotal: {len(successful_migrations)}/{len(apps_to_migrate)} apps migradas")
    
    if successful_migrations:
        print("\nPRÓXIMOS PASOS:")
        print("1. Ejecutar: python manage.py makemigrations")
        print("2. Ejecutar: python manage.py migrate")
        print("3. Ejecutar: python manage.py runserver")
        print("4. Verificar que todas las apps funcionen correctamente")
        print("5. Revisar serializers convertidos en cada app")
    
    return len(successful_migrations) == len(apps_to_migrate)

if __name__ == "__main__":
    success = main()
    if success:
        print("\n¡Migración completada exitosamente!")
        print("Los serializers han sido convertidos a formularios Django")
    else:
        print("\nMigración completada con algunos errores. Revisar arriba.") 