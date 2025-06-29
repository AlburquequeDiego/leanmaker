from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TRLLevelViewSet

router = DefaultRouter()
router.register(r'trl-levels', TRLLevelViewSet, basename='trl-level')

urlpatterns = [
    path('', include(router.urls)),
] 