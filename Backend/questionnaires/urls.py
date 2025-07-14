"""
URLs para la app questionnaires.
"""

from django.urls import path
from . import views

app_name = 'questionnaires'

urlpatterns = [
    path('', views.questionnaire_list, name='questionnaire_list'),
    path('<int:questionnaire_id>/', views.questionnaire_detail, name='questionnaire_detail'),
]
