from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import datetime, timedelta
from .models import CalendarEvent
from .serializers import CalendarEventSerializer, CalendarEventCreateSerializer
from projects.models import Project
from users.models import CustomUser
from django.db import models

# Create your views here.

class IsProjectParticipant(permissions.BasePermission):
    """
    Permiso para verificar si el usuario es un participante del proyecto.
    """
    def has_permission(self, request, view):
        project_id = request.data.get('project') or view.kwargs.get('project_pk')
        if not project_id:
            return False
            
        try:
            project = Project.objects.get(pk=project_id)
            user = request.user
            
            if user.role == CustomUser.Role.COMPANY:
                return project.company.user == user
            
            if user.role == CustomUser.Role.STUDENT:
                return project.applications.filter(student=user.student_profile, status='ACCEPTED').exists()
            
            return False
        except Project.DoesNotExist:
            return False

class CalendarEventViewSet(viewsets.ModelViewSet):
    """
    ViewSet para Eventos de Calendario.
    - Los usuarios pueden crear eventos para proyectos en los que participan.
    - Pueden ver eventos de proyectos en los que participan.
    - Los admins pueden ver todos los eventos.
    """
    queryset = CalendarEvent.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return CalendarEventCreateSerializer
        return CalendarEventSerializer

    def get_queryset(self):
        """
        Filtra los eventos según el rol del usuario.
        """
        user = self.request.user
        
        if user.is_staff:
            return CalendarEvent.objects.all()
        
        if user.role == CustomUser.Role.COMPANY:
            # Empresas ven eventos de sus proyectos
            return CalendarEvent.objects.filter(project__company=user.company_profile)
        
        if user.role == CustomUser.Role.STUDENT:
            # Estudiantes ven eventos de proyectos donde fueron aceptados
            return CalendarEvent.objects.filter(
                project__applications__student=user.student_profile,
                project__applications__status='ACCEPTED'
            )
        
        return CalendarEvent.objects.none()

    def perform_create(self, serializer):
        """
        Asigna automáticamente el usuario creador.
        """
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=['get'])
    def my_events(self, request):
        """
        Eventos del usuario actual (como creador o participante).
        """
        user = request.user
        events = CalendarEvent.objects.filter(
            models.Q(created_by=user) | models.Q(participants=user)
        ).distinct()
        
        serializer = self.get_serializer(events, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def upcoming_events(self, request):
        """
        Próximos eventos (en los próximos 30 días).
        """
        user = request.user
        now = timezone.now()
        thirty_days_later = now + timedelta(days=30)
        
        events = self.get_queryset().filter(
            start_date__gte=now,
            start_date__lte=thirty_days_later
        ).order_by('start_date')
        
        serializer = self.get_serializer(events, many=True)
        return Response(serializer.data)
