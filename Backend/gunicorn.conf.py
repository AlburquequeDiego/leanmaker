"""
Configuración de Gunicorn para LeanMaker Backend - Alta Carga
Optimizado para 3000 estudiantes + 1000 empresas
"""

import multiprocessing
import os

# Configuración básica
bind = "127.0.0.1:8000"
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "sync"
worker_connections = 1000
max_requests = 1000
max_requests_jitter = 50
preload_app = True

# Configuración de timeouts
timeout = 30
keepalive = 2
graceful_timeout = 30

# Configuración de logs
accesslog = "/var/log/gunicorn/access.log"
errorlog = "/var/log/gunicorn/error.log"
loglevel = "info"
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s'

# Configuración de seguridad
limit_request_line = 4094
limit_request_fields = 100
limit_request_field_size = 8190

# Configuración de procesos
worker_tmp_dir = "/dev/shm"
worker_exit_on_app_exit = True

# Configuración de SSL (si es necesario)
# keyfile = "/path/to/keyfile"
# certfile = "/path/to/certfile"

# Configuración de hooks
def on_starting(server):
    """Hook ejecutado al iniciar el servidor"""
    server.log.info("Iniciando servidor Gunicorn para LeanMaker")

def on_reload(server):
    """Hook ejecutado al recargar el servidor"""
    server.log.info("Recargando servidor Gunicorn")

def worker_int(worker):
    """Hook ejecutado cuando un worker es interrumpido"""
    worker.log.info("Worker interrumpido: %s", worker.pid)

def pre_fork(server, worker):
    """Hook ejecutado antes de crear un worker"""
    server.log.info("Creando worker: %s", worker.pid)

def post_fork(server, worker):
    """Hook ejecutado después de crear un worker"""
    server.log.info("Worker creado: %s", worker.pid)

def post_worker_init(worker):
    """Hook ejecutado después de inicializar un worker"""
    worker.log.info("Worker inicializado: %s", worker.pid)

def worker_abort(worker):
    """Hook ejecutado cuando un worker es abortado"""
    worker.log.info("Worker abortado: %s", worker.pid)

def pre_exec(server):
    """Hook ejecutado antes de ejecutar el servidor"""
    server.log.info("Ejecutando servidor")

def when_ready(server):
    """Hook ejecutado cuando el servidor está listo"""
    server.log.info("Servidor Gunicorn listo para recibir conexiones")

def on_exit(server):
    """Hook ejecutado al salir del servidor"""
    server.log.info("Cerrando servidor Gunicorn")

# Configuración de variables de entorno
raw_env = [
    "DJANGO_SETTINGS_MODULE=core.settings",
    "PYTHONPATH=/var/www/leanmaker",
]

# Configuración de usuario/grupo (para producción)
# user = "www-data"
# group = "www-data"

# Configuración de umask
umask = 0o022

# Configuración de daemon (para producción)
# daemon = True
# pidfile = "/var/run/gunicorn.pid"

# Configuración de check_config
check_config = True

# Configuración de reload (solo para desarrollo)
# reload = True
# reload_engine = "auto"

# Configuración de statsd (opcional para monitoreo)
# statsd_host = "localhost:8125"
# statsd_prefix = "gunicorn"

# Configuración de prometheus (opcional para métricas)
# prometheus_multiproc_dir = "/tmp"

# Configuración de sentry (opcional para monitoreo de errores)
# sentry_dsn = "https://your-sentry-dsn@sentry.io/123456"

# Configuración de health check
def health_check(environ, start_response):
    """Endpoint de health check para el servidor"""
    status = '200 OK'
    response_headers = [('Content-type', 'text/plain')]
    start_response(status, response_headers)
    return [b'healthy\n']

# Configuración de middleware personalizado
def custom_middleware(environ, start_response):
    """Middleware personalizado para logging y métricas"""
    # Aquí puedes agregar lógica personalizada
    return None 