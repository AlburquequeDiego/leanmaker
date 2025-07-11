from django.shortcuts import render
, filters


from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Avg, Sum
from django.utils import timezone
from datetime import timedelta

from .models import DataBackup
from .serializers import (
    DataBackupSerializer, DataBackupListSerializer, DataBackupCreateSerializer,
    DataBackupStatsSerializer, DataBackupRestoreSerializer, DataBackupScheduleSerializer
)


class DataBackupViewSet(viewsets.ModelViewSet):
    """ViewSet para respaldos de datos"""
    queryset = DataBackup.objects.all()
    serializer_class = DataBackupSerializer
    permission_classes = [IsAdminUser]  # Solo administradores pueden gestionar respaldos
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['backup_type', 'status', 'created_by']
    search_fields = ['backup_name']
    ordering_fields = ['created_at', 'completed_at', 'backup_type', 'file_size']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return DataBackupListSerializer
        elif self.action == 'create':
            return DataBackupCreateSerializer
        return DataBackupSerializer

    def get_queryset(self):
        """Optimizar consultas"""
        return super().get_queryset().select_related('created_by')

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Obtener estadísticas de respaldos"""
        queryset = self.get_queryset()
        
        # Fechas para filtros
        now = timezone.now()
        this_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        this_year_start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # Estadísticas básicas
        total_backups = queryset.count()
        completed_backups = queryset.filter(status='completed').count()
        pending_backups = queryset.filter(status='pending').count()
        failed_backups = queryset.filter(status='failed').count()
        backups_this_month = queryset.filter(created_at__gte=this_month_start).count()
        backups_this_year = queryset.filter(created_at__gte=this_year_start).count()
        
        # Tamaño total
        total_size = queryset.aggregate(total=Sum('file_size'))['total'] or 0
        total_size_mb = round(total_size / (1024 * 1024), 2)
        total_size_gb = round(total_size / (1024 * 1024 * 1024), 2)
        
        # Duración promedio
        completed_backups_with_duration = queryset.filter(status='completed')
        if completed_backups_with_duration.exists():
            avg_duration = completed_backups_with_duration.aggregate(
                avg=Avg('duration_minutes')
            )['avg'] or 0
        else:
            avg_duration = 0
        
        # Por tipo
        backups_by_type = {}
        for backup_type in ['full', 'incremental', 'differential', 'schema_only', 'data_only']:
            count = queryset.filter(backup_type=backup_type).count()
            if count > 0:
                backups_by_type[backup_type] = count
        
        # Top creadores
        top_creators = queryset.values('created_by__full_name').annotate(
            count=Count('id')
        ).order_by('-count')[:10]
        
        stats = {
            'total_backups': total_backups,
            'completed_backups': completed_backups,
            'pending_backups': pending_backups,
            'failed_backups': failed_backups,
            'backups_this_month': backups_this_month,
            'backups_this_year': backups_this_year,
            'total_size_mb': total_size_mb,
            'total_size_gb': total_size_gb,
            'average_duration_minutes': round(avg_duration, 2),
            'backups_by_type': backups_by_type,
            'top_creators': list(top_creators),
        }
        
        serializer = DataBackupStatsSerializer(stats)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def execute(self, request, pk=None):
        """Ejecutar respaldo"""
        backup = self.get_object()
        
        if backup.status != 'pending':
            return Response(
                {'error': 'El respaldo ya no está pendiente'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Aquí iría la lógica de respaldo real
            # Por ahora simulamos el respaldo
            
            # Simular procesamiento
            import time
            time.sleep(3)  # Simular tiempo de respaldo
            
            # Marcar como completado
            backup.mark_as_completed(
                file_path=f"/backups/{backup.id}_{backup.backup_type}.sql",
                file_size=50 * 1024 * 1024,  # 50MB simulado
                checksum="abc123def456"
            )
            
            return Response({'message': 'Respaldo ejecutado exitosamente'})
        except Exception as e:
            backup.mark_as_failed()
            return Response(
                {'error': f'Error al ejecutar el respaldo: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        """Restaurar respaldo"""
        backup = self.get_object()
        
        if not backup.is_completed:
            return Response(
                {'error': 'El respaldo no está completado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = DataBackupRestoreSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Aquí iría la lógica de restauración real
            # Por ahora simulamos la restauración
            
            # Simular procesamiento
            import time
            time.sleep(5)  # Simular tiempo de restauración
            
            return Response({'message': 'Respaldo restaurado exitosamente'})
        except Exception as e:
            return Response(
                {'error': f'Error al restaurar el respaldo: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def create_backup(self, request):
        """Crear y ejecutar respaldo en una sola operación"""
        serializer = DataBackupCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        
        # Crear respaldo
        backup = DataBackup.objects.create(
            backup_name=data['backup_name'],
            backup_type=data['backup_type'],
            created_by=request.user,
            status='pending'
        )
        
        # Ejecutar respaldo (simulado)
        try:
            import time
            time.sleep(2)  # Simular procesamiento
            
            backup.mark_as_completed(
                file_path=f"/backups/{backup.id}_{backup.backup_type}.sql",
                file_size=25 * 1024 * 1024,  # 25MB simulado
                checksum="xyz789abc123"
            )
            
            serializer = self.get_serializer(backup)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            backup.mark_as_failed()
            return Response(
                {'error': f'Error al ejecutar el respaldo: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Obtener respaldos pendientes"""
        queryset = self.get_queryset().filter(status='pending')
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def completed(self, request):
        """Obtener respaldos completados"""
        queryset = self.get_queryset().filter(status='completed')
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Obtener respaldos recientes (últimos 7 días)"""
        queryset = self.get_queryset()
        seven_days_ago = timezone.now() - timedelta(days=7)
        
        recent_backups = queryset.filter(created_at__gte=seven_days_ago)
        
        page = self.paginate_queryset(recent_backups)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(recent_backups, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def expired(self, request):
        """Obtener respaldos expirados"""
        queryset = self.get_queryset()
        expired_backups = [backup for backup in queryset if backup.is_expired]
        
        page = self.paginate_queryset(expired_backups)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(expired_backups, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def schedule(self, request):
        """Programar respaldo automático"""
        serializer = DataBackupScheduleSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Aquí iría la lógica para programar respaldos automáticos
        # Por ahora solo retornamos éxito
        
        return Response({'message': 'Respaldo programado exitosamente'})
