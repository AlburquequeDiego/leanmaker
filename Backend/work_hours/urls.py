from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WorkHourViewSet

router = DefaultRouter()
router.register(r'work-hours', WorkHourViewSet, basename='work-hour')

urlpatterns = [
    path('', include(router.urls)),
] 
