"""
Middleware personalizado para LeanMaker Backend
Incluye monitoreo de tráfico, seguridad y rendimiento
"""

import time
import logging
from django.conf import settings
from django.http import JsonResponse
from django.core.cache import cache
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger(__name__)

class TrafficMonitoringMiddleware(MiddlewareMixin):
    """Middleware para monitoreo de tráfico en tiempo real"""
    
    def process_request(self, request):
        """Procesar petición entrante"""
        # Marcar tiempo de inicio
        request.start_time = time.time()
        
        # Registrar petición en el monitor
        if hasattr(settings, 'TRAFFIC_MONITOR_ENABLED') and settings.TRAFFIC_MONITOR_ENABLED:
            try:
                from monitoring.traffic_monitor import traffic_monitor
                # La petición se registrará en process_response
            except ImportError:
                pass
                
    def process_response(self, request, response):
        """Procesar respuesta saliente"""
        # Calcular tiempo de respuesta
        if hasattr(request, 'start_time'):
            response_time = time.time() - request.start_time
            
            # Registrar en el monitor de tráfico
            if hasattr(settings, 'TRAFFIC_MONITOR_ENABLED') and settings.TRAFFIC_MONITOR_ENABLED:
                try:
                    from monitoring.traffic_monitor import traffic_monitor
                    traffic_monitor.record_request(request, response, response_time)
                except ImportError:
                    pass
                    
            # Agregar header con tiempo de respuesta
            response['X-Response-Time'] = f"{response_time:.3f}s"
            
        return response
        
    def process_exception(self, request, exception):
        """Procesar excepciones"""
        # Registrar excepción en logs
        logger.error(f"Excepción en {request.path}: {str(exception)}")
        
        # Registrar en monitor de tráfico si está habilitado
        if hasattr(settings, 'TRAFFIC_MONITOR_ENABLED') and settings.TRAFFIC_MONITOR_ENABLED:
            try:
                from monitoring.traffic_monitor import traffic_monitor
                # Crear respuesta de error para el monitor
                error_response = type('Response', (), {'status_code': 500})()
                response_time = time.time() - getattr(request, 'start_time', time.time())
                traffic_monitor.record_request(request, error_response, response_time)
            except ImportError:
                pass

class SecurityMiddleware(MiddlewareMixin):
    """Middleware para seguridad adicional"""
    
    def process_request(self, request):
        """Procesar petición para seguridad"""
        # Verificar IP permitida si está configurado
        if hasattr(settings, 'ALLOWED_IPS') and settings.ALLOWED_IPS:
            client_ip = self._get_client_ip(request)
            if client_ip not in settings.ALLOWED_IPS:
                return JsonResponse({'error': 'IP no permitida'}, status=403)
                
        # Verificar rate limiting
        if hasattr(settings, 'RATE_LIMIT_ENABLED') and settings.RATE_LIMIT_ENABLED:
            if not self._check_rate_limit(request):
                return JsonResponse({'error': 'Rate limit excedido'}, status=429)
                
    def _get_client_ip(self, request):
        """Obtener IP real del cliente"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR', 'unknown')
        
    def _check_rate_limit(self, request):
        """Verificar rate limiting"""
        client_ip = self._get_client_ip(request)
        user_id = getattr(request.user, 'id', None) if request.user.is_authenticated else None
        
        # Determinar límites según tipo de usuario (aumentados para desarrollo)
        if user_id:
            if request.user.is_staff:
                limit_key = f"rate_limit:admin:{client_ip}"
                max_requests = 1000  # Aumentado de 200 a 1000
            else:
                limit_key = f"rate_limit:user:{client_ip}"
                max_requests = 500   # Aumentado de 100 a 500
        else:
            limit_key = f"rate_limit:anon:{client_ip}"
            max_requests = 100       # Aumentado de 20 a 100
            
        # Verificar límite
        current_requests = cache.get(limit_key, 0)
        if current_requests >= max_requests:
            return False
            
        # Incrementar contador
        cache.set(limit_key, current_requests + 1, 60)  # 1 minuto
        return True

class PerformanceMiddleware(MiddlewareMixin):
    """Middleware para optimización de rendimiento"""
    
    def process_request(self, request):
        """Optimizaciones en la petición"""
        # Configurar cache headers para archivos estáticos
        if request.path.startswith('/static/') or request.path.startswith('/media/'):
            request._cache_headers = True
            
    def process_response(self, request, response):
        """Optimizaciones en la respuesta"""
        # Agregar headers de cache para archivos estáticos
        if hasattr(request, '_cache_headers'):
            response['Cache-Control'] = 'public, max-age=31536000'  # 1 año
            response['Expires'] = 'Thu, 31 Dec 2037 23:55:55 GMT'
            
        # Agregar headers de compresión
        if 'text/html' in response.get('Content-Type', ''):
            response['Vary'] = 'Accept-Encoding'
            
        return response

class LoggingMiddleware(MiddlewareMixin):
    """Middleware para logging detallado"""
    
    def process_request(self, request):
        """Log de petición entrante"""
        if hasattr(settings, 'DETAILED_LOGGING') and settings.DETAILED_LOGGING:
            logger.info(f"Petición: {request.method} {request.path} - IP: {self._get_client_ip(request)}")
            
    def process_response(self, request, response):
        """Log de respuesta saliente"""
        if hasattr(settings, 'DETAILED_LOGGING') and settings.DETAILED_LOGGING:
            logger.info(f"Respuesta: {response.status_code} - {request.method} {request.path}")
        return response
        
    def _get_client_ip(self, request):
        """Obtener IP del cliente"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR', 'unknown')

class DatabaseQueryMiddleware(MiddlewareMixin):
    """Middleware para monitoreo de consultas de base de datos"""
    
    def process_request(self, request):
        """Inicializar contador de consultas"""
        if hasattr(settings, 'DB_QUERY_MONITORING') and settings.DB_QUERY_MONITORING:
            from django.db import connection
            request._query_count_start = len(connection.queries)
            request._query_time_start = sum(float(q['time']) for q in connection.queries)
            
    def process_response(self, request, response):
        """Registrar estadísticas de consultas"""
        if hasattr(settings, 'DB_QUERY_MONITORING') and settings.DB_QUERY_MONITORING:
            if hasattr(request, '_query_count_start'):
                from django.db import connection
                query_count = len(connection.queries) - request._query_count_start
                query_time = sum(float(q['time']) for q in connection.queries) - request._query_time_start
                
                # Log de consultas lentas
                if query_time > 1.0:  # Más de 1 segundo
                    logger.warning(f"Consulta lenta en {request.path}: {query_count} consultas en {query_time:.3f}s")
                    
                # Agregar headers con información de consultas
                response['X-Query-Count'] = str(query_count)
                response['X-Query-Time'] = f"{query_time:.3f}s"
                
        return response 