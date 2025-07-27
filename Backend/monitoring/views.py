"""
Vistas para el dashboard de monitoreo de LeanMaker Backend
"""

import json
import time
from datetime import datetime, timedelta
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required, user_passes_test
from django.core.cache import cache
from django.db import connection
from django.conf import settings
import psutil
import redis

from .traffic_monitor import traffic_monitor

def is_admin(user):
    """Verificar si el usuario es administrador"""
    return user.is_authenticated and user.is_staff

@login_required
@user_passes_test(is_admin)
def dashboard_view(request):
    """Vista principal del dashboard de monitoreo"""
    return JsonResponse({
        'status': 'success',
        'message': 'Dashboard de monitoreo',
        'timestamp': datetime.now().isoformat()
    })

@login_required
@user_passes_test(is_admin)
def traffic_stats_view(request):
    """Obtener estadísticas de tráfico"""
    try:
        window = request.GET.get('window', '1hour')
        stats = traffic_monitor.get_traffic_stats(window)
        
        return JsonResponse({
            'status': 'success',
            'data': stats,
            'window': window,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }, status=500)

@login_required
@user_passes_test(is_admin)
def system_metrics_view(request):
    """Obtener métricas del sistema"""
    try:
        # Métricas del sistema
        system_metrics = traffic_monitor.get_system_metrics()
        
        # Métricas de Redis
        redis_client = redis.Redis.from_url(settings.REDIS_URL)
        redis_info = redis_client.info()
        
        # Métricas de base de datos
        with connection.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) FROM django_session")
            active_sessions = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM users_user WHERE is_active = 1")
            active_users = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM students_student WHERE is_active = 1")
            active_students = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM companies_company WHERE is_active = 1")
            active_companies = cursor.fetchone()[0]
        
        metrics = {
            'system': system_metrics,
            'redis': {
                'used_memory': redis_info.get('used_memory_human', 'N/A'),
                'connected_clients': redis_info.get('connected_clients', 0),
                'total_commands_processed': redis_info.get('total_commands_processed', 0),
                'keyspace_hits': redis_info.get('keyspace_hits', 0),
                'keyspace_misses': redis_info.get('keyspace_misses', 0),
            },
            'database': {
                'active_sessions': active_sessions,
                'active_users': active_users,
                'active_students': active_students,
                'active_companies': active_companies,
            }
        }
        
        return JsonResponse({
            'status': 'success',
            'data': metrics,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }, status=500)

@login_required
@user_passes_test(is_admin)
def alerts_view(request):
    """Obtener alertas recientes"""
    try:
        limit = int(request.GET.get('limit', 50))
        alerts = traffic_monitor.get_alerts(limit)
        
        return JsonResponse({
            'status': 'success',
            'data': alerts,
            'count': len(alerts),
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }, status=500)

@login_required
@user_passes_test(is_admin)
def top_endpoints_view(request):
    """Obtener endpoints más usados"""
    try:
        limit = int(request.GET.get('limit', 10))
        endpoints = traffic_monitor._get_top_endpoints(limit)
        
        return JsonResponse({
            'status': 'success',
            'data': endpoints,
            'count': len(endpoints),
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }, status=500)

@login_required
@user_passes_test(is_admin)
def top_ips_view(request):
    """Obtener IPs con más tráfico"""
    try:
        limit = int(request.GET.get('limit', 10))
        ips = traffic_monitor._get_top_ips(limit)
        
        return JsonResponse({
            'status': 'success',
            'data': ips,
            'count': len(ips),
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }, status=500)

@login_required
@user_passes_test(is_admin)
def slow_queries_view(request):
    """Obtener consultas lentas"""
    try:
        # Obtener consultas lentas desde Redis
        redis_client = redis.Redis.from_url(settings.REDIS_URL)
        slow_queries = redis_client.lrange('slow_queries', 0, 49)  # Últimas 50 consultas
        
        queries = []
        for query in slow_queries:
            try:
                queries.append(json.loads(query.decode()))
            except:
                continue
        
        return JsonResponse({
            'status': 'success',
            'data': queries,
            'count': len(queries),
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }, status=500)

