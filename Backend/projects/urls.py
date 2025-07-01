from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, ProjectApplicationViewSet  # , ProjectMemberViewSet

router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'applications', ProjectApplicationViewSet, basename='project-application')
# router.register(r'members', ProjectMemberViewSet, basename='project-member')

urlpatterns = [
    path('', include(router.urls)),
] 
