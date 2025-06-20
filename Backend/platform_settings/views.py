from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import PlatformSetting
from .serializers import PlatformSettingSerializer

# Create your views here.

class IsAdminUser(permissions.BasePermission):
    """
    Permiso personalizado para verificar que el usuario sea administrador.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_staff

class PlatformSettingViewSet(viewsets.ModelViewSet):
    """
    ViewSet para Configuraciones de Plataforma.
    - Solo los administradores pueden crear, editar y eliminar configuraciones.
    - Los usuarios autenticados pueden ver las configuraciones públicas.
    """
    queryset = PlatformSetting.objects.all()
    serializer_class = PlatformSettingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsAdminUser]
        else:
            self.permission_classes = [permissions.IsAuthenticated]
        return super().get_permissions()
