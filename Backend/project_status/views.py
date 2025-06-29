from django.shortcuts import render
from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import ProjectStatus
from .serializers import ProjectStatusSerializer, ProjectStatusListSerializer

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
        if self.action == 'list':
            return ProjectStatusListSerializer
        return ProjectStatusSerializer

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Obtener solo estados activos"""
        queryset = ProjectStatus.objects.filter(is_active=True)
        serializer = ProjectStatusListSerializer(queryset, many=True)
        return Response(serializer.data)
