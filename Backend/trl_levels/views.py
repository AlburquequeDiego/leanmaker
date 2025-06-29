from django.shortcuts import render
from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import TRLLevel
from .serializers import TRLLevelSerializer, TRLLevelListSerializer

class TRLLevelViewSet(viewsets.ModelViewSet):
    """ViewSet para gestión de niveles TRL"""
    queryset = TRLLevel.objects.filter(is_active=True)
    serializer_class = TRLLevelSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['level', 'is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['level', 'min_hours']
    ordering = ['level']

    def get_serializer_class(self):
        if self.action == 'list':
            return TRLLevelListSerializer
        return TRLLevelSerializer

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Obtener solo niveles TRL activos"""
        queryset = TRLLevel.objects.filter(is_active=True)
        serializer = TRLLevelListSerializer(queryset, many=True)
        return Response(serializer.data)
