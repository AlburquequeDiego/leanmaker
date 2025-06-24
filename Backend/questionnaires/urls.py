from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QuestionnaireViewSet

router = DefaultRouter()
router.register(r'questionnaires', QuestionnaireViewSet, basename='questionnaire')

urlpatterns = [
    path('', include(router.urls)),
]

