"""
Views para la app documents.
"""

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.http import FileResponse, Http404
import os

from .models import Document
from .serializers import DocumentSerializer, DocumentListSerializer
from users.models import User
from projects.models import Proyecto
from core.auth_utils import require_auth, require_admin, require_company, require_student


@csrf_exempt
@require_http_methods(["GET", "POST"])
@require_auth
def document_list_create(request):
    """Vista para listar y crear documentos"""
    if request.method == 'GET':
        return document_list(request)
    elif request.method == 'POST':
        return document_create(request)


def document_list(request):
    """Listar documentos según el rol del usuario"""
    try:
        user = request.user
        
        if user.role == 'admin':
            # Admin ve todos los documentos
            documents = Document.objects.all()
        elif user.role == 'company':
            # Empresa ve documentos de sus proyectos y documentos públicos
            company_projects = Proyecto.objects.filter(company=user.company)
            documents = Document.objects.filter(
                Q(project__in=company_projects) | Q(is_public=True)
            )
        elif user.role == 'student':
            # Estudiante ve documentos de sus proyectos asignados y documentos públicos
            student_projects = Proyecto.objects.filter(students=user)
            documents = Document.objects.filter(
                Q(project__in=student_projects) | Q(is_public=True)
            )
        else:
            documents = Document.objects.none()
        
        # Aplicar filtros
        document_type_filter = request.GET.get('document_type')
        if document_type_filter:
            documents = documents.filter(document_type=document_type_filter)
        
        is_public_filter = request.GET.get('is_public')
        if is_public_filter is not None:
            is_public = is_public_filter.lower() == 'true'
            documents = documents.filter(is_public=is_public)
        
        # Ordenar por fecha de creación descendente
        documents = documents.order_by('-created_at')
        
        # Serializar resultados
        documents_data = [DocumentListSerializer.to_dict(document) for document in documents]
        
        return JsonResponse({
            'success': True,
            'documents': documents_data,
            'count': len(documents_data)
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error al listar documentos: {str(e)}'
        }, status=500)


def document_create(request):
    """Crear un nuevo documento"""
    try:
        user = request.user
        
        # Solo admin, empresa y estudiantes pueden crear documentos
        if user.role not in ['admin', 'company', 'student']:
            return JsonResponse({
                'success': False,
                'error': 'No tienes permisos para crear documentos'
            }, status=403)
        
        data = json.loads(request.body)
        
        # Validar datos
        errors = DocumentSerializer.validate_data(data)
        if errors:
            return JsonResponse({
                'success': False,
                'errors': errors
            }, status=400)
        
        # Verificar permisos del proyecto
        if 'project' in data:
            project = data['project']
            if user.role == 'company':
                if project.company != user.company:
                    return JsonResponse({
                        'success': False,
                        'error': 'No tienes permisos para subir documentos a este proyecto'
                    }, status=403)
            elif user.role == 'student':
                if user not in project.students.all():
                    return JsonResponse({
                        'success': False,
                        'error': 'No tienes permisos para subir documentos a este proyecto'
                    }, status=403)
        
        # Crear documento
        document = DocumentSerializer.create(data, user)
        
        return JsonResponse({
            'success': True,
            'message': 'Documento creado exitosamente',
            'document': DocumentSerializer.to_dict(document)
        }, status=201)
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Datos JSON inválidos'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error al crear documento: {str(e)}'
        }, status=500)


@csrf_exempt
@require_http_methods(["GET", "PUT", "DELETE"])
@require_auth
def document_detail(request, document_id):
    """Vista para ver, actualizar y eliminar un documento específico"""
    if request.method == 'GET':
        return document_retrieve(request, document_id)
    elif request.method == 'PUT':
        return document_update(request, document_id)
    elif request.method == 'DELETE':
        return document_delete(request, document_id)


