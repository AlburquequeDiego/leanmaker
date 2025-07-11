, include

from .views import EvaluationCategoryViewSet


(r'categories', EvaluationCategoryViewSet, basename='evaluation-category')

urlpatterns = [
    
] 