from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EmpresaViewSet, CalificacionEmpresaViewSet

router = DefaultRouter()
router.register(r'companies', EmpresaViewSet, basename='company')
router.register(r'ratings', CalificacionEmpresaViewSet, basename='company-rating')

urlpatterns = [
    path('', include(router.urls)),
] 
