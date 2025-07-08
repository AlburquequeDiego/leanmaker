from rest_framework import viewsets, permissions
from .models import CalendarEvent, EventReminder, CalendarSettings
from .serializers import (
    CalendarEventSerializer, 
    EventReminderSerializer, 
    CalendarSettingsSerializer
)
from django.db import models
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

class CalendarEventViewSet(viewsets.ModelViewSet):
    serializer_class = CalendarEventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filtrar eventos según el rol del usuario"""
        # Verificar si es una vista fake para drf-spectacular
        if getattr(self, 'swagger_fake_view', False):
            return CalendarEvent.objects.none()
            
        user = self.request.user
        
        if user.es_admin:
            # Admin ve todos los eventos
            return CalendarEvent.objects.all()
        elif user.es_empresa:
            # Empresa ve eventos que creó o donde es participante
            return CalendarEvent.objects.filter(
                models.Q(created_by=user) | 
                models.Q(attendees=user) |
                models.Q(project__empresa=user.empresa_profile)
            ).distinct()
        elif user.es_estudiante:
            # Estudiante ve eventos donde es participante o relacionados a sus proyectos
            try:
                estudiante = user.estudiante_profile
                # Eventos donde es participante
                attended_events = CalendarEvent.objects.filter(attendees=user)
                # Eventos de proyectos donde es miembro
                member_project_events = CalendarEvent.objects.filter(
                    project__miembros__estudiante=estudiante
                )
                # Eventos que creó
                created_events = CalendarEvent.objects.filter(created_by=user)
                
                return (attended_events | member_project_events | created_events).distinct()
            except:
                return CalendarEvent.objects.filter(
                    models.Q(created_by=user) | 
                    models.Q(attendees=user)
                ).distinct()
        
        return CalendarEvent.objects.none()

    def perform_create(self, serializer):
        """Asignar el usuario creador al evento"""
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=['get'])
    def my_events(self, request):
        """Obtener eventos del usuario autenticado"""
        user = request.user
        
        # Eventos creados por el usuario
        created_events = CalendarEvent.objects.filter(created_by=user)
        # Eventos donde es participante
        attended_events = CalendarEvent.objects.filter(attendees=user)
        
        # Combinar y eliminar duplicados
        all_events = (created_events | attended_events).distinct()
        
        serializer = self.get_serializer(all_events, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def company_events(self, request):
        """Obtener eventos de la empresa (solo para empresas)"""
        if not request.user.es_empresa:
            return Response({'error': 'Acceso denegado'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            empresa = request.user.empresa_profile
            events = CalendarEvent.objects.filter(
                models.Q(created_by=request.user) |
                models.Q(project__empresa=empresa)
            ).distinct()
            
            serializer = self.get_serializer(events, many=True)
            return Response(serializer.data)
        except:
            return Response([], status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def student_events(self, request):
        """Obtener eventos del estudiante (solo para estudiantes)"""
        if not request.user.es_estudiante:
            return Response({'error': 'Acceso denegado'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            estudiante = request.user.estudiante_profile
            # Eventos donde es participante
            attended_events = CalendarEvent.objects.filter(attendees=request.user)
            # Eventos de proyectos donde es miembro
            member_project_events = CalendarEvent.objects.filter(
                project__miembros__estudiante=estudiante
            )
            # Eventos que creó
            created_events = CalendarEvent.objects.filter(created_by=request.user)
            
            all_events = (attended_events | member_project_events | created_events).distinct()
            
            serializer = self.get_serializer(all_events, many=True)
            return Response(serializer.data)
        except:
            return Response([], status=status.HTTP_404_NOT_FOUND)

class EventReminderViewSet(viewsets.ModelViewSet):
    queryset = EventReminder.objects.all()
    serializer_class = EventReminderSerializer
    permission_classes = [permissions.IsAuthenticated]

class CalendarSettingsViewSet(viewsets.ModelViewSet):
    serializer_class = CalendarSettingsSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filtrar configuraciones por usuario"""
        # Verificar si es una vista fake para drf-spectacular
        if getattr(self, 'swagger_fake_view', False):
            return CalendarSettings.objects.none()
            
        return CalendarSettings.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """Asignar el usuario a la configuración"""
        serializer.save(user=self.request.user)
