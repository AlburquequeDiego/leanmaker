from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InterviewViewSet

router = DefaultRouter()
router.register(r'interviews', InterviewViewSet, basename='interview')

urlpatterns = [
    path('', include(router.urls)),
] 