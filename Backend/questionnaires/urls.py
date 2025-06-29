from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QuestionnaireViewSet, QuestionViewSet, ChoiceViewSet, AnswerViewSet

router = DefaultRouter()
router.register(r'questionnaires', QuestionnaireViewSet, basename='questionnaire')
router.register(r'questions', QuestionViewSet, basename='question')
router.register(r'choices', ChoiceViewSet, basename='choice')
router.register(r'answers', AnswerViewSet, basename='answer')

urlpatterns = [
    path('', include(router.urls)),
]

