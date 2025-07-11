"""
Views para la app work_hours.
"""

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

@csrf_exempt
@require_http_methods(["GET"])
def work_hours_list(request):
    return JsonResponse({'message': 'work_hours_list placeholder'})

@csrf_exempt
@require_http_methods(["GET"])
def work_hours_detail(request, work_hours_id):
    return JsonResponse({'message': f'work_hours_detail placeholder for {work_hours_id}'})

@csrf_exempt
@require_http_methods(["POST"])
def work_hours_create(request):
    return JsonResponse({'message': 'work_hours_create placeholder'})

@csrf_exempt
@require_http_methods(["PUT"])
def work_hours_update(request, work_hours_id):
    return JsonResponse({'message': f'work_hours_update placeholder for {work_hours_id}'})

@csrf_exempt
@require_http_methods(["DELETE"])
def work_hours_delete(request, work_hours_id):
    return JsonResponse({'message': f'work_hours_delete placeholder for {work_hours_id}'})
