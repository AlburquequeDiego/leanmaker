from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EvaluationCategoryViewSet

router = DefaultRouter()
router.register(r'categories', EvaluationCategoryViewSet, basename='evaluation-category')

urlpatterns = [
    path('', include(router.urls)),
] 