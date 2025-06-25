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
        <head>
            <title>LeanMaker Backend</title>
            <meta name='viewport' content='width=device-width, initial-scale=1'>
            <style>
                body {
                    font-family: 'Segoe UI', Arial, sans-serif;
                    background: linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%);
                    min-height: 100vh;
                    margin: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }
                .container {
                    background: #fff;
                    border-radius: 18px;
                    box-shadow: 0 4px 24px rgba(0,0,0,0.08);
                    padding: 48px 32px 32px 32px;
                    max-width: 400px;
                    width: 90%;
                    text-align: center;
                }
                h1 {
                    color: #2563eb;
                    margin-bottom: 12px;
                    font-size: 2.2rem;
                }
                .actions a {
                    display: inline-block;
                    margin: 8px 12px;
                    padding: 10px 22px;
                    border-radius: 8px;
                    background: #2563eb;
                    color: #fff;
                    text-decoration: none;
                    font-weight: 500;
                    transition: background 0.2s;
                }
                .actions a:hover {
                    background: #1e40af;
                }
                .logo {
                    font-size: 3rem;
                    margin-bottom: 10px;
                }
                hr {
                    margin: 28px 0 16px 0;
                    border: none;
                    border-top: 1px solid #e5e7eb;
                }
                small {
                    color: #64748b;
                }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='logo'>🚀</div>
                <h1>Bienvenido a LeanMaker Backend</h1>
                <p>El backend está funcionando correctamente.</p>
                <div class='actions'>
                    <a href='/admin/'>Ir al Admin de Django</a>
                    <a href='/api/schema/swagger-ui/'>Ver Documentación API</a>
                </div>
                <hr>
                <small>Desarrollado con Django 3.2</small>
            </div>
        </body>
        </html>
    """)
