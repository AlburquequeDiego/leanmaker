"""
Autenticador personalizado para JWT en Django REST Framework.

Este módulo implementa un sistema de autenticación personalizado que permite
a DRF interpretar y validar tokens JWT personalizados.

CARACTERÍSTICAS:
- Autenticación basada en JWT tokens
- Validación automática de tokens en cada petición
- Integración nativa con DRF
- Manejo de errores de autenticación
- Soporte para usuarios de Django

USO:
- Se configura en settings.py como DEFAULT_AUTHENTICATION_CLASSES
- DRF automáticamente usa este autenticador para todas las vistas
- Los tokens se envían en el header: Authorization: Bearer <token>

FLUJO DE AUTENTICACIÓN:
1. Cliente envía token en header Authorization
2. JWTAuthentication extrae y valida el token
3. Si es válido, retorna (user, token)
4. Si no es válido, retorna None (DRF maneja el error)
5. DRF establece request.user y request.auth

@author Sistema de Autenticación
@version 1.0.0
@lastUpdated 2025-01-17
"""

from rest_framework import authentication
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings
import jwt
from users.models import User


class JWTAuthentication(authentication.BaseAuthentication):
    """
    Autenticador personalizado para JWT tokens.
    
    Esta clase implementa la interfaz de autenticación de DRF para
    validar tokens JWT personalizados y autenticar usuarios.
    
    MÉTODOS:
    - authenticate(request): Valida el token y retorna el usuario
    - authenticate_header(request): Define el tipo de autenticación
    
    ATRIBUTOS:
    - keyword: 'Bearer' - Tipo de autenticación esperado
    
    EJEMPLO DE USO:
    # En settings.py
    REST_FRAMEWORK = {
        'DEFAULT_AUTHENTICATION_CLASSES': [
            'core.jwt_authentication.JWTAuthentication',
        ]
    }
    
    # En las vistas
    @permission_classes([IsAuthenticated])
    def mi_vista(request):
        # request.user ya está autenticado
        pass
    """
    
    def authenticate(self, request):
        """
        Autentica la petición usando el token JWT.
        
        Este método es llamado automáticamente por DRF en cada petición
        para validar la autenticación del usuario.
        
        FLUJO:
        1. Extrae el header Authorization
        2. Valida que sea tipo 'Bearer'
        3. Decodifica el token JWT
        4. Busca el usuario en la base de datos
        5. Retorna (user, token) si es válido
        
        ARGS:
            request: HttpRequest - La petición HTTP a autenticar
            
        RETURNS:
            tuple: (user, token) si la autenticación es exitosa
            None: Si no hay token o la autenticación falla
            
        RAISES:
            AuthenticationFailed: Si el token es inválido o expiró
        """
        # Obtener el header de autorización
        auth_header = request.headers.get('Authorization')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            return None
        
        # Extraer el token
        token = auth_header.split(' ')[1]
        
        try:
            # Decodificar el token usando la clave secreta
            payload = jwt.decode(
                token, 
                settings.JWT_SECRET_KEY, 
                algorithms=['HS256']
            )
            
            # Obtener el ID del usuario del payload
            user_id = payload.get('user_id')
            if not user_id:
                raise AuthenticationFailed('Token inválido: falta user_id')
            
            # Buscar el usuario en la base de datos
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                raise AuthenticationFailed('Usuario no encontrado')
            
            # Verificar que el usuario esté activo
            if not user.is_active:
                raise AuthenticationFailed('Usuario inactivo')
            
            # Retornar el usuario autenticado y el token
            return (user, token)
            
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token expirado')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Token inválido')
        except Exception as e:
            raise AuthenticationFailed(f'Error de autenticación: {str(e)}')
    
    def authenticate_header(self, request):
        """
        Define el tipo de autenticación esperado.
        
        Este método es usado por DRF para generar el header
        WWW-Authenticate en respuestas de error 401.
        
        ARGS:
            request: HttpRequest - La petición HTTP
            
        RETURNS:
            str: El tipo de autenticación esperado
        """
        return 'Bearer'
