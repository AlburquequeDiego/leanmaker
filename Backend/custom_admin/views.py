"""
Views para la app custom_admin.
"""

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.db.models import Q
from core.views import verify_token
from companies.models import Empresa
from projects.models import Proyecto
from evaluations.models import Evaluation
from users.models import User
from students.models import Estudiante


@csrf_exempt
@require_http_methods(["GET"])
def admin_companies_list(request):
    """Lista de empresas para el admin"""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Solo admins pueden ver esta lista
        if current_user.role != 'admin':
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        # Parámetros de paginación y filtros
        page = int(request.GET.get('page', 1))
        limit = int(request.GET.get('limit', 20))
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
                'gpa': company.calcular_gpa_real() if hasattr(company, 'calcular_gpa_real') else 0.0,
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
                }
            })
        
        return JsonResponse({
            'success': True,
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
def admin_projects_list(request):
    """Lista de proyectos para el admin"""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Solo admins pueden ver esta lista
        if current_user.role != 'admin':
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        # Parámetros de paginación y filtros
        page = int(request.GET.get('page', 1))
        limit = int(request.GET.get('limit', 50))
        offset = (page - 1) * limit
        search = request.GET.get('search', '')
        status = request.GET.get('status', '')
        api_level = request.GET.get('api_level', '')
        trl_level = request.GET.get('trl_level', '')
        
        # Query base
        queryset = Proyecto.objects.select_related('company', 'status', 'area', 'trl').all()
        
        # Aplicar filtros
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(company__company_name__icontains=search)
            )
        
        if status:
            queryset = queryset.filter(status__name=status)
            
        if api_level:
            queryset = queryset.filter(api_level=api_level)
            
        if trl_level:
            queryset = queryset.filter(trl__level=trl_level)
        
        # Contar total
        total_count = queryset.count()
        
        # Paginar
        projects = queryset[offset:offset + limit]
        
        # Serializar datos
        projects_data = []
        for project in projects:
            projects_data.append({
                'id': str(project.id),
                'title': project.title,
                'description': project.description,
                'requirements': project.requirements,
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
                'is_featured': project.is_featured,
                'is_urgent': project.is_urgent,
                'is_project_completion': project.is_project_completion,
                'created_at': project.created_at.isoformat(),
                'updated_at': project.updated_at.isoformat(),
            })
        
        return JsonResponse({
            'success': True,
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
def admin_evaluations_list(request):
    """Lista de evaluaciones para el admin"""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Solo admins pueden ver esta lista
        if current_user.role != 'admin':
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        # Parámetros de paginación y filtros
        page = int(request.GET.get('page', 1))
        limit = int(request.GET.get('limit', 100))
        offset = (page - 1) * limit
        status = request.GET.get('status', '')
        type_filter = request.GET.get('type', '')
        
        # Query base
        queryset = Evaluation.objects.select_related('project', 'student', 'evaluator').all()
        
        # Aplicar filtros
        if status:
            queryset = queryset.filter(status=status)
        
        if type_filter:
            queryset = queryset.filter(evaluator_type=type_filter)
        
        # Contar total
        total_count = queryset.count()
        
        # Paginar
        evaluations = queryset[offset:offset + limit]
        
        # Serializar datos
        evaluations_data = []
        for evaluation in evaluations:
            evaluations_data.append({
                'id': str(evaluation.id),
                'project_id': str(evaluation.project.id) if evaluation.project else None,
                'project_title': evaluation.project.title if evaluation.project else 'Sin proyecto',
                'student_id': str(evaluation.student.id) if evaluation.student else None,
                'student_name': evaluation.student.full_name if evaluation.student else 'Sin estudiante',
                'evaluator_id': str(evaluation.evaluator.id) if evaluation.evaluator else None,
                'evaluator_name': evaluation.evaluator.full_name if evaluation.evaluator else 'Sin evaluador',
                'score': evaluation.score,
                'comments': evaluation.comments,
                'strengths': evaluation.strengths,
                'areas_for_improvement': evaluation.areas_for_improvement,
                'evaluator_type': evaluation.evaluator_type,
                'status': evaluation.status,
                'created_at': evaluation.created_at.isoformat(),
                'updated_at': evaluation.updated_at.isoformat(),
            })
        
        return JsonResponse({
            'success': True,
            'data': evaluations_data,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total_count,
                'pages': (total_count + limit - 1) // limit
            }
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
