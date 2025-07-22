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
    """Lista de proyectos disponibles para estudiantes, filtrados por nivel API y TRL permitido."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Obtener perfil de estudiante
        estudiante = getattr(current_user, 'estudiante_profile', None)
        if not estudiante:
            return JsonResponse({'error': 'Solo estudiantes pueden ver proyectos disponibles'}, status=403)
        
        # Calcular TRL máximo permitido según API
        trl_max = estudiante.trl_permitido_segun_api
        api_level = estudiante.api_level
        
        # Filtrar proyectos activos/publicados, con TRL y API permitidos
        from project_status.models import ProjectStatus
        estados_visibles = ProjectStatus.objects.filter(name__in=['Publicado', 'Activo', 'published', 'active'])
        proyectos = Proyecto.objects.filter(
            status__in=estados_visibles,
            trl__level__lte=trl_max,
            api_level__lte=api_level
        )
        
        # Serializar proyectos
        projects_data = []
        for project in proyectos:
            projects_data.append({
                'id': str(project.id),
                'title': project.title,
                'description': project.description,
                'requirements': project.requirements,
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
                'is_featured': getattr(project, 'is_featured', False),
                'is_urgent': getattr(project, 'is_urgent', False),
                'created_at': project.created_at.isoformat() if project.created_at else None,
                'updated_at': project.updated_at.isoformat() if project.updated_at else None,
            })
        return JsonResponse({'results': projects_data, 'count': len(projects_data)})
    except Exception as e:
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
        
        # Lógica mejorada para calcular api_level y required_hours según TRL
        trl_to_config = {
            1: {'api_level': 1, 'min_hours': 20, 'max_hours': 40, 'description': 'Principios básicos observados'},
            2: {'api_level': 1, 'min_hours': 20, 'max_hours': 40, 'description': 'Concepto tecnológico formulado'},
            3: {'api_level': 2, 'min_hours': 40, 'max_hours': 80, 'description': 'Prueba de concepto analítica'},
            4: {'api_level': 2, 'min_hours': 40, 'max_hours': 80, 'description': 'Validación en laboratorio'},
            5: {'api_level': 3, 'min_hours': 80, 'max_hours': 160, 'description': 'Validación en ambiente relevante'},
            6: {'api_level': 3, 'min_hours': 80, 'max_hours': 160, 'description': 'Demostración en ambiente relevante'},
            7: {'api_level': 4, 'min_hours': 160, 'max_hours': 320, 'description': 'Demostración en ambiente operacional'},
            8: {'api_level': 4, 'min_hours': 160, 'max_hours': 320, 'description': 'Sistema completo calificado'},
            9: {'api_level': 4, 'min_hours': 160, 'max_hours': 320, 'description': 'Sistema probado en ambiente real'}
        }
        
        trl_level = None
        if data.get('trl_id'):
            from trl_levels.models import TRLLevel
            try:
                trl_obj = TRLLevel.objects.get(id=data['trl_id'])
                trl_level = trl_obj.level
            except Exception:
                trl_level = None
        
        # Configurar valores por defecto coherentes
        if trl_level and trl_level in trl_to_config:
            config = trl_to_config[trl_level]
            data['api_level'] = config['api_level']
            
            # Calcular horas requeridas de forma inteligente
            requested_hours = data.get('required_hours', config['min_hours'])
            if isinstance(requested_hours, str):
                requested_hours = int(requested_hours)
            
            # Asegurar que las horas estén dentro del rango válido
            data['required_hours'] = max(config['min_hours'], min(requested_hours, config['max_hours']))
            
            # Calcular horas por semana de forma realista
            if not data.get('hours_per_week'):
                # Para proyectos de 4-12 semanas, 10-20 horas por semana
                # Para proyectos de 12-26 semanas, 8-15 horas por semana
                # Para proyectos de 26+ semanas, 5-10 horas por semana
                weeks_estimate = data['required_hours'] / 15  # Estimación inicial
                if weeks_estimate <= 12:
                    data['hours_per_week'] = max(10, min(20, data['required_hours'] // 8))
                elif weeks_estimate <= 26:
                    data['hours_per_week'] = max(8, min(15, data['required_hours'] // 16))
                else:
                    data['hours_per_week'] = max(5, min(10, data['required_hours'] // 32))
            
            # Calcular duración en semanas
            if not data.get('duration_weeks'):
                data['duration_weeks'] = max(4, min(52, data['required_hours'] // data['hours_per_week']))
            
            # Ajustar horas por semana si la duración es muy corta o muy larga
            if data.get('duration_weeks') and data.get('hours_per_week'):
                semanas_calculadas = data['required_hours'] / data['hours_per_week']
                if semanas_calculadas < 4:
                    # Si es muy corto, reducir horas por semana
                    data['hours_per_week'] = max(5, data['required_hours'] // 4)
                elif semanas_calculadas > 52:
                    # Si es muy largo, aumentar horas por semana
                    data['hours_per_week'] = min(40, data['required_hours'] // 52)
            
            # Configurar dificultad según TRL
            if not data.get('difficulty'):
                if trl_level <= 2:
                    data['difficulty'] = 'beginner'
                elif trl_level <= 5:
                    data['difficulty'] = 'intermediate'
                else:
                    data['difficulty'] = 'advanced'
            
            print(f"📋 Configuración automática para TRL {trl_level}:")
            print(f"   • API Level: {data['api_level']}")
            print(f"   • Horas requeridas: {data['required_hours']}")
            print(f"   • Horas por semana: {data['hours_per_week']}")
            print(f"   • Duración semanas: {data['duration_weeks']}")
            print(f"   • Dificultad: {data['difficulty']}")
        else:
            # Valores por defecto para proyectos sin TRL
            data['api_level'] = data.get('api_level', 1)
            data['required_hours'] = data.get('required_hours', 40)
            data['hours_per_week'] = data.get('hours_per_week', 10)
            data['duration_weeks'] = data.get('duration_weeks', 12)
            data['difficulty'] = data.get('difficulty', 'intermediate')
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
                if status_name in ['published', 'active', 'completed', 'deleted', 'cancelled']:
                    status_obj = ProjectStatus.objects.get(name=status_name)
                    project.status = status_obj
                    # Si se está marcando como completado, ejecutar lógica especial
                    if status_name == 'completed':
                        project.marcar_como_completado(current_user)
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
@require_http_methods(["PATCH"])
def projects_restore(request, project_id):
    """Restaurar proyecto eliminado (cambiar de deleted a publicado y activar)."""
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
        
        # Restaurar: cambiar de deleted a publicado y activar
        from project_status.models import ProjectStatus
        try:
            published_status = ProjectStatus.objects.filter(name='published').first()
            if published_status:
                published_status.is_active = True
                published_status.save()
                project.status = published_status
                project.save()
            else:
                return JsonResponse({'error': 'No se encontró un estado válido para restaurar'}, status=500)
        except ProjectStatus.DoesNotExist:
            return JsonResponse({'error': 'No se encontró un estado válido para restaurar'}, status=500)
        
        return JsonResponse({
            'message': 'Proyecto restaurado correctamente',
            'id': str(project.id),
            'status': project.status.name,
            'status_name': project.status.name,
            'title': project.title,
            'description': project.description,
            'company_id': str(project.company.id) if project.company else None,
            'area_id': str(project.area.id) if project.area else None,
            'created_at': project.created_at.isoformat() if project.created_at else None,
            'updated_at': project.updated_at.isoformat() if project.updated_at else None
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
        accepted_statuses = ['active', 'completed']
        applications = Aplicacion.objects.filter(student=student, status__in=accepted_statuses).select_related('project', 'project__company')
        projects_data = []
        horas_acumuladas = 0
        for app in applications:
            project = app.project
            if not project:
                continue
            # Sumar horas ofrecidas si el proyecto está completado
            if app.status == 'completed':
                horas_ofrecidas = getattr(project, 'required_hours', 0)
                if isinstance(horas_ofrecidas, (int, float)):
                    horas_acumuladas += horas_ofrecidas
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
        return JsonResponse({'success': True, 'data': projects_data, 'total': len(projects_data), 'horas_acumuladas': horas_acumuladas})
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
                'status': project.status.name.lower() if project.status else 'Sin estado',
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

@csrf_exempt
@require_http_methods(["POST"])
def activate_project(request, project_id):
    """Activa el proyecto: todas las aplicaciones aceptadas pasan a estado 'active'. Solo la empresa dueña puede usarlo."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        # Verificar que es empresa
        if current_user.role != 'company':
            return JsonResponse({'error': 'Solo empresas pueden activar proyectos'}, status=403)
        from .models import Proyecto
        try:
            project = Proyecto.objects.get(id=project_id)
        except Proyecto.DoesNotExist:
            return JsonResponse({'error': 'Proyecto no encontrado'}, status=404)
        # Verificar que la empresa es dueña del proyecto
        if not project.company or project.company.user_id != current_user.id:
            return JsonResponse({'error': 'No tienes permisos para activar este proyecto'}, status=403)
        # Cambiar todas las aplicaciones aceptadas a 'active'
        from applications.models import Aplicacion
        accepted_apps = Aplicacion.objects.filter(project=project, status='accepted')
        updated_count = 0
        for app in accepted_apps:
            app.status = 'active'
            app.save(update_fields=['status'])
            updated_count += 1
        # Cambiar el estado del proyecto a 'active' (en inglés)
        from project_status.models import ProjectStatus
        status_activo = ProjectStatus.objects.get(name='active')
        project.status = status_activo
        project.save(update_fields=['status'])
        # Contar estudiantes activos (active o completed)
        active_count = Aplicacion.objects.filter(project=project, status__in=['active', 'completed']).count()
        return JsonResponse({'success': True, 'active_students': active_count, 'updated': updated_count})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
