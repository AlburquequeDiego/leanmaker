"""
Views para la app admin - Endpoints de administración
"""

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.db.models import Q, Count, Avg, Sum
from django.utils import timezone
from datetime import datetime, timedelta
from core.views import verify_token
from users.models import User
from students.models import Estudiante
from companies.models import Empresa
from projects.models import Proyecto
from applications.models import Aplicacion
from work_hours.models import WorkHour
from evaluations.models import Evaluation
from notifications.models import Notification
from platform_settings.models import PlatformSetting

def require_admin_auth(view_func):
    """Decorator para verificar autenticación de admin"""
    def wrapper(request, *args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user or current_user.role != 'admin':
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        return view_func(request, current_user, *args, **kwargs)
    return wrapper

@csrf_exempt
@require_http_methods(["GET"])
@require_admin_auth
def admin_students_list(request, current_user):
    """Lista de estudiantes para administrador"""
    try:
        page = int(request.GET.get('page', 1))
        limit = int(request.GET.get('limit', 10))
        offset = (page - 1) * limit
        search = request.GET.get('search', '')
        api_level = request.GET.get('api_level', '')
        status = request.GET.get('status', '')
        
        queryset = Estudiante.objects.select_related('user').all()
        
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
            queryset = queryset.filter(status=status)
        
        total_count = queryset.count()
        students = queryset[offset:offset + limit]
        
        students_data = []
        for student in students:
            students_data.append({
                'id': str(student.id),
                'name': student.user.full_name,
                'email': student.user.email,
                'api_level': student.api_level,
                'trl_level': 1,
                'total_hours': student.total_hours,
                'company_name': None,
                'status': student.status,
                'strikes': student.strikes,
                'created_at': student.created_at.isoformat(),
                'last_activity': student.updated_at.isoformat(),
                'career': student.career,
                'semester': student.semester,
                'gpa': float(student.gpa),
                'completed_projects': student.completed_projects,
                'experience_years': student.experience_years,
                'rating': float(student.rating),
                'skills': student.get_skills_list(),
                'languages': student.get_languages_list(),
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
@require_admin_auth
def admin_projects_list(request, current_user):
    """Lista de proyectos para administrador"""
    try:
        page = int(request.GET.get('page', 1))
        limit = int(request.GET.get('limit', 10))
        offset = (page - 1) * limit
        search = request.GET.get('search', '')
        company = request.GET.get('company', '')
        status = request.GET.get('status', '')
        
        queryset = Proyecto.objects.select_related('company', 'status', 'area', 'trl').all()
        
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(company__company_name__icontains=search)
            )
        
        if company:
            queryset = queryset.filter(company_id=company)
        
        if status:
            queryset = queryset.filter(status__name=status)
        
        total_count = queryset.count()
        projects = queryset[offset:offset + limit]
        
        projects_data = []
        from ratings.models import Rating
        from django.db.models import Avg
        for project in projects:
            avg_rating = Rating.objects.filter(project=project).aggregate(avg_rating=Avg('rating'))['avg_rating']
            rating_value = round(avg_rating, 1) if avg_rating else 0
            projects_data.append({
                'id': str(project.id),
                'title': project.title,
                'company_name': project.company.company_name if project.company else 'Sin empresa',
                'company_id': str(project.company.id) if project.company else None,
                'description': project.description,
                'status': project.status.name if project.status else 'Sin estado',
                'required_api_level': project.api_level or 1,
                'required_trl_level': project.trl.level if project.trl else 1,
                'students_needed': project.max_students,
                'students_assigned': project.current_students,
                'applications_count': project.applications_count,
                'start_date': project.start_date.isoformat() if project.start_date else None,
                'end_date': project.estimated_end_date.isoformat() if project.estimated_end_date else None,
                'location': project.location or 'Remoto',
                'rating': rating_value,
                'hours_offered': project.required_hours or 0,
                'created_at': project.created_at.isoformat(),
            })
        
        return JsonResponse({
            'results': projects_data,
            'count': total_count,
            'page': page,
            'limit': limit,
            'total_pages': (total_count + limit - 1) // limit
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
@require_admin_auth
def admin_companies_list(request, current_user):
    """Lista de empresas para administrador"""
    try:
        page = int(request.GET.get('page', 1))
        limit = int(request.GET.get('limit', 10))
        offset = (page - 1) * limit
        search = request.GET.get('search', '')
        status = request.GET.get('status', '')
        
        queryset = Empresa.objects.select_related('user').all()
        
        if search:
            queryset = queryset.filter(
                Q(company_name__icontains=search) |
                Q(description__icontains=search) |
                Q(user__email__icontains=search)
            )
        
        # Aplicar filtro de status basado en el usuario, no en el campo status de la empresa
        if status:
            if status == 'active':
                queryset = queryset.filter(user__is_active=True, user__is_verified=True)
            elif status == 'suspended':
                queryset = queryset.filter(user__is_active=False, user__is_verified=True)
            elif status == 'blocked':
                # Incluir empresas bloqueadas (no verificadas) y empresas sin usuario
                queryset = queryset.filter(
                    Q(user__is_verified=False) | Q(user__isnull=True)
                )
        
        total_count = queryset.count()
        companies = queryset[offset:offset + limit]
        
        companies_data = []
        for company in companies:
            # Calcular status real basado en el usuario
            user_status = 'active'
            if company.user:
                if not company.user.is_verified:
                    user_status = 'blocked'
                elif not company.user.is_active:
                    user_status = 'suspended'
                else:
                    user_status = 'active'
            else:
                user_status = 'blocked'  # Sin usuario = bloqueado
            
            companies_data.append({
                'id': str(company.id),
                'user': str(company.user.id) if company.user else None,  # <-- AÑADIDO: ID del usuario
                'name': company.company_name,
                'email': company.user.email if company.user else '',
                'status': user_status,  # <-- USAR STATUS DEL USUARIO
                'projects_count': company.proyectos.count(),
                'rating': float(company.rating),
                'join_date': company.created_at.isoformat(),
                'last_activity': company.updated_at.isoformat(),
                'description': company.description,
                'phone': company.contact_phone,
                'address': company.address,
                'website': company.website,
                'industry': company.industry,
                'size': company.size,
                'verified': company.verified,
            })
        
        return JsonResponse({
            'results': companies_data,
            'count': total_count,
            'page': page,
            'limit': limit,
            'total_pages': (total_count + limit - 1) // limit
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
@require_admin_auth
def admin_users_list(request, current_user):
    """Lista de usuarios para administrador"""
    try:
        page = int(request.GET.get('page', 1))
        limit = int(request.GET.get('limit', 10))
        offset = (page - 1) * limit
        search = request.GET.get('search', '')
        role = request.GET.get('role', '')
        
        queryset = User.objects.all()
        
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search) |
                Q(username__icontains=search)
            )
        
        if role:
            queryset = queryset.filter(role=role)
        
        total_count = queryset.count()
        users = queryset[offset:offset + limit]
        
        users_data = []
        for user in users:
            # Obtener status real según tipo de usuario
            status = None
            if user.role == 'company':
                try:
                    status = user.empresa_profile.status
                except Exception:
                    status = None
            elif user.role == 'student':
                try:
                    status = user.estudiante_profile.status
                except Exception:
                    status = None
            users_data.append({
                'id': str(user.id),
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'user_type': user.role,
                'is_active': user.is_active,
                'date_joined': user.date_joined.isoformat(),
                'last_login': user.last_login.isoformat() if user.last_login else None,
                'phone': user.phone,
                'avatar': user.avatar,
                'is_verified': user.is_verified,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
                'status': status,
            })
        
        return JsonResponse({
            'results': users_data,
            'count': total_count,
            'page': page,
            'limit': limit,
            'total_pages': (total_count + limit - 1) // limit
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
@require_admin_auth
def admin_work_hours_list(request, current_user):
    """Lista de horas trabajadas para administrador"""
    try:
        page = int(request.GET.get('page', 1))
        limit = int(request.GET.get('limit', 10))
        offset = (page - 1) * limit
        
        queryset = WorkHour.objects.select_related('student', 'project', 'company', 'student__user', 'project__company').all()
        total_count = queryset.count()
        work_hours = queryset[offset:offset + limit]
        
        work_hours_data = []
        for work_hour in work_hours:
            # Calcular nivel API del estudiante y del proyecto (por TRL)
            student_trl = getattr(work_hour.student, 'trl_level', None)
            project_trl = getattr(work_hour.project, 'trl_level', None)
            def trl_to_api(trl):
                if trl is None:
                    return None
                trl = int(trl)
                if trl <= 2:
                    return 1
                elif trl <= 4:
                    return 2
                elif trl <= 6:
                    return 3
                else:
                    return 4
            student_api = trl_to_api(student_trl)
            project_api = trl_to_api(project_trl)
            # Horas API mínimas y máximas por nivel
            api_hours = {1: 20, 2: 40, 3: 80, 4: 160}
            min_api_hours = api_hours.get(student_api, None)
            max_api_hours = api_hours.get(student_api, None)
            # Horas ofrecidas por el proyecto
            project_hours = getattr(work_hour.project, 'required_hours', None) or getattr(work_hour.project, 'hours_per_week', None)
            # Horas ya validadas por el estudiante
            horas_validadas = getattr(work_hour.student, 'horas_validadas', None)
            # GPA/calificación de la empresa y del estudiante (si existen)
            empresa_gpa = getattr(work_hour.company, 'gpa', None)
            estudiante_gpa = getattr(work_hour.student, 'gpa', None)
            # Calificaciones mutuas (estrellas)
            empresa_stars = getattr(work_hour.company, 'stars', None)
            estudiante_stars = getattr(work_hour.student, 'stars', None)
            
            # Información adicional del proyecto
            is_project_completion = "Horas automáticas del proyecto completado" in (work_hour.description or "")
            project_duration_weeks = getattr(work_hour.project, 'duration_weeks', None)
            project_hours_per_week = getattr(work_hour.project, 'hours_per_week', None)
            project_required_hours = getattr(work_hour.project, 'required_hours', None)
            
            # Obtener calificaciones del proyecto si existen
            from ratings.models import Rating
            company_rating = None
            student_rating = None
            try:
                # Buscar calificación de la empresa al estudiante
                company_rating_obj = Rating.objects.filter(
                    project=work_hour.project,
                    user=work_hour.company.user
                ).first()
                if company_rating_obj:
                    company_rating = company_rating_obj.rating
                
                # Buscar calificación del estudiante a la empresa
                student_rating_obj = Rating.objects.filter(
                    project=work_hour.project,
                    user=work_hour.student.user
                ).first()
                if student_rating_obj:
                    student_rating = student_rating_obj.rating
            except:
                pass
            
            work_hours_data.append({
                'id': str(work_hour.id),
                'student_name': work_hour.student.user.full_name,
                'student_email': work_hour.student.user.email,
                'project_title': work_hour.project.title,
                'project_id': str(work_hour.project.id),
                'empresa_nombre': work_hour.company.company_name,
                'empresa_email': work_hour.company.user.email,
                'date': work_hour.date.isoformat(),
                'hours_worked': work_hour.hours_worked,
                'description': work_hour.description,
                'status': 'approved' if work_hour.approved else 'pending',
                'admin_comment': work_hour.description if work_hour.approved_by else None,
                'approved_by': work_hour.approved_by.full_name if work_hour.approved_by else None,
                'approved_at': work_hour.approved_at.isoformat() if work_hour.approved_at else None,
                'created_at': work_hour.created_at.isoformat(),
                'student_api_level': student_api,
                'project_api_level': project_api,
                'min_api_hours': min_api_hours,
                'max_api_hours': max_api_hours,
                'project_hours': project_hours,
                'horas_validadas': horas_validadas,
                'empresa_gpa': empresa_gpa,
                'estudiante_gpa': estudiante_gpa,
                'empresa_stars': empresa_stars,
                'estudiante_stars': estudiante_stars,
                # Campos adicionales para validación de horas de proyectos
                'is_project_completion': is_project_completion,
                'project_duration_weeks': project_duration_weeks,
                'project_hours_per_week': project_hours_per_week,
                'project_required_hours': project_required_hours,
                'company_rating': company_rating,
                'student_rating': student_rating,
            })
        
        return JsonResponse({
            'results': work_hours_data,
            'count': total_count,
            'page': page,
            'limit': limit,
            'total_pages': (total_count + limit - 1) // limit
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
@require_admin_auth
def admin_evaluations_list(request, current_user):
    """Lista de evaluaciones para administrador"""
    try:
        page = int(request.GET.get('page', 1))
        limit = int(request.GET.get('limit', 10))
        offset = (page - 1) * limit
        
        queryset = Evaluation.objects.select_related('project', 'student', 'project__company').all()
        total_count = queryset.count()
        evaluations = queryset[offset:offset + limit]
        
        evaluations_data = []
        for evaluation in evaluations:
            # Obtener información del estudiante (student es User directamente)
            student_name = getattr(evaluation.student, 'full_name', 'Sin nombre') if evaluation.student else 'Sin nombre'
            student_id = str(getattr(evaluation.student, 'id', '')) if evaluation.student else ''
            
            # Obtener información del proyecto
            project = getattr(evaluation, 'project', None)
            project_title = getattr(project, 'title', 'Sin proyecto') if project else 'Sin proyecto'
            project_id = str(getattr(project, 'id', '')) if project else ''
            
            # Obtener información de la empresa
            company = getattr(project, 'company', None) if project else None
            company_name = getattr(company, 'company_name', 'Sin empresa') if company else 'Sin empresa'
            company_id = str(getattr(company, 'id', '')) if company else None
            
            evaluations_data.append({
                'id': str(evaluation.id),
                'student_name': student_name,
                'student_id': student_id,
                'company_name': company_name,
                'company_id': company_id,
                'project_title': project_title,
                'project_id': project_id,
                'score': getattr(evaluation, 'score', 0) or 0,
                'comments': getattr(evaluation, 'comments', ''),
                'evaluation_date': evaluation.evaluation_date.isoformat() if getattr(evaluation, 'evaluation_date', None) else '',
                'status': getattr(evaluation, 'status', 'pending'),
                'evaluator_name': getattr(evaluation, 'evaluator_role', None) or 'Sistema',
                'evaluator_type': getattr(evaluation, 'evaluator_role', 'company'),
                'overall_rating': getattr(evaluation, 'overall_rating', None),
                'created_at': evaluation.created_at.isoformat() if getattr(evaluation, 'created_at', None) else '',
            })
        
        return JsonResponse({
            'results': evaluations_data,
            'count': total_count,
            'page': page,
            'limit': limit,
            'total_pages': (total_count + limit - 1) // limit
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
@require_admin_auth
def admin_notifications_list(request, current_user):
    """Lista de notificaciones para administrador"""
    try:
        page = int(request.GET.get('page', 1))
        limit = int(request.GET.get('limit', 10))
        offset = (page - 1) * limit
        
        queryset = Notification.objects.select_related('user').all()
        total_count = queryset.count()
        notifications = queryset[offset:offset + limit]
        
        notifications_data = []
        for notification in notifications:
            notifications_data.append({
                'id': str(notification.id),
                'user_name': notification.user.full_name,
                'user_email': notification.user.email,
                'title': notification.title,
                'message': notification.message,
                'type': notification.type,
                'read': notification.read,
                'related_url': notification.related_url,
                'created_at': notification.created_at.isoformat(),
            })
        
        return JsonResponse({
            'results': notifications_data,
            'count': total_count,
            'page': page,
            'limit': limit,
            'total_pages': (total_count + limit - 1) // limit
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
@require_admin_auth
def admin_settings_list(request, current_user):
    """Lista de configuraciones de plataforma"""
    try:
        settings = PlatformSetting.objects.all()
        settings_data = []
        for setting in settings:
            settings_data.append({
                'id': str(setting.id),
                'key': setting.key,
                'value': setting.value,
                'setting_type': setting.setting_type,
                'description': setting.description,
                'created_at': setting.created_at.isoformat(),
                'updated_at': setting.updated_at.isoformat(),
            })
        
        return JsonResponse({
            'results': settings_data,
            'count': len(settings_data)
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
@require_admin_auth
def admin_profile(request, current_user):
    """Perfil del administrador"""
    try:
        admin_data = {
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
            'full_name': current_user.full_name,
        }
        
        return JsonResponse(admin_data)
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500) 

@csrf_exempt
@require_http_methods(["POST"])
@require_admin_auth
def approve_work_hour(request, current_user, work_hour_id):
    """Validar horas trabajadas desde el panel admin (solo aprobación, no se puede rechazar)"""
    from work_hours.models import WorkHour
    import json
    try:
        # Buscar la hora trabajada
        try:
            work_hour = WorkHour.objects.get(id=work_hour_id)
        except WorkHour.DoesNotExist:
            return JsonResponse({'error': 'Horas trabajadas no encontradas'}, status=404)

        # Solo admins pueden validar horas
        if current_user.role != 'admin':
            return JsonResponse({'error': 'Solo los administradores pueden validar horas'}, status=403)

        # Verificar que no esté ya aprobada
        if work_hour.approved:
            return JsonResponse({'error': 'Las horas ya han sido validadas'}, status=400)

        # Leer comentario opcional
        comentario = None
        if request.body:
            try:
                data = json.loads(request.body)
                comentario = data.get('comentario')
            except Exception:
                pass

        # Validar horas (solo aprobación)
        work_hour.aprobar_horas(current_user, comentario)

        return JsonResponse({
            'success': True,
            'message': 'Horas trabajadas validadas correctamente',
            'id': str(work_hour.id),
            'approved': work_hour.approved,
            'approved_by': work_hour.approved_by.full_name if work_hour.approved_by else None,
            'approved_at': work_hour.approved_at.isoformat() if work_hour.approved_at else None,
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500) 

@csrf_exempt
@require_http_methods(["POST"])
@require_admin_auth
def admin_suspend_company(request, current_user, company_id):
    try:
        company = Empresa.objects.get(id=company_id)
        company.status = 'suspended'
        company.save(update_fields=['status'])
        return JsonResponse({'success': True, 'status': 'suspended'})
    except Empresa.DoesNotExist:
        return JsonResponse({'error': 'No existe perfil de empresa asociado a este usuario.'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
@require_admin_auth
def admin_block_company(request, current_user, company_id):
    try:
        company = Empresa.objects.get(id=company_id)
        company.status = 'blocked'
        company.save(update_fields=['status'])
        return JsonResponse({'success': True, 'status': 'blocked'})
    except Empresa.DoesNotExist:
        return JsonResponse({'error': 'No existe perfil de empresa asociado a este usuario.'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
@require_admin_auth
def admin_activate_company(request, current_user, company_id):
    try:
        company = Empresa.objects.get(id=company_id)
        company.status = 'active'
        company.save(update_fields=['status'])
        return JsonResponse({'success': True, 'status': 'active'})
    except Empresa.DoesNotExist:
        return JsonResponse({'error': 'No existe perfil de empresa asociado a este usuario.'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500) 

@csrf_exempt
@require_http_methods(["POST"])
@require_admin_auth
def admin_suspend_project(request, current_user, project_id):
    """Suspender un proyecto"""
    try:
        from projects.models import Proyecto
        
        try:
            project = Proyecto.objects.get(id=project_id)
        except Proyecto.DoesNotExist:
            return JsonResponse({'error': 'Proyecto no encontrado'}, status=404)
        
        # Cambiar estado a suspendido
        from project_status.models import ProjectStatus
        suspended_status, _ = ProjectStatus.objects.get_or_create(name='suspended')
        project.status = suspended_status
        project.save()
        
        return JsonResponse({
            'message': 'Proyecto suspendido correctamente',
            'project_id': str(project.id)
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
@require_admin_auth
def admin_delete_project(request, current_user, project_id):
    """Eliminar un proyecto"""
    try:
        from projects.models import Proyecto
        
        try:
            project = Proyecto.objects.get(id=project_id)
        except Proyecto.DoesNotExist:
            return JsonResponse({'error': 'Proyecto no encontrado'}, status=404)
        
        # Cambiar estado a cancelado en lugar de eliminar
        from project_status.models import ProjectStatus
        cancelled_status, _ = ProjectStatus.objects.get_or_create(name='cancelled')
        project.status = cancelled_status
        project.save()
        
        return JsonResponse({
            'message': 'Proyecto cancelado correctamente',
            'project_id': str(project.id)
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500) 