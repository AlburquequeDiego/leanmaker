from django.shortcuts import render
from rest_framework import viewsets, mixins, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count
from django.utils import timezone
from .models import Notification, NotificationTemplate
from .serializers import (
    NotificationSerializer, NotificationDetailSerializer, NotificationCreateSerializer,
    NotificationUpdateSerializer, NotificationTemplateSerializer, NotificationStatsSerializer
)

# Create your views here.

class NotificationViewSet(viewsets.ModelViewSet):
    """ViewSet para gestión de notificaciones"""
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['recipient', 'notification_type', 'is_read', 'priority']
    search_fields = ['title', 'message']
    ordering_fields = ['created_at', 'sent_at', 'read_at', 'priority']
    ordering = ['-created_at']

    def get_queryset(self):
        """Filtrar queryset según el rol del usuario"""
        user = self.request.user
        
        if user.role == 'admin':
            return Notification.objects.all()
        else:
            # Los usuarios ven solo sus notificaciones
            return Notification.objects.filter(recipient=user)

    def get_serializer_class(self):
        """Retornar serializer específico según la acción"""
        if self.action == 'create':
            return NotificationCreateSerializer
        elif self.action == 'update' or self.action == 'partial_update':
            return NotificationUpdateSerializer
        elif self.action == 'retrieve':
            return NotificationDetailSerializer
        return NotificationSerializer

    def perform_create(self, serializer):
        """Asignar el remitente al crear la notificación"""
        serializer.save(sender=self.request.user)

    @action(detail=False, methods=['get'])
    def unread(self, request):
        """Notificaciones no leídas del usuario actual"""
        queryset = Notification.objects.filter(
            recipient=request.user,
            is_read=False
        )
        serializer = NotificationSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Notificaciones recientes del usuario actual"""
        queryset = Notification.objects.filter(
            recipient=request.user
        ).order_by('-created_at')[:10]
        serializer = NotificationSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Marcar notificación como leída"""
        notification = self.get_object()
        
        if notification.recipient != request.user:
            return Response(
                {"error": "No puedes marcar notificaciones de otros usuarios"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        notification.is_read = True
        notification.read_at = timezone.now()
        notification.save()
        
        return Response({"message": "Notificación marcada como leída"})

    @action(detail=True, methods=['post'])
    def mark_as_unread(self, request, pk=None):
        """Marcar notificación como no leída"""
        notification = self.get_object()
        
        if notification.recipient != request.user:
            return Response(
                {"error": "No puedes marcar notificaciones de otros usuarios"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        notification.is_read = False
        notification.read_at = None
        notification.save()
        
        return Response({"message": "Notificación marcada como no leída"})

    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        """Marcar todas las notificaciones como leídas"""
        Notification.objects.filter(
            recipient=request.user,
            is_read=False
        ).update(
            is_read=True,
            read_at=timezone.now()
        )
        
        return Response({"message": "Todas las notificaciones marcadas como leídas"})

    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """Notificaciones por tipo"""
        notification_type = request.query_params.get('notification_type')
        if not notification_type:
            return Response(
                {"error": "Se requiere notification_type"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = Notification.objects.filter(
            recipient=request.user,
            notification_type=notification_type
        )
        serializer = NotificationSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Estadísticas de notificaciones"""
        if request.user.role == 'admin':
            # Estadísticas generales
            stats = {
                'total_notifications': Notification.objects.count(),
                'unread_notifications': Notification.objects.filter(is_read=False).count(),
                'sent_today': Notification.objects.filter(
                    created_at__date=timezone.now().date()
                ).count(),
                'notifications_by_type': Notification.objects.values('notification_type').annotate(count=Count('id')),
                'notifications_by_priority': Notification.objects.values('priority').annotate(count=Count('id')),
            }
        else:
            # Estadísticas del usuario
            user_notifications = Notification.objects.filter(recipient=request.user)
            stats = {
                'total_notifications': user_notifications.count(),
                'unread_notifications': user_notifications.filter(is_read=False).count(),
                'read_notifications': user_notifications.filter(is_read=True).count(),
                'notifications_by_type': user_notifications.values('notification_type').annotate(count=Count('id')),
                'recent_notifications': user_notifications.order_by('-created_at')[:5],
            }
        
        return Response(stats)

class NotificationTemplateViewSet(viewsets.ModelViewSet):
    """ViewSet para gestión de plantillas de notificaciones"""
    queryset = NotificationTemplate.objects.all()
    serializer_class = NotificationTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['template_type', 'is_active', 'language']
    search_fields = ['name', 'subject', 'content']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['name']

    def get_queryset(self):
        """Filtrar queryset según el rol del usuario"""
        user = self.request.user
        
        if user.role == 'admin':
            return NotificationTemplate.objects.all()
        else:
            # Otros usuarios ven solo plantillas activas
            return NotificationTemplate.objects.filter(is_active=True)

    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """Plantillas por tipo"""
        template_type = request.query_params.get('template_type')
        if not template_type:
            return Response(
                {"error": "Se requiere template_type"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = NotificationTemplate.objects.filter(
            template_type=template_type,
            is_active=True
        )
        serializer = NotificationTemplateSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_language(self, request):
        """Plantillas por idioma"""
        language = request.query_params.get('language', 'es')
        
        queryset = NotificationTemplate.objects.filter(
            language=language,
            is_active=True
        )
        serializer = NotificationTemplateSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activar plantilla (solo para admins)"""
        if request.user.role != 'admin':
            return Response(
                {"error": "Solo los administradores pueden activar plantillas"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        template = self.get_object()
        template.is_active = True
        template.save()
        
        return Response({"message": "Plantilla activada correctamente"})

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Desactivar plantilla (solo para admins)"""
        if request.user.role != 'admin':
            return Response(
                {"error": "Solo los administradores pueden desactivar plantillas"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        template = self.get_object()
        template.is_active = False
        template.save()
        
        return Response({"message": "Plantilla desactivada correctamente"})
