"""
Views para la app companies.
"""

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.db.models import Q
from users.models import User
from .models import Empresa
from core.views import verify_token


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
            return JsonResponse({'error': 'Empresa no encontrada'}, status=404)
        
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
            return JsonResponse({'error': 'Perfil de empresa no encontrado'}, status=404)
        
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
        if current_user.role == 'company' and str(companies_id) != str(current_user.id):
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        try:
            company = Empresa.objects.get(id=companies_id)
        except Empresa.DoesNotExist:
            return JsonResponse({'error': 'Empresa no encontrada'}, status=404)
        
        # Procesar datos
        data = json.loads(request.body)
        
        # Actualizar campos de la empresa
        fields_to_update = [
            'company_name', 'description', 'status', 'contact_phone', 'contact_email',
            'address', 'website', 'industry', 'size', 'verified', 'rating',
            'total_projects', 'projects_completed', 'total_hours_offered'
        ]
        
        for field in fields_to_update:
            if field in data:
                setattr(company, field, data[field])
        
        company.save()
        
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