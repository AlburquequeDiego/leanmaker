from django.shortcuts import render
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Avg
from django.utils import timezone
from datetime import timedelta

from .models import Report
from .serializers import (
    ReportSerializer, ReportListSerializer, ReportGenerateSerializer,
    ReportStatsSerializer, ReportDownloadSerializer
)


class ReportViewSet(viewsets.ModelViewSet):
    """ViewSet para reportes"""
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['report_type', 'status', 'generated_by']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'completed_at', 'report_type']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return ReportListSerializer
        return ReportSerializer

    def get_queryset(self):
        """Optimizar consultas"""
        return super().get_queryset().select_related('generated_by')

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Obtener estadísticas de reportes"""
        queryset = self.get_queryset()
        
        # Fechas para filtros
        now = timezone.now()
        this_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        this_year_start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # Estadísticas básicas
        total_reports = queryset.count()
        completed_reports = queryset.filter(status='completed').count()
        pending_reports = queryset.filter(status='pending').count()
        failed_reports = queryset.filter(status='failed').count()
        reports_this_month = queryset.filter(created_at__gte=this_month_start).count()
        reports_this_year = queryset.filter(created_at__gte=this_year_start).count()
        
        # Tiempo promedio de procesamiento
        completed_reports_with_time = queryset.filter(status='completed')
        if completed_reports_with_time.exists():
            avg_processing_time = completed_reports_with_time.aggregate(
                avg=Avg('processing_time')
            )['avg'] or 0
        else:
            avg_processing_time = 0
        
        # Por tipo
        reports_by_type = {}
        for report_type in ['student_performance', 'company_activity', 'project_progress',
                           'financial_summary', 'user_activity', 'system_usage',
                           'evaluation_results', 'disciplinary_summary', 'custom']:
            count = queryset.filter(report_type=report_type).count()
            if count > 0:
                reports_by_type[report_type] = count
        
        # Top generadores
        top_generators = queryset.values('generated_by__full_name').annotate(
            count=Count('id')
        ).order_by('-count')[:10]
        
        stats = {
            'total_reports': total_reports,
            'completed_reports': completed_reports,
            'pending_reports': pending_reports,
            'failed_reports': failed_reports,
            'reports_this_month': reports_this_month,
            'reports_this_year': reports_this_year,
            'average_processing_time': round(avg_processing_time, 2),
            'reports_by_type': reports_by_type,
            'top_generators': list(top_generators),
        }
        
        serializer = ReportStatsSerializer(stats)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def generate(self, request, pk=None):
        """Generar reporte"""
        report = self.get_object()
        
        if report.status != 'pending':
            return Response(
                {'error': 'El reporte ya no está pendiente'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Aquí iría la lógica de generación real del reporte
            # Por ahora simulamos la generación
            
            # Simular procesamiento
            import time
            time.sleep(2)  # Simular tiempo de procesamiento
            
            # Marcar como completado
            report.mark_as_completed(
                file_path=f"/reports/{report.id}_{report.report_type}.pdf",
                file_size=1024 * 1024  # 1MB simulado
            )
            
            return Response({'message': 'Reporte generado exitosamente'})
        except Exception as e:
            report.status = 'failed'
            report.save()
            return Response(
                {'error': f'Error al generar el reporte: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def download(self, request, pk=None):
        """Descargar reporte"""
        report = self.get_object()
        
        if not report.is_completed:
            return Response(
                {'error': 'El reporte no está completado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Incrementar contador de descargas
        report.increment_download_count()
        
        return Response({
            'download_url': report.file_url,
            'filename': f"{report.title}_{report.report_type}.pdf"
        })

    @action(detail=False, methods=['post'])
    def create_report(self, request):
        """Crear y generar reporte en una sola operación"""
        serializer = ReportGenerateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        
        # Crear reporte
        report = Report.objects.create(
            report_type=data['report_type'],
            title=data['title'],
            description=data.get('description', ''),
            generated_by=request.user,
            status='pending'
        )
        
        # Generar reporte (simulado)
        try:
            import time
            time.sleep(1)  # Simular procesamiento
            
            report.mark_as_completed(
                file_path=f"/reports/{report.id}_{report.report_type}.pdf",
                file_size=512 * 1024  # 512KB simulado
            )
            
            serializer = self.get_serializer(report)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            report.status = 'failed'
            report.save()
            return Response(
                {'error': f'Error al generar el reporte: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Obtener reportes pendientes"""
        queryset = self.get_queryset().filter(status='pending')
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def completed(self, request):
        """Obtener reportes completados"""
        queryset = self.get_queryset().filter(status='completed')
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def my_reports(self, request):
        """Obtener reportes del usuario actual"""
        queryset = self.get_queryset().filter(generated_by=request.user)
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
