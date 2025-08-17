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
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated


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
            # Campos específicos del registro que deben mapearse correctamente
            'company_address': company.company_address,  # Campo del registro
            'company_phone': company.company_phone,      # Campo del registro
            'company_email': company.company_email,      # Campo del registro
            # Mapear campos del registro a campos del perfil para compatibilidad
            'address': company.company_address or company.address,  # Priorizar company_address del registro
            'contact_phone': company.company_phone or company.contact_phone,  # Priorizar company_phone del registro
            'contact_email': company.company_email or company.contact_email,  # Priorizar company_email del registro
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
                'birthdate': company.user.birthdate.isoformat() if company.user.birthdate else None,
                'gender': company.user.gender,
                'is_active': company.user.is_active,
                'is_verified': company.user.is_verified,
                'date_joined': company.user.date_joined.isoformat(),
                'last_login': company.user.last_login.isoformat() if company.user.last_login else None,
                'full_name': company.user.full_name,
            }
        }
        
        print(f"🔍 [company_me] Datos enviados al frontend: {company_data}")
        print(f"🔍 [company_me] Campos específicos del registro:")
        print(f"  - company_address: {company_data.get('company_address')}")
        print(f"  - company_phone: {company_data.get('company_phone')}")
        print(f"  - company_email: {company_data.get('company_email')}")
        print(f"  - rut: {company_data.get('rut')}")
        print(f"  - personality: {company_data.get('personality')}")
        print(f"  - business_name: {company_data.get('business_name')}")
        print(f"  - user_data.birthdate: {company_data.get('user_data', {}).get('birthdate')}")
        print(f"  - user_data.gender: {company_data.get('user_data', {}).get('gender')}")
        print(f"🔍 [company_me] Datos del usuario desde la base de datos:")
        print(f"  - user.birthdate: {company.user.birthdate}")
        print(f"  - user.gender: {company.user.gender}")
        print(f"  - company.personality: {company.personality}")
        
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
            'rut', 'personality', 'business_name', 'city', 'country',
            # Campos específicos del registro
            'company_address', 'company_phone', 'company_email'
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
        print(f"🔍 [companies_update] Campos guardados:")
        print(f"  - company_address: {company.company_address}")
        print(f"  - company_phone: {company.company_phone}")
        print(f"  - company_email: {company.company_email}")
        print(f"  - rut: {company.rut}")
        print(f"  - personality: {company.personality}")
        print(f"  - business_name: {company.business_name}")
        
        # Actualizar datos del usuario si se proporcionan
        user = company.user
        user_updated = False
        
        if 'user_data' in data:
            user_data = data['user_data']
            if 'birthdate' in user_data and user_data['birthdate']:
                try:
                    from datetime import datetime
                    user.birthdate = datetime.strptime(user_data['birthdate'], '%Y-%m-%d').date()
                    user_updated = True
                    print(f"🔍 [companies_update] Usuario birthdate actualizado: {user.birthdate}")
                except:
                    print(f"🔍 [companies_update] Error al parsear birthdate: {user_data['birthdate']}")
            
            if 'gender' in user_data:
                user.gender = user_data['gender']
                user_updated = True
                print(f"🔍 [companies_update] Usuario gender actualizado: {user.gender}")
        
        if user_updated:
            user.save()
            print(f"🔍 [companies_update] Usuario guardado - birthdate: {user.birthdate}, gender: {user.gender}")
        
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
def admin_suspend_company(request, company_id):
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Solo administradores pueden acceder
        if current_user.role != 'admin':
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
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
def admin_block_company(request, company_id):
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Solo administradores pueden acceder
        if current_user.role != 'admin':
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
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
def admin_activate_company(request, company_id):
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Solo administradores pueden acceder
        if current_user.role != 'admin':
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
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
    """Endpoint simplificado para que estudiantes califiquen empresas usando consultas SQL directas"""
    # Autenticación por token
    auth_header = request.headers.get('Authorization')
    user = None
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
        user = verify_token(token)
    
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            
            # Validar usuario autenticado y estudiante
            if not user or not user.is_authenticated or getattr(user, 'role', None) != 'student':
                return JsonResponse({'error': 'Solo estudiantes pueden calificar empresas'}, status=403)
            
            # Validar campos requeridos
            required_fields = ['company_id', 'project_id', 'rating', 'comments']
            for field in required_fields:
                if field not in data:
                    return JsonResponse({'error': f'Campo requerido: {field}'}, status=400)
            
            company_id = data['company_id']
            project_id = data['project_id']
            rating = data['rating']
            comments = data['comments']
            
            # Validar rating (1-5)
            try:
                rating = int(rating)
                if rating < 1 or rating > 5:
                    return JsonResponse({'error': 'Rating debe estar entre 1 y 5'}, status=400)
            except (ValueError, TypeError):
                return JsonResponse({'error': 'Rating debe ser un número entre 1 y 5'}, status=400)
            
            from django.db import connection
            
            # Verificar que el proyecto existe y pertenece a la empresa
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT p.id, e.id, e.company_name
                    FROM projects p
                    INNER JOIN companies_empresa e ON p.company_id = e.id
                    WHERE p.id = %s AND e.id = %s
                """, [project_id, company_id])
                
                project_exists = cursor.fetchone()
                if not project_exists:
                    return JsonResponse({'error': 'Proyecto o empresa no encontrados'}, status=404)
                
                # Verificar que el estudiante completó este proyecto
                cursor.execute("""
                    SELECT a.id
                    FROM applications a
                    INNER JOIN students_estudiante s ON a.student_id = s.id
                    WHERE a.project_id = %s AND s.user_id = %s AND a.status = 'completed'
                """, [project_id, user.id])
                
                completed_project = cursor.fetchone()
                if not completed_project:
                    return JsonResponse({'error': 'No has completado este proyecto'}, status=403)
                
                # Verificar si ya calificó esta empresa para este proyecto
                cursor.execute("""
                    SELECT ce.id
                    FROM companies_calificacionempresa ce
                    INNER JOIN students_estudiante s ON ce.estudiante_id = s.id
                    WHERE ce.empresa_id = %s AND s.user_id = %s
                """, [company_id, user.id])
                
                existing_rating = cursor.fetchone()
                if existing_rating:
                    return JsonResponse({'error': 'Ya calificaste esta empresa'}, status=400)
                
                # Obtener el ID del estudiante
                cursor.execute("""
                    SELECT s.id
                    FROM students_estudiante s
                    WHERE s.user_id = %s
                """, [user.id])
                
                student_id = cursor.fetchone()
                if not student_id:
                    return JsonResponse({'error': 'Perfil de estudiante no encontrado'}, status=404)
                
                # Crear la calificación
                cursor.execute("""
                    INSERT INTO companies_calificacionempresa (id, empresa_id, estudiante_id, puntuacion, comentario, created_at, updated_at)
                    VALUES (%s, %s, %s, %s, %s, NOW(), NOW())
                """, [str(uuid.uuid4()), company_id, student_id[0], rating, comments])
                
                # Actualizar el promedio de la empresa
                cursor.execute("""
                    UPDATE companies_empresa 
                    SET average_rating = (
                        SELECT AVG(puntuacion) 
                        FROM companies_calificacionempresa 
                        WHERE empresa_id = %s
                    )
                    WHERE id = %s
                """, [company_id, company_id])
            
            return JsonResponse({
                'success': True,
                'message': 'Empresa calificada exitosamente',
                'rating': rating
            })
            
        except json.JSONDecodeError:
            return JsonResponse({'error': 'JSON inválido'}, status=400)
        except Exception as e:
            print(f"Error en company_ratings POST: {str(e)}")
            return JsonResponse({'error': str(e)}, status=500)
    
    elif request.method == "GET":
        try:
            company_id = request.GET.get('company_id')
            if not company_id:
                return JsonResponse({'error': 'company_id requerido'}, status=400)
            
            from django.db import connection
            
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT 
                        ce.id,
                        ce.puntuacion,
                        ce.comentario,
                        ce.created_at,
                        u.first_name,
                        u.last_name,
                        u.email
                    FROM companies_calificacionempresa ce
                    INNER JOIN students_estudiante s ON ce.estudiante_id = s.id
                    INNER JOIN users_user u ON s.user_id = u.id
                    WHERE ce.empresa_id = %s
                    ORDER BY ce.created_at DESC
                """, [company_id])
                
                rows = cursor.fetchall()
                
            ratings_data = []
            for row in rows:
                ratings_data.append({
                    'id': str(row[0]),
                    'rating': row[1],
                    'comments': row[2] or '',
                    'created_at': row[3].isoformat() if row[3] else None,
                    'student_name': f"{row[4] or ''} {row[5] or ''}".strip() or row[6],
                    'student_email': row[6]
                })
            
            return JsonResponse({
                'success': True,
                'data': ratings_data,
                'total': len(ratings_data)
            })
            
        except Exception as e:
            print(f"Error en company_ratings GET: {str(e)}")
            return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def student_completed_projects(request):
    """Endpoint simplificado para obtener proyectos completados de un estudiante usando consultas SQL directas"""
    # Autenticación por token
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return JsonResponse({'error': 'Token requerido'}, status=401)
    
    token = auth_header.split(' ')[1]
    user = verify_token(token)
    if not user or not user.is_authenticated or getattr(user, 'role', None) != 'student':
        return JsonResponse({'error': 'Solo estudiantes pueden acceder a este endpoint.'}, status=403)
    
    try:
        from django.db import connection
        
        print(f"[DEBUG] Usuario autenticado: {user.id} - {user.email}")
        
        # Primero, vamos a verificar si el estudiante existe
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT s.id, s.user_id, u.email
                FROM students s
                INNER JOIN users_user u ON s.user_id = u.id
                WHERE s.user_id = %s
            """, [user.id])
            
            student_exists = cursor.fetchone()
            if not student_exists:
                print(f"[DEBUG] Estudiante no encontrado para usuario: {user.id}")
                return JsonResponse({
                    'success': True,
                    'data': [],
                    'total': 0,
                    'message': 'Estudiante no encontrado'
                })
            
            print(f"[DEBUG] Estudiante encontrado: {student_exists}")
        
        # Consulta SQL directa para obtener proyectos completados del estudiante
        with connection.cursor() as cursor:
            print(f"[DEBUG] Ejecutando consulta SQL para proyectos completados...")
            
            # Intentar con la tabla 'applications' primero
            try:
                cursor.execute("""
                    SELECT DISTINCT
                        p.id as project_id,
                        p.title as project_title,
                        p.description as project_description,
                        e.id as company_id,
                        e.company_name as company_name,
                        a.applied_at as completion_date,
                        CASE WHEN ce.id IS NOT NULL THEN 1 ELSE 0 END as already_rated,
                        COALESCE(ce.puntuacion, 0) as rating
                    FROM applications a
                    INNER JOIN projects p ON a.project_id = p.id
                    INNER JOIN companies_empresa e ON p.company_id = e.id
                    INNER JOIN students s ON a.student_id = s.id
                    LEFT JOIN companies_calificacionempresa ce ON ce.empresa_id = e.id AND ce.estudiante_id = s.id
                    WHERE s.user_id = %s 
                    AND a.status = 'completed'
                    ORDER BY a.applied_at DESC
                """, [user.id])
                
                rows = cursor.fetchall()
                print(f"[DEBUG] Filas encontradas en 'applications': {len(rows)}")
                
            except Exception as e:
                print(f"[DEBUG] Error con tabla 'applications': {e}")
                # Intentar con la tabla 'project_applications'
                try:
                    cursor.execute("""
                        SELECT DISTINCT
                            p.id as project_id,
                            p.title as project_title,
                            p.description as project_description,
                            e.id as company_id,
                            e.company_name as company_name,
                            pa.applied_at as completion_date,
                            CASE WHEN ce.id IS NOT NULL THEN 1 ELSE 0 END as already_rated,
                            COALESCE(ce.puntuacion, 0) as rating
                        FROM project_applications pa
                        INNER JOIN projects p ON pa.proyecto_id = p.id
                        INNER JOIN companies_empresa e ON p.company_id = e.id
                        INNER JOIN students s ON pa.estudiante_id = s.user_id
                        LEFT JOIN companies_calificacionempresa ce ON ce.empresa_id = e.id AND ce.estudiante_id = s.id
                        WHERE s.user_id = %s 
                        AND pa.estado = 'completed'
                        ORDER BY pa.applied_at DESC
                    """, [user.id])
                    
                    rows = cursor.fetchall()
                    print(f"[DEBUG] Filas encontradas en 'project_applications': {len(rows)}")
                    
                except Exception as e2:
                    print(f"[DEBUG] Error con tabla 'project_applications': {e2}")
                    # Si ambas fallan, devolver lista vacía
                    rows = []
            
        # Convertir resultados a formato JSON
        projects_data = []
        for row in rows:
            try:
                projects_data.append({
                    'project_id': str(row[0]),
                    'project_title': row[1] or 'Sin título',
                    'project_description': row[2] or '',
                    'company_id': str(row[3]),
                    'company_name': row[4] or 'Sin empresa',
                    'completion_date': row[5].isoformat() if row[5] else None,
                    'already_rated': bool(row[6]),
                    'rating': row[7] if row[7] > 0 else None
                })
            except Exception as row_error:
                print(f"[DEBUG] Error procesando fila {row}: {row_error}")
                continue
        
        print(f"[DEBUG] Proyectos completados encontrados: {len(projects_data)}")
        return JsonResponse({
            'success': True,
            'data': projects_data,
            'total': len(projects_data)
        })
        
    except Exception as e:
        print(f"Error en student_completed_projects: {str(e)}")
        import traceback
        print(f"Traceback completo: {traceback.format_exc()}")
        return JsonResponse({'error': str(e)}, status=500) 

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_companies_list(request):
    """
    Lista de empresas para administradores con información detallada
    """
    try:
        print("🚀 [ADMIN COMPANIES] Vista iniciada")
        print(f"🔍 [ADMIN COMPANIES] Usuario: {request.user.email}")
        print(f"🔍 [ADMIN COMPANIES] Rol: {request.user.role}")
        
        # Verificar que sea admin
        if not hasattr(request.user, 'role') or request.user.role != 'admin':
            print("❌ [ADMIN COMPANIES] Usuario no es admin")
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        print("✅ [ADMIN COMPANIES] Usuario es admin, continuando...")
        
        # Obtener parámetros de paginación y filtros
        limit = int(request.GET.get('limit', 20))
        offset = int(request.GET.get('offset', 0))
        search = request.GET.get('search', '')
        status = request.GET.get('status', '')
        
        print(f"🔍 [ADMIN COMPANIES] Parámetros: limit={limit}, offset={offset}, search='{search}', status='{status}'")
        
        # Query base
        queryset = Empresa.objects.select_related('user').all()
        print(f"🔍 [ADMIN COMPANIES] Query base creada, total empresas: {queryset.count()}")
        
        # Aplicar filtros
        if search:
            queryset = queryset.filter(
                Q(company_name__icontains=search) |
                Q(description__icontains=search) |
                Q(user__email__icontains=search)
            )
            print(f"🔍 [ADMIN COMPANIES] Filtro de búsqueda aplicado: '{search}'")
        
        if status:
            queryset = queryset.filter(status=status)
            print(f"🔍 [ADMIN COMPANIES] Filtro de estado aplicado: '{status}'")
        
        # Contar total
        total_count = queryset.count()
        print(f"🔍 [ADMIN COMPANIES] Total después de filtros: {total_count}")
        
        # Paginar
        if limit > 0:
            companies = queryset[offset:offset + limit]
        else:
            companies = queryset
        
        print(f"🔍 [ADMIN COMPANIES] Empresas a procesar: {len(companies)}")
        
        # Serializar datos
        companies_data = []
        for company in companies:
            print(f"\n🏢 [ADMIN COMPANIES] Procesando empresa: {company.company_name}")
            
            # ✅ CORREGIDO: Calcular GPA real usando el método del modelo
            try:
                gpa = company.calcular_gpa_real()  # GPA real de 0 a 5 con decimales
                print(f"   - GPA calculado (real): {gpa} (tipo: {type(gpa)})")
            except Exception as e:
                print(f"   - ❌ Error al calcular GPA: {e}")
                gpa = 0.0
            
            # ✅ NUEVO: Usar el estado real del usuario en lugar de company.status
            user_status = 'active'
            if not company.user.is_active:
                user_status = 'inactive'
            elif not company.user.is_verified:
                user_status = 'blocked'
            
            # 🔍 DEBUG: Log del estado del usuario
            print(f"   - User ID: {company.user.id}")
            print(f"   - User is_active: {company.user.is_active}")
            print(f"   - User is_verified: {company.user.is_verified}")
            print(f"   - Status calculado: {user_status}")
            
            # 🔍 DEBUG: Log del campo rating y GPA
            print(f"   - Company.rating (tipo): {type(company.rating)}")
            print(f"   - Company.rating (valor): {company.rating}")
            print(f"   - Company.rating (repr): {repr(company.rating)}")
            
            # 🔍 DEBUG: Verificar que los campos se estén agregando correctamente
            empresa_data = {
                'id': str(company.id),
                'user': str(company.user.id),
                'company_name': company.company_name,
                'description': company.description,
                'status': user_status,  # ✅ Estado real del usuario
                'contact_phone': company.contact_phone,
                'contact_email': company.contact_email,
                'address': company.address,
                'website': company.website,
                'industry': company.industry,
                'size': company.size,
                'verified': company.verified,
                'rating': float(company.rating),  # Rating individual
                'gpa': round(gpa, 2),  # ✅ GPA real calculado
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
            
            # 🔍 DEBUG: Verificar que los campos se agregaron correctamente
            print(f"   - Rating en empresa_data: {empresa_data.get('rating')}")
            print(f"   - GPA en empresa_data: {empresa_data.get('gpa')}")
            
            companies_data.append(empresa_data)
        
        print(f"✅ [ADMIN COMPANIES] Datos serializados: {len(companies_data)} empresas")
        
        # 🔍 DEBUG: Ver la primera empresa para verificar los campos
        if companies_data:
            primera_empresa = companies_data[0]
            print(f"🔍 [ADMIN COMPANIES] Primera empresa serializada:")
            print(f"   - ID: {primera_empresa.get('id')}")
            print(f"   - Nombre: {primera_empresa.get('company_name')}")
            print(f"   - Rating: {primera_empresa.get('rating')}")
            print(f"   - GPA: {primera_empresa.get('gpa')}")
            print(f"   - Status: {primera_empresa.get('status')}")
            print(f"   - Campos disponibles: {list(primera_empresa.keys())}")
        
        return JsonResponse({
            'results': companies_data,
            'count': total_count,
            'limit': limit,
            'offset': offset
        })
        
    except Exception as e:
        print(f"❌ [ADMIN COMPANIES] Error en la vista: {e}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': str(e)}, status=500) 

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def test_gpa_calculation(request):
    """
    Endpoint de prueba para debuggear el cálculo de GPA
    """
    try:
        print("🧪 [TEST GPA] Endpoint de prueba iniciado")
        
        # Obtener una empresa de prueba
        empresa = Empresa.objects.first()
        if not empresa:
            return JsonResponse({'error': 'No hay empresas en la BD'}, status=404)
        
        print(f"🧪 [TEST GPA] Empresa de prueba: {empresa.company_name}")
        print(f"🧪 [TEST GPA] Rating en modelo: {empresa.rating}")
        print(f"🧪 [TEST GPA] Tipo de rating: {type(empresa.rating)}")
        
        # Intentar calcular GPA real
        try:
            gpa_real = empresa.calcular_gpa_real()
            print(f"🧪 [TEST GPA] GPA calculado: {gpa_real}")
            print(f"🧪 [TEST GPA] Tipo de GPA: {type(gpa_real)}")
        except Exception as e:
            print(f"🧪 [TEST GPA] ❌ Error al calcular GPA: {e}")
            import traceback
            traceback.print_exc()
            gpa_real = 0.0
        
        # Verificar evaluaciones directamente
        try:
            from evaluations.models import Evaluation
            evaluaciones = Evaluation.objects.filter(
                project__company=empresa,
                status='completed',
                evaluation_type='student_to_company'
            )
            print(f"🧪 [TEST GPA] Evaluaciones encontradas: {evaluaciones.count()}")
            
            if evaluaciones.exists():
                print("🧪 [TEST GPA] Detalle de evaluaciones:")
                for eval in evaluaciones[:5]:
                    print(f"   * Proyecto: {eval.project.title if eval.project else 'N/A'}")
                    print(f"     Score: {eval.score}")
                    print(f"     Tipo: {eval.evaluation_type}")
                    print(f"     Status: {eval.status}")
            else:
                print("🧪 [TEST GPA] ⚠️ No hay evaluaciones completadas")
                
        except Exception as e:
            print(f"🧪 [TEST GPA] ❌ Error al buscar evaluaciones: {e}")
            import traceback
            traceback.print_exc()
        
        return JsonResponse({
            'empresa': empresa.company_name,
            'rating_modelo': str(empresa.rating),
            'gpa_calculado': gpa_real,
            'evaluaciones_count': evaluaciones.count() if 'evaluaciones' in locals() else 0
        })
        
    except Exception as e:
        print(f"🧪 [TEST GPA] ❌ Error en endpoint: {e}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': str(e)}, status=500) 

@require_http_methods(["GET"])
def test_simple_response(request):
    """Endpoint de prueba para verificar serialización simple"""
    try:
        print("🧪 [TEST SIMPLE] Endpoint de prueba iniciado")
        
        # Datos de prueba simples
        test_data = {
            'id': 'test-123',
            'name': 'Empresa Test',
            'rating': 4.5,
            'gpa': 4.5,
            'status': 'active'
        }
        
        print(f"🧪 [TEST SIMPLE] Datos de prueba: {test_data}")
        print(f"🧪 [TEST SIMPLE] Tipo de rating: {type(test_data['rating'])}")
        print(f"🧪 [TEST SIMPLE] Tipo de gpa: {type(test_data['gpa'])}")
        
        return JsonResponse({
            'results': [test_data],
            'count': 1,
            'message': 'Prueba de serialización'
        })
        
    except Exception as e:
        print(f"❌ [TEST SIMPLE] Error: {e}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': str(e)}, status=500) 

@require_http_methods(["GET"])
def companies_list_admin(request):
    """Lista de empresas para administradores - FUNCIONA COMO student_list"""
    try:
        print("🚀 [COMPANIES LIST ADMIN] Vista iniciada")
        print(f"🔍 [COMPANIES LIST ADMIN] Headers: {dict(request.headers)}")
        
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            print("❌ [COMPANIES LIST ADMIN] No hay token de autorización")
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        print(f"🔍 [COMPANIES LIST ADMIN] Token recibido: {token[:20]}...")
        
        current_user = verify_token(token)
        if not current_user:
            print("❌ [COMPANIES LIST ADMIN] Token inválido")
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        print(f"✅ [COMPANIES LIST ADMIN] Usuario autenticado: {current_user.email} - Rol: {current_user.role}")
        
        # Solo administradores pueden acceder
        if current_user.role != 'admin':
            print("❌ [COMPANIES LIST ADMIN] Usuario no es admin")
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        print("✅ [COMPANIES LIST ADMIN] Usuario es admin, continuando...")
        
        # Parámetros de paginación y filtros
        page = int(request.GET.get('page', 1))
        limit = int(request.GET.get('limit', 10))
        offset = (page - 1) * limit
        search = request.GET.get('search', '')
        status = request.GET.get('status', '')
        
        print(f"🔍 [COMPANIES LIST ADMIN] Parámetros: page={page}, limit={limit}, offset={offset}, search='{search}', status='{status}'")
        
        # Query base
        queryset = Empresa.objects.select_related('user').all()
        print(f"🔍 [COMPANIES LIST ADMIN] Query base creada, total empresas: {queryset.count()}")
        
        # Aplicar filtros
        if search:
            queryset = queryset.filter(
                Q(company_name__icontains=search) |
                Q(description__icontains=search) |
                Q(user__email__icontains=search)
            )
            print(f"🔍 [COMPANIES LIST ADMIN] Filtro de búsqueda aplicado: '{search}'")
        
        if status:
            queryset = queryset.filter(status=status)
            print(f"🔍 [COMPANIES LIST ADMIN] Filtro de estado aplicado: '{status}'")
        
        # Contar total
        total_count = queryset.count()
        print(f"🔍 [COMPANIES LIST ADMIN] Total después de filtros: {total_count}")
        
        # Paginar
        companies = queryset[offset:offset + limit]
        print(f"🔍 [COMPANIES LIST ADMIN] Empresas a procesar: {len(companies)}")
        
        # Serializar datos - EXACTAMENTE COMO student_list
        companies_data = []
        for company in companies:
            print(f"\n🏢 [COMPANIES LIST ADMIN] Procesando empresa: {company.company_name}")
            print(f"   - Rating: {company.rating} (tipo: {type(company.rating)})")
            
            # Determinar el estado del usuario
            user_status = 'active'
            if not company.user.is_active:
                user_status = 'inactive'
            elif not company.user.is_verified:
                user_status = 'blocked'
            
            company_data = {
                'id': str(company.id),
                'user': str(company.user.id),
                'company_name': company.company_name,
                'description': company.description,
                'status': user_status,
                'contact_phone': company.contact_phone,
                'contact_email': company.contact_email,
                'address': company.address,
                'website': company.website,
                'industry': company.industry,
                'size': company.size,
                'verified': company.verified,
                'rating': float(company.rating),  # ✅ EXACTAMENTE COMO student.gpa
                'gpa': float(company.rating),    # ✅ EXACTAMENTE COMO student.gpa
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
            
            print(f"   - Rating en company_data: {company_data.get('rating')}")
            print(f"   - GPA en company_data: {company_data.get('gpa')}")
            
            companies_data.append(company_data)
        
        print(f"✅ [COMPANIES LIST ADMIN] Datos serializados: {len(companies_data)} empresas")
        
        # 🔍 DEBUG: Ver la primera empresa para verificar los campos
        if companies_data:
            primera_empresa = companies_data[0]
            print(f"🔍 [COMPANIES LIST ADMIN] Primera empresa serializada:")
            print(f"   - ID: {primera_empresa.get('id')}")
            print(f"   - Nombre: {primera_empresa.get('company_name')}")
            print(f"   - Rating: {primera_empresa.get('rating')}")
            print(f"   - GPA: {primera_empresa.get('gpa')}")
            print(f"   - Status: {primera_empresa.get('status')}")
            print(f"   - Campos disponibles: {list(primera_empresa.keys())}")
        
        # 🔍 DEBUG: Ver la respuesta JSON completa
        response_data = {
            'results': companies_data,
            'count': total_count,
            'limit': limit,
            'offset': offset
        }
        print(f"🔍 [COMPANIES LIST ADMIN] Respuesta JSON a enviar:")
        print(f"   - Tipo de results: {type(companies_data)}")
        print(f"   - Longitud de results: {len(companies_data)}")
        print(f"   - Primer elemento tipo: {type(companies_data[0]) if companies_data else 'N/A'}")
        print(f"   - Keys del primer elemento: {list(companies_data[0].keys()) if companies_data else 'N/A'}")
        
        return JsonResponse(response_data)
        
    except Exception as e:
        print(f"❌ [COMPANIES LIST ADMIN] Error en la vista: {e}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': str(e)}, status=500) 