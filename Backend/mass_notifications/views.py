from django.shortcuts import render
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Avg
from django.utils import timezone
from datetime import timedelta

from .models import MassNotification, NotificationTemplate
from .serializers import (
    MassNotificationSerializer, MassNotificationListSerializer,
    NotificationTemplateSerializer, MassNotificationStatsSerializer,
    NotificationRecipientSerializer
)


class NotificationTemplateViewSet(viewsets.ModelViewSet):
    """ViewSet para plantillas de notificaciones"""
    queryset = NotificationTemplate.objects.all()
    serializer_class = NotificationTemplateSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['notification_type', 'is_active']
    search_fields = ['name', 'title_template', 'message_template']
    ordering_fields = ['name', 'created_at', 'updated_at']
    ordering = ['name']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def use_template(self, request, pk=None):
        """Usar una plantilla para crear una notificación"""
        template = self.get_object()
        context = request.data.get('context', {})
        
        try:
            title, message = template.render_template(context)
            return Response({
                'title': title,
                'message': message,
                'notification_type': template.notification_type
            })
        except Exception as e:
            return Response(
                {'error': f'Error al renderizar la plantilla: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )


class MassNotificationViewSet(viewsets.ModelViewSet):
    """ViewSet para notificaciones masivas"""
    queryset = MassNotification.objects.all()
    serializer_class = MassNotificationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'notification_type', 'priority', 'created_by']
    search_fields = ['title', 'message']
    ordering_fields = ['created_at', 'scheduled_at', 'sent_at', 'priority']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return MassNotificationListSerializer
        return MassNotificationSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Obtener estadísticas de notificaciones"""
        queryset = self.get_queryset()
        
        # Estadísticas básicas
        total_notifications = queryset.count()
        sent_notifications = queryset.filter(status='sent').count()
        scheduled_notifications = queryset.filter(status='scheduled').count()
        draft_notifications = queryset.filter(status='draft').count()
        failed_notifications = queryset.filter(status='failed').count()
        
        # Estadísticas de envío
        total_recipients = queryset.aggregate(total=Count('total_recipients'))['total'] or 0
        total_sent = queryset.aggregate(total=Count('sent_count'))['total'] or 0
        total_failed = queryset.aggregate(total=Count('failed_count'))['total'] or 0
        total_read = queryset.aggregate(total=Count('read_count'))['total'] or 0
        
        # Tasas promedio
        sent_notifications_with_recipients = queryset.filter(status='sent', total_recipients__gt=0)
        if sent_notifications_with_recipients.exists():
            avg_success_rate = sent_notifications_with_recipients.aggregate(
                avg=Avg('sent_count') * 100.0 / Avg('total_recipients')
            )['avg'] or 0
            avg_read_rate = sent_notifications_with_recipients.aggregate(
                avg=Avg('read_count') * 100.0 / Avg('sent_count')
            )['avg'] or 0
        else:
            avg_success_rate = 0
            avg_read_rate = 0
        
        stats = {
            'total_notifications': total_notifications,
            'sent_notifications': sent_notifications,
            'scheduled_notifications': scheduled_notifications,
            'draft_notifications': draft_notifications,
            'failed_notifications': failed_notifications,
            'total_recipients': total_recipients,
            'total_sent': total_sent,
            'total_failed': total_failed,
            'total_read': total_read,
            'average_success_rate': round(avg_success_rate, 2),
            'average_read_rate': round(avg_read_rate, 2),
        }
        
        serializer = MassNotificationStatsSerializer(stats)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def send_now(self, request, pk=None):
        """Enviar notificación inmediatamente"""
        notification = self.get_object()
        
        if notification.status != 'draft':
            return Response(
                {'error': 'Solo se pueden enviar notificaciones en estado borrador'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Aquí iría la lógica de envío real
            notification.status = 'sending'
            notification.save()
            
            # Simular envío
            notification.mark_as_sent()
            notification.increment_sent_count()
            
            return Response({'message': 'Notificación enviada exitosamente'})
        except Exception as e:
            notification.status = 'failed'
            notification.save()
            return Response(
                {'error': f'Error al enviar la notificación: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def schedule(self, request, pk=None):
        """Programar notificación"""
        notification = self.get_object()
        scheduled_at = request.data.get('scheduled_at')
        
        if not scheduled_at:
            return Response(
                {'error': 'Debe proporcionar una fecha de programación'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            from django.utils.dateparse import parse_datetime
            scheduled_datetime = parse_datetime(scheduled_at)
            
            if scheduled_datetime <= timezone.now():
                return Response(
                    {'error': 'La fecha programada debe ser futura'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            notification.scheduled_at = scheduled_datetime
            notification.status = 'scheduled'
            notification.save()
            
            return Response({'message': 'Notificación programada exitosamente'})
        except Exception as e:
            return Response(
                {'error': f'Error al programar la notificación: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancelar notificación"""
        notification = self.get_object()
        
        if notification.status not in ['draft', 'scheduled']:
            return Response(
                {'error': 'Solo se pueden cancelar notificaciones en borrador o programadas'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        notification.status = 'cancelled'
        notification.save()
        
        return Response({'message': 'Notificación cancelada exitosamente'})

    @action(detail=True, methods=['get'])
    def recipients(self, request, pk=None):
        """Obtener lista de destinatarios"""
        notification = self.get_object()
        recipients = []
        
        # Obtener estudiantes destinatarios
        if notification.target_all_students:
            from students.models import Estudiante
            students = Estudiante.objects.all()
        else:
            students = notification.target_students.all()
        
        for student in students:
            recipients.append({
                'student_id': student.id,
                'name': student.user.full_name,
                'email': student.user.email,
                'type': 'student',
                'sent': True,  # Simulado
                'read': False,  # Simulado
                'sent_at': notification.sent_at,
                'read_at': None
            })
        
        # Obtener empresas destinatarias
        if notification.target_all_companies:
            from companies.models import Empresa
            companies = Empresa.objects.all()
        else:
            companies = notification.target_companies.all()
        
        for company in companies:
            recipients.append({
                'company_id': company.id,
                'name': company.name,
                'email': company.email,
                'type': 'company',
                'sent': True,  # Simulado
                'read': False,  # Simulado
                'sent_at': notification.sent_at,
                'read_at': None
            })
        
        serializer = NotificationRecipientSerializer(recipients, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Obtener notificaciones pendientes de envío"""
        queryset = self.get_queryset().filter(
            Q(status='scheduled', scheduled_at__lte=timezone.now()) |
            Q(status='draft')
        )
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
