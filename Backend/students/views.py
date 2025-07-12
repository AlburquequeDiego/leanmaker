"""
Views para la app students.
"""

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from users.models import User
from core.views import verify_token


@csrf_exempt
@require_http_methods(["GET"])
def student_list(request):
    """Lista de estudiantes."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Solo admins y empresas pueden ver la lista de estudiantes
        if current_user.role not in ['admin', 'company']:
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        students = User.objects.filter(role='student')
        students_data = []
        
        for student in students:
            students_data.append({
                'id': str(student.id),
                'email': student.email,
                'first_name': student.first_name,
                'last_name': student.last_name,
                'username': student.username,
                'phone': student.phone,
                'avatar': student.avatar,
                'bio': student.bio,
                'is_active': student.is_active,
                'is_verified': student.is_verified,
                'date_joined': student.date_joined.isoformat(),
                'last_login': student.last_login.isoformat() if student.last_login else None,
                'full_name': student.full_name
            })
        
        return JsonResponse(students_data, safe=False)
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def student_detail(request, student_id):
    """Detalle de un estudiante."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Solo admins, empresas o el propio estudiante pueden ver el detalle
        if current_user.role not in ['admin', 'company'] and str(current_user.id) != student_id:
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        try:
            student = User.objects.get(id=student_id, role='student')
        except User.DoesNotExist:
            return JsonResponse({'error': 'Estudiante no encontrado'}, status=404)
        
        student_data = {
            'id': str(student.id),
            'email': student.email,
            'first_name': student.first_name,
            'last_name': student.last_name,
            'username': student.username,
            'phone': student.phone,
            'avatar': student.avatar,
            'bio': student.bio,
            'is_active': student.is_active,
            'is_verified': student.is_verified,
            'date_joined': student.date_joined.isoformat(),
            'last_login': student.last_login.isoformat() if student.last_login else None,
            'created_at': student.created_at.isoformat(),
            'updated_at': student.updated_at.isoformat(),
            'full_name': student.full_name
        }
        
        return JsonResponse(student_data)
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def student_create(request):
    """Crear un nuevo estudiante."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Solo admins pueden crear estudiantes
        if current_user.role != 'admin':
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        data = json.loads(request.body)
        
        # Validar campos requeridos
        required_fields = ['email', 'password', 'first_name', 'last_name']
        for field in required_fields:
            if not data.get(field):
                return JsonResponse({'error': f'El campo {field} es requerido'}, status=400)
        
        # Verificar si el email ya existe
        if User.objects.filter(email=data['email']).exists():
            return JsonResponse({'error': 'El email ya está registrado'}, status=400)
        
        # Crear estudiante
        student = User.objects.create_user(
            email=data['email'],
            password=data['password'],
            first_name=data['first_name'],
            last_name=data['last_name'],
            role='student',
            phone=data.get('phone'),
            bio=data.get('bio')
        )
        
        student_data = {
            'id': str(student.id),
            'email': student.email,
            'first_name': student.first_name,
            'last_name': student.last_name,
            'username': student.username,
            'phone': student.phone,
            'bio': student.bio,
            'is_active': student.is_active,
            'is_verified': student.is_verified,
            'full_name': student.full_name
        }
        
        return JsonResponse(student_data, status=201)
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["PUT"])
def student_update(request, student_id):
    """Actualizar un estudiante."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Solo admins o el propio estudiante pueden actualizar
        if current_user.role != 'admin' and str(current_user.id) != student_id:
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        try:
            student = User.objects.get(id=student_id, role='student')
        except User.DoesNotExist:
            return JsonResponse({'error': 'Estudiante no encontrado'}, status=404)
        
        data = json.loads(request.body)
        
        # Actualizar campos del modelo User
        if 'nombre' in data:
            student.first_name = data['nombre']
        if 'apellido' in data:
            student.last_name = data['apellido']
        if 'telefono' in data:
            student.phone = data['telefono']
        if 'biografia' in data:
            student.bio = data['biografia']
        
        student.save()
        
        # Actualizar campos del modelo Estudiante
        try:
            from .models import Estudiante
            estudiante = Estudiante.objects.get(user=student)
        except Estudiante.DoesNotExist:
            # Crear perfil de estudiante si no existe
            estudiante = Estudiante.objects.create(user=student)
        
        # Actualizar campos del modelo Estudiante
        if 'institucion' in data:
            estudiante.university = data['institucion']
        if 'carrera' in data:
            estudiante.career = data['carrera']
        if 'nivel' in data:
            try:
                estudiante.api_level = int(data['nivel'])
            except (ValueError, TypeError):
                estudiante.api_level = 1
        if 'habilidades' in data:
            estudiante.skills = json.dumps(data['habilidades'])
        if 'experienciaPrevia' in data:
            try:
                estudiante.experience_years = int(data['experienciaPrevia'])
            except (ValueError, TypeError):
                estudiante.experience_years = 0
        if 'linkedin' in data:
            estudiante.linkedin_url = data['linkedin']
        if 'github' in data:
            estudiante.github_url = data['github']
        if 'portafolio' in data:
            estudiante.portfolio_url = data['portafolio']
        if 'modalidadesDisponibles' in data and data['modalidadesDisponibles']:
            estudiante.availability = data['modalidadesDisponibles'][0]
        
        estudiante.save()
        
        # Retornar datos actualizados en formato del frontend
        skills_list = estudiante.get_skills_list()
        student_data = {
            'id': str(student.id),
            'nombre': student.first_name,
            'apellido': student.last_name,
            'email': student.email,
            'telefono': student.phone or '',
            'fechaNacimiento': '',
            'genero': '',
            'institucion': estudiante.university or '',
            'carrera': estudiante.career or '',
            'nivel': str(estudiante.api_level),
            'habilidades': skills_list,
            'biografia': student.bio or '',
            'cv': None,
            'certificado': None,
            'area': '',
            'modalidadesDisponibles': [estudiante.availability] if estudiante.availability else [],
            'experienciaPrevia': str(estudiante.experience_years),
            'linkedin': estudiante.linkedin_url or '',
            'github': estudiante.github_url or '',
            'portafolio': estudiante.portfolio_url or '',
        }
        
        return JsonResponse(student_data)
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["DELETE"])
def student_delete(request, student_id):
    """Eliminar un estudiante."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Solo admins pueden eliminar estudiantes
        if current_user.role != 'admin':
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        try:
            student = User.objects.get(id=student_id, role='student')
        except User.DoesNotExist:
            return JsonResponse({'error': 'Estudiante no encontrado'}, status=404)
        
        student.delete()
        
        return JsonResponse({'message': 'Estudiante eliminado exitosamente'})
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def student_test(request):
    """Vista de prueba simple."""
    print(f"[student_test] Vista de prueba alcanzada")
    print(f"[student_test] Headers: {dict(request.headers)}")
    return JsonResponse({'message': 'Vista de prueba funcionando'})

@csrf_exempt
def student_me(request):
    """Perfil del estudiante actual."""
    print(f"[student_me] VISTA EJECUTÁNDOSE - Método: {request.method}")
    print(f"[student_me] Headers: {dict(request.headers)}")
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        print(f"[student_me] Auth header: {auth_header}")
        
        if not auth_header or not auth_header.startswith('Bearer '):
            print(f"[student_me] Token requerido o formato incorrecto")
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        print(f"[student_me] Token extraído: {token[:50]}...")
        
        current_user = verify_token(token)
        print(f"[student_me] Usuario autenticado: id={getattr(current_user, 'id', None)}, email={getattr(current_user, 'email', None)}, rol={getattr(current_user, 'role', None)}")
        
        if not current_user:
            print(f"[student_me] Token inválido - usuario no encontrado")
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Solo estudiantes pueden acceder a su perfil
        print(f"[student_me] Verificando rol: {current_user.role} vs 'student'")
        print(f"[student_me] current_user.role repr: {repr(current_user.role)}")
        if not current_user.role or current_user.role.strip().lower() != 'student':
            print(f"[student_me] Acceso denegado. Rol actual: {current_user.role}")
            return JsonResponse({'error': 'Acceso denegado. Solo estudiantes pueden acceder a este endpoint.'}, status=403)
        
        # Obtener datos del modelo Estudiante si existe
        try:
            from .models import Estudiante
            estudiante = Estudiante.objects.get(user=current_user)
            print(f"[student_me] Perfil de estudiante encontrado: {estudiante}")
            skills_list = estudiante.get_skills_list()
        except Estudiante.DoesNotExist:
            print(f"[student_me] Perfil de estudiante NO encontrado, creando uno...")
            estudiante = Estudiante.objects.create(user=current_user)
            skills_list = []
        except Exception as e:
            print(f"[student_me] Error obteniendo perfil de estudiante: {e}")
            estudiante = None
            skills_list = []
        
        # Convertir habilidades al formato que espera el frontend
        habilidades_formateadas = []
        if skills_list:
            for skill in skills_list:
                if isinstance(skill, dict) and 'nombre' in skill and 'nivel' in skill:
                    habilidades_formateadas.append(skill)
                elif isinstance(skill, str):
                    habilidades_formateadas.append({'nombre': skill, 'nivel': 'Básico'})
        
        # Adaptar datos para el frontend
        student_data = {
            'id': str(current_user.id),
            'nombre': current_user.first_name or '',
            'apellido': current_user.last_name or '',
            'email': current_user.email or '',
            'telefono': current_user.phone or '',
            'fechaNacimiento': '',
            'genero': '',
            'institucion': estudiante.university if estudiante else '',
            'carrera': estudiante.career if estudiante else '',
            'nivel': str(estudiante.api_level) if estudiante else '1',
            'habilidades': habilidades_formateadas,
            'biografia': current_user.bio or '',
            'cv': None,
            'certificado': None,
            'area': '',
            'modalidadesDisponibles': [estudiante.availability] if estudiante and estudiante.availability else [],
            'experienciaPrevia': str(estudiante.experience_years) if estudiante else '0',
            'linkedin': estudiante.linkedin_url if estudiante else '',
            'github': estudiante.github_url if estudiante else '',
            'portafolio': estudiante.portfolio_url if estudiante else '',
        }
        
        print(f"[student_me] Datos devueltos: {student_data}")
        print(f"[student_me] Nombre: '{student_data['nombre']}'")
        print(f"[student_me] Apellido: '{student_data['apellido']}'")
        print(f"[student_me] Email: '{student_data['email']}'")
        print(f"[student_me] Institución: '{student_data['institucion']}'")
        print(f"[student_me] Carrera: '{student_data['carrera']}'")
        print(f"[student_me] Habilidades: {student_data['habilidades']}")
        return JsonResponse(student_data)
        
    except Exception as e:
        print(f"[student_me] Error: {e}")
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def student_projects(request, student_id):
    """Proyectos de un estudiante."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Solo admins, empresas o el propio estudiante pueden ver sus proyectos
        if current_user.role not in ['admin', 'company'] and str(current_user.id) != student_id:
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        # Por ahora retornamos una lista vacía, se implementará cuando tengamos el modelo de proyectos
        projects_data = []
        
        return JsonResponse(projects_data, safe=False)
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def student_applications(request, student_id):
    """Aplicaciones de un estudiante."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Solo admins, empresas o el propio estudiante pueden ver sus aplicaciones
        if current_user.role not in ['admin', 'company'] and str(current_user.id) != student_id:
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        # Por ahora retornamos una lista vacía, se implementará cuando tengamos el modelo de aplicaciones
        applications_data = []
        
        return JsonResponse(applications_data, safe=False)
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500) 