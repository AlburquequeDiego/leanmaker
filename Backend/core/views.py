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
from projects.models import Proyecto
from django.db.models import F

def home(request):
    """Vista principal de la aplicación."""
    from django.db import connection
    from django.db.utils import OperationalError
    
    # Verificar estado de la base de datos
    db_status = "✅ Conectado"
    try:
        connection.ensure_connection()
    except OperationalError:
        db_status = "❌ Error de conexión"
    
    # Obtener estadísticas básicas
    try:
        total_users = User.objects.count()
        total_projects = Proyecto.objects.count()
    except:
        total_users = 0
        total_projects = 0
    
    html_content = f"""
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>LeanMaker Backend - Estado del Sistema</title>
        <style>
            * {{
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }}
            
            body {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }}
            
            .container {{
                background: white;
                border-radius: 20px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                padding: 40px;
                max-width: 800px;
                width: 100%;
                text-align: center;
            }}
            
            .header {{
                margin-bottom: 30px;
            }}
            
            .logo {{
                font-size: 2.5rem;
                font-weight: bold;
                color: #667eea;
                margin-bottom: 10px;
            }}
            
            .subtitle {{
                color: #666;
                font-size: 1.1rem;
                margin-bottom: 20px;
            }}
            
            .status-grid {{
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }}
            
            .status-card {{
                background: #f8f9fa;
                padding: 20px;
                border-radius: 15px;
                border-left: 4px solid #667eea;
            }}
            
            .status-title {{
                font-weight: bold;
                color: #333;
                margin-bottom: 10px;
            }}
            
            .status-value {{
                font-size: 1.2rem;
                color: #667eea;
            }}
            
            .endpoints {{
                background: #f8f9fa;
                padding: 25px;
                border-radius: 15px;
                margin-bottom: 20px;
            }}
            
            .endpoints h3 {{
                color: #333;
                margin-bottom: 15px;
            }}
            
            .endpoint-list {{
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 10px;
            }}
            
            .endpoint {{
                background: white;
                padding: 12px;
                border-radius: 8px;
                border: 1px solid #e9ecef;
                font-family: 'Courier New', monospace;
                font-size: 0.9rem;
                color: #495057;
            }}
            
            .footer {{
                color: #666;
                font-size: 0.9rem;
                margin-top: 20px;
            }}
            
            .pulse {{
                animation: pulse 2s infinite;
            }}
            
            @keyframes pulse {{
                0% {{ opacity: 1; }}
                50% {{ opacity: 0.7; }}
                100% {{ opacity: 1; }}
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🚀 LeanMaker</div>
                <div class="subtitle">Backend API - Sistema de Vinculación Estudiantil</div>
            </div>
            
            <div class="status-grid">
                <div class="status-card">
                    <div class="status-title">Estado del Servidor</div>
                    <div class="status-value pulse">✅ Funcionando</div>
                </div>
                <div class="status-card">
                    <div class="status-title">Base de Datos</div>
                    <div class="status-value">{db_status}</div>
                </div>
                <div class="status-card">
                    <div class="status-title">Usuarios Registrados</div>
                    <div class="status-value">{total_users}</div>
                </div>
                <div class="status-card">
                    <div class="status-title">Proyectos Activos</div>
                    <div class="status-value">{total_projects}</div>
                </div>
            </div>
            
            <div class="endpoints">
                <h3>📡 Endpoints Disponibles</h3>
                <div class="endpoint-list">
                    <div class="endpoint">GET /api/health-simple/</div>
                    <div class="endpoint">POST /api/token/</div>
                    <div class="endpoint">GET /api/users/</div>
                    <div class="endpoint">GET /api/projects/</div>
                    <div class="endpoint">GET /api/dashboard/</div>
                    <div class="endpoint">POST /api/login/</div>
                </div>
            </div>
            
            <div class="footer">
                <p>Versión 1.0.0 | Desarrollado con Django y Python</p>
                <p>🕐 Última verificación: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    from django.http import HttpResponse
    return HttpResponse(html_content, content_type='text/html')

def login_view(request):
    """Vista de login tradicional."""
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')
        user = authenticate(request, username=email, password=password)
        if user is not None:
            login(request, user)
            return redirect('dashboard')
        else:
            messages.error(request, 'Credenciales inválidas')
    return render(request, 'login.html')

def logout_view(request):
    """Vista de logout."""
    logout(request)
    return redirect('home')

def register_view(request):
    """Vista de registro tradicional."""
    if request.method == 'POST':
        # Lógica de registro
        pass
    return render(request, 'register.html')

@login_required
def dashboard(request):
    """Vista del dashboard principal."""
    return render(request, 'dashboard.html')

def api_dashboard(request):
    """API endpoint para dashboard."""
    return JsonResponse({
        'message': 'Dashboard API endpoint',
        'status': 'available'
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
        except Exception as e:
            print(f"Error obteniendo perfil de estudiante: {e}")
            return JsonResponse({
                'error': 'Perfil de estudiante no encontrado',
                'details': str(e)
            }, status=404)
        
        # Obtener estadísticas básicas
        try:
            total_applications = Aplicacion.objects.filter(student=student).count()
            pending_applications = Aplicacion.objects.filter(student=student, status='pending').count()
            accepted_applications = Aplicacion.objects.filter(student=student, status='accepted').count()
            
            # Obtener proyectos del estudiante a través de aplicaciones aceptadas
            accepted_applications_objs = Aplicacion.objects.filter(student=student, status='accepted')
            student_projects = Proyecto.objects.filter(application_project__in=accepted_applications_objs)
            total_projects = student_projects.count()
            active_projects = student_projects.filter(status__name='active').count()
            
            # Calcular proyectos disponibles (proyectos abiertos, no postulados, cumple nivel API)
            open_projects = Proyecto.objects.filter(status__name='open')
            applied_project_ids = Aplicacion.objects.filter(student=student).values_list('project_id', flat=True)
            available_projects = open_projects.exclude(id__in=applied_project_ids).filter(
                min_api_level__lte=student.api_level
            ).count()
        except Exception as e:
            print(f"Error calculando estadísticas: {e}")
            return JsonResponse({
                'error': 'Error calculando estadísticas',
                'details': str(e)
            }, status=500)
        
        # Preparar respuesta
        response_data = {
            'total_applications': total_applications,
            'pending_applications': pending_applications,
            'accepted_applications': accepted_applications,
            'total_projects': total_projects,
            'active_projects': active_projects,
            'total_hours': student.total_hours,
            'strikes': student.strikes,
            'gpa': float(student.gpa),
            'available_projects': available_projects,
            'recent_activity': []  # Placeholder para actividad reciente
        }
        
        print(f"✅ Datos del dashboard de estudiante: {response_data}")
        return JsonResponse(response_data)
        
    except Exception as e:
        import traceback
        print(f"❌ Error general en api_dashboard_student_stats: {e}")
        traceback.print_exc()
        return JsonResponse({
            'error': str(e),
            'traceback': traceback.format_exc()
        }, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def api_dashboard_admin_stats(request):
    """API endpoint para estadísticas del dashboard de administrador."""
    import traceback
    try:
        print("🔍 [ADMIN DASHBOARD] Iniciando consulta de estadísticas...")
        
        # Verificar token de autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            print("❌ [ADMIN DASHBOARD] Token de autenticación requerido")
            return JsonResponse({
                'error': 'Token de autenticación requerido'
            }, status=401)
        
        token = auth_header.split(' ')[1]
        user = verify_token(token)
        
        if not user:
            print("❌ [ADMIN DASHBOARD] Token inválido")
            return JsonResponse({
                'error': 'Token inválido'
            }, status=401)
        
        if user.role != 'admin':
            print(f"❌ [ADMIN DASHBOARD] Acceso denegado para rol: {user.role}")
            return JsonResponse({
                'error': 'Acceso denegado. Solo administradores pueden acceder a este endpoint.'
            }, status=403)
        
        print(f"✅ [ADMIN DASHBOARD] Usuario autenticado: {user.email} (rol: {user.role})")
        
        # Importar modelos necesarios
        from users.models import User
        from projects.models import Proyecto
        from companies.models import Empresa
        from students.models import Estudiante
        from applications.models import Aplicacion
        from strikes.models import Strike
        
        # Obtener estadísticas básicas con logs detallados
        print("📊 [ADMIN DASHBOARD] Consultando estadísticas...")
        
        total_users = User.objects.count()
        print(f"👥 [ADMIN DASHBOARD] Total usuarios: {total_users}")
        
        total_companies = Empresa.objects.count()
        print(f"🏢 [ADMIN DASHBOARD] Total empresas: {total_companies}")
        
        total_students = Estudiante.objects.count()
        print(f"🎓 [ADMIN DASHBOARD] Total estudiantes: {total_students}")
        
        total_projects = Proyecto.objects.count()
        print(f"💼 [ADMIN DASHBOARD] Total proyectos: {total_projects}")
        
        # Obtener aplicaciones pendientes
        pending_applications = Aplicacion.objects.filter(status='pending').count()
        print(f"📝 [ADMIN DASHBOARD] Aplicaciones pendientes: {pending_applications}")
        
        # Obtener alertas de strikes (strikes activos)
        strikes_alerts = Strike.objects.filter(is_active=True).count()
        print(f"⚠️ [ADMIN DASHBOARD] Alertas de strikes: {strikes_alerts}")
        
        # Preparar respuesta
        response_data = {
            'total_users': total_users,
            'total_companies': total_companies,
            'total_students': total_students,
            'total_projects': total_projects,
            'pending_applications': pending_applications,
            'strikes_alerts': strikes_alerts,
            'recent_activity': []  # Placeholder para actividad reciente
        }
        
        print(f"✅ [ADMIN DASHBOARD] Datos preparados: {response_data}")
        return JsonResponse(response_data)
        
    except Exception as e:
        print(f"❌ [ADMIN DASHBOARD] Error: {str(e)}")
        print(f"❌ [ADMIN DASHBOARD] Traceback: {traceback.format_exc()}")
        return JsonResponse({
            'error': str(e),
            'traceback': traceback.format_exc()
        }, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def api_test_admin_stats(request):
    """Endpoint de prueba para verificar estadísticas del admin sin autenticación."""
    try:
        print("🔍 [TEST ADMIN STATS] Verificando datos reales de la base de datos...")
        
        # Importar modelos necesarios
        from users.models import User
        from projects.models import Proyecto
        from companies.models import Empresa
        from students.models import Estudiante
        from applications.models import Aplicacion
        from strikes.models import Strike
        
        # Obtener estadísticas básicas
        total_users = User.objects.count()
        total_companies = Empresa.objects.count()
        total_students = Estudiante.objects.count()
        total_projects = Proyecto.objects.count()
        pending_applications = Aplicacion.objects.filter(status='pending').count()
        strikes_alerts = Strike.objects.filter(is_active=True).count()
        
        # Obtener algunos ejemplos de datos
        sample_users = list(User.objects.values('id', 'email', 'role')[:5])
        sample_companies = list(Empresa.objects.values('id', 'company_name')[:5])
        sample_students = list(Estudiante.objects.values('id', 'user__email')[:5])
        sample_projects = list(Proyecto.objects.values('id', 'title')[:5])
        
        response_data = {
            'total_users': total_users,
            'total_companies': total_companies,
            'total_students': total_students,
            'total_projects': total_projects,
            'pending_applications': pending_applications,
            'strikes_alerts': strikes_alerts,
            'sample_data': {
                'users': sample_users,
                'companies': sample_companies,
                'students': sample_students,
                'projects': sample_projects
            }
        }
        
        print(f"✅ [TEST ADMIN STATS] Datos reales encontrados: {response_data}")
        return JsonResponse(response_data)
        
    except Exception as e:
        import traceback
        print(f"❌ [TEST ADMIN STATS] Error: {str(e)}")
        print(f"❌ [TEST ADMIN STATS] Traceback: {traceback.format_exc()}")
        return JsonResponse({
            'error': str(e),
            'traceback': traceback.format_exc()
        }, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def api_test_auth_admin_stats(request):
    """Endpoint de prueba para verificar estadísticas del admin CON autenticación."""
    try:
        print("🔍 [TEST AUTH ADMIN STATS] Verificando autenticación y datos...")
        
        # Verificar token de autenticación
        auth_header = request.headers.get('Authorization')
        print(f"🔍 [TEST AUTH ADMIN STATS] Auth header: {auth_header}")
        
        if not auth_header or not auth_header.startswith('Bearer '):
            print("❌ [TEST AUTH ADMIN STATS] Token de autenticación requerido")
            return JsonResponse({
                'error': 'Token de autenticación requerido',
                'auth_header': auth_header
            }, status=401)
        
        token = auth_header.split(' ')[1]
        print(f"🔍 [TEST AUTH ADMIN STATS] Token: {token[:20]}...")
        
        user = verify_token(token)
        print(f"🔍 [TEST AUTH ADMIN STATS] User: {user}")
        
        if not user:
            print("❌ [TEST AUTH ADMIN STATS] Token inválido")
            return JsonResponse({
                'error': 'Token inválido'
            }, status=401)
        
        print(f"✅ [TEST AUTH ADMIN STATS] Usuario autenticado: {user.email} (rol: {user.role})")
        
        if user.role != 'admin':
            print(f"❌ [TEST AUTH ADMIN STATS] Acceso denegado para rol: {user.role}")
            return JsonResponse({
                'error': 'Acceso denegado. Solo administradores pueden acceder a este endpoint.',
                'user_role': user.role
            }, status=403)
        
        # Importar modelos necesarios
        from users.models import User
        from projects.models import Proyecto
        from companies.models import Empresa
        from students.models import Estudiante
        from applications.models import Aplicacion
        from strikes.models import Strike
        
        # Obtener estadísticas básicas
        total_users = User.objects.count()
        total_companies = Empresa.objects.count()
        total_students = Estudiante.objects.count()
        total_projects = Proyecto.objects.count()
        pending_applications = Aplicacion.objects.filter(status='pending').count()
        strikes_alerts = Strike.objects.filter(is_active=True).count()
        
        response_data = {
            'total_users': total_users,
            'total_companies': total_companies,
            'total_students': total_students,
            'total_projects': total_projects,
            'pending_applications': pending_applications,
            'strikes_alerts': strikes_alerts,
            'user_info': {
                'email': user.email,
                'role': user.role,
                'id': str(user.id)
            }
        }
        
        print(f"✅ [TEST AUTH ADMIN STATS] Datos autenticados: {response_data}")
        return JsonResponse(response_data)
        
    except Exception as e:
        import traceback
        print(f"❌ [TEST AUTH ADMIN STATS] Error: {str(e)}")
        print(f"❌ [TEST AUTH ADMIN STATS] Traceback: {traceback.format_exc()}")
        return JsonResponse({
            'error': str(e),
            'traceback': traceback.format_exc()
        }, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def api_test_projects(request):
    try:
        projects = Proyecto.objects.select_related('status').annotate(
            status_name=F('status__name')
        ).values(
            'id', 'title', 'description', 'max_students', 'current_students',
            'created_at', 'updated_at', 'status_id', 'status_name'
        )[:10]
        projects_data = []
        for project in projects:
            projects_data.append({
                'id': str(project['id']),
                'title': project['title'],
                'description': project['description'],
                'max_students': project['max_students'],
                'current_students': project['current_students'],
                'created_at': project['created_at'].isoformat() if project['created_at'] else None,
                'updated_at': project['updated_at'].isoformat() if project['updated_at'] else None,
                'status_id': project['status_id'],
                'status': project['status_name'],
            })
        return JsonResponse({'results': projects_data, 'count': len(projects_data)})
    except Exception as e:
        print(f"Error en api_test_projects: {e}")
        return JsonResponse({'error': str(e)}, status=500)

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