# Serializers simples para Django puro + TypeScript
# Sin REST Framework, solo Django

import json
from django.core.serializers.json import DjangoJSONEncoder
from .models import User

class UserSerializer:
    """Serializer simple para convertir User a JSON para TypeScript"""
    
    @staticmethod
    def to_dict(user):
        """Convierte un usuario a diccionario para JSON"""
        if not user:
            return {}
        
        return {
            'id': str(user.id),
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'username': user.username,
            'phone': user.phone,
            'avatar': user.avatar,
            'bio': user.bio,
            'role': user.role,
            'is_active': user.is_active,
            'is_verified': user.is_verified,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
            'full_name': f"{user.first_name} {user.last_name}".strip(),
            'date_joined': user.date_joined.isoformat() if user.date_joined else None,
            'last_login': user.last_login.isoformat() if user.last_login else None,
            'created_at': user.created_at.isoformat() if hasattr(user, 'created_at') and user.created_at else None,
            'updated_at': user.updated_at.isoformat() if hasattr(user, 'updated_at') and user.updated_at else None,
        }
    
    @staticmethod
    def to_json(user):
        """Convierte un usuario a JSON string"""
        return json.dumps(UserSerializer.to_dict(user), cls=DjangoJSONEncoder)

# Alias para compatibilidad
UsuarioSerializer = UserSerializer 