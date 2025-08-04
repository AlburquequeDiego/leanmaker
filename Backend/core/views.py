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
from django.utils import timezone

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
        
        # Obtener empresas registradas
        from companies.models import Empresa
        total_companies = Empresa.objects.count()
        
        # Obtener estudiantes activos (usuarios con rol 'student')
        active_students = User.objects.filter(role='student', is_active=True).count()
        
        # Combinar empresas y estudiantes en una métrica
        ecosystem_total = total_companies + active_students
        
    except:
        total_users = 0
        total_projects = 0
        total_companies = 0
        active_students = 0
        ecosystem_total = 0
    
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
            
            .status-subtitle {{
                font-size: 0.8rem;
                color: #666;
                margin-top: 5px;
                font-style: italic;
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
                    <div class="status-title">Ecosistema Activo</div>
                    <div class="status-value">{ecosystem_total}</div>
                    <div class="status-subtitle">Empresas + Estudiantes</div>
                </div>
                <div class="status-card">
                    <div class="status-title">Proyectos Activos</div>
                    <div class="status-value">{total_projects}</div>
                </div>
                <div class="status-card">
                    <div class="status-title">Estudiantes Activos</div>
                    <div class="status-value">{active_students}</div>
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
        
        # Buscar usuario por email o company_email
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Si no encuentra por email personal, buscar por company_email
            try:
                from companies.models import Empresa
                empresa = Empresa.objects.get(company_email=email)
                user = empresa.user
            except Empresa.DoesNotExist:
                return JsonResponse({
                    'error': 'Usuario no encontrado'
                }, status=404)
        
        # Autenticar usuario (usar el email del usuario, no el email de entrada)
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
                    'position': user.position,
                    'department': user.department,
                    'birthdate': user.birthdate.isoformat() if user.birthdate else None,
                    'gender': user.gender,
                    'career': user.career,
                    'company_name': user.company_name,
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
        
        # DEBUG: Log datos clave recibidos
        print(f"[api_register] birthdate: {data.get('birthdate')}, gender: {data.get('gender')}, education_level: {data.get('education_level')}, university: {data.get('university')}")
        print(f"[api_register] Campos específicos de empresa:")
        print(f"  - personality: {data.get('personality')}")
        print(f"  - rut: {data.get('rut')}")
        print(f"  - business_name: {data.get('business_name')}")
        print(f"  - company_address: {data.get('company_address')}")
        print(f"  - company_phone: {data.get('company_phone')}")
        print(f"  - company_email: {data.get('company_email')}")
        
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
        
        # Validación específica para dominio de INACAP
        if email and '@' in email:
            domain = email.split('@')[1].lower()
            if domain == 'inacap.cl':
                return JsonResponse({
                    'error': 'El dominio @inacap.cl no está permitido. Use @inacapmail.cl en su lugar.'
                }, status=400)
        
        # Crear usuario
        username = email.split('@')[0]  # Usar parte del email como username
        
        # Procesar fecha de nacimiento
        birthdate = None
        if data.get('birthdate'):
            try:
                from datetime import datetime
                birthdate = datetime.strptime(data.get('birthdate'), '%Y-%m-%d').date()
            except Exception as e:
                print(f"[api_register] Error procesando birthdate: {e}")
                birthdate = None
        
        print(f"[api_register] Creando usuario con birthdate: {birthdate}, gender: {data.get('gender', '')}")
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            role=role,
            phone=data.get('phone', ''),
            career=data.get('career', ''),
            company_name=data.get('company_name', ''),
            birthdate=birthdate,
            gender=data.get('gender', ''),
        )
        print(f"[api_register] Usuario creado - birthdate: {user.birthdate}, gender: {user.gender}")
        
        # Crear perfil específico según el rol
        if role == 'student':
            from students.models import Estudiante
            print(f"[api_register] Creando estudiante con university: {data.get('university', '')}, education_level: {data.get('education_level', '')}")
            estudiante = Estudiante.objects.create(
                user=user,
                career=data.get('career', ''),
                university=data.get('university', ''),
                education_level=data.get('education_level', ''),
            )
            print(f"[api_register] Estudiante creado - university: {estudiante.university}, education_level: {estudiante.education_level}")
            
            # Actualizar TRL automáticamente
            estudiante.actualizar_trl_segun_api()
            
            # Crear perfil detallado del estudiante
            from students.models import PerfilEstudiante
            print(f"[api_register] Creando perfil detallado con fecha_nacimiento: {birthdate}, genero: {data.get('gender', '')}, universidad: {data.get('university', '')}")
            perfil = PerfilEstudiante.objects.create(
                estudiante=estudiante,
                fecha_nacimiento=birthdate,
                genero=data.get('gender', ''),
                universidad=data.get('university', ''),
            )
            print(f"[api_register] Perfil detallado creado - fecha_nacimiento: {perfil.fecha_nacimiento}, genero: {perfil.genero}, universidad: {perfil.universidad}")
            
        elif role == 'company':
            from companies.models import Empresa
            print(f"[api_register] Creando empresa con company_name: {data.get('company_name', '')}, rut: {data.get('rut', '')}, personality: {data.get('personality', '')}")
            empresa = Empresa.objects.create(
                user=user,
                company_name=data.get('company_name', ''),
                rut=data.get('rut', ''),
                personality=data.get('personality', ''),
                business_name=data.get('business_name', ''),
                company_address=data.get('company_address', ''),
                company_phone=data.get('company_phone', ''),
                company_email=data.get('company_email', ''),
                industry=data.get('industry', ''),
                size=data.get('size', ''),
                website=data.get('website', ''),
                address=data.get('address', ''),
                city=data.get('city', ''),
                country=data.get('country', 'Chile'),
            )
            print(f"[api_register] Empresa creada - company_name: {empresa.company_name}, rut: {empresa.rut}, personality: {empresa.personality}")
            print(f"[api_register] Empresa creada - company_address: {empresa.company_address}, company_phone: {empresa.company_phone}, company_email: {empresa.company_email}")
            print(f"[api_register] Empresa creada - business_name: {empresa.business_name}, industry: {empresa.industry}, size: {empresa.size}")
            print(f"[api_register] Empresa creada - website: {empresa.website}, city: {empresa.city}, country: {empresa.country}")
            print(f"[api_register] Usuario de empresa - birthdate: {user.birthdate}, gender: {user.gender}")
            print(f"[api_register] Verificando datos guardados en la base de datos:")
            print(f"  - empresa.personality: {empresa.personality}")
            print(f"  - user.birthdate: {user.birthdate}")
            print(f"  - user.gender: {user.gender}")
        
        # Preparar respuesta con datos del usuario creado
        response_data = {
            'message': 'Usuario registrado exitosamente',
            'user': {
                'id': str(user.id),
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'username': user.username,
                'role': user.role,
                'phone': user.phone,
                'birthdate': user.birthdate.isoformat() if user.birthdate else None,
                'gender': user.gender,
                'career': user.career,
                'company_name': user.company_name,
                'is_active': user.is_active,
                'is_verified': user.is_verified,
                'full_name': user.full_name,
            }
        }
        
        # Agregar datos específicos según el rol
        if role == 'student':
            response_data['student'] = {
                'id': str(estudiante.id),
                'career': estudiante.career,
                'university': estudiante.university,
                'education_level': estudiante.education_level,
                'status': estudiante.status,
                'api_level': estudiante.api_level,
                'trl_level': estudiante.trl_level,
            }
        elif role == 'company':
            response_data['company'] = {
                'id': str(empresa.id),
                'company_name': empresa.company_name,
                'rut': empresa.rut,
                'personality': empresa.personality,
                'business_name': empresa.business_name,
                'company_address': empresa.company_address,
                'company_phone': empresa.company_phone,
                'company_email': empresa.company_email,
                'industry': empresa.industry,
                'size': empresa.size,
                'website': empresa.website,
                'city': empresa.city,
                'country': empresa.country,
            }
        
        return JsonResponse(response_data, status=201)
        
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
@require_http_methods(["GET", "PATCH"])
def api_user_profile(request):
    """API endpoint para obtener y actualizar perfil de usuario."""
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
                'position': user.position,
                'department': user.department,
                'birthdate': user.birthdate.isoformat() if user.birthdate else None,
                'gender': user.gender,
                'career': user.career,
                'company_name': user.company_name,
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
            # Si el usuario es empresa, incluir el perfil de empresa
            if user.role == "company":
                try:
                    from companies.models import Empresa
                    from companies.serializers import EmpresaSerializer
                    empresa = getattr(user, 'empresa_profile', None)
                    if not empresa:
                        # Crear empresa dummy si no existe
                        empresa = Empresa.objects.create(
                            user=user,
                            company_name=f"Empresa de {user.full_name or user.email}",
                            verified=False,
                            rating=0,
                            total_projects=0,
                            projects_completed=0,
                            total_hours_offered=0,
                            status='active',
                        )
                        user.empresa_profile = empresa
                        user.save()
                    # Validar que la empresa tiene id
                    empresa_dict = EmpresaSerializer.to_dict(empresa)
                    if not empresa_dict.get('id'):
                        return JsonResponse({
                            'error': 'No se pudo asociar un perfil de empresa válido a este usuario.'
                        }, status=500)
                    user_data["company_profile"] = empresa_dict
                except Exception as e:
                    return JsonResponse({
                        'error': f'Error al asociar empresa: {str(e)}'
                    }, status=500)
            return JsonResponse(user_data)
        
        elif request.method == "PATCH":
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
            if 'position' in data:
                user.position = data['position']
            if 'department' in data:
                user.department = data['department']
            if 'birthdate' in data:
                try:
                    from datetime import datetime
                    user.birthdate = datetime.strptime(data['birthdate'], '%Y-%m-%d').date()
                except:
                    user.birthdate = None
            if 'gender' in data:
                user.gender = data['gender']
            if 'career' in data:
                user.career = data['career']
            if 'company_name' in data:
                user.company_name = data['company_name']
            
            print(f"[api_user_profile] Actualizando usuario - birthdate: {user.birthdate}, gender: {user.gender}")
            user.save()
            print(f"[api_user_profile] Usuario guardado - birthdate: {user.birthdate}, gender: {user.gender}")
            
            # Retornar datos actualizados
            user_data = {
                'id': str(user.id),
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'username': user.username,
                'phone': user.phone,
                'avatar': user.avatar,
                'bio': user.bio,
                'position': user.position,
                'department': user.department,
                'birthdate': user.birthdate.isoformat() if user.birthdate else None,
                'gender': user.gender,
                'career': user.career,
                'company_name': user.company_name,
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
            return JsonResponse(user_data)
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
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
        
        # Obtener estadísticas básicas con filtros correctos
        try:
            # Importar modelos adicionales necesarios
            from projects.models import MiembroProyecto
            from django.utils import timezone
            from datetime import datetime, timedelta
            
            # Log para depuración
            print(f'🔍 [COMPANY STATS] Calculando estadísticas para empresa: {company.company_name}')
            print(f'🔍 [COMPANY STATS] Usuario: {user.email}')
            
            # 1. Total de proyectos creados por esta empresa
            total_projects = Proyecto.objects.filter(company=company).count()
            print(f'📊 [COMPANY STATS] Total proyectos: {total_projects}')
            
            # 2. Proyectos activos (en desarrollo o publicados con estudiantes trabajando)
            # Proyectos con estado 'active' (en desarrollo)
            active_status_projects = Proyecto.objects.filter(
                company=company,
                status__name='active'
            ).count()
            
            # Proyectos con estado 'published' que tienen estudiantes aceptados
            published_with_students = Proyecto.objects.filter(
                company=company,
                status__name='published'
            ).filter(
                application_project__status__in=['accepted', 'active', 'completed']
            ).distinct().count()
            
            active_projects = active_status_projects + published_with_students
            print(f'📊 [COMPANY STATS] Proyectos activos: {active_projects} (active: {active_status_projects}, published con estudiantes: {published_with_students})')
            
            # 2.1. Proyectos publicados (separado de activos)
            published_projects = Proyecto.objects.filter(
                company=company,
                status__name='published'
            ).count()
            print(f'📊 [COMPANY STATS] Proyectos publicados: {published_projects}')
            
            # 3. Proyectos completados
            completed_projects = Proyecto.objects.filter(
                company=company, 
                status__name='completed'
            ).count()
            print(f'📊 [COMPANY STATS] Proyectos completados: {completed_projects}')
            
            # 4. Total de aplicaciones recibidas
            total_applications = Aplicacion.objects.filter(project__company=company).count()
            print(f'📊 [COMPANY STATS] Total aplicaciones: {total_applications}')
            
            # 5. Aplicaciones pendientes
            pending_applications = Aplicacion.objects.filter(
                project__company=company, 
                status='pending'
            ).count()
            print(f'📊 [COMPANY STATS] Aplicaciones pendientes: {pending_applications}')
            
            # 6. Estudiantes activos (estudiantes que están trabajando actualmente en proyectos)
            # Estudiantes con aplicaciones aceptadas, activas o completadas
            active_students = Aplicacion.objects.filter(
                project__company=company,
                status__in=['accepted', 'active', 'completed']
            ).values('student').distinct().count()
            print(f'📊 [COMPANY STATS] Estudiantes activos: {active_students}')
            
            # 7. Rating promedio de la empresa
            rating = float(company.rating) if company.rating else 0.0
            print(f'📊 [COMPANY STATS] Rating: {rating}')
            
            # 8. Calcular horas ofrecidas totales
            from django.db.models import Sum, F, Case, When, Value, IntegerField
            total_hours_offered = Proyecto.objects.filter(company=company).aggregate(
                total_hours=Sum(
                    Case(
                        When(required_hours__isnull=False, then=F('required_hours')),
                        default=F('hours_per_week') * F('duration_weeks'),
                        output_field=IntegerField()
                    )
                )
            )['total_hours'] or 0
            print(f'📊 [COMPANY STATS] Horas ofrecidas: {total_hours_offered}')
            
            # 9. Proyectos creados este mes
            first_day_month = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            projects_this_month = Proyecto.objects.filter(
                company=company,
                created_at__gte=first_day_month
            ).count()
            print(f'📊 [COMPANY STATS] Proyectos este mes: {projects_this_month}')
            
            # 10. Aplicaciones recibidas este mes
            applications_this_month = Aplicacion.objects.filter(
                project__company=company,
                applied_at__gte=first_day_month
            ).count()
            print(f'📊 [COMPANY STATS] Aplicaciones este mes: {applications_this_month}')
            
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
            'published_projects': published_projects,
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
        from projects.models import Proyecto, MiembroProyecto
        
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
            print(f"🔍 [STUDENT DASHBOARD] Calculando estadísticas para estudiante: {student.user.email}")
            
            total_applications = Aplicacion.objects.filter(student=student).count()
            print(f"📝 [STUDENT DASHBOARD] Total aplicaciones: {total_applications}")
            
            pending_applications = Aplicacion.objects.filter(student=student, status='pending').count()
            print(f"⏳ [STUDENT DASHBOARD] Aplicaciones pendientes: {pending_applications}")
            
            accepted_applications = Aplicacion.objects.filter(student=student, status='accepted').count()
            print(f"✅ [STUDENT DASHBOARD] Aplicaciones aceptadas: {accepted_applications}")
            
            # Obtener proyectos del estudiante a través de aplicaciones aceptadas
            accepted_applications_objs = Aplicacion.objects.filter(student=student, status='accepted')
            print(f"🔗 [STUDENT DASHBOARD] Objetos de aplicaciones aceptadas: {accepted_applications_objs.count()}")
            
            student_projects = Proyecto.objects.filter(application_project__in=accepted_applications_objs)
            print(f"💼 [STUDENT DASHBOARD] Proyectos del estudiante: {student_projects.count()}")
            
            # También obtener proyectos a través de membresías activas
            active_memberships = MiembroProyecto.objects.filter(usuario=user, esta_activo=True, rol='estudiante')
            projects_from_memberships = Proyecto.objects.filter(miembros__in=active_memberships)
            print(f"👥 [STUDENT DASHBOARD] Proyectos desde membresías: {projects_from_memberships.count()}")
            
            # Combinar ambos conjuntos de proyectos
            all_student_projects = (student_projects | projects_from_memberships).distinct()
            print(f"📊 [STUDENT DASHBOARD] Total proyectos únicos del estudiante: {all_student_projects.count()}")
            
            total_projects = all_student_projects.count()
            active_projects = all_student_projects.filter(status__name='active').count()
            print(f"🔄 [STUDENT DASHBOARD] Proyectos activos: {active_projects}")
            
            # Calcular proyectos disponibles (proyectos publicados, no postulados, cumple nivel API)
            published_projects = Proyecto.objects.filter(status__name='published')
            applied_project_ids = Aplicacion.objects.filter(student=student).values_list('project', flat=True)
            available_projects = published_projects.exclude(id__in=applied_project_ids).filter(
                min_api_level__lte=student.api_level
            ).count()
            print(f"📋 [STUDENT DASHBOARD] Proyectos publicados: {published_projects.count()}")
            print(f"📋 [STUDENT DASHBOARD] Proyectos ya aplicados: {applied_project_ids.count()}")
            print(f"📋 [STUDENT DASHBOARD] Proyectos disponibles: {available_projects}")
        except Exception as e:
            print(f"Error calculando estadísticas: {e}")
            return JsonResponse({
                'error': 'Error calculando estadísticas',
                'details': str(e)
            }, status=500)
        
        # Obtener notificaciones no leídas
        try:
            from notifications.models import Notification
            unread_notifications = Notification.objects.filter(user=user, read=False).count()
        except Exception as e:
            print(f"Error obteniendo notificaciones: {e}")
            unread_notifications = 0
        
        # Calcular proyectos completados del estudiante
        completed_projects = all_student_projects.filter(status__name='completed').count()
        print(f"🏁 [STUDENT DASHBOARD] Proyectos completados: {completed_projects}")
        
        # Obtener nivel de API del estudiante
        api_level = student.api_level
        print(f"🔧 [STUDENT DASHBOARD] Nivel API: {api_level}")
        
        # Obtener horas totales del estudiante
        total_hours = student.total_hours
        print(f"⏰ [STUDENT DASHBOARD] Horas totales: {total_hours}")
        
        # Obtener strikes del estudiante
        strikes = student.strikes
        print(f"⚠️ [STUDENT DASHBOARD] Strikes: {strikes}")
        
        # Obtener GPA del estudiante
        gpa = float(student.gpa)
        print(f"📊 [STUDENT DASHBOARD] GPA: {gpa}")
        
        # Preparar respuesta
        response_data = {
            'total_applications': total_applications,
            'pending_applications': pending_applications,
            'accepted_applications': accepted_applications,
            'total_projects': total_projects,
            'active_projects': active_projects,
            'completed_projects': completed_projects,
            'api_level': api_level,
            'total_hours': total_hours,
            'strikes': strikes,
            'gpa': gpa,
            'available_projects': available_projects,
            'unread_notifications': unread_notifications,
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
        
        # Obtener alertas de strikes (reportes de asignación de strikes pendientes)
        from strikes.models import StrikeReport
        strikes_alerts = StrikeReport.objects.filter(status='pending').count()
        print(f"⚠️ [ADMIN DASHBOARD] Alertas de strikes (reportes pendientes): {strikes_alerts}")
        
        # Obtener top 10 estudiantes con más horas registradas
        from work_hours.models import WorkHour
        from django.db.models import Sum
        
        top_students = []
        try:
            print("🔍 [ADMIN DASHBOARD] Verificando datos de work hours...")
            
            # Verificar si hay work hours en la base de datos
            total_work_hours = WorkHour.objects.count()
            print(f"📊 [ADMIN DASHBOARD] Total work hours en BD: {total_work_hours}")
            
            # Verificar estudiantes con work hours
            students_with_any_hours = Estudiante.objects.filter(work_hours__isnull=False).distinct().count()
            print(f"👥 [ADMIN DASHBOARD] Estudiantes con work hours: {students_with_any_hours}")
            
            # Consulta para obtener estudiantes con más horas trabajadas
            students_with_hours = Estudiante.objects.annotate(
                calculated_total_hours=Sum('work_hours__hours_worked')
            ).filter(
                calculated_total_hours__isnull=False
            ).order_by('-calculated_total_hours')[:10]
            
            print(f"🏆 [ADMIN DASHBOARD] Estudiantes encontrados con horas: {students_with_hours.count()}")
            
            for student in students_with_hours:
                # Obtener datos del usuario asociado
                user_data = None
                if hasattr(student, 'user') and student.user:
                    user = student.user
                    user_data = {
                        'id': str(user.id),
                        'email': user.email,
                        'first_name': user.first_name or '',
                        'last_name': user.last_name or '',
                        'full_name': f"{user.first_name or ''} {user.last_name or ''}".strip() or user.email
                    }
                
                # Calcular proyectos únicos en los que ha trabajado el estudiante
                unique_projects = student.work_hours.values('project').distinct().count()
                
                top_students.append({
                    'student_id': str(student.id),
                    'user_data': user_data,
                    'total_hours': float(student.calculated_total_hours or 0),
                    'completed_projects': unique_projects,
                    'api_level': student.api_level or 1,
                    'strikes': student.strikes or 0,
                    'gpa': float(student.gpa or 0.0),
                    'career': student.career or 'No especificada',
                    'university': getattr(student, 'university', 'No especificada') or 'No especificada'
                })
            
            print(f"🏆 [ADMIN DASHBOARD] Top 10 estudiantes obtenidos: {len(top_students)}")
            if top_students:
                print(f"🏆 [ADMIN DASHBOARD] Primer estudiante: {top_students[0]}")
            
        except Exception as e:
            print(f"⚠️ [ADMIN DASHBOARD] Error obteniendo top estudiantes: {str(e)}")
            import traceback
            print(f"⚠️ [ADMIN DASHBOARD] Traceback: {traceback.format_exc()}")
            top_students = []
        
        # Preparar respuesta
        response_data = {
            'total_users': total_users,
            'total_companies': total_companies,
            'total_students': total_students,
            'total_projects': total_projects,
            'pending_applications': pending_applications,
            'strikes_alerts': strikes_alerts,
            'top_students': top_students,
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
        from strikes.models import StrikeReport
        
        # Obtener estadísticas básicas
        total_users = User.objects.count()
        total_companies = Empresa.objects.count()
        total_students = Estudiante.objects.count()
        total_projects = Proyecto.objects.count()
        pending_applications = Aplicacion.objects.filter(status='pending').count()
        
        # Obtener alertas de strikes (reportes de asignación de strikes pendientes)
        strikes_alerts = StrikeReport.objects.filter(status='pending').count()
        
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
        from strikes.models import StrikeReport
        
        # Obtener estadísticas básicas
        total_users = User.objects.count()
        total_companies = Empresa.objects.count()
        total_students = Estudiante.objects.count()
        total_projects = Proyecto.objects.count()
        pending_applications = Aplicacion.objects.filter(status='pending').count()
        
        # Obtener alertas de strikes (reportes de asignación de strikes pendientes)
        strikes_alerts = StrikeReport.objects.filter(status='pending').count()
        
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

@csrf_exempt
@require_http_methods(["GET"])
def test_communication(request):
    """Endpoint de prueba para verificar comunicación frontend-backend"""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        return JsonResponse({
            'success': True,
            'message': 'Comunicación exitosa',
            'user': {
                'id': str(current_user.id),
                'email': current_user.email,
                'role': current_user.role,
                'first_name': current_user.first_name,
                'last_name': current_user.last_name
            },
            'timestamp': timezone.now().isoformat()
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def test_simple(request):
    """Endpoint de prueba simple sin autenticación"""
    return JsonResponse({
        'success': True,
        'message': 'Backend funcionando correctamente',
        'timestamp': timezone.now().isoformat()
    })

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
        print(f"[verify_token] Decodificando token: {token[:30]}...")
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        print(f"[verify_token] Payload decodificado: {payload}")
        user_id = payload.get('user_id')
        if user_id:
            user = User.objects.get(id=user_id)
            print(f"[verify_token] Usuario encontrado: {user.email} (id: {user_id})")
            return user
        else:
            print("[verify_token] user_id no encontrado en el payload")
    except jwt.ExpiredSignatureError:
        print("[verify_token] Token expirado")
    except jwt.InvalidTokenError as e:
        print(f"[verify_token] Token inválido: {e}")
    except User.DoesNotExist:
        print("[verify_token] Usuario no existe para el user_id del token")
    except Exception as e:
        print(f"[verify_token] Error inesperado: {e}")
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


@csrf_exempt
@require_http_methods(["POST"])
def api_change_password(request):
    """API para cambiar contraseña de usuario."""
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