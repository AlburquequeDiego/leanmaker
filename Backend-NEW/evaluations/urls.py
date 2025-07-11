, include

from .views import EvaluationViewSet, EvaluationCategoryViewSet, EvaluationTemplateViewSet


(r'evaluations', EvaluationViewSet, basename='evaluation')
(r'categories', EvaluationCategoryViewSet, basename='evaluation-category')
(r'templates', EvaluationTemplateViewSet, basename='evaluation-template')

urlpatterns = [
    
] 