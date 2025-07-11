"""
URLs para la app questionnaires.
"""

from django.urls import path
from . import views

urlpatterns = [
    # Endpoints principales de cuestionarios
    path('', views.questionnaires_list, name='questionnaires_list'),
    path('<str:questionnaire_id>/', views.questionnaires_detail, name='questionnaires_detail'),
    path('create/', views.questionnaires_create, name='questionnaires_create'),
    path('<str:questionnaire_id>/update/', views.questionnaires_update, name='questionnaires_update'),
    path('<str:questionnaire_id>/delete/', views.questionnaires_delete, name='questionnaires_delete'),
    
    # Endpoints de preguntas
    path('questions/', views.questions_list, name='questions_list'),
    path('questions/create/', views.questions_create, name='questions_create'),
    
    # Endpoints de respuestas
    path('answers/', views.answers_list, name='answers_list'),
    path('answers/create/', views.answers_create, name='answers_create'),
    
    # Endpoints especializados
    path('submit-response/', views.submit_questionnaire_response, name='submit_questionnaire_response'),
]