def document_retrieve(request, document_id):
    """Obtener un documento específico"""
    try:
        user = request.user
        
        # Obtener documento según permisos
        if user.role == 'admin':
            document = get_object_or_404(Document, id=document_id)
        elif user.role == 'company':
            company_projects = Proyecto.objects.filter(company=user.company)
            document = Document.objects.filter(
                id=document_id
            ).filter(
                Q(project__in=company_projects) | Q(is_public=True)
            ).first()
            if not document:
                return JsonResponse({
                    'success': False,
                    'error': 'Documento no encontrado'
                }, status=404)
        elif user.role == 'student':
            student_projects = Proyecto.objects.filter(students=user)
            document = Document.objects.filter(
                id=document_id
            ).filter(
                Q(project__in=student_projects) | Q(is_public=True)
            ).first()
            if not document:
                return JsonResponse({
                    'success': False,
                    'error': 'Documento no encontrado'
                }, status=404)
        else:
            return JsonResponse({
                'success': False,
                'error': 'No tienes permisos para ver este documento'
            }, status=403)
        
        return JsonResponse({
            'success': True,
            'document': DocumentSerializer.to_dict(document)
        })
        
    except Document.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Documento no encontrado'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error al obtener documento: {str(e)}'
        }, status=500)


def document_update(request, document_id):
    """Actualizar un documento"""
    try:
        user = request.user
        
        # Obtener documento según permisos
        if user.role == 'admin':
            document = get_object_or_404(Document, id=document_id)
        elif user.role == 'company':
            company_projects = Proyecto.objects.filter(company=user.company)
            document = Document.objects.filter(
                id=document_id
            ).filter(
                Q(project__in=company_projects) | Q(is_public=True)
            ).first()
            if not document:
                return JsonResponse({
                    'success': False,
                    'error': 'Documento no encontrado'
                }, status=404)
        elif user.role == 'student':
            student_projects = Proyecto.objects.filter(students=user)
            document = Document.objects.filter(
                id=document_id
            ).filter(
                Q(project__in=student_projects) | Q(is_public=True)
            ).first()
            if not document:
                return JsonResponse({
                    'success': False,
                    'error': 'Documento no encontrado'
                }, status=404)
        else:
            return JsonResponse({
                'success': False,
                'error': 'No tienes permisos para actualizar este documento'
            }, status=403)
        
        # Verificar que sea el creador o admin
        if user.role != 'admin' and document.uploaded_by != user:
            return JsonResponse({
                'success': False,
                'error': 'No tienes permisos para actualizar este documento'
            }, status=403)
        
        data = json.loads(request.body)
        
        # Validar datos
        errors = DocumentSerializer.validate_data(data)
        if errors:
            return JsonResponse({
                'success': False,
                'errors': errors
            }, status=400)
        
        # Actualizar documento
        document = DocumentSerializer.update(document, data)
        
        return JsonResponse({
            'success': True,
            'message': 'Documento actualizado exitosamente',
            'document': DocumentSerializer.to_dict(document)
        })
        
    except Document.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Documento no encontrado'
        }, status=404)
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Datos JSON inválidos'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error al actualizar documento: {str(e)}'
        }, status=500)


def document_delete(request, document_id):
    """Eliminar un documento"""
    try:
        user = request.user
        
        # Obtener documento según permisos
        if user.role == 'admin':
            document = get_object_or_404(Document, id=document_id)
        elif user.role == 'company':
            company_projects = Proyecto.objects.filter(company=user.company)
            document = Document.objects.filter(
                id=document_id
            ).filter(
                Q(project__in=company_projects) | Q(is_public=True)
            ).first()
            if not document:
                return JsonResponse({
                    'success': False,
                    'error': 'Documento no encontrado'
                }, status=404)
        elif user.role == 'student':
            student_projects = Proyecto.objects.filter(students=user)
            document = Document.objects.filter(
                id=document_id
            ).filter(
                Q(project__in=student_projects) | Q(is_public=True)
            ).first()
            if not document:
                return JsonResponse({
                    'success': False,
                    'error': 'Documento no encontrado'
                }, status=404)
        else:
            return JsonResponse({
                'success': False,
                'error': 'No tienes permisos para eliminar este documento'
            }, status=403)
        
        # Verificar que sea el creador o admin
        if user.role != 'admin' and document.uploaded_by != user:
            return JsonResponse({
                'success': False,
                'error': 'No tienes permisos para eliminar este documento'
            }, status=403)
        
        # Eliminar archivo físico si existe
        if document.file and os.path.exists(document.file.path):
            os.remove(document.file.path)
        
        document.delete()
        
        return JsonResponse({
            'success': True,
            'message': 'Documento eliminado exitosamente'
        })
        
    except Document.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Documento no encontrado'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error al eliminar documento: {str(e)}'
        }, status=500)