@login_required
@user_passes_test(is_admin)
def cache_stats_view(request):
    """Obtener estadísticas de cache"""
    try:
        redis_client = redis.Redis.from_url(settings.REDIS_URL)
        
        # Obtener estadísticas de cache
        cache_stats = {
            'total_keys': redis_client.dbsize(),
            'memory_usage': redis_client.info('memory')['used_memory_human'],
            'hit_rate': 0,
            'miss_rate': 0,
        }
        
        # Calcular hit rate
        keyspace_hits = redis_client.info('stats')['keyspace_hits']
        keyspace_misses = redis_client.info('stats')['keyspace_misses']
        total_requests = keyspace_hits + keyspace_misses
        
        if total_requests > 0:
            cache_stats['hit_rate'] = (keyspace_hits / total_requests) * 100
            cache_stats['miss_rate'] = (keyspace_misses / total_requests) * 100
        
        return JsonResponse({
            'status': 'success',
            'data': cache_stats,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }, status=500)

@login_required
@user_passes_test(is_admin)
def performance_view(request):
    """Obtener métricas de rendimiento"""
    try:
        # Métricas de rendimiento del sistema
        performance_metrics = {
            'cpu': {
                'usage_percent': psutil.cpu_percent(interval=1),
                'count': psutil.cpu_count(),
                'frequency': psutil.cpu_freq()._asdict() if psutil.cpu_freq() else None,
            },
            'memory': {
                'total': psutil.virtual_memory().total,
                'available': psutil.virtual_memory().available,
                'used': psutil.virtual_memory().used,
                'percent': psutil.virtual_memory().percent,
            },
            'disk': {
                'total': psutil.disk_usage('/').total,
                'used': psutil.disk_usage('/').used,
                'free': psutil.disk_usage('/').free,
                'percent': psutil.disk_usage('/').percent,
            },
            'network': {
                'bytes_sent': psutil.net_io_counters().bytes_sent,
                'bytes_recv': psutil.net_io_counters().bytes_recv,
                'packets_sent': psutil.net_io_counters().packets_sent,
                'packets_recv': psutil.net_io_counters().packets_recv,
            },
            'processes': {
                'total': len(psutil.pids()),
                'gunicorn_workers': len([p for p in psutil.process_iter(['name']) if 'gunicorn' in p.info['name'].lower()]),
            }
        }
        
        return JsonResponse({
            'status': 'success',
            'data': performance_metrics,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }, status=500)

@login_required
@user_passes_test(is_admin)
def cleanup_data_view(request):
    """Limpiar datos antiguos"""
    try:
        # Limpiar datos antiguos del monitor
        traffic_monitor.cleanup_old_data()
        
        # Limpiar cache antiguo
        cache.clear()
        
        return JsonResponse({
            'status': 'success',
            'message': 'Datos antiguos limpiados correctamente',
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def health_check_view(request):
    """Health check para el sistema"""
    try:
        # Verificar servicios básicos
        checks = {
            'database': False,
            'redis': False,
            'cache': False,
        }
        
        # Verificar base de datos
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                checks['database'] = True
        except:
            pass
        
        # Verificar Redis
        try:
            redis_client = redis.Redis.from_url(settings.REDIS_URL)
            redis_client.ping()
            checks['redis'] = True
        except:
            pass
        
        # Verificar cache
        try:
            cache.set('health_check', 'ok', 10)
            if cache.get('health_check') == 'ok':
                checks['cache'] = True
        except:
            pass
        
        # Determinar estado general
        all_healthy = all(checks.values())
        
        return JsonResponse({
            'status': 'healthy' if all_healthy else 'unhealthy',
            'checks': checks,
            'timestamp': datetime.now().isoformat()
        }, status=200 if all_healthy else 503)
        
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }, status=500) 