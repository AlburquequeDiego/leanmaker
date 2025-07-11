"""
Views para la app data_backups.
"""

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .models import DataBackup
from core.views import verify_token
from django.core.paginator import Paginator
from django.utils import timezone
from datetime import datetime, timedelta

@csrf_exempt
@require_http_methods(["GET"])
def data_backups_list(request):
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user or current_user.role != 'admin':
            return JsonResponse({'error': 'Solo administradores pueden ver respaldos'}, status=403)
        
        # Filtros y paginación
        page = request.GET.get('page', 1)
        per_page = request.GET.get('per_page', 20)
        status = request.GET.get('status')
        backup_type = request.GET.get('backup_type')
        created_by = request.GET.get('created_by')
        
        queryset = DataBackup.objects.select_related('created_by').all()
        
        # Aplicar filtros
        if status:
            queryset = queryset.filter(status=status)
        if backup_type:
            queryset = queryset.filter(backup_type=backup_type)
        if created_by:
            queryset = queryset.filter(created_by__id=created_by)
        
        paginator = Paginator(queryset, per_page)
        page_obj = paginator.get_page(page)
        
        backups_data = []
        for backup in page_obj:
            backups_data.append({
                'id': backup.id,
                'backup_name': backup.backup_name,
                'backup_type': backup.backup_type,
                'file_url': backup.file_url,
                'file_size': backup.file_size,
                'file_size_mb': backup.file_size_mb,
                'file_size_gb': backup.file_size_gb,
                'file_path': backup.file_path,
                'checksum': backup.checksum,
                'status': backup.status,
                'created_by': {
                    'id': str(backup.created_by.id),
                    'full_name': backup.created_by.get_full_name(),
                    'email': backup.created_by.email
                } if backup.created_by else None,
                'created_at': backup.created_at.isoformat(),
                'completed_at': backup.completed_at.isoformat() if backup.completed_at else None,
                'expires_at': backup.expires_at.isoformat() if backup.expires_at else None,
                'is_expired': backup.is_expired,
                'is_completed': backup.is_completed,
                'duration_minutes': backup.duration_minutes
            })
        
        return JsonResponse({
            'results': backups_data,
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
def data_backups_detail(request, data_backups_id):
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user or current_user.role != 'admin':
            return JsonResponse({'error': 'Solo administradores pueden ver respaldos'}, status=403)
        
        try:
            backup = DataBackup.objects.select_related('created_by').get(id=data_backups_id)
        except DataBackup.DoesNotExist:
            return JsonResponse({'error': 'Respaldo no encontrado'}, status=404)
        
        backup_data = {
            'id': backup.id,
            'backup_name': backup.backup_name,
            'backup_type': backup.backup_type,
            'file_url': backup.file_url,
            'file_size': backup.file_size,
            'file_size_mb': backup.file_size_mb,
            'file_size_gb': backup.file_size_gb,
            'file_path': backup.file_path,
            'checksum': backup.checksum,
            'status': backup.status,
            'created_by': {
                'id': str(backup.created_by.id),
                'full_name': backup.created_by.get_full_name(),
                'email': backup.created_by.email
            } if backup.created_by else None,
            'created_at': backup.created_at.isoformat(),
            'completed_at': backup.completed_at.isoformat() if backup.completed_at else None,
            'expires_at': backup.expires_at.isoformat() if backup.expires_at else None,
            'is_expired': backup.is_expired,
            'is_completed': backup.is_completed,
            'duration_minutes': backup.duration_minutes
        }
        
        return JsonResponse(backup_data)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def data_backups_create(request):
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user or current_user.role != 'admin':
            return JsonResponse({'error': 'Solo administradores pueden crear respaldos'}, status=403)
        
        data = json.loads(request.body)
        required_fields = ['backup_name', 'backup_type']
        for field in required_fields:
            if not data.get(field):
                return JsonResponse({'error': f'El campo {field} es requerido'}, status=400)
        
        # Validar tipo de respaldo
        valid_types = ['full', 'partial', 'incremental', 'differential']
        if data['backup_type'] not in valid_types:
            return JsonResponse({'error': f'Tipo de respaldo inválido. Tipos válidos: {", ".join(valid_types)}'}, status=400)
        
        # Calcular fecha de expiración (por defecto 30 días)
        expires_at = None
        if data.get('expires_in_days'):
            expires_at = timezone.now() + timedelta(days=data['expires_in_days'])
        elif data.get('expires_at'):
            try:
                expires_at = datetime.fromisoformat(data['expires_at'].replace('Z', '+00:00'))
            except ValueError:
                return JsonResponse({'error': 'Formato de fecha de expiración inválido'}, status=400)
        
        backup = DataBackup.objects.create(
            backup_name=data['backup_name'],
            backup_type=data['backup_type'],
            status=data.get('status', 'pending'),
            created_by=current_user,
            expires_at=expires_at
        )
        
        backup_data = {
            'id': backup.id,
            'backup_name': backup.backup_name,
            'backup_type': backup.backup_type,
            'status': backup.status,
            'created_by': {
                'id': str(backup.created_by.id),
                'full_name': backup.created_by.get_full_name()
            },
            'created_at': backup.created_at.isoformat(),
            'expires_at': backup.expires_at.isoformat() if backup.expires_at else None,
            'is_expired': backup.is_expired,
            'is_completed': backup.is_completed
        }
        
        return JsonResponse(backup_data, status=201)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["PUT"])
def data_backups_update(request, data_backups_id):
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user or current_user.role != 'admin':
            return JsonResponse({'error': 'Solo administradores pueden actualizar respaldos'}, status=403)
        
        try:
            backup = DataBackup.objects.get(id=data_backups_id)
        except DataBackup.DoesNotExist:
            return JsonResponse({'error': 'Respaldo no encontrado'}, status=404)
        
        data = json.loads(request.body)
        
        # Actualizar campos permitidos
        allowed_fields = ['backup_name', 'backup_type', 'status', 'file_url', 'file_path', 'checksum']
        for field in allowed_fields:
            if field in data:
                setattr(backup, field, data[field])
        
        # Manejar campos especiales
        if 'file_size' in data:
            backup.file_size = data['file_size']
        
        if 'completed_at' in data:
            if data['completed_at']:
                try:
                    backup.completed_at = datetime.fromisoformat(data['completed_at'].replace('Z', '+00:00'))
                except ValueError:
                    return JsonResponse({'error': 'Formato de fecha de completado inválido'}, status=400)
            else:
                backup.completed_at = None
        
        if 'expires_at' in data:
            if data['expires_at']:
                try:
                    backup.expires_at = datetime.fromisoformat(data['expires_at'].replace('Z', '+00:00'))
                except ValueError:
                    return JsonResponse({'error': 'Formato de fecha de expiración inválido'}, status=400)
            else:
                backup.expires_at = None
        
        backup.save()
        
        backup_data = {
            'id': backup.id,
            'backup_name': backup.backup_name,
            'backup_type': backup.backup_type,
            'file_url': backup.file_url,
            'file_size': backup.file_size,
            'file_size_mb': backup.file_size_mb,
            'file_size_gb': backup.file_size_gb,
            'file_path': backup.file_path,
            'checksum': backup.checksum,
            'status': backup.status,
            'created_by': {
                'id': str(backup.created_by.id),
                'full_name': backup.created_by.get_full_name()
            } if backup.created_by else None,
            'created_at': backup.created_at.isoformat(),
            'completed_at': backup.completed_at.isoformat() if backup.completed_at else None,
            'expires_at': backup.expires_at.isoformat() if backup.expires_at else None,
            'is_expired': backup.is_expired,
            'is_completed': backup.is_completed,
            'duration_minutes': backup.duration_minutes
        }
        
        return JsonResponse(backup_data)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["DELETE"])
def data_backups_delete(request, data_backups_id):
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        token = auth_header.split(' ')[1]
        current_user = verify_token(token)
        if not current_user or current_user.role != 'admin':
            return JsonResponse({'error': 'Solo administradores pueden eliminar respaldos'}, status=403)
        
        try:
            backup = DataBackup.objects.get(id=data_backups_id)
        except DataBackup.DoesNotExist:
            return JsonResponse({'error': 'Respaldo no encontrado'}, status=404)
        
        backup.delete()
        return JsonResponse({'message': 'Respaldo eliminado exitosamente'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
