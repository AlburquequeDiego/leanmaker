from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StrikeViewSet

router = DefaultRouter()
router.register(r'', StrikeViewSet, basename='strike')

urlpatterns = [
    path('', include(router.urls)),
] 