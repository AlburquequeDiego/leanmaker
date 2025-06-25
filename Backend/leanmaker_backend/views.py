from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils import timezone
from django.http import HttpResponse
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

def home(request):
    return HttpResponse("""
        <html>
        <head><title>LeanMaker Backend</title></head>
        <body style='font-family:sans-serif;text-align:center;margin-top:10vh;'>
            <h1>🚀 Bienvenido a LeanMaker Backend</h1>
            <p>El backend está funcionando correctamente.</p>
            <p>
                <a href='/admin/'>Ir al Admin de Django</a> | 
                <a href='/api/schema/swagger-ui/'>Ver Documentación API</a>
            </p>
            <hr>
            <small>Desarrollado con Django 3.2</small>
        </body>
        </html>
    """)
