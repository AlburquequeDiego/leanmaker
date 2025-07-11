"""
Core views for LeanMaker Backend - Django Puro + TypeScript.
"""

from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
import json


def home(request):
    """
    Home page view.
    """
    return render(request, 'home.html', {
        'title': 'LeanMaker - Conexión Estudiantil-Empresarial'
    })


def health_check(request):
    """
    Health check endpoint.
    """
    return JsonResponse({
        'status': 'healthy',
        'message': 'LeanMaker Backend is running',
        'version': '2.0.0',
        'type': 'django-pure'
    })


@login_required
def dashboard(request):
    """
    Dashboard view based on user role.
    """
    user = request.user
    
    if user.is_admin:
        return render(request, 'dashboard/admin/index.html', {
            'user': user,
            'title': 'Dashboard Administrativo'
        })
    elif user.is_company:
        return render(request, 'dashboard/company/index.html', {
            'user': user,
            'title': 'Dashboard Empresarial'
        })
    elif user.is_student:
        return render(request, 'dashboard/student/index.html', {
            'user': user,
            'title': 'Dashboard Estudiantil'
        })
    else:
        return render(request, 'dashboard/index.html', {
            'user': user,
            'title': 'Dashboard'
        })


@csrf_exempt
def api_data(request):
    """
    Endpoint para servir datos JSON al frontend TypeScript.
    """
    if request.method == 'GET':
        # Ejemplo de datos para el frontend
        data = {
            'message': 'Datos desde Django',
            'timestamp': '2024-01-01T00:00:00Z',
            'version': '2.0.0'
        }
        return JsonResponse(data)
    
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            # Procesar datos del frontend
            return JsonResponse({
                'status': 'success',
                'message': 'Datos procesados correctamente',
                'received_data': data
            })
        except json.JSONDecodeError:
            return JsonResponse({
                'status': 'error',
                'message': 'JSON inválido'
            }, status=400)
    
    return JsonResponse({'error': 'Método no permitido'}, status=405) 