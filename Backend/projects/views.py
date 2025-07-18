"""
Views para la app projects.
"""

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.db.models import Q
from users.models import User
from .models import Proyecto
from core.views import verify_token
from django.db.models import F


@csrf_exempt
@require_http_methods(["GET"])
def projects_list(request):
    """Lista de proyectos disponibles para estudiantes."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Parámetros de paginación y filtros
        page = int(request.GET.get('page', 1))
        limit = int(request.GET.get('limit', 10))
        offset = (page - 1) * limit
        search = request.GET.get('search', '')
        status = request.GET.get('status', '')
        
        # Query base con serialización segura - excluir proyectos eliminados y activos
        queryset = Proyecto.objects.select_related('status', 'company', 'area', 'trl').annotate(
            status_name=F('status__name'),
            company_name=F('company__company_name'),
            area_name=F('area__name'),
            trl_level=F('trl__level')
        ).exclude(status__name__in=['deleted', 'active']).values(
            'id', 'title', 'description', 'requirements', 'max_students', 'current_students',
            'applications_count', 'start_date', 'estimated_end_date', 'location', 'modality',
            'difficulty', 'duration_weeks', 'hours_per_week', 'required_hours',
            'created_at', 'updated_at', 'status_id', 'status_name', 'company_name', 
            'area_name', 'trl_level', 'api_level', 'is_featured', 'is_urgent'
        )
        
        # Aplicar filtros
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(company_name__icontains=search)
            )
        
        if status:
            queryset = queryset.filter(status_name=status)
        
        # Contar total
        total_count = queryset.count()
        
        # Paginar
        projects = queryset[offset:offset + limit]
        
        # Serializar datos de forma segura
        projects_data = []
        for project in projects:
            projects_data.append({
                'id': str(project['id']),
                'title': project['title'],
                'description': project['description'],
                'requirements': project['requirements'],
                'company_name': project['company_name'] or 'Sin empresa',
                'status': project['status_name'] or 'Sin estado',
                'status_id': project['status_id'],
                'area': project['area_name'] or 'Sin área',
                'trl_level': project['trl_level'] or 1,
                'api_level': project['api_level'] or 1,
                'max_students': project['max_students'],
                'current_students': project['current_students'],
                'applications_count': project['applications_count'],
                'start_date': project['start_date'].isoformat() if project['start_date'] else None,
                'estimated_end_date': project['estimated_end_date'].isoformat() if project['estimated_end_date'] else None,
                'location': project['location'] or 'Remoto',
                'modality': project['modality'],
                'difficulty': project['difficulty'],
                'duration_weeks': project['duration_weeks'],
                'hours_per_week': project['hours_per_week'],
                'required_hours': project['required_hours'],
                'is_featured': project['is_featured'],
                'is_urgent': project['is_urgent'],
                'created_at': project['created_at'].isoformat() if project['created_at'] else None,
                'updated_at': project['updated_at'].isoformat() if project['updated_at'] else None,
            })
        
        return JsonResponse({
            'results': projects_data,
            'count': total_count,
            'page': page,
            'limit': limit,
            'total_pages': (total_count + limit - 1) // limit
        })
        
    except Exception as e:
        print(f"Error en projects_list: {e}")
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def projects_detail(request, project_id):
    """Detalle de un proyecto."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Obtener proyecto
        try:
            project = Proyecto.objects.select_related('company', 'status', 'area', 'trl').get(id=project_id)
        except Proyecto.DoesNotExist:
            return JsonResponse({'error': 'Proyecto no encontrado'}, status=404)
        
        # Serializar datos
        project_data = {
            'id': str(project.id),
            'title': project.title,
            'description': project.description,
            'company': str(project.company.id) if project.company else None,
            'company_name': project.company.company_name if project.company else 'Sin empresa',
            'status': project.status.name if project.status else 'Sin estado',
            'status_id': project.status.id if project.status else None,
            'area': project.area.name if project.area else 'Sin área',
            'trl_level': project.trl.level if project.trl else 1,
            'api_level': project.api_level or 1,
            'max_students': project.max_students,
            'current_students': project.current_students,
            'applications_count': project.applications_count,
            'start_date': project.start_date.isoformat() if project.start_date else None,
            'estimated_end_date': project.estimated_end_date.isoformat() if project.estimated_end_date else None,
            'location': project.location or 'Remoto',
            'modality': project.modality,
            'difficulty': project.difficulty,
            'duration_weeks': project.duration_weeks,
            'hours_per_week': project.hours_per_week,
            'required_hours': project.required_hours,
            'created_at': project.created_at.isoformat(),
            'updated_at': project.updated_at.isoformat(),
        }
        
        # Agregar budget solo si existe el campo
        if hasattr(project, 'budget'):
            project_data['budget'] = project.budget

        # Obtener estudiantes asignados (aceptados) al proyecto
        estudiantes = []
        try:
            from .models import AplicacionProyecto
            aplicaciones_aceptadas = AplicacionProyecto.objects.filter(proyecto=project, estado='accepted').select_related('estudiante')
            for app in aplicaciones_aceptadas:
                user = app.estudiante
                estudiantes.append({
                    'id': str(user.id),
                    'nombre': f"{user.first_name} {user.last_name}".strip() or user.email,
                    'email': user.email,
                })
        except Exception as e:
            # Si hay error al obtener estudiantes, continuar sin ellos
            print(f"Error obteniendo estudiantes del proyecto: {e}")
            estudiantes = []
        
        project_data['estudiantes'] = estudiantes

        return JsonResponse(project_data)
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def projects_create(request):
    """Crear nuevo proyecto."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Solo empresas pueden crear proyectos
        if current_user.role != 'company':
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        # Procesar datos
        data = json.loads(request.body)
        print('--- DATOS RECIBIDOS PARA CREAR PROYECTO ---')
        print(data)
        
        # Obtener la empresa del usuario autenticado
        from companies.models import Empresa
        try:
            empresa = Empresa.objects.get(user=current_user)
        except Empresa.DoesNotExist:
            return JsonResponse({'error': 'No existe perfil de empresa asociado a este usuario.'}, status=404)
        
        # Lógica para calcular api_level y required_hours según TRL
        trl_to_api = {1: 1, 2: 1, 3: 2, 4: 2, 5: 3, 6: 3, 7: 4, 8: 4, 9: 4}
        api_to_hours = {1: 20, 2: 40, 3: 80, 4: 160}
        trl_level = None
        if data.get('trl_id'):
            from trl_levels.models import TRLLevel
            try:
                trl_obj = TRLLevel.objects.get(id=data['trl_id'])
                trl_level = trl_obj.level
            except Exception:
                trl_level = None
        if trl_level:
            api_level = trl_to_api.get(trl_level, 1)
            min_hours = api_to_hours.get(api_level, 20)
            data['api_level'] = data.get('api_level', api_level)
            data['required_hours'] = max(int(data.get('required_hours', min_hours)), min_hours)
        # Validar que required_hours nunca sea menor al mínimo
        if trl_level:
            api_level = trl_to_api.get(trl_level, 1)
            min_hours = api_to_hours.get(api_level, 20)
            if int(data['required_hours']) < min_hours:
                return JsonResponse({'error': f'El mínimo de horas para TRL {trl_level} (API {api_level}) es {min_hours} horas.'}, status=400)
        try:
            project = Proyecto.objects.create(
                title=data.get('title'),
                description=data.get('description', ''),
                company=empresa,  # Forzar empresa correcta
                status_id=data.get('status_id'),
                area_id=data.get('area_id'),
                trl_id=data.get('trl_id'),
                api_level=data.get('api_level', 1),
                max_students=data.get('max_students', 1),
                current_students=data.get('current_students', 0),
                applications_count=data.get('applications_count', 0),
                start_date=data.get('start_date'),
                estimated_end_date=data.get('estimated_end_date'),
                location=data.get('location', 'Remoto'),
                modality=data.get('modality', 'remoto'),
                difficulty=data.get('difficulty', 'intermedio'),
                duration_weeks=data.get('duration_weeks', 12),
                hours_per_week=data.get('hours_per_week', 10),
                required_hours=data.get('required_hours', 120)
                # budget=data.get('budget', 0),  # Eliminado porque el modelo no lo acepta
            )
        except Exception as e:
            print('--- ERROR AL CREAR PROYECTO ---')
            print(str(e))
            return JsonResponse({'error': f'Error SQL: {str(e)}'}, status=500)
        
        return JsonResponse({
            'success': True,
            'data': {
                'message': 'Proyecto creado correctamente',
                'id': str(project.id)
            }
        }, status=201)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    except Exception as e:
        print('--- ERROR GENERAL EN CREAR PROYECTO ---')
        print(str(e))
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["PUT", "PATCH"])
def projects_update(request, project_id):
    """Actualizar proyecto."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Obtener proyecto
        try:
            project = Proyecto.objects.get(id=project_id)
        except Proyecto.DoesNotExist:
            return JsonResponse({'error': 'Proyecto no encontrado'}, status=404)
        
        # Verificar permisos
        if current_user.role == 'company' and str(project.company.user.id) != str(current_user.id):
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        # Procesar datos
        data = json.loads(request.body)
        
        # Manejar cambio de estado específicamente
        if 'status' in data:
            from project_status.models import ProjectStatus
            try:
                # Buscar el estado por nombre
                status_name = data['status']
                if status_name in ['published', 'active', 'completed', 'deleted']:
                    # Mapear nombres del frontend a nombres del backend
                    status_mapping = {
                        'published': 'Publicado',
                        'active': 'Activo', 
                        'completed': 'Completado',
                        'deleted': 'deleted'
                    }
                    backend_status_name = status_mapping[status_name]
                    status_obj = ProjectStatus.objects.get(name=backend_status_name)
                    project.status = status_obj
                else:
                    # Si se envía un ID, usarlo directamente
                    status_obj = ProjectStatus.objects.get(id=data['status'])
                    project.status = status_obj
            except ProjectStatus.DoesNotExist:
                return JsonResponse({'error': f'Estado no encontrado: {data["status"]}'}, status=400)
        
        # Actualizar otros campos del proyecto
        fields_to_update = [
            'title', 'description', 'company_id', 'status_id', 'area_id', 'trl_id',
            'api_level', 'max_students', 'current_students', 'applications_count',
            'start_date', 'estimated_end_date', 'location', 'modality', 'difficulty',
            'duration_weeks', 'hours_per_week', 'required_hours', 'budget'
        ]
        
        for field in fields_to_update:
            if field in data and field != 'status_id':  # status_id ya se manejó arriba
                setattr(project, field, data[field])
        
        project.save()
        
        # Retornar datos actualizados con el nuevo estado
        return JsonResponse({
            'message': 'Proyecto actualizado correctamente',
            'id': str(project.id),
            'status': project.status.name if project.status else 'Sin estado',
            'status_name': project.status.name if project.status else 'Sin estado',
            'title': project.title,
            'description': project.description,
            'company_id': str(project.company.id) if project.company else None,
            'area_id': str(project.area.id) if project.area else None,
            'created_at': project.created_at.isoformat() if project.created_at else None,
            'updated_at': project.updated_at.isoformat() if project.updated_at else None
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    except Exception as e:
        print(f"❌ ERROR en projects_update: {e}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["DELETE", "PATCH"])
def projects_delete(request, project_id):
    """Eliminar proyecto (soft delete - marcar como cancelled)."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Obtener proyecto
        try:
            project = Proyecto.objects.get(id=project_id)
        except Proyecto.DoesNotExist:
            return JsonResponse({'error': 'Proyecto no encontrado'}, status=404)
        
        # Verificar permisos
        if current_user.role == 'company' and str(project.company.user.id) != str(current_user.id):
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        # Soft delete: marcar como deleted en lugar de borrar
        from project_status.models import ProjectStatus
        try:
            deleted_status = ProjectStatus.objects.get(name='deleted')
            project.status = deleted_status
            project.save()
        except ProjectStatus.DoesNotExist:
            # Si no existe el estado 'deleted', crearlo
            deleted_status = ProjectStatus.objects.create(
                name='deleted',
                description='Proyecto eliminado',
                color='#dc3545',
                is_active=False
            )
            project.status = deleted_status
            project.save()
        
        return JsonResponse({
            'message': 'Proyecto marcado como eliminado correctamente'
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def project_list(request):
    """Lista de proyectos."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        projects = Proyecto.objects.all()
        projects_data = []
        
        for project in projects:
            projects_data.append({
                'id': str(project.id),
                'title': project.title,
                'description': project.description,
                'status': project.status,
                'created_at': project.created_at.isoformat(),
                'updated_at': project.updated_at.isoformat(),
            })
        
        return JsonResponse({
            'success': True,
            'data': projects_data
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def project_detail(request, project_id):
    """Detalle de un proyecto."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        try:
            project = Proyecto.objects.get(id=project_id)
        except Proyecto.DoesNotExist:
            return JsonResponse({'error': 'Proyecto no encontrado'}, status=404)
        
        project_data = {
            'id': str(project.id),
            'title': project.title,
            'description': project.description,
            'status': project.status,
            'created_at': project.created_at.isoformat(),
            'updated_at': project.updated_at.isoformat(),
        }
        
        return JsonResponse(project_data)
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def my_projects(request):
    """Devuelve los proyectos en los que participa el estudiante autenticado, con detalles y horas acumuladas."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        # Solo estudiantes pueden ver sus proyectos
        if current_user.role != 'student':
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        # Obtener el perfil de estudiante
        try:
            student = current_user.estudiante_profile
        except Exception:
            return JsonResponse({'error': 'Perfil de estudiante no encontrado'}, status=404)
        # Obtener aplicaciones aceptadas o completadas
        from applications.models import Aplicacion
        accepted_statuses = ['accepted', 'completed', 'active']
        applications = Aplicacion.objects.filter(student=student, status__in=accepted_statuses).select_related('project', 'project__company')
        projects_data = []
        for app in applications:
            project = app.project
            if not project:
                continue
            projects_data.append({
                'id': str(project.id),
                'title': project.title,
                'company': project.company.company_name if project.company else 'Sin empresa',
                'status': app.status if app.status in ['active', 'completed', 'paused'] else 'active',
                'startDate': project.start_date.isoformat() if project.start_date else '',
                'endDate': project.estimated_end_date.isoformat() if project.estimated_end_date else '',
                'progress': 100 if app.status == 'completed' else 50,  # Puedes mejorar este cálculo
                'hoursWorked': getattr(app, 'hours_worked', 0),  # Si tienes este campo en Aplicacion
                'totalHours': getattr(project, 'required_hours', 0),
                'location': project.location or '',
                'description': project.description or '',
                'technologies': getattr(project, 'technologies', []),
                'teamMembers': getattr(project, 'current_students', 1),
                'mentor': '',
                'deliverables': [],
                'nextMilestone': '',
                'nextMilestoneDate': '',
            })
        return JsonResponse({'success': True, 'data': projects_data, 'total': len(projects_data)})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def company_projects(request):
    """Devuelve los proyectos publicados por la empresa autenticada."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        # Solo empresas pueden ver sus proyectos publicados
        if current_user.role != 'company':
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        # Obtener la empresa asociada al usuario
        try:
            from companies.models import Empresa
            empresa = Empresa.objects.get(user=current_user)
        except Empresa.DoesNotExist:
            return JsonResponse({'error': 'No existe perfil de empresa asociado a este usuario.'}, status=404)
        # Filtrar proyectos de la empresa
        from .models import Proyecto
        projects = Proyecto.objects.filter(company=empresa)
        projects_data = []
        for project in projects:
            projects_data.append({
                'id': str(project.id),
                'title': project.title,
                'description': project.description,
                'status': project.status.name if project.status else 'Sin estado',
                'status_id': project.status.id if project.status else None,
                'area': project.area.name if project.area else 'Sin área',
                'area_id': project.area.id if project.area else None,
                'trl_level': project.trl.level if project.trl else 1,
                'trl_id': project.trl.id if project.trl else None,
                'api_level': project.api_level or 1,
                'max_students': project.max_students,
                'current_students': project.current_students,
                'applications_count': project.applications_count,
                'start_date': project.start_date.isoformat() if project.start_date else None,
                'estimated_end_date': project.estimated_end_date.isoformat() if project.estimated_end_date else None,
                'location': project.location or 'Remoto',
                'modality': project.modality,
                'difficulty': project.difficulty,
                'duration_weeks': project.duration_weeks,
                'hours_per_week': project.hours_per_week,
                'required_hours': project.required_hours,
                'is_featured': getattr(project, 'is_featured', False),
                'is_urgent': getattr(project, 'is_urgent', False),
                'created_at': project.created_at.isoformat() if project.created_at else None,
                'updated_at': project.updated_at.isoformat() if project.updated_at else None,
                'technologies': getattr(project, 'technologies', []),
                'tags': getattr(project, 'tags', []),
            })
        return JsonResponse({'success': True, 'data': projects_data, 'count': len(projects_data)})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
