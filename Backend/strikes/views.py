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
                'student': str(strike.student.id),
                'project': str(strike.project.id) if strike.project else None,
                'reason': strike.reason,
                'description': strike.description or '',
                'severity': strike.severity,
                'issued_by': str(strike.issued_by.id) if strike.issued_by else '',
                'issued_at': strike.issued_at.isoformat(),
                'expires_at': strike.expires_at.isoformat() if strike.expires_at else None,
                'is_active': strike.is_active,
                'created_at': strike.created_at.isoformat(),
                'updated_at': strike.updated_at.isoformat(),
            })
        
        return JsonResponse(strikes_data, safe=False)
        
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
            'student': str(strike.student.id),
            'project': str(strike.project.id) if strike.project else None,
            'reason': strike.reason,
            'description': strike.description or '',
            'severity': strike.severity,
            'issued_by': str(strike.issued_by.id) if strike.issued_by else '',
            'issued_at': strike.issued_at.isoformat(),
            'expires_at': strike.expires_at.isoformat() if strike.expires_at else None,
            'is_active': strike.is_active,
            'created_at': strike.created_at.isoformat(),
            'updated_at': strike.updated_at.isoformat(),
        }
        
        return JsonResponse(strike_data)
        
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
        required_fields = ['student', 'reason', 'severity']
        for field in required_fields:
            if not data.get(field):
                return JsonResponse({'error': f'Campo requerido: {field}'}, status=400)
        
        # Obtener el estudiante
        try:
            from students.models import Estudiante
            student = Estudiante.objects.get(id=data['student'])
        except Estudiante.DoesNotExist:
            return JsonResponse({'error': 'Estudiante no encontrado'}, status=404)
        
        # Crear el strike
        strike = Strike.objects.create(
            student=student,
            company=user.empresa_profile if user.role == 'company' else None,
            project_id=data.get('project') if data.get('project') else None,
            reason=data['reason'],
            description=data.get('description', ''),
            severity=data['severity'],
            issued_by=user,
        )
        
        strike_data = {
            'id': str(strike.id),
            'student': str(strike.student.id),
            'project': str(strike.project.id) if strike.project else None,
            'reason': strike.reason,
            'description': strike.description or '',
            'severity': strike.severity,
            'issued_by': str(strike.issued_by.id) if strike.issued_by else '',
            'issued_at': strike.issued_at.isoformat(),
            'expires_at': strike.expires_at.isoformat() if strike.expires_at else None,
            'is_active': strike.is_active,
            'created_at': strike.created_at.isoformat(),
            'updated_at': strike.updated_at.isoformat(),
        }
        
        return JsonResponse(strike_data, status=201)
        
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
        if 'reason' in data:
            strike.reason = data['reason']
        if 'description' in data:
            strike.description = data['description']
        if 'severity' in data:
            strike.severity = data['severity']
        if 'is_active' in data:
            if not data['is_active']:
                strike.resolver()
            else:
                strike.reactivar()
        
        strike.save()
        
        strike_data = {
            'id': str(strike.id),
            'student': str(strike.student.id),
            'project': str(strike.project.id) if strike.project else None,
            'reason': strike.reason,
            'description': strike.description or '',
            'severity': strike.severity,
            'issued_by': str(strike.issued_by.id) if strike.issued_by else '',
            'issued_at': strike.issued_at.isoformat(),
            'expires_at': strike.expires_at.isoformat() if strike.expires_at else None,
            'is_active': strike.is_active,
            'created_at': strike.created_at.isoformat(),
            'updated_at': strike.updated_at.isoformat(),
        }
        
        return JsonResponse(strike_data)
        
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
        
        return JsonResponse({'message': 'Strike eliminado exitosamente'})
        
    except Exception as e:
        return JsonResponse({'error': f'Error al eliminar strike: {str(e)}'}, status=500)
