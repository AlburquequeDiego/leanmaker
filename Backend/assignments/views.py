from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Assignment
from .serializers import AssignmentSerializer, AssignmentCreateSerializer, AssignmentUpdateSerializer

class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'priority', 'project', 'assigned_to']
    search_fields = ['title', 'description']
    ordering_fields = ['due_date', 'created_at', 'priority']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return AssignmentCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return AssignmentUpdateSerializer
        return AssignmentSerializer

    def perform_create(self, serializer):
        serializer.save()

    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            return Assignment.objects.filter(assigned_to=user)
        elif user.role == 'company':
            return Assignment.objects.filter(project__company=user.empresa)
        return Assignment.objects.all() 