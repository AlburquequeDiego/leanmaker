"""
Views para la app applications.
"""

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
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
            company = current_user.company_profile
        except Exception:
            return JsonResponse({'error': 'Perfil de empresa no encontrado'}, status=404)
        
        # Obtener aplicaciones de proyectos de la empresa
        from .models import Aplicacion
        applications = Aplicacion.objects.filter(
            project__company=company
        ).select_related(
            'project', 
            'student', 
            'student__user'
        ).order_by('-applied_at')
        
        applications_data = []
        for app in applications:
            student_user = app.student.user if app.student else None
            # Obtener perfil detallado si existe
            perfil_detallado = getattr(app.student, 'perfil_detallado', None) if app.student else None
            # Habilidades y certificados
            student_skills = app.student.get_skills_list() if app.student else []
            student_languages = app.student.get_languages_list() if app.student else []
            certificaciones = perfil_detallado.get_certificaciones_list() if perfil_detallado else []
            proyectos_personales = perfil_detallado.get_proyectos_personales_list() if perfil_detallado else []
            tecnologias_preferidas = perfil_detallado.get_tecnologias_preferidas_list() if perfil_detallado else []
            industrias_interes = perfil_detallado.get_industrias_interes_list() if perfil_detallado else []
            tipo_proyectos_preferidos = perfil_detallado.get_tipo_proyectos_preferidos_list() if perfil_detallado else []
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
                    'user': str(app.student.user.id) if app.student and app.student.user else None,
                    'name': f"{student_user.first_name} {student_user.last_name}".strip() if student_user else 'Sin nombre',
                    'email': student_user.email if student_user else '',
                    'career': app.student.career if app.student else None,
                    'semester': app.student.semester if app.student else None,
                    'api_level': app.student.api_level if app.student else 1,
                                          'gpa': float(app.student.gpa) if app.student else 0,
                    'university': app.student.university if app.student else None,
                    'education_level': app.student.education_level if app.student else None,
                    'graduation_year': app.student.graduation_year if app.student else None,
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
                'applied_at': app.applied_at.isoformat() if app.applied_at else None,
                'reviewed_at': app.reviewed_at.isoformat() if app.reviewed_at else None,
                'responded_at': app.responded_at.isoformat() if app.responded_at else None,
                'created_at': app.created_at.isoformat(),
                'updated_at': app.updated_at.isoformat(),
            })
        
        return JsonResponse({
            'results': applications_data, 
            'total': applications.count()
        })
        
    except Exception as e:
        print(f"❌ ERROR en received_applications: {e}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
@require_auth
def company_applications_list(request):
    """Lista de postulaciones para proyectos de la empresa"""
    try:
        # Verificar que sea una empresa
        if request.user.role != 'company':
            return JsonResponse({'error': 'Solo las empresas pueden ver postulaciones'}, status=403)
        
        # Obtener proyectos de la empresa
        company_projects = request.user.empresa_profile.proyectos.all()
        
        # Obtener postulaciones para esos proyectos
        applications = Aplicacion.objects.filter(
            project__in=company_projects
        ).select_related(
            'student__user',
            'project'
        ).order_by('-applied_at')
        
        applications_data = []
        for application in applications:
            # Obtener datos del estudiante
            student = application.student
            student_user = student.user
            
            # Obtener habilidades del estudiante
            student_skills = []
            if hasattr(student, 'skills') and student.skills:
                try:
                    import json
                    student_skills = json.loads(student.skills)
                except:
                    student_skills = []
            
            # Obtener certificados del estudiante
            student_certificates = []
            try:
                if hasattr(student, 'perfil_detallado') and student.perfil_detallado:
                    student_certificates = student.perfil_detallado.get_certificaciones_list()
            except:
                student_certificates = []
            
            applications_data.append({
                'id': str(application.id),
                'student_name': student_user.full_name,
                'student_email': student_user.email,
                'student_id': str(student.id),
                'project_title': application.project.title,
                'project_id': str(application.project.id),
                'status': application.status,
                'cover_letter': application.cover_letter or '',
                'applied_at': application.applied_at.isoformat(),
                'compatibility_score': None,  # Campo no disponible en el modelo actual
                'portfolio_url': application.portfolio_url,
                'github_url': application.github_url,
                'linkedin_url': application.linkedin_url,
                # Datos del estudiante
                'student_api_level': getattr(student, 'api_level', None),
                'student_gpa': getattr(student, 'gpa', None),
                'student_skills': student_skills,
                'student_experience_years': getattr(student, 'experience_years', None),
                'student_availability': getattr(student, 'availability', None),
                'student_bio': getattr(student_user, 'bio', None),
                'student_phone': getattr(student_user, 'phone', None),
                'student_location': getattr(student_user, 'location', None),
                'student_university': getattr(student, 'university', None),
                'student_major': getattr(student, 'career', None),  # Usar 'career' en lugar de 'major'
                'student_certificates': student_certificates,
                'student_cv_url': getattr(student, 'cv_link', None),  # Usar 'cv_link' en lugar de 'cv_url'
            })
        
        return JsonResponse({
            'results': applications_data,
            'count': len(applications_data)
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

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
