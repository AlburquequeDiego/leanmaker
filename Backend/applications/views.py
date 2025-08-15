"""
Views para la app applications.
"""

import json
import uuid
from datetime import datetime, timedelta
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils import timezone
from django.db.models import Q
from django.core.paginator import Paginator
from django.core.exceptions import ValidationError
from django.db import transaction
from django.shortcuts import get_object_or_404

from .models import Aplicacion
from users.models import User
from core.auth_utils import get_user_from_token, require_auth
from django.utils import timezone
from notifications.services import NotificationService

@csrf_exempt
@require_http_methods(["GET", "POST"])
def application_list(request):
    """Lista de aplicaciones y creación de nuevas postulaciones."""
    try:
        # Verificar autenticación
        current_user = get_user_from_token(request)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        if request.method == "POST":
            data = json.loads(request.body)
            project_id = data.get('project_id')
            if not project_id:
                return JsonResponse({'error': 'project_id es requerido'}, status=400)
            from projects.models import Proyecto
            from students.models import Estudiante
            try:
                project = Proyecto.objects.get(id=project_id)
            except Proyecto.DoesNotExist:
                return JsonResponse({'error': 'Proyecto no encontrado'}, status=404)
            try:
                student = current_user.estudiante_profile
            except Exception:
                return JsonResponse({'error': 'Perfil de estudiante no encontrado'}, status=404)
            # Verificar si ya existe una postulación
            if Aplicacion.objects.filter(project=project, student=student).exists():
                return JsonResponse({'error': 'Ya postulaste a este proyecto'}, status=400)
            # Crear la postulación
            app = Aplicacion.objects.create(
                project=project,
                student=student,
                status='pending',
            )
            return JsonResponse({'success': True, 'application_id': str(app.id)})
        # GET: lista de aplicaciones del usuario autenticado
        if current_user.role == 'student':
            try:
                student = current_user.estudiante_profile
                applications = Aplicacion.objects.filter(student=student)
            except Exception:
                return JsonResponse({'error': 'Perfil de estudiante no encontrado'}, status=404)
        elif current_user.role == 'company':
            # Para empresas, mostrar aplicaciones de sus proyectos
            try:
                company = current_user.empresa_profile
                applications = Aplicacion.objects.filter(project__company=company)
            except Exception:
                return JsonResponse({'error': 'Perfil de empresa no encontrado'}, status=404)
        else:
            # Para admins, mostrar todas las aplicaciones
            applications = Aplicacion.objects.all()
        
        applications_data = []
        for application in applications:
            applications_data.append({
                'id': str(application.id),
                'project_id': str(application.project.id) if application.project else None,
                'project': str(application.project.id) if application.project else None,  # Para compatibilidad
                'status': application.status,
                'created_at': application.created_at.isoformat(),
                'updated_at': application.updated_at.isoformat(),
            })
        return JsonResponse({
            'success': True,
            'data': applications_data
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET", "PATCH"])
def application_detail(request, application_id):
    """Detalle de una aplicación y actualización."""
    try:
        # Verificar autenticación
        current_user = get_user_from_token(request)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        try:
            application = Aplicacion.objects.get(id=application_id)
        except Aplicacion.DoesNotExist:
            return JsonResponse({'error': 'Aplicación no encontrada'}, status=404)
        
        if request.method == "PATCH":
            # Actualizar aplicación
            data = json.loads(request.body)
            
            # Verificar permisos (solo la empresa del proyecto puede actualizar)
            if current_user.role == 'company':
                if not application.project.company or str(application.project.company.user.id) != str(current_user.id):
                    return JsonResponse({'error': 'Acceso denegado'}, status=403)
            elif current_user.role == 'student':
                if not application.student or str(application.student.user.id) != str(current_user.id):
                    return JsonResponse({'error': 'Acceso denegado'}, status=403)
            
            # Actualizar campos permitidos
            if 'status' in data:
                application.status = data['status']
            
            if 'company_notes' in data:
                application.company_notes = data['company_notes']
            
            if 'student_notes' in data:
                application.student_notes = data['student_notes']
            

            
            # Actualizar fechas según el estado
            from django.utils import timezone
            if data.get('status') in ['reviewing', 'interviewed']:
                application.reviewed_at = timezone.now()
            elif data.get('status') in ['accepted', 'rejected', 'withdrawn']:
                application.responded_at = timezone.now()
            
            application.save()
            
            # Retornar aplicación actualizada
            return JsonResponse({
                'id': str(application.id),
                'status': application.status,
                'company_notes': application.company_notes,
                'student_notes': application.student_notes,
                'reviewed_at': application.reviewed_at.isoformat() if application.reviewed_at else None,
                'responded_at': application.responded_at.isoformat() if application.responded_at else None,
                'updated_at': application.updated_at.isoformat(),
            })
        
        # GET: devolver detalle
        application_data = {
            'id': str(application.id),
            'status': application.status,
            'created_at': application.created_at.isoformat(),
            'updated_at': application.updated_at.isoformat(),
        }
        
        return JsonResponse(application_data)
        
    except Exception as e:
        print(f"❌ ERROR en application_detail: {e}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def my_applications(request):
    """Devuelve las aplicaciones del estudiante autenticado con datos de proyecto y empresa."""
    print(f"🔍 [my_applications] Iniciando endpoint")
    try:
        # Verificar autenticación
        current_user = get_user_from_token(request)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        # Obtener el perfil de estudiante
        try:
            student = current_user.estudiante_profile
        except Exception:
            return JsonResponse({'error': 'Perfil de estudiante no encontrado'}, status=404)
        # Obtener aplicaciones del estudiante
        from .models import Aplicacion
        applications = Aplicacion.objects.filter(student=student).select_related('project', 'project__company')
        print(f"🔍 [my_applications] Aplicaciones encontradas: {applications.count()}")
        
        # Verificar que las aplicaciones tienen proyectos con empresas
        for app in applications:
            if app.project and app.project.company:
                print(f"🔍 [my_applications] ✅ Proyecto '{app.project.title}' tiene empresa: '{app.project.company.company_name}'")
            elif app.project:
                print(f"🔍 [my_applications] ❌ Proyecto '{app.project.title}' NO tiene empresa")
            else:
                print(f"🔍 [my_applications] ❌ Aplicación {app.id} NO tiene proyecto")
        
        applications_data = []
        for app in applications:
            # Verificar que el proyecto existe
            if not app.project:
                continue
            
            application_data = {
                'id': str(app.id),
                'project': str(app.project.id),  # ID del proyecto como string
                'status': app.status,
                'created_at': app.created_at.isoformat(),
                'updated_at': app.updated_at.isoformat(),
                'applied_at': app.applied_at.isoformat() if app.applied_at else None,
                'responded_at': app.responded_at.isoformat() if app.responded_at else None,
                'student_notes': app.student_notes,
                'cover_letter': app.cover_letter,
                # Campos del proyecto como campos planos
                'project_title': app.project.title,
                'project_description': app.project.description if app.project.description else 'Sin descripción',
                'requirements': getattr(app.project, 'requirements', ''),
                'projectDuration': f"{getattr(app.project, 'duration_weeks', 0)} semanas" if getattr(app.project, 'duration_weeks', 0) else 'No especificado',
                'location': getattr(app.project, 'location', 'Remoto'),
                'modality': getattr(app.project, 'modality', 'Presencial'),
                'required_hours': getattr(app.project, 'required_hours', 0),
                'hours_per_week': getattr(app.project, 'hours_per_week', 0),
                'max_students': getattr(app.project, 'max_students', 1),
                'current_students': getattr(app.project, 'current_students', 0),
                'trl_level': getattr(app.project.trl, 'level', 1) if app.project.trl else 1,
                'api_level': getattr(app.project, 'api_level', 1),
                'area': app.project.area.name if app.project.area else 'Sin área',
                'company': app.project.company.company_name if app.project.company else 'Empresa no especificada',
                'student_name': f"{app.student.user.first_name} {app.student.user.last_name}".strip() if app.student and app.student.user else 'Estudiante no encontrado',
                'student_email': app.student.user.email if app.student and app.student.user else 'Sin email',
                'requiredSkills': getattr(app.project, 'required_skills', []),
                'compatibility': 0,  # Se calculará en el frontend si es necesario
            }
            
            print(f"🔍 [my_applications] Datos creados para '{app.project.title}':")
            print(f"   - project_title: {application_data['project_title']}")
            print(f"   - company: {application_data['company']}")
            print(f"   - project_description: {application_data['project_description']}")
            
            applications_data.append(application_data)
        
        response_data = {
            'results': applications_data,
            'total': applications.count()
        }
        
        print(f"🔍 [my_applications] Devolviendo {len(applications_data)} aplicaciones")
        if applications_data:
            print(f"🔍 [my_applications] Primera aplicación - project_title: {applications_data[0].get('project_title', 'NO ENCONTRADO')}")
            print(f"🔍 [my_applications] Primera aplicación - company: {applications_data[0].get('company', 'NO ENCONTRADO')}")
            
            # Verificar la estructura completa de la primera aplicación
            print(f"🔍 [my_applications] Estructura completa de la primera aplicación:")
            for key, value in applications_data[0].items():
                print(f"   - {key}: {value}")
        
        return JsonResponse(response_data)
    except Exception as e:
        print(f"❌ [my_applications] Error: {e}")
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def received_applications(request):
    """Devuelve las aplicaciones recibidas por la empresa autenticada."""
    try:
        # Verificar autenticación
        current_user = get_user_from_token(request)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Verificar que sea una empresa
        if current_user.role != 'company':
            return JsonResponse({'error': 'Acceso denegado. Solo empresas pueden ver aplicaciones recibidas.'}, status=403)
        
        # Obtener la empresa del usuario
        try:
            company = current_user.empresa_profile
        except Exception:
            return JsonResponse({'error': 'Perfil de empresa no encontrado'}, status=404)
        
        # Obtener aplicaciones de proyectos de la empresa
        from .models import Aplicacion
        print(f"🔍 [BACKEND] Buscando aplicaciones para empresa: {company.company_name}")
        
        applications = Aplicacion.objects.filter(
            project__company=company
        ).select_related(
            'project', 
            'student', 
            'student__user'
        ).order_by('-created_at')
        
        print(f"🔍 [BACKEND] Aplicaciones encontradas: {applications.count()}")
        for app in applications:
            print(f"🔍 [BACKEND] - {app.id}: {app.project.title if app.project else 'Sin proyecto'} -> {app.student.user.full_name if app.student and app.student.user else 'Sin estudiante'}")
            if app.student:
                print(f"🔍 [BACKEND]   Estudiante ID: {app.student.id}")
                print(f"🔍 [BACKEND]   Estudiante User: {app.student.user.id if app.student.user else 'Sin user'}")
                print(f"🔍 [BACKEND]   Estudiante Keys: {[field.name for field in app.student._meta.fields]}")
            else:
                print(f"🔍 [BACKEND]   NO HAY ESTUDIANTE")
        
        applications_data = []
        for app in applications:
            print(f"🔍 [BACKEND] Procesando aplicación {app.id}")
            student_user = app.student.user if app.student else None
            print(f"🔍 [BACKEND] Student user: {student_user}")
            if student_user:
                print(f"🔍 [BACKEND]   User first_name: '{student_user.first_name}'")
                print(f"🔍 [BACKEND]   User last_name: '{student_user.last_name}'")
                print(f"🔍 [BACKEND]   User full_name: '{student_user.full_name}'")
                print(f"🔍 [BACKEND]   User email: '{student_user.email}'")
            # Obtener perfil detallado si existe
            perfil_detallado = getattr(app.student, 'perfil_detallado', None) if app.student else None
            print(f"🔍 [BACKEND] Perfil detallado: {perfil_detallado}")
            # Habilidades y certificados
            try:
                student_skills = app.student.get_skills_list() if app.student else []
            except:
                student_skills = []
            
            # El modelo Estudiante no tiene campo languages, usar lista vacía
            student_languages = []
            
            try:
                certificaciones = perfil_detallado.get_certificaciones_list() if perfil_detallado else []
            except:
                certificaciones = []
            
            try:
                proyectos_personales = perfil_detallado.get_proyectos_personales_list() if perfil_detallado else []
            except:
                proyectos_personales = []
            
            try:
                tecnologias_preferidas = perfil_detallado.get_tecnologias_preferidas_list() if perfil_detallado else []
            except:
                tecnologias_preferidas = []
            
            try:
                industrias_interes = perfil_detallado.get_industrias_interes_list() if perfil_detallado else []
            except:
                industrias_interes = []
            
            try:
                tipo_proyectos_preferidos = perfil_detallado.get_tipo_proyectos_preferidos_list() if perfil_detallado else []
            except:
                tipo_proyectos_preferidos = []
            applications_data.append({
                'id': str(app.id),
                'project': {
                    'id': str(app.project.id),
                    'title': app.project.title,
                    'description': app.project.description,
                    'status': app.project.status.name if app.project.status else 'Sin estado',
                } if app.project else {},
                'student': {
                    'id': str(app.student.id) if app.student else None,
                    'user': {
                        'id': str(app.student.user.id) if app.student and app.student.user else None,
                        'full_name': student_user.full_name if student_user else 'Sin nombre',
                        'email': student_user.email if student_user else '',
                    } if app.student and app.student.user else None,
                    'name': student_user.full_name if student_user else 'Sin nombre',
                    'email': student_user.email if student_user else '',
                    'career': app.student.career if app.student else None,
                    'semester': app.student.semester if app.student else None,
                    'api_level': app.student.api_level if app.student else 1,
                    'gpa': float(app.student.gpa) if app.student else 0,
                    'university': app.student.university if app.student else None,
                    'education_level': app.student.education_level if app.student else None,
                    'graduation_year': None,  # Campo no existe en el modelo Estudiante
                    'availability': app.student.availability if app.student else None,
                    'location': app.student.location if app.student else None,
                    'area': app.student.area if app.student else None,
                    'portfolio_url': app.student.portfolio_url if app.student else None,
                    'github_url': app.student.github_url if app.student else None,
                    'linkedin_url': app.student.linkedin_url if app.student else None,
                    'cv_link': app.student.cv_link if app.student else None,
                    'certificado_link': app.student.certificado_link if app.student else None,
                    'skills': student_skills,
                    'languages': student_languages,
                    'experience_years': app.student.experience_years if app.student else None,
                    'completed_projects': app.student.completed_projects if app.student else None,
                    'hours_per_week': app.student.hours_per_week if app.student else 20,
                    'bio': student_user.bio if student_user else None,
                    'perfil_detallado': {
                        'fecha_nacimiento': perfil_detallado.fecha_nacimiento.isoformat() if perfil_detallado and perfil_detallado.fecha_nacimiento else None,
                        'genero': perfil_detallado.genero if perfil_detallado else None,
                        'nacionalidad': perfil_detallado.nacionalidad if perfil_detallado else None,
                        'universidad': perfil_detallado.universidad if perfil_detallado else None,
                        'facultad': perfil_detallado.facultad if perfil_detallado else None,
                        'promedio_historico': float(perfil_detallado.promedio_historico) if perfil_detallado and perfil_detallado.promedio_historico else None,
                        'experiencia_laboral': perfil_detallado.experiencia_laboral if perfil_detallado else None,
                        'certificaciones': certificaciones,
                        'proyectos_personales': proyectos_personales,
                        'tecnologias_preferidas': tecnologias_preferidas,
                        'industrias_interes': industrias_interes,
                        'tipo_proyectos_preferidos': tipo_proyectos_preferidos,
                        'telefono_emergencia': perfil_detallado.telefono_emergencia if perfil_detallado else None,
                        'contacto_emergencia': perfil_detallado.contacto_emergencia if perfil_detallado else None,
                    } if perfil_detallado else None,
                } if app.student else {},
                'status': app.status,
                'cover_letter': app.cover_letter,
                'company_notes': app.company_notes,
                'student_notes': app.student_notes,
                'portfolio_url': app.portfolio_url,
                'github_url': app.github_url,
                'linkedin_url': app.linkedin_url,
                'applied_at': app.applied_at.isoformat() if app.applied_at else app.created_at.isoformat(),
                'reviewed_at': app.reviewed_at.isoformat() if app.reviewed_at else None,
                'responded_at': app.responded_at.isoformat() if app.responded_at else None,
                'created_at': app.created_at.isoformat(),
                'updated_at': app.updated_at.isoformat(),
            })
        
        return JsonResponse({
            'success': True,
            'data': applications_data,  # Cambiar 'results' por 'data' para consistencia
            'total': applications.count()
        })
        
    except Exception as e:
        print(f"❌ ERROR en received_applications: {e}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': str(e)}, status=500)

@require_auth
def company_students_history(request):
    """
    Obtiene el registro histórico único de todos los estudiantes que alguna vez 
    postularon a proyectos de la empresa, sin duplicados.
    
    Esta es la lógica correcta para la interfaz de búsqueda de estudiantes:
    - Muestra estudiantes únicos que han postulado
    - Incluye información completa del perfil
    - Permite a la empresa tener una red de contactos
    """
    try:
        print(f"🔍 [company_students_history] INICIANDO VISTA")
        print(f"🔍 [company_students_history] Request method: {request.method}")
        print(f"🔍 [company_students_history] Request headers: {dict(request.headers)}")
        print(f"🔍 [company_students_history] Request user: {request.user}")
        print(f"🔍 [company_students_history] Request user role: {getattr(request.user, 'role', 'NO ROLE')}")
        print(f"🔍 [company_students_history] Iniciando para empresa: {request.user.email}")
        
        # Verificar que sea una empresa
        if request.user.role != 'company':
            return JsonResponse({'error': 'Solo las empresas pueden acceder a este endpoint'}, status=403)
        
        # Obtener proyectos de la empresa
        try:
            company = request.user.empresa_profile
            company_projects = company.proyectos.all()
            print(f"🔍 [company_students_history] Proyectos de la empresa: {company_projects.count()}")
        except Exception as e:
            print(f"❌ [company_students_history] Error obteniendo empresa: {e}")
            return JsonResponse({'error': 'Error obteniendo información de la empresa'}, status=500)
        
        if company_projects.count() == 0:
            print(f"⚠️ [company_students_history] No hay proyectos en la empresa")
            return JsonResponse({
                'results': [],
                'count': 0,
                'message': 'No hay proyectos registrados en tu empresa'
            })
        
        # Obtener todas las postulaciones para proyectos de la empresa
        applications = Aplicacion.objects.filter(
            project__in=company_projects
        ).select_related(
            'student__user',
            'project'
        ).order_by('-created_at')
        
        print(f"🔍 [company_students_history] Total de postulaciones encontradas: {applications.count()}")
        
        # Crear un mapa de estudiantes únicos basado en las postulaciones
        unique_students = {}
        
        for application in applications:
            student = application.student
            if not student or not student.user:
                continue
                
            student_id = str(student.id)
            
            # Si ya procesamos este estudiante, solo agregar la aplicación a su historial
            if student_id in unique_students:
                unique_students[student_id]['applications'].append({
                    'id': str(application.id),
                    'project_title': application.project.title,
                    'project_id': str(application.project.id),
                    'status': application.status,
                    'applied_at': application.applied_at.isoformat(),
                    'cover_letter': application.cover_letter or ''
                })
                continue
            
            # Procesar nuevo estudiante
            try:
                # Obtener habilidades del estudiante
                student_skills = []
                if hasattr(student, 'skills') and student.skills:
                    try:
                        if isinstance(student.skills, str):
                            student_skills = json.loads(student.skills)
                        elif isinstance(student.skills, list):
                            student_skills = student.skills
                    except:
                        student_skills = []
                
                # Crear objeto del estudiante con toda su información
                student_data = {
                    'id': student_id,
                    'user_id': str(student.user.id),
                    'name': (
                        student.user.full_name if student.user.full_name and student.user.full_name != student.user.email 
                        else f"{student.user.first_name or ''} {student.user.last_name or ''}".strip() 
                        if (student.user.first_name or student.user.last_name)
                        else student.user.email
                    ),
                    'email': student.user.email,
                    'university': getattr(student, 'university', None) or 'No especificada',
                    'career': getattr(student, 'career', None) or 'No especificada',
                    'semester': getattr(student, 'semester', None),
                    'api_level': getattr(student, 'api_level', 1),
                    'gpa': float(getattr(student, 'gpa', 0)) if getattr(student, 'gpa', None) else None,
                    'skills': student_skills,
                    'experience_years': getattr(student, 'experience_years', 0),
                    'availability': getattr(student, 'availability', 'No especificada'),
                    'bio': getattr(student.user, 'bio', '') or '',
                    'phone': getattr(student.user, 'phone', '') or '',
                    'location': getattr(student, 'location', '') or '',
                    'area': getattr(student, 'area', '') or '',
                    'portfolio_url': getattr(student, 'portfolio_url', '') or '',
                    'github_url': getattr(student, 'github_url', '') or '',
                    'linkedin_url': getattr(student, 'linkedin_url', '') or '',
                    'cv_link': getattr(student, 'cv_link', '') or '',
                    'certificado_link': getattr(student, 'certificado_link', '') or '',
                    'education_level': getattr(student, 'education_level', '') or '',
                    'hours_per_week': getattr(student, 'hours_per_week', 20),
                    'birthdate': student.user.birthdate.isoformat() if student.user.birthdate else None,
                    'gender': getattr(student.user, 'gender', '') or '',
                    'department': getattr(student.user, 'department', '') or '',
                    'position': getattr(student.user, 'position', '') or '',
                    'company_name': getattr(student.user, 'company_name', '') or '',
                    'status': student.status,
                    'strikes': student.strikes,
                    'completed_projects': student.completed_projects,
                    'total_hours': student.total_hours,
                    'created_at': student.created_at.isoformat(),
                    'updated_at': student.updated_at.isoformat(),
                    # Historial de aplicaciones
                    'applications': [{
                        'id': str(application.id),
                        'project_title': application.project.title,
                        'project_id': str(application.project.id),
                        'status': application.status,
                        'applied_at': application.applied_at.isoformat(),
                        'cover_letter': application.cover_letter or ''
                    }]
                }
                
                unique_students[student_id] = student_data
                print(f"✅ [company_students_history] Estudiante procesado: {student_data['name']}")
                print(f"🔍 [company_students_history] Datos del estudiante: id={student_data['id']}, user_id={student_data['user_id']}, name={student_data['name']}")
                
            except Exception as e:
                print(f"❌ [company_students_history] Error procesando estudiante {student_id}: {e}")
                continue
        
        # Convertir el mapa a lista
        students_list = list(unique_students.values())
        
        print(f"✅ [company_students_history] Total de estudiantes únicos: {len(students_list)}")
        
        # Logging detallado de lo que se devuelve
        if students_list:
            first_student = students_list[0]
            print(f"🔍 [company_students_history] Primer estudiante devuelto:")
            print(f"   - id: {first_student.get('id')}")
            print(f"   - user_id: {first_student.get('user_id')}")
            print(f"   - name: {first_student.get('name')}")
            print(f"   - email: {first_student.get('email')}")
            print(f"   - Keys disponibles: {list(first_student.keys())}")
        
        return JsonResponse({
            'results': students_list,
            'count': len(students_list),
            'message': f'Se encontraron {len(students_list)} estudiantes únicos que han postulado a proyectos de tu empresa'
        })
        
    except Exception as e:
        print(f"💥 [company_students_history] Error general: {e}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': f'Error interno: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
@require_auth
def accept_application(request, application_id):
    """Aceptar una postulación"""
    try:
        # Verificar que sea una empresa
        if request.user.role != 'company':
            return JsonResponse({'error': 'Solo las empresas pueden aceptar postulaciones'}, status=403)
        
        # Obtener la aplicación
        application = get_object_or_404(Aplicacion, id=application_id)
        
        # Verificar que el proyecto pertenezca a la empresa
        if application.project.company != request.user.empresa_profile:
            return JsonResponse({'error': 'No tienes permisos para esta postulación'}, status=403)
        
        # Leer notas de la empresa
        data = json.loads(request.body) if request.body else {}
        company_notes = data.get('company_notes', '')
        
        # Aceptar la aplicación
        if application.aceptar(company_notes):
            # Enviar notificación al estudiante
            try:
                NotificationService.notify_application_accepted(application)
            except Exception as e:
                print(f"Error al enviar notificación de aceptación: {str(e)}")
            
            return JsonResponse({
                'success': True,
                'message': 'Postulación aceptada correctamente',
                'application_id': str(application.id)
            })
        else:
            return JsonResponse({
                'error': 'No se puede aceptar esta postulación'
            }, status=400)
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
@require_auth
def reject_application(request, application_id):
    """Rechazar una postulación"""
    try:
        # Verificar que sea una empresa
        if request.user.role != 'company':
            return JsonResponse({'error': 'Solo las empresas pueden rechazar postulaciones'}, status=403)
        
        # Obtener la aplicación
        application = get_object_or_404(Aplicacion, id=application_id)
        
        # Verificar que el proyecto pertenezca a la empresa
        if application.project.company != request.user.empresa_profile:
            return JsonResponse({'error': 'No tienes permisos para esta postulación'}, status=403)
        
        # Leer notas de la empresa
        data = json.loads(request.body) if request.body else {}
        company_notes = data.get('company_notes', '')
        
        # Rechazar la aplicación
        application.rechazar(company_notes)
        
        # Enviar notificación al estudiante
        try:
            NotificationService.notify_application_rejected(application)
        except Exception as e:
            print(f"Error al enviar notificación de rechazo: {str(e)}")
        
        return JsonResponse({
            'success': True,
            'message': 'Postulación rechazada correctamente',
            'application_id': str(application.id)
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@require_auth
def test_company_endpoint(request):
    """
    Endpoint de prueba simple para verificar que el backend esté funcionando
    """
    try:
        print(f"🔍 [test_company_endpoint] Test endpoint llamado por: {request.user.email}")
        
        # Verificar que sea una empresa
        if request.user.role != 'company':
            return JsonResponse({'error': 'Solo las empresas pueden acceder a este endpoint'}, status=403)
        
        # Retornar datos de prueba
        test_data = {
            'message': 'Backend funcionando correctamente',
            'user_email': request.user.email,
            'user_role': request.user.role,
            'timestamp': timezone.now().isoformat(),
            'test_students': [
                {
                    'id': 'test-1',
                    'name': 'Estudiante de Prueba 1',
                    'email': 'test1@example.com',
                    'university': 'Universidad de Prueba',
                    'career': 'Ingeniería de Prueba',
                    'skills': ['Python', 'React', 'Django'],
                    'applications': [
                        {
                            'id': 'app-1',
                            'project_title': 'Proyecto de Prueba',
                            'status': 'pending'
                        }
                    ]
                }
            ]
        }
        
        return JsonResponse(test_data)
        
    except Exception as e:
        print(f"💥 [test_company_endpoint] Error: {e}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': f'Error interno: {str(e)}'}, status=500)

@require_auth
def debug_company_students_data(request):
    """
    Endpoint de debug para examinar exactamente qué datos están en la base de datos
    """
    try:
        print(f"🔍 [debug_company_students_data] Iniciando debug para empresa: {request.user.email}")
        
        # Verificar que sea una empresa
        if request.user.role != 'company':
            return JsonResponse({'error': 'Solo las empresas pueden acceder a este endpoint'}, status=403)
        
        # Obtener proyectos de la empresa
        try:
            company = request.user.empresa_profile
            company_projects = company.proyectos.all()
            print(f"🔍 [debug_company_students_data] Proyectos de la empresa: {company_projects.count()}")
        except Exception as e:
            print(f"❌ [debug_company_students_data] Error obteniendo empresa: {e}")
            return JsonResponse({'error': 'Error obteniendo información de la empresa'}, status=500)
        
        if company_projects.count() == 0:
            return JsonResponse({'error': 'No hay proyectos registrados en tu empresa'})
        
        # Obtener todas las postulaciones para proyectos de la empresa
        applications = Aplicacion.objects.filter(
            project__in=company_projects
        ).select_related(
            'student__user',
            'project'
        ).order_by('-created_at')
        
        print(f"🔍 [debug_company_students_data] Total de postulaciones encontradas: {applications.count()}")
        
        # Crear un mapa de estudiantes únicos basado en las postulaciones
        unique_students = {}
        
        for application in applications:
            student = application.student
            if not student or not student.user:
                continue
                
            student_id = str(student.id)
            
            # Si ya procesamos este estudiante, solo agregar la aplicación a su historial
            if student_id in unique_students:
                unique_students[student_id]['applications'].append({
                    'id': str(application.id),
                    'project_title': application.project.title,
                    'project_id': str(application.project.id),
                    'status': application.status,
                    'applied_at': application.applied_at.isoformat(),
                    'cover_letter': application.cover_letter or ''
                })
                continue
            
            # Procesar nuevo estudiante
            try:
                # DEBUG: Mostrar datos crudos de la base de datos
                print(f"🔍 [DEBUG] Datos crudos del estudiante {student_id}:")
                print(f"  - student.id: {student.id}")
                print(f"  - student.user.id: {student.user.id}")
                print(f"  - student.user.email: {student.user.email}")
                print(f"  - student.user.first_name: '{student.user.first_name}'")
                print(f"  - student.user.last_name: '{student.user.last_name}'")
                print(f"  - student.user.full_name: '{student.user.full_name}'")
                print(f"  - student.university: '{getattr(student, 'university', None)}'")
                print(f"  - student.career: '{getattr(student, 'career', None)}'")
                print(f"  - student.skills: '{getattr(student, 'skills', None)}'")
                
                # Obtener habilidades del estudiante
                student_skills = []
                if hasattr(student, 'skills') and student.skills:
                    try:
                        if isinstance(student.skills, str):
                            student_skills = json.loads(student.skills)
                        elif isinstance(student.skills, list):
                            student_skills = student.skills
                    except:
                        student_skills = []
                
                # Crear objeto del estudiante con toda su información
                student_data = {
                    'id': student_id,
                    'user_id': str(student.user.id),
                    'name': (
                        student.user.full_name if student.user.full_name and student.user.full_name != student.user.email 
                        else f"{student.user.first_name or ''} {student.user.last_name or ''}".strip() 
                        if (student.user.first_name or student.user.last_name)
                        else student.user.email
                    ),
                    'email': student.user.email,
                    'university': getattr(student, 'university', None) or 'No especificada',
                    'career': getattr(student, 'career', None) or 'No especificada',
                    'semester': getattr(student, 'semester', None),
                    'api_level': getattr(student, 'api_level', 1),
                    'gpa': float(getattr(student, 'gpa', 0)) if getattr(student, 'gpa', None) else None,
                    'skills': student_skills,
                    'experience_years': getattr(student, 'experience_years', 0),
                    'availability': getattr(student, 'availability', 'No especificada'),
                    'bio': getattr(student.user, 'bio', '') or '',
                    'phone': getattr(student.user, 'phone', '') or '',
                    'location': getattr(student, 'location', '') or '',
                    'area': getattr(student, 'area', '') or '',
                    'portfolio_url': getattr(student, 'portfolio_url', '') or '',
                    'github_url': getattr(student, 'github_url', '') or '',
                    'linkedin_url': getattr(student, 'linkedin_url', '') or '',
                    'cv_link': getattr(student, 'cv_link', '') or '',
                    'certificado_link': getattr(student, 'certificado_link', '') or '',
                    'education_level': getattr(student, 'education_level', '') or '',
                    'hours_per_week': getattr(student, 'hours_per_week', 20),
                    'birthdate': student.user.birthdate.isoformat() if student.user.birthdate else None,
                    'gender': getattr(student.user, 'gender', '') or '',
                    'department': getattr(student.user, 'department', '') or '',
                    'position': getattr(student.user, 'position', '') or '',
                    'company_name': getattr(student.user, 'company_name', '') or '',
                    'status': student.status,
                    'strikes': student.strikes,
                    'completed_projects': student.completed_projects,
                    'total_hours': student.total_hours,
                    'created_at': student.created_at.isoformat(),
                    'updated_at': student.updated_at.isoformat(),
                    # Historial de aplicaciones
                    'applications': [{
                        'id': str(application.id),
                        'project_title': application.project.title,
                        'project_id': str(application.project.id),
                        'status': application.status,
                        'applied_at': application.applied_at.isoformat(),
                        'cover_letter': application.cover_letter or ''
                    }]
                }
                
                unique_students[student_id] = student_data
                print(f"✅ [debug_company_students_data] Estudiante procesado: {student_data['name']}")
                
            except Exception as e:
                print(f"❌ [debug_company_students_data] Error procesando estudiante {student_id}: {e}")
                continue
        
        # Convertir el mapa a lista
        students_list = list(unique_students.values())
        
        print(f"✅ [debug_company_students_data] Total de estudiantes únicos: {len(students_list)}")
        
        # Retornar información de debug
        debug_response = {
            'debug_info': 'Datos de debug para frontend',
            'company_projects_count': company_projects.count(),
            'applications_count': applications.count(),
            'unique_students_count': len(students_list),
            'sample_student': students_list[0] if students_list else None,
            'sample_student_keys': list(students_list[0].keys()) if students_list else [],
            'full_response_structure': {
                'results': students_list,
                'count': len(students_list),
                'message': f'Se encontraron {len(students_list)} estudiantes únicos que han postulado a proyectos de tu empresa'
            }
        }
        
        return JsonResponse(debug_response)
        
    except Exception as e:
        print(f"💥 [debug_company_students_data] Error general: {e}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': f'Error interno: {str(e)}'}, status=500)
