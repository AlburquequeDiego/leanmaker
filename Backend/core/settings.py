"""
Django settings for LeanMaker Backend - Django Puro + TypeScript.
"""

import os
from pathlib import Path
from decouple import config

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config('SECRET_KEY', default='django-insecure-change-this-in-production')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config('DEBUG', default=True, cast=bool)

ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1,0.0.0.0', cast=lambda v: [s.strip() for s in v.split(',')])

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party apps
    'corsheaders',
    'debug_toolbar',
    
    # Local apps
    'users',
    'companies',
    'students',
    'projects',
    'applications',
    'evaluations',
    'notifications',
    'work_hours',
    'interviews',
    'calendar_events',
    'strikes',
    'questionnaires',
    'platform_settings',
    'trl_levels',
    'areas',
    'project_status',
    'assignments',
    'evaluation_categories',
    'ratings',
    'mass_notifications',
    'disciplinary_records',
    'documents',
    'activity_logs',
    'reports',
    'data_backups',
    'custom_admin',  # Nueva app de administración
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Para archivos estáticos
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    # 'django.middleware.csrf.CsrfViewMiddleware',  # Comentado para APIs
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'debug_toolbar.middleware.DebugToolbarMiddleware',  # Solo en desarrollo
    
    # Middleware personalizado para monitoreo y seguridad
    'core.middleware.TrafficMonitoringMiddleware',
    'core.middleware.SecurityMiddleware',
    'core.middleware.PerformanceMiddleware',
    'core.middleware.LoggingMiddleware',
    'core.middleware.DatabaseQueryMiddleware',
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'


#leanmaker_db
#administradortesis
#Admin@tesis


# Database - SQLite para desarrollo local
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'es-cl'
TIME_ZONE = 'America/Santiago'
USE_I18N = True
USE_L10N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [
    BASE_DIR / 'static',
]

# Configuración de archivos estáticos para producción
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Custom User Model
AUTH_USER_MODEL = 'users.User'

# Authentication Backends
AUTHENTICATION_BACKENDS = [
    'users.backends.EmailBackend',
    'django.contrib.auth.backends.ModelBackend',
]

# CORS Settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

CORS_ALLOW_CREDENTIALS = True

# CORS Headers adicionales para JWT
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# JWT Settings
JWT_SECRET_KEY = config('JWT_SECRET_KEY', default='your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_ACCESS_TOKEN_EXPIRE_HOURS = 1
JWT_REFRESH_TOKEN_EXPIRE_DAYS = 7



# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs' / 'django.log',
            'formatter': 'verbose',
        },
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

# Cache - Configuración simple para desarrollo local
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'unique-snowflake',
    }
}

# Email (for development)
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'

# Email configuration
EMAIL_HOST = config('EMAIL_HOST', default='smtp.office365.com')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_USE_TLS = config('EMAIL_USE_TLS', default=True, cast=bool)
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='soporte@inacapmail.cl')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='tu_contraseña')
EMAIL_USE_SSL = config('EMAIL_USE_SSL', default=False, cast=bool)
DEFAULT_FROM_EMAIL = config('EMAIL_HOST_USER', default='soporte@inacapmail.cl')

# File Upload
FILE_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10MB

# Debug Toolbar (solo en desarrollo)
if DEBUG:
    INTERNAL_IPS = [
        '127.0.0.1',
        'localhost',
    ]

# Session Configuration - Configurada para desarrollo local
SESSION_ENGINE = 'django.contrib.sessions.backends.db'  # Cambiado a DB para local
SESSION_COOKIE_AGE = 3600  # 1 hora
SESSION_COOKIE_SECURE = False  # False para desarrollo local (HTTP)
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Lax'  # Más permisivo para desarrollo
SESSION_EXPIRE_AT_BROWSER_CLOSE = True
SESSION_SAVE_EVERY_REQUEST = True

# CSRF Configuration - Configurada para desarrollo local
CSRF_COOKIE_SECURE = False  # False para desarrollo local (HTTP)
CSRF_COOKIE_HTTPONLY = True
CSRF_COOKIE_SAMESITE = 'Lax'  # Más permisivo para desarrollo
CSRF_TRUSTED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
]

# CSRF Exempt URLs for API endpoints
CSRF_EXEMPT_URLS = [
    '/api/token/',
    '/api/token/refresh/',
    '/api/token/verify/',
    '/api/auth/register/',
    '/api/auth/logout/',
    '/api/users/profile/',
    '/api/students/',
    '/api/companies/',
    '/api/projects/',
    '/api/applications/',
    '/api/notifications/',
    '/api/dashboard/',
    '/api/work-hours/',
]

# Login URLs
LOGIN_URL = '/login/'
LOGIN_REDIRECT_URL = '/dashboard/'
LOGOUT_REDIRECT_URL = '/'

# Configuraciones adicionales para producción
TRAFFIC_MONITOR_ENABLED = True
DETAILED_LOGGING = True
DB_QUERY_MONITORING = True
RATE_LIMIT_ENABLED = False  # Deshabilitado para desarrollo local

# Configuración de Celery - Deshabilitado para desarrollo local
# CELERY_BROKER_URL = config('REDIS_URL', default='redis://127.0.0.1:6379/0')
# CELERY_RESULT_BACKEND = config('REDIS_URL', default='redis://127.0.0.1:6379/0')
# CELERY_ACCEPT_CONTENT = ['json']
# CELERY_TASK_SERIALIZER = 'json'
# CELERY_RESULT_SERIALIZER = 'json'
# CELERY_TIMEZONE = 'America/Santiago'
# CELERY_TASK_TRACK_STARTED = True
# CELERY_TASK_TIME_LIMIT = 30 * 60  # 30 minutos
# CELERY_WORKER_CONCURRENCY = 4
# CELERY_WORKER_MAX_TASKS_PER_CHILD = 1000

# Configuración de seguridad adicional - Ajustada para desarrollo local
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'SAMEORIGIN'  # Más permisivo para desarrollo
# SECURE_HSTS_SECONDS = 31536000  # Comentado para desarrollo local
# SECURE_HSTS_INCLUDE_SUBDOMAINS = True  # Comentado para desarrollo local
# SECURE_HSTS_PRELOAD = True  # Comentado para desarrollo local

# Configuración de archivos
FILE_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10MB
FILE_UPLOAD_TEMP_DIR = BASE_DIR / 'temp'
FILE_UPLOAD_PERMISSIONS = 0o644 