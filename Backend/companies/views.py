from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Empresa, CalificacionEmpresa
from .serializers import (
    EmpresaSerializer, EmpresaCreateSerializer, EmpresaUpdateSerializer,
    CalificacionEmpresaSerializer, CalificacionEmpresaCreateSerializer
)

class EmpresaViewSet(viewsets.ModelViewSet):
    queryset = Empresa.objects.filter(status='active')
    serializer_class = EmpresaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'verified', 'size', 'industry']
    search_fields = ['company_name', 'description', 'industry']
    ordering_fields = ['company_name', 'rating', 'total_projects', 'created_at']
    ordering = ['company_name']

    def get_serializer_class(self):
        if self.action == 'create':
            return EmpresaCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return EmpresaUpdateSerializer
        return EmpresaSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_queryset(self):
        return Empresa.objects.filter(status='active')

    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        empresa = self.get_object()
        empresa.verified = True
        empresa.save()
        return Response({'message': 'Empresa verificada'}, status=status.HTTP_200_OK)

class CalificacionEmpresaViewSet(viewsets.ModelViewSet):
    queryset = CalificacionEmpresa.objects.all()
    serializer_class = CalificacionEmpresaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['empresa', 'estudiante']
    ordering_fields = ['fecha_calificacion', 'puntuacion']
    ordering = ['-fecha_calificacion']

    def get_serializer_class(self):
        if self.action == 'create':
            return CalificacionEmpresaCreateSerializer
        return CalificacionEmpresaSerializer

    def perform_create(self, serializer):
        serializer.save(estudiante=self.request.user)

    def get_queryset(self):
        user = self.request.user
        if user.role == 'company':
            return CalificacionEmpresa.objects.filter(empresa=user.empresa)
        return CalificacionEmpresa.objects.filter(estudiante=user) 