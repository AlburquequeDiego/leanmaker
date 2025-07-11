"""
Views para la app strikes.
"""

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

@csrf_exempt
@require_http_methods(["GET"])
def strikes_list(request):
    return JsonResponse({'message': 'strikes_list placeholder'})

@csrf_exempt
@require_http_methods(["GET"])
def strikes_detail(request, strikes_id):
    return JsonResponse({'message': f'strikes_detail placeholder for {strikes_id}'})

@csrf_exempt
@require_http_methods(["POST"])
def strikes_create(request):
    return JsonResponse({'message': 'strikes_create placeholder'})

@csrf_exempt
@require_http_methods(["PUT"])
def strikes_update(request, strikes_id):
    return JsonResponse({'message': f'strikes_update placeholder for {strikes_id}'})

@csrf_exempt
@require_http_methods(["DELETE"])
def strikes_delete(request, strikes_id):
    return JsonResponse({'message': f'strikes_delete placeholder for {strikes_id}'})
