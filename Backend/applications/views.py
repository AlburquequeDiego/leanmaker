"""
Views para la app applications.
"""

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .models import Aplicacion
from core.views import verify_token

@csrf_exempt
@require_http_methods(["GET", "POST"])
def application_list(request):
    """Lista de aplicaciones y creación de nuevas postulaciones."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        if request.method == "POST":
            data = json.loads(request.body)
            project_id = data.get('project_id')
            if not project_id:
                return JsonResponse({'error': 'project_id es requerido'}, status=400)
            from projects.models import Proyecto
            from students.models import Estudiante
            try:
                project = Proyecto.objects.get(id=project_id)
            except Proyecto.DoesNotExist:
                return JsonResponse({'error': 'Proyecto no encontrado'}, status=404)
            try:
                student = current_user.estudiante_profile
            except Exception:
                return JsonResponse({'error': 'Perfil de estudiante no encontrado'}, status=404)
            # Verificar si ya existe una postulación
            from .models import Aplicacion
            if Aplicacion.objects.filter(project=project, student=student).exists():
                return JsonResponse({'error': 'Ya postulaste a este proyecto'}, status=400)
            # Crear la postulación
            app = Aplicacion.objects.create(
                project=project,
                student=student,
                status='pending',
            )
            return JsonResponse({'success': True, 'application_id': str(app.id)})
        # GET: lista de aplicaciones
        applications = Aplicacion.objects.all()
        applications_data = []
        for application in applications:
            applications_data.append({
                'id': str(application.id),
                'status': application.status,
                'created_at': application.created_at.isoformat(),
                'updated_at': application.updated_at.isoformat(),
            })
        return JsonResponse({
            'success': True,
            'data': applications_data
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def application_detail(request, application_id):
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
            application = Aplicacion.objects.get(id=application_id)
        except Aplicacion.DoesNotExist:
            return JsonResponse({'error': 'Aplicación no encontrada'}, status=404)
        
        application_data = {
            'id': str(application.id),
            'status': application.status,
            'created_at': application.created_at.isoformat(),
            'updated_at': application.updated_at.isoformat(),
        }
        
        return JsonResponse(application_data)
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def my_applications(request):
    """Devuelve las aplicaciones del estudiante autenticado con datos de proyecto y empresa."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        token = auth_header.split(' ')[1]
        from core.views import verify_token
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        # Obtener el perfil de estudiante
        try:
            student = current_user.estudiante_profile
        except Exception:
            return JsonResponse({'error': 'Perfil de estudiante no encontrado'}, status=404)
        # Obtener aplicaciones del estudiante
        from .models import Aplicacion
        applications = Aplicacion.objects.filter(student=student).select_related('project', 'project__company')
        applications_data = []
        for app in applications:
            applications_data.append({
                'id': str(app.id),
                'status': app.status,
                'created_at': app.created_at.isoformat(),
                'updated_at': app.updated_at.isoformat(),
                'applied_at': app.applied_at.isoformat() if app.applied_at else None,
                'responded_at': app.responded_at.isoformat() if app.responded_at else None,
                'compatibility_score': app.compatibility_score,
                'student_notes': app.student_notes,
                'cover_letter': app.cover_letter,
                'project': {
                    'id': str(app.project.id),
                    'title': app.project.title,
                    'description': app.project.description,
                    'duration_weeks': getattr(app.project, 'duration_weeks', None),
                    'location': getattr(app.project, 'location', ''),
                    'company': {
                        'id': str(app.project.company.id) if app.project.company else '',
                        'name': app.project.company.company_name if app.project.company else '',
                    } if hasattr(app.project, 'company') and app.project.company else {},
                } if app.project else {},
            })
        return JsonResponse({'results': applications_data, 'total': applications.count()})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
