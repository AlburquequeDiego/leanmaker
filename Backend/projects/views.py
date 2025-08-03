"""
Views para la app projects.
"""

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.db.models import Q
from users.models import User
from .models import Proyecto, MiembroProyecto
from core.views import verify_token
from django.db.models import F
from work_hours.models import WorkHour
from django.utils import timezone


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
            project_data = {
                'id': str(project.id),
                'title': project.title,
                'description': project.description,
                'requirements': project.requirements,
                # Campos adicionales del formulario
                'tipo': project.tipo,
                'objetivo': project.objetivo,
                'encargado': project.encargado,
                'contacto': project.contacto,
                'company_name': project.company.company_name if project.company else 'Sin empresa',
                'status': project.status.name if project.status else 'Sin estado',
                'status_id': project.status.id if project.status else None,
                'area': project.area.name if project.area else 'Sin área',
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
                'duration_weeks': project.duration_weeks,
                'hours_per_week': project.hours_per_week,
                'required_hours': project.required_hours,
                'is_featured': getattr(project, 'is_featured', False),
                'is_urgent': getattr(project, 'is_urgent', False),
                'created_at': project.created_at.isoformat() if project.created_at else None,
                'updated_at': project.updated_at.isoformat() if project.updated_at else None,
            }
            
            # Solo incluir trl_name si el usuario NO es una empresa
            if current_user.role != 'company':
                project_data['trl_name'] = project.trl.name if project.trl else 'Sin TRL'
                
            projects_data.append(project_data)
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
            'requirements': project.requirements,
            # Campos adicionales del formulario
            'tipo': project.tipo,
            'objetivo': project.objetivo,
            'encargado': project.encargado,
            'contacto': project.contacto,
            'api_level': project.api_level or 1,
            'required_hours': project.required_hours,
            'duration_weeks': project.duration_weeks,
            'hours_per_week': project.hours_per_week,
            'min_api_level': project.api_level or 1,
            'max_students': 1,  # Según lógica de negocio: un proyecto solo puede tener un participante
            'current_students': 0,  # Se calculará dinámicamente basado en estudiantes asignados
            'modality': project.modality,
            'location': project.location if project.location else ('Remoto' if project.modality == 'remote' else 'Presencial'),
            'start_date': project.start_date.isoformat() if project.start_date else None,
            'estimated_end_date': project.estimated_end_date.isoformat() if project.estimated_end_date else None,
            'real_end_date': project.real_end_date.isoformat() if project.real_end_date else None,
            'application_deadline': project.application_deadline.isoformat() if project.application_deadline else None,
            'is_featured': getattr(project, 'is_featured', False),
            'is_urgent': getattr(project, 'is_urgent', False),
            'is_project_completion': getattr(project, 'is_project_completion', False),
            'published_at': project.published_at.isoformat() if project.published_at else None,
            'created_at': project.created_at.isoformat(),
            'updated_at': project.updated_at.isoformat(),
            # Información de la empresa
            'company': {
                'id': str(project.company.id) if project.company else None,
                'name': project.company.company_name if project.company else 'Sin empresa',
                'email': project.company.user.email if project.company and project.company.user else None,
                'phone': project.company.company_phone if project.company else None,
                'website': project.company.website if project.company else None,
                'description': project.company.description if project.company else None,
                'industry': project.company.industry if project.company else None,
                'size': project.company.size if project.company else None,
                'location': f"{project.company.city}, {project.company.country}" if project.company and project.company.city and project.company.country else (project.company.city or project.company.country or 'No especificada') if project.company else 'No especificada',
            } if project.company else None,
            # Información del área
            'area': {
                'id': str(project.area.id) if project.area else None,
                'name': project.area.name if project.area else 'Sin área',
                'description': project.area.description if project.area else None,
            } if project.area else None,
            # Información del TRL
            'trl': {
                'id': str(project.trl.id) if project.trl else None,
                'name': project.trl.name if project.trl else 'Sin TRL',
                'description': project.trl.description if project.trl else None,
                'level': project.trl.level if project.trl else 1,
            } if project.trl else None,
        }
        
        # Agregar budget solo si existe el campo
        if hasattr(project, 'budget'):
            project_data['budget'] = project.budget

        # Obtener estudiantes asignados (miembros activos con rol estudiante)
        miembros = project.miembros.filter(rol='estudiante', esta_activo=True).select_related('usuario')
        estudiantes = []
        for miembro in miembros:
            user = miembro.usuario
            estudiantes.append({
                'id': str(user.id),
                'nombre': f"{user.first_name} {user.last_name}".strip() or user.email,
                'email': user.email,
            })
        project_data['estudiantes'] = estudiantes
        
        # Actualizar current_students con el número real de estudiantes asignados
        project_data['current_students'] = len(estudiantes)

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
            
            print(f"📋 Configuración automática para TRL {trl_level}:")
            print(f"   • API Level: {data['api_level']}")
            print(f"   • Horas requeridas: {data['required_hours']}")
            print(f"   • Horas por semana: {data['hours_per_week']}")
            print(f"   • Duración semanas: {data['duration_weeks']}")
        else:
            # Valores por defecto para proyectos sin TRL
            data['api_level'] = data.get('api_level', 1)
            data['required_hours'] = data.get('required_hours', 40)
            data['hours_per_week'] = data.get('hours_per_week', 10)
            data['duration_weeks'] = data.get('duration_weeks', 12)

        try:
            # Procesar fechas si vienen como strings
            start_date = data.get('start_date')
            estimated_end_date = data.get('estimated_end_date')
            
            # Convertir strings de fecha a objetos Date si es necesario
            if start_date and isinstance(start_date, str):
                from datetime import datetime
                try:
                    start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
                except ValueError:
                    start_date = None
            
            if estimated_end_date and isinstance(estimated_end_date, str):
                from datetime import datetime
                try:
                    estimated_end_date = datetime.strptime(estimated_end_date, '%Y-%m-%d').date()
                except ValueError:
                    estimated_end_date = None
            
            # Crear el proyecto con todos los campos necesarios
            project = Proyecto.objects.create(
                title=data.get('title'),
                description=data.get('description', ''),
                requirements=data.get('requirements', ''),
                # Campos adicionales del formulario
                tipo=data.get('tipo', ''),
                objetivo=data.get('objetivo', ''),
                encargado=data.get('encargado', ''),
                contacto=data.get('contacto', ''),
                company=empresa,  # Forzar empresa correcta
                status_id=data.get('status_id'),
                area_id=data.get('area_id'),
                trl_id=data.get('trl_id'),
                api_level=data.get('api_level', 1),
                min_api_level=data.get('api_level', 1),  # Usar el mismo nivel como mínimo
                max_students=data.get('max_students', 1),
                current_students=0,  # Siempre empezar en 0
                applications_count=0,  # Siempre empezar en 0
                start_date=start_date,
                estimated_end_date=estimated_end_date,
                location=data.get('location', 'Remoto'),
                modality=data.get('modality', 'remote'),

                duration_weeks=data.get('duration_weeks', 12),
                hours_per_week=data.get('hours_per_week', 10),
                required_hours=data.get('required_hours', 120),
                # Campos JSON como strings
                technologies=data.get('technologies', '[]'),
                tags=data.get('tags', '[]')
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
            'start_date', 'estimated_end_date', 'location', 'modality',
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
        # Obtener aplicaciones aceptadas o completadas (excluyendo rechazadas)
        from applications.models import Aplicacion
        accepted_statuses = ['accepted', 'completed']
        applications = Aplicacion.objects.filter(
            student=student, 
            status__in=accepted_statuses
        ).exclude(status='rejected').select_related('project', 'project__company')
        
        # Filtrar solo proyectos que estén en estados visibles (no eliminados, no cancelados)
        from project_status.models import ProjectStatus
        estados_visibles = ProjectStatus.objects.filter(name__in=['published', 'active', 'completed'])
        applications = applications.filter(project__status__in=estados_visibles)
        projects_data = []
        horas_acumuladas = 0
        for app in applications:
            project = app.project
            if not project:
                continue
            
            # Determinar el estado real del proyecto para el estudiante
            # Si la aplicación está completada, el proyecto está completado
            if app.status == 'completed':
                project_status = 'completed'
                progress = 100
                # Sumar horas ofrecidas si el proyecto está completado
                horas_ofrecidas = getattr(project, 'required_hours', 0)
                if isinstance(horas_ofrecidas, (int, float)):
                    horas_acumuladas += horas_ofrecidas
            else:
                # Si la aplicación está aceptada, verificar si el estudiante está activo en el proyecto
                try:
                    miembro = MiembroProyecto.objects.get(proyecto=project, usuario=app.student.user)
                    if miembro.esta_activo:
                        project_status = 'active'  # En desarrollo
                        progress = 75
                    else:
                        project_status = 'accepted'  # Aceptado pero no activo
                        progress = 25
                except MiembroProyecto.DoesNotExist:
                    # Si no existe miembro, asumir que está aceptado pero no activo
                    project_status = 'accepted'
                    progress = 25
            
            projects_data.append({
                'id': str(project.id),
                'title': project.title,
                'company': project.company.company_name if project.company else 'Sin empresa',
                'status': project_status,
                'startDate': project.start_date.isoformat() if project.start_date else '',
                'endDate': project.estimated_end_date.isoformat() if project.estimated_end_date else '',
                'progress': progress,
                'hoursWorked': getattr(app.asignacion, 'hours_worked', 0) if hasattr(app, 'asignacion') and app.asignacion else 0,
                'totalHours': getattr(project, 'required_hours', 0),
                'location': project.location or '',
                'description': project.description or '',
                'technologies': project.get_technologies_list() if hasattr(project, 'get_technologies_list') else [],
                'teamMembers': getattr(project, 'current_students', 1),
                'mentor': '',
                'deliverables': [],
                'nextMilestone': '',
                'nextMilestoneDate': '',
                'modality': getattr(project, 'modality', ''),
                'hours_per_week': getattr(project, 'hours_per_week', 0),
                'max_students': getattr(project, 'max_students', 1),
                'current_students': getattr(project, 'current_students', 1),
                'trl_level': project.trl.level if project.trl else 1,
                'api_level': getattr(project, 'api_level', 1),
                'created_at': project.created_at.isoformat() if project.created_at else '',
                'requirements': getattr(project, 'requirements', ''),
                'objetivo': getattr(project, 'objetivo', ''),
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
            # Recalcular current_students por si acaso
            current_students = project.miembros.filter(rol='estudiante', esta_activo=True).count()
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
                'current_students': current_students,
                'applications_count': project.applications_count,
                'start_date': project.start_date.isoformat() if project.start_date else None,
                'estimated_end_date': project.estimated_end_date.isoformat() if project.estimated_end_date else None,
                'location': project.location or 'Remoto',
                'modality': project.modality,
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
        # Cambiar todas las aplicaciones aceptadas a 'active' y activar miembros del proyecto
        from applications.models import Aplicacion
        accepted_apps = Aplicacion.objects.filter(project=project, status='accepted')
        updated_count = 0
        for app in accepted_apps:
            app.status = 'active'
            app.save(update_fields=['status'])
            
            # Activar el miembro del proyecto para este estudiante
            try:
                miembro = MiembroProyecto.objects.get(proyecto=project, usuario=app.student.user)
                if not miembro.esta_activo:
                    miembro.esta_activo = True
                    miembro.save(update_fields=['esta_activo'])
            except MiembroProyecto.DoesNotExist:
                # Si no existe el miembro, crearlo como activo
                MiembroProyecto.objects.create(
                    proyecto=project,
                    usuario=app.student.user,
                    rol='estudiante',
                    esta_activo=True
                )
            
            updated_count += 1
        
        # Cambiar el estado del proyecto a 'active' (en inglés)
        from project_status.models import ProjectStatus
        status_activo = ProjectStatus.objects.get(name='active')
        project.status = status_activo
        project.save(update_fields=['status'])
        
        # Actualizar el contador de estudiantes activos en el proyecto
        project.current_students = MiembroProyecto.objects.filter(
            proyecto=project, rol='estudiante', esta_activo=True
        ).count()
        project.save(update_fields=['current_students'])
        
        # Contar estudiantes activos (active o completed)
        active_count = Aplicacion.objects.filter(project=project, status__in=['active', 'completed']).count()
        return JsonResponse({'success': True, 'active_students': active_count, 'updated': updated_count})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def project_participants(request, project_id):
    """Devuelve solo los nombres y correos de los estudiantes participantes de un proyecto."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        # Permitir solo admin, empresa o staff
        if current_user.role not in ['admin', 'company', 'staff']:
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        # Buscar el proyecto
        try:
            project = Proyecto.objects.get(id=project_id)
        except Proyecto.DoesNotExist:
            return JsonResponse({'error': 'Proyecto no encontrado'}, status=404)
        # Buscar miembros activos con rol estudiante
        miembros = MiembroProyecto.objects.filter(proyecto=project, rol='estudiante', esta_activo=True).select_related('usuario')
        participantes = []
        for miembro in miembros:
            user = miembro.usuario
            participantes.append({
                'id': str(user.id),
                'nombre': f"{user.first_name} {user.last_name}".strip() or user.email,
                'email': user.email,
            })
        return JsonResponse({'participantes': participantes})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def completed_pending_hours(request):
    """Lista proyectos completados pendientes de validación de horas."""
    try:
        # Verificar autenticación y permisos de admin
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user or current_user.role != 'admin':
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        # Buscar proyectos completados
        proyectos = Proyecto.objects.filter(status__name__in=['completed', 'completado'])
        data = []
        for p in proyectos:
            # Verificar si ya hay horas validadas para este proyecto
            horas_validadas = WorkHour.objects.filter(project=p, is_project_completion=True).exists()
            if horas_validadas:
                continue  # Ya validadas, no mostrar
            # Participantes activos
            miembros = MiembroProyecto.objects.filter(proyecto=p, rol='estudiante', esta_activo=True).select_related('usuario')
            participantes = []
            for miembro in miembros:
                user = miembro.usuario
                participantes.append({
                    'id': str(user.id),
                    'nombre': f"{user.first_name} {user.last_name}".strip() or user.email,
                    'email': user.email,
                })
            data.append({
                'id': str(p.id),
                'title': p.title,
                'company': p.company.company_name if p.company else '',
                'required_hours': p.required_hours or 0,
                'participantes': participantes,
            })
        return JsonResponse({'results': data, 'count': len(data)})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def validate_project_hours(request, project_id):
    """Valida horas de todos los estudiantes de un proyecto completado."""
    try:
        # Verificar autenticación y permisos de admin
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user or current_user.role != 'admin':
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        # Buscar proyecto
        try:
            proyecto = Proyecto.objects.get(id=project_id)
        except Proyecto.DoesNotExist:
            return JsonResponse({'error': 'Proyecto no encontrado'}, status=404)
        if not proyecto.required_hours:
            return JsonResponse({'error': 'El proyecto no tiene horas ofrecidas definidas.'}, status=400)
        # Participantes del proyecto (sin importar si esta_activo)
        miembros = proyecto.miembros.filter(rol='estudiante').select_related('usuario')
        count = 0
        for miembro in miembros:
            user = miembro.usuario
            print(f"[VALIDAR HORAS] Proyecto: {proyecto.id} - {proyecto.title}")
            print(f"[VALIDAR HORAS] Usuario: {user.id} - {user.email}")
            # Obtener perfil de estudiante
            estudiante = getattr(user, 'estudiante_profile', None)
            if not estudiante:
                print(f"[VALIDAR HORAS] Usuario {user.email} sin perfil de estudiante, se omite.")
                continue  # Saltar si no hay perfil de estudiante
            # Buscar asignación correctamente
            from applications.models import Asignacion, Aplicacion
            asignacion = Asignacion.objects.filter(application__student=estudiante, application__project=proyecto).first()
            if not asignacion:
                # Crear aplicación y asignación si no existen
                print(f"[VALIDAR HORAS] No se encontró asignación para estudiante {estudiante.id} en proyecto {proyecto.id}, creando...")
                # Buscar o crear aplicación aceptada
                aplicacion, _ = Aplicacion.objects.get_or_create(
                    student=estudiante,
                    project=proyecto,
                    defaults={'status': 'accepted', 'cover_letter': 'Generada automáticamente para validación de horas'}
                )
                if aplicacion.status != 'accepted':
                    aplicacion.status = 'accepted'
                    aplicacion.save(update_fields=['status'])
                # Crear asignación
                from django.utils import timezone
                asignacion = Asignacion.objects.create(
                    application=aplicacion,
                    fecha_inicio=proyecto.start_date or timezone.now().date(),
                    estado='en curso'
                )
            # Evitar duplicados
            if WorkHour.objects.filter(project=proyecto, student=estudiante, is_project_completion=True).exists():
                print(f"[VALIDAR HORAS] Ya existe WorkHour para estudiante {estudiante.id} en proyecto {proyecto.id}")
                continue
            # Obtener snapshot de integrantes (todos los estudiantes, activos o no)
            integrantes_snapshot = []
            miembros_qs = proyecto.miembros.filter(rol='estudiante')  # sin filtrar por esta_activo
            for miembro in miembros_qs:
                user = miembro.usuario
                integrantes_snapshot.append({
                    'nombre': user.full_name,
                    'email': user.email
                })
            workhour = WorkHour.objects.create(
                assignment=asignacion,
                student=estudiante,
                project=proyecto,
                company=proyecto.company,
                date=proyecto.real_end_date or proyecto.estimated_end_date or timezone.now().date(),
                hours_worked=proyecto.required_hours,
                description=f"Horas validadas por finalización del proyecto: {proyecto.title}",
                approved=True,
                approved_by=current_user,
                approved_at=timezone.now(),
                is_project_completion=True,
                integrantes_snapshot=integrantes_snapshot
            )
            workhour.aprobar_horas(current_user)
            print(f"[VALIDAR HORAS] Se sumaron {workhour.hours_worked} horas al estudiante {estudiante.id}. Total ahora: {estudiante.total_hours}")
            count += 1
        print(f"[VALIDAR HORAS] Total horas validadas: {count}")
        return JsonResponse({'success': True, 'horas_validadas': count})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
