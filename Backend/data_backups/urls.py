from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DataBackupViewSet

router = DefaultRouter()
router.register(r'backups', DataBackupViewSet, basename='data-backup')

urlpatterns = [
    path('', include(router.urls)),
] 