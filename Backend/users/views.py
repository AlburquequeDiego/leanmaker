"""
Views para la app users.
"""

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth import authenticate
from .models import User
from core.views import verify_token


@csrf_exempt
@require_http_methods(["GET"])
def user_list(request):
    """Lista de usuarios."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Solo admins y empresas pueden ver usuarios
        if current_user.role not in ['admin', 'company']:
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        # Filtrar usuarios según el rol del usuario actual
        if current_user.role == 'admin':
            users = User.objects.all()
        else:  # company
            users = User.objects.filter(role='student')
        
        users_data = []
        
        for user in users:
            users_data.append({
                'id': str(user.id),
                'email': user.email,
                'first_name': user.first_name or '',
                'last_name': user.last_name or '',
                'username': user.username or '',
                'role': user.role,
                'is_active': user.is_active,
                'is_verified': user.is_verified,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
                'date_joined': user.date_joined.isoformat(),
                'last_login': user.last_login.isoformat() if user.last_login else None,
                'created_at': user.created_at.isoformat(),
                'updated_at': user.updated_at.isoformat(),
                'full_name': user.full_name or f"{user.first_name or ''} {user.last_name or ''}".strip(),
                'phone': user.phone or '',
                'avatar': user.avatar or '',
                'bio': user.bio or '',
                'position': user.position or '',
                'department': user.department or '',
                'career': user.career or '',
                'company_name': user.company_name or '',
            })
        
        return JsonResponse({
            'success': True,
            'data': users_data,
            'pagination': {
                'total': len(users_data),
                'page': 1,
                'limit': len(users_data)
            }
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET", "PATCH"])
def user_detail(request, user_id):
    """Detalle de un usuario."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Solo admins o el propio usuario pueden ver el detalle
        if current_user.role != 'admin' and str(current_user.id) != user_id:
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return JsonResponse({'error': 'Usuario no encontrado'}, status=404)
        
        if request.method == "GET":
            user_data = {
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
                'date_joined': user.date_joined.isoformat(),
                'last_login': user.last_login.isoformat() if user.last_login else None,
                'created_at': user.created_at.isoformat(),
                'updated_at': user.updated_at.isoformat(),
                'full_name': user.full_name,
                'position': user.position,
                'department': user.department,
                'career': user.career,
                'company_name': user.company_name,
            }
            
            return JsonResponse(user_data)
        
        elif request.method == "PATCH":
            # Solo admins pueden editar usuarios
            if current_user.role != 'admin':
                return JsonResponse({'error': 'Acceso denegado'}, status=403)
            
            data = json.loads(request.body)
            
            # Actualizar campos permitidos
            if 'first_name' in data:
                user.first_name = data['first_name']
            if 'last_name' in data:
                user.last_name = data['last_name']
            if 'email' in data:
                user.email = data['email']
            if 'phone' in data:
                user.phone = data['phone']
            if 'position' in data:
                user.position = data['position']
            if 'department' in data:
                user.department = data['department']
            if 'career' in data:
                user.career = data['career']
            if 'company_name' in data:
                user.company_name = data['company_name']
            
            user.save()
            
            user_data = {
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
                'date_joined': user.date_joined.isoformat(),
                'last_login': user.last_login.isoformat() if user.last_login else None,
                'created_at': user.created_at.isoformat(),
                'updated_at': user.updated_at.isoformat(),
                'full_name': user.full_name,
                'position': user.position,
                'department': user.department,
                'career': user.career,
                'company_name': user.company_name,
            }
            
            return JsonResponse(user_data)
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def user_create(request):
    """Crear un nuevo usuario."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Solo admins pueden crear usuarios
        if current_user.role != 'admin':
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        data = json.loads(request.body)
        
        # Validar campos requeridos
        required_fields = ['email', 'password', 'first_name', 'last_name', 'role']
        for field in required_fields:
            if not data.get(field):
                return JsonResponse({'error': f'El campo {field} es requerido'}, status=400)
        
        # Verificar si el email ya existe
        if User.objects.filter(email=data['email']).exists():
            return JsonResponse({'error': 'El email ya está registrado'}, status=400)
        
        # Crear usuario
        user = User.objects.create_user(
            email=data['email'],
            password=data['password'],
            first_name=data['first_name'],
            last_name=data['last_name'],
            role=data['role'],
            phone=data.get('phone'),
            bio=data.get('bio')
        )
        
        # Si el usuario es administrador, asignar permisos de superusuario
        if data['role'] == 'admin':
            user.is_superuser = True
            user.is_staff = True
            user.save()
        
        user_data = {
            'id': str(user.id),
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'username': user.username,
            'role': user.role,
            'is_active': user.is_active,
            'is_verified': user.is_verified,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
            'full_name': user.full_name
        }
        
        return JsonResponse(user_data, status=201)
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["PUT"])
def user_update(request, user_id):
    """Actualizar un usuario."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Solo admins o el propio usuario pueden actualizar
        if current_user.role != 'admin' and str(current_user.id) != user_id:
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return JsonResponse({'error': 'Usuario no encontrado'}, status=404)
        
        data = json.loads(request.body)
        
        # Actualizar campos permitidos
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'phone' in data:
            user.phone = data['phone']
        if 'bio' in data:
            user.bio = data['bio']
        if 'avatar' in data:
            user.avatar = data['avatar']
        
        # Solo admins pueden cambiar el rol
        if current_user.role == 'admin' and 'role' in data:
            user.role = data['role']
        
        user.save()
        
        user_data = {
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
            'date_joined': user.date_joined.isoformat(),
            'last_login': user.last_login.isoformat() if user.last_login else None,
            'created_at': user.created_at.isoformat(),
            'updated_at': user.updated_at.isoformat(),
            'full_name': user.full_name
        }
        
        return JsonResponse(user_data)
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET", "PATCH"])
def user_profile(request):
    """Perfil del usuario actual."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        if request.method == "GET":
            user_data = {
                'id': str(current_user.id),
                'email': current_user.email,
                'first_name': current_user.first_name,
                'last_name': current_user.last_name,
                'username': current_user.username,
                'phone': current_user.phone,
                'avatar': current_user.avatar,
                'bio': current_user.bio,
                'role': current_user.role,
                'is_active': current_user.is_active,
                'is_verified': current_user.is_verified,
                'is_staff': current_user.is_staff,
                'is_superuser': current_user.is_superuser,
                'date_joined': current_user.date_joined.isoformat(),
                'last_login': current_user.last_login.isoformat() if current_user.last_login else None,
                'created_at': current_user.created_at.isoformat(),
                'updated_at': current_user.updated_at.isoformat(),
                'full_name': current_user.full_name
            }
            
            return JsonResponse(user_data)
        
        elif request.method == "PATCH":
            data = json.loads(request.body)
            
            # Actualizar campos permitidos
            if 'first_name' in data:
                current_user.first_name = data['first_name']
            if 'last_name' in data:
                current_user.last_name = data['last_name']
            if 'phone' in data:
                current_user.phone = data['phone']
            if 'bio' in data:
                current_user.bio = data['bio']
            if 'position' in data:
                current_user.position = data['position']
            if 'department' in data:
                current_user.department = data['department']
            
            current_user.save()
            
            # Retornar datos actualizados
            user_data = {
                'id': str(current_user.id),
                'email': current_user.email,
                'first_name': current_user.first_name,
                'last_name': current_user.last_name,
                'username': current_user.username,
                'phone': current_user.phone,
                'avatar': current_user.avatar,
                'bio': current_user.bio,
                'position': current_user.position,
                'department': current_user.department,
                'role': current_user.role,
                'is_active': current_user.is_active,
                'is_verified': current_user.is_verified,
                'is_staff': current_user.is_staff,
                'is_superuser': current_user.is_superuser,
                'date_joined': current_user.date_joined.isoformat(),
                'last_login': current_user.last_login.isoformat() if current_user.last_login else None,
                'created_at': current_user.created_at.isoformat(),
                'updated_at': current_user.updated_at.isoformat(),
                'full_name': current_user.full_name
            }
            
            return JsonResponse(user_data)
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def change_password(request):
    """Cambiar contraseña de usuario."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        data = json.loads(request.body)
        
        # Validar campos requeridos
        required_fields = ['old_password', 'new_password', 'new_password_confirm']
        for field in required_fields:
            if not data.get(field):
                return JsonResponse({'error': f'El campo {field} es requerido'}, status=400)
        
        # Verificar que las contraseñas coincidan
        if data['new_password'] != data['new_password_confirm']:
            return JsonResponse({'error': 'Las contraseñas no coinciden'}, status=400)
        
        # Verificar contraseña actual
        if not current_user.check_password(data['old_password']):
            return JsonResponse({'error': 'Contraseña actual incorrecta'}, status=400)
        
        # Cambiar contraseña
        current_user.set_password(data['new_password'])
        current_user.save()
        
        return JsonResponse({'message': 'Contraseña cambiada exitosamente'})
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def suspend_user(request, user_id):
    """Suspender un usuario."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Solo admins pueden suspender usuarios
        if current_user.role != 'admin':
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return JsonResponse({'error': 'Usuario no encontrado'}, status=404)
        
        # No permitir suspender superusuarios
        if user.is_superuser:
            return JsonResponse({'error': 'No se puede suspender un superusuario'}, status=400)
        
        user.is_active = False
        user.save()
        
        return JsonResponse({
            'success': True,
            'message': f'Usuario {user.email} suspendido exitosamente'
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def activate_user(request, user_id):
    """Activar un usuario suspendido."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Solo admins pueden activar usuarios
        if current_user.role != 'admin':
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return JsonResponse({'error': 'Usuario no encontrado'}, status=404)
        
        user.is_active = True
        user.save()
        
        return JsonResponse({
            'success': True,
            'message': f'Usuario {user.email} activado exitosamente'
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def block_user(request, user_id):
    """Bloquear un usuario (marcar como no verificado)."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Solo admins pueden bloquear usuarios
        if current_user.role != 'admin':
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return JsonResponse({'error': 'Usuario no encontrado'}, status=404)
        
        # No permitir bloquear superusuarios
        if user.is_superuser:
            return JsonResponse({'error': 'No se puede bloquear un superusuario'}, status=400)
        
        user.is_verified = False
        user.save()
        
        return JsonResponse({
            'success': True,
            'message': f'Usuario {user.email} bloqueado exitosamente'
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def unblock_user(request, user_id):
    """Desbloquear un usuario (marcar como verificado)."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Solo admins pueden desbloquear usuarios
        if current_user.role != 'admin':
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return JsonResponse({'error': 'Usuario no encontrado'}, status=404)
        
        user.is_verified = True
        user.save()
        
        return JsonResponse({
            'success': True,
            'message': f'Usuario {user.email} desbloqueado exitosamente'
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500) 