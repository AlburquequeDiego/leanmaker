from django.shortcuts import render
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Avg
from django.utils import timezone
from .models import Proyecto, AplicacionProyecto, MiembroProyecto
from .serializers import (
    ProjectSerializer, ProjectDetailSerializer, ProjectCreateSerializer,
    ProjectUpdateSerializer, ProjectApplicationSerializer, ProjectApplicationDetailSerializer,
    ProjectApplicationUpdateSerializer, ProjectMemberSerializer, ProjectStatsSerializer,
    ProjectSearchSerializer
)
from users.models import Usuario
from companies.views import IsCompanyUser

# Create your views here.

class ProjectViewSet(viewsets.ModelViewSet):
    """ViewSet para gestión de proyectos"""
    queryset = Proyecto.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'area', 'modality', 'difficulty', 'is_paid', 'is_featured', 'is_urgent']
    search_fields = ['title', 'description', 'required_skills', 'preferred_skills']
    ordering_fields = ['created_at', 'start_date', 'end_date', 'payment_amount']
    ordering = ['-created_at']

    def get_queryset(self):
        """Filtrar queryset según el rol del usuario"""
        user = self.request.user
        
        if user.role == 'admin':
            return Proyecto.objects.all()
        elif user.role == 'company':
            # Las empresas ven sus propios proyectos
            return Proyecto.objects.filter(company=user)
        else:
            # Los estudiantes ven proyectos publicados
            return Proyecto.objects.filter(status='published')

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
        serializer.save(company=self.request.user)

    @action(detail=False, methods=['get'])
    def available(self, request):
        """Proyectos disponibles para estudiantes"""
        if request.user.role != 'student':
            return Response(
                {"error": "Esta vista es solo para estudiantes"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        queryset = Proyecto.objects.filter(
            status='published',
            current_students__lt=models.F('max_students')
        ).exclude(
            applications__student=request.user
        )
        
        serializer = ProjectSearchSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def my_projects(self, request):
        """Proyectos del usuario actual"""
        if request.user.role == 'student':
            # Proyectos donde el estudiante es miembro
            queryset = Proyecto.objects.filter(members__user=request.user)
        elif request.user.role == 'company':
            # Proyectos de la empresa
            queryset = Proyecto.objects.filter(company=request.user)
        else:
            return Response(
                {"error": "Esta vista no está disponible para administradores"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = ProjectSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        """Publicar proyecto (solo para empresas)"""
        if request.user.role != 'company':
            return Response(
                {"error": "Solo las empresas pueden publicar proyectos"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        project = self.get_object()
        if project.company != request.user:
            return Response(
                {"error": "No puedes publicar proyectos de otras empresas"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        project.status = 'published'
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
        if project.company != request.user:
            return Response(
                {"error": "No puedes pausar proyectos de otras empresas"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        project.status = 'paused'
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
        if project.company != request.user:
            return Response(
                {"error": "No puedes marcar como completado proyectos de otras empresas"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        project.status = 'completed'
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
        if project.company != request.user:
            return Response(
                {"error": "No puedes cancelar proyectos de otras empresas"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        project.status = 'cancelled'
        project.save()
        
        return Response({"message": "Proyecto cancelado correctamente"})

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Estadísticas de proyectos"""
        if request.user.role == 'admin':
            # Estadísticas generales
            stats = {
                'total_projects': Proyecto.objects.count(),
                'published_projects': Proyecto.objects.filter(status='published').count(),
                'in_progress_projects': Proyecto.objects.filter(status='in_progress').count(),
                'completed_projects': Proyecto.objects.filter(status='completed').count(),
                'average_rating': Proyecto.objects.aggregate(Avg('evaluations__rating'))['evaluations__rating__avg'] or 0,
                'projects_by_area': Proyecto.objects.values('area').annotate(count=Count('id')),
                'projects_by_status': Proyecto.objects.values('status').annotate(count=Count('id')),
            }
        elif request.user.role == 'company':
            # Estadísticas de la empresa
            company_projects = Proyecto.objects.filter(company=request.user)
            stats = {
                'total_projects': company_projects.count(),
                'published_projects': company_projects.filter(status='published').count(),
                'in_progress_projects': company_projects.filter(status='in_progress').count(),
                'completed_projects': company_projects.filter(status='completed').count(),
                'total_applications': sum(p.applications.count() for p in company_projects.all()),
                'average_rating': company_projects.aggregate(Avg('evaluations__rating'))['evaluations__rating__avg'] or 0,
            }
        else:
            # Estadísticas del estudiante
            student_projects = Proyecto.objects.filter(members__user=request.user)
            stats = {
                'total_projects': student_projects.count(),
                'completed_projects': student_projects.filter(status='completed').count(),
                'in_progress_projects': student_projects.filter(status='in_progress').count(),
                'total_hours': sum(p.members.get(user=request.user).hours_worked for p in student_projects.all()),
            }
        
        return Response(stats)

class ProjectApplicationViewSet(viewsets.ModelViewSet):
    """ViewSet para gestión de aplicaciones a proyectos"""
    queryset = AplicacionProyecto.objects.all()
    serializer_class = ProjectApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'project', 'student']
    ordering_fields = ['applied_at', 'reviewed_at', 'responded_at']
    ordering = ['-applied_at']

    def get_queryset(self):
        """Filtrar queryset según el rol del usuario"""
        user = self.request.user
        
        if user.role == 'admin':
            return AplicacionProyecto.objects.all()
        elif user.role == 'company':
            # Las empresas ven aplicaciones a sus proyectos
            return AplicacionProyecto.objects.filter(project__company=user)
        else:
            # Los estudiantes ven sus propias aplicaciones
            return AplicacionProyecto.objects.filter(student=user)

    def get_serializer_class(self):
        """Retornar serializer específico según la acción"""
        if self.action == 'create':
            return ProjectApplicationSerializer
        elif self.action == 'update' or self.action == 'partial_update':
            return ProjectApplicationUpdateSerializer
        elif self.action == 'retrieve':
            return ProjectApplicationDetailSerializer
        return ProjectApplicationSerializer

    def perform_create(self, serializer):
        """Asignar el estudiante al crear la aplicación"""
        serializer.save(student=self.request.user)

    @action(detail=False, methods=['get'])
    def my_applications(self, request):
        """Aplicaciones del estudiante actual"""
        if request.user.role != 'student':
            return Response(
                {"error": "Esta vista es solo para estudiantes"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        queryset = AplicacionProyecto.objects.filter(student=request.user)
        serializer = ProjectApplicationSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def received_applications(self, request):
        """Aplicaciones recibidas por la empresa"""
        if request.user.role != 'company':
            return Response(
                {"error": "Esta vista es solo para empresas"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        queryset = AplicacionProyecto.objects.filter(project__company=request.user)
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
        if application.project.company != request.user:
            return Response(
                {"error": "No puedes aceptar aplicaciones de otros proyectos"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        application.status = 'accepted'
        application.responded_at = timezone.now()
        application.save()
        
        # Agregar estudiante como miembro del proyecto
        MiembroProyecto.objects.create(
            project=application.project,
            user=application.student,
            role='student'
        )
        
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
        if application.project.company != request.user:
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
        if application.student != request.user:
            return Response(
                {"error": "No puedes retirar aplicaciones de otros estudiantes"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        application.status = 'withdrawn'
        application.save()
        
        return Response({"message": "Aplicación retirada correctamente"})

class ProjectMemberViewSet(viewsets.ModelViewSet):
    """ViewSet para gestión de miembros de proyectos"""
    queryset = MiembroProyecto.objects.all()
    serializer_class = ProjectMemberSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['project', 'user', 'role']
    ordering_fields = ['joined_at', 'hours_worked', 'tasks_completed']
    ordering = ['-joined_at']

    def get_queryset(self):
        """Filtrar queryset según el rol del usuario"""
        user = self.request.user
        
        if user.role == 'admin':
            return MiembroProyecto.objects.all()
        elif user.role == 'company':
            # Las empresas ven miembros de sus proyectos
            return MiembroProyecto.objects.filter(project__company=user)
        else:
            # Los estudiantes ven sus propias membresías
            return MiembroProyecto.objects.filter(user=user)

    @action(detail=True, methods=['post'])
    def leave(self, request, pk=None):
        """Dejar proyecto (solo para estudiantes)"""
        if request.user.role != 'student':
            return Response(
                {"error": "Solo los estudiantes pueden dejar proyectos"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        member = self.get_object()
        if member.user != request.user:
            return Response(
                {"error": "No puedes dejar proyectos de otros estudiantes"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        member.left_at = timezone.now()
        member.save()
        
        return Response({"message": "Has dejado el proyecto correctamente"})

    @action(detail=True, methods=['post'])
    def remove(self, request, pk=None):
        """Remover miembro (solo para empresas)"""
        if request.user.role != 'company':
            return Response(
                {"error": "Solo las empresas pueden remover miembros"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        member = self.get_object()
        if member.project.company != request.user:
            return Response(
                {"error": "No puedes remover miembros de otros proyectos"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        member.left_at = timezone.now()
        member.save()
        
        return Response({"message": "Miembro removido correctamente"})
