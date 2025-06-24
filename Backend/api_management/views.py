from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count
from django.utils import timezone

from .models import APIKey, APIUsage, APIRateLimit
from .serializers import (
    APIKeySerializer, APIKeyDetailSerializer, APIKeyCreateSerializer,
    APIKeyUpdateSerializer, APIUsageSerializer, APIRateLimitSerializer,
    APIStatsSerializer
)

class APIKeyViewSet(viewsets.ModelViewSet):
    """ViewSet para gestión de claves de API"""
    queryset = APIKey.objects.all()
    serializer_class = APIKeySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['user', 'is_active', 'key_type']
    search_fields = ['name', 'description']
    ordering_fields = ['created_at', 'last_used_at', 'usage_count']
    ordering = ['-created_at']

    def get_queryset(self):
        """Filtrar queryset según el rol del usuario"""
        user = self.request.user
        
        if user.role == 'admin':
            return APIKey.objects.all()
        else:
            # Los usuarios ven solo sus propias claves
            return APIKey.objects.filter(user=user)

    def get_serializer_class(self):
        """Retornar serializer específico según la acción"""
        if self.action == 'create':
            return APIKeyCreateSerializer
        elif self.action == 'update' or self.action == 'partial_update':
            return APIKeyUpdateSerializer
        elif self.action == 'retrieve':
            return APIKeyDetailSerializer
        return APIKeySerializer

    def perform_create(self, serializer):
        """Asignar el usuario al crear la clave"""
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def my_keys(self, request):
        """Claves de API del usuario actual"""
        queryset = APIKey.objects.filter(user=request.user)
        serializer = APIKeySerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def regenerate(self, request, pk=None):
        """Regenerar clave de API"""
        api_key = self.get_object()
        
        if api_key.user != request.user:
            return Response(
                {"error": "No puedes regenerar claves de otros usuarios"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        api_key.regenerate_key()
        api_key.save()
        
        return Response({
            "message": "Clave regenerada correctamente",
            "new_key": api_key.key
        })

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activar clave de API"""
        api_key = self.get_object()
        
        if api_key.user != request.user and request.user.role != 'admin':
            return Response(
                {"error": "No puedes activar claves de otros usuarios"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        api_key.is_active = True
        api_key.save()
        
        return Response({"message": "Clave activada correctamente"})

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Desactivar clave de API"""
        api_key = self.get_object()
        
        if api_key.user != request.user and request.user.role != 'admin':
            return Response(
                {"error": "No puedes desactivar claves de otros usuarios"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        api_key.is_active = False
        api_key.save()
        
        return Response({"message": "Clave desactivada correctamente"})

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Estadísticas de claves de API"""
        if request.user.role == 'admin':
            # Estadísticas generales
            stats = {
                'total_keys': APIKey.objects.count(),
                'active_keys': APIKey.objects.filter(is_active=True).count(),
                'total_usage': APIUsage.objects.count(),
                'keys_by_type': APIKey.objects.values('key_type').annotate(count=Count('id')),
                'recent_usage': APIUsage.objects.order_by('-created_at')[:10],
            }
        else:
            # Estadísticas del usuario
            user_keys = APIKey.objects.filter(user=request.user)
            user_usage = APIUsage.objects.filter(api_key__user=request.user)
            stats = {
                'total_keys': user_keys.count(),
                'active_keys': user_keys.filter(is_active=True).count(),
                'total_usage': user_usage.count(),
                'usage_this_month': user_usage.filter(
                    created_at__month=timezone.now().month
                ).count(),
                'recent_usage': user_usage.order_by('-created_at')[:5],
            }
        
        return Response(stats)

class APIUsageViewSet(viewsets.ModelViewSet):
    """ViewSet para gestión de uso de APIs"""
    queryset = APIUsage.objects.all()
    serializer_class = APIUsageSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['api_key', 'endpoint', 'method', 'status_code']
    search_fields = ['endpoint', 'user_agent']
    ordering_fields = ['created_at', 'response_time', 'status_code']
    ordering = ['-created_at']

    def get_queryset(self):
        """Filtrar queryset según el rol del usuario"""
        user = self.request.user
        
        if user.role == 'admin':
            return APIUsage.objects.all()
        else:
            # Los usuarios ven solo su uso de API
            return APIUsage.objects.filter(api_key__user=user)

    def perform_create(self, serializer):
        """Registrar uso de API"""
        usage = serializer.save()
        
        # Actualizar contador de uso de la clave
        api_key = usage.api_key
        api_key.usage_count += 1
        api_key.last_used_at = timezone.now()
        api_key.save()

    @action(detail=False, methods=['get'])
    def my_usage(self, request):
        """Uso de API del usuario actual"""
        queryset = APIUsage.objects.filter(api_key__user=request.user)
        serializer = APIUsageSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_endpoint(self, request):
        """Uso de API por endpoint"""
        endpoint = request.query_params.get('endpoint')
        if not endpoint:
            return Response(
                {"error": "Se requiere endpoint"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if request.user.role == 'admin':
            queryset = APIUsage.objects.filter(endpoint__icontains=endpoint)
        else:
            queryset = APIUsage.objects.filter(
                api_key__user=request.user,
                endpoint__icontains=endpoint
            )
        
        serializer = APIUsageSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_date_range(self, request):
        """Uso de API por rango de fechas"""
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if not start_date or not end_date:
            return Response(
                {"error": "Se requieren start_date y end_date"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if request.user.role == 'admin':
            queryset = APIUsage.objects.filter(
                created_at__date__gte=start_date,
                created_at__date__lte=end_date
            )
        else:
            queryset = APIUsage.objects.filter(
                api_key__user=request.user,
                created_at__date__gte=start_date,
                created_at__date__lte=end_date
            )
        
        serializer = APIUsageSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Estadísticas de uso de API"""
        if request.user.role == 'admin':
            # Estadísticas generales
            stats = {
                'total_requests': APIUsage.objects.count(),
                'successful_requests': APIUsage.objects.filter(status_code__lt=400).count(),
                'failed_requests': APIUsage.objects.filter(status_code__gte=400).count(),
                'average_response_time': APIUsage.objects.aggregate(
                    avg_time=Count('response_time')
                )['avg_time'] or 0,
                'usage_by_endpoint': APIUsage.objects.values('endpoint').annotate(
                    count=Count('id')
                ).order_by('-count')[:10],
                'usage_by_status': APIUsage.objects.values('status_code').annotate(
                    count=Count('id')
                ),
            }
        else:
            # Estadísticas del usuario
            user_usage = APIUsage.objects.filter(api_key__user=request.user)
            stats = {
                'total_requests': user_usage.count(),
                'successful_requests': user_usage.filter(status_code__lt=400).count(),
                'failed_requests': user_usage.filter(status_code__gte=400).count(),
                'usage_this_month': user_usage.filter(
                    created_at__month=timezone.now().month
                ).count(),
                'usage_by_endpoint': user_usage.values('endpoint').annotate(
                    count=Count('id')
                ).order_by('-count')[:5],
            }
        
        return Response(stats)

class APIRateLimitViewSet(viewsets.ModelViewSet):
    """ViewSet para gestión de límites de tasa de API"""
    queryset = APIRateLimit.objects.all()
    serializer_class = APIRateLimitSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['user', 'endpoint', 'is_active']
    search_fields = ['endpoint', 'description']
    ordering_fields = ['created_at', 'requests_per_minute', 'requests_per_hour']
    ordering = ['endpoint']

    def get_queryset(self):
        """Filtrar queryset según el rol del usuario"""
        user = self.request.user
        
        if user.role == 'admin':
            return APIRateLimit.objects.all()
        else:
            # Los usuarios ven solo sus límites
            return APIRateLimit.objects.filter(user=user)

    def perform_create(self, serializer):
        """Asignar el usuario al crear el límite"""
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def my_limits(self, request):
        """Límites de tasa del usuario actual"""
        queryset = APIRateLimit.objects.filter(user=request.user)
        serializer = APIRateLimitSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activar límite de tasa"""
        rate_limit = self.get_object()
        
        if rate_limit.user != request.user and request.user.role != 'admin':
            return Response(
                {"error": "No puedes activar límites de otros usuarios"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        rate_limit.is_active = True
        rate_limit.save()
        
        return Response({"message": "Límite de tasa activado correctamente"})

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Desactivar límite de tasa"""
        rate_limit = self.get_object()
        
        if rate_limit.user != request.user and request.user.role != 'admin':
            return Response(
                {"error": "No puedes desactivar límites de otros usuarios"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        rate_limit.is_active = False
        rate_limit.save()
        
        return Response({"message": "Límite de tasa desactivado correctamente"})

    @action(detail=False, methods=['get'])
    def check_limit(self, request):
        """Verificar límite de tasa para un endpoint"""
        endpoint = request.query_params.get('endpoint')
        user_id = request.query_params.get('user_id', request.user.id)
        
        if not endpoint:
            return Response(
                {"error": "Se requiere endpoint"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            rate_limit = APIRateLimit.objects.get(
                user_id=user_id,
                endpoint=endpoint,
                is_active=True
            )
            
            # Verificar límites
            now = timezone.now()
            minute_ago = now - timezone.timedelta(minutes=1)
            hour_ago = now - timezone.timedelta(hours=1)
            
            recent_usage = APIUsage.objects.filter(
                api_key__user_id=user_id,
                endpoint=endpoint,
                created_at__gte=minute_ago
            ).count()
            
            hourly_usage = APIUsage.objects.filter(
                api_key__user_id=user_id,
                endpoint=endpoint,
                created_at__gte=hour_ago
            ).count()
            
            limit_info = {
                'endpoint': endpoint,
                'user_id': user_id,
                'minute_limit': rate_limit.requests_per_minute,
                'hour_limit': rate_limit.requests_per_hour,
                'current_minute_usage': recent_usage,
                'current_hour_usage': hourly_usage,
                'minute_remaining': max(0, rate_limit.requests_per_minute - recent_usage),
                'hour_remaining': max(0, rate_limit.requests_per_hour - hourly_usage),
                'minute_exceeded': recent_usage >= rate_limit.requests_per_minute,
                'hour_exceeded': hourly_usage >= rate_limit.requests_per_hour,
            }
            
            return Response(limit_info)
            
        except APIRateLimit.DoesNotExist:
            return Response({
                'endpoint': endpoint,
                'user_id': user_id,
                'limit_found': False,
                'message': 'No se encontró límite de tasa para este endpoint'
            }) 
