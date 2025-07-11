"""
Views para la app disciplinary_records.
"""

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .models import DisciplinaryRecord
from core.views import verify_token
from django.core.paginator import Paginator
from django.utils import timezone
from datetime import datetime

@csrf_exempt
@require_http_methods(["GET"])
def disciplinary_records_list(request):
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        # Filtros y paginación
        page = request.GET.get('page', 1)
        per_page = request.GET.get('per_page', 20)
        severity = request.GET.get('severity')
        student_id = request.GET.get('student_id')
        company_id = request.GET.get('company_id')
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')
        
        queryset = DisciplinaryRecord.objects.select_related(
            'student__user', 'company', 'recorded_by'
        ).all()
        
        # Filtros según rol
        if current_user.role == 'student':
            # Estudiantes solo ven sus propios registros
            queryset = queryset.filter(student__user=current_user)
        elif current_user.role == 'company':
            # Empresas ven registros de sus incidentes
            queryset = queryset.filter(company__user=current_user)
        # Admin ve todo
        
        # Aplicar filtros adicionales
        if severity:
            queryset = queryset.filter(severity=severity)
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        if company_id:
            queryset = queryset.filter(company_id=company_id)
        if start_date:
            queryset = queryset.filter(incident_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(incident_date__lte=end_date)
        
        paginator = Paginator(queryset, per_page)
        page_obj = paginator.get_page(page)
        
        records_data = []
        for record in page_obj:
            records_data.append({
                'id': record.id,
                'student': {
                    'id': str(record.student.id),
                    'full_name': record.student.user.full_name,
                    'email': record.student.user.email
                } if record.student and record.student.user else None,
                'company': {
                    'id': str(record.company.id),
                    'name': record.company.name
                } if record.company else None,
                'incident_date': record.incident_date.isoformat(),
                'description': record.description,
                'action_taken': record.action_taken,
                'severity': record.severity,
                'severity_color': record.severity_color,
                'recorded_by': {
                    'id': str(record.recorded_by.id),
                    'full_name': record.recorded_by.get_full_name(),
                    'email': record.recorded_by.email
                } if record.recorded_by else None,
                'recorded_at': record.recorded_at.isoformat(),
                'is_recent': record.is_recent
            })
        
        return JsonResponse({
            'results': records_data,
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
def disciplinary_records_detail(request, disciplinary_records_id):
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        
        try:
            record = DisciplinaryRecord.objects.select_related(
                'student__user', 'company', 'recorded_by'
            ).get(id=disciplinary_records_id)
        except DisciplinaryRecord.DoesNotExist:
            return JsonResponse({'error': 'Registro disciplinario no encontrado'}, status=404)
        
        # Verificar permisos
        if current_user.role == 'student' and record.student.user != current_user:
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        elif current_user.role == 'company' and record.company.user != current_user:
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        record_data = {
            'id': record.id,
            'student': {
                'id': str(record.student.id),
                'full_name': record.student.user.full_name,
                'email': record.student.user.email,
                'phone': record.student.phone,
                'university': record.student.university,
                'career': record.student.career
            } if record.student and record.student.user else None,
            'company': {
                'id': str(record.company.id),
                'name': record.company.name,
                'industry': record.company.industry,
                'size': record.company.size
            } if record.company else None,
            'incident_date': record.incident_date.isoformat(),
            'description': record.description,
            'action_taken': record.action_taken,
            'severity': record.severity,
            'severity_color': record.severity_color,
            'recorded_by': {
                'id': str(record.recorded_by.id),
                'full_name': record.recorded_by.get_full_name(),
                'email': record.recorded_by.email
            } if record.recorded_by else None,
            'recorded_at': record.recorded_at.isoformat(),
            'is_recent': record.is_recent
        }
        
        return JsonResponse(record_data)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def disciplinary_records_create(request):
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user or current_user.role not in ['company', 'admin']:
            return JsonResponse({'error': 'Solo empresas y administradores pueden crear registros disciplinarios'}, status=403)
        
        data = json.loads(request.body)
        required_fields = ['student_id', 'company_id', 'incident_date', 'description', 'severity']
        for field in required_fields:
            if not data.get(field):
                return JsonResponse({'error': f'El campo {field} es requerido'}, status=400)
        
        # Validar severidad
        valid_severities = ['low', 'medium', 'high', 'critical']
        if data['severity'] not in valid_severities:
            return JsonResponse({'error': f'Severidad inválida. Valores válidos: {", ".join(valid_severities)}'}, status=400)
        
        # Validar que la empresa existe y el usuario tiene permisos
        from companies.models import Empresa
        try:
            company = Empresa.objects.get(id=data['company_id'])
            if current_user.role == 'company' and company.user != current_user:
                return JsonResponse({'error': 'Solo puedes crear registros para tu empresa'}, status=403)
        except Empresa.DoesNotExist:
            return JsonResponse({'error': 'Empresa no encontrada'}, status=404)
        
        # Validar que el estudiante existe
        from students.models import Estudiante
        try:
            student = Estudiante.objects.get(id=data['student_id'])
        except Estudiante.DoesNotExist:
            return JsonResponse({'error': 'Estudiante no encontrado'}, status=404)
        
        # Validar fecha del incidente
        try:
            incident_date = datetime.strptime(data['incident_date'], '%Y-%m-%d').date()
        except ValueError:
            return JsonResponse({'error': 'Formato de fecha inválido. Use YYYY-MM-DD'}, status=400)
        
        record = DisciplinaryRecord.objects.create(
            student=student,
            company=company,
            incident_date=incident_date,
            description=data['description'],
            action_taken=data.get('action_taken'),
            severity=data['severity'],
            recorded_by=current_user
        )
        
        record_data = {
            'id': record.id,
            'student': {
                'id': str(record.student.id),
                'full_name': record.student.user.full_name
            },
            'company': {
                'id': str(record.company.id),
                'name': record.company.name
            },
            'incident_date': record.incident_date.isoformat(),
            'description': record.description,
            'action_taken': record.action_taken,
            'severity': record.severity,
            'severity_color': record.severity_color,
            'recorded_by': {
                'id': str(record.recorded_by.id),
                'full_name': record.recorded_by.get_full_name()
            },
            'recorded_at': record.recorded_at.isoformat(),
            'is_recent': record.is_recent
        }
        
        return JsonResponse(record_data, status=201)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["PUT"])
def disciplinary_records_update(request, disciplinary_records_id):
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user or current_user.role not in ['company', 'admin']:
            return JsonResponse({'error': 'Solo empresas y administradores pueden actualizar registros disciplinarios'}, status=403)
        
        try:
            record = DisciplinaryRecord.objects.get(id=disciplinary_records_id)
        except DisciplinaryRecord.DoesNotExist:
            return JsonResponse({'error': 'Registro disciplinario no encontrado'}, status=404)
        
        # Verificar permisos
        if current_user.role == 'company' and record.company.user != current_user:
            return JsonResponse({'error': 'Solo puedes actualizar registros de tu empresa'}, status=403)
        
        data = json.loads(request.body)
        
        # Actualizar campos permitidos
        allowed_fields = ['description', 'action_taken', 'severity']
        for field in allowed_fields:
            if field in data:
                setattr(record, field, data[field])
        
        # Validar severidad si se actualiza
        if 'severity' in data:
            valid_severities = ['low', 'medium', 'high', 'critical']
            if data['severity'] not in valid_severities:
                return JsonResponse({'error': f'Severidad inválida. Valores válidos: {", ".join(valid_severities)}'}, status=400)
        
        record.save()
        
        record_data = {
            'id': record.id,
            'student': {
                'id': str(record.student.id),
                'full_name': record.student.user.full_name
            } if record.student and record.student.user else None,
            'company': {
                'id': str(record.company.id),
                'name': record.company.name
            } if record.company else None,
            'incident_date': record.incident_date.isoformat(),
            'description': record.description,
            'action_taken': record.action_taken,
            'severity': record.severity,
            'severity_color': record.severity_color,
            'recorded_by': {
                'id': str(record.recorded_by.id),
                'full_name': record.recorded_by.get_full_name()
            } if record.recorded_by else None,
            'recorded_at': record.recorded_at.isoformat(),
            'is_recent': record.is_recent
        }
        
        return JsonResponse(record_data)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["DELETE"])
def disciplinary_records_delete(request, disciplinary_records_id):
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user or current_user.role not in ['company', 'admin']:
            return JsonResponse({'error': 'Solo empresas y administradores pueden eliminar registros disciplinarios'}, status=403)
        
        try:
            record = DisciplinaryRecord.objects.get(id=disciplinary_records_id)
        except DisciplinaryRecord.DoesNotExist:
            return JsonResponse({'error': 'Registro disciplinario no encontrado'}, status=404)
        
        # Verificar permisos
        if current_user.role == 'company' and record.company.user != current_user:
            return JsonResponse({'error': 'Solo puedes eliminar registros de tu empresa'}, status=403)
        
        record.delete()
        return JsonResponse({'message': 'Registro disciplinario eliminado exitosamente'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
