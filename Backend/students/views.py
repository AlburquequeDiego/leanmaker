"""
Views para la app students.
"""

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.db.models import Q
from users.models import User
from .models import Estudiante, ApiLevelRequest
from core.views import verify_token
from django.utils import timezone
from core.auth_utils import require_admin


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
        
        # Parámetros de paginación y filtros
        page = int(request.GET.get('page', 1))
        limit = int(request.GET.get('limit', 10))
        offset = (page - 1) * limit
        search = request.GET.get('search', '')
        api_level = request.GET.get('api_level', '')
        status = request.GET.get('status', '')
        
        # Query base
        queryset = Estudiante.objects.select_related('user').all()
        
        # Aplicar filtros
        if search:
            queryset = queryset.filter(
                Q(user__first_name__icontains=search) |
                Q(user__last_name__icontains=search) |
                Q(user__email__icontains=search) |
                Q(career__icontains=search)
            )
        
        if api_level:
            queryset = queryset.filter(api_level=api_level)
        
        if status:
            if status == 'approved':
                queryset = queryset.filter(status='approved')
            elif status == 'inactive':
                # Incluir todos los estados que no sean 'approved'
                queryset = queryset.exclude(status='approved')
        
        # Contar total
        total_count = queryset.count()
        
        # Paginar
        students = queryset[offset:offset + limit]
        
        # Serializar datos
        students_data = []
        for student in students:
            # Determinar el nombre a mostrar
            full_name = student.user.full_name
            if not full_name or full_name.strip() == '':
                full_name = student.user.email  # Usar email si no hay nombre
            
            # Debug log
            print(f"🔍 Estudiante {student.id}: full_name='{student.user.full_name}', email='{student.user.email}', name_to_show='{full_name}'")
            
            students_data.append({
                'id': str(student.id),
                'user': str(student.user.id),
                'name': full_name,
                'email': student.user.email,
                'last_activity': student.user.last_login.isoformat() if student.user.last_login else None,
                'career': student.career,
                'semester': student.semester,
                'graduation_year': student.graduation_year,
                'status': student.status,
                'api_level': student.api_level,
                'trl_level': student.trl_permitido_segun_api,  # <-- Usar TRL calculado
                'strikes': student.strikes,
                'gpa': float(student.gpa),
                'completed_projects': student.completed_projects,
                'total_hours': student.total_hours,
                'experience_years': student.experience_years,
                'portfolio_url': student.portfolio_url,
                'github_url': student.github_url,
                'linkedin_url': student.linkedin_url,
                'cv_link': student.cv_link,
                'certificado_link': student.certificado_link,
                'availability': student.availability,
                'location': student.location,
                'gpa': float(student.gpa),
                'skills': student.get_skills_list(),
                'languages': student.get_languages_list(),
                'created_at': student.created_at.isoformat(),
                'updated_at': student.updated_at.isoformat(),
                # Datos adicionales calculados
                'horas_permitidas': student.horas_permitidas_segun_api,
                'trl_permitido': student.trl_permitido_segun_api,
                # Datos del usuario
                'user_data': {
                    'id': str(student.user.id),
                    'email': student.user.email,
                    'first_name': student.user.first_name,
                    'last_name': student.user.last_name,
                    'username': student.user.username,
                    'phone': student.user.phone,
                    'avatar': student.user.avatar,
                    'bio': student.user.bio,
                    'is_active': student.user.is_active,
                    'is_verified': student.user.is_verified,
                    'date_joined': student.user.date_joined.isoformat(),
                    'last_login': student.user.last_login.isoformat() if student.user.last_login else None,
                    'full_name': student.user.full_name,
                }
            })
        
        return JsonResponse({
            'results': students_data,
            'count': total_count,
            'page': page,
            'limit': limit,
            'total_pages': (total_count + limit - 1) // limit
        })
        
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
        
        # Obtener estudiante
        try:
            student = Estudiante.objects.select_related('user').get(id=student_id)
        except Estudiante.DoesNotExist:
            return JsonResponse({'error': 'Estudiante no encontrado'}, status=404)
        
        # Verificar permisos
        if current_user.role == 'student' and str(student.user.id) != str(current_user.id):
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        # Serializar datos
        student_data = {
            'id': str(student.id),
            'user': str(student.user.id),
            'career': student.career,
            'semester': student.semester,
            'graduation_year': student.graduation_year,
            'status': student.status,
            'api_level': student.api_level,
            'trl_level': student.trl_level,
            'strikes': student.strikes,
            'gpa': float(student.gpa),
            'completed_projects': student.completed_projects,
            'total_hours': student.total_hours,
            'experience_years': student.experience_years,
            'portfolio_url': student.portfolio_url,
            'github_url': student.github_url,
            'linkedin_url': student.linkedin_url,
            'cv_link': student.cv_link,
            'certificado_link': student.certificado_link,
            'availability': student.availability,
            'location': student.location,
            'gpa': float(student.gpa),
            'skills': student.get_skills_list(),
            'languages': student.get_languages_list(),
            'created_at': student.created_at.isoformat(),
            'updated_at': student.updated_at.isoformat(),
            # Datos del usuario
            'user_data': {
                'id': str(student.user.id),
                'email': student.user.email,
                'first_name': student.user.first_name,
                'last_name': student.user.last_name,
                'username': student.user.username,
                'phone': student.user.phone,
                'avatar': student.user.avatar,
                'bio': student.user.bio,
                'is_active': student.user.is_active,
                'is_verified': student.user.is_verified,
                'date_joined': student.user.date_joined.isoformat(),
                'last_login': student.user.last_login.isoformat() if student.user.last_login else None,
                'full_name': student.user.full_name,
            }
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
@require_http_methods(["PUT", "PATCH"])
def student_update(request, student_id=None):
    """Actualizar perfil de estudiante."""
    try:
        print(f"[student_update] Iniciando actualización - student_id: {student_id}")
        
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        print(f"[student_update] Usuario autenticado: {current_user.id} - Role: {current_user.role}")
        
        # Si no se especifica student_id, usar el estudiante actual
        if student_id is None:
            if current_user.role != 'student':
                return JsonResponse({'error': 'Acceso denegado'}, status=403)
            try:
                student = Estudiante.objects.get(user=current_user)
            except Estudiante.DoesNotExist:
                return JsonResponse({'error': 'Perfil de estudiante no encontrado'}, status=404)
        else:
            # Verificar permisos
            try:
                student = Estudiante.objects.get(id=student_id)
                print(f"[student_update] Estudiante encontrado: {student.id} - User ID: {student.user.id}")
            except Estudiante.DoesNotExist:
                return JsonResponse({'error': 'Estudiante no encontrado'}, status=404)
            
            # Si es estudiante, solo puede actualizar su propio perfil
            if current_user.role == 'student' and str(student.user.id) != str(current_user.id):
                print(f"[student_update] Acceso denegado - Student user ID: {student.user.id}, Current user ID: {current_user.id}")
                return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        # Procesar datos
        data = json.loads(request.body)
        print(f"[student_update] Datos recibidos: {data}")
        
        # Actualizar campos del estudiante
        fields_to_update = [
            'career', 'semester', 'graduation_year', 'university', 'education_level', 'status', 'api_level',
            'strikes', 'gpa', 'completed_projects', 'total_hours', 'experience_years',
            'portfolio_url', 'github_url', 'linkedin_url', 'cv_link', 'certificado_link',
            'availability', 'location', 'area', 'rating', 'skills', 'languages'
        ]
        
        for field in fields_to_update:
            if field in data:
                print(f"[student_update] Actualizando campo '{field}': {data[field]}")
                if field in ['skills', 'languages']:
                    # Convertir listas a JSON
                    if isinstance(data[field], list):
                        json_value = json.dumps(data[field])
                        print(f"[student_update] Campo '{field}' convertido a JSON: {json_value}")
                        setattr(student, field, json_value)
                    else:
                        print(f"[student_update] Campo '{field}' no es una lista, valor: {data[field]}")
                        setattr(student, field, data[field])
                else:
                    setattr(student, field, data[field])
        
        # Actualizar campos del usuario si se proporcionan
        if 'user_data' in data:
            user_data = data['user_data']
            user_fields = ['first_name', 'last_name', 'email', 'phone', 'bio']
            
            for field in user_fields:
                if field in user_data:
                    setattr(student.user, field, user_data[field])
            
            student.user.save()
        
        # Actualizar perfil detallado si se proporcionan datos
        if 'perfil_detallado' in data:
            perfil_data = data['perfil_detallado']
            print(f"[student_update] Datos de perfil detallado recibidos: {perfil_data}")
            
            # Obtener o crear perfil detallado
            try:
                perfil_detallado = student.perfil_detallado
                print(f"[student_update] Perfil detallado existente encontrado: ID {perfil_detallado.id}")
            except:
                from students.models import PerfilEstudiante
                perfil_detallado = PerfilEstudiante(estudiante=student)
                print(f"[student_update] Creando nuevo perfil detallado")
            
            # Campos del perfil detallado
            perfil_fields = [
                'fecha_nacimiento', 'genero', 'nacionalidad', 'universidad', 'facultad',
                'promedio_historico', 'experiencia_laboral', 'telefono_emergencia', 'contacto_emergencia'
            ]
            
            for field in perfil_fields:
                if field in perfil_data:
                    print(f"[student_update] Actualizando campo '{field}': {perfil_data[field]}")
                    if field == 'fecha_nacimiento' and perfil_data[field]:
                        try:
                            from datetime import datetime
                            fecha_nacimiento = datetime.strptime(perfil_data[field], '%Y-%m-%d').date()
                            setattr(perfil_detallado, field, fecha_nacimiento)
                        except:
                            print(f"[student_update] Error al procesar fecha de nacimiento: {perfil_data[field]}")
                            setattr(perfil_detallado, field, None)
                    else:
                        setattr(perfil_detallado, field, perfil_data[field])
            
            # Campos JSON del perfil detallado
            json_fields = {
                'certificaciones': 'set_certificaciones_list',
                'proyectos_personales': 'set_proyectos_personales_list',
                'tecnologias_preferidas': 'set_tecnologias_preferidas_list',
                'industrias_interes': 'set_industrias_interes_list',
                'tipo_proyectos_preferidos': 'set_tipo_proyectos_preferidos_list'
            }
            
            for field, method_name in json_fields.items():
                if field in perfil_data:
                    print(f"[student_update] Actualizando campo JSON '{field}': {perfil_data[field]}")
                    method = getattr(perfil_detallado, method_name)
                    method(perfil_data[field])
            
            print(f"[student_update] Guardando perfil detallado...")
            perfil_detallado.save()
            print(f"[student_update] Perfil detallado guardado exitosamente")
        else:
            print(f"[student_update] No se proporcionaron datos de perfil detallado")
        
        student.save()
        
        # Retornar datos actualizados
        return JsonResponse({
            'message': 'Perfil actualizado correctamente',
            'id': str(student.id)
        })
        
    except json.JSONDecodeError as e:
        print(f"[student_update] Error JSON inválido: {e}")
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    except Exception as e:
        print(f"[student_update] Error general: {e}")
        import traceback
        traceback.print_exc()
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
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Verificar que sea estudiante
        if current_user.role != 'student':
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        # Obtener perfil de estudiante
        try:
            student = Estudiante.objects.select_related('user').get(user=current_user)
        except Estudiante.DoesNotExist:
            return JsonResponse({'error': 'No existe perfil de estudiante asociado a este usuario.'}, status=404)
        
        # Obtener perfil detallado si existe
        try:
            perfil_detallado = student.perfil_detallado
        except:
            perfil_detallado = None
        
        # Serializar datos
        student_data = {
            'id': str(student.id),
            'user': str(student.user.id),
            'career': student.career,
            'semester': student.semester,
            'graduation_year': student.graduation_year,
            'university': student.university,  # Campo del registro
            'education_level': student.education_level,  # Campo del registro
            'status': student.status,
            'api_level': student.api_level,
            'trl_level': student.trl_permitido_segun_api,  # <-- Usar TRL calculado
            'strikes': student.strikes,
            'gpa': float(student.gpa),
            'completed_projects': student.completed_projects,
            'total_hours': student.total_hours,
            'experience_years': student.experience_years,
            'portfolio_url': student.portfolio_url,
            'github_url': student.github_url,
            'linkedin_url': student.linkedin_url,
            'cv_link': student.cv_link,
            'certificado_link': student.certificado_link,
            'availability': student.availability,
            'location': student.location,
            'area': student.area,  # <-- AÑADIDO
            'gpa': float(student.gpa),
            'skills': student.get_skills_list(),
            'languages': student.get_languages_list(),
            'created_at': student.created_at.isoformat(),
            'updated_at': student.updated_at.isoformat(),
            # Datos adicionales calculados
            'horas_permitidas': student.horas_permitidas_segun_api,
            'trl_permitido': student.trl_permitido_segun_api,
            # Datos del perfil detallado
            'perfil_detallado': {
                'fecha_nacimiento': perfil_detallado.fecha_nacimiento.isoformat() if perfil_detallado and perfil_detallado.fecha_nacimiento else None,
                'genero': perfil_detallado.genero if perfil_detallado else None,
                'nacionalidad': perfil_detallado.nacionalidad if perfil_detallado else None,
                'universidad': perfil_detallado.universidad if perfil_detallado else None,
                'facultad': perfil_detallado.facultad if perfil_detallado else None,
                'promedio_historico': float(perfil_detallado.promedio_historico) if perfil_detallado and perfil_detallado.promedio_historico else None,
                'experiencia_laboral': perfil_detallado.experiencia_laboral if perfil_detallado else None,
                'certificaciones': perfil_detallado.get_certificaciones_list() if perfil_detallado else [],
                'proyectos_personales': perfil_detallado.get_proyectos_personales_list() if perfil_detallado else [],
                'tecnologias_preferidas': perfil_detallado.get_tecnologias_preferidas_list() if perfil_detallado else [],
                'industrias_interes': perfil_detallado.get_industrias_interes_list() if perfil_detallado else [],
                'tipo_proyectos_preferidos': perfil_detallado.get_tipo_proyectos_preferidos_list() if perfil_detallado else [],
                'telefono_emergencia': perfil_detallado.telefono_emergencia if perfil_detallado else None,
                'contacto_emergencia': perfil_detallado.contacto_emergencia if perfil_detallado else None,
            } if perfil_detallado else None,
            # Datos del usuario
            'user_data': {
                'id': str(student.user.id),
                'email': student.user.email,
                'first_name': student.user.first_name,
                'last_name': student.user.last_name,
                'username': student.user.username,
                'phone': student.user.phone,
                'avatar': student.user.avatar,
                'bio': student.user.bio,
                'birthdate': student.user.birthdate.isoformat() if student.user.birthdate else None,
                'gender': student.user.gender,
                'is_active': student.user.is_active,
                'is_verified': student.user.is_verified,
                'date_joined': student.user.date_joined.isoformat(),
                'last_login': student.user.last_login.isoformat() if student.user.last_login else None,
                'full_name': student.user.full_name,
            }
        }
        
        # Agregar logs para debugging
        print(f"[student_me] Datos del estudiante:")
        print(f"[student_me] - cv_link: '{student.cv_link}'")
        print(f"[student_me] - certificado_link: '{student.certificado_link}'")
        print(f"[student_me] - portfolio_url: '{student.portfolio_url}'")
        print(f"[student_me] - github_url: '{student.github_url}'")
        print(f"[student_me] - linkedin_url: '{student.linkedin_url}'")
        print(f"[student_me] Datos serializados:")
        print(f"[student_me] - cv_link en response: '{student_data.get('cv_link')}'")
        print(f"[student_me] - certificado_link en response: '{student_data.get('certificado_link')}'")
        
        return JsonResponse(student_data)
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def student_projects(request, student_id):
    """Proyectos de un estudiante (donde es miembro activo)."""
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
        # Buscar el estudiante
        from students.models import Estudiante
        from projects.models import MiembroProyecto
        try:
            estudiante = Estudiante.objects.get(id=student_id)
        except Estudiante.DoesNotExist:
            return JsonResponse({'error': 'Estudiante no encontrado'}, status=404)
        membresias = MiembroProyecto.objects.filter(usuario=estudiante.user, rol='estudiante', esta_activo=True).select_related('proyecto', 'proyecto__company')
        projects_data = []
        for m in membresias:
            p = m.proyecto
            projects_data.append({
                'id': str(p.id),
                'title': p.title,
                'company': p.company.company_name if p.company else 'Sin empresa',
                'status': p.status.name.lower() if p.status and hasattr(p.status, 'name') else 'active',
                'startDate': p.start_date.isoformat() if p.start_date else '',
                'endDate': p.estimated_end_date.isoformat() if p.estimated_end_date else '',
                'progress': 50,
                'hoursWorked': 0,
                'totalHours': p.required_hours or 0,
                'location': p.location or '',
                'description': p.description or '',
                'technologies': [],
                'teamMembers': p.current_students or 1,
                'mentor': '',
                'deliverables': [],
                'nextMilestone': '',
                'nextMilestoneDate': '',
                'modality': p.modality,
                'hoursPerWeek': p.hours_per_week,
                'maxStudents': p.max_students,
                'currentStudents': p.current_students,
                'trlLevel': p.trl.level if p.trl else '',
                'apiLevel': p.api_level,
                'createdAt': p.created_at.isoformat() if p.created_at else '',
                'requirements': p.requirements,
            })
        return JsonResponse({'success': True, 'data': projects_data, 'total': len(projects_data)})
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

@csrf_exempt
@require_http_methods(["POST"])
def api_level_request_create(request):
    """Crea una petición de subida de nivel API por parte del estudiante."""
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user or current_user.role != 'student':
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        # Verificar que el estudiante existe
        try:
            student = Estudiante.objects.get(user=current_user)
        except Estudiante.DoesNotExist:
            return JsonResponse({'error': 'Perfil de estudiante no encontrado'}, status=404)
        
        data = json.loads(request.body)
        requested_level = int(data.get('requested_level'))
        current_level = int(data.get('current_level', student.api_level))
        
        # Validar que los niveles sean válidos
        if current_level < 1 or current_level > 4:
            current_level = student.api_level  # Usar el nivel actual del estudiante si es inválido
        
        if requested_level < 1 or requested_level > 4:
            return JsonResponse({'error': 'El nivel solicitado debe estar entre 1 y 4.'}, status=400)
        
        # Solo permitir si el nivel solicitado es mayor al actual
        if requested_level <= current_level:
            return JsonResponse({'error': 'El nivel solicitado debe ser mayor al actual.'}, status=400)
        
        # Solo una petición pendiente por estudiante
        if ApiLevelRequest.objects.filter(student=student, status='pending').exists():
            return JsonResponse({'error': 'Ya tienes una petición pendiente.'}, status=400)
        
        req = ApiLevelRequest.objects.create(
            student=student,
            requested_level=requested_level,
            current_level=current_level,
            status='pending',
        )
        return JsonResponse({'success': True, 'request_id': req.id, 'status': req.status})
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    except ValueError as e:
        return JsonResponse({'error': 'Datos inválidos'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def api_level_request_list(request):
    """Lista las peticiones de subida de nivel API del estudiante autenticado."""
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user or current_user.role != 'student':
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        # Verificar que el estudiante existe
        try:
            student = Estudiante.objects.get(user=current_user)
        except Estudiante.DoesNotExist:
            return JsonResponse({'error': 'Perfil de estudiante no encontrado'}, status=404)
        
        requests = ApiLevelRequest.objects.filter(student=student).order_by('-submitted_at')
        data = [
            {
                'id': r.id,
                'requested_level': r.requested_level,
                'current_level': r.current_level,
                'status': r.status,
                'feedback': r.feedback,
                'submitted_at': r.submitted_at,
                'reviewed_at': r.reviewed_at,
            } for r in requests
        ]
        return JsonResponse({'results': data})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def api_level_request_admin_list(request):
    """Lista todas las peticiones de subida de nivel API para el admin."""
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user or current_user.role != 'admin':
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        requests = ApiLevelRequest.objects.select_related('student__user').order_by('-submitted_at')
        data = [
            {
                'id': r.id,
                'student_id': r.student.id,
                'student_name': r.student.user.full_name,
                'requested_level': r.requested_level,
                'current_level': r.current_level,
                'status': r.status,
                'feedback': r.feedback,
                'submitted_at': r.submitted_at,
                'reviewed_at': r.reviewed_at,
            } for r in requests
        ]
        return JsonResponse({'results': data})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def api_level_request_admin_action(request, request_id):
    """Permite al admin aprobar o rechazar una petición de subida de nivel API."""
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user or current_user.role != 'admin':
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        # Verificar que la petición existe
        try:
            req = ApiLevelRequest.objects.select_related('student').get(id=request_id)
        except ApiLevelRequest.DoesNotExist:
            return JsonResponse({'error': 'Petición no encontrada'}, status=404)
        
        data = json.loads(request.body)
        action = data.get('action')  # 'approve' o 'reject'
        feedback = data.get('feedback', '')
        
        if req.status != 'pending':
            return JsonResponse({'error': 'La petición ya fue revisada.'}, status=400)
        
        if action == 'approve':
            req.status = 'approved'
            req.reviewed_at = timezone.now()
            req.feedback = feedback
            req.save()
            # Subir el nivel del estudiante
            student = req.student
            student.api_level = req.requested_level
            student.save(update_fields=['api_level'])
        elif action == 'reject':
            req.status = 'rejected'
            req.reviewed_at = timezone.now()
            req.feedback = feedback
            req.save()
        else:
            return JsonResponse({'error': 'Acción inválida.'}, status=400)
        
        return JsonResponse({'success': True, 'status': req.status})
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500) 

@csrf_exempt
@require_http_methods(["POST"])
@require_admin
def admin_suspend_student(request, student_id):
    try:
        # Buscar el estudiante por ID numérico
        try:
            student = Estudiante.objects.get(id=student_id)
        except Estudiante.DoesNotExist:
            return JsonResponse({'error': 'Estudiante no encontrado'}, status=404)
        
        student.status = 'suspended'
        student.save(update_fields=['status'])
        if student.user:
            student.user.is_active = False
            student.user.save(update_fields=['is_active'])
        return JsonResponse({'success': True, 'status': 'suspended'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
@require_admin
def admin_block_student(request, student_id):
    try:
        # Buscar el estudiante por ID numérico
        try:
            student = Estudiante.objects.get(id=student_id)
        except Estudiante.DoesNotExist:
            return JsonResponse({'error': 'Estudiante no encontrado'}, status=404)
        
        student.status = 'rejected'
        student.save(update_fields=['status'])
        if student.user:
            student.user.is_verified = False
            student.user.save(update_fields=['is_verified'])
        return JsonResponse({'success': True, 'status': 'rejected'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
@require_admin
def admin_activate_student(request, student_id):
    try:
        # Buscar el estudiante por ID numérico
        try:
            student = Estudiante.objects.get(id=student_id)
        except Estudiante.DoesNotExist:
            return JsonResponse({'error': 'Estudiante no encontrado'}, status=404)
        
        student.status = 'approved'
        student.save(update_fields=['status'])
        if student.user:
            student.user.is_active = True
            student.user.is_verified = True
            student.user.save(update_fields=['is_active', 'is_verified'])
        return JsonResponse({'success': True, 'status': 'approved'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500) 