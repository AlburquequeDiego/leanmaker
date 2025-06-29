from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MassNotificationViewSet

router = DefaultRouter()
router.register(r'mass-notifications', MassNotificationViewSet, basename='mass-notification')

urlpatterns = [
    path('', include(router.urls)),
] 