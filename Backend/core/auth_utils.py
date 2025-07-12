"""
Utilidades de autenticación para el backend.
"""

import jwt
from functools import wraps
from django.http import JsonResponse
from django.conf import settings
from users.models import User

def get_user_from_token(request):
    """
    Extrae y valida el token JWT del header Authorization
    Retorna el usuario si el token es válido, None en caso contrario
    """
    auth_header = request.headers.get('Authorization')
    print("Authorization header:", auth_header)
    
    if not auth_header or not auth_header.startswith('Bearer '):
        print("No Authorization header o formato incorrecto")
        return None
    
    token = auth_header.split(' ')[1]
    
    try:
        # Decodificar el token
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        print("Payload JWT:", payload)
        user_id = payload.get('user_id')
        print("user_id extraído:", user_id)
        
        if not user_id:
            print("No user_id en el payload")
            return None
        
        # Obtener el usuario
        user = User.objects.get(id=user_id)
        print("Usuario encontrado:", user)
        return user
        
    except Exception as e:
        print("Error decodificando token:", e)
        return None

def require_auth(view_func):
    """
    Decorador para requerir autenticación en las vistas
    Si el usuario no está autenticado, retorna un error 401
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        user = get_user_from_token(request)
        
        if not user:
            return JsonResponse({
                'error': 'Token de autenticación requerido o inválido'
            }, status=401)
        
        # Agregar el usuario al request para que esté disponible en la vista
        request.user = user
        
        return view_func(request, *args, **kwargs)
    
    return wrapper

def require_admin(view_func):
    """
    Decorador para requerir que el usuario sea administrador
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        user = get_user_from_token(request)
        
        if not user:
            return JsonResponse({
                'error': 'Token de autenticación requerido o inválido'
            }, status=401)
        
        if user.role != 'admin':
            return JsonResponse({
                'error': 'Se requieren permisos de administrador'
            }, status=403)
        
        request.user = user
        return view_func(request, *args, **kwargs)
    
    return wrapper

def require_company(view_func):
    """
    Decorador para requerir que el usuario sea una empresa
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        user = get_user_from_token(request)
        
        if not user:
            return JsonResponse({
                'error': 'Token de autenticación requerido o inválido'
            }, status=401)
        
        if user.role != 'company':
            return JsonResponse({
                'error': 'Se requieren permisos de empresa'
            }, status=403)
        
        request.user = user
        return view_func(request, *args, **kwargs)
    
    return wrapper

def require_student(view_func):
    """
    Decorador para requerir que el usuario sea un estudiante
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        user = get_user_from_token(request)
        
        if not user:
            return JsonResponse({
                'error': 'Token de autenticación requerido o inválido'
            }, status=401)
        
        if user.role != 'student':
            return JsonResponse({
                'error': 'Se requieren permisos de estudiante'
            }, status=403)
        
        request.user = user
        return view_func(request, *args, **kwargs)
    
    return wrapper 