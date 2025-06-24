from django.shortcuts import render
from rest_framework import generics, permissions, viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Avg, Q
from django.utils import timezone
from datetime import timedelta
from .models import Student
from .serializers import StudentSerializer, StudentUpdateSerializer
from users.models import User
from applications.models import Application
from evaluations.models import Evaluation
from strikes.models import Strike

# Create your views here.

class IsStudentUser(permissions.BasePermission):
    """
    Permiso para solo permitir a usuarios con el rol de Estudiante.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == STUDENT

class StudentProfileView(generics.RetrieveUpdateAPIView):
    """
    Vista para que un estudiante vea y actualice su propio perfil.
    """
    queryset = Student.objects.all()
    permission_classes = [IsStudentUser]

    def get_object(self):
        return self.request.user.student_profile

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return StudentUpdateSerializer
        return StudentSerializer

class StudentListView(generics.ListAPIView):
    """
    Vista para listar todos los estudiantes (perfil público).
    Visible para empresas y administradores.
    """
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    
    def get_permissions(self):
        # Solo usuarios de Empresa o Administradores pueden ver la lista
        if self.request.user.is_authenticated and (
            self.request.user.role == COMPANY or self.request.user.is_staff
        ):
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()] # Denegar a otros

class StudentDetailView(generics.RetrieveAPIView):
    """
    Vista para ver el perfil público de un estudiante específico.
    Visible para empresas y administradores.
    """
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    lookup_field = 'user_id'

    def get_permissions(self):
        if self.request.user.is_authenticated and (
            self.request.user.role == COMPANY or self.request.user.is_staff
        ):
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'STUDENT':
            return Student.objects.filter(user=user)
        return Student.objects.all()

    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """
        Estadísticas para el dashboard del estudiante actual.
        """
        if request.user.role != 'STUDENT':
            return Response(
                {'error': 'Acceso denegado'}, 
                status=status.HTTP_403_FORBIDDEN
            )

        student = request.user.student_profile
        now = timezone.now()
        last_30_days = now - timedelta(days=30)

        # Postulaciones del estudiante
        student_applications = Application.objects.filter(student=student)
        
        stats = {
            'total_applications': student_applications.count(),
            'pending_applications': student_applications.filter(status='PENDING').count(),
            'accepted_applications': student_applications.filter(status='ACCEPTED').count(),
            'rejected_applications': student_applications.filter(status='REJECTED').count(),
            
            # Proyectos activos (donde fue aceptado)
            'active_projects': Application.objects.filter(
                student=student,
                status='ACCEPTED',
                project__status='ACTIVE'
            ).count(),
            
            # Proyectos completados
            'completed_projects': Application.objects.filter(
                student=student,
                status='ACCEPTED',
                project__status='COMPLETED'
            ).count(),
            
            # Actividad reciente
            'new_applications_30_days': student_applications.filter(
                created_at__gte=last_30_days
            ).count(),
            
            # Evaluaciones
            'total_evaluations_received': Evaluation.objects.filter(
                evaluated_student=student
            ).count(),
            'total_evaluations_given': Evaluation.objects.filter(
                evaluator_type='STUDENT',
                evaluator_id=request.user.id
            ).count(),
            
            # Amonestaciones
            'total_strikes': Strike.objects.filter(student=student).count(),
        }

        return Response(stats)

    @action(detail=False, methods=['get'])
    def application_history(self, request):
        """
        Historial de postulaciones para gráficos.
        """
        if request.user.role != 'STUDENT':
            return Response(
                {'error': 'Acceso denegado'}, 
                status=status.HTTP_403_FORBIDDEN
            )

        student = request.user.student_profile
        
        # Postulaciones del estudiante
        student_applications = Application.objects.filter(student=student)
        
        # Postulaciones por estado
        application_stats = student_applications.aggregate(
            pending=Count('id', filter=Q(status='PENDING')),
            accepted=Count('id', filter=Q(status='ACCEPTED')),
            rejected=Count('id', filter=Q(status='REJECTED')),
        )
        
        # Tasa de aceptación
        total_apps = student_applications.count()
        acceptance_rate = 0
        if total_apps > 0:
            accepted_apps = student_applications.filter(status='ACCEPTED').count()
            acceptance_rate = (accepted_apps / total_apps) * 100

        return Response({
            'application_status': application_stats,
            'acceptance_rate': round(acceptance_rate, 2),
            'total_applications': total_apps
        })
