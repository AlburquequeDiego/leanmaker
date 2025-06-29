from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Area
from .serializers import AreaSerializer, AreaCreateSerializer, AreaUpdateSerializer

class AreaViewSet(viewsets.ModelViewSet):
    queryset = Area.objects.filter(is_active=True)
    serializer_class = AreaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    def get_serializer_class(self):
        if self.action == 'create':
            return AreaCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return AreaUpdateSerializer
        return AreaSerializer

    def perform_create(self, serializer):
        serializer.save()

    def get_queryset(self):
        return Area.objects.filter(is_active=True) 