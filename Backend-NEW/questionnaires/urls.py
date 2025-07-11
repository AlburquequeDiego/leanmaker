, include

from .views import QuestionnaireViewSet, QuestionViewSet, ChoiceViewSet, AnswerViewSet


(r'questionnaires', QuestionnaireViewSet, basename='questionnaire')
(r'questions', QuestionViewSet, basename='question')
(r'choices', ChoiceViewSet, basename='choice')
(r'answers', AnswerViewSet, basename='answer')

urlpatterns = [
    
]

