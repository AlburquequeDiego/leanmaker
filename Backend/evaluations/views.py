from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import Evaluation, Project
from .serializers import EvaluationSerializer
from users.models import CustomUser

# Create your views here.

class IsProjectParticipant(permissions.BasePermission):
    """
    Permiso para verificar si el usuario es un participante del proyecto
    (ya sea como empresa dueña o como estudiante aceptado).
    """
    def has_permission(self, request, view):
        project_id = view.kwargs.get('project_pk')
        try:
            project = Project.objects.get(pk=project_id)
            user = request.user
            
            if user.role == CustomUser.Role.COMPANY:
                return project.company.user == user
            
            if user.role == CustomUser.Role.STUDENT:
                # Asumimos que un estudiante aceptado está en el proyecto
                # Esta lógica se puede refinar cuando tengamos el estado de "asignado"
                return project.applications.filter(student=user.student_profile, status='ACCEPTED').exists()
            
            return False
        except Project.DoesNotExist:
            return False

class EvaluationViewSet(viewsets.ModelViewSet):
    """
    ViewSet para Evaluaciones dentro de un Proyecto.
    - URL anidada: /api/projects/{project_pk}/evaluations/
    """
    queryset = Evaluation.objects.all()
    serializer_class = EvaluationSerializer
    permission_classes = [permissions.IsAuthenticated, IsProjectParticipant]

    def get_queryset(self):
        """
        Filtra las evaluaciones para que solo muestren las del proyecto especificado en la URL.
        """
        return self.queryset.filter(project_id=self.kwargs['project_pk'])

    def perform_create(self, serializer):
        """
        Asigna automáticamente el proyecto y el evaluador al crear una evaluación.
        """
        project = Project.objects.get(pk=self.kwargs['project_pk'])
        user = self.request.user
        serializer.save(
            project=project,
            evaluator_type=user.role,
            evaluator_id=user.id
        )
