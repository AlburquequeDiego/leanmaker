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
from django.utils import timezone
from django.core.mail import send_mail
from .models import PasswordResetCode, User
import random
import string
from datetime import timedelta


@csrf_exempt
@require_http_methods(["GET"])
def user_list(request):
    """Lista de usuarios con soporte de filtros por estado y rol."""
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
        
        # Filtros por parámetros GET
        is_active = request.GET.get('is_active')
        is_verified = request.GET.get('is_verified')
        role = request.GET.get('role')
        
        # Filtrar usuarios según el rol del usuario actual
        if current_user.role == 'admin':
            users = User.objects.all()
        else:  # company
            users = User.objects.filter(role='student')
        
        # Aplicar filtros si están presentes
        if is_active is not None:
            if is_active.lower() == 'true':
                users = users.filter(is_active=True)
            elif is_active.lower() == 'false':
                users = users.filter(is_active=False)
        if is_verified is not None:
            if is_verified.lower() == 'true':
                users = users.filter(is_verified=True)
            elif is_verified.lower() == 'false':
                users = users.filter(is_verified=False)
        if role:
            users = users.filter(role=role)
        
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
                'full_name': current_user.full_name,
                'position': current_user.position,
                'department': current_user.department,
            }
            # Si el usuario es empresa, incluir el perfil de empresa
            if current_user.role == 'company':
                from companies.models import Empresa
                from companies.serializers import EmpresaSerializer
                try:
                    empresa = Empresa.objects.get(user=current_user)
                    user_data['company_profile'] = EmpresaSerializer.to_dict(empresa)
                except Empresa.DoesNotExist:
                    user_data['company_profile'] = None
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
    """Suspender un usuario (de cualquier tipo: estudiante, empresa, admin)."""
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        if current_user.role != 'admin':
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return JsonResponse({'error': 'Usuario no encontrado'}, status=404)
        if user.is_superuser:
            return JsonResponse({'error': 'No se puede suspender un superusuario'}, status=400)
        
        # Suspender usuario
        user.is_active = False
        user.save(update_fields=['is_active'])
        
        # Si es estudiante, sincronizar con modelo Estudiante
        if user.role == 'student':
            try:
                from students.models import Estudiante
                estudiante = Estudiante.objects.get(user=user)
                estudiante.status = 'suspended'
                estudiante.save(update_fields=['status'])
            except Estudiante.DoesNotExist:
                pass  # No hay perfil de estudiante, continuar
        
        return JsonResponse({'success': True, 'message': f'Usuario {user.email} suspendido exitosamente', 'user_id': str(user.id), 'role': user.role, 'email': user.email})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def activate_user(request, user_id):
    """Activar un usuario suspendido (de cualquier tipo)."""
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        if current_user.role != 'admin':
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return JsonResponse({'error': 'Usuario no encontrado'}, status=404)
        
        # Activar usuario
        user.is_active = True
        user.is_verified = True  # Asegurar que también esté verificado
        user.save(update_fields=['is_active', 'is_verified'])
        
        # Si es estudiante, sincronizar con modelo Estudiante
        if user.role == 'student':
            try:
                from students.models import Estudiante
                estudiante = Estudiante.objects.get(user=user)
                estudiante.status = 'approved'
                estudiante.save(update_fields=['status'])
            except Estudiante.DoesNotExist:
                pass  # No hay perfil de estudiante, continuar
        
        return JsonResponse({'success': True, 'message': f'Usuario {user.email} activado exitosamente', 'user_id': str(user.id), 'role': user.role, 'email': user.email})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def block_user(request, user_id):
    """Bloquear un usuario (marcar como no verificado, de cualquier tipo)."""
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        if current_user.role != 'admin':
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return JsonResponse({'error': 'Usuario no encontrado'}, status=404)
        if user.is_superuser:
            return JsonResponse({'error': 'No se puede bloquear un superusuario'}, status=400)
        
        # Bloquear usuario
        user.is_verified = False
        user.save(update_fields=['is_verified'])
        
        # Si es estudiante, sincronizar con modelo Estudiante
        if user.role == 'student':
            try:
                from students.models import Estudiante
                estudiante = Estudiante.objects.get(user=user)
                estudiante.status = 'rejected'
                estudiante.save(update_fields=['status'])
            except Estudiante.DoesNotExist:
                pass  # No hay perfil de estudiante, continuar
        
        return JsonResponse({'success': True, 'message': f'Usuario {user.email} bloqueado exitosamente', 'user_id': str(user.id), 'role': user.role, 'email': user.email})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def unblock_user(request, user_id):
    """Desbloquear un usuario (marcar como verificado, de cualquier tipo)."""
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        if current_user.role != 'admin':
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return JsonResponse({'error': 'Usuario no encontrado'}, status=404)
        
        # Desbloquear usuario
        user.is_verified = True
        user.save(update_fields=['is_verified'])
        
        # Si es estudiante, sincronizar con modelo Estudiante
        if user.role == 'student':
            try:
                from students.models import Estudiante
                estudiante = Estudiante.objects.get(user=user)
                # Si el usuario está activo, aprobar el estudiante; si no, mantener como suspended
                if user.is_active:
                    estudiante.status = 'approved'
                else:
                    estudiante.status = 'suspended'
                estudiante.save(update_fields=['status'])
            except Estudiante.DoesNotExist:
                pass  # No hay perfil de estudiante, continuar
        
        return JsonResponse({'success': True, 'message': f'Usuario {user.email} desbloqueado exitosamente', 'user_id': str(user.id), 'role': user.role, 'email': user.email})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500) 


