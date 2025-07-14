"""
Views para la app strikes.
"""

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.exceptions import ValidationError
from .models import Strike
from core.auth_utils import get_user_from_token, require_auth
from core.views import verify_token

@csrf_exempt
@require_http_methods(["GET"])
def strike_list(request):
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
        
        strikes = Strike.objects.all()
        strikes_data = []
        
        for strike in strikes:
            strikes_data.append({
                'id': str(strike.id),
                'reason': strike.reason,
                'created_at': strike.created_at.isoformat(),
                'updated_at': strike.updated_at.isoformat(),
            })
        
        return JsonResponse({
            'success': True,
            'data': strikes_data
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
        
        try:
            strike = Strike.objects.get(id=strike_id)
        except Strike.DoesNotExist:
            return JsonResponse({'error': 'Strike no encontrado'}, status=404)
        
        strike_data = {
            'id': str(strike.id),
            'reason': strike.reason,
            'created_at': strike.created_at.isoformat(),
            'updated_at': strike.updated_at.isoformat(),
        }
        
        return JsonResponse(strike_data)
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
@require_auth
def strikes_list(request):
    """Lista strikes con filtros"""
    try:
        user = get_user_from_token(request)
        
        # Filtrar por empresa si es empresa
        if user.role == 'company':
            queryset = Strike.objects.filter(company=user.empresa_profile)
        else:
            queryset = Strike.objects.all()
        
        # Aplicar filtros
        status = request.GET.get('status')
        if status:
            queryset = queryset.filter(is_active=(status == 'active'))
        
        # Ordenar por fecha de creación
        queryset = queryset.order_by('-issued_at')
        
        # Serializar datos
        strikes_data = []
        for strike in queryset:
            strikes_data.append({
                'id': str(strike.id),
                'student_id': str(strike.student.id),
                'student_name': strike.student.user.full_name,
                'student_email': strike.student.user.email,
                'project_id': str(strike.project.id) if strike.project else None,
                'project_title': strike.project.title if strike.project else 'Sin proyecto',
                'type': 'other',  # Campo agregado para compatibilidad
                'severity': strike.severity,
                'description': strike.reason,
                'date': strike.issued_at.isoformat(),
                'status': 'active' if strike.is_active else 'resolved',
                'evidence': strike.description or '',
                'resolution': strike.resolution_notes or '',
                'resolved_date': strike.resolved_at.isoformat() if strike.resolved_at else None,
            })
        
        return JsonResponse({
            'success': True,
            'data': strikes_data,
            'total': len(strikes_data)
        })
        
    except Exception as e:
        return JsonResponse({'error': f'Error al listar strikes: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
@require_auth
def strikes_detail(request, strikes_id):
    """Obtener detalles de un strike"""
    try:
        user = get_user_from_token(request)
        
        try:
            strike = Strike.objects.get(id=strikes_id)
        except Strike.DoesNotExist:
            return JsonResponse({'error': 'Strike no encontrado'}, status=404)
        
        # Verificar permisos
        if user.role == 'company' and strike.company != user.empresa_profile:
            return JsonResponse({'error': 'No tienes permisos para ver este strike'}, status=403)
        
        strike_data = {
            'id': str(strike.id),
            'student_id': str(strike.student.id),
            'student_name': strike.student.user.full_name,
            'student_email': strike.student.user.email,
            'project_id': str(strike.project.id) if strike.project else None,
            'project_title': strike.project.title if strike.project else 'Sin proyecto',
            'type': 'other',
            'severity': strike.severity,
            'description': strike.reason,
            'date': strike.issued_at.isoformat(),
            'status': 'active' if strike.is_active else 'resolved',
            'evidence': strike.description or '',
            'resolution': strike.resolution_notes or '',
            'resolved_date': strike.resolved_at.isoformat() if strike.resolved_at else None,
        }
        
        return JsonResponse({'success': True, 'data': strike_data})
        
    except Exception as e:
        return JsonResponse({'error': f'Error al obtener strike: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
@require_auth
def strikes_create(request):
    """Crear un nuevo strike"""
    try:
        user = get_user_from_token(request)
        
        if user.role not in ['admin', 'company']:
            return JsonResponse({'error': 'No tienes permisos para crear strikes'}, status=403)
        
        data = json.loads(request.body)
        
        # Validar datos requeridos
        required_fields = ['student_name', 'project_title', 'description', 'severity']
        for field in required_fields:
            if not data.get(field):
                return JsonResponse({'error': f'Campo requerido: {field}'}, status=400)
        
        # Crear el strike
        strike = Strike.objects.create(
            student=user,  # Temporalmente usar el usuario actual
            company=user.empresa_profile if user.role == 'company' else None,
            reason=data['description'],
            description=data.get('evidence', ''),
            severity=data['severity'],
            issued_by=user,
        )
        
        strike_data = {
            'id': str(strike.id),
            'student_id': str(strike.student.id),
            'student_name': strike.student.user.full_name,
            'student_email': strike.student.user.email,
            'project_id': str(strike.project.id) if strike.project else None,
            'project_title': strike.project.title if strike.project else 'Sin proyecto',
            'type': 'other',
            'severity': strike.severity,
            'description': strike.reason,
            'date': strike.issued_at.isoformat(),
            'status': 'active',
            'evidence': strike.description or '',
            'resolution': '',
            'resolved_date': None,
        }
        
        return JsonResponse({
            'success': True,
            'message': 'Strike creado exitosamente',
            'data': strike_data
        }, status=201)
        
    except Exception as e:
        return JsonResponse({'error': f'Error al crear strike: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["PATCH"])
@require_auth
def strikes_update(request, strikes_id):
    """Actualizar un strike"""
    try:
        user = get_user_from_token(request)
        
        try:
            strike = Strike.objects.get(id=strikes_id)
        except Strike.DoesNotExist:
            return JsonResponse({'error': 'Strike no encontrado'}, status=404)
        
        # Verificar permisos
        if user.role == 'company' and strike.company != user.empresa_profile:
            return JsonResponse({'error': 'No tienes permisos para actualizar este strike'}, status=403)
        
        data = json.loads(request.body)
        
        # Actualizar campos
        if 'status' in data:
            if data['status'] == 'resolved':
                strike.resolver(data.get('resolution', ''))
            elif data['status'] == 'active':
                strike.reactivar()
        
        if 'resolution' in data:
            strike.resolution_notes = data['resolution']
        
        strike.save()
        
        strike_data = {
            'id': str(strike.id),
            'student_id': str(strike.student.id),
            'student_name': strike.student.user.full_name,
            'student_email': strike.student.user.email,
            'project_id': str(strike.project.id) if strike.project else None,
            'project_title': strike.project.title if strike.project else 'Sin proyecto',
            'type': 'other',
            'severity': strike.severity,
            'description': strike.reason,
            'date': strike.issued_at.isoformat(),
            'status': 'active' if strike.is_active else 'resolved',
            'evidence': strike.description or '',
            'resolution': strike.resolution_notes or '',
            'resolved_date': strike.resolved_at.isoformat() if strike.resolved_at else None,
        }
        
        return JsonResponse({
            'success': True,
            'message': 'Strike actualizado exitosamente',
            'data': strike_data
        })
        
    except Exception as e:
        return JsonResponse({'error': f'Error al actualizar strike: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["DELETE"])
@require_auth
def strikes_delete(request, strikes_id):
    """Eliminar un strike"""
    try:
        user = get_user_from_token(request)
        
        try:
            strike = Strike.objects.get(id=strikes_id)
        except Strike.DoesNotExist:
            return JsonResponse({'error': 'Strike no encontrado'}, status=404)
        
        # Verificar permisos
        if user.role == 'company' and strike.company != user.empresa_profile:
            return JsonResponse({'error': 'No tienes permisos para eliminar este strike'}, status=403)
        
        strike.delete()
        
        return JsonResponse({
            'success': True,
            'message': 'Strike eliminado exitosamente'
        })
        
    except Exception as e:
        return JsonResponse({'error': f'Error al eliminar strike: {str(e)}'}, status=500)
