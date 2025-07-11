"""
Views para la app applications.
"""

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.paginator import Paginator
from django.db.models import Q
from django.utils import timezone
from .models import Aplicacion
from core.views import verify_token


@csrf_exempt
@require_http_methods(["GET"])
def applications_list(request):
    """Lista de aplicaciones."""
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
        page = request.GET.get('page', 1)
        per_page = request.GET.get('per_page', 20)
        status = request.GET.get('status')
        project_id = request.GET.get('project_id')
        student_id = request.GET.get('student_id')
        
        # Query base con relaciones
        queryset = Aplicacion.objects.select_related(
            'project', 'student', 'student__user'
        ).all()
        
        # Aplicar filtros según el rol del usuario
        if current_user.role == 'student':
            # Estudiantes solo ven sus propias aplicaciones
            queryset = queryset.filter(student__user=current_user)
        elif current_user.role == 'company':
            # Empresas ven aplicaciones a sus proyectos
            queryset = queryset.filter(project__company__user=current_user)
        elif current_user.role == 'admin':
            # Admins ven todas las aplicaciones
            pass
        
        # Aplicar filtros adicionales
        if status:
            queryset = queryset.filter(status=status)
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        
        # Paginación
        paginator = Paginator(queryset, per_page)
        page_obj = paginator.get_page(page)
        
        applications_data = []
        for application in page_obj:
            applications_data.append({
                'id': str(application.id),
                'project': {
                    'id': str(application.project.id),
                    'title': application.project.title,
                    'company': application.project.company.name if application.project.company else None
                } if application.project else None,
                'student': {
                    'id': str(application.student.id),
                    'full_name': application.student.user.full_name,
                    'email': application.student.user.email
                } if application.student else None,
                'status': application.status,
                'compatibility_score': application.compatibility_score,
                'cover_letter': application.cover_letter,
                'company_notes': application.company_notes,
                'student_notes': application.student_notes,
                'portfolio_url': application.portfolio_url,
                'github_url': application.github_url,
                'linkedin_url': application.linkedin_url,
                'applied_at': application.applied_at.isoformat(),
                'reviewed_at': application.reviewed_at.isoformat() if application.reviewed_at else None,
                'responded_at': application.responded_at.isoformat() if application.responded_at else None,
                'created_at': application.created_at.isoformat(),
                'updated_at': application.updated_at.isoformat()
            })
        
        return JsonResponse({
            'results': applications_data,
            'count': paginator.count,
            'total_pages': paginator.num_pages,
            'current_page': page_obj.number,
            'has_next': page_obj.has_next(),
            'has_previous': page_obj.has_previous()
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def applications_detail(request, applications_id):
    """Detalle de una aplicación."""
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
            application = Aplicacion.objects.select_related(
                'project', 'student', 'student__user'
            ).get(id=applications_id)
        except Aplicacion.DoesNotExist:
            return JsonResponse({'error': 'Aplicación no encontrada'}, status=404)
        
        # Verificar permisos
        if current_user.role == 'student' and application.student.user != current_user:
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        elif current_user.role == 'company' and application.project.company.user != current_user:
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        application_data = {
            'id': str(application.id),
            'project': {
                'id': str(application.project.id),
                'title': application.project.title,
                'description': application.project.description,
                'company': {
                    'id': str(application.project.company.id),
                    'name': application.project.company.name
                } if application.project.company else None
            } if application.project else None,
            'student': {
                'id': str(application.student.id),
                'full_name': application.student.user.full_name,
                'email': application.student.user.email,
                'phone': application.student.phone,
                'university': application.student.university,
                'career': application.student.career
            } if application.student else None,
            'status': application.status,
            'compatibility_score': application.compatibility_score,
            'cover_letter': application.cover_letter,
            'company_notes': application.company_notes,
            'student_notes': application.student_notes,
            'portfolio_url': application.portfolio_url,
            'github_url': application.github_url,
            'linkedin_url': application.linkedin_url,
            'applied_at': application.applied_at.isoformat(),
            'reviewed_at': application.reviewed_at.isoformat() if application.reviewed_at else None,
            'responded_at': application.responded_at.isoformat() if application.responded_at else None,
            'created_at': application.created_at.isoformat(),
            'updated_at': application.updated_at.isoformat()
        }
        
        return JsonResponse(application_data)
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def applications_create(request):
    """Crear una nueva aplicación."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Solo estudiantes pueden crear aplicaciones
        if current_user.role != 'student':
            return JsonResponse({'error': 'Solo estudiantes pueden crear aplicaciones'}, status=403)
        
        data = json.loads(request.body)
        
        # Validar campos requeridos
        required_fields = ['project_id', 'cover_letter']
        for field in required_fields:
            if not data.get(field):
                return JsonResponse({'error': f'El campo {field} es requerido'}, status=400)
        
        # Verificar que el proyecto existe y está disponible
        from projects.models import Proyecto
        try:
            project = Proyecto.objects.get(id=data['project_id'])
        except Proyecto.DoesNotExist:
            return JsonResponse({'error': 'Proyecto no encontrado'}, status=404)
        
        if not project.puede_aplicar:
            return JsonResponse({'error': 'El proyecto no está disponible para aplicaciones'}, status=400)
        
        # Verificar que el estudiante no haya aplicado antes
        from students.models import Estudiante
        try:
            student = Estudiante.objects.get(user=current_user)
        except Estudiante.DoesNotExist:
            return JsonResponse({'error': 'Estudiante no encontrado'}, status=404)
        
        if Aplicacion.objects.filter(project=project, student=student).exists():
            return JsonResponse({'error': 'Ya has aplicado a este proyecto'}, status=400)
        
        # Crear aplicación
        application = Aplicacion.objects.create(
            project=project,
            student=student,
            cover_letter=data['cover_letter'],
            portfolio_url=data.get('portfolio_url'),
            github_url=data.get('github_url'),
            linkedin_url=data.get('linkedin_url'),
            student_notes=data.get('student_notes')
        )
        
        application_data = {
            'id': str(application.id),
            'project': {
                'id': str(application.project.id),
                'title': application.project.title
            },
            'student': {
                'id': str(application.student.id),
                'full_name': application.student.user.full_name
            },
            'status': application.status,
            'cover_letter': application.cover_letter,
            'portfolio_url': application.portfolio_url,
            'github_url': application.github_url,
            'linkedin_url': application.linkedin_url,
            'applied_at': application.applied_at.isoformat(),
            'created_at': application.created_at.isoformat()
        }
        
        return JsonResponse(application_data, status=201)
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["PUT"])
def applications_update(request, applications_id):
    """Actualizar una aplicación."""
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
            application = Aplicacion.objects.get(id=applications_id)
        except Aplicacion.DoesNotExist:
            return JsonResponse({'error': 'Aplicación no encontrada'}, status=404)
        
        data = json.loads(request.body)
        
        # Verificar permisos según el rol
        if current_user.role == 'student':
            # Estudiantes solo pueden actualizar sus propias aplicaciones
            if application.student.user != current_user:
                return JsonResponse({'error': 'Acceso denegado'}, status=403)
            
            # Estudiantes solo pueden actualizar ciertos campos
            allowed_fields = ['cover_letter', 'portfolio_url', 'github_url', 'linkedin_url', 'student_notes']
            for field in allowed_fields:
                if field in data:
                    setattr(application, field, data[field])
        
        elif current_user.role == 'company':
            # Empresas solo pueden actualizar aplicaciones a sus proyectos
            if application.project.company.user != current_user:
                return JsonResponse({'error': 'Acceso denegado'}, status=403)
            
            # Empresas pueden actualizar estado y notas
            if 'status' in data:
                application.status = data['status']
                if data['status'] in ['reviewing', 'interviewed']:
                    application.reviewed_at = timezone.now()
                elif data['status'] in ['accepted', 'rejected']:
                    application.responded_at = timezone.now()
            
            if 'compatibility_score' in data:
                application.compatibility_score = data['compatibility_score']
            
            if 'company_notes' in data:
                application.company_notes = data['company_notes']
        
        elif current_user.role == 'admin':
            # Admins pueden actualizar cualquier campo
            allowed_fields = ['status', 'compatibility_score', 'cover_letter', 'company_notes', 
                            'student_notes', 'portfolio_url', 'github_url', 'linkedin_url']
            for field in allowed_fields:
                if field in data:
                    setattr(application, field, data[field])
            
            # Actualizar fechas según el estado
            if 'status' in data:
                if data['status'] in ['reviewing', 'interviewed']:
                    application.reviewed_at = timezone.now()
                elif data['status'] in ['accepted', 'rejected']:
                    application.responded_at = timezone.now()
        
        application.save()
        
        application_data = {
            'id': str(application.id),
            'project': {
                'id': str(application.project.id),
                'title': application.project.title
            } if application.project else None,
            'student': {
                'id': str(application.student.id),
                'full_name': application.student.user.full_name
            } if application.student else None,
            'status': application.status,
            'compatibility_score': application.compatibility_score,
            'cover_letter': application.cover_letter,
            'company_notes': application.company_notes,
            'student_notes': application.student_notes,
            'portfolio_url': application.portfolio_url,
            'github_url': application.github_url,
            'linkedin_url': application.linkedin_url,
            'applied_at': application.applied_at.isoformat(),
            'reviewed_at': application.reviewed_at.isoformat() if application.reviewed_at else None,
            'responded_at': application.responded_at.isoformat() if application.responded_at else None,
            'updated_at': application.updated_at.isoformat()
        }
        
        return JsonResponse(application_data)
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["DELETE"])
def applications_delete(request, applications_id):
    """Eliminar una aplicación."""
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
            application = Aplicacion.objects.get(id=applications_id)
        except Aplicacion.DoesNotExist:
            return JsonResponse({'error': 'Aplicación no encontrada'}, status=404)
        
        # Verificar permisos
        if current_user.role == 'student':
            if application.student.user != current_user:
                return JsonResponse({'error': 'Acceso denegado'}, status=403)
            # Estudiantes solo pueden eliminar aplicaciones pendientes
            if application.status != 'pending':
                return JsonResponse({'error': 'Solo puedes eliminar aplicaciones pendientes'}, status=400)
        
        elif current_user.role == 'company':
            if application.project.company.user != current_user:
                return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        elif current_user.role != 'admin':
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        application.delete()
        
        return JsonResponse({'message': 'Aplicación eliminada exitosamente'})
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
