from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EvaluationViewSet, EvaluationCategoryViewSet, EvaluationTemplateViewSet

router = DefaultRouter()
router.register(r'evaluations', EvaluationViewSet, basename='evaluation')
router.register(r'categories', EvaluationCategoryViewSet, basename='evaluation-category')
router.register(r'templates', EvaluationTemplateViewSet, basename='evaluation-template')

urlpatterns = [
    path('', include(router.urls)),
] 