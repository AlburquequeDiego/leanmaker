"""
Views para la app companies.
"""

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.db.models import Q
from users.models import User
from .models import Empresa, CalificacionEmpresa
from core.views import verify_token
import uuid
import logging
logger = logging.getLogger(__name__)
from projects.models import Proyecto
from django.db import IntegrityError
from django.contrib.auth import get_user_model


@csrf_exempt
@require_http_methods(["GET"])
def companies_list(request):
    """Lista de empresas."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Permitir acceso a admin y student
        if current_user.role not in ['admin', 'student']:
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        # Parámetros de paginación y filtros
        page = int(request.GET.get('page', 1))
        limit = int(request.GET.get('limit', 10))
        offset = (page - 1) * limit
        search = request.GET.get('search', '')
        status = request.GET.get('status', '')
        
        # Query base
        queryset = Empresa.objects.select_related('user').all()
        
        # Aplicar filtros
        if search:
            queryset = queryset.filter(
                Q(company_name__icontains=search) |
                Q(description__icontains=search) |
                Q(user__email__icontains=search)
            )
        
        if status:
            queryset = queryset.filter(status=status)
        
        # Contar total
        total_count = queryset.count()
        
        # Paginar
        companies = queryset[offset:offset + limit]
        
        # Serializar datos
        companies_data = []
        for company in companies:
            companies_data.append({
                'id': str(company.id),
                'user': str(company.user.id),
                'company_name': company.company_name,
                'description': company.description,
                'status': company.status,
                'contact_phone': company.contact_phone,
                'contact_email': company.contact_email,
                'address': company.address,
                'website': company.website,
                'industry': company.industry,
                'size': company.size,
                'verified': company.verified,
                'rating': float(company.rating),
                'total_projects': company.total_projects,
                'projects_completed': company.projects_completed,
                'total_hours_offered': company.total_hours_offered,
                'created_at': company.created_at.isoformat(),
                'updated_at': company.updated_at.isoformat(),
                # Datos del usuario
                'user_data': {
                    'id': str(company.user.id),
                    'email': company.user.email,
                    'first_name': company.user.first_name,
                    'last_name': company.user.last_name,
                    'username': company.user.username,
                    'phone': company.user.phone,
                    'avatar': company.user.avatar,
                    'bio': company.user.bio,
                    'is_active': company.user.is_active,
                    'is_verified': company.user.is_verified,
                    'date_joined': company.user.date_joined.isoformat(),
                    'last_login': company.user.last_login.isoformat() if company.user.last_login else None,
                    'full_name': company.user.full_name,
                }
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
def companies_detail(request, companies_id):
    """Detalle de una empresa."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Obtener empresa
        try:
            company = Empresa.objects.select_related('user').get(id=companies_id)
        except Empresa.DoesNotExist:
            return JsonResponse({'error': 'No existe perfil de empresa asociado a este usuario.'}, status=404)
        
        # Verificar permisos
        if current_user.role == 'company' and str(company.user.id) != str(current_user.id):
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        # Serializar datos
        company_data = {
            'id': str(company.id),
            'user': str(company.user.id),
            'company_name': company.company_name,
            'description': company.description,
            'status': company.status,
            'contact_phone': company.contact_phone,
            'contact_email': company.contact_email,
            'address': company.address,
            'website': company.website,
            'industry': company.industry,
            'size': company.size,
            'verified': company.verified,
            'rating': float(company.rating),
            'total_projects': company.total_projects,
            'projects_completed': company.projects_completed,
            'total_hours_offered': company.total_hours_offered,
            'created_at': company.created_at.isoformat(),
            'updated_at': company.updated_at.isoformat(),
            # Datos del usuario
            'user_data': {
                'id': str(company.user.id),
                'email': company.user.email,
                'first_name': company.user.first_name,
                'last_name': company.user.last_name,
                'username': company.user.username,
                'phone': company.user.phone,
                'avatar': company.user.avatar,
                'bio': company.user.bio,
                'is_active': company.user.is_active,
                'is_verified': company.user.is_verified,
                'date_joined': company.user.date_joined.isoformat(),
                'last_login': company.user.last_login.isoformat() if company.user.last_login else None,
                'full_name': company.user.full_name,
            }
        }
        
        return JsonResponse(company_data)
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def company_me(request):
    """Perfil de la empresa actual."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Verificar que sea empresa
        if current_user.role != 'company':
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        # Obtener perfil de empresa
        try:
            company = Empresa.objects.select_related('user').get(user=current_user)
        except Empresa.DoesNotExist:
            return JsonResponse({'error': 'No existe perfil de empresa asociado a este usuario.'}, status=404)
        
        # Serializar datos
        company_data = {
            'id': str(company.id),
            'user': str(company.user.id),
            'company_name': company.company_name,
            'description': company.description,
            'status': company.status,
            'contact_phone': company.contact_phone,
            'contact_email': company.contact_email,
            'address': company.address,
            'website': company.website,
            'industry': company.industry,
            'size': company.size,
            'verified': company.verified,
            'rating': float(company.rating),
            'total_projects': company.total_projects,
            'projects_completed': company.projects_completed,
            'total_hours_offered': company.total_hours_offered,
            'created_at': company.created_at.isoformat(),
            'updated_at': company.updated_at.isoformat(),
            # Campos adicionales del registro de empresa
            'rut': company.rut,
            'personality': company.personality,
            'business_name': company.business_name,
            'city': company.city,
            'country': company.country,
            # Datos del usuario
            'user_data': {
                'id': str(company.user.id),
                'email': company.user.email,
                'first_name': company.user.first_name,
                'last_name': company.user.last_name,
                'username': company.user.username,
                'phone': company.user.phone,
                'avatar': company.user.avatar,
                'bio': company.user.bio,
                'is_active': company.user.is_active,
                'is_verified': company.user.is_verified,
                'date_joined': company.user.date_joined.isoformat(),
                'last_login': company.user.last_login.isoformat() if company.user.last_login else None,
                'full_name': company.user.full_name,
            }
        }
        
        print(f"🔍 [company_me] Datos enviados al frontend: {company_data}")
        
        return JsonResponse(company_data)
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["PUT", "PATCH"])
def companies_update(request, companies_id):
    """Actualizar perfil de empresa."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Verificar permisos
        company = Empresa.objects.get(id=companies_id)
        if current_user.role == 'company' and str(company.user.id) != str(current_user.id):
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        try:
            company = Empresa.objects.get(id=companies_id)
        except Empresa.DoesNotExist:
            return JsonResponse({'error': 'Empresa no encontrada'}, status=404)
        
        # Procesar datos
        data = json.loads(request.body)
        
        print(f"🔍 [companies_update] Datos recibidos: {data}")
        
        # Actualizar campos de la empresa
        fields_to_update = [
            'company_name', 'description', 'status', 'contact_phone', 'contact_email',
            'address', 'website', 'industry', 'size', 'verified', 'rating',
            'total_projects', 'projects_completed', 'total_hours_offered',
            # Campos adicionales del registro de empresa
            'rut', 'personality', 'business_name', 'city', 'country'
        ]
        
        print(f"🔍 [companies_update] Campos a actualizar: {fields_to_update}")
        
        for field in fields_to_update:
            if field in data:
                old_value = getattr(company, field, None)
                new_value = data[field]
                setattr(company, field, new_value)
                print(f"🔍 [companies_update] Campo '{field}': {old_value} -> {new_value}")
            else:
                print(f"🔍 [companies_update] Campo '{field}' no encontrado en datos")
        
        company.save()
        print(f"🔍 [companies_update] Empresa guardada: {company.company_name}")
        
        # Retornar datos actualizados
        return JsonResponse({
            'message': 'Perfil actualizado correctamente',
            'id': str(company.id)
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def companies_create(request):
    """Crear nueva empresa."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Solo admins pueden crear empresas
        if current_user.role != 'admin':
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        # Procesar datos
        data = json.loads(request.body)
        
        # Crear empresa
        company = Empresa.objects.create(
            user_id=data.get('user_id'),
            company_name=data.get('company_name'),
            description=data.get('description', ''),
            status=data.get('status', 'active'),
            contact_phone=data.get('contact_phone', ''),
            contact_email=data.get('contact_email', ''),
            address=data.get('address', ''),
            website=data.get('website', ''),
            industry=data.get('industry', ''),
            size=data.get('size', ''),
            verified=data.get('verified', False),
            rating=data.get('rating', 0.0),
            total_projects=data.get('total_projects', 0),
            projects_completed=data.get('projects_completed', 0),
            total_hours_offered=data.get('total_hours_offered', 0),
        )
        
        return JsonResponse({
            'message': 'Empresa creada correctamente',
            'id': str(company.id)
        }, status=201)
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def company_list(request):
    """Lista de empresas (alias para companies_list)."""
    return companies_list(request)

@csrf_exempt
@require_http_methods(["GET"])
def company_detail(request, company_id):
    """Detalle de una empresa (alias para companies_detail)."""
    return companies_detail(request, company_id)

@csrf_exempt
@require_http_methods(["DELETE"])
def companies_delete(request, companies_id):
    """Eliminar empresa."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Solo admins pueden eliminar empresas
        if current_user.role != 'admin':
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        try:
            company = Empresa.objects.get(id=companies_id)
            company.delete()
        except Empresa.DoesNotExist:
            return JsonResponse({'error': 'Empresa no encontrada'}, status=404)
        
        return JsonResponse({
            'message': 'Empresa eliminada correctamente'
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500) 

@csrf_exempt
@require_http_methods(["POST"])
def admin_suspend_company(request, current_user, company_id):
    try:
        user = User.objects.get(id=company_id)
        logger.info(f"Intentando suspender empresa para usuario {user.id} ({user.email}), role={user.role}")
        if user.role != 'company':
            logger.warning(f"El usuario {user.id} no es de tipo empresa")
            return JsonResponse({'error': 'El usuario no es de tipo empresa.'}, status=400)
        try:
            company = Empresa.objects.get(user__id=company_id)
            logger.info(f"Perfil de empresa ya existe para usuario {user.id}")
        except Empresa.DoesNotExist:
            logger.info(f"No existe perfil de empresa para usuario {user.id}, creando uno nuevo...")
            try:
                company = Empresa.objects.create(user=user, company_name=user.email)
                logger.info(f"Perfil de empresa creado para usuario {user.id}")
            except Exception as e:
                logger.error(f"Error al crear perfil de empresa para usuario {user.id}: {e}")
                return JsonResponse({'error': f'Error al crear perfil de empresa: {e}'}, status=500)
        company.status = 'suspended'
        company.save(update_fields=['status'])
        if company.user:
            company.user.is_active = False
            company.user.save(update_fields=['is_active'])
        return JsonResponse({'success': True, 'status': 'suspended'})
    except User.DoesNotExist:
        logger.error(f"Usuario no encontrado: {company_id}")
        return JsonResponse({'error': 'Usuario no encontrado'}, status=404)

@csrf_exempt
@require_http_methods(["POST"])
def admin_block_company(request, current_user, company_id):
    try:
        user = User.objects.get(id=company_id)
        if user.role != 'company':
            return JsonResponse({'error': 'El usuario no es de tipo empresa.'}, status=400)
        try:
            company = Empresa.objects.get(user__id=company_id)
        except Empresa.DoesNotExist:
            company = Empresa.objects.create(user=user, company_name=user.email)
        company.status = 'blocked'
        company.save(update_fields=['status'])
        if company.user:
            company.user.is_verified = False
            company.user.save(update_fields=['is_verified'])
        return JsonResponse({'success': True, 'status': 'blocked'})
    except User.DoesNotExist:
        return JsonResponse({'error': 'Usuario no encontrado'}, status=404)

@csrf_exempt
@require_http_methods(["POST"])
def admin_activate_company(request, current_user, company_id):
    try:
        user = User.objects.get(id=company_id)
        if user.role != 'company':
            return JsonResponse({'error': 'El usuario no es de tipo empresa.'}, status=400)
        try:
            company = Empresa.objects.get(user__id=company_id)
        except Empresa.DoesNotExist:
            company = Empresa.objects.create(user=user, company_name=user.email)
        company.status = 'active'
        company.save(update_fields=['status'])
        if company.user:
            company.user.is_active = True
            company.user.is_verified = True
            company.user.save(update_fields=['is_active', 'is_verified'])
        return JsonResponse({'success': True, 'status': 'active'})
    except User.DoesNotExist:
        return JsonResponse({'error': 'Usuario no encontrado'}, status=404) 

@csrf_exempt
@require_http_methods(["POST", "GET"])
def company_ratings(request):
    # Autenticación por token
    auth_header = request.headers.get('Authorization')
    user = None
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
        user = verify_token(token)
    # Agregar log para depuración
    print('Usuario autenticado en company_ratings:', user, getattr(user, 'role', None))
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            # Validar usuario autenticado y estudiante
            if not user or not user.is_authenticated or getattr(user, 'role', None) != 'student':
                return JsonResponse({'error': 'Solo estudiantes pueden calificar empresas.'}, status=403)
            # Validar campos requeridos
            project_id = data.get('project')
            company_id = data.get('company')
            puntuacion = int(data.get('rating', 0))
            if not project_id or not company_id or not (1 <= puntuacion <= 5):
                return JsonResponse({'error': 'Datos incompletos o inválidos.'}, status=400)
            import uuid
            try:
                project_uuid = str(uuid.UUID(str(project_id)))
                company_uuid = str(uuid.UUID(str(company_id)))
            except Exception:
                return JsonResponse({'error': 'project o company no tienen formato UUID válido.'}, status=400)
            # Buscar empresa y proyecto
            try:
                empresa = Empresa.objects.get(id=company_uuid)
                proyecto = Proyecto.objects.get(id=project_uuid)
            except Empresa.DoesNotExist:
                return JsonResponse({'error': 'Empresa no encontrada.'}, status=404)
            except Proyecto.DoesNotExist:
                return JsonResponse({'error': 'Proyecto no encontrado.'}, status=404)
            # Validar que el proyecto pertenezca a la empresa
            if proyecto.company != empresa:
                return JsonResponse({'error': 'El proyecto no pertenece a la empresa seleccionada.'}, status=400)
            # Validar que el proyecto esté completado
            if proyecto.status != 'completed' and getattr(proyecto.status, 'name', None) != 'completed':
                return JsonResponse({'error': 'Solo puedes calificar proyectos completados.'}, status=400)
            # Validar que el estudiante haya participado en el proyecto
            from applications.models import Aplicacion
            participo = Aplicacion.objects.filter(project=proyecto, student=user, status='completed').exists()
            if not participo:
                return JsonResponse({'error': 'Solo puedes calificar proyectos en los que participaste y completaste.'}, status=400)
            # Validar que no haya calificado este proyecto antes
            if CalificacionEmpresa.objects.filter(empresa=empresa, estudiante=user, proyecto=proyecto).exists():
                return JsonResponse({'error': 'Ya has calificado este proyecto para esta empresa.'}, status=400)
            # Crear calificación
            calificacion = CalificacionEmpresa.objects.create(
                empresa=empresa,
                estudiante=user,
                proyecto=proyecto,
                puntuacion=puntuacion
            )
            empresa.actualizar_calificacion(puntuacion)
            return JsonResponse({'success': True, 'message': 'Calificación registrada', 'id': str(calificacion.id)})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    elif request.method == "GET":
        # Admin y empresa pueden ver todas las calificaciones
        if not user or not user.is_authenticated or user.role not in ['admin', 'company']:
            return JsonResponse({'error': 'No autorizado'}, status=403)
        calificaciones = CalificacionEmpresa.objects.all()
        data = [
            {
                'id': str(c.id),
                'empresa': c.empresa.company_name,
                'estudiante': c.estudiante.full_name,
                'proyecto': c.proyecto.title if hasattr(c, 'proyecto') else '',
                'puntuacion': c.puntuacion,
                'fecha': c.fecha_calificacion.isoformat()
            }
            for c in calificaciones
        ]
        return JsonResponse({'results': data, 'count': len(data)}) 