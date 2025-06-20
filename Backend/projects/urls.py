from django.urls import path, include
from rest_framework_nested import routers
from .views import ProjectViewSet
from evaluations.views import EvaluationViewSet

# El router principal para los proyectos
router = routers.DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')

# Router anidado para las evaluaciones dentro de cada proyecto
projects_router = routers.NestedDefaultRouter(router, r'projects', lookup='project')
projects_router.register(r'evaluations', EvaluationViewSet, basename='project-evaluations')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(projects_router.urls)),
] 