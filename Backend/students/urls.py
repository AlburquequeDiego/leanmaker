from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EstudianteViewSet, PerfilEstudianteViewSet

router = DefaultRouter()
router.register(r'students', EstudianteViewSet, basename='student')
router.register(r'student-profiles', PerfilEstudianteViewSet, basename='student-profile')

urlpatterns = [
    path('', include(router.urls)),
] 
