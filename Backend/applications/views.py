from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Application
from .serializers import ApplicationSerializer, ApplicationCreateSerializer
from users.models import CustomUser
from students.views import IsStudentUser
from companies.views import IsCompanyUser

# Create your views here.

class ApplicationViewSet(viewsets.ModelViewSet):
    """
    ViewSet para Postulaciones.
    - Estudiantes: Pueden crear postulaciones y ver las suyas.
    - Empresas: Pueden ver las postulaciones a sus proyectos.
    """
    queryset = Application.objects.all()

    def get_serializer_class(self):
        if self.action == 'create':
            return ApplicationCreateSerializer
        return ApplicationSerializer

    def get_permissions(self):
        if self.action == 'create':
            # Solo los estudiantes pueden crear postulaciones
            self.permission_classes = [IsStudentUser]
        elif self.action in ['update', 'partial_update', 'destroy']:
            # Solo el estudiante que la creó puede modificarla/retirarla
            self.permission_classes = [IsStudentUser, IsApplicationOwner]
        else: # list, retrieve
            self.permission_classes = [permissions.IsAuthenticated]
        return super().get_permissions()

    def get_queryset(self):
        """
        Filtra las postulaciones:
        - Estudiantes ven solo las suyas.
        - Empresas ven solo las de sus proyectos.
        """
        user = self.request.user
        if user.role == CustomUser.Role.STUDENT:
            return Application.objects.filter(student=user.student_profile)
        if user.role == CustomUser.Role.COMPANY:
            return Application.objects.filter(project__company=user.company_profile)
        # Admins ven todo
        return Application.objects.all()

    def perform_create(self, serializer):
        """
        Asigna el estudiante actual al crear la postulación.
        """
        try:
            serializer.save(student=self.request.user.student_profile)
        except Exception as e:
            # Captura el error de postulación duplicada
            raise serializers.ValidationError({'detail': 'Ya has postulado a este proyecto.'})

class IsApplicationOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.student.user == request.user
