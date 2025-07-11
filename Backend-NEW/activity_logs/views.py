from django.shortcuts import render
, filters


from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Max
from django.utils import timezone
from datetime import timedelta
from collections import defaultdict

from .models import ActivityLog
from .serializers import (
    ActivityLogSerializer, ActivityLogListSerializer, ActivityLogStatsSerializer,
    ActivityLogByUserSerializer, ActivityLogByActionSerializer, ActivityLogSearchSerializer
)


class ActivityLogViewSet(viewsets.ModelViewSet):
    """ViewSet para logs de actividad"""
    queryset = ActivityLog.objects.all()
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAdminUser]  # Solo administradores pueden ver logs
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['user', 'action', 'entity_type', 'ip_address']
    search_fields = ['action', 'details', 'user__full_name', 'user__email']
    ordering_fields = ['created_at', 'user', 'action']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return ActivityLogListSerializer
        return ActivityLogSerializer

    def get_queryset(self):
        """Optimizar consultas"""
        return super().get_queryset().select_related('user', 'content_type')

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Obtener estadísticas de logs de actividad"""
        queryset = self.get_queryset()
        
        # Fechas para filtros
        now = timezone.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_ago = now - timedelta(days=7)
        month_ago = now - timedelta(days=30)
        
        # Estadísticas básicas
        total_logs = queryset.count()
        logs_today = queryset.filter(created_at__gte=today_start).count()
        logs_this_week = queryset.filter(created_at__gte=week_ago).count()
        logs_this_month = queryset.filter(created_at__gte=month_ago).count()
        unique_users = queryset.values('user').distinct().count()
        
        # Top acciones
        top_actions = queryset.values('action').annotate(
            count=Count('id')
        ).order_by('-count')[:10]
        
        # Top usuarios
        top_users = queryset.values('user__full_name', 'user__email').annotate(
            count=Count('id')
        ).order_by('-count')[:10]
        
        # Actividad por hora (últimas 24 horas)
        activity_by_hour = defaultdict(int)
        for hour in range(24):
            hour_start = today_start + timedelta(hours=hour)
            hour_end = hour_start + timedelta(hours=1)
            count = queryset.filter(
                created_at__gte=hour_start,
                created_at__lt=hour_end
            ).count()
            activity_by_hour[f"{hour:02d}:00"] = count
        
        # Actividad por día (últimos 7 días)
        activity_by_day = defaultdict(int)
        for day in range(7):
            day_start = today_start - timedelta(days=day)
            day_end = day_start + timedelta(days=1)
            count = queryset.filter(
                created_at__gte=day_start,
                created_at__lt=day_end
            ).count()
            activity_by_day[day_start.strftime('%Y-%m-%d')] = count
        
        stats = {
            'total_logs': total_logs,
            'logs_today': logs_today,
            'logs_this_week': logs_this_week,
            'logs_this_month': logs_this_month,
            'unique_users': unique_users,
            'top_actions': list(top_actions),
            'top_users': list(top_users),
            'activity_by_hour': dict(activity_by_hour),
            'activity_by_day': dict(activity_by_day),
        }
        
        serializer = ActivityLogStatsSerializer(stats)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_user(self, request):
        """Obtener logs agrupados por usuario"""
        queryset = self.get_queryset()
        
        # Agrupar por usuario
        users_data = queryset.values('user').annotate(
            total_actions=Count('id'),
            last_activity=Max('created_at')
        ).order_by('-total_actions')
        
        # Enriquecer con información del usuario
        result = []
        for data in users_data:
            user_id = data['user']
            if user_id:
                from users.models import Usuario
                try:
                    user_obj = Usuario.objects.get(id=user_id)
                    
                    # Obtener desglose de acciones
                    actions_breakdown = queryset.filter(user_id=user_id).values('action').annotate(
                        count=Count('id')
                    )
                    
                    result.append({
                        'user_id': user_id,
                        'user_name': user_obj.full_name,
                        'user_email': user_obj.email,
                        'total_actions': data['total_actions'],
                        'last_activity': data['last_activity'],
                        'actions_breakdown': {item['action']: item['count'] for item in actions_breakdown}
                    })
                except Usuario.DoesNotExist:
                    continue
        
        serializer = ActivityLogByUserSerializer(result, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_action(self, request):
        """Obtener logs agrupados por acción"""
        queryset = self.get_queryset()
        
        # Agrupar por acción
        actions_data = queryset.values('action').annotate(
            total_occurrences=Count('id'),
            unique_users=Count('user', distinct=True),
            last_occurrence=Max('created_at')
        ).order_by('-total_occurrences')
        
        # Enriquecer con información de usuarios
        result = []
        for data in actions_data:
            action = data['action']
            
            # Obtener desglose de usuarios para esta acción
            users_breakdown = queryset.filter(action=action).values(
                'user__full_name', 'user__email'
            ).annotate(count=Count('id')).order_by('-count')[:10]
            
            result.append({
                'action': action,
                'total_occurrences': data['total_occurrences'],
                'unique_users': data['unique_users'],
                'last_occurrence': data['last_occurrence'],
                'users_breakdown': list(users_breakdown)
            })
        
        serializer = ActivityLogByActionSerializer(result, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def search(self, request):
        """Búsqueda avanzada de logs"""
        serializer = ActivityLogSearchSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        queryset = self.get_queryset()
        data = serializer.validated_data
        
        # Aplicar filtros
        if data.get('user'):
            queryset = queryset.filter(user_id=data['user'])
        
        if data.get('action'):
            queryset = queryset.filter(action__icontains=data['action'])
        
        if data.get('entity_type'):
            queryset = queryset.filter(entity_type__icontains=data['entity_type'])
        
        if data.get('entity_id'):
            queryset = queryset.filter(entity_id__icontains=data['entity_id'])
        
        if data.get('date_from'):
            queryset = queryset.filter(created_at__gte=data['date_from'])
        
        if data.get('date_to'):
            queryset = queryset.filter(created_at__lte=data['date_to'])
        
        if data.get('ip_address'):
            queryset = queryset.filter(ip_address__icontains=data['ip_address'])
        
        # Paginar resultados
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Obtener logs recientes (últimas 24 horas)"""
        queryset = self.get_queryset()
        twenty_four_hours_ago = timezone.now() - timedelta(hours=24)
        
        recent_logs = queryset.filter(created_at__gte=twenty_four_hours_ago)
        
        page = self.paginate_queryset(recent_logs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(recent_logs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def user_activity(self, request):
        """Obtener actividad del usuario actual (para usuarios no admin)"""
        if request.user.is_staff:
            return Response(
                {'error': 'Use el endpoint principal para administradores'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = self.get_queryset().filter(user=request.user)
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def security_events(self, request):
        """Obtener eventos de seguridad (login, logout, etc.)"""
        queryset = self.get_queryset()
        security_actions = ['login', 'logout', 'password_change', 'password_reset', 'failed_login']
        
        security_logs = queryset.filter(action__in=security_actions)
        
        page = self.paginate_queryset(security_logs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(security_logs, many=True)
        return Response(serializer.data)
