from django.shortcuts import render
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Avg, F
from django.utils import timezone
from .models import Proyecto, MiembroProyecto
from applications.models import Aplicacion
from .serializers import (
    ProjectSerializer, ProjectDetailSerializer, ProjectCreateSerializer,
    ProjectUpdateSerializer, ProjectApplicationSerializer, ProjectApplicationDetailSerializer,
    ProjectApplicationUpdateSerializer, ProjectStatsSerializer, ProjectSearchSerializer,
    ProjectMemberSerializer
)
from users.models import Usuario
from companies.models import Empresa

# Create your views here.

class ProjectViewSet(viewsets.ModelViewSet):
    """ViewSet para gestión de proyectos"""
    queryset = Proyecto.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'empresa', 'area']
    search_fields = ['titulo', 'descripcion', 'empresa__nombre']
    ordering_fields = ['fecha_creacion', 'fecha_inicio', 'fecha_fin']
    ordering = ['-fecha_creacion']

    def get_queryset(self):
        """Filtrar proyectos según el rol del usuario"""
        user = self.request.user
        
        if user.es_admin:
            # Admin ve todos los proyectos
            return Proyecto.objects.all()
        elif user.es_empresa:
            # Empresa ve solo sus proyectos
            try:
                empresa = user.empresa_profile
                return Proyecto.objects.filter(empresa=empresa)
            except:
                return Proyecto.objects.none()
        elif user.es_estudiante:
            # Estudiante ve proyectos publicados y donde es miembro
            try:
                estudiante = user.estudiante_profile
                # Proyectos donde es miembro
                member_projects = MiembroProyecto.objects.filter(estudiante=estudiante).values_list('proyecto_id', flat=True)
                # Proyectos publicados
                published_projects = Proyecto.objects.filter(status__name='published')
                # Combinar ambos
                return Proyecto.objects.filter(
                    models.Q(id__in=member_projects) | 
                    models.Q(status__name='published')
                ).distinct()
            except:
                return Proyecto.objects.filter(status__name='published')
        
        return Proyecto.objects.none()

    def get_serializer_class(self):
        """Retornar serializer específico según la acción"""
        if self.action == 'create':
            return ProjectCreateSerializer
        elif self.action == 'update' or self.action == 'partial_update':
            return ProjectUpdateSerializer
        elif self.action == 'retrieve':
            return ProjectDetailSerializer
        return ProjectSerializer

    def perform_create(self, serializer):
        """Asignar la empresa al crear el proyecto"""
        serializer.save(company=self.request.user.empresa)

    @action(detail=False, methods=['get'])
    def my_projects(self, request):
        """Obtener proyectos del usuario autenticado"""
        user = request.user
        
        if user.es_empresa:
            try:
                empresa = user.empresa_profile
                projects = Proyecto.objects.filter(empresa=empresa)
                serializer = self.get_serializer(projects, many=True)
                return Response(serializer.data)
            except:
                return Response([], status=status.HTTP_404_NOT_FOUND)
        elif user.es_estudiante:
            try:
                estudiante = user.estudiante_profile
                member_projects = MiembroProyecto.objects.filter(estudiante=estudiante)
                projects = [mp.proyecto for mp in member_projects]
                serializer = self.get_serializer(projects, many=True)
                return Response(serializer.data)
            except:
                return Response([], status=status.HTTP_404_NOT_FOUND)
        
        return Response({'error': 'Rol no soportado'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def available_projects(self, request):
        """Obtener proyectos disponibles para estudiantes"""
        if not request.user.es_estudiante:
            return Response({'error': 'Acceso denegado'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            estudiante = request.user.estudiante_profile
            # Proyectos ya aplicados
            applied_project_ids = AplicacionProyecto.objects.filter(
                estudiante=estudiante
            ).values_list('proyecto_id', flat=True)
            
            # Proyectos disponibles (publicados y no aplicados)
            available_projects = Proyecto.objects.filter(
                status__name='published'
            ).exclude(id__in=applied_project_ids)
            
            serializer = self.get_serializer(available_projects, many=True)
            return Response(serializer.data)
        except:
            return Response([], status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        """Publicar proyecto (solo para empresas)"""
        if request.user.role != 'company':
            return Response(
                {"error": "Solo las empresas pueden publicar proyectos"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        project = self.get_object()
        if project.company != request.user.empresa:
            return Response(
                {"error": "No puedes publicar proyectos de otras empresas"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        from project_status.models import ProjectStatus
        published_status, created = ProjectStatus.objects.get_or_create(name='published')
        project.status = published_status
        project.published_at = timezone.now()
        project.save()
        
        return Response({"message": "Proyecto publicado correctamente"})

    @action(detail=True, methods=['post'])
    def pause(self, request, pk=None):
        """Pausar proyecto (solo para empresas)"""
        if request.user.role != 'company':
            return Response(
                {"error": "Solo las empresas pueden pausar proyectos"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        project = self.get_object()
        if project.company != request.user.empresa:
            return Response(
                {"error": "No puedes pausar proyectos de otras empresas"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        from project_status.models import ProjectStatus
        paused_status, created = ProjectStatus.objects.get_or_create(name='paused')
        project.status = paused_status
        project.save()
        
        return Response({"message": "Proyecto pausado correctamente"})

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Marcar proyecto como completado (solo para empresas)"""
        if request.user.role != 'company':
            return Response(
                {"error": "Solo las empresas pueden marcar proyectos como completados"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        project = self.get_object()
        if project.company != request.user.empresa:
            return Response(
                {"error": "No puedes marcar como completado proyectos de otras empresas"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        from project_status.models import ProjectStatus
        completed_status, created = ProjectStatus.objects.get_or_create(name='completed')
        project.status = completed_status
        project.save()
        
        return Response({"message": "Proyecto marcado como completado correctamente"})

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancelar proyecto (solo para empresas)"""
        if request.user.role != 'company':
            return Response(
                {"error": "Solo las empresas pueden cancelar proyectos"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        project = self.get_object()
        if project.company != request.user.empresa:
            return Response(
                {"error": "No puedes cancelar proyectos de otras empresas"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        from project_status.models import ProjectStatus
        cancelled_status, created = ProjectStatus.objects.get_or_create(name='cancelled')
        project.status = cancelled_status
        project.save()
        
        return Response({"message": "Proyecto cancelado correctamente"})

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Estadísticas de proyectos"""
        if request.user.role == 'admin':
            # Estadísticas generales
            stats = {
                'total_projects': Proyecto.objects.count(),
                'published_projects': Proyecto.objects.filter(status__name='published').count(),
                'in_progress_projects': Proyecto.objects.filter(status__name__in=['active', 'in_progress', 'en curso']).count(),
                'completed_projects': Proyecto.objects.filter(status__name='completed').count(),
                'average_rating': Proyecto.objects.aggregate(Avg('evaluations__score'))['evaluations__score__avg'] or 0,
                'projects_by_area': Proyecto.objects.values('area__name').annotate(count=Count('id')),
                'projects_by_status': Proyecto.objects.values('status__name').annotate(count=Count('id')),
            }
        elif request.user.role == 'company':
            # Estadísticas de la empresa
            company_projects = Proyecto.objects.filter(company=request.user.empresa)
            stats = {
                'total_projects': company_projects.count(),
                'published_projects': company_projects.filter(status__name='published').count(),
                'in_progress_projects': company_projects.filter(status__name__in=['active', 'in_progress', 'en curso']).count(),
                'completed_projects': company_projects.filter(status__name='completed').count(),
                'total_applications': Aplicacion.objects.filter(project__company=request.user.empresa).count(),
                'pending_applications': Aplicacion.objects.filter(
                    project__company=request.user.empresa, 
                    status='pending'
                ).count(),
            }
        else:
            return Response(
                {"error": "No tienes permisos para ver estas estadísticas"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return Response(stats)

class ProjectApplicationViewSet(viewsets.ModelViewSet):
    """ViewSet para gestión de aplicaciones a proyectos"""
    queryset = Aplicacion.objects.all()
    serializer_class = ProjectApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'project', 'student']
    ordering_fields = ['fecha_aplicacion', 'fecha_revision', 'fecha_respuesta']
    ordering = ['-fecha_aplicacion']

    def get_queryset(self):
        """Filtrar queryset según el rol del usuario"""
        user = self.request.user
        
        if user.role == 'admin':
            return Aplicacion.objects.all()
        elif user.role == 'company':
            # Las empresas ven aplicaciones a sus proyectos
            return Aplicacion.objects.filter(project__company=user.empresa)
        elif user.role == 'student':
            # Los estudiantes ven sus propias aplicaciones
            return Aplicacion.objects.filter(student=user.estudiante_profile)
        else:
            return Aplicacion.objects.none()

    def get_serializer_class(self):
        """Retornar serializer específico según la acción"""
        if self.action == 'retrieve':
            return ProjectApplicationDetailSerializer
        elif self.action == 'update' or self.action == 'partial_update':
            return ProjectApplicationUpdateSerializer
        return ProjectApplicationSerializer

    def perform_create(self, serializer):
        """Asignar el estudiante al crear la aplicación"""
        serializer.save(student=self.request.user.estudiante_profile)

    @action(detail=False, methods=['get'])
    def my_applications(self, request):
        """Aplicaciones del estudiante actual"""
        if request.user.role != 'student':
            return Response(
                {"error": "Esta vista es solo para estudiantes"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        queryset = Aplicacion.objects.filter(student=request.user.estudiante_profile)
        serializer = ProjectApplicationSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def received_applications(self, request):
        """Aplicaciones recibidas por la empresa actual"""
        if request.user.role != 'company':
            return Response(
                {"error": "Esta vista es solo para empresas"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        queryset = Aplicacion.objects.filter(project__company=request.user.empresa)
        serializer = ProjectApplicationSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        """Aceptar aplicación (solo para empresas)"""
        if request.user.role != 'company':
            return Response(
                {"error": "Solo las empresas pueden aceptar aplicaciones"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        application = self.get_object()
        if application.project.company != request.user.empresa:
            return Response(
                {"error": "No puedes aceptar aplicaciones de otros proyectos"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        application.status = 'accepted'
        application.responded_at = timezone.now()
        application.save()
        
        # Incrementar contador de estudiantes del proyecto
        project = application.project
        project.current_students += 1
        project.save()
        
        return Response({"message": "Aplicación aceptada correctamente"})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Rechazar aplicación (solo para empresas)"""
        if request.user.role != 'company':
            return Response(
                {"error": "Solo las empresas pueden rechazar aplicaciones"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        application = self.get_object()
        if application.project.company != request.user.empresa:
            return Response(
                {"error": "No puedes rechazar aplicaciones de otros proyectos"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        application.status = 'rejected'
        application.responded_at = timezone.now()
        application.save()
        
        return Response({"message": "Aplicación rechazada correctamente"})

    @action(detail=True, methods=['post'])
    def withdraw(self, request, pk=None):
        """Retirar aplicación (solo para estudiantes)"""
        if request.user.role != 'student':
            return Response(
                {"error": "Solo los estudiantes pueden retirar aplicaciones"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        application = self.get_object()
        if application.student != request.user.estudiante_profile:
            return Response(
                {"error": "No puedes retirar aplicaciones de otros estudiantes"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        application.status = 'withdrawn'
        application.responded_at = timezone.now()
        application.save()
        
        return Response({"message": "Aplicación retirada correctamente"})

    @action(detail=False, methods=['get'])
    def pending_applications(self, request):
        """Obtener aplicaciones pendientes"""
        user = request.user
        
        if user.es_empresa:
            try:
                empresa = user.empresa_profile
                applications = Aplicacion.objects.filter(
                    project__company=empresa,
                    status='pending'
                )
                serializer = self.get_serializer(applications, many=True)
                return Response(serializer.data)
            except:
                return Response([], status=status.HTTP_404_NOT_FOUND)
        
        return Response({'error': 'Acceso denegado'}, status=status.HTTP_403_FORBIDDEN)

class ProjectMemberViewSet(viewsets.ModelViewSet):
    queryset = MiembroProyecto.objects.all()
    serializer_class = ProjectMemberSerializer
    permission_classes = [permissions.IsAuthenticated]
