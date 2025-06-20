from django.shortcuts import render
from rest_framework import viewsets, mixins, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer

# Create your views here.

class NotificationViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet
):
    """
    ViewSet para Notificaciones.
    - Permite listar las notificaciones del usuario.
    - Permite ver una notificación específica.
    - Permite marcar una notificación como leída (PATCH).
    - No permite crear ni eliminar notificaciones vía API (se crean internamente).
    """
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Filtra para que un usuario solo vea sus propias notificaciones.
        """
        return self.queryset.filter(recipient=self.request.user)
    
    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        """
        Acción personalizada para marcar todas las notificaciones del usuario como leídas.
        """
        self.get_queryset().update(is_read=True)
        return Response(status=204)
