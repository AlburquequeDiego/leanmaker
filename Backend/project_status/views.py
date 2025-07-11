"""
Views para la app project_status.
"""

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

@csrf_exempt
@require_http_methods(["GET"])
def project_status_list(request):
    return JsonResponse({'message': 'project_status_list placeholder'})

@csrf_exempt
@require_http_methods(["GET"])
def project_status_detail(request, project_status_id):
    return JsonResponse({'message': f'project_status_detail placeholder for {project_status_id}'})

@csrf_exempt
@require_http_methods(["POST"])
def project_status_create(request):
    return JsonResponse({'message': 'project_status_create placeholder'})

@csrf_exempt
@require_http_methods(["PUT"])
def project_status_update(request, project_status_id):
    return JsonResponse({'message': f'project_status_update placeholder for {project_status_id}'})

@csrf_exempt
@require_http_methods(["DELETE"])
def project_status_delete(request, project_status_id):
    return JsonResponse({'message': f'project_status_delete placeholder for {project_status_id}'})
