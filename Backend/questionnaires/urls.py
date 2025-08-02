from django.urls import path
from . import views

app_name = 'questionnaires'

urlpatterns = [
    path('', views.questionnaire_list, name='questionnaire_list'),
    path('create/', views.questionnaire_create, name='questionnaire_create'),
    path('<int:pk>/', views.questionnaire_detail, name='questionnaire_detail'),
    path('<int:pk>/edit/', views.questionnaire_edit, name='questionnaire_edit'),
    path('<int:pk>/delete/', views.questionnaire_delete, name='questionnaire_delete'),
    path('<int:pk>/take/', views.questionnaire_take, name='questionnaire_take'),
    path('<int:pk>/responses/', views.questionnaire_responses, name='questionnaire_responses'),
    path('response/<int:response_id>/', views.response_detail, name='response_detail'),
] 