@csrf_exempt
@require_http_methods(["POST"])
def password_reset_request(request):
    """Solicitar código de recuperación de contraseña (envía correo)."""
    try:
        data = json.loads(request.body)
        email = data.get('email')
        if not email:
            return JsonResponse({'error': 'El correo es requerido.'}, status=400)
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return JsonResponse({'error': 'No existe usuario con ese correo.'}, status=404)
        
        # Generar código de 10 dígitos
        code = ''.join(random.choices(string.digits, k=10))
        expires_at = timezone.now() + timedelta(minutes=15)
        
        # Crear el código de recuperación
        PasswordResetCode.objects.create(user=user, code=code, expires_at=expires_at)
        
        # Obtener el remitente desde settings
        from django.conf import settings
        from_email = settings.EMAIL_HOST_USER or 'noreply@leanmaker.com'
        
        # Enviar correo
        try:
            # Mensaje simple sin caracteres especiales para evitar problemas de codificación
            message = f"""Hola {user.first_name or user.email},

Tu codigo de recuperacion es: {code}

Este codigo es valido por 15 minutos.
Si no solicitaste este cambio, ignora este mensaje.

Equipo LeanMaker"""
            
            send_mail(
                'Recuperacion de contrasena - LeanMaker',
                message,
                from_email,
                [user.email],
                fail_silently=False,
            )
            return JsonResponse({'message': 'Se ha enviado un código de recuperación a tu correo.'})
        except Exception as email_error:
            # Si falla el envío de correo, eliminar el código creado
            PasswordResetCode.objects.filter(user=user, code=code).delete()
            return JsonResponse({
                'error': f'Error al enviar el correo: {str(email_error)}. Verifica la configuración de email.'
            }, status=500)
            
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido.'}, status=400)
    except Exception as e:
        return JsonResponse({'error': f'Error interno del servidor: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def password_reset_validate_code(request):
    """Validar código de recuperación de contraseña."""
    try:
        data = json.loads(request.body)
        email = data.get('email')
        code = data.get('code')
        if not email or not code:
            return JsonResponse({'error': 'Correo y código son requeridos.'}, status=400)
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return JsonResponse({'error': 'No existe usuario con ese correo.'}, status=404)
        now = timezone.now()
        reset_code = PasswordResetCode.objects.filter(user=user, code=code, is_used=False, expires_at__gte=now).first()
        if not reset_code:
            return JsonResponse({'error': 'Código inválido o expirado.'}, status=400)
        return JsonResponse({'message': 'Código válido.'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def password_reset_confirm(request):
    """Cambiar contraseña usando el código de recuperación."""
    try:
        data = json.loads(request.body)
        email = data.get('email')
        code = data.get('code')
        new_password = data.get('new_password')
        if not email or not code or not new_password:
            return JsonResponse({'error': 'Correo, código y nueva contraseña son requeridos.'}, status=400)
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return JsonResponse({'error': 'No existe usuario con ese correo.'}, status=404)
        now = timezone.now()
        reset_code = PasswordResetCode.objects.filter(user=user, code=code, is_used=False, expires_at__gte=now).first()
        if not reset_code:
            return JsonResponse({'error': 'Código inválido o expirado.'}, status=400)
        user.set_password(new_password)
        user.save()
        reset_code.is_used = True
        reset_code.save()
        return JsonResponse({'message': 'Contraseña cambiada exitosamente.'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500) 