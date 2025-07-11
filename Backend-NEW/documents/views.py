from django.shortcuts import render
, filters


from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Sum
from django.utils import timezone
from django.http import HttpResponse
from datetime import timedelta
import os

from .models import Document
from .serializers import (
    DocumentSerializer, DocumentListSerializer, DocumentUploadSerializer,
    DocumentStatsSerializer, DocumentSearchSerializer
)


class DocumentViewSet(viewsets.ModelViewSet):
    """ViewSet para documentos"""
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['document_type', 'uploaded_by', 'is_public']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'updated_at', 'download_count', 'file_size']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return DocumentListSerializer
        elif self.action == 'create':
            return DocumentUploadSerializer
        return DocumentSerializer

    def get_queryset(self):
        """Optimizar consultas y filtrar por permisos"""
        queryset = super().get_queryset().select_related(
            'uploaded_by', 'project'
        )
        
        # Filtrar por permisos (usuarios solo ven documentos públicos o suyos)
        user = self.request.user
        if not user.is_staff:
            queryset = queryset.filter(
                Q(is_public=True) | Q(uploaded_by=user)
            )
        
        return queryset

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Obtener estadísticas de documentos"""
        queryset = self.get_queryset()
        
        # Fechas para filtros
        now = timezone.now()
        this_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        this_year_start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # Estadísticas básicas
        total_documents = queryset.count()
        documents_this_month = queryset.filter(created_at__gte=this_month_start).count()
        documents_this_year = queryset.filter(created_at__gte=this_year_start).count()
        
        # Tamaño total
        total_size = queryset.aggregate(total=Sum('file_size'))['total'] or 0
        total_size_mb = round(total_size / (1024 * 1024), 2)
        
        # Descargas
        total_downloads = queryset.aggregate(total=Sum('download_count'))['total'] or 0
        
        # Por visibilidad
        public_documents = queryset.filter(is_public=True).count()
        private_documents = queryset.filter(is_public=False).count()
        
        # Por tipo
        documents_by_type = {}
        for doc_type, _ in Document.DOCUMENT_TYPE_CHOICES:
            count = queryset.filter(document_type=doc_type).count()
            if count > 0:
                documents_by_type[doc_type] = count
        
        # Top descargados
        top_downloaded = queryset.order_by('-download_count')[:10].values(
            'id', 'title', 'download_count', 'document_type'
        )
        
        stats = {
            'total_documents': total_documents,
            'documents_this_month': documents_this_month,
            'documents_this_year': documents_this_year,
            'total_size_mb': total_size_mb,
            'total_downloads': total_downloads,
            'public_documents': public_documents,
            'private_documents': private_documents,
            'documents_by_type': documents_by_type,
            'top_downloaded': list(top_downloaded),
        }
        
        serializer = DocumentStatsSerializer(stats)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def download(self, request, pk=None):
        """Descargar documento e incrementar contador"""
        document = self.get_object()
        
        # Verificar permisos
        if not document.is_public and document.uploaded_by != request.user:
            return Response(
                {'error': 'No tiene permisos para descargar este documento'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Incrementar contador de descargas
        document.increment_download_count()
        
        # Retornar URL de descarga
        return Response({
            'download_url': document.file_url,
            'filename': os.path.basename(document.file.name) if document.file else document.title
        })

    @action(detail=True, methods=['post'])
    def toggle_visibility(self, request, pk=None):
        """Cambiar visibilidad del documento"""
        document = self.get_object()
        
        # Solo el propietario puede cambiar la visibilidad
        if document.uploaded_by != request.user:
            return Response(
                {'error': 'Solo el propietario puede cambiar la visibilidad'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        document.is_public = not document.is_public
        document.save()
        
        return Response({
            'is_public': document.is_public,
            'message': f'Documento marcado como {"público" if document.is_public else "privado"}'
        })

    @action(detail=False, methods=['post'])
    def search(self, request):
        """Búsqueda avanzada de documentos"""
        serializer = DocumentSearchSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        queryset = self.get_queryset()
        data = serializer.validated_data
        
        # Aplicar filtros
        if data.get('query'):
            query = data['query']
            queryset = queryset.filter(
                Q(title__icontains=query) | 
                Q(description__icontains=query)
            )
        
        if data.get('document_type'):
            queryset = queryset.filter(document_type=data['document_type'])
        
        if data.get('project'):
            queryset = queryset.filter(project_id=data['project'])
        
        if data.get('uploaded_by'):
            queryset = queryset.filter(uploaded_by_id=data['uploaded_by'])
        
        if data.get('is_public') is not None:
            queryset = queryset.filter(is_public=data['is_public'])
        
        if data.get('date_from'):
            queryset = queryset.filter(created_at__gte=data['date_from'])
        
        if data.get('date_to'):
            queryset = queryset.filter(created_at__lte=data['date_to'])
        
        # Paginar resultados
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def my_documents(self, request):
        """Obtener documentos del usuario actual"""
        queryset = self.get_queryset().filter(uploaded_by=request.user)
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def public_documents(self, request):
        """Obtener documentos públicos"""
        queryset = self.get_queryset().filter(is_public=True)
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Obtener documentos recientes (últimos 30 días)"""
        queryset = self.get_queryset()
        thirty_days_ago = timezone.now() - timedelta(days=30)
        
        recent_documents = queryset.filter(created_at__gte=thirty_days_ago)
        
        page = self.paginate_queryset(recent_documents)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(recent_documents, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def popular(self, request):
        """Obtener documentos más populares"""
        queryset = self.get_queryset().order_by('-download_count')
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
