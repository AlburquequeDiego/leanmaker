from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Estudiante, PerfilEstudiante
from .serializers import (
    EstudianteSerializer, EstudianteCreateSerializer, EstudianteUpdateSerializer,
    PerfilEstudianteSerializer, PerfilEstudianteCreateSerializer, PerfilEstudianteUpdateSerializer
)

class EstudianteViewSet(viewsets.ModelViewSet):
    queryset = Estudiante.objects.filter(status='approved')
    serializer_class = EstudianteSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'api_level', 'availability', 'career']
    search_fields = ['user__first_name', 'user__last_name', 'user__email', 'career']
    ordering_fields = ['rating', 'completed_projects', 'total_hours', 'created_at']
    ordering = ['-rating']

    def get_serializer_class(self):
        if self.action == 'create':
            return EstudianteCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return EstudianteUpdateSerializer
        return EstudianteSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_queryset(self):
        return Estudiante.objects.filter(status='approved')

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        estudiante = self.get_object()
        estudiante.status = 'approved'
        estudiante.save()
        return Response({'message': 'Estudiante aprobado'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        estudiante = self.get_object()
        estudiante.status = 'rejected'
        estudiante.save()
        return Response({'message': 'Estudiante rechazado'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def add_strike(self, request, pk=None):
        estudiante = self.get_object()
        estudiante.incrementar_strikes()
        return Response({'message': 'Strike agregado'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def reset_strikes(self, request, pk=None):
        estudiante = self.get_object()
        estudiante.resetear_strikes()
        return Response({'message': 'Strikes reseteados'}, status=status.HTTP_200_OK)

class PerfilEstudianteViewSet(viewsets.ModelViewSet):
    queryset = PerfilEstudiante.objects.all()
    serializer_class = PerfilEstudianteSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['estudiante']
    search_fields = ['estudiante__user__first_name', 'estudiante__user__last_name', 'universidad']

    def get_serializer_class(self):
        if self.action == 'create':
            return PerfilEstudianteCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return PerfilEstudianteUpdateSerializer
        return PerfilEstudianteSerializer

    def perform_create(self, serializer):
        serializer.save(estudiante=self.request.user.estudiante)

    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            return PerfilEstudiante.objects.filter(estudiante=user.estudiante)
        return PerfilEstudiante.objects.all() 