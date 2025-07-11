from django.shortcuts import render
from rest_framework import viewsets, permissions, filters


from django_filters.rest_framework import DjangoFilterBackend
from .models import ProjectStatus, ProjectStatusHistory
from .serializers import ProjectStatusSerializer, ProjectStatusHistorySerializer

class ProjectStatusViewSet(viewsets.ModelViewSet):
    """ViewSet para gestión de estados de proyecto"""
    queryset = ProjectStatus.objects.filter(is_active=True)
    serializer_class = ProjectStatusSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    def get_serializer_class(self):
        return ProjectStatusSerializer

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Obtener solo estados activos"""
        queryset = ProjectStatus.objects.filter(is_active=True)
        serializer = ProjectStatusSerializer(queryset, many=True)
        return Response(serializer.data)

class ProjectStatusHistoryViewSet(viewsets.ModelViewSet):
    queryset = ProjectStatusHistory.objects.all()
    serializer_class = ProjectStatusHistorySerializer
    permission_classes = [permissions.IsAuthenticated]
