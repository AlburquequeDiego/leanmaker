"""
Configuraciones de seguridad avanzadas para LeanMaker Backend
"""

import os
from datetime import timedelta

# Configuraciones de seguridad para producción
SECURITY_CONFIG = {
    # Headers de seguridad
    'SECURE_BROWSER_XSS_FILTER': True,
    'SECURE_CONTENT_TYPE_NOSNIFF': True,
    'X_FRAME_OPTIONS': 'DENY',
    'SECURE_HSTS_SECONDS': 31536000,  # 1 año
    'SECURE_HSTS_INCLUDE_SUBDOMAINS': True,
    'SECURE_HSTS_PRELOAD': True,
    
    # Configuración de cookies
    'SESSION_COOKIE_SECURE': True,
    'SESSION_COOKIE_HTTPONLY': True,
    'SESSION_COOKIE_SAMESITE': 'Strict',
    'CSRF_COOKIE_SECURE': True,
    'CSRF_COOKIE_HTTPONLY': True,
    'CSRF_COOKIE_SAMESITE': 'Strict',
    
    # Configuración de sesiones
    'SESSION_COOKIE_AGE': 3600,  # 1 hora
    'SESSION_EXPIRE_AT_BROWSER_CLOSE': True,
    'SESSION_SAVE_EVERY_REQUEST': True,
    
    # Rate limiting
    'RATE_LIMIT_ENABLED': True,
    'RATE_LIMIT_REQUESTS': 100,  # requests por minuto
    'RATE_LIMIT_WINDOW': 60,  # segundos
    
    # Configuración de contraseñas
    'PASSWORD_MIN_LENGTH': 12,
    'PASSWORD_REQUIRE_UPPERCASE': True,
    'PASSWORD_REQUIRE_LOWERCASE': True,
    'PASSWORD_REQUIRE_NUMBERS': True,
    'PASSWORD_REQUIRE_SYMBOLS': True,
    
    # Configuración de JWT
    'JWT_ACCESS_TOKEN_EXPIRE_MINUTES': 15,
    'JWT_REFRESH_TOKEN_EXPIRE_DAYS': 7,
    'JWT_ROTATE_REFRESH_TOKENS': True,
    'JWT_BLACKLIST_AFTER_ROTATION': True,
    
    # Configuración de archivos
    'ALLOWED_FILE_TYPES': ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
    'MAX_FILE_SIZE': 10 * 1024 * 1024,  # 10MB
    
    # Configuración de logs de seguridad
    'SECURITY_LOG_ENABLED': True,
    'SECURITY_LOG_LEVEL': 'WARNING',
    
    # Configuración de IPs permitidas (opcional)
    'ALLOWED_IPS': [],
    
    # Configuración de autenticación de dos factores
    'TWO_FACTOR_ENABLED': True,
    'TWO_FACTOR_REQUIRED_FOR_ADMIN': True,
}

# Configuración de rate limiting por tipo de usuario
RATE_LIMITS = {
    'anonymous': {
        'requests': 20,
        'window': 60,
    },
    'authenticated': {
        'requests': 100,
        'window': 60,
    },
    'admin': {
        'requests': 200,
        'window': 60,
    },
    'api': {
        'requests': 1000,
        'window': 60,
    },
}

# Configuración de monitoreo de seguridad
SECURITY_MONITORING = {
    'LOGIN_ATTEMPTS_THRESHOLD': 5,
    'LOGIN_ATTEMPTS_WINDOW': 300,  # 5 minutos
    'ACCOUNT_LOCKOUT_DURATION': 1800,  # 30 minutos
    'SUSPICIOUS_ACTIVITY_THRESHOLD': 10,
    'SUSPICIOUS_ACTIVITY_WINDOW': 600,  # 10 minutos
}

# Configuración de auditoría
AUDIT_CONFIG = {
    'LOG_USER_ACTIONS': True,
    'LOG_ADMIN_ACTIONS': True,
    'LOG_DATA_CHANGES': True,
    'LOG_LOGIN_ATTEMPTS': True,
    'LOG_FILE_ACCESS': True,
    'AUDIT_LOG_RETENTION_DAYS': 365,
}

# Configuración de backup de seguridad
BACKUP_SECURITY = {
    'ENCRYPT_BACKUPS': True,
    'BACKUP_RETENTION_DAYS': 90,
    'BACKUP_COMPRESSION': True,
    'BACKUP_VERIFICATION': True,
} 