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
        
        # Actualizar campos permitidos
        if 'first_name' in data:
            student.first_name = data['first_name']
        if 'last_name' in data:
            student.last_name = data['last_name']
        if 'phone' in data:
            student.phone = data['phone']
        if 'bio' in data:
            student.bio = data['bio']
        if 'avatar' in data:
            student.avatar = data['avatar']
        
        student.save()
        
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
def student_me(request):
    """Perfil del estudiante actual."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Solo estudiantes pueden acceder a su perfil
        if current_user.role != 'student':
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        student_data = {
            'id': str(current_user.id),
            'email': current_user.email,
            'first_name': current_user.first_name,
            'last_name': current_user.last_name,
            'username': current_user.username,
            'phone': current_user.phone,
            'avatar': current_user.avatar,
            'bio': current_user.bio,
            'is_active': current_user.is_active,
            'is_verified': current_user.is_verified,
            'date_joined': current_user.date_joined.isoformat(),
            'last_login': current_user.last_login.isoformat() if current_user.last_login else None,
            'created_at': current_user.created_at.isoformat(),
            'updated_at': current_user.updated_at.isoformat(),
            'full_name': current_user.full_name
        }
        
        return JsonResponse(student_data)
        
    except Exception as e:
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