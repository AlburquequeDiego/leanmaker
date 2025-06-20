from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import Strike
from .serializers import StrikeSerializer, StrikeCreateSerializer
from users.models import CustomUser
from companies.views import IsCompanyUser
from students.views import IsStudentUser
from evaluations.views import IsProjectParticipant

# Create your views here.

class StrikeViewSet(viewsets.ModelViewSet):
    """
    ViewSet para Amonestaciones (Strikes).
    - Empresas: Pueden crear strikes para estudiantes en sus proyectos.
    - Estudiantes: Pueden ver los strikes que han recibido.
    - Admins: Pueden ver y gestionar todos los strikes.
    """
    queryset = Strike.objects.all()

    def get_serializer_class(self):
        if self.action == 'create':
            return StrikeCreateSerializer
        return StrikeSerializer

    def get_permissions(self):
        if self.action == 'create':
            self.permission_classes = [IsCompanyUser]
        elif self.action in ['update', 'partial_update', 'destroy']:
            # Solo la empresa que lo creó puede modificarlo
            self.permission_classes = [IsCompanyUser, IsStrikeIssuer]
        else: # list, retrieve
            self.permission_classes = [permissions.IsAuthenticated]
        return super().get_permissions()

    def get_queryset(self):
        """
        Filtra los strikes:
        - Estudiantes ven solo los suyos.
        - Empresas ven solo los que emitieron.
        - Admins ven todos.
        """
        user = self.request.user
        if user.role == CustomUser.Role.STUDENT:
            return Strike.objects.filter(student=user.student_profile)
        if user.role == CustomUser.Role.COMPANY:
            return Strike.objects.filter(company=user.company_profile)
        return Strike.objects.all()

    def perform_create(self, serializer):
        """
        Asigna la empresa actual al crear un strike.
        También valida que la empresa solo pueda amonestar en sus propios proyectos.
        """
        project = serializer.validated_data.get('project')
        if project.company != self.request.user.company_profile:
            raise permissions.PermissionDenied("No puede emitir amonestaciones en proyectos de otras empresas.")
        
        serializer.save(company=self.request.user.company_profile)

class IsStrikeIssuer(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.company.user == request.user
