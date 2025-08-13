"""
Middleware para proteger el nivel API de estudiantes contra cambios no autorizados.
"""

import json
import logging
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger(__name__)

class APILevelProtectionMiddleware(MiddlewareMixin):
    """
    Middleware que intercepta todas las peticiones que podrían modificar
    el nivel API de estudiantes y las bloquea si no están autorizadas.
    """
    
    def process_request(self, request):
        """Interceptar peticiones antes de que lleguen a las vistas"""
        
        # Solo verificar peticiones que podrían modificar estudiantes
        if request.method in ['PUT', 'PATCH', 'POST'] and 'students' in request.path:
            
            # Verificar si la petición incluye cambios en api_level
            try:
                if request.body:
                    data = json.loads(request.body)
                    if 'api_level' in data:
                        logger.warning(f"🚨 [PROTECCIÓN] Intento de modificar api_level detectado en {request.path}")
                        logger.warning(f"   - Método: {request.method}")
                        logger.warning(f"   - Datos: {data}")
                        
                        # Bloquear cualquier cambio en api_level
                        return JsonResponse({
                            'error': 'El nivel API no puede ser modificado directamente. Use el sistema de peticiones aprobado.',
                            'code': 'API_LEVEL_PROTECTED'
                        }, status=403)
                        
            except (json.JSONDecodeError, UnicodeDecodeError):
                # Si no se puede decodificar el JSON, continuar
                pass
        
        return None
    
    def process_response(self, request, response):
        """Interceptar respuestas para logging adicional"""
        
        # Log de respuestas exitosas que involucren estudiantes
        if 'students' in request.path and response.status_code == 200:
            logger.info(f"✅ [PROTECCIÓN] Petición a estudiantes procesada exitosamente: {request.path}")
        
        return response
