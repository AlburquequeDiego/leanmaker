from django.shortcuts import render
from rest_framework import generics, permissions, viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .serializers import UserRegistrationSerializer, UserSerializer
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta
from .models import CustomUser
from companies.models import Company
from students.models import Student
from projects.models import Project
from applications.models import Application

User = get_user_model()

class UserRegistrationView(generics.CreateAPIView):
    """
    Vista para el registro de nuevos usuarios (Estudiantes y Empresas).
    """
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny] # Cualquiera puede registrarse

class CurrentUserView(generics.RetrieveUpdateAPIView):
    """
    Vista para obtener y actualizar los datos del usuario actualmente autenticado.
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        # Devuelve el usuario asociado a la petición actual
        return self.request.user

class CustomUserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        return UserSerializer

    @action(detail=False, methods=['get'])
    def admin_dashboard_stats(self, request):
        """
        Estadísticas para el dashboard de administradores.
        """
        if not request.user.is_staff:
            return Response(
                {'error': 'Acceso denegado'}, 
                status=status.HTTP_403_FORBIDDEN
            )

        # Fechas para filtros
        now = timezone.now()
        last_30_days = now - timedelta(days=30)
        last_7_days = now - timedelta(days=7)

        # Estadísticas generales
        stats = {
            'total_users': CustomUser.objects.count(),
            'total_companies': Company.objects.count(),
            'total_students': Student.objects.count(),
            'total_projects': Project.objects.count(),
            'total_applications': Application.objects.count(),
            
            # Nuevos registros en los últimos 30 días
            'new_users_30_days': CustomUser.objects.filter(
                date_joined__gte=last_30_days
            ).count(),
            'new_companies_30_days': Company.objects.filter(
                created_at__gte=last_30_days
            ).count(),
            'new_students_30_days': Student.objects.filter(
                created_at__gte=last_30_days
            ).count(),
            'new_projects_30_days': Project.objects.filter(
                created_at__gte=last_30_days
            ).count(),
            
            # Actividad reciente (últimos 7 días)
            'new_applications_7_days': Application.objects.filter(
                created_at__gte=last_7_days
            ).count(),
            
            # Estados de proyectos
            'active_projects': Project.objects.filter(status='ACTIVE').count(),
            'completed_projects': Project.objects.filter(status='COMPLETED').count(),
            'pending_projects': Project.objects.filter(status='PENDING').count(),
            
            # Estados de postulaciones
            'pending_applications': Application.objects.filter(status='PENDING').count(),
            'accepted_applications': Application.objects.filter(status='ACCEPTED').count(),
            'rejected_applications': Application.objects.filter(status='REJECTED').count(),
        }

        return Response(stats)

    @action(detail=False, methods=['get'])
    def user_activity_chart(self, request):
        """
        Datos para gráfico de actividad de usuarios (últimos 30 días).
        """
        if not request.user.is_staff:
            return Response(
                {'error': 'Acceso denegado'}, 
                status=status.HTTP_403_FORBIDDEN
            )

        # Generar datos para los últimos 30 días
        dates = []
        user_counts = []
        
        for i in range(30):
            date = timezone.now() - timedelta(days=i)
            count = CustomUser.objects.filter(
                date_joined__date=date.date()
            ).count()
            dates.append(date.strftime('%Y-%m-%d'))
            user_counts.append(count)

        return Response({
            'dates': list(reversed(dates)),
            'user_counts': list(reversed(user_counts))
        })