@require_http_methods(["GET"])
@require_auth
def download_document(request, document_id):
    """Endpoint para descargar un documento"""
    try:
        document = get_object_or_404(Document, id=document_id)
        user = request.user
        
        # Verificar permisos de acceso
        if user.role == 'admin':
            pass  # Admin puede acceder a todo
        elif user.role == 'company':
            if document.project.company != user.company and not document.is_public:
                return JsonResponse({
                    'success': False,
                    'error': 'No tienes permisos para acceder a este documento'
                }, status=403)
        elif user.role == 'student':
            if user not in document.project.students.all() and not document.is_public:
                return JsonResponse({
                    'success': False,
                    'error': 'No tienes permisos para acceder a este documento'
                }, status=403)
        
        # Verificar que el archivo existe
        if not document.file or not os.path.exists(document.file.path):
            return JsonResponse({
                'success': False,
                'error': 'El archivo no existe'
            }, status=404)
        
        # Incrementar contador de descargas
        document.increment_download_count()
        
        # Devolver archivo
        response = FileResponse(open(document.file.path, 'rb'))
        response['Content-Disposition'] = f'attachment; filename="{document.title}.{document.file_extension}"'
        return response
        
    except Document.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Documento no encontrado'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error al descargar el documento: {str(e)}'
        }, status=500)


@require_http_methods(["GET"])
@require_auth
def document_stats(request):
    """Endpoint para estadísticas de documentos"""
    try:
        user = request.user
        
        if user.role == 'admin':
            # Admin ve estadísticas globales
            total_documents = Document.objects.count()
            public_documents = Document.objects.filter(is_public=True).count()
            private_documents = total_documents - public_documents
            
            # Estadísticas por tipo
            type_stats = {}
            for doc_type, _ in Document.DOCUMENT_TYPE_CHOICES:
                count = Document.objects.filter(document_type=doc_type).count()
                type_stats[doc_type] = count
            
        elif user.role == 'company':
            # Empresa ve estadísticas de sus proyectos
            company_projects = Proyecto.objects.filter(company=user.company)
            company_documents = Document.objects.filter(project__in=company_projects)
            
            total_documents = company_documents.count()
            public_documents = company_documents.filter(is_public=True).count()
            private_documents = total_documents - public_documents
            
            # Estadísticas por tipo
            type_stats = {}
            for doc_type, _ in Document.DOCUMENT_TYPE_CHOICES:
                count = company_documents.filter(document_type=doc_type).count()
                type_stats[doc_type] = count
            
        elif user.role == 'student':
            # Estudiante ve estadísticas de sus proyectos
            student_projects = Proyecto.objects.filter(students=user)
            student_documents = Document.objects.filter(project__in=student_projects)
            
            total_documents = student_documents.count()
            public_documents = student_documents.filter(is_public=True).count()
            private_documents = total_documents - public_documents
            
            # Estadísticas por tipo
            type_stats = {}
            for doc_type, _ in Document.DOCUMENT_TYPE_CHOICES:
                count = student_documents.filter(document_type=doc_type).count()
                type_stats[doc_type] = count
        else:
            return JsonResponse({
                'success': False,
                'error': 'Rol de usuario no válido'
            }, status=400)
        
        return JsonResponse({
            'success': True,
            'stats': {
                'total_documents': total_documents,
                'public_documents': public_documents,
                'private_documents': private_documents,
                'type_stats': type_stats
            }
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error al obtener estadísticas: {str(e)}'
        }, status=500)
