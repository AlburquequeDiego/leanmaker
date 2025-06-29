from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProjectStatusViewSet, ProjectStatusHistoryViewSet

router = DefaultRouter()
router.register(r'status', ProjectStatusViewSet, basename='project-status')
router.register(r'history', ProjectStatusHistoryViewSet, basename='project-status-history')

urlpatterns = [
    path('', include(router.urls)),
] 