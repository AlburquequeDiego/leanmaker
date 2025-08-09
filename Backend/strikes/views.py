"""
Views para la app strikes.
"""

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.db.models import Q
from users.models import User
from .models import Strike, StrikeReport
from core.views import verify_token
from django.utils import timezone


@csrf_exempt
@require_http_methods(["GET"])
def strikes_list(request):
    """Lista de strikes."""
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
        student = request.GET.get('student', '')
        company = request.GET.get('company', '')
        status = request.GET.get('status', '')
        
        # Query base
        queryset = Strike.objects.select_related('student', 'student__user', 'company', 'project', 'issued_by').all()
        
        # Aplicar filtros según el rol del usuario
        if current_user.role == 'student':
            # Estudiantes solo ven sus propios strikes
            queryset = queryset.filter(student__user=current_user)
        elif current_user.role == 'company':
            # Empresas ven strikes que han emitido
            queryset = queryset.filter(company__user=current_user)
        # Admins ven todas las strikes
        
        # Filtros adicionales
        if student:
            queryset = queryset.filter(student_id=student)
        
        if company:
            queryset = queryset.filter(company_id=company)
        
        if status:
            queryset = queryset.filter(is_active=(status == 'active'))
        
        # Contar total
        total_count = queryset.count()
        
        # Paginar
        strikes = queryset[offset:offset + limit]
        
        # Serializar datos
        strikes_data = []
        for strike in strikes:
            strikes_data.append({
                'id': str(strike.id),
                'student_id': str(strike.student.id),
                'student_name': strike.student.user.full_name,
                'company_id': str(strike.company.id),
                'company_name': strike.company.company_name,
                'project_id': str(strike.project.id) if strike.project else None,
                'project_title': strike.project.title if strike.project else None,
                'reason': strike.reason,
                'description': strike.description,
                'severity': strike.severity,
                'issued_by_id': str(strike.issued_by.id) if strike.issued_by else None,
                'issued_by_name': strike.issued_by.full_name if strike.issued_by else None,
                'issued_at': strike.issued_at.isoformat(),
                'expires_at': strike.expires_at.isoformat() if strike.expires_at else None,
                'is_active': strike.is_active,
                'resolved_at': strike.resolved_at.isoformat() if strike.resolved_at else None,
                'resolution_notes': strike.resolution_notes,
                'created_at': strike.created_at.isoformat(),
                'updated_at': strike.updated_at.isoformat(),
            })
        
        return JsonResponse({
            'results': strikes_data,
            'count': total_count,
            'page': page,
            'limit': limit,
            'total_pages': (total_count + limit - 1) // limit
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def strike_detail(request, strike_id):
    """Detalle de un strike."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Obtener strike
        try:
            strike = Strike.objects.select_related('student', 'student__user', 'company', 'project', 'issued_by').get(id=strike_id)
        except Strike.DoesNotExist:
            return JsonResponse({'error': 'Strike no encontrado'}, status=404)
        
        # Verificar permisos
        if current_user.role == 'student' and str(strike.student.user.id) != str(current_user.id):
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        elif current_user.role == 'company' and str(strike.company.user.id) != str(current_user.id):
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        # Serializar datos
        strike_data = {
            'id': str(strike.id),
            'student_id': str(strike.student.id),
            'student_name': strike.student.user.full_name,
            'company_id': str(strike.company.id),
            'company_name': strike.company.company_name,
            'project_id': str(strike.project.id) if strike.project else None,
            'project_title': strike.project.title if strike.project else None,
            'reason': strike.reason,
            'description': strike.description,
            'severity': strike.severity,
            'issued_by_id': str(strike.issued_by.id) if strike.issued_by else None,
            'issued_by_name': strike.issued_by.full_name if strike.issued_by else None,
            'issued_at': strike.issued_at.isoformat(),
            'expires_at': strike.expires_at.isoformat() if strike.expires_at else None,
            'is_active': strike.is_active,
            'resolved_at': strike.resolved_at.isoformat() if strike.resolved_at else None,
            'resolution_notes': strike.resolution_notes,
            'created_at': strike.created_at.isoformat(),
            'updated_at': strike.updated_at.isoformat(),
        }
        
        return JsonResponse(strike_data)
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def strike_reports_create(request):
    """Crear reporte de strike (empresa reporta estudiante)."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Solo empresas pueden crear reportes
        if current_user.role != 'company':
            return JsonResponse({'error': 'Acceso denegado. Solo empresas pueden reportar strikes.'}, status=403)
        
        # Procesar datos
        data = json.loads(request.body)
        
        # Validar campos requeridos
        required_fields = ['student_id', 'project_id', 'reason']
        for field in required_fields:
            if field not in data:
                return JsonResponse({'error': f'Campo requerido: {field}'}, status=400)
        
        try:
            from projects.models import Proyecto
            from applications.models import Aplicacion
            from students.models import Estudiante
            from companies.models import Empresa
            
            # Obtener objetos
            project = Proyecto.objects.get(id=data['project_id'])
            student = Estudiante.objects.get(id=data['student_id'])
            company = Empresa.objects.get(user=current_user)
            
            # Verificar que el proyecto pertenece a la empresa
            if project.company != company:
                return JsonResponse({'error': 'El proyecto no pertenece a tu empresa'}, status=403)
            
            # Verificar que el estudiante participó en el proyecto
            try:
                application = Aplicacion.objects.get(
                    project=project,
                    student=student,
                    status__in=['accepted', 'active', 'completed']
                )
            except Aplicacion.DoesNotExist:
                return JsonResponse({'error': 'El estudiante no participó en este proyecto'}, status=400)
            
            # Verificar que no haya un reporte previo para este estudiante en este proyecto
            existing_report = StrikeReport.objects.filter(
                company=company,
                student=student,
                project=project,
                status='pending'
            ).first()
            
            if existing_report:
                return JsonResponse({'error': 'Ya existe un reporte pendiente para este estudiante en este proyecto'}, status=400)
            
        except (Proyecto.DoesNotExist, Estudiante.DoesNotExist, Empresa.DoesNotExist):
            return JsonResponse({'error': 'Proyecto, estudiante o empresa no encontrado'}, status=404)
        
        # Crear reporte
        report = StrikeReport.objects.create(
            company=company,
            student=student,
            project=project,
            reason=data.get('reason'),
            description=data.get('description', ''),
            status='pending'
        )
        
        return JsonResponse({
            'message': 'Reporte de strike creado correctamente. Pendiente de revisión administrativa.',
            'id': str(report.id),
            'status': 'pending'
        }, status=201)
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def strike_reports_list(request):
    """Lista de reportes de strikes (para admin)."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Solo admins pueden ver reportes
        if current_user.role != 'admin':
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        # Parámetros de paginación y filtros
        page = int(request.GET.get('page', 1))
        limit = int(request.GET.get('limit', 10))
        offset = (page - 1) * limit
        status = request.GET.get('status', '')
        
        # Query base
        queryset = StrikeReport.objects.select_related('company', 'student', 'student__user', 'project', 'reviewed_by').all()
        
        # Filtros
        if status:
            queryset = queryset.filter(status=status)
        
        # Contar total
        total_count = queryset.count()
        
        # Paginar
        reports = queryset[offset:offset + limit]
        
        # Serializar datos
        reports_data = []
        for report in reports:
            reports_data.append({
                'id': str(report.id),
                'company_id': str(report.company.id),
                'company_name': report.company.company_name,
                'student_id': str(report.student.id),
                'student_name': report.student.user.full_name,
                'project_id': str(report.project.id),
                'project_title': report.project.title,
                'reason': report.reason,
                'description': report.description,
                'status': report.status,
                'reviewed_by_id': str(report.reviewed_by.id) if report.reviewed_by else None,
                'reviewed_by_name': report.reviewed_by.full_name if report.reviewed_by else None,
                'reviewed_at': report.reviewed_at.isoformat() if report.reviewed_at else None,
                'admin_notes': report.admin_notes,
                'created_at': report.created_at.isoformat(),
                'updated_at': report.updated_at.isoformat(),
            })
        
        return JsonResponse({
            'results': reports_data,
            'count': total_count,
            'page': page,
            'limit': limit,
            'total_pages': (total_count + limit - 1) // limit
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["PATCH"])
def strike_report_approve(request, report_id):
    """Aprobar reporte de strike (solo admin)."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Solo admins pueden aprobar strikes
        if current_user.role != 'admin':
            return JsonResponse({'error': 'Acceso denegado. Solo administradores pueden aprobar strikes.'}, status=403)
        
        try:
            report = StrikeReport.objects.get(id=report_id)
        except StrikeReport.DoesNotExist:
            return JsonResponse({'error': 'Reporte de strike no encontrado'}, status=404)
        
        # Verificar que el reporte esté pendiente
        if report.status != 'pending':
            return JsonResponse({'error': 'El reporte ya ha sido procesado'}, status=400)
        
        # Procesar datos
        data = json.loads(request.body) if request.body else {}
        admin_notes = data.get('admin_notes', '')
        
        # Actualizar reporte
        report.status = 'approved'
        report.reviewed_by = current_user
        report.reviewed_at = timezone.now()
        report.admin_notes = admin_notes
        report.save()
        
        # Crear el strike real
        from strikes.models import Strike
        strike = Strike.objects.create(
            student=report.student,
            company=report.company,
            project=report.project,
            reason=report.reason,
            description=report.description,
            severity='medium',  # Por defecto
            issued_by=report.company.user,
            is_active=True
        )
        
        # Actualizar contador de strikes del estudiante
        report.student.strikes = min(report.student.strikes + 1, 3)  # Máximo 3 strikes
        report.student.save()
        
        return JsonResponse({
            'message': 'Strike aprobado correctamente',
            'strike_id': str(strike.id),
            'report_id': str(report.id),
            'student_strikes': report.student.strikes
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["PATCH"])
def strike_report_reject(request, report_id):
    """Rechazar reporte de strike (solo admin)."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Solo admins pueden rechazar strikes
        if current_user.role != 'admin':
            return JsonResponse({'error': 'Acceso denegado. Solo administradores pueden rechazar strikes.'}, status=403)
        
        try:
            report = StrikeReport.objects.get(id=report_id)
        except StrikeReport.DoesNotExist:
            return JsonResponse({'error': 'Reporte de strike no encontrado'}, status=404)
        
        # Verificar que el reporte esté pendiente
        if report.status != 'pending':
            return JsonResponse({'error': 'El reporte ya ha sido procesado'}, status=400)
        
        # Procesar datos
        data = json.loads(request.body) if request.body else {}
        admin_notes = data.get('admin_notes', '')
        
        # Actualizar reporte
        report.status = 'rejected'
        report.reviewed_by = current_user
        report.reviewed_at = timezone.now()
        report.admin_notes = admin_notes
        report.save()
        
        return JsonResponse({
            'message': 'Strike rechazado correctamente',
            'report_id': str(report.id)
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def strike_reports_company(request):
    """Lista de reportes de strikes enviados por la empresa autenticada."""
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        if current_user.role != 'company':
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        # Obtener reportes enviados por la empresa
        queryset = StrikeReport.objects.select_related('company', 'student', 'student__user', 'project', 'reviewed_by').filter(company__user=current_user)
        reports_data = []
        for report in queryset:
            reports_data.append({
                'id': str(report.id),
                'company_id': str(report.company.id),
                'company_name': report.company.company_name,
                'student_id': str(report.student.id),
                'student_name': report.student.user.full_name,
                'project_id': str(report.project.id),
                'project_title': report.project.title,
                'reason': report.reason,
                'description': report.description,
                'status': report.status,
                'reviewed_by_id': str(report.reviewed_by.id) if report.reviewed_by else None,
                'reviewed_by_name': report.reviewed_by.full_name if report.reviewed_by else None,
                'reviewed_at': report.reviewed_at.isoformat() if report.reviewed_at else None,
                'admin_notes': report.admin_notes,
                'created_at': report.created_at.isoformat(),
                'updated_at': report.updated_at.isoformat(),
            })
        return JsonResponse({'results': reports_data})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
