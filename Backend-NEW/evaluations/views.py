from rest_framework import viewsets, permissions
from .models import Evaluation, EvaluationCategory, EvaluationTemplate
from .serializers import EvaluationSerializer, EvaluationCategorySerializer, EvaluationTemplateSerializer

class EvaluationViewSet(viewsets.ModelViewSet):
    queryset = Evaluation.objects.all()
    serializer_class = EvaluationSerializer
    permission_classes = [permissions.IsAuthenticated]

class EvaluationCategoryViewSet(viewsets.ModelViewSet):
    queryset = EvaluationCategory.objects.all()
    serializer_class = EvaluationCategorySerializer
    permission_classes = [permissions.IsAuthenticated]

class EvaluationTemplateViewSet(viewsets.ModelViewSet):
    queryset = EvaluationTemplate.objects.all()
    serializer_class = EvaluationTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]
