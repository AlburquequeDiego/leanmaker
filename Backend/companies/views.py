# Vistas simples para Django puro + TypeScript
# Sin REST Framework, solo Django

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404
from .models import Empresa, CalificacionEmpresa
from .serializers import EmpresaSerializer, CalificacionEmpresaSerializer

@csrf_exempt
@require_http_methods(["GET"])
def companies_list(request):
    return JsonResponse({'message': 'companies_list placeholder'})

@csrf_exempt
@require_http_methods(["GET"])
def companies_detail(request, companies_id):
    return JsonResponse({'message': f'companies_detail placeholder for {companies_id}'})

@csrf_exempt
@require_http_methods(["POST"])
def companies_create(request):
    return JsonResponse({'message': 'companies_create placeholder'})

@csrf_exempt
@require_http_methods(["PUT"])
def companies_update(request, companies_id):
    return JsonResponse({'message': f'companies_update placeholder for {companies_id}'})

@csrf_exempt
@require_http_methods(["DELETE"])
def companies_delete(request, companies_id):
    return JsonResponse({'message': f'companies_delete placeholder for {companies_id}'})

@require_http_methods(["GET"])
def calificaciones_list(request):
    """Lista todas las calificaciones en formato JSON para TypeScript"""
    calificaciones = CalificacionEmpresa.objects.all()
    data = [CalificacionEmpresaSerializer.to_dict(cal) for cal in calificaciones]
    return JsonResponse({'calificaciones': data})

@require_http_methods(["GET"])
def calificacion_detail(request, calificacion_id):
    """Obtiene una calificación específica en formato JSON para TypeScript"""
    calificacion = get_object_or_404(CalificacionEmpresa, id=calificacion_id)
    data = CalificacionEmpresaSerializer.to_dict(calificacion)
    return JsonResponse(data)

@csrf_exempt
@require_http_methods(["POST"])
@login_required
def calificacion_create(request):
    """Crea una nueva calificación desde datos JSON de TypeScript"""
    try:
        data = json.loads(request.body)
        calificacion = CalificacionEmpresa.objects.create(**data)
        return JsonResponse(CalificacionEmpresaSerializer.to_dict(calificacion), status=201)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400) 