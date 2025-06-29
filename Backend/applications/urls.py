from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ApplicationViewSet, AssignmentViewSet

router = DefaultRouter()
router.register(r'applications', ApplicationViewSet, basename='application')
router.register(r'assignments', AssignmentViewSet, basename='assignment')

urlpatterns = [
    path('', include(router.urls)),
] 
