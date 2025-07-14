"""
Views para la app applications.
"""

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.db.models import Q
from users.models import User
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
        page = int(request.GET.get('page', 1))
        limit = int(request.GET.get('limit', 10))
        offset = (page - 1) * limit
        project = request.GET.get('project', '')
        student = request.GET.get('student', '')
        status = request.GET.get('status', '')
        
        # Query base
        queryset = Aplicacion.objects.select_related('project', 'student', 'student__user', 'project__company').all()
        
        # Aplicar filtros según el rol del usuario
        if current_user.role == 'student':
            # Estudiantes solo ven sus propias aplicaciones
            queryset = queryset.filter(student__user=current_user)
        elif current_user.role == 'company':
            # Empresas ven aplicaciones a sus proyectos
            queryset = queryset.filter(project__company__user=current_user)
        # Admins ven todas las aplicaciones
        
        # Filtros adicionales
        if project:
            queryset = queryset.filter(project_id=project)
        
        if student:
            queryset = queryset.filter(student_id=student)
        
        if status:
            queryset = queryset.filter(status=status)
        
        # Contar total
        total_count = queryset.count()
        
        # Paginar
        applications = queryset[offset:offset + limit]
        
        # Serializar datos
        applications_data = []
        for application in applications:
            applications_data.append({
                'id': str(application.id),
                'project': str(application.project.id),
                'project_title': application.project.title,
                'student': str(application.student.id),
                'student_name': application.student.user.full_name,
                'student_email': application.student.user.email,
                'company_name': application.project.company.company_name if application.project.company else 'Sin empresa',
                'status': application.status,
                'cover_letter': application.cover_letter,
                'motivation': application.motivation,
                'experience': application.experience,
                'skills': application.skills,
                'availability': application.availability,
                'expected_hours': application.expected_hours,
                'created_at': application.created_at.isoformat(),
                'updated_at': application.updated_at.isoformat(),
            })
        
        return JsonResponse({
            'results': applications_data,
            'count': total_count,
            'page': page,
            'limit': limit,
            'total_pages': (total_count + limit - 1) // limit
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
        
        # Obtener aplicación
        try:
            application = Aplicacion.objects.select_related('project', 'student', 'student__user', 'project__company').get(id=applications_id)
        except Aplicacion.DoesNotExist:
            return JsonResponse({'error': 'Aplicación no encontrada'}, status=404)
        
        # Verificar permisos
        if current_user.role == 'student' and str(application.student.user.id) != str(current_user.id):
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        elif current_user.role == 'company' and str(application.project.company.user.id) != str(current_user.id):
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        # Serializar datos
        application_data = {
            'id': str(application.id),
            'project': str(application.project.id),
            'project_title': application.project.title,
            'student': str(application.student.id),
            'student_name': application.student.user.full_name,
            'student_email': application.student.user.email,
            'company_name': application.project.company.company_name if application.project.company else 'Sin empresa',
            'status': application.status,
            'cover_letter': application.cover_letter,
            'motivation': application.motivation,
            'experience': application.experience,
            'skills': application.skills,
            'availability': application.availability,
            'expected_hours': application.expected_hours,
            'created_at': application.created_at.isoformat(),
            'updated_at': application.updated_at.isoformat(),
        }
        
        return JsonResponse(application_data)
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def applications_create(request):
    """Crear nueva aplicación."""
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
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        # Procesar datos
        data = json.loads(request.body)
        
        # Crear aplicación
        application = Aplicacion.objects.create(
            project_id=data.get('project_id'),
            student_id=data.get('student_id'),
            status=data.get('status', 'pending'),
            cover_letter=data.get('cover_letter', ''),
            motivation=data.get('motivation', ''),
            experience=data.get('experience', ''),
            skills=data.get('skills', ''),
            availability=data.get('availability', ''),
            expected_hours=data.get('expected_hours', 0),
        )
        
        return JsonResponse({
            'message': 'Aplicación creada correctamente',
            'id': str(application.id)
        }, status=201)
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["PUT", "PATCH"])
def applications_update(request, applications_id):
    """Actualizar aplicación."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Obtener aplicación
        try:
            application = Aplicacion.objects.get(id=applications_id)
        except Aplicacion.DoesNotExist:
            return JsonResponse({'error': 'Aplicación no encontrada'}, status=404)
        
        # Verificar permisos
        if current_user.role == 'student' and str(application.student.user.id) != str(current_user.id):
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        elif current_user.role == 'company' and str(application.project.company.user.id) != str(current_user.id):
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        # Procesar datos
        data = json.loads(request.body)
        
        # Actualizar campos de la aplicación
        fields_to_update = [
            'status', 'cover_letter', 'motivation', 'experience', 'skills',
            'availability', 'expected_hours'
        ]
        
        for field in fields_to_update:
            if field in data:
                setattr(application, field, data[field])
        
        application.save()
        
        # Retornar datos actualizados
        return JsonResponse({
            'message': 'Aplicación actualizada correctamente',
            'id': str(application.id)
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["DELETE"])
def applications_delete(request, applications_id):
    """Eliminar aplicación."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Obtener aplicación
        try:
            application = Aplicacion.objects.get(id=applications_id)
        except Aplicacion.DoesNotExist:
            return JsonResponse({'error': 'Aplicación no encontrada'}, status=404)
        
        # Verificar permisos
        if current_user.role == 'student' and str(application.student.user.id) != str(current_user.id):
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        elif current_user.role == 'company' and str(application.project.company.user.id) != str(current_user.id):
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        application.delete()
        
        return JsonResponse({
            'message': 'Aplicación eliminada correctamente'
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def applications_received_applications(request):
    """Obtener aplicaciones recibidas por una empresa."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Solo empresas pueden ver aplicaciones recibidas
        if current_user.role != 'company':
            return JsonResponse({'error': 'Solo empresas pueden acceder a este endpoint'}, status=403)
        
        # Obtener aplicaciones a proyectos de la empresa
        queryset = Aplicacion.objects.select_related(
            'proyecto', 'estudiante', 'estudiante__user'
        ).filter(proyecto__company__user=current_user)
        
        # Aplicar filtros opcionales
        status = request.GET.get('status')
        if status:
            queryset = queryset.filter(status=status)
        
        # Ordenar por fecha de aplicación (más recientes primero)
        queryset = queryset.order_by('-applied_at')
        
        applications_data = []
        for application in queryset:
            applications_data.append({
                'id': str(application.id),
                'project': {
                    'id': str(application.project.id),
                    'title': application.project.title,
                    'description': application.project.description
                } if application.project else None,
                'student': {
                    'id': str(application.student.id),
                    'full_name': application.student.user.full_name,
                    'email': application.student.user.email,
                    'university': application.student.university,
                    'career': application.student.career
                } if application.student else None,
                'status': application.status,
                'compatibility_score': application.compatibility_score,
                'cover_letter': application.cover_letter,
                'company_notes': application.company_notes,
                'portfolio_url': application.portfolio_url,
                'github_url': application.github_url,
                'linkedin_url': application.linkedin_url,
                'applied_at': application.applied_at.isoformat(),
                'reviewed_at': application.reviewed_at.isoformat() if application.reviewed_at else None,
                'responded_at': application.responded_at.isoformat() if application.responded_at else None
            })
        
        return JsonResponse({
            'results': applications_data,
            'total': len(applications_data)
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def applications_my_applications(request):
    """Obtener aplicaciones del estudiante actual."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Solo estudiantes pueden ver sus aplicaciones
        if current_user.role != 'student':
            return JsonResponse({'error': 'Solo estudiantes pueden acceder a este endpoint'}, status=403)
        
        # Obtener aplicaciones del estudiante
        from students.models import Estudiante
        try:
            student = Estudiante.objects.get(user=current_user)
        except Estudiante.DoesNotExist:
            return JsonResponse({'error': 'Estudiante no encontrado'}, status=404)
        
        queryset = Aplicacion.objects.select_related(
            'project', 'project__company', 'project__company__user'
        ).filter(student=student)
        
        # Aplicar filtros opcionales
        status = request.GET.get('status')
        if status:
            queryset = queryset.filter(status=status)
        
        # Ordenar por fecha de aplicación (más recientes primero)
        queryset = queryset.order_by('-applied_at')
        
        applications_data = []
        for application in queryset:
            applications_data.append({
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
                'status': application.status,
                'compatibility_score': application.compatibility_score,
                'cover_letter': application.cover_letter,
                'student_notes': application.student_notes,
                'portfolio_url': application.portfolio_url,
                'github_url': application.github_url,
                'linkedin_url': application.linkedin_url,
                'applied_at': application.applied_at.isoformat(),
                'reviewed_at': application.reviewed_at.isoformat() if application.reviewed_at else None,
                'responded_at': application.responded_at.isoformat() if application.responded_at else None
            })
        
        return JsonResponse({
            'results': applications_data,
            'total': len(applications_data)
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
