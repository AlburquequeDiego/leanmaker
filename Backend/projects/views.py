from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import Project
from .serializers import ProjectSerializer, ProjectCreateUpdateSerializer
from users.models import CustomUser
from companies.views import IsCompanyUser

# Create your views here.

class ProjectViewSet(viewsets.ModelViewSet):
    """
    ViewSet para Proyectos.
    - Las empresas pueden crear, ver, actualizar y eliminar sus propios proyectos.
    - Los estudiantes y otros usuarios autenticados pueden ver los proyectos publicados.
    """
    queryset = Project.objects.all()

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ProjectCreateUpdateSerializer
        return ProjectSerializer

    def get_permissions(self):
        """
        Permisos:
        - Crear: Solo empresas.
        - Actualizar/Eliminar: Solo la empresa dueña del proyecto.
        - Listar/Ver: Cualquier usuario autenticado.
        """
        if self.action == 'create':
            self.permission_classes = [IsCompanyUser]
        elif self.action in ['update', 'partial_update', 'destroy']:
            self.permission_classes = [IsCompanyUser, IsOwner]
        else: # list, retrieve
            self.permission_classes = [permissions.IsAuthenticated]
        return super().get_permissions()

    def get_queryset(self):
        """
        Filtra los proyectos:
        - Si el usuario es una empresa, ve todos sus proyectos (incluyendo borradores).
        - Si es otro tipo de usuario, solo ve los proyectos publicados.
        """
        user = self.request.user
        if user.is_authenticated and user.role == CustomUser.Role.COMPANY:
            return Project.objects.filter(company=user.company_profile)
        
        return Project.objects.filter(status=Project.Status.PUBLISHED)

    def perform_create(self, serializer):
        """
        Asigna la empresa del usuario actual al crear un proyecto.
        """
        serializer.save(company=self.request.user.company_profile)


class IsOwner(permissions.BasePermission):
    """
    Permiso para solo permitir al dueño de un objeto editarlo.
    """
    def has_object_permission(self, request, view, obj):
        return obj.company.user == request.user
