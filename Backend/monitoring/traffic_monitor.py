"""
Sistema de Monitoreo de Tráfico para LeanMaker Backend
Monitoreo en tiempo real de tráfico, rendimiento y seguridad
"""

import time
import json
import logging
import threading
from collections import defaultdict, deque
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import psutil
import redis
from django.conf import settings
from django.core.cache import cache

logger = logging.getLogger(__name__)

class TrafficMonitor:
    """Monitor de tráfico en tiempo real"""
    
    def __init__(self):
        self.redis_client = redis.Redis.from_url(settings.REDIS_URL)
        self.request_counts = defaultdict(int)
        self.response_times = defaultdict(list)
        self.error_counts = defaultdict(int)
        self.user_sessions = defaultdict(set)
        self.ip_requests = defaultdict(int)
        self.endpoint_usage = defaultdict(int)
        
        # Configuración de ventanas de tiempo
        self.windows = {
            '1min': 60,
            '5min': 300,
            '15min': 900,
            '1hour': 3600,
            '24hours': 86400
        }
        
        # Inicializar métricas
        self._init_metrics()
        
    def _init_metrics(self):
        """Inicializar métricas en Redis"""
        for window in self.windows.keys():
            self.redis_client.set(f"traffic:requests:{window}", 0)
            self.redis_client.set(f"traffic:errors:{window}", 0)
            self.redis_client.set(f"traffic:response_time:{window}", 0)
            self.redis_client.set(f"traffic:active_users:{window}", 0)
            
    def record_request(self, request, response, response_time: float):
        """Registrar una nueva petición"""
        timestamp = time.time()
        
        # Extraer información de la petición
        ip = self._get_client_ip(request)
        user_id = self._get_user_id(request)
        endpoint = request.path
        method = request.method
        status_code = response.status_code
        
        # Registrar métricas básicas
        self._record_basic_metrics(timestamp, ip, user_id, endpoint, method, status_code, response_time)
        
        # Registrar métricas de usuario
        if user_id:
            self._record_user_metrics(timestamp, user_id, endpoint, response_time)
            
        # Registrar métricas de IP
        self._record_ip_metrics(timestamp, ip, endpoint, response_time)
        
        # Registrar métricas de endpoint
        self._record_endpoint_metrics(timestamp, endpoint, method, status_code, response_time)
        
        # Verificar alertas
        self._check_alerts(ip, user_id, endpoint, status_code)
        
    def _get_client_ip(self, request) -> str:
        """Obtener IP real del cliente"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR', 'unknown')
        
    def _get_user_id(self, request) -> Optional[str]:
        """Obtener ID del usuario autenticado"""
        if hasattr(request, 'user') and request.user.is_authenticated:
            return str(request.user.id)
        return None
        
    def _record_basic_metrics(self, timestamp: float, ip: str, user_id: str, 
                            endpoint: str, method: str, status_code: int, response_time: float):
        """Registrar métricas básicas"""
        # Contador de peticiones
        self.redis_client.incr(f"traffic:requests:total")
        
        # Tiempo de respuesta promedio
        self.redis_client.lpush(f"traffic:response_times", response_time)
        self.redis_client.ltrim(f"traffic:response_times", 0, 999)  # Mantener solo 1000 valores
        
        # Contador de errores
        if status_code >= 400:
            self.redis_client.incr(f"traffic:errors:total")
            
        # Usuarios activos
        if user_id:
            self.redis_client.sadd(f"traffic:active_users", user_id)
            self.redis_client.expire(f"traffic:active_users", 300)  # 5 minutos
            
    def _record_user_metrics(self, timestamp: float, user_id: str, endpoint: str, response_time: float):
        """Registrar métricas por usuario"""
        user_key = f"traffic:user:{user_id}"
        
        # Contador de peticiones por usuario
        self.redis_client.incr(f"{user_key}:requests")
        
        # Tiempo de respuesta por usuario
        self.redis_client.lpush(f"{user_key}:response_times", response_time)
        self.redis_client.ltrim(f"{user_key}:response_times", 0, 99)
        
        # Endpoints más usados por usuario
        self.redis_client.zincrby(f"{user_key}:endpoints", 1, endpoint)
        
        # Última actividad
        self.redis_client.set(f"{user_key}:last_activity", timestamp)
        
    def _record_ip_metrics(self, timestamp: float, ip: str, endpoint: str, response_time: float):
        """Registrar métricas por IP"""
        ip_key = f"traffic:ip:{ip}"
        
        # Contador de peticiones por IP
        self.redis_client.incr(f"{ip_key}:requests")
        
        # Tiempo de respuesta por IP
        self.redis_client.lpush(f"{ip_key}:response_times", response_time)
        self.redis_client.ltrim(f"{ip_key}:response_times", 0, 99)
        
        # Endpoints más usados por IP
        self.redis_client.zincrby(f"{ip_key}:endpoints", 1, endpoint)
        
        # Última actividad
        self.redis_client.set(f"{ip_key}:last_activity", timestamp)
        
    def _record_endpoint_metrics(self, timestamp: float, endpoint: str, method: str, 
                               status_code: int, response_time: float):
        """Registrar métricas por endpoint"""
        endpoint_key = f"traffic:endpoint:{endpoint}"
        
        # Contador de peticiones por endpoint
        self.redis_client.incr(f"{endpoint_key}:requests")
        
        # Tiempo de respuesta por endpoint
        self.redis_client.lpush(f"{endpoint_key}:response_times", response_time)
        self.redis_client.ltrim(f"{endpoint_key}:response_times", 0, 99)
        
        # Métodos HTTP por endpoint
        self.redis_client.zincrby(f"{endpoint_key}:methods", 1, method)
        
        # Códigos de estado por endpoint
        self.redis_client.zincrby(f"{endpoint_key}:status_codes", 1, status_code)
        
    def _check_alerts(self, ip: str, user_id: str, endpoint: str, status_code: int):
        """Verificar y generar alertas"""
        # Alerta por muchas peticiones desde una IP
        ip_requests = int(self.redis_client.get(f"traffic:ip:{ip}:requests") or 0)
        if ip_requests > 1000:  # Más de 1000 peticiones por IP
            self._send_alert("HIGH_TRAFFIC_IP", f"IP {ip} ha realizado {ip_requests} peticiones")
            
        # Alerta por muchos errores
        if status_code >= 500:
            error_count = int(self.redis_client.get(f"traffic:errors:total") or 0)
            if error_count > 100:  # Más de 100 errores
                self._send_alert("HIGH_ERROR_RATE", f"Se han detectado {error_count} errores del servidor")
                
        # Alerta por actividad sospechosa
        if user_id:
            user_requests = int(self.redis_client.get(f"traffic:user:{user_id}:requests") or 0)
            if user_requests > 500:  # Más de 500 peticiones por usuario
                self._send_alert("SUSPICIOUS_USER_ACTIVITY", f"Usuario {user_id} ha realizado {user_requests} peticiones")
                
    def _send_alert(self, alert_type: str, message: str):
        """Enviar alerta"""
        alert = {
            'type': alert_type,
            'message': message,
            'timestamp': datetime.now().isoformat(),
            'severity': 'warning'
        }
        
        # Guardar alerta en Redis
        self.redis_client.lpush("traffic:alerts", json.dumps(alert))
        self.redis_client.ltrim("traffic:alerts", 0, 999)  # Mantener solo 1000 alertas
        
        # Log de alerta
        logger.warning(f"ALERTA: {alert_type} - {message}")
        
    def get_traffic_stats(self, window: str = '1hour') -> Dict[str, Any]:
        """Obtener estadísticas de tráfico"""
        stats = {
            'total_requests': int(self.redis_client.get("traffic:requests:total") or 0),
            'total_errors': int(self.redis_client.get("traffic:errors:total") or 0),
            'active_users': self.redis_client.scard("traffic:active_users"),
            'avg_response_time': self._calculate_avg_response_time(),
            'top_endpoints': self._get_top_endpoints(),
            'top_ips': self._get_top_ips(),
            'error_rate': self._calculate_error_rate(),
            'requests_per_minute': self._calculate_rpm(),
        }
        
        return stats
        
    def _calculate_avg_response_time(self) -> float:
        """Calcular tiempo de respuesta promedio"""
        response_times = self.redis_client.lrange("traffic:response_times", 0, -1)
        if not response_times:
            return 0.0
            
        times = [float(rt) for rt in response_times]
        return sum(times) / len(times)
        
    def _get_top_endpoints(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Obtener endpoints más usados"""
        endpoints = []
        for key in self.redis_client.scan_iter("traffic:endpoint:*:requests"):
            endpoint = key.decode().split(':')[2]
            requests = int(self.redis_client.get(key) or 0)
            endpoints.append({'endpoint': endpoint, 'requests': requests})
            
        return sorted(endpoints, key=lambda x: x['requests'], reverse=True)[:limit]
        
    def _get_top_ips(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Obtener IPs con más tráfico"""
        ips = []
        for key in self.redis_client.scan_iter("traffic:ip:*:requests"):
            ip = key.decode().split(':')[2]
            requests = int(self.redis_client.get(key) or 0)
            ips.append({'ip': ip, 'requests': requests})
            
        return sorted(ips, key=lambda x: x['requests'], reverse=True)[:limit]
        
    def _calculate_error_rate(self) -> float:
        """Calcular tasa de errores"""
        total_requests = int(self.redis_client.get("traffic:requests:total") or 0)
        total_errors = int(self.redis_client.get("traffic:errors:total") or 0)
        
        if total_requests == 0:
            return 0.0
            
        return (total_errors / total_requests) * 100
        
    def _calculate_rpm(self) -> float:
        """Calcular peticiones por minuto"""
        # Implementar cálculo de RPM basado en ventana de tiempo
        return 0.0
        
    def get_system_metrics(self) -> Dict[str, Any]:
        """Obtener métricas del sistema"""
        return {
            'cpu_percent': psutil.cpu_percent(interval=1),
            'memory_percent': psutil.virtual_memory().percent,
            'disk_usage': psutil.disk_usage('/').percent,
            'network_io': self._get_network_io(),
            'process_count': len(psutil.pids()),
        }
        
    def _get_network_io(self) -> Dict[str, float]:
        """Obtener estadísticas de red"""
        net_io = psutil.net_io_counters()
        return {
            'bytes_sent': net_io.bytes_sent,
            'bytes_recv': net_io.bytes_recv,
            'packets_sent': net_io.packets_sent,
            'packets_recv': net_io.packets_recv,
        }
        
    def get_alerts(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Obtener alertas recientes"""
        alerts = []
        alert_data = self.redis_client.lrange("traffic:alerts", 0, limit - 1)
        
        for alert in alert_data:
            alerts.append(json.loads(alert.decode()))
            
        return alerts
        
    def cleanup_old_data(self):
        """Limpiar datos antiguos"""
        # Limpiar métricas de IPs antiguas (más de 24 horas)
        current_time = time.time()
        for key in self.redis_client.scan_iter("traffic:ip:*:last_activity"):
            last_activity = float(self.redis_client.get(key) or 0)
            if current_time - last_activity > 86400:  # 24 horas
                ip = key.decode().split(':')[2]
                self.redis_client.delete(f"traffic:ip:{ip}:requests")
                self.redis_client.delete(f"traffic:ip:{ip}:response_times")
                self.redis_client.delete(f"traffic:ip:{ip}:endpoints")
                self.redis_client.delete(key)
                
        # Limpiar métricas de usuarios antiguas (más de 1 hora)
        for key in self.redis_client.scan_iter("traffic:user:*:last_activity"):
            last_activity = float(self.redis_client.get(key) or 0)
            if current_time - last_activity > 3600:  # 1 hora
                user_id = key.decode().split(':')[2]
                self.redis_client.delete(f"traffic:user:{user_id}:requests")
                self.redis_client.delete(f"traffic:user:{user_id}:response_times")
                self.redis_client.delete(f"traffic:user:{user_id}:endpoints")
                self.redis_client.delete(key)

# Instancia global del monitor
traffic_monitor = TrafficMonitor() 