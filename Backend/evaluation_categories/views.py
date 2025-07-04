from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import EvaluationCategory
from .serializers import EvaluationCategorySerializer

class EvaluationCategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet para categorías de evaluación
    """
    queryset = EvaluationCategory.objects.all()
    serializer_class = EvaluationCategorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filtra solo categorías activas"""
        return EvaluationCategory.objects.filter(is_active=True) 