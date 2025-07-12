"""
Core views for LeanMaker Backend - Django Puro + TypeScript.
"""

from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from users.models import User
import json
from datetime import datetime, timedelta
import jwt
from django.conf import settings
from companies.serializers import EmpresaSerializer

def home(request):
    """Vista principal de la aplicación."""
    return JsonResponse({
        'message': 'LeanMaker Backend API',
        'version': '1.0.0',
        'status': 'running',
        'endpoints': {
            'health': '/api/health-simple/',
            'auth': '/api/token/',
            'users': '/api/users/',
            'projects': '/api/projects/',
            'dashboard': '/api/dashboard/'
        }
    })

def health_check(request):
    """Endpoint de verificación de salud del sistema."""
    return JsonResponse({
        'status': 'healthy',
        'message': 'LeanMaker Backend funcionando correctamente'
    })

# API endpoints para el frontend React + TypeScript
@csrf_exempt
@require_http_methods(["POST"])
def api_login(request):
    """API endpoint para login desde React."""
    try:
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return JsonResponse({
                'error': 'Email y contraseña son requeridos'
            }, status=400)
        
        # Buscar usuario por email
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return JsonResponse({
                'error': 'Usuario no encontrado'
            }, status=404)
        
        # Autenticar usuario (usar email ya que es el USERNAME_FIELD)
        user = authenticate(request, username=user.email, password=password)
        
        if user is not None:
            # Generar tokens JWT
            access_token = generate_access_token(user)
            refresh_token = generate_refresh_token(user)
            
            # Hacer login en la sesión
            login(request, user)
            
            return JsonResponse({
                'access': access_token,
                'refresh': refresh_token,
                'user': {
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
                    'full_name': user.full_name
                }
            })
        else:
            return JsonResponse({
                'error': 'Credenciales inválidas'
            }, status=400)
            
    except json.JSONDecodeError:
        return JsonResponse({
            'error': 'JSON inválido'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'error': str(e)
        }, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def api_register(request):
    """API endpoint para registro desde React."""
    try:
        data = json.loads(request.body)
        
        # Validar campos requeridos
        required_fields = ['email', 'password', 'password_confirm', 'first_name', 'last_name', 'role']
        for field in required_fields:
            if not data.get(field):
                return JsonResponse({
                    'error': f'El campo {field} es requerido'
                }, status=400)
        
        email = data.get('email')
        password = data.get('password')
        password_confirm = data.get('password_confirm')
        first_name = data.get('first_name')
        last_name = data.get('last_name')
        role = data.get('role')
        
        # Validar contraseñas
        if password != password_confirm:
            return JsonResponse({
                'error': 'Las contraseñas no coinciden'
            }, status=400)
        
        # Verificar si el email ya existe
        if User.objects.filter(email=email).exists():
            return JsonResponse({
                'error': 'El email ya está registrado'
            }, status=400)
        
        # Crear usuario
        username = email.split('@')[0]  # Usar parte del email como username
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            role=role
        )
        
        return JsonResponse({
            'message': 'Usuario registrado exitosamente',
            'user': {
                'id': str(user.id),
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'username': user.username,
                'role': user.role,
                'is_verified': user.is_verified,
                'full_name': user.full_name
            }
        })
        
    except json.JSONDecodeError:
        return JsonResponse({
            'error': 'JSON inválido'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'error': str(e)
        }, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def api_logout(request):
    """API endpoint para logout desde React."""
    try:
        logout(request)
        return JsonResponse({
            'message': 'Sesión cerrada exitosamente'
        })
    except Exception as e:
        return JsonResponse({
            'error': str(e)
        }, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def api_user_profile(request):
    """API endpoint para obtener perfil de usuario."""
    try:
        # Verificar token de autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({
                'error': 'Token de autenticación requerido'
            }, status=401)
        
        token = auth_header.split(' ')[1]
        user = verify_token(token)
        
        if not user:
            return JsonResponse({
                'error': 'Token inválido'
            }, status=401)
        
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
            'full_name': user.full_name
        }
        # Si es empresa, agregar perfil de empresa
        if user.role == 'company':
            try:
                empresa = user.empresa_profile
                user_data['company_profile'] = EmpresaSerializer.to_dict(empresa)
            except Exception:
                user_data['company_profile'] = None
        return JsonResponse(user_data)
    except Exception as e:
        return JsonResponse({
            'error': str(e)
        }, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def api_refresh_token(request):
    """API endpoint para refrescar token."""
    try:
        data = json.loads(request.body)
        refresh_token = data.get('refresh')
        
        if not refresh_token:
            return JsonResponse({
                'error': 'Refresh token requerido'
            }, status=400)
        
        # Verificar refresh token
        user = verify_refresh_token(refresh_token)
        
        if not user:
            return JsonResponse({
                'error': 'Refresh token inválido'
            }, status=401)
        
        # Generar nuevo access token
        access_token = generate_access_token(user)
        
        return JsonResponse({
            'access': access_token
        })
        
    except json.JSONDecodeError:
        return JsonResponse({
            'error': 'JSON inválido'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'error': str(e)
        }, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def api_verify_token(request):
    """API endpoint para verificar token."""
    try:
        data = json.loads(request.body)
        token = data.get('token')
        
        if not token:
            return JsonResponse({
                'error': 'Token requerido'
            }, status=400)
        
        user = verify_token(token)
        
        if user:
            return JsonResponse({
                'valid': True,
                'user': {
                    'id': str(user.id),
                    'email': user.email,
                    'role': user.role
                }
            })
        else:
            return JsonResponse({
                'valid': False
            })
            
    except json.JSONDecodeError:
        return JsonResponse({
            'error': 'JSON inválido'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'error': str(e)
        }, status=500)

# Dashboard endpoints
@csrf_exempt
@require_http_methods(["GET"])
def api_dashboard_company_stats(request):
    """API endpoint para estadísticas del dashboard de empresa."""
    import traceback  # <--- Agregado para depuración
    try:
        # Verificar token de autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({
                'error': 'Token de autenticación requerido'
            }, status=401)
        
        token = auth_header.split(' ')[1]
        user = verify_token(token)
        
        if not user:
            return JsonResponse({
                'error': 'Token inválido'
            }, status=401)
        
        if user.role != 'company':
            return JsonResponse({
                'error': 'Acceso denegado. Solo empresas pueden acceder a este endpoint.'
            }, status=403)
        
        # Importar modelos necesarios
        from projects.models import Proyecto
        from applications.models import Aplicacion
        from students.models import Estudiante
        
        # Obtener la empresa del usuario
        try:
            company = user.empresa_profile
        except Exception as e:
            print('❌ Error obteniendo empresa_profile:', e)
            traceback.print_exc()
            return JsonResponse({
                'error': 'Perfil de empresa no encontrado',
                'exception': str(e)
            }, status=404)
        
        # Obtener estadísticas básicas
        try:
            total_projects = Proyecto.objects.filter(company=company).count()
            # Simplificar la consulta de proyectos activos
            active_projects = Proyecto.objects.filter(company=company).count()  # Por ahora, todos los proyectos
            total_applications = Aplicacion.objects.filter(project__company=company).count()
            pending_applications = Aplicacion.objects.filter(project__company=company, status='pending').count()
            
            # Calcular estadísticas adicionales
            completed_projects = Proyecto.objects.filter(company=company, status__name='completed').count()
            active_students = Aplicacion.objects.filter(project__company=company, status='accepted').count()
            
            # Rating promedio (placeholder)
            rating = 4.5  # Por ahora un valor fijo
            
            # Horas totales (placeholder)
            total_hours_offered = 0  # Por ahora 0
            
            # Proyectos este mes (placeholder)
            projects_this_month = 0  # Por ahora 0
            
            # Aplicaciones este mes (placeholder)
            applications_this_month = 0  # Por ahora 0
            
        except Exception as e:
            print('❌ Error calculando estadísticas:', e)
            traceback.print_exc()
            return JsonResponse({
                'error': 'Error calculando estadísticas',
                'exception': str(e)
            }, status=500)
        
        # Agregar log para depuración
        response_data = {
            'total_projects': total_projects,
            'active_projects': active_projects,
            'total_applications': total_applications,
            'pending_applications': pending_applications,
            'completed_projects': completed_projects,
            'active_students': active_students,
            'rating': rating,
            'total_hours_offered': total_hours_offered,
            'projects_this_month': projects_this_month,
            'applications_this_month': applications_this_month,
            'recent_activity': []
        }
        print('✅ Datos del dashboard:', response_data)
        return JsonResponse(response_data)
        
    except Exception as e:
        import traceback
        print('❌ Error general en api_dashboard_company_stats:', e)
        traceback.print_exc()
        return JsonResponse({
            'error': str(e),
            'traceback': traceback.format_exc()
        }, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def api_dashboard_student_stats(request):
    """API endpoint para estadísticas del dashboard de estudiante."""
    try:
        # Verificar token de autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({
                'error': 'Token de autenticación requerido'
            }, status=401)
        
        token = auth_header.split(' ')[1]
        user = verify_token(token)
        
        if not user:
            return JsonResponse({
                'error': 'Token inválido'
            }, status=401)
        
        if user.role != 'student':
            return JsonResponse({
                'error': 'Acceso denegado. Solo estudiantes pueden acceder a este endpoint.'
            }, status=403)
        
        # Importar modelos necesarios
        from applications.models import Aplicacion
        from projects.models import Proyecto
        
        # Obtener el perfil de estudiante del usuario
        try:
            student = user.estudiante_profile
        except:
            return JsonResponse({
                'error': 'Perfil de estudiante no encontrado'
            }, status=404)
        
        # Obtener estadísticas básicas
        total_applications = Aplicacion.objects.filter(student=student).count()
        pending_applications = Aplicacion.objects.filter(student=student, status='pending').count()
        accepted_applications = Aplicacion.objects.filter(student=student, status='accepted').count()
        
        return JsonResponse({
            'total_applications': total_applications,
            'pending_applications': pending_applications,
            'accepted_applications': accepted_applications,
            'recent_activity': []  # Placeholder para actividad reciente
        })
        
    except Exception as e:
        return JsonResponse({
            'error': str(e)
        }, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def api_dashboard_admin_stats(request):
    """API endpoint para estadísticas del dashboard de administrador."""
    try:
        # Verificar token de autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({
                'error': 'Token de autenticación requerido'
            }, status=401)
        
        token = auth_header.split(' ')[1]
        user = verify_token(token)
        
        if not user:
            return JsonResponse({
                'error': 'Token inválido'
            }, status=401)
        
        if user.role != 'admin':
            return JsonResponse({
                'error': 'Acceso denegado. Solo administradores pueden acceder a este endpoint.'
            }, status=403)
        
        # Importar modelos necesarios
        from users.models import User
        from projects.models import Proyecto
        from companies.models import Empresa
        from students.models import Estudiante
        
        # Obtener estadísticas básicas
        total_users = User.objects.count()
        total_companies = Empresa.objects.count()
        total_students = Estudiante.objects.count()
        total_projects = Proyecto.objects.count()
        
        return JsonResponse({
            'total_users': total_users,
            'total_companies': total_companies,
            'total_students': total_students,
            'total_projects': total_projects,
            'recent_activity': []  # Placeholder para actividad reciente
        })
        
    except Exception as e:
        return JsonResponse({
            'error': str(e)
        }, status=500)

# Funciones auxiliares para JWT
def generate_access_token(user):
    """Generar token de acceso JWT."""
    payload = {
        'user_id': str(user.id),  # Mantener como string para UUIDs
        'email': user.email,
        'role': user.role,
        'exp': datetime.utcnow() + timedelta(hours=settings.JWT_ACCESS_TOKEN_EXPIRE_HOURS),
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

def generate_refresh_token(user):
    """Generar token de refresco JWT."""
    payload = {
        'user_id': str(user.id),  # Mantener como string para UUIDs
        'exp': datetime.utcnow() + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS),
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

def verify_token(token):
    """Verificar token JWT."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        user_id = payload.get('user_id')
        if user_id:
            return User.objects.get(id=user_id)
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, User.DoesNotExist):
        pass
    return None

def verify_refresh_token(token):
    """Verificar refresh token JWT."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        user_id = payload.get('user_id')
        if user_id:
            return User.objects.get(id=user_id)
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, User.DoesNotExist):
        pass
    return None 