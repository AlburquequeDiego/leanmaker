from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils import timezone
import json
import os

@api_view(['GET'])
def health_check(request):
    """
    Endpoint de health check para verificar que el backend esté funcionando.
    """
    return Response({
        'status': 'healthy',
        'timestamp': timezone.now().isoformat(),
        'version': '1.0.0',
        'message': 'Leanmaker Backend está funcionando correctamente'
    })

@api_view(['GET'])
def api_config(request):
    """
    Endpoint para servir la configuración de la API al frontend.
    """
    config_path = os.path.join(os.path.dirname(__file__), '..', 'api_config.json')
    
    try:
        with open(config_path, 'r', encoding='utf-8') as f:
            config = json.load(f)
        return Response(config)
    except FileNotFoundError:
        return Response({'error': 'Configuración no encontrada'}, status=404)
    except json.JSONDecodeError:
        return Response({'error': 'Error en la configuración'}, status=500) 
