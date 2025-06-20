from django.shortcuts import render
from rest_framework import generics, permissions, viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Avg, Q
from django.utils import timezone
from datetime import timedelta
from .models import Company
from .serializers import CompanySerializer, CompanyUpdateSerializer
from users.models import CustomUser
from projects.models import Project
from applications.models import Application
from evaluations.models import Evaluation

# Create your views here.

class IsCompanyUser(permissions.BasePermission):
    """
    Permiso para solo permitir a usuarios con el rol de Empresa.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == CustomUser.Role.COMPANY

class CompanyProfileView(generics.RetrieveUpdateAPIView):
    """
    Vista para que una empresa vea y actualice su propio perfil.
    """
    queryset = Company.objects.all()
    permission_classes = [IsCompanyUser]

    def get_object(self):
        # Devuelve el perfil de la empresa asociada al usuario actual
        return self.request.user.company_profile

    def get_serializer_class(self):
        if self.request.method == 'PUT' or self.request.method == 'PATCH':
            return CompanyUpdateSerializer
        return CompanySerializer

class CompanyListView(generics.ListAPIView):
    """
    Vista para listar todas las empresas (perfil público).
    """
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [permissions.IsAuthenticated] # Solo usuarios autenticados pueden ver la lista

class CompanyDetailView(generics.RetrieveAPIView):
    """
    Vista para ver el perfil público de una empresa específica.
    """
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'user_id' # Buscar por el ID del usuario

class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'COMPANY':
            return Company.objects.filter(user=user)
        return Company.objects.all()

    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """
        Estadísticas para el dashboard de la empresa actual.
        """
        if request.user.role != 'COMPANY':
            return Response(
                {'error': 'Acceso denegado'}, 
                status=status.HTTP_403_FORBIDDEN
            )

        company = request.user.company_profile
        now = timezone.now()
        last_30_days = now - timedelta(days=30)

        # Proyectos de la empresa
        company_projects = Project.objects.filter(company=company)
        
        stats = {
            'total_projects': company_projects.count(),
            'active_projects': company_projects.filter(status='ACTIVE').count(),
            'completed_projects': company_projects.filter(status='COMPLETED').count(),
            'pending_projects': company_projects.filter(status='PENDING').count(),
            
            # Postulaciones
            'total_applications': Application.objects.filter(project__company=company).count(),
            'pending_applications': Application.objects.filter(
                project__company=company, 
                status='PENDING'
            ).count(),
            'accepted_applications': Application.objects.filter(
                project__company=company, 
                status='ACCEPTED'
            ).count(),
            
            # Actividad reciente
            'new_applications_30_days': Application.objects.filter(
                project__company=company,
                created_at__gte=last_30_days
            ).count(),
            'new_projects_30_days': company_projects.filter(
                created_at__gte=last_30_days
            ).count(),
            
            # Evaluaciones
            'total_evaluations_received': Evaluation.objects.filter(
                project__company=company,
                evaluated_company=company
            ).count(),
            'total_evaluations_given': Evaluation.objects.filter(
                project__company=company,
                evaluator_type='COMPANY',
                evaluator_id=request.user.id
            ).count(),
        }

        return Response(stats)

    @action(detail=False, methods=['get'])
    def project_performance(self, request):
        """
        Métricas de rendimiento de proyectos para gráficos.
        """
        if request.user.role != 'COMPANY':
            return Response(
                {'error': 'Acceso denegado'}, 
                status=status.HTTP_403_FORBIDDEN
            )

        company = request.user.company_profile
        
        # Proyectos por estado
        project_stats = Project.objects.filter(company=company).aggregate(
            active=Count('id', filter=Q(status='ACTIVE')),
            completed=Count('id', filter=Q(status='COMPLETED')),
            pending=Count('id', filter=Q(status='PENDING')),
        )
        
        # Promedio de postulaciones por proyecto
        avg_applications = Application.objects.filter(
            project__company=company
        ).values('project').annotate(
            app_count=Count('id')
        ).aggregate(avg=Avg('app_count'))['avg'] or 0

        return Response({
            'project_status': project_stats,
            'avg_applications_per_project': round(avg_applications, 2)
        })
